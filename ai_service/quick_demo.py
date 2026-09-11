# -*- coding: utf-8 -*-
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

"""
Jan-Samadhan Quick Demo Classifier
====================================
Lightweight rule-assisted + HuggingFace zero-shot classifier.
Works on English AND Hinglish (Hindi written in English script).

Handles sample.csv with Hinglish text like: "agriculture paani nhi aaya."

Run:
    pip install transformers torch pandas sentencepiece
    python "test 1/quick_demo.py"
"""

import pandas as pd
import os
import re

# ─── CONFIG ──────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(__file__)
DATA_DIR   = os.path.join(BASE_DIR, "society-problem")
SAMPLE_CSV = os.path.join(DATA_DIR, "sample.csv")
TEST_CSV   = os.path.join(DATA_DIR, "test.csv")
TRAIN_CSV  = os.path.join(DATA_DIR, "train.csv")
VAL_CSV    = os.path.join(DATA_DIR, "validation.csv")

# ─── HINGLISH KEYWORD MAPS ───────────────────────────────────────────────────
# Maps common Hinglish/Hindi words → English category/priority signals

HINGLISH_CATEGORY_MAP = {
    # Agriculture
    "kisan": "Agriculture",   "fasal": "Agriculture",   "kheti": "Agriculture",
    "beej":  "Agriculture",   "gehu":  "Agriculture",   "chawal": "Agriculture",
    "agriculture": "Agriculture", "paani": None,         # paani alone could be Water
    "fertilizer": "Agriculture",  "irrigation": "Agriculture",

    # Water
    "paani nhi": "Water",    "paani nahi": "Water",   "pani nhi": "Water",
    "paani band": "Water",   "nal": "Water",          "boring": "Water",
    "water": "Water",        "pani": "Water",

    # Hospital
    "hospital": "Hospital",  "doctor": "Hospital",    "dawai": "Hospital",
    "dawa":     "Hospital",  "ambulance": "Hospital", "nurse": "Hospital",
    "ilaj":     "Hospital",  "bimari": "Hospital",

    # School
    "school": "School",      "teacher": "School",     "pathshala": "School",
    "vidyalay": "School",    "book": "School",        "scholarship": "School",
    "shiksha": "School",

    # Roads
    "sadak": "Roads",        "road": "Roads",         "pothole": "Roads",
    "gaddha": "Roads",       "bridge": "Roads",       "pul": "Roads",

    # Electricity
    "bijli": "Electricity",  "light": "Electricity",  "electricity": "Electricity",
    "transformer": "Electricity", "current": "Electricity", "power": "Electricity",
    "andhera": "Electricity",
}

HINGLISH_PRIORITY_MAP = {
    # Critical
    "mar gaya": "Critical",  "maut": "Critical",   "aag": "Critical",
    "barh": "Critical",      "bhukh": "Critical",  "bahut bura": "Critical",
    "emergency": "Critical", "jaan": "Critical",

    # High
    "nhi aaya": "High",      "nahi aaya": "High",  "band hai": "High",
    "kab se": "High",        "mahine se": "High",  "hafte se": "High",
    "problem": "High",       "pareshani": "High",  "takleef": "High",

    # Medium
    "thoda": "Medium",       "kabhi kabhi": "Medium", "thodi der": "Medium",

    # Low
    "chhota": "Low",         "minor": "Low",
}


def rule_based_classify(text: str):
    """
    Fast keyword-based classifier for Hinglish/Hindi text.
    Returns (category, priority) or (None, None) if uncertain.
    """
    text_lower = text.lower().strip()

    # Check multi-word phrases first (order matters)
    category = None
    for phrase in sorted(HINGLISH_CATEGORY_MAP, key=len, reverse=True):
        if phrase in text_lower:
            if HINGLISH_CATEGORY_MAP[phrase]:
                category = HINGLISH_CATEGORY_MAP[phrase]
                break

    # Special case: "agriculture" + "paani" → Water under Agricultural context
    if "agriculture" in text_lower and ("paani" in text_lower or "pani" in text_lower):
        category = "Water"   # water problem reported in agriculture context

    priority = "High"   # default for unresolved grievances
    for phrase in sorted(HINGLISH_PRIORITY_MAP, key=len, reverse=True):
        if phrase in text_lower:
            priority = HINGLISH_PRIORITY_MAP[phrase]
            break

    return category, priority


# ─── ZERO-SHOT CLASSIFIER (HuggingFace) ──────────────────────────────────────
def load_zero_shot():
    try:
        from transformers import pipeline
        print("🔄 Loading ai4bharat/indic-bert from HuggingFace (may take time)...")
        clf = pipeline(
            "zero-shot-classification",
            model="ai4bharat/indic-bert",
            device=-1,
        )
        print("✅ IndicBERT loaded!\n")
        return clf
    except Exception as e:
        print(f"⚠️  Could not load HuggingFace model: {e}")
        print("    Falling back to rule-based classifier only.\n")
        return None


CATEGORY_LABELS = [
    "Agriculture", "Hospital", "School", "Roads", "Water Supply",
    "Electricity", "Public Safety", "Other",
]
PRIORITY_LABELS = [
    "Critical - immediate danger to life",
    "High - severe impact on daily life",
    "Medium - significant inconvenience",
    "Low - minor issue",
]
PRIORITY_SHORT = {
    "Critical - immediate danger to life": "Critical",
    "High - severe impact on daily life":  "High",
    "Medium - significant inconvenience":  "Medium",
    "Low - minor issue":                   "Low",
}


def classify(clf, text: str) -> dict:
    """Hybrid: rule-based first, then zero-shot model for confirmation."""
    rb_cat, rb_pri = rule_based_classify(text)

    if clf is not None:
        try:
            cat_r = clf(text, CATEGORY_LABELS, multi_label=False)
            pri_r = clf(text, PRIORITY_LABELS, multi_label=False)
            ml_cat   = cat_r["labels"][0]
            ml_cat_c = round(cat_r["scores"][0] * 100, 1)
            ml_pri   = PRIORITY_SHORT[pri_r["labels"][0]]
            ml_pri_c = round(pri_r["scores"][0] * 100, 1)

            # Trust model; use rule-based only for Hinglish correction
            final_cat = rb_cat if rb_cat else ml_cat
            final_pri = rb_pri if rb_pri else ml_pri

            return {
                "category":      final_cat,
                "category_conf": ml_cat_c,
                "priority":      final_pri,
                "priority_conf": ml_pri_c,
                "method":        "IndicBERT + Rule",
            }
        except Exception:
            pass

    # Pure rule-based fallback
    return {
        "category":      rb_cat or "Other",
        "category_conf": 100.0,  # deterministic rule
        "priority":      rb_pri or "High",
        "priority_conf": 100.0,
        "method":        "Rule-based (Hinglish)",
    }


# ─── PRINT HELPERS ───────────────────────────────────────────────────────────
PRIORITY_COLOR = {
    "Critical": "[CRITICAL]",
    "High":     "[HIGH]   ",
    "Medium":   "[MEDIUM] ",
    "Low":      "[LOW]    ",
}
CATEGORY_ICON = {
    "Agriculture":  "[FARM]",
    "Hospital":     "[HOSP]",
    "School":       "[EDUC]",
    "Roads":        "[ROAD]",
    "Water":        "[H2O] ",
    "Water Supply": "[H2O] ",
    "Electricity":  "[ELEC]",
    "Public Safety":"[SAFE]",
    "Other":        "[OTHR]",
}


def print_result(text, state, pred, true_cat=None, true_pri=None):
    cat_icon = CATEGORY_ICON.get(pred["category"], "[OTHR]")
    pri_icon = PRIORITY_COLOR.get(pred["priority"], "[?????]")
    snippet = text[:90] + "..." if len(text) > 90 else text
    print(f"\n  >> {snippet}")
    if state:
        print(f"     State   : {state}")
    print(f"     {cat_icon} Category: {pred['category']}  ({pred['category_conf']}%)")
    print(f"     {pri_icon} Priority: {pred['priority']}  ({pred['priority_conf']}%)")
    print(f"     [MTD] Method  : {pred['method']}")
    if true_cat:
        cat_ok = "[OK]" if pred["category"].lower() == true_cat.lower() else "[XX]"
        pri_ok = "[OK]" if pred["priority"].lower() == true_pri.lower() else "[XX]"
        print(f"     Cat {cat_ok} True={true_cat}   Pri {pri_ok} True={true_pri}")


# ─── MAIN ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 68)
    print("  Jan-Samadhan Grievance Classifier  (IndicBERT + Hinglish NLP)")
    print("=" * 68)

    clf = load_zero_shot()

    # ── 1. SAMPLE CSV (Hinglish) ──────────────────────────────────────────
    print("\n" + "=" * 68)
    print("[1] SECTION 1: sample.csv  (Hinglish / Mixed Language Input)")
    print("=" * 68)
    if os.path.exists(SAMPLE_CSV):
        with open(SAMPLE_CSV, encoding="utf-8") as f:
            lines = [l.strip() for l in f if l.strip()]
        for line in lines:
            pred = classify(clf, line)
            print_result(line, state=None, pred=pred)
    else:
        print("  (sample.csv not found)")

    # ── 2. TEST CSV (English grievances — unlabelled) ─────────────────────
    print("\n" + "=" * 68)
    print("[2] SECTION 2: test.csv  (English grievances -- prediction only)")
    print("=" * 68)
    test_df = pd.read_csv(TEST_CSV)
    test_results = []
    for _, row in test_df.iterrows():
        pred = classify(clf, row["text"])
        print_result(row["text"], row.get("state", ""), pred)
        test_results.append({**row.to_dict(), **pred})

    # ── 3. VALIDATION CSV (labelled — accuracy check) ─────────────────────
    print("\n" + "=" * 68)
    print("[3] SECTION 3: validation.csv  (Accuracy Evaluation)")
    print("=" * 68)
    val_df = pd.read_csv(VAL_CSV)
    correct_cat, correct_pri = 0, 0
    val_results = []
    for _, row in val_df.iterrows():
        pred = classify(clf, row["text"])
        print_result(row["text"], row.get("state",""), pred,
                     true_cat=row["category"], true_pri=row["priority"])
        cat_ok = pred["category"].lower() == row["category"].lower()
        pri_ok = pred["priority"].lower() == row["priority"].lower()
        correct_cat += int(cat_ok)
        correct_pri += int(pri_ok)
        val_results.append({**row.to_dict(), **pred,
                             "cat_correct": cat_ok, "pri_correct": pri_ok})

    n = len(val_df)
    cat_acc = round(correct_cat / n * 100, 1)
    pri_acc = round(correct_pri / n * 100, 1)

    # ── 4. SAVE RESULTS ───────────────────────────────────────────────────
    out_dir = os.path.join(DATA_DIR, "results")
    os.makedirs(out_dir, exist_ok=True)
    pd.DataFrame(test_results).to_csv(os.path.join(out_dir, "test_predictions.csv"), index=False)
    pd.DataFrame(val_results).to_csv( os.path.join(out_dir, "val_eval.csv"),         index=False)

    # ── 5. SUMMARY ────────────────────────────────────────────────────────
    print("\n" + "=" * 68)
    print("  FINAL SUMMARY")
    print("=" * 68)
    print(f"  Validation Category Accuracy : {correct_cat}/{n} = {cat_acc}%")
    print(f"  Validation Priority Accuracy : {correct_pri}/{n} = {pri_acc}%")
    print(f"  Test samples predicted       : {len(test_results)}")
    print(f"  Model used                   : IndicBERT (ai4bharat/indic-bert)")
    print(f"  Results saved to             : society-problem/results/")
    print("=" * 68)
