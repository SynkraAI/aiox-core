# AIOS Documentation Roadmap

**Created:** 2026-01-26
**Status:** Active
**Owner:** @devops (Gage)

---

## Executive Summary

This roadmap addresses **33 missing documents** identified during documentation link audit.
After analysis, they are categorized into:

| Category | Count | Action |
|----------|-------|--------|
| **Create** | 10 | New documents needed |
| **Consolidate** | 8 | Merge into existing docs |
| **Discard** | 15 | Obsolete/redundant |

---

## Phase 1: High Priority (Immediate)

### 1.1 Security & Configuration

| Document | Location | Complexity | Description |
|----------|----------|------------|-------------|
| `mcp-api-keys-management.md` | `docs/en/architecture/` | Medium | MCP API key security and management |

**Content outline:**
- [ ] API key storage best practices
- [ ] Environment variable configuration
- [ ] Docker MCP Toolkit secrets
- [ ] Security considerations
- [ ] Rotation procedures

### 1.2 User Onboarding

| Document | Location | Complexity | Description |
|----------|----------|------------|-------------|
| `v2.1-quick-start.md` | `docs/en/installation/` | Simple | Quick start guide for new users |

**Content outline:**
- [ ] 5-minute setup
- [ ] Prerequisites checklist
- [ ] First agent activation
- [ ] Verification steps
- [ ] Next steps links

---

## Phase 2: Medium Priority (Next Sprint)

### 2.1 Developer Guides

| Document | Location | Complexity | Description |
|----------|----------|------------|-------------|
| `agent-tool-integration-guide.md` | `docs/en/architecture/` | Complex | How to integrate tools with agents |
| `dependency-resolution-plan.md` | `docs/en/architecture/` | Medium | Module dependency strategy |

### 2.2 Planning Documents

| Document | Location | Complexity | Description |
|----------|----------|------------|-------------|
| `stories/1.8-phase-3-workflow-orchestration.md` | `docs/en/stories/` | Medium | Orchestration module story |
| `stories/1.9-missing-pv-agents.md` | `docs/en/stories/` | Simple | Agent completeness tracking |

### 2.3 Reference Documentation

| Document | Location | Complexity | Description |
|----------|----------|------------|-------------|
| `coderabbit/README.md` | `docs/en/guides/coderabbit/` | Simple | CodeRabbit configuration guide |

---

## Phase 3: Low Priority (Backlog)

### 3.1 Architecture

| Document | Location | Complexity | Description |
|----------|----------|------------|-------------|
| `multi-repo-strategy.md` | `docs/en/architecture/` | Complex | Multi-repository organization |
| `mvp-components.md` | `docs/en/architecture/` | Simple | Minimum viable components |
| `schema-comparison-sqlite-supabase.md` | `docs/en/architecture/` | Medium | Database schema comparison |

---

## Consolidation Plan

These documents should be **merged into existing documentation**:

| Missing Document | Merge Into | Action |
|------------------|------------|--------|
| `installation/migration-v2.0-to-v2.1.md` | `migration-guide.md` | Add v2.0→v2.1 section |
| `migration-v2.0-to-v2.1.md` | `migration-guide.md` | Same as above |
| `coderabbit-integration-decisions.md` | `architecture/adr/` | Create new ADR |
| `technical-review-greeting-system-unification.md` | `guides/contextual-greeting-system-guide.md` | Add technical section |
| `hybrid-ops-pv-mind-integration.md` | `architecture/high-level-architecture.md` | Add integration section |
| `repository-migration-plan.md` | `migration-guide.md` | Add repo migration section |
| `internal-tools-analysis.md` | `.aios-core/infrastructure/tools/README.md` | Reference existing |
| `.aios-core/core/registry/README.md` | **ALREADY EXISTS** | No action needed |

---

## Discard List

These documents are **obsolete or redundant** and should NOT be created:

| Document | Reason |
|----------|--------|
| `architect-Squad-rearchitecture.md` | Covered in `squad-improvement-recommended-approach.md` |
| `analysis/Squads-dependency-analysis.md` | Point-in-time analysis; squad system mature |
| `analysis/Squads-structure-inventory.md` | Dynamic; better maintained via scripts |
| `analysis/subdirectory-migration-impact-analysis.md` | Migration completed |
| `analysis/tools-system-analysis-log.md` | Ephemeral logs; tools system stable |
| `analysis/tools-system-gap-analysis.md` | Gap analysis completed |
| `tools-system-brownfield.md` | Incorporated in `analyze-brownfield.md` task |
| `tools-system-handoff.md` | Process doc, not permanent |
| `tools-system-schema-refinement.md` | Refinement completed |
| `analysis/scripts-consolidation-analysis.md` | Scripts already consolidated |
| `analysis/repository-strategy-analysis.md` | Strategy defined in ARCHITECTURE-INDEX |
| `SYNKRA-REBRANDING-SPECIFICATION.md` | Rebranding completed |
| `multi-repo-strategy-pt.md` | Use `docs/pt-BR/` structure instead |

---

## Implementation Timeline

```
Week 1 (Phase 1)
├── Day 1-2: mcp-api-keys-management.md
└── Day 3-4: v2.1-quick-start.md

Week 2-3 (Phase 2)
├── Day 1-3: agent-tool-integration-guide.md
├── Day 4-5: dependency-resolution-plan.md
├── Day 6: stories/1.8 & 1.9
└── Day 7: coderabbit/README.md

Week 4 (Phase 3 + Consolidation)
├── Day 1-2: Consolidation tasks
├── Day 3-4: multi-repo-strategy.md (if needed)
└── Day 5: mvp-components.md
```

---

## Translation Requirements

All new documents must be created in **3 languages**:
- `docs/en/` - English (primary)
- `docs/pt-BR/` - Portuguese (Brazil)
- `docs/es/` - Spanish

**Translation workflow:**
1. Create English version first
2. Use @dev or translation agent for PT-BR and ES
3. Review translations for technical accuracy

---

## Success Criteria

- [ ] All Phase 1 documents created and reviewed
- [ ] All Phase 2 documents created and reviewed
- [ ] Consolidation tasks completed
- [ ] Zero broken links in documentation
- [ ] All documents available in 3 languages

---

## Progress Tracking

### Phase 1
- [ ] `mcp-api-keys-management.md` (EN/PT-BR/ES)
- [ ] `v2.1-quick-start.md` (EN/PT-BR/ES)

### Phase 2
- [ ] `agent-tool-integration-guide.md` (EN/PT-BR/ES)
- [ ] `dependency-resolution-plan.md` (EN/PT-BR/ES)
- [ ] `stories/1.8-phase-3-workflow-orchestration.md` (EN only)
- [ ] `stories/1.9-missing-pv-agents.md` (EN only)
- [ ] `coderabbit/README.md` (EN/PT-BR/ES)

### Phase 3
- [ ] `multi-repo-strategy.md` (EN/PT-BR/ES)
- [ ] `mvp-components.md` (EN/PT-BR/ES)
- [ ] `schema-comparison-sqlite-supabase.md` (EN only)

### Consolidation
- [ ] Migration guide v2.0→v2.1 section added
- [ ] ADR for CodeRabbit decisions created
- [ ] Greeting system guide technical section added

---

**Last Updated:** 2026-01-26
**Next Review:** After Phase 1 completion
