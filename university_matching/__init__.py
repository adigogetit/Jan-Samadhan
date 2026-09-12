"""
Societal Innovation Problem Analyzer & University Matching Engine
================================================================
Turnkey module for converting citizen-reported problems into structured JSON,
evaluating deterministic priority scores, and matching against 25 Higher
Education Institutions (HEIs).
"""

from .problem_analyzer import SocietalProblemAnalyzer, analyze_problem
from .priority_engine import calculate_priority_score
from .university_matching_engine import UniversityMatchingEngine, match_universities_for_problem

__all__ = [
    "SocietalProblemAnalyzer",
    "analyze_problem",
    "calculate_priority_score",
    "UniversityMatchingEngine",
    "match_universities_for_problem",
]
