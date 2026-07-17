import os
import re
import json
from pathlib import Path
from docx import Document
from datetime import datetime

ROOT_FOLDER = r"C:\Users\z\Desktop\Copy of Teachings"
OUTPUT_FILE = r"C:\Users\z\Desktop\teachings_clean.jsonl"


def parse_date_from_filename(filename: str):
    patterns = [
        r"^(\d{1,2})-(\d{1,2})-(\d{4})",
        r"^(\d{4})-(\d{1,2})-(\d{1,2})",
        r"^(\d{1,2})/(\d{1,2})/(\d{4})",
    ]
    for pattern in patterns:
        match = re.match(pattern, filename)
        if match:
            groups = match.groups()
            try:
                if int(groups[0]) > 1900:
                    year, month, day = int(groups[0]), int(groups[1]), int(groups[2])
                else:
                    month, day, year = int(groups[0]), int(groups[1]), int(groups[2])
                return datetime(year, month, day)
            except ValueError:
                continue
    return None


def parse_date_from_header(text: str):
    text = text.strip()
    patterns = [
        r"^([A-Za-z]+\.?\s+\d{1,2},\s+\d{4})",
        r"^([A-Za-z]+\s+\d{1,2},\s+\d{4})",
        r"^(\d{1,2}\s+[A-Za-z]+\s+\d{4})",
        r"^([A-Za-z]{3,9}\.?\s+\d{1,2}\s+\d{4})",
    ]
    for pattern in patterns:
        match = re.match(pattern, text)
        if match:
            date_str = match.group(1)
            for fmt in ["%b. %d, %Y", "%B %d, %Y", "%d %B %Y", "%b %d %Y"]:
                try:
                    return datetime.strptime(date_str, fmt)
                except ValueError:
                    continue
    return None


def parse_header_and_body(doc: Document, filename: str):
    paragraphs = [p.text for p in doc.paragraphs]
    while paragraphs and not paragraphs[0].strip():
        paragraphs.pop(0)
    while paragraphs and not paragraphs[-1].strip():
        paragraphs.pop()

    if not paragraphs:
        return None

    date_obj = parse_date_from_filename(filename)
    if not date_obj and paragraphs:
        date_obj = parse_date_from_header(paragraphs[0])

    date_str = date_obj.strftime("%b. %d, %Y") if date_obj else ""

    title = ""
    location1 = ""
    start_time = ""
    location2 = ""
    closing_phrase = ""
    end_time = ""

    first = paragraphs[0]
    parts = first.split("\t")

    # Detect format
    is_early_format = False
    if len(parts) >= 3:
        third_part = parts[2].strip()
        if re.search(r"\d{1,2}:\d{2}\s*(AM|PM)", third_part, re.IGNORECASE):
            is_early_format = True

    if is_early_format:
        # Format 1: May 1979 – early May 1980
        # Line 1: Date | Title | Time
        if len(parts) >= 3:
            title = parts[1].strip()
            start_time = parts[2].strip()
    else:
        # Format 2: May 1980 onwards (most common)
        if len(parts) >= 3:
            title = parts[1].strip()
            location1 = parts[2].strip()

        # Second line usually contains Time + Location 2
        if len(paragraphs) > 1:
            second = paragraphs[1]
            time_match = re.search(r"(\d{1,2}:\d{2}\s*(?:AM|PM))", second, re.IGNORECASE)
            if time_match:
                start_time = time_match.group(1)
                after_time = second[time_match.end():].strip()
                location2 = after_time

    # Body + closing
    idx = 2 if not is_early_format else 1
    body_paras = paragraphs[idx:] if len(paragraphs) > idx else []

    if body_paras:
        last = body_paras[-1].strip()
        end_time_match = re.search(r"(\d{1,2}:\d{2}\s*(?:AM|PM))\s*$", last, re.IGNORECASE)
        if end_time_match:
            end_time = end_time_match.group(1)
            closing_phrase = last[:end_time_match.start()].strip()
            body_paras = body_paras[:-1]

    body = "\n\n".join(p.strip() for p in body_paras if p.strip())

    return {
        "date": date_str,
        "date_obj": date_obj,
        "title": title,
        "location1": location1,
        "start_time": start_time,
        "location2": location2,
        "full_text": body,
        "closing_phrase": closing_phrase,
        "end_time": end_time,
    }


def main():
    root = Path(ROOT_FOLDER)
    all_files = []

    for dirpath, dirnames, filenames in os.walk(root):
        for filename in filenames:
            if filename.lower().endswith(".docx") and not filename.startswith("~$"):
                all_files.append(Path(dirpath) / filename)

    print(f"Found {len(all_files)} Word documents.")

    file_data = []
    errors = []

    for file_path in all_files:
        try:
            doc = Document(file_path)
            parsed = parse_header_and_body(doc, file_path.name)
            if parsed and parsed["title"]:
                if not parsed["date_obj"]:
                    year = None
                    match = re.search(r"(19|20)\d{2}", str(file_path))
                    if match:
                        year = int(match.group(0))
                        parsed["date_obj"] = datetime(year, 1, 1)
                        parsed["date"] = f"Year {year} (approx)"
                file_data.append({"path": file_path, "parsed": parsed})
            else:
                errors.append(str(file_path))
        except Exception as e:
            errors.append(f"{file_path}: {e}")

    print(f"Successfully parsed {len(file_data)} documents.")
    if errors:
        print(f"Skipped {len(errors)} files.")

    file_data.sort(key=lambda x: x["parsed"]["date_obj"] if x["parsed"]["date_obj"] else datetime(1900, 1, 1))

    results = []
    for i, item in enumerate(file_data, start=1):
        parsed = item["parsed"]
        year = parsed["date_obj"].year if parsed["date_obj"] else None

        record = {
            "teaching_number": i,
            "title": parsed["title"],
            "date": parsed["date"],
            "year": year,
            "start_time": parsed["start_time"],
            "location1": parsed["location1"],
            "location2": parsed["location2"],
            "full_text": parsed["full_text"],
            "closing_phrase": parsed["closing_phrase"],
            "end_time": parsed["end_time"],
            "source_file": str(item["path"]),
        }
        results.append(record)

        if i % 100 == 0:
            print(f"Processed {i} documents...")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for record in results:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    print("\n===== DONE =====")
    print(f"Successfully extracted: {len(results)}")
    print(f"Output written to: {OUTPUT_FILE}")
    if errors:
        print(f"Files with parsing issues: {len(errors)}")


if __name__ == "__main__":
    main()