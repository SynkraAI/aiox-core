#!/bin/bash
# AIOX Framework Update - v5.2 (Optimized)
#
# LOGIC:
#   - LOCAL only (not in upstream)     → KEEP
#   - LOCAL + UPSTREAM                 → OVERWRITE (upstream wins)
#   - UPSTREAM only (not in local)     → CREATE
#   - WAS in both, UPSTREAM removed    → DELETE
#
# Usage: bash .aiox-core/scripts/update-aiox.sh

set -e

echo "⚡ AIOX Update v5.2"
echo ""

# Preflight: check rsync
if ! command -v rsync >/dev/null 2>&1; then
  echo "❌ rsync is required but not found in PATH."
  exit 1
fi

# Validate: clean working tree for .aiox-core
if [ -n "$(git status --porcelain .aiox-core/)" ]; then
  echo "❌ Commit .aiox-core changes first:"
  git status --short .aiox-core/
  echo ""
  echo "Run: git add .aiox-core && git commit -m 'your message'"
  exit 1
fi

# Temp directory
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# Report files
REPORT_CREATED="$TEMP_DIR/report-created.txt"
REPORT_UPDATED="$TEMP_DIR/report-updated.txt"
REPORT_DELETED="$TEMP_DIR/report-deleted.txt"
REPORT_PRESERVED="$TEMP_DIR/report-preserved.txt"
touch "$REPORT_CREATED" "$REPORT_UPDATED" "$REPORT_DELETED" "$REPORT_PRESERVED"

# Clone upstream (shallow)
echo "📥 Cloning upstream..."
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/SynkraAI/aiox-core.git \
  "$TEMP_DIR/upstream" 2>/dev/null || {
  echo "❌ Failed to clone. Check network."
  exit 1
}

cd "$TEMP_DIR/upstream"
git sparse-checkout set .aiox-core
cd - > /dev/null

echo "✅ Fetched upstream"
echo ""

# Build file lists (relative paths without .aiox-core/ prefix)
echo "📋 Scanning files..."
find .aiox-core -type f | sed 's|^\.aiox-core/||' | sort > "$TEMP_DIR/local-files.txt"
find "$TEMP_DIR/upstream/.aiox-core" -type f | sed "s|^$TEMP_DIR/upstream/\.aiox-core/||" | sort > "$TEMP_DIR/upstream-files.txt"

# Get git-tracked files (for DELETE detection) - ONE call instead of N calls
git ls-files .aiox-core | sed 's|^\.aiox-core/||' | sort > "$TEMP_DIR/tracked-files.txt"

# Use comm to find differences - O(n) instead of O(n²)
echo "🔍 Analyzing differences..."

# LOCAL-ONLY: in local but not in upstream
comm -23 "$TEMP_DIR/local-files.txt" "$TEMP_DIR/upstream-files.txt" > "$REPORT_PRESERVED"

# UPSTREAM-ONLY (CREATE): in upstream but not in local
comm -13 "$TEMP_DIR/local-files.txt" "$TEMP_DIR/upstream-files.txt" > "$REPORT_CREATED"

# IN-BOTH: files that exist in both
comm -12 "$TEMP_DIR/local-files.txt" "$TEMP_DIR/upstream-files.txt" > "$TEMP_DIR/in-both.txt"

# DELETE: was tracked by git, not in upstream, not local-only
comm -23 "$TEMP_DIR/tracked-files.txt" "$TEMP_DIR/upstream-files.txt" | \
  comm -23 - "$REPORT_PRESERVED" > "$REPORT_DELETED"

# UPDATED: in both but content differs
echo "📝 Checking for updates..."
while IFS= read -r rel_path; do
  if ! cmp -s ".aiox-core/$rel_path" "$TEMP_DIR/upstream/.aiox-core/$rel_path"; then
    echo "$rel_path" >> "$REPORT_UPDATED"
  fi
done < "$TEMP_DIR/in-both.txt"

# Backup local-only files
echo "🔐 Backing up local-only files..."
mkdir -p "$TEMP_DIR/local-only"
while IFS= read -r rel_path; do
  mkdir -p "$TEMP_DIR/local-only/$(dirname "$rel_path")"
  cp -a ".aiox-core/$rel_path" "$TEMP_DIR/local-only/$rel_path"
done < "$REPORT_PRESERVED"

# Execute sync
echo ""
echo "🔀 Syncing..."

# Delete files removed from upstream
if [ -s "$REPORT_DELETED" ]; then
  while IFS= read -r rel_path; do
    rm -f ".aiox-core/$rel_path"
  done < "$REPORT_DELETED"
fi

# Copy all upstream files (creates new + overwrites existing)
rsync -a "$TEMP_DIR/upstream/.aiox-core/" ".aiox-core/"

# Restore local-only files
if [ -d "$TEMP_DIR/local-only" ] && [ "$(ls -A "$TEMP_DIR/local-only" 2>/dev/null)" ]; then
  rsync -a "$TEMP_DIR/local-only/" ".aiox-core/"
fi

# Clean empty directories
find .aiox-core -type d -empty -delete 2>/dev/null || true

# Generate report
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  SYNC REPORT"
echo "════════════════════════════════════════════════════════════"

CREATED_COUNT=$(wc -l < "$REPORT_CREATED" | tr -d ' ')
UPDATED_COUNT=$(wc -l < "$REPORT_UPDATED" | tr -d ' ')
DELETED_COUNT=$(wc -l < "$REPORT_DELETED" | tr -d ' ')
PRESERVED_COUNT=$(wc -l < "$REPORT_PRESERVED" | tr -d ' ')

echo ""
echo "  ➕ CREATED:   $CREATED_COUNT files"
if [ "$CREATED_COUNT" -gt 0 ] && [ "$CREATED_COUNT" -le 20 ]; then
  sed 's/^/       /' "$REPORT_CREATED"
elif [ "$CREATED_COUNT" -gt 20 ]; then
  head -10 "$REPORT_CREATED" | sed 's/^/       /'
  echo "       ... and $((CREATED_COUNT - 10)) more"
fi

echo ""
echo "  📝 UPDATED:   $UPDATED_COUNT files"
if [ "$UPDATED_COUNT" -gt 0 ] && [ "$UPDATED_COUNT" -le 20 ]; then
  sed 's/^/       /' "$REPORT_UPDATED"
elif [ "$UPDATED_COUNT" -gt 20 ]; then
  head -10 "$REPORT_UPDATED" | sed 's/^/       /'
  echo "       ... and $((UPDATED_COUNT - 10)) more"
fi

echo ""
echo "  🗑️  DELETED:   $DELETED_COUNT files"
if [ "$DELETED_COUNT" -gt 0 ] && [ "$DELETED_COUNT" -le 20 ]; then
  sed 's/^/       /' "$REPORT_DELETED"
elif [ "$DELETED_COUNT" -gt 20 ]; then
  head -10 "$REPORT_DELETED" | sed 's/^/       /'
  echo "       ... and $((DELETED_COUNT - 10)) more"
fi

echo ""
echo "  🔐 PRESERVED: $PRESERVED_COUNT local-only files"
if [ "$PRESERVED_COUNT" -gt 0 ] && [ "$PRESERVED_COUNT" -le 10 ]; then
  sed 's/^/       /' "$REPORT_PRESERVED"
elif [ "$PRESERVED_COUNT" -gt 10 ]; then
  head -5 "$REPORT_PRESERVED" | sed 's/^/       /'
  echo "       ... and $((PRESERVED_COUNT - 5)) more"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Choose:"
echo "  ✅ Apply:  git add .aiox-core && git commit -m 'chore: sync AIOX framework'"
echo "  ❌ Cancel: git checkout -- .aiox-core/"
echo ""
