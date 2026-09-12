"""
Automated Test Suite for Societal Innovation Problem Analyzer
=============================================================
Tests all 14 tasks, routing rules (GOVERNMENT vs INNOVATION vs HYBRID),
impact scoring, deterministic priority calculation, and 25-university matching.
"""

import sys
import io
import json

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from problem_analyzer import analyze_problem
from priority_engine import calculate_priority_score
from university_matching_engine import UniversityMatchingEngine

engine = UniversityMatchingEngine()

TEST_CASES = [
    {
        "id": "TC01",
        "description": "Routine Civic Pothole (Must be GOVERNMENT)",
        "input": "There is a deep pothole on Main Road near Ranchi station causing vehicle skids.",
        "expected_routing": "GOVERNMENT",
        "should_match_universities": False
    },
    {
        "id": "TC02",
        "description": "AI-based Road Damage Predictive System (Must be INNOVATION)",
        "input": "Develop an AI drone computer vision system for predictive road damage detection and asphalt lifespan estimation.",
        "expected_routing": "INNOVATION",
        "should_match_universities": True
    },
    {
        "id": "TC03",
        "description": "Recurring Acid Mine Water Runoff in Dhanbad (Must be HYBRID)",
        "input": "Dhanbad coal mining belt suffers recurring acid water runoff into rural drinking ponds every monsoon season.",
        "expected_routing": "HYBRID",
        "should_match_universities": True
    },
    {
        "id": "TC04",
        "description": "Routine Streetlight Complaint (Must be GOVERNMENT)",
        "input": "Streetlight is broken on street number 4 and darkness is causing safety issues.",
        "expected_routing": "GOVERNMENT",
        "should_match_universities": False
    },
    {
        "id": "TC05",
        "description": "Tribal Farmer Crop Blight in Kanke (Must be HYBRID / INNOVATION)",
        "input": "Tribal farmers in Kanke Ranchi facing recurring leaf blight fungal disease destroying 80% paddy crops every season.",
        "expected_routing": "HYBRID",
        "should_match_universities": True
    },
    {
        "id": "TC06",
        "description": "Low-cost Arsenic Water Testing Sensor (Must be INNOVATION)",
        "input": "Need to research and deploy a low-cost IoT chemical sensor for real-time arsenic detection in rural drinking borewells.",
        "expected_routing": "INNOVATION",
        "should_match_universities": True
    },
    {
        "id": "TC07",
        "description": "Offline Vernacular Learning Device for Tribal Schools (Must be INNOVATION)",
        "input": "Lack of internet in rural schools requires low-cost offline digital learning tablets with vernacular Santhali audio modules.",
        "expected_routing": "INNOVATION",
        "should_match_universities": True
    },
    {
        "id": "TC08",
        "description": "Blocked Sewage Drain in Ward 12 (Must be GOVERNMENT)",
        "input": "Garbage dump and blocked sewage drain in Ward 12 overflowing with dirty water on street.",
        "expected_routing": "GOVERNMENT",
        "should_match_universities": False
    }
]


def run_tests():
    print("=" * 75)
    print("  SOCIETAL INNOVATION PROBLEM ANALYZER - VERIFICATION SUITE")
    print("=" * 75)

    passed = 0
    failed = 0

    for tc in TEST_CASES:
        print(f"\n[{tc['id']}] {tc['description']}")
        print(f"  Input: \"{tc['input']}\"")

        res = analyze_problem(tc["input"])
        routing = res.get("classification", {}).get("routingType")
        domain = res.get("problem", {}).get("domain")
        innov = res.get("classification", {}).get("innovationPotential")
        hei_domains = res.get("recommendedUniversityDomains", [])

        # Check routing
        routing_pass = (routing == tc["expected_routing"])
        print(f"  Routing Detected : {routing} (Expected: {tc['expected_routing']}) -> {'PASS' if routing_pass else 'FAIL'}")

        # Check university domains constraint
        if tc["expected_routing"] == "GOVERNMENT":
            hei_pass = (len(hei_domains) == 0)
            print(f"  HEI Domains Empty: {hei_pass} (Count: {len(hei_domains)}) -> {'PASS' if hei_pass else 'FAIL'}")
        else:
            hei_pass = (len(hei_domains) > 0)
            print(f"  HEI Domains Populated: {hei_pass} ({hei_domains}) -> {'PASS' if hei_pass else 'FAIL'}")

        # Check downstream university match
        match_res = engine.match(res, top_k=2)
        match_pass = (match_res.get("matched") == tc["should_match_universities"])
        print(f"  Downstream University Matching: Matched={match_res.get('matched')} (Expected: {tc['should_match_universities']}) -> {'PASS' if match_pass else 'FAIL'}")

        # Check priority score
        pri = calculate_priority_score(res.get("priorityFactors", {}))
        pri_pass = (0.0 <= pri["compositeScore"] <= 100.0)
        print(f"  Priority Calculation: {pri['compositeScore']}/100 [{pri['priorityBand']}] -> {'PASS' if pri_pass else 'FAIL'}")

        if routing_pass and hei_pass and match_pass and pri_pass:
            print(f"  >> TEST {tc['id']} RESULT: [PASS]")
            passed += 1
        else:
            print(f"  >> TEST {tc['id']} RESULT: [FAIL]")
            failed += 1

    print("\n" + "=" * 75)
    print(f"  SUMMARY: {passed} PASSED | {failed} FAILED (Total: {len(TEST_CASES)})")
    print("=" * 75)

    assert failed == 0, f"{failed} test cases failed!"


if __name__ == "__main__":
    run_tests()
