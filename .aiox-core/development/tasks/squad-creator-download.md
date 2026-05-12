---
task: Download Squad
responsavel: "@squad-creator"
responsavel_type: agent
atomic_layer: task
status: active
sprint: 8
story: SQS-6
Entrada: |
  - squad_name: Nome do squad para baixar (obrigatório)
  - version: Versão específica (opcional, default: latest)
  - list: Flag para listar squads disponíveis (--list)
  - overwrite: Flag para sobrescrever squad existente (--overwrite)
Saida: |
  - squad_path: Caminho do squad baixado
  - manifest: Manifest do squad
  - validation_result: Resultado da validação
Checklist:
  - "[ ] Verificar se já existe localmente"
  - "[ ] Buscar no registry.json"
  - "[ ] Baixar arquivos do GitHub"
  - "[ ] Extrair para ./squads/{name}/"
  - "[ ] Validar squad baixado"
  - "[ ] Exibir próximos passos"
---

# *download-squad

Downloads public squads from the aiox-squads GitHub repository to use in your project.

## Usage

```bash
@squad-creator

# List available squads
*download-squad --list

# Download a squad
*download-squad etl-squad

# Download specific version
*download-squad etl-squad@2.0.0

# Overwrite existing
*download-squad etl-squad --overwrite
```

## Examples

### List Available Squads

```
*download-squad --list

Available Squads (from aiox-squads):

Official:
  ├── etl-squad@1.0.0 - ETL pipeline automation
  ├── api-squad@1.2.0 - REST API development
  └── devops-squad@1.0.0 - CI/CD automation

Community:
  ├── data-viz-squad@0.5.0 - Data visualization
  └── ml-squad@0.3.0 - Machine learning pipelines
```

### Download Squad

```
*download-squad etl-squad

Downloading: etl-squad@1.0.0
  Source: github.com/SynkraAI/aiox-squads/packages/etl-squad
  Target: ./squads/etl-squad/

✓ Downloaded 12 files
✓ Validated successfully

Squad installed! Next steps:
  1. Review: cat squads/etl-squad/squad.yaml
  2. Activate: @squad-creator *activate etl-squad
```

## Options

| Option | Description |
|--------|-------------|
| `--list` | List all available squads from registry |
| `--version` | Download specific version (e.g., @2.0.0) |
| `--overwrite` | Overwrite if squad already exists locally |
| `--verbose` | Show detailed download progress |

## How It Works

```
1. Fetch registry.json from aiox-squads
   ├── Contains official and community squads
   └── Includes version and metadata

2. Find requested squad
   ├── Search official squads first
   └── Then community squads

3. Download via GitHub API
   ├── Get directory listing
   └── Download each file recursively

4. Validate downloaded squad
   ├── Run SquadValidator
   └── Report warnings/errors

5. Load manifest
   └── Confirm installation
```

## Registry Structure

The registry.json in aiox-squads contains:

```json
{
  "version": "1.0.0",
  "squads": {
    "official": [
      {
        "name": "etl-squad",
        "version": "1.0.0",
        "description": "ETL pipeline automation",
        "author": "SynkraAI"
      }
    ],
    "community": [
      {
        "name": "data-viz-squad",
        "version": "0.5.0",
        "description": "Data visualization",
        "author": "community-member"
      }
    ]
  }
}
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `SQUAD_NOT_FOUND` | Squad not in registry | Check available squads with --list |
| `SQUAD_EXISTS` | Already downloaded | Use --overwrite flag |
| `REGISTRY_FETCH_ERROR` | Network issue | Check connection |
| `RATE_LIMIT` | GitHub API limit | Set GITHUB_TOKEN env var |

## Implementation

Uses `SquadDownloader` class from:
- `.aiox-core/development/scripts/squad/squad-downloader.js`

## Related Tasks

- `*validate-squad` - Validate downloaded squad
- `*publish-squad` - Publish your squad to registry
- `*create-squad` - Create new local squad

## Related Story

- **SQS-6:** Download & Publish Tasks (Sprint 8)
