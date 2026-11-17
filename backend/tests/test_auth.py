import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    """Test successful login with valid credentials returns tokens and user profile."""
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@fincore.in", "password": "fincore123"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@fincore.in"
    assert "admin" in data["user"]["roles"]


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    """Test login with incorrect password returns 401 Unauthorized."""
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@fincore.in", "password": "wrong_password"},
    )
    assert res.status_code == 401
    detail = res.json()["detail"]
    message = detail.get("message") if isinstance(detail, dict) else str(detail)
    assert "password" in message.lower()


@pytest.mark.asyncio
async def test_me_endpoint(client: AsyncClient, admin_token: str):
    """Test /auth/me returns current authenticated user details."""
    res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 200
    user = res.json()
    assert user["email"] == "admin@fincore.in"
    role_codes = [r["code"].lower() for r in user["roles"]]
    assert "admin" in role_codes


@pytest.mark.asyncio
async def test_refresh_token_rotation(client: AsyncClient):
    """Test token refresh rotates and issues a new access token."""
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "rahul.sharma@fincore.in", "password": "fincore123"},
    )
    assert login_res.status_code == 200
    tokens = login_res.json()
    refresh_token = tokens["refresh_token"]

    refresh_res = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_res.status_code == 200
    new_tokens = refresh_res.json()
    assert "access_token" in new_tokens
    assert "refresh_token" in new_tokens
    # Verify the new access token is usable
    me_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {new_tokens['access_token']}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "rahul.sharma@fincore.in"


@pytest.mark.asyncio
async def test_logout(client: AsyncClient):
    """Test logout revokes the refresh token."""
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "priya.patel@fincore.in", "password": "fincore123"},
    )
    refresh_token = login_res.json()["refresh_token"]

    logout_res = await client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": refresh_token},
    )
    assert logout_res.status_code == 200
    assert logout_res.json()["status"] == "logged_out"
