import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.customer import Customer
from app.models.lead import Lead
from app.ml.lead_scoring import LeadScoringFeatures, MLCandidateScoringEngine, RuleBasedLeadScoringEngine
from app.ml.pii_scrubber import PIIScrubber
from app.ml.rag_engine import PolicyRAGService, RAGQueryRequest
from app.ml.segmentation import CustomerSegmentationEngine, CustomerSegmentationInput


def test_pii_scrubber():
    text = "Client PAN ABCDE1234F, Aadhaar 1234 5678 9012, phone +91 98200 12345, email test@fincore.in."
    scrubbed = PIIScrubber.scrub_text(text)
    assert "[PAN_REDACTED]" in scrubbed
    assert "[AADHAAR_REDACTED]" in scrubbed
    assert "[PHONE_REDACTED]" in scrubbed
    assert "[EMAIL_REDACTED]" in scrubbed
    assert "ABCDE1234F" not in scrubbed


def test_lead_scoring_rule_engine():
    engine = RuleBasedLeadScoringEngine()
    features = LeadScoringFeatures(
        has_completed_assessment=True,
        has_requested_quote=True,
        has_requested_callback=True,
        comparison_count=3,
        source="REFERRAL",
        response_delay_hours=1.5,
        previous_interactions_count=3,
    )
    result = engine.score(features)
    assert result.score >= 75
    assert result.priority == "HIGH"
    assert result.engine_type == "RULE_BASED"
    assert result.is_trained_ml is False
    assert len(result.factors) > 0


def test_lead_scoring_ml_candidate_fallback():
    candidate_engine = MLCandidateScoringEngine(historical_labeled_count=142)
    features = LeadScoringFeatures(has_completed_assessment=True)
    result = candidate_engine.score(features)
    # Must NOT claim trained ML when sample threshold is not met
    assert result.is_trained_ml is False
    assert "DATA_INSUFFICIENT" in result.model_version


def test_customer_segmentation_engine():
    # Protection-focused case
    prot_input = CustomerSegmentationInput(
        dependents_count=3,
        outstanding_liabilities=5000000.0,
        declared_primary_objective="FAMILY_PROTECTION",
        browsed_categories=["Term Plans"],
    )
    res_prot = CustomerSegmentationEngine.segment_customer(prot_input)
    assert res_prot.segment_code == "PROTECTION_FOCUSED"
    assert res_prot.is_interpretable_rule is True

    # First-time buyer case
    ft_input = CustomerSegmentationInput(
        age=25,
        existing_cover_amount=0.0,
        declared_primary_objective="STARTER_COVER",
    )
    res_ft = CustomerSegmentationEngine.segment_customer(ft_input)
    assert res_ft.segment_code == "FIRST_TIME_BUYER"


def test_policy_rag_grounded_citation():
    # Test valid grounded retrieval
    query = "What is the suicide exclusion clause timeline and payout?"
    res = PolicyRAGService.answer_policy_query(RAGQueryRequest(query=query))
    assert res.is_grounded_in_official_docs is True
    assert len(res.citations) > 0
    citation = res.citations[0]
    assert citation.page_number > 0
    assert "Clause" in citation.clause_reference
    assert citation.product_uin != ""
    assert "80%" in res.answer_markdown or "12 months" in res.answer_markdown


def test_policy_rag_guardrail_unverified():
    # Test unverified query where no evidence exists -> must say it cannot verify
    query = "Does the policy pay out cryptocurrency loss during cyber warfare?"
    res = PolicyRAGService.answer_policy_query(RAGQueryRequest(query=query, similarity_threshold=0.6))
    assert res.is_grounded_in_official_docs is False
    assert "cannot verify" in res.answer_markdown.lower()
    assert len(res.citations) == 0


@pytest.mark.asyncio
async def test_lead_score_endpoint(client: AsyncClient, admin_token: str):
    async with AsyncSessionLocal() as db_session:
        stmt = select(Lead).limit(1)
        res = await db_session.execute(stmt)
        lead = res.scalar_one()
        lead_id = lead.id

    resp = await client.post(
        f"/api/v1/ml/leads/{lead_id}/score?engine=rule_based",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "score" in data
    assert "priority" in data
    assert data["engine_type"] == "RULE_BASED"
    assert data["is_trained_ml"] is False


@pytest.mark.asyncio
async def test_customer_segment_endpoint(client: AsyncClient, admin_token: str):
    async with AsyncSessionLocal() as db_session:
        stmt = select(Customer).limit(1)
        res = await db_session.execute(stmt)
        customer = res.scalar_one()
        cust_id = customer.id

    resp = await client.post(
        f"/api/v1/ml/customers/{cust_id}/segment",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "segment_code" in data
    assert "tailored_advisory_strategy" in data


@pytest.mark.asyncio
async def test_abandonment_endpoint(client: AsyncClient, admin_token: str):
    payload = {
        "current_funnel_stage": "ASSESSMENT_STEP_5_LIABILITIES",
        "idle_time_seconds": 650,
        "validation_errors_encountered": 3,
        "device_type": "MOBILE",
    }
    resp = await client.post(
        "/api/v1/ml/abandonment/predict",
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["risk_tier"] == "HIGH"
    assert data["abandonment_probability"] >= 0.60
    assert "recommended_recovery_action" in data


@pytest.mark.asyncio
async def test_rag_query_endpoint(client: AsyncClient, admin_token: str):
    resp = await client.post(
        "/api/v1/rag/query",
        json={"query": "What is the 30 day free look cancellation period?"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_grounded_in_official_docs"] is True
    assert len(data["citations"]) > 0


@pytest.mark.asyncio
async def test_copilot_draft_requires_confirmation(client: AsyncClient, admin_token: str):
    resp = await client.post(
        "/api/v1/copilot/assist",
        json={"action": "DRAFT_MESSAGE", "context": {"channel": "whatsapp"}},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["requires_employee_confirmation"] is True


@pytest.mark.asyncio
async def test_model_monitoring_and_override_endpoint(client: AsyncClient, admin_token: str):
    # Fetch summary
    resp = await client.get(
        "/api/v1/ml/monitoring/summary",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["active_models_count"] >= 4
    assert "models" in data

    # Perform override
    async with AsyncSessionLocal() as db_session:
        stmt = select(Lead).limit(1)
        res = await db_session.execute(stmt)
        lead = res.scalar_one()
        lead_id = lead.id

    override_resp = await client.post(
        f"/api/v1/ml/leads/{lead_id}/override",
        json={
            "entity_type": "LEAD_SCORE",
            "overridden_value": 85,
            "justification_reason": "High net-worth corporate promoter with immediate closing potential.",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert override_resp.status_code == 201
