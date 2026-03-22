# CELF Anti-Patterns Catalog

12 universal failure modes observed across implementations.

## Detection + Fix

### AP-01: Context Dump
**Symptom:** CLAUDE.md with 500+ lines
**Root cause:** Everything in the auto-loaded file
**Detection:** `wc -l CLAUDE.md` > 200
**Fix:** Extract to satellite files loaded on-demand. CLAUDE.md = pointers + laws only.
**Layer:** L0

### AP-02: Session Amnesia
**Symptom:** Every session starts from zero, repeats same questions
**Root cause:** No STATE.yaml + no MEMORY.md
**Detection:** No state file, no memory directory
**Fix:** Implement L3 (STATE.yaml) + L5 (MEMORY.md)
**Layer:** L3 + L5

### AP-03: Ghost Context
**Symptom:** Model cites information that doesn't exist in any file
**Root cause:** Hallucination without L1/L2 loaded
**Detection:** Output references facts not in .brain/ or intelligence/
**Fix:** Load sources BEFORE creating. Add preflight rule to L0.
**Layer:** L1 + L2

### AP-04: Flat File Chaos
**Symptom:** 100 files at root with no structure
**Root cause:** No layer taxonomy applied
**Detection:** `ls -1 | wc -l` > 20 at root
**Fix:** Implement canonical paths. One folder per layer concern.
**Layer:** All

### AP-05: Heuristic Promoted to Axiom
**Symptom:** Empirical rule treated as immutable law
**Root cause:** No epistemic status declared
**Detection:** Rules without confidence/status markers
**Fix:** Classify every piece of context with epistemic status.
**Layer:** L4

### AP-06: Absent Owner
**Symptom:** File outdated for months, nobody maintains it
**Root cause:** No owner assigned
**Detection:** Files with no clear ownership, stale content
**Fix:** Define owner per layer. Owner = maintenance responsibility.
**Layer:** All

### AP-07: Leaky Abstraction
**Symptom:** Sub-agent sees context it shouldn't
**Root cause:** Cross-contamination between L7 delegations
**Detection:** Agent output references info from another agent's scope
**Fix:** Isolation per delegation. Scoped context only.
**Layer:** L7

### AP-08: Premature Loading
**Symptom:** Everything loaded "just in case"
**Root cause:** Fear of missing context
**Detection:** All files loaded at session start regardless of task
**Fix:** On-demand loading protocol. Load when needed, not before.
**Layer:** L1 + L2

### AP-09: State without Machine
**Symptom:** Project "in progress" without defined phases
**Root cause:** STATE.yaml without transitions
**Detection:** State file exists but has no phase definitions
**Fix:** Define phases + quality gates + transition rules.
**Layer:** L3

### AP-10: Memory Pollution
**Symptom:** MEMORY.md full of session-specific info
**Root cause:** No promotion criteria
**Detection:** Memory entries that reference specific sessions/dates
**Fix:** Minimum 2 observations before saving. Garbage collect every ~10 sessions.
**Layer:** L5

### AP-11: Missing Handoff
**Symptom:** Session ends without serializing context
**Root cause:** No end-of-session protocol
**Detection:** No docs/sessions/ directory, no handoff files
**Fix:** Mandatory handoff per session. Add rule to L0.
**Layer:** L6

### AP-12: Possible Wrong Path
**Symptom:** Agent executes without necessary context
**Root cause:** No veto condition blocking the action
**Detection:** Output quality drops because prerequisite wasn't met
**Fix:** Implement blocking gates. "VETO if P0 not loaded before copy."
**Layer:** L4

---

## Quick Detection Matrix

| Check | Command/Method | Flags |
|-------|---------------|-------|
| CLAUDE.md bloat | Count lines | > 200 = AP-01 |
| No state | Check for STATE.yaml | Missing = AP-02 |
| No memory | Check MEMORY.md | Missing = AP-02 |
| Root chaos | Count root files | > 20 = AP-04 |
| No epistemic | Grep for "epistemic" in rules | Missing = AP-05 |
| No handoffs | Check docs/sessions/ | Missing = AP-11 |
| No intelligence | Check inputs/intelligence/ | Missing before copy = AP-03 |
