# Hormozi Squad Architecture

> **Version:** 1.0.0
> **Last Updated:** 2026-02-13
> **Squad Type:** Expert (Alex Hormozi Methodology - 95% fidelity)

---

## Table of Contents

1. [Overview](#overview)
2. [Tier Hierarchy](#tier-hierarchy)
3. [Agent Specializations](#agent-specializations)
4. [Data Flow](#data-flow)
5. [Workflow Orchestration](#workflow-orchestration)
6. [Integration Points](#integration-points)
7. [Knowledge Base](#knowledge-base)
8. [Quality Gates](#quality-gates)

---

## Overview

The Hormozi Squad is an expert system built from **165+ source files (165MB)** of Alex Hormozi's documented frameworks, including:

- **4 Complete Books:** $100M Offers, $100M Leads, + 2 more (65+ chapters)
- **25 Playbook Directories:** Detailed process blueprints
- **8 Confirmed Mental Models:** Core decision frameworks
- **95% Fidelity:** Voice DNA + Thinking DNA extracted from primary sources

### Design Philosophy

**"An army of specialized Alex Hormozis, each mastering a specific domain, working in coordination to create offers, leads, ads, copy, and strategies that make people feel stupid saying no."**

Core Principles:
- **Context First:** All recommendations adapt to industry, price tier, and business stage
- **Data-Driven:** Every decision based on Hormozi's documented frameworks
- **Antipattern Shields:** Immune system blocks common failure architectures
- **Systematic Execution:** 55 tasks, 45 checklists, 9 workflows for repeatable results

---

## Tier Hierarchy

The squad follows a 4-tier hierarchical structure for intelligent routing:

### Tier 0: Orchestration & Diagnosis

| Agent | Role | Specialization |
|-------|------|----------------|
| **hormozi-chief** | Orchestrator | Strategic routing, context diagnosis, industry adaptation |

**Purpose:** Entry point for all user interactions. Diagnoses context (industry, price tier, business stage) and routes to appropriate specialists.

**Workflows:**
- `wf-context-diagnosis` - Diagnose industry, price tier, and business stage
- `wf-growth-decision` - Decide between "Mais" (more volume), "Melhor" (better efficiency), or "Novo" (new channel)
- `wf-opportunity-screening` - VETO gate for market validation

---

### Tier 1: Strategic Diagnosis

| Agent | Role | Specialization |
|-------|------|----------------|
| **hormozi-audit** | Business Auditor | System diagnostics, constraint identification, KPI analysis |
| **hormozi-advisor** | Strategic Advisor | Long-term strategy, business model design, competitive positioning |

**Purpose:** Deep diagnosis and strategic planning before execution.

**Key Outputs:**
- Business health reports
- Constraint analysis (leads/conversion/delivery/capacity)
- Strategic roadmaps

---

### Tier 2: Domain Specialists (Core Execution)

| Agent | Domain | Specialization |
|-------|--------|----------------|
| **hormozi-offers** | Offer Creation | Grand Slam Offers, value equation, stack architecture |
| **hormozi-leads** | Lead Generation | Core Four strategy (warm outreach, content, ads, cold outreach) |
| **hormozi-pricing** | Pricing Strategy | Price optimization, monetization models, LTV:CAC |
| **hormozi-copy** | Copywriting | Hooks, headlines, sales copy, VSL scripts |
| **hormozi-ads** | Advertising | Ad campaign design, angles, GOATED ads framework |
| **hormozi-hooks** | Hook Creation | Attention capture, pattern interrupts, curiosity gaps |
| **hormozi-models** | Business Models | Continuity, subscriptions, downsells, upsells |
| **hormozi-retention** | Customer Retention | Churn diagnosis, onboarding, engagement scoring |

**Purpose:** Execute domain-specific tasks with Hormozi's proven frameworks.

---

### Tier 3: Execution & Optimization

| Agent | Domain | Specialization |
|-------|--------|----------------|
| **hormozi-workshop** | Workshop Launches | Event design, registration pages, scarcity mechanics |
| **hormozi-content** | Content Creation | Content units, narratives, storytelling frameworks |
| **hormozi-launch** | Launch Orchestration | Launch timelines, war rooms, contingency planning |
| **hormozi-closer** | Sales Closing | Closer scripts, objection handling, follow-up sequences |
| **hormozi-scale** | Scaling Systems | Team building, automation, constraint removal |

**Purpose:** Tactical execution and optimization of established strategies.

---

### Tier 4: Meta-Level (Future)

Currently unassigned. Reserved for meta-operations like:
- Cross-squad coordination
- Framework evolution
- Quality assurance

---

## Agent Specializations

### Domain Coverage Matrix

| Business Function | Agents | Task Count |
|-------------------|--------|------------|
| **Offers** | hormozi-offers | 12 tasks |
| **Leads** | hormozi-leads | 8 tasks |
| **Ads & Hooks** | hormozi-ads, hormozi-hooks | 6 tasks |
| **Copy & Pages** | hormozi-copy | 8 tasks |
| **Launch** | hormozi-launch, hormozi-workshop | 9 tasks |
| **Retention** | hormozi-retention | 7 tasks |
| **Scaling** | hormozi-scale | 5 tasks |

### Voice DNA Coverage

**100% of agents** (16/16) have complete Voice DNA extraction including:
- Signature phrases from primary sources
- Metaphors and mental models
- Vocabulary rules (always_use / never_use)
- Tone markers and communication style

### Objection Handling Coverage

**100% of agents** (16/16) have domain-specific objection algorithms:
- Minimum 3 objections per agent
- Contextual responses based on Hormozi's methodology
- Pattern-based handling for common pushback

---

## Data Flow

### Context → Diagnosis → Execution Flow

```
┌──────────────────────────────────────────────────────────────┐
│ PHASE 0: CONTEXT COLLECTION                                  │
│ Agent: hormozi-chief                                          │
│ Workflow: wf-context-diagnosis                               │
│                                                               │
│ Inputs:                                                       │
│ - Industry / Vertical                                         │
│ - Price Tier (Low/Mid/High/Ultra)                            │
│ - Business Stage (Overdelivery/Systematization/Optimization) │
│                                                               │
│ Output: context_profile.md + routing_map.yaml                │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ PHASE 1: STRATEGIC DIAGNOSIS                                 │
│ Agents: hormozi-audit, hormozi-advisor                       │
│                                                               │
│ Routing Rules:                                                │
│ - Overdelivery stage → hormozi-offers (validate offer)       │
│ - Systematization stage → hormozi-pricing (optimize model)   │
│ - Optimization stage → hormozi-scale (remove constraints)    │
│                                                               │
│ Output: Diagnostic reports, constraint analysis              │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ PHASE 2: DOMAIN EXECUTION                                    │
│ Agents: Tier 2 specialists (offers, leads, copy, ads, etc.)  │
│                                                               │
│ Routing by Price Tier:                                       │
│ - Low Ticket → hormozi-copy (conversion optimization)        │
│ - Mid Ticket → hormozi-offers (proof + guarantees)           │
│ - High Ticket → hormozi-pricing (relationship + process)     │
│ - Ultra Ticket → hormozi-chief (exclusivity + transformation)│
│                                                               │
│ Output: Deliverables (offers, campaigns, scripts, etc.)      │
└──────────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────┐
│ PHASE 3: EXECUTION & OPTIMIZATION                            │
│ Agents: Tier 3 specialists (workshop, launch, scale, etc.)   │
│                                                               │
│ Output: Implementation artifacts, launch plans, systems      │
└──────────────────────────────────────────────────────────────┘
```

### Data Sources Referenced

| Data File | Purpose | Referenced By |
|-----------|---------|---------------|
| `antipatterns-database.yaml` | 73 cataloged business failure patterns | `antipattern-screening.md` checklist |
| `scaling-by-business-type.yaml` | Stage-appropriate scaling strategies | `diagnose-scaling-constraint.md`, `build-scaling-team.md` |
| `source-index.yaml` | Mapping of 165+ source files to agents | `README.md` (documentation) |
| `hormozi-case-library.yaml` | Real-world case studies | Multiple workflows and agents |

---

## Workflow Orchestration

### Primary Workflows (9 total)

| Workflow | Type | Phases | Purpose |
|----------|------|--------|---------|
| **wf-context-diagnosis** | Diagnostic | 3 | Diagnose industry, price tier, business stage |
| **wf-growth-decision** | Decision | 3 | Decide "Mais, Melhor, ou Novo" growth strategy |
| **wf-opportunity-screening** | VETO | 3 | Market validation before offer creation |
| **wf-grand-slam-offer** | Creation | 4 | Create $100M-style offer |
| **wf-lead-generation** | Creation | 3 | Design Core Four lead system |
| **wf-launch-evento** | Orchestration | 5 | End-to-end launch execution |
| **wf-retention-optimization** | Optimization | 4 | Reduce churn, increase LTV |
| **wf-scaling-diagnostic** | Diagnostic | 3 | Identify scaling constraints |
| **wf-high-ticket-sales** | Process | 4 | Design high-ticket sales process |

### Workflow Design Patterns

**All workflows follow these principles:**
1. **Checkpoints:** Every phase has completion criteria
2. **Veto Conditions:** Blocking rules prevent wrong paths
3. **Unidirectional Flow:** No backtracking (forces proper diagnosis first)
4. **Data-Driven:** Decisions based on Hormozi's documented frameworks
5. **Human Review Gates:** Strategic decisions require user confirmation

---

## Integration Points

### MMOS (Mind Mapping Operating System)

The Hormozi Squad integrates with MMOS for mind cloning and DNA extraction:

**Primary Integration:**
- **Source Material:** `squads/mind-cloning/minds/alex_hormozi/` (165+ files)
- **Voice DNA:** Extracted from books, playbooks, programs
- **Thinking DNA:** Frameworks, heuristics, decision trees

**DNA Extraction Process:**
1. Source curation from 165+ files
2. Voice DNA extraction (communication patterns)
3. Thinking DNA extraction (decision frameworks)
4. Agent generation with embedded DNA
5. Quality validation (smoke tests, fidelity scoring)

### AIOS Core Integration

**Quality Gates:**
- `QG-SC-1.1` - Structure Validation
- `QG-SC-2.1` - Reference Integrity
- `QG-SC-3.1` - Veto Scan
- `QG-SC-4.1` - Coherence Check
- `QG-SC-5.1` - DNA Review
- `QG-SC-6.1` - Squad Review

**Validation Tools:**
- `coherence-validator.py` - Axioma scoring (D1-D10)
- `validate-squad.md` - 6-phase validation workflow

---

## Knowledge Base

### Structured Knowledge (4 databases)

| Knowledge Base | Type | Contents |
|----------------|------|----------|
| **Antipatterns DB** | YAML | 73 failure patterns with triggers, severity, antidotes |
| **Scaling Patterns** | YAML | Stage-appropriate strategies by business model |
| **Case Library** | YAML | Real-world Hormozi case studies |
| **Source Index** | YAML | 165+ files mapped to agents |

### Cognitive Prompts (11 files)

Located in `minds/prompts/Hormozi/`:
- `00_COGNITIVE_OS.md` - Core operating system
- `01_FRAMEWORKS_OPERACIONAIS.md` - Operational frameworks
- `02_LEAD_GENERATION_SYSTEM.md` - Lead gen frameworks
- `03_OFFER_CREATION_SYSTEM.md` - Offer design frameworks
- `04_COMMUNICATION_DNA.md` - Voice and communication style
- `05_ANTIPATTERN_SHIELDS.md` - Immune system rules
- `06_PRICING_FRAMEWORKS.md` - Monetization models
- `07_SCALING_PLAYBOOKS.md` - Growth strategies
- `08_INDUSTRY_ADAPTATION.md` - Context-based routing
- `09_RETENTION_MECHANICS.md` - Customer lifecycle
- `10_LAUNCH_ORCHESTRATION.md` - Event execution

---

## Quality Gates

### Checklist Coverage (45 checklists)

| Domain | Checklists | Key Validations |
|--------|------------|-----------------|
| **Offers** | 10 | Value equation, bonus stacks, guarantees |
| **Leads** | 7 | Core Four, lead magnets, activation |
| **Pricing** | 6 | Golden ratios, LTV:CAC, pricing frameworks |
| **Copy** | 8 | Hooks, headlines, GOATED ads |
| **Launch** | 6 | Timeline, war room, contingency |
| **Retention** | 5 | Onboarding, churn diagnosis, engagement |
| **General** | 3 | Antipattern screening, market validation |

### Veto Conditions

**Global Veto Rules:**
- `VETO_MISMATCH_001` - Price tier / tactic mismatch (e.g., calls for $97 product)
- `VETO_MISMATCH_002` - Stage / advice mismatch (e.g., optimization for overdelivery stage)
- `VETO_GENERIC_001` - Generic advice without context diagnosis

**Market Validation Vetos:**
- Zero pain → VETO (no desperate need)
- Zero purchasing power → VETO (can't afford)
- Zero accessibility → VETO (can't reach audience)
- Declining market → VETO (shrinking TAM)

**Antipattern Vetos:**
- High churn structure (e.g., startups pre-revenue)
- Commoditized offering without differentiation
- Low LTV:CAC ratio (<3:1)
- Unsustainable scaling (hiring before systemization)

---

## Next Steps

**For New Users:**
1. Start with `/hormozi:agents:hormozi-chief` for context diagnosis
2. Run `wf-context-diagnosis` to get routing recommendations
3. Follow routing to appropriate specialist agent

**For Squad Maintenance:**
- Review validation report: `docs/validation-report-2026-02-13.md`
- Update source material as new Hormozi content releases
- Expand edge case examples in agents
- Add automation scripts for checklist scoring

---

**Squad Status:** ✅ Production Ready (Score: 7.94/10)
**Next Review:** 2026-03-13 (30 days)

---

*Documentation generated by Squad Architect | AIOS v3.0*
