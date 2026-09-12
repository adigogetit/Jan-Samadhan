# Societal Innovation Problem Analyzer & University Matching Engine

A turnkey, production-ready Python module designed for societal grievance and innovation platforms (Jharkhand and National context). Converts citizen-reported societal issues into structured machine-readable JSON, estimates structured impact factors, calculates deterministic priority scores, and matches requirements against a database of 25 Higher Education Institutions (HEIs).

---

## 📁 Files Included

| File | Description |
| :--- | :--- |
| `problem_analyzer.py` | LLM Module converting problem text into structured JSON. Determines routing (`GOVERNMENT`, `INNOVATION`, `HYBRID`), extracts impact factors (0-10), research areas, skills, tech, departments, and `recommendedUniversityDomains`. (Supports Gemini/OpenAI API with offline deterministic fallback). |
| `universities_25.json` | 25 Higher Education Institutions (15 Jharkhand HEIs + 10 National Premier HEIs) with NIRF rankings, domains, research areas, skills, and institutional capabilities. |
| `priority_engine.py` | Deterministic priority calculator producing a 0–100 score, priority band (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), target SLA hours, and action recommendation. |
| `university_matching_engine.py` | Multi-criteria matching engine evaluating HEIs across 5 dimensions. Automatically **bypasses** matching for `GOVERNMENT` complaints. |
| `api_server.py` | Lightweight REST API server with `/analyze`, `/priority`, `/match`, and `/pipeline` endpoints. |
| `cli.py` | Command-line tool supporting one-shot queries and raw JSON output (`--json`). |
| `test_suite.py` | Automated test suite validating routing rules, impact scoring, and university matching. |
| `__init__.py` | Allows importing the folder directly as a Python package. |

---

## 🚀 Quick Integration in Your Main Project

### 1. Direct Python Import

```python
from problem_analyzer import analyze_problem
from priority_engine import calculate_priority_score
from university_matching_engine import UniversityMatchingEngine

# Step 1: Analyze unstructured citizen report
problem_text = "Tribal farmers in Kanke Ranchi facing recurring leaf blight fungal disease destroying 80% paddy crops."
analysis = analyze_problem(problem_text)

# Step 2: Compute priority score
priority = calculate_priority_score(analysis["priorityFactors"])
print(f"Priority Score: {priority['compositeScore']}/100 [{priority['priorityBand']}]")

# Step 3: University Matching (automatically skipped if GOVERNMENT)
engine = UniversityMatchingEngine()
matching = engine.match(analysis, top_k=3)

if matching["matched"]:
    for rank, match in enumerate(matching["topMatches"], 1):
        print(f"#{rank}: {match['name']} ({match['totalMatchScore']}/100)")
else:
    print("Routed directly to Municipal / Government administration.")
```

---

## 🌐 Running as a Microservice (REST API)

Start the server:
```bash
python api_server.py --port 5002
```

### Endpoints:
- `POST /analyze`: Send `{"text": "problem description"}` -> Returns structured JSON.
- `POST /priority`: Send `{"priorityFactors": {...}}` -> Returns composite priority score (0-100).
- `POST /match`: Send `{"analysis": {...}}` -> Returns top matched universities.
- `POST /pipeline`: Send `{"text": "problem description"}` -> Complete end-to-end result.
- `GET /universities`: Returns list of all 25 universities.

---

## 🧪 Running Tests
```bash
python test_suite.py
```
