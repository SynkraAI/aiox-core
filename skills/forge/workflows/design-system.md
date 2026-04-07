# Workflow: Design System

> Extract DNA → Scrape References → Architect Tokens → Build Components → Assemble Pages → Deploy

---

## When to Use

- User runs `/forge design-system {url}` or `/forge design-system "{description}"`
- Quest delegates a design-system-forge pack mission to Forge
- Scope: extract visual DNA from a reference site and build a premium design system

---

## Pipeline

```
Phase 0 -> Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5
Discovery   Extract    Tokens    Components  Pages      Deploy
```

ALL 6 phases execute for a full design system build. Individual missions from Quest may only trigger a subset.

---

## Execution

### Phase 0: Discovery

Read `{FORGE_HOME}/phases/phase-0-discovery.md` with DESIGN_SYSTEM adjustments:
- Ask for target URL(s) — the site(s) to extract DNA from
- Ask for output goals — full DS, LP only, component library
- Ask for stack preference — default: Next.js + Tailwind + Shadcn/ui
- Ecosystem scan: check for existing design-system/, tokens, Playwright
- CHECKPOINT: confirm scope + targets + stack

### Phase 1: DNA Extraction

**Agents:** @ux-design-expert, @dev

This phase replaces the standard Spec Pipeline. Instead of PRD/Architecture, we extract the visual DNA.

1. **@ux-design-expert** — Playwright captures full-page screenshots (desktop 1440px + mobile 390px)
2. **@dev** — Run Dembrandt extraction: `dembrandt {url} --dtcg --dark-mode --mobile --save-output`
3. **@dev** — Deep CSS extraction via Playwright: inject script to capture computed CSS, @keyframes, transitions, custom properties, pseudo-elements, media queries
4. **@dev** — Extract animations and effects: @keyframes, transitions, transforms, backdrop-filters, clip-paths, gradients
5. **@ux-design-expert** — Claude Vision analyzes screenshots, catalogs every component (Hero, Card, Nav, Footer, CTA, etc.)
6. Optional: dark mode extraction, interactive states capture

**Output:** `design-system/extraction/` with raw tokens, screenshots, component catalog

**Auto-checkpoint:** If extraction finds < 3 color tokens or < 2 font families → STOP, likely extraction failure. Ask user to verify URL.

### Phase 2: Token Architecture

**Agents:** @architect, @dev, /design squad (Brad Frost)

1. **@architect** — Analyze and consolidate extracted tokens (dembrandt + deep extract), resolve conflicts
2. **/design squad** (Brad Frost) — Define token hierarchy: primitives → semantic → component tokens
3. **@dev** — Generate `tailwind.config.ts` from consolidated tokens
4. **@dev** — Export CSS custom properties (`:root` variables)
5. Optional: map animations to Tailwind keyframes

**Output:** `design-system/tokens/` with final token files + tailwind config

**Auto-checkpoint:** Tailwind config must be valid (`npx tailwind --help` doesn't fail with the config).

### Phase 3: Component Build

**Agents:** @dev, @ux-design-expert

1. **@dev** — Build atomic components: Button, Badge, Input, Avatar (using tokens + Shadcn as base)
2. **@dev** — Build molecular components: Card, NavItem, FormField
3. **@dev** — Implement animations and transitions from extracted keyframes
4. **@dev** — Build organisms: Hero, Header, Footer, Pricing, FAQ
5. **@dev** — Implement responsiveness (mobile-first, 3 breakpoints)
6. **@ux-design-expert** — Accessibility audit: aria-labels, focus-visible, contrast, keyboard nav
7. Optional: dark mode variants, Storybook catalog

**Output:** `components/` directory with all components

**Quality gate:** `npm run build` must pass. Components must use tokens (no hardcoded colors/sizes).

### Phase 4: Page Assembly + QA

**Agents:** @dev, @qa

1. **@dev** — Compose full pages using organisms + patterns from library
2. **@qa** — Visual diff: Playwright screenshots of redesign vs original (side by side)
3. **@qa** — Responsive test: screenshots at 390px, 768px, 1440px
4. Optional: Lighthouse performance audit, frontend audit (/tokenizacao)
5. Optional: premium elevation — replace generic patterns with awwwards/21st.dev patterns

**Output:** Complete pages, comparison screenshots

**Quality gate:** Visual diff must show reasonable fidelity. Responsive layouts must not break.

### Phase 5: Deploy

Read `{FORGE_HOME}/phases/phase-5-deploy.md`:
1. **@dev** — Production build (`npm run build`)
2. CHECKPOINT: confirm push
3. **@devops** — Deploy (Vercel/Netlify), push + PR
4. **@qa** — Final comparison: original vs redesign (public URLs)
5. **@dev** — Document the design system (README.md)

---

## Agent Mapping

| Phase | Primary Agent | Supporting |
|-------|---------------|------------|
| 0 - Discovery | (Forge core) | — |
| 1 - Extraction | @ux-design-expert | @dev |
| 2 - Tokens | @architect | @dev, /design squad |
| 3 - Components | @dev | @ux-design-expert |
| 4 - Pages + QA | @dev, @qa | — |
| 5 - Deploy | @devops | @qa, @dev |

---

## Progress Display

```
  ✅ Discovery  ->  🔄 Extract  ->  ○ Tokens  ->  ○ Components  ->  ○ Pages  ->  ○ Deploy
```

---

## Quest Integration

When invoked by Quest (via forge-bridge), Forge receives the specific mission context:

- **Single item execution:** Forge runs only the relevant sub-step (e.g., "Deep CSS extraction") not the entire pipeline
- **Phase execution:** If the Quest item maps to a full Forge phase, run the complete phase
- **Context preservation:** Forge state is saved in `.aios/forge-runs/` so Quest can track which items were completed by Forge

### Mapping Quest items to Forge steps

The Quest pack `design-system-forge.yaml` items map to Forge phases:

| Quest World | Forge Phase | Notes |
|---|---|---|
| W0: O Laboratório | Phase 0 (Discovery) | Setup + scaffold |
| W1: O Espião | Phase 1 (Extraction) | DNA extraction |
| W2: A Biblioteca Secreta | (Reference scraping) | Not a standard Forge phase — uses @analyst |
| W3: O Alquimista | Phase 2 (Tokens) | Token architecture |
| W4: A Forja dos Componentes | Phase 3 (Components) | Component build |
| W5: A Arena | Phase 4 (Pages + QA) | Assembly + testing |
| W6: O Portal do Deploy | Phase 5 (Deploy) | Ship it |
| W7: A Evolução | (Post-deploy) | Package + Figma + library |

For W2 (reference scraping) and W7 (evolution), Forge dispatches the agents directly without a full phase workflow.

---

## Error Recovery

Inherits from `{FORGE_HOME}/runner.md` Section 4, with design-system specific additions:

```
Extraction fails (Playwright timeout)
  → Retry with longer timeout (30s → 60s)
  → If still fails → ask user to check URL accessibility
  → If site blocks headless → suggest user login first

Token consolidation conflicts
  → @architect resolves (prefers deep-extract over dembrandt for specificity)
  → If unresolvable → CHECKPOINT: ask user to choose

Component build fails
  → Standard Forge error recovery (@dev retry → @architect review)

Visual diff shows > 30% difference
  → Not a failure — show diff to user, ask if acceptable
  → "Redesign diverge do original. Isso é intencional? (s/n)"
```
