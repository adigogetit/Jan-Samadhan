"""
Societal Innovation Problem Analyzer - Command Line Interface (CLI)
====================================================================
Test and inspect problem structuring, deterministic priority scoring,
and 25-university matching directly from the terminal.

Usage:
    python cli.py "Farmers in Kanke facing severe crop blight disease"
    python cli.py "Pothole on Main Road near station"
    python cli.py --full "Dhanbad coal mine acid water runoff"
    python cli.py
"""

import sys
import io
import json
import argparse

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from problem_analyzer import SocietalProblemAnalyzer
from priority_engine import calculate_priority_score
from university_matching_engine import UniversityMatchingEngine


def print_analysis(result: dict, show_full: bool = True):
    p = result.get("problem", {})
    c = result.get("classification", {})
    imp = result.get("impact", {})
    req = result.get("requirements", {})
    p_fac = result.get("priorityFactors", {})

    print("\n" + "=" * 75)
    print(f"  TITLE       : {p.get('title')}")
    print(f"  DOMAIN      : {p.get('domain')} -> {p.get('subDomain')}")
    print(f"  ROUTING     : [{c.get('routingType')}] (Confidence: {round(c.get('confidence', 0)*100, 1)}%, Innovation Potential: {c.get('innovationPotential')}/10)")
    print("─" * 75)
    print(f"  SUMMARY     : {p.get('summary')}")
    print("─" * 75)
    print(f"  IMPACT      : Severity: {imp.get('severity')}/10 | Urgency: {imp.get('urgency')}/10 | Recurrence: {imp.get('recurrence')}/10")
    print(f"                Geographic: {imp.get('geographicImpact')}/10 | Affected Population: {imp.get('affectedPopulation')}")
    print("─" * 75)
    print(f"  RESEARCH    : {', '.join(req.get('researchAreas', []))}")
    print(f"  SKILLS      : {', '.join(req.get('requiredSkills', []))}")
    print(f"  TECH        : {', '.join(req.get('technologies', []))}")
    print(f"  DEPARTMENTS : {', '.join(req.get('departments', []))}")
    print(f"  HEI DOMAINS : {', '.join(result.get('recommendedUniversityDomains', [])) if result.get('recommendedUniversityDomains') else 'None (Pure Civic/Government Route)'}")

    if result.get("suggestedSolutionDirections"):
        print("\n  SUGGESTED DIRECTIONS:")
        for idx, sol in enumerate(result.get("suggestedSolutionDirections", []), 1):
            print(f"    {idx}. {sol}")

    if show_full:
        # Priority Score
        priority = calculate_priority_score(p_fac)
        print("\n" + "─" * 75)
        print(f"  DOWNSTREAM PRIORITY SCORE: {priority['compositeScore']}/100 [{priority['priorityBand']}] (SLA: {priority['targetSLA_Hours']} hours)")
        print(f"  ACTION RECOMMENDATION    : {priority['recommendedAction']}")

        # University Matching
        engine = UniversityMatchingEngine()
        matches = engine.match(result, top_k=3)
        print("\n" + "─" * 75)
        if not matches.get("matched"):
            print(f"  UNIVERSITY MATCHING : Bypassed [{matches.get('routingType')}]")
            print(f"  REASON              : {matches.get('reason')}")
        else:
            print(f"  TOP MATCHED UNIVERSITIES (Out of {matches.get('totalInstitutionsEvaluated')} evaluated):")
            for idx, m in enumerate(matches.get("topMatches", []), 1):
                print(f"    {idx}. {m['name']} ({m['city']}, {m['state']})")
                print(f"       Match Score : {m['totalMatchScore']}/100 [Domains: {m['scoreBreakdown']['domainAlignment']}, Research: {m['scoreBreakdown']['researchMatch']}, Skills: {m['scoreBreakdown']['skillOverlap']}]")
                if m.get("matchedElements", {}).get("matchedResearch"):
                    print(f"       Specialism  : {', '.join(m['matchedElements']['matchedResearch'][:3])}")
                if m.get("prototypeNotes"):
                    print(f"       Note        : {m['prototypeNotes']}")

    print("=" * 75 + "\n")


def main():
    parser = argparse.ArgumentParser(description="Societal Innovation Problem Analyzer CLI")
    parser.add_argument("text", nargs="?", help="Citizen problem text")
    parser.add_argument("--json", action="store_true", help="Print raw JSON format only")
    parser.add_argument("--no-downstream", action="store_true", help="Disable priority & university matching display")

    args = parser.parse_args()
    analyzer = SocietalProblemAnalyzer()

    if args.text:
        res = analyzer.analyze(args.text)
        if args.json:
            print(json.dumps(res, indent=2, ensure_ascii=False))
        else:
            print_analysis(res, show_full=not args.no_downstream)
    else:
        # Interactive mode
        print("=" * 75)
        print("  Societal Innovation Problem Analyzer (Interactive Terminal)")
        print("  Enter any citizen problem in English, Hindi, or Hinglish (type 'exit' to quit):")
        print("=" * 75)
        while True:
            try:
                line = input("\n>> Enter problem: ").strip()
            except (EOFError, KeyboardInterrupt):
                break
            if not line or line.lower() == 'exit':
                break
            res = analyzer.analyze(line)
            if args.json:
                print(json.dumps(res, indent=2, ensure_ascii=False))
            else:
                print_analysis(res, show_full=not args.no_downstream)


if __name__ == "__main__":
    main()
