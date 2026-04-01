import json
import pytest
from unittest.mock import AsyncMock, patch
from pydantic import ValidationError

from app.models.outreach import ColdOutreachResult

VALID_OUTREACH_RESPONSE = json.dumps({
    "subject_line": "Your Python expertise + our AI platform = rapid deployment",
    "email_body": "Hi [Name],\n\nI noticed your company is hiring senior Python engineers. We help teams like yours scale AI workloads with minimal DevOps overhead.\n\nWould love a quick 15-min call to discuss.\n\nBest,\n[Candidate]",
    "hiring_manager_tip": "Search for CTO or VP Engineering on company LinkedIn page",
    "tone": "professional"
})

INVALID_OUTREACH_RESPONSE = "Sure! Here's the email: ```json\n{broken json```"

MARKDOWN_WRAPPED_RESPONSE = "```json\n" + VALID_OUTREACH_RESPONSE + "\n```"


def test_cold_outreach_result_valid():
    result = ColdOutreachResult.model_validate_json(VALID_OUTREACH_RESPONSE)
    assert result.subject_line != ""
    assert result.email_body != ""
    assert result.hiring_manager_tip != ""
    assert result.tone == "professional"


@pytest.mark.asyncio
async def test_generate_outreach_returns_result():
    from app.agents.cold_outreach_agent import generate_outreach
    with patch("app.agents.cold_outreach_agent.chat_completion", new=AsyncMock(return_value=VALID_OUTREACH_RESPONSE)):
        result = await generate_outreach("We are hiring Python dev", "CV: Python, FastAPI expert")
        assert isinstance(result, ColdOutreachResult)
        assert result.tone == "professional"


@pytest.mark.asyncio
async def test_generate_outreach_strips_markdown():
    from app.agents.cold_outreach_agent import generate_outreach
    with patch("app.agents.cold_outreach_agent.chat_completion", new=AsyncMock(return_value=MARKDOWN_WRAPPED_RESPONSE)):
        result = await generate_outreach("We are hiring Python dev", "CV: Python expert")
        assert result.tone == "professional"


@pytest.mark.asyncio
async def test_generate_outreach_retries_on_invalid_json():
    from app.agents.cold_outreach_agent import generate_outreach
    with patch(
        "app.agents.cold_outreach_agent.chat_completion",
        new=AsyncMock(side_effect=[INVALID_OUTREACH_RESPONSE, VALID_OUTREACH_RESPONSE]),
    ):
        result = await generate_outreach("We are hiring Python dev", "CV: Python expert")
        assert result.tone == "professional"


@pytest.mark.asyncio
async def test_generate_outreach_raises_after_two_failures():
    from app.agents.cold_outreach_agent import generate_outreach
    with patch(
        "app.agents.cold_outreach_agent.chat_completion",
        new=AsyncMock(side_effect=[INVALID_OUTREACH_RESPONSE, INVALID_OUTREACH_RESPONSE]),
    ):
        with pytest.raises(ValueError, match="Outreach generation failed"):
            await generate_outreach("We are hiring Python dev", "CV: Python expert")
