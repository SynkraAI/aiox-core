#!/usr/bin/env python3
"""
Markdown Link Checker for AIOS Documentation

Validates internal markdown links and tracks documentation status.
Inspired by Obsidian's broken link checker.

Usage:
    python scripts/check-markdown-links.py              # Default report
    python scripts/check-markdown-links.py --json       # JSON output for CI
    python scripts/check-markdown-links.py --fix        # Auto-fix broken links (add coming soon)
    python scripts/check-markdown-links.py --summary    # Quick summary only

Exit codes:
    0 - All links valid (or only coming soon)
    1 - Broken links found (needs attention)
    2 - Incorrect markings found (exists but marked coming soon)
"""

import argparse
import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Optional

# Configuration
DOCS_DIR = "docs"
LINK_PATTERN = re.compile(r'\[([^\]]*)\]\(([^)]+)\)')
COMING_SOON_MARKER = " *(coming soon)*"


def normalize_path(source_file: str, link: str) -> Optional[str]:
    """Resolve a relative link to an absolute path."""
    # Skip external links, mailto, and anchors
    if link.startswith(('http://', 'https://', 'mailto:', '#')):
        return None

    # Remove anchor from link
    link = link.split('#')[0]
    if not link:
        return None

    # Handle URL encoding
    link = link.replace('%20', ' ')

    # Resolve relative path
    source_dir = os.path.dirname(source_file)
    return os.path.normpath(os.path.join(source_dir, link))


def is_coming_soon(line: str, link: str) -> bool:
    """Check if a link is marked as coming soon."""
    link_escaped = re.escape(f"]({link})")
    return bool(re.search(link_escaped + r'.*coming soon', line, re.IGNORECASE))


def scan_file(filepath: str) -> dict:
    """Scan a markdown file for link issues."""
    results = {
        'broken': [],
        'coming_soon': [],
        'incorrect_marking': [],
        'valid': []
    }

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        for line_num, line in enumerate(lines, 1):
            for match in LINK_PATTERN.finditer(line):
                text, link = match.group(1), match.group(2)
                resolved = normalize_path(filepath, link)

                if resolved is None:
                    continue

                exists = os.path.exists(resolved)
                coming_soon = is_coming_soon(line, link)

                info = {
                    'line': line_num,
                    'text': text,
                    'link': link,
                    'resolved': resolved,
                    'line_content': line.rstrip()
                }

                if exists and coming_soon:
                    results['incorrect_marking'].append(info)
                elif not exists and coming_soon:
                    results['coming_soon'].append(info)
                elif not exists:
                    results['broken'].append(info)
                else:
                    results['valid'].append(info)

    except Exception as e:
        print(f"Error scanning {filepath}: {e}", file=sys.stderr)

    return results


def fix_broken_link(filepath: str, line_num: int, link: str) -> bool:
    """Add 'coming soon' marker to a broken link."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        line_idx = line_num - 1
        line = lines[line_idx]

        # Find the link and add marker after it
        pattern = re.escape(f"]({link})")
        if re.search(pattern + r'\s*\*\(coming soon\)\*', line, re.IGNORECASE):
            return False  # Already marked

        new_line = re.sub(
            pattern,
            f"]({link}){COMING_SOON_MARKER}",
            line
        )

        if new_line != line:
            lines[line_idx] = new_line
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            return True

    except Exception as e:
        print(f"Error fixing {filepath}:{line_num}: {e}", file=sys.stderr)

    return False


def fix_incorrect_marking(filepath: str, line_num: int, link: str) -> bool:
    """Remove 'coming soon' marker from a link to existing file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        line_idx = line_num - 1
        line = lines[line_idx]

        # Remove the coming soon marker after this specific link
        pattern = re.escape(f"]({link})") + r'\s*\*\(coming soon\)\*'
        new_line = re.sub(pattern, f"]({link})", line, flags=re.IGNORECASE)

        if new_line != line:
            lines[line_idx] = new_line
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            return True

    except Exception as e:
        print(f"Error fixing {filepath}:{line_num}: {e}", file=sys.stderr)

    return False


def scan_docs(docs_dir: str = DOCS_DIR) -> dict:
    """Scan all markdown files in docs directory."""
    all_results = {
        'broken': [],
        'coming_soon': [],
        'incorrect_marking': [],
        'valid': [],
        'files_scanned': 0
    }

    for root, _, files in os.walk(docs_dir):
        for file in files:
            if file.endswith('.md'):
                filepath = os.path.join(root, file)
                results = scan_file(filepath)

                all_results['files_scanned'] += 1
                all_results['broken'].extend([(filepath, i) for i in results['broken']])
                all_results['coming_soon'].extend([(filepath, i) for i in results['coming_soon']])
                all_results['incorrect_marking'].extend([(filepath, i) for i in results['incorrect_marking']])
                all_results['valid'].extend([(filepath, i) for i in results['valid']])

    return all_results


def print_report(results: dict, verbose: bool = True):
    """Print a human-readable report."""
    print("=" * 70)
    print("MARKDOWN LINK VERIFICATION REPORT")
    print("=" * 70)
    print()

    # Broken links
    print(f"## 1. BROKEN LINKS (no 'coming soon' marker): {len(results['broken'])}")
    print("-" * 60)
    if verbose and results['broken']:
        for fp, info in sorted(results['broken'], key=lambda x: x[0]):
            print(f"  {fp}:{info['line']} -> {info['link']}")
    print()

    # Incorrect markings
    print(f"## 2. INCORRECT: File EXISTS but marked 'coming soon': {len(results['incorrect_marking'])}")
    print("-" * 60)
    if verbose and results['incorrect_marking']:
        for fp, info in sorted(results['incorrect_marking'], key=lambda x: x[0]):
            print(f"  {fp}:{info['line']} -> {info['link']}")
    print()

    # Coming soon (planned content)
    print(f"## 3. PLANNED CONTENT: Links marked 'coming soon': {len(results['coming_soon'])}")
    print("-" * 60)
    if verbose and results['coming_soon']:
        by_dest = defaultdict(list)
        for fp, info in results['coming_soon']:
            by_dest[info['link']].append(fp)
        for link, sources in sorted(by_dest.items()):
            print(f"  {link} ({len(sources)} refs)")
    print()

    # Summary
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"  Files scanned: {results['files_scanned']}")
    print(f"  Valid links: {len(results['valid'])}")
    print(f"  Broken links (ACTION: mark coming soon): {len(results['broken'])}")
    print(f"  Incorrect markings (ACTION: remove coming soon): {len(results['incorrect_marking'])}")
    print(f"  Planned content (coming soon): {len(results['coming_soon'])}")

    # Unique destinations to create
    unique_dests = set(info['link'] for _, info in results['coming_soon'])
    print(f"  Unique destinations to create: {len(unique_dests)}")


def print_json(results: dict):
    """Print results as JSON for CI integration."""
    output = {
        'summary': {
            'files_scanned': results['files_scanned'],
            'valid_links': len(results['valid']),
            'broken_links': len(results['broken']),
            'incorrect_markings': len(results['incorrect_marking']),
            'coming_soon_links': len(results['coming_soon']),
        },
        'broken': [
            {'file': fp, **info}
            for fp, info in results['broken']
        ],
        'incorrect_marking': [
            {'file': fp, **info}
            for fp, info in results['incorrect_marking']
        ],
        'coming_soon_destinations': list(set(
            info['link'] for _, info in results['coming_soon']
        ))
    }
    print(json.dumps(output, indent=2))


def print_summary(results: dict):
    """Print a quick summary only."""
    broken = len(results['broken'])
    incorrect = len(results['incorrect_marking'])
    coming_soon = len(results['coming_soon'])

    status = "PASS" if broken == 0 and incorrect == 0 else "FAIL"

    print(f"Link Check: {status}")
    print(f"  Broken: {broken} | Incorrect: {incorrect} | Coming Soon: {coming_soon}")

    if broken > 0:
        print(f"  Run with --fix to auto-mark broken links as 'coming soon'")
    if incorrect > 0:
        print(f"  Run with --fix to remove incorrect 'coming soon' markers")


def main():
    parser = argparse.ArgumentParser(
        description="Check markdown links in AIOS documentation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        '--json',
        action='store_true',
        help='Output results as JSON'
    )
    parser.add_argument(
        '--fix',
        action='store_true',
        help='Auto-fix issues (add/remove coming soon markers)'
    )
    parser.add_argument(
        '--summary',
        action='store_true',
        help='Show summary only'
    )
    parser.add_argument(
        '--dir',
        default=DOCS_DIR,
        help=f'Directory to scan (default: {DOCS_DIR})'
    )

    args = parser.parse_args()

    # Scan documentation
    results = scan_docs(args.dir)

    # Auto-fix if requested
    if args.fix:
        fixed_broken = 0
        fixed_incorrect = 0

        # Fix broken links (add coming soon)
        for fp, info in results['broken']:
            if fix_broken_link(fp, info['line'], info['link']):
                fixed_broken += 1

        # Fix incorrect markings (remove coming soon)
        for fp, info in results['incorrect_marking']:
            if fix_incorrect_marking(fp, info['line'], info['link']):
                fixed_incorrect += 1

        print(f"Fixed {fixed_broken} broken links (added 'coming soon')")
        print(f"Fixed {fixed_incorrect} incorrect markings (removed 'coming soon')")
        print()

        # Re-scan after fixes
        results = scan_docs(args.dir)

    # Output results
    if args.json:
        print_json(results)
    elif args.summary:
        print_summary(results)
    else:
        print_report(results)

    # Exit code
    if len(results['broken']) > 0:
        sys.exit(1)
    elif len(results['incorrect_marking']) > 0:
        sys.exit(2)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
