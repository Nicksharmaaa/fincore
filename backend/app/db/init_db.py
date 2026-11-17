import asyncio
from datetime import date, datetime, timedelta, timezone
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import app.models
from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import AsyncSessionLocal, engine
from app.models.application import Application, ApplicationEvent
from app.models.audit import AuditLog
from app.models.auth import Permission, Role, RolePermission, User, UserRole
from app.models.commission import CommissionAccrual, CommissionSchedule
from app.models.customer import Customer, CustomerAssessment, CustomerConsent
from app.models.document import Document, DocumentLink
from app.models.employee import EmployeeProfile
from app.models.insurer import Insurer
from app.models.lead import Lead, LeadActivity, LeadAssignment
from app.models.organization import Organization
from app.models.product import Product, ProductBenefit, ProductExclusion, ProductVersion
from app.models.quote import Quote, QuoteItem
from app.models.task import Task


async def init_db() -> None:
    """Initialize database tables and seed demo brokerage environment."""
    print("[FINCORE] Ensuring database schema exists...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[FINCORE] Schema created / verified.")

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        res = await db.execute(select(Organization).where(Organization.code == "fincore-brokerage"))
        if res.scalars().first():
            print("[FINCORE] Database already seeded. Skipping initial seeding.")
            return

        print("[FINCORE] Seeding initial brokerage organization and master data...")

        # 1. Organization
        org = Organization(
            name="FINCORE Insurance Broking Services Pvt. Ltd.",
            code="fincore-brokerage",
            irdai_registration_no="IRDAI/DB/892/2024",
            contact_email="contact@fincore.in",
            contact_phone="+91-22-6100-8000",
            address="Level 14, Platina Tower, Bandra Kurla Complex, Mumbai 400051",
            city="Mumbai",
            is_active=True,
        )
        db.add(org)
        await db.flush()

        # 2. Permissions
        perm_codes = [
            ("users:read", "View users and staff directory", "users"),
            ("users:manage", "Create, update and manage employee accounts", "users"),
            ("customers:read", "View customer records and 360 profile", "customers"),
            ("customers:create", "Create customer records with KYC", "customers"),
            ("customers:edit", "Update customer profiles and consent", "customers"),
            ("leads:read", "Access lead management workspace", "leads"),
            ("leads:create", "Create new prospective insurance leads", "leads"),
            ("leads:assign", "Assign leads to sales advisors", "leads"),
            ("leads:edit", "Update lead stage and interaction notes", "leads"),
            ("quotes:read", "View multi-insurer quotation dossiers", "quotes"),
            ("quotes:create", "Generate comparison quotes from rate cards", "quotes"),
            ("applications:read", "View proposal applications", "applications"),
            ("applications:create", "Create proposal applications", "applications"),
            ("applications:update_status", "Update underwriting stages", "applications"),
            ("documents:read", "View verification documents", "documents"),
            ("documents:upload", "Upload customer verification files", "documents"),
            ("documents:verify", "Approve or reject KYC documents", "documents"),
            ("commissions:read", "View commission schedules and accruals", "commissions"),
            ("commissions:manage", "Configure IRDAI commission slabs", "commissions"),
            ("analytics:read", "Access managerial analytics dashboards", "analytics"),
            ("admin:all", "Full system administrator access", "admin"),
        ]

        perms_dict = {}
        for code, name, category in perm_codes:
            p = Permission(code=code, name=name, category=category)
            db.add(p)
            perms_dict[code] = p
        await db.flush()

        # 3. Roles
        roles_data = [
            ("admin", "Administrator", "Full system access, compliance oversight, user admin", True),
            ("manager", "Branch / Sales Manager", "Lead distribution, team KPIs, underwriting approvals", False),
            ("sales", "Insurance Advisor", "Lead handling, quotes, needs assessment, customer calls", False),
            ("operations", "Underwriting & Operations", "KYC scrutiny, document processing, proposal routing", False),
            ("finance", "Finance & Accounts", "Commission tracking, insurer reconciliations, payouts", False),
            ("compliance", "Compliance Officer", "IRDAI regulatory filings, audit logs, fair advisory review", False),
            ("customer", "Policyholder / Customer", "Self-service quote comparison, policy vault, tracking", False),
        ]

        role_objs = {}
        for code, name, desc, is_sys in roles_data:
            role = Role(
                organization_id=org.id,
                code=code,
                name=name,
                description=desc,
                is_system_role=is_sys,
            )
            db.add(role)
            role_objs[code] = role
        await db.flush()

        # Assign permissions to roles
        role_perm_map = {
            "admin": list(perms_dict.keys()),
            "manager": [
                "users:read", "customers:read", "customers:create", "customers:edit",
                "leads:read", "leads:create", "leads:assign", "leads:edit",
                "quotes:read", "quotes:create", "applications:read", "applications:create", "applications:update_status",
                "documents:read", "documents:verify", "commissions:read", "analytics:read"
            ],
            "sales": [
                "customers:read", "customers:create", "leads:read", "leads:create", "leads:edit",
                "quotes:read", "quotes:create", "applications:read", "applications:create",
                "documents:read", "documents:upload"
            ],
            "operations": [
                "customers:read", "applications:read", "applications:update_status",
                "documents:read", "documents:upload", "documents:verify"
            ],
            "finance": [
                "applications:read", "commissions:read", "commissions:manage", "analytics:read"
            ],
            "compliance": [
                "customers:read", "leads:read", "quotes:read", "applications:read",
                "documents:read", "commissions:read", "analytics:read"
            ],
            "customer": [
                "quotes:read", "applications:read", "documents:upload"
            ]
        }

        for r_code, perm_list in role_perm_map.items():
            r = role_objs[r_code]
            for p_code in perm_list:
                db.add(RolePermission(role_id=r.id, permission_id=perms_dict[p_code].id))
        await db.flush()

        # 4. Users (Employees & Customers)
        common_password_hash = get_password_hash("fincore123")

        users_meta = [
            ("admin@fincore.in", "Venkatesh Rao", "+91-98200-11001", "admin", "EMP-001", "Chief Executive & Principal Officer", "Executive", 2000000),
            ("vikram.mehta@fincore.in", "Vikram Mehta", "+91-98200-11002", "manager", "EMP-002", "Regional Sales Manager - West", "Agency Sales", 1500000),
            ("rahul.sharma@fincore.in", "Rahul Sharma", "+91-98200-11003", "sales", "EMP-003", "Senior Insurance Advisor", "Direct Sales", 800000),
            ("priya.patel@fincore.in", "Priya Patel", "+91-98200-11004", "sales", "EMP-004", "Term Life Specialist", "Direct Sales", 750000),
            ("anita.deshmukh@fincore.in", "Anita Deshmukh", "+91-98200-11005", "operations", "EMP-005", "Senior Underwriting Executive", "Operations", 0),
            ("suresh.nair@fincore.in", "Suresh Nair", "+91-98200-11006", "compliance", "EMP-006", "Chief Compliance Officer", "Legal & Compliance", 0),
        ]

        user_objs = {}
        for email, full_name, phone, role_code, emp_code, designation, dept, target in users_meta:
            u = User(
                organization_id=org.id,
                email=email,
                full_name=full_name,
                phone=phone,
                hashed_password=common_password_hash,
                is_active=True,
                is_verified=True,
            )
            db.add(u)
            await db.flush()
            user_objs[email] = u

            # Map user to role
            db.add(UserRole(user_id=u.id, role_id=role_objs[role_code].id))

            # Employee profile
            db.add(EmployeeProfile(
                organization_id=org.id,
                user_id=u.id,
                employee_code=emp_code,
                designation=designation,
                department=dept,
                branch="Mumbai - BKC",
                monthly_target_gwp=target,
            ))
        await db.flush()

        # Customer User
        cust_user = User(
            organization_id=org.id,
            email="arjun.kapoor@example.com",
            full_name="Arjun Kapoor",
            phone="+91-98200-44556",
            hashed_password=common_password_hash,
            is_active=True,
            is_verified=True,
        )
        db.add(cust_user)
        await db.flush()
        db.add(UserRole(user_id=cust_user.id, role_id=role_objs["customer"].id))
        user_objs["arjun.kapoor@example.com"] = cust_user

        # 5. Partner Insurers (DEMO DATA)
        insurers_data = [
            ("HDFC Life Insurance Company Ltd", "HDFC_LIFE", "IRDAI/101", 99.30, "REST_API"),
            ("ICICI Prudential Life Insurance Company Ltd", "ICICI_PRU", "IRDAI/105", 98.60, "REST_API"),
            ("Max Life Insurance Company Ltd", "MAX_LIFE", "IRDAI/104", 99.51, "DEMO_FEED"),
            ("SBI Life Insurance Company Ltd", "SBI_LIFE", "IRDAI/111", 97.50, "DEMO_FEED"),
            ("Life Insurance Corporation of India (LIC)", "LIC_INDIA", "IRDAI/001", 98.50, "DEMO_FEED"),
            ("Tata AIA Life Insurance Company Ltd", "TATA_AIA", "IRDAI/110", 99.01, "REST_API"),
        ]

        insurer_objs = {}
        for name, code, reg_no, csr, int_type in insurers_data:
            ins = Insurer(
                organization_id=org.id,
                name=f"{name} [DEMO DATA]",
                code=code,
                irdai_registration_no=reg_no,
                claim_settlement_ratio=csr,
                integration_type=int_type,
                is_active=True,
                metadata_json={"label": "Fictional Demo Insurer Profile for Testing"},
            )
            db.add(ins)
            await db.flush()
            insurer_objs[code] = ins

        # 6. Products, Versions, Benefits, Exclusions
        products_data = [
            (
                "HDFC_LIFE",
                "HDFC-C2P-SUPER",
                "HDFC Life Click 2 Protect Super [DEMO DATA]",
                "TERM",
                "Customisable term life cover that adapts across life milestones.",
                "101N145V02",
                18, 65, 2500000, 1500,
                [
                    ("Terminal Illness Benefit", "Accelerates 100% sum assured on diagnosis of terminal illness.", False),
                    ("Smart Exit Option", "Allows exit and return of all premiums paid at specified retirement ages.", False),
                    ("Critical Illness Plus Rider", "Comprehensive payout across 36 specified critical illnesses.", True),
                    ("Accidental Death Benefit Rider", "Additional lump sum in case of accidental demise.", True),
                ],
                [
                    ("Suicide Exclusion", "Section 45 Clause 3", "Suicide within 12 months from policy inception results in 80% premium return."),
                    ("War and Hazardous Sports", "Clause 14b", "Demise while engaging in professional motor racing or aviation other than commercial passenger."),
                ]
            ),
            (
                "ICICI_PRU",
                "ICICI-IPROT-SMART",
                "ICICI Pru iProtect Smart [DEMO DATA]",
                "TERM",
                "Enhanced term plan with multi-stage critical illness protection.",
                "105N151V07",
                18, 65, 5000000, 1650,
                [
                    ("Accelerated Terminal Illness", "Immediate lump-sum up to Rs 2 Cr upon terminal diagnosis.", False),
                    ("Waiver of Premium on Disability", "All future premiums waived on accidental permanent disability.", False),
                    ("Multi-Pay CI Benefit", "Covers up to 34 critical illnesses with stage-based claims.", True),
                ],
                [
                    ("Pre-Existing Condition Moratorium", "IRDAI Section 45", "Non-disclosure of pre-existing cardiovascular or oncological conditions."),
                    ("Intoxication / Narcotics", "Exclusion 7a", "Claims arising directly from voluntary drug or severe alcohol abuse."),
                ]
            ),
            (
                "MAX_LIFE",
                "MAX-SECURE-PLUS",
                "Max Life Smart Secure Plus [DEMO DATA]",
                "TERM",
                "Comprehensive protection with premium break and voluntary top-up features.",
                "104N118V04",
                18, 65, 2500000, 1480,
                [
                    ("Inbuilt Terminal Illness Benefit", "100% early claim payout up to Rs 1 Crore.", False),
                    ("Special Exit Benefit", "Surrender policy and receive total premiums back at age 65.", False),
                    ("Joint Life Cover", "Covers both spouses under a single integrated policy schedule.", True),
                ],
                [
                    ("Suicide Limitation", "Clause 4.1", "Suicide within first policy year voiding full death claim."),
                ]
            ),
        ]

        version_objs = {}
        for ins_code, p_code, p_name, p_cat, p_tag, uin, min_a, max_a, min_sa, start_prem, benefits, exclusions in products_data:
            ins = insurer_objs[ins_code]
            prod = Product(
                organization_id=org.id,
                insurer_id=ins.id,
                code=p_code,
                name=p_name,
                category=p_cat,
                tagline=p_tag,
                is_active=True,
            )
            db.add(prod)
            await db.flush()

            ver = ProductVersion(
                organization_id=org.id,
                product_id=prod.id,
                version_tag="v3.1-2025",
                uin_number=uin,
                effective_from=date(2024, 1, 1),
                min_entry_age=min_a,
                max_entry_age=max_a,
                min_sum_assured=min_sa,
                starting_premium_monthly=start_prem,
                is_current=True,
                rate_table_json={"sample_rate_per_lakh_30y_ns": 185.0},
            )
            db.add(ver)
            await db.flush()
            version_objs[p_code] = ver

            for b_title, b_desc, is_r in benefits:
                db.add(ProductBenefit(
                    product_version_id=ver.id,
                    title=b_title,
                    description=b_desc,
                    is_rider=is_r,
                ))

            for ex_title, ex_ref, ex_det in exclusions:
                db.add(ProductExclusion(
                    product_version_id=ver.id,
                    title=ex_title,
                    clause_reference=ex_ref,
                    details=ex_det,
                ))
        await db.flush()

        # 7. Commission Schedules (IRDAI Compliant)
        for ins_code, ins in insurer_objs.items():
            db.add(CommissionSchedule(
                organization_id=org.id,
                insurer_id=ins.id,
                product_category="TERM",
                first_year_rate_pct=15.00,
                renewal_rate_pct=5.00,
                irdai_cap_rate_pct=20.00,
                effective_from=date(2024, 4, 1),
                is_active=True,
            ))
            db.add(CommissionSchedule(
                organization_id=org.id,
                insurer_id=ins.id,
                product_category="TROP",
                first_year_rate_pct=12.50,
                renewal_rate_pct=4.00,
                irdai_cap_rate_pct=20.00,
                effective_from=date(2024, 4, 1),
                is_active=True,
            ))
        await db.flush()

        # 8. Sample Customers
        c1 = Customer(
            organization_id=org.id,
            user_id=cust_user.id,
            full_name="Arjun Kapoor",
            email="arjun.kapoor@example.com",
            phone="+91-98200-44556",
            pan_number="ABCDE1234F",
            dob=date(1992, 6, 15),
            gender="Male",
            city="Mumbai",
            state="Maharashtra",
            annual_income=2800000.0,
            occupation="Software Architect",
            smoker_status=False,
            kyc_status="Verified",
            segment="Affluent Salaried",
        )
        c2 = Customer(
            organization_id=org.id,
            full_name="Neha Verma",
            email="neha.verma@example.com",
            phone="+91-98200-77889",
            pan_number="FGHIJ5678K",
            dob=date(1995, 3, 22),
            gender="Female",
            city="Pune",
            state="Maharashtra",
            annual_income=1800000.0,
            occupation="Financial Analyst",
            smoker_status=False,
            kyc_status="Verified",
            segment="Salaried Retail",
        )
        c3 = Customer(
            organization_id=org.id,
            full_name="Rajesh Iyer",
            email="rajesh.iyer@example.com",
            phone="+91-98200-99001",
            pan_number="KLMNO9012P",
            dob=date(1982, 11, 4),
            gender="Male",
            city="Bengaluru",
            state="Karnataka",
            annual_income=4500000.0,
            occupation="Business Owner",
            smoker_status=True,
            kyc_status="Pending",
            segment="High Net Worth Business",
        )
        db.add_all([c1, c2, c3])
        await db.flush()

        # Statutory Consents
        now_dt = datetime.now(timezone.utc)
        for c in [c1, c2, c3]:
            db.add(CustomerConsent(
                organization_id=org.id,
                customer_id=c.id,
                consent_type="broker_advisory_and_data_privacy",
                consented_at=now_dt,
                is_active=True,
            ))
        await db.flush()

        # 9. Customer Assessment for Arjun Kapoor
        db.add(CustomerAssessment(
            organization_id=org.id,
            customer_id=c1.id,
            annual_income=2800000.0,
            dependents_count=2,
            outstanding_liabilities=4000000.0,
            existing_cover=2500000.0,
            education_fund_target=2500000.0,
            calculated_hlv=25000000.0,
            coverage_gap=22500000.0,
            recommendation_notes="Customer requires Rs 2.25 Cr additional pure term life protection to cover mortgage and child education.",
        ))
        await db.flush()

        # 10. Leads
        agent_rahul = user_objs["rahul.sharma@fincore.in"]
        agent_priya = user_objs["priya.patel@fincore.in"]

        l1 = Lead(
            organization_id=org.id,
            lead_number="LD-1001",
            customer_id=c1.id,
            product_interest="Term Life Pure Risk Cover",
            target_insurer_id=insurer_objs["HDFC_LIFE"].id,
            desired_sum_assured=20000000.0,
            source="WEBSITE_ASSESSMENT",
            status="Quoting",
            assigned_user_id=agent_rahul.id,
            current_ml_score=88,
        )
        l2 = Lead(
            organization_id=org.id,
            lead_number="LD-1002",
            customer_id=c2.id,
            product_interest="Term with Critical Illness Rider",
            target_insurer_id=insurer_objs["ICICI_PRU"].id,
            desired_sum_assured=15000000.0,
            source="DIRECT",
            status="Contacted",
            assigned_user_id=agent_priya.id,
            current_ml_score=76,
        )
        l3 = Lead(
            organization_id=org.id,
            lead_number="LD-1003",
            customer_id=c3.id,
            product_interest="Keyman / Business Succession Term",
            desired_sum_assured=50000000.0,
            source="REFERRAL",
            status="New",
            assigned_user_id=None,
            current_ml_score=62,
        )
        db.add_all([l1, l2, l3])
        await db.flush()

        # Lead Assignments & Activities
        db.add(LeadAssignment(
            organization_id=org.id,
            lead_id=l1.id,
            assigned_to_user_id=agent_rahul.id,
            assigned_by_user_id=user_objs["vikram.mehta@fincore.in"].id,
            assignment_reason="Matched on high-ticket term portfolio expertise",
        ))
        db.add(LeadActivity(
            organization_id=org.id,
            lead_id=l1.id,
            user_id=agent_rahul.id,
            activity_type="CALL",
            title="Introductory Advisory Call",
            notes="Discussed HLV gap of 2.25 Cr. Client agreed to review HDFC vs ICICI comparison dossier.",
            occurred_at=now_dt - timedelta(days=2),
        ))
        await db.flush()

        # 11. Quote Dossier for Lead LD-1001
        quote = Quote(
            organization_id=org.id,
            quote_number="QT-501",
            lead_id=l1.id,
            created_by_user_id=agent_rahul.id,
            status="Sent to Client",
            valid_until=now_dt + timedelta(days=30),
            notes="Formal multi-insurer quotation comparing HDFC Life and ICICI Pru term plans.",
        )
        db.add(quote)
        await db.flush()

        qi1 = QuoteItem(
            quote_id=quote.id,
            insurer_id=insurer_objs["HDFC_LIFE"].id,
            product_version_id=version_objs["HDFC-C2P-SUPER"].id,
            sum_assured=20000000.0,
            policy_term_years=35,
            premium_payment_term_years=35,
            indicative_premium_monthly=1866.0,
            indicative_premium_annual=22400.0,
            is_demo_data=True,
            data_origin_tag="DEMO_RATE_CARD",
            is_selected_by_customer=True,
        )
        qi2 = QuoteItem(
            quote_id=quote.id,
            insurer_id=insurer_objs["ICICI_PRU"].id,
            product_version_id=version_objs["ICICI-IPROT-SMART"].id,
            sum_assured=20000000.0,
            policy_term_years=35,
            premium_payment_term_years=35,
            indicative_premium_monthly=1980.0,
            indicative_premium_annual=23760.0,
            is_demo_data=True,
            data_origin_tag="DEMO_RATE_CARD",
            is_selected_by_customer=False,
        )
        db.add_all([qi1, qi2])
        await db.flush()

        # 12. Applications
        app1 = Application(
            organization_id=org.id,
            application_number="APP-801",
            customer_id=c1.id,
            insurer_id=insurer_objs["HDFC_LIFE"].id,
            product_version_id=version_objs["HDFC-C2P-SUPER"].id,
            quote_item_id=qi1.id,
            external_insurer_proposal_no="HDFC-PROP-99102",
            sum_assured=20000000.0,
            annual_premium=22400.0,
            status="Underwriting Review",
            underwriting_notes="Income verification ITRs validated. Video medical scheduled.",
        )
        db.add(app1)
        await db.flush()

        db.add(ApplicationEvent(
            organization_id=org.id,
            application_id=app1.id,
            event_type="STATUS_CHANGE",
            from_status="Proposal Drafted",
            to_status="Underwriting Review",
            notes="Transferred to carrier underwriting queue.",
            actor_user_id=agent_rahul.id,
        ))

        # Application 2: Policy Issued for Neha Verma
        app2 = Application(
            organization_id=org.id,
            application_number="APP-802",
            customer_id=c2.id,
            insurer_id=insurer_objs["ICICI_PRU"].id,
            product_version_id=version_objs["ICICI-IPROT-SMART"].id,
            external_insurer_proposal_no="ICICI-PROP-44211",
            policy_number="POL-ICICI-99210",
            sum_assured=15000000.0,
            annual_premium=16800.0,
            status="Policy Issued",
            underwriting_notes="Standard medical terms accepted. First year premium cleared.",
        )
        db.add(app2)
        await db.flush()

        db.add(ApplicationEvent(
            organization_id=org.id,
            application_id=app2.id,
            event_type="STATUS_CHANGE",
            from_status="Underwriting Review",
            to_status="Policy Issued",
            notes="Carrier issued policy bond.",
            actor_user_id=agent_priya.id,
        ))

        # Commission Accrual for Issued Policy
        db.add(CommissionAccrual(
            organization_id=org.id,
            application_id=app2.id,
            insurer_id=insurer_objs["ICICI_PRU"].id,
            gross_premium_collected=16800.0,
            commission_rate_applied_pct=15.0,
            accrued_commission_amount=2520.0,
            status="Accrued",
        ))

        # 13. Tasks
        db.add(Task(
            organization_id=org.id,
            lead_id=l1.id,
            assigned_to_user_id=agent_rahul.id,
            title="Coordinate Video Tele-Medical for Arjun Kapoor",
            description="Liaise with HDFC diagnostic provider for 30-min tele-interview slot.",
            priority="Urgent",
            status="Pending",
            due_date=now_dt + timedelta(days=1),
        ))
        db.add(Task(
            organization_id=org.id,
            lead_id=l2.id,
            assigned_to_user_id=agent_priya.id,
            title="Deliver Policy Bond to Neha Verma",
            description="Send encrypted digital policy kit and explain 30-day free look period.",
            priority="Medium",
            status="Completed",
            due_date=now_dt - timedelta(days=1),
            completed_at=now_dt,
        ))

        # 14. Document Metadata
        doc1 = Document(
            organization_id=org.id,
            doc_number="DOC-101",
            file_name="pan_card_arjun_kapoor.pdf",
            storage_path="fincore-vault/cust_101/pan_card.pdf",
            mime_type="application/pdf",
            file_size_bytes=452100,
            doc_type="KYC_PAN",
            verification_status="Verified",
            verified_by_user_id=user_objs["anita.deshmukh@fincore.in"].id,
        )
        db.add(doc1)
        await db.flush()

        db.add(DocumentLink(
            document_id=doc1.id,
            entity_type="customer",
            entity_id=c1.id,
        ))

        # 15. Initial Audit Log
        db.add(AuditLog(
            organization_id=org.id,
            actor_user_id=user_objs["admin@fincore.in"].id,
            actor_email="admin@fincore.in",
            action="SYSTEM_INITIALIZATION",
            entity_name="Organization",
            entity_id=str(org.id),
            changes_json={"brokerage": org.name, "seeded_at": now_dt.isoformat()},
        ))

        await db.commit()
        print("[FINCORE] Database successfully seeded with 30-model schema and demo insurance data.")


if __name__ == "__main__":
    asyncio.run(init_db())
