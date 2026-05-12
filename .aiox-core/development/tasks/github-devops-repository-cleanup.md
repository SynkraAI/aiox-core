# repository-cleanup.md

**Task**: Repository Cleanup (Repository-Agnostic)

**Purpose**: Identify and remove stale branches and temporary files from ANY repository.

**When to use**: Periodic maintenance via `@github-devops *cleanup` command.

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

## Task Definition (AIOX Task Format V1.0)

```yaml
task: githubDevopsRepositoryCleanup()
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

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
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

- **Tool:** task-runner
  - **Purpose:** Task execution and orchestration
  - **Source:** .aiox-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aiox-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aiox-core/scripts/execute-task.js

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
- Git repository
- GitHub CLI for remote branch operations
- Repository context detected

## Cleanup Operations

### 1. Identify Stale Branches

**Definition**: Merged branches older than 30 days

```javascript
const { execSync } = require('child_process');

function findStaleBranches(projectRoot) {
  // Get all merged branches
  const mergedBranches = execSync('git branch --merged', {
    cwd: projectRoot
  }).toString()
    .split('\n')
    .map(b => b.trim())
    .filter(b => b && b !== '* main' && b !== '* master' && b !== 'main' && b !== 'master');

  const staleBranches = [];
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

  for (const branch of mergedBranches) {
    try {
      const lastCommitDate = execSync(`git log -1 --format=%ct ${branch}`, {
        cwd: projectRoot
      }).toString().trim();

      const commitTimestamp = parseInt(lastCommitDate) * 1000;

      if (commitTimestamp < thirtyDaysAgo) {
        staleBranches.push({
          name: branch,
          lastCommit: new Date(commitTimestamp).toISOString(),
          daysOld: Math.floor((Date.now() - commitTimestamp) / (24 * 60 * 60 * 1000))
        });
      }
    } catch (error) {
      console.warn(`⚠️  Unable to check ${branch}:`, error.message);
    }
  }

  return staleBranches;
}
```

### 2. Identify Temporary Files

```javascript
const glob = require('glob');

function findTemporaryFiles(projectRoot) {
  const patterns = [
    '**/.DS_Store',
    '**/Thumbs.db',
    '**/*.tmp',
    '**/*.log',
    '**/.eslintcache'
  ];

  const tempFiles = [];

  for (const pattern of patterns) {
    const files = glob.sync(pattern, {
      cwd: projectRoot,
      ignore: ['node_modules/**', '.git/**']
    });

    tempFiles.push(...files);
  }

  return tempFiles;
}
```

### 3. Present Cleanup Suggestions

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧹 Repository Cleanup Suggestions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Repository: {repositoryUrl}

Stale Branches (merged, >30 days old):
  - feature/story-3.1-dashboard (45 days old)
  - bugfix/memory-leak (60 days old)
  - feature/old-feature (120 days old)

Total: 3 stale branches

Temporary Files:
  - .DS_Store (5 files)
  - .eslintcache
  - debug.log

Total: 7 temporary files

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Proceed with cleanup? (Y/n)
```

### 4. Execute Cleanup

```javascript
async function executeCleanup(staleBranches, tempFiles, projectRoot) {
  // Delete stale branches
  for (const branch of staleBranches) {
    try {
      execSync(`git branch -d ${branch.name}`, { cwd: projectRoot });
      console.log(`✓ Deleted local branch: ${branch.name}`);

      // Try to delete remote branch
      try {
        execSync(`git push origin --delete ${branch.name}`, { cwd: projectRoot });
        console.log(`✓ Deleted remote branch: ${branch.name}`);
      } catch (error) {
        console.warn(`⚠️  Unable to delete remote branch ${branch.name}`);
      }
    } catch (error) {
      console.error(`❌ Failed to delete ${branch.name}:`, error.message);
    }
  }

  // Delete temporary files
  for (const file of tempFiles) {
    try {
      fs.unlinkSync(path.join(projectRoot, file));
      console.log(`✓ Deleted: ${file}`);
    } catch (error) {
      console.warn(`⚠️  Unable to delete ${file}`);
    }
  }
}
```

## Safety Checks

- Never delete main/master branch
- Never delete current branch
- Never delete unmerged branches (without --force flag)
- Always require user confirmation

## Integration

Called by `@github-devops` via `*cleanup` command.

## Validation

- Correctly identifies merged branches
- Respects 30-day threshold
- Requires user approval
- Handles errors gracefully

## Notes

- Works with ANY repository
- Safe defaults (no force delete)
- Dry-run mode available
