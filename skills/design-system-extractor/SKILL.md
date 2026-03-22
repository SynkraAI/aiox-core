# Design System Extractor

Extracts design tokens and patterns from any website and generates a production-ready TypeScript design system package.

## Usage

```bash
/AIOS:skills:design-system-extractor
```

Provide URLs (1-5 pages), package name, and scope. Outputs to `packages/{name}-design-system/`.

## Implementation

4-phase pipeline:
1. **WebFetch Analysis** — structured extraction from URLs
2. **Token Extraction** — colors, typography, spacing, shadows, borders
3. **Package Generation** — TypeScript files, Vite, Vitest, ESLint
4. **Documentation** — README, guides, principles

Core logic: `system-prompt.md` | Config: `skill.json` | Templates: `resources/`

See `INDEX.md` for full reference.
