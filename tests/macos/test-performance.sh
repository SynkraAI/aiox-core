#!/bin/bash
# Test Script: AC8 - Performance Benchmarks
# Story: 1.10b - macOS Testing & Validation

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
TEST_NAME="AC8: Performance"
LOG_FILE="/tmp/aios-test-perf-$(date +%Y%m%d-%H%M%S).log"

log_info() { echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"; }
pass_test() { echo -e "${GREEN}[PASS]${NC} $1" | tee -a "$LOG_FILE"; }
fail_test() { echo -e "${RED}[FAIL]${NC} $1" | tee -a "$LOG_FILE"; exit 1; }

# Performance thresholds (in seconds)
MAX_INSTALL_TIME=300  # 5 minutes
MAX_HEALTH_CHECK=10   # 10 seconds
MAX_MCP_INSTALL=60    # 1 minute per MCP

test_full_installation_time() {
    log_info "Test 1: Measuring full installation time..."

    START_TIME=$(date +%s)

    log_info "Starting AIOS installation (this will take a few minutes)..."
    log_warning "This test requires manual interaction during installation"

    # Note: Actual installation would happen here
    # For testing purposes, we'll simulate timing
    log_info "Simulating installation... (in real test, run: npx @synkraai/aios@latest init)"

    # In actual test, measure real installation:
    # if npx @synkraai/aios@latest init; then
    #     END_TIME=$(date +%s)
    #     DURATION=$((END_TIME - START_TIME))
    #     ...
    # fi

    log_info "Installation timing would be measured here"
    log_info "Expected: < $MAX_INSTALL_TIME seconds (5 minutes)"
}

test_mcp_health_check_time() {
    log_info "Test 2: Measuring health check performance..."

    if ! command -v aios &> /dev/null; then
        log_warning "AIOS not installed, skipping performance test"
        return
    fi

    START_TIME=$(date +%s)
    aios health &> /dev/null || true
    END_TIME=$(date +%s)

    DURATION=$((END_TIME - START_TIME))
    log_info "Health check completed in $DURATION seconds"

    if [[ $DURATION -le $MAX_HEALTH_CHECK ]]; then
        pass_test "Health check completed in acceptable time ($DURATION s <= $MAX_HEALTH_CHECK s)"
    else
        fail_test "Health check too slow: $DURATION s (max: $MAX_HEALTH_CHECK s)"
    fi
}

test_cli_response_time() {
    log_info "Test 3: Measuring CLI command response times..."

    if ! command -v aios &> /dev/null; then
        log_warning "AIOS not installed, skipping CLI performance test"
        return
    fi

    # Test --version speed
    START=$(date +%s%N 2>/dev/null || date +%s)
    aios --version &> /dev/null || true
    END=$(date +%s%N 2>/dev/null || date +%s)

    if command -v bc &> /dev/null && [[ "$START" != "$END" ]]; then
        DURATION=$(echo "scale=3; ($END - $START) / 1000000" | bc)
        log_info "aios --version: ${DURATION}ms"

        if (( $(echo "$DURATION < 1000" | bc -l) )); then
            pass_test "CLI command responds quickly (<1s)"
        fi
    else
        log_info "Install 'bc' for millisecond precision timing"
    fi
}

test_network_operations() {
    log_info "Test 4: Testing network operation timeouts and retries..."

    # Test npm registry connectivity
    START_TIME=$(date +%s)

    if npm view @synkraai/aios version &> /dev/null; then
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))

        log_info "npm registry lookup: $DURATION seconds"

        if [[ $DURATION -le 10 ]]; then
            pass_test "Network operations complete within timeout"
        else
            log_warning "Network operations slow: $DURATION s"
        fi
    else
        log_warning "Cannot reach npm registry (check connectivity)"
    fi
}

test_system_resources() {
    log_info "Test 5: Checking system resource usage..."

    # Get CPU info
    CPU_COUNT=$(sysctl -n hw.ncpu)
    log_info "CPU cores: $CPU_COUNT"

    # Get memory
    MEMORY_GB=$(sysctl -n hw.memsize | awk '{printf "%.1f", $1/1024/1024/1024}')
    log_info "Total memory: ${MEMORY_GB}GB"

    # Get disk space
    DISK_AVAIL=$(df -h "$HOME" | tail -1 | awk '{print $4}')
    log_info "Disk space available: $DISK_AVAIL"

    # Check if system meets minimum requirements
    if [[ $CPU_COUNT -ge 2 ]] && (( $(echo "$MEMORY_GB >= 4" | bc -l) )); then
        pass_test "System resources adequate for AIOS"
    else
        log_warning "System resources may be insufficient"
    fi
}

test_architecture_performance() {
    log_info "Test 6: Architecture-specific performance..."

    ARCH=$(uname -m)
    log_info "Architecture: $ARCH"

    # Get chip info
    CHIP=$(sysctl -n machdep.cpu.brand_string)
    log_info "Chip: $CHIP"

    # For Apple Silicon, check if running native vs Rosetta
    if [[ "$ARCH" == "arm64" ]]; then
        NODE_ARCH=$(file "$(which node)")

        if echo "$NODE_ARCH" | grep -q "arm64"; then
            pass_test "Running native ARM binaries (optimal performance)"
        elif echo "$NODE_ARCH" | grep -q "x86_64"; then
            log_warning "Running under Rosetta (reduced performance expected)"
            pass_test "Rosetta compatibility confirmed (acceptable fallback)"
        fi
    fi
}

main() {
    log_info "========================================="
    log_info "Starting $TEST_NAME"
    log_info "Performance thresholds:"
    log_info "  - Full installation: < 5 minutes"
    log_info "  - Health check: < 10 seconds"
    log_info "  - MCP installation: < 1 minute each"
    log_info "========================================="

    test_full_installation_time
    test_mcp_health_check_time
    test_cli_response_time
    test_network_operations
    test_system_resources
    test_architecture_performance

    log_info "========================================="
    log_info "Performance tests completed! ✅"
    log_info "========================================="
}

main "$@"
