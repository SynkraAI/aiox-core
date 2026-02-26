---
id: pr-automation
name: Automate Pull Request Creation for Open-Source Contributions
agent: github-devops
category: devops
complexity: medium
tools:
  - github-cli       # Create PRs, manage repository
  - coderabbit-free  # Pre-submission code review
checklists:
  - github-devops-checklist.md
  - pr-quality-checklist.md
---

# Automate Pull Request Creation for Open-Source Contributions

## Purpose

To help users contribute to the AIOS open-source project (`aios-core`) by automating the PR creation process, ensuring contributions follow project standards, pass quality checks, and have proper formatting before submission.

**Target Repository**: `aios-core` (open-source framework)

**Contribution Types Supported**:
- Squads (new agents, tasks, workflows)
- Agent improvements (enhanced prompts, new commands)
- Task refinements (better checklists, templates)
- Tool integrations (new MCP tools)
- Bug fixes and improvements
- Documentation enhancements

## Input

### Required Parameters

- **contribution_type**: `string`
  - **Description**: Type of contribution
  - **Options**: `"Squad"`, `"agent"`, `"task"`, `"tool"`, `"bug-fix"`, `"documentation"`, `"improvement"`
  - **Required**: true

- **contribution_path**: `string`
  - **Description**: Path to new/modified files
  - **Example**: `"Squads/my-new-pack/"` or `"aios-core/agents/improved-agent.md"`
  - **Validation**: Path must exist locally

### Optional Parameters

- **title**: `string`
  - **Description**: PR title (auto-generated if not provided)
  - **Format**: `"{type}: {brief description}"`
  - **Example**: `"feat(Squad): Add content-creator pack with Instagram agent"`

- **description**: `string`
  - **Description**: PR description (auto-generated from template if not provided)

- **issue_number**: `number`
  - **Description**: Related issue number (if applicable)
  - **Example**: `42`
  - **Link**: Will add "Closes #42" to PR

- **run_coderabbit**: `boolean`
  - **Description**: Run CodeRabbit pre-check before submitting
  - **Default**: `true`
  - **Recommendation**: Always true for first-time contributors

- **skip_tests**: `boolean`
  - **Description**: Skip local test execution (NOT RECOMMENDED)
  - **Default**: `false`
  - **Warning**: Only use if tests already passing

## Output

- **pr_url**: `string`
  - **Description**: URL of created pull request
  - **Example**: `"https://github.com/SynkraAI/aios-core/pull/123"`

- **pr_number**: `number`
  - **Description**: PR number
  - **Example**: `123`

- **branch_name**: `string`
  - **Description**: Created feature branch
  - **Example**: `"contrib/Squad-content-creator"`

- **coderabbit_report**: `object` (if run_coderabbit=true)
  - **Structure**: `{ issues_found, security_warnings, suggestions, review_url }`
  - **Description**: Pre-submission code review results

- **quality_score**: `number`
  - **Description**: Contribution quality score (0-100)
  - **Criteria**: Documentation, tests, code quality, adherence to standards

- **next_steps**: `array<string>`
  - **Description**: What happens next (review process, timeline)

## Process

### Phase 1: Pre-Submission Validation (3 min)

1. **Validate Contribution Path**
   - Check if files exist locally
   - Verify correct directory structure
   - Ensure naming conventions followed

2. **Validate Repository State**
   - Check if `aios-core` repository is set as upstream
   - Verify fork exists (or create one)
   - Ensure main branch is up-to-date

3. **Detect Contribution Type** (if not provided)
   - Scan modified files:
     - `Squads/*` → "Squad"
     - `aios-core/agents/*` → "agent"
     - `aios-core/tasks/*` → "task"
     - `aios-core/tools/*` → "tool"
     - `*.md` in docs → "documentation"
     - `*.test.js` or bug fixes → "bug-fix"

### Phase 2: Quality Pre-Check (5 min)

4. **Run Local Tests** (unless skip_tests=true)
   - Execute test suite: `npm test`
   - Check for failures
   - If failures: HALT and show errors

5. **Run CodeRabbit Pre-Check** (if run_coderabbit=true)
   - Execute: `coderabbit --prompt-only -t uncommitted`
   - Generate pre-submission review
   - Identify issues:
     - 🔴 **Critical**: Security, breaking changes, syntax errors
     - 🟠 **Important**: Best practices violations, missing tests
     - 🟡 **Suggestions**: Code style, performance tips

6. **Validate Contribution Standards**
   - Check against contribution guidelines:
     - [ ] **Squads**: Have README, agent.md, tasks/, proper structure
     - [ ] **Agents**: Follow agent template, have commands, dependencies
     - [ ] **Tasks**: Follow task format spec, have checklists, complete docs
     - [ ] **Tools**: Have tool definition YAML, usage examples
     - [ ] **Documentation**: Clear, well-formatted, no broken links

7. **Generate Quality Score**
   - **Documentation**: +30 points (README, inline comments, examples)
   - **Tests**: +25 points (test coverage, test quality)
   - **Code Quality**: +25 points (linting, CodeRabbit score)
   - **Standards Adherence**: +20 points (follows templates, naming conventions)
   - **Minimum Score**: 70/100 (RECOMMENDED for approval)

8. **Display Pre-Check Results**
   - Show quality score
   - List critical issues (must fix)
   - List important issues (should fix)
   - Suggest improvements

9. **User Confirmation**
   - Ask: "Quality Score: {score}/100. Proceed with PR creation? (yes/no/fix-issues)"
   - If "fix-issues": Provide guidance and re-run checks after fixes
   - If "no": Abort
   - If "yes": Continue

### Phase 3: Branch & Commit Preparation (2 min)

10. **Create Feature Branch**
    - Branch name format: `contrib/{contribution_type}-{brief-name}`
    - Example: `contrib/Squad-content-creator`
    - Ensure branch doesn't already exist

11. **Stage Changes**
    - Stage all files in `contribution_path`
    - Verify no unintended files included

12. **Create Commit**
    - Follow Conventional Commits:
      ```
      {type}({scope}): {description}
      
      {body}
      
      {footer}
      ```
    - **type**: `feat` (new feature), `fix` (bug fix), `docs` (documentation), `refactor`, etc.
    - **scope**: `Squad`, `agent`, `task`, `tool`, etc.
    - **Example**:
      ```
      feat(Squad): add content-creator pack with Instagram agent
      
      Implements a complete content creation squad with:
      - Instagram content specialist agent
      - 5 new tasks (create-post, schedule-content, analyze-performance, etc.)
      - Template library for posts, stories, reels
      
      Closes #42
      ```

### Phase 4: PR Creation (2 min)

13. **Push Branch to Fork**
    - Push to user's fork: `git push origin {branch_name}`
    - Wait for push to complete

14. **Generate PR Title & Description**
    - **Title**: Auto-generate from commit if not provided
    - **Description**: Use PR template:

      ```markdown
      ## Contribution Type
      
      - [x] {contribution_type}
      
      ## Description
      
      {brief_description}
      
      ## What's Changed
      
      {detailed_changes}
      
      ## Related Issue
      
      Closes #{issue_number} (if applicable)
      
      ## Checklist
      
      - [x] Follows contribution guidelines
      - [x] Tests passing locally
      - [x] Documentation included
      - [x] CodeRabbit pre-check passed
      - [x] Quality score: {score}/100
      
      ## Pre-Submission Review
      
      **CodeRabbit Score**: {coderabbit_score}
      **Issues Found**: {issues_found}
      **Security Warnings**: {security_warnings}
      
      {coderabbit_summary}
      
      ## Testing
      
      - [ ] Unit tests: {test_count} tests passing
      - [ ] Integration tests: {integration_status}
      - [ ] Manual testing: {manual_test_description}
      
      ## Screenshots (if UI changes)
      
      {screenshots if applicable}
      
      ---
      
      **First-time contributor?** Welcome! 🎉 This PR was created using AIOS PR Automation.
      ```

15. **Create Pull Request**
    - Use GitHub CLI:
      ```bash
      gh pr create \
        --repo SynkraAI/aios-core \
        --title "{title}" \
        --body "{description}" \
        --base main \
        --head {user}:{branch_name}
      ```
    - Capture PR URL and number

### Phase 5: Post-Submission (1 min)

16. **Add Labels** (automated by CI)
    - `contribution` - All community PRs
    - `{contribution_type}` - Type-specific label
    - `first-time-contributor` (if applicable)
    - `needs-review` - Awaiting maintainer review

17. **Request Reviewers** (automated)
    - CodeRabbit will auto-review within 2 minutes
    - Maintainers auto-assigned based on contribution type

18. **Provide Next Steps**
    - Display to user:
      ```
      ✅ Pull Request Created!
      
      PR #{pr_number}: {title}
      URL: {pr_url}
      
      Next Steps:
      1. ⏳ CodeRabbit will review your PR within 2 minutes
      2. 👤 Maintainers will review within 24-48 hours
      3. 💬 Respond to any feedback or questions
      4. ✅ Once approved, your contribution will be merged!
      
      Timeline:
      - CodeRabbit review: ~2 minutes
      - Maintainer review: 24-48 hours
      - Merge (if approved): Immediate
      
      Thank you for contributing to AIOS! 🚀
      ```

## Checklist

### Pre-conditions

- [ ] Contribution files exist locally
  - **Validation**: Files at `contribution_path` exist
  - **Error**: "Files not found at {contribution_path}"

- [ ] Fork of aios-core exists
  - **Validation**: `gh repo view {user}/aios-core` succeeds
  - **Action**: If not found, create fork automatically

- [ ] Main branch is up-to-date
  - **Validation**: `git fetch upstream && git diff upstream/main` is empty
  - **Action**: If behind, offer to sync: "Your fork is {N} commits behind. Sync now? (yes/no)"

- [ ] No uncommitted changes outside contribution_path
  - **Validation**: `git status --porcelain` shows only intended files
  - **Error**: "Unrelated uncommitted changes detected. Commit or stash first."

### Post-conditions

- [ ] Feature branch created and pushed
  - **Validation**: `gh api repos/{user}/{repo}/branches/{branch}` succeeds
  - **Test**: Branch visible on GitHub

- [ ] Pull request created
  - **Validation**: `gh pr view {pr_number}` succeeds
  - **Test**: PR URL accessible

- [ ] CodeRabbit review requested
  - **Validation**: CodeRabbit comments on PR within 5 minutes
  - **Manual Check**: true

- [ ] Quality score meets minimum (if enforced)
  - **Validation**: `quality_score >= 70`
  - **Warning**: "Quality score below recommended threshold. Consider improvements before submitting."

### Acceptance Criteria

- [ ] PR follows contribution guidelines
  - **Type**: acceptance
  - **Test**: Checklist in PR description completed

- [ ] PR has descriptive title and body
  - **Type**: acceptance
  - **Test**: Title >= 20 chars, body >= 100 chars

- [ ] Tests passing (CI)
  - **Type**: acceptance
  - **Test**: GitHub Actions CI checks green within 10 minutes

## Templates

### PR Template (Auto-Generated)

*See Phase 4, Step 14 for full template*

### Contribution Guidelines Reference

```markdown
## Contributing to AIOS

Thank you for your interest in contributing! 🎉

### Types of Contributions

- **Squads**: New agent ecosystems
- **Agents**: Improved or new agents
- **Tasks**: Enhanced or new tasks
- **Tools**: MCP tool integrations
- **Bug Fixes**: Code improvements
- **Documentation**: Docs, examples, tutorials

### Before You Submit

1. ✅ Read the [Contribution Guidelines](docs/CONTRIBUTING.md)
2. ✅ Run local tests: `npm test`
3. ✅ Run CodeRabbit pre-check: `coderabbit --prompt-only -t uncommitted`
4. ✅ Follow naming conventions and templates
5. ✅ Include documentation and examples

### PR Process

1. Fork the repository
2. Create a feature branch: `contrib/{type}-{name}`
3. Make your changes
4. Run quality checks
5. Submit PR with descriptive title/body
6. Respond to review feedback

### Review Timeline

- **CodeRabbit Review**: ~2 minutes (automated)
- **Maintainer Review**: 24-48 hours
- **Merge**: Immediate after approval

### Questions?

- Open an issue for discussion
- Join our Discord: [link]
- Read the docs: [link]
```

## Tools

- **github-cli**:
  - **Version**: 2.0.0
  - **Used For**: Create PRs, manage forks, interact with repository
  - **Required**: true

- **coderabbit-free**:
  - **Version**: Latest (GitHub App)
  - **Used For**: Pre-submission code review, quality analysis
  - **Cost**: $0 (FREE for open-source)
  - **Optional**: false (recommended for quality assurance)

## Performance

- **Duration Expected**: 15 minutes (including quality checks)
- **Cost Estimated**: $0 (all tools are free for open-source)
- **Cacheable**: false (each PR is unique)
- **Parallelizable**: false (sequential process)

## Error Handling

- **Strategy**: fallback + retry
- **Fallback**: If CodeRabbit fails, continue without pre-check (warn user)
- **Retry**:
  - **Max Attempts**: 3 (for network/API errors)
  - **Backoff**: exponential
  - **Backoff MS**: 2000
- **Abort Workflow**: false (let user fix issues and retry)
- **Notification**: log + console output

## Metadata

- **Story**: Epic 10 (Critical Dependency Resolution)
- **Version**: 1.0.0
- **Dependencies**: `github-cli`, `coderabbit-free`
- **Author**: Brad Frost Clone
- **Created**: 2025-11-13
- **Updated**: 2025-11-13
- **Breaking Changes**: None (new task)

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

## Task Definition (AIOS Task Format V1.0)

```yaml
task: prAutomation()
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


## Usage Examples

### Example 1: Submit New Squad

```bash
aios activate Otto  # github-devops agent
aios pr create \
  --type="Squad" \
  --path="Squads/content-creator/" \
  --issue=42
```

**Output**: Quality check → PR created → CodeRabbit reviews

### Example 2: Submit Agent Improvement

```bash
aios pr create \
  --type="agent" \
  --path="aios-core/agents/improved-po.md" \
  --title="feat(agent): enhance PO agent with story validation"
```

**Output**: Automated PR with proper formatting

### Example 3: Submit Bug Fix

```bash
aios pr create \
  --type="bug-fix" \
  --path="aios-core/tasks/create-next-story.md" \
  --title="fix(task): correct file path validation in create-next-story"
```

**Output**: Quick PR for urgent fix

---

## Quality Score Breakdown

**Total: 100 points**

### Documentation (30 points)
- [ ] README included (+10)
- [ ] Inline comments present (+10)
- [ ] Usage examples provided (+10)

### Tests (25 points)
- [ ] Unit tests included (+15)
- [ ] Integration tests included (+10)

### Code Quality (25 points)
- [ ] Linting passes (+10)
- [ ] CodeRabbit score >= 80 (+15)

### Standards Adherence (20 points)
- [ ] Follows task/agent/tool template (+10)
- [ ] Naming conventions correct (+5)
- [ ] Directory structure correct (+5)

**Minimum Recommended**: 70/100

---

**Related Tasks:**
- `ci-cd-configuration` - CI pipeline setup for quality gates
- `release-management` - Automated releases after merge
- `facilitate-brainstorming-session` - Ideate contributions with AI agents

