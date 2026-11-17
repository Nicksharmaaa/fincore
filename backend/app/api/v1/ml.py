from datetime import datetime, timezone
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import RoleChecker, get_current_active_employee, get_db
from app.models.auth import User
from app.models.customer import Customer, CustomerAssessment
from app.models.lead import Lead, LeadActivity
from app.models.ml import ModelScore
from app.models.quote import Quote
from app.ml.abandonment import AbandonmentPredictionEngine, AbandonmentRiskResult, AbandonmentSessionInput
from app.ml.lead_scoring import (
    LeadScoringFeatures,
    LeadScoringRegistry,
    ScoringResult,
)
from app.ml.monitoring import HumanOverrideRecord, ModelMonitoringService, ModelMonitoringSummary
from app.ml.segmentation import CustomerSegmentationEngine, CustomerSegmentationInput, CustomerSegmentationResult

router = APIRouter(prefix="/ml", tags=["AI & Machine Learning Intelligence"])


class HumanOverridePayload(BaseModel):
    entity_type: str  # "LEAD_SCORE", "CUSTOMER_SEGMENT", "ABANDONMENT_RISK"
    overridden_value: Any
    justification_reason: str


# ---------------------------------------------------------------------------
# 1. Lead Scoring Endpoints
# ---------------------------------------------------------------------------

@router.post("/leads/{lead_id}/score", response_model=ScoringResult)
async def score_lead_by_id(
    lead_id: uuid.UUID,
    engine: str = Query("rule_based", description="'rule_based' or 'xgboost_candidate'"),
    persist: bool = Query(True, description="Save inference score to model_scores table"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_employee),
):
    """Calculate transparent priority score for a CRM lead."""
    stmt = (
        select(Lead)
        .where(Lead.id == lead_id, Lead.organization_id == current_user.organization_id)
        .options(
            selectinload(Lead.customer).selectinload(Customer.assessments),
            selectinload(Lead.activities),
            selectinload(Lead.quotes),
        )
    )
    res = await db.execute(stmt)
    lead = res.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Extract features from live database state
    has_assessment = len(lead.customer.assessments) > 0 if lead.customer else False
    has_quote = len(lead.quotes) > 0 or lead.status in ["QUOTE_REQUESTED", "QUOTE_SENT"]
    has_callback = any(
        "callback" in (act.title or "").lower() or "call" in (act.activity_type or "").lower()
        for act in lead.activities
    )
    interactions_count = len(lead.activities)

    # Calculate hours since creation
    created_at = lead.created_at or datetime.now(timezone.utc)
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    delay_hours = max(0.0, (datetime.now(timezone.utc) - created_at).total_seconds() / 3600.0)

    features = LeadScoringFeatures(
        has_completed_assessment=has_assessment,
        has_requested_quote=has_quote,
        has_requested_callback=has_callback,
        comparison_count=3 if has_quote else 1,
        source=lead.source or "WEBSITE_ASSESSMENT",
        response_delay_hours=round(delay_hours, 1),
        previous_interactions_count=interactions_count,
        desired_sum_assured=float(lead.desired_sum_assured or 10000000.0),
    )

    scoring_engine = LeadScoringRegistry.get_engine(engine)
    result = scoring_engine.score(features, lead_id=str(lead.id))

    if persist:
        # Update lead record
        lead.current_ml_score = result.score
        # Record historical score
        model_score_entry = ModelScore(
            organization_id=current_user.organization_id,
            lead_id=lead.id,
            model_name=result.engine_type,
            model_version=result.model_version,
            conversion_probability=result.conversion_propensity,
            priority_score=result.score,
            features_snapshot_json=features.model_dump(),
        )
        db.add(model_score_entry)
        await db.commit()

    return result


@router.post("/leads/custom-score", response_model=ScoringResult)
async def score_custom_features(
    features: LeadScoringFeatures,
    engine: str = Query("rule_based"),
    current_user: User = Depends(get_current_active_employee),
):
    """Simulate lead scoring with arbitrary feature values (zero persistence)."""
    scoring_engine = LeadScoringRegistry.get_engine(engine)
    return scoring_engine.score(features)


# ---------------------------------------------------------------------------
# 2. Customer Segmentation Endpoints
# ---------------------------------------------------------------------------

@router.post("/customers/{customer_id}/segment", response_model=CustomerSegmentationResult)
async def segment_customer_by_id(
    customer_id: uuid.UUID,
    persist: bool = Query(True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_employee),
):
    """Classify customer into interpretable, non-discriminatory financial need segment."""
    stmt = (
        select(Customer)
        .where(Customer.id == customer_id, Customer.organization_id == current_user.organization_id)
        .options(selectinload(Customer.assessments), selectinload(Customer.leads))
    )
    res = await db.execute(stmt)
    customer = res.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Extract assessment features if present
    dependents = 1
    liabilities = 0.0
    existing_cover = 0.0
    objective = "FAMILY_PROTECTION"
    if customer.assessments:
        latest_asm = customer.assessments[0]
        dependents = latest_asm.dependents_count
        liabilities = float(latest_asm.outstanding_liabilities or 0.0)
        existing_cover = float(latest_asm.existing_cover or 0.0)
        raw = latest_asm.raw_inputs_json or {}
        objective = raw.get("primary_objective", "FAMILY_PROTECTION")

    # Collect browsed categories from leads
    cats = [lead.product_interest for lead in customer.leads if lead.product_interest]

    seg_input = CustomerSegmentationInput(
        customer_id=str(customer.id),
        annual_income=float(customer.annual_income or 1500000.0),
        dependents_count=dependents,
        existing_cover_amount=existing_cover,
        outstanding_liabilities=liabilities,
        declared_primary_objective=objective,
        browsed_categories=cats,
    )

    result = CustomerSegmentationEngine.segment_customer(seg_input)

    if persist:
        customer.segment = result.segment_name
        await db.commit()

    return result


@router.post("/customers/custom-segment", response_model=CustomerSegmentationResult)
async def segment_custom_profile(
    profile: CustomerSegmentationInput,
    current_user: User = Depends(get_current_active_employee),
):
    """Simulate interpretable customer segmentation from raw declarations."""
    return CustomerSegmentationEngine.segment_customer(profile)


# ---------------------------------------------------------------------------
# 3. Abandonment Risk Prediction Endpoint
# ---------------------------------------------------------------------------

@router.post("/abandonment/predict", response_model=AbandonmentRiskResult)
async def predict_abandonment_risk(
    session_data: AbandonmentSessionInput,
    current_user: User = Depends(get_current_active_employee),
):
    """Identify customer drop-off risk during assessment and quotation journeys."""
    return AbandonmentPredictionEngine.evaluate_risk(session_data)


# ---------------------------------------------------------------------------
# 4. Human Override & Governance
# ---------------------------------------------------------------------------

@router.post("/leads/{lead_id}/override", status_code=status.HTTP_201_CREATED)
async def record_lead_override(
    lead_id: uuid.UUID,
    payload: HumanOverridePayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager", "sales"])),
):
    """Log an authorized human override of an algorithmic score or segment."""
    stmt = select(Lead).where(Lead.id == lead_id, Lead.organization_id == current_user.organization_id)
    res = await db.execute(stmt)
    lead = res.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    original_val = lead.current_ml_score

    # Apply override
    if payload.entity_type == "LEAD_SCORE":
        try:
            new_score = int(payload.overridden_value)
            lead.current_ml_score = max(0, min(100, new_score))
        except ValueError:
            raise HTTPException(status_code=400, detail="Score override must be an integer between 0 and 100")

    override_record = HumanOverrideRecord(
        override_id=f"OVR-{str(uuid.uuid4())[:8]}",
        entity_type=payload.entity_type,
        entity_id=str(lead.id),
        original_value=original_val,
        overridden_value=payload.overridden_value,
        overriding_user_id=str(current_user.id),
        overriding_user_email=current_user.email,
        justification_reason=payload.justification_reason,
    )
    ModelMonitoringService.record_human_override(override_record)
    await db.commit()

    return {
        "status": "OVERRIDE_RECORDED",
        "override_id": override_record.override_id,
        "lead_id": str(lead.id),
        "new_score": lead.current_ml_score,
        "justification": payload.justification_reason,
    }


# ---------------------------------------------------------------------------
# 5. Model Monitoring & Governance Endpoints
# ---------------------------------------------------------------------------

@router.get("/monitoring/summary", response_model=ModelMonitoringSummary)
async def get_model_monitoring_summary(
    current_user: User = Depends(RoleChecker(["admin", "manager"])),
):
    """Audit platform model registry, drift metrics, and human override logs."""
    return ModelMonitoringService.get_summary()


@router.get("/models")
async def list_model_registry(
    current_user: User = Depends(get_current_active_employee),
):
    """List all registered AI/ML models, scoring rules, and versioning statuses."""
    summary = ModelMonitoringService.get_summary()
    return summary.models
