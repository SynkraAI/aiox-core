# Security Knowledge Base
## AIOX Corporation - Security Department

> **Department Head**: CISO (Bruce Schneier Agent)
> **Core Frameworks**: OWASP, STRIDE, Zero Trust, Defense in Depth
> **Last Updated**: 2026-03-24
> **Version**: 1.0.0

---

## Table of Contents

1. [OWASP Top 10 (2025)](#1-owasp-top-10-2025)
2. [Threat Modeling](#2-threat-modeling)
3. [Social Engineering Defense](#3-social-engineering-defense)
4. [Cryptography Fundamentals](#4-cryptography-fundamentals)
5. [Web Security](#5-web-security)
6. [Supply Chain Security](#6-supply-chain-security)
7. [Zero Trust Architecture](#7-zero-trust-architecture)
8. [Incident Response](#8-incident-response)
9. [AI-Specific Security](#9-ai-specific-security)
10. [Decision Frameworks & Checklists](#10-decision-frameworks--checklists)

---

## 1. OWASP Top 10 (2025)

### 1.1 Vulnerability Reference

| Rank | Vulnerability | Description | Impact |
|------|--------------|-------------|--------|
| **A01** | Broken Access Control | Users acting beyond permissions | Data breach, privilege escalation |
| **A02** | Cryptographic Failures | Weak/missing crypto for sensitive data | Data exposure, compliance violation |
| **A03** | Injection | Untrusted data sent to interpreter | Data loss, system compromise |
| **A04** | Insecure Design | Missing security controls by design | Architectural vulnerabilities |
| **A05** | Security Misconfiguration | Default configs, open cloud storage | System exposure, data leak |
| **A06** | Vulnerable Components | Using known-vulnerable dependencies | System compromise via supply chain |
| **A07** | Auth & Identity Failures | Broken authentication, session mgmt | Account takeover |
| **A08** | Software/Data Integrity | Unverified updates, CI/CD compromise | Supply chain attack |
| **A09** | Logging & Monitoring Failures | Insufficient logging, no alerting | Undetected breaches |
| **A10** | Server-Side Request Forgery | App fetches attacker-specified URLs | Internal network access |

### 1.2 A01: Broken Access Control - Deep Dive

```
Common Vulnerabilities:
├── IDOR (Insecure Direct Object Reference)
│   GET /api/users/123/profile → Change 123 to 456
│   Mitigation: Authorization check on every request
│
├── Missing Function Level Access Control
│   Regular user accessing /admin/users
│   Mitigation: Role-based access control (RBAC)
│
├── Privilege Escalation
│   Modifying role in JWT or request body
│   Mitigation: Server-side role validation, never trust client
│
├── CORS Misconfiguration
│   Access-Control-Allow-Origin: *
│   Mitigation: Whitelist specific origins
│
└── Directory Traversal
    GET /api/files?path=../../../etc/passwd
    Mitigation: Input validation, sandboxed file access

Prevention Checklist:
- [ ] Deny by default (whitelist, not blacklist)
- [ ] Implement RBAC or ABAC consistently
- [ ] Validate authorization on EVERY request (not just UI)
- [ ] Log access control failures and alert on patterns
- [ ] Rate limit API access
- [ ] Disable directory listing
- [ ] Invalidate sessions on logout
- [ ] JWT tokens: validate issuer, audience, expiration
```

### 1.3 A03: Injection - Deep Dive

```
Types of Injection:
├── SQL Injection
│   SELECT * FROM users WHERE id = '${userInput}'
│   Input: ' OR '1'='1' --
│   Fix: Parameterized queries, ALWAYS
│
├── NoSQL Injection
│   db.users.find({ username: userInput })
│   Input: { "$ne": null }
│   Fix: Input type validation, sanitization
│
├── Command Injection
│   exec(`ping ${userInput}`)
│   Input: ; rm -rf /
│   Fix: Never use exec with user input, use libraries
│
├── LDAP Injection
│   Similar to SQL injection but for LDAP queries
│   Fix: Escape special characters, parameterize
│
├── XSS (Cross-Site Scripting)
│   Injecting JavaScript into web pages
│   Types: Reflected, Stored, DOM-based
│   Fix: Output encoding, CSP headers, sanitize HTML
│
└── Prompt Injection (NEW - AI specific)
    Manipulating LLM behavior via crafted input
    Fix: Input/output filtering, system prompt protection

Universal Prevention:
1. NEVER trust user input
2. Use parameterized queries / prepared statements
3. Validate and sanitize all inputs
4. Use ORM/query builders (but still validate)
5. Apply least privilege to database accounts
6. Escape output based on context (HTML, JS, SQL, URL)
```

---

## 2. Threat Modeling

### 2.1 STRIDE Model

```
S - Spoofing (Identity)
    Threat: Pretending to be someone/something else
    Example: Forged authentication tokens, IP spoofing
    Mitigation: Strong authentication, mutual TLS

T - Tampering (Data Integrity)
    Threat: Modifying data or code
    Example: Man-in-the-middle, SQL injection, file modification
    Mitigation: Integrity checks, digital signatures, HTTPS

R - Repudiation (Non-Repudiation)
    Threat: Denying having performed an action
    Example: "I never made that transaction"
    Mitigation: Audit logs, digital signatures, timestamps

I - Information Disclosure (Confidentiality)
    Threat: Exposing data to unauthorized parties
    Example: Data breach, error messages leaking info
    Mitigation: Encryption, access controls, data classification

D - Denial of Service (Availability)
    Threat: Making a system unavailable
    Example: DDoS, resource exhaustion, crash bugs
    Mitigation: Rate limiting, CDN, auto-scaling, redundancy

E - Elevation of Privilege (Authorization)
    Threat: Gaining higher access than authorized
    Example: Exploiting vulnerability to get admin access
    Mitigation: Least privilege, input validation, sandboxing
```

### 2.2 STRIDE Threat Modeling Process

```
Step 1: Decompose the System
├── Draw data flow diagram (DFD)
├── Identify trust boundaries
├── Identify entry points
├── Identify assets (what's valuable)
└── Identify technologies used

Step 2: Identify Threats (per element)
For each element in the DFD, apply STRIDE:

Element Type    │ Applicable Threats
────────────────┼────────────────────────
External Entity │ S, R
Process         │ S, T, R, I, D, E
Data Store      │ T, R, I, D
Data Flow       │ T, I, D

Step 3: Rate Threats (DREAD)
D - Damage potential (0-10)
R - Reproducibility (0-10)
E - Exploitability (0-10)
A - Affected users (0-10)
D - Discoverability (0-10)

Risk Score = Average of DREAD scores
├── 0-3: Low risk
├── 4-6: Medium risk
├── 7-8: High risk
└── 9-10: Critical risk

Step 4: Mitigate or Accept
├── HIGH/CRITICAL → Must mitigate before launch
├── MEDIUM → Mitigate within next sprint
├── LOW → Accept with documentation
└── Document all decisions
```

### 2.3 PASTA (Process for Attack Simulation and Threat Analysis)

```
7-Stage Process:

Stage 1: Define Objectives
├── Business impact analysis
├── Compliance requirements
└── Security goals

Stage 2: Define Technical Scope
├── Application architecture
├── Infrastructure components
└── Data flows and storage

Stage 3: Application Decomposition
├── Use cases and actors
├── Trust boundaries
├── Entry/exit points

Stage 4: Threat Analysis
├── Known attack patterns (CAPEC)
├── Threat intelligence feeds
└── Historical incidents

Stage 5: Vulnerability Analysis
├── Code review findings
├── Penetration test results
├── Automated scan results

Stage 6: Attack Modeling
├── Attack trees
├── Attack scenarios
└── Exploit feasibility

Stage 7: Risk & Impact Analysis
├── Probability × Impact
├── Business risk quantification
├── Prioritized remediation plan
```

### 2.4 LINDDUN (Privacy Threat Modeling)

```
L - Linking: Connecting data to identify individuals
I - Identifying: Determining someone's identity
N - Non-repudiation: Cannot deny actions (privacy violation)
D - Detecting: Noticing someone's actions/presence
D - Data Disclosure: Exposing personal data
U - Unawareness: User doesn't know about data processing
N - Non-compliance: Violating privacy regulations

Use for: GDPR compliance, health data systems, fintech
```

---

## 3. Social Engineering Defense

### 3.1 Attack Vectors (Kevin Mitnick Framework)

```
Social Engineering Attack Types:

1. Phishing
   ├── Email phishing (mass)
   ├── Spear phishing (targeted)
   ├── Whaling (executives)
   ├── Smishing (SMS)
   ├── Vishing (voice/phone)
   └── AI-generated phishing (deepfake voice/video)

2. Pretexting
   ├── Impersonating IT support
   ├── Impersonating a vendor
   ├── Impersonating law enforcement
   └── Building elaborate backstory for manipulation

3. Baiting
   ├── USB drops (infected drives in parking lots)
   ├── Free software downloads (trojanized)
   └── QR code attacks (malicious redirects)

4. Tailgating / Piggybacking
   ├── Following someone through secure doors
   └── "I forgot my badge" attacks

5. Quid Pro Quo
   ├── "Free tech support" in exchange for credentials
   └── Fake surveys with prizes

6. AI-Powered Social Engineering (2025-2026)
   ├── Deepfake video calls impersonating executives
   ├── AI-generated voice clones
   ├── LLM-crafted, highly personalized phishing
   └── Automated reconnaissance via social media
```

### 3.2 Defense Framework

```
Human Layer Defense:

1. Security Awareness Training
   ├── Quarterly training sessions
   ├── Simulated phishing campaigns (monthly)
   ├── Incident reporting procedures
   ├── Recognition for reporting (positive reinforcement)
   └── Role-specific training (executives, finance, IT)

2. Verification Protocols
   ├── Callback verification for financial requests
   ├── Out-of-band confirmation for sensitive changes
   ├── Multi-person authorization for large transactions
   ├── Code words for phone verification
   └── Video verification for high-value requests

3. Technical Controls
   ├── Email authentication (SPF, DKIM, DMARC)
   ├── URL filtering and sandboxing
   ├── MFA everywhere (hardware keys preferred)
   ├── Email gateway with AI-powered phishing detection
   └── DNS filtering for malicious domains

4. Process Controls
   ├── Documented procedures for sensitive operations
   ├── Dual authorization for financial transfers
   ├── Vendor verification process
   ├── Physical access policies
   └── Clean desk policy

Mitnick's Golden Rule:
"The weakest link in any security system is the human element."
Defense must combine technology + training + process.
```

---

## 4. Cryptography Fundamentals

### 4.1 Bruce Schneier's Principles

```
Schneier's Laws of Cryptography:

1. "Anyone can create a cipher that they themselves cannot break."
   → Use well-known, well-tested algorithms

2. "Security is a process, not a product."
   → No single solution provides complete security

3. "Complexity is the enemy of security."
   → Simpler systems are easier to secure and verify

4. "If you think technology can solve your security problems,
    then you don't understand the problems and you don't
    understand the technology."
```

### 4.2 Algorithm Reference

| Purpose | Algorithm | Key Size | Status (2025) |
|---------|-----------|----------|---------------|
| **Symmetric Encryption** | AES-256-GCM | 256-bit | Recommended |
| **Symmetric Encryption** | ChaCha20-Poly1305 | 256-bit | Recommended |
| **Asymmetric Encryption** | RSA | 2048+ bits | Acceptable (prefer 4096) |
| **Asymmetric Encryption** | ECDH (P-256, X25519) | 256-bit | Recommended |
| **Digital Signatures** | Ed25519 | 256-bit | Recommended |
| **Digital Signatures** | ECDSA (P-256) | 256-bit | Recommended |
| **Hashing** | SHA-256/SHA-3 | 256-bit | Recommended |
| **Password Hashing** | Argon2id | Configurable | Recommended |
| **Password Hashing** | bcrypt | 128-bit (cost 12+) | Acceptable |
| **Key Derivation** | HKDF | Variable | Recommended |
| **Post-Quantum** | CRYSTALS-Kyber | Various | Emerging (NIST approved) |
| **Post-Quantum** | CRYSTALS-Dilithium | Various | Emerging (NIST approved) |

### 4.3 Cryptography Decision Tree

```
What do you need?

Encrypt data at rest:
├── Database fields → AES-256-GCM + key management (KMS)
├── Files → AES-256-GCM or ChaCha20
├── Full disk → BitLocker (Windows), LUKS (Linux)
└── Key storage → HSM or cloud KMS (never in code)

Encrypt data in transit:
├── Web traffic → TLS 1.3 (minimum TLS 1.2)
├── API communication → mTLS for service-to-service
├── Email → S/MIME or PGP
└── File transfer → SFTP or SCP

Hash passwords:
├── Use Argon2id (preferred) or bcrypt
├── NEVER use MD5, SHA-1, or plain SHA-256 for passwords
├── Salt is mandatory (unique per password)
└── Configure: memory=64MB, iterations=3, parallelism=4

Verify integrity:
├── File integrity → SHA-256 hash + signature
├── Message integrity → HMAC-SHA256
├── Code signing → Ed25519 or RSA-PSS
└── API requests → HMAC signature on request body

Digital signatures:
├── Documents → Ed25519 or ECDSA
├── JWTs → RS256 (RSA) or ES256 (ECDSA) or EdDSA
├── Git commits → GPG or SSH signing
└── Software releases → Sigstore / GPG

NEVER DO:
├── Roll your own crypto
├── Use ECB mode
├── Use MD5 or SHA-1 for anything security-related
├── Hardcode keys or secrets in source code
├── Use the same key for encryption and authentication
├── Use random nonces without checking uniqueness
└── Ignore post-quantum migration planning
```

### 4.4 Post-Quantum Cryptography

```
Quantum Threat Timeline:
├── 2025-2030: Harvest Now, Decrypt Later (HNDL) attacks
├── 2030-2035: Early quantum computers (limited)
├── 2035+: Cryptographically relevant quantum computers

What's at risk:
├── RSA → Broken by Shor's algorithm
├── ECDSA/ECDH → Broken by Shor's algorithm
├── AES-256 → Weakened (use 256-bit, not 128-bit)
├── SHA-256 → Weakened by Grover's (still usable)
└── Argon2 → Resistant to quantum attacks

NIST Post-Quantum Standards (2024):
├── CRYSTALS-Kyber → Key encapsulation (encryption)
├── CRYSTALS-Dilithium → Digital signatures
├── FALCON → Digital signatures (compact)
└── SPHINCS+ → Hash-based signatures (conservative)

Migration Strategy:
1. Inventory all cryptographic usage
2. Identify highest-risk data (long shelf life)
3. Deploy hybrid schemes (classical + PQ)
4. Plan full migration timeline
5. Monitor NIST updates and quantum progress
```

---

## 5. Web Security

### 5.1 Troy Hunt's Web Security Principles

```
Core Principles:
1. HTTPS everywhere (no exceptions)
2. Content Security Policy (CSP) headers
3. Secure cookie attributes
4. Input validation and output encoding
5. Rate limiting and abuse prevention
6. Security headers on every response
7. Regular dependency updates
```

### 5.2 Security Headers Reference

```
Must-Have Headers:

Content-Security-Policy: default-src 'self'; script-src 'self';
  style-src 'self' 'unsafe-inline'; img-src 'self' data:;
  font-src 'self'; connect-src 'self' https://api.example.com;
  frame-ancestors 'none';

Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

X-Content-Type-Options: nosniff

X-Frame-Options: DENY

Referrer-Policy: strict-origin-when-cross-origin

Permissions-Policy: camera=(), microphone=(), geolocation=(),
  payment=(), usb=()

Cross-Origin-Opener-Policy: same-origin

Cross-Origin-Resource-Policy: same-origin

X-XSS-Protection: 0
  (Deprecated - use CSP instead, but set to 0 to disable buggy browser filter)
```

### 5.3 Authentication Best Practices

```
Password Policy (2025 NIST Guidelines):
├── Minimum 8 characters (12+ recommended)
├── Maximum 64+ characters (no artificial limit)
├── Allow all printable ASCII and Unicode
├── Check against breached password databases (HIBP)
├── NO forced periodic rotation (only on breach)
├── NO composition rules (uppercase, special chars)
├── Allow paste in password fields
└── Use password strength meter

MFA Implementation:
├── BEST: Hardware security keys (FIDO2/WebAuthn)
├── GOOD: Authenticator apps (TOTP)
├── ACCEPTABLE: Push notifications
├── AVOID: SMS (SIM swapping risk)
└── NEVER: Email-only verification

Session Management:
├── Generate cryptographically random session IDs
├── Rotate session ID after authentication
├── Set appropriate timeouts (15-30 min idle, 8-24 hr max)
├── Cookie flags: Secure, HttpOnly, SameSite=Strict
├── Invalidate sessions server-side on logout
├── Detect and handle concurrent sessions
└── Implement gradual session step-up for sensitive operations

JWT Best Practices:
├── Use short expiration (15-60 minutes)
├── Use refresh tokens with rotation
├── Store access tokens in memory (not localStorage)
├── Validate all claims (iss, aud, exp, nbf)
├── Use asymmetric signing (RS256, ES256)
├── Never put sensitive data in JWT payload
└── Implement token revocation list for logout
```

---

## 6. Supply Chain Security

### 6.1 Software Supply Chain Threats

```
Attack Vectors:

1. Dependency Confusion
   ├── Attacker publishes malicious package with same name as internal
   ├── Package manager installs public (malicious) version
   └── Mitigation: Namespace packages, pin versions, use scoped registries

2. Typosquatting
   ├── Malicious packages with similar names (lodash → l0dash)
   └── Mitigation: Lockfiles, review new dependencies, use allow-lists

3. Compromised Maintainer
   ├── Maintainer account takeover → inject malicious code
   ├── Example: event-stream incident (2018)
   └── Mitigation: Lockfiles, hash verification, vendor critical deps

4. Build System Compromise
   ├── CI/CD pipeline manipulation
   ├── SolarWinds-style build injection
   └── Mitigation: Reproducible builds, signed artifacts, build provenance

5. AI Model Supply Chain
   ├── Poisoned training data
   ├── Backdoored model weights
   ├── Compromised model hosting
   └── Mitigation: Model provenance, hash verification, sandboxed inference
```

### 6.2 SBOM (Software Bill of Materials)

```
SBOM contains:
├── All direct dependencies (name, version, license)
├── All transitive dependencies
├── Known vulnerabilities (CVE mapping)
├── License compatibility
└── Supplier information

Formats:
├── SPDX (Linux Foundation)
├── CycloneDX (OWASP)
└── SWID (ISO standard)

SBOM Process:
1. Generate SBOM at build time (automated)
2. Store SBOM with each release
3. Continuously scan for new vulnerabilities
4. Alert on critical CVEs
5. Require SBOM for vendor software evaluation
```

### 6.3 Dependency Management

```
Rules:
1. Pin exact versions in lockfiles
2. Audit dependencies regularly (npm audit, Snyk, Dependabot)
3. Minimize dependency count (evaluate if truly needed)
4. Review new dependencies before adoption
5. Monitor for abandoned/unmaintained packages
6. Use private registry mirror for critical deps
7. Automate security updates (Dependabot, Renovate)

Dependency Evaluation Checklist:
- [ ] Active maintenance (commits in last 3 months)
- [ ] Good security track record
- [ ] Reasonable number of dependencies itself
- [ ] Appropriate license
- [ ] Large enough community/user base
- [ ] No known critical vulnerabilities
- [ ] Can we vendor this if abandoned?
```

---

## 7. Zero Trust Architecture

### 7.1 Zero Trust Principles

```
Core Principle: "Never trust, always verify"

Traditional (Perimeter) Security:
  Outside = Untrusted | Firewall | Inside = Trusted
  Problem: Once inside, attackers move freely

Zero Trust Security:
  Every request is verified regardless of source
  No implicit trust based on network location
  Least-privilege access for every action

Zero Trust Pillars:
├── 1. Verify explicitly (authn + authz on every request)
├── 2. Use least-privilege access (JIT, JEA)
├── 3. Assume breach (minimize blast radius)
├── 4. Micro-segmentation (network isolation)
├── 5. Continuous validation (not just at login)
└── 6. Encrypt everything (in transit and at rest)
```

### 7.2 Zero Trust Architecture Components

```
┌─────────────────────────────────────────────────────┐
│                    User/Device                       │
│  ├── Identity: Who are you? (MFA, certificate)      │
│  ├── Device: Is your device compliant?               │
│  └── Context: Where, when, how are you connecting?   │
└──────────────────────┬──────────────────────────────┘
                       │
                ┌──────▼───────┐
                │  Policy      │  Decision point:
                │  Engine      │  Allow/Deny/Step-up
                └──────┬───────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
   ┌───────────┐ ┌───────────┐ ┌───────────┐
   │ Service A │ │ Service B │ │ Service C │
   │ (mTLS)    │ │ (mTLS)    │ │ (mTLS)    │
   └───────────┘ └───────────┘ └───────────┘

Each service-to-service call:
├── Authenticated (mutual TLS or tokens)
├── Authorized (policy check)
├── Encrypted (TLS 1.3)
├── Logged (audit trail)
└── Rate-limited (abuse prevention)
```

### 7.3 Implementation Roadmap

```
Phase 1: Inventory (Month 1-2)
├── Identify all assets (users, devices, services, data)
├── Map data flows
├── Classify data sensitivity
├── Document current access patterns
└── Identify high-value targets

Phase 2: Identity Foundation (Month 2-4)
├── Implement strong authentication (MFA)
├── Deploy identity provider (Okta, Azure AD, Auth0)
├── Implement SSO across applications
├── Create role/attribute-based access policies
└── Implement device trust assessment

Phase 3: Micro-Segmentation (Month 4-6)
├── Segment network by workload
├── Implement service mesh (Istio, Linkerd)
├── Deploy mTLS between services
├── Create security policies per segment
└── Monitor and log all cross-segment traffic

Phase 4: Continuous Verification (Month 6-8)
├── Implement real-time risk scoring
├── Deploy behavioral analytics (UEBA)
├── Create adaptive access policies
├── Implement session re-validation
└── Deploy DLP for data-in-motion

Phase 5: Automation & Optimization (Month 8-12)
├── Automate policy enforcement
├── Integrate threat intelligence
├── Implement automated response
├── Conduct red team exercises
└── Continuously improve based on findings
```

---

## 8. Incident Response

### 8.1 Incident Response Framework (NIST SP 800-61)

```
Phase 1: PREPARATION
├── Incident response plan documented
├── Team roles and responsibilities defined
├── Communication channels established (secure)
├── Tools and access pre-provisioned
├── Runbooks for common incidents
├── Regular tabletop exercises
└── External contacts (legal, PR, law enforcement)

Phase 2: DETECTION & ANALYSIS
├── Monitor alerts (SIEM, IDS, EDR)
├── Triage: Is this a real incident?
├── Classify severity:
│   ├── SEV 1 (Critical): Data breach, system compromise
│   ├── SEV 2 (High): Service disruption, malware
│   ├── SEV 3 (Medium): Suspicious activity, policy violation
│   └── SEV 4 (Low): Failed login attempts, minor issues
├── Initial scoping (what's affected?)
├── Evidence preservation (forensic images)
└── Document everything (timeline of events)

Phase 3: CONTAINMENT
├── Short-term: Stop the bleeding
│   ├── Isolate affected systems
│   ├── Block malicious IPs/domains
│   ├── Disable compromised accounts
│   └── Preserve evidence
├── Long-term: Prevent re-occurrence
│   ├── Patch vulnerabilities
│   ├── Reset credentials
│   ├── Update access controls
│   └── Deploy additional monitoring
└── Communication: Stakeholders, customers, regulators

Phase 4: ERADICATION
├── Remove malware/backdoors
├── Close attack vectors
├── Patch vulnerabilities
├── Rebuild compromised systems from known-good
└── Verify eradication (re-scan)

Phase 5: RECOVERY
├── Restore systems from clean backups
├── Monitor for re-infection
├── Gradual service restoration
├── Verify system integrity
└── Confirm normal operations

Phase 6: POST-INCIDENT
├── Conduct blameless post-mortem (within 72 hours)
├── Document lessons learned
├── Update runbooks and procedures
├── Improve detection capabilities
├── Share indicators of compromise (IoC)
└── Track remediation actions to completion
```

### 8.2 Incident Severity Matrix

```
                    Impact
                    Low        Medium      High       Critical
Likelihood  ┌──────────┬──────────┬──────────┬──────────┐
High        │ Medium   │ High     │ Critical │ Critical │
            ├──────────┼──────────┼──────────┼──────────┤
Medium      │ Low      │ Medium   │ High     │ Critical │
            ├──────────┼──────────┼──────────┼──────────┤
Low         │ Low      │ Low      │ Medium   │ High     │
            └──────────┴──────────┴──────────┴──────────┘

Response Time SLAs:
├── Critical: 15 minutes to acknowledge, 1 hour to contain
├── High: 1 hour to acknowledge, 4 hours to contain
├── Medium: 4 hours to acknowledge, 24 hours to contain
└── Low: 24 hours to acknowledge, 1 week to resolve
```

### 8.3 Communication Templates

```
Internal Notification:
"[SEVERITY] Security Incident - [Brief Description]
Time detected: [timestamp]
Systems affected: [list]
Current status: [investigating/contained/resolved]
Impact: [description]
Actions taken: [list]
Next update: [time]
Incident Commander: [name]"

Customer Notification:
"We are aware of a security incident affecting [service/data].
What happened: [brief, factual description]
What we're doing: [remediation steps]
What you should do: [actionable steps for customers]
Timeline: [when we expect resolution]
Updates: [where to find updates]
Contact: [support channel]"

Regulatory Notification (GDPR - within 72 hours):
"Nature of breach: [description]
Categories and approximate number of individuals affected: [N]
Categories and approximate number of records affected: [N]
Likely consequences: [description]
Measures taken to address: [list]
DPO contact: [name, email, phone]"
```

---

## 9. AI-Specific Security

### 9.1 AI/ML Threat Landscape

```
Threats to AI Systems:

1. Prompt Injection
   ├── Direct: User crafts prompt to override system instructions
   ├── Indirect: Malicious content in retrieved documents
   └── Mitigation: Input/output filtering, sandboxed execution

2. Data Poisoning
   ├── Training data manipulation to introduce backdoors
   ├── Subtle bias injection through data modification
   └── Mitigation: Data provenance, anomaly detection, validation

3. Model Extraction
   ├── Querying API to reconstruct the model
   ├── Stealing model weights through side channels
   └── Mitigation: Rate limiting, watermarking, differential privacy

4. Adversarial Examples
   ├── Inputs designed to fool the model
   ├── Imperceptible perturbations that change output
   └── Mitigation: Adversarial training, input preprocessing

5. Membership Inference
   ├── Determining if specific data was in training set
   ├── Privacy violation for sensitive training data
   └── Mitigation: Differential privacy, regularization

6. Model Inversion
   ├── Reconstructing training data from model outputs
   ├── Extracting sensitive information (faces, medical records)
   └── Mitigation: Output perturbation, access controls

7. Supply Chain (AI-specific)
   ├── Trojanized model weights (e.g., from Hugging Face)
   ├── Poisoned fine-tuning datasets
   ├── Compromised embedding models
   └── Mitigation: Model provenance, hash verification, scanning
```

### 9.2 LLM Security Checklist

```
Input Security:
- [ ] System prompt protected from extraction
- [ ] User input sanitized before processing
- [ ] Prompt injection detection enabled
- [ ] Input length limits enforced
- [ ] Content filtering for harmful requests

Output Security:
- [ ] Output filtered for sensitive data (PII, secrets)
- [ ] Hallucination detection for critical outputs
- [ ] Output validation before action execution
- [ ] Rate limiting on generation
- [ ] Content moderation on outputs

Data Security:
- [ ] Training data audited for sensitive content
- [ ] RAG documents access-controlled
- [ ] User conversations encrypted at rest
- [ ] Data retention policies enforced
- [ ] Right to deletion implemented

Operational Security:
- [ ] API keys rotated regularly
- [ ] Model access logged and monitored
- [ ] Abuse detection and alerting
- [ ] Cost monitoring (prevent API abuse)
- [ ] Incident response plan for AI-specific threats
```

---

## 10. Decision Frameworks & Checklists

### 10.1 Security Architecture Review

- [ ] Authentication mechanism appropriate for risk level
- [ ] Authorization model implemented (RBAC/ABAC)
- [ ] Data classification completed
- [ ] Encryption at rest for sensitive data
- [ ] Encryption in transit (TLS 1.3)
- [ ] Input validation on all entry points
- [ ] Output encoding context-appropriate
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Logging and monitoring adequate
- [ ] Secrets management solution in place
- [ ] Dependency scanning automated
- [ ] SBOM generated and maintained
- [ ] Incident response plan documented
- [ ] Backup and recovery tested

### 10.2 New Feature Security Review

- [ ] Threat model updated for new feature
- [ ] Authentication requirements defined
- [ ] Authorization rules specified
- [ ] Input validation designed
- [ ] Data flow reviewed for sensitive data
- [ ] Error handling won't leak information
- [ ] Logging captures security-relevant events
- [ ] Dependencies evaluated for vulnerabilities
- [ ] Security tests written
- [ ] Penetration test scope updated
- [ ] Privacy impact assessed

### 10.3 Third-Party Vendor Security Assessment

- [ ] SOC 2 Type II report reviewed (or equivalent)
- [ ] Data handling practices documented
- [ ] Encryption standards verified
- [ ] Access control procedures reviewed
- [ ] Incident response capabilities assessed
- [ ] Subprocessor relationships understood
- [ ] Data residency requirements met
- [ ] Contract includes security obligations
- [ ] Right to audit clause included
- [ ] Breach notification timeline agreed
- [ ] Business continuity plan reviewed
- [ ] Exit/data portability plan documented

### 10.4 Pre-Deployment Security Gate

```
MUST PASS before production:
├── [ ] All critical/high SAST findings resolved
├── [ ] Dependency scan: No critical CVEs
├── [ ] OWASP Top 10 checks completed
├── [ ] Authentication/authorization tested
├── [ ] Security headers verified
├── [ ] TLS configuration validated (A+ on SSL Labs)
├── [ ] Secrets not in codebase (scan with git-secrets/trufflehog)
├── [ ] Rate limiting configured
├── [ ] Error pages don't leak information
├── [ ] Logging captures auth events
├── [ ] CORS properly configured
├── [ ] CSP header deployed
└── [ ] Incident response runbook exists

SHOULD PASS:
├── [ ] Penetration test completed
├── [ ] DAST scan completed
├── [ ] Security monitoring configured
├── [ ] Abuse prevention measures tested
└── [ ] Recovery procedures tested
```

### 10.5 Schneier's Security Mindset

```
"Security is always a trade-off."

Questions to ask for every security decision:
1. What are you trying to protect?
2. What are the risks?
3. How well does the security solution mitigate those risks?
4. What other risks does the security solution cause?
5. What trade-offs does the security solution require?
6. Is the cost proportional to the risk?

Remember:
- Security is a process, not a product
- The weakest link determines the strength
- Attackers think differently than defenders
- Perfect security doesn't exist
- Usability and security must be balanced
```

---

## References

- Schneier, B. "Applied Cryptography" (1996, updated)
- Schneier, B. "Secrets and Lies" (2000)
- Schneier, B. "Click Here to Kill Everybody" (2018)
- Mitnick, K. "The Art of Deception" (2002)
- Mitnick, K. "Ghost in the Wires" (2011)
- Hunt, T. "Have I Been Pwned" project and blog
- OWASP Top 10 (2021/2025)
- NIST SP 800-61 "Computer Security Incident Handling Guide"
- NIST SP 800-207 "Zero Trust Architecture"
- NIST AI Risk Management Framework (2023)
- OWASP AI Security Guidelines (2024)
- CISA Zero Trust Maturity Model (2023)

---

*Security KB v1.0 - AIOX Corporation*
*"Security is a process, not a product." - Bruce Schneier*
