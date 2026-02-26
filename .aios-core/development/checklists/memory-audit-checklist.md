# Memory Audit Checklist

Periodic checklist for maintaining agent MEMORY.md hygiene across all 10 agents.

**Frequency:** Once per sprint or after completing an epic.
**Executor:** Any agent (`@po *execute-checklist memory-audit-checklist`)

---

## Steps

### Step 1: Read All MEMORY.md Files
- [ ] Read all 10 agent MEMORY.md files under `.aios-core/development/agents/*/MEMORY.md`
- [ ] Confirm each file has the 3-section structure: `## Active Patterns`, `## Promotion Candidates`, `## Archived`

### Step 2: Identify Cross-Agent Patterns
- [ ] Cross-reference Active Patterns across all 10 files
- [ ] Flag patterns that appear in **3+ agent MEMORY.md files** as promotion candidates
- [ ] Document each candidate with: pattern text, which agents contain it, count

### Step 3: Record Promotion Candidates
- [ ] For each cross-agent pattern found in Step 2, add to `## Promotion Candidates` in the originating agent's MEMORY.md
- [ ] Use format: `- **{pattern}** | Source: {agent} | Detected: {YYYY-MM-DD}`
- [ ] If pattern already exists in Promotion Candidates, skip (no duplicates)

### Step 4: Identify Stale Entries
- [ ] Review Active Patterns for entries contradicted by current codebase
- [ ] Review Active Patterns for entries superseded by newer patterns or code changes
- [ ] Review Active Patterns for entries no longer relevant to current project state

### Step 5: Archive Stale Entries
- [ ] Move stale entries from `## Active Patterns` to `## Archived`
- [ ] Use format: `- ~~{pattern}~~ | Archived: {YYYY-MM-DD} | Reason: {reason}`
- [ ] Valid reasons: "superseded by {X}", "contradicted by {Y}", "no longer relevant"

### Step 6: Report Summary
- [ ] Total active patterns across all agents
- [ ] New promotion candidates identified this audit
- [ ] Entries newly archived this audit
- [ ] Recommended actions (e.g., "elevate pattern X to .claude/rules/")

---

## Expected Cross-Agent Patterns

Common patterns that typically appear in multiple agents:

| Pattern | Expected Agents | Action |
|---------|----------------|--------|
| "NEVER push — delegate to @devops" | dev, qa, analyst, sm, data-engineer, ux | Promote to `.claude/rules/` |
| CommonJS module system | dev, analyst, sm, data-engineer, ux, architect | Already in CLAUDE.md |
| Conventional commits format | dev, qa, devops, analyst, sm, data-engineer, ux | Already in CLAUDE.md |
| kebab-case for files | dev, analyst, sm, data-engineer, ux | Already in CLAUDE.md |
