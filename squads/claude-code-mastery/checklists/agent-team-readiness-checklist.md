# Agent Team Readiness Checklist

**Checklist ID:** CCM-CL-003
**Referenced by:** swarm-orchestrator
**Purpose:** Pre-spawn validation before launching parallel or sequential agent teams. Ensures task decomposition is sound, agents are configured, isolation is planned, and failure recovery is defined.

[[LLM: INITIALIZATION INSTRUCTIONS - AGENT TEAM READINESS

This checklist validates that a multi-agent execution plan is safe
to launch. It prevents wasted compute, merge conflicts, and orphaned
work by catching configuration issues before any agent spawns.

EXECUTION APPROACH:
1. Review the task decomposition plan
2. Validate each agent's configuration and tool access
3. Confirm isolation strategy prevents conflicts
4. Verify resource limits and cost estimates
5. Ensure communication and merge strategies are defined
6. All CRITICAL items must pass before any agent spawns

Spawning agents without validation creates expensive cleanup work.]]

---

## 1. Task Decomposition

- [ ] All subtasks are identified with clear scope boundaries (CRITICAL)
- [ ] Dependencies between subtasks are mapped (which must finish before others start)
- [ ] No circular dependencies exist between subtasks (CRITICAL)
- [ ] Each subtask has a single responsible agent assigned
- [ ] Subtask outputs are well-defined (files, artifacts, status reports)
- [ ] Estimated complexity per subtask is documented (small/medium/large)
- [ ] Parallel-safe subtasks are identified (no shared file modifications)

## 2. Agent Configuration

- [ ] Agent definition files (.md) exist for every assigned agent (CRITICAL)
- [ ] Model selection is appropriate for each agent's task complexity
- [ ] Tool restrictions match each agent's needs (no unnecessary tool access)
- [ ] Agent personas do not conflict with subtask requirements
- [ ] System prompts or CLAUDE.md content is compatible with agent roles
- [ ] Each agent has access to the specific files it needs to read/modify

## 3. Isolation Strategy

- [ ] Worktree vs shared workspace decision is made and documented (CRITICAL)
- [ ] Branch naming convention defined (e.g., agent/{agent-id}/{subtask-id})
- [ ] If shared workspace: file-level locking strategy defined to prevent conflicts
- [ ] If worktree isolation: base branch for each worktree identified
- [ ] Agents working on the same codebase have non-overlapping file scopes
- [ ] Temporary files and build artifacts have agent-specific paths

## 4. Resource Planning

- [ ] max_turns is set for each agent to prevent runaway execution (CRITICAL)
- [ ] Background vs foreground execution decided per agent
- [ ] Total estimated cost calculated across all agents
- [ ] Cost ceiling defined (max spend before halting)
- [ ] Timeout limits set for each agent spawn
- [ ] Memory/context budget per agent assessed (large codebases may hit limits)

## 5. Communication Plan

- [ ] How agents share intermediate results is defined (files, status files, stdout)
- [ ] Merge strategy for combining agent outputs is documented (CRITICAL)
- [ ] Conflict resolution procedure exists for overlapping changes
- [ ] Status reporting mechanism defined (polling, completion files, events)
- [ ] Final integration point identified (which agent or process merges everything)
- [ ] Handoff artifacts between sequential agents are specified

## 6. Rollback Plan

- [ ] What happens if an individual agent fails is defined (CRITICAL)
- [ ] Cleanup procedure for failed agent's partial work is documented
- [ ] Other agents can continue independently if one fails (graceful degradation)
- [ ] Worktree cleanup command is prepared for post-execution
- [ ] Git state can be restored to pre-spawn baseline if entire team fails
- [ ] Orphaned branch detection and cleanup is planned

---

## PASS/FAIL Criteria

**PASS:** All items marked (CRITICAL) are checked. All agents have valid definitions. Task decomposition has no circular dependencies. Merge strategy is documented.

**FAIL:** Any (CRITICAL) item unchecked. Missing agent definition file. Circular dependency detected. No merge strategy defined.

**Action on FAIL:** Fix all critical gaps before spawning any agent. If task decomposition has circular dependencies, restructure the plan. If agent definitions are missing, create them first.
