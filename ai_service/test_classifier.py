"""
Jan-Samadhan Grievance Classifier
===================================
Uses AI4Bharat IndicBERT (via HuggingFace) for zero-shot classification
of public grievances by CATEGORY and PRIORITY/URGENCY.

Model: ai4bharat/indic-bert  (multilingual, covers 12 Indian languages + English)
Source: https://github.com/AI4Bharat/Indic-BERT-v1

Run:
    pip install transformers torch pandas
    python "test 1/test_classifier.py"
"""

import pandas as pd
from transformers import pipeline
import json
import os

# ─── CONFIG ──────────────────────────────────────────────────────────────────
DATA_DIR   = os.path.join(os.path.dirname(__file__), "society-problem")
TRAIN_CSV  = os.path.join(DATA_DIR, "train.csv")
VAL_CSV    = os.path.join(DATA_DIR, "validation.csv")
TEST_CSV   = os.path.join(DATA_DIR, "test.csv")

# IndicBERT on HuggingFace (AI4Bharat's multilingual BERT trained on Indian corpora)
MODEL_NAME = "ai4bharat/indic-bert"

CATEGORY_LABELS = [
    "Agriculture",
    "Hospital",
    "School",
    "Roads",
    "Water Supply",
    "Electricity",
    "Public Safety",
    "Other",
]

PRIORITY_LABELS = [
    "Critical - immediate danger to life or property",
    "High - severe impact on daily life",
    "Medium - significant inconvenience",
    "Low - minor issue",
]

PRIORITY_MAP = {
    "Critical - immediate danger to life or property": "Critical",
    "High - severe impact on daily life":              "High",
    "Medium - significant inconvenience":              "Medium",
    "Low - minor issue":                               "Low",
}

# ─── LOAD MODEL ──────────────────────────────────────────────────────────────
def load_classifier():
    print(f"\n🔄 Loading zero-shot classifier: {MODEL_NAME}")
    print("   (First run will download ~1 GB model weights — please wait)\n")
    clf = pipeline(
        "zero-shot-classification",
        model=MODEL_NAME,
        tokenizer=MODEL_NAME,
        device=-1,           # CPU; change to 0 for GPU
    )
    print("✅ Model loaded successfully!\n")
    return clf


# ─── CLASSIFY ────────────────────────────────────────────────────────────────
def classify_grievance(clf, text: str) -> dict:
    """Returns category + priority prediction with confidence scores."""
    # Category prediction
    cat_result  = clf(text, CATEGORY_LABELS,    multi_label=False)
    # Priority prediction
    pri_result  = clf(text, PRIORITY_LABELS,    multi_label=False)

    category    = cat_result["labels"][0]
    cat_score   = round(cat_result["scores"][0] * 100, 1)

    priority    = PRIORITY_MAP[pri_result["labels"][0]]
    pri_score   = round(pri_result["scores"][0] * 100, 1)

    return {
        "category":          category,
        "category_conf_%":   cat_score,
        "priority":          priority,
        "priority_conf_%":   pri_score,
    }


# ─── EVALUATE ON LABELLED SET ────────────────────────────────────────────────
def evaluate(clf, csv_path: str, label: str):
    df = pd.read_csv(csv_path)
    print(f"\n{'='*70}")
    print(f"📊 Evaluating on {label} set  ({len(df)} samples)")
    print(f"{'='*70}")

    correct_cat  = 0
    correct_pri  = 0

    results = []
    for _, row in df.iterrows():
        text    = row["text"]
        true_cat = row["category"]
        true_pri = row["priority"]

        pred = classify_grievance(clf, text)
        pred_cat = pred["category"]
        pred_pri = pred["priority"]

        cat_ok  = pred_cat.lower() == true_cat.lower()
        pri_ok  = pred_pri.lower() == true_pri.lower()
        correct_cat += int(cat_ok)
        correct_pri += int(pri_ok)

        status_cat = "✅" if cat_ok else "❌"
        status_pri = "✅" if pri_ok else "❌"

        print(f"\n📝 {text[:90]}...")
        print(f"   State    : {row.get('state', 'N/A')}")
        print(f"   Category : {status_cat} Pred={pred_cat:<18} True={true_cat}  ({pred['category_conf_%']}%)")
        print(f"   Priority : {status_pri} Pred={pred_pri:<10} True={true_pri}  ({pred['priority_conf_%']}%)")

        results.append({
            "text":          text,
            "state":         row.get("state", ""),
            "true_category": true_cat,
            "pred_category": pred_cat,
            "cat_conf_%":    pred["category_conf_%"],
            "true_priority": true_pri,
            "pred_priority": pred_pri,
            "pri_conf_%":    pred["priority_conf_%"],
            "cat_correct":   cat_ok,
            "pri_correct":   pri_ok,
        })

    n = len(df)
    cat_acc = round(correct_cat / n * 100, 1)
    pri_acc = round(correct_pri / n * 100, 1)

    print(f"\n{'─'*70}")
    print(f"📈 {label} Results:")
    print(f"   Category Accuracy : {correct_cat}/{n}  = {cat_acc}%")
    print(f"   Priority Accuracy : {correct_pri}/{n}  = {pri_acc}%")
    print(f"{'─'*70}\n")

    return pd.DataFrame(results), cat_acc, pri_acc


# ─── PREDICT ON TEST SET ─────────────────────────────────────────────────────
def predict_test(clf, csv_path: str):
    df = pd.read_csv(csv_path)
    print(f"\n{'='*70}")
    print(f"🔮 Predicting on TEST set  ({len(df)} samples — no ground truth)")
    print(f"{'='*70}")

    results = []
    for i, row in df.iterrows():
        text  = row["text"]
        state = row.get("state", "")
        pred  = classify_grievance(clf, text)

        print(f"\n[{i+1:02d}] 📝 {text[:85]}...")
        print(f"      State    : {state}")
        print(f"      Category : {pred['category']}  ({pred['category_conf_%']}%)")
        print(f"      Priority : {pred['priority']}  ({pred['priority_conf_%']}%)")

        results.append({
            "text":           text,
            "state":          state,
            "pred_category":  pred["category"],
            "cat_conf_%":     pred["category_conf_%"],
            "pred_priority":  pred["priority"],
            "pri_conf_%":     pred["priority_conf_%"],
        })

    return pd.DataFrame(results)


# ─── MAIN ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("╔══════════════════════════════════════════════════════════════════╗")
    print("║    Jan-Samadhan Grievance Classifier  (IndicBERT / AI4Bharat)   ║")
    print("╚══════════════════════════════════════════════════════════════════╝")

    clf = load_classifier()

    # 1. Evaluate on train sample (first 10 rows for speed)
    train_df = pd.read_csv(TRAIN_CSV).head(10)
    train_df.to_csv(TRAIN_CSV.replace(".csv", "_sample.csv"), index=False)
    train_results, train_cat_acc, train_pri_acc = evaluate(
        clf, TRAIN_CSV.replace(".csv", "_sample.csv"), "TRAIN (sample n=10)"
    )

    # 2. Evaluate on validation set
    val_results, val_cat_acc, val_pri_acc = evaluate(clf, VAL_CSV, "VALIDATION")

    # 3. Predict on unlabelled test set
    test_results = predict_test(clf, TEST_CSV)

    # ─── SAVE RESULTS ────────────────────────────────────────────────────────
    out_dir = os.path.join(DATA_DIR, "results")
    os.makedirs(out_dir, exist_ok=True)

    train_results.to_csv(os.path.join(out_dir, "train_eval.csv"),  index=False)
    val_results.to_csv(  os.path.join(out_dir, "val_eval.csv"),    index=False)
    test_results.to_csv( os.path.join(out_dir, "test_predictions.csv"), index=False)

    summary = {
        "model":                MODEL_NAME,
        "train_sample_cat_acc": f"{train_cat_acc}%",
        "train_sample_pri_acc": f"{train_pri_acc}%",
        "validation_cat_acc":   f"{val_cat_acc}%",
        "validation_pri_acc":   f"{val_pri_acc}%",
        "test_samples":         len(test_results),
        "results_dir":          out_dir,
    }
    with open(os.path.join(out_dir, "summary.json"), "w") as f:
        json.dump(summary, f, indent=2)

    print("\n╔══════════════════════════════════════════════════════════════════╗")
    print("║                      FINAL SUMMARY                              ║")
    print("╠══════════════════════════════════════════════════════════════════╣")
    for k, v in summary.items():
        print(f"║  {k:<32}: {str(v):<30} ║")
    print("╚══════════════════════════════════════════════════════════════════╝")
    print(f"\n📁 Results saved to: {out_dir}")
