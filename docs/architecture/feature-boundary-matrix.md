# Feature Boundary Matrix: Core vs Pro

**Version:** 1.0
**Status:** Approved (Stakeholder Decision)
**Date:** 2026-02-05
**ADR Reference:** [ADR-PRO-003](adr/adr-pro-003-feature-gating-licensing.md)

---

## Overview

This document defines the feature boundary between **aios-core** (free, open-source) and **aios-pro** (paid, proprietary). It serves as the authoritative reference for what is included in each product.

**Boundary Principle:** Core is complete and fully functional. Pro adds capabilities without removing or crippling Core features.

---

## Feature Matrix

### Agents

| Feature | Core | Pro | Feature ID |
|---------|:----:|:---:|------------|
| 12 base agents (dev, qa, architect, pm, po, sm, analyst, data-engineer, ux-design-expert, devops, aios-master, squad-creator) | Y | Y | - |
| Agent activation (@agent-name) | Y | Y | - |
| Agent commands (*help, *task, etc.) | Y | Y | - |
| Custom agent builder | - | Y | `pro.agents.custom-builder` |
| Agent marketplace (browse, install) | - | Y | `pro.agents.marketplace` |

### Tasks

| Feature | Core | Pro | Feature ID |
|---------|:----:|:---:|------------|
| All standard tasks | Y | Y | - |
| Backlog management | Y | Y | - |
| Task execution with elicitation | Y | Y | - |
| Advanced task orchestration | - | Y | `pro.tasks.orchestration` |
| Parallel task execution | - | Y | `pro.tasks.parallel` |

### Squads

| Feature | Core | Pro | Feature ID |
|---------|:----:|:---:|------------|
| Squad Creator (basic) | Y | Y | - |
| Squad template system | Y | Y | - |
| Squad Creator Pro (advanced templates, marketplace publishing) | - | Y | `pro.squads.creator-pro` |
| Premium squads (SaaS, e-commerce, fintech) | - | Y | `pro.squads.premium` |
| Community squads marketplace | - | Y | `pro.squads.marketplace` |
| Marketplace squad installation | - | Y | `pro.squads.marketplace` |

### CLI

| Feature | Core | Pro | Feature ID |
|---------|:----:|:---:|------------|
| Full CLI (init, install, doctor, info, validate) | Y | Y | - |
| Agent activation and commands | Y | Y | - |
| Config management (show, migrate) | Y | Y | - |
| Advanced CLI analytics | - | Y | `pro.cli.analytics` |
| Session replay and audit | - | Y | `pro.cli.session-replay` |

### Configuration

| Feature | Core | Pro | Feature ID |
|---------|:----:|:---:|------------|
| 4-level config hierarchy (L1-L4) | Y | Y | - |
| Framework, project, app, local configs | Y | Y | - |
| Config merge (deep merge, last-wins, +append) | Y | Y | - |
| `aios config show/diff/validate` | Y | Y | - |
| Pro config extension (pro/pro-config.yaml) | - | Y | - |
| Multi-org configuration management | - | Y | `pro.config.multi-org` |
| Config inheritance templates | - | Y | `pro.config.templates` |

### Memory

| Feature | Core | Pro | Feature ID |
|---------|:----:|:---:|------------|
| Basic session memory | Y | Y | - |
| Persistent memory store | - | Y | `pro.memory.persistent` |
| Cross-session context sharing | - | Y | `pro.memory.cross-session` |
| Memory analytics and optimization | - | Y | `pro.memory.analytics` |

### Metrics

| Feature | Core | Pro | Feature ID |
|---------|:----:|:---:|------------|
| Basic stats (command counts, session info) | Y | Y | - |
| Usage dashboards (real-time) | - | Y | `pro.metrics.dashboards` |
| Team analytics and productivity | - | Y | `pro.metrics.team-analytics` |
| AI provider cost tracking and budgets | - | Y | `pro.metrics.cost-tracking` |

### Integrations

| Feature | Core | Pro | Feature ID |
|---------|:----:|:---:|------------|
| GitHub basic (issues, PRs) | Y | Y | - |
| ClickUp integration | - | Y | `pro.integrations.clickup` |
| Google Drive integration | - | Y | `pro.integrations.google-drive` |
| GitLab integration | - | Y | `pro.integrations.gitlab` |
| Bitbucket integration | - | Y | `pro.integrations.bitbucket` |
| Jira integration | - | Y | `pro.integrations.jira` |
| Azure DevOps integration | - | Y | `pro.integrations.azure-devops` |

### Support

| Feature | Core | Pro | Feature ID |
|---------|:----:|:---:|------------|
| Community support (GitHub Issues) | Y | Y | - |
| Priority support | - | Y | - |
| SLA-backed support | - | Y | - |

---

## Gating Behavior

### When a user hits a Pro feature without a license

```
$ aios squad create --template saas

  Squad Creator Pro requires an active AIOS Pro license.
  Your data and configurations are preserved.

  Activate: aios pro activate --key <KEY>
  Purchase: https://synkra.ai/pro
```

**Rules:**
1. Core features NEVER show Pro upgrade prompts
2. Pro features show a clear, non-intrusive message with activation instructions
3. No data loss when Pro features are unavailable
4. Pro prompts include both activation (existing key) and purchase (new customer) links

### Feature ID Convention

```
pro.{module}.{feature-name}

Examples:
  pro.squads.premium
  pro.memory.persistent
  pro.integrations.clickup
```

All feature IDs are registered in `pro/feature-registry.yaml` and validated by the `FeatureGate` singleton at runtime.

---

## License Tiers (Future - Pricing TBD)

The architecture supports granular feature enablement per license:

| Tier | Modules | Use Case |
|------|---------|----------|
| **Starter** | squads only | Teams wanting premium squads |
| **Professional** | squads + memory + metrics | Full development teams |
| **Enterprise** | All modules + integrations + SLA | Organizations with compliance needs |

> Pricing model is deferred. The feature gating system is pricing-model-agnostic by design.

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-02-05 | 1.0 | Initial feature boundary matrix (stakeholder approved) | Pax (@po) |

---

*Reference: [ADR-PRO-003](adr/adr-pro-003-feature-gating-licensing.md) for full gating architecture*
