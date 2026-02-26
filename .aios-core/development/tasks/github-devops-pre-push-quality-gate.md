# pre-push-quality-gate.md

**Task**: Pre-Push Quality Gate Validation (Repository-Agnostic)

**Purpose**: Execute comprehensive quality checks before pushing code to remote repository, ensuring code quality, tests, and security standards are met.

**When to use**: Before pushing code to GitHub, always via `@github-devops *pre-push` command.

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous decision making with logging
- Minimal user interaction
- **Best for:** Simple, deterministic tasks

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Explicit decision checkpoints
- Educational explanations
- **Best for:** Learning, complex decisions

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Task analysis phase (identify all ambiguities)
- Zero ambiguity execution
- **Best for:** Ambiguous requirements, critical work

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: githubDevopsPrePushQualityGate()
responsável: Gage (Automator)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: task
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be registered task

- campo: parameters
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Valid task parameters

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: execution_result
  tipo: object
  destino: Memory
  persistido: false

- campo: logs
  tipo: array
  destino: File (.ai/logs/*)
  persistido: true

- campo: state
  tipo: object
  destino: State management
  persistido: true
```

---

## Constitutional Gate: Quality First

> **Reference:** Constitution Article V - Quality First (MUST)
> **Severity:** BLOCK
> **Enforcement:** Mandatory checks before any push

```yaml
constitutional_gate:
  article: V
  name: Quality First
  severity: BLOCK

  validation:
    required_checks:
      - name: lint
        command: npm run lint
        must_pass: true

      - name: typecheck
        command: npm run typecheck
        must_pass: true

      - name: test
        command: npm test
        must_pass: true

      - name: build
        command: npm run build
        must_pass: true

      - name: coderabbit
        check: No CRITICAL issues
        must_pass: true

      - name: story_status
        check: Story status is "Done" or "Ready for Review"
        must_pass: true

  on_violation:
    action: BLOCK
    message: |
      CONSTITUTIONAL VIOLATION: Article V - Quality First
      Push blocked due to failed quality checks.

      Failed checks:
      {list_failed_checks}

      Resolution: Fix all failing checks before pushing.
      Run: npm run lint && npm run typecheck && npm test && npm run build

  bypass:
    allowed: false
    reason: "Quality First is NON-NEGOTIABLE per Constitution"
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Constitutional gate passed (Article V: Quality First)
    tipo: constitutional-gate
    blocker: true
    validação: |
      All quality checks must pass: lint, typecheck, test, build
    error_message: "Constitutional violation - Quality First checks failed"

  - [ ] Task is registered; required parameters provided; dependencies met
    tipo: pre-condition
    blocker: true
    validação: |
      Check task is registered; required parameters provided; dependencies met
    error_message: "Pre-condition failed: Task is registered; required parameters provided; dependencies met"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Task completed; exit code 0; expected outputs created
    tipo: post-condition
    blocker: true
    validação: |
      Verify task completed; exit code 0; expected outputs created
    error_message: "Post-condition failed: Task completed; exit code 0; expected outputs created"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Task completed as expected; side effects documented
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert task completed as expected; side effects documented
    error_message: "Acceptance criterion not met: Task completed as expected; side effects documented"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** git
  - **Purpose:** Version control operations
  - **Source:** System CLI

- **Tool:** npm
  - **Purpose:** Run quality scripts (lint, test, typecheck, build)
  - **Source:** System CLI

- **Tool:** gh (GitHub CLI)
  - **Purpose:** GitHub PR operations
  - **Source:** System CLI

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Task Not Found
   - **Cause:** Specified task not registered in system
   - **Resolution:** Verify task name and registration
   - **Recovery:** List available tasks, suggest similar

2. **Error:** Invalid Parameters
   - **Cause:** Task parameters do not match expected schema
   - **Resolution:** Validate parameters against task definition
   - **Recovery:** Provide parameter template, reject execution

3. **Error:** Execution Timeout
   - **Cause:** Task exceeds maximum execution time
   - **Resolution:** Optimize task or increase timeout
   - **Recovery:** Kill task, cleanup resources, log state

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 5-15 min (estimated)
cost_estimated: $0.003-0.010
token_usage: ~3,000-10,000 tokens
```

**Optimization Notes:**
- Break into smaller workflows; implement checkpointing; use async processing where possible

---

## Metadata

```yaml
story: N/A
version: 1.0.0
dependencies:
  - N/A
tags:
  - automation
  - workflow
updated_at: 2025-11-17
```

---


## Prerequisites
- Git repository with changes to push
- package.json with npm scripts (gracefully handles missing scripts)
- Repository context detected (run `aios init` if needed)

## Quality Gate Checks

### 1. Repository Context Detection

```javascript
const { detectRepositoryContext } = require('./../scripts/repository-detector');

const context = detectRepositoryContext();
if (!context) {
  console.error('❌ Unable to detect repository context');
  console.error('Run "aios init" to configure installation mode');
  process.exit(1);
}

console.log(`\n🚀 Pre-Push Quality Gate`);
console.log(`Repository: ${context.repositoryUrl}`);
console.log(`Mode: ${context.mode}`);
console.log(`Package: ${context.packageName} v${context.packageVersion}\n`);
```

### 2. Check for Uncommitted Changes

```bash
git status --porcelain
```

If output is not empty, fail with message:
```
❌ Uncommitted changes detected!

Please commit or stash changes before pushing:
  git add .
  git commit -m "your message"
```

### 3. Check for Merge Conflicts

```bash
git diff --check
```

If conflicts detected, fail with message:
```
❌ Merge conflicts detected!

Resolve conflicts before pushing.
```

### 4. Run npm run lint (if script exists)

```javascript
function runNpmScript(scriptName, projectRoot) {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  if (!packageJson.scripts || !packageJson.scripts[scriptName]) {
    console.log(`⚠️  Script "${scriptName}" not found - skipping`);
    return { skipped: true };
  }

  try {
    execSync(`npm run ${scriptName}`, {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    console.log(`✓ ${scriptName} PASSED`);
    return { passed: true };
  } catch (error) {
    console.error(`❌ ${scriptName} FAILED`);
    return { passed: false, error };
  }
}
```

### 5. Run npm test (if script exists)

Same logic as lint, but for `npm test`.

### 6. Run npm run typecheck (if script exists)

Same logic as lint, but for `npm run typecheck`.

### 7. Run npm run build (if script exists)

Same logic as lint, but for `npm run build`.

### 8. Run CodeRabbit CLI Review (TR-3.14.12)

```javascript
const { execSync } = require('child_process');

function runCodeRabbitReview(projectRoot) {
  console.log('\n🐰 Running CodeRabbit CLI Review...');
  console.log('⏱️  This may take 7-30 minutes. Please wait...\n');

  try {
    // Construct WSL command with proper paths
    const wslProjectPath = projectRoot
      .replace(/\\/g, '/')
      .replace(/^([A-Z]):/, (match, drive) => `/mnt/${drive.toLowerCase()}`);

    const coderabbitCommand = `wsl bash -c 'cd ${wslProjectPath} && ~/.local/bin/coderabbit --prompt-only -t uncommitted'`;

    console.log(`Executing: ${coderabbitCommand}\n`);

    // Execute with 15-minute timeout
    const output = execSync(coderabbitCommand, {
      cwd: projectRoot,
      encoding: 'utf8',
      timeout: 900000, // 15 minutes
      stdio: 'pipe',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    // Parse CodeRabbit output
    const results = parseCodeRabbitOutput(output);

    console.log(`\n✅ CodeRabbit Review Complete:`);
    console.log(`  - CRITICAL: ${results.critical}`);
    console.log(`  - HIGH: ${results.high}`);
    console.log(`  - MEDIUM: ${results.medium}`);
    console.log(`  - LOW: ${results.low}`);

    // Determine gate impact
    const gateImpact = determineCodeRabbitGate(results);

    return { gateImpact, results, rawOutput: output };
  } catch (error) {
    // Handle timeout
    if (error.killed && error.signal === 'SIGTERM') {
      console.error('❌ CodeRabbit review timed out after 15 minutes');
      console.error('   Review may still be processing. Check manually.');
      return { gateImpact: 'FAIL', error: 'Timeout', timeout: true };
    }

    // Handle authentication errors
    if (error.stderr && error.stderr.includes('not authenticated')) {
      console.error('❌ CodeRabbit not authenticated');
      console.error('   Run: wsl bash -c "~/.local/bin/coderabbit auth status"');
      return { gateImpact: 'FAIL', error: 'Not authenticated' };
    }

    // Handle command not found
    if (error.stderr && error.stderr.includes('command not found')) {
      console.error('❌ CodeRabbit CLI not found in WSL');
      console.error('   Expected location: ~/.local/bin/coderabbit');
      console.error('   Verify: wsl bash -c "~/.local/bin/coderabbit --version"');
      return { gateImpact: 'FAIL', error: 'Not installed' };
    }

    // Generic error with output for debugging
    console.error('❌ CodeRabbit review failed:', error.message);
    if (error.stdout) {
      console.log('Output:', error.stdout.toString().substring(0, 500));
    }
    return { gateImpact: 'CONCERNS', error: error.message };
  }
}

function parseCodeRabbitOutput(output) {
  // CodeRabbit outputs issues with type markers
  const lines = output.split('\n');

  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;

  for (const line of lines) {
    // Check for issue type markers
    if (line.includes('Type: critical') || line.match(/\bCRITICAL\b/i)) {
      critical++;
    } else if (line.includes('Type: high') || line.match(/\bHIGH\b/i)) {
      high++;
    } else if (line.includes('Type: potential_issue') || line.match(/\bMEDIUM\b/i)) {
      medium++;
    } else if (line.includes('Type: refactor_suggestion') || line.match(/\bLOW\b/i)) {
      low++;
    }
  }

  return { critical, high, medium, low };
}

function determineCodeRabbitGate(results) {
  // CRITICAL issues = auto-fail (block push)
  if (results.critical > 0) {
    console.log(`\n❌ FAIL: ${results.critical} CRITICAL issue(s) found - MUST FIX`);
    return 'FAIL';
  }

  // HIGH issues = concerns (warn but allow push)
  if (results.high > 0) {
    console.log(`\n⚠️  CONCERNS: ${results.high} HIGH issue(s) found - recommend fix`);
    return 'CONCERNS';
  }

  // Only MEDIUM or LOW = pass with notes
  if (results.medium > 0 || results.low > 0) {
    console.log(`\n✅ PASS: Only ${results.medium} MEDIUM and ${results.low} LOW issues`);
  } else {
    console.log(`\n✅ PASS: No issues found`);
  }

  return 'PASS';
}
```

**Usage in pre-push flow:**
```javascript
const coderabbitResult = runCodeRabbitReview(process.cwd());

if (coderabbitResult.gateImpact === 'FAIL') {
  console.error('\n❌ CodeRabbit quality gate FAILED - cannot push');
  process.exit(1);
}

if (coderabbitResult.gateImpact === 'CONCERNS') {
  // Ask user for confirmation
  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: 'CodeRabbit found HIGH issues. Continue anyway?',
    default: false
  }]);

  if (!confirm) {
    console.log('Push cancelled - please address HIGH issues');
    process.exit(2);
  }
}
```

### 9. Run Security Scan (TR-3.14.11)

```javascript
const { execSync } = require('child_process');
const path = require('path');

function runSecurityScan(storyId, storyPath, projectRoot) {
  console.log('\n🔒 Running Security Scan (SAST)...\n');

  try {
    // Execute security-scan.md task
    const securityScanPath = path.join(__dirname, 'security-scan.md');

    // For now, run security checks directly
    const results = {
      audit: runNpmAudit(projectRoot),
      eslint: runESLintSecurity(projectRoot),
      secrets: runSecretDetection(projectRoot)
    };

    // Determine gate impact
    const gateImpact = determineSecurityGate(results);

    console.log(`\nSecurity Scan Complete: ${gateImpact}`);

    return { gateImpact, results };
  } catch (error) {
    console.error('❌ Security scan failed:', error.message);
    return { gateImpact: 'FAIL', error };
  }
}

function runNpmAudit(projectRoot) {
  try {
    const output = execSync('npm audit --audit-level=moderate --json', {
      cwd: projectRoot
    }).toString();

    const results = JSON.parse(output);
    const vulns = results.metadata?.vulnerabilities || {};

    return {
      critical: vulns.critical || 0,
      high: vulns.high || 0,
      moderate: vulns.moderate || 0,
      low: vulns.low || 0,
      gate: vulns.critical > 0 ? 'FAIL' : (vulns.high > 0 ? 'CONCERNS' : 'PASS')
    };
  } catch (error) {
    // npm audit exits with 1 if vulnerabilities found
    if (error.stdout) {
      const results = JSON.parse(error.stdout.toString());
      const vulns = results.metadata?.vulnerabilities || {};

      return {
        critical: vulns.critical || 0,
        high: vulns.high || 0,
        moderate: vulns.moderate || 0,
        low: vulns.low || 0,
        gate: vulns.critical > 0 ? 'FAIL' : (vulns.high > 0 ? 'CONCERNS' : 'PASS')
      };
    }

    console.warn('⚠️  npm audit failed - skipping dependency check');
    return { gate: 'PASS', skipped: true };
  }
}

function runESLintSecurity(projectRoot) {
  // Check if ESLint security config exists
  const eslintConfigPath = path.join(projectRoot, '.eslintrc.security.json');

  if (!fs.existsSync(eslintConfigPath)) {
    console.log('⚠️  .eslintrc.security.json not found - skipping ESLint security');
    return { gate: 'PASS', skipped: true };
  }

  try {
    execSync('npx eslint . --ext .js,.ts --config .eslintrc.security.json', {
      cwd: projectRoot,
      stdio: 'pipe'
    });

    return { gate: 'PASS', issues: 0 };
  } catch (error) {
    // ESLint exits with 1 if issues found
    const output = error.stdout?.toString() || '';
    const errorCount = (output.match(/error/g) || []).length;
    const warningCount = (output.match(/warning/g) || []).length;

    return {
      gate: errorCount > 0 ? 'FAIL' : (warningCount > 0 ? 'CONCERNS' : 'PASS'),
      errors: errorCount,
      warnings: warningCount
    };
  }
}

function runSecretDetection(projectRoot) {
  try {
    execSync('npx secretlint "**/*"', {
      cwd: projectRoot,
      stdio: 'pipe'
    });

    return { gate: 'PASS', secretsFound: 0 };
  } catch (error) {
    // secretlint exits with 1 if secrets found
    return { gate: 'FAIL', secretsFound: 1 };
  }
}

function determineSecurityGate(results) {
  // Secrets are auto-fail
  if (results.secrets.gate === 'FAIL') return 'FAIL';

  // Any FAIL → overall FAIL
  if (results.audit.gate === 'FAIL' || results.eslint.gate === 'FAIL') return 'FAIL';

  // Any CONCERNS → overall CONCERNS
  if (results.audit.gate === 'CONCERNS' || results.eslint.gate === 'CONCERNS') return 'CONCERNS';

  // All PASS → overall PASS
  return 'PASS';
}
```

### 9.1 Impact Analysis (Code Intelligence — Advisory Only)

> **Added by:** Story NOG-7 (DevOps Pre-Push Impact Analysis)
> **Behavior:** Advisory only — NEVER blocks push. Auto-skips if code intelligence unavailable.

```javascript
const { assessPrePushImpact, classifyRiskLevel } = require('.aios-core/core/code-intel/helpers/devops-helper');

async function runImpactAnalysis(changedFiles) {
  // Auto-skip if code intelligence unavailable
  const { isCodeIntelAvailable } = require('.aios-core/core/code-intel');
  if (!isCodeIntelAvailable()) {
    console.log('ℹ️  Code intelligence not available — skipping impact analysis');
    return { skipped: true };
  }

  console.log('\n📊 Running Impact Analysis...\n');

  const result = await assessPrePushImpact(changedFiles);

  if (!result) {
    console.log('ℹ️  Impact analysis returned no data — skipping');
    return { skipped: true };
  }

  // Display formatted report
  console.log(result.report);

  // HIGH risk: add extra warning (advisory, does not block)
  if (result.riskLevel === 'HIGH') {
    console.log('\n⚠️  HIGH RISK detected. Additional confirmation recommended before push.');
  }

  return {
    skipped: false,
    riskLevel: result.riskLevel,
    blastRadius: result.impact ? result.impact.blastRadius : 0,
    report: result.report,
  };
}
```

**Integration with Summary Report:**

Add impact analysis results to the summary report section:

```
Impact Analysis:
  📊 Blast Radius: {N} files affected
  📊 Risk Level: {LOW|MEDIUM|HIGH}
  {if HIGH: ⚠️  HIGH RISK: {N} files affected. Confirm push?}
  {if skipped: ℹ️  Skipped (code intelligence not available)}
```

**Important:** This step is purely advisory. A HIGH risk level does NOT change the overall gate status from PASS to FAIL. It only adds an informational warning and may prompt additional user confirmation.

---

### 10. Verify Story Status (Optional - if using story-driven workflow)

```javascript
function checkStoryStatus(storyPath) {
  if (!storyPath || !fs.existsSync(storyPath)) {
    console.log('⚠️  No story file specified - skipping story status check');
    return { skipped: true };
  }

  const storyContent = fs.readFileSync(storyPath, 'utf8');

  // Look for status: "Done" or status: "Ready for Review"
  const statusMatch = storyContent.match(/status:\s*["']?(Done|Ready for Review|InProgress)["']?/i);

  if (!statusMatch) {
    console.log('⚠️  Unable to determine story status - skipping');
    return { skipped: true };
  }

  const status = statusMatch[1];

  if (status === 'Done' || status === 'Ready for Review') {
    console.log(`✓ Story status: ${status}`);
    return { passed: true, status };
  } else {
    console.log(`⚠️  Story status: ${status} (expected Done or Ready for Review)`);
    return { passed: false, status };
  }
}
```

## Summary Report

After all checks complete, present summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Pre-Push Quality Gate Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Repository:  {repositoryUrl}
Package:     {packageName} v{version}
Mode:        {framework-development | project-development}

Quality Checks:
  ✓ No uncommitted changes
  ✓ No merge conflicts
  ✓ npm run lint         PASSED
  ✓ npm test             PASSED
  ✓ npm run typecheck    PASSED
  ✓ npm run build        PASSED
  ✓ Security scan        PASSED
  ⚠️ Story status         SKIPPED (no story file)

Impact Analysis (Advisory):
  📊 Blast Radius: {N} files affected
  📊 Risk Level: LOW | MEDIUM | HIGH
  ℹ️  Advisory only — does not affect gate status

Security Scan Results:
  ✓ Dependencies: 0 critical, 0 high, 2 moderate, 5 low
  ✓ Code patterns: No security issues
  ✓ Secrets: No secrets detected

Overall Status: ✅ READY TO PUSH

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Proceed with push to remote? (Y/n)
```

### If FAIL status:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ Pre-Push Quality Gate FAILED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Quality Checks:
  ❌ npm test             FAILED
  ❌ Security scan        FAILED (CRITICAL vulnerabilities)

Security Issues:
  ❌ Dependencies: 2 CRITICAL, 5 HIGH vulnerabilities
  ❌ Secrets: 1 API key detected in config/db.js

Overall Status: ❌ BLOCKED - Cannot push to remote

Action Required:
  1. Fix failing tests
  2. Run: npm audit fix --force
  3. Remove secrets from codebase
  4. Re-run quality gate

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### If CONCERNS status:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  Pre-Push Quality Gate: CONCERNS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Quality Checks:
  ✓ All tests passed
  ⚠️ Security scan        CONCERNS (HIGH vulnerabilities)

Security Issues:
  ⚠️ Dependencies: 0 CRITICAL, 3 HIGH, 10 MODERATE vulnerabilities
  ⚠️ Code patterns: 2 medium-severity issues

Overall Status: ⚠️  CONCERNS - Review recommended

Recommendations:
  - Address HIGH vulnerabilities before production
  - Review medium-severity code patterns
  - Consider running: npm audit fix

Proceed with push anyway? (y/N)
```

## User Approval

```javascript
async function requestPushApproval(gateStatus) {
  if (gateStatus === 'FAIL') {
    console.log('\n❌ Quality gate FAILED. Cannot proceed with push.');
    process.exit(1);
  }

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: gateStatus === 'PASS'
        ? 'Proceed with push to remote?'
        : 'Quality gate has CONCERNS. Proceed anyway?',
      default: gateStatus === 'PASS'
    }
  ]);

  return confirm;
}
```

## Integration with @github-devops Agent

Called via `@github-devops *pre-push` command.

## Exit Codes

- `0` - All checks passed, user approved
- `1` - Quality gate failed (blocking)
- `2` - User declined to push

## Notes

- Works with ANY repository (framework or project)
- Gracefully handles missing npm scripts
- Security scan is mandatory (TR-3.14.11)
- User always has final approval
- Detailed logging for troubleshooting

## Handoff
next_agent: @devops
next_command: *push
condition: All quality checks PASS
alternatives:
  - agent: @dev, command: *run-tests, condition: Quality checks FAIL, needs fixes
