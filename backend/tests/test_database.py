import pytest
from app.database import get_supabase_client


@pytest.mark.asyncio
async def test_supabase_client_returns_instance():
    client = await get_supabase_client()
    assert client is not None


@pytest.mark.asyncio
async def test_supabase_client_is_singleton():
    client_a = await get_supabase_client()
    client_b = await get_supabase_client()
    assert client_a is client_b


@pytest.mark.asyncio
async def test_raw_posts_table_exists():
    client = await get_supabase_client()
    response = await client.table("raw_posts").select("id").limit(1).execute()
    assert response.data is not None
