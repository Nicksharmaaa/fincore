from datetime import datetime, timedelta, timezone
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import RoleChecker, get_current_user, get_db
from app.models.auth import User
from app.models.lead import Lead
from app.models.quote import Quote, QuoteItem
from app.schemas.quote import QuoteCreate, QuoteResponse
from app.services.audit_service import record_audit_log

router = APIRouter(prefix="/quotes", tags=["Quotations"])


@router.get("/", response_model=List[QuoteResponse])
async def list_quotes(
    lead_id: uuid.UUID = None,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin", "operations", "finance", "compliance"])),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve generated multi-insurer quotation dossiers."""
    stmt = (
        select(Quote)
        .where(Quote.organization_id == current_user.organization_id)
        .options(selectinload(Quote.items))
    )
    if lead_id:
        stmt = stmt.where(Quote.lead_id == lead_id)

    stmt = stmt.order_by(Quote.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED)
async def create_quote(
    quote_in: QuoteCreate,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Generate a multi-insurer quotation comparison dossier. All quotes carry demo/indicative flags."""
    # Verify lead
    lead_stmt = select(Lead).where(
        Lead.id == quote_in.lead_id,
        Lead.organization_id == current_user.organization_id
    )
    res = await db.execute(lead_stmt)
    lead = res.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    quote_number = f"QT-{1000 + (hash(str(uuid.uuid4())) % 9000)}"
    valid_until = datetime.now(timezone.utc) + timedelta(days=14)

    quote = Quote(
        organization_id=current_user.organization_id,
        quote_number=quote_number,
        lead_id=quote_in.lead_id,
        created_by_user_id=current_user.id,
        status="Sent to Client",
        valid_until=valid_until,
        notes=quote_in.notes or "Indicative comparison quote based on standard non-smoker life profile."
    )
    db.add(quote)
    await db.flush()

    # Add quote alternatives
    for item in quote_in.items:
        quote_item = QuoteItem(
            quote_id=quote.id,
            insurer_id=item.insurer_id,
            product_version_id=item.product_version_id,
            sum_assured=item.sum_assured,
            policy_term_years=item.policy_term_years,
            indicative_premium_monthly=item.indicative_premium_monthly,
            indicative_premium_annual=item.indicative_premium_annual,
            is_demo_data=True, # MANDATORY FINTECH RULE
            data_origin_tag=item.data_origin_tag or "DEMO_RATE_CARD",
        )
        db.add(quote_item)

    # Transition lead status to "Quoting"
    lead.status = "Quoting"
    await db.flush()

    # Re-fetch quote with items loaded
    fetch_stmt = (
        select(Quote)
        .where(Quote.id == quote.id)
        .options(selectinload(Quote.items))
    )
    fetch_res = await db.execute(fetch_stmt)
    created_quote = fetch_res.scalar_one()

    await record_audit_log(
        db=db,
        organization_id=current_user.organization_id,
        actor_email=current_user.email,
        action="GENERATE_QUOTE",
        entity_name="Quote",
        entity_id=str(quote.id),
        actor_user_id=current_user.id,
        changes_json={"quote_number": quote.quote_number, "items_count": len(quote_in.items)}
    )

    return created_quote


@router.get("/{quote_id}", response_model=QuoteResponse)
async def get_quote(
    quote_id: uuid.UUID,
    current_user: User = Depends(RoleChecker(["sales", "manager", "admin", "operations", "finance", "compliance"])),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve a specific quotation dossier."""
    stmt = (
        select(Quote)
        .where(
            Quote.id == quote_id,
            Quote.organization_id == current_user.organization_id
        )
        .options(selectinload(Quote.items))
    )
    res = await db.execute(stmt)
    quote = res.scalar_one_or_none()
    if not quote:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quotation not found")
    return quote

