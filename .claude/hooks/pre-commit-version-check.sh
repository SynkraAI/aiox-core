#!/bin/bash
#
# Pre-Commit Hook: Version Metadata Validation
#
# Ensures all tasks and agents have version metadata in frontmatter.
# This prevents silent version mismatches (e.g., v1.0 agent + v2.0 task).
#
# Usage:
#   Run manually: .aiox-core/hooks/pre-commit-version-check.sh
#   Install: .aiox-core/hooks/install-hooks.sh
#
# Story: STORY-3.10 (Version Alignment & Compatibility Checks)

set -e

echo "🔍 Validating task and agent version metadata..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track validation status
ERRORS=0

# Function to check if file has required version fields
check_task_version() {
    local file="$1"
    local missing_fields=()

    if ! grep -q "^task_name:" "$file"; then
        missing_fields+=("task_name")
    fi

    if ! grep -q "^task_version:" "$file"; then
        missing_fields+=("task_version")
    fi

    if ! grep -q "^required_agent_version:" "$file"; then
        missing_fields+=("required_agent_version")
    fi

    if ! grep -q "^description:" "$file"; then
        missing_fields+=("description")
    fi

    if ! grep -q "^last_updated:" "$file"; then
        missing_fields+=("last_updated")
    fi

    if [ ${#missing_fields[@]} -gt 0 ]; then
        echo -e "${RED}❌ ERROR: $file missing version metadata${NC}"
        for field in "${missing_fields[@]}"; do
            echo -e "${RED}   - Missing field: '$field'${NC}"
        done
        echo ""
        ERRORS=$((ERRORS + 1))
        return 1
    fi

    return 0
}

check_agent_version() {
    local file="$1"
    local missing_fields=()

    if ! grep -q "^agent_name:" "$file"; then
        missing_fields+=("agent_name")
    fi

    if ! grep -q "^agent_version:" "$file"; then
        missing_fields+=("agent_version")
    fi

    if ! grep -q "^compatible_task_versions:" "$file"; then
        missing_fields+=("compatible_task_versions")
    fi

    if ! grep -q "^description:" "$file"; then
        missing_fields+=("description")
    fi

    if ! grep -q "^last_updated:" "$file"; then
        missing_fields+=("last_updated")
    fi

    if [ ${#missing_fields[@]} -gt 0 ]; then
        echo -e "${RED}❌ ERROR: $file missing version metadata${NC}"
        for field in "${missing_fields[@]}"; do
            echo -e "${RED}   - Missing field: '$field'${NC}"
        done
        echo ""
        ERRORS=$((ERRORS + 1))
        return 1
    fi

    return 0
}

# Check all tasks in expansion-packs/creator-os/tasks/
echo "Checking CreatorOS tasks..."
TASK_COUNT=0
for task in expansion-packs/creator-os/tasks/*.md; do
    # Skip backup files
    if [[ "$task" == *"-backup.md" ]]; then
        echo -e "${YELLOW}⏭️  Skipping backup: $task${NC}"
        continue
    fi

    if [ -f "$task" ]; then
        if check_task_version "$task"; then
            echo -e "${GREEN}✅ $task${NC}"
        fi
        TASK_COUNT=$((TASK_COUNT + 1))
    fi
done

# Check all agents in expansion-packs/creator-os/agents/
echo ""
echo "Checking CreatorOS agents..."
AGENT_COUNT=0
for agent in expansion-packs/creator-os/agents/*.md; do
    if [ -f "$agent" ]; then
        if check_agent_version "$agent"; then
            echo -e "${GREEN}✅ $agent${NC}"
        fi
        AGENT_COUNT=$((AGENT_COUNT + 1))
    fi
done

echo ""
echo "────────────────────────────────────────────────────────────"
echo "Summary:"
echo "  - Tasks checked: $TASK_COUNT"
echo "  - Agents checked: $AGENT_COUNT"
echo "  - Errors found: $ERRORS"
echo "────────────────────────────────────────────────────────────"

if [ $ERRORS -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ Version validation FAILED${NC}"
    echo ""
    echo "How to fix:"
    echo "1. Add YAML frontmatter to each flagged file"
    echo "2. Include all required fields (task_name, task_version, etc.)"
    echo "3. See Story 3.10 for examples"
    echo ""
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Version validation PASSED${NC}"
echo ""
exit 0
