#!/bin/bash
# Test Script: AC1 - Intel Mac Installation Support
# Story: 1.10b - macOS Testing & Validation
# Acceptance Criteria: Installation completes successfully on macOS Intel (10.15+)

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test metadata
TEST_NAME="AC1: Intel Mac Installation"
TEST_SCRIPT="test-intel-installation.sh"
LOG_FILE="/tmp/aiox-test-intel-$(date +%Y%m%d-%H%M%S).log"

# Utility functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

pass_test() {
    echo -e "${GREEN}[PASS]${NC} $1" | tee -a "$LOG_FILE"
}

fail_test() {
    echo -e "${RED}[FAIL]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Test prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Verify macOS
    if [[ "$(uname -s)" != "Darwin" ]]; then
        fail_test "Not running on macOS. Current OS: $(uname -s)"
    fi

    # Verify Intel architecture
    ARCH=$(uname -m)
    if [[ "$ARCH" != "x86_64" ]]; then
        fail_test "Not running on Intel Mac. Current architecture: $ARCH"
    fi

    # Verify macOS version (10.15+)
    MACOS_VERSION=$(sw_vers -productVersion)
    MAJOR_VERSION=$(echo "$MACOS_VERSION" | cut -d '.' -f 1)
    MINOR_VERSION=$(echo "$MACOS_VERSION" | cut -d '.' -f 2)

    if [[ $MAJOR_VERSION -lt 10 ]] || [[ $MAJOR_VERSION -eq 10 && $MINOR_VERSION -lt 15 ]]; then
        fail_test "macOS version too old. Required: 10.15+, Current: $MACOS_VERSION"
    fi

    log_info "Running on macOS $MACOS_VERSION (Intel x86_64)"

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        fail_test "Node.js not found. Please install Node.js 18+"
    fi

    NODE_VERSION=$(node --version)
    log_info "Node.js version: $NODE_VERSION"

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        fail_test "npm not found"
    fi

    NPM_VERSION=$(npm --version)
    log_info "npm version: $NPM_VERSION"

    pass_test "Prerequisites check completed"
}

# Test 1: Clean installation
test_clean_installation() {
    log_info "Test 1: Clean AIOX installation on Intel Mac..."

    # Backup existing AIOX config if present
    if [[ -d "$HOME/.aiox" ]]; then
        log_warning "Existing .aiox directory found. Backing up..."
        mv "$HOME/.aiox" "$HOME/.aiox.backup.$(date +%Y%m%d-%H%M%S)"
    fi

    # Run installer
    log_info "Running: npx @synkraai/aiox@latest init"

    # Note: This will require manual interaction for now
    # In automated CI, we'll need to provide inputs programmatically
    if npx @synkraai/aiox@latest init; then
        pass_test "Installation completed without errors"
    else
        fail_test "Installation failed with exit code $?"
    fi
}

# Test 2: Verify MCP installations
test_mcp_health() {
    log_info "Test 2: Verifying MCP health checks..."

    # Check if aiox command is available
    if ! command -v aiox &> /dev/null; then
        fail_test "aiox command not found in PATH"
    fi

    # Run health check
    log_info "Running: aiox health"
    HEALTH_OUTPUT=$(aiox health 2>&1)

    echo "$HEALTH_OUTPUT" | tee -a "$LOG_FILE"

    # Verify all 4 MCPs are healthy
    EXPECTED_MCPS=("Browser" "Context7" "Exa" "Desktop Commander")

    for mcp in "${EXPECTED_MCPS[@]}"; do
        if echo "$HEALTH_OUTPUT" | grep -q "$mcp.*✓.*Healthy"; then
            pass_test "MCP $mcp is healthy"
        else
            fail_test "MCP $mcp is not healthy"
        fi
    done

    pass_test "All 4 MCPs passed health checks"
}

# Test 3: Verify CLI commands
test_cli_commands() {
    log_info "Test 3: Testing CLI commands..."

    # Test aiox --version
    if aiox --version &> /dev/null; then
        VERSION=$(aiox --version)
        log_info "AIOX version: $VERSION"
        pass_test "aiox --version works"
    else
        fail_test "aiox --version failed"
    fi

    # Test aiox --help
    if aiox --help &> /dev/null; then
        pass_test "aiox --help works"
    else
        fail_test "aiox --help failed"
    fi
}

# Test 4: Verify architecture-specific binaries
test_architecture_binaries() {
    log_info "Test 4: Verifying Intel x86_64 binaries..."

    # Check node architecture
    NODE_ARCH=$(file "$(which node)")

    if echo "$NODE_ARCH" | grep -q "x86_64"; then
        pass_test "Node.js is using Intel x86_64 binary"
    else
        fail_test "Node.js is not using correct architecture: $NODE_ARCH"
    fi
}

# Main test execution
main() {
    log_info "========================================="
    log_info "Starting $TEST_NAME"
    log_info "Timestamp: $(date)"
    log_info "========================================="

    check_prerequisites
    test_clean_installation
    test_mcp_health
    test_cli_commands
    test_architecture_binaries

    log_info "========================================="
    log_info "All tests passed! ✅"
    log_info "Log file: $LOG_FILE"
    log_info "========================================="
}

# Run main function
main "$@"
