# Pre-Push Quality Gate Checklist

**Checklist ID:** CCM-CL-001
**Referenced by:** config-engineer, roadmap-sentinel
**Purpose:** Validate Claude Code configuration changes before pushing to remote. Ensures settings integrity, CLAUDE.md quality, rule correctness, hook safety, and MCP sanity.

[[LLM: INITIALIZATION INSTRUCTIONS - PRE-PUSH VALIDATION

This checklist validates Claude Code configuration changes specifically.
It complements the AIOX framework pre-push-checklist but focuses on
.claude/ directory artifacts, settings.json, rules, hooks, and MCP config.

EXECUTION APPROACH:
1. For each category, verify every item against the current file state
2. Mark items as [x] Pass, [ ] Fail, or [N/A] Not Applicable
3. Any CRITICAL item failure blocks the push
4. Non-critical failures should be documented with justification

CRITICAL items are marked with (CRITICAL) suffix.]]

---

## 1. Settings Validation

- [ ] `settings.json` is valid JSON with no syntax errors (CRITICAL)
- [ ] `settings.json` contains `deny` rules for `.env`, credentials, and secrets (CRITICAL)
- [ ] `settings.json` contains `deny` rules for framework-protected paths (L1/L2 boundary)
- [ ] No API keys, tokens, or secrets hardcoded in `settings.json`
- [ ] `settings.local.json` is listed in `.gitignore` if it contains user-specific overrides
- [ ] Permission defaults (`allow`/`deny`) are intentional and match project security posture
- [ ] All `allow` rules have corresponding deny rules that they override (no open holes)

## 2. CLAUDE.md Quality

- [ ] CLAUDE.md exists at `.claude/CLAUDE.md` (CRITICAL)
- [ ] CLAUDE.md is under 500 lines total (recommended under 200 for auto-memory projects)
- [ ] All `AIOX-MANAGED-START` sections have matching `AIOX-MANAGED-END` markers (CRITICAL)
- [ ] No stale file path references (all mentioned paths exist in the repository)
- [ ] No duplicate instructions between CLAUDE.md and `.claude/rules/` files
- [ ] Code examples in CLAUDE.md are syntactically valid
- [ ] No TODO or FIXME comments left in CLAUDE.md content

## 3. Rules Validation

- [ ] All `.claude/rules/*.md` files have valid YAML frontmatter (if path-scoped)
- [ ] Frontmatter `paths:` values match existing directories or file patterns
- [ ] No always-loaded rules exceed 200 lines (context budget discipline)
- [ ] Path-scoped rules only load for their intended file types
- [ ] No conflicting instructions between different rule files
- [ ] Rule file names follow kebab-case convention
- [ ] No orphaned rules (rule references files/patterns that no longer exist)

## 4. Hook Safety

- [ ] All registered hooks have explicit timeout configuration (CRITICAL)
- [ ] No hook contains infinite loops or unbounded recursion (CRITICAL)
- [ ] Hook exit codes follow convention (0 = success, non-zero = failure)
- [ ] Hooks that modify files use atomic write patterns (temp + rename)
- [ ] PreToolUse hooks do not block essential tool operations
- [ ] PostToolUse hooks handle errors gracefully (no silent swallowing)
- [ ] Hook file paths in settings.json resolve to existing scripts

## 5. MCP Configuration

- [ ] All configured MCP servers respond to health checks (if enabled)
- [ ] MCP context budget stays within project limits (check core-config.yaml)
- [ ] No duplicate MCP server entries in configuration
- [ ] MCP servers requiring authentication have valid credentials configured
- [ ] Docker-based MCPs have container running and accessible

---

## PASS/FAIL Criteria

**PASS:** All items marked (CRITICAL) are checked. Non-critical items have fewer than 3 failures, each with documented justification.

**FAIL:** Any item marked (CRITICAL) is unchecked, OR more than 3 non-critical items fail without justification.

**Action on FAIL:** Fix all critical issues before push. Document non-critical issues as tech debt if deferring.
