import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ── ENGLISH / HINGLISH (Roman script) keyword map ────────────────────────────
CATEGORY_MAP_EN = {
    # Water
    'agriculture paani nhi': 'Water Supply', 'agriculture paani nahi': 'Water Supply',
    'paani nhi': 'Water Supply', 'pani nhi': 'Water Supply',
    'water supply': 'Water Supply', 'water meter': 'Water Supply',
    'drinking water': 'Water Supply', 'paani': 'Water Supply',
    'pani': 'Water Supply', 'water': 'Water Supply', 'nal': 'Water Supply',
    # Hospital
    'hospital': 'Hospital', 'doctor': 'Hospital', 'medicine': 'Hospital',
    'patient': 'Hospital', 'dawai': 'Hospital',
    # School
    'school': 'School', 'teacher': 'School', 'notice board': 'School',
    'shiksha': 'School', 'textbook': 'School',
    # Roads
    'street light': 'Roads', 'road': 'Roads', 'pothole': 'Roads',
    'sadak': 'Roads', 'bridge': 'Roads',
    # Electricity
    'bijli': 'Electricity', 'electricity': 'Electricity',
    'transformer': 'Electricity', 'motor': 'Electricity',
    # Sanitation
    'drainage': 'Sanitation', 'sewage': 'Sanitation', 'garbage': 'Sanitation',
    # Agriculture
    'kisan': 'Agriculture', 'fasal': 'Agriculture', 'crop': 'Agriculture',
    'farmer': 'Agriculture', 'agriculture': 'Agriculture', 'mandi': 'Agriculture',
    'beej': 'Agriculture', 'khad': 'Agriculture', 'irrigation': 'Agriculture',
    # Public Safety
    'chori': 'Public Safety', 'le gya': 'Public Safety',
    'chaddhi': 'Public Safety', 'theft': 'Public Safety',
    'police': 'Public Safety', 'crime': 'Public Safety',
    # Administration
    'sunta hi nhi': 'Administration', 'sunta nhi': 'Administration',
    'koi sunta': 'Administration', 'no response': 'Administration',
}

# ── HINDI (Devanagari script) keyword map ────────────────────────────────────
CATEGORY_MAP_HI = {
    # Agriculture - खेती/फसल
    'खेत में पानी नहीं': 'Agriculture',   'फसल में कीड़े': 'Agriculture',
    'फसल में बीमारी': 'Agriculture',      'फसल सूख': 'Agriculture',
    'फसल की पत्तियाँ': 'Agriculture',     'फसल का उत्पादन': 'Agriculture',
    'फसल': 'Agriculture',                 'खेती': 'Agriculture',
    'खेत': 'Agriculture',                 'किसान': 'Agriculture',
    'बीज': 'Agriculture',                 'खाद': 'Agriculture',
    'मिट्टी': 'Agriculture',              'कृषि': 'Agriculture',
    'ट्रैक्टर': 'Agriculture',            'कृषि मशीन': 'Agriculture',
    'मंडी': 'Agriculture',               'सिंचाई': 'Agriculture',
    'उत्पादन': 'Agriculture',             'वृद्धि नहीं': 'Agriculture',

    # Water Supply - पानी
    'पानी नहीं': 'Water Supply',         'नहर में पानी': 'Water Supply',
    'पीने का पानी': 'Water Supply',       'जलापूर्ति': 'Water Supply',
    'नल': 'Water Supply',                'पाइपलाइन': 'Water Supply',
    'पानी': 'Water Supply',              'नहर': 'Water Supply',

    # Electricity - बिजली
    'बिजली नहीं': 'Electricity',         'बिजली नहीं आने': 'Electricity',
    'मोटर नहीं चल': 'Electricity',       'ट्रांसफार्मर': 'Electricity',
    'बिजली': 'Electricity',              'विद्युत': 'Electricity',
    'मीटर': 'Electricity',

    # Hospital - अस्पताल
    'अस्पताल': 'Hospital',               'डॉक्टर': 'Hospital',
    'दवाई': 'Hospital',                  'दवा': 'Hospital',
    'इलाज': 'Hospital',                  'नर्स': 'Hospital',
    'एम्बुलेंस': 'Hospital',             'स्वास्थ्य': 'Hospital',

    # School - विद्यालय
    'स्कूल': 'School',                   'विद्यालय': 'School',
    'शिक्षक': 'School',                  'शिक्षा': 'School',
    'पाठ्यपुस्तक': 'School',             'छात्र': 'School',
    'परीक्षा': 'School',

    # Roads - सड़क
    'सड़क': 'Roads',                     'पुल': 'Roads',
    'गड्ढे': 'Roads',                    'मार्ग': 'Roads',
    'यातायात': 'Roads',

    # Sanitation - सफाई
    'नाली': 'Sanitation',               'सफाई': 'Sanitation',
    'कचरा': 'Sanitation',               'गंदगी': 'Sanitation',

    # Administration - प्रशासन
    'कोई नहीं सुनता': 'Administration', 'सुनता नहीं': 'Administration',
    'कोई सुनता': 'Administration',      'शिकायत': 'Administration',
    'प्रशासन': 'Administration',
}

# ── HINDI (Devanagari) PRIORITY map ──────────────────────────────────────────
PRIORITY_MAP_HI = {
    # Critical
    'पानी भर गया': 'Critical',          'बाढ़': 'Critical',
    'आग': 'Critical',                   'मृत्यु': 'Critical',
    'खतरा': 'Critical',                 'आपातकाल': 'Critical',

    # High
    'पानी नहीं आ रहा': 'High',          'नहीं आ रहा': 'High',
    'नहीं है': 'High',                  'नहीं चल': 'High',
    'सूख रही है': 'High',               'फैल रही है': 'High',
    'लग गए': 'High',                    'खराब हो गई': 'High',
    'नहीं मिल रहा': 'High',             'उपलब्ध नहीं': 'High',
    'कम होने': 'High',                  'भर गया': 'High',

    # Medium
    'पीली पड़': 'Medium',               'कम हो रहा': 'Medium',
    'कम उत्पादन': 'Medium',             'गुणवत्ता अच्छी नहीं': 'Medium',
    'उम्मीद से कम': 'Medium',           'अच्छी वृद्धि नहीं': 'Medium',

    # Low
    'छोटी समस्या': 'Low',              'मामूली': 'Low',
    'अनुरोध': 'Low',
}

# ── ENGLISH / HINGLISH PRIORITY map ──────────────────────────────────────────
PRIORITY_MAP_EN = {
    'fire': 'Critical', 'death': 'Critical', 'collapsed': 'Critical',
    'emergency': 'Critical', 'flood': 'Critical',
    'not working': 'High', 'non-functional': 'High', 'stopped': 'High',
    'no supply': 'High', 'shortage': 'High', 'not received': 'High',
    'absent': 'High', 'nhi aaya': 'High', 'nahi aaya': 'High',
    'nahi hai': 'High', 'ghante': 'High', 'band': 'High', 'le gya': 'High',
    'sometimes': 'Medium', 'irregular': 'Medium', 'incorrect': 'Medium',
    'delay': 'Medium', 'overcharge': 'Medium', 'slow': 'Medium',
    'pending': 'Medium', 'complaint': 'Medium', 'late': 'Medium',
    'kabhi kabhi': 'Medium', 'short time': 'Medium',
    'nhi h': 'Medium', 'nhi hai': 'Medium',
    'minor': 'Low', 'small': 'Low', 'request': 'Low', 'chhota': 'Low',
}

def is_hindi(text):
    """Detect if text contains Devanagari script."""
    return any('\u0900' <= ch <= '\u097F' for ch in text)

def classify(text):
    t_lower = text.lower().strip()   # for English/Hinglish matching
    t_orig  = text.strip()           # for Hindi Devanagari matching (case preserved)

    cat = 'Other'
    pri = 'High'

    if is_hindi(text):
        # ── Hindi Devanagari path ────────────────────────────────
        for phrase in sorted(CATEGORY_MAP_HI, key=len, reverse=True):
            if phrase in t_orig:
                cat = CATEGORY_MAP_HI[phrase]
                break
        for phrase in sorted(PRIORITY_MAP_HI, key=len, reverse=True):
            if phrase in t_orig:
                pri = PRIORITY_MAP_HI[phrase]
                break
    else:
        # ── English / Hinglish path ──────────────────────────────
        for phrase in sorted(CATEGORY_MAP_EN, key=len, reverse=True):
            if phrase in t_lower:
                cat = CATEGORY_MAP_EN[phrase]
                break
        for phrase in sorted(PRIORITY_MAP_EN, key=len, reverse=True):
            if phrase in t_lower:
                pri = PRIORITY_MAP_EN[phrase]
                break

    return cat, pri

URGENCY = {
    'Critical': '[!!!] CRITICAL  -- Immediate! Life at risk',
    'High':     '[!! ] HIGH      -- Urgent, severe disruption',
    'Medium':   '[ ! ] MEDIUM    -- Moderate inconvenience',
    'Low':      '[   ] LOW       -- Minor, can be scheduled',
}

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
    'Other':          '[OTHR]',
}

LANG_TAG = {True: '[HI]', False: '[EN]'}


sample_path = os.path.join(os.path.dirname(__file__), 'society-problem', 'sample.csv')
with open(sample_path, encoding='utf-8') as f:
    lines = [l.strip() for l in f if l.strip()]

print('=' * 72)
print('  Jan-Samadhan  |  Grievance Classification Results')
print('  Supports: English | Hinglish | Hindi (Devanagari)')
print('=' * 72)
print(f'  {"#":<4} {"Lang":<5} {"Cat":<6} {"Category":<16} {"Priority":<10} {"Text (snippet)"}')
print(f'  {"-"*4} {"-"*5} {"-"*6} {"-"*16} {"-"*10} {"-"*36}')

counts = {'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0}
rows = []
for i, line in enumerate(lines, 1):
    cat, pri = classify(line)
    counts[pri] = counts.get(pri, 0) + 1
    ci = CAT_ICON.get(cat, '[OTHR]')
    lang = LANG_TAG[is_hindi(line)]
    snippet = line[:36] + '..' if len(line) > 36 else line
    pri_tag = f'[{pri}]'
    print(f'  {i:<4} {lang:<5} {ci} {cat:<16} {pri_tag:<10} {snippet}')
    rows.append((i, line, cat, pri, lang))

print()
print('=' * 72)
print('  DETAILED RESULTS')
print('=' * 72)
for i, line, cat, pri, lang in rows:
    ci = CAT_ICON.get(cat, '[OTHR]')
    u = URGENCY[pri]
    print(f'  [{i:02d}] {line}')
    print(f'       {ci} Category : {cat}')
    print(f'       {u}')
    print()

print('=' * 72)
print('  PRIORITY DISTRIBUTION  (Total: ' + str(len(lines)) + ' grievances)')
print('  ' + '-' * 50)
total = len(lines)
for p in ['Critical', 'High', 'Medium', 'Low']:
    c = counts.get(p, 0)
    bar = '#' * c
    pct = round(c / total * 100) if total else 0
    print(f'  {p:<10} {bar:<20} {c} ({pct}%)')
print('=' * 72)
