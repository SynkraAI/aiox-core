# Changelog

All notable changes to the Design System Extractor skill will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-04

### Added
- Initial release of Design System Extractor skill
- Website analysis using WebFetch
- Comprehensive design token extraction (colors, typography, spacing, shadows, borders)
- Component identification and documentation
- TypeScript/React package generation
- Vite + Vitest + ESLint + Storybook setup
- Complete documentation generation (README, GETTING_STARTED, DESIGN_PRINCIPLES, ACCESSIBILITY)
- Multi-page analysis support
- Consistency reporting across multiple pages
- Token templates and examples
- Extraction report generation

### Workflow
- Phase 1: Analysis & Extraction (WebFetch + structured prompt)
- Phase 2: Package Generation (TypeScript tokens + build setup)
- Phase 3: Validation & Testing (build + tests + quality checks)

### Features
- Extract colors (primary, secondary, semantic, neutrals)
- Extract typography (fonts, sizes, weights, line heights)
- Extract spacing (base unit, scale, containers, breakpoints)
- Extract visual effects (shadows, borders, transitions)
- Identify components (buttons, forms, cards, navigation, etc.)
- Generate production-ready package structure
- Setup testing infrastructure
- Initialize Storybook documentation
- Create comprehensive documentation

### References
- Based on production design system creation best practices

## [Unreleased]

### Planned
- [ ] Component code generation (not just identification)
- [ ] Screenshot-based analysis (alternative to WebFetch)
- [ ] Figma plugin integration
- [ ] AI-powered component matching
- [ ] Automatic Storybook story generation
- [ ] Theme variant generation (dark mode, etc.)
- [ ] CSS-in-JS support (styled-components, emotion)
- [ ] Tailwind config generation
- [ ] Style Dictionary integration
- [ ] Design token versioning
- [ ] Visual regression testing setup
- [ ] Chromatic integration
- [ ] NPM publish automation

### Future Enhancements
- Interactive token refinement
- Component usage examples generation
- Accessibility audit automation
- Performance optimization suggestions
- Design trend analysis
- Multi-brand theme support
- Design system migration tools
- Token transformation utilities
