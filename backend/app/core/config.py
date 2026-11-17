import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "FINCORE Backend API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security & Tokens
    SECRET_KEY: str = "fincore_super_secret_jwt_key_change_in_production_2026_secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    # Default asyncpg URL for production/dev PostgreSQL; can be overridden via .env
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/fincore"
    SYNC_DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/fincore"
    
    # Fallback to SQLite if PostgreSQL is not reachable in local test mode
    SQLITE_DB_PATH: str = "./fincore.db"
    USE_SQLITE_FALLBACK: bool = False

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    # Organization Defaults
    DEFAULT_ORG_NAME: str = "FINCORE Insurance Broking Services Pvt Ltd"
    DEFAULT_ORG_CODE: str = "FINCORE-BROKER"
    IRDAI_REG_NUMBER: str = "DB-984/2024"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
