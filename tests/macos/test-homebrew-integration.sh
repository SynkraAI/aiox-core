#!/bin/bash
# Test Script: AC7 - Homebrew Integration
# Story: 1.10b - macOS Testing & Validation

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
TEST_NAME="AC7: Homebrew Integration"
LOG_FILE="/tmp/aiox-test-brew-$(date +%Y%m%d-%H%M%S).log"

log_info() { echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"; }
pass_test() { echo -e "${GREEN}[PASS]${NC} $1" | tee -a "$LOG_FILE"; }
fail_test() { echo -e "${RED}[FAIL]${NC} $1" | tee -a "$LOG_FILE"; exit 1; }

test_homebrew_detection() {
    log_info "Test 1: Detecting Homebrew installation..."

    if command -v brew &> /dev/null; then
        BREW_VERSION=$(brew --version | head -n 1)
        BREW_PREFIX=$(brew --prefix)

        log_info "Homebrew detected: $BREW_VERSION"
        log_info "Homebrew prefix: $BREW_PREFIX"

        # Check architecture-specific paths
        ARCH=$(uname -m)
        if [[ "$ARCH" == "arm64" ]]; then
            EXPECTED_PREFIX="/opt/homebrew"
        else
            EXPECTED_PREFIX="/usr/local"
        fi

        if [[ "$BREW_PREFIX" == "$EXPECTED_PREFIX" ]]; then
            pass_test "Homebrew in correct location for $ARCH"
        else
            log_warning "Homebrew at unexpected location: $BREW_PREFIX (expected: $EXPECTED_PREFIX)"
        fi

        pass_test "Homebrew is installed and detected"
    else
        log_warning "Homebrew not installed (optional but recommended)"
        log_info "Install with: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    fi
}

test_npm_without_sudo() {
    log_info "Test 2: Testing npm operations without sudo..."

    # Check npm prefix
    NPM_PREFIX=$(npm config get prefix)
    log_info "npm prefix: $NPM_PREFIX"

    # Check if prefix is user-writable
    if [[ -w "$NPM_PREFIX" ]] || [[ "$NPM_PREFIX" == "$HOME"* ]]; then
        pass_test "npm prefix is user-writable (no sudo needed)"
    else
        log_warning "npm prefix may require sudo: $NPM_PREFIX"
    fi

    # Test global package list without sudo
    if npm list -g --depth=0 &> /dev/null; then
        pass_test "Can list global packages without sudo"
    else
        fail_test "Cannot list global packages"
    fi
}

test_node_version() {
    log_info "Test 3: Verifying Node.js version compatibility..."

    NODE_VERSION=$(node --version | sed 's/v//')
    MAJOR_VERSION=$(echo "$NODE_VERSION" | cut -d '.' -f 1)

    log_info "Node.js version: v$NODE_VERSION"

    if [[ $MAJOR_VERSION -ge 18 ]]; then
        pass_test "Node.js version compatible (>= 18)"
    else
        fail_test "Node.js version too old: v$NODE_VERSION (required: >= 18)"
    fi
}

test_package_managers() {
    log_info "Test 4: Testing package manager availability..."

    # Test npm
    if command -v npm &> /dev/null; then
        pass_test "npm is available"
    else
        fail_test "npm not found"
    fi

    # Test yarn (optional)
    if command -v yarn &> /dev/null; then
        YARN_VERSION=$(yarn --version)
        log_info "yarn is available: v$YARN_VERSION"
        pass_test "yarn is available (optional)"
    fi

    # Test pnpm (optional)
    if command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm --version)
        log_info "pnpm is available: v$PNPM_VERSION"
        pass_test "pnpm is available (optional)"
    fi
}

test_homebrew_node() {
    log_info "Test 5: Checking if Node.js installed via Homebrew..."

    if command -v brew &> /dev/null; then
        if brew list node &> /dev/null; then
            NODE_INFO=$(brew info node --json | grep -o '"version":"[^"]*"' | cut -d '"' -f 4)
            log_info "Node.js installed via Homebrew: $NODE_INFO"
            pass_test "Homebrew Node.js detected"
        else
            log_info "Node.js not installed via Homebrew (may be from nvm, fnm, etc.)"
        fi
    fi
}

main() {
    log_info "========================================="
    log_info "Starting $TEST_NAME"
    test_homebrew_detection
    test_npm_without_sudo
    test_node_version
    test_package_managers
    test_homebrew_node
    log_info "All tests passed! ✅"
    log_info "========================================="
}

main "$@"
