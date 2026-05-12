#!/bin/bash
#
# AIOX Framework Documentation Migration Script
#
# Purpose: Migrate framework docs from aiox-fullstack to aiox-core (REPO 1)
# Story: 6.1.2.6 - Framework Configuration System
# Execution Timeline: Q2 2026 (Repository Migration Phase)
#
# Usage:
#   ./migrate-framework-docs.sh [--dry-run] [--target-repo PATH]
#
# Options:
#   --dry-run        Show what would be migrated without making changes
#   --target-repo    Path to aiox-core repository (default: ../aiox-core)
#   --help           Show this help message
#

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DRY_RUN=false
TARGET_REPO="../aiox-core"
SOURCE_DOCS="docs/framework"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --target-repo)
      TARGET_REPO="$2"
      shift 2
      ;;
    --help)
      head -n 20 "$0" | grep "^#" | sed 's/^# //'
      exit 0
      ;;
    *)
      echo -e "${RED}Error: Unknown option $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Header
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  AIOX Framework Documentation Migration Script             ║${NC}"
echo -e "${BLUE}║  Story 6.1.2.6: Framework Configuration System             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}⚠️  DRY RUN MODE - No changes will be made${NC}"
  echo ""
fi

# Function: Print section header
print_section() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# Function: Execute command (respects dry-run)
execute() {
  local cmd="$1"
  local description="$2"

  echo -e "  ${description}"

  if [ "$DRY_RUN" = true ]; then
    echo -e "  ${YELLOW}[DRY RUN]${NC} Would execute: ${cmd}"
  else
    echo -e "  ${GREEN}[EXEC]${NC} ${cmd}"
    eval "$cmd"
  fi
}

# Step 1: Verify Source Directory
print_section "Step 1: Verify Source Directory"

if [ ! -d "$SOURCE_DOCS" ]; then
  echo -e "${RED}✗ Error: Source directory not found: $SOURCE_DOCS${NC}"
  echo "  Please run this script from the aiox-fullstack root directory"
  exit 1
fi

echo -e "${GREEN}✓${NC} Source directory found: $SOURCE_DOCS"

# Count files to migrate
FILE_COUNT=$(find "$SOURCE_DOCS" -type f -name "*.md" | wc -l)
echo -e "${GREEN}✓${NC} Found ${FILE_COUNT} files to migrate"

# List files
echo ""
echo "  Files to migrate:"
find "$SOURCE_DOCS" -type f -name "*.md" | while read -r file; do
  echo "    - ${file}"
done

# Step 2: Verify Target Repository
print_section "Step 2: Verify Target Repository"

if [ ! -d "$TARGET_REPO" ]; then
  echo -e "${RED}✗ Error: Target repository not found: $TARGET_REPO${NC}"
  echo "  Please clone aiox-core first or specify correct path with --target-repo"
  exit 1
fi

echo -e "${GREEN}✓${NC} Target repository found: $TARGET_REPO"

# Check if target repo is a git repository
if [ ! -d "$TARGET_REPO/.git" ]; then
  echo -e "${YELLOW}⚠  Warning: Target is not a git repository${NC}"
fi

# Step 3: Create Target Directory Structure
print_section "Step 3: Create Target Directory Structure"

TARGET_DOCS="$TARGET_REPO/docs/framework"

execute "mkdir -p \"$TARGET_DOCS\"" "Create target directory: $TARGET_DOCS"

# Step 4: Copy Framework Documentation
print_section "Step 4: Copy Framework Documentation"

find "$SOURCE_DOCS" -type f -name "*.md" | while read -r source_file; do
  # Get relative path from source docs
  rel_path="${source_file#${SOURCE_DOCS}/}"
  target_file="$TARGET_DOCS/$rel_path"

  # Create parent directory if needed
  target_dir=$(dirname "$target_file")
  if [ ! -d "$target_dir" ]; then
    execute "mkdir -p \"$target_dir\"" "Create directory: $target_dir"
  fi

  # Copy file
  execute "cp \"$source_file\" \"$target_file\"" "Copy: $rel_path"
done

# Step 5: Update Internal Links
print_section "Step 5: Update Internal Links"

echo -e "${YELLOW}  Updating internal documentation links...${NC}"

# This is a simplified link update - may need manual review
if [ "$DRY_RUN" = false ]; then
  find "$TARGET_DOCS" -type f -name "*.md" -exec sed -i.bak \
    -e 's|../../docs/architecture/|../architecture/|g' \
    -e 's|docs/framework/|./|g' \
    {} \;

  # Remove backup files
  find "$TARGET_DOCS" -type f -name "*.bak" -delete

  echo -e "${GREEN}✓${NC} Links updated (review recommended)"
else
  echo -e "${YELLOW}[DRY RUN]${NC} Would update links in migrated files"
fi

# Step 6: Create Migration Notice
print_section "Step 6: Create Migration Notice"

MIGRATION_NOTICE="$TARGET_DOCS/MIGRATION_NOTICE.md"

if [ "$DRY_RUN" = false ]; then
  cat > "$MIGRATION_NOTICE" << 'EOF'
# Framework Documentation Migration Notice

**Migration Date:** $(date +%Y-%m-%d)
**Source:** aiox-fullstack/docs/framework/
**Target:** aiox-core/docs/framework/
**Story:** 6.1.2.6 - Framework Configuration System

## Migration Status

✅ Framework documentation successfully migrated from aiox-fullstack to aiox-core (REPO 1)

## Files Migrated

- coding-standards.md - Official AIOX coding standards
- tech-stack.md - Technology stack and architecture decisions
- source-tree.md - Project structure and file organization

## Backward Compatibility

For backward compatibility during the migration period (Q2-Q3 2026):
- aiox-fullstack maintains copies in `docs/framework/` (will be removed Q3 2026)
- aiox-fullstack maintains legacy copies in `docs/architecture/` (will be removed Q3 2026)

## Post-Migration Actions

1. Update all agent configuration files to reference new paths
2. Update CI/CD pipelines to use new documentation location
3. Add deprecation warnings to old documentation locations
4. Monitor for broken links and update as needed

## Rollback Procedure

If migration issues occur:
```bash
# Restore from aiox-fullstack
cd aiox-fullstack
git log --all --full-history -- "docs/framework/*"
```

---

*Auto-generated by migrate-framework-docs.sh*
EOF

  echo -e "${GREEN}✓${NC} Migration notice created: $MIGRATION_NOTICE"
else
  echo -e "${YELLOW}[DRY RUN]${NC} Would create migration notice"
fi

# Step 7: Verification
print_section "Step 7: Verification"

if [ "$DRY_RUN" = false ]; then
  TARGET_FILE_COUNT=$(find "$TARGET_DOCS" -type f -name "*.md" ! -name "MIGRATION_NOTICE.md" | wc -l)

  if [ "$TARGET_FILE_COUNT" -eq "$FILE_COUNT" ]; then
    echo -e "${GREEN}✓${NC} All ${FILE_COUNT} files migrated successfully"
  else
    echo -e "${YELLOW}⚠  Warning: File count mismatch${NC}"
    echo "  Source: ${FILE_COUNT} files"
    echo "  Target: ${TARGET_FILE_COUNT} files"
  fi

  echo ""
  echo "  Migrated files:"
  find "$TARGET_DOCS" -type f -name "*.md" ! -name "MIGRATION_NOTICE.md" | while read -r file; do
    rel_path="${file#${TARGET_DOCS}/}"
    file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "unknown")
    echo "    - ${rel_path} (${file_size} bytes)"
  done
else
  echo -e "${YELLOW}[DRY RUN]${NC} Verification skipped in dry-run mode"
fi

# Step 8: Git Operations (Optional)
print_section "Step 8: Git Operations (Optional)"

if [ "$DRY_RUN" = false ] && [ -d "$TARGET_REPO/.git" ]; then
  echo -e "${YELLOW}  Ready to commit changes?${NC}"
  echo "  "
  echo "  Suggested git commands:"
  echo "    cd $TARGET_REPO"
  echo "    git add docs/framework/"
  echo "    git commit -m \"docs: migrate framework documentation from aiox-fullstack\""
  echo ""
  echo "    Story: 6.1.2.6 - Framework Configuration System"
  echo "    Migrated: coding-standards.md, tech-stack.md, source-tree.md"
  echo "    Source: aiox-fullstack/docs/framework/"
  echo ""
  echo -e "${YELLOW}  Note: Review changes before committing${NC}"
else
  echo -e "${YELLOW}[DRY RUN]${NC} Git operations skipped"
fi

# Summary
print_section "Migration Summary"

echo -e "${GREEN}✓${NC} Migration completed successfully!"
echo ""
echo "  Source: $SOURCE_DOCS"
echo "  Target: $TARGET_DOCS"
echo "  Files:  $FILE_COUNT migrated"
echo ""
echo "  Next Steps:"
echo "    1. Review migrated files in $TARGET_DOCS"
echo "    2. Test agent activations with new paths"
echo "    3. Update agent config files (agent-config-requirements.yaml)"
echo "    4. Commit changes to aiox-core repository"
echo "    5. Update aiox-fullstack deprecation warnings (Q3 2026)"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}⚠️  This was a DRY RUN - no changes were made${NC}"
  echo "  Run without --dry-run to perform actual migration"
  echo ""
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
