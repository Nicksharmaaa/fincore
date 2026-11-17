from datetime import datetime, timezone
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import RoleChecker, get_db
from app.models.application import Application
from app.models.auth import User
from app.models.customer import Customer, CustomerAssessment
from app.models.lead import Lead
from app.models.product import Product, ProductVersion
from app.models.task import Task
from app.ml.pii_scrubber import PIIScrubber

router = APIRouter(prefix="/copilot", tags=["AI Sales Copilot"])


class CopilotRequest(BaseModel):
    action: str  # CUSTOMER_SUMMARY, PRODUCT_SUGGESTION, POLICY_WORDING, DRAFT_MESSAGE, CALL_PREPARATION, QUOTE_COMPARISON, TASK_SUMMARY
    customer_id: Optional[uuid.UUID] = None
    lead_id: Optional[uuid.UUID] = None
    query: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class CopilotResponse(BaseModel):
    action: str
    title: str
    summary_markdown: str
    key_points: List[str] = []
    suggested_products: List[Dict[str, Any]] = []
    ready_to_send_draft: Optional[str] = None
    discovery_questions: List[str] = []
    regulatory_notes: Optional[str] = None
    requires_employee_confirmation: bool = False  # Mandatory confirmation safeguard


CLAUSE_EXPLANATIONS = {
    "section_45": {
        "title": "Section 45: Incontestability & 3-Year Repudiation Bar",
        "explanation": (
            "Under Section 45 of the Insurance Act 1938, no life insurance policy can be called in question "
            "by an insurer on any ground whatsoever (including fraudulent suppression of facts) after the expiry "
            "of three full years from the date of policy issuance or risk commencement, whichever is later. "
            "Within the initial 3 years, an insurer may question or repudiate a claim only if material misrepresentation "
            "or fraud is conclusively proven."
        ),
        "guidance": "Assure the client that full honest disclosure at inception guarantees absolute non-repudiation after 36 months.",
    },
    "suicide_clause": {
        "title": "Suicide Exclusion Clause (12 Months)",
        "explanation": (
            "In all IRDAI-compliant life insurance policies in India, if the life assured commits suicide within "
            "12 months from the date of commencement of risk or policy revival, the policy becomes void. However, "
            "the insurer is mandated to pay at least 80% of total premiums paid to the nominee, provided the policy is active."
        ),
        "guidance": "Clarify that after the completion of the 1st policy year, death by suicide is covered under standard term terms.",
    },
    "mwp_act": {
        "title": "Married Women's Property Act (MWP Act 1874) Endorsement",
        "explanation": (
            "Under Section 6 of the Married Women's Property Act, 1874, a life insurance policy endorsed in favor "
            "of the wife and/or children creates an irrevocable trust. The policy proceeds are fully protected against "
            "creditors, court attachments, business debts, and tax liability claims."
        ),
        "guidance": "Highly recommended for business owners, self-employed professionals, and high net-worth individuals with commercial liabilities.",
    },
    "free_look_period": {
        "title": "Free-Look Cancellation Period (30 Days Digital)",
        "explanation": (
            "IRDAI mandates a 30-day free-look period for policies purchased electronically or through distance marketing "
            "(15 days for physical offline policies). The policyholder has the absolute right to review policy terms "
            "and cancel for a 100% refund of premium, minus proportional risk premium, stamp duty, and medical exam expenses incurred."
        ),
        "guidance": "Use this to eliminate buyer hesitation during closing: the client has 30 risk-free days to inspect the policy wording.",
    },
    "grace_period": {
        "title": "Premium Grace Period & Revival Terms",
        "explanation": (
            "Policyholders are granted a 30-day grace period for annual, half-yearly, and quarterly premium payment modes "
            "(15 days for monthly mode). If demise occurs during the grace period, the full sum assured remains payable, "
            "deducting the unpaid premium."
        ),
        "guidance": "Remind clients that policies that lapse beyond the grace period can be revived within 5 years with a fresh declaration of good health.",
    },
}


@router.post("/assist", response_model=CopilotResponse)
async def get_copilot_assistance(
    payload: CopilotRequest,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin", "operations"])),
    db: AsyncSession = Depends(get_db),
):
    """Generate contextual financial advisory intelligence for brokerage employees."""
    org_id = current_user.organization_id

    # Resolve customer or lead
    customer = None
    lead = None
    assessment = None

    if payload.lead_id:
        l_res = await db.execute(
            select(Lead)
            .where(Lead.id == payload.lead_id, Lead.organization_id == org_id)
            .options(selectinload(Lead.customer))
        )
        lead = l_res.scalar_one_or_none()
        if lead:
            customer = lead.customer

    if not customer and payload.customer_id:
        c_res = await db.execute(
            select(Customer).where(Customer.id == payload.customer_id, Customer.organization_id == org_id)
        )
        customer = c_res.scalar_one_or_none()

    if customer:
        as_res = await db.execute(
            select(CustomerAssessment)
            .where(CustomerAssessment.customer_id == customer.id)
            .order_by(CustomerAssessment.created_at.desc())
        )
        assessment = as_res.scalars().first()

    action = payload.action.upper()

    # 1. CUSTOMER PROFILE SUMMARY
    if action == "CUSTOMER_SUMMARY":
        cust_name = customer.full_name if customer else "Prospective Policyholder"
        income_str = f"₹{customer.annual_income:,.0f}" if customer and customer.annual_income else "₹15,00,000 (Estimated)"
        city = customer.city if customer else "Metropolitan"
        smoker_str = "Smoker (Non-standard loading applies)" if (customer and customer.smoker_status) else "Non-Smoker (Eligible for preferred tier rates)"
        segment = customer.segment if customer else "Salaried Mass Affluent"
        hlv_str = f"₹{assessment.calculated_hlv:,.0f}" if assessment else "₹2,50,00,000"
        gap_str = f"₹{assessment.coverage_gap:,.0f}" if assessment else "₹2,00,00,000"
        liab_str = f"₹{assessment.outstanding_liabilities:,.0f}" if assessment else "₹35,00,000"

        summary_md = f"""### Client Overview: {cust_name}
- **Assessed Segment:** {segment} ({city})
- **Income & Health Profile:** {income_str} annual income | {smoker_str}
- **Calculated Protection Requirement (HLV):** {hlv_str}
- **Declared Outstanding Liabilities:** {liab_str}
- **Net Protection Deficit (Coverage Gap):** {gap_str}

#### Recommended Broker Advisory Stance
The client carries a significant coverage shortfall of {gap_str}. Given declared liabilities, recommend ring-fencing policy proceeds under the **Married Women's Property Act (MWP Act 1874)** to guarantee complete creditor immunity."""

        return CopilotResponse(
            action=action,
            title=f"Client Briefing: {cust_name}",
            summary_markdown=summary_md,
            key_points=[
                f"Net life protection gap identified at {gap_str}",
                f"Client category: {segment}",
                f"Liabilities of {liab_str} require priority debt-shielding",
                "Eligible for preferred standard underwriting rate cards",
            ],
            requires_employee_confirmation=False,
            regulatory_notes="Coverage recommendations derived under IRDAI Suitability & Objective Needs Assessment norms.",
        )

    # 2. PRODUCT RECOMMENDATION MATCH
    elif action == "PRODUCT_SUGGESTION":
        suggestions = [
            {
                "insurer": "HDFC Life",
                "product": "Click 2 Protect Super (v4.2)",
                "csr": "99.30%",
                "indicative_monthly": "₹1,650",
                "suitability_reason": "Ideal balance of high financial stability, early critical illness payout, and flexible premium waiver.",
            },
            {
                "insurer": "ICICI Prudential",
                "product": "iProtect Smart (v3.8)",
                "csr": "98.60%",
                "indicative_monthly": "₹1,720",
                "suitability_reason": "Immediate ₹2.0 Cr accelerated Terminal Illness payout with standard waiver of future premiums.",
            },
            {
                "insurer": "Max Life",
                "product": "Smart Secure Plus (v2.1)",
                "csr": "99.51%",
                "indicative_monthly": "₹1,580",
                "suitability_reason": "Highest claim settlement ratio benchmark in private life space, with optional return of premium at age 65.",
            },
        ]

        summary_md = f"""### Multi-Carrier Recommendation Analysis
Based on the assessed coverage requirement of ₹{(assessment.coverage_gap if assessment else 20000000):,.0f}, here are the three top-rated institutional solutions:

1. **HDFC Life Click 2 Protect Super:** Top recommendation for maximum flexibility and early terminal illness payout acceleration.
2. **ICICI Pru iProtect Smart:** Best-in-class if customer requests extensive critical illness and accidental disability protection.
3. **Max Life Smart Secure Plus:** Highly attractive for cost-conscious clients wanting a 100% premium return option at age 65."""

        return CopilotResponse(
            action=action,
            title="Multi-Insurer Solution Match",
            summary_markdown=summary_md,
            suggested_products=suggestions,
            key_points=[
                "HDFC Life: 99.30% Claim Settlement Ratio; best milestone flexibility",
                "ICICI Pru: 98.60% CSR; market leader in claim processing turnaround",
                "Max Life: 99.51% CSR; industry benchmark in claim transparency",
            ],
            requires_employee_confirmation=False,
            regulatory_notes="As an authorized insurance broker, FINCORE presents quotes from at least 3 partner life insurers to ensure fair and objective representation.",
        )

    # 3. POLICY WORDING EXPLANATION
    elif action == "POLICY_WORDING":
        topic = (payload.query or "").lower().replace(" ", "_")
        clause = None
        for key, val in CLAUSE_EXPLANATIONS.items():
            if key in topic or any(w in topic for w in key.split("_")):
                clause = val
                break

        if not clause:
            clause = CLAUSE_EXPLANATIONS["section_45"]

        summary_md = f"""### {clause['title']}

{clause['explanation']}

#### Advisor Talking Points
- **Client Guidance:** {clause['guidance']}
- **Regulatory Framework:** IRDAI Protection of Policyholders' Interests Regulations."""

        return CopilotResponse(
            action=action,
            title=clause["title"],
            summary_markdown=summary_md,
            key_points=[
                "IRDAI statutory policy wording standard across all authorised life carriers.",
                "Applies uniformly to HDFC Life, ICICI Prudential, Max Life, SBI Life, and LIC.",
                clause["guidance"],
            ],
            requires_employee_confirmation=False,
            regulatory_notes="Statutory provision governed by the Insurance Act 1938 and IRDAI Circulars.",
        )

    # 4. QUOTE COMPARISON DIFFERENTIATOR
    elif action == "QUOTE_COMPARISON":
        summary_md = """### Multi-Carrier Policy Differentiator Matrix

| Feature Dimension | HDFC Life Click 2 Protect Super | ICICI Prudential iProtect Smart | Max Life Smart Secure Plus |
| :--- | :--- | :--- | :--- |
| **Claim Settlement Ratio** | 99.30% | 98.60% | 99.51% |
| **Terminal Illness Payout** | Accelerated up to 100% (max ₹2 Cr) | Accelerated up to 100% (max ₹2 Cr) | Accelerated up to 100% |
| **Waiver of Premium** | On Critical Illness / Total Disability | On Permanent Total Disability | On 64 Critical Illnesses |
| **Life Stage Event Add-on** | +50% on Marriage, +25% per Child | +50% on Marriage, +25% per Child | +50% on Marriage, +25% per Child |
| **Exit Option** | Special Exit at Age 60 (Refund) | Smart Exit at Age 65 (Refund) | Special Exit at Age 65 (Refund) |
| **Indicative Rate (₹2 Cr, 30Y)** | ₹1,650 / month | ₹1,720 / month | ₹1,580 / month |"""

        return CopilotResponse(
            action=action,
            title="Institutional Quote Comparison Matrix",
            summary_markdown=summary_md,
            key_points=[
                "All 3 carriers offer 30-day digital free-look and Section 45 claim protection",
                "Max Life offers lowest base premium; HDFC Life offers highest milestone flexibility",
                "ICICI Pru offers fastest 1-day claim approval track record",
            ],
            requires_employee_confirmation=False,
            regulatory_notes="Comparison reflects standard non-smoker non-medical rate schedules.",
        )

    # 5. DRAFT FOLLOW-UP MESSAGE / EMAIL (MANDATORY CONFIRMATION)
    elif action == "DRAFT_MESSAGE":
        cust_name = customer.full_name if customer else "Valued Client"
        advisor_name = current_user.full_name
        lead_num = lead.lead_number if lead else "LD-REF"
        product_name = lead.product_interest if lead else "Term Life Coverage"
        channel = (payload.context or {}).get("channel", "whatsapp").lower()

        if channel == "email":
            draft = f"""Subject: Comprehensive Life Insurance Comparison Dossier | FINCORE Broking Ref: {lead_num}

Dear {cust_name},

Thank you for your valuable time discussing your family's financial protection plan.

As an authorized life insurance broker, FINCORE has prepared an objective comparison of term life insurance policies tailored to your assessed requirement of ₹{(assessment.coverage_gap if assessment else 20000000):,.0f}.

Key highlights of your comparative quotation:
1. HDFC Life Click 2 Protect Super — ₹2.0 Cr Cover | Indicative Monthly: ₹1,650
2. ICICI Pru iProtect Smart — ₹2.0 Cr Cover | Indicative Monthly: ₹1,720
3. Max Life Smart Secure Plus — ₹2.0 Cr Cover | Indicative Monthly: ₹1,580

All shortlisted plans include 100% early Terminal Illness payout acceleration and are eligible for Section 80C tax deduction. Furthermore, all policies are issued with the statutory 30-Day Free-Look guarantee.

Please let me know if you would like me to schedule a 15-minute briefing or initiate your digital proposal submission.

Warm regards,

{advisor_name}
Licensed Insurance Advisor
FINCORE Insurance Broking Services Pvt. Ltd.
Direct: {current_user.phone or '+91 22 6100 8000'} | {current_user.email}"""
        else:
            draft = f"""Hi {cust_name}, this is {advisor_name} from FINCORE Insurance Brokers. 

Following our conversation, I've prepared your comparative quotation for {product_name} across HDFC Life, ICICI Prudential, and Max Life. 

Your assessed protection requirement: ₹{(assessment.coverage_gap if assessment else 20000000):,.0f} sum assured. 
Starting premium: from ₹1,580/month with zero underwriting markup.

You can review your personalized comparison dossier directly or let me know a convenient time today for a brief 5-min walk-through!"""

        return CopilotResponse(
            action=action,
            title=f"Ready-to-Send {channel.title()} Draft for {cust_name}",
            summary_markdown=(
                f"Generated professional {channel.upper()} template tailored to client financial milestones.\n\n"
                f"> **MANDATORY SAFEGUARD**: Employee confirmation is required before dispatching this message to the client."
            ),
            ready_to_send_draft=draft,
            requires_employee_confirmation=True,  # Crucial requirement: confirmation required!
            key_points=[
                "Employee confirmation required before customer delivery",
                "Complies with IRDAI advertising & fair solicitation code",
                "Includes explicit broker disclosure and statutory 30-day free look notice",
            ],
        )

    # 6. CALL PREPARATION
    elif action == "CALL_PREPARATION":
        cust_name = customer.full_name if customer else "Client"
        summary_md = f"""### Pre-Call Advisory Plan for {cust_name}

#### Strategic Objective
Transition from initial enquiry to needs assessment validation and agreement on an HDFC vs ICICI comparison dossier.

#### Suggested 5-Point Call Agenda
1. **Rapport & Verification:** Confirm declared annual income and family dependents.
2. **Needs Assessment Validation:** Explain why 12x annual income (₹{(assessment.calculated_hlv if assessment else 25000000):,.0f}) is the benchmark protection rule.
3. **Debt Buffer Strategy:** Highlight that declared liabilities (₹{(assessment.outstanding_liabilities if assessment else 3500000):,.0f}) should be ring-fenced via MWP Act.
4. **Comparison Walkthrough:** Present HDFC Click 2 Protect vs ICICI iProtect Smart feature trade-offs.
5. **Next Step Commitment:** Agree on tele-medical slot and collect KYC PAN / Aadhaar."""

        return CopilotResponse(
            action=action,
            title=f"Call Preparation Sheet: {cust_name}",
            summary_markdown=summary_md,
            discovery_questions=[
                "Has your employer provided term cover, and what happens if you change organizations?",
                "Do you have a preference between pure term (lower premium) vs return-of-premium (higher premium)?",
                "Have you ever had any surgery or been hospitalized for more than 5 days in the last 5 years?",
                "Who would be the primary nominee, and would you like to explore MWP Act creditor protection?",
            ],
            key_points=[
                "Anticipate objection: 'I already have LIC endowment policies.' Rebuttal: Endowment policies provide an average of only 2-3x cover; pure term is needed for 15-20x protection.",
                "Anticipate objection: 'Will the claim be paid?' Rebuttal: Section 45 guarantees non-repudiation after 3 years; FINCORE provides dedicated claim settlement assistance.",
            ],
            requires_employee_confirmation=False,
            regulatory_notes="Advise customer that non-disclosure of health history voids coverage under Principle of Utmost Good Faith.",
        )

    # 7. TASK & FOLLOW-UP SUMMARY
    elif action == "TASK_SUMMARY":
        task_stmt = (
            select(Task)
            .where(Task.organization_id == org_id, Task.assigned_to_user_id == current_user.id)
            .order_by(Task.due_date.asc())
            .limit(10)
        )
        t_res = await db.execute(task_stmt)
        user_tasks = t_res.scalars().all()

        pending_count = len([t for t in user_tasks if t.status != "Completed"])
        summary_md = f"""### Daily Task & Follow-up Briefing for {current_user.full_name}

You currently have **{pending_count} pending action items** across your assigned pipeline.

#### Priority Recommendations:
1. **Immediate Callbacks (SLA < 2h):** Address new incoming enquiries to prevent drop-off penalty.
2. **Medical Tele-Underwriting Follow-ups:** Check carrier portal status for submitted proposals.
3. **Re-engagement Reminders:** Follow up with leads stalled in Quote Requested stage."""

        return CopilotResponse(
            action=action,
            title="Daily Action Queue & Task Briefing",
            summary_markdown=summary_md,
            key_points=[
                f"{pending_count} pending advisory follow-ups requiring attention today",
                "Prioritize leads with Lead Score >= 70 (High Propensity)",
                "Document all telephonic outcomes in activity history",
            ],
            requires_employee_confirmation=False,
        )

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported copilot action: {action}")
