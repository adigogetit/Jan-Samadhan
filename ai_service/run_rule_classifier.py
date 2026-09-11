import csv, os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ── ENGLISH / HINGLISH keyword maps ──────────────────────────────────────────
CATEGORY_EN = {
    'agriculture paani nhi': 'Water Supply', 'agriculture paani nahi': 'Water Supply',
    'agriculture pani': 'Water Supply',
    'kisan': 'Agriculture', 'fasal': 'Agriculture', 'kheti': 'Agriculture',
    'agriculture': 'Agriculture', 'crop': 'Agriculture', 'farmer': 'Agriculture',
    'mandi': 'Agriculture', 'beej': 'Agriculture', 'irrigation': 'Agriculture',
    'paani nhi': 'Water Supply', 'paani nahi': 'Water Supply', 'pani nhi': 'Water Supply',
    'paani band': 'Water Supply', 'pani': 'Water Supply', 'paani': 'Water Supply',
    'water supply': 'Water Supply', 'water meter': 'Water Supply',
    'drinking water': 'Water Supply', 'water': 'Water Supply', 'nal': 'Water Supply',
    'hand pump': 'Water Supply', 'borewell': 'Water Supply', 'pipeline': 'Water Supply',
    'hospital': 'Hospital', 'doctor': 'Hospital', 'dawai': 'Hospital',
    'dawa': 'Hospital', 'medicine': 'Hospital', 'patient': 'Hospital',
    'ambulance': 'Hospital', 'blood bank': 'Hospital', 'oxygen': 'Hospital',
    'school': 'School', 'teacher': 'School', 'shiksha': 'School',
    'textbook': 'School', 'scholarship': 'School', 'student': 'School',
    'mid-day meal': 'School', 'education': 'School',
    'street light': 'Roads', 'streetlight': 'Roads',
    'sadak': 'Roads', 'road': 'Roads', 'pothole': 'Roads',
    'gaddha': 'Roads', 'bridge': 'Roads', 'highway': 'Roads',
    'bijli': 'Electricity', 'electricity': 'Electricity',
    'transformer': 'Electricity', 'power cut': 'Electricity',
    'power supply': 'Electricity', 'motor': 'Electricity',
    'meter': 'Electricity', 'solar panel': 'Electricity',
    'drainage': 'Sanitation', 'sewage': 'Sanitation',
    'garbage': 'Sanitation', 'safai': 'Sanitation',
    'chori': 'Public Safety', 'le gya': 'Public Safety',
    'chaddhi': 'Public Safety', 'theft': 'Public Safety',
    'police': 'Public Safety', 'crime': 'Public Safety', 'fraud': 'Public Safety',
    'pension': 'Welfare', 'ration': 'Welfare', 'subsidy': 'Welfare',
    'anganwadi': 'Welfare', 'malnutrition': 'Welfare',
    'sunta hi nhi': 'Administration', 'sunta nhi': 'Administration',
    'koi sunta': 'Administration', 'no response': 'Administration',
    'ignored': 'Administration',
}

PRIORITY_EN = {
    'fire': 'Critical', 'death': 'Critical', 'collapsed': 'Critical',
    'emergency': 'Critical', 'flood': 'Critical', 'electrocution': 'Critical',
    'not working': 'High', 'non-functional': 'High', 'stopped': 'High',
    'no supply': 'High', 'shortage': 'High', 'not received': 'High',
    'absent': 'High', 'nhi aaya': 'High', 'nahi aaya': 'High',
    'nahi hai': 'High', 'ghante': 'High', 'band hai': 'High', 'le gya': 'High',
    'months': 'High', 'mahine se': 'High', 'hafte se': 'High', 'pareshani': 'High',
    'sometimes': 'Medium', 'irregular': 'Medium', 'incorrect': 'Medium',
    'delay': 'Medium', 'overcharge': 'Medium', 'slow': 'Medium',
    'pending': 'Medium', 'complaint': 'Medium', 'late': 'Medium',
    'kabhi kabhi': 'Medium', 'short time': 'Medium', 'thoda': 'Medium',
    'nhi h': 'Medium', 'nhi hai': 'Medium',
    'minor': 'Low', 'small': 'Low', 'request': 'Low', 'chhota': 'Low',
}

# ── HINDI Devanagari keyword maps ─────────────────────────────────────────────
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
    # Water Supply
    'पानी नहीं':         'Water Supply',
    'नहर में पानी':      'Water Supply',
    'पीने का पानी':      'Water Supply',
    'जलापूर्ति':         'Water Supply',
    'नहर':               'Water Supply',
    'नल':                'Water Supply',
    'पाइपलाइन':          'Water Supply',
    'पानी':              'Water Supply',
    # Electricity
    'बिजली नहीं आने':   'Electricity',
    'मोटर नहीं चल':     'Electricity',
    'ट्रांसफार्मर':      'Electricity',
    'बिजली':             'Electricity',
    'विद्युत':           'Electricity',
    'मीटर':              'Electricity',
    # Hospital
    'अस्पताल':           'Hospital',
    'डॉक्टर':            'Hospital',
    'दवाई':              'Hospital',
    'दवा':               'Hospital',
    'इलाज':              'Hospital',
    'एम्बुलेंस':          'Hospital',
    'स्वास्थ्य':          'Hospital',
    # School
    'स्कूल':             'School',
    'विद्यालय':          'School',
    'शिक्षक':            'School',
    'शिक्षा':            'School',
    'छात्र':             'School',
    # Roads
    'सड़क':              'Roads',
    'पुल':               'Roads',
    'गड्ढे':             'Roads',
    'यातायात':           'Roads',
    # Sanitation
    'नाली':              'Sanitation',
    'सफाई':              'Sanitation',
    'कचरा':              'Sanitation',
    'गंदगी':             'Sanitation',
    # Administration
    'कोई नहीं सुनता':    'Administration',
    'सुनता नहीं':        'Administration',
    'कोई सुनता':         'Administration',
    'शिकायत':            'Administration',
    'प्रशासन':           'Administration',
}

PRIORITY_HI = {
    # Critical
    'पानी भर गया':       'Critical',
    'बाढ़':              'Critical',
    'आग':               'Critical',
    'मृत्यु':            'Critical',
    'खतरा':             'Critical',
    'आपातकाल':          'Critical',
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
    # Medium
    'पीली पड़':          'Medium',
    'कम हो रहा':         'Medium',
    'उम्मीद से कम':      'Medium',
    'अच्छी वृद्धि नहीं': 'Medium',
    'गुणवत्ता अच्छी नहीं':'Medium',
    # Low
    'मामूली':            'Low',
    'छोटी समस्या':       'Low',
    'अनुरोध':            'Low',
}

# ── Icons & labels ────────────────────────────────────────────────────────────
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
PRI_ICON  = {'Critical': '[!!!]', 'High': '[!! ]', 'Medium': '[ ! ]', 'Low': '[   ]'}
URGENCY   = {
    'Critical': 'CRITICAL -- Immediate action required',
    'High':     'HIGH     -- Urgent, severe disruption',
    'Medium':   'MEDIUM   -- Moderate inconvenience',
    'Low':      'LOW      -- Minor, can be scheduled',
}

# ── Core functions ─────────────────────────────────────────────────────────────
def is_hindi(text):
    return any('\u0900' <= ch <= '\u097F' for ch in text)

def classify(text):
    t_orig  = text.strip()
    t_lower = t_orig.lower()
    cat, pri = 'Other', 'High'
    if is_hindi(text):
        for phrase in sorted(CATEGORY_HI, key=len, reverse=True):
            if phrase in t_orig:
                cat = CATEGORY_HI[phrase]; break
        for phrase in sorted(PRIORITY_HI, key=len, reverse=True):
            if phrase in t_orig:
                pri = PRIORITY_HI[phrase]; break
    else:
        for phrase in sorted(CATEGORY_EN, key=len, reverse=True):
            if phrase in t_lower:
                cat = CATEGORY_EN[phrase]; break
        for phrase in sorted(PRIORITY_EN, key=len, reverse=True):
            if phrase in t_lower:
                pri = PRIORITY_EN[phrase]; break
    return cat, pri

def save_csv(path, rows):
    if not rows: return
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=rows[0].keys())
        w.writeheader(); w.writerows(rows)

# ── Paths ─────────────────────────────────────────────────────────────────────
base        = os.path.join(os.path.dirname(__file__), 'society-problem')
results_dir = os.path.join(base, 'results')
os.makedirs(results_dir, exist_ok=True)

print('=' * 68)
print('  Jan-Samadhan Grievance Classifier')
print('  Supports: English | Hinglish | Hindi (Devanagari)')
print('=' * 68)

# ── 1. SAMPLE.CSV ─────────────────────────────────────────────────────────────
print('\n[1] sample.csv  --  Input Grievances (English / Hinglish / Hindi)')
print('-' * 68)
sample_path = os.path.join(base, 'sample.csv')
sample_out  = []
with open(sample_path, encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line: continue
        cat, pri = classify(line)
        lang = '[HI]' if is_hindi(line) else '[EN]'
        ci = CAT_ICON.get(cat, '[OTHR]')
        pi = PRI_ICON[pri]
        print(f'  Text     : {line}')
        print(f'  Lang     : {lang}')
        print(f'  Category : {ci} {cat}')
        print(f'  Priority : {pi} {URGENCY[pri]}')
        print()
        sample_out.append({'text': line, 'lang': lang,
                           'pred_category': cat, 'pred_priority': pri})
save_csv(os.path.join(results_dir, 'sample_predictions.csv'), sample_out)

# ── 2. TEST.CSV ───────────────────────────────────────────────────────────────
print('[2] test.csv  --  English Grievances (Unlabelled Predictions)')
print('-' * 68)
test_path = os.path.join(base, 'test.csv')
test_out  = []
with open(test_path, encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader, 1):
        text  = row['text']
        state = row.get('state', '')
        cat, pri = classify(text)
        ci = CAT_ICON.get(cat, '[OTHR]')
        pi = PRI_ICON[pri]
        snippet = text[:65] + '..' if len(text) > 65 else text
        print(f'  [{i:02d}] {snippet}')
        print(f'       State={state}')
        print(f'       {ci} Category={cat}   {pi} Priority={pri}')
        test_out.append({'text': text, 'state': state,
                         'pred_category': cat, 'pred_priority': pri})
save_csv(os.path.join(results_dir, 'test_predictions.csv'), test_out)

# ── 3. VALIDATION.CSV ─────────────────────────────────────────────────────────
print('\n[3] validation.csv  --  Accuracy Evaluation')
print('-' * 68)
val_path = os.path.join(base, 'validation.csv')
cc, cp, n = 0, 0, 0
val_out   = []
with open(val_path, encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        text     = row['text']
        true_cat = row['category']
        true_pri = row['priority']
        cat, pri = classify(text)
        ck = cat.lower() == true_cat.lower()
        pk = pri.lower() == true_pri.lower()
        cc += int(ck); cp += int(pk); n += 1
        snippet = text[:60] + '..' if len(text) > 60 else text
        print(f'  {snippet}')
        print(f'    Cat [{"OK" if ck else "XX"}]: Pred={cat:<16} True={true_cat}')
        print(f'    Pri [{"OK" if pk else "XX"}]: Pred={pri:<10} True={true_pri}')
        val_out.append({'text': text,
                        'true_cat': true_cat, 'pred_cat': cat, 'cat_ok': ck,
                        'true_pri': true_pri, 'pred_pri': pri, 'pri_ok': pk})
save_csv(os.path.join(results_dir, 'val_eval.csv'), val_out)

cat_acc = round(cc / n * 100, 1) if n else 0
pri_acc = round(cp / n * 100, 1) if n else 0

# ── FINAL SUMMARY ─────────────────────────────────────────────────────────────
print('\n' + '=' * 68)
print('  FINAL SUMMARY')
print('=' * 68)
print(f'  Languages supported        : English, Hinglish, Hindi Devanagari')
print(f'  Sample grievances tested   : {len(sample_out)}')
print(f'  Test predictions made      : {len(test_out)}')
print(f'  Validation Category Acc    : {cc}/{n} = {cat_acc}%')
print(f'  Validation Priority Acc    : {cp}/{n} = {pri_acc}%')
print(f'  Results saved to           : {results_dir}')
print('=' * 68)
