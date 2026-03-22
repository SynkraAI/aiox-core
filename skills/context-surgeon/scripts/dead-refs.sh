#!/usr/bin/env bash
# Context Surgeon — Dead Reference Scanner
# Usage: bash dead-refs.sh [project-root]
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

# --- Scan for dead references ---
echo "# Context Surgeon — Dead Reference Report"
echo "dead_references:"

TOTAL=0

for i in "${!FILES[@]}"; do
  f="${FILES[$i]}"
  label="${LABELS[$i]}"

  # Extract backtick-quoted paths with known extensions
  TMPGREP=$(mktemp)
  grep -noE '`[a-zA-Z0-9_./-]+\.(md|yaml|yml|json|js|ts|sh|py)`' "$f" > "$TMPGREP" 2>/dev/null || true
  while IFS=: read -r LNUM MATCH; do
    [ -z "$LNUM" ] && continue
    REF=$(echo "$MATCH" | tr -d '`')

    # Skip URLs, variables, globs, home-relative
    case "$REF" in
      *http*|*'{{'*|*'*'*|'~/'*) continue ;;
    esac

    # Check existence across common project prefixes
    FOUND=false
    for PREFIX in "" ".claude/" ".claude/rules/" ".claude/protocols/" ".claude/reference/" "reference/" ".brain/" "docs/" ".claude/commands/" ".claude/flows/"; do
      if [ -e "$PROJECT/${PREFIX}${REF}" ]; then
        FOUND=true
        break
      fi
    done
    if [ "$FOUND" = false ]; then
      echo "  - src: \"$label\""
      echo "    line: $LNUM"
      echo "    ref: \"$REF\""
      TOTAL=$((TOTAL + 1))
    fi
  done < "$TMPGREP"
  rm -f "$TMPGREP"
done

echo "total: $TOTAL"
