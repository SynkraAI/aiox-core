# Security Checklist Task

Automated security vulnerability scanning for common security anti-patterns.

**Absorbed from:** Auto-Claude PR Review Phase 6.1

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)

- Autonomous scanning with logging
- Minimal user interaction
- **Best for:** CI/CD integration, pre-commit hooks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**

- Explains each vulnerability found
- Educational context about risks
- **Best for:** Learning, security training

### 3. Pre-Flight Planning - Comprehensive Upfront Planning

- Full codebase security audit
- Zero ambiguity execution
- **Best for:** Security reviews, audits

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOX Task Format V1.0)

```yaml
task: qaSecurityChecklist()
responsavel: Quinn (Guardian)
responsavel_type: Agente
atomic_layer: Molecule

**Entrada:**
- campo: story_id
  tipo: string
  origem: User Input
  obrigatorio: true
  validacao: Must be valid story ID format (e.g., "6.3")

- campo: file_paths
  tipo: array
  origem: git diff or explicit list
  obrigatorio: false
  validacao: If empty, extracts from uncommitted changes

- campo: severity_threshold
  tipo: string
  origem: config
  obrigatorio: false
  validacao: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" (default: "HIGH")

**Saida:**
- campo: security_report
  tipo: object
  destino: Return value
  persistido: false

- campo: vulnerabilities_found
  tipo: number
  destino: Memory
  persistido: false

- campo: report_file
  tipo: file
  destino: docs/stories/{story-id}/qa/security_issues.json
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Files to scan exist
    tipo: pre-condition
    blocker: true
    validacao: |
      git diff --name-only returns files OR --files provided
    error_message: "Pre-condition failed: No files to scan."

  - [ ] Grep tool available
    tipo: pre-condition
    blocker: true
    validacao: |
      Native Grep tool accessible
    error_message: "Pre-condition failed: Grep tool not available."
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Security report generated
    tipo: post-condition
    blocker: true
    validacao: |
      security_issues.json exists with results
    error_message: "Post-condition failed: Security report not generated."

  - [ ] All patterns checked
    tipo: post-condition
    blocker: true
    validacao: |
      All 8 security patterns scanned
    error_message: "Post-condition failed: Not all patterns checked."
```

---

## Security Patterns (8 Checks)

### Check 1: eval() and Dynamic Code Execution

**Severity:** CRITICAL
**Languages:** JavaScript, TypeScript, Python

```yaml
patterns:
  javascript:
    - "eval\\("
    - "new Function\\("
    - "setTimeout\\(['\"`][^'\"]+['\"`]"
    - "setInterval\\(['\"`][^'\"]+['\"`]"
  python:
    - "eval\\("
    - "exec\\("
    - "compile\\("

risk: Remote Code Execution (RCE)
fix: Use JSON.parse() for data, avoid dynamic code entirely
```

### Check 2: innerHTML and DOM XSS

**Severity:** CRITICAL
**Languages:** JavaScript, TypeScript

```yaml
patterns:
  - "\\.innerHTML\\s*="
  - "\\.outerHTML\\s*="
  - "document\\.write\\("
  - "document\\.writeln\\("

risk: Cross-Site Scripting (XSS)
fix: Use textContent, createElement, or sanitization libraries
```

### Check 3: dangerouslySetInnerHTML (React)

**Severity:** CRITICAL
**Languages:** JavaScript, TypeScript (React/JSX)

```yaml
patterns:
  - 'dangerouslySetInnerHTML'

risk: Cross-Site Scripting (XSS) in React
fix: Use DOMPurify or avoid entirely
exception: Only if sanitized with DOMPurify.sanitize()
```

### Check 4: shell=True (Python)

**Severity:** CRITICAL
**Languages:** Python

```yaml
patterns:
  - "subprocess\\..*shell\\s*=\\s*True"
  - "os\\.system\\("
  - "os\\.popen\\("

risk: Command Injection
fix: Use subprocess with shell=False and list arguments
```

### Check 5: Hardcoded Secrets

**Severity:** CRITICAL
**Languages:** All

```yaml
patterns:
  # API Keys
  - "api[_-]?key\\s*[=:]\\s*['\"][^'\"]{10,}['\"]"
  - "apikey\\s*[=:]\\s*['\"][^'\"]{10,}['\"]"

  # Passwords
  - "password\\s*[=:]\\s*['\"][^'\"]+['\"]"
  - "passwd\\s*[=:]\\s*['\"][^'\"]+['\"]"
  - "pwd\\s*[=:]\\s*['\"][^'\"]+['\"]"

  # Tokens
  - "token\\s*[=:]\\s*['\"][^'\"]{10,}['\"]"
  - "secret\\s*[=:]\\s*['\"][^'\"]{10,}['\"]"
  - "bearer\\s+[a-zA-Z0-9_-]{20,}"

  # AWS
  - 'AKIA[0-9A-Z]{16}'
  - 'aws[_-]?secret[_-]?access[_-]?key'

  # Private Keys
  - '-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----'

risk: Credential Exposure
fix: Use environment variables, secrets manager, or .env files
```

### Check 6: SQL Injection Patterns

**Severity:** CRITICAL
**Languages:** JavaScript, TypeScript, Python

```yaml
patterns:
  javascript:
    - "query\\s*\\(\\s*['\"`].*\\$\\{" # Template literal in query
    - "query\\s*\\(.*\\+.*\\)" # String concatenation in query
    - "execute\\s*\\(\\s*['\"`].*\\$\\{"
  python:
    - "execute\\s*\\(\\s*['\"].*%s" # % formatting in SQL
    - "execute\\s*\\(.*\\.format\\(" # .format() in SQL
    - "execute\\s*\\(.*f['\"]" # f-string in SQL

risk: SQL Injection
fix: Use parameterized queries, ORM, or prepared statements
```

### Check 7: Missing Input Validation

**Severity:** HIGH
**Languages:** JavaScript, TypeScript

```yaml
patterns:
  # Express routes without validation
  - "req\\.body\\.[a-zA-Z]+[^?]" # Direct access without optional chaining
  - "req\\.query\\.[a-zA-Z]+[^?]"
  - "req\\.params\\.[a-zA-Z]+[^?]"

risk: Input validation bypass, type confusion
fix: Use Zod, Joi, or express-validator
exception: If validation middleware is present
```

### Check 8: Insecure CORS Configuration

**Severity:** HIGH
**Languages:** JavaScript, TypeScript

```yaml
patterns:
  - "origin:\\s*['\"]\\*['\"]" # Allow all origins
  - "Access-Control-Allow-Origin.*\\*"
  - "cors\\(\\)" # Default CORS without config

risk: Cross-Origin attacks, data theft
fix: Specify allowed origins explicitly
```

---

## Command

```
*security-check {story-id} [--files file1,file2] [--threshold CRITICAL|HIGH|MEDIUM|LOW]
```

**Parameters:**

- `story-id` (required): Story identifier (e.g., "6.3")
- `--files` (optional): Comma-separated file paths (default: git diff)
- `--threshold` (optional): Minimum severity to report (default: HIGH)

**Examples:**

```bash
*security-check 6.3
*security-check 6.3 --threshold CRITICAL
*security-check 6.3 --files src/api/auth.ts,src/utils/db.ts
```

---

## Workflow

### Phase 1: Collect Files

1. Get modified files:

   ```bash
   git diff --name-only HEAD~1
   ```

2. Filter by extension:

   ```
   .js, .ts, .jsx, .tsx, .py, .mjs, .cjs
   ```

3. Exclude test files (optional):
   ```
   *.test.*, *.spec.*, __tests__/*
   ```

### Phase 2: Run Security Scans

For each security check:

1. Build grep pattern for the check
2. Scan all relevant files
3. For each match:
   - Extract line number
   - Extract code context (3 lines before/after)
   - Classify severity
   - Generate fix suggestion

### Phase 3: Context Analysis

For each potential issue:

1. Check for false positives:
   - Is it in a comment?
   - Is it in a test file?
   - Is there sanitization nearby?
   - Is it a false pattern match?

2. Validate severity:
   - Is user input involved?
   - Is it in a sensitive context?
   - Is there compensating control?

### Phase 4: Generate Report

```json
{
  "timestamp": "2026-01-29T10:00:00Z",
  "story_id": "6.3",
  "summary": {
    "critical": 2,
    "high": 1,
    "medium": 0,
    "low": 0,
    "total": 3
  },
  "issues": [...],
  "scan_coverage": {
    "files_scanned": 15,
    "patterns_checked": 8,
    "lines_analyzed": 2500
  }
}
```

---

## Issue Format

```json
{
  "id": "SEC-001",
  "check": "EVAL_USAGE",
  "severity": "CRITICAL",
  "file": "src/utils/parser.ts",
  "line": 45,
  "column": 12,
  "code": "const result = eval(userInput);",
  "context": {
    "before": ["function parseExpression(userInput) {", "  // Parse user expression"],
    "after": ["  return result;", "}"]
  },
  "risk": "Remote Code Execution (RCE) - User input is directly evaluated",
  "fix": {
    "description": "Use a safe expression parser library",
    "suggestion": "const result = safeEval(userInput, { timeout: 1000 });",
    "references": ["https://owasp.org/www-community/attacks/Code_Injection"]
  },
  "false_positive_check": {
    "in_comment": false,
    "in_test": false,
    "has_sanitization": false
  }
}
```

---

## Severity Mapping

| Check                    | Default Severity | Blocking    |
| ------------------------ | ---------------- | ----------- |
| eval() / exec()          | CRITICAL         | Yes         |
| innerHTML / XSS          | CRITICAL         | Yes         |
| dangerouslySetInnerHTML  | CRITICAL         | Yes         |
| shell=True               | CRITICAL         | Yes         |
| Hardcoded Secrets        | CRITICAL         | Yes         |
| SQL Injection            | CRITICAL         | Yes         |
| Missing Input Validation | HIGH             | Recommended |
| Insecure CORS            | HIGH             | Recommended |

---

## Integration with QA Review

This task integrates into the QA review pipeline:

```
*review-build {story}
├── Phase 1-5: Standard checks
├── Phase 6.0: Library Validation
├── Phase 6.1: Security Checklist ← THIS TASK
├── Phase 6.2: Migration Validation
└── Phase 7-10: Continue review
```

**Trigger:** Automatically called during `*review-build`
**Manual:** Can be run standalone via `*security-check`

---

## False Positive Handling

### Known False Positives

1. **Test files using dangerous patterns intentionally**
   - Resolution: Exclude test files or mark as accepted

2. **Comments describing vulnerabilities**
   - Resolution: Check if match is in comment context

3. **Documentation/examples**
   - Resolution: Exclude .md files and example directories

4. **Sanitized dangerouslySetInnerHTML**
   - Resolution: Check for DOMPurify.sanitize() nearby

### Suppression

Add comment to suppress specific lines:

```javascript
// security-ignore: SEC-001 - sanitized via DOMPurify
const html = DOMPurify.sanitize(userContent);
element.innerHTML = html; // This line won't be flagged
```

---

## Example Output

```json
{
  "timestamp": "2026-01-29T10:30:00Z",
  "story_id": "6.3",
  "summary": {
    "critical": 2,
    "high": 1,
    "medium": 0,
    "low": 0,
    "total": 3,
    "blocking": true
  },
  "issues": [
    {
      "id": "SEC-001",
      "check": "HARDCODED_SECRET",
      "severity": "CRITICAL",
      "file": "src/config/api.ts",
      "line": 12,
      "code": "const API_KEY = 'sk-live-abc123xyz789';",
      "risk": "API key exposed in source code",
      "fix": {
        "description": "Use environment variable",
        "suggestion": "const API_KEY = process.env.API_KEY;"
      }
    },
    {
      "id": "SEC-002",
      "check": "SQL_INJECTION",
      "severity": "CRITICAL",
      "file": "src/api/users.ts",
      "line": 28,
      "code": "db.query(`SELECT * FROM users WHERE id = ${userId}`)",
      "risk": "SQL injection via template literal",
      "fix": {
        "description": "Use parameterized query",
        "suggestion": "db.query('SELECT * FROM users WHERE id = $1', [userId])"
      }
    },
    {
      "id": "SEC-003",
      "check": "MISSING_VALIDATION",
      "severity": "HIGH",
      "file": "src/api/auth.ts",
      "line": 15,
      "code": "const email = req.body.email;",
      "risk": "Direct access without validation",
      "fix": {
        "description": "Add input validation",
        "suggestion": "const { email } = validateLoginInput(req.body);"
      }
    }
  ],
  "scan_coverage": {
    "files_scanned": 8,
    "patterns_checked": 8,
    "lines_analyzed": 1200
  },
  "recommendation": "BLOCK - 2 CRITICAL issues must be fixed before merge"
}
```

---

## Exit Criteria

This task is complete when:

- All 8 security patterns scanned
- All modified files analyzed
- False positives filtered
- Report generated with severity classification
- Blocking recommendation provided
- Issues integrated into QA review

---

_Absorbed from Auto-Claude PR Review System - Phase 6.1_
_AIOX QA Enhancement v1.0_
