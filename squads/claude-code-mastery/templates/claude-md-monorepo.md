# CLAUDE.md — Monorepo Project

## Project Overview

- **Name:** [PROJECT_NAME]
- **Description:** [Brief description]
- **Type:** Monorepo
- **Manager:** [Turborepo / Nx / Lerna / pnpm workspaces]
- **Status:** [Development / Staging / Production]

## Package Structure

```
packages/
  core/                   # Shared business logic and types
  ui/                     # Shared UI component library
  config/                 # Shared config (ESLint, TypeScript, Tailwind)
  utils/                  # Shared utility functions
apps/
  web/                    # Main web application (Next.js)
  api/                    # Backend API service
  docs/                   # Documentation site
  admin/                  # Admin dashboard
tooling/
  eslint-config/          # Shared ESLint configuration
  tsconfig/               # Shared TypeScript configuration
  jest-config/            # Shared Jest configuration
```

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Build | Turborepo | Task orchestration and caching |
| Package Manager | pnpm | Workspace support, strict hoisting |
| Language | TypeScript | Shared tsconfig in tooling/ |
| Linting | ESLint | Shared config across packages |
| Testing | Jest | Shared config, per-package execution |

## Shared Dependencies

### Internal Packages (workspace:*)
- `@[scope]/core` — Business logic, types, constants
- `@[scope]/ui` — React components, design tokens
- `@[scope]/utils` — Utility functions (date, string, validation)
- `@[scope]/config` — Shared configuration files

### Dependency Rules
- **Root dependencies:** Only dev tools (turbo, prettier, husky)
- **Shared deps:** Declared in the package that owns them
- **Version alignment:** Use `syncpack` or `manypkg` to keep versions consistent
- **Peer dependencies:** UI components declare React as peer dep
- Never install the same dependency at different versions across packages

## Per-Package Conventions

### apps/web (Next.js)
```bash
pnpm --filter web dev        # Dev server
pnpm --filter web build      # Production build
pnpm --filter web test       # Tests
```
- Imports from `@[scope]/ui` and `@[scope]/core`
- Uses App Router, follows fullstack patterns

### apps/api (Express/Fastify)
```bash
pnpm --filter api dev        # Dev server
pnpm --filter api build      # Compile TypeScript
pnpm --filter api test       # Tests
```
- Imports from `@[scope]/core` for shared types
- Never imports from `@[scope]/ui`

### packages/ui (Component Library)
```bash
pnpm --filter ui dev         # Storybook
pnpm --filter ui build       # Build for consumption
pnpm --filter ui test        # Component tests
```
- Exports via package.json `exports` field
- Uses `tsup` or `unbuild` for compilation

### packages/core (Business Logic)
```bash
pnpm --filter core build     # Compile
pnpm --filter core test      # Unit tests
```
- Pure TypeScript, no framework dependencies
- Exports types, validators, constants

## Cross-Package Imports

```typescript
// Correct: use workspace package name
import { Button } from '@[scope]/ui';
import { formatDate } from '@[scope]/utils';
import type { User } from '@[scope]/core';

// Wrong: never use relative paths across packages
import { Button } from '../../packages/ui/src/Button';
```

## Build and Test Commands

```bash
# Root commands (run across all packages)
pnpm build                   # Build all packages (respects dependency order)
pnpm test                    # Test all packages
pnpm lint                    # Lint all packages
pnpm typecheck               # Type-check all packages
pnpm dev                     # Dev mode for all apps

# Single package
pnpm --filter [package] [command]

# With dependencies
pnpm --filter [package]... build   # Build package and its deps

# Turbo-specific
turbo run build --filter=web       # Build web and dependencies
turbo run test --affected          # Test only affected packages
```

## Naming Conventions

- Package names: `@[scope]/package-name` (kebab-case)
- Internal imports: Always use the package name, never relative paths
- Shared types: Define in `@[scope]/core/types/`
- Shared hooks: Define in `@[scope]/ui/hooks/` if UI-related, `@[scope]/core/hooks/` otherwise

## Important Notes

- Always run `pnpm install` from the root (never inside a package)
- Changes to shared packages may affect multiple apps — test broadly
- Turbo caches builds; run `turbo run build --force` to bypass cache
- When adding a new package, update `pnpm-workspace.yaml`
- CI should use `turbo run test --affected` for faster builds
- Never put secrets in shared packages; keep them in app-level `.env`
