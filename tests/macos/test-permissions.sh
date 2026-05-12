#!/bin/bash
# Test Script: AC6 - File Permissions
# Story: 1.10b - macOS Testing & Validation

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; NC='\033[0m'
TEST_NAME="AC6: File Permissions"
LOG_FILE="/tmp/aiox-test-perms-$(date +%Y%m%d-%H%M%S).log"

log_info() { echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"; }
pass_test() { echo -e "${GREEN}[PASS]${NC} $1" | tee -a "$LOG_FILE"; }
fail_test() { echo -e "${RED}[FAIL]${NC} $1" | tee -a "$LOG_FILE"; exit 1; }

test_script_permissions() {
    log_info "Test 1: Verifying script executability..."

    # Find AIOX scripts
    if [[ -d "$HOME/.aiox/bin" ]]; then
        SCRIPTS=$(find "$HOME/.aiox/bin" -type f -name "*.sh" 2>/dev/null || true)

        for SCRIPT in $SCRIPTS; do
            if [[ -x "$SCRIPT" ]]; then
                pass_test "Script is executable: $SCRIPT"
            else
                fail_test "Script not executable: $SCRIPT"
            fi
        done
    fi
}

test_config_permissions() {
    log_info "Test 2: Checking config file permissions (644)..."

    CONFIG_FILES=(
        "$HOME/.aiox/config.json"
        "$HOME/.aiox/.aioxrc"
    )

    for FILE in "${CONFIG_FILES[@]}"; do
        if [[ -f "$FILE" ]]; then
            PERMS=$(stat -f "%Lp" "$FILE" 2>/dev/null || stat -c "%a" "$FILE" 2>/dev/null)

            if [[ "$PERMS" == "644" ]] || [[ "$PERMS" == "600" ]]; then
                pass_test "Config file has correct permissions ($PERMS): $FILE"
            else
                fail_test "Config file has wrong permissions ($PERMS): $FILE"
            fi
        fi
    done
}

test_directory_permissions() {
    log_info "Test 3: Checking directory permissions (755)..."

    if [[ -d "$HOME/.aiox" ]]; then
        DIR_PERMS=$(stat -f "%Lp" "$HOME/.aiox" 2>/dev/null || stat -c "%a" "$HOME/.aiox" 2>/dev/null)

        if [[ "$DIR_PERMS" == "755" ]] || [[ "$DIR_PERMS" == "700" ]]; then
            pass_test "Directory has correct permissions ($DIR_PERMS)"
        else
            fail_test "Directory has wrong permissions ($DIR_PERMS)"
        fi
    fi
}

test_no_sudo_required() {
    log_info "Test 4: Verifying no sudo required for AIOX operations..."

    # Check if current user owns .aiox directory
    if [[ -d "$HOME/.aiox" ]]; then
        OWNER=$(stat -f "%Su" "$HOME/.aiox" 2>/dev/null || stat -c "%U" "$HOME/.aiox" 2>/dev/null)

        if [[ "$OWNER" == "$(whoami)" ]]; then
            pass_test "User owns .aiox directory (no sudo needed)"
        else
            fail_test ".aiox owned by: $OWNER (expected: $(whoami))"
        fi
    fi
}

main() {
    log_info "========================================="
    log_info "Starting $TEST_NAME"
    test_script_permissions
    test_config_permissions
    test_directory_permissions
    test_no_sudo_required
    log_info "All tests passed! ✅"
    log_info "========================================="
}

main "$@"
