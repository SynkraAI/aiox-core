# CELF Layer Specifications

## Layer Schema

Each layer is defined by 7 canonical properties:

```yaml
layer_schema:
  id: string          # L0-L7
  name: string
  scope: enum         # UNIVERSAL | PROJECT | SESSION | TURN
  mutability: enum    # IMMUTABLE | RARE | PERIODIC | FREQUENT | CONTINUOUS | EPHEMERAL
  loading: enum       # ALWAYS | SESSION_START | ON_DEMAND | CONTEXTUAL | EPHEMERAL
  epistemic_range: [] # Allowed epistemic statuses
  owner: string
  token_budget: string
  veto_conditions: []
```

---

## L0 — CONSTITUTION

| Property | Value |
|----------|-------|
| Scope | UNIVERSAL |
| Mutability | IMMUTABLE per session |
| Loading | ALWAYS |
| Epistemic | AXIOM only |
| Owner | Human (project owner) |
| Token budget | < 2000 tokens (~200 lines) |

**Contains:** Cognitive laws, decision levels, circuit breakers, anti-patterns, communication protocol.

**Does NOT contain:** Business info, customer data, domain rules, project state.

**Files:** `~/.claude/CLAUDE.md` (global) + `{root}/CLAUDE.md` (project, extends never contradicts)

**Veto conditions:**
- Session attempts to alter constitution
- Project CLAUDE.md contradicts global
- Content > 200 lines

**Attention behavior:** First in prompt = maximum attention weight (position encoding). Most important rules go HERE.

**Anti-patterns:**

| Pattern | Problem | Fix |
|---------|---------|-----|
| Everything in CLAUDE.md | > 200 lines, attention dilutes | Satellite files on-demand |
| Business rules in constitution | Mixes HOW with WHAT | Move to L1/L4 |
| No decision levels | System doesn't know when to escalate | Define L1/L2/L3 explicitly |
| Copy-paste generic templates | Doesn't reflect project reality | Write from scratch, with intent |

---

## L1 — KNOWLEDGE GRAPH

| Property | Value |
|----------|-------|
| Scope | UNIVERSAL (per business) |
| Mutability | RARE |
| Loading | ON_DEMAND |
| Epistemic | FACT only |
| Owner | Human (business owner) |
| Token budget | Entry point < 500 tokens; entities loaded individually |

**Contains:** Products (name, price, features), personas/ICP, brand identity, organizational structure, entity relationships.

**Does NOT contain:** Strategies (L4), raw research (L2), project state (L3), opinions.

**Files:**
```
.brain/ (or knowledge/)
├── BRAIN.yaml              # Entry point (pointer to everything)
├── schema/
│   ├── entities.yaml       # Schema per entity type
│   └── relationships.yaml  # How entities connect
└── entities/
    ├── products/           # One YAML per product
    ├── personas/           # Archetypes, ICP
    ├── brand/              # Design system, voice
    └── campaigns/          # Active campaigns
```

**Veto conditions:**
- Entity without defined schema
- Data enters without human validation
- Session alters fact without explicit flag
- BRAIN.yaml > 500 tokens (it's a pointer, not a repository)

---

## L2 — INTELLIGENCE

| Property | Value |
|----------|-------|
| Scope | UNIVERSAL or PROJECT |
| Mutability | PERIODIC |
| Loading | ON_DEMAND (REQUIRED before creating copy/strategy) |
| Epistemic | EVIDENCE only |
| Owner | Human (researcher/analyst) |
| Token budget | < 3000 tokens per file; 5-7 files max |

**Contains:** Real customer verbatims, fear/desire mapping with scoring, ICP psychographic profiles, observed meta-patterns, survey data.

**Files:**
```
inputs/intelligence/
├── P0-customer-voice.md     # Real quotes
├── P0-fears-desires.md      # Fear x desire matrix
├── P0-icp-profile.md        # Psychographic profile
├── P0-meta-patterns.md      # Observed patterns
└── P0-survey-data.md        # Quantitative data
```

**Naming:** `P{priority}-{topic}.md` — P0 = always load before copy/strategy.

**Veto conditions:**
- Creating copy without loading P0
- Fabricated verbatims (must be real quotes)
- Scoring without declared methodology
- Sample < 30 respondents

---

## L3 — PROJECT STATE

| Property | Value |
|----------|-------|
| Scope | PROJECT |
| Mutability | FREQUENT |
| Loading | SESSION_START |
| Epistemic | FACT + INFERENCE |
| Owner | System (auto-updated) + Human (validation) |
| Token budget | < 1000 tokens |

**Contains:** Current phase, decisions made (with justification), artifacts created (with paths), next steps, identified blockers.

**Files:**
```
projects/{name}/
├── STATE.yaml     # State machine
├── INDEX.md       # Path map
└── DECISIONS.md   # Append-only decision log
```

**State machine pattern:**
```
phases: PLANNING → BRIEFING → EXECUTION → REVIEW → DELIVERY
transitions:
  require: quality_gate_passed
  direction: FORWARD_ONLY
  rollback: only to immediately previous phase, with justification
```

**Veto conditions:**
- State regresses without justification
- STATE.yaml > 1000 tokens
- Recorded decision is altered (append-only)
- Session doesn't update STATE at end

---

## L4 — HEURISTICS & RULES

| Property | Value |
|----------|-------|
| Scope | PROJECT or UNIVERSAL |
| Mutability | PERIODIC |
| Loading | CONTEXTUAL (pattern matching) |
| Epistemic | HEURISTIC |
| Owner | Human (domain expert) + System |
| Token budget | < 500 tokens per rule; loaded selectively |

**Contains:** Routing rules, execution protocols, decision matrices, quality gates, agent definitions, task definitions.

**Files:**
```
.claude/rules/*.md           # Auto-loaded by pattern matching
.claude/commands/{module}/   # Loaded when skill invoked
.claude/protocols/           # Loaded when referenced by L0
.claude/reference/           # On-demand
```

**Properties:** Atomic (one file, one responsibility), composable, testable, overridable by human.

**Veto conditions:**
- Heuristic contradicts axiom (L0 always prevails)
- Agent definition > 500 tokens base loading
- Task without defined inputs/outputs
- Rule can't be tested in isolation

---

## L5 — MEMORY

| Property | Value |
|----------|-------|
| Scope | PROJECT (potentially UNIVERSAL) |
| Mutability | FREQUENT |
| Loading | ALWAYS (MEMORY.md auto-loaded, capped at 200 lines) |
| Epistemic | HEURISTIC + INFERENCE |
| Owner | System (auto-write) + Human (curation) |
| Token budget | < 800 tokens (200 lines hard limit) |

**Unique property:** Only layer that is simultaneously auto-loaded (like L0), mutable by session (like L6), and persistent (like L1). Creates a learning loop.

**Contains:** Confirmed patterns (2+ observations), user workflow preferences, recurring problem solutions, important architectural decisions.

**Files:**
```
~/.claude/projects/{id}/memory/MEMORY.md       # Main (auto-loaded)
~/.claude/projects/{id}/memory/{topic}.md      # Satellites (on-demand)
```

**Garbage collection:** Every ~10 sessions, review MEMORY.md. Remove unconfirmed patterns. Consolidate redundancies. Move details to satellites. Keep < 200 lines ALWAYS.

**Veto conditions:**
- MEMORY.md > 200 lines (auto-truncation)
- Unconfirmed pattern saved (minimum 2 observations)
- Contradicts L0 or L1
- Session-specific info saved (that's L6)

---

## L6 — SESSION CONTEXT

| Property | Value |
|----------|-------|
| Scope | SESSION |
| Mutability | CONTINUOUS |
| Loading | EPHEMERAL |
| Epistemic | INFERENCE + SPECULATION |
| Owner | System (automatic) |
| Token budget | Full window minus L0+L4+L5 overhead |

**Contains:** Conversation history, files read, tasks in progress, working hypotheses, intermediate results.

**Persistence mechanism:** L6 is ephemeral by default. To persist:
1. Confirmed pattern → L5 (MEMORY.md)
2. Decision made → L3 (STATE.yaml / DECISIONS.md)
3. Artifact created → outputs/
4. Session complete → handoff (docs/sessions/)

**Attention behavior:** U-shaped attention curve. Beginning and end get more weight. Auto-compaction cuts OLD messages near limit. Critical info must be in L0 or re-injected.

**Veto conditions:**
- Session closes without handoff
- Session alters L0 or L1 directly
- Working hypothesis treated as FACT

---

## L7 — DELEGATION CONTEXT

| Property | Value |
|----------|-------|
| Scope | TURN (sub-session) |
| Mutability | EPHEMERAL |
| Loading | EPHEMERAL (assembled and discarded per delegation) |
| Epistemic | INFERENCE + SPECULATION |
| Owner | System (orchestrator) |
| Token budget | 10-30k tokens typically |

**Contains:** Task prompt, relevant context from L0-L5 (curated, not full), input data.

**Properties:** Isolated (doesn't contaminate parent session), scoped (accesses only what's needed), compressed return (result is summary, not full context).

**Veto conditions:**
- Sub-agent receives context from another sub-agent (cross-contamination)
- Delegation includes full CLAUDE.md (token waste)
- Result not validated before integrating into L6

---

## Epistemic Status Classification

| Status | Definition | Mutability | Example |
|--------|-----------|------------|---------|
| AXIOM | True by definition within system | Only by redesign | CLAUDE.md laws |
| FACT | Externally verifiable | Changes when reality changes | Product name, price |
| EVIDENCE | Collected from real source | Changes with new collection | Customer verbatim |
| HEURISTIC | Works empirically | Changes when exception found | Routing rule |
| INFERENCE | Derived by reasoning | Changes with new data | Generated analysis |
| SPECULATION | Unverified | Can change any turn | Session hypothesis |

**Golden rule:** Low epistemic status information can NEVER overwrite high status information.

---

## Context Promotion (Upward Flow)

Normal flow is top-down (L0 → L7). Upward promotion requires explicit mechanisms:

| From → To | Mechanism | Gate |
|-----------|-----------|------|
| L6 → L5 | Auto-memory write | Pattern confirmed 2+ times |
| L6 → L3 | STATE.yaml update | Decision made |
| L5 → L4 | Rule creation | 10+ sessions + human approval |
| L5 → L0 | Human edit | 20+ sessions + human decision |
| L2 → L1 | Human validation | Research validated by 2+ sources |

**Hard rule:** Promotion to L0 or L1 is NEVER automatic. Always requires human validation.
