#!/usr/bin/env bash
# Context Surgeon — Measure auto-loaded context footprint
# Usage: bash measure.sh [project-root]
# Output: YAML to stdout. Read-only — never modifies files.

set -euo pipefail

PROJECT="${1:-.}"
PROJECT="$(cd "$PROJECT" && pwd)"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- Discover auto-loaded files via shared script ---
declare -a FILES=()
declare -a LABELS=()

while IFS=$'\t' read -r label filepath; do
  LABELS+=("$label")
  FILES+=("$filepath")
done < <(bash "$SCRIPT_DIR/discover.sh" "$PROJECT")

# --- Output ---
echo "# Context Surgeon — Measurement Report"
echo "project: $(basename "$PROJECT")"
echo "timestamp: $(date +%Y-%m-%dT%H:%M:%S)"
echo ""
echo "auto_loaded:"

TOTAL_LINES=0
TOTAL_FILES=0
OVER150=0

for i in "${!FILES[@]}"; do
  f="${FILES[$i]}"
  label="${LABELS[$i]}"
  LINES=$(wc -l < "$f" | tr -d '[:space:]')
  TOKENS=$((LINES * 8))

  echo "  - path: \"$label\""
  echo "    lines: $LINES"
  echo "    tokens: $TOKENS"

  TOTAL_LINES=$((TOTAL_LINES + LINES))
  TOTAL_FILES=$((TOTAL_FILES + 1))
  [ "$LINES" -gt 150 ] && OVER150=$((OVER150 + 1))
done

TOTAL_TOKENS=$((TOTAL_LINES * 8))

# --- Health Score (deterministic penalties only) ---
SCORE=100
echo ""
echo "totals:"
echo "  files: $TOTAL_FILES"
echo "  lines: $TOTAL_LINES"
echo "  tokens_est: $TOTAL_TOKENS"

echo ""
echo "penalties:"

if [ "$TOTAL_LINES" -gt 400 ]; then
  P=$(( (TOTAL_LINES - 400) / 10 ))
  SCORE=$((SCORE - P))
  echo "  - lines_over_400: -$P"
fi

if [ ! -f "$PROJECT/.claudeignore" ]; then
  SCORE=$((SCORE - 10))
  echo "  - no_claudeignore: -10"
fi

if [ "$OVER150" -gt 0 ]; then
  P=$((OVER150 * 3))
  SCORE=$((SCORE - P))
  echo "  - files_over_150_lines: -$P ($OVER150 files)"
fi

[ "$SCORE" -lt 0 ] && SCORE=0

echo ""
echo "deterministic_score: $SCORE"
echo "note: \"LLM adds semantic penalties (dead refs, duplicates, stale, planned items)\""

if [ "$SCORE" -ge 80 ]; then
  echo "status: HEALTHY"
elif [ "$SCORE" -ge 60 ]; then
  echo "status: NEEDS_CARE"
else
  echo "status: CRITICAL"
fi
