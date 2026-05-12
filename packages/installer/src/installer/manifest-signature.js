/**
 * Manifest Signature Verification
 * Implements minisign-compatible signature verification for install manifests
 *
 * @module src/installer/manifest-signature
 * @story 6.19 - Post-Installation Validation & Integrity Verification
 * @security CRITICAL - This module establishes the root of trust
 *
 * Signing workflow (offline, by maintainers):
 *   minisign -Sm install-manifest.yaml -s /path/to/secret.key
 *
 * This creates install-manifest.yaml.minisig
 */

'use strict';

const crypto = require('crypto');
const fs = require('fs');

/**
 * Security limits for signature verification
 * @constant
 */
const SignatureLimits = {
  // Maximum manifest file size (10MB) - prevents DoS via large file loading
  MAX_MANIFEST_SIZE: 10 * 1024 * 1024,
  // Maximum signature file size (10KB) - .minisig files are typically ~200 bytes
  MAX_SIGNATURE_SIZE: 10 * 1024,
};

/**
 * PINNED PUBLIC KEY - MUST BE HARDCODED
 * This is the root of trust for manifest verification.
 * Generated with: minisign -G -p aiox-core.pub -s aiox-core.key
 *
 * Format: base64-encoded Ed25519 public key
 * DO NOT load this from external files or environment variables.
 */
const PINNED_PUBLIC_KEY = {
  // Key ID (8 bytes, base64 encoded) - opaque identifier, not UTF-8 text
  // This is compared as raw bytes against the signature's key ID
  keyId: Buffer.from('AIOX0001').toString('base64'), // 'QUlPUzAwMDE='
  // Ed25519 public key (32 bytes, base64 encoded)
  // TODO: Replace with actual generated public key before production
  publicKey: 'REPLACE_WITH_ACTUAL_PUBLIC_KEY_BASE64_HERE',
  // Algorithm identifier
  algorithm: 'Ed25519',
};

/**
 * Placeholder key identifier - used to detect uninitialized keys
 * @constant {string}
 */
const PLACEHOLDER_KEY = 'REPLACE_WITH_ACTUAL_PUBLIC_KEY_BASE64_HERE';

/**
 * Check if the pinned public key is still the placeholder
 * @returns {boolean} True if key needs to be replaced
 */
function isPlaceholderKey() {
  return PINNED_PUBLIC_KEY.publicKey === PLACEHOLDER_KEY;
}

/**
 * Signature verification result
 * @typedef {Object} VerificationResult
 * @property {boolean} valid - True if signature is valid
 * @property {string|null} error - Error message if invalid
 * @property {string|null} keyId - Key ID used for signing
 */

/**
 * Parse a minisign signature file
 * Minisign signature format:
 *   Line 1: untrusted comment
 *   Line 2: base64-encoded signature
 *   Line 3 (optional): trusted comment
 *   Line 4 (optional): base64-encoded global signature
 *
 * @param {string} signatureContent - Content of .minisig file
 * @returns {Object} Parsed signature components
 */
function parseMinisignSignature(signatureContent) {
  const lines = signatureContent.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('Invalid signature format: insufficient lines');
  }

  // Line 1: untrusted comment (starts with "untrusted comment: ")
  if (!lines[0].startsWith('untrusted comment:')) {
    throw new Error('Invalid signature format: missing untrusted comment');
  }

  // Line 2: base64 signature blob
  const signatureBlob = Buffer.from(lines[1].trim(), 'base64');

  if (signatureBlob.length < 74) {
    throw new Error('Invalid signature format: signature too short');
  }

  // Parse signature blob structure:
  // bytes 0-1: algorithm (Ed = 0x45 0x64)
  // bytes 2-9: key ID (8 bytes)
  // bytes 10-73: signature (64 bytes)
  const algorithm = signatureBlob.slice(0, 2).toString('ascii');
  const keyId = signatureBlob.slice(2, 10);
  const signature = signatureBlob.slice(10, 74);

  // Optional: trusted comment and global signature
  let trustedComment = null;
  let globalSignature = null;

  if (lines.length >= 4) {
    if (lines[2].startsWith('trusted comment:')) {
      trustedComment = lines[2].substring('trusted comment:'.length).trim();
      globalSignature = Buffer.from(lines[3].trim(), 'base64');
    }
  }

  return {
    algorithm,
    keyId,
    signature,
    trustedComment,
    globalSignature,
  };
}

/**
 * Verify Ed25519 signature using Node.js crypto
 *
 * @param {Buffer} message - Message that was signed
 * @param {Buffer} signature - 64-byte Ed25519 signature
 * @param {Buffer} publicKey - 32-byte Ed25519 public key
 * @returns {boolean} True if signature is valid
 */
function verifyEd25519(message, signature, publicKey) {
  try {
    // Node.js 16+ supports Ed25519 natively
    const keyObject = crypto.createPublicKey({
      key: Buffer.concat([
        // Ed25519 public key DER prefix
        Buffer.from('302a300506032b6570032100', 'hex'),
        publicKey,
      ]),
      format: 'der',
      type: 'spki',
    });

    return crypto.verify(null, message, keyObject, signature);
  } catch (_error) {
    // Fallback error - verification failed
    return false;
  }
}

/**
 * Compute Blake2b-512 hash for prehashed signatures
 * @param {Buffer} data - Data to hash
 * @returns {Buffer} 64-byte Blake2b-512 hash
 */
function blake2b512(data) {
  // Node.js 16+ supports blake2b512 natively
  return crypto.createHash('blake2b512').update(data).digest();
}

/**
 * Verify manifest signature against pinned public key
 *
 * SECURITY: This function MUST be called BEFORE parsing the manifest YAML.
 * The manifest content should be treated as untrusted bytes until this returns valid.
 *
 * @param {Buffer} manifestContent - Raw manifest file content (NOT parsed)
 * @param {string} signatureContent - Content of .minisig signature file
 * @param {Object} [options] - Verification options
 * @param {Object} [options.publicKey] - Override public key (for testing only)
 * @returns {VerificationResult} Verification result
 */
function verifyManifestSignature(manifestContent, signatureContent, options = {}) {
  const result = {
    valid: false,
    error: null,
    keyId: null,
  };

  try {
    // SECURITY: Check for placeholder key before any verification
    const pubKey = options.publicKey || PINNED_PUBLIC_KEY;
    if (!options.publicKey && isPlaceholderKey()) {
      result.error =
        'SECURITY ERROR: Public key has not been configured. ' +
        'Replace PINNED_PUBLIC_KEY in manifest-signature.js with the actual Ed25519 public key.';
      return result;
    }

    // Parse signature file
    const sig = parseMinisignSignature(signatureContent);

    // Verify algorithm - minisign uses "Ed" for pure Ed25519, "ED" for prehashed
    const isPrehashed = sig.algorithm === 'ED';
    if (sig.algorithm !== 'Ed' && sig.algorithm !== 'ED') {
      result.error = `Unsupported signature algorithm '${sig.algorithm}' (expected 'Ed' or 'ED')`;
      return result;
    }

    // Verify key ID matches (compare as raw bytes, not UTF-8)
    const expectedKeyId = Buffer.from(pubKey.keyId, 'base64');
    result.keyId = sig.keyId.toString('hex'); // Display as hex for debugging

    if (!sig.keyId.equals(expectedKeyId)) {
      result.error = `Key ID mismatch: expected ${expectedKeyId.toString('hex')}, got ${result.keyId}`;
      return result;
    }

    // Decode public key
    const publicKeyBytes = Buffer.from(pubKey.publicKey, 'base64');
    if (publicKeyBytes.length !== 32) {
      result.error = 'Invalid public key length';
      return result;
    }

    // Verify signature
    // Minisign uses Blake2b-512(message) for prehashed mode ("ED"), or message directly ("Ed")
    const messageToVerify = isPrehashed ? blake2b512(manifestContent) : manifestContent;
    const isValid = verifyEd25519(messageToVerify, sig.signature, publicKeyBytes);

    if (!isValid) {
      result.error = 'Signature verification failed';
      return result;
    }

    // If trusted comment exists, verify global signature
    if (sig.trustedComment && sig.globalSignature) {
      // SECURITY: Validate global signature length (must be 64 bytes for Ed25519)
      if (sig.globalSignature.length !== 64) {
        result.error = `Invalid global signature length: expected 64 bytes, got ${sig.globalSignature.length}`;
        return result;
      }
      const globalMessage = Buffer.concat([sig.signature, Buffer.from(sig.trustedComment)]);
      const globalValid = verifyEd25519(globalMessage, sig.globalSignature, publicKeyBytes);
      if (!globalValid) {
        result.error = 'Trusted comment signature verification failed';
        return result;
      }
    }

    result.valid = true;
    return result;
  } catch (error) {
    result.error = `Signature parsing error: ${error.message}`;
    return result;
  }
}

/**
 * Check if signature file exists for a manifest
 *
 * @param {string} manifestPath - Path to manifest file
 * @returns {boolean} True if signature file exists
 */
function signatureExists(manifestPath) {
  return fs.existsSync(manifestPath + '.minisig');
}

/**
 * Load and verify manifest with signature
 *
 * @param {string} manifestPath - Path to manifest file
 * @param {Object} [options] - Options
 * @param {boolean} [options.requireSignature=true] - Fail if signature missing
 * @param {Object} [options.publicKey] - Override public key (testing only)
 * @returns {Object} { content: Buffer, verified: boolean, error: string|null }
 */
function loadAndVerifyManifest(manifestPath, options = {}) {
  const requireSignature = options.requireSignature !== false;
  const signaturePath = manifestPath + '.minisig';

  // Check manifest exists
  if (!fs.existsSync(manifestPath)) {
    return {
      content: null,
      verified: false,
      error: 'Manifest file not found',
    };
  }

  // SECURITY [DOS-1]: Check manifest file size BEFORE reading into memory
  // This prevents DoS attacks via oversized manifest files
  let manifestStat;
  try {
    manifestStat = fs.statSync(manifestPath);
  } catch (error) {
    return {
      content: null,
      verified: false,
      error: `Cannot stat manifest file: ${error.message}`,
    };
  }

  if (manifestStat.size > SignatureLimits.MAX_MANIFEST_SIZE) {
    return {
      content: null,
      verified: false,
      error: `Manifest file exceeds maximum size (${SignatureLimits.MAX_MANIFEST_SIZE} bytes)`,
    };
  }

  // Check signature exists
  if (!fs.existsSync(signaturePath)) {
    if (requireSignature) {
      return {
        content: null,
        verified: false,
        error: 'Manifest signature file not found (.minisig)',
      };
    }
    // Allow unsigned in dev mode (requireSignature=false)
    // Size already validated above
    return {
      content: fs.readFileSync(manifestPath),
      verified: false,
      error: null,
    };
  }

  // SECURITY [DOS-2]: Check signature file size BEFORE reading
  // Signature files should be small (~200 bytes typical)
  let signatureStat;
  try {
    signatureStat = fs.statSync(signaturePath);
  } catch (error) {
    return {
      content: null,
      verified: false,
      error: `Cannot stat signature file: ${error.message}`,
    };
  }

  if (signatureStat.size > SignatureLimits.MAX_SIGNATURE_SIZE) {
    return {
      content: null,
      verified: false,
      error: `Signature file exceeds maximum size (${SignatureLimits.MAX_SIGNATURE_SIZE} bytes)`,
    };
  }

  // Load files - sizes validated above
  const manifestContent = fs.readFileSync(manifestPath);
  const signatureContent = fs.readFileSync(signaturePath, 'utf8');

  // Verify signature BEFORE any parsing
  const verifyResult = verifyManifestSignature(manifestContent, signatureContent, options);

  if (!verifyResult.valid) {
    return {
      content: null,
      verified: false,
      error: verifyResult.error,
    };
  }

  return {
    content: manifestContent,
    verified: true,
    error: null,
  };
}

module.exports = {
  verifyManifestSignature,
  signatureExists,
  loadAndVerifyManifest,
  isPlaceholderKey,
  parseMinisignSignature,
  PINNED_PUBLIC_KEY,
  SignatureLimits,
};
