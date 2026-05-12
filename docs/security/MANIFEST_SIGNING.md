# Manifest Signing Guide

This document explains how to set up and use the cryptographic signing system for AIOX-Core install manifests.

## Overview

AIOX-Core uses **Ed25519 digital signatures** (via minisign format) to verify the integrity and authenticity of the `install-manifest.yaml` file. This ensures that:

1. The manifest has not been tampered with after signing
2. The manifest was signed by a party in possession of the authorized signing key
3. All file hashes in the manifest can be trusted as originating from the same signing authority

**Trust Model**: The root of trust is the public key pinned in the source code. Package registries (npm, etc.) serve only as distribution channels and are explicitly excluded from the trust model. Verification relies solely on cryptographic proof against the pinned key.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SIGNING WORKFLOW (Offline)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Signing Environment (Secure Machine)                            │
│  ┌──────────────────┐    ┌───────────────────────────────────┐  │
│  │ SECRET KEY       │───▶│ minisign -Sm install-manifest.yaml│  │
│  │ (aiox-core.key)  │    │         -s aiox-core.key          │  │
│  │ NEVER SHARE!     │    └───────────────────────────────────┘  │
│  └──────────────────┘                    │                       │
│                                          ▼                       │
│                          ┌───────────────────────────────────┐  │
│                          │ install-manifest.yaml.minisig     │  │
│                          │ (64-byte Ed25519 signature)       │  │
│                          └───────────────────────────────────┘  │
│                                          │                       │
└──────────────────────────────────────────│───────────────────────┘
                                           │
                                           ▼ Distributed via npm (untrusted channel)
┌─────────────────────────────────────────────────────────────────┐
│                  VERIFICATION WORKFLOW (post-install)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User's Machine (post-install)                                   │
│  ┌──────────────────┐    ┌───────────────────────────────────┐  │
│  │ PINNED PUBLIC KEY│───▶│ post-install-validator.js         │  │
│  │ (hardcoded in    │    │   1. Load manifest + signature     │  │
│  │  source code)    │    │   2. Verify Ed25519 signature      │  │
│  └──────────────────┘    │   3. Parse manifest (if valid)     │  │
│                          │   4. Verify all file SHA256 hashes │  │
│                          └───────────────────────────────────┘  │
│                                          │                       │
│                                          ▼                       │
│                          ┌───────────────────────────────────┐  │
│                          │ ✓ Installation verified            │  │
│                          │   or                               │  │
│                          │ ✗ SECURITY WARNING                 │  │
│                          └───────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Initial Setup (One-Time)

### 1. Install minisign

```bash
# macOS
brew install minisign

# Ubuntu/Debian
apt install minisign

# Windows (via scoop)
scoop install minisign

# Or download from: https://jedisct1.github.io/minisign/
```

### 2. Generate Key Pair

```bash
# Generate a new Ed25519 key pair
minisign -G -p aiox-core.pub -s aiox-core.key

# You will be prompted for a password to protect the secret key
# CHOOSE A STRONG PASSWORD!

# Output:
#   aiox-core.pub  - PUBLIC key (safe to share, will be hardcoded)
#   aiox-core.key  - SECRET key (NEVER share, store securely)
```

### 3. View Public Key

```bash
cat aiox-core.pub
# Output example:
# untrusted comment: minisign public key AIOX0001
# RWQf6LRCGA9i8VYn7sGv...base64...
```

### 4. Embed Public Key in Source Code

Edit `src/installer/manifest-signature.js`:

```javascript
const PINNED_PUBLIC_KEY = {
  // Key ID from the public key file comment
  keyId: 'AIOX0001',
  // Base64 public key (the second line of aiox-core.pub)
  publicKey: 'RWQf6LRCGA9i8VYn7sGv...your-actual-key...',
  algorithm: 'Ed25519',
};
```

**IMPORTANT**: The public key MUST be hardcoded in the source code. Never load it from external files or environment variables - this is the root of trust.

### 5. Secure the Secret Key

- Store `aiox-core.key` in a secure location (password manager, HSM, etc.)
- NEVER commit it to git
- Add to `.gitignore`:
  ```gitignore
  *.key
  aiox-core.key
  ```
- Consider using a hardware security key for additional protection

## Release Workflow

### Before Each Release

1. **Generate/Update Manifest**

   ```bash
   node bin/aiox.js manifest:generate
   # Creates .aiox-core/install-manifest.yaml with all file hashes
   ```

2. **Sign the Manifest**

   ```bash
   cd .aiox-core
   minisign -Sm install-manifest.yaml -s /path/to/aiox-core.key

   # Enter your password when prompted
   # Creates: install-manifest.yaml.minisig
   ```

3. **Verify Signature (Optional but Recommended)**

   ```bash
   minisign -Vm install-manifest.yaml -p /path/to/aiox-core.pub
   # Should output: Signature and comment signature verified
   ```

4. **Commit Both Files**

   ```bash
   git add .aiox-core/install-manifest.yaml
   git add .aiox-core/install-manifest.yaml.minisig
   git commit -m "chore: update manifest and signature for vX.Y.Z"
   ```

5. **Publish**
   ```bash
   npm publish
   ```

## Signature File Format

The `.minisig` file follows the minisign format as specified at https://jedisct1.github.io/minisign/.

```text
untrusted comment: signature from minisign secret key
RUQf6LRCGA9i8...base64-encoded-signature-blob...
trusted comment: timestamp:1234567890 file:install-manifest.yaml
...base64-encoded-global-signature...
```

### Signature Blob Structure

The signature blob encoding follows the minisign specification. For reference, the structure contains:

- Algorithm identifier (2 bytes)
- Key ID (8 bytes)
- Ed25519 signature (64 bytes)

**Note**: Applications should use the verification module (`manifest-signature.js`) rather than parsing the signature format directly. The exact wire format is defined by the minisign specification and may vary in optional fields.

## Development Mode

During development and testing, signature verification can be bypassed:

```javascript
const validator = new PostInstallValidator(projectRoot, frameworkRoot, {
  requireSignature: false, // Skip signature check
  verifyHashes: true, // Still verify file hashes
});
```

**CRITICAL SECURITY WARNING**: Setting `requireSignature: false` completely disables signature verification and voids all cryptographic security guarantees provided by this system. With signature verification disabled:

- Manifest authenticity cannot be verified
- Tampered manifests will be accepted
- The trust chain is broken

This option exists **exclusively** for local development environments. Production builds **MUST** enforce signature verification (`requireSignature: true`). Any deployment with signature verification disabled should be considered insecure.

## Verification Behavior

| Mode                                    | Signature Missing | Invalid Signature | Valid Signature |
| --------------------------------------- | ----------------- | ----------------- | --------------- |
| Production (`requireSignature: true`)   | ERROR             | ERROR             | OK              |
| Development (`requireSignature: false`) | WARN              | ERROR             | OK              |

## Troubleshooting

### "Manifest signature file not found (.minisig)"

The signature file is missing. The party in possession of the signing key must sign the manifest:

```bash
minisign -Sm .aiox-core/install-manifest.yaml -s /path/to/aiox-core.key
```

### "Key ID mismatch"

The manifest was signed with a different key than the one pinned in the code. Ensure the signing party is using the correct key pair that corresponds to the pinned public key.

### "Signature verification failed"

The manifest content has been modified after signing. Regenerate and re-sign:

```bash
node bin/aiox.js manifest:generate
minisign -Sm .aiox-core/install-manifest.yaml -s /path/to/aiox-core.key
```

### "Unsupported signature algorithm"

The signature file is not using Ed25519. Ensure you're using standard minisign (not a fork with different algorithms).

## Security Considerations

1. **Key Compromise**: If the secret key is compromised, generate a new key pair and release a new version with the updated pinned public key. Users must upgrade to a release containing the new pinned public key to restore security guarantees. Releases signed with the compromised key should be considered untrusted.

2. **Key Rotation**: Plan for periodic key rotation. After rotation, users must upgrade to a release containing the new pinned public key. Announce deprecation of old keys well in advance to allow for upgrade windows.

3. **CI/CD Signing**: For automated releases, consider:
   - Using a signing service
   - Storing the secret key in a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault)
   - Using GitHub Actions encrypted secrets (with caution)

4. **Verification Bypass**: The `requireSignature: false` option voids all security guarantees and must never be used in production. Any build distributed with signature verification disabled should be treated as insecure.

## API Reference

### `verifyManifestSignature(manifestContent, signatureContent, options)`

Verifies a manifest signature.

**Parameters:**

- `manifestContent` (Buffer): Raw manifest file content
- `signatureContent` (string): Content of .minisig file
- `options.publicKey` (Object): Override public key (testing only)

**Returns:**

```javascript
{
  valid: boolean,      // true if signature is valid
  error: string|null,  // error message if invalid
  keyId: string|null   // key ID used for signing
}
```

### `loadAndVerifyManifest(manifestPath, options)`

Loads and verifies a manifest file.

**Parameters:**

- `manifestPath` (string): Path to manifest file
- `options.requireSignature` (boolean): Fail if signature missing (default: true)

**Returns:**

```javascript
{
  content: Buffer|null,  // manifest content if valid
  verified: boolean,     // true if signature verified
  error: string|null     // error message if failed
}
```

## Changelog

- **v3.10.0**: Initial implementation of manifest signing
  - Ed25519 signatures via minisign format
  - Pinned public key in source code
  - Integration with post-install validator
