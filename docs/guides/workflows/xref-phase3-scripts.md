# Cross-Reference Phase 3: Development Scripts & Greeting System

> **Generated:** 2026-02-05
> **Scope:** `.aios-core/development/scripts/` (38 files)
> **Methodology:** Full source reading + codebase-wide grep for each script filename

---

## Table of Contents

1. [Complete Script Inventory](#1-complete-script-inventory)
2. [Greeting System Architecture](#2-greeting-system-architecture)
3. [Dependency Tree Diagram](#3-dependency-tree-diagram)
4. [Orphaned Scripts Analysis](#4-orphaned-scripts-analysis)
5. [Script Categories & Agent Mapping](#5-script-categories--agent-mapping)

---

## 1. Complete Script Inventory

### 1.1 Top-Level Scripts (28 files)

| # | File | Purpose | Dependencies (imports) | Callers / References | Agent(s) | Orphan? |
|---|------|---------|----------------------|---------------------|----------|---------|
| 1 | `greeting-builder.js` | Core GreetingBuilder class -- builds contextual greetings based on session type, git config, project status, command visibility | `context-detector`, `git-config-detector`, `workflow-navigator`, `greeting-preference-manager`, `project-status-loader`, `PermissionMode`, `js-yaml` | 46 files: all 12 agent .md files, `generate-greeting.js`, `test-greeting-system.js`, `/greet` slash command, tests, docs, `install-manifest.yaml` | ALL agents (12/12) | No |
| 2 | `generate-greeting.js` | CLI wrapper/orchestrator for greeting generation -- loads context from filesystem then delegates to GreetingBuilder | `greeting-builder`, `session-context-loader`, `project-status-loader`, `agent-config-loader`, `js-yaml` | 13 files: agent .md files (devops, data-engineer, ux-design-expert), tests, docs, `install-manifest.yaml` | @devops, @data-engineer, @ux-design-expert | No |
| 3 | `greeting-preference-manager.js` | Manages user greeting preference (auto/minimal/named/archetypal) via `core-config.yaml` | `js-yaml` | 13 files: `greeting-builder.js`, `greeting-config-cli.js`, `generate-greeting.js`, tests, docs | All (via greeting-builder) | No |
| 4 | `greeting-config-cli.js` | Standalone CLI for get/set greeting preferences | `greeting-preference-manager` | Self-referencing only in docs | CLI users | No |
| 5 | `apply-inline-greeting-all-agents.js` | Batch script to apply inline greeting logic to all 11 agents (Story 6.1.2.5-T1) | `fs`, `path` | `install-manifest.yaml`, coverage reports | One-time migration tool | Low-use |
| 6 | `test-greeting-system.js` | Manual test script for greeting system with mock agents | `greeting-builder`, `js-yaml` | `install-manifest.yaml`, coverage | Testing/debugging | Low-use |
| 7 | `agent-config-loader.js` | Loads agent-specific config with lazy loading, performance tracking, and cache | `js-yaml`, `config-cache`, `performance-tracker` | 20 files: `generate-greeting.js`, `config-loader.js`, `service-registry.json`, tests, docs | All (via generate-greeting pipeline) | No |
| 8 | `audit-agent-config.js` | Audit script analyzing which `core-config.yaml` sections each agent requires | `js-yaml` | `install-manifest.yaml`, docs | DevOps/analysis tool | Low-use |
| 9 | `agent-assignment-resolver.js` | Resolves `{TODO: Agent Name}` placeholders in task files based on prefix mapping | `fs`, `path` | `install-manifest.yaml` | One-time migration tool | Low-use |
| 10 | `agent-exit-hooks.js` | Defines hook system for workflow context persistence on command completion | `context-detector` | `install-manifest.yaml`, docs | Framework integration (Story 6.1.6) | Low-use |
| 11 | `batch-update-agents-session-context.js` | Batch updates 8 agents with session context loader integration (Story 6.1.2.6.2) | `fs.promises`, `path` | `install-manifest.yaml` | One-time migration tool | Low-use |
| 12 | `backlog-manager.js` | Manages technical debt, follow-ups, and enhancements backlog with prioritization | `fs.promises` | 28 files: `po-backlog-add.md`, `dev-backlog-debt.md`, `qa-backlog-add-followup.md`, story tasks, docs | @po, @dev, @qa | No |
| 13 | `decision-context.js` | DecisionContext class tracking decisions, files, tests during yolo mode execution | `child_process`, `path` | 17 files: `decision-recorder.js`, `decision-log-generator.js`, `dev-develop-story.md`, agent dev.md, tests | @dev (yolo mode) | No |
| 14 | `decision-log-generator.js` | Generates markdown decision logs from DecisionContext data | `fs.promises`, `path` | 17 files: `decision-recorder.js`, dev tasks, tests | @dev (yolo mode) | No |
| 15 | `decision-log-indexer.js` | Maintains index file of all decision logs for discovery | `fs.promises`, `path`, `js-yaml` | `decision-recorder.js`, tests | @dev (yolo mode) | No |
| 16 | `decision-recorder.js` | Singleton API for recording decisions during yolo mode -- manages global context | `decision-context`, `decision-log-generator`, `js-yaml` | `dev-develop-story.md`, tests | @dev (yolo mode) | No |
| 17 | `dev-context-loader.js` | Optimized file loading for @dev agent with smart caching and summarization | `fs.promises`, `path`, `js-yaml` | 9 files: tests, docs, `install-manifest.yaml` | @dev | No |
| 18 | `story-manager.js` | Handles story file operations and ClickUp synchronization | `fs.promises`, `path`, `js-yaml`, `story-update-hook`, `tool-resolver` | 28 files: `po-sync-story.md`, `po-pull-story.md`, `po-stories-index.md`, various tasks | @po, @pm | No |
| 19 | `story-update-hook.js` | Detects changes between story versions and syncs to ClickUp | `clickup-helpers`, `js-yaml` | `story-manager.js`, `po-sync-story.md`, tests | @po, @pm | No |
| 20 | `story-index-generator.js` | Scans `docs/stories/` and generates comprehensive story index with metadata | `fs.promises`, `path` | `po-stories-index.md`, `jest.config.js`, docs | @po | No |
| 21 | `task-identifier-resolver.js` | Resolves `{TODO: task identifier}` placeholders in 114 task files | `fs`, `path` | `install-manifest.yaml` | One-time migration tool | Low-use |
| 22 | `validate-task-v2.js` | Validates task files against V2.0 specification (11 compliance rules) | `fs`, `path` | 9 files: `migrate-task-to-v2.js`, docs | @qa, @dev | No |
| 23 | `migrate-task-to-v2.js` | Semi-automated V1.0 to V2.0 task migration helper | `fs`, `path` | 9 files: `validate-task-v2.js`, docs | @dev migration | Low-use |
| 24 | `workflow-navigator.js` | Provides intelligent next-step command suggestions from workflow patterns | `fs`, `path`, `js-yaml` | 18 files: `greeting-builder.js`, tasks, docs | All (via greeting-builder) | No |
| 25 | `workflow-state-manager.js` | File-based state persistence for guided workflow automation across sessions | `fs.promises`, `path`, `js-yaml` | 18 files: `run-workflow.md`, `run-workflow-engine.md`, tasks | @sm, @pm | No |
| 26 | `workflow-validator.js` | Validates workflow YAML files against AIOS conventions (9 checks) | `fs.promises`, `path`, `js-yaml` | 18 files: `validate-workflow.md`, `squad-validator.js`, tasks | @qa, @architect | No |
| 27 | `verify-workflow-gaps.js` | Verification script for workflow gap fixes (GAP 1, 2, 3) | `fs`, `path`, `js-yaml` | 18 files: docs, `install-manifest.yaml` | Verification tool | Low-use |
| 28 | `decision-context.js` | (See #13 above -- same file) | -- | -- | -- | -- |

### 1.2 Squad Sub-Module Scripts (10 files in `squad/`)

| # | File | Purpose | Dependencies | Callers / References | Agent(s) | Orphan? |
|---|------|---------|-------------|---------------------|----------|---------|
| S1 | `index.js` | Central exports aggregator for all squad utilities | All squad modules below | 43 files: `squad-creator.md`, all squad tasks, tests | @squad-creator | No |
| S2 | `squad-loader.js` | Loads and resolves squad manifests from local directories (SQS-2) | `fs.promises`, `path`, `js-yaml` | `index.js`, `squad-creator-list.md`, tests | @squad-creator | No |
| S3 | `squad-validator.js` | Validates squad structure against JSON schema, task format, agent defs (SQS-3) | `ajv`, `fs.promises`, `path`, `js-yaml`, squad-schema.json | `index.js`, `squad-creator-validate.md`, tests, `workflow-validator.js` | @squad-creator, @qa | No |
| S4 | `squad-generator.js` | Generates squad structure following task-first architecture (SQS-4) | `fs.promises`, `path`, `child_process`, `js-yaml` | `index.js`, `squad-creator-create.md`, tests | @squad-creator | No |
| S5 | `squad-designer.js` | Analyzes documentation and generates squad blueprints with recommendations (SQS-9) | `fs.promises`, `path`, `js-yaml` | `index.js`, `squad-creator-design.md`, tests | @squad-creator | No |
| S6 | `squad-migrator.js` | Migrates legacy squad formats to AIOS 2.1 standard (SQS-7) | `fs.promises`, `path`, `js-yaml` | `index.js`, `squad-creator-migrate.md`, tests | @squad-creator | No |
| S7 | `squad-downloader.js` | Downloads squads from aios-squads GitHub repository (SQS-6) | `https`, `fs.promises`, `path` | `index.js`, `squad-creator-download.md`, tests | @squad-creator | No |
| S8 | `squad-publisher.js` | Publishes squads to aios-squads GitHub repo via PR (SQS-6) | `child_process`, `fs.promises`, `path` | `index.js`, `squad-creator-publish.md`, tests | @squad-creator | No |
| S9 | `squad-analyzer.js` | Analyzes existing squads with component inventory, coverage metrics (SQS-11) | `fs.promises`, `path`, `js-yaml` | `squad-creator-analyze.md`, tests | @squad-creator | No |
| S10 | `squad-extender.js` | Extends existing squads with new components and manifest updates (SQS-11) | `fs.promises`, `path`, `js-yaml` | `squad-creator-extend.md`, tests | @squad-creator | No |

**Note:** `squad/README.md` is documentation, not counted as a script.

---

## 2. Greeting System Architecture

### 2.1 Overview

The AIOS greeting system generates contextual, session-aware greetings when agents are activated. It consists of **8 greeting-related files** in the development scripts directory plus supporting infrastructure.

### 2.2 All Greeting-Related Files

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `greeting-builder.js` | Core Class | ~948 | GreetingBuilder class with all greeting logic |
| `generate-greeting.js` | CLI Wrapper | ~160 | CLI orchestrator that loads context then delegates to GreetingBuilder |
| `greeting-preference-manager.js` | Config Manager | ~145 | Reads/writes greeting preference from `core-config.yaml` |
| `greeting-config-cli.js` | CLI Tool | ~85 | Standalone CLI for `get`/`set` greeting preferences |
| `test-greeting-system.js` | Test Script | ~100+ | Manual test script with mock agent definitions |
| `apply-inline-greeting-all-agents.js` | Migration Batch | ~147 | One-time batch script to update agent activation instructions |
| `.aios-core/product/templates/activation-instructions-inline-greeting.yaml` | Template | ~64 | YAML template for inline greeting logic in agent files |
| `.claude/commands/greet.md` | Slash Command | ~102 | `/greet` slash command definition for Claude Code |

**External copies (in `.claude/commands/AIOS/scripts/`):**
| File | Purpose |
|------|---------|
| `greeting-builder.js` | Copy of core GreetingBuilder for Claude Code slash commands |
| `generate-greeting.js` | Copy of CLI wrapper for Claude Code slash commands |

### 2.3 How Greeting Templates Work

The greeting system uses a **three-level greeting approach** defined in each agent's `persona_profile.greeting_levels`:

```yaml
persona_profile:
  greeting_levels:
    minimal: "{icon} {id} ready"           # Shortest form
    named: "{icon} {name} ({archetype}) ready. {catchphrase}"  # Default
    archetypal: "{icon} {name} the {archetype} ({zodiac}) ready to {action}!"  # Full personality
```

**Greeting Level Selection:**

| User Preference | Greeting Level Used |
|----------------|-------------------|
| `auto` (default) | Session-aware: new=archetypal, existing=named, workflow=minimal |
| `minimal` | Always `greeting_levels.minimal` |
| `named` | Always `greeting_levels.named` |
| `archetypal` | Always `greeting_levels.archetypal` |

The preference is stored in `.aios-core/core-config.yaml` under `agentIdentity.greeting.preference`.

### 2.4 How Greetings are Generated Per-Agent

All 12 agents reference the greeting system in their `activation-instructions` STEP 3:

**Pattern A: Direct Class Invocation (9 agents)**
Used by: @dev, @qa, @architect, @pm, @po, @sm, @analyst, @aios-master, @squad-creator

```yaml
activation-instructions:
  - STEP 3: |
      Build intelligent greeting using .aios-core/development/scripts/greeting-builder.js
      The buildGreeting(agentDefinition, conversationHistory) method:
        - Detects session type (new/existing/workflow) via context analysis
        - Checks git configuration status (with 5min cache)
        - Loads project status automatically
        - Filters commands by visibility metadata (full/quick/key)
        - Suggests workflow next steps if in recurring pattern
        - Formats adaptive greeting automatically
```

**Pattern B: CLI Wrapper Invocation (3 agents)**
Used by: @devops, @data-engineer, @ux-design-expert

These agents use `generate-greeting.js` which orchestrates context loading externally before calling the GreetingBuilder.

### 2.5 The Full Greeting Pipeline

```
Agent Activation (STEP 3)
         |
         v
   +-----------------+
   | Preference Check |  GreetingPreferenceManager.getPreference()
   +-----------------+  reads core-config.yaml -> agentIdentity.greeting.preference
         |
    auto?  fixed?
    /         \
   v           v
+------------------+   +----------------------------+
| Contextual Path  |   | Fixed Level Path           |
|                  |   | buildFixedLevelGreeting()   |
| 1. Session Type  |   | Returns greeting_levels[X]  |
| 2. Project Status|   +----------------------------+
| 3. Git Config    |
| 4. Permission    |
+------------------+
         |
         v
+----------------------------------+
| Build Greeting Sections          |
| 1. Presentation (always)        |
|    - archetypal greeting         |
|    - permission badge            |
| 2. Role description (new only)  |
| 3. Project status (if git)      |
|    - branch, modified files,     |
|      recent commits, story       |
| 4. Context section (existing)   |
|    - agent transition narrative  |
|    - recommended command         |
| 5. Workflow suggestions          |
|    (workflow sessions only)      |
| 6. Commands (filtered)          |
|    - new: full/quick/key (12max) |
|    - existing: quick/key (6-8)   |
|    - workflow: key only          |
| 7. Footer + signature            |
+----------------------------------+
         |
         v
   Formatted String
   (sections joined by \n\n)
         |
         v
   Agent displays to user
```

### 2.6 Agents with Custom Greetings

All agents share the same GreetingBuilder logic but differ in:

| Agent | Icon | Archetype | Zodiac | Custom Greeting Example |
|-------|------|-----------|--------|------------------------|
| @dev (Dex) | `\U0001f4bb` | Builder | Aquarius | "Dex the Builder ready to construct excellence!" |
| @qa (Quinn) | `\U0001f6e1\ufe0f` | Guardian | Virgo | "Quinn the Guardian ready!" |
| @po (Pax) | `\u2696\ufe0f` | Balancer | Libra | "Pax the Balancer ready!" |
| @pm (Morgan) | `\U0001f4cb` | Strategist | Capricorn | "Morgan the Strategist ready!" |
| @sm (River) | `\U0001f30a` | Facilitator | Sagittarius | "River the Facilitator ready!" |
| @architect (Aria) | `\U0001f3d7\ufe0f` | Visionary | Gemini | "Aria the Visionary ready!" |
| @analyst (Alex) | `\U0001f50d` | Decoder | Scorpio | "Alex the Decoder ready!" |
| @devops (Gage) | `\u2699\ufe0f` | Automator | Aries | "Gage the Automator ready!" |
| @data-engineer (Dara) | `\U0001f4ca` | Sage | Taurus | "Dara the Sage ready!" |
| @ux-design-expert (Uma) | `\U0001f3a8` | Empathizer | Pisces | "Uma the Empathizer ready!" |
| @aios-master | `\U0001f9e0` | Orchestrator | Leo | "AIOS Master Orchestrator ready!" |
| @squad-creator | `\U0001f4e6` | Assembler | -- | "Squad Creator ready!" |

Each agent's greeting levels are defined in its `.md` persona file under `persona_profile.greeting_levels` (or `persona_profile.communication.greeting_levels`).

### 2.7 Greeting System Dependencies

```
greeting-builder.js
  |-- context-detector.js          (.aios-core/core/session/)
  |-- git-config-detector.js       (.aios-core/infrastructure/scripts/)
  |-- workflow-navigator.js        (sibling in development/scripts/)
  |-- greeting-preference-manager.js (sibling)
  |-- project-status-loader.js     (.aios-core/infrastructure/scripts/)
  |-- PermissionMode               (.aios-core/core/permissions/)
  |-- js-yaml
  |-- fs, path

generate-greeting.js
  |-- greeting-builder.js          (sibling)
  |-- session-context-loader.js    (.aios-core/scripts/)
  |-- project-status-loader.js     (.aios-core/infrastructure/scripts/)
  |-- agent-config-loader.js       (sibling)
  |-- js-yaml
  |-- fs.promises, path

greeting-preference-manager.js
  |-- js-yaml
  |-- fs, path

greeting-config-cli.js
  |-- greeting-preference-manager.js (sibling)

test-greeting-system.js
  |-- greeting-builder.js (sibling)

apply-inline-greeting-all-agents.js
  |-- fs, path (standalone)
```

### 2.8 Test Coverage

| Test File | Scope | Tests |
|-----------|-------|-------|
| `tests/unit/greeting-builder.test.js` | GreetingBuilder class unit tests | 27+ |
| `tests/unit/generate-greeting.test.js` | CLI wrapper unit tests | Multiple |
| `tests/unit/greeting-preference.test.js` | Preference manager unit tests | Multiple |
| `tests/integration/contextual-greeting.test.js` | End-to-end greeting generation | Multiple |
| `tests/integration/greeting-preference-integration.test.js` | Preference integration | Multiple |
| `tests/integration/greeting-system-integration.test.js` | Full system integration | Multiple |

---

## 3. Dependency Tree Diagram

### 3.1 Full Script Dependency Graph

```
                    ┌─────────────────────────┐
                    │    Agent .md Files       │
                    │    (12 agents)           │
                    └────────────┬────────────┘
                                 │ STEP 3 references
                    ┌────────────┴────────────┐
                    │                         │
          ┌─────────▼──────────┐  ┌──────────▼──────────┐
          │ greeting-builder.js │  │ generate-greeting.js │
          │ (core logic)       │  │ (CLI wrapper)        │
          └─┬──┬──┬──┬──┬─────┘  └─┬──┬──┬──┬──────────┘
            │  │  │  │  │           │  │  │  │
            │  │  │  │  └───────────┼──┘  │  └─── session-context-loader
            │  │  │  │              │     └────── project-status-loader
            │  │  │  └──────────────┘
            │  │  │  agent-config-loader ──────── config-cache
            │  │  │                               performance-tracker
            │  │  └── workflow-navigator ──────── workflow-patterns.yaml
            │  └───── greeting-preference-mgr ─── core-config.yaml
            └──────── context-detector
                      git-config-detector
                      project-status-loader
                      PermissionMode

  ┌──────────────────────────────────────────────────┐
  │              Decision Logging Cluster              │
  │                                                    │
  │  decision-recorder.js ──┬── decision-context.js   │
  │                         └── decision-log-generator │
  │  decision-log-indexer.js ── decision-recorder.js   │
  └──────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────┐
  │              Story Management Cluster              │
  │                                                    │
  │  story-manager.js ──── story-update-hook.js       │
  │                         └── clickup-helpers.js     │
  │  story-index-generator.js (standalone)             │
  │  backlog-manager.js (standalone)                   │
  └──────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────┐
  │              Workflow Cluster                       │
  │                                                    │
  │  workflow-navigator.js ─── workflow-patterns.yaml  │
  │  workflow-state-manager.js (standalone)            │
  │  workflow-validator.js (standalone)                 │
  │  verify-workflow-gaps.js (standalone)               │
  └──────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────┐
  │              Squad Sub-Module                       │
  │                                                    │
  │  squad/index.js ──┬── squad-loader.js             │
  │                   ├── squad-validator.js (→ ajv)   │
  │                   ├── squad-generator.js            │
  │                   ├── squad-designer.js             │
  │                   ├── squad-migrator.js             │
  │                   ├── squad-downloader.js           │
  │                   ├── squad-publisher.js            │
  │                   ├── squad-analyzer.js             │
  │                   └── squad-extender.js             │
  └──────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────┐
  │              Migration/One-Time Tools              │
  │                                                    │
  │  agent-assignment-resolver.js (standalone)        │
  │  task-identifier-resolver.js (standalone)          │
  │  batch-update-agents-session-context.js (stalone)  │
  │  apply-inline-greeting-all-agents.js (standalone)  │
  │  migrate-task-to-v2.js (standalone)                │
  │  audit-agent-config.js (standalone)                │
  └──────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────┐
  │              Agent/Config Utilities                │
  │                                                    │
  │  agent-config-loader.js ── config-cache           │
  │                            performance-tracker     │
  │  dev-context-loader.js (standalone)               │
  │  agent-exit-hooks.js ── context-detector           │
  └──────────────────────────────────────────────────┘
```

### 3.2 External Dependencies (non-Node.js built-in)

| Package | Used By |
|---------|---------|
| `js-yaml` | greeting-builder, generate-greeting, greeting-preference-manager, story-manager, story-index-generator, decision-log-indexer, decision-recorder, dev-context-loader, workflow-navigator, workflow-state-manager, workflow-validator, verify-workflow-gaps, agent-config-loader, squad-loader, squad-validator, squad-generator, squad-designer, squad-migrator |
| `ajv` | squad-validator (JSON Schema validation) |

---

## 4. Orphaned Scripts Analysis

### 4.1 Confirmed Active Scripts (23)

These scripts have clear, active callers in the codebase:

- `greeting-builder.js` -- referenced by 46 files
- `generate-greeting.js` -- referenced by 13 files
- `greeting-preference-manager.js` -- referenced by 13 files
- `agent-config-loader.js` -- referenced by 20 files
- `backlog-manager.js` -- referenced by 28 files (task files)
- `story-manager.js` -- referenced by 28 files (task files)
- `story-update-hook.js` -- referenced by story-manager + tasks
- `story-index-generator.js` -- referenced by po tasks
- `decision-context.js` -- referenced by 17 files
- `decision-log-generator.js` -- referenced by 17 files
- `decision-log-indexer.js` -- referenced by decision-recorder
- `decision-recorder.js` -- referenced by dev tasks
- `dev-context-loader.js` -- referenced by 9 files
- `workflow-navigator.js` -- referenced by 18 files (via greeting-builder)
- `workflow-state-manager.js` -- referenced by 18 files (task files)
- `workflow-validator.js` -- referenced by 18 files (task files)
- `validate-task-v2.js` -- referenced by 9 files
- `greeting-config-cli.js` -- referenced by docs
- All 10 squad scripts -- referenced by 43+ files (squad-creator tasks + tests)

### 4.2 Low-Use / One-Time Migration Scripts (7)

These scripts were created for specific migration tasks and are unlikely to be needed again:

| Script | Original Purpose | Still Needed? |
|--------|-----------------|---------------|
| `apply-inline-greeting-all-agents.js` | Apply inline greeting to 11 agents (Story 6.1.2.5-T1) | **No** -- superseded by current greeting-builder approach |
| `batch-update-agents-session-context.js` | Add session context to 8 agents (Story 6.1.2.6.2) | **No** -- one-time migration complete |
| `agent-assignment-resolver.js` | Resolve `{TODO: Agent Name}` in 114 tasks (Story 6.1.7.1) | **No** -- one-time bulk fix |
| `task-identifier-resolver.js` | Resolve `{TODO: task identifier}` in 114 tasks (Story 6.1.7.1) | **No** -- one-time bulk fix |
| `migrate-task-to-v2.js` | Migrate tasks from V1.0 to V2.0 format | **Possibly** -- useful if new V1 tasks are created |
| `audit-agent-config.js` | Audit which config sections each agent needs | **Possibly** -- useful for optimization analysis |
| `verify-workflow-gaps.js` | Verify workflow gap fixes (GAP 1, 2, 3) | **No** -- one-time verification |

### 4.3 Truly Orphaned Scripts (0)

No scripts are truly orphaned -- all have at least one reference in the `install-manifest.yaml` or documentation. However, the 5 marked "No" above are effectively dead code that could be archived.

### 4.4 Test-Only Scripts (1)

| Script | Purpose |
|--------|---------|
| `test-greeting-system.js` | Manual test runner for greeting scenarios (supplementary to jest tests) |

---

## 5. Script Categories & Agent Mapping

### 5.1 By Functional Category

| Category | Scripts | Primary Agents |
|----------|---------|---------------|
| **Greeting System** (6) | greeting-builder, generate-greeting, greeting-preference-manager, greeting-config-cli, test-greeting-system, apply-inline-greeting-all-agents | All 12 agents |
| **Decision Logging** (4) | decision-context, decision-log-generator, decision-log-indexer, decision-recorder | @dev (yolo mode) |
| **Story Management** (3) | story-manager, story-update-hook, story-index-generator | @po, @pm |
| **Workflow Engine** (4) | workflow-navigator, workflow-state-manager, workflow-validator, verify-workflow-gaps | @sm, @pm, @qa, @architect |
| **Agent Configuration** (4) | agent-config-loader, audit-agent-config, agent-exit-hooks, dev-context-loader | All (via config pipeline), @dev |
| **Task Migration** (4) | validate-task-v2, migrate-task-to-v2, task-identifier-resolver, agent-assignment-resolver | @dev, @qa |
| **Backlog** (1) | backlog-manager | @po, @dev, @qa |
| **Batch Updates** (1) | batch-update-agents-session-context | One-time |
| **Squad Module** (10) | squad/index, squad-loader, squad-validator, squad-generator, squad-designer, squad-migrator, squad-downloader, squad-publisher, squad-analyzer, squad-extender | @squad-creator |

### 5.2 Agent Usage Heatmap

| Agent | Scripts Used | Count |
|-------|-------------|-------|
| @dev | greeting-builder, agent-config-loader, dev-context-loader, decision-context, decision-recorder, decision-log-generator, decision-log-indexer, validate-task-v2, backlog-manager, workflow-navigator | 10 |
| @qa | greeting-builder, agent-config-loader, validate-task-v2, workflow-validator, backlog-manager | 5 |
| @po | greeting-builder, agent-config-loader, story-manager, story-update-hook, story-index-generator, backlog-manager | 6 |
| @pm | greeting-builder, agent-config-loader, story-manager, workflow-state-manager | 4 |
| @sm | greeting-builder, agent-config-loader, workflow-state-manager | 3 |
| @architect | greeting-builder, agent-config-loader, workflow-validator | 3 |
| @analyst | greeting-builder, agent-config-loader | 2 |
| @devops | greeting-builder, generate-greeting, agent-config-loader | 3 |
| @data-engineer | greeting-builder, generate-greeting, agent-config-loader | 3 |
| @ux-design-expert | greeting-builder, generate-greeting, agent-config-loader | 3 |
| @aios-master | greeting-builder, agent-config-loader | 2 |
| @squad-creator | greeting-builder, agent-config-loader, squad/* (10 scripts) | 12 |

---

## Appendix A: File Path Reference

All scripts are located under:
```
C:\Users\AllFluence-User\Workspaces\AIOS\SynkraAI\aios-core\.aios-core\development\scripts\
```

Full absolute paths for top-level scripts:
```
.aios-core/development/scripts/agent-assignment-resolver.js
.aios-core/development/scripts/agent-config-loader.js
.aios-core/development/scripts/agent-exit-hooks.js
.aios-core/development/scripts/apply-inline-greeting-all-agents.js
.aios-core/development/scripts/audit-agent-config.js
.aios-core/development/scripts/backlog-manager.js
.aios-core/development/scripts/batch-update-agents-session-context.js
.aios-core/development/scripts/decision-context.js
.aios-core/development/scripts/decision-log-generator.js
.aios-core/development/scripts/decision-log-indexer.js
.aios-core/development/scripts/decision-recorder.js
.aios-core/development/scripts/dev-context-loader.js
.aios-core/development/scripts/generate-greeting.js
.aios-core/development/scripts/greeting-builder.js
.aios-core/development/scripts/greeting-config-cli.js
.aios-core/development/scripts/greeting-preference-manager.js
.aios-core/development/scripts/migrate-task-to-v2.js
.aios-core/development/scripts/story-index-generator.js
.aios-core/development/scripts/story-manager.js
.aios-core/development/scripts/story-update-hook.js
.aios-core/development/scripts/task-identifier-resolver.js
.aios-core/development/scripts/test-greeting-system.js
.aios-core/development/scripts/validate-task-v2.js
.aios-core/development/scripts/verify-workflow-gaps.js
.aios-core/development/scripts/workflow-navigator.js
.aios-core/development/scripts/workflow-state-manager.js
.aios-core/development/scripts/workflow-validator.js
```

Squad sub-module:
```
.aios-core/development/scripts/squad/index.js
.aios-core/development/scripts/squad/squad-analyzer.js
.aios-core/development/scripts/squad/squad-designer.js
.aios-core/development/scripts/squad/squad-downloader.js
.aios-core/development/scripts/squad/squad-extender.js
.aios-core/development/scripts/squad/squad-generator.js
.aios-core/development/scripts/squad/squad-loader.js
.aios-core/development/scripts/squad/squad-migrator.js
.aios-core/development/scripts/squad/squad-publisher.js
.aios-core/development/scripts/squad/squad-validator.js
```

---

*Cross-Reference Phase 3 Analysis - AIOS Framework*
*Generated: 2026-02-05*
*Total scripts analyzed: 37 (.js files) + 1 README.md*
