# Synkra AIOS Security Best Practices

> 🌐 **EN** | [PT](./pt/security-best-practices.md) | [ES](./es/security-best-practices.md)

---

This guide provides comprehensive security recommendations for deploying and maintaining Synkra AIOS in production environments.

## Table of Contents

1. [Security Architecture Overview](#security-architecture-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Input Validation & Sanitization](#input-validation--sanitization)
4. [Rate Limiting & DOS Protection](#rate-limiting--dos-protection)
5. [Secure Configuration](#secure-configuration)
6. [Data Protection](#data-protection)
7. [Logging & Monitoring](#logging--monitoring)
8. [Network Security](#network-security)
9. [Dependency Management](#dependency-management)
10. [Incident Response](#incident-response)

## Security Architecture Overview

Synkra AIOS implements a multi-layered security approach:

```
┌─────────────────────────────────────────┐
│           Application Layer             │
├─────────────────────────────────────────┤
│         Authentication Layer            │
├─────────────────────────────────────────┤
│        Input Validation Layer           │
├─────────────────────────────────────────┤
│         Rate Limiting Layer             │
├─────────────────────────────────────────┤
│           Network Layer                 │
└─────────────────────────────────────────┘
```

### Core Security Modules

- **InputSanitizer**: Prevents injection attacks and path traversal
- **AuthSystem**: JWT-based authentication with session management
- **RateLimiter**: DOS protection and abuse prevention
- **SecurityAudit**: Automated vulnerability scanning

## Authentication & Authorization

### Implementation

```javascript
const AuthSystem = require('./security/auth');

const auth = new AuthSystem({
  secretKey: process.env.JWT_SECRET,
  tokenExpiry: '1h',
  refreshExpiry: '7d'
});

// Create user with strong password requirements
await auth.createUser({
  username: 'admin',
  password: 'SecureP@ssw0rd123!',
  email: 'admin@example.com',
  role: 'admin'
});
```

### Best Practices

1. **Strong Password Policy**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - No dictionary words or personal information

2. **Token Management**
   - Short-lived access tokens (1 hour)
   - Secure refresh token rotation
   - Immediate revocation on logout

3. **Session Security**
   - Secure session storage
   - Session timeout after inactivity
   - Multi-session management

4. **Account Protection**
   - Account lockout after failed attempts
   - Progressive delays on authentication failures
   - Email notifications for security events

### Configuration

```env
# .env - Authentication settings
JWT_SECRET=your-super-secure-random-key-here
AUTH_TOKEN_EXPIRY=1h
AUTH_REFRESH_EXPIRY=7d
AUTH_MAX_LOGIN_ATTEMPTS=5
AUTH_LOCKOUT_DURATION=15m
```

## Input Validation & Sanitization

### Always Sanitize User Input

```javascript
const InputSanitizer = require('./security/sanitizer');

// Path sanitization
const safePath = InputSanitizer.sanitizePath(userInput, basePath);

// Project name validation
const safeProjectName = InputSanitizer.sanitizeProjectName(name);

// Command sanitization
const safeCommand = InputSanitizer.sanitizeCommand(userCommand);

// Configuration values
const safeValue = InputSanitizer.sanitizeConfigValue(value, 'string');
```

### Validation Rules

1. **Path Operations**
   - Always use absolute paths
   - Prevent directory traversal (../)
   - Validate against allowed directories
   - Check for suspicious patterns

2. **Command Execution**
   - Whitelist allowed characters
   - Remove command separators (;, |, &)
   - Limit command length
   - Use parameterized execution

3. **Configuration Data**
   - Type validation
   - Length restrictions
   - Pattern matching
   - Enum validation where applicable

### Common Vulnerabilities to Prevent

- **Path Traversal**: `../../../etc/passwd`
- **Command Injection**: `; rm -rf /`
- **SQL Injection**: `'; DROP TABLE users; --`
- **XSS**: `<script>alert('xss')</script>`
- **Prototype Pollution**: `{"__proto__": {"admin": true}}`

## Rate Limiting & DOS Protection

### Implementation

```javascript
const { RateLimiters } = require('./security/rate-limiter');

// Different limiters for different operations
const apiLimiter = RateLimiters.createApiLimiter();
const authLimiter = RateLimiters.createAuthLimiter();
const metaAgentLimiter = RateLimiters.createMetaAgentLimiter();

// Check before operation
const identifier = RateLimiter.createIdentifier({
  ip: req.ip,
  userId: req.user?.id,
  operation: 'meta-agent'
});

const result = metaAgentLimiter.check(identifier);
if (!result.allowed) {
  throw new Error(`Rate limit exceeded. Retry after ${result.retryAfter} seconds`);
}
```

### Rate Limiting Strategy

| Operation | Window | Limit | Purpose |
|-----------|--------|-------|---------|
| API Calls | 15 min | 1000 | General API protection |
| Authentication | 15 min | 5 | Brute force prevention |
| Installation | 1 hour | 10 | Installation abuse prevention |
| Meta-Agent | 1 min | 30 | Resource protection |
| File Operations | 1 min | 100 | Filesystem protection |

### Configuration

```env
# Rate limiting settings
RATE_LIMIT_API_WINDOW=900000
RATE_LIMIT_API_MAX=1000
RATE_LIMIT_AUTH_WINDOW=900000
RATE_LIMIT_AUTH_MAX=5
RATE_LIMIT_INSTALL_WINDOW=3600000
RATE_LIMIT_INSTALL_MAX=10
```

## Secure Configuration

### Environment Variables

```env
# Required security settings
NODE_ENV=production
JWT_SECRET=your-256-bit-secret-key
DATABASE_ENCRYPTION_KEY=your-database-encryption-key
SESSION_SECRET=your-session-secret

# API Keys (never hardcode!)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-your-anthropic-key

# Security headers
SECURITY_HEADERS_ENABLED=true
HELMET_ENABLED=true
CORS_ORIGIN=https://yourdomain.com

# Audit logging
AUDIT_LOG_ENABLED=true
AUDIT_LOG_LEVEL=info
AUDIT_LOG_FILE=/var/log/aios/audit.log
```

### File Permissions

```bash
# Secure file permissions
chmod 600 .env
chmod 600 .aios/config.json
chmod 600 .aios/users.json
chmod 600 .aios/sessions.json
chmod 700 .aios/
chmod 700 security/
```

### Configuration Validation

```javascript
// Validate critical configuration on startup
const requiredEnvVars = [
  'JWT_SECRET',
  'NODE_ENV'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Validate JWT secret strength
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}
```

## Data Protection

### Encryption at Rest

```javascript
const crypto = require('crypto');

class DataEncryption {
  constructor(key) {
    this.key = key;
    this.algorithm = 'aes-256-gcm';
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData) {
    const decipher = crypto.createDecipher(
      this.algorithm, 
      this.key, 
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### Sensitive Data Handling

1. **API Keys**
   - Store in environment variables only
   - Never log or expose in error messages
   - Rotate regularly
   - Use separate keys for different environments

2. **User Data**
   - Hash passwords with bcrypt (salt rounds ≥ 12)
   - Encrypt PII at rest
   - Implement data retention policies
   - Support data deletion requests

3. **Session Data**
   - Use secure session storage
   - Implement session timeout
   - Clear sessions on logout
   - Monitor for session hijacking

## Logging & Monitoring

### Security Event Logging

```javascript
const winston = require('winston');

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/security.log',
      level: 'warn'
    }),
    new winston.transports.File({ 
      filename: 'logs/audit.log' 
    })
  ]
});

// Log security events
securityLogger.warn('Authentication failed', {
  username: req.body.username,
  ip: req.ip,
  userAgent: req.get('User-Agent'),
  timestamp: new Date().toISOString()
});
```

### Events to Monitor

- Failed authentication attempts
- Rate limit violations
- Suspicious file access patterns
- Configuration changes
- Permission escalation attempts
- Unusual API usage patterns

### Alerting Thresholds

```javascript
const alertThresholds = {
  failedLogins: 10, // per hour
  rateLimitViolations: 50, // per hour
  suspiciousFileAccess: 5, // per hour
  configChanges: 1, // any change
  errorRate: 0.05 // 5% error rate
};
```

## Network Security

### HTTPS Configuration

```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private-key.pem'),
  cert: fs.readFileSync('path/to/certificate.pem'),
  // Security improvements
  secureProtocol: 'TLSv1_2_method',
  ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384',
  honorCipherOrder: true
};

https.createServer(options, app).listen(443);
```

### Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### CORS Configuration

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://yourdomain.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Dependency Management

### Security Scanning

```bash
# Regular security audits
npm audit
npm audit fix

# Using yarn
yarn audit
yarn audit fix

# Advanced scanning with snyk
npx snyk test
npx snyk monitor
```

### Update Strategy

```json
{
  "scripts": {
    "security:audit": "npm audit",
    "security:update": "npm update",
    "security:check": "snyk test",
    "security:monitor": "snyk monitor"
  }
}
```

### Automated Dependency Updates

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    reviewers:
      - "security-team"
```

## Incident Response

### Response Procedures

1. **Detection**
   - Monitor security logs
   - Set up automated alerts
   - Regular security audits

2. **Assessment**
   - Determine scope and impact
   - Identify affected systems
   - Classify incident severity

3. **Containment**
   - Isolate affected systems
   - Revoke compromised credentials
   - Block malicious traffic

4. **Recovery**
   - Restore from clean backups
   - Apply security patches
   - Update security measures

5. **Lessons Learned**
   - Document incident details
   - Update security procedures
   - Improve monitoring

### Emergency Contacts

```javascript
// Emergency response configuration
const emergencyConfig = {
  securityTeam: {
    primary: 'security-lead@company.com',
    backup: 'security-backup@company.com'
  },
  escalation: {
    level1: 'team-lead@company.com',
    level2: 'engineering-manager@company.com',
    level3: 'cto@company.com'
  },
  externalContacts: {
    hosting: 'support@hosting-provider.com',
    security: 'security@security-vendor.com'
  }
};
```

## Security Checklist

### Pre-Deployment

- [ ] All security modules implemented
- [ ] Input sanitization in place
- [ ] Rate limiting configured
- [ ] Authentication system tested
- [ ] Security audit completed
- [ ] Penetration testing performed
- [ ] SSL/TLS certificates installed
- [ ] Security headers configured
- [ ] Logging and monitoring active
- [ ] Incident response plan ready

### Post-Deployment

- [ ] Regular security scans scheduled
- [ ] Dependency updates automated
- [ ] Log monitoring active
- [ ] Backup procedures tested
- [ ] Access controls reviewed
- [ ] Security training completed
- [ ] Documentation updated

### Ongoing Maintenance

- [ ] Weekly security log review
- [ ] Monthly dependency updates
- [ ] Quarterly security assessments
- [ ] Annual penetration testing
- [ ] Regular backup testing
- [ ] Security awareness training
- [ ] Incident response drills

## Compliance & Standards

### OWASP Top 10 Compliance

1. **A01:2021 – Broken Access Control** ✅ Addressed by AuthSystem
2. **A02:2021 – Cryptographic Failures** ✅ Strong encryption used
3. **A03:2021 – Injection** ✅ Input sanitization implemented
4. **A04:2021 – Insecure Design** ✅ Security by design approach
5. **A05:2021 – Security Misconfiguration** ✅ Secure defaults
6. **A06:2021 – Vulnerable Components** ✅ Regular updates
7. **A07:2021 – Identity/Auth Failures** ✅ Robust auth system
8. **A08:2021 – Software/Data Integrity** ✅ Integrity checks
9. **A09:2021 – Logging/Monitoring Failures** ✅ Comprehensive logging
10. **A10:2021 – Server-Side Request Forgery** ✅ URL validation

### Industry Standards

- **ISO 27001** - Information security management
- **SOC 2** - Security, availability, and confidentiality
- **GDPR** - Data protection and privacy
- **HIPAA** - Healthcare data protection (if applicable)

## Support and Resources

### Documentation
- [OWASP Security Guide](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Guide](https://expressjs.com/en/advanced/best-practice-security.html)

### Tools
- [npm audit](https://docs.npmjs.com/cli/v6/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [ESLint Security Plugin](https://github.com/nodesecurity/eslint-plugin-security)
- [Helmet.js](https://helmetjs.github.io/)

### Training
- OWASP Security Training
- Node.js Security Certification
- Cloud Security Best Practices
- Incident Response Training

---

**Remember**: Security is not a one-time implementation but an ongoing process. Regular reviews, updates, and improvements are essential for maintaining a secure system.

For questions or security concerns, open an issue at: https://github.com/SynkraAI/aios-core/issues