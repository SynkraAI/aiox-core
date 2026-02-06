# Changelog

All notable changes to the squad-creator pack will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-01

### Added

**Agents**
- Squad Architect agent - Expert squad creator with full AIOS compliance
- SOP Extractor agent - Process documentation and automation specialist

**Tasks**
- `create-squad.md` - Complete squad creation workflow with 6 phases
- `create-agent.md` - Individual agent creation with research-first approach
- `create-task.md` - Task workflow creation
- `create-template.md` - Template creation
- `create-workflow.md` - Multi-phase workflow creation
- `extract-sop.md` - SOP extraction from meeting transcripts
- `deep-research-pre-agent.md` - Deep research before agent creation
- `sync-ide-command.md` - IDE command synchronization
- `install-commands.md` - Command installation

**Workflows**
- `mind-research-loop.md` - Iterative research with devil's advocate (3-5 iterations)
- `research-then-create-agent.md` - Research-first agent creation flow
- `wf-create-squad.yaml` - Complete squad creation workflow definition

**Templates**
- `config-tmpl.yaml` - Squad configuration template
- `readme-tmpl.md` - Squad README template
- `agent-tmpl.md` - Agent definition template (AIOS 6-level structure)
- `task-tmpl.md` - Task workflow template
- `template-tmpl.yaml` - Output template template
- `workflow-tmpl.yaml` - Multi-phase workflow template
- `research-prompt-tmpl.md` - Research query generation
- `research-output-tmpl.md` - Research results format
- `pop-extractor-prompt.md` - SOP extraction prompt (SC-PE-001)
- `quality-gate-tmpl.yaml` - Quality checkpoint template

**Checklists**
- `squad-checklist.md` - Comprehensive squad validation
- `mind-validation.md` - Mind validation before squad inclusion
- `deep-research-quality.md` - Research output quality validation
- `task-anatomy-checklist.md` - Task structure validation (8 fields)
- `sop-validation.md` - SOP extraction validation (SC-PE-001)
- `agent-quality-gate.md` - Agent quality gate (SC_AGT_001)
- `executor-matrix-checklist.md` - Executor assignment validation
- `quality-gate-checklist.md` - General quality gates

**Knowledge Bases**
- `squad-kb.md` - Comprehensive squad creation guide (15 sections)
- `best-practices.md` - Best practices for squad creation
- `core-heuristics.md` - Core decision heuristics
- `quality-dimensions-framework.md` - 10-dimension quality scoring
- `tier-system-framework.md` - Agent tier classification (0-3 + tools)
- `decision-heuristics-framework.md` - Decision validation patterns
- `executor-matrix-framework.md` - Who executes what (Human/Agent/Hybrid/Worker)

### Framework Integration

- Integrated `tier-system-framework.md` for agent tier classification
- Integrated `quality-dimensions-framework.md` for 10-dimension quality scoring
- Integrated `decision-heuristics-framework.md` for checkpoint logic
- Integrated `executor-matrix-framework.md` for task executor assignment

### Quality Standards

- All agents include voice_dna, output_examples, objection_algorithms
- All tasks follow PHASE structure with checkpoints
- All workflows integrate frameworks
- Quality measured by principle adherence, not line counts

---

## [1.1.0] - 2026-02-01

### Added

**Granular Validation System (Principles-Based)**
- `*validate-squad {name}` - Validate entire squad against principles and templates
- `*validate-agent {file}` - Validate agent against AIOS principles
- `*validate-task {file}` - Validate task against Task Anatomy principles
- `*validate-workflow {file}` - Validate workflow quality
- `*validate-template {file}` - Validate template structure
- `*validate-checklist {file}` - Validate checklist quality

**New Task**
- `validate-squad.md` v2.0.0 - Qualitative validation (principles > metrics)

**Validation Dimensions (Qualitative)**
- Template Conformance (25%) - "Does component follow template structure?"
- Principle Adherence (25%) - "Are AIOS principles applied?"
- Internal Consistency (20%) - "Are voice, persona, examples aligned?"
- Integration Quality (15%) - "Do components work together?"
- Practical Utility (15%) - "Does squad solve declared problem?"

**50+ Validation Check IDs**
- AGT-001 to AGT-017: Agent validation checks
- TSK-001 to TSK-016: Task validation checks
- WFL-001 to WFL-007: Workflow validation checks
- TPL-001 to TPL-006: Template validation checks
- CKL-001 to CKL-004: Checklist validation checks
- KBS-001 to KBS-006: Knowledge base validation checks
- PRC-001 to PRC-005: Principle validation checks
- INT-001 to INT-005: Integration validation checks

### Changed
- Renamed `*validate-pack` to `*validate-squad`
- **BREAKING:** Removed line-count based validation
- **BREAKING:** Removed arbitrary numeric thresholds
- Validation now compares against templates and principles, not counts

### Philosophy Change
```
BEFORE: "Does agent have 300+ lines?" → PASS
AFTER:  "Does agent follow template and principles?" → PASS
```

### Fixed
- config.yaml name mismatch (squad-architect → squad-creator)

---

## [1.1.1] - 2026-02-01

### Fixed
- README.md version footer updated from 1.0.0 to 1.1.0 (consistency fix)
- Validation report updated to reflect 10/10 quality score

### Updated
- docs/validation-report-2026-02-01.md - Comprehensive validation with 10/10 score

---

## [Unreleased]

### Planned
- Video walkthrough documentation
- Performance benchmarks
- Additional specialist agents (legal-squad-creator, copy-squad-creator)
