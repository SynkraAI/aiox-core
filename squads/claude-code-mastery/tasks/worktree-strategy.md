# Task: Git Worktree Isolation Strategy

**Task ID:** worktree-strategy
**Version:** 1.0
**Purpose:** Plan and configure git worktree isolation for multi-agent development scenarios
**Orchestrator:** @swarm-orchestrator (Nexus)
**Mode:** Interactive (elicit: true)
**Quality Standard:** Worktree lifecycle tested end-to-end, cleanup verified

---

## Overview

This task plans git worktree isolation for agent teams where multiple agents modify code simultaneously. Worktrees give each agent its own working directory and branch, eliminating merge conflicts during execution and deferring integration to a controlled merge phase.

```
INPUT (agents_count + shared_files_risk + merge_strategy)
    |
[PHASE 1: ISOLATION ASSESSMENT]
    -> Evaluate merge conflict risk
    -> Determine if worktree isolation is needed
    -> Identify alternative strategies
    |
[PHASE 2: BRANCH STRATEGY]
    -> Define branch naming convention
    -> Plan base branch selection
    -> Set up branch protection
    |
[PHASE 3: WORKTREE CONFIGURATION]
    -> Create worktrees for each agent
    -> Configure agent working directories
    -> Verify each worktree is functional
    |
[PHASE 4: LIFECYCLE MANAGEMENT]
    -> Define create -> work -> merge -> cleanup flow
    -> Set up automated cleanup triggers
    -> Plan stale worktree detection
    |
[PHASE 5: MERGE AND CLEANUP]
    -> Define merge order (dependency-aware)
    -> Handle merge conflicts
    -> Remove worktrees after successful merge
    |
OUTPUT: Worktree config + branch strategy + lifecycle plan
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| agent_count | number | From team topology | yes | Number of agents needing isolation |
| base_branch | string | Auto-detect or user | no | Branch to create worktrees from (default: current) |
| task_id | string | User | yes | Identifier for this parallel work session |
| shared_files | array | Analysis | no | Files that multiple agents might modify |
| auto_cleanup | boolean | User | no | Remove worktrees after merge (default: true) |

---

## Preconditions

1. Git repository is initialized and has at least one commit
2. Current working tree is clean (no uncommitted changes)
3. `git worktree` command is available (Git 2.5+)
4. Sufficient disk space for N copies of the working directory

---

## Phase 1: Isolation Assessment

**Goal:** Determine if worktree isolation is actually needed.

### When to Use Worktrees vs Shared Repo

| Scenario | Strategy | Reason |
|----------|----------|--------|
| Agents modify different files | **Shared repo** | No conflict risk, simpler setup |
| Agents modify same files | **Worktree** | Prevents runtime merge conflicts |
| Sequential pipeline (A then B) | **Shared repo** | No simultaneous writes |
| Parallel agents with file overlap | **Worktree** | Each agent needs clean state |
| Single agent with long-running task | **Shared repo** | No need for isolation |
| CI/CD parallel test execution | **Worktree** | Tests need independent environments |

### Steps

1.1. Analyze agent assignments from the team topology.
1.2. Build a file-ownership matrix:

```
         | Agent-A | Agent-B | Agent-C |
---------|---------|---------|---------|
file1.ts |   W     |   R     |         |
file2.ts |         |   W     |   W     |  <-- CONFLICT
file3.ts |   W     |         |         |
```

1.3. If any file has multiple W (write) entries, worktree isolation is recommended.
1.4. If no conflicts, document decision to use shared repo and SKIP remaining phases.

---

## Phase 2: Branch Strategy

**Goal:** Define how branches map to agents and worktrees.

### Branch Naming Convention

```
{task-id}/{agent-name}

Examples:
  feature-auth/code-reviewer
  feature-auth/test-writer
  feature-auth/docs-updater
```

### Steps

2.1. Define the base branch (where worktrees branch from):
   - Use current branch for story work
   - Use `main` for independent feature work

2.2. Create a branch plan:

```yaml
branches:
  base: "feature/auth-system"
  worktree_branches:
    - name: "feature/auth-system/api-agent"
      agent: "api-agent"
      files_owned: ["src/api/**"]
    - name: "feature/auth-system/test-agent"
      agent: "test-agent"
      files_owned: ["tests/**"]
    - name: "feature/auth-system/docs-agent"
      agent: "docs-agent"
      files_owned: ["docs/**"]
```

2.3. Verify no branch names conflict with existing branches.

---

## Phase 3: Worktree Configuration

**Goal:** Create and configure worktrees for each agent.

### Worktree Location

Worktrees are created as sibling directories to the main repo:

```
project/                    <-- main working tree
project-wt-api-agent/      <-- worktree for api-agent
project-wt-test-agent/     <-- worktree for test-agent
project-wt-docs-agent/     <-- worktree for docs-agent
```

### Steps

3.1. For each agent, create a worktree:

```bash
# Create branch and worktree together
git worktree add ../project-wt-{agent-name} -b {branch-name} {base-branch}
```

3.2. Verify each worktree is functional:

```bash
git worktree list
# Should show main + N worktrees
```

3.3. Configure each agent to use its worktree directory as working directory.
3.4. Install dependencies in each worktree if needed (e.g., `npm install`).

---

## Phase 4: Lifecycle Management

**Goal:** Define the full create-work-merge-cleanup lifecycle.

### Lifecycle Flow

```
CREATE                 WORK                    MERGE                CLEANUP
  |                     |                       |                    |
  Create worktree  ->  Agent works         ->  Merge branch    ->  Remove worktree
  Create branch        in isolation             to base             Delete branch
  Install deps         Commits to branch        Resolve conflicts   Verify clean
  |                     |                       |                    |
  [Automated]          [Agent-driven]          [Orchestrated]      [Automated]
```

### Steps

4.1. Document the lifecycle for this specific task:

```yaml
lifecycle:
  create:
    trigger: "Task start"
    steps: ["create worktree", "create branch", "install deps"]
    estimated_time: "1-3 min"
  work:
    trigger: "Agent activation"
    duration: "Variable"
    monitoring: "Progress file in shared location"
  merge:
    trigger: "All agents complete"
    order: ["api-agent", "test-agent", "docs-agent"]
    conflict_resolution: "manual"
  cleanup:
    trigger: "Merge complete + verified"
    steps: ["remove worktree", "delete branch"]
    auto: true
```

4.2. Define stale worktree detection:
   - Worktree with no commits in 24 hours = potentially stale
   - Worktree from deleted/merged branch = definitely stale
4.3. Set up cleanup command:

```bash
# Remove a specific worktree
git worktree remove ../project-wt-{agent-name}

# Prune stale worktree references
git worktree prune
```

---

## Phase 5: Merge and Cleanup

**Goal:** Safely merge all agent work back to the base branch.

### Merge Order

5.1. Merge in dependency order (agents whose work is depended on merge first):

```
1. api-agent    (no dependencies on other agents)
2. test-agent   (may import from api-agent's code)
3. docs-agent   (documents what api-agent + test-agent built)
```

5.2. For each merge:

```bash
# Switch to base branch
git checkout {base-branch}

# Merge agent branch
git merge {agent-branch} --no-ff -m "merge: {agent-name} work for {task-id}"

# If conflict:
#   1. Identify conflicting files
#   2. Resolve manually or with orchestrator guidance
#   3. Commit resolution
```

5.3. After all merges complete:
   - Run full test suite on merged result
   - If tests fail, identify which merge introduced the failure
   - Fix or revert as needed

5.4. Cleanup:

```bash
# Remove all worktrees for this task
git worktree remove ../project-wt-api-agent
git worktree remove ../project-wt-test-agent
git worktree remove ../project-wt-docs-agent

# Delete merged branches
git branch -d feature/auth-system/api-agent
git branch -d feature/auth-system/test-agent
git branch -d feature/auth-system/docs-agent

# Prune any lingering references
git worktree prune
```

---

## Output Format

```yaml
worktree_strategy_result:
  isolation_needed: true
  reason: "2 agents modify overlapping files in src/"
  worktrees:
    - agent: "api-agent"
      path: "../project-wt-api-agent"
      branch: "feature/auth-system/api-agent"
      status: "created"
    - agent: "test-agent"
      path: "../project-wt-test-agent"
      branch: "feature/auth-system/test-agent"
      status: "created"
  merge_order: ["api-agent", "test-agent"]
  auto_cleanup: true
  lifecycle_documented: true
```

---

## Veto Conditions

| Condition | Action |
|-----------|--------|
| Git repository has no commits | HALT -- initialize repo first |
| Uncommitted changes in working tree | HALT -- commit or stash before creating worktrees |
| Disk space insufficient for N worktrees | HALT -- estimate ~size of repo per worktree |
| Git version < 2.5 | HALT -- upgrade git for worktree support |
| No file conflicts detected between agents | SKIP -- use shared repo instead (simpler) |
| Worktree creation fails | HALT -- check git lock files and existing worktrees |
