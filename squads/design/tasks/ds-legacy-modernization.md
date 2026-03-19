# Legacy System Modernization Playbook

> Task ID: ds-legacy-modernization
> Agent: Brad Frost + Design Chief
> Version: 1.0.0
> Heuristic: #15 - Legado é oportunidade massiva

## Description

Playbook para modernizar sistemas legados (CodeIgniter, Laravel, Rails, jQuery) para stacks modernas com design system.

**Princípio:** Migrar sistemas legados = produto de múltiplos 6 dígitos.

---

## Value Proposition

| Legacy Stack | Migration Target | Market Value |
|--------------|------------------|--------------|
| CodeIgniter + Bootstrap 3 | Next.js + Tailwind + Shadcn | $50K-150K |
| Laravel Blade + jQuery | React + Design System | $80K-200K |
| Rails ERB + Sprockets | Next.js + Modern CSS | $100K-300K |
| WordPress + Custom Theme | Headless + Component Library | $30K-100K |

---

## Assessment Phase

### 1. Inventory

```yaml
assessment:
  codebase:
    total_files: number
    ui_files: number
    css_files: number
    js_files: number

  patterns:
    inline_styles: count
    hardcoded_colors: count
    duplicated_components: count
    accessibility_issues: count

  dependencies:
    framework: string
    css_framework: string
    js_libraries: array
    build_tool: string
```

### 2. Complexity Score

```
Score = (UI files × 0.3) + (Inline styles × 0.2) + (Duplications × 0.3) + (A11y issues × 0.2)

Low:    0-100   → 2-4 weeks
Medium: 100-500 → 1-3 months
High:   500+    → 3-6 months
```

### 3. Risk Matrix

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing flows | HIGH | Feature flags + gradual rollout |
| Data loss | CRITICAL | Backup + rollback plan |
| Performance regression | MEDIUM | Benchmark before/after |
| Team unfamiliarity | MEDIUM | Training + documentation |

---

## Migration Strategies

### Strategy A: Big Bang (Greenfield Rebuild)

```
✅ When to use:
- Codebase is small (<50 UI files)
- Team has capacity for full rebuild
- Business can tolerate downtime

❌ When to avoid:
- Large codebase
- Critical system with SLAs
- Limited team bandwidth
```

### Strategy B: Strangler Fig (Gradual)

```
✅ When to use:
- Large codebase
- Can't afford downtime
- Need to maintain features during migration

Approach:
1. New features in new stack
2. Wrap legacy in adapter
3. Migrate page by page
4. Sunset legacy when empty
```

### Strategy C: Component Islands

```
✅ When to use:
- Mixed team (legacy + modern skills)
- Partial modernization acceptable
- Budget constraints

Approach:
1. Identify high-value components
2. Rebuild only those in modern stack
3. Embed via Web Components or iframes
4. Leave low-value areas in legacy
```

---

## Execution Phases

### Phase 1: Foundation (Week 1-2)

```yaml
deliverables:
  - Assessment report
  - Migration strategy selection
  - Token extraction from legacy CSS
  - Design system setup

tasks:
  - ds-audit-codebase
  - ds-extract-tokens
  - ds-setup-design-system
```

### Phase 2: Primitives (Week 3-4)

```yaml
deliverables:
  - Button, Input, Card in new system
  - Typography system
  - Color system
  - Spacing system

tasks:
  - ds-build-component (×N)
  - ds-sync-registry
```

### Phase 3: Patterns (Week 5-8)

```yaml
deliverables:
  - Form patterns
  - Layout patterns
  - Navigation patterns
  - Feedback patterns

tasks:
  - ds-compose-molecule (×N)
  - ds-consolidate-patterns
```

### Phase 4: Pages (Week 9-12)

```yaml
deliverables:
  - High-traffic pages migrated
  - Feature parity verified
  - A11y audit passed

tasks:
  - Page migration (per page)
  - a11y-audit
  - ds-govern-a11y-compliance
```

### Phase 5: Cleanup (Week 13+)

```yaml
deliverables:
  - Legacy code removed
  - Documentation updated
  - Team trained

tasks:
  - Legacy sunset
  - Documentation
  - Training sessions
```

---

## VPAT Generation (Bonus Value)

VPAT (Voluntary Product Accessibility Template) = documento que prova compliance de acessibilidade.

**Market Value:** $50K-200K por documento

### VPAT Automation Workflow

1. Run `ds-govern-a11y-compliance` on all components
2. Map results to WCAG criteria
3. Generate VPAT document
4. Human review for edge cases

```yaml
vpat_output:
  criteria_covered: 86
  criteria_passed: 82
  criteria_partial: 4
  criteria_failed: 0
  overall_conformance: "AA"
```

---

## Pricing Model

```yaml
pricing_tiers:
  assessment_only:
    deliverables: ["Assessment report", "Migration recommendation"]
    price_range: "$5K-15K"
    timeline: "1-2 weeks"

  foundation_package:
    deliverables: ["Assessment", "Design system setup", "Token extraction", "5 core components"]
    price_range: "$25K-50K"
    timeline: "4-6 weeks"

  full_migration:
    deliverables: ["Everything above", "Full page migration", "A11y compliance", "Documentation"]
    price_range: "$80K-300K"
    timeline: "3-6 months"

  vpat_addon:
    deliverables: ["VPAT document", "Remediation report"]
    price_range: "$15K-50K"
    timeline: "2-4 weeks"
```

---

## Veto Conditions

- [ ] No budget approved
- [ ] No executive sponsor
- [ ] Legacy system has no documentation AND no original developers
- [ ] Migration timeline is unrealistic (<50% of estimated)

---

## Quality Gates

- [ ] Assessment score calculated
- [ ] Strategy selected with justification
- [ ] Phase deliverables defined

## Output

- `outputs/design-system/{project}/legacy/assessment-report.md`
- `outputs/design-system/{project}/legacy/migration-strategy.md`
- `outputs/design-system/{project}/legacy/migration-roadmap.md`
- `outputs/design-system/{project}/legacy/risk-matrix.md`

## Related Checklists

- `squads/design/checklists/ds-migration-readiness-checklist.md`
- `squads/design/checklists/ds-accessibility-wcag-checklist.md`
- [ ] Rollback plan documented
- [ ] Success metrics defined

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Page load time | -50% |
| Bundle size | -40% |
| A11y score | 95+ |
| Component reuse | 80%+ |
| Developer velocity | +100% |

---

*Task criada: 2026-02-16*
*Squad: Design*


## Process Guards
- **Execution Type:** `Hybrid`
- **Dependencies:** depends_on: `[]` · enables: `[]` · workflow: `design-system`
- **On Fail:** Stop execution, capture evidence, and return remediation steps before proceeding.

## Success Criteria
- [ ] Output artifact(s) generated and referenced.
- [ ] Validation checks executed with evidence.
- [ ] Next-step dependencies documented.
