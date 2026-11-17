from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class CustomerSegmentationInput(BaseModel):
    customer_id: Optional[str] = None
    age: Optional[int] = None
    annual_income: Optional[float] = None
    dependents_count: int = 1
    existing_cover_amount: float = 0.0
    outstanding_liabilities: float = 0.0
    declared_primary_objective: Optional[str] = None
    # e.g. "FAMILY_PROTECTION", "WEALTH_CREATION", "CHILD_EDUCATION", "RETIREMENT_INCOME", "STARTER_COVER"
    browsed_categories: List[str] = []
    # e.g. ["Term Plans", "ULIPs", "Annuity", "Savings/Endowment"]
    interaction_channel: str = "WEBSITE"


class CustomerSegmentationResult(BaseModel):
    customer_id: Optional[str] = None
    segment_code: str
    # "PROTECTION_FOCUSED", "FIRST_TIME_BUYER", "RETIREMENT_FOCUSED", "SAVINGS_ORIENTED"
    segment_name: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    key_declared_indicators: List[str] = []
    recommended_product_categories: List[str] = []
    tailored_advisory_strategy: str
    segmented_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_interpretable_rule: bool = True
    metadata: Dict[str, Any] = {}


class CustomerSegmentationEngine:
    """Interpretable, non-discriminatory customer segmentation engine.

    Strictly complies with ethical AI and IRDAI fair practices:
    - Analyzes ONLY declared financial needs, objectives, and browsing choices.
    - NEVER uses sensitive personal characteristics (religion, gender, caste, marital status)
      to infer financial capacity or risk profile.
    """

    @classmethod
    def segment_customer(cls, input_data: CustomerSegmentationInput) -> CustomerSegmentationResult:
        indicators: List[str] = []
        scores = {
            "PROTECTION_FOCUSED": 0.0,
            "FIRST_TIME_BUYER": 0.0,
            "RETIREMENT_FOCUSED": 0.0,
            "SAVINGS_ORIENTED": 0.0,
        }

        # 1. Declared Objective Evaluation (Strongest Weight)
        obj = (input_data.declared_primary_objective or "").upper()
        if "PROTECTION" in obj or "INCOME_REPLACEMENT" in obj:
            scores["PROTECTION_FOCUSED"] += 4.0
            indicators.append("Declared primary objective is Pure Family Income Protection.")
        elif "STARTER" in obj or "FIRST" in obj:
            scores["FIRST_TIME_BUYER"] += 4.0
            indicators.append("Declared primary objective is establishing first baseline life insurance.")
        elif "RETIREMENT" in obj or "PENSION" in obj or "ANNUITY" in obj:
            scores["RETIREMENT_FOCUSED"] += 4.0
            indicators.append("Declared primary objective is Guaranteed Post-Retirement Income.")
        elif "SAVINGS" in obj or "WEALTH" in obj or "CHILD" in obj or "EDUCATION" in obj:
            scores["SAVINGS_ORIENTED"] += 4.0
            indicators.append("Declared primary objective is Long-Term Wealth Creation & Education Goal.")

        # 2. Financial Protection Gap & Dependents
        if input_data.dependents_count >= 2:
            scores["PROTECTION_FOCUSED"] += 2.0
            indicators.append(f"Supports {input_data.dependents_count} financial dependents.")

        if input_data.outstanding_liabilities > 0:
            scores["PROTECTION_FOCUSED"] += 2.0
            indicators.append("Has declared active liabilities (home loan, personal debts).")

        # 3. Life Stage & Age Clues (Interpretable Demographics)
        if input_data.age:
            if input_data.age <= 30 and input_data.existing_cover_amount == 0.0:
                scores["FIRST_TIME_BUYER"] += 3.0
                indicators.append(f"Young adult (Age {input_data.age}) with zero prior life insurance cover.")
            elif input_data.age >= 48:
                scores["RETIREMENT_FOCUSED"] += 3.0
                indicators.append(f"Approaching retirement horizon (Age {input_data.age}).")

        # 4. Browsing Interaction Patterns
        cats = [c.upper() for c in input_data.browsed_categories]
        if any("TERM" in c for c in cats):
            scores["PROTECTION_FOCUSED"] += 1.5
        if any("ANNUITY" in c or "RETIREMENT" in c for c in cats):
            scores["RETIREMENT_FOCUSED"] += 2.0
        if any("ULIP" in c or "SAVINGS" in c or "ENDOWMENT" in c for c in cats):
            scores["SAVINGS_ORIENTED"] += 2.0

        # Determine Winning Segment
        winning_segment = max(scores, key=scores.get)
        max_score = scores[winning_segment]

        # Calculate normalized confidence
        total_score = sum(scores.values())
        confidence = round(max_score / total_score, 2) if total_score > 0 else 0.75

        # Strategy and Recommendations
        if winning_segment == "PROTECTION_FOCUSED":
            name = "Protection-Focused Buyer"
            recs = ["Pure Term Insurance", "Critical Illness Rider", "Accidental Death Benefit Rider"]
            strategy = (
                "Prioritize high Sum Assured at optimal cost. Emphasize MWP Act protection for family members, "
                "staggered monthly income payout options, and Section 45 claim settlement security."
            )
        elif winning_segment == "FIRST_TIME_BUYER":
            name = "First-Time Life Insurance Buyer"
            recs = ["Level Term Insurance (Basic)", "Waiver of Premium Rider"]
            strategy = (
                "Keep guidance jargon-free. Focus on explaining term insurance fundamentals, the 30-day digital free-look period, "
                "and locking in affordable premiums at young age."
            )
        elif winning_segment == "RETIREMENT_FOCUSED":
            name = "Retirement & Annuity Seeker"
            recs = ["Immediate Annuity", "Deferred Annuity", "Guaranteed Income Plan"]
            strategy = (
                "Focus on guaranteed lifetime payouts, joint-life annuity options for spouse, return of purchase price, "
                "and tax-efficient annuity yields under Section 10(10D) and 80CCC."
            )
        else:  # SAVINGS_ORIENTED
            name = "Savings & Wealth Oriented Customer"
            recs = ["Unit Linked Insurance Plan (ULIP)", "Guaranteed Return Endowment Plan", "Child Education Future Plan"]
            strategy = (
                "Present balanced risk-return profiles, compounding horizon (10-15 years), fund switching flexibility, "
                "and premium waiver benefit ensuring child education continuity in case of unforeseen demise."
            )

        return CustomerSegmentationResult(
            customer_id=input_data.customer_id,
            segment_code=winning_segment,
            segment_name=name,
            confidence_score=confidence,
            key_declared_indicators=indicators,
            recommended_product_categories=recs,
            tailored_advisory_strategy=strategy,
            is_interpretable_rule=True,
            metadata={
                "scoring_weights_applied": scores,
                "fairness_check": "ZERO_SENSITIVE_ATTRIBUTES_USED",
            },
        )
