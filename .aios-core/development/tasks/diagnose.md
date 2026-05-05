# diagnose

**Source:** Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) (engineering/diagnose) under MIT license
**Type:** AIOS Task
**Owner agent:** `@dev` (primary) · `@qa` (regression test phase) · `@architect` (post-mortem phase)
**Version:** 1.0.0
**Last Updated:** 2026-05-05

---

## Execution Modes

### 1. YOLO Mode — Fast, Autonomous (0-1 prompts)
Skip Phase 3 user checkpoint. Auto-rank hypotheses and proceed. **Use only when bug is reproducible and time-critical.**

### 2. Interactive Mode — Balanced **[DEFAULT]**
Phase 3 ranked hypotheses shown to user before testing. Phase 6 post-mortem includes architectural recommendation review.

### 3. Pre-Flight Planning — Comprehensive
Phase 1 budget cap explicit. Phase 5 seam analysis required before fix.

**Parameter:** `mode` (optional, default: `interactive`)

---

## Step 0: IDS Registry Check + Known Fixes (Advisory)

Before building feedback loop, query existing knowledge:

1. `mcp__aios-brain-bridge__search_known_fixes` with bug keywords
2. Check `.out-of-scope/` for related rejections (e.g. "we tried X, didn't work because Y")
3. Read project's `CONTEXT.md` to use correct domain vocabulary
4. If similar incident found → present to user, ask if same root cause

**Advisory only.** Even on match, run full diagnose if user wants verification.

---

## Mind Clone Consultation (Triggered)

For complex bugs, consult before Phase 3 hypothesise:
- **Performance regressions** → `brendan-gregg` (USE method, perf bisection)
- **Distributed/concurrency bugs** → `martin-kleppmann`, `charity-majors` (observability)
- **State/data corruption** → `martin-fowler`, `chip-huyen`
- **Build/CI mysteries** → `gene-kim`, `kelsey-hightower`
- **Frontend rendering bugs** → `dan-abramov`, `kent-c-dodds`

Use `node .aios-core/core/jarvis/self-consultation.js consult --expert "{id}" --question "{repro + symptom}"` BEFORE generating hypotheses to avoid anchoring on first idea.

---

## Purpose

A discipline for hard bugs and performance regressions. Skip phases only when explicitly justified.

> **Rule:** No staring at code without a feedback loop. The loop is the skill.

---

## Phase 1 — Build a feedback loop

**This is the skill.** Everything else is mechanical. If you have a fast, deterministic, agent-runnable pass/fail signal for the bug, you will find the cause — bisection, hypothesis-testing, and instrumentation all just consume that signal. If you don't have one, no amount of staring at code will save you.

Spend disproportionate effort here. **Be aggressive. Be creative. Refuse to give up.**

### Ways to construct one — try in roughly this order

1. **Failing test** at whatever seam reaches the bug — unit, integration, e2e.
2. **Curl / HTTP script** against running dev server.
3. **CLI invocation** with fixture input, diffing stdout vs known-good snapshot.
4. **Headless browser script** (Playwright via MCP) — drives UI, asserts on DOM/console/network.
5. **Replay captured trace.** Save real network request / payload / event log to disk; replay through code path in isolation.
6. **Throwaway harness.** Spin up minimal subset of system (one service, mocked deps) exercising bug code path with single function call.
7. **Property / fuzz loop.** "Sometimes wrong output" → run 1000 random inputs, look for failure mode.
8. **Bisection harness.** If bug appeared between two known states (commit, dataset, version), automate "boot at state X, check, repeat" so you can `git bisect run` it.
9. **Differential loop.** Same input through old-version vs new-version (or two configs), diff outputs.
10. **HITL bash script.** Last resort. If a human must click, drive them with a script so loop is still structured.

> **Build the right feedback loop, and the bug is 90% fixed.**

### Iterate on the loop itself

Treat the loop as a product. Once you have *a* loop, ask:
- Faster? (Cache setup, skip unrelated init, narrow test scope.)
- Sharper signal? (Assert on specific symptom, not "didn't crash".)
- More deterministic? (Pin time, seed RNG, isolate filesystem, freeze network.)

A 30-second flaky loop is barely better than no loop. A 2-second deterministic loop is a debugging superpower.

### Non-deterministic bugs

Goal is not clean repro but **higher reproduction rate**. Loop the trigger 100×, parallelise, add stress, narrow timing windows, inject sleeps. A 50%-flake bug is debuggable; 1% is not — keep raising rate until debuggable.

### When you genuinely cannot build a loop

Stop and say so explicitly. List what you tried. Ask user for: (a) access to environment that reproduces, (b) captured artifact (HAR, log dump, core dump, screen recording w/ timestamps), or (c) permission to add temporary production instrumentation. Do **not** proceed without a loop.

**Do not proceed to Phase 2 until you have a loop you believe in.**

---

## Phase 2 — Reproduce

Run the loop. Watch the bug appear.

Confirm:
- [ ] Loop produces failure mode the **user** described — not a different failure that happens to be nearby. Wrong bug = wrong fix.
- [ ] Failure is reproducible across multiple runs (or, for non-deterministic, reproducible at high enough rate to debug against).
- [ ] You captured exact symptom (error message, wrong output, slow timing) so later phases can verify the fix actually addresses it.

Do not proceed until you reproduce the bug.

---

## Phase 3 — Hypothesise

Generate **3–5 ranked hypotheses** before testing any. Single-hypothesis generation anchors on first plausible idea.

Each hypothesis must be **falsifiable**: state the prediction it makes.

> Format: "If `<X>` is the cause, then `<changing Y>` will make the bug disappear / `<changing Z>` will make it worse."

If you cannot state the prediction, the hypothesis is a vibe — discard or sharpen.

**Show ranked list to user before testing** (interactive mode). They often have domain knowledge that re-ranks instantly ("we just deployed change to #3"), or know hypotheses already ruled out. Cheap checkpoint, big time saver. Don't block on it — proceed with your ranking if user is AFK.

---

## Phase 4 — Instrument

Each probe must map to a specific prediction from Phase 3. **Change one variable at a time.**

Tool preference:
1. **Debugger / REPL inspection** if env supports it. One breakpoint beats ten logs.
2. **Targeted logs** at boundaries that distinguish hypotheses.
3. Never "log everything and grep".

**Tag every debug log** with unique prefix, e.g. `[DEBUG-a4f2]`. Cleanup at end becomes a single grep. Untagged logs survive; tagged logs die.

**Perf branch.** For performance regressions, logs are usually wrong. Instead: establish baseline measurement (timing harness, `performance.now()`, profiler, query plan), then bisect. Measure first, fix second.

---

## Phase 5 — Fix + regression test

Write the regression test **before the fix** — but only if there is a **correct seam** for it.

A correct seam is one where the test exercises the **real bug pattern** as it occurs at the call site. If the only available seam is too shallow (single-caller test when bug needs multiple callers, unit test that can't replicate the chain that triggered the bug), a regression test there gives false confidence.

**If no correct seam exists, that itself is the finding.** Note it. The codebase architecture is preventing the bug from being locked down. Flag for next phase.

If correct seam exists:
1. Turn minimised repro into failing test at that seam.
2. Watch it fail.
3. Apply the fix.
4. Watch it pass.
5. Re-run Phase 1 feedback loop against the original (un-minimised) scenario.

---

## Phase 6 — Cleanup + post-mortem

Required before declaring done:
- [ ] Original repro no longer reproduces (re-run Phase 1 loop)
- [ ] Regression test passes (or absence of seam is documented)
- [ ] All `[DEBUG-...]` instrumentation removed (`grep` the prefix)
- [ ] Throwaway prototypes deleted (or moved to clearly-marked debug location)
- [ ] Hypothesis that turned out correct is stated in commit / PR message — so next debugger learns

**Then ask: what would have prevented this bug?** If answer involves architectural change (no good test seam, tangled callers, hidden coupling) — invoke `@architect` with specifics. Make recommendation **after** fix is in, not before — you have more information now than when you started.

### Publish to Mega Brain

After fix lands, call `mcp__aios-brain-bridge__publish_aios_insights` with:
```yaml
project: {project-id}
insights:
  - type: pattern    # if architectural finding
  - type: risk       # if root cause is recurring class of bug
  - type: decision   # if fix involved tradeoff
```

---

## Acceptance Criteria

- [ ] Phase 1 loop documented and rerunnable by another agent
- [ ] All hypotheses (ranked) preserved in story / PR description
- [ ] Regression test exists OR seam absence is explicitly noted
- [ ] No `[DEBUG-*]` traces left in code
- [ ] Post-mortem captured (commit message, PR body, or insight publish)
- [ ] If architectural recommendation made → handoff issue or story created

---

## Anti-Patterns (Auto-Block)

- ❌ Hypothesising before reproducing
- ❌ "I think it's probably X" with no falsifiable prediction
- ❌ Multiple log statements without `[DEBUG-*]` prefix
- ❌ Marking done without re-running Phase 1 loop
- ❌ Skipping Phase 6 architectural question
- ❌ "Random sleep fixed it" → not a fix, that's a delay; root-cause it

---

## Related

- `.aios-core/development/tasks/apply-qa-fixes.md` — for QA-flagged fixes
- `.aios-core/development/tasks/correct-course.md` — when bug indicates wrong direction, not just defect
- `mcp__aios-brain-bridge__search_known_fixes` — query past incidents
- `.out-of-scope/` — check for known dead-end approaches

---

## Attribution

Phases 1–6 methodology adapted from Matt Pocock's diagnose skill (MIT license).
Original: https://github.com/mattpocock/skills/tree/main/skills/engineering/diagnose
AIOS adaptations: IDS pre-check, mind clone routing, execution modes, insight publishing.
