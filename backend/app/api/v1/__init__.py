from fastapi import APIRouter

from app.api.v1.admin import router as admin_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.applications import router as applications_router
from app.api.v1.assessments import router as assessments_router
from app.api.v1.assignments import router as assignments_router
from app.api.v1.auth import router as auth_router
from app.api.v1.commissions import router as commissions_router
from app.api.v1.copilot import router as copilot_router
from app.api.v1.customers import router as customers_router
from app.api.v1.documents import router as documents_router
from app.api.v1.insurers import router as insurers_router
from app.api.v1.leads import router as leads_router
from app.api.v1.ml import router as ml_router
from app.api.v1.products import router as products_router
from app.api.v1.quotes import router as quotes_router
from app.api.v1.rag import router as rag_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.users import router as users_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(customers_router)
api_router.include_router(assessments_router)
api_router.include_router(insurers_router)
api_router.include_router(products_router)
api_router.include_router(leads_router)
api_router.include_router(assignments_router)
api_router.include_router(tasks_router)
api_router.include_router(quotes_router)
api_router.include_router(applications_router)
api_router.include_router(documents_router)
api_router.include_router(analytics_router)
api_router.include_router(commissions_router)
api_router.include_router(copilot_router)
api_router.include_router(admin_router)
api_router.include_router(ml_router)
api_router.include_router(rag_router)
