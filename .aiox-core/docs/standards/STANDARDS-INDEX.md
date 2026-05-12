# AIOX Standards Documentation Index

**Version:** 2.1.0
**Last Updated:** 2025-12-09
**Status:** Official Reference

---

## 📋 Quick Start Guide

### For New Contributors

1. **Start Here:** Read [AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md](./AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md) - Complete framework guide
2. **Story Creation:** Follow [STORY-TEMPLATE-V2-SPECIFICATION.md](./STORY-TEMPLATE-V2-SPECIFICATION.md)
3. **Quality Gates:** Understand [QUALITY-GATES-SPECIFICATION.md](./QUALITY-GATES-SPECIFICATION.md)

### For Existing Users

- **v2.0 → v4.0.4 Migration:** See "What's New" section in [AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md](./AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md)
- **Architecture Changes:** Review [ARCHITECTURE-INDEX.md](../../docs/architecture/ARCHITECTURE-INDEX.md)

---

## 📚 Standards by Category

### Core Framework Standards (Current v4.2)

| Document | Description | Status | Version |
|----------|-------------|--------|---------|
| [AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md](./AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md) | **Complete v4.2 framework guide** | ✅ Current | 2.1.0 |
| [QUALITY-GATES-SPECIFICATION.md](./QUALITY-GATES-SPECIFICATION.md) | 3-layer quality gates system | ✅ Current | 2.1.0 |
| [STORY-TEMPLATE-V2-SPECIFICATION.md](./STORY-TEMPLATE-V2-SPECIFICATION.md) | Story template v2.0 specification | ✅ Current | 2.0.0 |
| [TASK-FORMAT-SPECIFICATION-V1.md](./TASK-FORMAT-SPECIFICATION-V1.md) | Task-First architecture format | ✅ Current | 1.0.0 |
| [EXECUTOR-DECISION-TREE.md](./EXECUTOR-DECISION-TREE.md) | Humano/Worker/Agente/Clone routing | ✅ Current | 1.0.0 |
| [OPEN-SOURCE-VS-SERVICE-DIFFERENCES.md](./OPEN-SOURCE-VS-SERVICE-DIFFERENCES.md) | Business model documentation | ⚠️ Needs Update | 2.0.0 |

### Agent Standards

| Document | Description | Status | Version |
|----------|-------------|--------|---------|
| [AGENT-PERSONALIZATION-STANDARD-V1.md](./AGENT-PERSONALIZATION-STANDARD-V1.md) | Agent personality system | ✅ Current | 1.0.0 |

### Visual & Branding

| Document | Description | Status | Version |
|----------|-------------|--------|---------|
| [AIOX-COLOR-PALETTE-V2.1.md](./AIOX-COLOR-PALETTE-V2.1.md) | Complete color system | ✅ Current | 2.1.0 |
| [AIOX-COLOR-PALETTE-QUICK-REFERENCE.md](./AIOX-COLOR-PALETTE-QUICK-REFERENCE.md) | Quick color reference | ✅ Current | 2.1.0 |

### Legacy Documents (Reference Only)

| Document | Description | Status | Superseded By |
|----------|-------------|--------|---------------|
| [AIOX-LIVRO-DE-OURO.md](./AIOX-LIVRO-DE-OURO.md) | v2.0.0 base document | ⚠️ Deprecated | AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md |
| [AIOX-LIVRO-DE-OURO-V2.1.md](./AIOX-LIVRO-DE-OURO-V2.1.md) | v4.0.4 delta (partial) | ⚠️ Deprecated | AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md |
| [AIOX-LIVRO-DE-OURO-V2.1-SUMMARY.md](./AIOX-LIVRO-DE-OURO-V2.1-SUMMARY.md) | v4.0.4 summary | ⚠️ Deprecated | AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md |
| [AIOX-LIVRO-DE-OURO-V2.2-SUMMARY.md](./AIOX-LIVRO-DE-OURO-V2.2-SUMMARY.md) | Future v2.2 planning | 📋 Draft | N/A |
| [AIOX-FRAMEWORK-MASTER.md](./AIOX-FRAMEWORK-MASTER.md) | v2.0.0 framework doc | ⚠️ Deprecated | AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md |
| [V3-ARCHITECTURAL-DECISIONS.md](./V3-ARCHITECTURAL-DECISIONS.md) | Old architectural decisions | 📦 Archive Candidate | Current architecture docs |

---

## 🔄 What Changed in v4.2

### New Documents Created

| Document | Purpose |
|----------|---------|
| AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md | Consolidated v4.2 documentation |
| QUALITY-GATES-SPECIFICATION.md | 3-layer quality gates |
| STORY-TEMPLATE-V2-SPECIFICATION.md | Story template v2.0 |
| STANDARDS-INDEX.md | This navigation document |

### Key Terminology Changes

| Old Term | New Term | Affected Documents |
|----------|----------|-------------------|
| Squad | **Squad** | All standards |
| Squads/ | **squads/** | Directory references |
| pack.yaml | **squad.yaml** | Manifest references |
| @expansion/* | **@aiox/squad-*** | npm scope |
| 16 Agents | **11 Agents** | Agent counts |

### Concepts Added

| Concept | Description | Documented In |
|---------|-------------|---------------|
| Modular Architecture | 4 modules (core, development, product, infrastructure) | AIOX-LIVRO-DE-OURO-V2.1-COMPLETE |
| Multi-Repo Strategy | 3 public + 2 private repos | AIOX-LIVRO-DE-OURO-V2.1-COMPLETE |
| Quality Gates 3 Layers | Pre-commit, PR Automation, Human Review | QUALITY-GATES-SPECIFICATION |
| Story Template v2.0 | Cross-Story Decisions, CodeRabbit Integration | STORY-TEMPLATE-V2-SPECIFICATION |
| npm Scoping | @aiox/core, @aiox/squad-* | AIOX-LIVRO-DE-OURO-V2.1-COMPLETE |

---

## 📂 Document Organization

### Standards Directory Structure

```
.aiox-core/docs/standards/
├── STANDARDS-INDEX.md                     # This file - navigation
│
├── Current v4.2 Standards
│   ├── AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md  # Complete v4.2 guide
│   ├── QUALITY-GATES-SPECIFICATION.md       # Quality gates
│   ├── STORY-TEMPLATE-V2-SPECIFICATION.md   # Story template
│   ├── TASK-FORMAT-SPECIFICATION-V1.md      # Task format
│   ├── EXECUTOR-DECISION-TREE.md            # Executor routing
│   ├── AGENT-PERSONALIZATION-STANDARD-V1.md # Agent personalities
│   ├── AIOX-COLOR-PALETTE-V2.1.md           # Color system
│   └── AIOX-COLOR-PALETTE-QUICK-REFERENCE.md
│
├── Legacy (Reference Only)
│   ├── AIOX-LIVRO-DE-OURO.md              # v2.0.0 base (deprecated)
│   ├── AIOX-LIVRO-DE-OURO-V2.1.md         # v4.0.4 delta (deprecated)
│   ├── AIOX-LIVRO-DE-OURO-V2.1-SUMMARY.md # v4.0.4 summary (deprecated)
│   ├── AIOX-FRAMEWORK-MASTER.md           # v2.0.0 (deprecated)
│   └── V3-ARCHITECTURAL-DECISIONS.md      # Archive candidate
│
├── Needs Update
│   └── OPEN-SOURCE-VS-SERVICE-DIFFERENCES.md # Update with multi-repo
│
└── Future Planning
    └── AIOX-LIVRO-DE-OURO-V2.2-SUMMARY.md    # v2.2 draft
```

---

## 🔗 Related Documentation

### Architecture Documentation

Located in `docs/architecture/`:

| Document | Description |
|----------|-------------|
| [ARCHITECTURE-INDEX.md](../../docs/architecture/ARCHITECTURE-INDEX.md) | Architecture doc navigation |
| [high-level-architecture.md](../../docs/architecture/high-level-architecture.md) | High-level overview |
| [module-system.md](../../docs/architecture/module-system.md) | 4-module architecture |
| [multi-repo-strategy.md](../../docs/architecture/multi-repo-strategy.md) | Multi-repo guide |

### Project Documentation

Located in `docs/`:

| Directory | Contents |
|-----------|----------|
| `docs/stories/` | Development stories (Sprint 1-6) |
| `docs/epics/` | Epic planning documents |
| `docs/decisions/` | Decision records (ADR, PMDR, DBDR) |

---

## 📝 Document Status Legend

| Status | Meaning | Action |
|--------|---------|--------|
| ✅ Current | Up-to-date with v4.2 | Use as reference |
| ⚠️ Deprecated | Superseded by newer document | Refer to replacement |
| ⚠️ Needs Update | Content outdated | Update planned |
| 📦 Archive Candidate | Should be archived | Move to _archived/ |
| 📋 Draft | Work in progress | Not official yet |

---

## 🚀 Maintaining Standards

### When to Update Standards

1. **New features** that change framework behavior
2. **Terminology changes** (like Squad → Squad)
3. **Architecture changes** (like modular architecture)
4. **Process changes** (like Quality Gates)

### Update Process

1. Create story for documentation update
2. Update relevant documents
3. Update STANDARDS-INDEX.md
4. Update Change Log in each document
5. Run validation (link check, terminology check)

### Validation Commands

```bash
# Check for broken links
find .aiox-core/docs/standards -name "*.md" -exec markdown-link-check {} \;

# Search for deprecated terminology
grep -r "squad" .aiox-core/docs/standards --include="*.md"
grep -r "Squad" .aiox-core/docs/standards --include="*.md"

# Verify version numbers
grep -r "v2.0" .aiox-core/docs/standards --include="*.md"
```

---

## 📜 Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-12-09 | 2.1.0 | Initial STANDARDS-INDEX creation for v4.2 | @dev (Dex) |

---

**Last Updated:** 2025-12-09
**Version:** 2.1.0
**Maintainer:** @po (Pax)
