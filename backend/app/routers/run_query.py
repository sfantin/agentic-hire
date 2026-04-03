import asyncio
from fastapi import APIRouter, Body
from app.services.ingestion_service import ingest_posts
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


@router.post("/run-query")
async def run_query(
    query: str = Body(...),
    limit: int = Body(default=10),
    cv_text: str = Body(default=DEFAULT_CV),
):
    """
    Unified pipeline: ingest posts from query → qualify unprocessed → return counts.
    """
    try:
        ingested_posts = await ingest_posts(query)
        ingested_count = len(ingested_posts)

        client = await get_supabase_client()
        raw = (
            await client.table("raw_posts")
            .select("id, raw_text, post_url, author_name, search_query")
            .eq("processed", False)
            .limit(limit)
            .execute()
        )

        qualified_count = 0
        if raw.data:
            for post in raw.data:
                try:
                    qualification = await qualify_post(post["raw_text"], cv_text)

                    await client.table("qualified_jobs").insert({
                        "raw_post_id": post["id"],
                        "match_score": qualification.match_score,
                        "reasoning": qualification.reasoning,
                        "missing_skills": qualification.missing_skills,
                        "strong_points": qualification.strong_points,
                        "is_high_match": qualification.is_high_match,
                    }).execute()

                    await client.table("raw_posts").update({"processed": True}).eq("id", post["id"]).execute()

                    qualified_count += 1
                    await asyncio.sleep(1)

                except Exception:
                    pass

        return {
            "query": query,
            "ingested": ingested_count,
            "qualified": qualified_count,
        }
    except Exception as e:
        return {
            "query": query,
            "ingested": 0,
            "qualified": 0,
            "error": str(e),
        }
