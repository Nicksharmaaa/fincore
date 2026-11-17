from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import api_router
from app.core.config import settings
from app.core.exceptions import AppException
from app.db.session import engine
from sqlalchemy import text


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: test database connection
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        print("[FINCORE] Database connection verified successfully.")
    except Exception as e:
        print(f"[FINCORE] Database connection warning on startup: {e}")
    yield
    # Shutdown
    await engine.dispose()
    print("[FINCORE] Database connection pool disposed.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="FINCORE Life Insurance Broking Platform API. Designed for IRDAI regulated multi-insurer life insurance distribution.",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_code": exc.__class__.__name__},
    )


@app.get("/health", tags=["Health"])
async def healthcheck():
    """Service health monitoring endpoint."""
    db_ok = False
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "healthy" if db_ok else "degraded",
        "service": "FINCORE API",
        "database": "connected" if db_ok else "disconnected",
        "environment": settings.ENVIRONMENT,
        "disclaimer": "FINCORE is a life insurance broker technology platform. DEMO DATA ONLY.",
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "platform": "FINCORE Insurance Broking Core API",
        "version": "1.0.0",
        "documentation": "/docs",
        "regulatory_notice": "FINCORE operates as a licensed direct insurance broker. Insurance is the subject matter of solicitation.",
    }


# Mount API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)
