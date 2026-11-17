# FINCORE — Project Context

> Last updated: 2026-11-16

## What is Fincore?

Fincore is a **production-grade fintech platform** for an authorised life insurance brokerage in India.  
It is **not** an insurance company. It facilitates the sale of life insurance policies issued by multiple approved insurers (e.g. LIC, HDFC Life, ICICI Prudential, SBI Life, etc.).

---

## Business Context

| Dimension | Detail |
|---|---|
| Industry | Life insurance brokerage, India |
| Regulatory role | Authorised insurance broker (IRDAI-registered) |
| Insurer relationship | Multi-insurer: aggregates products from several life insurers |
| Revenue model | Brokerage commission from insurers on successful policy issuance |
| Team users | Agents / relationship managers, team managers, platform admins |
| End customers | Individual retail insurance buyers in India |

---

## Platform Components

### 1. Customer Portal
Public-facing website + authenticated customer account area.  
Handles discovery, education, comparison, quote requests, application tracking and document uploads.

### 2. Employee Workspace (CRM)
Internal tool for insurance agents and relationship managers.  
Handles lead management, customer profiles, follow-ups, tasks, quote generation and application tracking.

### 3. Manager & Admin Dashboard
Analytics, performance monitoring, commission tracking, user management and configuration.

### 4. AI / ML Intelligence Engine
- **Lead Scoring (ML):** Scikit-learn / XGBoost / LightGBM models trained on historical lead behaviour to rank leads by conversion probability.
- **Customer Segmentation (ML):** Cluster customers by profile for targeted outreach.
- **RAG Policy Assistant:** pgvector + approved insurer policy documents + LLM to answer precise product questions.
- **Recommendation Engine:** Suggest relevant products based on customer needs assessment.

---

## Critical Business Rules

1. **Never invent premium prices.** Indicative quotes only; actual binding quotes come from insurer systems or are labelled as demo data.
2. **Never mark an application as approved or a policy as issued** unless the status comes from an authorised insurer source.
3. **Underwriting and claim decisions stay inside insurer systems** — Fincore only tracks status.
4. **Product information is versioned** — policy terms, benefit tables and riders are stored with effective dates and version numbers.
5. **Multi-insurer architecture** — every policy, product and quote is linked to a specific insurer entity.
6. **RBAC enforced at API level** — `customer`, `agent`, `manager`, `admin`, `super_admin` roles with strict access boundaries.
7. **Audit trail** — all sensitive create/update/delete operations produce audit log entries with actor, timestamp and diff.
8. **Customer data isolation** — agents see only assigned customers; managers see their team; admins see all.

---

## Technology Stack

| Layer | Technology | Key Decision |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS v4 | Single SPA, portal-namespaced routes |
| Component library | shadcn/ui (Radix primitives + Tailwind) | Unstyled base, styled via design system |
| State management | Zustand (global) + TanStack Query v5 (server state) | TanStack Query hooks centralised in `services/` layer |
| Backend API | Python 3.12 + FastAPI | Router → Service → Repository 3-layer pattern |
| API server | Gunicorn + UvicornWorker (production) | Process supervision + graceful restarts |
| ORM | SQLAlchemy 2.x (async, asyncpg driver) + Alembic | Never use `create_all()` in production |
| Database | PostgreSQL 16 | `NUMERIC(12,2)` for all money fields; never FLOAT |
| Vector search | pgvector 0.7.x — HNSW index (not IVFFlat) | HNSW: append-friendly, superior recall; IVFFlat needs periodic rebuild |
| Auth | RS256 JWT (asymmetric) — 15 min access / 7 day refresh | RS256 avoids shared-secret rotation across worker replicas |
| Token storage | HttpOnly secure cookies for refresh token | Prevents XSS token theft |
| Token revocation | Redis blocklist keyed by `jti` for instant revocation | Handles account suspension / password change |
| Background tasks | Celery 5.x + Redis (introduced in Phase 3) | `task_acks_late=True`, `prefetch_multiplier=1` |
| ML | Scikit-learn 1.5.x, XGBoost 2.x / LightGBM | Model registry pattern, heuristic fallback |
| Caching | Redis 7.x | Product catalogue, analytics aggregations |
| File storage | Local Docker volume → S3-compatible object store | Never store file blobs in PostgreSQL |
| Containerisation | Docker + Docker Compose | 6-container topology; Nginx is only public-facing port |
| CI / CD | GitHub Actions | Turborepo-style affected-build graph |

---

## Repo Structure (Monorepo)

```
fincore/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/              # Route handlers (versioned, thin HTTP adapters only)
│   │   │   └── v1/
│   │   │       ├── auth/
│   │   │       ├── customers/
│   │   │       ├── leads/
│   │   │       ├── products/
│   │   │       ├── quotes/
│   │   │       ├── applications/
│   │   │       ├── documents/
│   │   │       ├── analytics/
│   │   │       ├── ml/
│   │   │       └── rag/
│   │   ├── core/             # Config, security, dependencies, exception handlers
│   │   │   ├── config.py     # Pydantic BaseSettings (env-driven)
│   │   │   ├── security.py   # RS256 JWT, RoleChecker, PermissionChecker
│   │   │   ├── exceptions.py # Global exception handlers (no stack traces to clients)
│   │   │   └── dependencies.py
│   │   ├── db/               # Async engine, session factory, base model
│   │   ├── models/           # SQLAlchemy ORM models (domain-grouped)
│   │   ├── schemas/          # Pydantic v2 request/response schemas
│   │   ├── services/         # Business logic (framework-agnostic, unit-testable)
│   │   ├── repositories/     # Data access layer (all ORM queries here)
│   │   ├── workers/
│   │   │   ├── celery_app.py # Celery + Redis config
│   │   │   └── tasks.py      # Task definitions (never imports FastAPI app)
│   │   ├── ml/               # Model registry, feature extractors, inference
│   │   └── rag/              # Ingestion pipeline, retriever, LLM chain
│   ├── alembic/              # Migration scripts (only way to modify schema)
│   ├── tests/
│   │   ├── unit/             # Service layer tests with mock repos
│   │   ├── integration/      # httpx.AsyncClient + test DB
│   │   └── conftest.py
│   ├── Dockerfile            # Multi-stage: builder + slim final, non-root user
│   └── requirements.txt      # Pinned versions
│
├── frontend/                 # React SPA (multi-portal, single Vite build)
│   ├── src/
│   │   ├── portals/
│   │   │   ├── customer/     # Customer portal pages and components
│   │   │   ├── employee/     # Employee CRM pages and components
│   │   │   └── admin/        # Manager / Admin dashboard pages
│   │   ├── components/       # Shared UI components (design system)
│   │   │   └── ui/           # shadcn/ui generated components
│   │   ├── hooks/            # Shared React hooks
│   │   ├── services/         # TanStack Query hooks + Axios instances (centralised)
│   │   ├── stores/           # Zustand global stores
│   │   ├── types/            # Shared TypeScript types
│   │   └── utils/            # Utilities and helpers
│   ├── Dockerfile            # Multi-stage: node:20-alpine build → nginx:alpine serve
│   └── package.json
│
├── nginx/
│   └── nginx.conf            # Reverse proxy; only service with external port exposure
│
├── docker-compose.yml        # Production: 6 services on private bridge network
├── docker-compose.dev.yml    # Dev: hot-reload backend + frontend + postgres + redis
├── .env.example              # All required variables documented
├── Makefile                  # make dev | make migrate | make test | make build
├── PROJECT_CONTEXT.md
├── DESIGN_SYSTEM.md
└── IMPLEMENTATION_PLAN.md
```

---

## Domain Model (Conceptual)

```
Insurer ──< Product ──< ProductVersion
                │
                └──< Quote ──< Application ──< PolicyIssuance (external)
                                    │
Customer ──< Lead ──< Quote         └──< Document
    │            │
    │            └── assigned to → Employee
    │
    └──< Interaction
    └──< SupportRequest

Employee ──< Team ──< Manager

AuditLog
Notification
```

---

## Environments

| Environment | Purpose |
|---|---|
| `development` | Local Docker Compose, mock insurer data |
| `staging` | Full stack on a staging server, demo insurer data clearly labelled |
| `production` | Live platform, real authorised insurer data |

