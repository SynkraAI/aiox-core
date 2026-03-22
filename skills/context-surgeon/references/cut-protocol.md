# Cut Protocol — Context Surgeon

Detailed procedure for surgical context removal.

## Pre-Cut Checklist

- [ ] Scan completed with current health score
- [ ] All findings have evidence (file, line, reason)
- [ ] No cuts to files < 7 days old without user approval

## Cut Categories

### DEAD_REF — References to non-existent files

**Detection**: dead-refs.sh output
**Action**: Delete the line containing the dead reference
**Verify**: Line doesn't contain other useful info alongside the ref
**Risk**: LOW

### STALE — Information no longer accurate

**Indicators**:
- Dates > 30 days old in status/progress sections
- Scores from previous audits (unless tracking trends)
- "Current" status that contradicts actual state
- Version numbers that have changed

**Action**: DELETE if purely historical. UPDATE if still relevant but wrong.
**Risk**: MEDIUM — verify current truth before removing

### DUPLICATE — Same instruction in multiple files

**Indicators**:
- Same rule in CLAUDE.md AND rules/*.md
- Same principle in global AND project CLAUDE.md
- Same routing table in multiple files

**Action**: Keep in the MOST SPECIFIC (narrowest scope) file. Priority:
1. rules/*.md (most specific — domain rules)
2. .claude/CLAUDE.md (project operational DNA)
3. Project CLAUDE.md (project boot + routing)
4. Global ~/.claude/CLAUDE.md (immutable cross-project laws)
5. MEMORY.md (ephemeral — avoid instructions here)

**Risk**: LOW

### PLANNED — Items marked [PLANNED] or not yet active

**Detection**: grep for `[PLANNED]`, `[TODO]`, `[FUTURE]`, `[WIP]`
**Action**: Move to on-demand file (e.g., reference/planned-routing.md)
**Risk**: LOW — planned items don't need to load every turn

### HISTORICAL — Old reports, dates, audit scores

**Indicators**:
- Audit results > 14 days old
- Session-specific data (session IDs, timestamps)
- Old financial snapshots (unless tracking trends)

**Action**: Archive to appropriate location:
- Session data → docs/sessions/
- Audit history → docs/audits/
- Financial snapshots → keep only latest in MEMORY.md

**Risk**: MEDIUM — some historical data informs decisions

### INLINE_BLOAT — Content that should be a pointer

**Indicators**:
- Sections > 20 lines that could be a separate file
- Reference tables > 15 rows
- Detailed procedures inline

**Action**: Extract to separate file, replace with 1-line pointer
**Risk**: LOW — information preserved, just relocated

## Post-Cut Verification

1. Re-run scan to verify health score improved
2. Verify no broken references created by cuts
3. Verify no critical instruction was removed
