import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_executive_overview_endpoint(client: AsyncClient, admin_token: str):
    resp = await client.get(
        "/api/v1/analytics/executive-overview",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "total_leads" in data
    assert "qualified_leads" in data
    assert "total_quotations" in data
    assert "total_applications" in data
    assert "policies_issued" in data
    assert "conversion_rate_pct" in data
    assert "expected_commission_inr" in data
    assert "received_commission_inr" in data


@pytest.mark.asyncio
async def test_sales_funnel_endpoint(client: AsyncClient, admin_token: str):
    resp = await client.get(
        "/api/v1/analytics/sales-funnel",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "stages" in data
    assert isinstance(data["stages"], list)
    stage_names = [s["stage"] for s in data["stages"]]
    assert "Website Visitors" in stage_names
    assert "Assessments Completed" in stage_names
    assert "Qualified Enquiries" in stage_names
    assert "Policies Issued" in stage_names


@pytest.mark.asyncio
async def test_employee_performance_endpoint(client: AsyncClient, admin_token: str):
    resp = await client.get(
        "/api/v1/analytics/employee-performance",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    if len(data) > 0:
        emp = data[0]
        assert "user_id" in emp
        assert "full_name" in emp
        assert "leads_assigned" in emp
        assert "conversion_rate_pct" in emp


@pytest.mark.asyncio
async def test_insurer_performance_endpoint(client: AsyncClient, admin_token: str):
    resp = await client.get(
        "/api/v1/analytics/insurer-performance",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    if len(data) > 0:
        ins = data[0]
        assert "insurer_id" in ins
        assert "insurer_name" in ins
        assert "total_enquiries" in ins
        assert "expected_commission_inr" in ins


@pytest.mark.asyncio
async def test_product_performance_endpoint(client: AsyncClient, admin_token: str):
    resp = await client.get(
        "/api/v1/analytics/product-performance",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    if len(data) > 0:
        prod = data[0]
        assert "product_id" in prod
        assert "product_name" in prod
        assert "total_enquiries" in prod


@pytest.mark.asyncio
async def test_lost_leads_intelligence_endpoint(client: AsyncClient, admin_token: str):
    resp = await client.get(
        "/api/v1/analytics/lost-leads",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "total_lost" in data
    assert "by_reason" in data
    assert "by_source" in data
    assert "by_sales_stage" in data
    assert "records" in data


@pytest.mark.asyncio
async def test_admin_dashboard_stats_endpoint(client: AsyncClient, admin_token: str):
    resp = await client.get(
        "/api/v1/admin/dashboard-stats",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "total_users" in data
    assert "active_users" in data
    assert "total_insurers" in data
    assert "total_products" in data
    assert "total_audit_events" in data


@pytest.mark.asyncio
async def test_admin_commission_records_endpoint(client: AsyncClient, admin_token: str):
    resp = await client.get(
        "/api/v1/admin/commission-records",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_unauthorized_customer_blocked_from_manager_analytics(client: AsyncClient, customer_token: str):
    resp = await client.get(
        "/api/v1/analytics/executive-overview",
        headers={"Authorization": f"Bearer {customer_token}"}
    )
    assert resp.status_code == 403
