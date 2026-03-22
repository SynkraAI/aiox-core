# Context Health Checklist

Quality gate for context engineering. Run after any structural change.

## Structure

- [ ] Total auto-loaded lines ≤ 400 (target), 500 hard limit
- [ ] No single file > 150 lines
- [ ] .claudeignore exists and covers heavy directories
- [ ] Each persistent file has ONE clear purpose
- [ ] Loading hierarchy is clean (Global → Project → Rules → Memory)

## Content

- [ ] Zero dead references
- [ ] Zero contradictions between files
- [ ] Zero duplicate instructions across files
- [ ] No [PLANNED] items in auto-loaded files
- [ ] No historical data > 14 days in MEMORY.md
- [ ] All dates/versions/scores are current

## Efficiency

- [ ] Pointer-to-inline ratio > 70%
- [ ] No instruction that could be a hook/script
- [ ] No content block > 20 lines that could be a separate file
- [ ] MEMORY.md ≤ 120 lines

## Prevention

- [ ] Hooks guard critical files from unauthorized edits
- [ ] .claudeignore blocks heavy research/archive directories
- [ ] Boot sequence loads only essential state

## Scoring

Count checked items: ___/17
- 15-17: HEALTHY (≥80 equivalent)
- 11-14: NEEDS_CARE (60-79 equivalent)
- < 11: CRITICAL (<60) — run /context-surgeon rewire
