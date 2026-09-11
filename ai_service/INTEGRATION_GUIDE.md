# Jan-Samadhan Grievance Classification Model
## Integration & Connection Guide

This package provides a production-ready **Tri-lingual Grievance Classification Engine** supporting:
- 🇮🇳 **Hindi (Devanagari script)**: e.g. `खेत में पानी नहीं आ रहा है।`
- 🗣️ **Hinglish (Roman script)**: e.g. `bijli transformer kharab ho gaya hai`
- 🌐 **English**: e.g. `Broken water pipeline and contaminated drinking water`

---

## 🚀 Quick Verification (Test First)
Inside the extracted folder, run:
```bash
python test_connection.py
```
This runs a 3-step test verifying that the classification engine, batch processor, and language detection are all operational.

---

## 🔌 Method 1: Direct Python Import (Recommended for Python Projects)

If your main project is in Python (FastAPI, Flask, Django, Streamlit, Celery, scripts, or data pipelines), copy `classifier_engine.py` into your project and import it directly:

### 1. Single Grievance Classification
```python
from classifier_engine import classify_grievance

complaint = "खेत में पानी नहीं आ रहा है।"
result = classify_grievance(complaint)

print(result)
```

**Output JSON Structure:**
```json
{
  "status": "success",
  "text": "खेत में पानी नहीं आ रहा है।",
  "language": "Hindi",
  "category": "Agriculture",
  "category_icon": "[FARM]",
  "priority": "High",
  "priority_icon": "[!! ]",
  "urgency": "HIGH     -- Urgent, severe disruption to daily life",
  "matched_keywords": {
    "category_phrase": "खेत में पानी नहीं",
    "priority_phrase": "पानी नहीं आ रहा"
  }
}
```

### 2. Batch Classification
```python
from classifier_engine import classify_batch

complaints = [
    "खेत में पानी नहीं आ रहा है।",
    "Hospital me doctor absent hai",
    "Streetlight broken and wire sparking on road"
]

results = classify_batch(complaints)
for r in results:
    print(f"{r['category']} [{r['priority']}] -> {r['text']}")
```

---

## 🌐 Method 2: Connect via REST API (Node.js, React, Next.js, Django, Mobile Apps)

If your main project uses a different tech stack (Node.js, Express, React, Next.js, PHP, Java, Kotlin/Swift), you can run the zero-dependency REST API server:

### Step 1: Start the API Server
```bash
python api_server.py --port 5000
```
*Server runs on `http://localhost:5000` (CORS enabled by default).*

### Step 2: Connect from Your Main Project

#### 🅰️ Node.js / Express / Backend JavaScript:
```javascript
async function classifyGrievance(complaintText) {
  const response = await fetch('http://localhost:5000/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: complaintText })
  });
  
  const data = await response.json();
  console.log("Category:", data.category);
  console.log("Priority:", data.priority);
  return data;
}

// Example Call:
classifyGrievance("खेत में पानी नहीं आ रहा है।");
```

#### 🅱️ React / Next.js / Frontend JavaScript:
```javascript
import { useState } from 'react';

export default function GrievanceForm() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await res.json();
    setResult(data);
  };

  return (
    <div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleSubmit}>Classify</button>
      {result && (
        <div>
          <p>Category: {result.category}</p>
          <p>Priority: {result.priority}</p>
          <p>Language: {result.language}</p>
        </div>
      )}
    </div>
  );
}
```

#### 🅲 cURL (Terminal / Postman):
```bash
curl -X POST http://localhost:5000/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "खेत में पानी नहीं आ रहा है।"}'
```

#### 🅳 Batch API Endpoint:
```bash
curl -X POST http://localhost:5000/classify-batch \
  -H "Content-Type: application/json" \
  -d '{"texts": ["खेत में पानी नहीं आ रहा", "hospital me dawai nahi mil rahi"]}'
```

---

## 💻 Method 3: Command Line Interface (CLI)

You can run classifications or process whole CSV files directly from the command line:

```bash
# Single grievance
python cli.py "खेत में पानी नहीं आ रहा है।"

# Interactive loop
python cli.py

# Process CSV and save output
python cli.py --file society-problem/sample.csv --output results.csv
```

---

## 🏷️ Supported Categories & Priority Matrix

### Categories:
| Category | Icon | Typical Keywords |
|---|---|---|
| **Agriculture** | `[FARM]` | खेत, फसल, सिंचाई, किसान, खाद, बीज, tractor, mandi |
| **Water Supply** | `[H2O ]` | पानी, नल, पाइपलाइन, बोरवेल, water supply, tanker |
| **Hospital** | `[HOSP]` | अस्पताल, डॉक्टर, दवाई, इलाज, ambulance, medicine |
| **School** | `[EDUC]` | स्कूल, शिक्षक, किताबें, mid-day meal, student |
| **Roads** | `[ROAD]` | सड़क, गड्ढे, पुल, streetlight, pothole |
| **Electricity** | `[ELEC]` | बिजली, ट्रांसफार्मर, मोटर, power cut, voltage |
| **Sanitation** | `[SANT]` | नाली, सफाई, कचरा, sewage, garbage |
| **Public Safety** | `[SAFE]` | चोरी, पुलिस, अपराध, theft, crime |
| **Welfare** | `[WLFR]` | राशन, पेंशन, आवास, subsidy, aadhar |
| **Administration**| `[ADMN]` | कोई नहीं सुनता, शिकायत, रिश्वत, no response |

### Priority Levels:
- **Critical** `[!!!]`: Immediate threat to life, property, or catastrophic damage (बाढ़, आग, emergency, electrocution).
- **High** `[!! ]`: Severe disruption to basic services (पानी नहीं आ रहा, non-functional, stopped, absent).
- **Medium** `[ ! ]`: Inconvenience, partial delay, slow service, or quality issues.
- **Low** `[   ]`: Minor suggestions, inquiries, or non-urgent requests.
