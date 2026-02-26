# B3 — Workflow Suggestion Systems (WorkflowNavigator)

**Research Target:** B3 — Workflow Suggestion Systems
**Story:** NOG-9 — UAP & SYNAPSE Deep Research
**Wave:** Wave 2 — UAP Steps
**Date:** 2026-02-21
**Researcher:** Deep Tech Research Agent

---

## Executive Summary

The AIOS WorkflowNavigator currently uses hardcoded pattern matching against command history to suggest the next step (e.g., after `*validate-story-draft` → suggest `*develop`). This research evaluated how leading AI dev tools and workflow systems handle next-action suggestion, what signals they use, and what architectural patterns are most effective.

**Key finding:** The industry has converged on a multi-signal approach that combines _edit/command history_ as the primary signal with _project state_ (git status, errors, files changed) as secondary signals. Pure pattern matching is the baseline — the frontier is context-aware trajectory models trained on real developer behavior sequences.

**Highest-value opportunity for AIOS:** Upgrade from single-signal (command history only) to a multi-signal scoring system using workflow state artifacts, git context, and elapsed-time heuristics. This can be done without ML — pure deterministic logic with weighted signals delivers most of the value.

---

## Research Findings by Question

### Q1: How do AI dev tools suggest next actions?

#### GitHub Copilot — Next Edit Suggestions (NES)

**Pattern:** History-of-edits as primary signal, not current cursor position.

Copilot NES (generally available December 2025) uses a fundamentally different context model from standard completions: it watches _recent edit history_ rather than just the current file state. This allows it to detect ripple effects — e.g., rename a variable once, NES suggests updating every downstream reference.

Key architectural detail from JetBrains' NES implementation (which mirrors Copilot's approach):
> "Unlike other models, the underlying model leverages a different type of context: the history of your recent changes as opposed to the current file and RAG."

**Signals used:**
- Recent edit history (diffs, not just current state)
- IDE code insights (linter errors, type errors)
- Chain setting: after accepting suggestion N, automatically request suggestion N+1

**Implementation:** Separate fine-tuned model (not the main completion model). Latency target: < 200ms for 80th percentile.

**UX pattern:** Gutter arrow indicator shows a suggestion is available. Tab to navigate to it. Tab again to accept. Escape to dismiss. "Chain suggestions" mode auto-requests the next after acceptance — creating a tab-tab-tab flow for multi-step refactorings.

Sources: [JetBrains NES announcement](https://blog.jetbrains.com/ai/2025/08/introducing-next-edit-suggestions-in-jetbrains-ai-assistant/), [VS Code NES blog](https://code.visualstudio.com/blogs/2025/02/12/next-edit-suggestions), [JetBrains NES GA](https://blog.jetbrains.com/ai/2025/12/next-edit-suggestions-now-generally-available/)

#### Cursor AI — Tab Prediction

**Pattern:** Custom model trained on action trajectories, not just tokens.

Cursor Tab goes beyond autocomplete — it predicts _what the developer will do next_ (next edit location + content), not just what they'll type. The key architectural insight:

> "Cursor Tab leverages a custom AI model that tracks your code history, recent edits, and even linter errors, making smarter, more relevant suggestions tailored to your current task."

After accepting a suggestion, Cursor highlights the _next logical edit location_ — pressing Tab again jumps there. The "tab-tab-tab" flow is a UX pattern for multi-step refactoring acceleration.

**The model is trained on trajectories** — sequences of actions — not just next-token prediction. This is a critical architectural distinction. The model learns _when_ to suggest, not just _what_ to suggest.

**Signals used:**
- Code history (recent edits)
- Linter errors
- Surrounding code context
- Active file + recently viewed files
- Semantic search results (RAG over codebase)

**Metrics:** 21% fewer suggestions, 28% higher accept rate (more precise, less noisy).

Sources: [Cursor tab guide](https://apidog.com/blog/cursor-tab/), [Cursor agent architecture](https://blog.bytebytego.com/p/how-cursor-shipped-its-coding-agent)

#### GitHub Copilot Workspace — Linear Workflow State Machine

**Pattern:** Explicit multi-phase workflow with user steering at each phase boundary.

Copilot Workspace implements a strict linear state machine:
```
Task → Specification → Plan → Implementation → PR
```

Each phase has a clear gate: the user can inspect/edit the spec before planning, edit the plan before implementation. Regeneration is cascading — editing the spec triggers all downstream phases to regenerate. This is effectively a deterministic FSM with human-in-the-loop at each transition.

**Relevance to AIOS:** This is conceptually identical to the Story Development Cycle (Draft → Ready → InProgress → InReview → Done). The key insight is that **making current state visible** and **offering explicit transition actions** is sufficient — you don't need ML to be useful.

Sources: [Copilot Workspace](https://githubnext.com/projects/copilot-workspace), [Copilot Workspace user manual](https://github.com/githubnext/copilot-workspace-user-manual)

#### Aider — Git-Integrated Workflow

**Pattern:** Git as workflow state backend. Each AI change = one commit.

Aider treats git not just as version control but as a workflow state tracking system. Every AI-generated change gets an automatic commit with a descriptive message. The `/undo` command is the "revert to previous state" button. Uncommitted changes trigger an automatic "checkpoint commit" before proceeding.

**Signals used:** git status, dirty files, uncommitted changes.

**Relevance to AIOS:** Git state (dirty working tree, staged files, recent commits) is a reliable, already-present signal for inferring where a developer is in their workflow.

Sources: [Aider git integration](https://aider.chat/docs/git.html), [Aider usage](https://aider.chat/docs/usage.html)

---

### Q2: Workflow State Machine Patterns

#### Finite State Machines (FSM) vs. Petri Nets

The two dominant academic/industrial models for workflow formalization:

**FSM (Finite State Machine):**
- Exactly one active state at a time
- Transitions triggered by events
- Simple to reason about, easy to implement
- Best for linear workflows with branching
- Tools: XState (JavaScript), Symfony Workflow, Ruby Workflow gem

**Petri Net:**
- Can model parallel execution (multiple tokens)
- Places = states, Transitions = events/triggers, Tokens = current state markers
- A transition fires when all input places have tokens
- Best for concurrent workflows, AND-split / AND-join patterns
- More expressive than FSM for parallel tracks

**XState (JavaScript) — Practical FSM Tool:**
The most relevant library for AIOS context. Key feature:
```javascript
lightMachine.transition(currentState, 'TIMER') // → nextState
```
XState can compute "what is the next state given this event?" programmatically. The [Stately Studio](https://stately.ai/viz) visualizer shows all possible transitions from a given state — this is essentially what a WorkflowNavigator needs to display.

**Pattern used in practice:**
Most dev tools use **simple if/else chains** for workflow suggestion, not formal FSMs. FSMs are used when:
1. The workflow is complex enough to warrant formal modeling
2. The tool needs to visualize transitions
3. Multiple parallel tracks exist

For AIOS's Story Development Cycle (linear, 4 phases), an FSM with 5 states is sufficient. For complex epics with parallel stories, a Petri net or parallel statechart would be more appropriate.

Sources: [XState](https://stately.ai/docs/xstate), [Workflow Engine vs State Machine](https://workflowengine.io/blog/workflow-engine-vs-state-machine/), [Symfony Workflow](https://symfony.com/doc/current/workflow/workflow-and-state-machine.html), [Petri Nets in workflow](https://users.cs.northwestern.edu/~robby/courses/395-495-2017-winter/Van%20Der%20Aalst%201998%20The%20Application%20of%20Petri%20Nets%20to%20Workflow%20Management.pdf)

#### Claude Code Stop Hook — Event-Driven Workflow Chaining

This is the most directly relevant pattern to AIOS's architecture:

**Pattern:** Hook intercepts agent stop → reads updated state → injects next-phase prompt.

```json
// Stop hook output — blocks stop and forces next-step query
{
  "decision": "block",
  "reason": "Use the AskUserQuestion tool to continue refining what to do next"
}
```

The more sophisticated version uses exit codes:
- Exit code 0: allow stop (done)
- Exit code 2: print new prompt to stdout → reinjected into main conversation

**Artifact-based phase detection:**
```
if result-phase-a.json exists → transition to phase B
if result-phase-b.json exists → transition to phase C
```

Each phase produces a deterministic artifact file. The Stop hook checks for artifact existence to determine current phase and inject the appropriate startup prompt.

**This is exactly how AIOS's WorkflowNavigator could be enhanced:** instead of pattern-matching command history strings, check for the existence of workflow artifacts (story files, QA gate outputs, commit hashes) to determine current state.

Sources: [Claude Code Stop Hook pattern](https://egghead.io/force-claude-to-ask-whats-next-with-a-continuous-stop-hook-workflow~oiqzj), [Event-driven Claude Code workflows](https://www.subaud.io/event-driven-claude-code-and-opencode-workflows-with-hooks/)

---

### Q3: Predicting Next Action from Project State

#### Warp Terminal — "Next Command" Feature

Warp's "Next Command" is the most direct analog to what AIOS's WorkflowNavigator does, but at the shell level:

> "Preview and accept AI-generated command suggestions tailored to your terminal session and command history."

**Signals used:**
- Current terminal session context
- Command history (previous commands in this session)
- Session-level patterns (what commands typically follow each other)

**UX:** TAB to accept the next command suggestion. Classified as "Active AI" — proactive, not reactive.

**Relevance:** Warp proves that next-command suggestion based on session history is a viable, high-value UX pattern. AIOS's WorkflowNavigator is doing the same thing at the workflow level (vs. command level).

Sources: [Warp AI features](https://www.warp.dev/warp-ai), [Warp all features](https://www.warp.dev/all-features)

#### Fish Shell — "Adaptive Next Command Suggestion" (Proposed, Not Yet Implemented)

Fish shell has an open RFC ([issue #6044](https://github.com/fish-shell/fish-shell/issues/6044)) for context-aware command suggestion:

> "When user enters `foo` and the previous command was `foo2`, the autocomplete suggestion should be `foo3`."

**Proposed implementation:** Maintain a secondary index mapping each command to what typically follows it in history. If no contextual suggestion exists, fall back to recency-based history.

**Example sequence:** `git status` → suggest `git add` → suggest `git commit`

**Key insight:** This is essentially a first-order Markov chain over command sequences, implemented as a lookup table built from the user's own history. No ML required — pure frequency counting.

**Status:** Open RFC with no implementation. The main blocker is UX design (when to show contextual vs. recency suggestions), not technical difficulty.

Sources: [Fish shell issue #6044](https://github.com/fish-shell/fish-shell/issues/6044)

#### Cursor — Multi-Signal Context Composite

Cursor automatically builds a context composite for every request:
- Full content of current file
- List of recently viewed files
- Semantic search results from codebase
- Active linter/compiler errors
- Recent edit history

This composite is what enables context-aware next-action suggestions. The key lesson: **a rich context composite beats single-signal approaches**.

For AIOS WorkflowNavigator, this suggests building a "workflow context composite":
- Active story file path and status
- Last command executed
- Git status (staged files, dirty tree, recent commits)
- QA gate file existence
- Time since last command
- Agent that ran last command

Sources: [Cursor context guide](https://stevekinney.com/courses/ai-development/cursor-context)

---

### Q4: Task Management CLI — Workflow Progression

#### Taskwarrior — Urgency-Based Next Action

Taskwarrior's `next` report uses a **polynomial urgency score** across multiple dimensions:
- Due date proximity
- Priority tag
- Project membership
- Active (started) status
- Dependency (blocked/blocking)
- Age of task
- Tags

The key pattern: **every task has a numeric urgency score, and the next report surfaces the highest-urgency task**. Users can customize coefficient weights to match their definition of "urgent."

**Workflow states:** tasks transition through `pending → active → completed` (or `deleted`). The `start`/`stop` commands mark what's currently being worked on. `wait` hides tasks until a future date.

**Relevance to AIOS:** An urgency scoring approach for workflow step suggestion is more robust than strict sequential ordering. A step might be "next" due to multiple factors — not just sequence position.

**Proposed AIOS analog:**
```javascript
function computeWorkflowUrgency(step, context) {
  let score = 0;
  score += sequenceScore(step, context.lastCommand);    // sequence position
  score += artifactScore(step, context.artifacts);      // prerequisites complete?
  score += gitScore(step, context.gitStatus);           // git state alignment
  score += timeScore(step, context.lastCommandTime);    // elapsed time
  score += agentScore(step, context.lastAgent);         // agent authority match
  return score;
}
```

Sources: [Taskwarrior workflow](https://taskwarrior.org/docs/workflow/), [Taskwarrior docs](https://taskwarrior.org/docs/)

#### GTD (Getting Things Done) — Context-Based Next Action Selection

GTD's "next action" selection algorithm uses four criteria in order:
1. **Context** (where are you? what tools are available?)
2. **Time available**
3. **Energy level**
4. **Priority**

**Relevance to AIOS:** The "context" dimension maps directly to agent context. The next step in a workflow depends on which agent is active, what the developer's "energy level" (i.e., available time/complexity tolerance) is, and what phase constraints apply.

---

### Q5: ML-Based vs. Heuristic Next Action Systems

#### Signals Used in ML Approaches

Next Best Action (NBA) systems in production (typically for CRM, not dev tools) use:
- **Behavioral history** (most predictive signal — past actions predict future actions)
- **Recency weighting** (recent actions more predictive than old ones)
- **Sequence patterns** (what typically follows action X?)
- **Context features** (time of day, project type, team size)
- **Reinforcement Learning** (reward = user accepted suggestion, penalty = dismissed)

**Logilica — ML for Software Engineering Workflows:**
Applies ML to PR data (files changed, reviewer count, complexity, merge time) to predict workflow outcomes. Signals: PR size, reviewer assignment, CI status, historical patterns.

#### Markov Chain Approach (Heuristic, Practical)

The fish shell issue #6044 discussion independently arrived at the same conclusion that ML-heavy systems have: **a first-order Markov chain** (lookup table of P(command_B | command_A)) is sufficient for next-action suggestion in most cases.

Implementation:
```javascript
// Build during session/history processing
const commandTransitions = {
  '*validate-story-draft': { '*develop': 12, '*exit': 3, '*qa-gate': 1 },
  '*develop': { '*qa-gate': 9, '*commit': 5 },
  '*qa-gate': { '@devops *push': 8, '*develop': 4 }
};

function suggestNext(lastCommand) {
  const transitions = commandTransitions[lastCommand] || {};
  return Object.entries(transitions)
    .sort(([,a], [,b]) => b - a) // sort by frequency
    .map(([cmd]) => cmd);
}
```

**No ML required.** Frequency counting over command history gives a high-quality transition model.

#### When ML Is Worth Adding

ML adds value when:
1. Signals beyond command history matter (git state, linter errors, time patterns)
2. Personalization per user/team is needed
3. The action space is large (100+ possible next actions)
4. Cold-start can be handled with sensible defaults

For AIOS with a bounded workflow (4-phase SDC, ~10 commands per phase), **heuristics + weighted scoring will match or exceed ML performance** with zero training overhead.

Sources: [Logilica ML for dev workflows](https://www.logilica.com/blog/ai-for-software-engineering-forecasting), [Next Best Action RL](https://blog.griddynamics.com/building-a-next-best-action-model-using-reinforcement-learning/)

---

## Specific Tools and Projects Found

| Tool/Project | Type | Relevance | Link |
|---|---|---|---|
| GitHub Copilot NES | Edit-history-based next edit suggestion | HIGH | [githubnext.com/projects/copilot-next-edit-suggestions](https://githubnext.com/projects/copilot-next-edit-suggestions/) |
| JetBrains AI NES | Next edit suggestion, GA Dec 2025 | HIGH | [jetbrains.com/help/ai-assistant/next-edit-suggestions.html](https://www.jetbrains.com/help/ai-assistant/next-edit-suggestions.html) |
| Cursor Tab | Trajectory-trained action prediction | HIGH | [cursor.com](https://cursor.com) |
| Copilot Workspace | Linear workflow state machine | HIGH | [githubnext.com/projects/copilot-workspace](https://githubnext.com/projects/copilot-workspace) |
| Warp "Next Command" | Session-history next command | HIGH | [warp.dev/all-features](https://www.warp.dev/all-features) |
| Claude Code Stop Hook | Event-driven workflow chaining | HIGH | [egghead.io](https://egghead.io/force-claude-to-ask-whats-next-with-a-continuous-stop-hook-workflow~oiqzj) |
| Fish Shell RFC #6044 | Markov chain next command proposal | MEDIUM | [github.com/fish-shell/fish-shell/issues/6044](https://github.com/fish-shell/fish-shell/issues/6044) |
| XState / Stately | FSM-based workflow with visualization | MEDIUM | [stately.ai](https://stately.ai/) |
| Taskwarrior | Urgency-score next action | MEDIUM | [taskwarrior.org](https://taskwarrior.org/) |
| Aider | Git as workflow state backend | MEDIUM | [aider.chat](https://aider.chat/) |
| Temporal.io | Durable workflow state machine | LOW | [temporal.io](https://temporal.io/) |
| Petri Net WF-nets | Parallel workflow formalism | LOW (theory) | [Van der Aalst 1998](https://users.cs.northwestern.edu/~robby/courses/395-495-2017-winter/Van%20Der%20Aalst%201998%20The%20Application%20of%20Petri%20Nets%20to%20Workflow%20Management.pdf) |
| Devin 2.0 | ReAct loop with iterative step execution | LOW | [cognition.ai/blog/devin-2](https://cognition.ai/blog/devin-2) |

---

## Code Examples and Patterns

### Pattern 1: Artifact-Based Phase Detection (Claude Code Hook Model)

```javascript
// WorkflowNavigator: detect current phase by checking artifact existence
function detectWorkflowPhase(storyId) {
  const storyPath = `docs/stories/active/${storyId}.story.md`;
  const qaGatePath = `docs/qa/${storyId}-gate.yaml`;

  if (!fs.existsSync(storyPath)) return 'NO_STORY';

  const storyContent = fs.readFileSync(storyPath, 'utf8');
  const status = extractStatus(storyContent); // "Draft" | "Ready" | "InProgress" | "InReview" | "Done"

  if (status === 'Draft') return 'NEEDS_VALIDATION';       // → suggest @po *validate-story-draft
  if (status === 'Ready') return 'NEEDS_IMPLEMENTATION';   // → suggest @dev *develop
  if (status === 'InProgress') {
    if (fs.existsSync(qaGatePath)) return 'NEEDS_REVIEW';  // → suggest @qa *qa-gate
    return 'IN_DEVELOPMENT';                                // → suggest continue *develop
  }
  if (status === 'InReview') return 'NEEDS_PUSH';          // → suggest @devops *push
  return 'DONE';
}
```

### Pattern 2: Transition Table (Markov Chain Model)

```javascript
// Explicit FSM transition table for Story Development Cycle
const workflowTransitions = {
  'Draft': {
    primary: { command: '@po *validate-story-draft', description: 'Validate story with PO' },
    alternatives: []
  },
  'Ready': {
    primary: { command: '@dev *develop', description: 'Start implementation' },
    alternatives: [{ command: '@sm *draft', description: 'Create next story (parallel)' }]
  },
  'InProgress': {
    primary: { command: '@qa *qa-gate', description: 'Run QA gate' },
    alternatives: [{ command: '@dev *coderabbit-review', description: 'Self-healing review' }]
  },
  'InReview': {
    primary: { command: '@devops *push', description: 'Push to remote and create PR' },
    alternatives: [{ command: '@dev *fix', description: 'Fix QA issues first' }]
  }
};

function suggestNext(currentPhase, context) {
  const transition = workflowTransitions[currentPhase];
  if (!transition) return null;

  // Override with context-aware adjustments
  if (currentPhase === 'InReview' && context.qaVerdict === 'FAIL') {
    return workflowTransitions['InReview'].alternatives[0]; // fix before push
  }
  return transition.primary;
}
```

### Pattern 3: Multi-Signal Urgency Scoring (Taskwarrior Model)

```javascript
// Score each possible next step across multiple signals
function scoreNextStep(step, context) {
  const scores = {
    sequence:  sequenceScore(step, context.lastCommand),   // weight: 0.4
    artifact:  artifactScore(step, context.artifacts),      // weight: 0.3
    gitState:  gitStateScore(step, context.gitStatus),      // weight: 0.2
    elapsed:   elapsedTimeScore(step, context.lastTime),    // weight: 0.1
  };

  return (
    scores.sequence  * 0.4 +
    scores.artifact  * 0.3 +
    scores.gitState  * 0.2 +
    scores.elapsed   * 0.1
  );
}

function gitStateScore(step, gitStatus) {
  // Staged files → suggest commit/qa
  if (gitStatus.staged.length > 0 && step.id === 'qa-gate') return 1.0;
  // Uncommitted changes → suggest don't push yet
  if (gitStatus.dirty && step.id === 'devops-push') return 0.0;
  // Clean state after qa-pass → boost push suggestion
  if (gitStatus.clean && step.id === 'devops-push') return 0.9;
  return 0.5;
}
```

### Pattern 4: Stop Hook for Continuous Workflow (Claude Code Model)

```javascript
// .claude/hooks/workflow-continuity.cjs
// Intercepts agent stop, injects next-phase prompt

const phase = detectWorkflowPhase();
const nextStep = suggestNextStep(phase);

if (nextStep) {
  console.log(`Next recommended step: ${nextStep.command}\n${nextStep.description}`);
  process.stdout.write(JSON.stringify({
    decision: 'block',
    reason: `Workflow is in phase '${phase}'. Use AskUserQuestion to offer: ${nextStep.command}`
  }));
  process.exit(0);
}

// Allow stop if no next step or Done
process.exit(0);
```

### Pattern 5: XState FSM for Story Development Cycle

```javascript
import { createMachine, interpret } from 'xstate';

const storyDevelopmentCycle = createMachine({
  id: 'SDC',
  initial: 'Draft',
  states: {
    Draft:      { on: { VALIDATE_GO: 'Ready',      VALIDATE_NOGO: 'Draft' } },
    Ready:      { on: { START_DEV: 'InProgress' } },
    InProgress: { on: { SUBMIT_QA: 'InReview',     DEV_CONTINUE: 'InProgress' } },
    InReview:   { on: { QA_PASS: 'Done',           QA_FAIL: 'InProgress' } },
    Done:       { type: 'final' }
  }
});

// Get all possible next transitions from current state
function getAvailableTransitions(currentState) {
  const stateNode = storyDevelopmentCycle.states[currentState];
  return Object.keys(stateNode.on || {});
}
// → getAvailableTransitions('InProgress') = ['SUBMIT_QA', 'DEV_CONTINUE']
```

---

## Relevance to AIOS WorkflowNavigator

### Current State Assessment

The current WorkflowNavigator uses command history pattern matching:
- **Input:** last N commands from session history
- **Logic:** if last command matches known pattern → suggest hardcoded next command
- **Weakness:** purely reactive, single signal, no project state awareness, breaks when workflow is not linear

### Gap Analysis vs. Industry

| Capability | Industry Frontier | AIOS Current | Gap |
|---|---|---|---|
| Edit/command history signal | Yes (Cursor, Copilot NES) | Yes (basic) | Partial |
| Project state signals (git) | Yes (Aider, Cursor) | No | Full |
| Artifact existence detection | Yes (Claude Code hooks) | No | Full |
| Story file status parsing | N/A (AIOS-specific) | No | Full |
| Urgency scoring across signals | Yes (Taskwarrior) | No | Full |
| Formal state machine | Yes (Copilot Workspace, XState) | No (if/else) | Partial |
| Transition visualization | Yes (Stately Studio) | No | Full |
| Agent authority enforcement | N/A (AIOS-specific) | Partial | Partial |
| Personalization / ML | Yes (Cursor, Copilot) | No | Low priority |

### What Would Actually Move the Needle

1. **Story file status as primary signal** — Parse the active story's Status field. This single change eliminates most false suggestions and makes the navigator resilient to non-linear workflows.

2. **Artifact existence check** — Does `docs/qa/${storyId}-gate.yaml` exist? If yes, QA gate has been run; suggest push or fix. This is zero-latency and deterministic.

3. **Git state signal** — Is the working tree dirty? Are files staged? Has the last commit message reference a story ID? These signals from `git status --porcelain` are fast and highly predictive.

4. **Agent authority enforcement** — Never suggest `@devops *push` if the last agent was not `@devops`. Never suggest `@po *validate` if story is not in Draft status.

---

## Prioritized Recommendations

### P0 — Immediate (High Value, Low Effort)

**P0.1: Add story file status as primary signal**

Replace command history pattern matching with a two-phase lookup:
1. Find active story file (parse `.aios/session-state.yaml` or scan `docs/stories/active/`)
2. Read the `Status:` field from the story markdown
3. Map status → next command using a transition table

This makes the WorkflowNavigator correct for all standard SDC flows, regardless of which commands were run.

**P0.2: Artifact existence detection**

Check for existence of:
- QA gate file (`docs/qa/${storyId}-*.yaml`)
- Decision log (`docs/stories/active/decision-log-${storyId}.md`)
- Story file itself

Presence/absence of these artifacts is a more reliable signal than command history.

### P1 — Short-Term (High Value, Moderate Effort)

**P1.1: Git state integration**

Read `git status --porcelain` and `git log --oneline -5` to supplement the command history signal:
- Staged files → reinforce QA/commit suggestion
- Dirty working tree → deprioritize push suggestion
- Last commit message contains story ID → infer progress

**P1.2: Stop hook integration**

Implement a Claude Code Stop hook that:
1. Detects current workflow phase (via story status + artifact check)
2. Outputs the next suggested command to stdout
3. Uses exit code 2 to reinject the suggestion into the main conversation

This is the Claude Code-native way to implement continuous workflow guidance.

**P1.3: Multi-signal scoring**

Replace binary pattern-match with a weighted score across:
- Sequence position (0.4)
- Artifact state (0.3)
- Git state (0.2)
- Time elapsed since last command (0.1)

### P2 — Medium-Term (Moderate Value, Moderate Effort)

**P2.1: Formal FSM with XState**

Model the Story Development Cycle as an XState machine. Benefits:
- Transition table is explicit and testable
- `getAvailableTransitions(state)` is a built-in query
- Stately Studio can visualize the workflow for documentation

**P2.2: Agent authority enforcement in suggestions**

The WorkflowNavigator should never suggest an action that violates agent authority rules. Add a filter layer that cross-checks suggested commands against the current agent identity.

**P2.3: Command transition frequency tracking**

Implement the fish shell RFC #6044 approach: maintain a lookup table of `{command → [next commands by frequency]}` built from session history. After 10+ sessions, this table will reflect real user behavior and improve suggestion relevance.

### P3 — Long-Term (Lower Priority, Higher Effort)

**P3.1: Trajectory model for personalized suggestions**

Train a small sequence model (or use a Markov chain trained on AIOS command logs) that learns individual user's workflow patterns. This enables personalization beyond the standard SDC sequence.

**P3.2: Parallel workflow support**

Current SDC is strictly linear. If AIOS evolves to support parallel story development (e.g., multiple stories in flight), a Petri net model would handle the concurrency correctly where an FSM cannot.

**P3.3: Context file convention (.context/STATUS.md)**

Adopt the emerging `.context/STATUS.md` convention seen in the wild (Feb 2026 Medium article). This file documents current phase, what's done, what's in progress, blockers, and next actions. AI reads it first. This externalizes workflow state into a queryable artifact.

---

## Summary Table

| Finding | Impact on AIOS WorkflowNavigator |
|---|---|
| Industry uses edit/command history as primary signal | Confirms current approach is correct baseline |
| Story file Status field is the canonical phase signal | P0: use this instead of command history as primary |
| Artifact existence is deterministic phase signal | P0: check QA gate files, decision logs |
| Git state (dirty tree, staged files) is strong secondary signal | P1: integrate git status |
| Claude Code Stop hook enables continuous workflow injection | P1: implement for seamless SDC guidance |
| FSM transition table is cleaner than if/else chains | P2: XState for explicit, testable transitions |
| Command transition frequency table (Markov, no ML) improves suggestions | P2: build from session history |
| Urgency scoring beats strict sequential ordering | P1: multi-signal weighted score |
| Agent authority must be enforced in suggestions | P1: filter suggested commands by agent rules |
| ML adds value only when action space is large (100+ options) | P3: not needed for current SDC scope |

---

*Research complete. Report generated 2026-02-21.*
*Sources: GitHub Copilot, JetBrains AI, Cursor, Aider, Warp, XState, Taskwarrior, Fish Shell, Claude Code, Petri Nets, Temporal.io, Devin AI, Logilica.*
