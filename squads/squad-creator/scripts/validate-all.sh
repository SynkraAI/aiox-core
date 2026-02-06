#!/usr/bin/env bash
# Validate all squads

PASSED=0
FAILED=0
SKIPPED=0

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         🔍 VALIDATING ALL SQUADS (--fast mode)             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQUADS_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)/squads"

for squad_dir in "$SQUADS_DIR"/*/; do
  squad_name=$(basename "$squad_dir")

  if [ ! -f "$squad_dir/config.yaml" ]; then
    echo "⏭️  $squad_name: skipped (no config.yaml)"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  output=$("$SCRIPT_DIR/validate-squad.sh" "$squad_name" --fast --json 2>&1)

  score=$(echo "$output" | grep -o '"final_score": [0-9]*' | grep -o '[0-9]*' | head -1)
  result=$(echo "$output" | grep -o '"result": "[^"]*"' | sed 's/.*": "//;s/".*//' | head -1)
  type=$(echo "$output" | grep -o '"type": "[^"]*"' | sed 's/.*": "//;s/".*//' | head -1)

  [ -z "$score" ] && score="?"
  [ -z "$type" ] && type="?"

  if [ "$result" = "PASS" ]; then
    echo "✅ $squad_name: $score/10 ($type)"
    PASSED=$((PASSED + 1))
  elif [ "$result" = "CONDITIONAL" ]; then
    echo "⚠️  $squad_name: $score/10 ($type)"
    FAILED=$((FAILED + 1))
  else
    echo "❌ $squad_name: $score/10 ($type)"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "SUMMARY: $PASSED passed | $FAILED failed/conditional | $SKIPPED skipped"
echo "════════════════════════════════════════════════════════════════"
