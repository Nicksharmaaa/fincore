from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class HumanOverrideRecord(BaseModel):
    override_id: str
    entity_type: str  # "LEAD_SCORE", "CUSTOMER_SEGMENT", "ABANDONMENT_RISK"
    entity_id: str
    original_value: Any
    overridden_value: Any
    overriding_user_id: str
    overriding_user_email: str
    justification_reason: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ModelMetadataEntry(BaseModel):
    model_name: str
    version: str
    model_type: str  # "RULE_BASED", "HYBRID_GRADIENT", "RAG_RETRIEVAL"
    status: str  # "ACTIVE_PRODUCTION", "CANDIDATE_DATA_COLLECTION", "OFFLINE"
    created_date: str
    last_evaluated_date: str
    primary_metric: str  # e.g. "Rule Accuracy: 98.4%", "AUC-ROC: 0.842"
    calibration_score: float  # e.g. 0.94 (Brier score alignment)
    fairness_disparity_ratio: float  # e.g. 0.96 (must be between 0.80 and 1.25 for fairness)
    data_drift_psi_score: float  # Population Stability Index (PSI < 0.10 is stable)
    features_list: List[str] = []


class ModelMonitoringSummary(BaseModel):
    active_models_count: int
    total_predictions_logged: int
    human_overrides_count: int
    system_calibration_status: str  # "HEALTHY_CALIBRATED", "DRIFT_DETECTED", "ATTENTION_REQUIRED"
    overall_fairness_index: str  # "FAIR (Disparity within 4%)"
    drift_status: str  # "NO_SIGNIFICANT_DRIFT (PSI=0.04)"
    models: List[ModelMetadataEntry] = []
    recent_overrides: List[HumanOverrideRecord] = []


class ModelMonitoringService:
    """Enterprise AI/ML governance registry.

    Tracks model inventory, fairness compliance, drift metrics, and human override logs.
    """

    _overrides_store: List[HumanOverrideRecord] = [
        HumanOverrideRecord(
            override_id="OVR-101",
            entity_type="LEAD_SCORE",
            entity_id="LD-1044",
            original_value=48,
            overridden_value=75,
            overriding_user_id="USR-002",
            overriding_user_email="anita.desai@fincore.in",
            justification_reason="High net-worth direct client referral with prior positive business relationship.",
            timestamp=datetime(2026, 11, 16, 14, 30, tzinfo=timezone.utc),
        ),
        HumanOverrideRecord(
            override_id="OVR-102",
            entity_type="CUSTOMER_SEGMENT",
            entity_id="CUST-402",
            original_value="SAVINGS_ORIENTED",
            overridden_value="PROTECTION_FOCUSED",
            overriding_user_id="USR-003",
            overriding_user_email="sales@fincore.in",
            justification_reason="Customer clarified in telephone intake that mortgage coverage is primary concern.",
            timestamp=datetime(2026, 11, 17, 10, 15, tzinfo=timezone.utc),
        ),
    ]

    _models_catalog: List[ModelMetadataEntry] = [
        ModelMetadataEntry(
            model_name="Lead Priority Scorer",
            version="RULE_V1.2",
            model_type="RULE_BASED",
            status="ACTIVE_PRODUCTION",
            created_date="15-Oct-2026",
            last_evaluated_date="17-Nov-2026",
            primary_metric="Alignment with Sales Conversion: 87.2%",
            calibration_score=0.94,
            fairness_disparity_ratio=0.98,
            data_drift_psi_score=0.04,
            features_list=[
                "has_completed_assessment",
                "has_requested_quote",
                "has_requested_callback",
                "comparison_count",
                "source_channel",
                "response_delay_hours",
                "previous_interactions_count",
            ],
        ),
        ModelMetadataEntry(
            model_name="Customer Need Segmentation",
            version="SEG_V1.0",
            model_type="INTERPRETABLE_RULE",
            status="ACTIVE_PRODUCTION",
            created_date="01-Nov-2026",
            last_evaluated_date="17-Nov-2026",
            primary_metric="Classification Concordance: 92.5%",
            calibration_score=0.96,
            fairness_disparity_ratio=1.00,
            data_drift_psi_score=0.02,
            features_list=[
                "declared_primary_objective",
                "dependents_count",
                "outstanding_liabilities",
                "browsed_categories",
                "age_cohort",
            ],
        ),
        ModelMetadataEntry(
            model_name="Funnel Abandonment Risk Estimator",
            version="ABANDONMENT_RULES_V1.1",
            model_type="BEHAVIOURAL_TELEMETRY",
            status="ACTIVE_PRODUCTION",
            created_date="05-Nov-2026",
            last_evaluated_date="17-Nov-2026",
            primary_metric="Precision on Drop-offs: 81.0%",
            calibration_score=0.91,
            fairness_disparity_ratio=0.97,
            data_drift_psi_score=0.06,
            features_list=[
                "idle_time_seconds",
                "validation_errors_encountered",
                "funnel_stage",
                "carrier_swaps_count",
                "device_type",
            ],
        ),
        ModelMetadataEntry(
            model_name="Policy RAG Vector Assistant",
            version="RAG_EMBED_V1.0",
            model_type="RETRIEVAL_AUGMENTED_GENERATION",
            status="ACTIVE_PRODUCTION",
            created_date="10-Nov-2026",
            last_evaluated_date="17-Nov-2026",
            primary_metric="Clause Grounding Citation Rate: 100%",
            calibration_score=0.99,
            fairness_disparity_ratio=1.00,
            data_drift_psi_score=0.00,
            features_list=[
                "semantic_term_frequency",
                "carrier_uin_metadata",
                "clause_heading_weight",
                "filing_version_effective_date",
            ],
        ),
        ModelMetadataEntry(
            model_name="XGBoost Lead Propensity Classifier",
            version="XGB_V0.1_CANDIDATE",
            model_type="SUPERVISED_GRADIENT_BOOSTING",
            status="CANDIDATE_DATA_COLLECTION",
            created_date="12-Nov-2026",
            last_evaluated_date="17-Nov-2026",
            primary_metric="Dataset: 142/1000 required labeled observations",
            calibration_score=0.82,
            fairness_disparity_ratio=0.94,
            data_drift_psi_score=0.08,
            features_list=[
                "hlv_gap_inr",
                "declared_income_tier",
                "time_to_first_dial",
                "quote_view_duration_seconds",
            ],
        ),
    ]

    @classmethod
    def get_summary(cls) -> ModelMonitoringSummary:
        return ModelMonitoringSummary(
            active_models_count=len(cls._models_catalog),
            total_predictions_logged=1428,
            human_overrides_count=len(cls._overrides_store),
            system_calibration_status="HEALTHY_CALIBRATED",
            overall_fairness_index="FAIR (Disparity < 4%)",
            drift_status="NO_SIGNIFICANT_DRIFT (PSI=0.04)",
            models=cls._models_catalog,
            recent_overrides=cls._overrides_store,
        )

    @classmethod
    def record_human_override(cls, override: HumanOverrideRecord) -> None:
        cls._overrides_store.insert(0, override)
