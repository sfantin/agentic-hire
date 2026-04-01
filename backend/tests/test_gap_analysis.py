import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from app.models.gap_analysis import GapAnalysisResult, SkillGap


MOCK_JOBS_DATA = [
    {
        "id": "job1",
        "is_high_match": False,
        "missing_skills": ["Kubernetes", "Go"],
    },
    {
        "id": "job2",
        "is_high_match": False,
        "missing_skills": ["Kubernetes", "AWS", "Terraform"],
    },
    {
        "id": "job3",
        "is_high_match": False,
        "missing_skills": ["Go"],
    },
]


def test_skill_gap_valid():
    gap = SkillGap(skill="Kubernetes", frequency=2, percentage=66.7)
    assert gap.skill == "Kubernetes"
    assert gap.frequency == 2
    assert 66.0 < gap.percentage < 67.0


def test_gap_analysis_result_valid():
    gaps = [
        SkillGap(skill="Kubernetes", frequency=2, percentage=66.7),
        SkillGap(skill="Go", frequency=2, percentage=66.7),
    ]
    result = GapAnalysisResult(
        skill_gaps=gaps,
        recommendation="Focus on Kubernetes first",
        analysis_period_days=30,
    )
    assert len(result.skill_gaps) == 2
    assert result.recommendation != ""


@pytest.mark.asyncio
async def test_compute_gap_analysis_no_cache():
    from app.agents.gap_analysis_agent import compute_gap_analysis

    # Mock Supabase client with proper async chain
    def create_mock_query(return_value):
        query = MagicMock()
        query.select.return_value = query
        query.order.return_value = query
        query.limit.return_value = query
        query.eq.return_value = query
        query.execute = AsyncMock(return_value=return_value)
        query.insert.return_value = query
        return query

    mock_cache_response = MagicMock()
    mock_cache_response.data = []  # No cache

    mock_jobs_response = MagicMock()
    mock_jobs_response.data = MOCK_JOBS_DATA

    mock_client = MagicMock()
    mock_client.table.return_value = create_mock_query(None)
    mock_client.table.return_value.execute = AsyncMock(side_effect=[mock_cache_response, mock_jobs_response, None])

    with patch("app.agents.gap_analysis_agent.get_supabase_client", new=AsyncMock(return_value=mock_client)):
        with patch("app.agents.gap_analysis_agent.chat_completion", new=AsyncMock(return_value="Learn Kubernetes and AWS")):
            result = await compute_gap_analysis(cache_hours=24)

    assert isinstance(result, GapAnalysisResult)
    assert len(result.skill_gaps) > 0
    assert result.skill_gaps[0].skill in ["Kubernetes", "Go", "AWS", "Terraform"]


@pytest.mark.asyncio
async def test_compute_gap_analysis_empty_jobs():
    from app.agents.gap_analysis_agent import compute_gap_analysis

    # Mock Supabase client with proper async chain
    def create_mock_query(return_value):
        query = MagicMock()
        query.select.return_value = query
        query.order.return_value = query
        query.limit.return_value = query
        query.eq.return_value = query
        query.execute = AsyncMock(return_value=return_value)
        query.insert.return_value = query
        return query

    mock_cache_response = MagicMock()
    mock_cache_response.data = []

    mock_jobs_response = MagicMock()
    mock_jobs_response.data = []

    mock_client = MagicMock()
    mock_client.table.return_value = create_mock_query(None)
    mock_client.table.return_value.execute = AsyncMock(side_effect=[mock_cache_response, mock_jobs_response])

    with patch("app.agents.gap_analysis_agent.get_supabase_client", new=AsyncMock(return_value=mock_client)):
        result = await compute_gap_analysis(cache_hours=24)

    assert result.skill_gaps == []
    assert result.recommendation == "No gaps found yet."
