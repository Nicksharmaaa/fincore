from typing import AsyncGenerator
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.db.init_db import init_db
from app.main import app


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    """Ensure database schema and initial seed data are populated before tests."""
    await init_db()


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP test client pointing to FastAPI app."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver", follow_redirects=True) as ac:
        yield ac


@pytest_asyncio.fixture
async def admin_token(client: AsyncClient) -> str:
    """Acquire JWT access token for System Administrator."""
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@fincore.in", "password": "fincore123"},
    )
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    return res.json()["access_token"]


@pytest_asyncio.fixture
async def sales_token(client: AsyncClient) -> str:
    """Acquire JWT access token for Sales Insurance Advisor."""
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "rahul.sharma@fincore.in", "password": "fincore123"},
    )
    assert res.status_code == 200, f"Sales login failed: {res.text}"
    return res.json()["access_token"]


@pytest_asyncio.fixture
async def customer_token(client: AsyncClient) -> str:
    """Acquire JWT access token for Retail Policyholder Customer."""
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "arjun.kapoor@example.com", "password": "fincore123"},
    )
    assert res.status_code == 200, f"Customer login failed: {res.text}"
    return res.json()["access_token"]
