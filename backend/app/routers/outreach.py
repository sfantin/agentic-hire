from fastapi import APIRouter, HTTPException
from app.database import get_supabase_client
from app.agents.cold_outreach_agent import generate_outreach
from app.agents.gap_analysis_agent import compute_gap_analysis

router = APIRouter(prefix="/api/v1")


@router.post("/outreach/{job_id}")
async def generate_cold_email(job_id: str):
    """Generate cold outreach email for a qualified job (score >= 85)."""
    client = await get_supabase_client()

    # Fetch the qualified job with its raw post
    job_response = await client.table("qualified_jobs").select("*, raw_posts(raw_text, author_name)").eq("id", job_id).execute()

    if not job_response.data:
        raise HTTPException(status_code=404, detail="Job not found")

    job = job_response.data[0]

    # Only allow outreach for high matches
    if not job.get("is_high_match"):
        raise HTTPException(status_code=400, detail="Only high-match jobs (score >= 85) can generate outreach")

    # Get raw post details
    raw_post = job.get("raw_posts", {})
    if not raw_post:
        raise HTTPException(status_code=400, detail="Raw post not found")

    job_post_text = raw_post.get("raw_text", "")

    # Mock CV for now (in production, fetch from user profile)
    candidate_profile = """Senior AI/RevOps Engineer with 5+ years experience.
Skills: Python, FastAPI, Supabase, PostgreSQL, LLMs, Groq, OpenAI API, LangChain, Pydantic, REST APIs, React, TypeScript.
Experience: Built AI-powered SaaS products, lead generation automation, CRM integrations, cold outreach systems.
Languages: Portuguese (native), English (fluent).
Location: Brazil — available for remote LATAM/global roles."""

    # Generate outreach
    outreach = await generate_outreach(job_post_text, candidate_profile)

    # Save to database
    await client.table("outreach_drafts").insert({
        "qualified_job_id": job_id,
        "subject_line": outreach.subject_line,
        "email_body": outreach.email_body,
        "hiring_manager_tip": outreach.hiring_manager_tip,
    }).execute()

    return {
        "job_id": job_id,
        "subject_line": outreach.subject_line,
        "email_body": outreach.email_body,
        "hiring_manager_tip": outreach.hiring_manager_tip,
        "tone": outreach.tone,
    }


@router.get("/gap-analysis")
async def get_gap_analysis():
    """Get skill gaps analysis across all non-matching jobs."""
    gap_analysis = await compute_gap_analysis(cache_hours=24)
    return {
        "skill_gaps": gap_analysis.skill_gaps,
        "recommendation": gap_analysis.recommendation,
        "analysis_period_days": gap_analysis.analysis_period_days,
    }
