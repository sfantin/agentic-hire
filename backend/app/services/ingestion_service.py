import re
from datetime import datetime, timezone

from app.database import get_supabase_client
from app.models.raw_post import RawPostCreate, SerpApiOrganicResult
from app.services.serpapi_client import search_linkedin_posts


def _parse_post_id(link: str) -> str:
    """Extract a unique ID from the LinkedIn post URL."""
    return link.rstrip("/").split("/")[-1] if link else link


def _extract_posted_at(post_url: str | None) -> datetime | None:
    """Decode timestamp from LinkedIn Activity ID (id >> 22 = ms since epoch)."""
    if not post_url:
        return None
    match = re.search(r'activity-(\d+)', post_url)
    if not match:
        return None
    ts_ms = int(match.group(1)) >> 22
    return datetime.fromtimestamp(ts_ms / 1000, tz=timezone.utc)


def _extract_reactions(displayed_link: str | None) -> int | None:
    """Extract reactions count from SerpApi displayed_link like '10+ reactions'."""
    if not displayed_link:
        return None
    match = re.search(r'(\d+)\+?\s*reactions?', displayed_link, re.IGNORECASE)
    return int(match.group(1)) if match else None


def _map_to_raw_post(result: SerpApiOrganicResult, query: str) -> RawPostCreate | None:
    if not result.link or not result.snippet:
        return None
    return RawPostCreate(
        linkedin_post_id=_parse_post_id(result.link),
        raw_text=result.snippet,
        author_name=result.title,
        post_url=result.link,
        search_query=query,
        posted_at=_extract_posted_at(result.link),
        reactions_count=_extract_reactions(result.displayed_link),
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
