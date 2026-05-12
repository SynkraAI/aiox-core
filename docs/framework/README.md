# AIOX Framework Documentation

> 🌐 **EN** | [PT](../pt/framework/README.md) | [ES](../es/framework/README.md)

**Status:** Official Framework Standards
**Created:** 2025-01-16 (Story 6.1.2.6)
**Migration Target:** Q2 2026 → `SynkraAI/aiox-core` repository

---

## 📋 Overview

This directory contains **official AIOX framework documentation** that defines standards, patterns, and structures applicable across all AIOX projects (greenfield and brownfield).

**Purpose**: Separate framework-level documentation from project-specific implementation details.

---

## 📚 Documentation Inventory

| Document | Purpose | Audience |
|----------|---------|----------|
| [**coding-standards.md**](coding-standards.md) | JavaScript/TypeScript standards, naming conventions, code quality rules | All developers |
| [**tech-stack.md**](tech-stack.md) | Technology choices, frameworks, libraries, and tooling standards | Architects, developers |
| [**source-tree.md**](source-tree.md) | Directory structure, file organization, and project layout patterns | All team members |

---

## 🔄 Migration Notice

**⚠️ IMPORTANT**: These documents are now in the `SynkraAI/aiox-core` repository. The migration from the old `aiox/aiox-core` org was completed in December 2024 as part of OSR-9 (Rebranding).

### Migration Timeline

- **Phase 1 (Q1 2026 - Story 6.1.2.6):** ✅ Framework docs separated into `docs/framework/`
- **Phase 2 (Q4 2024):** ✅ Repository migrated to `SynkraAI/aiox-core` (OSR-9)
- **Phase 3 (Q3 2026):** Old `docs/architecture/` copies removed from brownfield project

### Backward Compatibility

For backward compatibility, framework docs remain accessible at **both** locations until Q3 2026:
- **New location** (preferred): `docs/framework/{doc-name}.md`
- **Old location** (deprecated): `docs/architecture/{doc-name}.md`

**References**: Update internal links to use `docs/framework/` to prepare for migration.

---

## 🏗️ Framework vs. Project Documentation

### Framework Documentation (`docs/framework/`)
- **Scope**: Portable across all AIOX projects
- **Examples**: Coding standards, tech stack, source tree structure
- **Lifecycle**: Lives in `SynkraAI/aiox-core` repository
- **Changes**: Require framework-level approval

### Project Documentation (`docs/architecture/project-decisions/`)
- **Scope**: Specific to brownfield implementation
- **Examples**: Decision analysis, architectural reviews, integration decisions
- **Lifecycle**: Lives in project repository permanently
- **Changes**: Project team decides

---

## 📖 Usage Guidelines

### For Developers
1. **Read framework docs during onboarding** - Understand AIOX standards
2. **Reference during development** - Ensure compliance with framework patterns
3. **Propose changes via PRs** - Framework standards evolve with community input

### For Architects
1. **Maintain framework docs** - Keep standards current and practical
2. **Review PRs for compliance** - Ensure code follows documented standards
3. **Plan migration** - Prepare for Q2 2026 repository split

### For AIOX Framework Maintainers
1. **Version control** - Track changes to framework standards
2. **Migration readiness** - Ensure docs are ready for repository separation
3. **Cross-project consistency** - Apply standards uniformly

---

## 🔗 Related Documents

- **Architecture Overview**: [`docs/architecture/`](../architecture/)
- **Installation Guide**: [`docs/installation/`](../installation/)
- **Platform Guides**: [`docs/platforms/`](../platforms/)
- **Architecture Decisions**: `docs/decisions/` *(coming soon)*
- **Epic Planning**: `docs/epics/` *(coming soon)*

---

**Last Updated**: 2026-01-28
**Maintainer**: AIOX Framework Team
