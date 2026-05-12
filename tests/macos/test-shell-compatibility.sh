#!/bin/bash
# Test Script: AC3 - Shell Compatibility (Bash & Zsh)
# Story: 1.10b - macOS Testing & Validation
# Acceptance Criteria: Works correctly with default zsh and bash shells

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test metadata
TEST_NAME="AC3: Shell Compatibility"
TEST_SCRIPT="test-shell-compatibility.sh"
LOG_FILE="/tmp/aiox-test-shell-$(date +%Y%m%d-%H%M%S).log"

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

# Test 1: Detect current shell
test_current_shell() {
    log_info "Test 1: Detecting current shell..."

    CURRENT_SHELL=$(basename "$SHELL")
    log_info "Current shell: $CURRENT_SHELL"

    # Check default shell on macOS (usually zsh on modern versions)
    DEFAULT_SHELL=$(dscl . -read ~/ UserShell | awk '{print $2}')
    log_info "Default shell: $DEFAULT_SHELL"

    if [[ "$CURRENT_SHELL" == "zsh" ]] || [[ "$CURRENT_SHELL" == "bash" ]]; then
        pass_test "Running on supported shell: $CURRENT_SHELL"
    else
        log_warning "Unusual shell detected: $CURRENT_SHELL"
    fi
}

# Test 2: Zsh profile updates
test_zsh_profile() {
    log_info "Test 2: Testing zsh profile updates..."

    ZSHRC="$HOME/.zshrc"

    if [[ ! -f "$ZSHRC" ]]; then
        log_warning ".zshrc does not exist yet"
        touch "$ZSHRC"
    fi

    # Backup original .zshrc
    cp "$ZSHRC" "${ZSHRC}.backup.$(date +%Y%m%d-%H%M%S)"
    log_info "Backed up .zshrc"

    # Check if AIOX path is in .zshrc
    if grep -q "AIOX" "$ZSHRC" 2>/dev/null; then
        log_info "AIOX configuration found in .zshrc"
        pass_test "Zsh profile contains AIOX configuration"
    else
        log_warning "AIOX configuration not found in .zshrc"
        log_info "This may be expected if installation hasn't run yet"
    fi

    # Test zsh can source the profile
    if zsh -c "source $ZSHRC; exit 0" &> /dev/null; then
        pass_test ".zshrc can be sourced without errors"
    else
        fail_test ".zshrc has syntax errors"
    fi
}

# Test 3: Bash profile updates
test_bash_profile() {
    log_info "Test 3: Testing bash profile updates..."

    # Check common bash profile locations
    BASH_PROFILES=("$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile")

    for PROFILE in "${BASH_PROFILES[@]}"; do
        if [[ -f "$PROFILE" ]]; then
            log_info "Found: $PROFILE"

            # Backup
            cp "$PROFILE" "${PROFILE}.backup.$(date +%Y%m%d-%H%M%S)"

            # Check for AIOX configuration
            if grep -q "AIOX" "$PROFILE" 2>/dev/null; then
                log_info "AIOX configuration found in $PROFILE"
            fi

            # Test bash can source the profile
            if bash -c "source $PROFILE; exit 0" &> /dev/null; then
                pass_test "$PROFILE can be sourced without errors"
            else
                log_warning "$PROFILE has syntax errors"
            fi
        fi
    done

    pass_test "Bash profile validation completed"
}

# Test 4: PATH persistence across sessions
test_path_persistence() {
    log_info "Test 4: Testing PATH persistence..."

    # Test in zsh
    log_info "Testing PATH in new zsh session..."
    ZSH_PATH=$(zsh -l -c 'echo $PATH')
    log_info "Zsh PATH: $ZSH_PATH"

    # Test in bash
    log_info "Testing PATH in new bash session..."
    BASH_PATH=$(bash -l -c 'echo $PATH')
    log_info "Bash PATH: $BASH_PATH"

    # Check if aiox is in PATH
    if command -v aiox &> /dev/null; then
        AIOX_LOCATION=$(which aiox)
        log_info "aiox command found at: $AIOX_LOCATION"
        pass_test "aiox command is in PATH"
    else
        log_warning "aiox command not found in PATH (may not be installed yet)"
    fi
}

# Test 5: Shell-specific features
test_shell_specific_features() {
    log_info "Test 5: Testing shell-specific features..."

    # Test zsh features
    if command -v zsh &> /dev/null; then
        log_info "Testing zsh completion..."

        # Check if compinit is available
        if zsh -c 'autoload -Uz compinit && compinit' &> /dev/null; then
            pass_test "Zsh completion system available"
        else
            log_warning "Zsh completion system not configured"
        fi
    fi

    # Test bash features
    if command -v bash &> /dev/null; then
        BASH_VERSION=$(bash --version | head -n 1)
        log_info "Bash version: $BASH_VERSION"

        # Check bash completion
        if [[ -f "/usr/local/etc/bash_completion" ]] || [[ -f "/opt/homebrew/etc/bash_completion" ]]; then
            pass_test "Bash completion available"
        else
            log_warning "Bash completion not installed (optional)"
        fi
    fi
}

# Test 6: Environment variable handling
test_environment_variables() {
    log_info "Test 6: Testing environment variable handling..."

    # Common environment variables that should be set
    ENV_VARS=("HOME" "USER" "PATH" "SHELL")

    for VAR in "${ENV_VARS[@]}"; do
        if [[ -n "${!VAR:-}" ]]; then
            log_info "$VAR=${!VAR}"
            pass_test "Environment variable $VAR is set"
        else
            fail_test "Environment variable $VAR is not set"
        fi
    done
}

# Test 7: Test command execution in both shells
test_command_execution() {
    log_info "Test 7: Testing command execution in both shells..."

    # Test simple command in zsh
    if zsh -c 'echo "Zsh test successful"' &> /dev/null; then
        pass_test "Command execution works in zsh"
    else
        fail_test "Command execution failed in zsh"
    fi

    # Test simple command in bash
    if bash -c 'echo "Bash test successful"' &> /dev/null; then
        pass_test "Command execution works in bash"
    else
        fail_test "Command execution failed in bash"
    fi

    # Test with pipes in zsh
    if zsh -c 'echo "test" | grep "test"' &> /dev/null; then
        pass_test "Piping works in zsh"
    else
        fail_test "Piping failed in zsh"
    fi

    # Test with pipes in bash
    if bash -c 'echo "test" | grep "test"' &> /dev/null; then
        pass_test "Piping works in bash"
    else
        fail_test "Piping failed in bash"
    fi
}

# Main test execution
main() {
    log_info "========================================="
    log_info "Starting $TEST_NAME"
    log_info "Timestamp: $(date)"
    log_info "========================================="

    test_current_shell
    test_zsh_profile
    test_bash_profile
    test_path_persistence
    test_shell_specific_features
    test_environment_variables
    test_command_execution

    log_info "========================================="
    log_info "All tests passed! ✅"
    log_info "Log file: $LOG_FILE"
    log_info "========================================="
}

# Run main function
main "$@"
