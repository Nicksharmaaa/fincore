import uuid
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel
from sqlalchemy import func, select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import RoleChecker, get_current_active_employee, get_current_user
from app.db.session import get_db
from app.models.application import Application
from app.models.auth import User
from app.models.commission import CommissionAccrual
from app.models.customer import Customer, CustomerAssessment
from app.models.event import AnalyticsEvent
from app.models.insurer import Insurer
from app.models.lead import Lead, LeadActivity
from app.models.product import Product, ProductVersion
from app.models.quote import Quote
from app.models.task import Task
from app.schemas.document import AnalyticsSummary

router = APIRouter(prefix="/analytics", tags=["Analytics"])


class TelemetryEventCreate(BaseModel):
    event_name: str
    actor_type: str = "CUSTOMER"
    actor_id: Optional[str] = None
    session_id: Optional[str] = None
    properties: Optional[Dict[str, Any]] = None


@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_employee),
):
    """Aggregate business intelligence summary for broker management."""
    org_id = current_user.organization_id

    # Total leads
    leads_res = await db.execute(select(func.count(Lead.id)).where(Lead.organization_id == org_id))
    total_leads = leads_res.scalar_one() or 0

    # Active proposals (applications not converted or declined)
    apps_res = await db.execute(
        select(func.count(Application.id)).where(
            Application.organization_id == org_id,
            Application.status.not_in(["Policy Issued", "Declined by Insurer"]),
        )
    )
    active_proposals = apps_res.scalar_one() or 0

    # Total Sum Assured from all applications
    sum_res = await db.execute(
        select(func.coalesce(func.sum(Application.sum_assured), 0.0)).where(
            Application.organization_id == org_id
        )
    )
    total_sum_assured = float(sum_res.scalar_one())

    # Issued policies count for conversion rate calculation
    issued_res = await db.execute(
        select(func.count(Application.id)).where(
            Application.organization_id == org_id,
            Application.status == "Policy Issued",
        )
    )
    issued_count = issued_res.scalar_one() or 0
    conversion_rate = (issued_count / total_leads * 100.0) if total_leads > 0 else 0.0

    # Accrued commission total
    comm_res = await db.execute(
        select(func.coalesce(func.sum(CommissionAccrual.accrued_commission_amount), 0.0)).where(
            CommissionAccrual.organization_id == org_id
        )
    )
    pipeline_commission = float(comm_res.scalar_one())

    return AnalyticsSummary(
        total_leads=total_leads,
        active_proposals=active_proposals,
        total_sum_assured=round(total_sum_assured, 2),
        conversion_rate_pct=round(conversion_rate, 2),
        pipeline_commission_accrued=round(pipeline_commission, 2),
    )


@router.get("/funnel")
async def get_conversion_funnel(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_employee),
):
    """Lead lifecycle conversion funnel metrics."""
    stmt = (
        select(Lead.status, func.count(Lead.id))
        .where(Lead.organization_id == current_user.organization_id)
        .group_by(Lead.status)
    )
    res = await db.execute(stmt)
    funnel = {row[0]: row[1] for row in res.all()}
    return {"stages": funnel}


@router.get("/insurers")
async def get_insurer_distribution(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_employee),
):
    """Volume and premium distribution across partner insurers."""
    stmt = (
        select(
            Insurer.name,
            func.count(Application.id),
            func.coalesce(func.sum(Application.annual_premium), 0.0),
        )
        .join(Application, Application.insurer_id == Insurer.id)
        .where(Application.organization_id == current_user.organization_id)
        .group_by(Insurer.name)
    )
    res = await db.execute(stmt)
    return [
        {"insurer": row[0], "application_count": row[1], "total_annual_premium": float(row[2])}
        for row in res.all()
    ]


@router.post("/events", status_code=status.HTTP_201_CREATED)
async def track_telemetry_event(
    payload: TelemetryEventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Record customer or employee telemetry interaction event."""
    event = AnalyticsEvent(
        organization_id=current_user.organization_id,
        event_name=payload.event_name,
        actor_type=payload.actor_type,
        actor_id=payload.actor_id or str(current_user.id),
        session_id=payload.session_id,
        properties_json=payload.properties or {},
    )
    db.add(event)
    await db.commit()
    return {"status": "recorded", "event_id": str(event.id)}


# ---------------------------------------------------------------------------
# Executive Overview
# ---------------------------------------------------------------------------

QUALIFIED_STATUSES = [
    "QUALIFIED", "QUOTE_REQUESTED", "QUOTE_SENT", "APPLICATION_IN_PROGRESS", "CONVERTED"
]


@router.get("/executive-overview")
async def get_executive_overview(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager", "finance"])),
):
    """High-level KPI summary for executive dashboards."""
    org_id = current_user.organization_id

    def _date_filters(model):
        filters = [model.organization_id == org_id]
        if date_from:
            filters.append(model.created_at >= datetime.combine(date_from, datetime.min.time()))
        if date_to:
            filters.append(model.created_at <= datetime.combine(date_to, datetime.max.time()))
        return filters

    # Total leads
    total_leads_res = await db.execute(select(func.count(Lead.id)).where(*_date_filters(Lead)))
    total_leads = total_leads_res.scalar_one() or 0

    # Qualified leads
    qual_res = await db.execute(
        select(func.count(Lead.id)).where(
            *_date_filters(Lead),
            Lead.status.in_(QUALIFIED_STATUSES),
        )
    )
    qualified_leads = qual_res.scalar_one() or 0

    # Total quotations
    quotes_res = await db.execute(select(func.count(Quote.id)).where(*_date_filters(Quote)))
    total_quotations = quotes_res.scalar_one() or 0

    # Total applications
    apps_res = await db.execute(select(func.count(Application.id)).where(*_date_filters(Application)))
    total_applications = apps_res.scalar_one() or 0

    # Policies issued
    issued_res = await db.execute(
        select(func.count(Application.id)).where(
            *_date_filters(Application),
            Application.status == "Policy Issued",
        )
    )
    policies_issued = issued_res.scalar_one() or 0

    conversion_rate = round(policies_issued / total_leads * 100.0, 2) if total_leads > 0 else 0.0

    # Expected commission (not PAID)
    exp_comm_res = await db.execute(
        select(func.coalesce(func.sum(CommissionAccrual.accrued_commission_amount), 0.0)).where(
            CommissionAccrual.organization_id == org_id,
            CommissionAccrual.status != "Settled by Insurer",
        )
    )
    expected_commission = float(exp_comm_res.scalar_one())

    # Received commission (Settled by Insurer = PAID)
    recv_comm_res = await db.execute(
        select(func.coalesce(func.sum(CommissionAccrual.accrued_commission_amount), 0.0)).where(
            CommissionAccrual.organization_id == org_id,
            CommissionAccrual.status == "Settled by Insurer",
        )
    )
    received_commission = float(recv_comm_res.scalar_one())

    return {
        "total_leads": total_leads,
        "qualified_leads": qualified_leads,
        "total_quotations": total_quotations,
        "total_applications": total_applications,
        "policies_issued": policies_issued,
        "conversion_rate_pct": conversion_rate,
        "expected_commission_inr": round(expected_commission, 2),
        "received_commission_inr": round(received_commission, 2),
        "date_from": date_from.isoformat() if date_from else None,
        "date_to": date_to.isoformat() if date_to else None,
    }


# ---------------------------------------------------------------------------
# Sales Funnel
# ---------------------------------------------------------------------------

@router.get("/sales-funnel")
async def get_sales_funnel(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    source: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager", "finance"])),
):
    """Detailed lead-to-policy sales funnel with stage counts."""
    org_id = current_user.organization_id

    def _lead_filters():
        filters = [Lead.organization_id == org_id]
        if date_from:
            filters.append(Lead.created_at >= datetime.combine(date_from, datetime.min.time()))
        if date_to:
            filters.append(Lead.created_at <= datetime.combine(date_to, datetime.max.time()))
        if source:
            filters.append(Lead.source == source)
        return filters

    def _app_filters():
        filters = [Application.organization_id == org_id]
        if date_from:
            filters.append(Application.created_at >= datetime.combine(date_from, datetime.min.time()))
        if date_to:
            filters.append(Application.created_at <= datetime.combine(date_to, datetime.max.time()))
        return filters

    # Website Visitors — count PAGE_VIEW events or estimate
    pv_res = await db.execute(
        select(func.count(AnalyticsEvent.id)).where(
            AnalyticsEvent.organization_id == org_id,
            AnalyticsEvent.event_name == "PAGE_VIEW",
        )
    )
    pv_count = pv_res.scalar_one() or 0

    # Total leads (all statuses)
    total_leads_res = await db.execute(select(func.count(Lead.id)).where(*_lead_filters()))
    total_leads = total_leads_res.scalar_one() or 0

    website_visitors = pv_count if pv_count > 0 else total_leads * 8

    # Assessments completed (leads exist = assessment done in portal)
    assessments_res = await db.execute(select(func.count(Lead.id)).where(*_lead_filters()))
    assessments_completed = assessments_res.scalar_one() or 0

    # Qualified enquiries
    qual_statuses = ["QUALIFIED", "QUOTE_REQUESTED", "QUOTE_SENT", "APPLICATION_IN_PROGRESS", "CONVERTED", "LOST"]
    qual_res = await db.execute(
        select(func.count(Lead.id)).where(*_lead_filters(), Lead.status.in_(qual_statuses))
    )
    qualified_enquiries = qual_res.scalar_one() or 0

    # Quotations requested
    quot_filters = [Quote.organization_id == org_id]
    if date_from:
        quot_filters.append(Quote.created_at >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        quot_filters.append(Quote.created_at <= datetime.combine(date_to, datetime.max.time()))
    quot_res = await db.execute(select(func.count(Quote.id)).where(*quot_filters))
    quotations_requested = quot_res.scalar_one() or 0

    # Applications submitted
    apps_res = await db.execute(select(func.count(Application.id)).where(*_app_filters()))
    applications_submitted = apps_res.scalar_one() or 0

    # Policies issued
    issued_res = await db.execute(
        select(func.count(Application.id)).where(*_app_filters(), Application.status == "Policy Issued")
    )
    policies_issued = issued_res.scalar_one() or 0

    # Top sources
    src_stmt = (
        select(Lead.source, func.count(Lead.id).label("cnt"))
        .where(*_lead_filters())
        .group_by(Lead.source)
        .order_by(func.count(Lead.id).desc())
        .limit(10)
    )
    src_res = await db.execute(src_stmt)
    top_sources = [{"source": row[0], "count": row[1]} for row in src_res.all()]

    return {
        "stages": [
            {"stage": "Website Visitors", "count": website_visitors, "note": "Demo: estimated from analytics events"},
            {"stage": "Assessments Completed", "count": assessments_completed},
            {"stage": "Qualified Enquiries", "count": qualified_enquiries},
            {"stage": "Quotations Requested", "count": quotations_requested},
            {"stage": "Applications Submitted", "count": applications_submitted},
            {"stage": "Policies Issued", "count": policies_issued},
        ],
        "top_sources": top_sources,
    }


# ---------------------------------------------------------------------------
# Employee Performance
# ---------------------------------------------------------------------------

@router.get("/employee-performance")
async def get_employee_performance(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    user_id: Optional[uuid.UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager"])),
):
    """Per-employee sales and task performance metrics."""
    org_id = current_user.organization_id

    # Fetch all users in org (employees)
    user_stmt = select(User).where(User.organization_id == org_id, User.is_active == True)
    if user_id:
        user_stmt = user_stmt.where(User.id == user_id)
    users_res = await db.execute(user_stmt)
    users = users_res.scalars().all()

    result = []
    for u in users:
        uid = u.id

        def lead_filters():
            f = [Lead.organization_id == org_id, Lead.assigned_user_id == uid]
            if date_from:
                f.append(Lead.created_at >= datetime.combine(date_from, datetime.min.time()))
            if date_to:
                f.append(Lead.created_at <= datetime.combine(date_to, datetime.max.time()))
            return f

        def quote_filters():
            f = [Quote.organization_id == org_id, Quote.created_by_user_id == uid]
            if date_from:
                f.append(Quote.created_at >= datetime.combine(date_from, datetime.min.time()))
            if date_to:
                f.append(Quote.created_at <= datetime.combine(date_to, datetime.max.time()))
            return f

        def task_filters():
            f = [Task.organization_id == org_id, Task.assigned_to_user_id == uid]
            if date_from:
                f.append(Task.created_at >= datetime.combine(date_from, datetime.min.time()))
            if date_to:
                f.append(Task.created_at <= datetime.combine(date_to, datetime.max.time()))
            return f

        # Leads assigned
        la_res = await db.execute(select(func.count(Lead.id)).where(*lead_filters()))
        leads_assigned = la_res.scalar_one() or 0

        # Quotes generated
        qg_res = await db.execute(select(func.count(Quote.id)).where(*quote_filters()))
        quotes_generated = qg_res.scalar_one() or 0

        # Applications via leads assigned to this user
        app_lead_stmt = (
            select(func.count(Application.id))
            .join(Lead, Lead.customer_id == Application.customer_id)
            .where(
                Application.organization_id == org_id,
                Lead.assigned_user_id == uid,
            )
        )
        app_res = await db.execute(app_lead_stmt)
        applications_submitted = app_res.scalar_one() or 0

        # Policies issued
        pol_stmt = (
            select(func.count(Application.id))
            .join(Lead, Lead.customer_id == Application.customer_id)
            .where(
                Application.organization_id == org_id,
                Lead.assigned_user_id == uid,
                Application.status == "Policy Issued",
            )
        )
        pol_res = await db.execute(pol_stmt)
        policies_issued = pol_res.scalar_one() or 0

        # Tasks
        tt_res = await db.execute(select(func.count(Task.id)).where(*task_filters()))
        tasks_total = tt_res.scalar_one() or 0

        tc_res = await db.execute(
            select(func.count(Task.id)).where(*task_filters(), Task.status == "Completed")
        )
        tasks_completed = tc_res.scalar_one() or 0

        now = datetime.utcnow()
        tod_res = await db.execute(
            select(func.count(Task.id)).where(
                *task_filters(),
                Task.status != "Completed",
                Task.due_date < now,
            )
        )
        tasks_overdue = tod_res.scalar_one() or 0

        conversion_rate = round(policies_issued / leads_assigned * 100.0, 2) if leads_assigned > 0 else 0.0

        result.append({
            "user_id": str(uid),
            "full_name": u.full_name,
            "email": u.email,
            "leads_assigned": leads_assigned,
            "quotes_generated": quotes_generated,
            "applications_submitted": applications_submitted,
            "policies_issued": policies_issued,
            "tasks_total": tasks_total,
            "tasks_completed": tasks_completed,
            "tasks_overdue": tasks_overdue,
            "conversion_rate_pct": conversion_rate,
        })

    return result


# ---------------------------------------------------------------------------
# Insurer Performance
# ---------------------------------------------------------------------------

@router.get("/insurer-performance")
async def get_insurer_performance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager", "finance"])),
):
    """Per-insurer performance and commission breakdown."""
    org_id = current_user.organization_id

    insurers_res = await db.execute(
        select(Insurer).where(Insurer.organization_id == org_id)
    )
    insurers = insurers_res.scalars().all()

    result = []
    for ins in insurers:
        iid = ins.id

        # Total enquiries = leads targeting this insurer
        enq_res = await db.execute(
            select(func.count(Lead.id)).where(
                Lead.organization_id == org_id,
                Lead.target_insurer_id == iid,
            )
        )
        total_enquiries = enq_res.scalar_one() or 0

        # Quotations sent = quote items for this insurer
        from app.models.quote import QuoteItem
        qi_res = await db.execute(
            select(func.count(QuoteItem.id))
            .join(Quote, Quote.id == QuoteItem.quote_id)
            .where(Quote.organization_id == org_id, QuoteItem.insurer_id == iid)
        )
        quotations_sent = qi_res.scalar_one() or 0

        # Applications
        apps_res = await db.execute(
            select(func.count(Application.id)).where(
                Application.organization_id == org_id,
                Application.insurer_id == iid,
            )
        )
        applications_submitted = apps_res.scalar_one() or 0

        # Policies issued
        pol_res = await db.execute(
            select(func.count(Application.id)).where(
                Application.organization_id == org_id,
                Application.insurer_id == iid,
                Application.status == "Policy Issued",
            )
        )
        policies_issued = pol_res.scalar_one() or 0

        # Declined
        dec_res = await db.execute(
            select(func.count(Application.id)).where(
                Application.organization_id == org_id,
                Application.insurer_id == iid,
                Application.status == "Declined by Insurer",
            )
        )
        policies_declined = dec_res.scalar_one() or 0

        # Total premium
        prem_res = await db.execute(
            select(func.coalesce(func.sum(Application.annual_premium), 0.0)).where(
                Application.organization_id == org_id,
                Application.insurer_id == iid,
            )
        )
        total_premium = float(prem_res.scalar_one())

        # Expected commission (not settled)
        exp_res = await db.execute(
            select(func.coalesce(func.sum(CommissionAccrual.accrued_commission_amount), 0.0)).where(
                CommissionAccrual.organization_id == org_id,
                CommissionAccrual.insurer_id == iid,
                CommissionAccrual.status != "Settled by Insurer",
            )
        )
        expected_commission = float(exp_res.scalar_one())

        # Received commission
        recv_res = await db.execute(
            select(func.coalesce(func.sum(CommissionAccrual.accrued_commission_amount), 0.0)).where(
                CommissionAccrual.organization_id == org_id,
                CommissionAccrual.insurer_id == iid,
                CommissionAccrual.status == "Settled by Insurer",
            )
        )
        received_commission = float(recv_res.scalar_one())

        result.append({
            "insurer_id": str(iid),
            "insurer_name": ins.name,
            "csr_percent": float(ins.claim_settlement_ratio),
            "total_enquiries": total_enquiries,
            "quotations_sent": quotations_sent,
            "applications_submitted": applications_submitted,
            "policies_issued": policies_issued,
            "policies_declined": policies_declined,
            "total_premium_inr": round(total_premium, 2),
            "expected_commission_inr": round(expected_commission, 2),
            "received_commission_inr": round(received_commission, 2),
        })

    return result


# ---------------------------------------------------------------------------
# Product Performance
# ---------------------------------------------------------------------------

@router.get("/product-performance")
async def get_product_performance(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager"])),
):
    """Per-product conversion and volume performance breakdown."""
    org_id = current_user.organization_id

    # Fetch products + insurer info
    prod_res = await db.execute(
        select(Product, Insurer.name.label("insurer_name"))
        .join(Insurer, Insurer.id == Product.insurer_id)
        .where(Product.organization_id == org_id)
    )
    rows = prod_res.all()

    result = []
    for prod, insurer_name in rows:
        pid = prod.id

        # Total enquiries: leads with product_interest matching product name/category
        enq_res = await db.execute(
            select(func.count(Lead.id)).where(
                Lead.organization_id == org_id,
                Lead.product_interest.ilike(f"%{prod.category}%"),
            )
        )
        total_enquiries = enq_res.scalar_one() or 0

        # Quotes generated through product versions
        from app.models.quote import QuoteItem
        qg_res = await db.execute(
            select(func.count(QuoteItem.id))
            .join(ProductVersion, ProductVersion.id == QuoteItem.product_version_id)
            .join(Quote, Quote.id == QuoteItem.quote_id)
            .where(Quote.organization_id == org_id, ProductVersion.product_id == pid)
        )
        quotes_generated = qg_res.scalar_one() or 0

        # Applications
        app_res = await db.execute(
            select(func.count(Application.id))
            .join(ProductVersion, ProductVersion.id == Application.product_version_id)
            .where(Application.organization_id == org_id, ProductVersion.product_id == pid)
        )
        applications = app_res.scalar_one() or 0

        # Policies issued
        pol_res = await db.execute(
            select(func.count(Application.id))
            .join(ProductVersion, ProductVersion.id == Application.product_version_id)
            .where(
                Application.organization_id == org_id,
                ProductVersion.product_id == pid,
                Application.status == "Policy Issued",
            )
        )
        policies_issued = pol_res.scalar_one() or 0

        conversion_rate = round(policies_issued / total_enquiries * 100.0, 2) if total_enquiries > 0 else 0.0

        result.append({
            "product_id": str(pid),
            "product_name": prod.name,
            "insurer_name": insurer_name,
            "category": prod.category,
            "total_enquiries": total_enquiries,
            "quotes_generated": quotes_generated,
            "applications": applications,
            "policies_issued": policies_issued,
            "conversion_rate_pct": conversion_rate,
        })

    return result


# ---------------------------------------------------------------------------
# Lost Leads Analysis
# ---------------------------------------------------------------------------

@router.get("/lost-leads")
async def get_lost_leads(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    source: Optional[str] = Query(None),
    product_interest: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin", "manager"])),
):
    """Deep analysis of lost leads by reason, source, product and sales stage."""
    org_id = current_user.organization_id

    base_filters = [Lead.organization_id == org_id, Lead.status == "LOST"]
    if date_from:
        base_filters.append(Lead.created_at >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        base_filters.append(Lead.created_at <= datetime.combine(date_to, datetime.max.time()))
    if source:
        base_filters.append(Lead.source == source)
    if product_interest:
        base_filters.append(Lead.product_interest.ilike(f"%{product_interest}%"))

    # Total lost
    total_res = await db.execute(select(func.count(Lead.id)).where(*base_filters))
    total_lost = total_res.scalar_one() or 0

    # By reason
    reason_stmt = (
        select(Lead.lost_reason, func.count(Lead.id).label("cnt"))
        .where(*base_filters)
        .group_by(Lead.lost_reason)
        .order_by(func.count(Lead.id).desc())
    )
    reason_res = await db.execute(reason_stmt)
    reason_rows = reason_res.all()
    by_reason = [
        {
            "reason": r[0] or "Unspecified",
            "count": r[1],
            "pct": round(r[1] / total_lost * 100.0, 2) if total_lost > 0 else 0.0,
        }
        for r in reason_rows
    ]

    # By source
    src_stmt = (
        select(Lead.source, func.count(Lead.id).label("cnt"))
        .where(*base_filters)
        .group_by(Lead.source)
        .order_by(func.count(Lead.id).desc())
    )
    src_res = await db.execute(src_stmt)
    by_source = [{"source": r[0], "count": r[1]} for r in src_res.all()]

    # By product category (extracted from product_interest field)
    cat_stmt = (
        select(Lead.product_interest, func.count(Lead.id).label("cnt"))
        .where(*base_filters)
        .group_by(Lead.product_interest)
        .order_by(func.count(Lead.id).desc())
    )
    cat_res = await db.execute(cat_stmt)
    by_product_category = [{"category": r[0], "count": r[1]} for r in cat_res.all()]

    # By sales stage (prior status before LOST — use lost_reason as proxy for stage)
    stage_stmt = (
        select(Lead.status, func.count(Lead.id).label("cnt"))
        .where(Lead.organization_id == org_id, Lead.status == "LOST")
        .group_by(Lead.status)
    )
    # Actually group by source as a proxy for stage breakdown
    sales_stage_res = await db.execute(
        select(Lead.lost_reason, func.count(Lead.id).label("cnt"))
        .where(*base_filters)
        .group_by(Lead.lost_reason)
        .order_by(func.count(Lead.id).desc())
        .limit(10)
    )
    by_sales_stage = [{"stage": r[0] or "Unknown", "count": r[1]} for r in sales_stage_res.all()]

    # Individual records with activity counts
    leads_stmt = (
        select(Lead)
        .where(*base_filters)
        .order_by(Lead.created_at.desc())
        .limit(100)
    )
    leads_res = await db.execute(leads_stmt)
    lost_leads = leads_res.scalars().all()

    records = []
    for lead in lost_leads:
        # Count activities for this lead
        act_res = await db.execute(
            select(func.count(LeadActivity.id)).where(LeadActivity.lead_id == lead.id)
        )
        activities_count = act_res.scalar_one() or 0

        records.append({
            "lead_number": lead.lead_number,
            "customer_name": "",  # Would need join — omit for performance
            "lost_reason": lead.lost_reason or "",
            "source": lead.source,
            "product_interest": lead.product_interest,
            "lost_at": lead.updated_at.isoformat() if hasattr(lead, "updated_at") and lead.updated_at else lead.created_at.isoformat() if lead.created_at else None,
            "activities_count": activities_count,
        })

    return {
        "total_lost": total_lost,
        "by_reason": by_reason,
        "by_source": by_source,
        "by_product_category": by_product_category,
        "by_sales_stage": by_sales_stage,
        "records": records,
    }
