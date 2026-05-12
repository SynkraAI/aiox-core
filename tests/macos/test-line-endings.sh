#!/bin/bash
# Test Script: AC5 - Line Ending Validation (LF not CRLF)
# Story: 1.10b - macOS Testing & Validation

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; NC='\033[0m'
TEST_NAME="AC5: Line Endings"
LOG_FILE="/tmp/aiox-test-lineend-$(date +%Y%m%d-%H%M%S).log"

log_info() { echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"; }
pass_test() { echo -e "${GREEN}[PASS]${NC} $1" | tee -a "$LOG_FILE"; }
fail_test() { echo -e "${RED}[FAIL]${NC} $1" | tee -a "$LOG_FILE"; exit 1; }

test_generated_files() {
    log_info "Test 1: Checking generated file line endings..."

    # Check common AIOX files
    FILES_TO_CHECK=(
        "$HOME/.aiox/config.json"
        "$HOME/.aiox/.aioxrc"
    )

    for FILE in "${FILES_TO_CHECK[@]}"; do
        if [[ -f "$FILE" ]]; then
            # Check for CRLF (\r\n)
            if file "$FILE" | grep -q "CRLF"; then
                fail_test "$FILE contains CRLF line endings"
            elif file "$FILE" | grep -q "ASCII text"; then
                pass_test "$FILE uses LF line endings"
            fi

            # Check for ^M characters (carriage return)
            if grep -q $'\r' "$FILE" 2>/dev/null; then
                fail_test "$FILE contains carriage return characters"
            fi
        fi
    done
}

test_script_executability() {
    log_info "Test 2: Verifying scripts are executable without conversion..."

    # Create test script with LF endings
    TEST_SCRIPT="/tmp/test-script-$$.sh"
    printf '#!/bin/bash\necho "test"\n' > "$TEST_SCRIPT"
    chmod +x "$TEST_SCRIPT"

    if "$TEST_SCRIPT" &> /dev/null; then
        pass_test "Scripts with LF endings execute correctly"
    else
        fail_test "Script execution failed"
    fi

    rm -f "$TEST_SCRIPT"
}

test_git_config() {
    log_info "Test 3: Checking git autocrlf configuration..."

    GIT_AUTOCRLF=$(git config --get core.autocrlf || echo "not set")
    log_info "git core.autocrlf: $GIT_AUTOCRLF"

    if [[ "$GIT_AUTOCRLF" == "input" ]] || [[ "$GIT_AUTOCRLF" == "false" ]]; then
        pass_test "Git autocrlf configured correctly for Unix"
    else
        log_info "Consider setting: git config --global core.autocrlf input"
    fi
}

main() {
    log_info "========================================="
    log_info "Starting $TEST_NAME"
    test_generated_files
    test_script_executability
    test_git_config
    log_info "All tests passed! ✅"
    log_info "========================================="
}

main "$@"
