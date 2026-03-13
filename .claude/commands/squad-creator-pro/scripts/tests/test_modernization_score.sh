#!/bin/bash
# Tests for modernization-score.sh
# Run: bash squads/squad-creator-pro/scripts/tests/test_modernization_score.sh

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$SCRIPT_DIR/../modernization-score.sh"
PASS=0
FAIL=0
TOTAL=0

assert_eq() {
    local test_name="$1" expected="$2" actual="$3"
    TOTAL=$((TOTAL + 1))
    if [[ "$expected" == "$actual" ]]; then
        PASS=$((PASS + 1))
    else
        FAIL=$((FAIL + 1))
        echo "  FAIL: $test_name (expected '$expected', got '$actual')"
    fi
}

assert_contains() {
    local test_name="$1" pattern="$2" text="$3"
    TOTAL=$((TOTAL + 1))
    if echo "$text" | grep -qE "$pattern"; then
        PASS=$((PASS + 1))
    else
        FAIL=$((FAIL + 1))
        echo "  FAIL: $test_name (pattern '$pattern' not found)"
    fi
}

assert_exit() {
    local test_name="$1" expected="$2" actual="$3"
    TOTAL=$((TOTAL + 1))
    if [[ "$expected" == "$actual" ]]; then
        PASS=$((PASS + 1))
    else
        FAIL=$((FAIL + 1))
        echo "  FAIL: $test_name (expected exit $expected, got $actual)"
    fi
}

echo "=== test_modernization_score.sh ==="

# Setup temp fixtures
TMP=$(mktemp -d)
trap "rm -rf $TMP" EXIT

# Fixture: modern workflow (should score high)
cat > "$TMP/modern.yaml" << 'FIXTURE'
name: modern-workflow
description: A fully modern AIOX workflow

# Teams
Use TeamCreate to set up the team.
Use TaskCreate for each agent task.

# Delegation
Task with subagent_type for each specialist.
Use run_in_background for parallel work.

# Context
Load git status and gotchas before starting.

# Communication
Write results to squads/mind-cloning/minds/slug/result.yaml

# Agent refs
Read .claude/agents/specialist.md for identity.

# Dependencies
Set blockedBy for sequential tasks.

# Permissions
Use bypassPermissions for autonomous execution.

# Finalization
Send shutdown request and call TeamDelete.

# Anti-patterns
NEVER skip validation. DO NOT hardcode values.

# Artifacts
Store in squads/mind-cloning/minds/slug/artifacts/
FIXTURE

# Fixture: legacy workflow (should score low)
cat > "$TMP/legacy.md" << 'FIXTURE'
# Legacy Workflow

## Steps
1. Read the file
2. Process it
3. Output results

## Notes
This is a basic workflow with no modern patterns.
FIXTURE

# Fixture: partial workflow
cat > "$TMP/partial.yaml" << 'FIXTURE'
name: partial-workflow
description: Partially modern

# Has some modern patterns
NEVER skip testing.
Write to outputs/results/

But missing: teams, subagents, background, context, agents, deps, permissions, finalization
FIXTURE

# --- Test 1: No args shows usage and exits 1 ---
echo "  Test: no args"
output=$(bash "$SCRIPT" 2>&1)
exit_code=$?
assert_exit "no_args_exit" "1" "$exit_code"
assert_contains "no_args_usage" "Usage:" "$output"

# --- Test 2: Missing file exits 1 ---
echo "  Test: missing file"
output=$(bash "$SCRIPT" "$TMP/nonexistent.yaml" 2>&1)
exit_code=$?
assert_exit "missing_file_exit" "1" "$exit_code"
assert_contains "missing_file_error" "not found" "$output"

# --- Test 3: Modern workflow scores high (>=8/12) ---
echo "  Test: modern workflow"
output=$(bash "$SCRIPT" "$TMP/modern.yaml" 2>&1)
exit_code=$?
assert_exit "modern_exit" "0" "$exit_code"
assert_contains "modern_has_score" "score:" "$output"
# Extract score
score=$(echo "$output" | grep -E '^\s+score:' | head -1 | grep -oE '[0-9]+/12' | cut -d/ -f1)
TOTAL=$((TOTAL + 1))
if [[ "$score" -ge 8 ]]; then
    PASS=$((PASS + 1))
else
    FAIL=$((FAIL + 1))
    echo "  FAIL: modern_score_high (expected >=8, got $score)"
fi

# --- Test 4: Legacy workflow scores low (<=3/12) ---
echo "  Test: legacy workflow"
output=$(bash "$SCRIPT" "$TMP/legacy.md" 2>&1)
exit_code=$?
assert_exit "legacy_exit" "0" "$exit_code"
score=$(echo "$output" | grep -E '^\s+score:' | head -1 | grep -oE '[0-9]+/12' | cut -d/ -f1)
TOTAL=$((TOTAL + 1))
if [[ "$score" -le 3 ]]; then
    PASS=$((PASS + 1))
else
    FAIL=$((FAIL + 1))
    echo "  FAIL: legacy_score_low (expected <=3, got $score)"
fi

# --- Test 5: Output contains all 12 patterns ---
echo "  Test: all 12 patterns present"
output=$(bash "$SCRIPT" "$TMP/modern.yaml" 2>&1)
for id in 1 2 3 4 5 6 7 8 9 10 11 12; do
    assert_contains "pattern_$id" "id: $id" "$output"
done

# --- Test 6: PASS/FAIL status for each pattern ---
echo "  Test: PASS/FAIL statuses"
pass_count=$(echo "$output" | grep -c "PASS")
fail_count=$(echo "$output" | grep -c "FAIL")
total_statuses=$((pass_count + fail_count))
assert_eq "total_statuses" "12" "$total_statuses"

# --- Test 7: JSON output ---
echo "  Test: JSON output"
json_output=$(bash "$SCRIPT" "$TMP/modern.yaml" --json 2>&1)
exit_code=$?
assert_exit "json_exit" "0" "$exit_code"
assert_contains "json_has_brace" "^\{" "$json_output"
assert_contains "json_has_patterns" '"patterns"' "$json_output"

# --- Test 8: Interpretation text ---
echo "  Test: interpretation"
output=$(bash "$SCRIPT" "$TMP/legacy.md" 2>&1)
assert_contains "legacy_interpretation" "(legado|Rewrite)" "$output"

output=$(bash "$SCRIPT" "$TMP/modern.yaml" 2>&1)
assert_contains "modern_interpretation" "(moderno|Ajustes|producao)" "$output"

# --- Test 9: Partial workflow scores mid-range ---
echo "  Test: partial workflow"
output=$(bash "$SCRIPT" "$TMP/partial.yaml" 2>&1)
score=$(echo "$output" | grep -E '^\s+score:' | head -1 | grep -oE '[0-9]+/12' | cut -d/ -f1)
TOTAL=$((TOTAL + 1))
if [[ "$score" -ge 2 && "$score" -le 6 ]]; then
    PASS=$((PASS + 1))
else
    FAIL=$((FAIL + 1))
    echo "  FAIL: partial_score_mid (expected 2-6, got $score)"
fi

# --- Test 10: Recommendations only for FAIL patterns ---
echo "  Test: recommendations"
output=$(bash "$SCRIPT" "$TMP/partial.yaml" 2>&1)
rec_count=$(echo "$output" | grep -c "priority:")
fail_pattern_count=$(echo "$output" | grep "status: 'FAIL'" | wc -l | tr -d ' ')
assert_eq "recs_match_fails" "$fail_pattern_count" "$rec_count"

# --- Summary ---
echo ""
echo "=== RESULTS: $PASS/$TOTAL passed, $FAIL failed ==="
[[ $FAIL -eq 0 ]] && exit 0 || exit 1
