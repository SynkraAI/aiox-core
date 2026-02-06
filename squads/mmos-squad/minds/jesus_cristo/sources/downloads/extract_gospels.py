#!/usr/bin/env python3
"""
Extract Gospel texts from Bible JSON files
"""
import json
from pathlib import Path

DOWNLOADS_DIR = Path("/Users/oalanicolas/Documents/Code/mente_lendaria/outputs/minds/jesus_cristo/sources/downloads")

# Gospel book names in Portuguese
GOSPELS_PT = {
    "Mateus": "mt",
    "Marcos": "mc",
    "Lucas": "lc",
    "João": "jo"
}

def extract_gospel_from_json(json_file, output_prefix, book_name, book_abbrev):
    """Extract a specific gospel from a JSON Bible file"""
    try:
        with open(json_file, 'r', encoding='utf-8-sig') as f:
            bible_data = json.load(f)

        # Find the gospel book by name or abbreviation
        gospel_text = []
        found = False

        for book in bible_data:
            if book['name'] == book_name or book['abbrev'] == book_abbrev:
                found = True
                gospel_text.append(f"# {book['name']}\n")
                gospel_text.append(f"## Tradução: {output_prefix.upper()}\n")
                gospel_text.append(f"## Abreviação: {book['abbrev']}\n\n")

                chapters = book.get('chapters', [])
                for chapter_num, verses in enumerate(chapters, 1):
                    gospel_text.append(f"\n## Capítulo {chapter_num}\n\n")

                    for verse_num, verse_text in enumerate(verses, 1):
                        gospel_text.append(f"{verse_num}. {verse_text}\n")

                break

        if found:
            output_file = DOWNLOADS_DIR / f"{output_prefix}_{book_abbrev}.txt"
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(''.join(gospel_text))
            print(f"✓ Extracted: {output_file.name} ({len(chapters)} chapters)")
            return output_file
        else:
            print(f"✗ Book '{book_name}' not found in {json_file.name}")
            return None

    except Exception as e:
        print(f"Error processing {json_file}: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    """Extract all four Gospels from Portuguese Bible translations"""

    bible_files = {
        'acf': DOWNLOADS_DIR / 'acf_full.json',  # Almeida Corrigida e Fiel
        'nvi': DOWNLOADS_DIR / 'nvi_full.json',  # Nova Versão Internacional
        'aa': DOWNLOADS_DIR / 'aa_full.json',    # Almeida Revisada
    }

    print("Extracting Gospels from Portuguese Bible translations...\n")

    extracted_files = []

    for prefix, json_file in bible_files.items():
        if json_file.exists():
            print(f"\n📖 Processing {prefix.upper()} ({json_file.name})")
            for book_name, book_abbrev in GOSPELS_PT.items():
                result = extract_gospel_from_json(json_file, prefix, book_name, book_abbrev)
                if result:
                    extracted_files.append(result)
        else:
            print(f"⚠ File not found: {json_file}")

    print(f"\n✅ Successfully extracted {len(extracted_files)} gospel texts")

    # List all extracted files
    print("\n📄 Extracted files:")
    for f in extracted_files:
        print(f"  - {f.name}")

    return extracted_files

if __name__ == "__main__":
    main()
