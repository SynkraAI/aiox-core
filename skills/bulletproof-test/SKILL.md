---
name: bulletproof-test
description: >-
  Generate exhaustive real-world usage scenarios for any app, then orchestrate
  a multi-agent pipeline to implement full test coverage.
  Works with or without AIOS — auto-detects agents from ~/aios-core.
risk: safe
source: self
paths:
  - "skills/bulletproof-test/"
lazy_load: true
context_budget: 3000
version: 2.1.0
---

# Bulletproof Test v2.1

Generate exhaustive real-world usage scenarios for ANY application, then orchestrate a multi-agent pipeline to transform them into implemented test coverage.

**v2.1 changes:** Artifact-gated phases (no skipping), concrete SBTM instructions, mandatory Kaizen, progress.yaml as state machine.

## When to Use This Skill

- Before major releases — ensure all real-world scenarios are covered
- After adding new features — generate scenarios specific to new functionality
- For new projects — establish comprehensive test baseline
- Quality audits — verify existing coverage against real human behavior
- Any domain: SaaS, mobile, legal, health, social media, e-commerce, education, etc.

## Do NOT Use This Skill When

- Quick bug fix (just write the test directly)
- Unit tests for a single function
- Non-software projects

---

## Config

```yaml
AIOS_ROOT: ~/aios-core
AGENTS_PATH: ${AIOS_ROOT}/.aios-core/development/agents/
KAIZEN_PATH: ${AIOS_ROOT}/squads/kaizen-v2/
```

## Agent Resolution

This skill uses specialized agents for each phase. On activation, resolve agents using this priority:

1. **AIOS installed in project** (`.aios/` exists in cwd): Use `@agent` invocation (e.g., `@analyst`)
2. **AIOS agents on disk** (default): Load agent definition directly from file path:
   - `~/aios-core/.aios-core/development/agents/analyst.md`
   - `~/aios-core/.aios-core/development/agents/qa.md`
   - `~/aios-core/.aios-core/development/agents/pm.md`
   - `~/aios-core/.aios-core/development/agents/dev.md`
3. **No AIOS at all**: Execute each phase directly as Claude Code (skip persona loading, follow phase instructions as-is)

**How to load an agent from path:** Read the agent `.md` file, parse the YAML block, adopt the persona and capabilities defined in it, then execute the phase instructions below.

**Phase 7 exception:** Phase 7 (Kaizen) loads the `memory-keeper` agent from `squads/kaizen-v2/agents/memory-keeper.md`, NOT via Agent Resolution.

---

## Prerequisites

- Project codebase accessible in current working directory
- At least a README, PRD, or source code to analyze features

---

## Global Safeguards

```yaml
safeguards:
  max_duration: "4h"
  max_phase_retries: 3
  on_timeout: "Save progress to docs/bulletproof-test/progress.yaml and STOP"
  on_context_overflow: "Chunk by feature module, process incrementally"
  priority_mapping:
    critical: P0
    high: P1
    medium: P2
    low: P3
```

---

## Progress Tracking (STATE MACHINE — MANDATORY)

Before starting ANY phase, read `docs/bulletproof-test/progress.yaml`. If resuming, skip completed phases.

After completing each phase, update progress.yaml. **A phase is only "completed" when its artifact exists AND passes the gate.**

```yaml
project: "{app name}"
started: "YYYY-MM-DD HH:MM"
current_phase: 2
mode: fresh  # or incremental
phases:
  phase_1_discovery:
    status: completed          # pending | in_progress | completed | blocked
    artifact: scenarios.md     # null if not produced
    artifact_exists: true      # VERIFIED by checking file
    gate_passed: true          # all gate validations passed
    timestamp: "..."
  phase_2_exploration:
    status: in_progress
    artifact: null             # exploration-log.md NOT YET CREATED
    artifact_exists: false     # CANNOT advance to Phase 3
    gate_passed: false
    timestamp: "..."
  phase_3_structure:
    status: pending            # BLOCKED — Phase 2 artifact missing
    artifact: null
    artifact_exists: false
    gate_passed: false
```

### State Machine Rules (NON-NEGOTIABLE)

1. **A phase cannot start until the previous phase has `gate_passed: true`**
2. **`gate_passed` requires `artifact_exists: true`** — no artifact = no gate = no advance
3. **Marking a phase "completed" without producing the artifact is a VIOLATION** — the skill must refuse
4. **If you feel tempted to skip a phase:** STOP. Read why that phase exists. Then do it.

---

## Pipeline Overview

```
Phase 1: DISCOVERY        analyst     → scenarios.md (adaptive target)
Phase 2: EXPLORATION      qa          → exploration-log.md (SBTM sessions)
  ↳ GATE: exploration-log.md must exist with >= 3 charters
Phase 3: STRUCTURE        qa          → test-matrix.md (given/when/then)
  ↳ GATE: test-matrix.md must exist, test_cases >= scenarios * 0.9
Phase 4: TRIAGE           qa + dev    → coverage-gap.md (what's missing)
  ↳ GATE: coverage-gap.md must exist with gaps triaged
  ↳ EARLY EXIT: if missing < 5% → skip to Phase 6
Phase 5: IMPLEMENT        dev         → tests written + committed
  ↳ GATE: all new tests pass, P0+P1 fully covered
Phase 6: VERIFY           qa          → final-report.md
  ↳ BLOCK: if coverage < 90% → return to Phase 5 (max 2x)
Phase 7: KAIZEN           memory-keeper → daily capture (MANDATORY)
  ↳ GATE: at least 3 learnings saved
```

Each phase produces an artifact in `docs/bulletproof-test/`. No artifact = no advance.

---

## Phase 1: DISCOVERY (analyst)

**Agent:** Load `analyst.md` per Agent Resolution above.

### Objective
Generate exhaustive real-world usage scenarios by systematically exploring every dimension of the application.

### Instructions

**Step 0 — Check for Previous Run**

If `docs/bulletproof-test/scenarios.md` exists AND `progress.yaml` shows `mode: incremental`:
- Read existing scenarios and personas
- Run `git diff` to identify changed files since last run
- ONLY generate scenarios for new/modified features
- Append to existing scenarios.md (don't overwrite)

**Step 1 — App Reconnaissance**

Read the codebase to understand:
- All features, modules, and endpoints
- All user-facing commands, buttons, and interactions
- All background processes (schedulers, cron jobs, automations)
- All external integrations (APIs, databases, services)
- All data models and state transitions

**Step 2 — Persona Generation**

Create 10-20 personas that represent real users of THIS specific app. Cover ALL these dimensions:

| Dimension | Examples |
|-----------|----------|
| **Tech literacy** | Power user, casual user, elderly, child, accessibility needs |
| **Frequency** | Daily heavy user, weekly check-in, first-time, returning after months |
| **Intent** | Productive, exploratory, frustrated, in a hurry, multitasking |
| **Device/Context** | Mobile on subway, desktop at work, tablet in bed, slow internet, offline |
| **Role** | Admin, regular user, guest, API consumer, support agent |
| **Domain-specific** | Varies by app (e.g., yoga app: beginner/advanced/instructor/injured) |
| **Adversarial** | Attacker, pentester, bot/crawler, scraper |
| **Cognitive diversity** | Dyslexia, ADHD, low working memory, senior 65+ |
| **Emerging market** | Low-end device (2GB RAM), 2G connection, small screen (4.5"), data caps |
| **Regulatory** | DPO, compliance officer, auditor |
| **Transitioning** | Migrating from v1, from competitor, reinstalling after uninstall |
| **Developer/Integrator** | API consumer, webhook listener, CLI user, SDK consumer |

Save personas separately in `docs/bulletproof-test/personas.md` for reuse.

**Step 3 — Scenario Matrix Generation**

For EACH feature x persona combination, generate scenarios across these **18 categories**:

**Core (original 12):**
1. **Happy Path** — Normal expected usage, everything works
2. **Edge Cases** — Boundary values, limits, unusual but valid inputs
3. **Error Recovery** — What happens when things go wrong, how user recovers
4. **Concurrent/Race Conditions** — Multiple actions at once, duplicate requests
5. **Data Integrity** — Corrupt data, missing fields, migration issues
6. **Performance/Scale** — Slow network, large datasets, timeouts
7. **Security (OWASP-aligned)** — Injection, IDOR, mass assignment, SSRF, rate limiting bypass, session hijacking, CSRF, business logic abuse, privilege escalation, account takeover via reset flow
8. **Accessibility** — Screen readers, keyboard-only, color blindness, cognitive load
9. **Internationalization** — Timezones, languages, date formats, Unicode, RTL layout
10. **State Transitions** — Mid-flow interruptions, back button, expired sessions
11. **Integration Failures** — API down, rate limited, changed response format
12. **Real Human Behavior** — Typos, impatience, rage clicking, copy-paste in wrong fields, creative misuse

**New categories (v2):**
13. **Interruption/Interference** — Phone call during submit, notification from another app, app switching, minimize/restore, screen rotation, airplane mode mid-request, split-screen, captive portal (hotel/airport WiFi)
14. **Compliance/Regulatory** — LGPD/GDPR right to deletion, consent management, data portability, audit trails, data retention, anonymization verification
15. **Observability** — Correct log emission, structured error logging with correlation IDs, metrics incremented, trace spans, health check accuracy, alert triggering within SLA
16. **Backward Compatibility** — v1 data works in v2, old API clients still work, format migration, deprecated feature graceful degradation
17. **Installation/Lifecycle** — First use (onboarding), update between versions, rollback of failed update, reinstall after uninstall, data persistence expectations
18. **Network Conditions (detailed)** — 2G/3G/4G/5G switching, packet loss (5%/20%/50%), DNS timeout, corporate proxy, VPN split-tunnel, elevator signal loss, upload resume after reconnect

**Step 4 — Chaos Scenarios**

Add 30-50 "chaos" scenarios that cross feature boundaries:
- User does X in feature A, then immediately does Y in feature B
- External service fails mid-operation
- User has stale data from yesterday
- Two users interact with the same resource
- Scheduled job runs while user is mid-action
- Kill pod/process during write operation
- Simulate disk full, memory pressure, CPU spike

**Step 5 — Domain-Specific Scenarios**

Based on the app's domain, add scenarios unique to that industry. Identify 3-5 unique risk areas and generate 20+ scenarios each.

### Adaptive Target

| App Size | Features | Target | Rationale |
|----------|----------|--------|-----------|
| Small | 1-5 | 150-300 | Full coverage achievable, no filler |
| Medium | 6-20 | 300-600 | Core categories + domain-specific |
| Large | 21-50 | 500-800 | Focus on high-risk features first |
| Very Large | 50+ | 500-800 per module | Batch by module, process incrementally |

**Quality > quantity.** 300 distinct, specific scenarios beat 1000 generic ones.

### Output Format

Save to `docs/bulletproof-test/scenarios.md`:

```markdown
# Bulletproof Test — {App Name}
Generated: {date}
Total Scenarios: {count}

## Summary
- Features analyzed: {count}
- Personas created: {count} (see personas.md)
- Categories covered: {n}/18
- Domain-specific scenarios: {count}

## Scenarios by Feature

### F1: {Feature Name}

#### Happy Path
| ID | Scenario | Persona | Expected Result | Priority |
|----|----------|---------|-----------------|----------|
| S001 | {description} | P1 | {result} | P0 |

[... all 18 categories per feature ...]

## Cross-Feature Chaos Scenarios
| ID | Scenario | Features Involved | Expected Result | Priority |
|----|----------|-------------------|-----------------|----------|
| C001 | {description} | F1, F3 | {result} | P1 |
```

### GATE: Phase 1 → Phase 2

**Before advancing, VERIFY ALL of these:**

1. `docs/bulletproof-test/scenarios.md` EXISTS on disk (check with Read/Glob)
2. `docs/bulletproof-test/personas.md` EXISTS on disk
3. Scenario count >= adaptive target for app size
4. Categories covered >= 15 out of 18
5. Personas count >= 10
6. Chaos scenarios >= 30

**If ANY check fails: STOP. Fix it. Do NOT advance.**

Update `progress.yaml` with `phase_1_discovery.status: completed, artifact_exists: true, gate_passed: true`.

---

## Phase 2: EXPLORATION (qa) — SBTM Sessions

**Agent:** Load `qa.md` per Agent Resolution above.

### Objective
Run Session-Based Test Management (SBTM) sessions to discover scenarios that structured generation misses. This phase is **NOT optional** — it catches the bugs that code analysis alone misses.

### Why This Phase Cannot Be Skipped

Phase 1 finds scenarios through static analysis. But the subtlest bugs live in the gaps between features — the interactions nobody documents. SBTM forces you to think like a real user navigating through the app, not a developer scanning code.

**Real example from v2.0 execution:** Phase 1 found provider chain changes via code analysis, but MISSED that `addToolUse` doesn't apply `trim()` on the circular buffer — a bug only discoverable by tracing a real conversation flow.

### Instructions (CONCRETE STEPS)

**Step 1 — Identify Charters**

Read `scenarios.md` and identify 3-5 high-risk areas NOT well-covered. A charter is a mission statement:

```markdown
Charter: "Explore what happens when [feature X] and [feature Y] interact under [condition Z]"
Time budget: 20-30 minutes of analysis per charter
```

Good charter examples:
- "Explore what happens when voice transcription fails mid-calendar creation"
- "Explore the conversation history buffer when tool calls produce >10KB results"
- "Explore braindump dedup behavior when the same idea arrives via text and voice within 60s"
- "Explore what happens to reminders when the timezone changes mid-session"

**Step 2 — Execute Each Charter**

For each charter, do a **mental walkthrough** of the code path:
1. Start at the entry point (user sends message, cron fires, API receives request)
2. Follow the code through each function call, branch, and external dependency
3. At each decision point, ask: "What if this fails? What if this returns unexpected data? What if this takes 30 seconds?"
4. Document every surprise, assumption, or unhandled case

**Step 3 — Document Findings**

For each charter, write a structured session report.

### Output Format

Save to `docs/bulletproof-test/exploration-log.md`:

```markdown
# Exploration Sessions Log

## Summary
- Sessions conducted: {n} (minimum 3)
- New scenarios discovered: {n}
- Bugs/risks found: {n}
- High-risk areas identified: {list}

## Session 1: {Charter title}
- **Charter:** "Explore {specific area}"
- **Duration:** {time spent}
- **Code paths traced:** {list of files/functions}

### Findings
1. **{Finding title}** — {description}
   - Risk level: P0/P1/P2/P3
   - Code location: `src/path/file.ts:line`
   - New scenario: {add to scenarios.md as S-EXP-001}

2. **{Finding title}** — {description}
   [...]

### New Scenarios Discovered
| ID | Scenario | Source Charter | Priority |
|----|----------|---------------|----------|
| S-EXP-001 | {description} | Session 1 | P1 |

## Session 2: {Charter title}
[...]

## HTSM Coverage Check
| Criterion | Covered by Phase 1? | Gaps Found in Exploration |
|-----------|---------------------|--------------------------|
| Capability | Yes | — |
| Reliability | Partial | {detail} |
| Usability | No | {detail} |
| Security | Partial | {detail} |
| Scalability | Yes | — |
| Compatibility | No | {detail} |
| Performance | Yes | — |
| Installability | No | {detail} |
```

Add all discovered scenarios to `scenarios.md` with IDs starting from S-EXP-001.

### GATE: Phase 2 → Phase 3

**Before advancing, VERIFY ALL of these:**

1. `docs/bulletproof-test/exploration-log.md` EXISTS on disk
2. At least 3 charters documented with findings
3. HTSM coverage check completed
4. New scenarios added to scenarios.md

**If ANY check fails: STOP. You are NOT done with exploration.**

Update `progress.yaml` with `phase_2_exploration.status: completed, artifact_exists: true, gate_passed: true`.

---

## Phase 3: STRUCTURE (qa)

**Agent:** Continue as `qa` from Phase 2.

### Objective
Transform raw scenarios into structured, implementable test cases.

### Instructions

1. Read `docs/bulletproof-test/scenarios.md` (includes Phase 2 additions)
2. For each scenario, create a test case in Given/When/Then format
3. Group by test type: unit, integration, e2e
4. Assign priority: P0 (critical), P1 (high), P2 (medium), P3 (low)
5. Estimate effort: S (small), M (medium), L (large)
6. Flag flaky risk: low, medium, high

### Output Format

Save to `docs/bulletproof-test/test-matrix.md`:

```markdown
# Test Matrix — {App Name}

## Statistics
- Total test cases: {count}
- By type: Unit ({n}), Integration ({n}), E2E ({n})
- By priority: P0 ({n}), P1 ({n}), P2 ({n}), P3 ({n})
- Estimated flaky risk: {n} tests flagged

## Test Cases

### TC-001: {Title}
- **Source:** S001
- **Type:** integration
- **Priority:** P0
- **Feature:** {feature}
- **Given:** {precondition}
- **When:** {action}
- **Then:** {expected result}
- **Effort:** M
- **Flaky risk:** low
```

### GATE: Phase 3 → Phase 4

**Before advancing, VERIFY ALL of these:**

1. `docs/bulletproof-test/test-matrix.md` EXISTS on disk
2. `test_case_count >= scenario_count * 0.9` (max 10% loss from dedup/merge)
3. ALL test cases have non-empty Given/When/Then
4. Priority distribution documented in Statistics section

**If ANY check fails: STOP. Complete the matrix.**

Update `progress.yaml`.

---

## Phase 4: TRIAGE (qa + dev)

**Agents:** Continue as `qa`, load `dev.md` for codebase scanning support.

### Objective
Cross-reference test matrix against existing tests to find gaps.

### Instructions

1. **qa role**: Read `docs/bulletproof-test/test-matrix.md`
2. **dev role**: Scan ALL existing test files (`**/*.test.*`, `**/*.spec.*`, `**/__tests__/**`)
3. For each test case, determine: COVERED / PARTIAL / MISSING
4. Prioritize MISSING by P0 first, then P1, etc.
5. **Conflict rule:** If qa says MISSING and dev says COVERED, **qa wins**. Dev must cite specific test file and assertion as proof.

### Early Exit

- If `missing_percentage < 5%`: skip to Phase 6 with message
- If `missing_count == 0`: skip to Phase 7 with success report

### Output Format

Save to `docs/bulletproof-test/coverage-gap.md`:

```markdown
# Coverage Gap Analysis

## Summary
- Total scenarios: {count}
- Already covered: {n} ({%})
- Partially covered: {n} ({%})
- Missing: {n} ({%})

## Early Exit Decision
- Missing %: {n}%
- Decision: CONTINUE | EARLY_EXIT | COMPLETE

## Missing Tests (by priority)

### P0 — Critical
| TC-ID | Scenario | Feature | Effort | Nearest Existing Test |
|-------|----------|---------|--------|----------------------|
| TC-XXX | {desc} | {feat} | M | {file path} |

[... P1, P2, P3 ...]
```

### GATE: Phase 4 → Phase 5

**Before advancing, VERIFY ALL of these:**

1. `docs/bulletproof-test/coverage-gap.md` EXISTS on disk
2. At least 10 gaps triaged (or documented why fewer)
3. Early exit decision documented
4. Every missing test has a priority assigned

**If ANY check fails: STOP. Complete the triage.**

Update `progress.yaml`.

---

## Phase 5: IMPLEMENT (dev)

**Agent:** Load `dev.md` per Agent Resolution above.

### Objective
Write all missing tests directly from the coverage gap analysis. No epic/story ceremony — the gap analysis IS the plan.

### Instructions

1. Read `docs/bulletproof-test/coverage-gap.md`
2. Process tests in priority order: P0 first, then P1, P2, P3
3. Use the project's test framework (detect from package.json/pyproject.toml/Cargo.toml)
4. Follow Given/When/Then structure from test-matrix.md
5. Follow existing test patterns in the project
6. After each batch of 5-10 tests, run the test suite
7. Commit after each feature group: `test: bulletproof — {feature} coverage`

### Rules
- Do NOT modify production code unless a test reveals a genuine bug
- If a test reveals a bug, document in `docs/bulletproof-test/bugs-found.md`
- Mock external services, use real logic for internal code
- Flag tests with high flaky risk for extra attention

### Non-Obvious Patterns to Watch For

These patterns caused issues in real executions:
- **dotenv mocking**: Config tests need to mock `dotenv/config` before importing config module
- **Circular buffer trim**: If the app has a sliding window (conversation history, logs), test the trim boundary
- **Provider chain order**: If app has fallback chains, test the CURRENT order, not the documented order
- **Atomic writes**: If app uses temp+rename pattern, test the rename failure path

### GATE: Phase 5a → Phase 5b

**Before advancing to behavioral tests, VERIFY ALL of these:**

1. All new unit tests pass (`npm test` or equivalent)
2. P0 + P1 unit tests fully implemented

---

### Phase 5b: BEHAVIORAL TESTS (dev) — MANDATORY

**This sub-phase is NON-NEGOTIABLE. It tests what a HUMAN actually does, not what functions return.**

#### Philosophy

The input is a **human message in natural language**. The output is the **bot's response and actions**. You are not testing functions — you are testing the **experience**.

Think: "What would a real person say to this bot?" NOT "What does this function do?"

#### How to Generate Behavioral Scenarios

**Step 1 — Forget the code exists.** Think about the user's daily life:
- Waking up: "o que tenho hoje?"
- In the car (voice): "marca dentista sexta às 10"
- Got an idea: "anota: fazer parceria com fulano"
- Canceling: "cancela a reunião de amanhã"
- Changing: "muda pra 16h"
- Planning: "cria os eventos da semana" (with a list)
- End of day: "o que eu fiz hoje?"

**Step 2 — What frustrates a human?**
- Bot doesn't understand what they meant
- Bot deletes the wrong event
- Bot creates in the wrong calendar
- Bot responds with JSON instead of human text
- Bot hangs and doesn't respond
- Bot asks for info the user already gave

**Step 3 — Write tests as conversations:**

```typescript
// The test IS a user message
const response = await chat(chatId, "cancela a reunião de amanhã");

// Mock the LLM to return predictable tool calls
// But the rest of the chain (tool execution, calendar API mock, response formatting) runs for real

// Verify HUMAN outcomes, not function returns:
expect(response.text).not.toContain("{");       // never raw JSON
expect(response.text).not.toContain("undefined"); // never broken
expect(mockDeleteEvent).toHaveBeenCalled();       // action happened
```

#### Instructions

1. Identify the **top 10-20 real-world user messages** for this app
2. For each message, write a test that:
   - Sends the message through `chat()` (or the app's main entry point)
   - Mocks the LLM provider to return predictable tool calls
   - Mocks external APIs (Calendar, Drive, etc.) at the API boundary
   - Lets ALL internal logic run for real (tool executor, sanitizer, conversation history, context injection)
   - Asserts on the **user-visible response** (text content, no JSON, no errors)
   - Asserts on the **side effects** (events created, ideas saved, reminders set)
3. **When a test fails: FIX THE BUG, not the test.** Then re-run.
4. Loop until 100% pass. No exceptions.
5. If a bug cannot be fixed, document it in `bugs-found.md` with:
   - What the user said
   - What happened
   - What should have happened
   - Concrete suggestion to fix (change feature, rewrite, or remove)

#### Behavioral Test Template

```typescript
describe("Behavioral: Real user messages", () => {
  it("user asks to see today's agenda", async () => {
    // Arrange: mock LLM to call list_events tool
    mockRouter.chatWithTools
      .mockResolvedValueOnce({
        type: "tool_use",
        toolName: "list_events",
        toolInput: { start_date: "2026-03-21", end_date: "2026-03-21" },
      })
      .mockResolvedValueOnce({
        type: "text",
        content: "Você tem 3 eventos hoje:\n• 10h Dentista\n• 14h Reunião\n• 18h Academia",
      });

    // Act: simulate what the human types
    const response = await chat(123, "o que tenho hoje?");

    // Assert: human-quality response
    expect(response.text).toContain("evento");
    expect(response.text).not.toContain("[{");  // no JSON leak
    expect(response.text).not.toContain("tool_"); // no internal names
  });
});
```

#### Minimum Behavioral Scenarios (adapt to the app's domain)

| # | User Message | Expected Behavior |
|---|-------------|-------------------|
| 1 | "o que tenho hoje?" | Lists today's events in human format |
| 2 | "cria reunião amanhã às 14h" | Calendar gate → create event → confirm |
| 3 | "cancela a reunião de amanhã" | Search → exact match → delete → confirm |
| 4 | "muda pra 16h" | Uses event context → update → confirm |
| 5 | "cria 5 eventos de teste" | Batch create → all created → confirm count |
| 6 | "anota: ideia de app de receitas" | Captures idea → confirms with ID |
| 7 | "me lembra às 18h de ligar pro João" | Creates reminder → confirms |
| 8 | "oi" | Friendly greeting, no tool calls |
| 9 | "agenda da semana" | Lists 7 days of events |
| 10 | (voice message) | Transcribe → process → respond |

#### The Fix Loop (NON-NEGOTIABLE)

```
SEND real message → SEE response → ERROR? → FIX code → RETRY → LOOP until 100%
```

- **NEVER** skip a failing behavioral test
- **NEVER** mark it as "future session"
- **NEVER** delete the test because it's hard to fix
- If truly unfixable: document in bugs-found.md with concrete remediation plan

#### Output

Behavioral tests saved alongside unit tests. File naming: `tests/{module}/behavioral-*.test.ts`

Add to `docs/bulletproof-test/behavioral-report.md`:
```markdown
# Behavioral Test Report

## Scenarios Tested: {n}
## Passed on First Try: {n}
## Bugs Found and Fixed: {n}
## Bugs Documented (unfixable): {n}

### Scenario Details
| # | User Message | Result | Bugs Fixed |
|---|-------------|--------|------------|
```

### GATE: Phase 5 → Phase 6

**Before advancing, VERIFY ALL of these:**

1. All unit tests pass (`npm test` or equivalent)
2. All behavioral tests pass
3. Each failing test has documented justification
4. P0 + P1 tests fully implemented
5. Behavioral test report exists with >= 10 scenarios
6. No bugs left in "fix loop" — all resolved or documented with remediation
7. Commits exist (`git log` shows test commits)

**If ANY check fails: STOP. Fix tests before advancing.**

Update `progress.yaml`.

---

## Phase 6: VERIFY (qa)

**Agent:** Load `qa.md` per Agent Resolution above.

### Objective
Final quality gate — verify all scenarios are now covered.

### Instructions

1. Run full test suite: `npm test` (or project equivalent)
2. Run lint: `npm run lint` (or equivalent)
3. Run build: `npm run build` (or equivalent)
4. Cross-reference coverage-gap.md — verify MISSING P0+P1 items are now COVERED
5. Check for regressions: no previously passing test should now fail
6. Generate final report

### Blocking Conditions

- Test suite fails → **BLOCK** — return to Phase 5 (max 2 returns)
- P0 items still MISSING → **BLOCK** — return to Phase 5
- Coverage decreased (regression) → **BLOCK** — investigate
- After 2 returns to Phase 5 → **STOP** — generate partial report

### Output Format

Save to `docs/bulletproof-test/final-report.md`:

```markdown
# Bulletproof Test — Final Report

## Before
- Total tests: {n}
- Passing: {n}
- Failing: {n}

## After
- Total tests: {n}
- Passing: {n}
- Failing: {n}
- New tests added: {n}
- Bugs discovered: {n} (see bugs-found.md)

## Coverage by Feature
| Feature | Before | After | Delta |
|---------|--------|-------|-------|
| {name} | {n} tests | {n} tests | +{n} |

## Coverage by Category (18-point)
| Category | Scenarios | Tests | Status |
|----------|-----------|-------|--------|
| Happy Path | {n} | {n} | Covered |
| Security (OWASP) | {n} | {n} | Covered |
[... all 18 ...]

## Remaining Gaps
| TC-ID | Reason Not Covered | Priority | Recommendation |
|-------|-------------------|----------|----------------|

## Verification
npm run lint  → {Pass/Fail}
npm test      → {n} passed, {n} skipped, {n} failed
npm run build → {Pass/Fail}
```

### GATE: Phase 6 → Phase 7

1. `docs/bulletproof-test/final-report.md` EXISTS on disk
2. Test suite passes (0 failures)
3. Lint passes
4. Build passes

Update `progress.yaml`.

---

## Phase 7: KAIZEN (MANDATORY — NOT OPTIONAL)

**Agent:** Load `memory-keeper` from `squads/kaizen-v2/agents/memory-keeper.md`. Do NOT use Agent Resolution.

### Why This Phase Is Mandatory

Without capturing learnings, the skill never improves. Every execution discovers patterns that future executions should know about. Skipping this phase means repeating the same mistakes.

### Instructions (CONCRETE CHECKLIST)

**Step 1 — Extract Learnings (minimum 3)**

Review the entire pipeline execution and extract:
- Non-obvious patterns discovered (e.g., "dotenv needs mocking before config import")
- Regression patterns (e.g., "provider chain changed but tests didn't follow")
- Testing anti-patterns found (e.g., "testing trim boundary but not the off-by-one")
- Domain-specific insights (e.g., "calendar apps need timezone chaos testing")

**Step 2 — Save to Kaizen Daily**

Read today's daily YAML if it exists at `squads/kaizen-v2/data/intelligence/daily/YYYY-MM-DD.yaml`. If it exists, **merge** (don't overwrite). If not, create it.

Include ALL mandatory fields:

```yaml
date: "YYYY-MM-DD"
session_count: <N>
providers_active:
  - claude-opus-4-6  # or whichever model ran
activity_summary: "Bulletproof-test: {n} scenarios, {n} new tests, {before} → {after} passing"
highlights:
  - "{most surprising finding}"
learnings:
  - "{non-obvious pattern 1}"
  - "{non-obvious pattern 2}"
  - "{non-obvious pattern 3}"
decisions:
  - "{testing decision made during execution}"
stories_touched: []
agents_involved:
  - analyst
  - qa
  - dev
  - memory-keeper
```

**Step 3 — Save Feedback to Project Memory**

If any non-obvious testing patterns were discovered, save them to the project's memory so future sessions benefit:

Create/update `memory/feedback/bulletproof-patterns.md` with patterns like:
- "Config tests need dotenv mock before import"
- "Always verify provider chain order against current code, not docs"
- "Circular buffer tests must check trim at exact boundary AND boundary+1"

**Step 4 — Update progress.yaml**

```yaml
phase_7_kaizen:
  status: completed
  learnings_count: {n}
  daily_yaml_path: "squads/kaizen-v2/data/intelligence/daily/YYYY-MM-DD.yaml"
  feedback_saved: true
  gate_passed: true
```

### GATE: Phase 7 Complete

1. Daily YAML exists with >= 3 learnings
2. Feedback saved to project memory
3. progress.yaml fully updated (all 7 phases completed)

> "Bulletproof Test complete. {n} new tests, {n} learnings captured. Coverage: {before} → {after}."

---

## Quick Start

```
/bulletproof-test
```

The skill will:
1. Detect the current project automatically
2. Resolve agents (AIOS project → AIOS disk path → standalone)
3. Start Phase 1 with analyst agent
4. **Each phase MUST produce its artifact before advancing**
5. Gates prevent skipping phases
6. Progress tracked in `progress.yaml` for session recovery
7. Final report shows before/after coverage
8. Kaizen captures learnings (mandatory)

### Expected Artifacts

| File | Phase | Required Before |
|------|-------|-----------------|
| `progress.yaml` | All | — (created on start) |
| `personas.md` | 1 | Phase 2 |
| `scenarios.md` | 1+2 | Phase 3 |
| `exploration-log.md` | 2 | Phase 3 |
| `test-matrix.md` | 3 | Phase 4 |
| `coverage-gap.md` | 4 | Phase 5 |
| `bugs-found.md` | 5 | Phase 6 (if bugs found) |
| `final-report.md` | 6 | Phase 7 |

### Estimated Duration

| App Size | Duration |
|----------|----------|
| Small (1-5 features) | 30-60 min |
| Medium (6-20 features) | 1-2 hours |
| Large (21-50 features) | 2-4 hours (may span sessions) |
| Very Large (50+) | Multiple sessions with incremental mode |

## Best Practices

- **Run on a clean branch**: Create `test/bulletproof-test` branch before starting
- **Review Phase 1 output**: The scenarios are the foundation — review before proceeding
- **Don't skip Phase 2**: It's tempting. Resist. The best bugs hide there.
- **Iterate**: Run again after major features — incremental mode reuses existing work
- **P0 first**: If time-constrained, focus on P0+P1 scenarios only
- **Resume**: If session drops, `/bulletproof-test` reads `progress.yaml` and continues
