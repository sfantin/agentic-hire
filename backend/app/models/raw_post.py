from datetime import datetime
from pydantic import BaseModel


class SerpApiOrganicResult(BaseModel):
    """Maps a single organic result from SerpApi response."""
    title: str | None = None
    link: str | None = None
    snippet: str | None = None
    displayed_link: str | None = None
    position: int | None = None


class RawPostCreate(BaseModel):
    """Data required to insert a row into raw_posts."""
    linkedin_post_id: str
    raw_text: str
    author_name: str | None = None
    author_url: str | None = None
    post_url: str | None = None
    search_query: str | None = None
    posted_at: datetime | None = None
    reactions_count: int | None = None


class RawPostRow(RawPostCreate):
    """Full row as returned from Supabase (includes DB-generated fields)."""
    id: str
    ingested_at: datetime
    processed: bool = False
