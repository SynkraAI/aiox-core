# Change Impact Assessment Checklist

**Checklist ID:** CCM-CL-002
**Referenced by:** config-engineer, roadmap-sentinel
**Purpose:** Systematically assess the impact of Claude Code configuration modifications before applying them. Ensures backward compatibility, security integrity, and context budget discipline.

[[LLM: INITIALIZATION INSTRUCTIONS - CHANGE IMPACT ASSESSMENT

This checklist is used BEFORE applying configuration changes to Claude Code
artifacts (.claude/ directory, settings, rules, hooks, MCP config).

EXECUTION APPROACH:
1. Identify all files that will change
2. For each category, assess impact and document findings
3. Security impacts must be explicitly assessed -- never skip
4. A rollback plan is mandatory for any change touching deny rules or hooks
5. Present the completed assessment to the user for approval

Changes to Claude Code configuration affect ALL agents and sessions.
Treat configuration changes with the same rigor as production deployments.]]

---

## 1. Scope Assessment

- [ ] List all settings files affected by this change (settings.json, settings.local.json, CLAUDE.md, rules/)
- [ ] Identify which agents are impacted (check agent definitions for dependencies on changed files)
- [ ] Determine if the change affects only the current project or all projects (global vs local scope)
- [ ] Verify the change does not touch framework-protected paths (L1/L2 boundary)
- [ ] Document the motivation for the change (bug fix, optimization, new capability, security hardening)

## 2. Backward Compatibility

- [ ] Existing agent activation workflows still function after the change
- [ ] No permission regressions (agents that could previously access files still can)
- [ ] Custom commands defined in agent files still resolve to valid task paths
- [ ] Workflows referencing changed rules or settings still execute correctly
- [ ] Hook integrations (PreToolUse, PostToolUse) remain functional
- [ ] If removing a rule or setting, confirm no agent or workflow depends on it

## 3. Security Impact

- [ ] Deny rules are not weakened or removed without explicit security justification (CRITICAL)
- [ ] No new sensitive file patterns exposed by allow rule additions (CRITICAL)
- [ ] Permission mode changes are intentional (explore/ask/auto transitions documented)
- [ ] Secret file patterns (.env, credentials.json, *.key, *.pem) remain in deny rules
- [ ] MCP server access is not broadened beyond intended scope
- [ ] Hook scripts do not introduce new file system write access to protected areas

## 4. Context Impact

- [ ] Calculate CLAUDE.md line count delta (before vs after change)
- [ ] Count rules files delta (added, removed, modified)
- [ ] Assess MCP context budget delta (new servers add context overhead)
- [ ] Verify total always-loaded context stays within performance budget
- [ ] If adding new always-loaded content, identify what can be moved to path-scoped rules
- [ ] No unnecessary duplication introduced between CLAUDE.md, rules, and agent definitions

## 5. Rollback Plan

- [ ] Changes can be reverted with a single git checkout or documented manual steps
- [ ] Backup of current configuration exists before applying changes (CRITICAL)
- [ ] Rollback procedure is documented in change notes
- [ ] If the change involves hook modifications, the previous hook version is preserved
- [ ] Database or persistent state changes (if any) have a reversal path

---

## PASS/FAIL Criteria

**PASS:** All impacts assessed and mitigated. Security section has zero unchecked items. Rollback plan exists.

**FAIL:** Any item in Security Impact is unchecked without justification, OR no rollback plan documented, OR scope assessment incomplete.

**Action on FAIL:** Address all security gaps and document rollback plan before proceeding. Escalate to config-engineer if unsure about security implications.
