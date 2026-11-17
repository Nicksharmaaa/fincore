from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AbandonmentSessionInput(BaseModel):
    session_id: Optional[str] = None
    customer_id: Optional[str] = None
    lead_id: Optional[str] = None
    current_funnel_stage: str
    # "ASSESSMENT_STEP_1", "ASSESSMENT_STEP_4", "ASSESSMENT_REVIEW", "QUOTE_COMPARISON", "PROPOSAL_DRAFT"
    completed_steps_count: int = 0
    total_steps_count: int = 8
    idle_time_seconds: int = 0
    fields_modified_count: int = 0
    validation_errors_encountered: int = 0
    carrier_swaps_count: int = 0
    device_type: str = "DESKTOP"  # DESKTOP, MOBILE, TABLET


class AbandonmentRiskResult(BaseModel):
    session_id: Optional[str] = None
    customer_id: Optional[str] = None
    risk_tier: str  # "HIGH", "MEDIUM", "LOW"
    abandonment_probability: float = Field(..., ge=0.0, le=1.0)
    primary_risk_stage: str
    identified_friction_points: List[str] = []
    recommended_recovery_action: str
    action_priority: str  # "IMMEDIATE", "HOURLY_NURTURE", "STANDARD"
    predicted_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_trained_ml: bool = False
    model_version: str = "ABANDONMENT_RULES_V1.1"
    metadata: Dict[str, Any] = {}


class AbandonmentPredictionEngine:
    """Predicts user drop-off risk during needs assessments and proposal drafting.

    Uses consented behavioural telemetry events to trigger advisor follow-ups or UI nudges.
    """

    @classmethod
    def evaluate_risk(cls, session: AbandonmentSessionInput) -> AbandonmentRiskResult:
        frictions: List[str] = []
        risk_score = 0.0

        # 1. Idle Time on Screen
        if session.idle_time_seconds > 600:  # > 10 mins
            risk_score += 0.40
            frictions.append(f"Extended session inactivity ({session.idle_time_seconds // 60} mins idle).")
        elif session.idle_time_seconds > 180:  # > 3 mins
            risk_score += 0.20
            frictions.append("Session paused for more than 3 minutes.")

        # 2. Validation Errors Encountered (Friction)
        if session.validation_errors_encountered >= 3:
            risk_score += 0.30
            frictions.append(f"Multiple form validation errors ({session.validation_errors_encountered} attempts).")
        elif session.validation_errors_encountered >= 1:
            risk_score += 0.10
            frictions.append("Encountered input validation hurdle.")

        # 3. Funnel Drop-off Hotspots
        stage = session.current_funnel_stage.upper()
        if "STEP_5" in stage or "LIABILITIES" in stage:
            risk_score += 0.15
            frictions.append("Stalled on financial liabilities disclosure step.")
        elif "STEP_7" in stage or "BUDGET" in stage:
            risk_score += 0.15
            frictions.append("Stalled on premium duration and budget preferences.")
        elif "QUOTE_COMPARISON" in stage and session.carrier_swaps_count > 5:
            risk_score += 0.25
            frictions.append(f"Decision fatigue: toggled {session.carrier_swaps_count} carrier comparisons without quote request.")

        # 4. Device Context (Mobile drop-off higher for complex forms)
        if session.device_type.upper() == "MOBILE" and session.completed_steps_count < 4:
            risk_score += 0.10
            frictions.append("Mobile device drop-off friction on multi-step financial form.")

        # Clamp probability [0.0, 1.0]
        prob = round(min(1.0, max(0.05, risk_score)), 2)

        # Categorize tier & recovery action
        if prob >= 0.60:
            tier = "HIGH"
            priority = "IMMEDIATE"
            recovery = (
                "Trigger automated advisor task: Dispatch priority WhatsApp assistance offer "
                "or phone callback within 15 minutes offering step-by-step guidance."
            )
        elif prob >= 0.35:
            tier = "MEDIUM"
            priority = "HOURLY_NURTURE"
            recovery = (
                "Save assessment progress draft to local storage & dispatch email reminder with "
                "one-click resumption link within 2 hours."
            )
        else:
            tier = "LOW"
            priority = "STANDARD"
            recovery = "Normal progression observed. No immediate recovery intervention required."

        return AbandonmentRiskResult(
            session_id=session.session_id,
            customer_id=session.customer_id,
            risk_tier=tier,
            abandonment_probability=prob,
            primary_risk_stage=session.current_funnel_stage,
            identified_friction_points=frictions,
            recommended_recovery_action=recovery,
            action_priority=priority,
            is_trained_ml=False,
            model_version="ABANDONMENT_RULES_V1.1",
            metadata={"friction_count": len(frictions)},
        )
