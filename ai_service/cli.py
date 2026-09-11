"""
Jan-Samadhan Grievance Classifier - Command Line Interface (CLI)
================================================================
Easily classify grievances directly from the terminal or process CSV files.

Examples:
    python cli.py "खेत में पानी नहीं आ रहा है।"
    python cli.py "hospital me medicine khatam ho gayi hai"
    python cli.py --file society-problem/sample.csv
    python cli.py --file society-problem/sample.csv --output results.csv
"""

import sys
import io
import os
import csv
import argparse

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from classifier_engine import classify_grievance, classify_batch, CAT_ICON, PRI_ICON, URGENCY


def print_single(res):
    print('─' * 60)
    print(f'  Text     : {res["text"]}')
    print(f'  Language : {res["language"]}')
    print(f'  Category : {res["category_icon"]} {res["category"]}')
    print(f'  Priority : {res["priority_icon"]} {res["priority"]}')
    print(f'  Urgency  : {res["urgency"]}')
    if res.get("matched_keywords"):
        mk = res["matched_keywords"]
        if mk.get("category_phrase") or mk.get("priority_phrase"):
            print(f'  Keywords : Cat: "{mk.get("category_phrase")}" | Pri: "{mk.get("priority_phrase")}"')
    print('─' * 60)


def process_file(filepath, output_path=None):
    if not os.path.exists(filepath):
        print(f"[Error] File not found: {filepath}")
        return

    lines = []
    with open(filepath, encoding='utf-8') as f:
        # Check if CSV has header or plain text
        first_line = f.readline()
        f.seek(0)
        if 'text' in first_line.lower() or 'complaint' in first_line.lower():
            reader = csv.DictReader(f)
            text_col = [col for col in reader.fieldnames if 'text' in col.lower() or 'complaint' in col.lower()][0]
            for row in reader:
                if row.get(text_col):
                    lines.append(row[text_col].strip())
        else:
            for l in f:
                l = l.strip()
                if l:
                    lines.append(l)

    print(f"\n[Processing] {len(lines)} grievances from {filepath}...")
    results = classify_batch(lines)

    print('=' * 72)
    print(f'  {"#":<4} {"Lang":<6} {"Cat":<6} {"Category":<15} {"Priority":<10} {"Snippet"}')
    print('=' * 72)
    for i, r in enumerate(results, 1):
        snip = r["text"][:35] + ('...' if len(r["text"]) > 35 else '')
        print(f'  {i:<4} {r["language"][:5]:<6} {r["category_icon"]:<6} {r["category"]:<15} {r["priority"]:<10} {snip}')

    if output_path:
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=["text", "language", "category", "priority", "urgency"])
            writer.writeheader()
            for r in results:
                writer.writerow({
                    "text": r["text"],
                    "language": r["language"],
                    "category": r["category"],
                    "priority": r["priority"],
                    "urgency": r["urgency"]
                })
        print(f"\n[Saved] Results saved to {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Jan-Samadhan Grievance Classifier CLI")
    parser.add_argument("text", nargs="?", help="Grievance text to classify (English, Hinglish, or Hindi)")
    parser.add_argument("--file", "-f", help="Path to text or CSV file containing grievances")
    parser.add_argument("--output", "-o", help="Output path to save predictions CSV")

    args = parser.parse_args()

    if args.file:
        process_file(args.file, args.output)
    elif args.text:
        res = classify_grievance(args.text)
        print_single(res)
    else:
        # Interactive mode
        print("=" * 60)
        print("  Jan-Samadhan Classifier CLI (Interactive)")
        print("  Type any grievance below (type 'exit' to quit):")
        print("=" * 60)
        while True:
            try:
                line = input("\n>> ").strip()
            except (EOFError, KeyboardInterrupt):
                break
            if not line or line.lower() == 'exit':
                break
            res = classify_grievance(line)
            print_single(res)


if __name__ == "__main__":
    main()
