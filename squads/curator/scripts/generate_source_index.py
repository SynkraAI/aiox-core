#!/usr/bin/env python3
"""
Generate INDEX.md for a curated source — inventory of all artifacts.

Scans _temp/mining/{slug}/ and output/curated/{slug}/ for all files
and generates a human-readable index with tables.

Usage:
    python squads/curator/scripts/generate_source_index.py <slug> [--source-name "Title"] [--youtube-id ID] [--duration HH:MM:SS]

Example:
    python squads/curator/scripts/generate_source_index.py ia-vale-do-silicio --source-name "IA no Vale do Silício" --youtube-id givmh6rb6sa --duration 04:49:04
"""

import sys
import os
import argparse
import glob
from datetime import datetime


def file_size_str(path: str) -> str:
    """Return human-readable file size."""
    if not os.path.isfile(path):
        return "—"
    size = os.path.getsize(path)
    if size < 1024:
        return f"{size} B"
    elif size < 1024 * 1024:
        return f"{size / 1024:.1f} KB"
    else:
        return f"{size / (1024 * 1024):.1f} MB"


def count_lines(path: str) -> int:
    """Count lines in a text file."""
    if not os.path.isfile(path):
        return 0
    try:
        with open(path, "r", encoding="utf-8") as f:
            return sum(1 for _ in f)
    except Exception:
        return 0


def scan_directory(base_path: str) -> list[dict]:
    """Scan directory recursively for all files."""
    files = []
    if not os.path.isdir(base_path):
        return files
    for root, dirs, filenames in os.walk(base_path):
        for fname in sorted(filenames):
            fpath = os.path.join(root, fname)
            rel_path = os.path.relpath(fpath, base_path)
            files.append({
                "name": fname,
                "rel_path": rel_path,
                "full_path": fpath,
                "size": file_size_str(fpath),
                "lines": count_lines(fpath),
                "ext": os.path.splitext(fname)[1].lower(),
            })
    return files


def generate_index(slug: str, source_name: str, youtube_id: str, duration: str) -> str:
    """Generate INDEX.md content."""
    lines = []
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    # Header
    lines.append(f"# INDEX — {source_name or slug}")
    lines.append("")
    lines.append(f"| Campo | Valor |")
    lines.append(f"|-------|-------|")
    lines.append(f"| **Slug** | `{slug}` |")
    if source_name:
        lines.append(f"| **Source** | {source_name} |")
    if youtube_id:
        lines.append(f"| **YouTube ID** | `{youtube_id}` |")
    if duration:
        lines.append(f"| **Duration** | {duration} |")
    lines.append(f"| **Generated** | {now} |")
    lines.append("")
    lines.append("---")
    lines.append("")

    # Output artifacts
    output_dir = os.path.join("output", "curated", slug)
    output_files = scan_directory(output_dir)

    lines.append("## Output Artifacts")
    lines.append("")
    if output_files:
        lines.append("| File | Size | Lines | Type |")
        lines.append("|------|------|-------|------|")
        for f in output_files:
            if f["name"] == "INDEX.md":
                continue  # Skip self
            ftype = {
                ".md": "Markdown",
                ".yaml": "YAML",
                ".yml": "YAML",
                ".json": "JSON",
                ".txt": "Text",
            }.get(f["ext"], f["ext"] or "—")
            lines.append(f"| `{f['rel_path']}` | {f['size']} | {f['lines']} | {ftype} |")
    else:
        lines.append("_No output artifacts found._")
    lines.append("")

    # Cortes breakdown
    longform_dir = os.path.join(output_dir, "cortes", "longform")
    shorts_dir = os.path.join(output_dir, "cortes", "shorts")
    longform_files = scan_directory(longform_dir)
    shorts_files = scan_directory(shorts_dir)

    if longform_files or shorts_files:
        lines.append("### Cortes Summary")
        lines.append("")
        lines.append(f"- **Longform:** {len([f for f in longform_files if f['ext'] == '.yaml'])} cut files")
        lines.append(f"- **Shorts:** {len([f for f in shorts_files if f['ext'] == '.yaml'])} cut files")
        lines.append("")

    # Temp/mining artifacts
    temp_dir = os.path.join("_temp", "mining", slug)
    temp_files = scan_directory(temp_dir)

    lines.append("## Mining Artifacts (temp)")
    lines.append("")
    if temp_files:
        lines.append("| File | Size | Lines | Type |")
        lines.append("|------|------|-------|------|")
        for f in temp_files:
            ftype = {
                ".md": "Markdown",
                ".yaml": "YAML",
                ".yml": "YAML",
                ".txt": "Text",
            }.get(f["ext"], f["ext"] or "—")
            lines.append(f"| `{f['rel_path']}` | {f['size']} | {f['lines']} | {ftype} |")
    else:
        lines.append("_No mining artifacts found._")
    lines.append("")

    # Parts breakdown
    parts_dir = os.path.join(temp_dir, "parts")
    parts_files = [f for f in temp_files if f["rel_path"].startswith("parts")]
    if parts_files:
        lines.append(f"### Mining Parts: {len(parts_files)} files")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append(f"_Generated by `squads/curator/scripts/generate_source_index.py` at {now}_")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Generate INDEX.md for a curated source."
    )
    parser.add_argument("slug", help="Source slug (e.g. 'ia-vale-do-silicio')")
    parser.add_argument("--source-name", default="", help="Human-readable source name")
    parser.add_argument("--youtube-id", default="", help="YouTube video ID")
    parser.add_argument("--duration", default="", help="Total duration (HH:MM:SS)")
    args = parser.parse_args()

    output_dir = os.path.join("output", "curated", args.slug)
    if not os.path.isdir(output_dir):
        print(f"WARNING: Output directory not found: {output_dir}")
        print(f"Creating directory...")
        os.makedirs(output_dir, exist_ok=True)

    content = generate_index(args.slug, args.source_name, args.youtube_id, args.duration)

    index_path = os.path.join(output_dir, "INDEX.md")
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"✓ INDEX.md generated: {index_path}")

    # Quick stats
    output_files = scan_directory(output_dir)
    temp_files = scan_directory(os.path.join("_temp", "mining", args.slug))
    print(f"  Output artifacts: {len(output_files) - 1}")  # -1 for INDEX.md itself
    print(f"  Mining artifacts: {len(temp_files)}")


if __name__ == "__main__":
    main()
