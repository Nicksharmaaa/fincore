import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.customer import Customer
from app.models.lead import Lead


@pytest.mark.asyncio
async def test_complete_e2e_employee_advisory_and_lifecycle_journey(client: AsyncClient, sales_token: str, admin_token: str):
    """End-to-end test simulating a sales advisor's daily CRM workflow:

    1. View assigned leads queue
    2. Inspect comprehensive lead detail dossier
    3. Run AI lead scoring and verify transparent criteria breakdown
    4. Execute customer need segmentation
    5. Query sales copilot for call preparation and draft messaging
    6. Verify Customer 360 profile
    """
    headers = {"Authorization": f"Bearer {sales_token}"}

    # 1. Fetch leads
    leads_resp = await client.get("/api/v1/leads/", headers=headers)
    assert leads_resp.status_code == 200
    leads = leads_resp.json()
    assert len(leads) > 0
    target_lead = leads[0]
    lead_id = target_lead["id"]
    customer_id = target_lead["customer_id"]

    # 2. Inspect Lead Detail Dossier
    detail_resp = await client.get(f"/api/v1/leads/{lead_id}/detail", headers=headers)
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert "lead_number" in detail
    assert "customer" in detail

    # 3. Compute AI Lead Score
    score_resp = await client.post(f"/api/v1/ml/leads/{lead_id}/score?engine=rule_based", headers=headers)
    assert score_resp.status_code == 200
    score_data = score_resp.json()
    assert score_data["score"] >= 0
    assert score_data["engine_type"] == "RULE_BASED"
    assert score_data["is_trained_ml"] is False
    assert len(score_data["factors"]) > 0

    # 4. Execute Customer Need Segmentation
    seg_resp = await client.post(f"/api/v1/ml/customers/{customer_id}/segment", headers=headers)
    assert seg_resp.status_code == 200
    seg_data = seg_resp.json()
    assert seg_data["segment_code"] in [
        "PROTECTION_FOCUSED",
        "FIRST_TIME_BUYER",
        "RETIREMENT_FOCUSED",
        "SAVINGS_ORIENTED",
    ]

    # 5. Consult AI Copilot for Call Preparation & Draft Message
    prep_resp = await client.post(
        "/api/v1/copilot/assist",
        json={"action": "CALL_PREPARATION", "lead_id": lead_id},
        headers=headers,
    )
    assert prep_resp.status_code == 200
    assert len(prep_resp.json()["discovery_questions"]) > 0

    draft_resp = await client.post(
        "/api/v1/copilot/assist",
        json={"action": "DRAFT_MESSAGE", "lead_id": lead_id, "context": {"channel": "whatsapp"}},
        headers=headers,
    )
    assert draft_resp.status_code == 200
    assert draft_resp.json()["requires_employee_confirmation"] is True
    assert draft_resp.json()["ready_to_send_draft"] is not None

    # 6. Customer 360 Full Relationship Profile
    c360_resp = await client.get(f"/api/v1/customers/{customer_id}/360", headers=headers)
    assert c360_resp.status_code == 200
    c360_data = c360_resp.json()
    assert "customer" in c360_data
    assert "assessments" in c360_data
    assert "leads" in c360_data
    assert "consents" in c360_data
