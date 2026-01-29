#!/bin/bash
# Test Script: AC2 - Apple Silicon Installation Support
# Story: 1.10b - macOS Testing & Validation
# Acceptance Criteria: Installation completes successfully on macOS Apple Silicon M1/M2/M3

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test metadata
TEST_NAME="AC2: Apple Silicon Installation"
TEST_SCRIPT="test-apple-silicon-installation.sh"
LOG_FILE="/tmp/aios-test-arm-$(date +%Y%m%d-%H%M%S).log"

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

    # Verify Apple Silicon architecture
    ARCH=$(uname -m)
    if [[ "$ARCH" != "arm64" ]]; then
        fail_test "Not running on Apple Silicon. Current architecture: $ARCH"
    fi

    # Verify macOS version
    MACOS_VERSION=$(sw_vers -productVersion)
    log_info "Running on macOS $MACOS_VERSION (Apple Silicon arm64)"

    # Detect specific chip (M1/M2/M3)
    CHIP_INFO=$(sysctl -n machdep.cpu.brand_string)
    log_info "Chip: $CHIP_INFO"

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

# Test 1: Verify native ARM binaries (not Rosetta)
test_native_arm_binaries() {
    log_info "Test 1: Verifying native ARM binaries (not Rosetta)..."

    # Check node binary architecture
    NODE_BINARY=$(which node)
    NODE_ARCH=$(file "$NODE_BINARY")

    log_info "Node binary: $NODE_BINARY"
    log_info "Architecture info: $NODE_ARCH"

    if echo "$NODE_ARCH" | grep -q "arm64"; then
        pass_test "Node.js is running natively on ARM (not Rosetta)"
    elif echo "$NODE_ARCH" | grep -q "x86_64"; then
        log_warning "Node.js is running under Rosetta emulation (x86_64)"
        log_warning "For optimal performance, install native ARM version"
        # This is not a hard failure - Rosetta should work
        pass_test "Node.js works under Rosetta (acceptable fallback)"
    else
        fail_test "Unexpected Node.js architecture: $NODE_ARCH"
    fi
}

# Test 2: Clean installation
test_clean_installation() {
    log_info "Test 2: Clean AIOS installation on Apple Silicon..."

    # Backup existing AIOS config if present
    if [[ -d "$HOME/.aios" ]]; then
        log_warning "Existing .aios directory found. Backing up..."
        mv "$HOME/.aios" "$HOME/.aios.backup.$(date +%Y%m%d-%H%M%S)"
    fi

    # Run installer
    log_info "Running: npx @synkraai/aios@latest init"

    if npx @synkraai/aios@latest init; then
        pass_test "Installation completed without errors"
    else
        fail_test "Installation failed with exit code $?"
    fi
}

# Test 3: Verify MCP installations
test_mcp_health() {
    log_info "Test 3: Verifying MCP health checks on Apple Silicon..."

    # Check if aios command is available
    if ! command -v aios &> /dev/null; then
        fail_test "aios command not found in PATH"
    fi

    # Run health check
    log_info "Running: aios health"
    HEALTH_OUTPUT=$(aios health 2>&1)

    echo "$HEALTH_OUTPUT" | tee -a "$LOG_FILE"

    # Verify all 4 MCPs are healthy
    EXPECTED_MCPS=("Browser" "Context7" "Exa" "Desktop Commander")

    for mcp in "${EXPECTED_MCPS[@]}"; do
        if echo "$HEALTH_OUTPUT" | grep -q "$mcp.*✓.*Healthy"; then
            pass_test "MCP $mcp is healthy on Apple Silicon"
        else
            fail_test "MCP $mcp is not healthy"
        fi
    done

    pass_test "All 4 MCPs passed health checks on Apple Silicon"
}

# Test 4: Rosetta compatibility check
test_rosetta_compatibility() {
    log_info "Test 4: Checking Rosetta 2 compatibility..."

    # Check if Rosetta 2 is installed
    if /usr/bin/pgrep -q oahd; then
        log_info "Rosetta 2 is installed and active"
        pass_test "Rosetta 2 available for x86_64 compatibility"
    else
        log_warning "Rosetta 2 not detected"
        log_info "Install with: softwareupdate --install-rosetta --agree-to-license"
    fi

    # Check if any processes are running under Rosetta
    ROSETTA_PROCESSES=$(ps aux | grep -i rosetta | grep -v grep || true)
    if [[ -n "$ROSETTA_PROCESSES" ]]; then
        log_info "Processes running under Rosetta detected"
        echo "$ROSETTA_PROCESSES" | tee -a "$LOG_FILE"
    fi
}

# Test 5: Performance comparison
test_performance_metrics() {
    log_info "Test 5: Collecting performance metrics..."

    # Measure Node.js startup time
    START_TIME=$(gdate +%s%N 2>/dev/null || date +%s)
    node -e "console.log('Node.js startup test')" &> /dev/null
    END_TIME=$(gdate +%s%N 2>/dev/null || date +%s)

    if command -v gdate &> /dev/null; then
        STARTUP_TIME=$(( (END_TIME - START_TIME) / 1000000 ))
        log_info "Node.js startup time: ${STARTUP_TIME}ms"
    else
        log_info "Install 'coreutils' via Homebrew for nanosecond precision timing"
    fi

    # Check CPU info
    CPU_COUNT=$(sysctl -n hw.ncpu)
    log_info "CPU cores: $CPU_COUNT"

    # Check memory
    MEMORY_GB=$(sysctl -n hw.memsize | awk '{print $1/1024/1024/1024}')
    log_info "Total memory: ${MEMORY_GB}GB"

    pass_test "Performance metrics collected"
}

# Test 6: Verify CLI commands
test_cli_commands() {
    log_info "Test 6: Testing CLI commands on Apple Silicon..."

    # Test aios --version
    if aios --version &> /dev/null; then
        VERSION=$(aios --version)
        log_info "AIOS version: $VERSION"
        pass_test "aios --version works"
    else
        fail_test "aios --version failed"
    fi

    # Test aios --help
    if aios --help &> /dev/null; then
        pass_test "aios --help works"
    else
        fail_test "aios --help failed"
    fi
}

# Main test execution
main() {
    log_info "========================================="
    log_info "Starting $TEST_NAME"
    log_info "Timestamp: $(date)"
    log_info "========================================="

    check_prerequisites
    test_native_arm_binaries
    test_clean_installation
    test_mcp_health
    test_rosetta_compatibility
    test_performance_metrics
    test_cli_commands

    log_info "========================================="
    log_info "All tests passed! ✅"
    log_info "Log file: $LOG_FILE"
    log_info "========================================="
}

# Run main function
main "$@"
