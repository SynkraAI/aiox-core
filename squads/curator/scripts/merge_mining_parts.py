#!/usr/bin/env python3
"""
Merge mining part files into a single consolidated file.
Strips headers/summaries from each part, extracts MOMENTO blocks,
renumbers sequentially, and generates a consolidated output.

Usage: python squads/curator/scripts/merge_mining_parts.py <parts_dir> <output_file>

Example:
    python squads/curator/scripts/merge_mining_parts.py _temp/mining/my-source/parts _temp/mining/my-source/all_moments_merged.md
"""

import sys
import os
import re
import glob
from datetime import datetime


def extract_moments(content: str) -> list[str]:
    """Extract all ### MOMENTO blocks from content."""
    # Split on ### MOMENTO headers
    pattern = r'(### MOMENTO \d+.*?)(?=### MOMENTO \d+|\Z)'
    matches = re.findall(pattern, content, re.DOTALL)
    return [m.strip() for m in matches if m.strip()]


def renumber_moment(block: str, new_number: int) -> str:
    """Replace the moment number in a block header."""
    return re.sub(r'### MOMENTO \d+', f'### MOMENTO {new_number}', block, count=1)


def main():
    if len(sys.argv) < 3:
        print("Usage: python squads/curator/scripts/merge_mining_parts.py <parts_dir> <output_file>")
        print("Example: python squads/curator/scripts/merge_mining_parts.py _temp/mining/my-source/parts _temp/mining/my-source/all_moments_merged.md")
        sys.exit(1)

    parts_dir = sys.argv[1]
    output_file = sys.argv[2]

    if not os.path.isdir(parts_dir):
        print(f"ERROR: Parts directory not found: {parts_dir}")
        sys.exit(1)

    # Find and sort part files
    part_files = sorted(glob.glob(os.path.join(parts_dir, "part_*.md")))
    if not part_files:
        print(f"ERROR: No part_*.md files found in {parts_dir}")
        sys.exit(1)

    print(f"Found {len(part_files)} part files in {parts_dir}")

    # Extract all moments from all parts
    all_moments = []
    for fpath in part_files:
        with open(fpath, "r", encoding="utf-8") as f:
            content = f.read()
        moments = extract_moments(content)
        print(f"  {os.path.basename(fpath)}: {len(moments)} moments")
        all_moments.extend(moments)

    if not all_moments:
        print("ERROR: No moments found in any part file")
        sys.exit(1)

    # Renumber sequentially
    renumbered = []
    for i, moment in enumerate(all_moments, 1):
        renumbered.append(renumber_moment(moment, i))

    # Generate header
    header = f"""# Mining Consolidation
# Merged: {datetime.now().strftime('%Y-%m-%d %H:%M')}
# Parts: {len(part_files)}
# Total moments: {len(renumbered)}
# Source files: {', '.join(os.path.basename(f) for f in part_files)}

---

"""

    # Write output
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(header)
        f.write("\n\n".join(renumbered))
        f.write("\n")

    print(f"\n✓ Merged {len(renumbered)} moments from {len(part_files)} parts")
    print(f"✓ Output: {output_file}")


if __name__ == "__main__":
    main()
