# Multi-Agent Review Checklist

**Checklist ID:** CCM-CL-004
**Referenced by:** swarm-orchestrator
**Purpose:** Post-completion validation after an agent team finishes work. Ensures all outputs are present, merged without conflict, meet quality standards, and all temporary resources are cleaned up.

[[LLM: INITIALIZATION INSTRUCTIONS - MULTI-AGENT REVIEW

This checklist validates the combined output of a multi-agent execution.
Run this AFTER all agents have completed or timed out.

EXECUTION APPROACH:
1. Verify every agent returned a result (or document why it did not)
2. Check for merge conflicts between agent outputs
3. Validate each output against its acceptance criteria
4. Clean up all worktrees, branches, and temporary artifacts
5. Run integration tests on the combined result
6. All CRITICAL items must pass for the team execution to be considered successful

Skipping post-execution review leads to orphaned resources and hidden failures.]]

---

## 1. Output Completeness

- [ ] All spawned agents returned results (no silent failures) (CRITICAL)
- [ ] Agents that timed out have their partial work documented
- [ ] Each agent's output matches its assigned subtask scope
- [ ] No agent produced empty or placeholder output
- [ ] Status reports from each agent are collected and reviewed
- [ ] Agents that encountered errors logged their failure reason

## 2. Merge Validation

- [ ] No file-level conflicts between agent outputs (CRITICAL)
- [ ] If conflicts exist, they are resolved with documented rationale
- [ ] Consistent code formatting across all agent outputs (same lint config applied)
- [ ] No duplicate function/variable/component names introduced by different agents
- [ ] Import statements are consistent (no conflicting dependency versions)
- [ ] Shared configuration files (package.json, tsconfig, etc.) are merged correctly

## 3. Quality Check

- [ ] Each agent's output meets its subtask acceptance criteria (CRITICAL)
- [ ] `npm run lint` passes on the combined codebase
- [ ] `npm run typecheck` passes on the combined codebase (if TypeScript)
- [ ] Unit tests from each agent's work pass individually
- [ ] No regressions introduced (existing tests still pass)
- [ ] Code follows project coding standards and patterns

## 4. Worktree Cleanup

- [ ] All worktrees created for this execution are merged or removed (CRITICAL)
- [ ] No orphaned branches remain from agent work
- [ ] Temporary files created by agents are cleaned up
- [ ] Agent-specific build artifacts are removed
- [ ] `.git/worktrees/` directory has no stale entries
- [ ] Branch protection rules are restored if temporarily modified

## 5. Integration Test

- [ ] Combined output compiles/builds successfully (CRITICAL)
- [ ] `npm test` passes on the full integrated codebase
- [ ] End-to-end workflows affected by the changes still function
- [ ] API contracts between components written by different agents are compatible
- [ ] No circular dependencies introduced between new modules
- [ ] Performance benchmarks are within acceptable range (no significant degradation)

---

## PASS/FAIL Criteria

**PASS:** All agents returned results. No unresolved merge conflicts. Combined codebase passes lint, typecheck, and tests. All worktrees cleaned up.

**FAIL:** Any agent produced no output without documented reason. Unresolved merge conflicts exist. Combined tests fail. Orphaned worktrees or branches remain.

**Action on FAIL:** For missing outputs, determine root cause and re-run individual agent if needed. For merge conflicts, resolve manually and document. For test failures, identify which agent's output causes the failure and fix. For orphaned resources, run cleanup commands.
