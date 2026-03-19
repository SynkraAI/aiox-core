# Design System Health Report

> Generated: {TIMESTAMP}
> Project: {PROJECT_NAME}
> Path: {TARGET_PATH}
> Version: {DS_VERSION}

---

## Overall Health Score: {SCORE}/100 {STATUS_EMOJI}

```
████████████████████░░░░ {SCORE}%
```

| Category | Score | Weight | Contribution |
|----------|-------|--------|--------------|
| Token Coverage | {TOKEN_SCORE}/30 | 30% | {TOKEN_CONTRIB} |
| Component Adoption | {ADOPTION_SCORE}/15 | 15% | {ADOPTION_CONTRIB} |
| Bundle Size | {BUNDLE_SCORE}/15 | 15% | {BUNDLE_CONTRIB} |
| Code Quality | {QUALITY_SCORE}/25 | 25% | {QUALITY_CONTRIB} |
| Consistency | {CONSISTENCY_SCORE}/15 | 15% | {CONSISTENCY_CONTRIB} |

---

## 1. Token Coverage

### Summary
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Token Usage Rate | {TOKEN_USAGE}% | >95% | {TOKEN_STATUS} |
| Hardcoded Colors | {HARDCODED_COLORS} | 0 | {HARDCODED_STATUS} |
| Hardcoded Spacing | {HARDCODED_SPACING} | 0 | {SPACING_STATUS} |
| CSS Variables Used | {CSS_VARS_COUNT} | - | - |

### Token Distribution
```
Colors     ████████████████░░░░ {COLOR_COVERAGE}%
Spacing    ██████████████████░░ {SPACING_COVERAGE}%
Typography ████████████████████ {TYPO_COVERAGE}%
Shadows    ██████████░░░░░░░░░░ {SHADOW_COVERAGE}%
Motion     ████████░░░░░░░░░░░░ {MOTION_COVERAGE}%
```

### Violations
| File | Line | Issue | Severity |
|------|------|-------|----------|
{TOKEN_VIOLATIONS_TABLE}

---

## 2. Component Adoption

### Summary
| Metric | Value | Status |
|--------|-------|--------|
| Total UI Components | {TOTAL_COMPONENTS} | - |
| Components in Use | {USED_COMPONENTS} | {USED_STATUS} |
| Adoption Rate | {ADOPTION_RATE}% | {ADOPTION_STATUS} |
| Unused Components | {UNUSED_COUNT} | {UNUSED_STATUS} |

### Most Used Components
| Rank | Component | Imports | Trend |
|------|-----------|---------|-------|
{TOP_COMPONENTS_TABLE}

### Unused Components
{UNUSED_COMPONENTS_LIST}

---

## 3. Bundle Analysis

### Summary
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Unique CSS Classes | {CSS_CLASSES} | <500 | {CSS_STATUS} |
| Est. CSS Size | {CSS_SIZE}KB | <50KB | {CSS_SIZE_STATUS} |
| Est. JS Size (min) | {JS_SIZE}KB | <100KB | {JS_SIZE_STATUS} |
| Est. Total (gzip) | {GZIP_SIZE}KB | <30KB | {GZIP_STATUS} |

### Largest Components
| Component | Lines | Est. Size | Action |
|-----------|-------|-----------|--------|
{LARGEST_COMPONENTS_TABLE}

### Bundle Breakdown
```
UI Components  ████████████░░░░░░░░ {UI_PERCENT}% ({UI_SIZE}KB)
Hooks          ██████░░░░░░░░░░░░░░ {HOOKS_PERCENT}% ({HOOKS_SIZE}KB)
Utils          ████░░░░░░░░░░░░░░░░ {UTILS_PERCENT}% ({UTILS_SIZE}KB)
Types          ██░░░░░░░░░░░░░░░░░░ {TYPES_PERCENT}% ({TYPES_SIZE}KB)
```

---

## 4. Code Quality

### Summary
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Avg Lines/Component | {AVG_LINES} | <150 | {AVG_STATUS} |
| Components >200 lines | {OVER_200} | 0 | {OVER_STATUS} |
| Components >100 lines | {OVER_100} | <10% | {OVER_100_STATUS} |
| TypeScript Errors | {TS_ERRORS} | 0 | {TS_STATUS} |
| ESLint Warnings | {LINT_WARNS} | <10 | {LINT_STATUS} |

### Components Needing Refactor
| Component | Lines | Priority | Estimated Effort |
|-----------|-------|----------|------------------|
{REFACTOR_TABLE}

### Quality Distribution
```
<50 lines   ██████████████████░░ {SMALL_PERCENT}% ({SMALL_COUNT})
50-100      ████████████░░░░░░░░ {MED_PERCENT}% ({MED_COUNT})
100-200     ██████░░░░░░░░░░░░░░ {LARGE_PERCENT}% ({LARGE_COUNT})
>200        ██░░░░░░░░░░░░░░░░░░ {XL_PERCENT}% ({XL_COUNT})
```

---

## 5. Consistency

### Summary
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Naming Compliance | {NAMING_PERCENT}% | 100% | {NAMING_STATUS} |
| Import Consistency | {IMPORT_PERCENT}% | 100% | {IMPORT_STATUS} |
| Barrel Coverage | {BARREL_PERCENT}% | 100% | {BARREL_STATUS} |
| Pattern Adherence | {PATTERN_PERCENT}% | >90% | {PATTERN_STATUS} |

### Issues Found
| Category | Issue | Count | Files |
|----------|-------|-------|-------|
{CONSISTENCY_ISSUES_TABLE}

---

## 6. Trend Analysis

{IF_PREVIOUS_EXISTS}
### Comparison with Previous Report ({PREVIOUS_DATE})

| Metric | Previous | Current | Change |
|--------|----------|---------|--------|
| Health Score | {PREV_SCORE} | {SCORE} | {SCORE_CHANGE} |
| Token Coverage | {PREV_TOKEN}% | {TOKEN_USAGE}% | {TOKEN_CHANGE} |
| Bundle Size | {PREV_BUNDLE}KB | {GZIP_SIZE}KB | {BUNDLE_CHANGE} |
| Components >200 | {PREV_OVER} | {OVER_200} | {OVER_CHANGE} |
| TypeScript Errors | {PREV_TS} | {TS_ERRORS} | {TS_CHANGE} |

### Trend Chart
```
Score:  {PREV_SCORE} ──────────────────────────> {SCORE}
        {TREND_VISUAL}
```
{END_IF}

---

## 7. Recommendations

### Critical (Fix Immediately)
{CRITICAL_RECOMMENDATIONS}

### High Priority
{HIGH_RECOMMENDATIONS}

### Medium Priority
{MEDIUM_RECOMMENDATIONS}

### Low Priority / Nice to Have
{LOW_RECOMMENDATIONS}

---

## 8. Action Items

### This Sprint
- [ ] {ACTION_1}
- [ ] {ACTION_2}
- [ ] {ACTION_3}

### Next Sprint
- [ ] {ACTION_4}
- [ ] {ACTION_5}

### Backlog
- [ ] {ACTION_6}
- [ ] {ACTION_7}

---

## 9. Commands for Follow-up

```bash
# Deep dive on specific areas
*validate-tokens {TARGET_PATH}    # Token violations details
*bundle-audit {TARGET_PATH}       # Bundle analysis
*token-usage {TARGET_PATH}        # Token analytics
*dead-code {TARGET_PATH}          # Unused code detection

# Fix workflows
*refactor-plan                    # Plan component refactoring
*refactor-execute {COMPONENT}     # Execute refactoring
```

---

## Appendix

### A. Files Analyzed
- Total files: {TOTAL_FILES}
- Components: {COMPONENT_FILES}
- Hooks: {HOOK_FILES}
- Utils: {UTIL_FILES}
- Types: {TYPE_FILES}

### B. Methodology
- Token coverage: grep-based pattern matching
- Bundle size: line count estimation (1 line ≈ 50 bytes minified)
- Quality metrics: static analysis via TypeScript compiler

### C. Thresholds Used
| Metric | Good | Warning | Critical |
|--------|------|---------|----------|
| Token Coverage | >95% | 85-95% | <85% |
| Components >200 | 0 | 1-5 | >5 |
| Bundle (gzip) | <30KB | 30-50KB | >50KB |
| TypeScript Errors | 0 | 1-10 | >10 |

---

*Report generated by Brad - Design System Architect v3.2.0*
*Template: ds-health-report-tmpl.md v1.0.0*
