from app.database import get_supabase_client
from app.models.raw_post import RawPostCreate, SerpApiOrganicResult
from app.services.serpapi_client import search_linkedin_posts


def _parse_post_id(link: str) -> str:
    """Extract a unique ID from the LinkedIn post URL."""
    return link.rstrip("/").split("/")[-1] if link else link


def _map_to_raw_post(result: SerpApiOrganicResult, query: str) -> RawPostCreate | None:
    if not result.link or not result.snippet:
        return None
    return RawPostCreate(
        linkedin_post_id=_parse_post_id(result.link),
        raw_text=result.snippet,
        author_name=result.title,
        post_url=result.link,
        search_query=query,
    )


async def ingest_posts(query: str) -> list[dict]:
    """
    Full pipeline: query SerpApi → parse → upsert to Supabase.
    Returns the list of rows inserted (duplicates silently skipped).
    """
    results = await search_linkedin_posts(query)

    posts = [_map_to_raw_post(r, query) for r in results]
    posts = [p for p in posts if p is not None]

    if not posts:
        return []

    client = await get_supabase_client()
    response = (
        await client.table("raw_posts")
        .upsert(
            [p.model_dump() for p in posts],
            on_conflict="linkedin_post_id",
            ignore_duplicates=True,
        )
        .execute()
    )

    return response.data or []
