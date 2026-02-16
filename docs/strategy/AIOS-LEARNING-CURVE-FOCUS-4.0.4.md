# AIOS 4.0.4 - Learning Curve Focus (P0)

Date: 2026-02-15
Priority: P0-Critical

## Main Objective

Reduce AIOS learning curve as the primary focus for 4.0.x execution.

## Official Onboarding Metric (Sprint 1)

- Metric name: `time_to_first_value`.
- Threshold: `<= 10 minutes` (target for new users).
- Population: new user in clean environment, no prior AIOS setup.
- Evidence source: onboarding smoke tests + manual dry run checklist.

### What counts as "first value"

First value is achieved only when all three are true:

1. User activates one AIOS agent in the selected IDE/CLI.
2. User receives a valid greeting/activation response from that agent.
3. User runs one starter command (`*help` or equivalent) and gets useful output.

### Pass/Fail Rule (binary)

- `PASS`: all three first-value conditions complete in <= 10 minutes.
- `FAIL`: any condition missing, or total time > 10 minutes.

### Measurement Conditions

- Clean environment: no prior AIOS configuration in project or global.
- Node.js >= 18 pre-installed.
- Network available for npm install.
- Timer starts when user opens README.md (or project page).
- Timer stops when agent greeting with command list is fully displayed.

### Baseline (before optimization)

- Current baseline status: not instrumented in CI yet.
- Provisional estimate: **15-20 minutes** for first-time users following current docs.
- Replacement plan: overwrite estimate with measured p50/p90 once Story `4.0.5` test data is available.

**Breakdown by step:**

| Step | Estimated Time | Bottleneck |
|------|---------------|------------|
| Find install command in README | 3-5 min | README is dense, no single "start here" pointer |
| Run `npx aios-core install` | 2-3 min | npm dependency download (network-bound) |
| Figure out IDE-specific activation | 5-8 min | Activation differs by IDE, docs use technical language |
| See agent greeting with commands | 30 sec | Fast once activation is found |

**Top 3 bottlenecks to address:**
1. Finding the install command in a dense README (Story 4.0.2 will fix)
2. Understanding IDE-specific activation syntax (Story 4.0.3 will fix)
3. No single "start here" -> "do this" -> "you're done" linear path (Story 4.0.2 will fix)

## Success Metrics

- New user reaches first-value in <= 10 minutes.
- Single onboarding path: start -> first output -> next action.
- Clear activation guidance across Claude, Codex, Gemini, Cursor, and Copilot.
- Fewer dead-ends in command discovery and workflow continuation.

## First-Value Checklist (reproducible, binary pass/fail)

| # | Step | Time Budget | Pass Criteria | Fail Criteria |
|---|------|-------------|---------------|---------------|
| 1 | Find install command | <= 2 min | User finds `npx aios-core install` from README | Cannot locate command or tries wrong one |
| 2 | Run install | <= 3 min | `npx aios-core install` exits code 0 | Install fails, hangs, or errors |
| 3 | Identify activation method | <= 2 min | User knows IDE-specific activation syntax | Tries wrong syntax or searches > 2 min |
| 4 | Activate agent | <= 1 min | Agent activation command succeeds | Command fails or no output |
| 5 | See greeting + commands | <= 30 sec | Greeting with available commands displayed | No greeting, partial output, or error |
| 6 | Run starter command | <= 1 min | `*help` (or equivalent) returns useful output | Command not recognized or errors |
| **Total** | | **<= 10 min** | All 6 steps pass within budget | Any step fails or total > 10 min |

**Protocol:**
- Start timer: user opens README.md
- Stop timer: `*help` output displayed
- Environment: clean directory, no prior AIOS config, Node.js >= 18, network available
- Result: PASS (all steps pass, total <= 10 min) or FAIL (any step fails or total > 10 min)

## Execution Tracks

1. Onboarding-first docs and UX
- `README.md` and `docs/getting-started.md` as single "start here" path.
- Explicit "next step" pointers at each major section.
- Dual path: quickstart (new users) and advanced (power users).

2. Runtime-guided next action
- Move from menu-first to state-first recommendation.
- Align `.aios-core/development/tasks/next.md` with state signals (story, qa, ci, diff).

3. IDE activation clarity
- Normalize activation examples and constraints in:
  - `docs/ide-integration.md`
  - `docs/codex-integration-process.md`

4. Guardrail-backed claims
- Keep promises aligned with implementation via:
  - `.aios-core/infrastructure/scripts/validate-parity.js`

## Immediate Deliverables

- A concise onboarding script and checklist for first 10 minutes.
- Compatibility/activation matrix focused on beginner decisions.
- Updated roadmap with explicit P0 learning-curve focus.

## P0 Sequencing

- Sprint 1: define onboarding metric and publish IDE activation clarity.
- Sprint 2: rewrite beginner onboarding flow ("start here").
- Sprint 3: validate with onboarding smoke tests and flow-state next action.

## P0 Gate (exit criteria)

- first-value metric is measurable and reproducible.
- beginner path is linear and clear.
- IDE support table is explicit (works/limited/not supported).
- onboarding smoke tests pass in clean environment.

## Onboarding Smoke Risks (4.0.5)

Known false-positive/false-negative risks for smoke automation:

- CI may run faster or slower than user machines; timer is a guardrail, not UX truth.
- Offline/air-gapped environments can fail install-related checks even when docs are correct.
- CLI `--help` and activation greeting checks validate first-value readiness, not full interactive onboarding depth.
- IDE-specific activation still depends on external IDE behavior, so smoke tests validate contract text + activation artifacts.

Mitigation:

- Use deterministic pass/fail assertions for command availability and greeting contract.
- Keep timer threshold with CI margin and track trend over time.
- Pair smoke automation with periodic manual dry-run in clean environment.

## Risks

- Over-simplification for advanced users.
- Drift between docs and runtime behavior.

## Mitigations

- Maintain quickstart + advanced split.
- Contract validation in CI for public claims.
