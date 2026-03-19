# Design System Reference Architectures — Comparative Guide

**Purpose:** Quick reference for comparing major DS architectures when making design decisions

---

## Material Design 3 (Google)

**Philosophy:** Expressive, personal, adaptive

- **Dynamic Color:** Material You generates palettes from user wallpaper/preferences
- **Tokens:** Mode-aware semantic tokens with tonal palettes (0-100 scale)
- **Components:** ~30 core components, highly customizable via theme
- **A11y:** Color contrast validation built into palette generation
- **Governance:** Centralized by Google, open-source implementations
- **Tooling:** Material Theme Builder, Figma plugin, style-dictionary export

**Best for:** Consumer apps, products wanting personality and expressiveness

---

## Fluent 2 (Microsoft)

**Philosophy:** Clarity, system, productive

- **Components:** Compound component architecture, slot-based customization
- **Tokens:** 3-layer (global → alias → component), cross-platform naming
- **Cross-platform:** Native implementations per platform (not web wrappers)
- **A11y:** Built-in ARIA, Tabster focus management, high contrast via tokens
- **Governance:** Centralized Microsoft team, tiny core doc team
- **Tooling:** @fluentui/react-components, Griffel CSS-in-JS

**Best for:** Enterprise/productivity apps, cross-platform consistency

---

## Carbon (IBM)

**Philosophy:** Enterprise-scale, granular, governed

- **Tokens:** Most granular token system in industry (1,500+ tokens in v11)
- **Components:** ~50 components, heavy enterprise forms/data focus
- **Theming:** 4 built-in themes (white, g10, g90, g100) + custom themes
- **A11y:** IBM Equal Access Toolkit integration, automated a11y testing
- **Governance:** Federated model with dedicated contribution process
- **Tooling:** Carbon DevTools browser extension, Sass-based, migrating to tokens

**Best for:** Complex enterprise applications, data-heavy interfaces, regulated industries

---

## Spectrum (Adobe)

**Philosophy:** Adaptive, inclusive, global

- **Scale:** Desktop and mobile scales via token switching
- **Tokens:** Localization-aware (RTL, CJK typography), accessibility tokens
- **Components:** React Spectrum (React The Architect + React Stately architecture)
- **A11y:** React The Architect — most comprehensive accessible component hooks library
- **Governance:** Centralized Adobe team, React The Architect is open-source
- **Tooling:** React The Architect (hooks-only, unstyled), React Spectrum (styled)

**Best for:** Creative tools, global/multilingual apps, custom-styled accessible components

---

## Comparison Matrix

| Dimension | Material 3 | Fluent 2 | Carbon | Spectrum |
|-----------|-----------|----------|--------|----------|
| **Token approach** | Tonal palettes + semantic | 3-layer global/alias/component | Granular 1,500+ | Scale/locale-aware |
| **Component model** | Customizable theme | Compound/slots | Enterprise forms | Hooks + styled |
| **A11y strategy** | Palette contrast | Built-in ARIA + Tabster | IBM Equal Access | React The Architect hooks |
| **Governance** | Centralized (Google) | Centralized (Microsoft) | Federated | Centralized (Adobe) |
| **Cross-platform** | MDC-Web, Android, iOS, Flutter | Web, iOS, Android, Windows | Web primary | Web primary |
| **Token format** | Custom JSON | Custom JSON | Sass → tokens | Custom JSON |
| **DTCG adoption** | Partial | Partial | Migrating | Partial |
| **Open source** | Yes (MDC) | Yes (@fluentui) | Yes (carbon) | Yes (react-aria) |

---

## When to Reference Each

| Scenario | Reference |
|----------|-----------|
| Consumer app needing personality | Material 3 |
| Enterprise productivity tool | Fluent 2 |
| Complex data-heavy enterprise | Carbon |
| Custom-styled accessible components | Spectrum (React The Architect) |
| Cross-platform native feel | Fluent 2 |
| Design token best practices | Carbon (granularity) |
| Accessible hooks without styling | Spectrum (React The Architect) |
| Dynamic theming/personalization | Material 3 |
