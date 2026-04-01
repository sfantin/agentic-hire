import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.serpapi_client import search_linkedin_posts
from app.models.raw_post import SerpApiOrganicResult

MOCK_SERPAPI_RESPONSE = {
    "organic_results": [
        {
            "position": 1,
            "title": "John Doe on LinkedIn: Hiring Python developer LATAM remote",
            "link": "https://www.linkedin.com/posts/johndoe_hiring-python-activity-123456",
            "displayed_link": "linkedin.com › posts › johndoe",
            "snippet": "We are hiring a Python developer for a remote LATAM position. Junior or senior welcome.",
        },
        {
            "position": 2,
            "title": "Jane Smith: Looking for Python engineers — remote junior",
            "link": "https://www.linkedin.com/posts/janesmith_python-hire-activity-789012",
            "displayed_link": "linkedin.com › posts › janesmith",
            "snippet": "Exciting opportunity for Python engineers. Hiring now for remote junior roles.",
        },
    ]
}


def _mock_client(response_data: dict):
    mock_response = MagicMock()
    mock_response.json = MagicMock(return_value=response_data)
    mock_response.raise_for_status = MagicMock()
    mock_client = AsyncMock()
    mock_client.__aenter__.return_value.get = AsyncMock(return_value=mock_response)
    return mock_client


@pytest.mark.asyncio
async def test_search_returns_list():
    with patch("app.services.serpapi_client.httpx.AsyncClient", return_value=_mock_client(MOCK_SERPAPI_RESPONSE)):
        results = await search_linkedin_posts("python hiring LATAM")
        assert isinstance(results, list)


@pytest.mark.asyncio
async def test_search_returns_parsed_models():
    with patch("app.services.serpapi_client.httpx.AsyncClient", return_value=_mock_client(MOCK_SERPAPI_RESPONSE)):
        results = await search_linkedin_posts("python hiring LATAM")
        assert len(results) == 2
        assert all(isinstance(r, SerpApiOrganicResult) for r in results)


@pytest.mark.asyncio
async def test_search_empty_results():
    with patch("app.services.serpapi_client.httpx.AsyncClient", return_value=_mock_client({})):
        results = await search_linkedin_posts("no results query")
        assert results == []


@pytest.mark.asyncio
async def test_search_result_fields():
    with patch("app.services.serpapi_client.httpx.AsyncClient", return_value=_mock_client(MOCK_SERPAPI_RESPONSE)):
        results = await search_linkedin_posts("python hiring LATAM")
        first = results[0]
        assert first.link == "https://www.linkedin.com/posts/johndoe_hiring-python-activity-123456"
        assert first.snippet is not None
        assert first.position == 1
