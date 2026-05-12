---
task: Publish Squad
responsavel: "@squad-creator"
responsavel_type: agent
atomic_layer: task
status: active
sprint: 8
story: SQS-6
Entrada: |
  - squad_path: Caminho do squad para publicar (obrigatório)
  - dry_run: Flag para simular sem criar PR (--dry-run)
  - category: Categoria do squad (community | official)
Saida: |
  - pr_url: URL do Pull Request criado
  - branch: Nome do branch criado
  - validation_result: Resultado da validação pré-publish
Checklist:
  - "[ ] Validar squad (deve passar sem errors)"
  - "[ ] Verificar autenticação GitHub"
  - "[ ] Verificar se squad já existe no registry"
  - "[ ] Criar branch no fork/clone"
  - "[ ] Copiar arquivos do squad"
  - "[ ] Atualizar registry.json"
  - "[ ] Criar Pull Request"
  - "[ ] Exibir URL do PR"
---

# *publish-squad

Publishes a local squad to the aiox-squads GitHub repository via Pull Request.

## Prerequisites

- GitHub CLI installed and authenticated: `gh auth login`
- Squad must pass validation with no errors
- Squad must have required manifest fields (name, version)

## Usage

```bash
@squad-creator

# Publish squad (creates PR)
*publish-squad ./squads/my-squad

# Preview without creating PR
*publish-squad ./squads/my-squad --dry-run

# Verbose output
*publish-squad ./squads/my-squad --verbose
```

## Examples

### Dry Run (Preview)

```
*publish-squad ./squads/my-squad --dry-run

[SquadPublisher] Dry run mode

Squad: my-squad
Version: 1.0.0
Author: developer-name

PR Preview:
  Title: Add squad: my-squad
  Branch: squad/my-squad
  Target: SynkraAI/aiox-squads

Components:
  - Tasks: 5
  - Agents: 2
  - Workflows: 1

✓ Validation passed
✓ Ready to publish

Run without --dry-run to create the actual PR.
```

### Publish (Create PR)

```
*publish-squad ./squads/my-squad

Publishing: my-squad@1.0.0
  Source: ./squads/my-squad/
  Target: github.com/SynkraAI/aiox-squads

✓ Validated successfully
✓ GitHub auth verified (user: your-username)
✓ Fork ready
✓ Files copied to packages/my-squad/
✓ registry.json updated
✓ Committed changes
✓ Pushed to fork

Pull Request Created!
  URL: https://github.com/SynkraAI/aiox-squads/pull/42
  Branch: squad/my-squad

Next steps:
  1. Review the PR: gh pr view 42
  2. Wait for maintainer review
  3. Address any feedback
```

## Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview publish without creating PR |
| `--verbose` | Show detailed progress |
| `--category` | Squad category (default: community) |

## Workflow

```
1. Validate squad
   ├── Run SquadValidator
   └── Must pass with 0 errors

2. Load manifest
   ├── Extract name, version, author
   └── Extract components list

3. Check GitHub auth
   └── Verify gh auth status

4. Create/check fork
   └── Fork SynkraAI/aiox-squads if needed

5. Clone fork to temp directory
   └── Shallow clone for speed

6. Create branch
   └── squad/{squad-name}

7. Copy squad files
   └── To packages/{squad-name}/

8. Update registry.json
   ├── Add to community section
   └── Sort alphabetically

9. Commit and push
   └── Include metadata in commit message

10. Create PR
    ├── Generate PR body from manifest
    └── Target main branch

11. Cleanup
    └── Remove temp directory
```

## PR Body Template

The generated PR body includes:

```markdown
## New Squad: {name}

**Version:** {version}
**Author:** {author}
**Category:** community
**Description:** {description}

### Components

| Type | Count |
|------|-------|
| Tasks | {n} |
| Agents | {n} |
| Workflows | {n} |

### Pre-submission Checklist

- [x] Squad follows AIOX task-first architecture
- [x] Documentation is complete
- [x] Squad validated locally
- [ ] No sensitive data included
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `AUTH_REQUIRED` | Not authenticated | Run `gh auth login` |
| `VALIDATION_FAILED` | Squad has errors | Fix errors with `*validate-squad` |
| `SQUAD_NOT_FOUND` | Invalid path | Check squad path exists |
| `MANIFEST_ERROR` | Missing name/version | Update squad.yaml |
| `PR_ERROR` | GitHub CLI error | Check `gh` is working |

## Requirements

### Manifest Fields

Required for publishing:
```yaml
# squad.yaml
name: my-squad          # Required
version: 1.0.0          # Required
description: "..."      # Recommended
author: your-name       # Recommended
```

### Validation Rules

Squad must pass validation:
- Valid squad.yaml with required fields
- Task files in tasks/ directory
- No critical errors

## Implementation

Uses `SquadPublisher` class from:
- `.aiox-core/development/scripts/squad/squad-publisher.js`

## Related Tasks

- `*validate-squad` - Validate before publishing
- `*download-squad` - Download published squads
- `*create-squad` - Create new local squad

## Related Story

- **SQS-6:** Download & Publish Tasks (Sprint 8)
