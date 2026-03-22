# Rewire Protocol — Context Surgeon

Deep restructuring of context loading architecture.
Use when health score < 60 or after major system changes.

## When to Rewire

- Health score < 60 (CRITICAL)
- Major project restructuring
- Adding new engine/department
- Context window consistently > 40% consumed at start

## Step 1: Map Current Architecture

Create a loading map:

```
PERSISTENT (every turn):
  └── global/CLAUDE.md (N lines) — purpose
  └── project/CLAUDE.md (N lines) — purpose
  └── .claude/CLAUDE.md (N lines) — purpose
  └── rules/*.md (N lines each) — purpose
  └── MEMORY.md (N lines) — purpose

ON-DEMAND (loaded when needed):
  └── protocols/*.md — purpose
  └── reference/*.md — purpose

NEVER-LOAD (excluded):
  └── .claudeignore patterns
```

## Step 2: Apply Five Laws

For each persistent file, ask:
1. Is every line earning its token cost? (Law 2: Every Line Burns)
2. Is any content duplicated elsewhere? (Law 4: Pointer > Inline)
3. Can any instruction become a hook/script? (Law 3: Code > Instruction)
4. Has every section been useful in 10 sessions? (Law 5: Decay)
5. Is any wrong information present? (Law 1: Wrong > Missing)

## Step 3: Design Target Architecture

Constraints:
- Total persistent lines ≤ 400
- No single file > 150 lines
- Each file has ONE clear purpose
- Pointer density > 70% for cross-references
- Loading hierarchy: Global → Project → Rules → Memory

## Step 4: Migration Plan

List specific actions ordered by impact:
1. Moves (file → new location)
2. Cuts (line → delete)
3. Extractions (inline → separate file + pointer)
4. Consolidations (N files → 1 file)

## Step 5: Execute

- One file at a time
- Verify after each change (no broken refs)
- Re-run scan after complete

## Target Metrics

| Metric | Target | Red Flag |
|--------|--------|----------|
| Total persistent lines | ≤ 400 | > 600 |
| Single file max | ≤ 150 | > 200 |
| Dead references | 0 | > 3 |
| Duplicates | 0 | > 5 |
| Token budget % | < 25% | > 40% |
