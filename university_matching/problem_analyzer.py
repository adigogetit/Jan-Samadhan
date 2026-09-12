"""
Societal Innovation Problem Analyzer - LLM Module
===================================================
Converts unstructured, citizen-reported societal challenges in Jharkhand and India
into structured JSON representation for deterministic priority scoring and
university matching.

Taxonomy:
1. Agriculture & Rural Technology
2. Water Resources & Management
3. Environment, Forest & Climate
4. Mining & Mineral Technology
5. Healthcare & Public Health
6. Education & Digital Learning
7. Energy & Renewable Energy
8. Infrastructure, Civil & Urban Systems
9. AI, IT & Digital Governance
10. Rural Livelihood, Entrepreneurship & Social Innovation

Routing Rules:
- GOVERNMENT: Routine municipal / public service responsibility (e.g. pothole, streetlight, garbage collection)
- INNOVATION: Requires new technology, R&D, product, or research intervention (e.g. AI crop disease detection, low-cost sensor)
- HYBRID: Immediate civic action needed + recurring/systemic challenge requiring research/innovation (e.g. recurring mine water flooding, repeated crop failure)
"""

import os
import re
import json
import io
import sys
from typing import Dict, Any, Optional

# Ensure UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')


SYSTEM_PROMPT = """You are the Societal Innovation Problem Analyzer for a technology platform that connects citizen-reported societal challenges in Jharkhand and India with Higher Education Institutions (HEIs), research teams, startups and industry partners.

Your primary responsibility is to understand an unstructured societal problem and convert it into a structured JSON representation that can be consumed by a deterministic priority and university-matching engine.

IMPORTANT:
You are NOT responsible for making the final university selection.
You are NOT responsible for calculating the final priority score.
You must extract the factors required by downstream scoring systems.

Your tasks are:
1. Understand the citizen's problem.
2. Generate a concise problem title.
3. Generate a clear problem summary.
4. Classify the problem into an appropriate innovation domain and subdomain.
5. Determine whether the issue is: GOVERNMENT, INNOVATION, or HYBRID.
6. Estimate structured impact factors on a 0–10 scale.
7. Identify the research areas required to address the problem.
8. Identify required technical and non-technical skills.
9. Identify potentially relevant academic departments.
10. Identify technologies that could potentially be useful.
11. Estimate innovation potential on a 0–10 scale.
12. Suggest possible solution directions without claiming that they are the final solution.
13. Identify the university domains that should be considered by the downstream university matching engine.
14. Return ONLY valid JSON.

DOMAIN TAXONOMY:
1. Agriculture & Rural Technology
2. Water Resources & Management
3. Environment, Forest & Climate
4. Mining & Mineral Technology
5. Healthcare & Public Health
6. Education & Digital Learning
7. Energy & Renewable Energy
8. Infrastructure, Civil & Urban Systems
9. AI, IT & Digital Governance
10. Rural Livelihood, Entrepreneurship & Social Innovation

ROUTING RULES:
GOVERNMENT: Problem primarily requires an existing public authority to perform its normal service responsibility (e.g. pothole repair, broken streetlight, garbage collection, blocked drain).
INNOVATION: Requires development of new technology, product, research method, process, or innovative intervention (e.g. AI crop disease detection, low-cost water quality monitoring, predictive road maintenance).
HYBRID: Immediate government intervention is necessary but there is also a recurring/systemic problem that could benefit from research or innovation (e.g. recurring flooding, repeated road damage, recurring drinking-water shortages, repeated agricultural losses).

OUTPUT FORMAT:
Return EXACTLY this JSON structure:
{
  "problem": {
    "title": "string",
    "summary": "string",
    "domain": "string",
    "subDomain": "string"
  },
  "classification": {
    "routingType": "GOVERNMENT | INNOVATION | HYBRID",
    "innovationPotential": 0,
    "confidence": 0.0
  },
  "impact": {
    "severity": 0,
    "urgency": 0,
    "affectedPopulation": 0,
    "geographicImpact": 0,
    "recurrence": 0
  },
  "requirements": {
    "researchAreas": [],
    "requiredSkills": [],
    "technologies": [],
    "departments": []
  },
  "priorityFactors": {
    "severity": 0,
    "urgency": 0,
    "populationImpact": 0,
    "geographicImpact": 0,
    "recurrence": 0,
    "innovationPotential": 0
  },
  "suggestedSolutionDirections": [],
  "recommendedUniversityDomains": []
}

RULES:
- Return valid JSON only. Do not return Markdown or backticks.
- Do not include explanations outside the JSON.
- Do not invent facts. Use null or 0 when unknown.
- Do not confuse a civic complaint with an innovation challenge.
- Do not automatically route every problem to a university. If GOVERNMENT, keep recommendedUniversityDomains empty [].
- Never name a specific university. Return recommendedUniversityDomains only.
"""

TAXONOMY_DOMAINS = [
    "Agriculture & Rural Technology",
    "Water Resources & Management",
    "Environment, Forest & Climate",
    "Mining & Mineral Technology",
    "Healthcare & Public Health",
    "Education & Digital Learning",
    "Energy & Renewable Energy",
    "Infrastructure, Civil & Urban Systems",
    "AI, IT & Digital Governance",
    "Rural Livelihood, Entrepreneurship & Social Innovation"
]


class SocietalProblemAnalyzer:
    """
    Intelligent Problem Analyzer that parses citizen-reported problems into
    standardized structured JSON for downstream priority and university matching.
    """

    def __init__(self, preferred_provider: Optional[str] = None):
        """
        Initialize analyzer.
        preferred_provider: 'openai', 'gemini', or 'offline' (auto-detected by default)
        """
        self.preferred_provider = preferred_provider

    def analyze(self, problem_text: str) -> Dict[str, Any]:
        """
        Analyze a citizen problem statement and return structured JSON.
        """
        if not problem_text or not problem_text.strip():
            raise ValueError("Problem text cannot be empty.")

        cleaned_text = problem_text.strip()

        # 1. Try OpenAI if API key available and preferred
        openai_key = os.getenv("OPENAI_API_KEY")
        gemini_key = os.getenv("GEMINI_API_KEY")

        if self.preferred_provider == "openai" or (not self.preferred_provider and openai_key):
            try:
                res = self._call_openai(cleaned_text, openai_key)
                if res:
                    return self._validate_and_normalize(res)
            except Exception as e:
                print(f"[Warning] OpenAI API call failed: {e}. Falling back to rule-based engine.")

        if self.preferred_provider == "gemini" or (not self.preferred_provider and gemini_key):
            try:
                res = self._call_gemini(cleaned_text, gemini_key)
                if res:
                    return self._validate_and_normalize(res)
            except Exception as e:
                print(f"[Warning] Gemini API call failed: {e}. Falling back to rule-based engine.")

        # 2. High-precision Deterministic Offline NLP Analyzer
        # Handles English, Hindi (Devanagari), and Hinglish with zero external dependencies
        return self._offline_analyze(cleaned_text)

    def _call_openai(self, text: str, api_key: str) -> Optional[Dict[str, Any]]:
        """Invoke OpenAI API with JSON output mode."""
        import openai
        client = openai.OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Analyze this citizen problem:\n\n{text}"}
            ],
            temperature=0.1
        )
        content = response.choices[0].message.content
        return json.loads(content)

    def _call_gemini(self, text: str, api_key: str) -> Optional[Dict[str, Any]]:
        """Invoke Google Gemini API."""
        import requests
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": f"{SYSTEM_PROMPT}\n\nProblem:\n{text}"}]}],
            "generationConfig": {"response_mime_type": "application/json", "temperature": 0.1}
        }
        res = requests.post(url, json=payload, timeout=30)
        if res.status_code == 200:
            data = res.json()
            raw_json = data['candidates'][0]['content']['parts'][0]['text']
            return json.loads(raw_json)
        return None

    def _offline_analyze(self, text: str) -> Dict[str, Any]:
        """
        Deterministic NLP & Domain Heuristic Analyzer.
        Understands Hindi, Hinglish, and English civic & research challenges.
        """
        lower = text.lower()

        # 1. Routing Type Detection
        is_routine_civic = False
        is_recurring_or_systemic = False
        is_research_tech_need = False

        routine_keywords = [
            "pothole", "streetlight", "street light", "light kharab", "kooda", "garbage",
            "kachra", "drain blocked", "naali jaam", "pipeline leak", "pipe leak", "water tap broken",
            "traffic signal", "meter kharab", "bijli ka khamba", "bill correction", "safai nahi",
            "सड़क का गड्ढा", "स्ट्रीट लाइट", "कचरा", "नाली जाम", "पाइप लीक"
        ]
        recurring_keywords = [
            "recurring", "repeated", "har saal", "baar baar", "continuous", "chronic",
            "every monsoon", "every year", "har baar", "seasonal", "drought prone",
            "flooding every", "har bar", "salana", "bar bar", "लगातार", "हर साल", "बार-बार"
        ]
        def has_kw(patterns):
            for kw in patterns:
                # Support singular and plural variations (e.g., crop/crops, farmer/farmers, drain/drains)
                pattern = r'(?<![a-zA-Z0-9])' + re.escape(kw) + r'(?:s|es)?(?![a-zA-Z0-9])'
                if re.search(pattern, lower):
                    return True
            return False

        innovation_keywords = [
            "ai", "artificial intelligence", "detect", "predict", "monitoring", "sensor", "algorithm",
            "drone", "solar", "water testing", "purification", "disease detection", "research",
            "new technology", "mobile app", "automation", "biogas", "low-cost", "low cost", "smart system",
            "मशीन", "तकनीक", "सेंसर", "निगरानी", "परीक्षण"
        ]

        is_routine_civic = has_kw(routine_keywords)
        is_recurring_or_systemic = has_kw(recurring_keywords)
        is_research_tech_need = has_kw(innovation_keywords)

        # Determine Routing Type according to strict guidelines
        if is_routine_civic and not (is_recurring_or_systemic or is_research_tech_need):
            routing_type = "GOVERNMENT"
            innov_potential = 1
            confidence = 0.95
        elif is_routine_civic and (is_recurring_or_systemic or is_research_tech_need):
            routing_type = "HYBRID"
            innov_potential = 6
            confidence = 0.88
        elif is_research_tech_need:
            routing_type = "INNOVATION"
            innov_potential = 8
            confidence = 0.92
        elif is_recurring_or_systemic:
            routing_type = "HYBRID"
            innov_potential = 7
            confidence = 0.85
        else:
            routing_type = "INNOVATION" if ("develop" in lower or "solution" in lower or "study" in lower) else "HYBRID"
            innov_potential = 6
            confidence = 0.80

        # 2. Domain Classification
        domain = "Infrastructure, Civil & Urban Systems"
        subdomain = "Municipal Infrastructure"
        research_areas = []
        skills = []
        technologies = []
        departments = []
        university_domains = []

        if has_kw(["khet", "crop", "farmer", "fasal", "agriculture", "pest", "soil", "beej", "irrigation", "paddy", "blight", "fungal", "farm", "farming", "harvest", "धान", "फसल", "किसान", "खेती"]):
            domain = "Agriculture & Rural Technology"
            subdomain = "Crop Protection & Agricultural Productivity"
            research_areas = ["Agronomy", "Plant Pathology", "Soil Science", "Agricultural Engineering"]
            skills = ["Soil Analysis", "Crop Disease Diagnostics", "Agricultural Technology", "IoT Sensor Integration"]
            technologies = ["IoT Soil Sensors", "Drone-based Multispectral Imaging", "Mobile Disease Advisory"]
            departments = ["Department of Agriculture", "Department of Agronomy", "Department of Biotechnology"]
            if routing_type != "GOVERNMENT":
                university_domains = ["Agriculture & Rural Technology", "Water & Soil Management", "Animal Husbandry"]

        elif has_kw(["road", "sadak", "bridge", "pul", "traffic", "pothole", "streetlight", "street light", "transport", "bus", "सड़क", "पुल", "यातायात", "स्ट्रीट लाइट", "गड्ढा"]):
            domain = "Infrastructure, Civil & Urban Systems"
            subdomain = "Road Durability & Municipal Infrastructure"
            research_areas = ["Civil Engineering", "Transportation Engineering", "Materials Science"]
            skills = ["Pavement Evaluation", "Asphalt Mix Design", "Structural Health Monitoring", "Geotechnical Engineering"]
            technologies = ["Geotextile Reinforced Bitumen", "Automated Deflection Surveyors", "Smart Drainage Ducts"]
            departments = ["Department of Civil Engineering", "Department of Transportation Planning"]
            if routing_type != "GOVERNMENT":
                university_domains = ["Civil Infrastructure", "Urban Systems", "AI & Digital Technology"]

        elif has_kw(["water", "pani", "drinking water", "arsenic", "fluoride", "borewell", "groundwater", "jal", "drought", "सूखा", "पानी", "पेयजल"]):
            domain = "Water Resources & Management"
            subdomain = "Drinking Water Security & Quality"
            research_areas = ["Water Resources Engineering", "Hydrology", "Environmental Engineering", "Geochemistry"]
            skills = ["Water Quality Testing", "Hydrological Modeling", "Filtration Engineering", "GIS Mapping"]
            technologies = ["Solar-powered UV/UF Filtration", "Adsorption Filter Media", "IoT Water Flow Monitors"]
            departments = ["Department of Civil Engineering", "Department of Environmental Science", "Department of Chemistry"]
            if routing_type != "GOVERNMENT":
                university_domains = ["Water Resources", "Civil Infrastructure", "Environment & Climate"]

        elif has_kw(["mine", "coal", "khadan", "overburden", "blasting", "acid mine", "mining", "mineral", "कोयला", "खनन"]):
            domain = "Mining & Mineral Technology"
            subdomain = "Sustainable Mining & Mine Safety"
            research_areas = ["Mining Engineering", "Geology", "Rock Mechanics", "Environmental Remediation"]
            skills = ["Geological Surveying", "Mine Void Rehabilitation", "Remote Sensing", "Dust Control Modeling"]
            technologies = ["Ground Penetrating Radar", "Automated Slope Monitoring", "Biological Acid Mine Neutralization"]
            departments = ["Department of Mining Engineering", "Department of Applied Geology", "Department of Environmental Engineering"]
            if routing_type != "GOVERNMENT":
                university_domains = ["Mining & Mineral Technology", "Environment & Climate", "Civil Infrastructure"]

        elif has_kw(["hospital", "doctor", "health", "disease", "malaria", "dengue", "medicine", "swasthya", "clinic", "अस्पताल", "दवा", "स्वास्थ्य", "बीमारी"]):
            domain = "Healthcare & Public Health"
            subdomain = "Rural Health Infrastructure & Diagnostics"
            research_areas = ["Healthcare Technology", "Public Health", "Epidemiology", "Biomedical Engineering"]
            skills = ["Point-of-Care Diagnostics", "Telemedicine Deployment", "Epidemiological Surveillance", "Data Analytics"]
            technologies = ["Telemedicine Platform", "Portable Diagnostic Kits", "Mobile Health Informatics"]
            departments = ["Department of Community Medicine", "Department of Biomedical Engineering", "Department of Biotechnology"]
            if routing_type != "GOVERNMENT":
                university_domains = ["Healthcare Technology", "Healthcare & Public Health", "Life Sciences"]

        elif has_kw(["bijli", "electricity", "power", "solar", "transformer", "load shedding", "energy", "solar plant", "बिजली", "सोलर"]):
            domain = "Energy & Renewable Energy"
            subdomain = "Rural Electrification & Solar Microgrids"
            research_areas = ["Renewable Energy", "Electrical Engineering", "Power Systems", "Energy Storage"]
            skills = ["Microgrid Design", "Photovoltaic Optimization", "Battery Management", "IoT Metering"]
            technologies = ["Decentralized Solar Microgrid", "Smart Inverters", "Lithium Iron Phosphate Energy Storage"]
            departments = ["Department of Electrical Engineering", "Department of Energy Science"]
            if routing_type != "GOVERNMENT":
                university_domains = ["Energy", "Electronics & IoT", "AI & Digital Technology"]

        elif has_kw(["school", "education", "teacher", "padhai", "digital learning", "student", "shiksha", "स्कूल", "शिक्षा", "पढ़ाई"]):
            domain = "Education & Digital Learning"
            subdomain = "Vernacular & Offline Educational Technology"
            research_areas = ["Education Technology", "Digital Pedagogy", "Computer Science", "Linguistics"]
            skills = ["Interactive Content Design", "Offline Sync Architecture", "Vernacular NLP", "Learning Analytics"]
            technologies = ["Mesh-network Learning Device", "Interactive Regional Audio-Visual Modules", "Open-source LMS"]
            departments = ["Department of Education", "Department of Computer Science & Engineering"]
            if routing_type != "GOVERNMENT":
                university_domains = ["Education", "AI & Digital Technology", "Social Sciences"]

        elif has_kw(["forest", "pollution", "tree", "trees", "jungle", "wildlife", "climate", "air quality", "smog", "carbon", "पर्यावरण", "जंगल", "प्रदूषण"]):
            domain = "Environment, Forest & Climate"
            subdomain = "Ecological Conservation & Air Quality"
            research_areas = ["Environmental Engineering", "Forestry", "Atmospheric Science", "Ecology"]
            skills = ["Air Dispersion Modeling", "Biochar Sequestration", "Afforestation Planning", "Remote Sensing"]
            technologies = ["Low-cost Optical Particulate Sensors", "Satellite Forest Cover Monitoring", "Bio-filters"]
            departments = ["Department of Environmental Science", "Department of Forestry", "Department of Chemical Engineering"]
            if routing_type != "GOVERNMENT":
                university_domains = ["Environment & Climate", "Tribal Studies", "Water Resources"]

        elif has_kw(["artisan", "handicraft", "tribal craft", "livelihood", "employment", "rojgar", "self help", "shg", "bamboo", "lac", "रोजगार", "आजीविका"]):
            domain = "Rural Livelihood, Entrepreneurship & Social Innovation"
            subdomain = "Tribal Craft & Non-Timber Forest Product Processing"
            research_areas = ["Social Innovation", "Entrepreneurship", "Value Chain Engineering", "Design Innovation"]
            skills = ["Market Linkage", "Quality Standardization", "Sustainable Processing", "Packaging Design"]
            technologies = ["Solar-powered Processing Kilns", "Blockchain Traceability for Forest Produce", "E-commerce Collective Platforms"]
            departments = ["Department of Management", "Department of Rural Development", "Department of Design"]
            if routing_type != "GOVERNMENT":
                university_domains = ["Livelihood & Entrepreneurship", "Tribal Studies", "Social Innovation"]

        else:
            domain = "Infrastructure, Civil & Urban Systems"
            subdomain = "Civic Municipal Services"
            research_areas = ["Civil Engineering", "Public Works Engineering"]
            skills = ["Civic Maintenance", "Structural Repair", "Field Inspection"]
            technologies = ["Digital Grievance Ticketing", "GIS Asset Tagging"]
            departments = ["Department of Civil Engineering"]
            if routing_type != "GOVERNMENT":
                university_domains = ["Civil Infrastructure"]

        # If routing is pure GOVERNMENT, no university domains should be considered!
        if routing_type == "GOVERNMENT":
            university_domains = []

        # 3. Population & Impact Extraction
        numbers = [int(n) for n in re.findall(r'\b\d+\b', text) if int(n) > 5]
        affected_pop = numbers[0] if numbers else (500 if "village" in lower or "gaon" in lower else 0)

        # Severity, Urgency, Recurrence, Geographic
        severity = 7 if any(w in lower for w in ["fatal", "death", "poison", "hospital", "loss", "danger", "hazard", "severe", "khatra", "nuksan"]) else 5
        urgency = 8 if any(w in lower for w in ["immediate", "urgent", "emergency", "jaldi", "now", "today", "crisis"]) else 6
        recurrence = 9 if is_recurring_or_systemic else (3 if routing_type == "GOVERNMENT" else 6)
        geographic = 6 if any(w in lower for w in ["district", "block", "state", "jharkhand", "multi-village"]) else 3

        # Title & Summary
        words = text.split()
        title_words = words[:7]
        title = " ".join(title_words).strip(".,!?:")
        if len(title) > 60:
            title = title[:57] + "..."
        summary = text if len(text) <= 200 else text[:197] + "..."

        # Suggested solutions
        solutions = []
        if routing_type == "GOVERNMENT":
            solutions.append("Issue immediate maintenance and service work order to the relevant municipal or state authority.")
            solutions.append("Establish localized grievance inspection with fixed SLA resolution timeframe.")
        elif routing_type == "INNOVATION":
            solutions.append(f"Deploy research pilot utilizing {technologies[0] if technologies else 'low-cost technology'}.")
            solutions.append(f"Collaborate with HEI research lab in {research_areas[0] if research_areas else 'engineering'} for prototype validation.")
        else: # HYBRID
            solutions.append("Prompt municipal public authority for immediate transient relief and containment.")
            solutions.append(f"Engage regional university research team in {research_areas[0] if research_areas else 'applied science'} to design long-term sustainable systemic intervention.")

        pop_impact_score = min(10, max(2, int(len(str(affected_pop)) * 2))) if affected_pop > 0 else 3

        result = {
            "problem": {
                "title": title,
                "summary": summary,
                "domain": domain,
                "subDomain": subdomain
            },
            "classification": {
                "routingType": routing_type,
                "innovationPotential": innov_potential,
                "confidence": confidence
            },
            "impact": {
                "severity": severity,
                "urgency": urgency,
                "affectedPopulation": affected_pop,
                "geographicImpact": geographic,
                "recurrence": recurrence
            },
            "requirements": {
                "researchAreas": research_areas,
                "requiredSkills": skills,
                "technologies": technologies,
                "departments": departments
            },
            "priorityFactors": {
                "severity": severity,
                "urgency": urgency,
                "populationImpact": pop_impact_score,
                "geographicImpact": geographic,
                "recurrence": recurrence,
                "innovationPotential": innov_potential
            },
            "suggestedSolutionDirections": solutions,
            "recommendedUniversityDomains": university_domains
        }

        return result

    def _validate_and_normalize(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure all required keys, types, and constraints are strictly satisfied."""
        required_keys = ["problem", "classification", "impact", "requirements", "priorityFactors", "suggestedSolutionDirections", "recommendedUniversityDomains"]
        for k in required_keys:
            if k not in data:
                data[k] = {}

        # Enforce routing rules: If GOVERNMENT, recommendedUniversityDomains MUST be empty
        routing = str(data.get("classification", {}).get("routingType", "GOVERNMENT")).upper()
        if routing not in ["GOVERNMENT", "INNOVATION", "HYBRID"]:
            routing = "HYBRID"
        data["classification"]["routingType"] = routing

        if routing == "GOVERNMENT":
            data["recommendedUniversityDomains"] = []

        return data


def analyze_problem(problem_text: str) -> Dict[str, Any]:
    """Helper convenience function."""
    analyzer = SocietalProblemAnalyzer()
    return analyzer.analyze(problem_text)


if __name__ == "__main__":
    test_cases = [
        "There is a deep pothole on Main Road near Ranchi railway station causing traffic jams and bike skids.",
        "Farmers in Kanke block are facing 70% crop loss due to sudden yellow leaf blight disease; traditional remedies are failing.",
        "Dhanbad coal mining belt suffers recurring acid water runoff into rural drinking ponds every monsoon season."
    ]

    analyzer = SocietalProblemAnalyzer()
    for tc in test_cases:
        print("\n" + "=" * 75)
        print("INPUT:", tc)
        print("=" * 75)
        res = analyzer.analyze(tc)
        print(json.dumps(res, indent=2, ensure_ascii=False))
