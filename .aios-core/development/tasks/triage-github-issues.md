# triage-github-issues.md

**Task**: GitHub Issues Triage & Prioritization

**Purpose**: Analyze open GitHub issues, classify by type/severity/effort, prioritize based on impact, and recommend resolution order to the user.

**When to use**: Periodically or when user asks to review the issue backlog, via `@devops *triage-issues` or user request like "what issues should we resolve next?".

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Fetch, classify, and present prioritized list
- Minimal user interaction
- **Best for:** Quick overview of issue backlog

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Present classification, ask user for priority adjustments
- Discuss trade-offs between quick wins vs high-impact
- **Best for:** Sprint planning, deciding next work

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Deep analysis of each issue with cross-references
- Dependency mapping between issues
- **Best for:** Major backlog grooming sessions

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: triageGithubIssues()
responsavel: Gage (Operator)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: filters
  tipo: object
  origem: User Input
  obrigatorio: false
  validacao: |
    Optional filters: { state: 'open', labels: [], assignee: '', limit: 30 }
  default: { state: 'open', limit: 30 }

- campo: mode
  tipo: string
  origem: User Input
  obrigatorio: false
  validacao: yolo|interactive|pre-flight

**Saida:**
- campo: triage_report
  tipo: object
  destino: User Display
  persistido: false
  formato: |
    Tabela priorizada com: issue#, titulo, tipo, severidade, esforco, recomendacao

- campo: recommended_next
  tipo: array
  destino: User Display
  persistido: false
  formato: |
    Top 3-5 issues recomendados para resolver em ordem
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] GitHub CLI authenticated (gh auth status)
    tipo: pre-condition
    blocker: true
    validacao: |
      Run: gh auth status
      Must show authenticated user
    error_message: "GitHub CLI not authenticated. Run: gh auth login"

  - [ ] Repository has GitHub remote configured
    tipo: pre-condition
    blocker: true
    validacao: |
      Run: git remote -v
      Must show github.com remote
    error_message: "No GitHub remote found. Add with: git remote add origin <url>"
```

---

## Workflow Steps

### Phase 1: Fetch Issues

```bash
# Fetch all open issues with labels and metadata
gh issue list --state open --limit 50 --json number,title,labels,createdAt,updatedAt,comments,assignees,milestone

# Also check for stale issues (>90 days without activity)
gh issue list --state open --limit 50 --json number,title,updatedAt --jq '.[] | select(.updatedAt < (now - 7776000 | todate))'
```

### Phase 2: Classify Each Issue

For each issue, determine:

| Dimension | Values | How to Determine |
|-----------|--------|-----------------|
| **Type** | BUG, FEATURE, ENHANCEMENT, DOCS, CHORE, SECURITY | From labels + title keywords + issue body |
| **Severity** | P0-Critical, P1-High, P2-Medium, P3-Low, P4-Cosmetic | Impact on users, workaround availability |
| **Effort** | XS (<1h), S (1-4h), M (4-8h), L (1-2d), XL (>2d) | Files affected, complexity, research needed |
| **Impact** | HIGH, MEDIUM, LOW | Users affected x frequency x severity |
| **Quick Win** | YES/NO | Effort <= S AND Severity >= P2 |

**Classification Heuristics:**

```yaml
type_detection:
  BUG: title contains "bug", "broken", "error", "fix", "crash", "fail"
  SECURITY: title contains "security", "vulnerability", "CVE", labels include "security"
  DOCS: title contains "docs", "documentation", "readme", labels include "documentation"
  CHORE: title contains "chore", "cleanup", "refactor", "rename", "update"
  FEATURE: title contains "feat", "add", "implement", "new"
  ENHANCEMENT: title contains "improve", "enhance", "optimize", "better"

severity_detection:
  P0: labels include "critical", body mentions "production down" or "data loss"
  P1: labels include "high", "important", type is SECURITY
  P2: labels include "medium", type is BUG without workaround
  P3: labels include "low", type is ENHANCEMENT
  P4: type is DOCS or CHORE with no user impact

effort_estimation:
  - Read issue body for scope indicators
  - Check if issue references specific files/modules
  - Check if similar issues were resolved (time taken)
  - Consider: research needed? multiple files? tests required? installer changes?
```

### Phase 3: Prioritize

**Priority Score Formula:**

```
priority_score = (severity_weight * 3) + (impact_weight * 2) + (quick_win_bonus) - (effort_penalty)

severity_weight: P0=10, P1=8, P2=5, P3=3, P4=1
impact_weight: HIGH=10, MEDIUM=5, LOW=2
quick_win_bonus: YES=5, NO=0
effort_penalty: XS=0, S=1, M=3, L=5, XL=8
```

**Priority Tiers:**

| Tier | Score Range | Action |
|------|------------|--------|
| **NOW** | >= 30 | Resolve immediately (P0/P1, security) |
| **NEXT** | 20-29 | Resolve in current sprint |
| **SOON** | 10-19 | Schedule for next sprint |
| **BACKLOG** | < 10 | Keep in backlog, review monthly |

### Phase 4: Present to User

**Output Format:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GitHub Issues Triage Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Repository: {owner}/{repo}
Open Issues: {count}
Date: {date}

NOW (resolve immediately):
  #123 [BUG/P1] Agent files not recognized by Copilot    S  ← Quick Win
  #456 [SECURITY/P0] Exposed credentials in config       M

NEXT (current sprint):
  #789 [BUG/P2] Submodule blocks push after merge        M
  #101 [ENHANCEMENT/P2] Add batch rename support          S  ← Quick Win

SOON (next sprint):
  #202 [FEATURE/P3] English README                        L
  #303 [DOCS/P3] Update API documentation                 S

BACKLOG:
  #404 [CHORE/P4] Remove deprecated methods               XS
  ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Recommendation: Start with #{top_issue} ({reason}).
Pick an issue number to investigate, or say "resolve #N".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Phase 5: User Decision

**elicit: true**

Present the triage report and wait for user to:
1. Select an issue to investigate → hand off to `*resolve-issue {number}`
2. Adjust priorities → re-sort and present again
3. Close stale issues → `gh issue close {number} --comment "Closing as stale"`
4. Request more detail on specific issue → `gh issue view {number}`

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] All open issues classified with type, severity, and effort
    tipo: post-condition
    blocker: false
    validacao: |
      Every issue in report has Type, Severity, and Effort columns filled

  - [ ] Priority ranking presented to user
    tipo: post-condition
    blocker: true
    validacao: |
      User has seen the prioritized triage report

  - [ ] User has selected next action (resolve, close, or defer)
    tipo: post-condition
    blocker: false
    validacao: |
      User has made a decision on at least one issue
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Triage report covers all open issues (or up to limit)
    tipo: acceptance-criterion
    blocker: true

  - [ ] Each issue has type, severity, effort, and priority tier
    tipo: acceptance-criterion
    blocker: true

  - [ ] Quick wins are clearly identified
    tipo: acceptance-criterion
    blocker: true

  - [ ] User-facing output is a clean, scannable table
    tipo: acceptance-criterion
    blocker: true
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** gh (GitHub CLI)
  - **Purpose:** Fetch issues, labels, comments, close stale issues
  - **Source:** System CLI
  - **Required:** true

- **Tool:** git
  - **Purpose:** Detect repository remote URL
  - **Source:** System CLI
  - **Required:** true

---

## Error Handling

**Strategy:** graceful-fallback

**Common Errors:**

1. **Error:** GitHub CLI not authenticated
   - **Cause:** `gh` not logged in
   - **Resolution:** Run `gh auth login`
   - **Recovery:** Prompt user to authenticate

2. **Error:** Rate limit exceeded
   - **Cause:** Too many API calls
   - **Resolution:** Wait and retry, or use `--limit` to reduce scope
   - **Recovery:** Present partial results

3. **Error:** No open issues
   - **Cause:** Repository has no open issues
   - **Resolution:** Report clean backlog
   - **Recovery:** Suggest checking closed issues or creating new ones

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 1-3 min
cost_estimated: $0.001-0.005
token_usage: ~2,000-5,000 tokens
```

---

## Metadata

```yaml
story: N/A (operational task)
version: 1.0.0
dependencies:
  tasks: []
  checklists: []
  templates: []
  tools:
    - gh (GitHub CLI)
    - git
tags:
  - devops
  - issue-management
  - triage
  - backlog
created_at: 2026-02-21
updated_at: 2026-02-21
related_tasks:
  - resolve-github-issue.md
```

---

## Integration with @devops Agent

Called via `@devops *triage-issues` command or user request to analyze the issue backlog.

**Handoff:** When user selects an issue to resolve, hand off to `*resolve-issue {number}`.
