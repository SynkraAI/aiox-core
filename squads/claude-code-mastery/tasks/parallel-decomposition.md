# Task: Parallel Task Decomposition for Agent Execution

**Task ID:** parallel-decomposition
**Version:** 1.0
**Purpose:** Decompose a complex task into subtasks for parallel multi-agent execution
**Orchestrator:** @swarm-orchestrator (Nexus)
**Mode:** Interactive (elicit: true)
**Quality Standard:** Dependency graph validated, no circular dependencies, merge strategy tested

---

## Overview

This task analyzes a workload, identifies independent subtasks, designs a parallel execution plan, and configures agents for simultaneous execution. The key insight: **maximum parallelism comes from minimizing dependencies, not maximizing agents**.

```
INPUT (task_description + constraints)
    |
[PHASE 1: TASK ANALYSIS]
    -> Break task into atomic subtasks
    -> Classify each subtask's complexity
    -> Estimate execution time per subtask
    |
[PHASE 2: DEPENDENCY MAPPING]
    -> Identify data dependencies between subtasks
    -> Identify resource conflicts (same files, same APIs)
    -> Build dependency graph
    |
[PHASE 3: EXECUTION PLAN]
    -> Group independent subtasks into waves
    -> Assign agents to each wave
    -> Configure foreground vs background execution
    |
[PHASE 4: AGENT CONFIGURATION]
    -> Create or select agent definitions
    -> Set model tiers per subtask complexity
    -> Configure tool permissions
    |
[PHASE 5: MERGE STRATEGY]
    -> Define how agent outputs combine
    -> Handle conflicting changes
    -> Plan integration verification
    |
[PHASE 6: MONITORING]
    -> Set up progress tracking
    -> Define timeout thresholds
    -> Plan failure recovery
    |
OUTPUT: Execution plan + dependency graph + agent configs + merge strategy
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| task_description | string | User | yes | Full description of the work to parallelize |
| max_parallel_agents | number | User or default | no | Maximum simultaneous agents (default: 4) |
| isolation_mode | enum | User | no | shared / worktree / branch (default: shared) |
| time_constraint | string | User | no | Target completion time |
| cost_constraint | enum | User | no | low / medium / high (affects model selection) |

---

## Preconditions

1. Task is large enough to benefit from parallelization (2+ independent subtasks)
2. Claude Code is operational with Agent tool available
3. Sufficient API rate limits for parallel agent calls
4. Git repository is clean (no uncommitted changes) if using worktree isolation

---

## Phase 1: Task Analysis

**Goal:** Break the task into the smallest independent units of work.

### Steps

1.1. Read the full task description.
1.2. Identify atomic subtasks -- each should be:
   - Completable by a single agent
   - Testable independently
   - Producing a clear output artifact
1.3. Classify each subtask:

| Complexity | Lines of Change | Model | Estimated Time |
|------------|----------------|-------|----------------|
| Trivial | < 20 lines | haiku | 1-2 min |
| Simple | 20-100 lines | sonnet | 3-5 min |
| Standard | 100-500 lines | sonnet | 5-15 min |
| Complex | 500+ lines | opus | 15-30 min |

1.4. Create a subtask inventory table:

```markdown
| ID | Subtask | Complexity | Est. Time | Dependencies |
|----|---------|-----------|-----------|--------------|
| S1 | ...     | simple    | 3 min     | none         |
| S2 | ...     | standard  | 10 min    | S1           |
```

---

## Phase 2: Dependency Mapping

**Goal:** Build a dependency graph to identify parallelization opportunities.

### Dependency Types

| Type | Description | Impact |
|------|-------------|--------|
| **Data** | S2 needs output from S1 | Must sequence |
| **Resource** | S1 and S3 modify same file | Must sequence or isolate |
| **Semantic** | S2 should know what S1 decided | Can use shared context file |
| **None** | S1 and S4 are fully independent | Can parallelize |

### Steps

2.1. For each subtask pair, determine dependency type.
2.2. Build a dependency graph:

```
Dependency Graph Template:

S1 -----> S3 -----> S5
  \                 ^
   \               /
S2 -----> S4 -----

Legend: Arrow = "must complete before"
Parallel: {S1, S2} can run together
Sequential: S3 waits for S1, S4 waits for S2
Join: S5 waits for S3 and S4
```

2.3. Detect circular dependencies (VETO if found).
2.4. Calculate critical path (longest sequential chain).

---

## Phase 3: Execution Plan

**Goal:** Group subtasks into parallel execution waves.

### Parallelization Patterns

| Pattern | Description | Use When |
|---------|-------------|----------|
| **Fan-Out/Fan-In** | Dispatch N agents, collect all results | Independent subtasks with shared merge |
| **Pipeline** | Chain agents A -> B -> C | Sequential transformation |
| **Scatter-Gather** | Dispatch same task to N agents, pick best | Need diverse approaches to same problem |
| **Wave** | Groups of parallel tasks with sync points | Mixed dependencies |

### Wave Planning

3.1. Assign subtasks to waves based on dependency graph:

```
Wave 1: [S1, S2]     -- no dependencies, run parallel
Wave 2: [S3, S4]     -- depend on Wave 1, run parallel
Wave 3: [S5]         -- depends on Wave 2
```

3.2. For each wave, determine execution mode:

| Mode | Mechanism | When to Use |
|------|-----------|-------------|
| **Background** | Agent tool with background flag | Fire-and-forget subtasks |
| **Foreground** | Sequential Agent tool calls | Need result before next step |
| **Parallel foreground** | Multiple Agent calls in same message | Independent subtasks, need all results |

3.3. Document the execution timeline:

```
Time ->
  [==S1==]  [====S3====]  [==S5==]
  [===S2===]  [==S4==]
```

---

## Phase 4: Agent Configuration

**Goal:** Create or assign agents for each subtask.

### Steps

4.1. For each subtask, decide:
   - Use existing agent definition? (search `.claude/agents/`)
   - Create new agent? (use create-agent-definition task)
   - Use generic Agent tool with inline prompt?

4.2. Configure model per subtask based on complexity from Phase 1.
4.3. Set tool permissions -- restrict to minimum needed:
   - Read-only subtasks: Explore-type agent
   - Code modification: General-purpose with Write/Edit
   - Research: Explore-type with Bash for web tools

4.4. Set `max_turns` per agent based on complexity:
   - Trivial: 5 turns
   - Simple: 10 turns
   - Standard: 20 turns
   - Complex: 40 turns

---

## Phase 5: Merge Strategy

**Goal:** Define how parallel agent outputs combine into a final result.

### Merge Strategies

| Strategy | Description | Conflict Risk |
|----------|-------------|--------------|
| **File ownership** | Each agent owns specific files | None |
| **Directory ownership** | Each agent owns a directory | None |
| **Git merge** | Each agent on a branch, merge at end | Medium |
| **Manual review** | Human reviews and merges | Low (but slow) |
| **Automated merge** | Script merges outputs by convention | Low |

### Steps

5.1. Assign file/directory ownership to each agent.
5.2. Define the merge process:
   - Collect outputs from all agents
   - Verify no conflicts (same file modified by 2+ agents)
   - If conflicts exist, apply resolution strategy
   - Run integration tests on merged result
5.3. If using worktree isolation, plan the branch merge sequence.

---

## Phase 6: Monitoring

**Goal:** Track progress and handle failures.

### Steps

6.1. Define progress checkpoints:
   - Each agent writes status to a shared progress file
   - Wave completion triggers next wave
6.2. Set timeout thresholds per subtask (2x estimated time).
6.3. Define failure handling:
   - Agent timeout: Kill and report partial results
   - Agent error: Retry once with same config
   - Repeated failure: Escalate to human
6.4. Plan rollback if merge fails:
   - Revert to pre-execution state
   - Report which subtasks succeeded vs failed

---

## Output Format

```yaml
parallel_decomposition_result:
  total_subtasks: 5
  total_waves: 3
  estimated_sequential_time: "35 min"
  estimated_parallel_time: "15 min"
  speedup: "2.3x"
  critical_path: ["S1", "S3", "S5"]
  waves:
    - wave: 1
      subtasks: ["S1", "S2"]
      mode: "parallel-foreground"
    - wave: 2
      subtasks: ["S3", "S4"]
      mode: "parallel-foreground"
    - wave: 3
      subtasks: ["S5"]
      mode: "foreground"
  merge_strategy: "file-ownership"
  agents_created: [...]
  dependency_graph: |
    S1 -> S3 -> S5
    S2 -> S4 -> S5
```

---

## Veto Conditions

| Condition | Action |
|-----------|--------|
| Circular dependency detected in graph | HALT -- restructure subtasks to break cycle |
| All subtasks are sequentially dependent | HALT -- no parallelization benefit, use single agent |
| Subtask count exceeds 10 | HALT -- group into higher-level units first |
| Multiple agents must write to same file | HALT -- redesign with file ownership or worktree |
| Critical path time exceeds time constraint | WARN -- consider decomposing critical path subtasks further |
| Estimated cost exceeds budget | HALT -- downgrade models or reduce parallelism |
