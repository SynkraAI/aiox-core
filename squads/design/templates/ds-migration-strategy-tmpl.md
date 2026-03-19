# Migration Strategy: {{PROJECT_NAME}}

**Generated:** {{GENERATION_DATE}}
**Project:** {{PROJECT_NAME}}
**Current Patterns:** {{TOTAL_PATTERNS_BEFORE}}
**Target Patterns:** {{TOTAL_PATTERNS_AFTER}}
**Reduction:** {{REDUCTION_PERCENTAGE}}%

---

## Executive Summary

This migration strategy consolidates **{{TOTAL_PATTERNS_BEFORE}} UI patterns** into **{{TOTAL_PATTERNS_AFTER}} standardized components**, achieving a **{{REDUCTION_PERCENTAGE}}% reduction** in maintenance burden.

**Key Outcomes:**
- 💰 **{{ANNUAL_SAVINGS}}/year** in maintenance savings
- ⚡ **{{VELOCITY_IMPROVEMENT}}x** faster feature development
- 🎯 **{{CONSOLIDATION_IMPACT}}** reduction in code surface area
- 📅 **{{TOTAL_TIMELINE}}** phased rollout timeline

**Risk Level:** Low - Phased approach minimizes disruption

---

## Migration Philosophy

1. **No Big-Bang Rewrites** - Gradual, phase-by-phase rollout
2. **Foundation First** - Token system deploys before visual changes
3. **High-Impact Priority** - Replace most-used patterns first for immediate ROI
4. **Rollback Ready** - Each phase independently reversible
5. **Measured Progress** - Metrics tracked at every stage

---

## Phase 1: Foundation

### Goal
Deploy token system with **zero visual changes**. Establish foundation for all future work.

### Prerequisites
- [x] Design tokens extracted and validated
- [ ] Token files added to repository
- [ ] Build pipeline configured for token processing
- [ ] Development team trained on token usage

### Tasks

#### 1.1 Token System Deployment
- [ ] Add `tokens.yaml` to `{{TOKEN_DIRECTORY}}`
- [ ] Generate multi-format exports (JSON, CSS, Tailwind, SCSS)
- [ ] Configure build pipeline to process tokens
- [ ] Validate token imports work in development environment

#### 1.2 Existing CSS Token Migration (Automated)
- [ ] Run automated CSS variable replacement script
- [ ] Replace hardcoded colors with `var(--color-*)` references
- [ ] Replace hardcoded spacing with `var(--space-*)` references
- [ ] Replace hardcoded typography with `var(--font-*)` references

#### 1.3 Validation & Testing
- [ ] Visual regression tests pass (no UI changes)
- [ ] Build succeeds with token system integrated
- [ ] Development environment loads correctly
- [ ] Production build size unchanged or reduced

### Timeline
**Duration:** {{PHASE_1_DURATION}}
**Effort:** {{PHASE_1_EFFORT}} developer-hours

### Risk Assessment
**Risk Level:** 🟢 Low

**Risks:**
- Build pipeline integration issues
- Token naming conflicts with existing variables

**Mitigation:**
- Namespace tokens with `ds-` prefix if conflicts occur
- Incremental rollout (development → staging → production)
- Rollback procedure: Revert commit, restore previous CSS

### Success Criteria
- ✅ Tokens deployed to all environments
- ✅ Zero visual regressions detected
- ✅ Build pipeline stable
- ✅ No user-facing changes

### Rollback Procedure
```bash
# If issues detected, rollback immediately
git revert {{PHASE_1_COMMIT_HASH}}
npm run build
npm run deploy
```

---

## Phase 2: High-Impact Patterns

### Goal
Replace **top {{TOP_N_PATTERNS}} most-used components** for immediate ROI and velocity improvement.

### Prerequisites
- [x] Phase 1 complete and stable
- [ ] Design system components generated and tested
- [ ] Component library integrated into project
- [ ] Migration mapping documented (old → new)

### High-Impact Targets

#### Pattern Priority List
{{#EACH_HIGH_IMPACT_PATTERN}}
**{{PATTERN_RANK}}. {{PATTERN_NAME}}**
- Current variations: {{CURRENT_VARIATIONS}}
- Usage instances: {{USAGE_COUNT}}
- Consolidates to: {{NEW_VARIANTS}} variants
- Estimated effort: {{EFFORT_HOURS}} hours
- Impact: {{IMPACT_SCORE}} (high/medium/low)
{{/EACH_HIGH_IMPACT_PATTERN}}

### Tasks

#### 2.1 Component Replacement - {{TOP_PATTERN_1}}
- [ ] Generate design system {{TOP_PATTERN_1}} component
- [ ] Create unit tests (>80% coverage)
- [ ] Document usage in pattern library
- [ ] Identify all {{TOP_PATTERN_1_USAGE_COUNT}} usage locations
- [ ] Replace incrementally (10-20 instances per PR)
- [ ] Visual regression test each PR
- [ ] Monitor production for issues

#### 2.2 Component Replacement - {{TOP_PATTERN_2}}
- [ ] Generate design system {{TOP_PATTERN_2}} component
- [ ] Create unit tests (>80% coverage)
- [ ] Document usage in pattern library
- [ ] Identify all {{TOP_PATTERN_2_USAGE_COUNT}} usage locations
- [ ] Replace incrementally (10-20 instances per PR)
- [ ] Visual regression test each PR
- [ ] Monitor production for issues

#### 2.3 Component Replacement - {{TOP_PATTERN_3}}
- [ ] Generate design system {{TOP_PATTERN_3}} component
- [ ] Create unit tests (>80% coverage)
- [ ] Document usage in pattern library
- [ ] Identify all {{TOP_PATTERN_3_USAGE_COUNT}} usage locations
- [ ] Replace incrementally (10-20 instances per PR)
- [ ] Visual regression test each PR
- [ ] Monitor production for issues

#### 2.4 Deprecation Warnings
- [ ] Add deprecation warnings to old components
- [ ] Update documentation with migration guides
- [ ] Alert developers when old patterns used

### Timeline
**Duration:** {{PHASE_2_DURATION}}
**Effort:** {{PHASE_2_EFFORT}} developer-hours

### Risk Assessment
**Risk Level:** 🟡 Medium

**Risks:**
- Behavioral differences between old and new components
- Visual regressions in production
- Developer resistance to change

**Mitigation:**
- Extensive testing before production deployment
- Incremental rollout (feature flags if needed)
- Pair programming for first replacements
- Rollback plan per component

### Success Criteria
- ✅ Top {{TOP_N_PATTERNS}} patterns fully migrated
- ✅ Zero critical bugs in production
- ✅ Measurable velocity improvement detected
- ✅ Team reports positive experience

### Metrics to Track
- Feature build time (should decrease {{VELOCITY_IMPROVEMENT}}x)
- Bug count for replaced components (should stay flat or decrease)
- Developer satisfaction score
- Visual consistency score

---

## Phase 3: Long-Tail Cleanup

### Goal
Consolidate remaining **{{LONG_TAIL_COUNT}} patterns** to reach **{{FINAL_REDUCTION_PERCENTAGE}}% total reduction**.

### Prerequisites
- [x] Phase 2 complete and stable
- [x] High-impact patterns validated in production
- [ ] Team confident with design system patterns
- [ ] Migration tooling refined from Phase 2 learnings

### Long-Tail Targets

{{#EACH_LONG_TAIL_PATTERN}}
**{{PATTERN_NAME}}**
- Current variations: {{CURRENT_VARIATIONS}} → {{NEW_VARIANTS}}
- Usage instances: {{USAGE_COUNT}}
- Effort: {{EFFORT_HOURS}} hours
{{/EACH_LONG_TAIL_PATTERN}}

### Tasks

#### 3.1 Form Pattern Consolidation
- [ ] Migrate {{FORM_VARIATIONS}} form variations → {{FORM_CONSOLIDATED}} patterns
- [ ] Update form validation logic
- [ ] Test accessibility compliance (WCAG AA)

#### 3.2 Modal/Dialog Consolidation
- [ ] Migrate {{MODAL_VARIATIONS}} modal variations → {{MODAL_CONSOLIDATED}} patterns
- [ ] Standardize close behaviors
- [ ] Test focus management

#### 3.3 Navigation Consolidation
- [ ] Migrate {{NAV_VARIATIONS}} navigation variations → {{NAV_CONSOLIDATED}} patterns
- [ ] Standardize active state handling
- [ ] Test responsive behavior

#### 3.4 Remaining Patterns
- [ ] Migrate all remaining low-usage patterns
- [ ] Update documentation for all new components
- [ ] Final visual regression suite run

### Timeline
**Duration:** {{PHASE_3_DURATION}}
**Effort:** {{PHASE_3_EFFORT}} developer-hours

### Risk Assessment
**Risk Level:** 🟢 Low

**Risks:**
- Edge case behaviors missed in testing
- Low-priority patterns deprioritized indefinitely

**Mitigation:**
- Thorough testing of edge cases
- Set hard deadline for completion
- Assign dedicated owner for long-tail cleanup

### Success Criteria
- ✅ **{{FINAL_REDUCTION_PERCENTAGE}}%** pattern reduction achieved
- ✅ All patterns documented in pattern library
- ✅ Zero legacy patterns in active development
- ✅ Team using design system by default

---

## Phase 4: Enforcement

### Goal
**Prevent regression** - Lock in gains and ensure design system adoption is sustained.

### Prerequisites
- [x] Phase 3 complete and stable
- [x] >85% pattern adoption achieved
- [ ] CI/CD pipeline configured for validation
- [ ] Team bought into enforcement mechanisms

### Tasks

#### 4.1 CI/CD Pattern Validation
- [ ] Integrate design system linter into CI pipeline
- [ ] Block PRs that introduce non-system patterns
- [ ] Add automated pattern usage reports
- [ ] Configure pattern detection thresholds

#### 4.2 Legacy Component Deprecation
- [ ] Mark all old components as deprecated
- [ ] Remove old components from imports
- [ ] Add redirect logic: old imports → new components
- [ ] Schedule removal date for legacy code

#### 4.3 Documentation & Training
- [ ] Create onboarding guide for new developers
- [ ] Record video tutorials for common patterns
- [ ] Establish design system office hours
- [ ] Create troubleshooting guide

#### 4.4 Monitoring & Metrics
- [ ] Dashboard for adoption metrics
- [ ] Automated weekly reports (usage, violations, velocity)
- [ ] Track cost savings vs. projections
- [ ] Measure developer satisfaction quarterly

### Timeline
**Duration:** {{PHASE_4_DURATION}}
**Effort:** {{PHASE_4_EFFORT}} developer-hours

### Risk Assessment
**Risk Level:** 🟢 Low

**Risks:**
- Developer frustration with enforcement
- False positives blocking legitimate work
- Metrics dashboard not maintained

**Mitigation:**
- Allow override mechanism for edge cases
- Fine-tune linter rules based on feedback
- Assign ownership of metrics dashboard

### Success Criteria
- ✅ CI/CD enforcement active and stable
- ✅ Zero non-system patterns merged to main
- ✅ 100% of new components use design system
- ✅ Team reports confidence in system

---

## Overall Timeline

```
Phase 1: Foundation          [{{PHASE_1_DURATION}}]  🟢 Low Risk
Phase 2: High-Impact         [{{PHASE_2_DURATION}}]  🟡 Medium Risk
Phase 3: Long-Tail           [{{PHASE_3_DURATION}}]  🟢 Low Risk
Phase 4: Enforcement         [{{PHASE_4_DURATION}}]  🟢 Low Risk
─────────────────────────────────────────────────────
Total Duration: {{TOTAL_TIMELINE}}
```

---

## Component Mapping (Old → New)

{{#EACH_COMPONENT_MAPPING}}
### {{OLD_COMPONENT_NAME}} → {{NEW_COMPONENT_NAME}}

**Old Usage:**
```{{CODE_LANGUAGE}}
{{OLD_USAGE_EXAMPLE}}
```

**New Usage:**
```{{CODE_LANGUAGE}}
{{NEW_USAGE_EXAMPLE}}
```

**Migration Notes:**
{{MIGRATION_NOTES}}

---
{{/EACH_COMPONENT_MAPPING}}

---

## Rollback Procedures

### Phase-Specific Rollback

**Phase 1 Rollback:**
```bash
git revert {{PHASE_1_COMMIT_HASH}}
npm run build && npm run deploy
```

**Phase 2 Rollback (per component):**
```bash
# Revert specific component migration
git revert {{COMPONENT_MIGRATION_COMMIT}}
npm run test && npm run deploy
```

**Phase 3 Rollback:**
```bash
# Revert long-tail cleanup
git revert {{PHASE_3_START_COMMIT}}..{{PHASE_3_END_COMMIT}}
npm run build && npm run deploy
```

**Phase 4 Rollback:**
```bash
# Disable enforcement
git revert {{ENFORCEMENT_COMMIT}}
# CI/CD validation disabled, patterns still functional
```

### Emergency Rollback (Full System)
```bash
# Nuclear option - revert entire design system
git revert {{PHASE_1_COMMIT}}..{{CURRENT_COMMIT}}
npm run build
npm run test
npm run deploy
```

---

## Progress Tracking

Track migration progress in `.state.yaml`:

```yaml
migration:
  strategy_created_at: "{{GENERATION_DATE}}"
  current_phase: 1
  total_phases: 4

  phase_1:
    status: pending  # pending | in_progress | complete
    started_at: null
    completed_at: null

  phase_2:
    status: pending
    patterns_migrated: 0
    patterns_total: {{TOP_N_PATTERNS}}

  phase_3:
    status: pending
    patterns_migrated: 0
    patterns_total: {{LONG_TAIL_COUNT}}

  phase_4:
    status: pending
    enforcement_enabled: false

  overall:
    completion_percentage: 0
    estimated_completion: "{{ESTIMATED_COMPLETION_DATE}}"
```

---

## Communication Plan

### Stakeholder Updates

**Weekly Updates (During Active Migration):**
- Phase progress and blockers
- Metrics: patterns migrated, velocity changes
- Upcoming tasks and dependencies

**Monthly Retrospectives:**
- What worked well
- What to improve
- Adjust timeline if needed

### Team Communication

**Kickoff Meeting (Before Phase 1):**
- Present migration strategy
- Demo token system
- Answer questions
- Assign phase ownership

**Phase Completion Celebrations:**
- Recognize team effort
- Share metrics and wins
- Preview next phase

---

## Success Metrics

Track these metrics throughout migration:

| Metric | Baseline | Target | Current |
|--------|----------|--------|---------|
| Unique Patterns | {{TOTAL_PATTERNS_BEFORE}} | {{TOTAL_PATTERNS_AFTER}} | _TBD_ |
| Pattern Reduction | 0% | {{REDUCTION_PERCENTAGE}}% | _TBD_ |
| Feature Build Time | {{BASELINE_BUILD_TIME}} | {{TARGET_BUILD_TIME}} | _TBD_ |
| Monthly Maintenance Cost | ${{MONTHLY_COST_BEFORE}} | ${{MONTHLY_COST_AFTER}} | _TBD_ |
| Design System Adoption | 0% | >85% | _TBD_ |
| Developer Satisfaction | {{BASELINE_SATISFACTION}} | >8/10 | _TBD_ |

---

## Appendix

### A. Team Roles & Responsibilities

**Migration Lead:** {{MIGRATION_LEAD}}
- Overall strategy execution
- Phase coordination
- Stakeholder communication

**Component Owners:**
{{#EACH_COMPONENT_OWNER}}
- {{COMPONENT_NAME}}: {{OWNER_NAME}}
{{/EACH_COMPONENT_OWNER}}

**Quality Assurance:** {{QA_LEAD}}
- Visual regression testing
- Accessibility compliance
- Production monitoring

### B. Tools & Resources

**Migration Tools:**
- Token system: `{{TOKEN_DIRECTORY}}/tokens.yaml`
- Component library: `{{COMPONENT_DIRECTORY}}/`
- Migration scripts: `{{SCRIPTS_DIRECTORY}}/migrate-*.js`
- Visual regression: Percy, Chromatic, or similar

**Documentation:**
- Pattern library: {{PATTERN_LIBRARY_URL}}
- Migration guides: {{DOCS_URL}}/migration
- Troubleshooting: {{DOCS_URL}}/troubleshooting

### C. Contact & Support

**Questions about migration?**
- Slack: #design-system-migration
- Email: {{SUPPORT_EMAIL}}
- Office hours: {{OFFICE_HOURS}}

**Activate Brad for migration assistance:**
```bash
*agent design-system
*migrate  # Regenerate strategy with latest data
```

---

**Document Version:** 1.0
**Last Updated:** {{GENERATION_DATE}}
**Generated by:** Brad (Design System Architect)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
