import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import RoleChecker, get_current_user, get_db
from app.models.auth import User
from app.models.customer import Customer, CustomerAssessment
from app.schemas.customer import (
    AssessmentCreate,
    AssessmentResponse,
    QuickCalculationRequest,
    QuickCalculationResponse,
)
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/assessments", tags=["Assessments"])


@router.get("/", response_model=List[AssessmentResponse])
async def list_assessments(
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin", "compliance"])),
    db: AsyncSession = Depends(get_db)
):
    """List completed insurance suitability and Human Life Value (HLV) assessments."""
    stmt = (
        select(CustomerAssessment)
        .where(CustomerAssessment.organization_id == current_user.organization_id)
        .order_by(CustomerAssessment.created_at.desc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_assessment(
    assessment_in: AssessmentCreate,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin", "compliance"])),
    db: AsyncSession = Depends(get_db)
):
    """Calculate Human Life Value (HLV) and coverage shortfall for a customer."""
    # Verify customer exists
    cust_stmt = select(Customer).where(
        Customer.id == assessment_in.customer_id,
        Customer.organization_id == current_user.organization_id
    )
    cust_res = await db.execute(cust_stmt)
    customer = cust_res.scalar_one_or_none()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    # Formula: 12 * Annual Income + Liabilities + Education Fund Goal - Existing Cover
    income_protection = assessment_in.annual_income * 12
    liabilities = assessment_in.outstanding_liabilities
    education_target = assessment_in.education_fund_target * min(assessment_in.dependents_count, 2)
    total_hlv = income_protection + liabilities + education_target
    coverage_gap = max(0.0, total_hlv - assessment_in.existing_cover)

    notes = (
        f"Assessed HLV: ₹{total_hlv:,.2f}. Based on {assessment_in.dependents_count} dependents, "
        f"₹{assessment_in.annual_income:,.2f} annual income, and ₹{liabilities:,.2f} debt liabilities."
    )

    assessment = CustomerAssessment(
        organization_id=current_user.organization_id,
        customer_id=assessment_in.customer_id,
        annual_income=assessment_in.annual_income,
        dependents_count=assessment_in.dependents_count,
        outstanding_liabilities=assessment_in.outstanding_liabilities,
        existing_cover=assessment_in.existing_cover,
        education_fund_target=assessment_in.education_fund_target,
        calculated_hlv=total_hlv,
        coverage_gap=coverage_gap,
        recommendation_notes=notes,
        raw_inputs_json=assessment_in.model_dump(mode="json")
    )
    db.add(assessment)
    await db.flush()

    await record_audit_log(
        db=db,
        organization_id=current_user.organization_id,
        actor_email=current_user.email,
        action="CREATE_ASSESSMENT",
        entity_name="CustomerAssessment",
        entity_id=str(assessment.id),
        actor_user_id=current_user.id,
        changes_json={"calculated_hlv": total_hlv, "coverage_gap": coverage_gap}
    )

    return assessment


@router.post("/calculate", response_model=QuickCalculationResponse)
async def calculate_coverage_gap(calc_in: QuickCalculationRequest):
    """Educational coverage gap calculation engine based on Human Life Value (HLV).

    Computes:
    - Income protection requirement (12x annual income)
    - Outstanding debt buffer
    - Educational milestone funds
    - Declared existing coverage offset
    """
    income_multiplier = 12
    income_protection = calc_in.annual_income * income_multiplier
    liabilities = calc_in.outstanding_liabilities
    family_goals = calc_in.education_fund_target * min(calc_in.dependents_count, 2)
    total_hlv = income_protection + liabilities + family_goals
    coverage_gap = max(0.0, total_hlv - calc_in.existing_cover)

    # Determine product category recommendation based on profile
    if liabilities > 0 or calc_in.dependents_count >= 2:
        recommended_cat = "Term Insurance"
    elif calc_in.education_fund_target > 0:
        recommended_cat = "Savings & Endowment"
    else:
        recommended_cat = "Term Insurance"

    notes = (
        f"Assessed Protection Requirement: ₹{total_hlv:,.0f}. "
        f"Formula factors: 12x Annual Income replacement (₹{income_protection:,.0f}) + "
        f"Outstanding Debt Clearance (₹{liabilities:,.0f}) + "
        f"Education Milestone Protection (₹{family_goals:,.0f}) minus "
        f"Existing Declared Coverage (₹{calc_in.existing_cover:,.0f})."
    )

    return QuickCalculationResponse(
        income_protection_needed=income_protection,
        liabilities_protection=liabilities,
        family_goals_protection=family_goals,
        calculated_hlv=total_hlv,
        existing_cover=calc_in.existing_cover,
        coverage_gap=coverage_gap,
        income_multiplier=income_multiplier,
        recommendation_notes=notes,
        recommended_category=recommended_cat,
        disclaimer="This is an educational estimate, not underwriting advice."
    )


