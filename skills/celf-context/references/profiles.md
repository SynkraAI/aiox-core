# CELF Profiles

## Profile Detection

| Signal | Profile |
|--------|---------|
| Single person, no agents, simple project | **SOLO** |
| Small team OR single person with agents/skills | **MEDIUM** |
| Multiple squads, delegation, quality gates | **ENTERPRISE** |

---

## SOLO Profile

**Who:** Indie dev, solopreneur, small project, learning Claude Code.

**Active layers:** L0, L1 (minimal), L5

**Total files:** 4-6

**Structure:**
```
project/
├── CLAUDE.md                      # L0: ~50 lines
├── .brain/
│   └── BRAIN.yaml                 # L1: Product + persona in one file
├── inputs/
│   └── intelligence/
│       └── P0-customer-voice.md   # L2: Real quotes (if business)
├── outputs/                       # Generated artifacts
└── docs/sessions/                 # Handoffs (optional but recommended)
```

**CLAUDE.md template (~50 lines):**
```markdown
# {Project Name}

## Identity
I am {name}. I build {what} for {whom}.

## Rules
1. Read before writing. Minimum ratio 2:1.
2. Ask when uncertain. "I don't know" > fabricated answer.
3. Outputs go in outputs/. Never pollute root.
4. Before creating content, read inputs/intelligence/ if it exists.
5. Keep this file under 50 lines.

## Paths
- Product/persona info: .brain/BRAIN.yaml
- Customer research: inputs/intelligence/
- Generated work: outputs/
```

**What SOLO skips:**
- .claude/rules/ (not enough complexity)
- STATE.yaml / DECISIONS.md (single project, simple state)
- Squads / delegation (no agents)
- Quality gates (informal review)
- Handoff protocol (optional)

---

## MEDIUM Profile

**Who:** Solo with agents/skills, small team, project with multiple phases.

**Active layers:** L0-L5

**Total files:** 10-15

**Structure:**
```
project/
├── CLAUDE.md                          # L0: ~120 lines
├── .brain/
│   ├── BRAIN.yaml                     # L1: Entry point
│   ├── schema/
│   │   └── entities.yaml
│   └── entities/
│       ├── products/
│       │   └── main-product.yaml
│       └── personas/
│           └── icp.yaml
├── inputs/
│   └── intelligence/                  # L2
│       ├── P0-customer-voice.md
│       └── P0-pain-points.md
├── projects/
│   └── {active}/                      # L3
│       ├── STATE.yaml
│       ├── INDEX.md
│       └── DECISIONS.md
├── .claude/
│   └── rules/
│       └── anti-loop.md               # L4
├── outputs/
└── docs/
    └── sessions/                      # L6
```

**CLAUDE.md template (~120 lines):**
```markdown
# {Project Name}

## Identity
{Who, what, for whom — 2-3 lines}

## Strategic Lens
{Core principle that guides all decisions — 1-2 lines}

## Decision Levels
| Level | Scope | Action |
|-------|-------|--------|
| 1 | Implementation, naming, patterns | Decide alone, document |
| 2 | Architecture, tradeoffs | Decide, flag the choice |
| 3 | Ambiguous goals, business changes | Present options, ask |

## Routing
| Request type | Handler |
|-------------|---------|
| {type 1} | {how to handle} |
| {type 2} | {how to handle} |

## Context Loading
- Always: This file + MEMORY.md
- On-demand: .brain/ (before creating), inputs/intelligence/ (before copy)
- Session start: projects/{active}/STATE.yaml

## Rules
1. Read 2x more than you write
2. Before creating, load .brain/ and intelligence/
3. Update STATE.yaml at session end
4. Create handoff at session end: docs/sessions/
5. 2 failed attempts = change strategy
6. State uncertainty: HIGH / MEDIUM / LOW
7. Never exceed 200 lines in this file

## Paths
| Layer | Path |
|-------|------|
| Knowledge | .brain/ |
| Intelligence | inputs/intelligence/ |
| State | projects/{active}/ |
| Rules | .claude/rules/ |
| Outputs | outputs/ |
| Sessions | docs/sessions/ |
```

---

## ENTERPRISE Profile

**Who:** Multi-agent system, agency, complex workflows, multiple projects.

**Active layers:** L0-L7 (all)

**Total files:** 20+

**Structure:**
```
project/
├── CLAUDE.md                          # L0: ~180 lines
├── .brain/
│   ├── BRAIN.yaml                     # L1
│   ├── schema/
│   │   ├── entities.yaml
│   │   └── relationships.yaml
│   └── entities/
│       ├── products/
│       ├── personas/
│       ├── brand/
│       └── campaigns/
├── inputs/
│   └── intelligence/                  # L2
│       ├── P0-customer-voice.md
│       ├── P0-fears-desires.md
│       ├── P0-icp-profile.md
│       └── P0-meta-patterns.md
├── projects/                          # L3
│   ├── {project-a}/
│   │   ├── STATE.yaml
│   │   ├── INDEX.md
│   │   └── DECISIONS.md
│   └── {project-b}/
│       └── STATE.yaml
├── .claude/
│   ├── rules/                         # L4
│   │   ├── anti-loop.md
│   │   ├── routing.md
│   │   ├── delegation.md
│   │   └── quality-gates.md
│   ├── commands/                      # L4 (skills/agents)
│   ├── protocols/                     # L4
│   └── reference/                     # L4 (on-demand)
├── squads/                            # L4 (teams)
│   ├── {squad-a}/
│   │   ├── squad.yaml
│   │   └── chief.md
│   └── {squad-b}/
├── outputs/
└── docs/
    └── sessions/                      # L6
```

**CLAUDE.md template (~180 lines):** Full routing, model routing, execution cycle,
delegation rules, quality gates. See `templates/claude-md-enterprise.md`.

**Enterprise additions:**
- Squad definitions with chiefs
- Delegation protocol (what to include per agent type)
- Quality gates between phases (score thresholds)
- Model routing (which model for which task)
- Handoff protocol (mandatory)
- Token budget monitoring
