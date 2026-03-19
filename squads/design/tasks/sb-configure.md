# Configure Storybook

**Task ID:** `sb-configure`
**Pattern:** HO-TP-001 (Task Anatomy Standard)
**Version:** 1.0.0
**Last Updated:** 2026-02-25

## Task Anatomy

| Field | Value |
|-------|-------|
| **task_name** | Configure Storybook |
| **status** | `pending` |
| **responsible_executor** | @storybook-expert |
| **execution_type** | `Agent` |
| **input** | Installed packages, project structure, CSS framework, theme strategy |
| **output** | `.storybook/main.ts`, `.storybook/preview.ts`, `.gitignore` updated |
| **action_items** | 6 steps |
| **acceptance_criteria** | 5 criteria |

## Overview

Create Storybook configuration files (main.ts and preview.ts) tailored to the project's framework, CSS system, and theme strategy. Handles stories glob pattern, addon registration, global CSS import, theme toggle, and static assets.

## Input

- **framework_adapter** (string)
  - Description: Framework adapter package name (from sb-install output)
  - Required: Yes
- **css_framework** (string)
  - Description: CSS framework in use (`tailwind-v4`, `tailwind-v3`, `css-modules`, `styled-components`, `vanilla`)
  - Required: Yes
  - Source: Detected from project config files
- **theme_strategy** (string)
  - Description: How dark/light mode is toggled
  - Required: Yes
  - Options: `class` (.dark class on html/body), `data-attribute` (data-theme="dark"), `media-query` (prefers-color-scheme), `none`
- **default_theme** (string)
  - Description: Default theme on load
  - Required: No
  - Default: `dark`
- **global_css_path** (string)
  - Description: Path to global CSS file relative to .storybook/
  - Required: Yes
  - Source: Detected (typically `../src/app/globals.css` or `../src/styles/globals.css`)
- **stories_glob** (string)
  - Description: Glob pattern for story files
  - Required: No
  - Default: `../src/**/*.stories.@(ts|tsx)`
- **static_dirs** (list)
  - Description: Directories to serve statically
  - Required: No
  - Default: `["../public"]`

## Output

- **main_ts** (file)
  - Description: Storybook main configuration
  - Destination: `.storybook/main.ts`
- **preview_ts** (file)
  - Description: Storybook preview configuration
  - Destination: `.storybook/preview.ts`
- **gitignore_update** (patch)
  - Description: Add `storybook-static` to .gitignore
- **eslint_update** (patch)
  - Description: Add `storybook-static/**` to eslint globalIgnores (if applicable)

## Action Items

### Step 1: Detect Project Configuration

Scan the project to auto-fill input parameters:

- [ ] Read `tsconfig.json` for path aliases (`@/*` → `./src/*`)
- [ ] Read `postcss.config.*` for CSS preprocessor setup
- [ ] Read `tailwind.config.*` or `globals.css` for Tailwind version
- [ ] Find global CSS file location
- [ ] Check for `public/` directory (staticDirs)
- [ ] Check existing `.storybook/` directory (abort if config already exists, or offer merge)

### Step 2: Generate `.storybook/main.ts`

```typescript
import type { StorybookConfig } from "{framework_adapter}";

const config: StorybookConfig = {
  stories: ["{stories_glob}"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "@storybook/addon-themes",
    "@chromatic-com/storybook",
  ],
  framework: "{framework_adapter}",
  staticDirs: {static_dirs},
};

export default config;
```

**Notes:**
- Path aliases from tsconfig.json are resolved automatically by the Vite-based frameworks
- PostCSS config is auto-detected by Vite — no manual config needed
- Do NOT add `webpackFinal` or `viteFinal` unless custom resolution is required

### Step 3: Generate `.storybook/preview.ts`

```typescript
import type { Preview } from "{framework_adapter}";
import "{global_css_path}";
```

**Theme configuration based on strategy:**

| Strategy | Decorator | Import |
|----------|-----------|--------|
| `class` | `withThemeByClassName` | `@storybook/addon-themes` |
| `data-attribute` | `withThemeByDataAttribute` | `@storybook/addon-themes` |
| `media-query` | None (CSS handles it) | — |
| `none` | None | — |

**For `class` strategy (most common with Tailwind):**
```typescript
import { withThemeByClassName } from "@storybook/addon-themes";

const preview: Preview = {
  parameters: {
    layout: "centered",
    docs: { toc: true },
    a11y: {
      config: {
        rules: [{ id: "color-contrast", enabled: true }],
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "{default_theme}",
    }),
  ],
};

export default preview;
```

### Step 4: Update .gitignore

Append `storybook-static` to `.gitignore` if not already present.

### Step 5: Update ESLint Config (if applicable)

If project uses `eslint.config.mjs` (flat config), add `storybook-static/**` to `globalIgnores`:
```javascript
globalIgnores: ["storybook-static/**"]
```

If project uses `.eslintignore`, append `storybook-static`.

### Step 6: Verify Configuration

- [ ] `npx storybook dev -p 6006 --no-open` starts without errors (kill after 10s)
- [ ] No TypeScript errors in `.storybook/main.ts` or `.storybook/preview.ts`
- [ ] Global CSS loads (fonts, tokens, colors resolve)

## Acceptance Criteria

- [ ] **AC-1:** `.storybook/main.ts` exists with correct framework, stories glob, and addons
- [ ] **AC-2:** `.storybook/preview.ts` exists with global CSS import and theme decorator
- [ ] **AC-3:** `storybook-static` in `.gitignore`
- [ ] **AC-4:** Storybook dev server starts without config errors
- [ ] **AC-5:** Theme toggle (dark/light) works in Storybook toolbar

## Error Handling

### CSS Not Loading
- **Trigger:** Components render without styles in Storybook
- **Detection:** Visual — no colors, fonts missing, layout broken
- **Recovery:** Verify global CSS import path. For Tailwind v4, ensure PostCSS config exists. Check that `@theme` block (Tailwind v4) or `@tailwind` directives (v3) are in the CSS file.
- **Prevention:** Step 1 detection verifies CSS path existence

### Path Aliases Not Resolving
- **Trigger:** `Cannot find module '@/...'` errors
- **Detection:** Build error in Storybook console
- **Recovery:** For Vite-based frameworks, path aliases from tsconfig.json should auto-resolve. If not, add `viteFinal` with alias config in main.ts.
- **Prevention:** Verify tsconfig.json has `paths` configured before proceeding

### Fonts Not Loading
- **Trigger:** Fallback system fonts render instead of project fonts
- **Detection:** Visual inspection in Storybook
- **Recovery:** Check if fonts are loaded via CSS (@font-face) or Next.js font system. For Next.js fonts, they may need manual CSS override in preview since next/font doesnt work in Storybook context.
- **Prevention:** Document font strategy in output notes

## Dependencies

### Depends On (Upstream)

- `sb-install` - Install Storybook
  - Required output: installed_packages, framework_adapter

### Required By (Downstream)

- `sb-expand-shadcn` - Expand Shadcn Library
  - Uses output: Working Storybook configuration
- `sb-generate-all-stories` - Generate All Stories
  - Uses output: .storybook/main.ts (stories glob), preview.ts (theme config)

## Related Checklists

- `squads/design/checklists/ds-component-quality-checklist.md`
- `squads/design/checklists/ds-accessibility-wcag-checklist.md`

## Handoff

| Attribute | Value |
|-----------|-------|
| **Next Task** | `sb-expand-shadcn` |
| **Trigger** | All acceptance criteria met |
| **Executor** | @storybook-expert |

### Handoff Package

- **framework_adapter**: Selected framework adapter
- **theme_strategy**: Theme strategy configured
- **stories_glob**: Glob pattern for stories
- **global_css_path**: Path to global CSS

---

_Task Version: 1.0.0_
_Pattern: HO-TP-001 (Task Anatomy Standard)_
_Last Updated: 2026-02-25_
_Compliant: Yes_
