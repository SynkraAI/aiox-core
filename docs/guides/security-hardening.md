# AIOS Security Hardening Guide

> **EN** | [PT](../pt/guides/security-hardening.md) | [ES](../es/guides/security-hardening.md)

---

> Complete guide to hardening security for Synkra AIOS deployments - from development to production.

**Version:** 2.1.0
**Last Updated:** 2026-01-29

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [API Key Management](#api-key-management)
3. [Environment Variables and Secrets](#environment-variables-and-secrets)
4. [File and Directory Permissions](#file-and-directory-permissions)
5. [Sandboxing and Isolation](#sandboxing-and-isolation)
6. [Input Validation](#input-validation)
7. [Injection Protection](#injection-protection)
8. [Logging and Auditing](#logging-and-auditing)
9. [Production vs Development Configuration](#production-vs-development-configuration)
10. [Security Checklist](#security-checklist)
11. [Vulnerability Reporting](#vulnerability-reporting)

---

## Security Overview

Synkra AIOS operates at a privileged layer between AI models and your system. This guide covers hardening strategies specific to AI-orchestrated development environments.

### Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        EXTERNAL LAYER                            │
│    Network Firewall | WAF | TLS Termination | Rate Limiting     │
├─────────────────────────────────────────────────────────────────┤
│                      APPLICATION LAYER                           │
│   Permission Modes | Input Validation | Command Sanitization    │
├─────────────────────────────────────────────────────────────────┤
│                       EXECUTION LAYER                            │
│    Sandboxing | Process Isolation | Resource Limits | Hooks     │
├─────────────────────────────────────────────────────────────────┤
│                         DATA LAYER                               │
│   Encryption at Rest | Secure Storage | Audit Logging           │
└─────────────────────────────────────────────────────────────────┘
```

### AIOS-Specific Security Concerns

| Concern                  | Risk Level | Mitigation                        |
| ------------------------ | ---------- | --------------------------------- |
| Agent code execution     | CRITICAL   | Permission Modes, Sandboxing      |
| API key exposure         | CRITICAL   | Environment isolation, encryption |
| Command injection via AI | HIGH       | Input sanitization, hooks         |
| Unauthorized file access | HIGH       | Directory restrictions            |
| Session hijacking        | MEDIUM     | Token rotation, secure storage    |
| Information disclosure   | MEDIUM     | Audit logging, access controls    |

### Defense in Depth

AIOS implements multiple layers of protection:

1. **Permission Modes** - Control agent autonomy (Explore/Ask/Auto)
2. **Claude Hooks** - Pre-execution validation (read-protection, sql-governance)
3. **Input Sanitization** - All user/AI input is validated
4. **Process Isolation** - MCP servers run in containers
5. **Audit Logging** - All operations are recorded

---

## API Key Management

API keys are the most critical secrets in AIOS. Compromised keys can lead to unauthorized usage, data breaches, and significant financial impact.

### Storage Hierarchy

```
┌────────────────────────────────────────────────────────────────┐
│  NEVER                                                          │
│  ❌ Source code                                                 │
│  ❌ Git repositories                                            │
│  ❌ Configuration files (committed)                             │
│  ❌ Log files                                                   │
│  ❌ Error messages                                              │
├────────────────────────────────────────────────────────────────┤
│  ACCEPTABLE (Development)                                       │
│  ⚠️  .env files (gitignored)                                    │
│  ⚠️  Local environment variables                                │
├────────────────────────────────────────────────────────────────┤
│  RECOMMENDED (Production)                                       │
│  ✅ Secret managers (Vault, AWS Secrets, etc.)                  │
│  ✅ CI/CD secret injection                                      │
│  ✅ Kubernetes secrets                                          │
│  ✅ Encrypted credential stores                                 │
└────────────────────────────────────────────────────────────────┘
```

### Secure API Key Configuration

**Development (.env file - never commit)**

```bash
# .env - Add to .gitignore IMMEDIATELY
# API Provider Keys
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# MCP Server Keys
EXA_API_KEY=exa-xxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
APIFY_TOKEN=apify_api_xxxxxxxxxxxxxxxxxxxxx

# Never use default or weak values
JWT_SECRET=your-256-bit-cryptographically-secure-random-key
```

**Production (using secret manager)**

```javascript
// Load secrets from secure vault
const secrets = await SecretManager.loadSecrets({
  provider: 'aws-secrets-manager', // or 'hashicorp-vault', 'gcp-secrets'
  secretName: 'aios/production/api-keys',
  region: process.env.AWS_REGION,
});

process.env.ANTHROPIC_API_KEY = secrets.ANTHROPIC_API_KEY;
process.env.OPENAI_API_KEY = secrets.OPENAI_API_KEY;
```

### Key Rotation Policy

| Key Type         | Rotation Frequency | On Compromise      |
| ---------------- | ------------------ | ------------------ |
| AI Provider Keys | 90 days            | Immediate          |
| JWT Secrets      | 30 days            | Immediate          |
| MCP Server Keys  | 90 days            | Immediate          |
| Service Tokens   | 7 days             | Immediate          |
| Development Keys | Never reuse        | Revoke immediately |

### Key Validation on Startup

```javascript
// .aios-core/core/security/key-validator.js
const requiredKeys = [
  { name: 'ANTHROPIC_API_KEY', pattern: /^sk-ant-[a-zA-Z0-9_-]+$/ },
  { name: 'JWT_SECRET', minLength: 32 },
];

function validateApiKeys() {
  const errors = [];

  for (const key of requiredKeys) {
    const value = process.env[key.name];

    if (!value) {
      errors.push(`Missing required key: ${key.name}`);
      continue;
    }

    if (key.pattern && !key.pattern.test(value)) {
      errors.push(`Invalid format for ${key.name}`);
    }

    if (key.minLength && value.length < key.minLength) {
      errors.push(`${key.name} must be at least ${key.minLength} characters`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`API Key Validation Failed:\n${errors.join('\n')}`);
  }
}
```

---

## Environment Variables and Secrets

### Secure .env File Template

```bash
# ============================================================
# AIOS ENVIRONMENT CONFIGURATION
# ============================================================
# SECURITY: This file must NEVER be committed to version control
# Add to .gitignore: .env, .env.local, .env.*.local
# ============================================================

# ------------------------------------------------------------
# ENVIRONMENT
# ------------------------------------------------------------
NODE_ENV=development
AIOS_DEBUG=false
LOG_LEVEL=info

# ------------------------------------------------------------
# AI PROVIDER CONFIGURATION
# ------------------------------------------------------------
# Primary provider
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=

# Fallback provider (optional)
OPENAI_API_KEY=

# ------------------------------------------------------------
# AUTHENTICATION & SESSION
# ------------------------------------------------------------
# Generate with: openssl rand -hex 32
JWT_SECRET=
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d

# Session configuration
SESSION_SECRET=
SESSION_TIMEOUT=3600000

# ------------------------------------------------------------
# ENCRYPTION
# ------------------------------------------------------------
# Generate with: openssl rand -hex 32
DATABASE_ENCRYPTION_KEY=
FILE_ENCRYPTION_KEY=

# ------------------------------------------------------------
# MCP SERVERS
# ------------------------------------------------------------
# EXA Web Search
EXA_API_KEY=

# GitHub Integration
GITHUB_TOKEN=

# Apify Web Scraping
APIFY_TOKEN=

# ------------------------------------------------------------
# SECURITY SETTINGS
# ------------------------------------------------------------
# Rate limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=1000

# CORS (production only)
CORS_ORIGIN=https://your-domain.com

# Content Security Policy
CSP_ENABLED=true

# ------------------------------------------------------------
# AUDIT & LOGGING
# ------------------------------------------------------------
AUDIT_LOG_ENABLED=true
AUDIT_LOG_PATH=/var/log/aios/audit.log
AUDIT_LOG_RETENTION_DAYS=90
```

### Secret File Protection

```bash
# Create secure directory for secrets
mkdir -p ~/.aios/secrets
chmod 700 ~/.aios/secrets

# Create encrypted secrets file
# Never store plaintext secrets
openssl enc -aes-256-cbc -salt -pbkdf2 \
  -in secrets.txt \
  -out ~/.aios/secrets/encrypted.dat

# Set proper permissions
chmod 600 ~/.aios/secrets/*

# Verify no secrets in git history
git log -p --all -S "API_KEY" -- .
```

### Environment Isolation

```javascript
// Validate environment isolation
function validateEnvironment() {
  // Ensure production secrets aren't used in development
  if (process.env.NODE_ENV === 'development') {
    if (process.env.ANTHROPIC_API_KEY?.includes('prod')) {
      throw new Error('Production API key detected in development environment');
    }
  }

  // Ensure debug mode is off in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.AIOS_DEBUG === 'true') {
      console.warn('WARNING: Debug mode enabled in production');
    }
  }
}
```

---

## File and Directory Permissions

### AIOS Directory Structure Permissions

```bash
# ============================================================
# RECOMMENDED PERMISSIONS
# ============================================================

# Project root (standard)
chmod 755 /path/to/project

# AIOS configuration directories
chmod 700 .aios/              # Only owner can access
chmod 700 .aios-core/         # Framework source
chmod 700 .claude/            # Claude configuration

# Sensitive configuration files
chmod 600 .env                # Environment variables
chmod 600 .aios/config.yaml   # Main config
chmod 600 .aios/users.json    # User database
chmod 600 .aios/sessions.json # Active sessions

# Secrets directory
chmod 700 ~/.aios/secrets/
chmod 600 ~/.aios/secrets/*

# Log files
chmod 640 logs/*.log          # Owner read/write, group read
chmod 750 logs/               # Owner full, group read/execute

# Temporary files
chmod 700 .aios/temp/
chmod 600 .aios/temp/*
```

### Directory Access Control

```yaml
# .aios/config.yaml - Allowed directories configuration
security:
  allowedDirectories:
    read:
      - '${PROJECT_ROOT}'
      - '${HOME}/.aios'
    write:
      - '${PROJECT_ROOT}/src'
      - '${PROJECT_ROOT}/docs'
      - '${PROJECT_ROOT}/tests'
    execute:
      - '${PROJECT_ROOT}/scripts'
      - '${PROJECT_ROOT}/node_modules/.bin'

  blockedPaths:
    - '/etc'
    - '/var'
    - '/usr'
    - '${HOME}/.ssh'
    - '${HOME}/.gnupg'
    - '${HOME}/.aws'
```

### Permission Validation Script

```bash
#!/bin/bash
# scripts/check-permissions.sh

echo "AIOS Security Permission Check"
echo "=============================="

# Check critical files
check_permission() {
  local file=$1
  local expected=$2
  local actual=$(stat -f "%Lp" "$file" 2>/dev/null || stat -c "%a" "$file" 2>/dev/null)

  if [ "$actual" != "$expected" ]; then
    echo "WARNING: $file has permissions $actual, expected $expected"
    return 1
  else
    echo "OK: $file ($actual)"
    return 0
  fi
}

# Check critical files
check_permission ".env" "600"
check_permission ".aios" "700"
check_permission ".aios/config.yaml" "600"

# Check for world-readable sensitive files
find . -name "*.key" -o -name "*.pem" -o -name "*.env*" | while read f; do
  perms=$(stat -f "%Lp" "$f" 2>/dev/null || stat -c "%a" "$f" 2>/dev/null)
  if [ "${perms: -1}" != "0" ]; then
    echo "CRITICAL: $f is world-readable!"
  fi
done

echo ""
echo "Permission check complete."
```

---

## Sandboxing and Isolation

### Docker MCP Isolation

AIOS uses Docker containers to isolate MCP servers from the host system:

```
┌─────────────────────────────────────────────────────────────┐
│                      HOST SYSTEM                             │
│                                                              │
│  ┌────────────────┐    ┌────────────────────────────────┐  │
│  │  Claude Code   │    │      Docker Container          │  │
│  │                │    │  ┌──────────────────────────┐  │  │
│  │  ┌──────────┐  │    │  │  docker-gateway          │  │  │
│  │  │ Native   │  │◄──►│  │  ┌─────┐ ┌─────────┐    │  │  │
│  │  │ Tools    │  │    │  │  │ EXA │ │Context7 │    │  │  │
│  │  └──────────┘  │    │  │  └─────┘ └─────────┘    │  │  │
│  │                │    │  │  ┌─────────┐            │  │  │
│  │  ┌──────────┐  │    │  │  │  Apify  │            │  │  │
│  │  │Playwright│  │    │  │  └─────────┘            │  │  │
│  │  └──────────┘  │    │  └──────────────────────────┘  │  │
│  └────────────────┘    └────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Container Security Configuration

```yaml
# docker-compose.security.yml
version: '3.8'

services:
  mcp-gateway:
    image: docker-mcp-gateway:latest
    security_opt:
      - no-new-privileges:true
      - seccomp:./seccomp-profile.json
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    read_only: true
    tmpfs:
      - /tmp:noexec,nosuid,nodev
    networks:
      - mcp-isolated
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M

networks:
  mcp-isolated:
    driver: bridge
    internal: true # No external access
```

### Process Isolation with Permission Modes

```javascript
// Permission mode enforcement
const { OperationGuard } = require('./.aios-core/core/permissions');

async function executeWithIsolation(operation, context) {
  const guard = new OperationGuard();

  // Check if operation is allowed in current mode
  const permission = await guard.guard(operation.tool, {
    command: operation.command,
    args: operation.args,
  });

  if (!permission.proceed) {
    if (permission.needsConfirmation) {
      // Request user confirmation
      const confirmed = await requestUserConfirmation(operation);
      if (!confirmed) {
        throw new Error('Operation denied by user');
      }
    } else {
      throw new Error(`Operation blocked: ${permission.reason}`);
    }
  }

  // Execute in isolated context
  return await isolatedExecutor.run(operation, {
    timeout: 30000,
    maxMemory: '256M',
    networkAccess: false,
  });
}
```

### Resource Limits

```javascript
// Resource limit configuration
const resourceLimits = {
  cpu: {
    maxPercent: 50,
    throttleAt: 80,
  },
  memory: {
    maxMB: 512,
    warnAt: 400,
  },
  disk: {
    maxWriteMB: 100,
    tempDirMaxMB: 50,
  },
  network: {
    maxRequestsPerMinute: 100,
    maxBandwidthMBps: 10,
  },
  process: {
    maxConcurrent: 5,
    maxRuntime: 300000, // 5 minutes
  },
};
```

---

## Input Validation

### Validation Rules by Input Type

| Input Type        | Validation Rules                        | Example                   |
| ----------------- | --------------------------------------- | ------------------------- |
| **File paths**    | No traversal, whitelist dirs, normalize | `/project/src/file.ts`    |
| **Commands**      | Whitelist commands, sanitize args       | `npm run build`           |
| **Project names** | Alphanumeric, dashes, underscores       | `my-project-01`           |
| **URLs**          | Protocol whitelist, domain validation   | `https://api.example.com` |
| **User input**    | Length limits, character filtering      | `User comment here`       |
| **Configuration** | Type checking, enum validation          | `{ mode: "ask" }`         |

### Input Sanitizer Implementation

```javascript
// .aios-core/core/security/input-sanitizer.js

class InputSanitizer {
  /**
   * Sanitize file path to prevent directory traversal
   */
  static sanitizePath(inputPath, basePath) {
    // Remove null bytes
    let sanitized = inputPath.replace(/\0/g, '');

    // Normalize path separators
    sanitized = sanitized.replace(/\\/g, '/');

    // Remove directory traversal attempts
    sanitized = sanitized.replace(/\.\.+\//g, '');
    sanitized = sanitized.replace(/\/\.\.+/g, '');

    // Resolve to absolute path
    const resolved = path.resolve(basePath, sanitized);

    // Verify path is within allowed directory
    if (!resolved.startsWith(path.resolve(basePath))) {
      throw new SecurityError('Path traversal attempt detected');
    }

    return resolved;
  }

  /**
   * Sanitize command for safe execution
   */
  static sanitizeCommand(command) {
    // Block dangerous patterns
    const dangerousPatterns = [
      /;/g, // Command chaining
      /\|/g, // Pipes
      /&/g, // Background/AND
      /`/g, // Command substitution
      /\$\(/g, // Command substitution
      />/g, // Redirect
      /</g, // Redirect
      /\n/g, // Newlines
      /\r/g, // Carriage returns
    ];

    let sanitized = command;
    for (const pattern of dangerousPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Limit length
    if (sanitized.length > 1000) {
      throw new SecurityError('Command too long');
    }

    return sanitized;
  }

  /**
   * Validate and sanitize project name
   */
  static sanitizeProjectName(name) {
    // Only allow alphanumeric, dashes, and underscores
    const sanitized = name.replace(/[^a-zA-Z0-9-_]/g, '');

    if (sanitized.length === 0) {
      throw new SecurityError('Invalid project name');
    }

    if (sanitized.length > 64) {
      throw new SecurityError('Project name too long');
    }

    return sanitized;
  }

  /**
   * Validate URL
   */
  static validateUrl(url) {
    const allowedProtocols = ['https:', 'http:'];

    try {
      const parsed = new URL(url);

      if (!allowedProtocols.includes(parsed.protocol)) {
        throw new SecurityError('Invalid URL protocol');
      }

      // Block localhost in production
      if (process.env.NODE_ENV === 'production') {
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
          throw new SecurityError('Localhost URLs not allowed in production');
        }
      }

      return parsed.toString();
    } catch (error) {
      throw new SecurityError(`Invalid URL: ${error.message}`);
    }
  }
}
```

### Schema Validation

```javascript
// Use JSON Schema for configuration validation
const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

const configSchema = {
  type: 'object',
  required: ['version', 'permissions'],
  properties: {
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    permissions: {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['explore', 'ask', 'auto'] },
      },
      required: ['mode'],
    },
    security: {
      type: 'object',
      properties: {
        allowedDirectories: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  },
  additionalProperties: false,
};

function validateConfig(config) {
  const validate = ajv.compile(configSchema);
  const valid = validate(config);

  if (!valid) {
    throw new SecurityError(`Config validation failed: ${JSON.stringify(validate.errors)}`);
  }

  return config;
}
```

---

## Injection Protection

### Command Injection Prevention

```javascript
// DANGEROUS - Never do this
const userInput = req.query.file;
exec(`cat ${userInput}`); // Command injection vulnerability!

// SAFE - Use parameterized execution
const { execFile } = require('child_process');
const userInput = sanitizePath(req.query.file, PROJECT_ROOT);
execFile('cat', [userInput], (error, stdout) => {
  // Safe execution
});

// SAFEST - Use built-in file operations
const fs = require('fs').promises;
const safePath = sanitizePath(req.query.file, PROJECT_ROOT);
const content = await fs.readFile(safePath, 'utf8');
```

### SQL Injection Prevention (SQL Governance Hook)

```python
# .claude/hooks/sql-governance.py
# This hook is automatically enforced

BLOCKED_PATTERNS = [
    r'CREATE\s+TABLE',
    r'DROP\s+TABLE',
    r'ALTER\s+TABLE',
    r'TRUNCATE',
    r'DELETE\s+FROM',
    r'UPDATE\s+.*\s+SET',
    r'INSERT\s+INTO',
]

def validate_sql(query: str) -> bool:
    """Block dangerous SQL operations without explicit approval"""
    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, query, re.IGNORECASE):
            raise SecurityError(f"Blocked SQL pattern detected: {pattern}")
    return True
```

### Template Injection Prevention

```javascript
// DANGEROUS - Direct template interpolation
const template = `Hello ${userInput}!`; // XSS vulnerability!

// SAFE - HTML encoding
const { escape } = require('html-escaper');
const template = `Hello ${escape(userInput)}!`;

// For Markdown templates
function safeMarkdownInterpolation(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];
    if (value === undefined) return match;

    // Escape special Markdown characters
    return String(value).replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&');
  });
}
```

### Path Traversal Prevention

```javascript
// Hook enforcement for protected files
// .claude/hooks/read-protection.py

PROTECTED_FILES = [
    '.claude/CLAUDE.md',
    '.claude/rules/*.md',
    '.aios-core/development/agents/*.md',
    'package.json',
    'tsconfig.json'
]

def validate_read(file_path: str, params: dict) -> bool:
    """Block partial reads on protected files"""
    for pattern in PROTECTED_FILES:
        if fnmatch.fnmatch(file_path, pattern):
            if params.get('limit') or params.get('offset'):
                raise SecurityError(
                    f"Partial read blocked on protected file: {file_path}\n"
                    "Must read complete file."
                )
    return True
```

### Prototype Pollution Prevention

```javascript
// Prevent prototype pollution attacks
function safeObjectMerge(target, source) {
  const blockedKeys = ['__proto__', 'constructor', 'prototype'];

  function merge(t, s, depth = 0) {
    if (depth > 10) {
      throw new SecurityError('Object merge depth exceeded');
    }

    for (const key of Object.keys(s)) {
      if (blockedKeys.includes(key)) {
        throw new SecurityError(`Blocked property: ${key}`);
      }

      if (typeof s[key] === 'object' && s[key] !== null) {
        t[key] = t[key] || {};
        merge(t[key], s[key], depth + 1);
      } else {
        t[key] = s[key];
      }
    }

    return t;
  }

  return merge(target, source);
}
```

---

## Logging and Auditing

### Audit Log Configuration

```yaml
# .aios/config.yaml - Audit configuration
audit:
  enabled: true
  level: info # debug, info, warn, error

  # What to log
  events:
    - authentication
    - authorization
    - fileAccess
    - commandExecution
    - configChange
    - agentActivation
    - modeChange
    - error

  # Output configuration
  output:
    file:
      enabled: true
      path: .aios/logs/audit.log
      maxSize: 10M
      maxFiles: 10
      compress: true
    console:
      enabled: false
    remote:
      enabled: false
      endpoint: https://logs.example.com/audit

  # Retention
  retention:
    days: 90
    archivePath: .aios/logs/archive
```

### Audit Log Format

```json
{
  "timestamp": "2026-01-29T14:30:00.000Z",
  "level": "info",
  "event": "commandExecution",
  "actor": {
    "type": "agent",
    "id": "dev",
    "name": "Dex"
  },
  "action": {
    "type": "execute",
    "tool": "Bash",
    "command": "npm run build"
  },
  "context": {
    "mode": "ask",
    "project": "my-project",
    "story": "1.1"
  },
  "result": {
    "status": "success",
    "duration": 12500
  },
  "security": {
    "approved": true,
    "approvedBy": "user",
    "riskLevel": "low"
  }
}
```

### Audit Logger Implementation

```javascript
// .aios-core/core/security/audit-logger.js

const winston = require('winston');
const { format } = winston;

class AuditLogger {
  constructor(config) {
    this.config = config;
    this.logger = this.createLogger();
  }

  createLogger() {
    const transports = [];

    if (this.config.output.file.enabled) {
      transports.push(
        new winston.transports.File({
          filename: this.config.output.file.path,
          maxsize: this.parseSize(this.config.output.file.maxSize),
          maxFiles: this.config.output.file.maxFiles,
          tailable: true,
        })
      );
    }

    return winston.createLogger({
      level: this.config.level,
      format: format.combine(format.timestamp(), format.json()),
      transports,
    });
  }

  log(event, data) {
    if (!this.config.events.includes(event)) {
      return;
    }

    const entry = {
      timestamp: new Date().toISOString(),
      event,
      ...this.sanitizeData(data),
    };

    this.logger.info(entry);
  }

  sanitizeData(data) {
    // Remove sensitive information before logging
    const sensitivePatterns = [/api[_-]?key/i, /password/i, /secret/i, /token/i, /auth/i];

    const sanitized = JSON.parse(JSON.stringify(data));

    function redact(obj) {
      for (const key of Object.keys(obj)) {
        if (sensitivePatterns.some((p) => p.test(key))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          redact(obj[key]);
        }
      }
    }

    redact(sanitized);
    return sanitized;
  }

  // Specific logging methods
  logAuthentication(result, context) {
    this.log('authentication', {
      action: { type: 'authenticate', result: result.success ? 'success' : 'failure' },
      context,
      security: { failureReason: result.reason },
    });
  }

  logCommandExecution(command, result, context) {
    this.log('commandExecution', {
      action: { type: 'execute', command },
      result: { status: result.success ? 'success' : 'failure', duration: result.duration },
      context,
    });
  }

  logFileAccess(path, operation, context) {
    this.log('fileAccess', {
      action: { type: operation, path },
      context,
    });
  }

  logSecurityEvent(event, severity, details) {
    this.log('security', {
      action: { type: event },
      security: { severity, ...details },
    });
  }
}

module.exports = AuditLogger;
```

### Log Analysis Queries

```bash
# Find all failed authentications
jq 'select(.event == "authentication" and .result.status == "failure")' audit.log

# Find all command executions by agent
jq 'select(.event == "commandExecution" and .actor.type == "agent")' audit.log

# Find all security events in last 24 hours
jq 'select(.event == "security" and (.timestamp | fromdateiso8601) > (now - 86400))' audit.log

# Count events by type
jq -s 'group_by(.event) | map({event: .[0].event, count: length})' audit.log
```

---

## Production vs Development Configuration

### Environment Detection

```javascript
// Environment-aware configuration loading
function loadSecurityConfig() {
  const env = process.env.NODE_ENV || 'development';

  const baseConfig = require('./security-config.base.json');
  const envConfig = require(`./security-config.${env}.json`);

  return deepMerge(baseConfig, envConfig);
}
```

### Configuration Comparison

| Setting                | Development       | Production       |
| ---------------------- | ----------------- | ---------------- |
| **AIOS_DEBUG**         | `true`            | `false`          |
| **LOG_LEVEL**          | `debug`           | `info`           |
| **Permission Mode**    | `auto`            | `ask`            |
| **Rate Limiting**      | Relaxed           | Strict           |
| **CORS**               | `*`               | Specific origins |
| **Error Details**      | Full stack traces | Generic messages |
| **API Key Validation** | Warn only         | Block on invalid |
| **SSL/TLS**            | Optional          | Required         |
| **Audit Logging**      | Optional          | Required         |
| **Session Timeout**    | 24 hours          | 1 hour           |

### Development Configuration

```yaml
# .aios/config.development.yaml
security:
  debug: true

  validation:
    strict: false
    warnOnly: true

  rateLimiting:
    enabled: false

  cors:
    origin: '*'
    credentials: true

  session:
    timeout: 86400000 # 24 hours
    secure: false

  audit:
    enabled: true
    level: debug
    console: true

  permissions:
    mode: auto
```

### Production Configuration

```yaml
# .aios/config.production.yaml
security:
  debug: false

  validation:
    strict: true
    warnOnly: false

  rateLimiting:
    enabled: true
    windowMs: 900000 # 15 minutes
    maxRequests: 1000

  cors:
    origin:
      - https://app.example.com
      - https://admin.example.com
    credentials: true

  session:
    timeout: 3600000 # 1 hour
    secure: true
    sameSite: strict

  tls:
    enabled: true
    minVersion: TLSv1.2
    ciphers: ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384

  headers:
    hsts: true
    hstsMaxAge: 31536000
    xssProtection: true
    noSniff: true
    frameOptions: DENY

  audit:
    enabled: true
    level: info
    console: false
    remote:
      enabled: true
      endpoint: https://logs.example.com/audit

  permissions:
    mode: ask
    requireApprovalFor:
      - delete
      - execute
```

### Environment Validation Script

```javascript
// Validate production security requirements
function validateProductionSecurity() {
  const errors = [];

  // Required environment variables
  const required = ['JWT_SECRET', 'DATABASE_ENCRYPTION_KEY', 'SESSION_SECRET'];
  for (const key of required) {
    if (!process.env[key]) {
      errors.push(`Missing required env var: ${key}`);
    }
  }

  // Debug must be off
  if (process.env.AIOS_DEBUG === 'true') {
    errors.push('AIOS_DEBUG must be false in production');
  }

  // TLS must be enabled (check for cert files)
  if (!fs.existsSync(process.env.TLS_CERT_PATH)) {
    errors.push('TLS certificate not found');
  }

  // Secret strength
  if (process.env.JWT_SECRET?.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters');
  }

  if (errors.length > 0) {
    throw new Error(`Production security validation failed:\n${errors.join('\n')}`);
  }

  console.log('Production security validation passed');
}
```

---

## Security Checklist

### Pre-Deployment Checklist

```markdown
## Pre-Deployment Security Checklist

### Secrets Management

- [ ] All API keys stored in environment variables or secret manager
- [ ] No secrets in source code or git history
- [ ] .env file added to .gitignore
- [ ] Production secrets use separate keys from development
- [ ] Secret rotation schedule established

### Configuration

- [ ] NODE_ENV set to 'production'
- [ ] Debug mode disabled
- [ ] Error messages don't expose internal details
- [ ] Rate limiting configured and tested
- [ ] CORS properly configured for production domains

### Authentication & Authorization

- [ ] Strong password policy enforced
- [ ] JWT secrets are cryptographically strong (32+ chars)
- [ ] Token expiration set appropriately
- [ ] Session management implemented
- [ ] Permission modes configured (default: ask)

### Input Validation

- [ ] All user input sanitized
- [ ] File path validation enabled
- [ ] Command injection protection active
- [ ] SQL governance hooks installed
- [ ] Schema validation for configuration

### Network Security

- [ ] TLS 1.2+ required
- [ ] Security headers configured (HSTS, CSP, etc.)
- [ ] Unnecessary ports closed
- [ ] Firewall rules in place

### Logging & Monitoring

- [ ] Audit logging enabled
- [ ] Log files secured (permissions 640)
- [ ] Sensitive data redacted from logs
- [ ] Alerting configured for security events
- [ ] Log retention policy established

### Dependency Security

- [ ] npm audit shows no critical vulnerabilities
- [ ] Dependabot or similar enabled
- [ ] Lockfile committed and verified
```

### Ongoing Security Checklist

```markdown
## Ongoing Security Maintenance

### Weekly

- [ ] Review security alerts from monitoring
- [ ] Check for new dependency vulnerabilities
- [ ] Review access logs for anomalies

### Monthly

- [ ] Run full security scan (npm audit, snyk)
- [ ] Update dependencies with security patches
- [ ] Review and rotate service tokens
- [ ] Audit user access and permissions

### Quarterly

- [ ] Full penetration testing
- [ ] Review and update security policies
- [ ] Rotate long-lived secrets (API keys, JWT secrets)
- [ ] Security training refresher

### Annually

- [ ] Third-party security audit
- [ ] Disaster recovery testing
- [ ] Complete secrets rotation
- [ ] Security architecture review
```

---

## Vulnerability Reporting

### Responsible Disclosure Policy

If you discover a security vulnerability in Synkra AIOS, please follow responsible disclosure practices:

### Reporting Process

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. Report security concerns via [GitHub Security Advisories](https://github.com/SynkraAI/aios-core/security/advisories)
3. Include the following in your report:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Any suggested fixes (optional)

### What to Include

```markdown
## Vulnerability Report Template

**Vulnerability Type:** [e.g., Command Injection, XSS, Auth Bypass]

**Severity:** [Critical / High / Medium / Low]

**Affected Component:** [e.g., InputSanitizer, AuthSystem, MCP Gateway]

**AIOS Version:** [e.g., 2.1.0]

**Description:**
[Detailed description of the vulnerability]

**Steps to Reproduce:**

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Proof of Concept:**
[Code or commands to demonstrate the vulnerability]

**Impact:**
[What an attacker could accomplish with this vulnerability]

**Suggested Fix:**
[Optional: Your recommendation for fixing the issue]
```

### Response Timeline

| Stage                  | Timeframe              |
| ---------------------- | ---------------------- |
| Initial acknowledgment | 24 hours               |
| Preliminary assessment | 72 hours               |
| Fix development        | 7-14 days              |
| Patch release          | 14-30 days             |
| Public disclosure      | 90 days (or after fix) |

### Security Hall of Fame

Contributors who responsibly disclose vulnerabilities are recognized in our Security Hall of Fame (with permission).

### Bug Bounty Program

Currently, Synkra AIOS does not have a formal bug bounty program. However, significant security contributions are recognized and may receive AIOS Pro licenses or other recognition.

---

## Related Documentation

- [Security Best Practices](../security-best-practices.md) - General security guidelines
- [Permission Modes Guide](./permission-modes.md) - Agent autonomy control
- [MCP Global Setup](./mcp-global-setup.md) - Secure MCP configuration
- [Quality Gates](./quality-gates.md) - Security checks in CI/CD

---

_Synkra AIOS Security Hardening Guide v4.0.4_
