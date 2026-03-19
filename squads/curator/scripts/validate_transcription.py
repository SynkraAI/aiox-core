#!/usr/bin/env python3
"""
Validate transcriptions by fuzzy-matching against raw transcript.

For each segment in a curator output file, takes the first N words of the
transcription and searches for the best fuzzy match in the raw transcript.
Reports the REAL timestamp where that text appears vs the declared timestamp.

If --transcript is not provided, auto-discovers transcript_raw.txt.
If no transcript found at all, exits with message (cannot validate without source).

Accepts ANY curator output format (GUIA_EDITOR, all_moments_merged, momentos.md).

Exit code 0 = all OK, 1 = at least one DRIFT.

Usage:
  python squads/curator/scripts/validate_transcription.py <input_md> [--transcript <transcript_raw>] [--tolerance 5] [--words 20]
"""
import argparse
import sys
from pathlib import Path

# Shared utilities
from _validation_common import (
    find_transcript_auto,
    normalize_text,
    parse_segments,
    parse_transcript,
    seconds_to_ts,
)

from difflib import SequenceMatcher


# ---------------------------------------------------------------------------
# Fuzzy search
# ---------------------------------------------------------------------------

def get_first_n_words(text: str, n: int) -> str:
    """Extract first N words from text."""
    return " ".join(text.split()[:n])


def find_best_match(
    query: str,
    entries: list[dict],
    declared_ts: float,
    search_radius: float = 300.0,
    window_entries: int = 8,
) -> tuple[float, float]:
    """
    Find where query text best matches in transcript, searching near declared_ts first.

    Strategy (fast):
    1. Filter entries to [declared_ts - radius, declared_ts + radius]
    2. For each entry in range, build a window of N consecutive entries
    3. Compare query words against window words using SequenceMatcher
    4. If no good match found locally, expand to full transcript

    Returns (best_timestamp, best_similarity).
    """
    query_norm = normalize_text(query)
    if not query_norm:
        return 0.0, 0.0

    query_words = query_norm.split()

    def score_window(start_idx: int) -> float:
        """Score a window of entries against query using word-level matching."""
        end_idx = min(start_idx + window_entries, len(entries))
        window_words = []
        for e in entries[start_idx:end_idx]:
            window_words.extend(normalize_text(e["text"]).split())
        window_str = " ".join(window_words[:len(query_words) + 10])
        query_str = " ".join(query_words)
        return SequenceMatcher(None, query_str, window_str).ratio()

    def search_range(lo_ts: float, hi_ts: float) -> tuple[float, float, int]:
        """Search entries in timestamp range. Returns (best_ts, best_sim, count)."""
        best_sim = 0.0
        best_ts = 0.0
        count = 0
        for i, e in enumerate(entries):
            if e["start"] < lo_ts:
                continue
            if e["start"] > hi_ts:
                break
            count += 1
            sim = score_window(i)
            if sim > best_sim:
                best_sim = sim
                best_ts = e["start"]
        return best_ts, best_sim, count

    # Phase 1: Search near declared timestamp
    best_ts, best_sim, n = search_range(
        declared_ts - search_radius, declared_ts + search_radius
    )

    # If good match found locally, return
    if best_sim >= 0.5:
        return best_ts, best_sim

    # Phase 2: Expand to full transcript (only if local search failed)
    best_ts2, best_sim2, _ = search_range(0.0, float("inf"))
    if best_sim2 > best_sim:
        return best_ts2, best_sim2

    return best_ts, best_sim


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Validate transcriptions by fuzzy-matching against raw transcript"
    )
    parser.add_argument("input_md", help="Path to curator output (GUIA_EDITOR, moments, etc.)")
    parser.add_argument(
        "--transcript", dest="transcript_raw", default=None,
        help="Path to raw transcript. Auto-discovered if not provided."
    )
    parser.add_argument(
        "--tolerance", type=float, default=5.0,
        help="Max drift in seconds before flagging (default: 5)"
    )
    parser.add_argument(
        "--words", type=int, default=20,
        help="Number of leading words to match (default: 20)"
    )
    args = parser.parse_args()

    if not Path(args.input_md).exists():
        print(f"ERROR: {args.input_md} not found")
        sys.exit(2)

    # --- Parse segments ---
    segments = parse_segments(args.input_md)
    if not segments:
        print("ERROR: No segments parsed from input")
        sys.exit(2)

    # --- Find transcript ---
    transcript_path = args.transcript_raw
    if transcript_path is None:
        transcript_path = find_transcript_auto(args.input_md)
        if transcript_path:
            print(f"Auto-discovered transcript: {transcript_path}")
        else:
            print("ERROR: No transcript_raw found. Transcription validation requires raw transcript.")
            print("  Provide --transcript <path>.")
            sys.exit(2)

    if not Path(transcript_path).exists():
        print(f"ERROR: {transcript_path} not found")
        sys.exit(2)

    # --- Parse transcript ---
    entries = parse_transcript(transcript_path)
    if not entries:
        print("ERROR: No transcript entries parsed")
        sys.exit(2)

    print(f"Parsed {len(entries)} transcript entries, {len(segments)} segments")
    print(f"Tolerance: +/-{args.tolerance}s | Words: {args.words}\n")

    # --- Validate each segment ---
    results = []
    drift_count = 0

    for seg in segments:
        query = get_first_n_words(seg["transcription"], args.words)
        if not query.strip():
            results.append({
                "label": seg["label"],
                "declared": seg["inicio"],
                "real": None,
                "diff": None,
                "similarity": 0.0,
                "status": "NO_TEXT",
                "query": "(empty)",
            })
            continue

        real_ts, sim = find_best_match(query, entries, seg["inicio"])
        diff = abs(real_ts - seg["inicio"])
        status = "DRIFT" if diff > args.tolerance else "OK"
        if status == "DRIFT":
            drift_count += 1

        results.append({
            "label": seg["label"],
            "declared": seg["inicio"],
            "real": real_ts,
            "diff": diff,
            "similarity": sim,
            "status": status,
            "query": query[:60] + ("..." if len(query) > 60 else ""),
        })

    # --- Report ---
    ok_count = sum(1 for r in results if r["status"] == "OK")
    no_text = sum(1 for r in results if r["status"] == "NO_TEXT")

    print("=" * 88)
    print("TRANSCRIPTION VALIDATION REPORT")
    print("=" * 88)
    print(f"\nTotal: {len(results)} | OK: {ok_count} | DRIFT: {drift_count} | NO_TEXT: {no_text}\n")

    print(f"{'Label':>12} {'Declared':>10} {'Real':>10} {'Diff':>7} {'Sim':>6} {'Status':>7}  Query")
    print("-" * 88)

    for r in results:
        declared = seconds_to_ts(r["declared"])
        real = seconds_to_ts(r["real"]) if r["real"] is not None else "N/A"
        diff_str = f"{r['diff']:.1f}s" if r["diff"] is not None else "N/A"
        sim_str = f"{r['similarity']:.0%}" if r["similarity"] else "N/A"
        icon = {"OK": " OK", "DRIFT": "DRF", "NO_TEXT": "N/A"}.get(r["status"], "???")
        print(
            f"{r['label']:>12} {declared:>10} {real:>10} {diff_str:>7} "
            f"{sim_str:>6} {icon:>4}  {r['query']}"
        )

    if drift_count > 0:
        print("\n" + "-" * 88)
        print("DRIFTS:")
        for r in results:
            if r["status"] == "DRIFT":
                print(
                    f"  {r['label']}: declared={seconds_to_ts(r['declared'])} "
                    f"real={seconds_to_ts(r['real'])} diff={r['diff']:.1f}s "
                    f"sim={r['similarity']:.0%}"
                )
                print(f"    \"{r['query']}\"")

    print("\n" + "=" * 88)
    if drift_count > 0:
        print(f"RESULT: {drift_count} segments with drift > {args.tolerance}s")
    else:
        print("RESULT: All transcriptions match declared timestamps")

    sys.exit(1 if drift_count > 0 else 0)


if __name__ == "__main__":
    main()
