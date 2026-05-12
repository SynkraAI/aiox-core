# init-project-status

**Task ID:** init-project-status
**Version:** 1.0
**Created:** 2025-01-14 (Story 6.1.2.4)
**Agent:** @devops (Gage)

---

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
task: initProjectStatus()
responsável: River (Facilitator)
responsavel_type: Agente
atomic_layer: Atom

**Entrada:**
- campo: project_path
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Valid directory path

- campo: options
  tipo: object
  origem: User Input
  obrigatório: false
  validação: Initialization options

**Saída:**
- campo: initialized_project
  tipo: string
  destino: File system
  persistido: true

- campo: config_created
  tipo: boolean
  destino: Return value
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Directory is empty or force flag set; config valid
    tipo: pre-condition
    blocker: true
    validação: |
      Check directory is empty or force flag set; config valid
    error_message: "Pre-condition failed: Directory is empty or force flag set; config valid"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Project initialized; config files created; structure valid
    tipo: post-condition
    blocker: true
    validação: |
      Verify project initialized; config files created; structure valid
    error_message: "Post-condition failed: Project initialized; config files created; structure valid"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Project structure correct; all config files valid
    tipo: acceptance-criterion
    blocker: true
    validação: |
      Assert project structure correct; all config files valid
    error_message: "Acceptance criterion not met: Project structure correct; all config files valid"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** project-scaffolder
  - **Purpose:** Generate project structure and config
  - **Source:** .aiox-core/scripts/project-scaffolder.js

- **Tool:** config-manager
  - **Purpose:** Initialize configuration files
  - **Source:** .aiox-core/utils/config-manager.js

---

## Error Handling

**Strategy:** retry

**Common Errors:**

1. **Error:** Directory Not Empty
   - **Cause:** Target directory already contains files
   - **Resolution:** Use force flag or choose empty directory
   - **Recovery:** Prompt for confirmation, merge or abort

2. **Error:** Initialization Failed
   - **Cause:** Error creating project structure
   - **Resolution:** Check permissions and disk space
   - **Recovery:** Cleanup partial initialization, log error

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 0.5-2 min (estimated)
cost_estimated: $0.0001-0.0005
token_usage: ~500-1,000 tokens
```

**Optimization Notes:**
- Minimize external dependencies; cache results if reusable; validate inputs early

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


## Description

Initialize dynamic project status tracking for agent activation context. This task sets up the project status feature that displays git state, recent work, and current story/epic information in agent greetings.

---

## Inputs

None (runs in current project directory)

---

## Elicitation

```yaml
elicit: false
```

This task runs autonomously without user interaction.

---

## Steps

### Step 1: Detect Git Repository

**Action:** Check if current directory is a git repository

```bash
git rev-parse --is-inside-work-tree 2>/dev/null
```

**Exit Condition:** If not a git repo, display message and exit gracefully:
```
⚠️  Project status feature requires a git repository.
    Initialize git first: git init
```

---

### Step 2: Check Current Configuration

**Action:** Read `.aiox-core/core-config.yaml` and check `projectStatus.enabled`

**Logic:**
```javascript
const config = yaml.load(fs.readFileSync('.aiox-core/core-config.yaml'));
const isEnabled = config?.projectStatus?.enabled === true;
```

**If already enabled:**
```
✅ Project status is already enabled in core-config.yaml
```

Skip to Step 4.

---

### Step 3: Enable Project Status in Config

**Action:** Update `core-config.yaml` to enable project status

**Changes:**
```yaml
projectStatus:
  enabled: true
  autoLoadOnAgentActivation: true
  showInGreeting: true
  cacheTimeSeconds: 60
  components:
    gitBranch: true
    gitStatus: true
    recentWork: true
    currentEpic: true
    currentStory: true
  statusFile: .aiox/project-status.yaml
  maxModifiedFiles: 5
  maxRecentCommits: 2
```

**Confirmation:**
```
✅ Enabled projectStatus in core-config.yaml
```

---

### Step 4: Create .aiox Directory

**Action:** Ensure `.aiox/` directory exists

```bash
mkdir -p .aiox
```

**Note:** Directory is created if missing, no error if exists.

---

### Step 5: Initialize Status Cache

**Action:** Load project status for the first time

```javascript
const { loadProjectStatus } = require('./.aiox-core/scripts/project-status-loader.js');
const status = await loadProjectStatus();
```

**Verification:** Check that `.aiox/project-status.yaml` was created with valid content.

**Sample Cache Content:**
```yaml
status:
  branch: main
  modifiedFiles:
    - story-6.1.2.4.md
  recentCommits:
    - "chore: cleanup Utils Registry"
  currentEpic: null
  currentStory: null
  lastUpdate: '2025-01-14T10:30:00.000Z'
  isGitRepo: true
timestamp: 1705238400000
ttl: 60
```

**Confirmation:**
```
✅ Initialized project status cache (.aiox/project-status.yaml)
```

---

### Step 6: Test Status Display

**Action:** Simulate agent activation to verify status displays correctly

**Method:** Load status and format for display

```javascript
const { loadProjectStatus, formatStatusDisplay } = require('./.aiox-core/scripts/project-status-loader.js');
const status = await loadProjectStatus();
const display = formatStatusDisplay(status);
console.log('\nExample Agent Greeting:\n');
console.log('💻 Dex (Builder) ready. Let's build something great!\n');
console.log('Current Project Status:');
console.log(display);
console.log('\nType *help to see available commands!');
```

---

### Step 7: Update .gitignore

**Action:** Ensure `.aiox/project-status.yaml` is gitignored

**Check:** Look for `.aiox/project-status.yaml` entry in `.gitignore`

**If missing:** Add entry to `.gitignore`

```gitignore
# AIOX Project Status Cache (auto-generated)
.aiox/project-status.yaml
```

**Confirmation:**
```
✅ Added .aiox/project-status.yaml to .gitignore
```

---

### Step 8: Display Success Summary

**Action:** Show complete setup summary

```
╔═══════════════════════════════════════════════════════════╗
║  ✅ Project Status Tracking Initialized                  ║
╚═══════════════════════════════════════════════════════════╝

Configuration:
  • projectStatus.enabled = true
  • Cache file: .aiox/project-status.yaml
  • Cache TTL: 60 seconds
  • Gitignored: Yes

Next Steps:
  1. Activate any agent to see project status in greeting
  2. Example: /dev or /po
  3. Status automatically refreshes every 60 seconds

Documentation: docs/guides/project-status-feature.md
```

---

## Outputs

### Files Created

- `.aiox/project-status.yaml` - Status cache file (gitignored)

### Files Modified

- `.aiox-core/core-config.yaml` - projectStatus section enabled (if was disabled)
- `.gitignore` - Added cache file entry (if missing)

### System State

- Project status feature: **ENABLED**
- All 11 agents will now display project context on activation

---

## Validation

- [ ] `.aiox/project-status.yaml` exists and contains valid YAML
- [ ] `core-config.yaml` has `projectStatus.enabled: true`
- [ ] `.gitignore` includes `.aiox/project-status.yaml`
- [ ] Test agent activation shows status display
- [ ] Git repository detected correctly
- [ ] Cache TTL is 60 seconds

---

## Error Handling

### Not a Git Repository

**Error:**
```
⚠️  Project status feature requires a git repository.
```

**Resolution:**
```bash
git init
```

### core-config.yaml Not Found

**Error:**
```
❌ Could not find .aiox-core/core-config.yaml
   Are you in the project root directory?
```

**Resolution:** Navigate to project root before running task.

### Permission Denied on .aiox Directory

**Error:**
```
❌ Cannot create .aiox directory: Permission denied
```

**Resolution:** Check file system permissions for project directory.

---

## Rollback

To disable project status tracking:

1. **Edit core-config.yaml:**
   ```yaml
   projectStatus:
     enabled: false
   ```

2. **Remove cache file:**
   ```bash
   rm .aiox/project-status.yaml
   ```

3. **Restart agent sessions** - new activations won't load status

---

## Performance Notes

- **First load:** ~80-100ms (git commands + file I/O)
- **Cached load:** ~5-10ms (YAML read only)
- **Cache invalidation:** Automatic after 60 seconds
- **Agent overhead:** Minimal (<100ms added to activation)

---

## Dependencies

### Scripts

- `.aiox-core/scripts/project-status-loader.js` - Core status loader

### NPM Packages

- `js-yaml` - YAML parsing (already in project dependencies)
- `execa` - Git command execution (already in project dependencies)

### Git Commands Used

- `git rev-parse --is-inside-work-tree` - Detect git repo
- `git branch --show-current` - Get current branch (git >= 2.22)
- `git rev-parse --abbrev-ref HEAD` - Fallback for older git
- `git status --porcelain` - Get modified files
- `git log -2 --oneline --no-decorate` - Get recent commits

---

## Related

- **Story:** 6.1.2.4 - Dynamic Project Status Context
- **Documentation:** `docs/guides/project-status-feature.md`
- **Config:** `.aiox-core/core-config.yaml` (projectStatus section)

---

**Status:** ✅ Production Ready
**Tested On:** Windows, Linux, macOS
**Git Requirement:** git >= 2.0 (2.22+ recommended)
