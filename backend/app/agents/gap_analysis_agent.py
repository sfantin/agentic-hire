import json
from datetime import datetime, timedelta
from collections import Counter
from app.database import get_supabase_client
from app.models.gap_analysis import GapAnalysisResult, SkillGap
from app.services.groq_client import chat_completion

RECOMMENDATION_PROMPT = """Given these top 10 missing skills across all non-matching job posts:
{skill_list}

Generate a brief, actionable recommendation (2-3 sentences) on which 3-5 skills to prioritize learning.
Focus on skills with highest frequency and potential career impact. Be specific and motivating."""


async def compute_gap_analysis(cache_hours: int = 24) -> GapAnalysisResult:
    """
    Compute skill gaps from jobs with is_high_match=false.
    Cache result for cache_hours to avoid reprocessing.
    """
    client = await get_supabase_client()

    # Check cache first
    cache_result = await client.table("gap_analysis_cache").select("result, computed_at").order("computed_at", desc=True).limit(1).execute()

    if cache_result.data:
        cached = cache_result.data[0]
        cached_time = datetime.fromisoformat(cached["computed_at"])
        if datetime.utcnow() - cached_time < timedelta(hours=cache_hours):
            result_dict = cached["result"]
            return GapAnalysisResult(**result_dict)

    # Fetch all jobs with is_high_match=false
    jobs_response = await client.table("qualified_jobs").select("missing_skills").eq("is_high_match", False).execute()

    if not jobs_response.data:
        return GapAnalysisResult(skill_gaps=[], recommendation="No gaps found yet.", analysis_period_days=0)

    # Count missing skills
    all_skills = []
    for job in jobs_response.data:
        if job.get("missing_skills"):
            all_skills.extend(job["missing_skills"])

    skill_counter = Counter(all_skills)
    total_jobs = len(jobs_response.data)

    # Build skill gaps (top 10)
    skill_gaps = []
    for skill, freq in skill_counter.most_common(10):
        percentage = (freq / total_jobs * 100) if total_jobs > 0 else 0
        skill_gaps.append(SkillGap(skill=skill, frequency=freq, percentage=round(percentage, 1)))

    # Generate recommendation via Groq
    skill_list = ", ".join([f"{sg.skill} ({sg.frequency}x)" for sg in skill_gaps])
    recommendation_prompt = RECOMMENDATION_PROMPT.format(skill_list=skill_list)

    messages = [
        {"role": "user", "content": recommendation_prompt}
    ]

    try:
        recommendation = await chat_completion(messages)
    except Exception:
        recommendation = "Review the top missing skills and prioritize based on job frequency."

    result = GapAnalysisResult(
        skill_gaps=skill_gaps,
        recommendation=recommendation.strip(),
        analysis_period_days=30,
    )

    # Cache the result
    await client.table("gap_analysis_cache").insert({
        "result": result.model_dump(),
        "computed_at": datetime.utcnow().isoformat(),
    }).execute()

    return result
