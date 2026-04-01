import json
import pytest
from unittest.mock import AsyncMock, patch
from pydantic import ValidationError

from app.models.qualification import QualificationResult

VALID_LLM_RESPONSE = json.dumps({
    "match_score": 90,
    "reasoning": "Strong Python background with LATAM remote experience.",
    "missing_skills": ["Kubernetes"],
    "strong_points": ["Python", "FastAPI", "Supabase"],
})

LOW_SCORE_RESPONSE = json.dumps({
    "match_score": 60,
    "reasoning": "Some overlap but missing key skills.",
    "missing_skills": ["Go", "Kubernetes", "AWS"],
    "strong_points": ["Python"],
})

INVALID_JSON_RESPONSE = "Sure! Here is the result: ```json\n{broken json```"

MARKDOWN_WRAPPED_RESPONSE = "```json\n" + VALID_LLM_RESPONSE + "\n```"


# --- Pydantic model unit tests ---

def test_qualification_result_valid():
    result = QualificationResult.model_validate_json(VALID_LLM_RESPONSE)
    assert result.match_score == 90
    assert result.reasoning != ""
    assert isinstance(result.missing_skills, list)
    assert isinstance(result.strong_points, list)


def test_is_high_match_true_when_score_gte_85():
    result = QualificationResult.model_validate_json(VALID_LLM_RESPONSE)
    assert result.is_high_match is True


def test_is_high_match_false_when_score_lt_85():
    result = QualificationResult.model_validate_json(LOW_SCORE_RESPONSE)
    assert result.is_high_match is False


def test_score_above_100_raises():
    data = {"match_score": 101, "reasoning": "x", "missing_skills": [], "strong_points": []}
    with pytest.raises(ValidationError):
        QualificationResult(**data)


def test_score_below_0_raises():
    data = {"match_score": -1, "reasoning": "x", "missing_skills": [], "strong_points": []}
    with pytest.raises(ValidationError):
        QualificationResult(**data)


# --- Qualification agent tests ---

@pytest.mark.asyncio
async def test_qualify_post_returns_result():
    from app.agents.qualification_agent import qualify_post
    with patch("app.agents.qualification_agent.chat_completion", new=AsyncMock(return_value=VALID_LLM_RESPONSE)):
        result = await qualify_post("We are hiring Python dev", "CV: Python, FastAPI expert")
        assert isinstance(result, QualificationResult)
        assert result.match_score == 90


@pytest.mark.asyncio
async def test_qualify_post_strips_markdown():
    from app.agents.qualification_agent import qualify_post
    with patch("app.agents.qualification_agent.chat_completion", new=AsyncMock(return_value=MARKDOWN_WRAPPED_RESPONSE)):
        result = await qualify_post("We are hiring Python dev", "CV: Python expert")
        assert result.match_score == 90


@pytest.mark.asyncio
async def test_qualify_post_retries_on_invalid_json():
    from app.agents.qualification_agent import qualify_post
    with patch(
        "app.agents.qualification_agent.chat_completion",
        new=AsyncMock(side_effect=[INVALID_JSON_RESPONSE, VALID_LLM_RESPONSE]),
    ):
        result = await qualify_post("We are hiring Python dev", "CV: Python expert")
        assert result.match_score == 90


@pytest.mark.asyncio
async def test_qualify_post_raises_after_two_failures():
    from app.agents.qualification_agent import qualify_post
    with patch(
        "app.agents.qualification_agent.chat_completion",
        new=AsyncMock(side_effect=[INVALID_JSON_RESPONSE, INVALID_JSON_RESPONSE]),
    ):
        with pytest.raises(Exception):
            await qualify_post("We are hiring Python dev", "CV: Python expert")
