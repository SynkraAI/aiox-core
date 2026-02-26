# GitHub Issue Triage

## Task Metadata

```yaml
id: github-issue-triage
name: GitHub Issue Triage
agent: devops
elicit: true
category: repository-management
story: GHIM-001
```

## Description

Systematic triage of GitHub issues for the aios-core repository. This task guides @devops through the process of reviewing, classifying, and labeling open issues.

## Prerequisites

- GitHub CLI authenticated (`gh auth status`)
- Label taxonomy deployed (see GHIM-001 Phase 1)
- Access to repository issue list

## Workflow

### Step 1: List Untriaged Issues

```bash
gh issue list --label "status: needs-triage" --json number,title,labels,createdAt,author --limit 50
```

### Step 2: Per-Issue Triage (Interactive)

For each issue, apply the triage checklist:

1. **Read the issue** — Open and understand the content
2. **Classify type** — Apply ONE `type:` label:
   - `type: bug` — Something isn't working
   - `type: feature` — New feature request
   - `type: enhancement` — Improvement to existing feature
   - `type: docs` — Documentation issue
   - `type: test` — Test coverage
   - `type: chore` — Maintenance/cleanup
3. **Assess priority** — Apply ONE `priority:` label:
   - `priority: P1` — Critical, blocks users (SLA: 24h response)
   - `priority: P2` — High, affects most users (SLA: 3 days)
   - `priority: P3` — Medium, affects some users (SLA: 1 week)
   - `priority: P4` — Low, edge cases (backlog)
4. **Assign area** — Apply ONE or more `area:` labels:
   - `area: core`, `area: installer`, `area: synapse`, `area: cli`
   - `area: pro`, `area: health-check`, `area: docs`, `area: devops`
5. **Update status** — Replace `status: needs-triage` with appropriate status:
   - `status: confirmed` — Valid issue, ready for work
   - `status: needs-info` — Need more details from reporter
6. **Check for duplicates** — If duplicate, label `duplicate` and close with reference
7. **Community labels** — If appropriate, add `community: good first issue` or `community: help wanted`

### Step 3: Apply Labels

```bash
gh issue edit {number} --add-label "type: bug,priority: P2,area: installer,status: confirmed" --remove-label "status: needs-triage"
```

### Step 4: Batch Triage (Optional)

For bulk operations, use the triage script:

```bash
node .aios-core/development/scripts/issue-triage.js --list
node .aios-core/development/scripts/issue-triage.js --apply {number} --type bug --priority P2 --area installer
```

### Step 5: Report

After triage session, generate summary:

```bash
node .aios-core/development/scripts/issue-triage.js --report
```

## Triage Decision Tree

```
Issue received
  ├── Is it a duplicate? → Label "duplicate", close with reference
  ├── Is it spam/invalid? → Label "status: invalid", close
  ├── Needs more info? → Label "status: needs-info", comment asking for details
  └── Valid issue
       ├── Bug → "type: bug" + priority + area
       ├── Feature → "type: feature" + priority + area
       ├── Enhancement → "type: enhancement" + priority + area
       ├── Docs → "type: docs" + priority: P3/P4
       └── Tests → "type: test" + area
```

## Priority Guidelines

| Signal | Priority |
|--------|----------|
| Blocks installation/usage for all users | P1 |
| Breaks core functionality, no workaround | P1 |
| Significant bug with workaround | P2 |
| Feature highly requested by community | P2 |
| Minor bug, edge case | P3 |
| Nice-to-have improvement | P3 |
| Cosmetic, low impact | P4 |

## Command Integration

This task is invocable via @devops:
- `*triage` — Start interactive triage session
- `*triage --batch` — Run batch triage with script

## Output

- All issues labeled with `type:`, `priority:`, `area:` labels
- `status: needs-triage` removed from all triaged issues
- Triage report with summary of actions taken
