"""
Deterministic Priority Scoring Engine
=====================================
Calculates an objective, composite priority score (0-100) from structured
impact factors extracted by the Societal Innovation Problem Analyzer.

Formula:
- Severity (25%)
- Urgency (20%)
- Population Impact (20%)
- Geographic Scope (15%)
- Recurrence (10%)
- Innovation / Research Potential (10%)
"""

from typing import Dict, Any


def calculate_priority_score(priority_factors: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes deterministic priority score and priority band.
    """
    sev = float(priority_factors.get("severity", 5))
    urg = float(priority_factors.get("urgency", 5))
    pop = float(priority_factors.get("populationImpact", 3))
    geo = float(priority_factors.get("geographicImpact", 3))
    rec = float(priority_factors.get("recurrence", 3))
    inn = float(priority_factors.get("innovationPotential", 5))

    # Clamp all inputs to 0-10
    sev = max(0.0, min(10.0, sev))
    urg = max(0.0, min(10.0, urg))
    pop = max(0.0, min(10.0, pop))
    geo = max(0.0, min(10.0, geo))
    rec = max(0.0, min(10.0, rec))
    inn = max(0.0, min(10.0, inn))

    # Weighted composite score (0 - 100)
    composite_score = round(
        (sev * 2.5) +
        (urg * 2.0) +
        (pop * 2.0) +
        (geo * 1.5) +
        (rec * 1.0) +
        (inn * 1.0),
        1
    )

    if composite_score >= 80.0:
        band = "CRITICAL"
        sla_hours = 24
        action = "Immediate emergency response and priority research taskforce deployment."
    elif composite_score >= 60.0:
        band = "HIGH"
        sla_hours = 72
        action = "High-priority institutional routing and municipal coordination."
    elif composite_score >= 40.0:
        band = "MEDIUM"
        sla_hours = 168
        action = "Standard civic grievance workflow and collaborative innovation queue."
    else:
        band = "LOW"
        sla_hours = 360
        action = "Routine backlog processing and scheduled review."

    return {
        "compositeScore": composite_score,
        "priorityBand": band,
        "targetSLA_Hours": sla_hours,
        "recommendedAction": action,
        "factorBreakdown": {
            "severityContribution": round(sev * 2.5, 1),
            "urgencyContribution": round(urg * 2.0, 1),
            "populationContribution": round(pop * 2.0, 1),
            "geographicContribution": round(geo * 1.5, 1),
            "recurrenceContribution": round(rec * 1.0, 1),
            "innovationContribution": round(inn * 1.0, 1)
        }
    }


if __name__ == "__main__":
    sample_factors = {
        "severity": 8,
        "urgency": 9,
        "populationImpact": 7,
        "geographicImpact": 6,
        "recurrence": 8,
        "innovationPotential": 7
    }
    result = calculate_priority_score(sample_factors)
    import json
    print(json.dumps(result, indent=2))
