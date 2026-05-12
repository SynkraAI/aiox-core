# Integration Audit Checklist

**Checklist ID:** CCM-CL-005
**Referenced by:** project-integrator
**Purpose:** Audit the quality of an existing Claude Code integration in a project. Produces a scored grade (A-F) to identify gaps and prioritize improvements.

[[LLM: INITIALIZATION INSTRUCTIONS - INTEGRATION AUDIT

This checklist evaluates how well Claude Code is integrated into a project.
Use it to audit existing setups and identify improvement opportunities.

EXECUTION APPROACH:
1. Check each item against the actual project state
2. Mark [x] for present and correct, [ ] for missing or incorrect, [N/A] for not applicable
3. Count checked items vs total applicable items
4. Calculate score and grade
5. Prioritize gaps by category (security first, then structure, then optimization)

This audit is non-destructive -- it only reads and reports.]]

---

## 1. Directory Structure

- [ ] `.claude/` directory exists at project root
- [ ] `.claude/settings.json` is present and valid JSON
- [ ] `.claude/rules/` directory exists with at least one rule file
- [ ] `.claude/CLAUDE.md` exists
- [ ] `.claude/agents/` directory exists (if project uses custom agents)
- [ ] `.claude/skills/` directory exists (if project uses custom skills)

## 2. Configuration Quality

- [ ] Deny rules exist for `.env` and common secret file patterns (CRITICAL)
- [ ] Deny rules exist for `node_modules/`, `.git/objects`, and large binary directories
- [ ] Permission mode is set to an appropriate level (not `auto` for untrusted repos)
- [ ] Allow rules are scoped narrowly (not blanket `*` patterns)
- [ ] Settings follow the principle of least privilege
- [ ] Local overrides (`settings.local.json`) are gitignored

## 3. CLAUDE.md Health

- [ ] CLAUDE.md exists and is not empty (CRITICAL)
- [ ] CLAUDE.md is under 500 lines (under 200 preferred)
- [ ] No stale file path references (all mentioned paths resolve to existing files)
- [ ] Instructions are specific to this project (not generic boilerplate)
- [ ] Managed sections (if present) have matching start/end markers
- [ ] No contradictory instructions within the document
- [ ] Code examples are syntactically valid and use current project patterns

## 4. Hook Coverage

- [ ] At least one damage-control hook exists (PreToolUse for destructive commands)
- [ ] Hooks have been tested (not just written and never validated)
- [ ] Hook scripts handle errors gracefully (no unhandled exceptions)
- [ ] Hooks have explicit timeouts to prevent blocking
- [ ] PostToolUse hooks do not silently swallow errors

## 5. MCP Integration

- [ ] MCP servers are configured in `.claude/mcp.json` or equivalent (if MCP is used)
- [ ] Configured servers are reachable and authenticated
- [ ] Context budget for MCP tools is documented or within reasonable limits
- [ ] MCP tool selection priority is documented (native tools preferred)
- [ ] No redundant MCP servers (each serves a distinct purpose)

## 6. Rules Coverage

- [ ] Path-based rules exist for major source directories (src/, lib/, tests/)
- [ ] No orphaned rules (rules that reference non-existent file patterns)
- [ ] Rules use frontmatter `paths:` for path-scoped loading (not always-loaded)
- [ ] Total always-loaded rule content stays under 1000 lines combined
- [ ] Rules do not duplicate content already in CLAUDE.md
- [ ] Rule file naming follows kebab-case convention

## 7. Agent Definitions

- [ ] If `.claude/agents/` exists, each agent file has valid structure
- [ ] Agent definitions include clear role and scope descriptions
- [ ] Agent tool access is restricted to what each agent needs
- [ ] Agent command lists reference valid task files
- [ ] No conflicting instructions between agent definitions

---

## Scoring

**Calculation:** (Checked items) / (Total items - N/A items) x 100

| Grade | Score Range | Interpretation |
|-------|------------|----------------|
| A | 90-100% | Excellent integration, production-ready |
| B | 80-89% | Good integration, minor improvements needed |
| C | 70-79% | Adequate integration, several gaps to address |
| D | 60-69% | Below average, significant gaps present |
| F | Below 60% | Poor integration, major rework needed |

## Priority Fix Order

1. **CRITICAL items** (security deny rules, CLAUDE.md existence) -- fix immediately
2. **Hook coverage** -- prevents accidental damage
3. **Rules coverage** -- improves agent accuracy
4. **Configuration quality** -- optimizes performance
5. **Agent definitions** -- enhances team workflow
