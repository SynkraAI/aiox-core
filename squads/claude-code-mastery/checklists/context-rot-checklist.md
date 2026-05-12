# Context Rot Checklist

**Checklist ID:** CCM-CL-007
**Referenced by:** project-integrator
**Purpose:** Detect staleness, bloat, and outdated references in CLAUDE.md and rules files. Produces a Rot Score (0-100, lower = more rot) to quantify context health and prioritize cleanup.

[[LLM: INITIALIZATION INSTRUCTIONS - CONTEXT ROT DETECTION

Context rot occurs when CLAUDE.md, rules, and memory files accumulate
stale references, outdated instructions, and redundant content over time.
This degrades agent accuracy and wastes context budget.

EXECUTION APPROACH:
1. Measure CLAUDE.md size against budget limits
2. Validate every file path and reference mentioned in context files
3. Check instructions against current codebase reality
4. Verify rules match current directory structure
5. Audit memory files for relevance
6. Check for redundancy across all context sources
7. Calculate Rot Score from findings

Context rot is gradual and invisible until agent behavior degrades.
Regular audits prevent accumulation.]]

---

## 1. Size Check

- [ ] CLAUDE.md is under 200 lines (for auto-memory projects)
- [ ] CLAUDE.md is under 500 lines total (absolute maximum)
- [ ] No single rule file exceeds 200 lines
- [ ] Total always-loaded rules content is under 1000 lines combined
- [ ] No unnecessary code blocks or verbose examples (could be in rules instead)
- [ ] Managed sections are concise (tables preferred over prose)

## 2. Reference Validity

- [ ] All file paths mentioned in CLAUDE.md resolve to existing files (CRITICAL)
- [ ] All directory paths mentioned in CLAUDE.md resolve to existing directories
- [ ] All command examples reference valid scripts or binaries
- [ ] All agent names referenced in CLAUDE.md match actual agent definitions
- [ ] All checklist references resolve to existing checklist files
- [ ] All task references resolve to existing task files
- [ ] URLs and links (if any) are accessible and current

## 3. Instruction Currency

- [ ] No references to deprecated APIs or libraries (CRITICAL)
- [ ] No references to removed or renamed files
- [ ] Command syntax matches current tool versions (e.g., CLI flags still valid)
- [ ] Framework version references are current
- [ ] Workflow descriptions match actual implemented behavior
- [ ] Testing instructions use current test runner and patterns
- [ ] Build commands match current package.json scripts

## 4. Rule Health

- [ ] Rule `paths:` frontmatter matches current directory structure (CRITICAL)
- [ ] No rules reference file patterns that no longer exist in the project
- [ ] Rule content aligns with current coding standards
- [ ] Path-scoped rules correctly scope to their intended files
- [ ] No rule has been untouched for more than 90 days in an active project
- [ ] Rules do not reference removed agents or deprecated workflows

## 5. Memory Hygiene

- [ ] Auto-memory files (MEMORY.md, agent memory) contain relevant content
- [ ] No stale entries referencing completed or abandoned work
- [ ] Memory entries are organized by topic (not chronological dumps)
- [ ] No memory entries contradict current CLAUDE.md instructions
- [ ] Memory file sizes are within limits (MEMORY.md under 200 lines)
- [ ] Temporary notes (session-specific) have been cleaned up

## 6. Redundancy Check

- [ ] No duplicate instructions between CLAUDE.md and rules files (CRITICAL)
- [ ] No duplicate instructions between CLAUDE.md and agent definitions
- [ ] No duplicate instructions between different rule files
- [ ] Common patterns are defined once and referenced (not copied)
- [ ] If the same instruction appears in multiple places, consolidate to one source
- [ ] Settings in settings.json are not re-stated as prose in CLAUDE.md

---

## Rot Score Calculation

For each category, count failed items (excluding N/A). Apply weights:

| Category | Weight | Max Deduction |
|----------|--------|---------------|
| Size Check | 1x per fail | 10 points |
| Reference Validity | 3x per fail | 21 points |
| Instruction Currency | 2x per fail | 14 points |
| Rule Health | 2x per fail | 12 points |
| Memory Hygiene | 1x per fail | 6 points |
| Redundancy Check | 2x per fail | 12 points |

**Rot Score** = 100 - (total deductions, capped at 100)

| Score Range | Health Status | Action Required |
|-------------|--------------|-----------------|
| 80-100 | Healthy | Routine maintenance only |
| 60-79 | Aging | Schedule cleanup within 1-2 sprints |
| 40-59 | Rotting | Immediate cleanup sprint needed |
| 0-39 | Critical | Full context rebuild recommended |

## Priority Fix Order

1. **Reference Validity** failures -- broken paths cause agent errors
2. **Instruction Currency** failures -- outdated instructions cause wrong behavior
3. **Redundancy** failures -- duplicates waste context budget and cause conflicts
4. **Rule Health** failures -- stale rules load unnecessary content
5. **Size Check** failures -- bloat degrades all operations
6. **Memory Hygiene** failures -- stale memory misleads agents
