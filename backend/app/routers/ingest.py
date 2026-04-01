from fastapi import APIRouter, Query
from app.services.ingestion_service import ingest_posts
from app.services.serpapi_client import DEFAULT_QUERY

router = APIRouter(prefix="/api/v1")


@router.post("/ingest")
async def ingest(
    query: str = Query(default=DEFAULT_QUERY, description="Boolean search query for LinkedIn posts"),
):
    saved = await ingest_posts(query)
    return {"inserted": len(saved), "posts": saved}
