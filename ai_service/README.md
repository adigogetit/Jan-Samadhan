# Jan-Samadhan Grievance Classification Model
Multi-Lingual Grievance Classifier for Citizen Issues (English, Hinglish, and Hindi).

## What is this Project?
This project is an automated grievance triage engine built for citizen complaints (Jan-Samadhan / SIH).
It takes grievance texts in English, Roman Hindi (Hinglish), or Hindi Devanagari, automatically detects the language, categorizes the department, and assigns priority levels (Critical, High, Medium, Low).

## Key Features
- **Tri-lingual Processing**: Auto-detects and processes Hindi Devanagari (`खेत में पानी नहीं आ रहा`), Hinglish (`bijli cut hai`), and English.
- **Departments Handled**: Agriculture, Water Supply, Hospital, School/Education, Roads, Electricity, Sanitation, Public Safety, Welfare, Administration.
- **Priority Detection**: Critical (immediate life/property threat), High, Medium, Low.
- **Ready to Connect**: Direct Python import or zero-dependency REST API server (CORS enabled for web and mobile frontends).
- **IndicBERT Integration**: Includes original fine-tuning and evaluation utilities for IndicBERT models.

## Quick Start
1. **Verify setup:**
   ```bash
   python test_connection.py
   ```
2. **Start REST API Server:**
   ```bash
   python api_server.py --port 5000
   ```
3. **Classify in Python:**
   ```python
   from classifier_engine import classify_grievance
   result = classify_grievance("खेत में पानी नहीं आ रहा है।")
   print(result)
   ```
4. **See Full Integration Guide:**
   Check `INTEGRATION_GUIDE.md` for full instructions for Node.js, Express, React, Next.js, and Python.
