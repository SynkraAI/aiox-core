# Command Rationalization Matrix Template

**Purpose:** Systematic framework for evaluating agent commands for rationalization

**Version:** 1.0
**Created:** 2025-01-15
**Template ID:** command-rationalization-matrix

---

## Usage Instructions

This template provides a structured approach to analyze and rationalize agent commands. Use it when:
- Optimizing agent command sets
- Identifying redundant or overlapping commands
- Planning command consolidations or deletions
- Documenting command evolution decisions

---

## Decision Criteria

### Usage Count Classification
- **HIGH:** ≥10 occurrences across codebase
- **MEDIUM:** 3-9 occurrences
- **LOW:** 1-2 occurrences
- **ZERO:** 0 occurrences (candidate for removal)

### Recommendation Categories
- ✅ **KEEP** - Essential functionality, high usage, or no alternative
- 🔀 **MERGE** - Similar functionality, can consolidate with parameters
- 🔄 **DELEGATE** - Better suited for specialized agent
- ❌ **REMOVE** - Unused, redundant, or has alternative

### Decision Rules
1. **KEEP** if: Usage HIGH (≥10) OR critical functionality OR no alternative
2. **MERGE** if: Similar purpose to another command AND can use parameters to differentiate
3. **DELEGATE** if: Better aligns with specialized agent's domain
4. **REMOVE** if: Usage ZERO (0) AND non-critical AND has alternative

---

## Command Analysis Matrix

| # | Command | Category | Agent | Usage | Task File | Decision | Rationale | Migration Path |
|---|---------|----------|-------|-------|-----------|----------|-----------|----------------|
| 1 | example-command | Framework | aiox-master | HIGH (15) | create-doc.md | ✅ KEEP | Core meta-framework capability | N/A |
| 2 | party-mode | Utility | aiox-master | ZERO (0) | N/A | ❌ REMOVE | Novelty feature, unused | Removed in v3.0 |
| 3 | explain | DB Perf | data-engineer | HIGH (12) | db-explain.md | 🔀 MERGE | Into analyze-performance | *analyze-performance query |
| 4 | analyze-hotpaths | DB Perf | data-engineer | MED (5) | db-analyze-hotpaths.md | 🔀 MERGE | Into analyze-performance | *analyze-performance hotpaths |
| 5 | create-prd | Docs | aiox-master | MED (7) | create-doc.md | 🔄 DELEGATE | Better suited for @pm | Use @pm *create-prd |

---

## Usage Count Calculation Method

```bash
# Count command usage across all documentation
grep -r "\*command-name" docs/ .aiox-core/ | wc -l

# For each agent's commands:
for cmd in $(grep -E "^  - [a-z-]+" .aiox-core/agents/AGENT.md | cut -d':' -f1 | sed 's/  - //'); do
  count=$(grep -r "\*$cmd" docs/ .aiox-core/ 2>/dev/null | wc -l)
  echo "$cmd: $count"
done
```

---

## Command Consolidation Patterns

### Pattern 1: Parameter-Based Merge
**Before:** Multiple similar commands
```yaml
- explain {sql}: Run EXPLAIN on query
- analyze-hotpaths: Analyze hot queries
- optimize-queries: Optimize query performance
```

**After:** Single command with type parameter
```yaml
- analyze-performance {type}: Query performance analysis
  # Types: query, hotpaths, interactive
  # Example: *analyze-performance query "SELECT * FROM users"
```

### Pattern 2: Verb-Noun Consolidation
**Before:** Multiple create commands
```yaml
- create-agent: Create new agent
- create-task: Create new task
- create-workflow: Create new workflow
```

**After:** Unified create with type
```yaml
- create {type} {name}: Create AIOX component
  # Types: agent, task, workflow, template
  # Example: *create agent security-expert
```

---

## Analysis Checklist

For each command, evaluate:
- [ ] **Purpose Clear:** Can users understand what this command does?
- [ ] **Usage Tracked:** Have we measured actual usage in codebase?
- [ ] **Task Mapped:** Does it map to an existing task file?
- [ ] **Alternatives Considered:** Are there other ways to achieve this?
- [ ] **Impact Assessed:** What breaks if we remove/change this?
- [ ] **Migration Planned:** How do users adapt to changes?

---

## Rationalization Output Format

### Summary Statistics
- **Total Commands (Before):** X
- **Total Commands (After):** Y
- **Reduction:** Z% (X-Y)/X
- **Commands Kept:** N
- **Commands Merged:** M
- **Commands Delegated:** D
- **Commands Removed:** R

### Detailed Recommendations
For each category (Framework, Operations, Security, etc.):
1. List current commands
2. Show proposed changes
3. Explain rationale
4. Document migration path

---

## Validation Criteria

Before finalizing rationalization:
- ✅ No critical workflows broken
- ✅ All task file references valid
- ✅ Migration path documented for every change
- ✅ User approval obtained for major changes
- ✅ Backward compatibility preserved (via aliases if needed)

---

## Notes

- Update this matrix as commands evolve
- Archive historical analyses for reference
- Use consistent categorization across analyses
- Always validate with actual usage data, not assumptions
