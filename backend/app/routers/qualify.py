import asyncio
from fastapi import APIRouter, Body
from app.database import get_supabase_client
from app.agents.qualification_agent import qualify_post

router = APIRouter(prefix="/api/v1")

DEFAULT_CV = """
Senior AI/RevOps Engineer with 5+ years experience.
Skills: Python, FastAPI, Supabase, PostgreSQL, LLMs, Groq, OpenAI API,
        LangChain, Pydantic, REST APIs, React, TypeScript.
Experience: Built AI-powered SaaS products, lead generation automation,
            CRM integrations, cold outreach systems.
Languages: Portuguese (native), English (fluent).
Location: Brazil — available for remote LATAM/global roles.
"""


@router.post("/qualify")
async def qualify(
    cv_text: str = Body(default=DEFAULT_CV, embed=True),
    limit: int = Body(default=5, embed=True),
):
    client = await get_supabase_client()

    # Fetch unprocessed raw posts
    raw = (
        await client.table("raw_posts")
        .select("id, raw_text, post_url, author_name")
        .eq("processed", False)
        .limit(limit)
        .execute()
    )

    if not raw.data:
        return {"qualified": 0, "results": [], "message": "No unprocessed posts found."}

    results = []
    for post in raw.data:
        try:
            qualification = await qualify_post(post["raw_text"], cv_text)

            # Save to qualified_jobs
            await client.table("qualified_jobs").insert({
                "raw_post_id": post["id"],
                "match_score": qualification.match_score,
                "reasoning": qualification.reasoning,
                "missing_skills": qualification.missing_skills,
                "strong_points": qualification.strong_points,
                "is_high_match": qualification.is_high_match,
            }).execute()

            # Mark raw post as processed
            await client.table("raw_posts").update({"processed": True}).eq("id", post["id"]).execute()

            results.append({
                "post_url": post.get("post_url"),
                "author_name": post.get("author_name"),
                "match_score": qualification.match_score,
                "is_high_match": qualification.is_high_match,
                "reasoning": qualification.reasoning,
                "missing_skills": qualification.missing_skills,
                "strong_points": qualification.strong_points,
            })

            # Respect Groq free tier rate limit
            await asyncio.sleep(1)

        except Exception as e:
            results.append({
                "post_url": post.get("post_url"),
                "error": str(e),
            })

    return {"qualified": len([r for r in results if "match_score" in r]), "results": results}


@router.get("/jobs")
async def list_jobs(
    min_score: int = 0,
    high_match_only: bool = False,
    limit: int = 20,
):
    client = await get_supabase_client()

    query = (
        client.table("qualified_jobs")
        .select("*, raw_posts(post_url, author_name, search_query, posted_at, reactions_count)")
        .gte("match_score", min_score)
        .limit(limit)
    )

    if high_match_only:
        query = query.eq("is_high_match", True)

    response = await query.execute()

    # Sort: newest post first, then fewest reactions (best outreach opportunity)
    def job_sort_key(job):
        raw = job.get("raw_posts") or {}
        posted_at_str = raw.get("posted_at")
        reactions = raw.get("reactions_count") if raw.get("reactions_count") is not None else 9999
        ts = 0
        if posted_at_str:
            try:
                from datetime import datetime
                ts = datetime.fromisoformat(posted_at_str).timestamp()
            except Exception:
                pass
        return (-ts, reactions)

    jobs = sorted(response.data, key=job_sort_key)
    return {"total": len(jobs), "jobs": jobs}


@router.delete("/jobs")
async def delete_all_jobs():
    """Delete all qualified jobs and raw posts from the database."""
    client = await get_supabase_client()

    try:
        # Delete all qualified jobs first (cascade will handle raw_posts references)
        await client.table("qualified_jobs").delete().gte("id", "00000000-0000-0000-0000-000000000000").execute()

        # Delete all raw posts
        await client.table("raw_posts").delete().gte("id", "00000000-0000-0000-0000-000000000000").execute()

        return {"message": "All jobs and posts deleted successfully", "status": "success"}
    except Exception as e:
        return {
            "message": f"Error deleting jobs: {str(e)}",
            "status": "error",
        }
