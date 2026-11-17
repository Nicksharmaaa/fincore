import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_insurers_catalog(client: AsyncClient, sales_token: str):
    """Test retrieving authorized partner insurers with mandatory demo labels."""
    res = await client.get(
        "/api/v1/insurers",
        headers={"Authorization": f"Bearer {sales_token}"},
    )
    assert res.status_code == 200
    insurers = res.json()
    assert len(insurers) >= 6
    names = [ins["name"] for ins in insurers]
    # Verify demo data labeling
    assert any("HDFC Life" in name and "[DEMO DATA]" in name for name in names)
    assert any("ICICI Prudential" in name and "[DEMO DATA]" in name for name in names)


@pytest.mark.asyncio
async def test_products_catalog(client: AsyncClient, sales_token: str):
    """Test retrieving products with version, UIN, benefits and exclusions."""
    res = await client.get(
        "/api/v1/products?category=TERM",
        headers={"Authorization": f"Bearer {sales_token}"},
    )
    assert res.status_code == 200
    products = res.json()
    assert len(products) >= 3
    first_prod = products[0]
    assert len(first_prod["versions"]) > 0
    assert "uin_number" in first_prod["versions"][0]
    assert len(first_prod["versions"][0]["benefits"]) > 0


@pytest.mark.asyncio
async def test_customer_creation_and_deduplication(client: AsyncClient, sales_token: str):
    """Test creating a customer and verify duplicate emails return existing record."""
    rand_id = uuid.uuid4().hex[:5].upper()
    unique_email = f"test_{rand_id.lower()}@example.com"
    unique_pan = f"ABC{rand_id}Z"
    payload = {
        "full_name": "Kavita Nair",
        "email": unique_email,
        "phone": "+91-98765-43210",
        "pan_number": unique_pan,
        "city": "Chennai",
        "state": "Tamil Nadu",
        "annual_income": 2200000.0,
        "occupation": "Product Manager",
        "smoker_status": False,
        "segment": "Salaried Retail",
    }

    # 1. First creation
    res1 = await client.post(
        "/api/v1/customers",
        json=payload,
        headers={"Authorization": f"Bearer {sales_token}"},
    )
    assert res1.status_code == 201
    cust1 = res1.json()
    assert cust1["email"] == unique_email
    assert cust1["pan_number"] == unique_pan

    # 2. Second creation with identical email (deduplication)
    res2 = await client.post(
        "/api/v1/customers",
        json=payload,
        headers={"Authorization": f"Bearer {sales_token}"},
    )
    # Deduplication should return 409 Conflict with existing customer detail
    assert res2.status_code == 409


@pytest.mark.asyncio
async def test_needs_assessment_calculation(client: AsyncClient, sales_token: str):
    """Test Human Life Value (HLV) and coverage gap computation."""
    # First get a customer
    cust_res = await client.get(
        "/api/v1/customers",
        headers={"Authorization": f"Bearer {sales_token}"},
    )
    customers = cust_res.json()
    customer_id = customers[0]["id"]

    assessment_payload = {
        "customer_id": customer_id,
        "annual_income": 2400000.0,
        "dependents_count": 2,
        "outstanding_liabilities": 3500000.0,
        "existing_cover": 2000000.0,
        "education_fund_target": 2000000.0,
    }

    res = await client.post(
        "/api/v1/assessments",
        json=assessment_payload,
        headers={"Authorization": f"Bearer {sales_token}"},
    )
    assert res.status_code == 201
    data = res.json()
    # Income 24L * 10x multiplier = 2.4 Cr base + 35L liabilities + 20L education = 2.95 Cr HLV
    # Coverage gap = 2.95 Cr - 20L existing cover = 2.75 Cr
    assert data["calculated_hlv"] > 0
    assert data["coverage_gap"] > 0
    assert "recommendation_notes" in data


@pytest.mark.asyncio
async def test_lead_lifecycle(client: AsyncClient, sales_token: str):
    """Test creating, fetching, and updating a CRM lead."""
    cust_res = await client.get(
        "/api/v1/customers",
        headers={"Authorization": f"Bearer {sales_token}"},
    )
    customer_id = cust_res.json()[0]["id"]

    lead_payload = {
        "customer_id": customer_id,
        "product_interest": "Pure Term Life Cover 1 Cr",
        "desired_sum_assured": 10000000.0,
        "source": "WEBSITE_ASSESSMENT",
    }

    create_res = await client.post(
        "/api/v1/leads",
        json=lead_payload,
        headers={"Authorization": f"Bearer {sales_token}"},
    )
    assert create_res.status_code == 201
    lead = create_res.json()
    lead_id = lead["id"]
    assert lead["status"] == "New"
    assert lead["lead_number"].startswith("LD-")

    # Update status to Contacted
    patch_res = await client.patch(
        f"/api/v1/leads/{lead_id}",
        json={"status": "Contacted"},
        headers={"Authorization": f"Bearer {sales_token}"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Contacted"

    # Add activity note
    act_res = await client.post(
        f"/api/v1/leads/{lead_id}/activities",
        json={
            "activity_type": "CALL",
            "title": "Initial discovery call",
            "notes": "Discussed term requirements and smoking history.",
        },
        headers={"Authorization": f"Bearer {sales_token}"},
    )
    assert act_res.status_code == 201
    assert act_res.json()["title"] == "Initial discovery call"


@pytest.mark.asyncio
async def test_quote_comparison_dossier(client: AsyncClient, sales_token: str):
    """Test retrieving quotation dossiers with multi-insurer alternatives."""
    res = await client.get(
        "/api/v1/quotes",
        headers={"Authorization": f"Bearer {sales_token}"},
    )
    assert res.status_code == 200
    quotes = res.json()
    assert len(quotes) > 0
    q = quotes[0]
    assert len(q["items"]) >= 2
    for item in q["items"]:
        assert item["is_demo_data"] is True
        assert item["indicative_premium_annual"] > 0


@pytest.mark.asyncio
async def test_application_lifecycle_and_commission_accrual(client: AsyncClient, sales_token: str):
    """Test updating application status to Policy Issued and verify commission accrual."""
    # List applications
    apps_res = await client.get(
        "/api/v1/applications",
        headers={"Authorization": f"Bearer {sales_token}"},
    )
    assert apps_res.status_code == 200
    apps = apps_res.json()
    assert len(apps) > 0

    # Pick an application not yet issued
    draft_app = next((a for a in apps if a["status"] != "Policy Issued"), apps[0])
    app_id = draft_app["id"]

    # Transition to Policy Issued
    update_res = await client.patch(
        f"/api/v1/applications/{app_id}",
        json={
            "status": "Policy Issued",
            "policy_number": f"POL-TEST-{uuid.uuid4().hex[:6].upper()}",
            "underwriting_notes": "Carrier approval received and premium acknowledged.",
        },
        headers={"Authorization": f"Bearer {sales_token}"},
    )
    assert update_res.status_code == 200
    updated_app = update_res.json()
    assert updated_app["status"] == "Policy Issued"
    assert updated_app["policy_number"] is not None

    # Check commission accruals
    comm_res = await client.get(
        "/api/v1/commissions/accruals",
        headers={"Authorization": f"Bearer {sales_token}"},
    )
    assert comm_res.status_code == 200
    accruals = comm_res.json()
    assert len(accruals) > 0
    assert any(str(a["application_id"]) == str(app_id) for a in accruals)


@pytest.mark.asyncio
async def test_public_assessment_calculation(client: AsyncClient):
    """Test public educational coverage gap calculation engine without authentication."""
    calc_payload = {
        "annual_income": 1800000.0,
        "dependents_count": 2,
        "outstanding_liabilities": 2500000.0,
        "existing_cover": 1500000.0,
        "education_fund_target": 2000000.0,
        "occupation": "Software Architect",
        "is_smoker": False,
        "preferred_coverage_age": 75,
    }
    res = await client.post("/api/v1/assessments/calculate", json=calc_payload)
    assert res.status_code == 200
    data = res.json()
    # Income 18L * 12 = 2.16 Cr
    # Liabilities = 25L
    # Education = 20L * 2 = 40L
    # Total HLV = 2.16 Cr + 25L + 40L = 2.81 Cr
    # Existing Cover = 15L
    # Shortfall = 2.81 Cr - 15L = 2.66 Cr
    assert data["income_protection_needed"] == 21600000.0
    assert data["liabilities_protection"] == 2500000.0
    assert data["family_goals_protection"] == 4000000.0
    assert data["calculated_hlv"] == 28100000.0
    assert data["coverage_gap"] == 26600000.0
    assert "educational estimate" in data["disclaimer"].lower()


@pytest.mark.asyncio
async def test_public_customer_enquiry_and_auto_assignment(client: AsyncClient):
    """Test customer submitting an enquiry: creates customer, consent, lead, assignment, and employee notification."""
    enquiry_payload = {
        "customer_name": "Vikram Sethi",
        "customer_email": "vikram.sethi@example.com",
        "customer_phone": "+91-98200-99999",
        "city": "Bengaluru",
        "enquiry_type": "ASSESSMENT_SUBMISSION",
        "product_interest": "Term Life Insurance 1 Cr",
        "desired_sum_assured": 25000000.0,
        "message": "Need pure term insurance to cover home loan.",
        "consent_given": True,
        "lead_source": "WEBSITE_ASSESSMENT",
        "assessment_data": {
            "age": 34,
            "annual_income": 2000000.0,
            "dependents_count": 2,
            "outstanding_liabilities": 5000000.0,
            "existing_cover": 2000000.0,
            "education_fund_target": 2500000.0,
            "occupation": "Salaried Corporate",
            "is_smoker": False,
        },
    }

    res = await client.post("/api/v1/leads/enquiry", json=enquiry_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "success"
    assert data["lead_number"].startswith("LD-")
    assert data["lead_id"] is not None
    assert data["customer_id"] is not None
    assert data["assessment_id"] is not None
    assert data["assigned_advisor"]["name"] is not None
    assert data["calculated_gap"] > 0

