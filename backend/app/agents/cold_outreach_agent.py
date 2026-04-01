import re
from pydantic import ValidationError
from app.models.outreach import ColdOutreachResult
from app.services.groq_client import chat_completion

SYSTEM_PROMPT = """You are a Senior Sales Executive and Systems Architect with 15+ years of experience selling AI and software solutions.
Your task is to draft a personalized cold outreach email to a hiring manager or technical decision-maker.

Style: Professional, direct, business-focused. Lead with impact and ROI. Show you understand their pain points.
Never be generic. Reference specific skills or gaps mentioned in the job post.
Email structure:
1. Subject line: Compelling, specific to their tech stack or challenge
2. Body: Hook (their problem) → Your value (how you solve it) → CTA (next step, no pressure)
3. Hiring manager tip: Where to find them (LinkedIn search tip, company website section, etc.)

Return ONLY valid JSON — no markdown, no explanation:
{
  "subject_line": "<subject>",
  "email_body": "<full email body, 150-250 words>",
  "hiring_manager_tip": "<where to find hiring manager>",
  "tone": "professional"
}"""

RETRY_SUFFIX = "\n\nCRITICAL: Your previous response was not valid JSON. Return ONLY raw JSON, nothing else."


def _strip_markdown(text: str) -> str:
    """Remove ```json ... ``` wrappers if present."""
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    return match.group(1).strip() if match else text.strip()


async def generate_outreach(job_post: str, candidate_cv: str) -> ColdOutreachResult:
    """Generate cold outreach email for a high-match job."""
    user_content = f"JOB POST:\n{job_post}\n\nCANDIDATE PROFILE:\n{candidate_cv}"
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    last_error: Exception | None = None

    for attempt in range(2):
        if attempt == 1:
            messages.append({"role": "user", "content": RETRY_SUFFIX})

        raw = await chat_completion(messages)
        cleaned = _strip_markdown(raw)

        try:
            return ColdOutreachResult.model_validate_json(cleaned)
        except (ValidationError, Exception) as e:
            last_error = e

    raise ValueError(f"Outreach generation failed after 2 attempts: {last_error}")
