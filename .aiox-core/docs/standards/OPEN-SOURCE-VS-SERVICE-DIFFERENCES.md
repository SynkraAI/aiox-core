# Open-Source vs Service Implementation Differences

**Version:** 2.1.0
**Date:** 2025-12-09
**Purpose:** Document differences between AIOX open-source and AIOX service implementations
**Status:** ⚠️ Needs Review - Updated for v4.2 Multi-Repo Strategy

---

## Overview

AIOX has two deployment contexts:
1. **Open-Source** - Public repositories, community-driven, self-hosted
2. **Service** - Commercial offering (e.g., MMOS Mind emulations, certified partner integrations)

This document clarifies which features apply to which context.

---

## Multi-Repo Strategy (v4.2)

### Repository Organization

| Repository | License | Type | Contains |
|------------|---------|------|----------|
| `SynkraAI/aiox-core` | Commons Clause | Public | Core framework, 11 agents, Quality Gates |
| `SynkraAI/aiox-squads` | MIT | Public | ETL, Creator, MMOS-Mapper squads |
| `SynkraAI/mcp-ecosystem` | Apache 2.0 | Public | Docker MCP, IDE configs, MCP presets |
| `SynkraAI/mmos` | Proprietary + NDA | Private | MMOS Minds, DNA Mental |
| `SynkraAI/certified-partners` | Proprietary | Private | Premium squads, partner portal |

### npm Package Scoping

| Package | Registry | Availability |
|---------|----------|--------------|
| `@aiox/core` | npm public | Open-source |
| `@aiox/squad-etl` | npm public | Open-source |
| `@aiox/squad-creator` | npm public | Open-source |
| `@aiox/squad-mmos` | npm public | Open-source |
| `@aiox/mcp-presets` | npm public | Open-source |

### Open-Source vs Service by Repository

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    OPEN-SOURCE (Public Repos)                           │
│                                                                         │
│   SynkraAI/aiox-core        SynkraAI/aiox-squads                   │
│   ┌─────────────────────┐     ┌─────────────────────┐                  │
│   │ • Core Framework    │     │ • ETL Squad         │                  │
│   │ • 11 Base Agents    │     │ • Creator Squad     │                  │
│   │ • Quality Gates     │     │ • MMOS-Mapper Squad │                  │
│   │ • Standards Docs    │     │ • squad.yaml format │                  │
│   └─────────────────────┘     └─────────────────────┘                  │
│                                                                         │
│   SynkraAI/mcp-ecosystem                                             │
│   ┌─────────────────────┐                                              │
│   │ • Docker MCP        │                                              │
│   │ • IDE Configurations│                                              │
│   │ • MCP Presets       │                                              │
│   └─────────────────────┘                                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    SERVICE (Private Repos)                              │
│                                                                         │
│   SynkraAI/mmos             SynkraAI/certified-partners            │
│   ┌─────────────────────┐     ┌─────────────────────┐                  │
│   │ • MMOS Minds        │     │ • Premium Squads    │                  │
│   │ • DNA Mental™       │     │ • Partner Portal    │                  │
│   │ • Mind Clones       │     │ • Custom Agents     │                  │
│   │ • NDA Required      │     │ • Enterprise Tools  │                  │
│   └─────────────────────┘     └─────────────────────┘                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Task Format Differences

### responsavel_type Field

| Value | Open-Source | Service | Description |
|-------|-------------|---------|-------------|
| **Agente** | ✅ Yes | ✅ Yes | AI-powered agent execution |
| **Worker** | ❌ No | ✅ Yes | Script-based execution (service infrastructure) |
| **Humano** | ❌ No | ✅ Yes | Manual human review (service team) |
| **Clone** | ⚠️ MMOS Squad only | ✅ Yes | Mind emulation (MMOS Squad or service) |

**Open-Source Rule:**
- Always use `responsavel_type: Agente`
- Exception: MMOS Squad may use `Clone` for mind emulations
- Never use `Worker` or `Humano` in open-source tasks

**Service Rule:**
- Can use all 4 types based on EXECUTOR-DECISION-TREE.md
- Worker for orchestration scripts
- Humano for QA reviews
- Clone for methodology validation (Brad Frost, etc.)

---

### atomic_layer Field

| Context | Usage | Example |
|---------|-------|---------|
| **Open-Source** | Optional, conceptual | Can omit or include for documentation |
| **Service** | Required for design tasks | Must specify for Atomic Design validation |

**Open-Source Rule:**
- `atomic_layer` is a **concept** for understanding task organization
- Not strictly enforced in validation
- Can be included for clarity but not required

**Service Rule:**
- Required for all tasks in design workflows
- Validated against Atomic Design principles
- Used for dependency tracking and architecture validation

---

### Template Field

**Open-Source:**
```yaml
**Template:**
- path: .aiox-core/templates/task-execution-report.md
  type: output
  version: 1.0
  variables: [agent_name, task_name, duration]
```

**Service:**
```yaml
**Template:**
- path: squads/instagram-content-creator/tasks/analyze-brief.md
  type: prompt
  version: 2.1.0
  variables: [brief_text, brand_id, campaign_goal]
  schema: squads/.../schemas/analyze-brief-output.json
```

**Difference:**
- Open-source uses templates from `.aiox-core/templates/`
- Service uses Squad-specific templates with JSON Schema validation

---

## Checklist Differences

### Naming Convention

**Open-Source (Recommended):**
```yaml
# In task files
pre-conditions:
  - [ ] {condition}

post-conditions:
  - [ ] {condition}

acceptance-criteria:
  - [ ] {criterion}

# Separate file for agent-general validations
.aiox-core/checklists/{agent-id}-general-validation.md
```

**Rationale:**
- `pre-conditions` and `post-conditions` are execution-specific
- `acceptance-criteria` link to story requirements
- Generic agent checklists (like "always run linter") go in separate files

**Service:**
```yaml
# Can use same structure OR
# Can use "Checklist:" section with types
**Checklist:**
  pre-conditions: [...]
  post-conditions: [...]
  acceptance-criteria: [...]
```

---

## Tools vs Scripts

### Open-Source Definition

**Tools** = External, reusable, shared across agents
- MCPs (mcp-clickup, mcp-supabase, context7, exa)
- CLI wrappers (gh, supabase CLI)
- APIs (public APIs)
- Shared utility scripts (used by 2+ agents)

**Scripts** = Agent-specific, not reusable
- `.aiox-core/scripts/{agent-id}-specific/{script}.js`
- Logic unique to one agent
- Not abstracted for reuse

**Example:**

```yaml
# DEV AGENT TASK
**Tools:**
- context7:           # MCP - shared with architect, analyst
    used_for: Documentation lookup
    shared_with: [dev, architect, analyst]

- mcp-supabase:       # MCP - shared with data-engineer, architect
    used_for: Database operations
    shared_with: [dev, data-engineer, architect]

**Scripts:**
- .aiox-core/scripts/dev-specific/test-runner.js:    # Only dev uses this
    description: Dev agent test execution logic
    language: javascript
```

### Service Definition

Same as open-source, but may include:
- Proprietary APIs
- Internal microservices
- Commercial tools (paid APIs)

---

## Execution Modes

### Open-Source

**Applicable to:**
- Tasks with creative/subjective decisions
- Tasks with ambiguity
- Tasks requiring user collaboration

**Not applicable to:**
- Deterministic config loaders
- Schema validators
- Simple file operations

**Example Tasks with Modes:**
- `develop-story` - Many decisions during development
- `create-agent` - Creative design of agent persona
- `design-architecture` - Strategic planning decisions

**Example Tasks without Modes:**
- `load-config` - No decisions, always same logic
- `validate-schema` - Deterministic validation
- `list-files` - Simple file listing

### Service

Same as open-source, but may have:
- Service-specific modes (e.g., "batch mode" for bulk processing)
- Different default modes based on user tier

---

## Error Handling

### Open-Source

**Fallback Plans:**
- Missing input → Prompt user or use defaults
- Missing template → Use generic template from `.aiox-core/templates/`
- Missing tool → Abort and notify user
- Missing data → Use minimal defaults or prompt user

**Example:**
```yaml
**Error Handling:**
- strategy: fallback
- fallback: |
    If template not found:
    1. Check .aiox-core/templates/ for generic version
    2. If not found, use minimal output structure
    3. Notify user of missing template
```

### Service

**Fallback Plans:**
- Missing input → Use AI inference or service defaults
- Missing template → Retry with alternative source
- Missing tool → Route to different service
- Missing data → Query external APIs or databases

**Example:**
```yaml
**Error Handling:**
- strategy: fallback
- fallback: |
    If template not found:
    1. Query template service API
    2. Use AI to generate template dynamically
    3. Fallback to cached template from previous run
```

---

## Performance Tracking

### Open-Source

**Metrics:**
- Duration (ms)
- Tokens (input/output/total)
- Cost (estimated based on tokens)
- Cache hits/misses

**Tracking:**
- Logged to console or file
- Can be sent to analytics if user opts in

**Example:**
```yaml
**Performance:**
- duration_expected: 2000ms
- cost_estimated: $0.001      # Calculated from token usage
- cacheable: true
```

### Service

**Metrics:**
- All open-source metrics PLUS:
- User ID tracking
- A/B test variant
- Service SLA compliance
- Queue wait time

**Tracking:**
- Sent to production analytics
- Monitored for SLA violations
- Used for billing

**Example:**
```yaml
**Performance:**
- duration_expected: 2000ms
- cost_estimated: $0.001
- cacheable: true
- sla_target: 3000ms          # Service-specific
- queue_priority: high        # Service-specific
```

---

## Personality Configuration

### Open-Source

**Agent Personas:**
- Defined in `.aiox-core/agents/{agent-id}.md`
- All 11 agents have personas (Dex, Quinn, Pax, etc.)
- PT-BR localization (DECISION-1)
- 3 personification levels (minimal, named, archetypal)

**Output:**
- Standardized structure (familiaridade)
- Personalized tone (personalização)
- Fixed positions for metrics/duration/tokens

### Service

Same as open-source, but may include:
- Customer-specific personas (white-label)
- Multi-language support beyond PT-BR
- Custom archetypes for specific industries

---

## Metadata

### Open-Source

**Required:**
- story: STORY-XXX
- version: X.Y.Z
- author: {name or team}
- created_at / updated_at

**Optional:**
- dependencies
- breaking_changes

### Service

**Required:**
- All open-source fields PLUS:
- service_id: {service identifier}
- customer_id: {customer identifier if multi-tenant}
- billing_code: {for cost allocation}

---

## Validation

### Open-Source

**Task Validation:**
```javascript
function validateTask(task) {
  const required = ['task', 'responsável', 'responsavel_type', 'Entrada', 'Saída'];

  // Open-source specific: responsavel_type must be "Agente" (except MMOS)
  if (task.responsavel_type !== 'Agente' && !task.isMmosSquad) {
    console.warn(`Open-source tasks should use responsavel_type: Agente. Found: ${task.responsavel_type}`);
  }

  // atomic_layer is optional
  if (!task.atomic_layer) {
    console.info('atomic_layer not specified (optional for open-source)');
  }

  return true;
}
```

### Service

**Task Validation:**
```javascript
function validateTask(task) {
  const required = ['task', 'responsável', 'responsavel_type', 'atomic_layer', 'Entrada', 'Saída'];

  // Service: all executor types allowed
  const validExecutors = ['Agente', 'Worker', 'Humano', 'Clone'];
  if (!validExecutors.includes(task.responsavel_type)) {
    throw new Error(`Invalid executor type: ${task.responsavel_type}`);
  }

  // Service: atomic_layer required for design tasks
  if (!task.atomic_layer && task.category === 'design') {
    throw new Error('atomic_layer required for design tasks');
  }

  return true;
}
```

---

## Migration Checklist

### Converting Service Task to Open-Source

- [ ] Change `responsavel_type: Worker` → `responsavel_type: Agente`
- [ ] Change `responsavel_type: Humano` → `responsavel_type: Agente`
- [ ] Change `responsavel_type: Clone` → `responsavel_type: Agente` (unless MMOS)
- [ ] Make `atomic_layer` optional (or remove if not useful)
- [ ] Update template paths (squads/ → .aiox-core/templates)
- [ ] Remove service-specific fields (service_id, customer_id, billing_code)
- [ ] Update error handling fallbacks (remove service APIs)
- [ ] Update tools (remove proprietary/internal tools)
- [ ] Update performance metrics (remove service SLA fields)

### Converting Open-Source Task to Service

- [ ] Keep `responsavel_type: Agente` OR change based on EXECUTOR-DECISION-TREE.md
- [ ] Make `atomic_layer` required for design tasks
- [ ] Update template paths to Squad templates
- [ ] Add service-specific fields (service_id, etc.)
- [ ] Update error handling with service fallbacks
- [ ] Add service tools/APIs
- [ ] Add service performance metrics (SLA, queue priority)

---

## Quick Reference

| Feature | Open-Source | Service |
|---------|-------------|---------|
| **responsavel_type** | Agente only | Agente/Worker/Humano/Clone |
| **atomic_layer** | Optional | Required for design |
| **Templates** | .aiox-core/templates/ | squads/{squad}/ |
| **Tools** | MCPs, open-source CLIs | + Proprietary APIs |
| **Scripts** | Agent-specific only | + Service orchestration |
| **Error Fallbacks** | Local/user-driven | + Service APIs |
| **Performance Tracking** | Local logging | + Production analytics |
| **Personas** | 11 standard agents | + Custom/white-label |
| **Validation** | Relaxed (warnings) | Strict (errors) |

---

## Related Documents

- [AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md](./AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md) - Complete v4.2 framework guide
- [STANDARDS-INDEX.md](./STANDARDS-INDEX.md) - Standards navigation
- [TASK-FORMAT-SPECIFICATION-V1.md](./TASK-FORMAT-SPECIFICATION-V1.md) - Complete task format spec
- [AGENT-PERSONALIZATION-STANDARD-V1.md](./AGENT-PERSONALIZATION-STANDARD-V1.md) - Personality guidelines
- [multi-repo-strategy.md](../../docs/architecture/multi-repo-strategy.md) - Multi-repo architecture details

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-14 | 1.0.0 | Initial document | @architect |
| 2025-12-09 | 2.1.0 | Added Multi-Repo Strategy section, updated terminology (Squad), updated related docs | @dev (Dex) |

---

**Last Updated:** 2025-12-09
**Version:** 2.1.0
**Applies to:** AIOX v4.2+
