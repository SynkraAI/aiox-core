# Optimization Roadmap — UAP & SYNAPSE Incremental Improvements

**Story:** NOG-9 — UAP & SYNAPSE Deep Research (Task 8)
**Author:** Aria (Architect Agent)
**Date:** 2026-02-21
**Principle:** Article IV — No Invention. Every item references research evidence.

---

## Classification Key

| Category | Effort | Description |
|----------|--------|-------------|
| **Quick Win** | <1h | Single file change, no API changes, immediate benefit |
| **Medium** | 1-3h | Multi-file change, may need tests, moderate benefit |
| **Strategic** | 1+ stories | Architectural change, needs story + QA cycle |

---

## Priority 1: Critical Fixes (Bugs & Wiring)

### QW-1: Fix updateSession() Never Called
- **Category:** Quick Win (<30min)
- **Evidence:** C4 research — `updateSession()` exists but is never called in hook-runtime.js
- **Impact:** Context brackets ALWAYS return FRESH, rendering bracket-based throttling useless
- **Fix:** Add `updateSession({ promptCount, lastTokensUsed })` call after each SYNAPSE hook execution
- **Files:** `.claude/hooks/synapse-engine.cjs`
- **ROI:** Unlocks the entire bracket system (FRESH/MODERATE/DEPLETED/CRITICAL)

### QW-2: Populate last_tokens_used from API Response
- **Category:** Quick Win (<30min)
- **Evidence:** C2 research — field exists in session schema but is never populated
- **Impact:** Enables real token counting instead of `promptCount × 1500` estimate
- **Fix:** Parse `usage.input_tokens` from Claude API response, write to session
- **Files:** `.claude/hooks/synapse-engine.cjs`, session manager
- **ROI:** ~100% accuracy vs ~70-80% from static estimate

### QW-3: Fix chars/4 Token Estimation
- **Category:** Quick Win (<15min)
- **Evidence:** C6 research — `chars/4` underestimates 15-25% on XML/SYNAPSE output
- **Impact:** Bracket transitions happen too late (FRESH stays too long)
- **Fix:** Apply 1.2x safety multiplier: `Math.ceil(chars / 4 * 1.2)` for SYNAPSE XML output
- **Files:** `context-tracker.js`
- **ROI:** Immediate improvement in bracket accuracy

### QW-4: Strip _coreConfig from enrichedContext Return
- **Category:** Quick Win (<15min)
- **Evidence:** Comparative matrix — AIOS returns ~25KB, compact greeting needs ~600B
- **Impact:** 97% reduction in output size for most common use case
- **Fix:** `const { _coreConfig, ...cleanContext } = enrichedContext;` before return
- **Files:** `unified-activation-pipeline.js:342`
- **ROI:** Eliminates ~15-20KB of unnecessary serialization

---

## Priority 2: Performance Quick Wins

### QW-5: Direct .git/HEAD Read Instead of execSync
- **Category:** Quick Win (<30min)
- **Evidence:** A4 research — `.git/HEAD` direct read = 0.03ms vs `git branch` = 16ms (830x)
- **Impact:** Eliminates 52ms from 3x sequential `execSync` calls
- **Fix:** `fs.readFileSync('.git/HEAD', 'utf8').replace('ref: refs/heads/', '').trim()`
- **Files:** `git-config-detector.js`
- **ROI:** Highest-ROI single change. 52ms → <1ms.

### QW-6: JSON Cache for CoreConfig with mtime Invalidation
- **Category:** Quick Win (<45min)
- **Evidence:** A1 research — all competitors use JSON or tiny configs; AIOS parses 9.4KB YAML cold
- **Impact:** Eliminates ~3.3ms YAML parse on warm starts
- **Fix:** Cache parsed YAML as `.aios-core/.config-cache.json` with `mtime` check
- **Files:** `unified-activation-pipeline.js:_loadCoreConfig()`
- **ROI:** ~3ms saved per activation (cumulative across sessions)

### QW-7: Atomic Session Writes
- **Category:** Quick Win (<20min)
- **Evidence:** A6 research — no atomic writes = corruption risk on crash
- **Impact:** Prevents session file corruption on unexpected exit
- **Fix:** Write to `.tmp` file first, then `fs.renameSync()` (atomic on POSIX)
- **Files:** `session-manager.js`, `context-loader.js`
- **ROI:** Eliminates silent corruption class of bugs

### QW-8: Session Cleanup TTL (7 Days)
- **Category:** Quick Win (<20min)
- **Evidence:** A6 research — Claude Code uses ~1 week TTL; AIOS has no cleanup
- **Impact:** Prevents stale session accumulation
- **Fix:** On session write, scan directory and delete files older than 7 days
- **Files:** `session-manager.js`
- **ROI:** Prevents gradual disk space waste

---

## Priority 3: Medium Improvements

### MED-1: Output Formatter with Presets
- **Category:** Medium (1-2h)
- **Evidence:** Output Taxonomy document (Task 7); Codex CLI progressive loading (D3)
- **Impact:** Consumers get right-sized output instead of full blob
- **Fix:** Create `output-formatter.js` with compact/standard/full/debug presets
- **Files:** New file + update `generate-greeting.js`
- **ROI:** 97% output reduction for default case

### MED-2: Markdown Domain Bodies (Replace KEY=VALUE)
- **Category:** Medium (2-3h)
- **Evidence:** C3 research — KEY=VALUE generates token noise; Markdown 34-38% more efficient
- **Impact:** Reduced token consumption per SYNAPSE injection
- **Fix:** Migrate domain body format from `KEY=VALUE` to clean Markdown
- **Files:** `.synapse/domains/*.md`, domain loader
- **ROI:** 34-38% token savings on domain content

### MED-3: Per-Agent Permission Defaults
- **Category:** Medium (1-2h)
- **Evidence:** A3 research — OpenCode implements this; no competitor has per-agent defaults
- **Impact:** Better security posture (e.g., @devops=auto, @analyst=explore)
- **Files:** Agent YAML definition, permission mode loader
- **ROI:** Security improvement + reduced user friction

### MED-4: ContextDetector → Rich SessionState
- **Category:** Medium (2-3h)
- **Evidence:** B2 research — ContextDetector reads simple JSON, ignores rich SessionState.yaml
- **Impact:** Better session continuity detection
- **Fix:** Integrate SessionState fields (currentStory, workflowPhase) into detection
- **Files:** `context-detector.js`
- **ROI:** More accurate session type inference

### MED-5: WorkflowNavigator → Story Status Signal
- **Category:** Medium (1-2h)
- **Evidence:** B3 research — command history is wrong signal; story file Status field is reliable
- **Impact:** More accurate workflow suggestions
- **Fix:** Parse story file `Status:` field as primary signal, command history as fallback
- **Files:** `workflow-navigator.js`
- **ROI:** Eliminates false workflow suggestions

### MED-6: Enable git fsmonitor
- **Category:** Medium (1h)
- **Evidence:** A7 research — fsmonitor reduces `git status` from 50-200ms to <10ms
- **Impact:** Dramatically faster ProjectStatus loader
- **Fix:** `git config core.fsmonitor true` + documentation
- **Files:** Documentation + optional init script
- **ROI:** 5-20x faster git status operations

---

## Priority 4: Strategic Improvements (Separate Stories)

### STR-1: Config/Context Separation
- **Category:** Strategic (1 story)
- **Evidence:** Comparative matrix — ALL competitors separate config from context; AIOS has monolith
- **Impact:** Cleaner architecture, faster loading, better caching
- **Design:** Split `core-config.yaml` into:
  - `settings.yaml` (~2KB) — static framework settings
  - Context assembled dynamically from session + project state
- **ROI:** Architectural alignment with industry, enables progressive loading

### STR-2: Real Token Counting Pipeline
- **Category:** Strategic (1 story)
- **Evidence:** C2 research — AIOS is the ONLY tool with static token estimation
- **Impact:** ~100% accuracy on context tracking
- **Design:**
  1. QW-2 (populate last_tokens_used) as prerequisite
  2. Replace `promptCount × 1500` with real API data accumulation
  3. Use tiktoken or API `usage` field for accurate counts
- **Depends on:** QW-1, QW-2
- **ROI:** Unlocks precise bracket transitions

### STR-3: Session Resume Capability
- **Category:** Strategic (1 story)
- **Evidence:** Comparative matrix — Claude Code, Codex, Gemini all have resume; AIOS does not
- **Impact:** Table-stakes UX feature
- **Design:**
  1. Serialize conversation context to session file
  2. Add `--continue` / `--resume` flags to CLI
  3. Session picker for multiple sessions
- **ROI:** Critical user-facing gap closed

### STR-4: Progressive Domain Loading (Lazy)
- **Category:** Strategic (1 story)
- **Evidence:** C1 research (Codex Skills metadata-first); D2 (Cursor activation modes)
- **Impact:** Faster SYNAPSE pipeline, lower token consumption
- **Design:**
  1. Load domain manifests (metadata) at pipeline start
  2. Load domain bodies on-demand based on keyword/context match
  3. Adopt Cursor's "Agent Requested" pattern for L6 keyword domains
- **ROI:** Reduced per-prompt latency, lower token waste

### STR-5: Memory Self-Editing
- **Category:** Strategic (1 story)
- **Evidence:** Comparative matrix — Claude Code and Cursor allow AI to write memories
- **Impact:** Persistent learning across sessions
- **Design:** Allow SYNAPSE to write back to memory system (currently read-only)
- **ROI:** Eliminates inter-session context loss

### STR-6: Cross-Platform Skills Export
- **Category:** Strategic (1 story)
- **Evidence:** D3 research — Codex Skills is an open standard gaining adoption
- **Impact:** AIOS tasks become portable across tools
- **Design:** Export `.aios-core/development/tasks/` in Skills format
- **ROI:** Cross-tool ecosystem play

---

## Summary Matrix

| ID | Name | Category | Impact | Effort | Priority |
|----|------|----------|--------|--------|----------|
| QW-1 | Fix updateSession() | Quick Win | CRITICAL | 30min | P0 |
| QW-2 | Populate last_tokens_used | Quick Win | HIGH | 30min | P0 |
| QW-3 | Fix chars/4 estimation | Quick Win | HIGH | 15min | P0 |
| QW-4 | Strip _coreConfig | Quick Win | MEDIUM | 15min | P1 |
| QW-5 | Direct .git/HEAD read | Quick Win | HIGH | 30min | P0 |
| QW-6 | JSON config cache | Quick Win | MEDIUM | 45min | P1 |
| QW-7 | Atomic session writes | Quick Win | MEDIUM | 20min | P1 |
| QW-8 | Session cleanup TTL | Quick Win | LOW | 20min | P2 |
| MED-1 | Output presets | Medium | HIGH | 2h | P1 |
| MED-2 | Markdown domains | Medium | HIGH | 3h | P1 |
| MED-3 | Per-agent permissions | Medium | MEDIUM | 2h | P2 |
| MED-4 | Rich SessionState | Medium | MEDIUM | 3h | P2 |
| MED-5 | Story Status signal | Medium | MEDIUM | 2h | P2 |
| MED-6 | Git fsmonitor | Medium | HIGH | 1h | P1 |
| STR-1 | Config separation | Strategic | HIGH | 1 story | P1 |
| STR-2 | Real token counting | Strategic | CRITICAL | 1 story | P0 |
| STR-3 | Session resume | Strategic | HIGH | 1 story | P1 |
| STR-4 | Progressive domains | Strategic | MEDIUM | 1 story | P2 |
| STR-5 | Memory self-editing | Strategic | MEDIUM | 1 story | P2 |
| STR-6 | Skills export | Strategic | LOW | 1 story | P3 |

### Execution Order (Recommended)

```
Phase 0 (Immediate — 2h total):
  QW-1 → QW-2 → QW-3 → QW-5 → QW-4

Phase 1 (Next Sprint — 8h total):
  QW-6 → QW-7 → QW-8 → MED-1 → MED-6

Phase 2 (Following Sprint — 12h total):
  MED-2 → MED-5 → MED-4 → MED-3

Phase 3 (Strategic Stories):
  STR-2 → STR-1 → STR-3 → STR-4 → STR-5 → STR-6
```

---

## Expected Impact After Phase 0

| Metric | Current | After Phase 0 | Target |
|--------|---------|---------------|--------|
| Git detection time | 52ms | <1ms | <5ms |
| Bracket accuracy | ~0% (always FRESH) | ~80% (real data) | >95% |
| Token estimation accuracy | ~70-80% | ~85-90% | >95% |
| Output size (greeting) | ~25KB | ~600B | <1KB |
| Total Quick Win effort | — | ~2h | — |

---

*Aria, arquitetando o futuro* 🏗️
