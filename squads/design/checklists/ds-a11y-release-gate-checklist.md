# Design System A11y Release Gate Checklist

**Purpose:** Block releases when accessibility standards governance is stale or incomplete.  
**Scope:** Design System components, tokens, patterns, and accessibility contracts.

## 1) Canonical Artifacts

- [ ] `docs/design-system/accessibility/manifest.json` exists
- [ ] `docs/design-system/accessibility/sources/wcag-22-criteria.pt-BR.md` exists
- [ ] `docs/design-system/accessibility/checklists/wcag-22-master-checklist.md` exists
- [ ] `scripts/accessibility/generate_wcag_checklist.cjs` exists
- [ ] `scripts/accessibility/validate_a11y_checklists.cjs` exists

## 2) Checklist Integrity

- [ ] Total criteria = `87`
- [ ] Active criteria = `86`
- [ ] Removed/obsolete criteria = `1`
- [ ] `4.1.1` marked as removed/obsolete
- [ ] WCAG 2.2 additions are present (`2.4.11`, `2.4.12`, `2.4.13`, `2.5.7`, `2.5.8`, `3.2.6`, `3.3.7`, `3.3.8`, `3.3.9`)
- [ ] No duplicate criterion IDs

## 3) Freshness Governance

- [ ] `last_verified_at` is within `max_age_days`
- [ ] Sources list in `manifest.json` is present and valid
- [ ] Review cadence is documented (`monthly` or stricter)

## 4) Command Gates

- [ ] `npm run checklists:a11y:generate` passes
- [ ] `npm run validate:a11y-checklists` passes
- [ ] `node squads/design/scripts/validate-a11y-integration.cjs` passes

## 5) CI/CD Enforcement

- [ ] `.github/workflows/design-ci.yml` includes accessibility checklist validation
- [ ] Validation runs on changes in `squads/design/**`
- [ ] Validation runs on changes in `docs/design-system/accessibility/**`
- [ ] Validation runs on changes in `scripts/accessibility/**`

## Gate Result

- [ ] **APPROVED** - release allowed
- [ ] **BLOCKED** - missing checks above
