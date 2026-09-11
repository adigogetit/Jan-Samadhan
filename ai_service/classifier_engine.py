"""
Jan-Samadhan Grievance Classification Engine
============================================
Tri-lingual rule-based grievance classifier supporting:
- English
- Hinglish (Hindi in Latin script)
- Hindi (Devanagari script)

Provides modular functions for direct Python integration and API servers:
- classify_grievance(text: str) -> dict
- classify_batch(texts: list) -> list[dict]
- classify(text: str) -> tuple (category, priority)
"""

import re

# ── 1. ENGLISH / HINGLISH CATEGORY KEYWORDS ──────────────────────────────────
CATEGORY_EN = {
    # Water Supply
    'agriculture paani nhi': 'Water Supply', 'agriculture paani nahi': 'Water Supply',
    'agriculture pani': 'Water Supply', 'paani nhi': 'Water Supply',
    'paani nahi': 'Water Supply', 'pani nhi': 'Water Supply', 'paani band': 'Water Supply',
    'water supply': 'Water Supply', 'water meter': 'Water Supply',
    'drinking water': 'Water Supply', 'water tanker': 'Water Supply',
    'contaminated water': 'Water Supply', 'pipeline': 'Water Supply',
    'hand pump': 'Water Supply', 'borewell': 'Water Supply', 'boring': 'Water Supply',
    'paani': 'Water Supply', 'pani': 'Water Supply', 'water': 'Water Supply', 'nal': 'Water Supply',

    # Agriculture
    'pm kisan': 'Agriculture', 'kisan': 'Agriculture', 'fasal': 'Agriculture',
    'kheti': 'Agriculture', 'agriculture': 'Agriculture', 'crop': 'Agriculture',
    'farmer': 'Agriculture', 'mandi': 'Agriculture', 'beej': 'Agriculture',
    'seed': 'Agriculture', 'fertilizer': 'Agriculture', 'khad': 'Agriculture',
    'irrigation': 'Agriculture', 'paddy': 'Agriculture', 'wheat': 'Agriculture',
    'gehu': 'Agriculture', 'chawal': 'Agriculture', 'drought': 'Agriculture',
    'procurement': 'Agriculture', 'sowing': 'Agriculture', 'pest': 'Agriculture',
    'keeda': 'Agriculture', 'kide': 'Agriculture',

    # Hospital & Health
    'hospital': 'Hospital', 'doctor': 'Hospital', 'dawai': 'Hospital',
    'dawa': 'Hospital', 'medicine': 'Hospital', 'patient': 'Hospital',
    'ambulance': 'Hospital', 'blood bank': 'Hospital', 'oxygen': 'Hospital',
    'health center': 'Hospital', 'chc': 'Hospital', 'phc': 'Hospital',
    'nurse': 'Hospital', 'ilaj': 'Hospital', 'bimari': 'Hospital',
    'surgery': 'Hospital', 'clinic': 'Hospital',

    # School & Education
    'school': 'School', 'teacher': 'School', 'shiksha': 'School',
    'textbook': 'School', 'scholarship': 'School', 'student': 'School',
    'mid-day meal': 'School', 'education': 'School', 'pathshala': 'School',
    'vidyalay': 'School', 'exam': 'School', 'college': 'School',
    'masterji': 'School', 'fees': 'School',

    # Roads & Infrastructure
    'street light': 'Roads', 'streetlight': 'Roads', 'sadak': 'Roads',
    'road': 'Roads', 'pothole': 'Roads', 'gaddha': 'Roads', 'bridge': 'Roads',
    'highway': 'Roads', 'flyover': 'Roads', 'footpath': 'Roads',

    # Electricity
    'bijli': 'Electricity', 'electricity': 'Electricity', 'transformer': 'Electricity',
    'power cut': 'Electricity', 'power supply': 'Electricity', 'motor': 'Electricity',
    'meter': 'Electricity', 'solar panel': 'Electricity', 'voltage': 'Electricity',
    'wire': 'Electricity', 'light cut': 'Electricity',

    # Sanitation & Waste
    'drainage': 'Sanitation', 'sewage': 'Sanitation', 'garbage': 'Sanitation',
    'safai': 'Sanitation', 'kachra': 'Sanitation', 'gandagi': 'Sanitation',
    'toilet': 'Sanitation', 'shauchalaya': 'Sanitation', 'dustbin': 'Sanitation',

    # Public Safety
    'chori': 'Public Safety', 'le gya': 'Public Safety', 'chaddhi': 'Public Safety',
    'theft': 'Public Safety', 'police': 'Public Safety', 'crime': 'Public Safety',
    'fraud': 'Public Safety', 'robbery': 'Public Safety', 'harassment': 'Public Safety',

    # Welfare & Schemes
    'pension': 'Welfare', 'ration': 'Welfare', 'subsidy': 'Welfare',
    'anganwadi': 'Welfare', 'malnutrition': 'Welfare', 'aadhar': 'Welfare',
    'pm awas': 'Welfare', 'bpl card': 'Welfare',

    # Administration
    'sunta hi nhi': 'Administration', 'sunta nhi': 'Administration',
    'koi sunta': 'Administration', 'no response': 'Administration',
    'ignored': 'Administration', 'bribe': 'Administration', 'corruption': 'Administration',
    'rishwat': 'Administration', 'officer': 'Administration', 'baboo': 'Administration',
}

# ── 2. ENGLISH / HINGLISH PRIORITY KEYWORDS ──────────────────────────────────
PRIORITY_EN = {
    # Critical
    'fire': 'Critical', 'death': 'Critical', 'collapsed': 'Critical',
    'emergency': 'Critical', 'flood': 'Critical', 'electrocution': 'Critical',
    'maut': 'Critical', 'aag': 'Critical', 'jaan': 'Critical', 'barh': 'Critical',
    'immediate danger': 'Critical', 'no oxygen': 'Critical', 'dying': 'Critical',

    # High
    'not working': 'High', 'non-functional': 'High', 'stopped': 'High',
    'no supply': 'High', 'shortage': 'High', 'not received': 'High',
    'absent': 'High', 'nhi aaya': 'High', 'nahi aaya': 'High',
    'nahi hai': 'High', 'ghante': 'High', 'band hai': 'High', 'le gya': 'High',
    'months': 'High', 'mahine se': 'High', 'hafte se': 'High', 'pareshani': 'High',
    'weeks': 'High', 'problem': 'High', 'urgent': 'High',

    # Medium
    'sometimes': 'Medium', 'irregular': 'Medium', 'incorrect': 'Medium',
    'delay': 'Medium', 'overcharge': 'Medium', 'slow': 'Medium',
    'pending': 'Medium', 'complaint': 'Medium', 'late': 'Medium',
    'kabhi kabhi': 'Medium', 'short time': 'Medium', 'thoda': 'Medium',
    'nhi h': 'Medium', 'nhi hai': 'Medium',

    # Low
    'minor': 'Low', 'small': 'Low', 'request': 'Low', 'chhota': 'Low',
    'suggestion': 'Low', 'inquiry': 'Low', 'info': 'Low',
}

# ── 3. HINDI DEVANAGARI CATEGORY KEYWORDS ─────────────────────────────────────
CATEGORY_HI = {
    # Agriculture
    'खेत में पानी नहीं': 'Agriculture',
    'फसल में कीड़े':     'Agriculture',
    'फसल में बीमारी':    'Agriculture',
    'फसल सूख':           'Agriculture',
    'फसल की पत्तियाँ':   'Agriculture',
    'फसल का उत्पादन':    'Agriculture',
    'कृषि मशीन':         'Agriculture',
    'ट्रैक्टर':           'Agriculture',
    'सिंचाई':            'Agriculture',
    'मंडी':              'Agriculture',
    'किसान':             'Agriculture',
    'खेती':              'Agriculture',
    'खेत':               'Agriculture',
    'फसल':               'Agriculture',
    'बीज':               'Agriculture',
    'खाद':               'Agriculture',
    'मिट्टी':            'Agriculture',
    'कृषि':              'Agriculture',
    'उत्पादन':           'Agriculture',
    'कीटनाशक':           'Agriculture',
    'उर्वरक':            'Agriculture',

    # Water Supply
    'पानी नहीं':         'Water Supply',
    'नहर में पानी':      'Water Supply',
    'पीने का पानी':      'Water Supply',
    'जलापूर्ति':         'Water Supply',
    'नहर':               'Water Supply',
    'नल':                'Water Supply',
    'पाइपलाइन':          'Water Supply',
    'पानी':              'Water Supply',
    'बोरवेल':            'Water Supply',
    'हैंडपंप':           'Water Supply',
    'टैंकर':             'Water Supply',

    # Electricity
    'बिजली नहीं आने':   'Electricity',
    'मोटर नहीं चल':     'Electricity',
    'ट्रांसफार्मर':      'Electricity',
    'बिजली':             'Electricity',
    'विद्युत':           'Electricity',
    'मीटर':              'Electricity',
    'वोल्टेज':           'Electricity',
    'करंट':              'Electricity',
    'तार':               'Electricity',

    # Hospital
    'अस्पताल':           'Hospital',
    'डॉक्टर':            'Hospital',
    'दवाई':              'Hospital',
    'दवा':               'Hospital',
    'इलाज':              'Hospital',
    'एम्बुलेंस':          'Hospital',
    'स्वास्थ्य':          'Hospital',
    'रोगी':              'Hospital',
    'मरीज':              'Hospital',
    'ऑक्सीजन':           'Hospital',

    # School
    'स्कूल':             'School',
    'विद्यालय':          'School',
    'शिक्षक':            'School',
    'शिक्षा':            'School',
    'छात्र':             'School',
    'किताबें':           'School',
    'छात्रवृत्ति':       'School',
    'मध्याह्न भोजन':      'School',

    # Roads
    'सड़क':              'Roads',
    'पुल':               'Roads',
    'गड्ढे':             'Roads',
    'यातायात':           'Roads',
    'स्ट्रीट लाइट':       'Roads',
    'हाइवे':             'Roads',

    # Sanitation
    'नाली':              'Sanitation',
    'सफाई':              'Sanitation',
    'कचरा':              'Sanitation',
    'गंदगी':             'Sanitation',
    'शौचालय':            'Sanitation',
    'सीवर':              'Sanitation',

    # Public Safety
    'चोरी':              'Public Safety',
    'अपराध':             'Public Safety',
    'पुलिस':             'Public Safety',
    'सुरक्षा':           'Public Safety',
    'धोखाधड़ी':          'Public Safety',

    # Welfare
    'पेंशन':             'Welfare',
    'राशन':              'Welfare',
    'आवास':              'Welfare',
    'आंगनवाड़ी':          'Welfare',
    'अनुदान':            'Welfare',

    # Administration
    'कोई नहीं सुनता':    'Administration',
    'सुनता नहीं':        'Administration',
    'कोई सुनता':         'Administration',
    'शिकायत':            'Administration',
    'प्रशासन':           'Administration',
    'अधिकारी':           'Administration',
    'रिश्वत':            'Administration',
}

# ── 4. HINDI DEVANAGARI PRIORITY KEYWORDS ────────────────────────────────────
PRIORITY_HI = {
    # Critical
    'पानी भर गया':       'Critical',
    'बाढ़':              'Critical',
    'आग':               'Critical',
    'मृत्यु':            'Critical',
    'खतरा':             'Critical',
    'आपातकाल':          'Critical',
    'जान को खतरा':       'Critical',

    # High
    'पानी नहीं आ रहा':  'High',
    'नहीं आ रहा':        'High',
    'नहीं चल':           'High',
    'सूख रही है':        'High',
    'फैल रही है':        'High',
    'लग गए':             'High',
    'खराब हो गई':        'High',
    'नहीं मिल रहा':      'High',
    'उपलब्ध नहीं':       'High',
    'कम होने':           'High',
    'भर गया':            'High',
    'नहीं है':           'High',
    'बंद है':            'High',
    'गंभीर':             'High',

    # Medium
    'पीली पड़':          'Medium',
    'कम हो रहा':         'Medium',
    'उम्मीद से कम':      'Medium',
    'अच्छी वृद्धि नहीं': 'Medium',
    'गुणवत्ता अच्छी नहीं':'Medium',
    'देरी':              'Medium',
    'अनियमित':           'Medium',

    # Low
    'मामूली':            'Low',
    'छोटी समस्या':       'Low',
    'अनुरोध':            'Low',
    'सुझाव':             'Low',
    'जानकारी':           'Low',
}

# ── METADATA & UI MAPS ───────────────────────────────────────────────────────
CAT_ICON = {
    'Agriculture':    '[FARM]',
    'Water Supply':   '[H2O ]',
    'Hospital':       '[HOSP]',
    'School':         '[EDUC]',
    'Roads':          '[ROAD]',
    'Electricity':    '[ELEC]',
    'Sanitation':     '[SANT]',
    'Public Safety':  '[SAFE]',
    'Administration': '[ADMN]',
    'Welfare':        '[WLFR]',
    'Other':          '[OTHR]',
}

PRI_ICON = {
    'Critical': '[!!!]',
    'High':     '[!! ]',
    'Medium':   '[ ! ]',
    'Low':      '[   ]',
}

URGENCY = {
    'Critical': 'CRITICAL -- Immediate action required (Emergency/Life safety)',
    'High':     'HIGH     -- Urgent, severe disruption to daily life',
    'Medium':   'MEDIUM   -- Moderate inconvenience, requires scheduled attention',
    'Low':      'LOW      -- Minor / advisory request',
}


def is_hindi(text: str) -> bool:
    """Return True if the text contains any Hindi / Devanagari script characters."""
    return any('\u0900' <= ch <= '\u097F' for ch in str(text))


def classify_grievance(text: str) -> dict:
    """
    Main function to classify grievance text.
    
    Args:
        text (str): The grievance complaint in English, Hinglish, or Hindi.
        
    Returns:
        dict: {
            "status": "success",
            "text": str,
            "language": "Hindi" | "English/Hinglish",
            "category": str,
            "category_icon": str,
            "priority": str,
            "priority_icon": str,
            "urgency": str,
            "matched_keywords": {
                "category_phrase": str or None,
                "priority_phrase": str or None
            }
        }
    """
    if not text or not str(text).strip():
        return {
            "status": "error",
            "message": "Empty text provided",
            "text": "",
            "language": "Unknown",
            "category": "Other",
            "priority": "Low",
            "urgency": URGENCY["Low"]
        }

    t_orig = str(text).strip()
    t_lower = t_orig.lower()
    is_hi = is_hindi(t_orig)

    cat = 'Other'
    pri = 'Medium'
    matched_cat = None
    matched_pri = None

    if is_hi:
        lang = "Hindi"
        for phrase in sorted(CATEGORY_HI, key=len, reverse=True):
            if phrase in t_orig:
                cat = CATEGORY_HI[phrase]
                matched_cat = phrase
                break
        for phrase in sorted(PRIORITY_HI, key=len, reverse=True):
            if phrase in t_orig:
                pri = PRIORITY_HI[phrase]
                matched_pri = phrase
                break
    else:
        lang = "English/Hinglish"
        for phrase in sorted(CATEGORY_EN, key=len, reverse=True):
            if phrase in t_lower:
                cat = CATEGORY_EN[phrase]
                matched_cat = phrase
                break
        for phrase in sorted(PRIORITY_EN, key=len, reverse=True):
            if phrase in t_lower:
                pri = PRIORITY_EN[phrase]
                matched_pri = phrase
                break

    return {
        "status": "success",
        "text": t_orig,
        "language": lang,
        "category": cat,
        "category_icon": CAT_ICON.get(cat, '[OTHR]'),
        "priority": pri,
        "priority_icon": PRI_ICON.get(pri, '[ ! ]'),
        "urgency": URGENCY.get(pri, pri),
        "matched_keywords": {
            "category_phrase": matched_cat,
            "priority_phrase": matched_pri
        }
    }


def classify_batch(texts: list) -> list:
    """Classify a list of grievance strings."""
    return [classify_grievance(t) for t in texts]


def classify(text: str):
    """Legacy helper returning tuple of (category, priority)."""
    res = classify_grievance(text)
    return res["category"], res["priority"]
