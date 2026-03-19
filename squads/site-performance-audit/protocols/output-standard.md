# Output Standard — site-performance-audit

## Purpose

Define o padrao canonico de nomenclatura, local de salvamento e indexacao
para todos os outputs gerados pelo squad site-performance-audit.

## Path Pattern

```
docs/outputs/squads/site-performance-audit/{YYYY-MM-DD}-{HHmm}-{command}-{id}.{ext}
```

### Components

| Component | Format | Example |
|-----------|--------|---------|
| `YYYY-MM-DD` | ISO date | `2026-03-07` |
| `HHmm` | 24h timestamp curto | `1430` (14:30) |
| `command` | Nome do comando sem `*` | `audit`, `quick-audit`, `benchmark` |
| `id` | Identificador sanitizado (ver regras) | `ideiadecor-com-br` |
| `ext` | Formato do arquivo | `md`, `yaml`, `json` |

### Full Example

```
*audit ideiadecor.com.br  (executado em 2026-03-07 14:30)
  -> docs/outputs/squads/site-performance-audit/2026-03-07-1430-audit-ideiadecor-com-br.md
```

## ID Sanitization Rules

### Rule 1: URLs

Strip protocol and trailing slash, replace `.` and `/` with `-`, remove trailing `-`.

| Input | Sanitized ID |
|-------|-------------|
| `https://ideiadecor.com.br` | `ideiadecor-com-br` |
| `https://ideiadecor.com.br/loja` | `ideiadecor-com-br-loja` |
| `http://www.example.com/` | `www-example-com` |
| `https://store.example.com/products/shoes` | `store-example-com-products-shoes` |

Steps:
1. Remove `https://` or `http://`
2. Remove trailing `/`
3. Replace all `.` with `-`
4. Replace all `/` with `-`
5. Remove trailing `-` if any
6. Lowercase everything

### Rule 2: Names (clients, companies)

Lowercase, spaces become `-`, remove special characters.

| Input | Sanitized ID |
|-------|-------------|
| `Ideia Decor` | `ideia-decor` |
| `Loja do Joao` | `loja-do-joao` |
| `O'Brien & Co.` | `obrien-co` |

Steps:
1. Lowercase
2. Replace spaces with `-`
3. Remove `'`, `"`, `&`, `.`, `,`, `;`, `(`, `)`, `!`, `?`
4. Collapse multiple `-` into single `-`
5. Remove leading/trailing `-`

### Rule 3: Max Length

- Max 60 characters for the `{id}` portion
- If exceeds, truncate at last `-` boundary before 60 chars
- Example: `very-long-subdomain-example-website-com-some-really-deep-path-to-page` -> `very-long-subdomain-example-website-com-some-really-deep`

### Rule 4: Reserved Characters

These characters are NEVER allowed in `{id}`:
`/ \ : * ? " < > | # % & { } $ ! @ + =`

## Output Format by Command

| Command | Default ext | Content |
|---------|------------|---------|
| `*audit` | `.md` | Full audit report (Markdown) |
| `*quick-audit` | `.md` | CWV report card + top issues |
| `*benchmark` | `.md` | Competitive comparison matrix |
| `*diagnose` | `.md` | Deep CWV metric analysis |
| `*hypotheses` | `.md` | Prioritized hypothesis matrix |
| `*resources` | `.md` | Resource analysis report |

## Index File

Location: `docs/outputs/squads/site-performance-audit/_index.yaml`

Auto-updated on every `*save`. See `templates/output-index-tmpl.yaml` for schema.

## Save Flow

```
1. Agent executes command (*audit, *quick-audit, etc.)
2. Report is generated and displayed on screen
3. Agent asks: "Save report? (*save)"
4. User types: *save
5. Agent:
   a. Generates filename using this standard
   b. Ensures output directory exists
   c. Writes report file
   d. Updates _index.yaml
   e. Confirms with full path
```

## Directory Structure

```
docs/outputs/squads/site-performance-audit/
  _index.yaml
  2026-03-07-1430-audit-ideiadecor-com-br.md
  2026-03-07-1545-quick-audit-example-com.md
  2026-03-08-0900-benchmark-ideiadecor-com-br.md
```
