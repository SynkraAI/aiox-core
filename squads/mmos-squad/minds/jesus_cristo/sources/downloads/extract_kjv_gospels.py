#!/usr/bin/env python3
"""
Extract Gospel texts from KJV Bible text file
"""
import re
from pathlib import Path

DOWNLOADS_DIR = Path("/Users/oalanicolas/Documents/Code/mente_lendaria/outputs/minds/jesus_cristo/sources/downloads")
KJV_FILE = DOWNLOADS_DIR / "kjv_full.txt"

def extract_kjv_gospel_by_line_numbers(kjv_text, start_line, end_line, gospel_name):
    """Extract a gospel using line numbers from grep output"""

    lines = kjv_text.split('\n')
    gospel_lines = lines[start_line:end_line]

    gospel_text = [f"# {gospel_name}\n"]
    gospel_text.append(f"## Translation: King James Version (KJV)\n\n")

    current_chapter = 0

    for line in gospel_lines:
        if line.strip():
            # Check for chapter:verse pattern
            verse_match = re.match(r'^(\d+):(\d+)\s', line)
            if verse_match:
                chapter = int(verse_match.group(1))
                verse = int(verse_match.group(2))

                # New chapter detected
                if chapter != current_chapter:
                    current_chapter = chapter
                    gospel_text.append(f"\n## Chapter {current_chapter}\n\n")

            gospel_text.append(line + '\n')

    return ''.join(gospel_text)

def main():
    """Extract all four Gospels from KJV Bible"""

    if not KJV_FILE.exists():
        print(f"⚠ KJV file not found: {KJV_FILE}")
        return []

    print(f"Reading KJV Bible from {KJV_FILE.name}...")

    with open(KJV_FILE, 'r', encoding='utf-8', errors='ignore') as f:
        kjv_text = f.read()

    print(f"Loaded {len(kjv_text):,} characters\n")
    print("Extracting Gospels from King James Version...\n")

    # Based on grep output, the gospels are at these line numbers
    gospels_info = [
        ("Matthew", 76388, 79450),  # Line before Mark
        ("Mark", 79450, 81422),     # Line before Luke
        ("Luke", 81422, 84748),     # Line before John
        ("John", 84748, 87500),     # Approximate end (before Acts would be better)
    ]

    extracted_files = []

    for gospel_name, start, end in gospels_info:
        print(f"📖 Processing {gospel_name} (lines {start}-{end})...")

        gospel_text = extract_kjv_gospel_by_line_numbers(kjv_text, start, end, gospel_name)

        if gospel_text and len(gospel_text) > 1000:
            output_file = DOWNLOADS_DIR / f"kjv_{gospel_name.lower()}.txt"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(gospel_text)

            chapter_count = gospel_text.count('## Chapter')
            print(f"✓ Extracted: {output_file.name} ({chapter_count} chapters, {len(gospel_text):,} chars)")
            extracted_files.append(output_file)
        else:
            print(f"✗ Could not extract {gospel_name}")

    print(f"\n✅ Successfully extracted {len(extracted_files)} KJV gospels")

    return extracted_files

if __name__ == "__main__":
    main()
