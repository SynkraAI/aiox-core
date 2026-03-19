#!/usr/bin/env python3
"""
Convert YouTube auto-generated SRT files to clean markdown.

YouTube auto-subs pattern:
  Entry N (odd):  Line1=previous_text, Line2=NEW_text
  Entry N+1 (even): Line1=previous_text, Line2=" " (blank transition)

Strategy: Extract only Line2 from odd entries, skip blank transitions.

Usage:
  python3 srt-to-md.py <srt_directory> <output_directory>
"""

import os
import re
import sys
from pathlib import Path


def parse_srt_blocks(filepath: str) -> list[dict]:
    """Parse SRT into blocks with index, timestamp, and text lines."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    blocks = re.split(r'\n\s*\n', content.strip())
    entries = []

    for block in blocks:
        lines = block.strip().split('\n')
        if len(lines) < 2:
            continue

        # Find index and timestamp
        try:
            idx = int(lines[0].strip())
        except ValueError:
            continue

        if '-->' not in lines[1]:
            continue

        # Text lines (everything after timestamp)
        text_lines = [l.strip() for l in lines[2:] if l.strip()]

        entries.append({
            'index': idx,
            'timestamp': lines[1].strip(),
            'text_lines': text_lines,
            'full_text': ' '.join(text_lines)
        })

    return entries


def extract_clean_text(entries: list[dict]) -> str:
    """
    Extract clean text from YouTube auto-generated subtitles.

    YouTube pattern: entries come in pairs
    - Odd entry: 2 lines [old_context, NEW_content]
    - Even entry: 1-2 lines [transition/echo, blank]

    We extract the LAST line from each entry that has 2+ lines,
    then deduplicate overlapping segments.
    """
    if not entries:
        return ""

    # Strategy: collect all unique text fragments
    fragments = []
    seen = set()

    for entry in entries:
        text = entry['full_text'].strip()

        # Skip empty or whitespace-only entries
        if not text:
            continue

        # For 2-line entries, take only the SECOND line (new content)
        if len(entry['text_lines']) >= 2:
            new_text = entry['text_lines'][-1].strip()
            if new_text and new_text not in seen:
                fragments.append(new_text)
                seen.add(new_text)
        elif len(entry['text_lines']) == 1:
            # Single-line entries: might be standalone or transition
            single = entry['text_lines'][0].strip()
            if single and single not in seen:
                # Check if this is a transition (echoed in next entry)
                # We'll add it and let dedup handle it
                fragments.append(single)
                seen.add(single)

    # Join fragments into continuous text
    raw_text = ' '.join(fragments)

    # Clean up common artifacts
    raw_text = re.sub(r'\s+', ' ', raw_text)  # normalize whitespace
    raw_text = re.sub(r'(\w)\s+([.,!?;:])', r'\1\2', raw_text)  # fix space before punctuation

    # Split into sentences and create paragraphs
    sentences = re.split(r'(?<=[.!?])\s+', raw_text)

    paragraphs = []
    current = []
    for sent in sentences:
        current.append(sent)
        if len(current) >= 5:
            paragraphs.append(' '.join(current))
            current = []
    if current:
        paragraphs.append(' '.join(current))

    return '\n\n'.join(paragraphs)


def extract_metadata_from_filename(filename: str) -> dict:
    """Extract video ID and title from filename like 'ID - Title.pt.srt'."""
    name = re.sub(r'\.(pt|pt-BR)\.srt$', '', filename)
    parts = name.split(' - ', 1)
    video_id = parts[0].strip() if parts else ""
    title = parts[1].strip() if len(parts) > 1 else name

    return {
        'video_id': video_id,
        'title': title,
        'url': f'https://www.youtube.com/watch?v={video_id}' if video_id else ''
    }


def get_duration_from_entries(entries: list[dict]) -> str:
    """Extract duration from last SRT entry timestamp."""
    if not entries:
        return ""
    last_ts = entries[-1]['timestamp']
    match = re.search(r'(\d+):(\d+):(\d+)', last_ts.split('-->')[1])
    if match:
        h, m, s = int(match.group(1)), int(match.group(2)), int(match.group(3))
        total_min = h * 60 + m
        if total_min >= 60:
            return f"{total_min // 60}h{total_min % 60:02d}min"
        return f"{total_min}min"
    return ""


def srt_to_markdown(srt_path: str) -> str:
    """Convert a single SRT file to clean markdown."""
    filename = os.path.basename(srt_path)
    meta = extract_metadata_from_filename(filename)
    entries = parse_srt_blocks(srt_path)
    clean_text = extract_clean_text(entries)

    if not clean_text:
        return ""

    word_count = len(clean_text.split())
    duration_str = get_duration_from_entries(entries)

    md = f"""# {meta['title']}

> **Fonte:** YouTube — Canal Paulo Vieira (@paulovcoach)
> **URL:** {meta['url']}
> **Duração:** {duration_str}
> **Palavras:** {word_count}
> **Tipo:** Transcrição automática (legendas YouTube)
> **Data de extração:** 2026-03-07

---

{clean_text}
"""
    return md


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 srt-to-md.py <srt_directory> <output_directory>")
        sys.exit(1)

    srt_dir = sys.argv[1]
    out_dir = sys.argv[2]

    if not os.path.isdir(srt_dir):
        print(f"Error: {srt_dir} is not a directory")
        sys.exit(1)

    os.makedirs(out_dir, exist_ok=True)

    srt_files = sorted(Path(srt_dir).glob("*.srt"))
    print(f"Found {len(srt_files)} SRT files")

    success = 0
    errors = 0
    total_words = 0

    for i, srt_path in enumerate(srt_files):
        try:
            md_content = srt_to_markdown(str(srt_path))
            if not md_content:
                print(f"  [{i+1}/{len(srt_files)}] SKIP (empty): {srt_path.name}")
                continue

            meta = extract_metadata_from_filename(srt_path.name)
            clean_title = re.sub(r'[^\w\s-]', '', meta['title'])
            clean_title = re.sub(r'\s+', '-', clean_title.strip())[:80]
            md_filename = f"{meta['video_id']} - {clean_title}.md"

            md_path = os.path.join(out_dir, md_filename)
            with open(md_path, 'w', encoding='utf-8') as f:
                f.write(md_content)

            words = len(md_content.split())
            total_words += words
            success += 1

            if (i + 1) % 20 == 0 or i == 0:
                print(f"  [{i+1}/{len(srt_files)}] OK: {md_filename} ({words} words)")

        except Exception as e:
            errors += 1
            print(f"  [{i+1}/{len(srt_files)}] ERROR: {srt_path.name}: {e}")

    print(f"\n{'='*60}")
    print(f"DONE!")
    print(f"  Success: {success}")
    print(f"  Errors: {errors}")
    print(f"  Total words: {total_words:,}")
    print(f"  Output: {out_dir}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
