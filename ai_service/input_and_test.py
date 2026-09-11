"""
Jan-Samadhan Interactive Grievance Tester
==========================================
Type any grievance in English, Hinglish, or Hindi (Devanagari).
It gets saved to sample.csv AND classified instantly using the
unified tri-lingual classification engine.

Run:
    python "test 1/input_and_test.py"
"""

import sys
import io
import os
import csv
import datetime

# Set console to utf-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from classifier_engine import classify_grievance

SAMPLE_CSV = os.path.join(os.path.dirname(__file__), 'society-problem', 'sample.csv')


def print_result(res, idx):
    bar = '-' * 60
    print(f'\n  {bar}')
    print(f'  Grievance #{idx}')
    print(f'  {bar}')
    print(f'  Text     : {res["text"]}')
    print(f'  Language : {res["language"]}')
    print(f'  Category : {res["category_icon"]} {res["category"]}')
    print(f'  Priority : {res["priority_icon"]} [{res["priority"]}]')
    print(f'  Urgency  : {res["urgency"]}')
    if res.get("matched_keywords"):
        mk = res["matched_keywords"]
        if mk.get("category_phrase") or mk.get("priority_phrase"):
            print(f'  Keywords : Cat: "{mk.get("category_phrase")}" | Pri: "{mk.get("priority_phrase")}"')
    print(f'  {bar}')


def save_to_csv(entries):
    with open(SAMPLE_CSV, 'w', newline='', encoding='utf-8') as f:
        for line in entries:
            f.write(line + '\n')
    print(f'\n  [Saved] {len(entries)} grievance(s) to sample.csv')


# ── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print('=' * 68)
    print('  Jan-Samadhan  |  Interactive Grievance Input & Test')
    print('  Supports: English | Hinglish | Hindi (Devanagari)')
    print('  Commands:  "done" = finish   "clear" = reset   "show" = list all')
    print('=' * 68)

    entries = []
    if os.path.exists(SAMPLE_CSV):
        with open(SAMPLE_CSV, encoding='utf-8') as f:
            entries = [l.strip() for l in f if l.strip()]
        if entries:
            print(f'\n  [Loaded] {len(entries)} existing grievance(s) from sample.csv:')
            for i, e in enumerate(entries, 1):
                print(f'    {i}. {e}')

    counter = len(entries)

    while True:
        print()
        try:
            user_input = input('  >> Enter grievance (or command): ').strip()
        except (EOFError, KeyboardInterrupt):
            print('\n  [Exiting]')
            break

        if not user_input:
            print('  [!] Empty input. Please type a grievance.')
            continue

        cmd = user_input.lower()

        if cmd == 'done':
            save_to_csv(entries)
            print('  [Goodbye!]')
            break

        elif cmd == 'clear':
            entries = []
            counter = 0
            with open(SAMPLE_CSV, 'w', encoding='utf-8') as f:
                pass
            print('  [Cleared] sample.csv and in-memory list reset.')
            continue

        elif cmd == 'show':
            if not entries:
                print('  [Empty] No grievances entered yet.')
            else:
                print(f'\n  Current list ({len(entries)} items):')
                for i, e in enumerate(entries, 1):
                    res = classify_grievance(e)
                    print(f'    {i:2d}. {res["category_icon"]} [{res["priority"]:<8}] {e}')
            continue

        # Regular grievance text input
        counter += 1
        entries.append(user_input)

        # Append immediately to sample.csv
        with open(SAMPLE_CSV, 'a', encoding='utf-8') as f:
            f.write(user_input + '\n')

        # Classify instantly
        res = classify_grievance(user_input)
        print_result(res, counter)
        print('  [Auto-saved to sample.csv]')
