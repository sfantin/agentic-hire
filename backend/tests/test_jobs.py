import pytest
from unittest.mock import AsyncMock, MagicMock, patch

MOCK_JOBS = [
    {
        "id": "job1",
        "match_score": 92,
        "reasoning": "Strong Python + FastAPI match.",
        "missing_skills": ["Kubernetes"],
        "strong_points": ["Python", "FastAPI"],
        "is_high_match": True,
        "raw_posts": {
            "post_url": "https://linkedin.com/feed/update/1",
            "author_name": "Alice Tech",
            "search_query": "Python engineer remote",
        },
    },
    {
        "id": "job2",
        "match_score": 72,
        "reasoning": "Partial match, missing cloud skills.",
        "missing_skills": ["AWS", "Terraform"],
        "strong_points": ["Python"],
        "is_high_match": False,
        "raw_posts": {
            "post_url": "https://linkedin.com/feed/update/2",
            "author_name": "Bob Startup",
            "search_query": "DevOps engineer",
        },
    },
]

MOCK_HIGH_MATCH_ONLY = [j for j in MOCK_JOBS if j["is_high_match"]]


def _make_query(data):
    """Build a chainable mock query that resolves .execute() with given data."""
    resp = MagicMock()
    resp.data = data

    query = MagicMock()
    query.select.return_value = query
    query.gte.return_value = query
    query.order.return_value = query
    query.limit.return_value = query
    query.eq.return_value = query
    query.execute = AsyncMock(return_value=resp)
    return query


@pytest.mark.asyncio
async def test_list_jobs_returns_all():
    from app.routers.qualify import list_jobs

    mock_client = MagicMock()
    mock_client.table.return_value = _make_query(MOCK_JOBS)

    with patch("app.routers.qualify.get_supabase_client", new=AsyncMock(return_value=mock_client)):
        result = await list_jobs(min_score=0, high_match_only=False, limit=20)

    assert result["total"] == 2
    assert len(result["jobs"]) == 2
    assert result["jobs"][0]["match_score"] == 92
    assert result["jobs"][0]["raw_posts"]["author_name"] == "Alice Tech"


@pytest.mark.asyncio
async def test_list_jobs_high_match_filter():
    from app.routers.qualify import list_jobs

    mock_client = MagicMock()
    mock_client.table.return_value = _make_query(MOCK_HIGH_MATCH_ONLY)

    with patch("app.routers.qualify.get_supabase_client", new=AsyncMock(return_value=mock_client)):
        result = await list_jobs(min_score=0, high_match_only=True, limit=20)

    assert result["total"] == 1
    assert result["jobs"][0]["is_high_match"] is True
    assert result["jobs"][0]["id"] == "job1"


@pytest.mark.asyncio
async def test_list_jobs_empty():
    from app.routers.qualify import list_jobs

    mock_client = MagicMock()
    mock_client.table.return_value = _make_query([])

    with patch("app.routers.qualify.get_supabase_client", new=AsyncMock(return_value=mock_client)):
        result = await list_jobs(min_score=0, high_match_only=False, limit=20)

    assert result["total"] == 0
    assert result["jobs"] == []
