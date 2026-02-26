# github-pr-automation.md

**Task**: GitHub Pull Request Automation (Repository-Agnostic)

**Purpose**: Automate PR creation from story context using GitHub CLI, works with ANY repository.

**When to use**: After pushing feature branch, via `@github-devops *create-pr` command.

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
task: githubDevopsGithubPrAutomation()
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
  - **Source:** .aios-core/core/task-runner.js

- **Tool:** logger
  - **Purpose:** Execution logging and error tracking
  - **Source:** .aios-core/utils/logger.js

---

## Scripts

**Agent-specific code for this task:**

- **Script:** execute-task.js
  - **Purpose:** Generic task execution wrapper
  - **Language:** JavaScript
  - **Location:** .aios-core/scripts/execute-task.js

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
- GitHub CLI (`gh`) installed and authenticated
- Feature branch pushed to remote
- Repository context detected
- Story file (optional but recommended)

## Workflow Steps

### Step 1: Detect Repository Context

```javascript
const { detectRepositoryContext } = require('./../scripts/repository-detector');

const context = detectRepositoryContext();
if (!context) {
  throw new Error('Unable to detect repository. Run "aios init" first.');
}
```

### Step 2: Get Current Branch

```bash
git branch --show-current
```

### Step 3: Extract Story Information (if available)

```javascript
function extractStoryInfo(storyPath) {
  if (!storyPath || !fs.existsSync(storyPath)) {
    return null;
  }

  const content = fs.readFileSync(storyPath, 'utf8');

  // Extract story ID from path or content
  const storyIdMatch = storyPath.match(/(\d+\.\d+)/);
  const storyId = storyIdMatch ? storyIdMatch[1] : null;

  // Extract title
  const titleMatch = content.match(/title:\s*["']?([^"'\n]+)["']?/);
  const title = titleMatch ? titleMatch[1] : null;

  // Extract acceptance criteria
  const acMatch = content.match(/acceptance_criteria:([\s\S]*?)(?=\n\w+:|$)/);

  return {
    id: storyId,
    title,
    hasAcceptanceCriteria: !!acMatch
  };
}
```

### Step 4: Generate PR Title (Configurable Format)

> **Configuration-Driven:** PR title format is controlled by `core-config.yaml` → `github.pr.title_format`
> This allows each project to choose the format that matches their workflow.

```javascript
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

/**
 * Load PR configuration from core-config.yaml
 * @returns {Object} PR configuration with defaults
 */
function loadPRConfig() {
  const configPath = path.join(process.cwd(), '.aios-core', 'core-config.yaml');

  // Default configuration (for projects without core-config)
  const defaults = {
    title_format: 'story-first',  // Safe default for most projects
    include_story_id: true,
    conventional_commits: {
      enabled: false,
      branch_type_map: {
        'feature/': 'feat',
        'feat/': 'feat',
        'fix/': 'fix',
        'bugfix/': 'fix',
        'hotfix/': 'fix',
        'docs/': 'docs',
        'chore/': 'chore',
        'refactor/': 'refactor',
        'test/': 'test',
        'perf/': 'perf',
        'ci/': 'ci',
        'style/': 'style',
        'build/': 'build'
      },
      default_type: 'feat'
    }
  };

  try {
    if (fs.existsSync(configPath)) {
      const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
      return { ...defaults, ...config?.github?.pr };
    }
  } catch (error) {
    console.warn('Could not load core-config.yaml, using defaults');
  }

  return defaults;
}

/**
 * Generate PR title based on project configuration.
 *
 * Supported formats (configured in core-config.yaml → github.pr.title_format):
 *
 * 1. "conventional" - Conventional Commits format (for semantic-release)
 *    Example: "feat(auth): implement OAuth login [Story 6.17]"
 *
 * 2. "story-first" - Story ID first (legacy/simple projects)
 *    Example: "[Story 6.17] Implement OAuth Login"
 *
 * 3. "branch-based" - Branch name converted to title
 *    Example: "Feature User Auth"
 *
 * @param {string} branchName - Current git branch name
 * @param {Object} storyInfo - Story information (id, title)
 * @returns {string} Formatted PR title
 */
function generatePRTitle(branchName, storyInfo) {
  const config = loadPRConfig();
  const format = config.title_format || 'story-first';

  switch (format) {
    case 'conventional':
      return generateConventionalTitle(branchName, storyInfo, config);
    case 'story-first':
      return generateStoryFirstTitle(branchName, storyInfo, config);
    case 'branch-based':
      return generateBranchBasedTitle(branchName, storyInfo, config);
    default:
      return generateStoryFirstTitle(branchName, storyInfo, config);
  }
}

/**
 * Format: {type}({scope}): {description} [Story {id}]
 * Used for: Projects with semantic-release automation
 */
function generateConventionalTitle(branchName, storyInfo, config) {
  const typeMap = config.conventional_commits?.branch_type_map || {};
  const defaultType = config.conventional_commits?.default_type || 'feat';

  // Detect commit type from branch prefix
  let type = defaultType;
  for (const [prefix, commitType] of Object.entries(typeMap)) {
    if (branchName.startsWith(prefix)) {
      type = commitType;
      break;
    }
  }

  // Extract scope from branch name (e.g., feat/auth/login -> scope=auth)
  const scopeMatch = branchName.match(/^[a-z-]+\/([a-z-]+)\//);
  const scope = scopeMatch ? scopeMatch[1] : null;
  const scopeStr = scope ? `(${scope})` : '';

  // Generate description
  if (storyInfo && storyInfo.id && storyInfo.title) {
    let cleanTitle = storyInfo.title
      .replace(/^Story\s*\d+\.\d+[:\s-]*/i, '')
      .trim();
    cleanTitle = cleanTitle.charAt(0).toLowerCase() + cleanTitle.slice(1);

    const storyRef = config.include_story_id ? ` [Story ${storyInfo.id}]` : '';
    return `${type}${scopeStr}: ${cleanTitle}${storyRef}`;
  }

  // Fallback: convert branch name to description
  const description = branchName
    .replace(/^(feature|feat|fix|bugfix|hotfix|docs|chore|refactor|test|perf|ci|style|build)\//, '')
    .replace(/^[a-z-]+\//, '')
    .replace(/-/g, ' ')
    .toLowerCase()
    .trim();

  return `${type}${scopeStr}: ${description}`;
}

/**
 * Format: [Story {id}] {Title}
 * Used for: Simple projects, legacy workflows, non-NPM projects
 */
function generateStoryFirstTitle(branchName, storyInfo, config) {
  if (storyInfo && storyInfo.id && storyInfo.title) {
    return `[Story ${storyInfo.id}] ${storyInfo.title}`;
  }

  // Fallback: convert branch name to title
  return branchName
    .replace(/^(feature|feat|fix|bugfix|hotfix|docs|chore|refactor|test|perf|ci|style|build)\//, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Format: {Branch Name As Title}
 * Used for: Minimal projects, quick iterations
 */
function generateBranchBasedTitle(branchName, storyInfo, config) {
  const title = branchName
    .replace(/^(feature|feat|fix|bugfix|hotfix|docs|chore|refactor|test|perf|ci|style|build)\//, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  if (config.include_story_id && storyInfo?.id) {
    return `${title} [Story ${storyInfo.id}]`;
  }

  return title;
}
```

## Configuration Reference

Add to your project's `core-config.yaml`:

```yaml
github:
  pr:
    # Options: conventional | story-first | branch-based
    title_format: conventional  # For semantic-release projects
    # title_format: story-first  # For simple projects (default)

    include_story_id: true

    conventional_commits:
      enabled: true
      branch_type_map:
        feature/: feat
        fix/: fix
        docs/: docs
        # Add custom mappings as needed
      default_type: feat

  semantic_release:
    enabled: true  # Set false if not using semantic-release
```

## Title Format Examples

| Format | Branch | Story | Generated Title |
|--------|--------|-------|-----------------|
| `conventional` | `feature/user-auth` | 6.17: User Auth | `feat: user auth [Story 6.17]` |
| `conventional` | `fix/cli/parsing` | 6.18: CLI Fix | `fix(cli): cLI fix [Story 6.18]` |
| `story-first` | `feature/user-auth` | 6.17: User Auth | `[Story 6.17] User Auth` |
| `story-first` | `fix/cli-bug` | - | `Cli Bug` |
| `branch-based` | `feature/user-auth` | 6.17 | `User Auth [Story 6.17]` |
| `branch-based` | `docs/readme` | - | `Readme` |

### Step 5: Generate PR Description

```javascript
function generatePRDescription(storyInfo, context) {
  let description = `## Summary\n\n`;

  if (storyInfo) {
    description += `This PR implements Story ${storyInfo.id}: ${storyInfo.title}\n\n`;
    description += `**Story File**: \`docs/stories/${storyInfo.id}-*.yaml\`\n\n`;
  } else {
    description += `Changes from branch: ${branchName}\n\n`;
  }

  description += `## Changes\n\n`;
  description += `- [List main changes here]\n\n`;

  description += `## Testing\n\n`;
  description += `- [ ] Unit tests passing\n`;
  description += `- [ ] Integration tests passing\n`;
  description += `- [ ] Manual testing completed\n\n`;

  description += `## Checklist\n\n`;
  description += `- [ ] Code follows project standards\n`;
  description += `- [ ] Tests added/updated\n`;
  description += `- [ ] Documentation updated\n`;
  description += `- [ ] Quality gates passed\n\n`;

  description += `---\n`;
  description += `**Repository**: ${context.repositoryUrl}\n`;
  description += `**Mode**: ${context.mode}\n`;
  description += `**Package**: ${context.packageName} v${context.packageVersion}\n`;

  return description;
}
```

### Step 5.1: Enrich PR Description with Impact Analysis (Code Intelligence — Advisory)

> **Added by:** Story NOG-7 (DevOps Pre-Push Impact Analysis)
> **Behavior:** Auto-skips if code intelligence unavailable. Appends "Impact Analysis" section to PR body.

```javascript
const { generateImpactSummary } = require('.aios-core/core/code-intel/helpers/devops-helper');

async function enrichPRWithImpactAnalysis(description, changedFiles) {
  // Auto-skip if code intelligence unavailable
  const { isCodeIntelAvailable } = require('.aios-core/core/code-intel');
  if (!isCodeIntelAvailable()) {
    return description; // Return original description unchanged
  }

  const impact = await generateImpactSummary(changedFiles);

  if (!impact) {
    return description; // No impact data — return original
  }

  // Append Impact Analysis section to PR description
  const impactSection = [
    '',
    '## Impact Analysis',
    '',
    impact.summary,
    '',
    '---',
    '*Generated by Code Intelligence (advisory only)*',
  ].join('\n');

  return description + impactSection;
}
```

**Usage in PR creation flow:**

After `generatePRDescription()` returns the base description, call `enrichPRWithImpactAnalysis()` to optionally append the impact section:

```javascript
let description = generatePRDescription(storyInfo, context);
description = await enrichPRWithImpactAnalysis(description, changedFiles);
```

**Important:** If code intelligence is unavailable or returns null, the PR description remains unchanged — zero impact on existing workflow.

---

### Step 6: Determine Base Branch

```javascript
function determineBaseBranch(projectRoot) {
  // Check default branch from git
  try {
    const defaultBranch = execSync('git symbolic-ref refs/remotes/origin/HEAD', {
      cwd: projectRoot
    }).toString().trim().replace('refs/remotes/origin/', '');

    return defaultBranch || 'main';
  } catch (error) {
    // Fallback to main
    return 'main';
  }
}
```

### Step 7: Create PR via GitHub CLI

```bash
gh pr create \
  --title "{title}" \
  --body "{description}" \
  --base {baseBranch} \
  --head {currentBranch}
```

### Step 8: Assign Reviewers (Optional)

```javascript
function assignReviewers(storyType, prNumber) {
  const reviewerMap = {
    'feature': ['@dev-team'],
    'bugfix': ['@qa-team'],
    'docs': ['@tech-writer'],
    'security': ['@security-team']
  };

  const reviewers = reviewerMap[storyType] || ['@dev-team'];

  execSync(`gh pr edit ${prNumber} --add-reviewer ${reviewers.join(',')}`, {
    cwd: projectRoot
  });
}
```

## Example Usage

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function createPullRequest(storyPath) {
  // Detect repository
  const { detectRepositoryContext } = require('./../scripts/repository-detector');
  const context = detectRepositoryContext();

  console.log(`\n🔀 Creating Pull Request`);
  console.log(`Repository: ${context.repositoryUrl}\n`);

  // Get current branch
  const currentBranch = execSync('git branch --show-current', {
    cwd: context.projectRoot
  }).toString().trim();

  console.log(`Branch: ${currentBranch}`);

  // Extract story info
  const storyInfo = storyPath ? extractStoryInfo(storyPath) : null;

  // Generate PR title and description
  const title = generatePRTitle(currentBranch, storyInfo);
  const description = generatePRDescription(storyInfo, context);
  const baseBranch = determineBaseBranch(context.projectRoot);

  console.log(`Title: ${title}`);
  console.log(`Base: ${baseBranch}\n`);

  // Create PR
  const prUrl = execSync(
    `gh pr create --title "${title}" --body "${description}" --base ${baseBranch}`,
    { cwd: context.projectRoot }
  ).toString().trim();

  console.log(`\n✅ Pull Request created: ${prUrl}`);

  return { prUrl, title, baseBranch };
}

module.exports = { createPullRequest };
```

## Integration

Called by `@github-devops` via `*create-pr` command.

## Validation

- PR created in correct repository (detected URL)
- PR title follows Conventional Commits format (required for semantic-release)
- PR title includes story ID if available (e.g., `[Story 6.17]`)
- PR description includes repository context
- Base branch is correct (usually main/master)

## Semantic-Release Integration (Optional)

> **Note:** This section only applies when `core-config.yaml` has:
> - `github.pr.title_format: conventional`
> - `github.semantic_release.enabled: true`
>
> Projects without semantic-release should use `title_format: story-first` (default).

**When enabled:** PRs merged via "Squash and merge" use the PR title as commit message, triggering semantic-release:

| Branch Pattern | Generated Title | Release |
|---------------|-----------------|---------|
| `feature/user-auth` | `feat: user auth` | ✅ Minor |
| `feat/auth/sso-login` | `feat(auth): sso login` | ✅ Minor |
| `fix/cli-parsing` | `fix: cli parsing` | ✅ Patch |
| `docs/readme-update` | `docs: readme update` | ❌ None |
| `chore/deps-update` | `chore: deps update` | ❌ None |

For breaking changes, manually edit the PR title to include `!`:
- `feat!: redesign authentication API [Story 7.1]`

## Configuration for Different Project Types

### NPM Package with Semantic-Release (aios-core)
```yaml
github:
  pr:
    title_format: conventional
  semantic_release:
    enabled: true
```

### Simple Web App (no releases)
```yaml
github:
  pr:
    title_format: story-first  # [Story 6.17] Title
  semantic_release:
    enabled: false
```

### Quick Prototypes
```yaml
github:
  pr:
    title_format: branch-based  # Just branch name as title
    include_story_id: false
```

## Notes

- Works with ANY repository
- Gracefully handles missing story file
- Uses GitHub CLI for reliability
- Repository context from detector

## Handoff
next_agent: @po
next_command: *close-story {story-id}
condition: PR merged successfully
alternatives:
  - agent: @dev, command: *apply-qa-fixes, condition: PR review requested changes
