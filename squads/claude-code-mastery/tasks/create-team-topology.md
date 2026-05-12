# Task: Design Agent Team Configuration

**Task ID:** create-team-topology
**Version:** 1.0
**Purpose:** Design and configure a multi-agent team with defined topology, roles, and communication patterns
**Orchestrator:** @swarm-orchestrator (Nexus)
**Mode:** Interactive (elicit: true)
**Quality Standard:** Team topology tested with dry-run, all agents load successfully

---

## Overview

This task designs an Agent Team configuration where multiple subagents collaborate on a workload. It covers topology selection, role definition, communication patterns, and isolation strategies.

```
INPUT (workload_description + team_size + isolation_needs)
    |
[PHASE 1: WORKLOAD DECOMPOSITION]
    -> Analyze the workload for parallelizable units
    -> Identify shared state requirements
    -> Determine coordination needs
    |
[PHASE 2: ROLE DEFINITION]
    -> Define each agent's responsibility
    -> Assign models per role
    -> Set tool permissions per agent
    |
[PHASE 3: AGENT FILE CREATION]
    -> Create .claude/agents/{name}.md for each member
    -> Configure frontmatter (name, model, tools)
    -> Write role-specific instructions
    |
[PHASE 4: TOPOLOGY DESIGN]
    -> Select topology pattern
    -> Define communication flow
    -> Set max_turns per agent
    |
[PHASE 5: COMMUNICATION PATTERNS]
    -> Define handoff protocol between agents
    -> Set up shared context (files, directories)
    -> Configure completion criteria
    |
[PHASE 6: COMPLETION CRITERIA]
    -> Define what "done" means for each agent
    -> Define what "done" means for the team
    -> Plan output aggregation
    |
OUTPUT: Agent team files + topology diagram + communication spec
```

---

## Inputs

| Field | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| workload_description | string | User | yes | Clear description of the full task |
| team_size | number | User or auto | no | Suggested number of agents (default: auto-detect) |
| isolation_mode | enum | User | no | shared (default) / worktree / none |
| topology_preference | enum | User | no | hub-spoke / pipeline / peer / auto |
| max_budget | string | User | no | Cost constraint (e.g., "keep it cheap") |

---

## Preconditions

1. `.claude/agents/` directory exists
2. Workload is clearly defined and scoped
3. At least 2 distinct subtasks identified in the workload

---

## Phase 1: Workload Decomposition

**Goal:** Break the workload into agent-sized units.

### Steps

1.1. Analyze the workload description for distinct, separable concerns.
1.2. Identify which subtasks can run in parallel vs sequentially.
1.3. Map shared resources (files, databases, APIs) across subtasks.
1.4. Determine minimum team size based on distinct concerns.

### Decomposition Checklist

- [ ] Each subtask has a single clear responsibility
- [ ] Dependencies between subtasks are identified
- [ ] Shared state conflicts are documented
- [ ] Parallelization opportunities are marked

---

## Phase 2: Role Definition

**Goal:** Assign clear roles to each agent.

### Steps

2.1. For each subtask, define an agent role:

```yaml
roles:
  - name: "{role-name}"
    responsibility: "{what this agent does}"
    inputs: "{what it receives}"
    outputs: "{what it produces}"
    model: "{opus|sonnet|haiku}"
    tools: ["{tool1}", "{tool2}"]
```

2.2. Assign models based on task complexity:
   - Coordinator/orchestrator: sonnet (needs judgment, not deep analysis)
   - Complex analysis: opus (architecture, security review)
   - Code generation: sonnet (standard implementation)
   - Simple tasks: haiku (formatting, data extraction)

2.3. Verify no two agents have overlapping responsibilities.

---

## Phase 3: Agent File Creation

**Goal:** Create the agent definition files.

### Steps

3.1. For each role from Phase 2, create `.claude/agents/{role-name}.md`.
3.2. Use the create-agent-definition task format for each file.
3.3. Include team-specific instructions in each agent:
   - What other agents exist on the team
   - Where to write outputs (shared directory)
   - How to signal completion

---

## Phase 4: Topology Design

**Goal:** Select the right topology for agent interaction.

### Topology Comparison

| Topology | Structure | Best For | Coordination Cost |
|----------|-----------|----------|-------------------|
| **Hub-and-Spoke** | One coordinator dispatches to specialists | Mixed tasks, varied complexity | Medium |
| **Pipeline** | Agent A output feeds Agent B input | Sequential processing, data transformation | Low |
| **Peer** | All agents work independently, merge at end | Embarrassingly parallel tasks | Low |
| **Hierarchical** | Multi-level coordinators with sub-teams | Large complex projects | High |

### Selection Decision

```
Are subtasks independent with no shared state?
  YES -> Peer topology
  NO  -> Do subtasks form a sequential chain?
    YES -> Pipeline topology
    NO  -> Is there one "brain" coordinating specialists?
      YES -> Hub-and-Spoke topology
      NO  -> Hierarchical topology
```

4.1. Select topology based on decomposition analysis.
4.2. Document the topology with an ASCII diagram.
4.3. Set `max_turns` guidance per agent:
   - Simple tasks: 5-10 turns
   - Standard tasks: 15-25 turns
   - Complex tasks: 30-50 turns

---

## Phase 5: Communication Patterns

**Goal:** Define how agents share information.

### Communication Strategies

| Strategy | Mechanism | Isolation Level |
|----------|-----------|----------------|
| **File-based** | Agents write to shared directory | Low (same repo) |
| **Worktree** | Each agent has its own git worktree | High (separate working trees) |
| **Branch** | Agents work on separate branches | Medium (same repo, different branches) |

### Steps

5.1. Define a shared output directory (e.g., `.claude/team-output/{task-id}/`).
5.2. Define handoff format (how one agent signals completion):
   - Write a `{agent-name}-done.md` file with summary and outputs
   - Or write to a shared `progress.yaml` file
5.3. Define conflict resolution if agents might modify the same files:
   - Use worktree isolation for high-risk scenarios
   - Use file-level ownership for medium-risk
   - Use merge-at-end for low-risk

---

## Phase 6: Completion Criteria

**Goal:** Define what "done" means.

### Steps

6.1. For each agent, define completion as:
   - Output files written
   - Quality check passed (lint, test, etc.)
   - Completion signal sent

6.2. For the team, define completion as:
   - All agents report done
   - Outputs aggregated
   - Integration test passed (if applicable)

6.3. Define failure handling:
   - Agent fails -> retry once, then escalate to coordinator
   - Coordinator fails -> escalate to human
   - Timeout -> kill agent, report partial results

---

## Output Format

```yaml
team_topology_result:
  topology: "{hub-spoke|pipeline|peer|hierarchical}"
  agents:
    - name: "{agent-1}"
      file: ".claude/agents/{agent-1}.md"
      model: "sonnet-4"
      role: "{responsibility}"
    - name: "{agent-2}"
      file: ".claude/agents/{agent-2}.md"
      model: "haiku-4"
      role: "{responsibility}"
  communication:
    strategy: "{file-based|worktree|branch}"
    shared_dir: ".claude/team-output/{task-id}/"
    handoff_format: "completion-file"
  completion:
    all_agents_done: true
    outputs_aggregated: true
  diagram: |
    [Coordinator]
        |
    +---+---+
    |       |
    [A1]   [A2]
```

---

## Veto Conditions

| Condition | Action |
|-----------|--------|
| Workload cannot be decomposed into 2+ distinct subtasks | HALT -- single agent is sufficient |
| Team size exceeds 6 agents | HALT -- decompose into sub-teams first |
| All agents need write access to the same files | HALT -- redesign with file ownership or worktree isolation |
| No clear completion criteria defined | HALT -- define "done" before creating team |
| Model costs exceed stated budget constraint | HALT -- downgrade models or reduce team size |
