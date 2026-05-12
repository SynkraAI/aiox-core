# Task: List Gotchas

> **Command:** `*gotchas [options]`
> **Agent:** @dev
> **Story:** 9.4 - Gotchas Memory
> **AC:** AC6

---

## Purpose

List and search known gotchas (issues and workarounds) from the project's gotchas memory.

---

## Usage

```bash
*gotchas
*gotchas --category {category}
*gotchas --severity {severity}
*gotchas --unresolved
*gotchas search {query}
```

### Options

| Option         | Default | Description                                  |
| -------------- | ------- | -------------------------------------------- |
| --category     | all     | Filter by category                           |
| --severity     | all     | Filter by severity (info, warning, critical) |
| --unresolved   | false   | Show only unresolved gotchas                 |
| --stats        | false   | Show statistics only                         |
| search {query} | -       | Search gotchas by keyword                    |

---

## Workflow

```yaml
steps:
  - name: Load Gotchas
    action: |
      Load gotchas from .aiox/gotchas.json via GotchasMemory

  - name: Apply Filters
    action: |
      If --category: filter by category
      If --severity: filter by severity
      If --unresolved: filter out resolved gotchas
      If search: filter by keyword match

  - name: Display Results
    action: |
      For each gotcha, show:
      - [SEVERITY] Title
      - Category
      - Description (truncated)
      - Workaround (if exists)
      - Related files (if any)
      - Status (resolved/unresolved)

      If --stats:
        Show statistics instead of full list
```

---

## Output Example

### Default List

```
=== Gotchas (12 total, 10 unresolved) ===

[CRITICAL] Protected files require full read
  Category: build
  Hook de read-protection bloqueia partial reads. Sempre usar Read sem limit/offset.
  Workaround: Ler arquivo completo, depois filtrar no código
  Files: **/CLAUDE.md, **/agents/*.md

[WARNING] Zustand persist needs type annotation
  Category: runtime
  Without explicit type parameter and extra parentheses, TypeScript cannot infer...
  Files: src/stores/*.ts

[INFO] React useEffect cleanup for async operations
  Category: runtime
  Without cleanup, race conditions can occur when component unmounts...

---
Total: 12 | Critical: 1 | Warning: 8 | Info: 3
```

### With --stats

```
=== Gotchas Statistics ===

Total: 12
  - Unresolved: 10
  - Resolved: 2

By Category:
  - build: 3
  - test: 2
  - lint: 1
  - runtime: 4
  - integration: 1
  - security: 1

By Severity:
  - critical: 1
  - warning: 8
  - info: 3

By Source:
  - manual: 5
  - auto_detected: 7
```

---

## Categories

| Category    | Description          | Keywords                      |
| ----------- | -------------------- | ----------------------------- |
| build       | Build/compile issues | webpack, vite, tsc, bundle    |
| test        | Testing issues       | jest, vitest, mock, coverage  |
| lint        | Linting/formatting   | eslint, prettier, stylelint   |
| runtime     | Runtime errors       | TypeError, null, undefined    |
| integration | API/DB issues        | fetch, cors, postgres, prisma |
| security    | Security issues      | xss, csrf, auth, injection    |

---

## Integration

- **Uses:** `GotchasMemory.listGotchas()`, `GotchasMemory.search()`
- **Script:** `.aiox-core/core/memory/gotchas-memory.js`
- **Source:** `.aiox/gotchas.json`

---

## Related Commands

- `*gotcha {title}` - Add a new gotcha
- `*gotcha-context` - Get relevant gotchas for current task
- `*list-gotchas` - Legacy alias for this command

---

_Task file for Story 9.4 - Gotchas Memory_
