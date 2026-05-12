# AIOX Architecture Documentation Index

> 🌐 [EN](../../architecture/ARCHITECTURE-INDEX.md) | **PT** | [ES](../../es/architecture/ARCHITECTURE-INDEX.md)

---

**Version:** 2.1.1
**Last Updated:** 2026-01-26
**Status:** Official Reference

---

## 📋 Document Navigation

This index provides navigation to all architecture documentation for AIOX v4.

> **Note:** Official framework documentation (coding-standards, tech-stack, source-tree) has been consolidated in `docs/framework/`. See [Framework README](../framework/README.md) for details.

---

## 📁 Directory Structure

```
docs/architecture/
├── ARCHITECTURE-INDEX.md     # This file
├── high-level-architecture.md # System overview
├── module-system.md          # 4-module architecture
├── mcp-system-diagrams.md    # MCP architecture diagrams
├── memory-layer.md           # Memory system architecture
├── adr/                      # Architectural Decision Records
└── [framework/]              # See docs/framework/ for standards
```

---

## 🎯 Quick Links by Topic

### Core Architecture

| Document | Description | Status |
|----------|-------------|--------|
| [High-Level Architecture](./high-level-architecture.md) | Overview of AIOX v4 architecture | ✅ Current |
| [Module System](./module-system.md) | 4-module modular architecture | ✅ Current |
| [Memory Layer](./memory-layer.md) | Memory system architecture | ✅ Current |

### MCP & Integrations

| Document | Description | Status |
|----------|-------------|--------|
| [MCP System Diagrams](./mcp-system-diagrams.md) | MCP architecture diagrams | ✅ Current |

> **Note:** MCP management is handled via Docker MCP Toolkit (Story 5.11). Use `@devops` agent with `*setup-mcp-docker` for configuration.

### Agent System

| Document | Description | Status |
|----------|-------------|--------|
| [Agent Responsibility Matrix](./agent-responsibility-matrix.md) | Agent roles and responsibilities | ✅ Current |
| [Agent Config Audit](./agent-config-audit.md) | Configuration audit | ✅ Current |

### Tools & Utilities

| Document | Description | Status |
|----------|-------------|--------|
| [Utility Integration Guide](./utility-integration-guide.md) | Utility integration | ✅ Current |
| [CI/CD](./ci-cd.md) | CI/CD pipeline documentation | ✅ Current |

### Health Check System (HCS)

| Document | Description | Status |
|----------|-------------|--------|
| [HCS Check Specifications](./hcs-check-specifications.md) | Health check specs | ✅ Current |
| [HCS Execution Modes](./hcs-execution-modes.md) | Execution modes | ✅ Current |
| [HCS Self-Healing Spec](./hcs-self-healing-spec.md) | Self-healing specification | ✅ Current |

### Squad System

| Document | Description | Status |
|----------|-------------|--------|
| [Squad Improvement Analysis](./squad-improvement-analysis.md) | Improvement analysis | ✅ Current |
| [Squad Improvement Approach](./squad-improvement-recommended-approach.md) | Recommended approach | ✅ Current |

### Architectural Decision Records (ADR)

| Document | Description | Status |
|----------|-------------|--------|
| [ADR COLLAB-1](./adr/ADR-COLLAB-1-current-state-audit.md) | Current state audit | ✅ Current |
| [ADR COLLAB-2](./adr/ADR-COLLAB-2-proposed-configuration.md) | Proposed configuration | ✅ Current |
| [ADR HCS](./adr/adr-hcs-health-check-system.md) | Health Check System | ✅ Current |
| [ADR Isolated VM](./adr/adr-isolated-vm-decision.md) | Isolated VM decision | ✅ Current |

### Reference Documents (Official in docs/framework/)

| Document | Description | Status |
|----------|-------------|--------|
| [Tech Stack](../framework/tech-stack.md) | Technology decisions | ✅ Current |
| [Coding Standards](../framework/coding-standards.md) | Code standards | ✅ Current |
| [Source Tree](../framework/source-tree.md) | Project structure | ✅ Current |

> **Note:** These are linked to `docs/framework/` which is the official location.

### Research & Analysis

| Document | Description | Status |
|----------|-------------|--------|
| [Contribution Workflow Research](./contribution-workflow-research.md) | Contribution analysis | ✅ Current |
| [Introduction](./introduction.md) | Original intro (v2.0) | 📦 Legacy |

---

## 🏗️ Architecture Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     AIOX v4 ARCHITECTURE                              │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    MULTI-REPO STRUCTURE                          │   │
│   │                                                                  │   │
│   │   SynkraAI/aiox-core ◄───── Central Hub                       │   │
│   │          │                    - Framework core                   │   │
│   │          │                    - 11 base agents                   │   │
│   │          │                    - Discussions hub                  │   │
│   │          │                                                       │   │
│   │   ┌──────┴───────┐                                               │   │
│   │   │              │                                               │   │
│   │   ▼              ▼                                               │   │
│   │ aiox-squads   mcp-ecosystem                                      │   │
│   │ (MIT)         (Apache 2.0)                                       │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    MODULAR ARCHITECTURE                          │   │
│   │                                                                  │   │
│   │   .aiox-core/                                                    │   │
│   │   ├── core/           ← Framework foundations                    │   │
│   │   ├── development/    ← Agents, tasks, workflows                 │   │
│   │   ├── product/        ← Templates, checklists                    │   │
│   │   └── infrastructure/ ← Scripts, tools, integrations             │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                    QUALITY GATES 3 LAYERS                        │   │
│   │                                                                  │   │
│   │   Layer 1: Pre-commit ──► Layer 2: PR ──► Layer 3: Human        │   │
│   │   (Husky/lint-staged)    (CodeRabbit)    (Strategic Review)     │   │
│   │        30%                  +50%              +20%               │   │
│   │                        (80% automated)                           │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📚 Reading Order for New Contributors

### Quick Start (30 min)
1. [High-Level Architecture](./high-level-architecture.md)
2. [Module System](./module-system.md)
3. [Framework README](../framework/README.md)

### Deep Dive (2-3 hours)
1. All Quick Start documents
2. [Agent Responsibility Matrix](./agent-responsibility-matrix.md)
3. [MCP System Diagrams](./mcp-system-diagrams.md)
4. [Tech Stack](../framework/tech-stack.md)

### Complete Mastery (1-2 days)
1. All documents in this index
2. ADR documents for architectural decisions
3. HCS documentation for health check system

---

## 📝 Document Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Current | Up-to-date with v4.2 |
| ⚠️ Update needed | Needs terminology or content update |
| 📦 Legacy | Historical reference |
| 🆕 New | Recently created |

---

**Last Updated:** 2026-01-26
**Maintainer:** @architect (Aria)
