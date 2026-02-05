# Tier System Framework

> **Version:** 1.0.0
> **Source:** AIOS Quality Standards

Framework for organizing agents by expertise level and orchestrating their collaboration.

---

## 1. Overview

The Tier System organizes agents hierarchically based on their role in the workflow:

```text
┌─────────────────────────────────────────┐
│  ORCHESTRATOR (coordinates all tiers)    │
├─────────────────────────────────────────┤
│  TIER 0: Foundation & Diagnosis          │
│  - ALWAYS runs first                     │
│  - Establishes baseline understanding    │
├─────────────────────────────────────────┤
│  TIER 1: Core Execution                  │
│  - Primary domain experts                │
│  - Highest proven results                │
├─────────────────────────────────────────┤
│  TIER 2: Systematizers                   │
│  - Framework creators                    │
│  - Process specialists                   │
├─────────────────────────────────────────┤
│  TIER 3: Format Specialists              │
│  - Channel-specific experts              │
│  - Output format specialists             │
├─────────────────────────────────────────┤
│  TOOLS: Utility Functions                │
│  - Checklists, validators                │
│  - Not agents, applied after creation    │
└─────────────────────────────────────────┘
```

---

## 2. Tier Definitions

### Orchestrator

**Role:** Coordinates all tiers, routes requests, manages workflow.

```yaml
orchestrator:
  role: 'Workflow coordinator and router'
  responsibilities:
    - 'Route requests to appropriate tier'
    - 'Manage handoffs between agents'
    - 'Ensure quality gates are applied'
    - 'Maintain workflow state'
  when_to_activate: 'Always - serves as entry point'
```

### Tier 0: Foundation & Diagnosis

**Role:** Always runs first. Establishes baseline understanding.

```yaml
tier_0:
  name: 'Foundation & Diagnosis'
  purpose: 'Establish baseline before any execution'
  characteristics:
    - 'ALWAYS runs first in workflow'
    - 'Diagnostic and analytical focus'
    - 'Creates shared understanding'
    - 'Identifies constraints and opportunities'
  examples:
    - 'Auditor: Assesses current state'
    - 'Diagnostician: Identifies problems'
    - 'Researcher: Gathers foundational data'
    - 'Analyst: Segments and categorizes'
```

### Tier 1: Core Execution

**Role:** Primary domain experts with proven track record.

```yaml
tier_1:
  name: 'Core Execution'
  purpose: 'Primary experts for main deliverables'
  characteristics:
    - 'Highest proven results in domain'
    - 'Deep expertise, documented frameworks'
    - 'Used for primary output creation'
    - 'Strong authority and credibility'
  selection_criteria:
    - 'Documented track record'
    - 'Verifiable results'
    - 'Well-documented methodology'
    - 'Industry recognition'
```

### Tier 2: Systematizers

**Role:** Framework creators and process specialists.

```yaml
tier_2:
  name: 'Systematizers'
  purpose: 'Create systems and processes'
  characteristics:
    - 'Framework and methodology creators'
    - 'Process-oriented thinking'
    - 'Replicable, teachable approaches'
    - 'Bridge theory and practice'
  examples:
    - 'Process architect'
    - 'Methodology developer'
    - 'System designer'
    - 'Framework specialist'
```

### Tier 3: Format Specialists

**Role:** Channel and format-specific experts.

```yaml
tier_3:
  name: 'Format Specialists'
  purpose: 'Optimize for specific channels/formats'
  characteristics:
    - 'Deep expertise in specific format'
    - 'Channel-specific optimization'
    - 'Applied after core content exists'
    - 'Enhancement and adaptation focus'
  examples:
    - 'Video script specialist'
    - 'Email sequence specialist'
    - 'Landing page specialist'
    - 'Social media specialist'
```

### Tools

**Role:** Utility functions applied after creation.

```yaml
tools:
  name: 'Tools'
  purpose: 'Post-creation validation and enhancement'
  characteristics:
    - 'NOT agents, just utilities'
    - 'Applied AFTER main work is done'
    - 'Checklist-based validation'
    - 'Enhancement triggers'
  usage: 'Run via *tool-name command after creation'
  examples:
    - 'Quality checklist'
    - 'Trigger library'
    - 'Validation framework'
    - 'Enhancement patterns'
```

---

## 3. Config.yaml Structure

Standard configuration for tier-based squads:

```yaml
# Squad Configuration Template
pack:
  name: '{squad-name}'
  title: '{Human-Readable Title}'
  version: 'X.Y.Z'
  author: '{Team}'
  description: 'Brief description (< 200 chars)'
  icon: '{emoji}'
  slash_prefix: '{prefix}'

# Changelog (document all changes)
# Format: vX.Y.Z (YYYY-MM-DD) - Description

# Integration settings
integration:
  enabled: false
  log_source: true
  fallback_behavior: 'graceful'

# Agents organized by tier
agents:
  # Orchestrator
  - id: '{prefix}-chief'
    name: '{Role} Chief'
    role: 'Orchestrator - routing and coordination'
    tier: orchestrator
    version: 'X.Y.Z'

  # Tier 0 - Foundation & Diagnosis
  - id: '{agent-1}'
    name: '{Agent Name}'
    role: '{Role description}'
    tier: 0
    specialty: '{What they specialize in}'

  # Tier 1 - Core Execution
  - id: '{agent-2}'
    name: '{Agent Name}'
    role: '{Role description}'
    tier: 1
    results: '{Documented results}'
    specialty: '{Specialty}'

  # Tier 2 - Systematizers
  - id: '{agent-3}'
    name: '{Agent Name}'
    role: '{Role description}'
    tier: 2
    specialty: '{Framework/methodology}'

  # Tier 3 - Format Specialists
  - id: '{agent-4}'
    name: '{Agent Name}'
    role: '{Role description}'
    tier: 3
    specialty: '{Format/channel}'

  # Tools
  - id: '{tool-1}'
    name: '{Tool Name}'
    role: '{Checklist/validation}'
    tier: tool
    type: checklist
    usage: '*{command}'
    note: 'Usage notes'

# Archived agents (no longer active)
archived_agents:
  location: 'archive/agents/'
  reason: 'Why archived'
  agents:
    - id: '{archived-agent}'
      reason: 'Specific reason'

# Tasks registry
tasks:
  - id: '{task-id}'
    name: '{Task Name}'
    category: '{category}'

# Templates registry
templates:
  - id: '{template-id}'
    name: '{Template Name}'
    category: '{category}'

# Checklists registry
checklists:
  - id: '{checklist-id}'
    name: '{Checklist Name}'
    usage: 'When to use'
```

---

## 4. Orchestration Workflow

### Standard Flow

```text
1. Request arrives at Orchestrator
   │
2. Orchestrator routes to Tier 0 (ALWAYS)
   │
3. Tier 0 performs diagnosis
   ├── Returns: baseline understanding
   ├── Returns: constraints identified
   └── Returns: recommended tier for execution
   │
4. Orchestrator routes to recommended Tier (1, 2, or 3)
   │
5. Tier agent performs primary work
   ├── May request support from other tiers
   └── Produces primary deliverable
   │
6. Orchestrator applies Tools (validation)
   │
7. Output delivered
```

### Routing Rules

```yaml
routing_rules:
  - pattern: 'audit|analyze|diagnose|assess'
    route_to: tier_0

  - pattern: 'create|write|build|design'
    route_to: tier_1

  - pattern: 'systematize|process|framework'
    route_to: tier_2

  - pattern: 'adapt|format|optimize for'
    route_to: tier_3

  - pattern: 'validate|check|review'
    route_to: tools
```

---

## 5. Agent Selection Criteria

### For Tier 0 (Diagnosis)

```yaml
tier_0_criteria:
  required:
    - 'Analytical methodology'
    - 'Diagnostic framework'
    - 'Assessment output format'
  preferred:
    - 'Quantitative metrics'
    - 'Objective criteria'
```

### For Tier 1 (Core)

```yaml
tier_1_criteria:
  required:
    - 'Documented track record'
    - 'Verifiable results'
    - 'Clear methodology'
  preferred:
    - 'Industry recognition'
    - 'Published frameworks'
    - 'Case studies'
```

### For Tier 2 (Systematizers)

```yaml
tier_2_criteria:
  required:
    - 'Created replicable frameworks'
    - 'Teachable methodology'
    - 'Process documentation'
  preferred:
    - 'Training materials'
    - 'Implementation guides'
```

### For Tier 3 (Format)

```yaml
tier_3_criteria:
  required:
    - 'Deep format expertise'
    - 'Channel-specific knowledge'
    - 'Adaptation frameworks'
  preferred:
    - 'Format-specific results'
    - 'Platform expertise'
```

---

## 6. Tier Collaboration Patterns

### Handoff Pattern

```yaml
handoff:
  from: tier_0
  to: tier_1
  handoff_artifact:
    - 'Diagnosis report'
    - 'Constraints list'
    - 'Recommended approach'
  acceptance_criteria:
    - 'Diagnosis is complete'
    - 'Tier 1 agent is identified'
```

### Support Pattern

```yaml
support:
  primary: tier_1
  supporting: tier_2
  pattern: 'Tier 1 requests framework from Tier 2'
  example: 'Core expert requests systematized approach'
```

### Enhancement Pattern

```yaml
enhancement:
  input_from: tier_1
  enhanced_by: tier_3
  pattern: 'Primary output adapted for specific format'
  example: 'Core content converted to video script'
```

---

## 7. Adding New Agents

### Checklist

```markdown
- [ ] Determine appropriate tier based on role
- [ ] Document expertise and track record
- [ ] Create agent file following template
- [ ] Add to config.yaml in correct tier section
- [ ] Define handoff patterns with other agents
- [ ] Create relevant tasks and templates
- [ ] Test orchestration routing
```

### Tier Assignment Decision Tree

```text
IF agent performs diagnosis/analysis FIRST
  THEN Tier 0

ELSE IF agent is primary expert with track record
  THEN Tier 1

ELSE IF agent creates frameworks/systems
  THEN Tier 2

ELSE IF agent specializes in specific format/channel
  THEN Tier 3

ELSE IF agent is a validation/checklist tool
  THEN Tools
```

---

## 8. Quality Gates by Tier

```yaml
tier_quality_gates:
  tier_0:
    gate: 'diagnosis-complete'
    criteria:
      - 'Baseline established'
      - 'Constraints identified'
      - 'Recommendation provided'

  tier_1:
    gate: 'primary-output-complete'
    criteria:
      - 'Deliverable meets requirements'
      - 'Quality dimensions score >= 7.0'
      - 'No blocking issues'

  tier_2:
    gate: 'system-validated'
    criteria:
      - 'Framework is complete'
      - 'Process is documented'
      - 'Implementation guide exists'

  tier_3:
    gate: 'format-optimized'
    criteria:
      - 'Format requirements met'
      - 'Channel best practices applied'
      - 'Enhancement checklist passed'
```

---

_AIOS Tier System Framework v1.0_
