import httpx
from app.config import settings
from app.models.raw_post import SerpApiOrganicResult

SERPAPI_BASE_URL = "https://serpapi.com/search.json"

DEFAULT_QUERY = (
    '("python") AND ("hire" OR "hiring") AND ("LATAM" OR "remote") AND ("junior" OR "senior")'
)


async def search_linkedin_posts(query: str) -> list[SerpApiOrganicResult]:
    params = {
        "engine": "google",
        "q": query,
        "as_sitesearch": "linkedin.com/posts",
        "api_key": settings.serpapi_key,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(SERPAPI_BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()

    organic = data.get("organic_results", [])
    return [SerpApiOrganicResult(**item) for item in organic]
