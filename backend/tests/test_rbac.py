import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_unauthenticated_request_blocked(client: AsyncClient):
    """Requests without authorization header must be rejected with 401."""
    res = await client.get("/api/v1/leads")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_customer_cannot_access_employee_leads(client: AsyncClient, customer_token: str):
    """Customer role must never be permitted to access employee CRM leads endpoint."""
    res = await client.get(
        "/api/v1/leads",
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_customer_cannot_access_employee_tasks(client: AsyncClient, customer_token: str):
    """Customer role must never be permitted to access employee CRM tasks endpoint."""
    res = await client.get(
        "/api/v1/tasks",
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_sales_advisor_cannot_access_admin_portal(client: AsyncClient, sales_token: str):
    """Sales advisor must not have access to admin audit log routes."""
    res = await client.get(
        "/api/v1/admin/audit-logs",
        headers={"Authorization": f"Bearer {sales_token}"},
    )
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_access_audit_logs(client: AsyncClient, admin_token: str):
    """Admin role must successfully access immutable audit logs."""
    res = await client.get(
        "/api/v1/admin/audit-logs",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 200
    logs = res.json()
    assert isinstance(logs, list)
    assert len(logs) > 0


@pytest.mark.asyncio
async def test_admin_can_view_role_matrix(client: AsyncClient, admin_token: str):
    """Admin role can inspect system roles and permission associations."""
    res = await client.get(
        "/api/v1/admin/roles",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res.status_code == 200
    roles = res.json()
    role_names = [r["name"] for r in roles]
    assert "Administrator" in role_names
    assert "Insurance Advisor" in role_names
