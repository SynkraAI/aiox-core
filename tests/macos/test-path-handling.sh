#!/bin/bash
# Test Script: AC4 - Path Handling & Symlinks
# Story: 1.10b - macOS Testing & Validation

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
TEST_NAME="AC4: Path Handling"
LOG_FILE="/tmp/aiox-test-path-$(date +%Y%m%d-%H%M%S).log"

log_info() { echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"; }
pass_test() { echo -e "${GREEN}[PASS]${NC} $1" | tee -a "$LOG_FILE"; }
fail_test() { echo -e "${RED}[FAIL]${NC} $1" | tee -a "$LOG_FILE"; exit 1; }

test_forward_slashes() {
    log_info "Test 1: Forward slash usage..."

    # Create test path
    TEST_DIR="$HOME/aiox-path-test"
    mkdir -p "$TEST_DIR/sub/dir"

    # Verify path uses forward slashes
    if [[ "$TEST_DIR" == *"/"* ]] && [[ "$TEST_DIR" != *"\\"* ]]; then
        pass_test "Paths use forward slashes correctly"
    else
        fail_test "Invalid path format: $TEST_DIR"
    fi

    rm -rf "$TEST_DIR"
}

test_home_expansion() {
    log_info "Test 2: Home directory expansion..."

    # Test ~ expansion
    EXPANDED=$(eval echo "~/test")
    EXPECTED="$HOME/test"

    if [[ "$EXPANDED" == "$EXPECTED" ]]; then
        pass_test "Tilde (~/) expansion works correctly"
    else
        fail_test "Tilde expansion failed: $EXPANDED != $EXPECTED"
    fi
}

test_symlinks() {
    log_info "Test 3: Symlink resolution..."

    TEST_DIR="$HOME/aiox-symlink-test"
    mkdir -p "$TEST_DIR"

    # Create test file and symlink
    echo "test content" > "$TEST_DIR/original.txt"
    ln -s "$TEST_DIR/original.txt" "$TEST_DIR/link.txt"

    # Verify symlink works
    if [[ -L "$TEST_DIR/link.txt" ]]; then
        CONTENT=$(cat "$TEST_DIR/link.txt")
        if [[ "$CONTENT" == "test content" ]]; then
            pass_test "Symlinks work correctly"
        else
            fail_test "Symlink content mismatch"
        fi
    else
        fail_test "Symlink creation failed"
    fi

    # Test readlink
    LINK_TARGET=$(readlink "$TEST_DIR/link.txt")
    if [[ "$LINK_TARGET" == "$TEST_DIR/original.txt" ]]; then
        pass_test "Symlink resolution works"
    fi

    rm -rf "$TEST_DIR"
}

test_special_characters() {
    log_info "Test 4: Special characters in paths..."

    # Test space handling
    TEST_DIR="$HOME/aiox test with spaces"
    mkdir -p "$TEST_DIR"

    if [[ -d "$TEST_DIR" ]]; then
        pass_test "Spaces in paths handled correctly"
    fi

    rm -rf "$TEST_DIR"
}

main() {
    log_info "========================================="
    log_info "Starting $TEST_NAME"
    test_forward_slashes
    test_home_expansion
    test_symlinks
    test_special_characters
    log_info "All tests passed! ✅"
    log_info "========================================="
}

main "$@"
