import re
from pydantic import ValidationError
from app.models.qualification import QualificationResult
from app.services.groq_client import chat_completion

SYSTEM_PROMPT = """You are a job qualification expert. Analyze the job post against the candidate's CV.
Return ONLY valid JSON — no markdown, no explanation, no code blocks.
JSON schema (all fields required):
{
  "match_score": <integer 0-100>,
  "reasoning": "<one paragraph explaining the score>",
  "missing_skills": ["<skill>", ...],
  "strong_points": ["<skill or trait>", ...]
}"""

RETRY_SUFFIX = "\n\nCRITICAL: Your previous response was not valid JSON. Return ONLY raw JSON, nothing else."


def _strip_markdown(text: str) -> str:
    """Remove ```json ... ``` or ``` ... ``` wrappers if present."""
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    return match.group(1).strip() if match else text.strip()


async def qualify_post(post_text: str, cv_text: str) -> QualificationResult:
    user_content = f"JOB POST:\n{post_text}\n\nCANDIDATE CV:\n{cv_text}"
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
            return QualificationResult.model_validate_json(cleaned)
        except (ValidationError, Exception) as e:
            last_error = e

    raise ValueError(f"Qualification failed after 2 attempts: {last_error}")
