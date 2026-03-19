#!/usr/bin/env python3
"""
Validate timestamps in curator output files against raw transcript.

Accepts ANY curator output format:
  - GUIA_EDITOR.md:      "- **Timestamp:** HH:MM:SS -> HH:MM:SS"
  - all_moments_merged:   "- **Inicio:** HH:MM:SS" + "- **Fim:** HH:MM:SS"
  - momentos.md (v3):     "**Timestamp:** HH:MM:SS - HH:MM:SS"

For each segment, checks:
  1. timestamp_inicio exists in transcript (+/-tolerance seconds)
  2. timestamp_fim exists in transcript (+/-tolerance seconds)
  3. Text in the declared range matches the transcription (similarity)

If --transcript is not provided, auto-discovers transcript_raw.txt.
If no transcript found at all, performs internal consistency checks only.

Exit code 0 = all OK, 1 = at least one WRONG.

Usage:
  python squads/curator/scripts/validate_timestamps.py <input_md> [--transcript <transcript_raw>] [--tolerance 2]
"""
import argparse
import sys
from pathlib import Path

# Shared utilities
from _validation_common import (
    find_transcript_auto,
    parse_segments,
    parse_transcript,
    seconds_to_ts,
    text_similarity,
    ts_to_seconds,
)


# ---------------------------------------------------------------------------
# Validation: with transcript
# ---------------------------------------------------------------------------

def find_nearest_ts(entries: list[dict], target: float, tolerance: float) -> dict | None:
    """Find transcript entry whose start or end is within tolerance of target."""
    best = None
    best_diff = tolerance + 1
    for e in entries:
        diff = abs(e["start"] - target)
        if diff < best_diff:
            best_diff = diff
            best = e
        if e.get("end") is not None:
            diff_end = abs(e["end"] - target)
            if diff_end < best_diff:
                best_diff = diff_end
                best = e
    return best if best_diff <= tolerance else None


def get_text_in_range(entries: list[dict], start: float, end: float, tolerance: float) -> str:
    """Concatenate transcript text within [start-tol, end+tol]."""
    range_start = start - tolerance
    range_end = end + tolerance
    texts = []
    for e in entries:
        e_start = e["start"]
        e_end = e["end"] if e.get("end") is not None else e_start + 5
        if e_start <= range_end and e_end >= range_start:
            texts.append(e["text"])
    return " ".join(texts)


def validate_with_transcript(
    segments: list[dict], entries: list[dict], tolerance: float
) -> list[dict]:
    """Full validation: timestamps + text similarity against transcript."""
    results = []
    for seg in segments:
        result = {
            "label": seg["label"],
            "inicio": seg["inicio"],
            "fim": seg.get("fim"),
            "status": "OK",
            "issues": [],
            "similarity": 0.0,
        }

        # Check inicio exists in transcript
        nearest_inicio = find_nearest_ts(entries, seg["inicio"], tolerance)
        if nearest_inicio is None:
            result["issues"].append(
                f"inicio {seconds_to_ts(seg['inicio'])} not found in transcript (+/-{tolerance}s)"
            )

        # Check fim exists in transcript
        if seg.get("fim") is not None:
            nearest_fim = find_nearest_ts(entries, seg["fim"], tolerance)
            if nearest_fim is None:
                result["issues"].append(
                    f"fim {seconds_to_ts(seg['fim'])} not found in transcript (+/-{tolerance}s)"
                )

        # Text similarity
        if seg["transcription"] and seg.get("fim") is not None:
            range_text = get_text_in_range(entries, seg["inicio"], seg["fim"], tolerance)
            sim = text_similarity(seg["transcription"], range_text)
            result["similarity"] = round(sim, 3)
            if sim < 0.3:
                result["issues"].append(f"Text similarity {sim:.1%} — doesn't match range")
            elif sim < 0.5:
                result["issues"].append(f"Text similarity {sim:.1%} — low match, possible drift")

        # Determine status
        has_not_found = any("not found" in iss for iss in result["issues"])
        if has_not_found or result["similarity"] < 0.3:
            result["status"] = "WRONG"
        elif result["issues"]:
            result["status"] = "DRIFT"

        results.append(result)
    return results


# ---------------------------------------------------------------------------
# Validation: internal consistency only (no transcript)
# ---------------------------------------------------------------------------

def validate_internal(segments: list[dict]) -> list[dict]:
    """Validate internal consistency: ordering, fim > inicio, no overlaps."""
    results = []
    prev_fim = -1.0

    for idx, seg in enumerate(segments):
        result = {
            "label": seg["label"],
            "inicio": seg["inicio"],
            "fim": seg.get("fim"),
            "status": "OK",
            "issues": [],
            "similarity": None,
        }

        # fim > inicio
        if seg.get("fim") is not None and seg["fim"] <= seg["inicio"]:
            result["issues"].append(
                f"fim ({seconds_to_ts(seg['fim'])}) <= inicio ({seconds_to_ts(seg['inicio'])})"
            )

        # No overlaps with previous
        if seg["inicio"] < prev_fim and idx > 0:
            result["issues"].append(
                f"Overlaps with previous segment (inicio {seconds_to_ts(seg['inicio'])} < prev fim {seconds_to_ts(prev_fim)})"
            )

        # Empty transcription
        if not seg["transcription"].strip():
            result["issues"].append("Empty transcription")

        if result["issues"]:
            result["status"] = "WRONG"

        if seg.get("fim") is not None:
            prev_fim = seg["fim"]

        results.append(result)
    return results


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

def print_report(results: list[dict], mode: str) -> None:
    """Print clean report table + summary."""
    ok = sum(1 for r in results if r["status"] == "OK")
    drift = sum(1 for r in results if r["status"] == "DRIFT")
    wrong = sum(1 for r in results if r["status"] == "WRONG")

    print("=" * 80)
    print(f"TIMESTAMP VALIDATION REPORT  [{mode}]")
    print("=" * 80)
    print(f"\nTotal segments: {len(results)}  |  OK: {ok}  |  DRIFT: {drift}  |  WRONG: {wrong}")

    # Detail on issues
    if drift > 0 or wrong > 0:
        print("\n" + "-" * 80)
        print("ISSUES:")
        print("-" * 80)
        for r in results:
            if r["status"] != "OK":
                icon = "~" if r["status"] == "DRIFT" else "X"
                fim_str = seconds_to_ts(r["fim"]) if r["fim"] is not None else "N/A"
                sim_str = f"sim={r['similarity']:.1%}" if r["similarity"] is not None else ""
                print(
                    f"\n[{icon}] {r['label']} [{r['status']}] "
                    f"({seconds_to_ts(r['inicio'])} -> {fim_str}) {sim_str}"
                )
                for iss in r["issues"]:
                    print(f"    {iss}")

    # Full table
    print("\n" + "-" * 80)
    print(f"{'Label':>12} {'Start':>10} {'End':>10} {'Sim':>7} {'Status':>7}")
    print("-" * 80)
    for r in results:
        icon = {"OK": " OK", "DRIFT": "DRF", "WRONG": "ERR"}[r["status"]]
        fim_str = seconds_to_ts(r["fim"]) if r["fim"] is not None else "N/A"
        if r["similarity"] is not None:
            sim_str = f"{r['similarity']:>6.1%}"
        else:
            sim_str = "  N/A "
        print(
            f"{r['label']:>12} "
            f"{seconds_to_ts(r['inicio']):>10} "
            f"{fim_str:>10} "
            f"{sim_str} "
            f"{icon:>4}"
        )

    print("=" * 80)
    if wrong > 0:
        print(f"\nRESULT: FAIL ({wrong} WRONG)")
    elif drift > 0:
        print(f"\nRESULT: PASS with warnings ({drift} DRIFT)")
    else:
        print("\nRESULT: PASS")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Validate timestamps in curator output against raw transcript"
    )
    parser.add_argument("input_md", help="Path to curator output (GUIA_EDITOR, moments, etc.)")
    parser.add_argument(
        "--transcript", dest="transcript_raw", default=None,
        help="Path to raw transcript (VTT/SRT/bracketed). Auto-discovered if not provided."
    )
    parser.add_argument(
        "--tolerance", type=float, default=2.0,
        help="Tolerance in seconds (default: 2)"
    )
    args = parser.parse_args()

    if not Path(args.input_md).exists():
        print(f"ERROR: {args.input_md} not found")
        sys.exit(2)

    # --- Parse segments ---
    segments = parse_segments(args.input_md)
    if not segments:
        print("ERROR: No segments parsed from input file")
        sys.exit(2)

    # --- Find transcript ---
    transcript_path = args.transcript_raw
    if transcript_path is None:
        transcript_path = find_transcript_auto(args.input_md)
        if transcript_path:
            print(f"Auto-discovered transcript: {transcript_path}")
        else:
            print("WARNING: No transcript_raw found. Running internal consistency checks only.")
            print(f"  (Provide --transcript <path> for full validation)\n")

    if transcript_path and not Path(transcript_path).exists():
        print(f"ERROR: {transcript_path} not found")
        sys.exit(2)

    # --- Validate ---
    if transcript_path:
        entries = parse_transcript(transcript_path)
        if not entries:
            print("ERROR: No transcript entries parsed")
            sys.exit(2)
        print(f"Parsed {len(entries)} transcript entries, {len(segments)} segments")
        print(f"Tolerance: +/-{args.tolerance}s\n")
        results = validate_with_transcript(segments, entries, args.tolerance)
        mode = "full"
    else:
        print(f"Parsed {len(segments)} segments (internal check only)\n")
        results = validate_internal(segments)
        mode = "internal"

    print_report(results, mode)

    sys.exit(1 if any(r["status"] == "WRONG" for r in results) else 0)


if __name__ == "__main__":
    main()
