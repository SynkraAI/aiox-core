#!/usr/bin/env python3
"""
Cross-YAML consistency validator.

Reads all *.yaml cut files in a directory, extracts moment IDs + timestamps,
and alerts if the same moment ID has different timestamps across files.

Usage:
    python squads/curator/scripts/validate_cross_yaml.py <directory>
    python squads/curator/scripts/validate_cross_yaml.py Output/curated/ia-vale-silicio-futuro-humanidade/cortes/longform/

Exit codes:
    0 = all consistent (or no shared IDs)
    1 = inconsistencies found
"""
import argparse
import glob
import os
import sys
from pathlib import Path

import yaml

# ---------------------------------------------------------------------------
# Timestamp conversion — import from sibling module or implement inline
# ---------------------------------------------------------------------------

try:
    # Add squads/curator/scripts/ dir to path so _validation_common is importable
    _scripts_dir = str(Path(__file__).resolve().parent)
    if _scripts_dir not in sys.path:
        sys.path.insert(0, _scripts_dir)
    from _validation_common import ts_to_seconds
except ImportError:

    def ts_to_seconds(ts: str) -> float:
        """Convert HH:MM:SS, MM:SS, or SS to seconds."""
        ts = ts.strip().replace(",", ".")
        parts = ts.split(":")
        if len(parts) == 3:
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + float(parts[2])
        if len(parts) == 2:
            return int(parts[0]) * 60 + float(parts[1])
        return float(parts[0])


# ---------------------------------------------------------------------------
# Moment extraction — supports all cut YAML formats
# ---------------------------------------------------------------------------

# Tolerance in seconds: timestamps within this range are considered equal
TOLERANCE_S = 1.0


def _update_tolerance(value: float):
    global TOLERANCE_S
    TOLERANCE_S = value


def _extract_ts(moment: dict) -> tuple[str | None, str | None]:
    """Return (timestamp_inicio, timestamp_fim) from a moment dict."""
    ts_in = moment.get("timestamp_inicio")
    ts_out = moment.get("timestamp_fim")
    # Coerce to str (YAML may parse bare timestamps as datetime or int)
    if ts_in is not None:
        ts_in = str(ts_in).strip()
    if ts_out is not None:
        ts_out = str(ts_out).strip()
    return ts_in, ts_out


def _make_id_key(raw_id, prefix: str = "") -> str:
    """Normalize a moment ID into a comparable string key."""
    if raw_id is None:
        return ""
    return f"{prefix}{raw_id}"


def extract_moments_from_yaml(filepath: str) -> dict[str, dict]:
    """
    Parse a single YAML file and extract all moment entries.

    Returns dict keyed by moment ID string, value = {
        "timestamp_inicio": str | None,
        "timestamp_fim": str | None,
        "file": str,
        "location": str,  # human-readable location in file
    }
    """
    with open(filepath, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    if not isinstance(data, dict):
        return {}

    fname = os.path.basename(filepath)
    results: dict[str, dict] = {}

    def _add(moment_id: str, ts_in, ts_out, location: str):
        if moment_id and (ts_in or ts_out):
            results[moment_id] = {
                "timestamp_inicio": ts_in,
                "timestamp_fim": ts_out,
                "file": fname,
                "location": location,
            }

    # ------------------------------------------------------------------
    # 1. cold_open (longform + longform_simple)
    # ------------------------------------------------------------------
    cold_open = data.get("cold_open")
    if isinstance(cold_open, dict):
        mid = cold_open.get("moment_id")
        if mid is not None:
            ts_in, ts_out = _extract_ts(cold_open)
            _add(str(mid), ts_in, ts_out, "cold_open")

    # ------------------------------------------------------------------
    # 2. abertura_engenheirada (longform_simple)
    # ------------------------------------------------------------------
    abertura = data.get("abertura_engenheirada")
    if isinstance(abertura, dict):
        # abertura_engenheirada.hook
        hook = abertura.get("hook")
        if isinstance(hook, dict):
            mid = hook.get("moment_id")
            if mid is not None:
                ts_in, ts_out = _extract_ts(hook)
                _add(str(mid), ts_in, ts_out, "abertura_engenheirada.hook")

        # abertura_engenheirada.momentos_abertura
        mom_ab = abertura.get("momentos_abertura")
        if isinstance(mom_ab, list):
            for i, m in enumerate(mom_ab):
                if not isinstance(m, dict):
                    continue
                mid = m.get("id")
                if mid is not None:
                    ts_in, ts_out = _extract_ts(m)
                    _add(str(mid), ts_in, ts_out, f"abertura_engenheirada.momentos_abertura[{i}]")

    # ------------------------------------------------------------------
    # 3. chapters[].momentos (longform format)
    # ------------------------------------------------------------------
    chapters = data.get("chapters")
    if isinstance(chapters, list):
        for ch in chapters:
            if not isinstance(ch, dict):
                continue
            ch_label = ch.get("chapter", "?")
            momentos = ch.get("momentos")
            if isinstance(momentos, list):
                for i, m in enumerate(momentos):
                    if not isinstance(m, dict):
                        continue
                    mid = m.get("id")
                    if mid is not None:
                        ts_in, ts_out = _extract_ts(m)
                        _add(str(mid), ts_in, ts_out, f"chapters[{ch_label}].momentos[{i}]")

    # ------------------------------------------------------------------
    # 4. Top-level momentos (longform_simple format)
    # ------------------------------------------------------------------
    top_momentos = data.get("momentos")
    if isinstance(top_momentos, list):
        for i, m in enumerate(top_momentos):
            if not isinstance(m, dict):
                continue
            mid = m.get("id")
            if mid is not None:
                ts_in, ts_out = _extract_ts(m)
                _add(str(mid), ts_in, ts_out, f"momentos[{i}]")

    # ------------------------------------------------------------------
    # 5. beats (shorts format — use "beat:{beat}" as ID)
    # ------------------------------------------------------------------
    beats = data.get("beats")
    if isinstance(beats, list):
        for i, b in enumerate(beats):
            if not isinstance(b, dict):
                continue
            beat_num = b.get("beat")
            # Also check if there is a moment_id for cross-referencing
            mid = b.get("moment_id")
            ts_in, ts_out = _extract_ts(b)
            # Use moment_id as the key if available, else beat number
            if mid is not None:
                _add(str(mid), ts_in, ts_out, f"beats[{i}] (beat {beat_num})")
            elif beat_num is not None:
                _add(f"beat:{beat_num}", ts_in, ts_out, f"beats[{i}]")

    return results


# ---------------------------------------------------------------------------
# Cross-comparison logic
# ---------------------------------------------------------------------------


def _ts_matches(ts_a: str | None, ts_b: str | None, tolerance: float | None = None) -> bool:
    """Return True if two timestamp strings represent the same time (within tolerance)."""
    if ts_a is None and ts_b is None:
        return True
    if ts_a is None or ts_b is None:
        return False
    tol = tolerance if tolerance is not None else TOLERANCE_S
    try:
        return abs(ts_to_seconds(ts_a) - ts_to_seconds(ts_b)) <= tol
    except (ValueError, IndexError):
        # If conversion fails, fall back to string comparison
        return ts_a == ts_b


def cross_compare(
    all_file_moments: dict[str, dict[str, dict]],
) -> list[dict]:
    """
    Compare moment IDs across files.

    Args:
        all_file_moments: {filename: {moment_id: {timestamp_inicio, timestamp_fim, ...}}}

    Returns:
        List of inconsistency dicts with keys:
            moment_id, entries (list of {file, timestamp_inicio, timestamp_fim, location})
    """
    # Invert: moment_id -> list of (file, data)
    by_id: dict[str, list[dict]] = {}
    for fname, moments in all_file_moments.items():
        for mid, info in moments.items():
            by_id.setdefault(mid, []).append(info)

    inconsistencies: list[dict] = []

    for mid, entries in sorted(by_id.items(), key=lambda x: x[0]):
        if len(entries) < 2:
            continue  # Only in one file — nothing to compare

        # Compare all pairs against first entry
        ref = entries[0]
        is_consistent = True
        for other in entries[1:]:
            if not _ts_matches(ref["timestamp_inicio"], other["timestamp_inicio"]):
                is_consistent = False
                break
            if not _ts_matches(ref["timestamp_fim"], other["timestamp_fim"]):
                is_consistent = False
                break

        if not is_consistent:
            inconsistencies.append({"moment_id": mid, "entries": entries})

    return inconsistencies


# ---------------------------------------------------------------------------
# Report printing
# ---------------------------------------------------------------------------


def _pad(s: str, width: int) -> str:
    """Left-align string within given width."""
    return s.ljust(width)


def print_report(
    all_file_moments: dict[str, dict[str, dict]],
    inconsistencies: list[dict],
    shared_ids: dict[str, list[dict]],
):
    """Print the comparison report table."""
    total_files = len(all_file_moments)
    total_moments = sum(len(v) for v in all_file_moments.values())

    # Invert for shared count
    shared_count = len(shared_ids)

    print("=" * 78)
    print("CROSS-YAML CONSISTENCY REPORT")
    print("=" * 78)
    print(f"Files scanned:    {total_files}")
    print(f"Total entries:    {total_moments}")
    print(f"Shared IDs:       {shared_count}")
    print(f"Inconsistencies:  {len(inconsistencies)}")
    print()

    if shared_count == 0:
        print("No moment IDs appear in more than one file. Nothing to compare.")
        return

    if not inconsistencies:
        print("ALL shared moment IDs have consistent timestamps across files.")
        print()
        # Print summary of shared IDs
        print("-" * 78)
        print(f"{'ID':<8} {'ts_inicio':<14} {'ts_fim':<14} {'Files'}")
        print("-" * 78)
        for mid, entries in sorted(shared_ids.items(), key=lambda x: x[0]):
            ref = entries[0]
            files_str = ", ".join(e["file"] for e in entries)
            ts_in = ref["timestamp_inicio"] or "—"
            ts_out = ref["timestamp_fim"] or "—"
            print(f"{mid:<8} {ts_in:<14} {ts_out:<14} {files_str}")
        return

    # Print inconsistencies
    print("INCONSISTENCIES FOUND:")
    print()
    for item in inconsistencies:
        mid = item["moment_id"]
        print(f"  Moment ID: {mid}")
        print(f"  {'File':<45} {'ts_inicio':<14} {'ts_fim':<14} Status")
        print(f"  {'-'*45} {'-'*14} {'-'*14} {'-'*10}")
        ref = item["entries"][0]
        for entry in item["entries"]:
            ts_in = entry["timestamp_inicio"] or "—"
            ts_out = entry["timestamp_fim"] or "—"
            inicio_ok = _ts_matches(ref["timestamp_inicio"], entry["timestamp_inicio"])
            fim_ok = _ts_matches(ref["timestamp_fim"], entry["timestamp_fim"])
            if inicio_ok and fim_ok:
                status = "OK"
            else:
                parts = []
                if not inicio_ok:
                    parts.append("inicio")
                if not fim_ok:
                    parts.append("fim")
                status = "MISMATCH " + "+".join(parts)
            loc = f"{entry['file']} ({entry['location']})"
            print(f"  {loc:<45} {ts_in:<14} {ts_out:<14} {status}")
        print()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    parser = argparse.ArgumentParser(
        description="Cross-validate moment timestamps across YAML cut files in a directory."
    )
    parser.add_argument(
        "directory",
        help="Directory containing *.yaml cut files to compare.",
    )
    parser.add_argument(
        "--tolerance",
        type=float,
        default=TOLERANCE_S,
        help=f"Timestamp comparison tolerance in seconds (default: {TOLERANCE_S})",
    )
    args = parser.parse_args()

    # Update module-level tolerance from CLI arg
    _update_tolerance(args.tolerance)

    directory = args.directory
    if not os.path.isdir(directory):
        print(f"ERROR: '{directory}' is not a valid directory.", file=sys.stderr)
        sys.exit(2)

    yaml_files = sorted(glob.glob(os.path.join(directory, "*.yaml")))
    if not yaml_files:
        print(f"No *.yaml files found in '{directory}'.")
        sys.exit(0)

    # Extract moments from all files
    all_file_moments: dict[str, dict[str, dict]] = {}
    for fpath in yaml_files:
        fname = os.path.basename(fpath)
        moments = extract_moments_from_yaml(fpath)
        if moments:
            all_file_moments[fname] = moments

    if not all_file_moments:
        print("No moment entries found in any YAML file.")
        sys.exit(0)

    # Build shared-ID index
    by_id: dict[str, list[dict]] = {}
    for fname, moments in all_file_moments.items():
        for mid, info in moments.items():
            by_id.setdefault(mid, []).append(info)

    shared_ids = {mid: entries for mid, entries in by_id.items() if len(entries) >= 2}

    # Cross-compare
    inconsistencies = cross_compare(all_file_moments)

    # Report
    print_report(all_file_moments, inconsistencies, shared_ids)

    if inconsistencies:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
