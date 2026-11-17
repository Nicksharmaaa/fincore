import os
from typing import AsyncGenerator
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Determine async connection URL
DATABASE_URL = settings.DATABASE_URL
SYNC_DATABASE_URL = settings.SYNC_DATABASE_URL

# Fallback mechanism if SQLite is explicitly enabled or needed in tests
if settings.USE_SQLITE_FALLBACK or "sqlite" in DATABASE_URL:
    async_db_url = f"sqlite+aiosqlite:///{settings.SQLITE_DB_PATH}"
    sync_db_url = f"sqlite:///{settings.SQLITE_DB_PATH}"
    engine = create_async_engine(
        async_db_url,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG,
    )
    sync_engine = create_engine(
        sync_db_url,
        connect_args={"check_same_thread": False},
    )
else:
    engine = create_async_engine(
        DATABASE_URL,
        echo=settings.DEBUG,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )
    sync_engine = create_engine(
        SYNC_DATABASE_URL,
        pool_pre_ping=True,
        pool_size=5,
    )

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides an async database session wrapped in a transaction."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
