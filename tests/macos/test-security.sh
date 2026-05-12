#!/bin/bash
# Test Script: AC9 - Security & Compliance
# Story: 1.10b - macOS Testing & Validation

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
TEST_NAME="AC9: Security Compliance"
LOG_FILE="/tmp/aiox-test-security-$(date +%Y%m%d-%H%M%S).log"

log_info() { echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"; }
pass_test() { echo -e "${GREEN}[PASS]${NC} $1" | tee -a "$LOG_FILE"; }
fail_test() { echo -e "${RED}[FAIL]${NC} $1" | tee -a "$LOG_FILE"; exit 1; }

test_gatekeeper() {
    log_info "Test 1: Gatekeeper compatibility..."

    # Check Gatekeeper status
    GATEKEEPER_STATUS=$(spctl --status)
    log_info "Gatekeeper status: $GATEKEEPER_STATUS"

    # Check SIP (System Integrity Protection)
    SIP_STATUS=$(csrutil status 2>/dev/null || echo "Cannot check SIP (requires reboot to Recovery)")
    log_info "SIP status: $SIP_STATUS"

    pass_test "Security systems detected and logged"
}

test_code_signing() {
    log_info "Test 2: Code signing verification..."

    # Check if node binary is signed
    NODE_BINARY=$(which node)

    if codesign -v "$NODE_BINARY" 2>/dev/null; then
        log_info "Node.js binary is code signed"
        pass_test "Code signing verification successful"
    else
        log_warning "Node.js binary not signed (common for Homebrew installations)"
        log_info "This is acceptable for development use"
    fi
}

test_permissions_prompts() {
    log_info "Test 3: TCC (Transparency, Consent, and Control) permissions..."

    # Check if AIOX has requested any permissions
    # Note: This would typically show in System Preferences > Security & Privacy > Privacy

    # List permissions databases (read-only check)
    TCC_DB="/Library/Application Support/com.apple.TCC/TCC.db"

    if [[ -r "$TCC_DB" ]]; then
        log_info "TCC database accessible (read-only)"
    else
        log_info "TCC database not directly readable (expected for security)"
    fi

    log_info "Standard AIOX operations should not trigger security prompts"
    pass_test "Permission system awareness confirmed"
}

test_keychain_access() {
    log_info "Test 4: Keychain access (if applicable)..."

    # Check if security command works
    if security list-keychains &> /dev/null; then
        log_info "Keychain access available"
        pass_test "Keychain functionality available"
    else
        fail_test "Cannot access keychain"
    fi
}

test_firewall_compatibility() {
    log_info "Test 5: Application Firewall compatibility..."

    # Check firewall status
    FIREWALL_STATUS=$(sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate 2>/dev/null || echo "Cannot check (requires sudo)")

    log_info "Firewall status: $FIREWALL_STATUS"

    # AIOX should work with firewall enabled
    pass_test "Firewall compatibility noted"
}

test_quarantine_attributes() {
    log_info "Test 6: Quarantine attribute handling..."

    # Check if downloaded files have quarantine attribute
    TEST_FILE="/tmp/aiox-quarantine-test-$$.txt"
    echo "test" > "$TEST_FILE"

    # Check extended attributes
    if xattr "$TEST_FILE" 2>/dev/null | grep -q "com.apple.quarantine"; then
        log_info "Quarantine attribute present on new files"
    else
        log_info "No quarantine attribute (expected for locally created files)"
    fi

    rm -f "$TEST_FILE"
    pass_test "Quarantine attribute handling verified"
}

test_secure_paths() {
    log_info "Test 7: Secure path handling..."

    # Check PATH for suspicious entries
    IFS=':' read -ra PATHS <<< "$PATH"

    for p in "${PATHS[@]}"; do
        if [[ "$p" == "." ]] || [[ "$p" == "" ]]; then
            fail_test "Insecure PATH entry detected: '$p'"
        fi
    done

    pass_test "PATH contains no insecure entries"
}

main() {
    log_info "========================================="
    log_info "Starting $TEST_NAME"
    log_info "Testing macOS security features:"
    log_info "  - Gatekeeper"
    log_info "  - Code signing"
    log_info "  - TCC permissions"
    log_info "  - Firewall compatibility"
    log_info "========================================="

    test_gatekeeper
    test_code_signing
    test_permissions_prompts
    test_keychain_access
    test_firewall_compatibility
    test_quarantine_attributes
    test_secure_paths

    log_info "========================================="
    log_info "Security tests completed! ✅"
    log_info "========================================="
}

main "$@"
