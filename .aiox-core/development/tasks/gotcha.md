# Task: Add Gotcha

> **Command:** `*gotcha {title} - {description}`
> **Agent:** @dev
> **Story:** 9.4 - Gotchas Memory
> **AC:** AC5

---

## Purpose

Add a gotcha (known issue/workaround) manually to the project's gotchas memory.

---

## Usage

```bash
*gotcha {title}
*gotcha {title} - {description}
*gotcha {title} --category {category} --severity {severity}
```

### Arguments

| Argument    | Required | Description                        |
| ----------- | -------- | ---------------------------------- |
| title       | Yes      | Short title for the gotcha         |
| description | No       | Detailed description (after " - ") |

### Options

| Option       | Default | Description                                                 |
| ------------ | ------- | ----------------------------------------------------------- |
| --category   | auto    | Category: build, test, lint, runtime, integration, security |
| --severity   | warning | Severity: info, warning, critical                           |
| --workaround | -       | Solution or workaround text                                 |
| --files      | -       | Comma-separated list of related files                       |

---

## Workflow

```yaml
steps:
  - name: Parse Input
    action: |
      1. Extract title from input
      2. Extract description if provided (after " - ")
      3. Parse any flags (--category, --severity, etc.)
    validates:
      - Title is not empty

  - name: Auto-detect Category
    action: |
      If category not provided, analyze title and description
      to detect category based on keywords:
      - build: build, compile, webpack, vite, etc.
      - test: test, jest, vitest, mock, etc.
      - lint: lint, eslint, prettier, etc.
      - runtime: TypeError, null, undefined, crash, etc.
      - integration: api, http, database, etc.
      - security: xss, csrf, auth, etc.

  - name: Create Gotcha
    action: |
      Use GotchasMemory.addGotcha() to create:
      {
        title: parsed title,
        description: parsed description,
        category: detected or provided,
        severity: provided or "warning",
        workaround: provided or null,
        relatedFiles: provided or []
      }

  - name: Confirm Creation
    action: |
      Display:
      - Gotcha ID
      - Title
      - Category (detected or provided)
      - Severity
```

---

## Output Example

```
Added gotcha: gotcha-lxyz123-abc456

  Title: Always check fetch response.ok
  Category: integration (auto-detected)
  Severity: warning

  This gotcha will be shown when working on related tasks.
```

---

## Examples

```bash
# Simple
*gotcha Always check fetch response.ok

# With description
*gotcha Zustand persist needs type annotation - Without explicit type, TypeScript cannot infer store type

# With all options
*gotcha Protected files need full read --category build --severity critical --workaround "Read without limit/offset"

# With related files
*gotcha API endpoint CORS issue --files "src/api/client.ts,src/lib/fetch.ts"
```

---

## Integration

- **Uses:** `GotchasMemory.addGotcha()`
- **Script:** `.aiox-core/core/memory/gotchas-memory.js`
- **Outputs:** `.aiox/gotchas.json`, `.aiox/gotchas.md`

---

## Related Commands

- `*gotchas` - List all gotchas
- `*gotcha-context` - Get relevant gotchas for current task
- `*list-gotchas` - Legacy command (same as \*gotchas)

---

_Task file for Story 9.4 - Gotchas Memory_
