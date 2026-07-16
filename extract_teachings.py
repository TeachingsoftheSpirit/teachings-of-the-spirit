import os
import re
import json
from pathlib import Path
from docx import Document
from datetime import datetime

# ====== CONFIGURATION ======
ROOT_FOLDER = r"C:\Users\z\Desktop\Copy of Teachings"
OUTPUT_FILE = r"C:\Users\z\Desktop\teachings_clean.jsonl"
# ===========================

def parse_header_and_body(doc: Document):
    """
    Parse a teaching document according to the consistent format:
    Line 1: Date <tab> TITLE <tab> Location1
    Line 2: Time <tab><tab> Location2
    Then body paragraphs.
    At the end: closing phrase + end time
    """
    paragraphs = [p.text for p in doc.paragraphs]

    # Remove completely empty paragraphs at start/end but keep internal structure
    while paragraphs and not paragraphs[0].strip():
        paragraphs.pop(0)
    while paragraphs and not paragraphs[-1].strip():
        paragraphs.pop()

    if not paragraphs:
        return None

    date = ""
    title = ""
    location1 = ""
    start_time = ""
    location2 = ""
    body_paragraphs = []
    closing_phrase = ""
    end_time = ""

    # --- Parse first line ---
    first = paragraphs[0]
    # Split on tab if present, otherwise try spaces
    parts = first.split("\t")
    if len(parts) >= 3:
        date = parts[0].strip()
        title = parts[1].strip()
        location1 = parts[2].strip()
    else:
        # Fallback for slightly different early documents
        date_match = re.match(r"^([A-Za-z]+\.?\s+\d{1,2},\s+\d{4})", first)
        if date_match:
            date = date_match.group(1)
            rest = first[len(date):].strip()
            # Try to pull title (usually ALL CAPS)
            title_match = re.match(r"^([A-Z0-9\s\-\'\"\.,:;…]+)", rest)
            if title_match:
                title = title_match.group(1).strip()
                location1 = rest[len(title):].strip()

    # --- Parse second line (if it looks like time + location) ---
    idx = 1
    if len(paragraphs) > 1:
        second = paragraphs[1]
        time_match = re.search(r"(\d{1,2}:\d{2}\s*(?:AM|PM))", second, re.IGNORECASE)
        if time_match:
            start_time = time_match.group(1)
            # Everything after the time is potentially location2
            after_time = second[time_match.end():].strip()
            location2 = after_time
            idx = 2

    # --- Body + closing ---
    body_paras = paragraphs[idx:]

    # The last non-empty paragraph(s) often contain the closing phrase and end time
    if body_paras:
        last = body_paras[-1].strip()
        end_time_match = re.search(r"(\d{1,2}:\d{2}\s*(?:AM|PM))\s*$", last, re.IGNORECASE)
        if end_time_match:
            end_time = end_time_match.group(1)
            # The part before the time is the closing phrase
            closing_phrase = last[:end_time_match.start()].strip()
            body_paras = body_paras[:-1]

    # Clean body – join with double newlines to preserve paragraphs
    body = "\n\n".join(p.strip() for p in body_paras if p.strip())

    return {
        "date": date,
        "title": title,
        "location1": location1,
        "start_time": start_time,
        "location2": location2,
        "full_text": body,
        "closing_phrase": closing_phrase,
        "end_time": end_time,
    }

def extract_year_from_path(path: Path):
    # Look for a 4-digit year in the path
    match = re.search(r"(19|20)\d{2}", str(path))
    return int(match.group(0)) if match else None

def main():
    root = Path(ROOT_FOLDER)
    all_files = []

    # Collect every .docx file with its path
    for dirpath, dirnames, filenames in os.walk(root):
        for filename in filenames:
            if filename.lower().endswith(".docx") and not filename.startswith("~$"):
                full_path = Path(dirpath) / filename
                all_files.append(full_path)

    print(f"Found {len(all_files)} Word documents.")

    # Sort roughly by path (year/month/filename) for chronological order
    all_files.sort(key=lambda p: str(p).lower())

    results = []
    errors = []

    for i, file_path in enumerate(all_files, start=1):
        try:
            doc = Document(file_path)
            parsed = parse_header_and_body(doc)

            if not parsed or not parsed["title"]:
                errors.append(f"Could not parse: {file_path}")
                continue

            year = extract_year_from_path(file_path)

            record = {
                "teaching_number": i,          # clean sequential number
                "title": parsed["title"],
                "date": parsed["date"],
                "year": year,
                "start_time": parsed["start_time"],
                "location1": parsed["location1"],
                "location2": parsed["location2"],
                "full_text": parsed["full_text"],
                "closing_phrase": parsed["closing_phrase"],
                "end_time": parsed["end_time"],
                "source_file": str(file_path),
            }
            results.append(record)

            if i % 100 == 0:
                print(f"Processed {i} documents...")

        except Exception as e:
            errors.append(f"Error on {file_path}: {e}")

    # Write clean JSONL
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for record in results:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    print("\n===== DONE =====")
    print(f"Successfully extracted: {len(results)}")
    print(f"Errors / skipped:     {len(errors)}")
    print(f"Output written to:    {OUTPUT_FILE}")

    if errors:
        print("\nFirst 10 errors:")
        for e in errors[:10]:
            print(" ", e)

if __name__ == "__main__":
    main()