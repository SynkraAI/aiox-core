# Compose Page from Content and Page Type

> Task ID: ds-compose-page
> Agent: Page Composer (Page Composition & Layout Specialist)
> Version: 1.0.0
> **Execution Type:** `Agent`
> **Dependencies:** depends_on: `[brief-validation-checklist]` · calls_internally: `[ds-layout-audit, ds-typography-map, ds-spacing-check]` · workflow: `page-composition`

## Description

Compose a complete page from content and page type using the 9-phase composition workflow. Identifies page type, selects template, applies layout framework, maps typography hierarchy, applies spacing rhythm, bridges copy to layout, selects components from the index, generates React + Tailwind + shadcn/ui code, and runs a quality validation pass.

## Input Schema

- **command:** `*compose-page {page-type} [--copy briefing.yaml]`
- **page-type:** One of: `landing`, `dashboard`, `pricing`, `about`, `blog`, `auth`, or `custom` (auto-detected from copy if omitted)
- **--copy:** Optional path to copy briefing YAML file or inline text
- **format:** Page type string + optional YAML briefing

### 3-Input Brief (Recommended)

Based on the v0/Vercel 3-Input Framework (mensurado: 152 linhas a menos, 19s mais rapido). Quando o usuario fornecer o brief neste formato, usar diretamente. Quando nao fornecer, extrair os 3 inputs da conversa antes de prosseguir.

```
Build [PRODUCT SURFACE — componentes especificos, dados, acoes].
Used by [PERSONA], in [MOMENTO], to [DECISAO/RESULTADO].
Constraints: [device/platform], [visual tone], [layout], [restricoes].
```

| Input | O que e | Exemplo |
|-------|---------|---------|
| **Product Surface** | Componentes, dados e acoes especificas da pagina | "Dashboard with revenue KPIs, user table with filters, activity feed" |
| **Context of Use** | Quem usa, quando, para que decisao | "Used by ops managers to monitor daily performance and act on alerts" |
| **Constraints** | Device, tom visual, palette, restricoes tecnicas | "Desktop-first, dark mode, compact spacing, shadcn/ui only" |

**Regra:** Se o usuario fornecer descricao vaga ("faz uma landing page"), pedir os 3 inputs antes de iniciar o workflow. Nao iniciar composicao sem pelo menos Product Surface e Constraints definidos.

## Prerequisites

- **Brief validated** via `squads/design/checklists/brief-validation-checklist.md` (score >= 5/8). If not validated, run `*validate-brief` first.
- Design system setup completed with tokens loaded
- Component index available at `squads/design/data/component-index.json`
- Knowledge bases loaded:
  - `squads/design/data/page-layout-framework.md`
  - `squads/design/data/page-type-patterns.md` (includes Section 0: Design Tone Vocabulary)
  - `squads/design/data/typography-hierarchy-rules.md`
  - `squads/design/data/spacing-rhythm-system.md`
  - `squads/design/data/copy-to-layout-bridge.md`
  - `squads/design/data/seo-rules.md` (used in Phase 8)
  - `squads/design/data/anti-ai-look-patterns.md` (used in Phase 9)
  - `squads/design/data/prompt-templates-library.md` (optional, for brief acceleration)

## Workflow

### Steps

1. **Identify Page Type + Constraints** — Classify request into page type (landing, dashboard, pricing, about, blog, auth, custom). If 3-Input brief provided, extract product surface, context, and constraints. If brief is vague, ask for the 3 inputs. Resolve design buzzwords to concrete decisions using KB2 Section 0 (Design Tone Vocabulary). Output: page type + resolved constraints (spacing strategy, typography weight, color direction, layout bias).
   - KB: `page-type-patterns.md` (Section 0: Design Tone Vocabulary + Section 7: Selection Guide)
   - Check: page type classified with confidence >= 80%, constraints resolved

2. **Select Template** — Match page type to template structure (sections, order, hierarchy) from page type patterns.
   - KB: `page-type-patterns.md`
   - Check: template skeleton generated with section definitions

3. **Apply Layout** — Select grid system, container strategy, and responsive approach for the template. Apply device/platform constraints from step 1.
   - KB: `page-layout-framework.md`
   - Input: resolved_constraints from step 1
   - Check: layout structure defined with Tailwind grid/container classes

4. **Map Typography** — Assign heading levels, body sizes, and display sizes per section following the modular type scale (1.25 ratio) and 24px vertical rhythm baseline.
   - KB: `typography-hierarchy-rules.md`
   - Check: typography map generated with Tailwind text-* classes per element

5. **Apply Spacing** — Assign section gaps, element spacing, and whitespace strategy (generous/balanced/compact) appropriate to page type.
   - KB: `spacing-rhythm-system.md`
   - Check: spacing tokens assigned with Tailwind gap/padding/margin classes on 4px grid

6. **Bridge Copy to Layout** — If copy/briefing provided: detect framework (AIDA/PAS/StoryBrand), assign copy sections to page zones, set visual weights.
   - KB: `copy-to-layout-bridge.md`
   - Check: copy-section mapping generated with visual weight assignments
   - Condition: only if `--copy` provided

7. **Select Components** — Match each section to shadcn/ui components using deterministic selection from the component index.
   - KB: `component-index.json`
   - Check: component selection per section with prop suggestions

8. **Generate Code** — Assemble all phase outputs into production-ready React + Tailwind + shadcn/ui page code. Apply SEO metadata per `seo-rules.md` (title, description, JSON-LD, canonical for indexable pages; noindex for auth/settings). Generate component states (loading/empty/error) for all data-dependent sections per `compose-component-states.md`.
   - KB: `seo-rules.md`, `anti-ai-look-patterns.md`
   - Check: complete React page component with SEO metadata and component states

9. **Quality Validation** — Run layout audit + typography map + spacing check + SEO meta check + anti-AI pattern scan + component states verification on generated code.
   - Checklist: `page-composition-checklist.md` (10 sections including SEO, Anti-AI, Component States)
   - KB: `anti-ai-look-patterns.md`, `seo-meta-checklist.md`
   - Check: layout score >= 8/10, 0 typography violations, 0 spacing violations, SEO score >= 7/10, anti-AI scan < 3 signals, all data sections have 3 states

## Output

- React + Tailwind + shadcn/ui page component (TypeScript)
- Typography map table
- Spacing token assignments
- Component selection list
- Validation report with scores
- `.state.yaml` updated

## Output Format

```
Phase 1: Page type identified — Landing Page (confidence: 95%)
Phase 2: Template selected — Hero → Features → Social Proof → Pricing → CTA → Footer
Phase 3: Layout applied — 12-column grid, max-w-7xl container, hero-content pattern
Phase 4: Typography mapped:
  | Element     | Scale       | Tailwind Class       | Line Height |
  |-------------|-------------|----------------------|-------------|
  | Hero H1     | display-xl  | text-5xl lg:text-7xl | leading-tight |
  | Section H2  | heading-l   | text-3xl lg:text-4xl | leading-snug |
  | Body        | body-base   | text-base lg:text-lg | leading-relaxed |
  | Caption     | caption     | text-sm              | leading-normal |
Phase 5: Spacing applied — Generous strategy:
  | Zone            | Gap    | Tailwind     |
  |-----------------|--------|--------------|
  | Section gap     | 96px   | py-24        |
  | Element group   | 32px   | space-y-8    |
  | Inline elements | 16px   | gap-4        |
Phase 6: Copy bridge — StoryBrand framework detected, 6 sections mapped
Phase 7: Components selected from index (8 components)
Phase 8: Code generated — src/pages/Landing.tsx (187 lines)
Phase 9: Validation — Layout: 9/10 | Typography: 0 violations | Spacing: 0 violations

.state.yaml updated. Page ready for review.
```

## Failure Handling

- **Unknown page type:** If page type cannot be classified with >= 80% confidence, present detected options with confidence percentages and ask user to confirm.
- **Missing KB file:** If any of the 6 knowledge base files is not found, abort with "KB file {name} not found at squads/design/data/. Cannot proceed with composition."
- **Template not found for page type:** If page type has no matching template in page-type-patterns.md, fallback to closest match and warn user "No exact template for '{type}'. Using '{fallback}' as base — review section structure."
- **Component not in index:** If a section requires a component not found in component-index.json, warn "Component '{name}' not in index. Handoff to @brad-frost for creation." and continue with placeholder.
- **Validation fails:** If quality validation (Phase 9) scores below thresholds, list specific violations and suggest fixes before finalizing.

## Success Criteria

- [ ] Page type correctly identified with confidence
- [ ] Template matches page type patterns from KB
- [ ] Layout uses 12-column grid with responsive breakpoints
- [ ] Typography follows modular scale (1.25) with 24px vertical rhythm
- [ ] All spacing values on 4px grid
- [ ] Components selected from component-index.json (no freestyle)
- [ ] Generated code is production-ready React + Tailwind + shadcn/ui
- [ ] Validation: layout >= 8/10, 0 typography violations, 0 spacing violations
- [ ] `.state.yaml` updated with all phase outputs

## Composition Rules (DO's and DON'Ts)

> Source: `docs/research/2026-03-08-ai-design-tools-prompts/02-research-report.md` Section 5

### DO

- Specify exact components, data fields, and actions — never vague descriptions
- Use real content (headlines, CTAs, metric names) — never lorem ipsum
- Define persona and context (who, when, what decision) via 3-Input Framework
- Build component by component, not entire pages in one shot
- Set design buzzwords early — resolve via Design Tone Vocabulary before layout
- Declare constraints upfront: device, color system, accessibility, urgency indicators
- Request all states explicitly: loading, error, empty
- Explain WHY, not just what — intent drives better layout decisions
- Version prompts as code — track brief iterations

### DON'T

- Combine multiple unrelated requirements in one brief
- Use placeholder text (hides design problems and triggers anti-AI patterns)
- Skip the planning phase (Phase 1 exists for a reason)
- Treat design direction as final polish — it's upfront (Phase 1 constraints)
- Give vague instructions ("make it look nice", "add a dashboard")
- Rewrite entire briefs for minor edits — use Update Delicado template instead
- Ignore visual consistency between sections
- Expect perfection on first pass — iterate per section
- Forget edge cases (empty data, long names, error states)
- Overload brief with 3+ simultaneous objectives
- Start from layout without knowing the content
- Use arbitrary spacing values not on the 4px grid
- Select components not in the component-index.json
- Apply same whitespace strategy to all page types
- Skip the validation pass (Phase 9)

## Examples

### Example 1: Landing Page Composition

```
User: *compose-page landing
Composer: Identifying page type: Landing Page (AIDA/StoryBrand)
Composer: Template: Hero → Features → Social Proof → Pricing → CTA → Footer
Composer: Layout: hero-content pattern (KB: page-layout-framework)
Composer: Spacing: Generous strategy (KB: spacing-rhythm-system)
Composer: Typography: display-xl for hero, heading-l for sections
Composer: Components: Hero (hero-section), FeatureGrid (bento-grid),
          TestimonialCarousel (carousel), PricingTable (card-group),
          CTABanner (cta-section)
Composer: [Generates full React + Tailwind + shadcn/ui code]
Composer: Validation: Layout 9/10, Typography 0 violations, Spacing 0 violations
Composer: .state.yaml updated. Page ready.
```

### Example 2: Landing Page with Copy Briefing

```
User: *compose-page landing --copy briefing.yaml
Composer: Phase 1: Page type identified — Landing Page (confidence: 95%)
Composer: Phase 6: Copy bridge — StoryBrand framework detected, 6 sections mapped
Composer: Phase 8: Code generated — src/pages/Landing.tsx (187 lines)
Composer: Phase 9: Validation — Layout: 9/10 | Typography: 0 | Spacing: 0
```

## Notes

- Content determines layout, not the other way around
- All 6 KBs are used in this task (the only task that uses all 6)
- The 9 phases execute sequentially — each phase depends on the previous
- Phase 6 (copy bridge) is conditional on `--copy` being provided
- Phase 9 internally calls layout-audit, typography-map, and spacing-check logic
- Mobile-first responsive approach is non-negotiable

## Related Checklists

- `squads/design/checklists/page-composition-checklist.md`

## Process Guards

- **On Fail:** Stop execution, capture evidence at the failing phase, and return remediation steps before proceeding.
