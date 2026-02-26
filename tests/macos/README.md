# macOS Testing Suite for AIOS
**Story 1.10b - macOS Testing & Validation**

Comprehensive test automation framework for validating AIOS installation on macOS (Intel and Apple Silicon).

---

## 🚀 Quick Start

### Run All Tests

```bash
cd tests/macos
chmod +x *.sh
./run-all-tests.sh
```

### Run Specific Test

```bash
./test-intel-installation.sh        # AC1: Intel Mac
./test-apple-silicon-installation.sh # AC2: Apple Silicon
./test-shell-compatibility.sh       # AC3: Bash/Zsh
# ... etc
```

---

## 📦 What's Included

### Test Scripts (10 files)

| Script | AC | Description | Duration |
|--------|----|---------|----|
| `test-intel-installation.sh` | AC1 | Intel Mac installation validation | ~10 min |
| `test-apple-silicon-installation.sh` | AC2 | Apple Silicon (M1/M2/M3) validation | ~10 min |
| `test-shell-compatibility.sh` | AC3 | Bash/Zsh shell compatibility | ~5 min |
| `test-path-handling.sh` | AC4 | Path handling & symlinks | ~3 min |
| `test-line-endings.sh` | AC5 | LF line ending verification | ~2 min |
| `test-permissions.sh` | AC6 | File permission validation | ~3 min |
| `test-homebrew-integration.sh` | AC7 | Homebrew & package managers | ~5 min |
| `test-performance.sh` | AC8 | Performance benchmarks | ~10 min |
| `test-security.sh` | AC9 | Security compliance (Gatekeeper, TCC, SIP) | ~5 min |
| `test-error-recovery.sh` | AC10 | Error handling & rollback | ~10 min |

**Total estimated time:** ~63 minutes

### Test Infrastructure

- **`run-all-tests.sh`** - Master test runner
  - Executes all tests in sequence
  - Generates comprehensive report
  - Skips architecture-incompatible tests automatically
  - Outputs color-coded results

### Documentation

- **`MANUAL-TESTING-GUIDE.md`** - Complete manual testing guide
  - Step-by-step procedures
  - Troubleshooting section
  - Issue reporting template

---

## 🎯 Test Coverage

### Acceptance Criteria Coverage: 100%

- ✅ **AC1:** Intel Mac installation support
- ✅ **AC2:** Apple Silicon (M1/M2/M3) support
- ✅ **AC3:** Shell compatibility (Bash & Zsh)
- ✅ **AC4:** Path handling (forward slashes, tilde, symlinks)
- ✅ **AC5:** Line endings (LF not CRLF)
- ✅ **AC6:** File permissions (executable scripts, correct ownership)
- ✅ **AC7:** Package manager integration (Homebrew, npm, yarn, pnpm)
- ✅ **AC8:** Performance benchmarks (installation < 5min, health check < 10s)
- ✅ **AC9:** Security compliance (Gatekeeper, code signing, TCC permissions)
- ✅ **AC10:** Error recovery (rollback, error messages, system info logging)

---

## 🔧 Prerequisites

### System Requirements

- **macOS Version:** 10.15 (Catalina) or newer
- **Architecture:** Intel (x86_64) or Apple Silicon (arm64)
- **Node.js:** Version 18+
- **npm:** Included with Node.js
- **Bash/Zsh:** Pre-installed on macOS

### Optional

- **Homebrew:** For package management tests
- **Git:** For line ending tests

---

## 📊 Test Output

Each test produces:

1. **Console Output:**
   - Color-coded results (green = pass, red = fail, yellow = skip)
   - Real-time progress indicators
   - Summary statistics

2. **Log Files:**
   - Location: `/tmp/aios-test-*.log`
   - Timestamped filenames
   - Complete system information
   - Detailed test results

3. **Summary Report:**
   - Total tests run
   - Pass/fail/skip counts
   - Overall status (PASS/FAIL)

---

## 🤖 CI/CD Integration

### GitHub Actions Workflow

Location: `.github/workflows/macos-testing.yml`

**Features:**
- Parallel execution on Intel (macos-13) and Apple Silicon (macos-14) runners
- Automated test reporting
- Artifact collection (logs, summaries)
- PR comment integration
- Performance comparison between architectures

**Triggers:**
- Push to `main` or `develop`
- Pull requests
- Manual workflow dispatch

---

## 📖 Usage Examples

### Run All Tests with Report

```bash
./run-all-tests.sh
# View report at: /tmp/aios-macos-test-report-*.txt
```

### Run Specific AC Test

```bash
./run-all-tests.sh --test AC1
./run-all-tests.sh --test AC8
```

### Check Test Help

```bash
./run-all-tests.sh --help
```

### Manual Test Execution

Follow the guide:
```bash
open MANUAL-TESTING-GUIDE.md
# Or: cat MANUAL-TESTING-GUIDE.md
```

---

## 🐛 Troubleshooting

### Tests Not Executable

```bash
chmod +x tests/macos/*.sh
```

### Architecture Mismatch

Some tests automatically skip on incompatible architectures:
- `test-intel-installation.sh` - Skips on Apple Silicon
- `test-apple-silicon-installation.sh` - Skips on Intel

This is **expected behavior**.

### Permission Denied

```bash
# Run tests from your home directory or user-writable location
cd ~/path/to/aios-core/tests/macos
./run-all-tests.sh
```

### Missing Dependencies

Install required tools:
```bash
# Homebrew (optional but recommended)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js 18+
brew install node@20
# Or download from: https://nodejs.org/
```

---

## 📝 Reporting Issues

### Information to Include

1. **System Information:**
   ```bash
   sw_vers && uname -a && node --version
   ```

2. **Test Logs:**
   - Attach all `/tmp/aios-test-*.log` files

3. **Test Output:**
   - Copy complete console output

4. **Steps to Reproduce:**
   - Exact commands run
   - Environment details

### Create Issue

Use format:
```
Title: [Story 1.10b] Test Failure: AC# - Description
Labels: testing, macos
Body: [Include above information]
```

---

## 🔬 Test Architecture

### Design Principles

1. **Modular:** Each AC has standalone test script
2. **Non-Destructive:** Tests don't break existing installations
3. **Portable:** Zero external dependencies beyond macOS + Node.js
4. **Comprehensive:** Every AC validated with multiple checks
5. **Automated:** Can run in CI/CD or manually
6. **Cross-Architecture:** Automatically adapts to Intel/ARM

### Script Structure

Each test script follows this pattern:

```bash
#!/bin/bash
# Header: AC description
set -euo pipefail

# Colors and logging setup
# Utility functions (log_info, pass_test, fail_test)
# Test prerequisites check
# Individual test functions
# Main execution
```

---

## 📚 Additional Resources

- **Story Document:** `docs/stories/v2.1/sprint-1/story-1.10b-macos-testing.md`
- **Manual Guide:** `MANUAL-TESTING-GUIDE.md`
- **CI/CD Workflow:** `.github/workflows/macos-testing.yml`

---

## ✅ Story Status

**Current Status:** InProgress
**Implementation:** Complete (tests created, not yet executed on macOS)
**Next Steps:** Execute tests on actual macOS systems (Intel and Apple Silicon)

---

**Created by:** Quinn (QA Guardian) 🛡️
**Date:** 2025-01-23
**Version:** 1.0
