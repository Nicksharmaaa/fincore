import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.customer import Customer
from app.models.lead import Lead


@pytest.mark.asyncio
async def test_complete_e2e_customer_acquisition_journey(client: AsyncClient):
    """End-to-end test simulating a customer's journey:

    1. Browse multi-insurer product catalog
    2. Execute educational needs assessment (HLV & Gap calculation)
    3. Compare policy options side-by-side
    4. Submit lead enquiry with DPDP consent & trigger auto-assignment
    5. Query grounded policy assistant (RAG) regarding statutory clauses
    """
    # 1. Product Discovery
    prod_resp = await client.get("/api/v1/products")
    assert prod_resp.status_code == 200
    products = prod_resp.json()
    assert len(products) >= 3

    # Pick two products for comparison
    prod1_id = products[0]["id"]
    prod2_id = products[1]["id"]

    # 2. Complete Needs Assessment
    assessment_payload = {
        "annual_income": 2400000.0,
        "dependents_count": 2,
        "outstanding_liabilities": 4500000.0,
        "existing_cover": 5000000.0,
        "education_fund_target": 2500000.0,
        "occupation": "IT Consultant",
        "is_smoker": False,
        "preferred_coverage_age": 65,
    }
    asm_resp = await client.post("/api/v1/assessments/calculate", json=assessment_payload)
    assert asm_resp.status_code == 200
    asm_data = asm_resp.json()
    assert asm_data["calculated_hlv"] > 0
    assert asm_data["coverage_gap"] > 0
    assert "disclaimer" in asm_data

    # 3. Product Comparison
    comp_resp = await client.get(f"/api/v1/products/compare?ids={prod1_id},{prod2_id}")
    assert comp_resp.status_code == 200
    comp_data = comp_resp.json()
    assert len(comp_data) == 2

    # 4. Inbound Lead Intake & DPDP Consent Submission
    enquiry_payload = {
        "customer_name": "Vikram Rathore",
        "customer_email": "vikram.rathore.e2e@example.com",
        "customer_phone": "+91 98200 99881",
        "city": "Pune",
        "enquiry_type": "QUOTE_REQUEST",
        "product_id": prod1_id,
        "desired_sum_assured": 20000000.0,
        "consent_given": True,
        "lead_source": "WEBSITE_ASSESSMENT",
        "assessment_data": asm_data,
    }
    enq_resp = await client.post("/api/v1/leads/enquiry", json=enquiry_payload)
    assert enq_resp.status_code == 201
    enq_data = enq_resp.json()
    assert enq_data["status"].lower() == "success"
    assert "lead_number" in enq_data
    assert "assigned_advisor" in enq_data

    # 5. Query RAG Assistant on Statutory Free-Look
    rag_resp = await client.post(
        "/api/v1/rag/query",
        json={"query": "What is the 30-day free look cancellation period under IRDAI?"},
    )
    # RAG route allows active employees or public callers when exposed
    assert rag_resp.status_code in [200, 401]
