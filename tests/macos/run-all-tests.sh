#!/bin/bash
# Master Test Runner for AIOX macOS Testing
# Story 1.10b - macOS Testing & Validation
# Executes all acceptance criteria tests

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test configuration
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPORT_FILE="/tmp/aiox-macos-test-report-$(date +%Y%m%d-%H%M%S).txt"
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Test scripts
TESTS=(
    "test-intel-installation.sh:AC1 - Intel Mac Installation"
    "test-apple-silicon-installation.sh:AC2 - Apple Silicon Installation"
    "test-shell-compatibility.sh:AC3 - Shell Compatibility"
    "test-path-handling.sh:AC4 - Path Handling"
    "test-line-endings.sh:AC5 - Line Endings"
    "test-permissions.sh:AC6 - File Permissions"
    "test-homebrew-integration.sh:AC7 - Homebrew Integration"
    "test-performance.sh:AC8 - Performance"
    "test-security.sh:AC9 - Security Compliance"
    "test-error-recovery.sh:AC10 - Error Recovery"
)

# Utility functions
log_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$REPORT_FILE"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1" | tee -a "$REPORT_FILE"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1" | tee -a "$REPORT_FILE"
}

log_warning() {
    echo -e "${YELLOW}[SKIP]${NC} $1" | tee -a "$REPORT_FILE"
}

# Print banner
print_banner() {
    log_header "AIOX macOS Testing Suite"
    log_info "Story: 1.10b - macOS Testing & Validation"
    log_info "Timestamp: $(date)"
    log_info "Architecture: $(uname -m)"
    log_info "macOS Version: $(sw_vers -productVersion)"
    log_info "Report file: $REPORT_FILE"
}

# Check prerequisites
check_prerequisites() {
    log_header "Prerequisites Check"

    # Check if running on macOS
    if [[ "$(uname -s)" != "Darwin" ]]; then
        log_error "Not running on macOS. Aborting."
        exit 1
    fi

    ARCH=$(uname -m)
    log_info "Architecture detected: $ARCH"

    # Determine which tests to run based on architecture
    if [[ "$ARCH" == "x86_64" ]]; then
        log_info "Intel Mac detected - will run Intel-specific tests"
    elif [[ "$ARCH" == "arm64" ]]; then
        log_info "Apple Silicon detected - will run ARM-specific tests"
    else
        log_error "Unknown architecture: $ARCH"
        exit 1
    fi

    # Make all test scripts executable
    chmod +x "$SCRIPT_DIR"/*.sh 2>/dev/null || true

    log_success "Prerequisites check completed"
}

# Run individual test
run_test() {
    local test_script="$1"
    local test_name="$2"

    log_header "Running: $test_name"

    local script_path="$SCRIPT_DIR/$test_script"

    # Check if test should be skipped based on architecture
    ARCH=$(uname -m)

    if [[ "$test_script" == "test-intel-installation.sh" ]] && [[ "$ARCH" != "x86_64" ]]; then
        log_warning "Skipping $test_name (not running on Intel)"
        ((TESTS_SKIPPED++))
        return 0
    fi

    if [[ "$test_script" == "test-apple-silicon-installation.sh" ]] && [[ "$ARCH" != "arm64" ]]; then
        log_warning "Skipping $test_name (not running on Apple Silicon)"
        ((TESTS_SKIPPED++))
        return 0
    fi

    # Check if script exists
    if [[ ! -f "$script_path" ]]; then
        log_error "Test script not found: $script_path"
        ((TESTS_FAILED++))
        return 1
    fi

    # Run the test
    if bash "$script_path"; then
        log_success "PASSED: $test_name"
        ((TESTS_PASSED++))
        return 0
    else
        log_error "FAILED: $test_name"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Generate summary report
generate_report() {
    log_header "Test Summary"

    local total=$((TESTS_PASSED + TESTS_FAILED + TESTS_SKIPPED))

    {
        echo ""
        echo "========================================="
        echo "           TEST RESULTS SUMMARY          "
        echo "========================================="
        echo "Total Tests:   $total"
        echo "Passed:        $TESTS_PASSED ✅"
        echo "Failed:        $TESTS_FAILED ❌"
        echo "Skipped:       $TESTS_SKIPPED ⏭️"
        echo "========================================="
        echo ""

        if [[ $TESTS_FAILED -eq 0 ]]; then
            echo "✅ ALL TESTS PASSED!"
            echo ""
            echo "Story 1.10b is READY for approval"
        else
            echo "❌ SOME TESTS FAILED"
            echo ""
            echo "Please review failed tests and fix issues"
        fi

        echo ""
        echo "Detailed log: $REPORT_FILE"
        echo "========================================="
    } | tee -a "$REPORT_FILE"

    # Return appropriate exit code
    if [[ $TESTS_FAILED -eq 0 ]]; then
        return 0
    else
        return 1
    fi
}

# Parse command line arguments
SELECTED_TESTS=()
RUN_ALL=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --test)
            RUN_ALL=false
            SELECTED_TESTS+=("$2")
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --test AC#    Run specific acceptance criteria test (e.g., --test AC1)"
            echo "  --help        Show this help message"
            echo ""
            echo "Available tests:"
            for test in "${TESTS[@]}"; do
                IFS=':' read -r script name <<< "$test"
                echo "  ${name}"
            done
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Main execution
main() {
    print_banner
    check_prerequisites

    # Run tests
    if [[ "$RUN_ALL" == true ]]; then
        log_info "Running all tests..."

        for test in "${TESTS[@]}"; do
            IFS=':' read -r script name <<< "$test"
            run_test "$script" "$name" || true
        done
    else
        log_info "Running selected tests: ${SELECTED_TESTS[*]}"

        for selected in "${SELECTED_TESTS[@]}"; do
            found=false

            for test in "${TESTS[@]}"; do
                IFS=':' read -r script name <<< "$test"

                if [[ "$name" == *"$selected"* ]]; then
                    run_test "$script" "$name" || true
                    found=true
                    break
                fi
            done

            if [[ "$found" == false ]]; then
                log_warning "Test not found: $selected"
                ((TESTS_SKIPPED++))
            fi
        done
    fi

    # Generate final report
    generate_report
}

# Run main function
main "$@"
