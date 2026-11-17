import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.auth import User
from app.models.customer import Customer
from app.models.lead import Lead


@pytest.mark.asyncio
async def test_customer_360_endpoint(client: AsyncClient, admin_token: str):
    async with AsyncSessionLocal() as db_session:
        stmt = select(Customer).limit(1)
        res = await db_session.execute(stmt)
        customer = res.scalar_one()
        cust_id = customer.id
        cust_name = customer.full_name

    resp = await client.get(
        f"/api/v1/customers/{cust_id}/360",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "customer" in data
    assert data["customer"]["full_name"] == cust_name
    assert "assessments" in data
    assert "leads" in data
    assert "applications" in data
    assert "documents" in data
    assert "consents" in data
    assert "tasks" in data
    assert "interaction_history" in data


@pytest.mark.asyncio
async def test_lead_detail_endpoint(client: AsyncClient, sales_token: str):
    async with AsyncSessionLocal() as db_session:
        stmt = select(Lead).limit(1)
        res = await db_session.execute(stmt)
        lead = res.scalar_one()
        lead_id = lead.id
        lead_num = lead.lead_number

    resp = await client.get(
        f"/api/v1/leads/{lead_id}/detail",
        headers={"Authorization": f"Bearer {sales_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["lead_number"] == lead_num
    assert "customer" in data
    assert "activities" in data
    assert "assignments" in data
    assert "tasks" in data
    assert "quotes" in data


@pytest.mark.asyncio
async def test_assignments_workload_and_recommendations(client: AsyncClient, admin_token: str):
    # Test advisor workload
    workload_resp = await client.get(
        "/api/v1/assignments/advisors-workload",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert workload_resp.status_code == 200
    workload_data = workload_resp.json()
    assert len(workload_data) >= 1
    assert "specialisation" in workload_data[0]
    assert "languages" in workload_data[0]
    assert "active_leads_count" in workload_data[0]

    # Test recommendation
    async with AsyncSessionLocal() as db_session:
        lead_stmt = select(Lead).limit(1)
        lead_res = await db_session.execute(lead_stmt)
        lead = lead_res.scalar_one()
        lead_id = lead.id

    rec_resp = await client.post(
        "/api/v1/assignments/recommend",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"lead_id": str(lead_id)}
    )
    assert rec_resp.status_code == 200
    recs = rec_resp.json()
    assert len(recs) >= 1
    assert "match_score" in recs[0]
    assert "workload_score" in recs[0]
    assert "specialisation_score" in recs[0]
    assert "reason" in recs[0]
    assert recs[0]["is_recommended"] is True

    # Test auto-assign
    auto_resp = await client.post(
        "/api/v1/assignments/auto-assign",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"lead_id": str(lead_id)}
    )
    assert auto_resp.status_code == 200
    auto_data = auto_resp.json()
    assert auto_data["status"] == "success"
    assert "assigned_to" in auto_data
    assert "match_score" in auto_data

    # Test assignment history
    hist_resp = await client.get(
        f"/api/v1/assignments/history/{lead_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert hist_resp.status_code == 200
    hist = hist_resp.json()
    assert len(hist) >= 1
    assert "assigned_to_name" in hist[0]
    assert "reason" in hist[0]


@pytest.mark.asyncio
async def test_ai_sales_copilot_services(client: AsyncClient, sales_token: str):
    async with AsyncSessionLocal() as db_session:
        lead_stmt = select(Lead).limit(1)
        lead_res = await db_session.execute(lead_stmt)
        lead = lead_res.scalar_one()
        lead_id = lead.id

    # 1. Customer summary
    resp1 = await client.post(
        "/api/v1/copilot/assist",
        headers={"Authorization": f"Bearer {sales_token}"},
        json={"action": "CUSTOMER_SUMMARY", "lead_id": str(lead_id)}
    )
    assert resp1.status_code == 200
    d1 = resp1.json()
    assert d1["action"] == "CUSTOMER_SUMMARY"
    assert "summary_markdown" in d1
    assert len(d1["key_points"]) > 0

    # 2. Product suggestion
    resp2 = await client.post(
        "/api/v1/copilot/assist",
        headers={"Authorization": f"Bearer {sales_token}"},
        json={"action": "PRODUCT_SUGGESTION", "lead_id": str(lead_id)}
    )
    assert resp2.status_code == 200
    d2 = resp2.json()
    assert len(d2["suggested_products"]) == 3
    assert d2["suggested_products"][0]["insurer"] == "HDFC Life"

    # 3. Policy wording
    resp3 = await client.post(
        "/api/v1/copilot/assist",
        headers={"Authorization": f"Bearer {sales_token}"},
        json={"action": "POLICY_WORDING", "query": "section 45 clause"}
    )
    assert resp3.status_code == 200
    d3 = resp3.json()
    assert "Section 45" in d3["title"]

    # 4. Draft message (WhatsApp & Email)
    resp4 = await client.post(
        "/api/v1/copilot/assist",
        headers={"Authorization": f"Bearer {sales_token}"},
        json={"action": "DRAFT_MESSAGE", "lead_id": str(lead_id), "context": {"channel": "whatsapp"}}
    )
    assert resp4.status_code == 200
    d4 = resp4.json()
    assert d4["ready_to_send_draft"] is not None

    # 5. Call preparation
    resp5 = await client.post(
        "/api/v1/copilot/assist",
        headers={"Authorization": f"Bearer {sales_token}"},
        json={"action": "CALL_PREPARATION", "lead_id": str(lead_id)}
    )
    assert resp5.status_code == 200
    d5 = resp5.json()
    assert len(d5["discovery_questions"]) >= 3
