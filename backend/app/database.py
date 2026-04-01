from supabase import AsyncClient, create_async_client
from app.config import settings

_client: AsyncClient | None = None


async def get_supabase_client() -> AsyncClient:
    global _client
    if _client is None:
        _client = await create_async_client(
            settings.supabase_url,
            settings.supabase_key,
        )
    return _client
