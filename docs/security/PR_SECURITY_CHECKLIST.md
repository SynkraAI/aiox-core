# PR #56 - Security Hardening Checklist

## Summary of Changes

This PR implements comprehensive security hardening for the post-install validator as part of Story 6.19.

## Files Changed

| File                                             | Change Type  | Description                              |
| ------------------------------------------------ | ------------ | ---------------------------------------- |
| `src/installer/post-install-validator.js`        | **Modified** | Complete rewrite with security hardening |
| `src/installer/manifest-signature.js`            | **New**      | Ed25519 signature verification module    |
| `bin/aiox-init.js`                               | **Modified** | Added `requireSignature` option          |
| `tests/installer/post-install-validator.test.js` | **New**      | Security test suite                      |
| `docs/security/MANIFEST_SIGNING.md`              | **New**      | Signing workflow documentation           |

## Security Controls Implemented

### 1. Root of Trust & Signature Verification

- [x] Ed25519 signatures using minisign format
- [x] Public key pinned in source code (not loaded from files)
- [x] Signature verified BEFORE parsing manifest YAML
- [x] Key ID validation to prevent key confusion attacks

**Action Required**: Before production release, maintainers must:

1. Generate a key pair: `minisign -G -p aiox-core.pub -s aiox-core.key`
2. Update `PINNED_PUBLIC_KEY` in `manifest-signature.js` with the real public key
3. Sign the manifest: `minisign -Sm install-manifest.yaml -s aiox-core.key`

### 2. Path Traversal Prevention

- [x] Block `../` and `..\` sequences
- [x] Block absolute paths (`/etc/passwd`, `C:\Windows`)
- [x] Block null byte injection (`file.txt\0.exe`)
- [x] Block Windows Alternate Data Streams (`file.txt:$DATA`)
- [x] Validate all paths are contained within project root

### 3. Manifest Schema Validation

- [x] Reject unknown fields (prevent injection of malicious properties)
- [x] Validate hash algorithm is `sha256` only
- [x] Validate size is non-negative integer
- [x] Validate path is non-empty string
- [x] Limit path length to 1024 characters
- [x] Use YAML FAILSAFE_SCHEMA to prevent code execution

### 4. DoS Protection

- [x] MAX_MANIFEST_SIZE: 10 MB
- [x] MAX_FILE_COUNT: 50,000 files
- [x] MAX_SCAN_DEPTH: 50 directory levels
- [x] MAX_SCAN_FILES: 100,000 files during discovery
- [x] MAX_PATH_LENGTH: 1,024 characters

### 5. Filesystem Safety

- [x] Symlink rejection using `fs.lstatSync()`
- [x] Atomic file operations where possible
- [x] No modification of files outside project root

### 6. Hash Verification

- [x] SHA256 for all file integrity checks
- [x] Streaming hash calculation for memory efficiency
- [x] Size-first validation for fast failure
- [x] Corrupted file detection blocks validation

### 7. Secure Repair Mechanism

- [x] Repair requires valid manifest
- [x] Repair requires source file hash verification
- [x] Repair path is validated before copy
- [x] No repair in signature-required mode without valid signature

## Test Results

```text
Security Audit Results:
- Total tests: 31
- Passed: 31 (100%)
- Files validated: 766
- Integrity: 100%
- Performance: 4,453 files/sec (SHA256)
```

### Test Categories

| Category                  | Tests | Status      |
| ------------------------- | ----- | ----------- |
| Path Traversal Prevention | 7     | ✅ All Pass |
| Schema Validation         | 9     | ✅ All Pass |
| Signature Enforcement     | 2     | ✅ All Pass |
| Full Hash Validation      | 1     | ✅ Pass     |
| Quick Size Validation     | 1     | ✅ Pass     |
| Symlink Attack            | 1     | ✅ Pass     |
| DoS Limits                | 3     | ✅ Pass     |
| Package Structure         | 6     | ✅ All Pass |

## Breaking Changes

None. The validator maintains backward compatibility:

- Existing projects without signatures will work in development mode
- Hash verification behavior unchanged
- Exit codes unchanged

## Migration Guide

### For Maintainers (Before Production)

1. **Generate signing keys**:

   ```bash
   minisign -G -p aiox-core.pub -s aiox-core.key
   ```

2. **Update public key** in `src/installer/manifest-signature.js`:

   ```javascript
   const PINNED_PUBLIC_KEY = {
     keyId: 'AIOX0001',
     publicKey: 'YOUR_BASE64_PUBLIC_KEY_HERE',
     algorithm: 'Ed25519',
   };
   ```

3. **Sign manifest** before each release:

   ```bash
   minisign -Sm .aiox-core/install-manifest.yaml -s aiox-core.key
   ```

4. **Commit signature file**:
   ```bash
   git add .aiox-core/install-manifest.yaml.minisig
   ```

### For Users

No action required. The validator handles signature verification automatically.

## Reviewer Checklist

- [ ] Verify public key placeholder is marked as TODO
- [ ] Confirm no secrets are hardcoded
- [ ] Review path traversal test coverage
- [ ] Verify YAML parsing uses FAILSAFE_SCHEMA
- [ ] Confirm signature verification happens before YAML parsing
- [ ] Check DoS limits are reasonable
- [ ] Verify tests cover all security controls

## Related Issues

- Closes CodeRabbit Issue #1: Corrupted files now fail validation
- Closes CodeRabbit Issue #2: Path traversal fully prevented
- Closes CodeRabbit Issue #3: Size mismatches now properly handled

## References

- [minisign](https://jedisct1.github.io/minisign/) - Signature tool
- [OWASP Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)
- [CWE-22: Improper Limitation of a Pathname](https://cwe.mitre.org/data/definitions/22.html)
