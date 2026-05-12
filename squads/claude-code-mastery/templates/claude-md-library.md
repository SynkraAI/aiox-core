# CLAUDE.md — Library / Package Project

## Project Overview

- **Name:** [PACKAGE_NAME]
- **Description:** [What this library does]
- **Type:** Reusable library / npm package
- **Registry:** npm (public / private)
- **Status:** [Alpha / Beta / Stable]
- **Current Version:** [X.Y.Z]

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Language | TypeScript | Strict mode enabled |
| Bundler | tsup / Rollup / Vite | Dual ESM + CJS output |
| Testing | Vitest / Jest | Unit + integration |
| Linting | ESLint + Prettier | Strict rules for library code |
| Docs | TypeDoc / TSDoc | Auto-generated API docs |

## API Surface

### Public Exports (src/index.ts)

All public API is exported from the package entry point. Every export is part of the
public contract and subject to semver guarantees.

```typescript
// src/index.ts — the single source of truth for public API
export { createClient } from './client';
export { validate } from './validators';
export type { ClientOptions, ValidationResult } from './types';
```

### Internal vs Public

| Directory | Visibility | Semver Contract |
|-----------|-----------|----------------|
| `src/index.ts` | PUBLIC | Breaking changes = major bump |
| `src/` (non-exported) | INTERNAL | Can change freely |
| `src/internal/` | INTERNAL | Never import from outside |
| `src/__tests__/` | INTERNAL | Test utilities, not shipped |

### Rules
- Never export from subdirectories directly; always re-export through `src/index.ts`
- Prefix internal utilities with `_` or place in `src/internal/`
- Every public function must have TSDoc comments with `@example` blocks
- Every public type must be explicitly exported (no implicit exports via inference)

## Backward Compatibility

### Semver Rules
- **MAJOR (X.0.0):** Removing exports, changing function signatures, renaming types
- **MINOR (0.X.0):** Adding new exports, adding optional parameters, new features
- **PATCH (0.0.X):** Bug fixes, performance improvements, documentation

### Breaking Change Checklist
Before any major version bump:
- [ ] Document all breaking changes in CHANGELOG.md
- [ ] Provide migration guide
- [ ] Update all examples and documentation
- [ ] Consider deprecation period (mark deprecated in minor, remove in next major)

### Deprecation Pattern
```typescript
/**
 * @deprecated Use `createClientV2()` instead. Will be removed in v3.0.0.
 */
export function createClient(options: OldOptions): Client {
  console.warn('createClient is deprecated. Use createClientV2 instead.');
  return createClientV2(migrateOptions(options));
}
```

## Versioning

- Follow [Semantic Versioning 2.0.0](https://semver.org/)
- Use `npm version patch|minor|major` to bump
- Tag releases: `git tag v1.2.3`
- Maintain CHANGELOG.md with [Keep a Changelog](https://keepachangelog.com/) format

## Testing Strategy

### Test Categories
- **Unit tests:** Every public function, edge cases, error conditions
- **Integration tests:** Module interactions, real-world usage patterns
- **Type tests:** Verify TypeScript types with `tsd` or `expect-type`
- **Snapshot tests:** For serializable outputs (optional)

### Coverage Requirements
- Public API: 100% branch coverage
- Internal utilities: 80% coverage minimum
- Type inference: Tested with `expectTypeOf` assertions

### Commands
```bash
npm test                  # Run all tests
npm test -- --coverage    # With coverage report
npm test -- --watch       # Watch mode during development
npm run test:types        # Type-level tests
```

## Documentation Requirements

### TSDoc on Every Public Export
```typescript
/**
 * Creates a new client instance with the given options.
 *
 * @param options - Configuration options for the client
 * @returns A configured client instance
 * @throws {ValidationError} If options are invalid
 *
 * @example
 * ```typescript
 * const client = createClient({ apiKey: 'xxx', timeout: 5000 });
 * const result = await client.query('hello');
 * ```
 */
export function createClient(options: ClientOptions): Client {
  // ...
}
```

### README Sections
- Installation instructions
- Quick start example
- API reference (link to generated docs)
- Configuration options table
- Error handling guide
- Migration guides (for major versions)

## Build Commands

```bash
npm run build             # Build for distribution (ESM + CJS)
npm run dev               # Watch mode for development
npm run lint              # Lint source code
npm run lint:fix          # Auto-fix lint issues
npm run typecheck         # TypeScript type checking
npm run docs              # Generate API documentation
npm run prepublishOnly    # Pre-publish checks (lint + test + build)
```

## Package.json Fields

```jsonc
{
  "name": "@scope/package-name",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist", "README.md", "CHANGELOG.md"],
  "sideEffects": false
}
```

## Important Notes

- Always run the full test suite before publishing
- Never publish with `--force` or `--no-git-checks`
- Keep `files` field in package.json minimal (only ship dist/)
- Test the package locally with `npm link` before publishing
- Peer dependencies should use wide version ranges (`>=17.0.0`)
- Bundle size matters: use `bundlephobia` to check before release
