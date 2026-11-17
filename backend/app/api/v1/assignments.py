from datetime import datetime, timezone
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import RoleChecker, get_current_user, get_db
from app.models.auth import Role, User
from app.models.customer import Customer
from app.models.employee import EmployeeProfile
from app.models.lead import Lead, LeadActivity, LeadAssignment
from app.models.notification import Notification
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/assignments", tags=["Lead Assignments"])


class AssignmentCreate(BaseModel):
    lead_id: uuid.UUID
    assigned_to_user_id: uuid.UUID
    reason: Optional[str] = None


class AutoAssignRequest(BaseModel):
    lead_id: uuid.UUID


class AdvisorWorkloadResponse(BaseModel):
    user_id: uuid.UUID
    full_name: str
    email: str
    phone: str
    designation: str
    department: str
    branch: str
    is_available: bool = True
    specialisation: str
    languages: List[str]
    active_leads_count: int
    monthly_target_gwp: int


class RecommendationItem(BaseModel):
    advisor: AdvisorWorkloadResponse
    match_score: int
    workload_score: int
    specialisation_score: int
    geography_score: int
    language_score: int
    reason: str
    is_recommended: bool


ADVISOR_KNOWLEDGE_BASE = {
    "rahul.sharma@fincore.in": {
        "specialisation": "Term Life, High Sum Assured, Critical Illness Riders",
        "languages": ["English", "Hindi", "Marathi"],
        "primary_geography": "Mumbai - BKC",
    },
    "priya.patel@fincore.in": {
        "specialisation": "Term Life, Savings & Endowment, Whole Life",
        "languages": ["English", "Hindi", "Gujarati"],
        "primary_geography": "Mumbai - BKC",
    },
    "vikram.mehta@fincore.in": {
        "specialisation": "Keyman Insurance, HNW Solutions, Multi-Carrier Portfolios",
        "languages": ["English", "Hindi", "Gujarati", "Marathi"],
        "primary_geography": "Mumbai - BKC",
    },
}


@router.get("/advisors-workload", response_model=List[AdvisorWorkloadResponse])
async def get_advisors_workload(
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """List sales advisors with their real-time active lead counts, specialisations and languages."""
    org_id = current_user.organization_id

    stmt = (
        select(User)
        .join(User.roles)
        .where(
            User.organization_id == org_id,
            User.is_active == True,
            Role.code.in_(["sales", "advisor", "manager"])
        )
        .options(
            selectinload(User.employee_profile),
            selectinload(User.roles)
        )
    )
    res = await db.execute(stmt)
    users = res.scalars().unique().all()

    workload_list = []
    for u in users:
        lead_count_stmt = select(func.count(Lead.id)).where(
            Lead.organization_id == org_id,
            Lead.assigned_user_id == u.id,
            Lead.status.not_in(["Converted", "Lost", "CONVERTED", "LOST"])
        )
        lead_count_res = await db.execute(lead_count_stmt)
        active_leads = lead_count_res.scalar_one() or 0

        emp_profile = u.employee_profile
        designation = emp_profile.designation if emp_profile else "Insurance Advisor"
        department = emp_profile.department if emp_profile else "Direct Sales"
        branch = emp_profile.branch if emp_profile else "Mumbai - BKC"
        monthly_target = emp_profile.monthly_target_gwp if emp_profile else 750000

        kb = ADVISOR_KNOWLEDGE_BASE.get(u.email, {
            "specialisation": "Term Life & Protection Products",
            "languages": ["English", "Hindi"],
            "primary_geography": branch,
        })

        workload_list.append(AdvisorWorkloadResponse(
            user_id=u.id,
            full_name=u.full_name,
            email=u.email,
            phone=u.phone or "+91-98000-00000",
            designation=designation,
            department=department,
            branch=branch,
            is_available=True,
            specialisation=kb["specialisation"],
            languages=kb["languages"],
            active_leads_count=active_leads,
            monthly_target_gwp=monthly_target,
        ))

    return workload_list


@router.post("/recommend", response_model=List[RecommendationItem])
async def recommend_advisors_for_lead(
    payload: AutoAssignRequest,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Calculate multi-criteria recommendation scores for assigning an advisor to a lead."""
    org_id = current_user.organization_id

    lead_stmt = select(Lead).where(
        Lead.id == payload.lead_id,
        Lead.organization_id == org_id
    ).options(selectinload(Lead.customer))
    lead_res = await db.execute(lead_stmt)
    lead = lead_res.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    customer_city = lead.customer.city if lead.customer else "Mumbai"
    product_interest = lead.product_interest.lower()
    sum_assured = float(lead.desired_sum_assured)

    workloads = await get_advisors_workload(current_user=current_user, db=db)
    if not workloads:
        raise HTTPException(status_code=400, detail="No active advisors available for assignment")

    scored_items: List[RecommendationItem] = []

    for adv in workloads:
        # A. Workload score (30% weight)
        if adv.active_leads_count == 0:
            w_score = 30
        elif adv.active_leads_count <= 2:
            w_score = 27
        elif adv.active_leads_count <= 4:
            w_score = 22
        elif adv.active_leads_count <= 6:
            w_score = 16
        else:
            w_score = 10

        # B. Specialisation score (30% weight)
        spec_lower = adv.specialisation.lower()
        s_score = 15
        if "term" in product_interest and "term" in spec_lower:
            s_score += 15
        elif ("saving" in product_interest or "endowment" in product_interest) and "saving" in spec_lower:
            s_score += 15
        elif sum_assured >= 20000000 and "high sum assured" in spec_lower:
            s_score += 15
        elif "keyman" in product_interest and "keyman" in spec_lower:
            s_score += 15
        s_score = min(30, s_score)

        # C. Geography score (20% weight)
        g_score = 12
        if "mumbai" in customer_city.lower() and "mumbai" in adv.branch.lower():
            g_score = 20
        elif "pune" in customer_city.lower() and "mumbai" in adv.branch.lower():
            g_score = 16
        elif "bengaluru" in customer_city.lower() and "bengaluru" in adv.branch.lower():
            g_score = 20

        # D. Language score (20% weight)
        l_score = 15
        if "mumbai" in customer_city.lower() and "Marathi" in adv.languages:
            l_score = 20
        elif "pune" in customer_city.lower() and "Marathi" in adv.languages:
            l_score = 20
        elif "gujarat" in customer_city.lower() or "ahmedabad" in customer_city.lower():
            if "Gujarati" in adv.languages:
                l_score = 20

        total_score = min(100, w_score + s_score + g_score + l_score)

        reasons = []
        if s_score >= 25:
            reasons.append("High product specialization match")
        if w_score >= 25:
            reasons.append("Optimal workload capacity")
        if g_score >= 18:
            reasons.append("Branch geographic alignment")
        if l_score >= 18:
            reasons.append("Regional language compatibility")
        reason_str = " & ".join(reasons) if reasons else "Balanced capacity and coverage profile"

        scored_items.append(RecommendationItem(
            advisor=adv,
            match_score=total_score,
            workload_score=w_score,
            specialisation_score=s_score,
            geography_score=g_score,
            language_score=l_score,
            reason=reason_str,
            is_recommended=False,
        ))

    scored_items.sort(key=lambda x: x.match_score, reverse=True)
    if scored_items:
        scored_items[0].is_recommended = True

    return scored_items


@router.post("/auto-assign", status_code=status.HTTP_200_OK)
async def auto_assign_lead(
    payload: AutoAssignRequest,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Automatically allocate lead to the highest-scoring advisor using multi-criteria matching."""
    recommendations = await recommend_advisors_for_lead(payload=payload, current_user=current_user, db=db)
    if not recommendations:
        raise HTTPException(status_code=400, detail="Unable to calculate advisor recommendations")

    best_match = recommendations[0]
    advisor_user_id = best_match.advisor.user_id

    lead_stmt = select(Lead).where(
        Lead.id == payload.lead_id,
        Lead.organization_id == current_user.organization_id
    )
    res = await db.execute(lead_stmt)
    lead = res.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    lead.assigned_user_id = advisor_user_id

    reason = (
        f"Automated AI Allocation (Score {best_match.match_score}%): {best_match.reason}. "
        f"Workload: {best_match.advisor.active_leads_count} active leads."
    )
    assign_record = LeadAssignment(
        organization_id=current_user.organization_id,
        lead_id=lead.id,
        assigned_to_user_id=advisor_user_id,
        assigned_by_user_id=current_user.id,
        assignment_reason=reason
    )
    db.add(assign_record)

    act = LeadActivity(
        organization_id=current_user.organization_id,
        lead_id=lead.id,
        user_id=current_user.id,
        activity_type="ASSIGNMENT",
        title=f"Lead Auto-Assigned to {best_match.advisor.full_name}",
        notes=reason
    )
    db.add(act)

    notif = Notification(
        organization_id=current_user.organization_id,
        user_id=advisor_user_id,
        title=f"Lead Assigned: {lead.lead_number}",
        message=f"You have been assigned lead {lead.lead_number} ({lead.product_interest}). Matching Score: {best_match.match_score}%.",
        notification_type="LEAD_ASSIGNED",
        link_url=f"/app/leads/{lead.id}"
    )
    db.add(notif)

    await record_audit_log(
        db=db,
        organization_id=current_user.organization_id,
        actor_email=current_user.email,
        action="AUTO_ASSIGN_LEAD",
        entity_name="Lead",
        entity_id=str(lead.id),
        actor_user_id=current_user.id,
        changes_json={"assigned_to": best_match.advisor.full_name, "score": best_match.match_score}
    )

    await db.commit()

    return {
        "status": "success",
        "lead_id": lead.id,
        "lead_number": lead.lead_number,
        "assigned_to": best_match.advisor.full_name,
        "match_score": best_match.match_score,
        "reason": reason,
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def assign_lead(
    assignment_in: AssignmentCreate,
    current_user: User = Depends(RoleChecker(["manager", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Manual assignment / Manager override with audit rationale."""
    lead_stmt = select(Lead).where(
        Lead.id == assignment_in.lead_id,
        Lead.organization_id == current_user.organization_id
    )
    res = await db.execute(lead_stmt)
    lead = res.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    agent_stmt = select(User).where(
        User.id == assignment_in.assigned_to_user_id,
        User.organization_id == current_user.organization_id
    )
    agent_res = await db.execute(agent_stmt)
    agent = agent_res.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent user not found")

    lead.assigned_user_id = agent.id

    assignment_rec = LeadAssignment(
        organization_id=current_user.organization_id,
        lead_id=lead.id,
        assigned_to_user_id=agent.id,
        assigned_by_user_id=current_user.id,
        assignment_reason=assignment_in.reason or "Manager manual override"
    )
    db.add(assignment_rec)

    act = LeadActivity(
        organization_id=current_user.organization_id,
        lead_id=lead.id,
        user_id=current_user.id,
        activity_type="ASSIGNMENT",
        title=f"Manager Override: Reassigned to {agent.full_name}",
        notes=assignment_in.reason or "Manager manual routing"
    )
    db.add(act)

    notif = Notification(
        organization_id=current_user.organization_id,
        user_id=agent.id,
        title=f"Lead Assigned by Manager: {lead.lead_number}",
        message=f"Manager {current_user.full_name} assigned lead {lead.lead_number} to your queue. Reason: {assignment_in.reason or 'Direct assignment'}",
        notification_type="LEAD_ASSIGNED",
        link_url=f"/app/leads/{lead.id}"
    )
    db.add(notif)

    await record_audit_log(
        db=db,
        organization_id=current_user.organization_id,
        actor_email=current_user.email,
        action="ASSIGN_LEAD_OVERRIDE",
        entity_name="Lead",
        entity_id=str(lead.id),
        actor_user_id=current_user.id,
        changes_json={"assigned_to": agent.full_name, "reason": assignment_in.reason}
    )

    await db.commit()

    return {
        "message": f"Lead {lead.lead_number} successfully assigned to {agent.full_name}",
        "lead_id": lead.id,
        "assigned_to": agent.full_name,
        "reason": assignment_in.reason,
    }


@router.get("/history/{lead_id}")
async def get_lead_assignment_history(
    lead_id: uuid.UUID,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve full chronological assignment audit history for a lead."""
    stmt = (
        select(LeadAssignment)
        .where(
            LeadAssignment.lead_id == lead_id,
            LeadAssignment.organization_id == current_user.organization_id
        )
        .order_by(LeadAssignment.created_at.desc())
    )
    res = await db.execute(stmt)
    records = res.scalars().all()

    history = []
    for r in records:
        assignee_res = await db.execute(select(User).where(User.id == r.assigned_to_user_id))
        assignee = assignee_res.scalar_one_or_none()

        assigner = None
        if r.assigned_by_user_id:
            assigner_res = await db.execute(select(User).where(User.id == r.assigned_by_user_id))
            assigner = assigner_res.scalar_one_or_none()

        history.append({
            "id": str(r.id),
            "assigned_to_id": str(r.assigned_to_user_id),
            "assigned_to_name": assignee.full_name if assignee else "Advisor",
            "assigned_by_id": str(r.assigned_by_user_id) if r.assigned_by_user_id else None,
            "assigned_by_name": assigner.full_name if assigner else "System Automation",
            "reason": r.assignment_reason,
            "timestamp": r.created_at.isoformat() if r.created_at else None,
        })

    return history
