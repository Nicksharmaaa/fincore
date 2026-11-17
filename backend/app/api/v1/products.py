import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user_optional, get_db
from app.models.auth import User
from app.models.organization import Organization
from app.models.product import Product, ProductVersion
from app.schemas.product import ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/compare", response_model=List[ProductResponse])
async def compare_products(
    ids: str = Query(..., description="Comma-separated product UUIDs to compare"),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve detailed product specifications and versioned comparison data for 2 or 3 plans."""
    parsed_ids = []
    for raw in ids.split(","):
        raw_clean = raw.strip()
        if raw_clean:
            try:
                parsed_ids.append(uuid.UUID(raw_clean))
            except ValueError:
                pass

    if not parsed_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one valid product UUID must be provided in 'ids'"
        )

    stmt = (
        select(Product)
        .where(
            Product.id.in_(parsed_ids),
            Product.is_active == True
        )
        .options(
            selectinload(Product.insurer),
            selectinload(Product.versions).selectinload(ProductVersion.benefits),
            selectinload(Product.versions).selectinload(ProductVersion.exclusions),
        )
    )
    res = await db.execute(stmt)
    prods = res.scalars().all()
    return prods


@router.get("/", response_model=List[ProductResponse])
async def list_products(
    category: Optional[str] = None,
    insurer_id: Optional[uuid.UUID] = None,
    search: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve versioned life insurance product catalogue with category & carrier filters."""
    if current_user:
        org_id = current_user.organization_id
    else:
        org_res = await db.execute(select(Organization).limit(1))
        org = org_res.scalar_one_or_none()
        org_id = org.id if org else None

    stmt = (
        select(Product)
        .where(Product.is_active == True)
        .options(
            selectinload(Product.insurer),
            selectinload(Product.versions).selectinload(ProductVersion.benefits),
            selectinload(Product.versions).selectinload(ProductVersion.exclusions),
        )
    )
    if org_id:
        stmt = stmt.where(Product.organization_id == org_id)

    if category and category.lower() != "all":
        stmt = stmt.where(Product.category.ilike(f"%{category}%"))
    if insurer_id:
        stmt = stmt.where(Product.insurer_id == insurer_id)
    if search:
        search_pattern = f"%{search.strip()}%"
        stmt = stmt.where(
            or_(
                Product.name.ilike(search_pattern),
                Product.tagline.ilike(search_pattern),
                Product.category.ilike(search_pattern)
            )
        )

    stmt = stmt.order_by(Product.name)
    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: uuid.UUID,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve full product specification with active version, riders, and exclusions."""
    stmt = (
        select(Product)
        .where(
            Product.id == product_id,
            Product.is_active == True
        )
        .options(
            selectinload(Product.insurer),
            selectinload(Product.versions).selectinload(ProductVersion.benefits),
            selectinload(Product.versions).selectinload(ProductVersion.exclusions),
        )
    )
    res = await db.execute(stmt)
    prod = res.scalar_one_or_none()
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return prod

