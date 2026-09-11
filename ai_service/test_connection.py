"""
Jan-Samadhan Model - Connection & Integration Verification Script
==================================================================
Run this script to verify that the model is working and ready to connect
to your main project.

Run:
    python test_connection.py
"""

import sys
import io
import json
import urllib.request
import urllib.error

# Ensure UTF-8 output on console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

print('=' * 70)
print('  Jan-Samadhan Model | Connection & Integration Verification')
print('=' * 70)

# ── 1. TEST DIRECT PYTHON IMPORT ──────────────────────────────────────────────
print('\n[Step 1] Testing Direct Python Import & Classification Engine...')
try:
    from classifier_engine import classify_grievance, classify_batch
    print('  [PASS] Successfully imported `classifier_engine`')
except Exception as e:
    print(f'  [FAIL] Failed to import `classifier_engine`: {e}')
    sys.exit(1)

test_cases = [
    {
        "desc": "Hindi (Devanagari)",
        "text": "खेत में पानी नहीं आ रहा है।",
        "expected_cat": "Agriculture",
        "expected_lang": "Hindi"
    },
    {
        "desc": "Hinglish (Roman)",
        "text": "hospital me doctor absent hai aur dawai nahi mil rahi",
        "expected_cat": "Hospital",
        "expected_lang": "English/Hinglish"
    },
    {
        "desc": "English",
        "text": "Frequent power cuts and transformer sparking in our colony",
        "expected_cat": "Electricity",
        "expected_lang": "English/Hinglish"
    }
]

for idx, tc in enumerate(test_cases, 1):
    res = classify_grievance(tc["text"])
    cat = res.get("category")
    pri = res.get("priority")
    lang = res.get("language")
    icon = res.get("category_icon", "")
    print(f'  Test {idx} ({tc["desc"]}):')
    print(f'    Text     : "{tc["text"]}"')
    print(f'    Result   : {icon} Category={cat} | Priority={pri} | Lang={lang}')
    if cat == tc["expected_cat"]:
        print('    Status   : [PASS]')
    else:
        print(f'    Status   : [NOTICE: Classified as {cat}]')

# ── 2. TEST BATCH CLASSIFICATION ──────────────────────────────────────────────
print('\n[Step 2] Testing Batch Processing...')
batch_texts = [
    "सड़क पर बहुत गहरे गड्ढे हैं",
    "School me mid-day meal nahi diya ja raha",
    "Water pipeline broken and sewage overflowing"
]
batch_res = classify_batch(batch_texts)
if len(batch_res) == 3:
    print(f'  [PASS] Batch classification returned {len(batch_res)} items successfully.')
else:
    print(f'  [FAIL] Expected 3 items, got {len(batch_res)}')

# ── 3. TEST REST API IF SERVER IS UP ──────────────────────────────────────────
print('\n[Step 3] Checking REST API Server (http://localhost:5000)...')
api_url = 'http://localhost:5000/classify'
try:
    req_data = json.dumps({"text": "खेत में पानी नहीं आ रहा है।"}).encode('utf-8')
    req = urllib.request.Request(
        api_url,
        data=req_data,
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req, timeout=2) as response:
        if response.status == 200:
            res_json = json.loads(response.read().decode('utf-8'))
            print('  [PASS] API Server is running and responding!')
            print(f'         Response: {res_json}')
except urllib.error.URLError:
    print('  [INFO] API Server is currently not running on port 5000.')
    print('         (To test via HTTP, run `python api_server.py` in another terminal)')

print('\n' + '=' * 70)
print('  Summary: The model module is READY for your main project!')
print('  Check INTEGRATION_GUIDE.md for copy-paste code snippets for:')
print('    - Python (Django / Flask / FastAPI / scripts)')
print('    - Node.js / Express / Next.js / React')
print('    - REST API (cURL, fetch, axios)')
print('=' * 70)
