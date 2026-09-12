"""
Deterministic University Matching Engine
========================================
Consumes the structured JSON output from SocietalProblemAnalyzer and matches
requirements against the 25-university database (15 Jharkhand HEIs + 10 National HEIs).

Matching Criteria:
1. Domain Alignment (35%)
2. Research Area Match (25%)
3. Skill & Lab Capability Match (20%)
4. Institutional Capabilities & Incubation (15%)
5. NIRF & Regional Context Bonus (5%)

Rule:
- If routingType == 'GOVERNMENT', university matching is strictly bypassed!
"""

import json
from pathlib import Path
from typing import Dict, Any, List

DATASET_PATH = Path(__file__).resolve().parent / "universities_25.json"


class UniversityMatchingEngine:

    def __init__(self, dataset_path: Path = DATASET_PATH):
        with open(dataset_path, "r", encoding="utf-8") as f:
            self.data = json.load(f)
        self.universities = self.data.get("universities", [])

    def match(self, analysis_result: Dict[str, Any], top_k: int = 5) -> Dict[str, Any]:
        """
        Match structured problem requirements to the 25 universities.
        """
        classification = analysis_result.get("classification", {})
        routing_type = classification.get("routingType", "GOVERNMENT").upper()

        # Rule: Do not route routine government civic complaints to universities!
        if routing_type == "GOVERNMENT":
            return {
                "routingType": "GOVERNMENT",
                "matched": False,
                "reason": "Direct civic complaint classified for administrative/municipal authority resolution. University research matching is bypassed.",
                "totalInstitutionsEvaluated": len(self.universities),
                "matches": []
            }

        req_domains = set(d.lower() for d in analysis_result.get("recommendedUniversityDomains", []))
        req_research = set(r.lower() for r in analysis_result.get("requirements", {}).get("researchAreas", []))
        req_skills = set(s.lower() for s in analysis_result.get("requirements", {}).get("requiredSkills", []))

        # Check for Jharkhand regional context
        prob_text = (
            analysis_result.get("problem", {}).get("title", "") + " " +
            analysis_result.get("problem", {}).get("summary", "")
        ).lower()
        is_jharkhand = any(k in prob_text for k in ["jharkhand", "ranchi", "dhanbad", "jamshedpur", "hazaribagh", "dumka", "chaibasa", "kanke", "palamu", "bokaro", "deoghar"])

        scored_universities = []

        for u in self.universities:
            u_domains = [d.lower() for d in u.get("domains", [])]
            u_research = [r.lower() for r in u.get("researchAreas", [])]
            u_skills = [s.lower() for s in u.get("skills", [])]

            # 1. Domain Score (0 - 35)
            domain_overlap = 0.0
            for rd in req_domains:
                for ud in u_domains:
                    if rd == ud:
                        domain_overlap += 1.0
                    elif rd in ud or ud in rd or any(w in ud for w in rd.split() if len(w) > 4):
                        domain_overlap += 0.75
            domain_score = min(35.0, domain_overlap * 12.0)

            # 2. Research Area Score (0 - 25)
            research_overlap = 0.0
            for rr in req_research:
                for ur in u_research:
                    if rr == ur:
                        research_overlap += 1.0
                    elif rr in ur or ur in rr or any(w in ur for w in rr.split() if len(w) > 4):
                        research_overlap += 0.75
            research_score = min(25.0, research_overlap * 7.5)

            # 3. Skills Score (0 - 15)
            skill_overlap = 0.0
            for rs in req_skills:
                for us in u_skills:
                    if rs == us:
                        skill_overlap += 1.0
                    elif rs in us or us in rs or any(w in us for w in rs.split() if len(w) > 3):
                        skill_overlap += 0.75
            skill_score = min(15.0, skill_overlap * 4.5)

            # 4. Institutional Capabilities (0 - 15)
            caps = u.get("capabilities", {})
            cap_avg = sum(caps.values()) / max(1, len(caps)) if caps else 80.0
            capability_score = (cap_avg / 100.0) * 15.0

            # 5. NIRF & Regional Standing Bonus (0 - 10)
            nirf = u.get("nirf", {})
            nirf_rank = nirf.get("overall_rank") or nirf.get("engineering_rank") or nirf.get("management_rank") or 100
            try:
                nirf_rank = int(str(nirf_rank).split("-")[0])
            except Exception:
                nirf_rank = 100
            nirf_bonus = max(0.0, (100 - min(100, nirf_rank)) / 100.0 * 5.0)

            # Regional bonus if local challenge and local university
            regional_bonus = 5.0 if (is_jharkhand and u.get("state") == "Jharkhand") else 2.5

            total_score = round(domain_score + research_score + skill_score + capability_score + nirf_bonus + regional_bonus, 1)

            matched_elements = {
                "matchedDomains": list(set(d for d in u.get("domains", []) if any(rd in d.lower() or d.lower() in rd or any(w in d.lower() for w in rd.split() if len(w) > 4) for rd in req_domains))),
                "matchedResearch": list(set(r for r in u.get("researchAreas", []) if any(rr in r.lower() or r.lower() in rr or any(w in r.lower() for w in rr.split() if len(w) > 4) for rr in req_research))),
                "matchedSkills": list(set(s for s in u.get("skills", []) if any(rs in s.lower() or s.lower() in rs or any(w in s.lower() for w in rs.split() if len(w) > 3) for rs in req_skills)))
            }

            scored_universities.append({
                "id": u["id"],
                "name": u["name"],
                "shortName": u.get("shortName", u["name"]),
                "city": u.get("city"),
                "state": u.get("state"),
                "type": u.get("type"),
                "totalMatchScore": total_score,
                "scoreBreakdown": {
                    "domainAlignment": round(domain_score, 1),
                    "researchMatch": round(research_score, 1),
                    "skillOverlap": round(skill_score, 1),
                    "capabilityScore": round(capability_score, 1),
                    "nirfBonus": round(nirf_bonus, 1),
                    "regionalAffinity": round(regional_bonus, 1)
                },
                "matchedElements": matched_elements,
                "prototypeNotes": u.get("prototype_notes", "")
            })

        # Sort descending by match score
        scored_universities.sort(key=lambda x: x["totalMatchScore"], reverse=True)

        return {
            "routingType": routing_type,
            "matched": True,
            "totalInstitutionsEvaluated": len(self.universities),
            "topMatches": scored_universities[:top_k]
        }


def match_universities_for_problem(analysis_result: Dict[str, Any], top_k: int = 5) -> Dict[str, Any]:
    """Helper convenience function."""
    engine = UniversityMatchingEngine()
    return engine.match(analysis_result, top_k=top_k)


if __name__ == "__main__":
    from problem_analyzer import analyze_problem

    sample_problem = "Farmers in Kanke block Ranchi are facing 70% crop loss due to sudden yellow leaf blight disease."
    print("Analyzing:", sample_problem)
    analysis = analyze_problem(sample_problem)
    
    engine = UniversityMatchingEngine()
    match_result = engine.match(analysis, top_k=3)
    
    print("\n--- UNIVERSITY MATCHES ---")
    print(json.dumps(match_result, indent=2))
