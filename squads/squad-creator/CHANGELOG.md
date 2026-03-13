# Changelog

All notable changes to the squad-creator pack will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-02-10

### Added

**Mental Model Integration: Decision Checkpoints in oalanicolas Tasks**

Mental models (VALUES, OBSESSIONS, MODELS, PARADOXES) from `squads/mind-cloning/minds/alan_nicolas/artifacts/` were present in `oalanicolas.md` but disconnected from tasks — clone executed procedurally without consulting them.

Now **46 checkpoints** across **10 tasks** force the clone to consult mental models BEFORE decisions.

**New Files**
- `data/mental-model-task-matrix.yaml` (692 lines) — Maps all 17 mental models to 46 checkpoints across 10 tasks
- `checklists/mental-model-integration-checklist.md` (95 lines) — Validates coverage: all models have checkpoints, all tasks have checkpoints

**Modified Tasks (10/10 with decision checkpoints)**

| Task | Lines Added | Key Checkpoints |
|------|-------------|-----------------|
| `an-assess-sources.md` | +58 | clareza_radical, autenticidade_integral, pareto_ao_cubo, elitist_egalitarian |
| `an-extract-framework.md` | +52 | autenticidade_integral, clareza_radical, clareza_compreensao, humble_expert |
| `an-extract-dna.md` | +52 | liberdade_criativa, clareza_compreensao, clarity_from_chaos, clarity_first |
| `find-0.8.md` | +13 | pareto_ao_cubo (integral), eficiencia_alavancagem |
| `an-design-clone.md` | +58 | impacto_transformador, freedom_through_structure, frameworks_as_liberation |
| `an-validate-clone.md` | +34 | autenticidade_integral (x2), clarity_first |
| `an-diagnose-clone.md` | +41 | clareza_compreensao, impacto_transformador, limited_losses, clarity_first |
| `deconstruct.md` | +48 | clareza_compreensao, clareza_radical, first_principles, clarity_from_chaos |
| `extract-implicit.md` | +54 | clareza_radical, first_principles, clareza_compreensao, pareto_ao_cubo, humble_expert |
| `validate-extraction.md` | +27 | clareza_radical, pareto_ao_cubo, elitist_egalitarian |

### Checkpoint Types

| Type | Purpose | Example |
|------|---------|---------|
| `decision_filter` | Filter input before processing | "Esta fonte traz CLAREZA ou RUÍDO?" |
| `quality_gate` | Validate output quality | "Framework tem regras SE/ENTÃO?" |
| `depth_gate` | Ensure extraction depth | "Extraí FRAMEWORK ou só PLAYBOOK?" |
| `veto` | Block progress if criteria unmet | "Clone soa como PESSOA ou IA genérica?" |
| `paradox_navigation` | Navigate productive tensions | "Estrutura RESTRINGE pra LIBERAR?" |

### Smoke Tests (4/4 PASS)

| Test | Input | Expected | Result |
|------|-------|----------|--------|
| ST-1: VALUES | 10 fontes mistas (Gary Vee) | Citar VALUES ao classificar | PASS — reclassificou Instagram Stories via checkpoint |
| ST-2: OBSESSIONS | Artigo genérico "10 dicas" | Rejeitar como PLAYBOOK | PASS — vetou extração, citou clareza_compreensao |
| ST-3: MODELS | 15 atividades de CEO | Classificar em 4 zonas Pareto | PASS — aplicou ELIMINA > AUTOMATIZA > AMPLIFICA |
| ST-4: PARADOXES | Pedido de "flexibilidade sem regras" | Navegar paradoxo sem resolver | PASS — propôs estrutura rígida que libera |

### Architecture Change

```
BEFORE: Models in agent.md, tasks execute procedurally
  oalanicolas.md: VALUES + OBSESSIONS + MODELS + PARADOXES (loaded)
  tasks/*.md: Step 1 → Step 2 → Step 3 (no consultation)

AFTER: Models connected to tasks via decision checkpoints
  oalanicolas.md: VALUES + OBSESSIONS + MODELS + PARADOXES (loaded)
  tasks/*.md: Step 1 → [CHECKPOINT: consult VALUE] → Step 2 → [CHECKPOINT: apply MODEL]
```

### Coverage Summary

| Category | Models | Checkpoints | Tasks Covered |
|----------|--------|-------------|---------------|
| VALUES | 5 | 14 | 7 tasks |
| OBSESSIONS | 3 | 8 | 6 tasks |
| MODELS | 5 | 13 | 8 tasks |
| PARADOXES | 4 | 11 | 6 tasks |
| **Total** | **17** | **46** | **10 tasks** |

Zero gaps: all 17 models have at least 1 checkpoint, all 10 tasks have at least 2 checkpoints.

---

## [2.9.0] - 2026-02-05

### Added

**Worker Script Optimization (Cost Reduction ~$540/year)**

Based on Executor Decision Tree analysis (`*optimize squad-creator`), converted deterministic tasks from Agent (LLM) to Worker (Python scripts):

**New Worker Scripts**
- `sync-ide-command.py` (430 lines) - Synchronizes squad components to IDE directories
  - 100% deterministic file operations (read, parse YAML, copy, symlink)
  - Supports Claude (.claude/commands/) and Cursor (.cursor/rules/ with MDC format)
  - Flags: `--dry-run`, `--force`, `--ide`, `--verbose`

- `validate-squad-structure.py` (535 lines) - Phases 0-2 of squad validation
  - Phase 0: Type Detection (expert/pipeline/hybrid based on signals)
  - Phase 1: Structure Validation (config.yaml, security scan, file existence)
  - Phase 2: Coverage Analysis (checklist coverage, orphan tasks, data usage)
  - Output: JSON for Agent enrichment in Phases 3-6

**Task Metadata Updates**
- Added `execution_type` field to 6 tasks:
  - `refresh-registry.md` → Hybrid (Worker script + Agent enrichment)
  - `squad-analytics.md` → Hybrid (Worker script + Agent recommendations)
  - `sync-ide-command.md` → Worker (100% deterministic)
  - `install-commands.md` → Worker (100% deterministic)
  - `validate-squad.md` → Hybrid (Worker Phases 0-2 + Agent Phases 3-6)
  - `optimize.md` → Agent (requires semantic analysis)

### Architecture

```
BEFORE: All tasks executed by Agent (LLM) → Expensive
AFTER:  Deterministic ops by Worker scripts → 70% cheaper

┌─────────────────────────────────────────────────────┐
│           EXECUTOR DECISION TREE                     │
├─────────────────────────────────────────────────────┤
│  Worker (Python)  │ Deterministic: file ops, YAML   │
│  Agent (LLM)      │ Semantic: analysis, generation  │
│  Hybrid           │ Worker collects → Agent enriches│
└─────────────────────────────────────────────────────┘
```

### Cost Savings

| Metric | Value |
|--------|-------|
| Monthly savings | ~$45/month |
| Annual savings | ~$540/year |
| LLM tokens avoided | ~15M tokens/month |

### Documentation

- `scripts/README.md` - New documentation for all Worker scripts
- Updated task files with `execution_type` and `worker_script` metadata

---

## [2.8.0] - 2026-02-05

### Added

**Complete Test Suite**
- `test_scoring.py` - Tests for scoring.py (30+ test cases)
- `test_inventory.py` - Tests for inventory.py (25+ test cases)
- `test_dependency_check.py` - Tests for dependency_check.py (25+ test cases)
- `test_naming_validator.py` - Tests for naming_validator.py (30+ test cases)
- `test_refresh_registry.py` - Tests for refresh-registry.py (20+ test cases)
- `test_squad_analytics.py` - Tests for squad-analytics.py (25+ test cases)
- `test_checklist_validator.py` - Tests for checklist_validator.py (25+ test cases)

**New Script**
- `checklist_validator.py` - Automated checklist structure validation
  - Extracts and validates YAML check definitions
  - Validates check types (blocking, recommended, warning, etc.)
  - Detects duplicate check IDs
  - Validates checklist metadata
  - Generates validation reports (text/JSON)

**Production Evidence Documentation**
- README now documents real outputs from mmos/squads
- Statistics: 31 squads, 206 agents, 60+ cloned minds
- Gold Standard reference: squad `copy` (32,049 lines, 25 copywriters)
- Real agent examples with actual Voice DNA and Thinking DNA

### Changed

- Updated version to 2.8.0
- README includes "Produção Real" section with verifiable evidence
- Test coverage now includes all 7 Python scripts in scripts/

### Quality Metrics

- Test files: 9 (up from 2 in v2.7.0)
- Test cases: 180+ total
- Scripts covered: 100% (all 7 Python scripts)
- Production evidence: Documented and verifiable

---

## [2.7.0] - 2026-02-05

### Added

**Agents**
- `squad-diagnostician.md` - Tier 0 diagnostic/triage agent for routing requests
  - TRIAGE Framework for rapid diagnosis
  - Ecosystem awareness (checks existing squads before creating)
  - Clean handoffs with full context to specialists
  - Routing matrix for squad-chief, oalanicolas, pedro-valerio, sop-extractor

**Scripts/Tests**
- `scripts/tests/` - New pytest test suite for Python scripts
  - `test_quality_gate.py` - Tests for quality_gate.py (15+ test cases)
  - `test_yaml_validator.py` - Tests for yaml_validator.py (20+ test cases)
  - `conftest.py` - Shared fixtures for test suite
  - `__init__.py` - Package initialization

### Changed

- Updated `config.yaml` to v2.7.0 with Tier 0 agent documentation
- Updated `README.md` with complete Tier architecture diagram
- Agents table now shows Tier levels (0, Orch, 1, 2)

### Documentation

- Added Tier 0 agent to agent specialist table
- Updated activation commands with squad-diagnostician
- Enhanced architecture diagram with all tiers

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
- config.yaml name mismatch (squad-chief → squad-creator)

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
