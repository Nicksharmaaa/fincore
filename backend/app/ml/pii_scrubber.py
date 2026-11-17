import re
from typing import Any, Dict


class PIIScrubber:
    """Sanitizes sensitive personal data (PAN, Aadhaar, Phone, Email, Address)

    before sending prompts or features to external AI/ML services.
    Enforces compliance with Digital Personal Data Protection Act (DPDP) 2023.
    """

    # RegEx Patterns for Indian Financial & Identity Identifiers
    PAN_PATTERN = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", re.IGNORECASE)
    AADHAAR_PATTERN = re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b")
    # Matches +91 98200 12345, +91-98200-12345, 9820012345, 98200 12345
    PHONE_PATTERN = re.compile(r"(\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b|(\+91[\-\s]?)?[6-9]\d{9}\b")
    EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")

    @classmethod
    def scrub_text(cls, text: str) -> str:
        """Replace PII instances with deterministic masked tokens."""
        if not text:
            return ""

        scrubbed = cls.PAN_PATTERN.sub("[PAN_REDACTED]", text)
        scrubbed = cls.AADHAAR_PATTERN.sub("[AADHAAR_REDACTED]", scrubbed)
        scrubbed = cls.PHONE_PATTERN.sub("[PHONE_REDACTED]", scrubbed)
        scrubbed = cls.EMAIL_PATTERN.sub("[EMAIL_REDACTED]", scrubbed)
        return scrubbed

    @classmethod
    def sanitize_customer_profile(cls, customer_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Strip or mask direct identifiers from customer profile dictionary."""
        sanitized = dict(customer_dict)

        # Remove direct identification fields
        for field in ["pan_number", "phone", "email", "address_line", "pincode"]:
            if field in sanitized:
                sanitized[field] = "[REDACTED_FOR_PRIVACY]"

        # Mask full name to initials only (e.g. "Arjun Kapoor" -> "A. K.")
        if "full_name" in sanitized and sanitized["full_name"]:
            parts = sanitized["full_name"].strip().split()
            if len(parts) >= 2:
                sanitized["full_name"] = f"{parts[0][0]}. {parts[-1][0]}."
            elif len(parts) == 1:
                sanitized["full_name"] = f"{parts[0][0]}."

        return sanitized
