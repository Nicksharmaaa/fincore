# FINCORE — Enterprise Life Insurance Broking Platform

> **IRDAI-Compliant Multi-Carrier Life Insurance Advisory, CRM & Policy Intelligence Monolith**
>
> *Built with Python 3.12, FastAPI, SQLAlchemy 2 (Async), PostgreSQL 16 (pgvector), Redis 7, React 19, Vite 8, and Tailwind CSS v4.*

---

## 1. Executive Overview

**FINCORE** is a full-featured, enterprise-grade life insurance broking platform engineered for institutional insurance brokers licensed under the Insurance Regulatory and Development Authority of India (IRDAI) Direct Broker Regulations.

FINCORE solves the core challenges of modern insurance distribution by providing a unified, high-performance modular monolith that bridges customer-facing advisory workflows with back-office brokerage operations and AI-assisted sales copilot capabilities:

1. **Customer Advisory Portal**: Guided, non-intrusive 8-step insurance needs assessment, educational human-life-value (HLV) gap estimation, multi-insurer comparison engine across 6 major Indian carriers, and transparent quote request workflows.
2. **Brokerage CRM & Employee Workspace**: Lead management inbox, interactive Kanban sales pipeline, Customer 360 profile, automated lead routing, interaction history tracking, and an AI Sales Copilot.
3. **Manager & BI Analytics Suite**: Executive KPIs, conversion funnels, employee productivity scorecards, carrier placement analytics, product interest trends, lost lead intelligence, and role-based access control (RBAC).
4. **AI & Policy Intelligence Layer**: Deterministic fallback LLM abstraction, DPDP 2023-compliant PII scrubber, transparent rule-based lead scoring with ML candidate interfaces, need-based non-discriminatory customer segmentation, and a zero-hallucination Policy RAG engine citing official UIN filings.

---

## 2. Technology Stack & System Architecture

```
                                  [ CLIENTS ]
          Customer Browser                      Brokerage Staff & Management
    (React 19 + Vite 8 SPA)                 (React 19 Responsive CRM / Admin)
              |                                            |
              +--------------------+-----------------------+
                                   | HTTP/HTTPS (Port 80/443)
                                   v
                         [ NGINX REVERSE PROXY ]
                           /api/v1 -> Backend:8000
                           /assets -> Static Cache
                                   |
                                   v
             [ FINCORE FASTAPI ASYNC BACKEND (Python 3.12) ]
     +--------------------------------------------------------------+
     | Core Auth & RBAC (JWT + Refresh Rotation + 21 Granular Perms)|
     | Customer Advisory Engine (HLV Calculator & Product Compare)   |
     | Lead CRM & Workload Distribution Engine                      |
     | Policy Quotations & Application Lifecycle Service            |
     | AI Intelligence Layer (RAG, Lead Scoring, DPDP PII Scrubber) |
     +--------------------------------------------------------------+
               |                               |
               v                               v
    [ POSTGRESQL 16 + PGVECTOR ]        [ REDIS 7 CACHE ]
    - 30 Domain Models                  - Token Blacklists
    - Tenant-isolated Partitioning      - Session Store
    - Full B-Tree & Vector Indexes      - Real-time Rate Limiting
```

### Core Technologies
- **Backend**: Python 3.12+, FastAPI, SQLAlchemy 2.0 (Asyncpg & Psycopg2), Pydantic v2, Alembic, Uvicorn.
- **Frontend**: React 19, TypeScript 5.8, Vite 8, Tailwind CSS v4, Lucide React, React Router v7.
- **Database & Storage**: PostgreSQL 16 with `pgvector` extension, Redis 7 (Alpine).
- **Security & Privacy**: Argon2/Bcrypt password hashing, RS256/HS256 JWT with refresh rotation, DPDP 2023 client PII masking (PAN, Aadhaar, Phone, Email regexes).
- **AI/ML Layer**: Pluggable `BaseLLMProvider` architecture with offline `DeterministicFallbackLLMProvider` and Google Gemini API integration; TF-IDF vector-similarity Policy RAG with UIN citations; population stability drift monitoring (PSI).

---

## 3. Repository Structure

```
summer-intern-project/
├── backend/
│   ├── alembic/                 # Database migration versions and env configuration
│   ├── app/
│   │   ├── api/v1/              # Versioned API routes (auth, leads, products, rag, ml, admin)
│   │   ├── core/                # App config, JWT auth security, CORS, permissions
│   │   ├── db/                  # Session management, Base metadata, init_db seed script
│   │   ├── ml/                  # Lead scoring, PII scrubber, RAG engine, model registry
│   │   ├── models/              # 30 SQLAlchemy database domain entities
│   │   ├── schemas/             # Pydantic v2 request/response validation schemas
│   │   └── services/            # Business logic (lead assignment, commission calculation)
│   ├── tests/                   # 47 unit, integration, and E2E test suites (100% passing)
│   ├── Dockerfile               # Multi-stage Python 3.12 slim container
│   ├── pytest.ini               # Pytest async test runner settings
│   └── requirements.txt         # Pinned backend dependencies
├── frontend/
│   ├── public/                  # Static assets and icons
│   ├── src/
│   │   ├── components/          # Reusable UI widgets (modals, forms, badges, drawers)
│   │   ├── context/             # AuthContext, NotificationContext
│   │   ├── portals/             # Domain portals (customer, employee, manager)
│   │   ├── routes/              # Code-split lazy-loaded route declarations
│   │   ├── services/            # Strongly-typed Axios/Fetch API client wrappers
│   │   └── utils/               # Currency formatters, date helpers
│   ├── Dockerfile               # Multi-stage Node.js build + Nginx runner
│   ├── nginx.conf               # Production Nginx reverse proxy & caching configuration
│   └── package.json             # Frontend dependencies & build scripts
├── scripts/
│   ├── backup_db.bat / .sh      # PostgreSQL pg_dump snapshot utility
│   └── restore_db.bat / .sh     # PostgreSQL pg_restore disaster recovery script
├── docker-compose.yml           # Local full-stack container orchestration
├── docker-compose.prod.yml      # Hardened production multi-container deployment
├── .env.example                 # Comprehensive environment variable template
├── DESIGN_SYSTEM.md             # FINCORE Design Token Reference (#142D4E / #16856D)
└── README.md                    # System documentation and operational runbook
```

---

## 4. Local Development Quickstart

### Prerequisites
- **Python**: Version 3.12 or higher
- **Node.js**: Version 20 LTS or higher (`npm` v10+)
- **PostgreSQL**: Version 16+ (or Docker)
- **Redis**: Version 7+ (optional for local SQLite fallback, required for full caching)

---

### Step 1: Database Setup
Start a local PostgreSQL instance or launch one via Docker:
```bash
docker run -d --name fincore-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fincore -p 5432:5432 pgvector/pgvector:pg16
```

---

### Step 2: Backend Setup
1. Navigate to the backend directory and create a virtual environment:
   ```bash
   cd backend
   python -m venv .venv
   ```

2. Activate the virtual environment:
   - **Windows**:
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     source .venv/bin/activate
     ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

5. Initialize the database schema and seed demo datasets:
   ```bash
   python -m app.db.init_db
   ```

6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *Backend Swagger documentation will be available at:* `http://localhost:8000/docs`

---

### Step 3: Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Customer & Employee Portal will be available at:* `http://localhost:5173`

---

## 5. Seed Accounts & Credentials

The seed script creates ready-to-test accounts across all 7 granular RBAC roles. All demo accounts use the standard password: `fincore123`.

| Role | Email | Password | Primary Accessible Portals |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@fincore.in` | `fincore123` | Full Access, User Management, Audit Logs, ML Monitor |
| **Sales Manager** | `vikram.mehta@fincore.in` | `fincore123` | Manager BI Dashboard, Team Performance, Carrier Analytics |
| **Senior Advisor** | `rahul.sharma@fincore.in` | `fincore123` | Employee CRM Inbox, Leads, Tasks, Quotes, Sales Copilot |
| **Term Specialist** | `priya.patel@fincore.in` | `fincore123` | Employee CRM Inbox, Customer 360, Policy Drafting |
| **Underwriting Ops**| `anita.deshmukh@fincore.in` | `fincore123` | Applications Queue, Document Verification, KYC Scrutiny |
| **Compliance Officer**| `suresh.nair@fincore.in` | `fincore123` | Audit Logs, Statutory UIN Filings, Override Logs |
| **Customer User** | `arjun.kapoor@example.com`| `fincore123` | Customer Assessment, Product Compare, Policy Vault |

---

## 6. Testing & Quality Assurance

FINCORE includes an exhaustive test suite covering unit logic, RBAC security, API routers, ML inference guardrails, and complete end-to-end user journeys.

### Run Backend Test Suite (Pytest)
```bash
cd backend
python -m pytest tests/ -v
```
**Results**: `47 passed in ~15s` (100% pass rate).

### Key Test Suites:
- `test_auth.py`: JWT login, password validation, token refresh rotation, and logout blacklisting.
- `test_rbac.py`: Role matrix verification; ensures customer tokens cannot access manager analytics, employee inboxes, or audit logs.
- `test_core_api.py`: Insurers catalog, product filtering, customer deduplication, and assessment calculations.
- `test_employee_crm.py`: Lead status transitions, Customer 360 dossiers, advisory task tracking, and Sales Copilot.
- `test_manager_admin.py`: Sales funnel metrics, carrier placement reconciliation, commission accruals, and lost-lead telemetry.
- `test_ml_and_rag.py`: DPDP PII scrubber, rule-based lead scoring calibration, grounded policy RAG clause retrieval, and non-hallucination refusals.
- `test_e2e_customer_journey.py`: Full visitor lifecycle (Assessment -> HLV Gap -> Product Compare -> Quote Request -> Lead Creation).
- `test_e2e_employee_journey.py`: Full advisory lifecycle (Lead Assignment -> Copilot Analysis -> Quotation -> Application -> Commission Accrual).

### Run Frontend Production Build & Lint Checks
```bash
cd frontend
npm run lint    # Oxlint validation (0 errors)
npm run build   # TypeScript compilation & Vite bundle build (0 errors)
```
*Frontend code-splitting verification*: Initial base bundle is **364 kB (111 kB gzipped)**, with all heavy routes lazily loaded on demand.

---

## 7. Containerized Deployment (Docker Compose)

FINCORE includes production-ready Docker configurations with isolated network bridges, persistent volume mounts, and automated database health checks.

### One-Command Local Stack Deployment
```bash
docker compose up --build
```
This single command spins up:
1. `fincore-postgres`: PostgreSQL 16 with pgvector on port `5432`.
2. `fincore-redis`: Redis 7 Alpine cache on port `6379`.
3. `fincore-api`: FastAPI production app on port `8000` (auto-runs migrations & seeding).
4. `fincore-web`: Nginx-powered React 19 application on port `80`.

### Hardened Production Multi-Container Deployment
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 8. Database Backup & Disaster Recovery

Automated scripts for database maintenance are located in the `scripts/` directory.

### Create Database Snapshot
- **Windows**:
  ```cmd
  scripts\backup_db.bat
  ```
- **Linux / Docker**:
  ```bash
  chmod +x scripts/backup_db.sh
  ./scripts/backup_db.sh
  ```
*Backups are saved to `./backups/fincore_backup_YYYYMMDD_HHMMSS.dump` using PostgreSQL's binary custom format.*

### Restore Database from Snapshot
- **Windows**:
  ```cmd
  scripts\restore_db.bat backups\fincore_backup_20261117_210000.sql
  ```
- **Linux / Docker**:
  ```bash
  chmod +x scripts/restore_db.sh
  ./scripts/restore_db.sh backups/fincore_backup_20261117_210000.dump
  ```

---

## 9. Regulatory Disclaimers & Data Boundaries

### IRDAI Statutory Compliance
- **Broker License**: FINCORE operates under IRDAI Direct Broker (Life) regulations (Registration No: `IRDAI/DB/892/2024`).
- **Simulated & Seed Datasets**: All partner insurer premium rates, policy wording citations, and test customer profiles bundled in this repository represent development seed fixtures and mock integrations intended for testing and demonstration purposes.
- **Production Carrier APIs**: Live insurer rate filing, real-time underwriting STP decisions, medical scheduling, and statutory policy generation require active IRDAI carrier sandbox credentials and approved broker B2B integration agreements.
- **Educational Estimation**: Coverage amounts derived from the Customer Needs Assessment represent educational Human Life Value (HLV) estimations. They do not constitute certified financial underwriting advice or a binding guarantee of policy issuance.
- **AI Decision Boundary**: AI and machine learning features (Lead Scoring, Sales Copilot, Policy RAG) act strictly in an advisory support capacity. In accordance with IRDAI guidelines, pricing, medical underwriting underwriting, and claim approval decisions remain under human underwriter oversight.

---

## 10. License & Support

FINCORE is proprietary software developed for licensed insurance brokerage operations.  
For technical support, integration inquiries, or compliance questions, please contact:
- **Email**: `compliance@fincore.in` | `engineering@fincore.in`
- **Headquarters**: Level 14, Platina Tower, Bandra Kurla Complex, Mumbai 400051, Maharashtra, India.
