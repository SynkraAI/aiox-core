---
task: Sync Command to IDE Configurations
responsavel: "@squad-creator"
responsavel_type: agent
atomic_layer: task
status: active
sprint: 9
story: SQC-12
version: 1.0.0
Entrada: |
  - type: agent | task | workflow | squad (obrigatório)
  - name: Nome do componente para sincronizar (obrigatório)
  - ides: Lista de IDEs alvo (opcional, default: todas ativas)
  - dry_run: Preview sem sincronizar (--dry-run)
  - force: Sobrescrever existentes (--force)
Saida: |
  - sync_results: Mapa de resultados por IDE
  - files_created: Lista de arquivos criados
  - files_updated: Lista de arquivos atualizados
  - files_skipped: Lista de arquivos pulados
Checklist:
  - "[x] Carregar .aios-sync.yaml"
  - "[x] Localizar arquivo fonte em squads/"
  - "[x] Verificar arquivos existentes nos destinos"
  - "[x] Sincronizar para cada IDE ativa"
  - "[x] Validar arquivos criados"
---

# *command

Sincroniza agents, tasks, workflows ou squads inteiros para todas as configurações de IDE configuradas no projeto.

## Uso

```bash
# Sincronizar um agent específico
*command agent legal-chief

# Sincronizar uma task
*command task revisar-contrato

# Sincronizar um workflow
*command workflow legal-workflow

# Sincronizar squad inteiro (todos os componentes)
*command squad legal

# Preview sem executar
*command agent legal-chief --dry-run

# Forçar sobrescrita
*command squad legal --force
```

## Output Exemplo

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *command squad legal
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Loading sync configuration...
   Active IDEs: claude, cursor
   Pack alias: legal → Legal

📦 Syncing squad: {your-squad}

Step 1: Locating source files
   ✓ squads/{your-squad}/config.yaml
   ✓ Found 3 agents
   ✓ Found 5 tasks
   ✓ Found 2 checklists
   ✓ Found 1 data file

Step 2: Syncing to Claude Code
   ✓ .claude/commands/MySquad/agents/main-agent.md
   ✓ .claude/commands/MySquad/agents/assistant.md
   ✓ .claude/commands/MySquad/agents/reviewer.md
   ✓ .claude/commands/MySquad/tasks/main-task.md
   ✓ .claude/commands/MySquad/tasks/review-task.md
   ... (4 tasks, 6 checklists, 1 data)

Step 3: Syncing to Cursor
   ✓ .cursor/rules/legal-chief.mdc
   ✓ .cursor/rules/brad-feld.mdc
   ... (8 agents converted to MDC)

Step 4: Validation
   ✓ All files validated

═══════════════════════════════════════════════
✅ SYNC COMPLETE
═══════════════════════════════════════════════

Summary:
  Files created:  19
  Files updated:  0
  Files skipped:  0
  IDEs synced:    2

🚀 Commands available:
   /Legal:agents:legal-chief (Claude Code)
   @legal-chief (Cursor rule)
```

## Configuração

### .aios-sync.yaml

O sistema usa `.aios-sync.yaml` na raiz do projeto para configuração:

```yaml
# IDEs ativas para sincronização
active_ides:
  - claude    # .claude/commands/
  - cursor    # .cursor/rules/
  # - windsurf  # .windsurf/ (descomentar para ativar)
  # - gemini    # .gemini/

# Mapeamento de diretório → prefixo de comando
pack_aliases:
  legal: Legal
  copy: Copy
  hr: HR
  data: Data

# Mapeamentos de sincronização
sync_mappings:
  squad_agents:
    source: "squads/*/agents/"
    destinations:
      claude:
        - path: ".claude/commands/{pack}/agents/"
          format: "md"
      cursor:
        - path: ".cursor/rules/"
          format: "mdc"
          wrapper: "cursor-rule"
```

### Pack Aliases

O `pack_aliases` mapeia o nome do diretório do squad para o prefixo usado nos comandos:

| Diretório | Alias | Comando Claude |
|-----------|-------|----------------|
| `squads/{your-squad}/` | `MySquad` | `/MySquad:agents:main-agent` |
| `squads/another-squad/` | `AnotherSquad` | `/AnotherSquad:agents:chief` |
| `squads/squad-creator/` | `SquadCreator` | `/SquadCreator:agents:squad-architect` |

## Workflow Interno

```
┌──────────────────────────────────────────────────┐
│                  *command                         │
├──────────────────────────────────────────────────┤
│                                                   │
│  1. Parse type + name                             │
│     ↓                                             │
│  2. Load .aios-sync.yaml                          │
│     ↓ (not found → create default)                │
│  3. Resolve pack alias                            │
│     ↓                                             │
│  4. Locate source files in squads/                │
│     ↓ (not found → error)                         │
│  5. Check existing files in destinations          │
│     ↓ (exists + no --force → ask)                 │
│  6. For each active IDE:                          │
│     │                                             │
│     ├── Claude: Copy MD → .claude/commands/       │
│     ├── Cursor: Convert MD → MDC                  │
│     ├── Gemini: Copy MD → .gemini/agents/         │
│     └── Windsurf: Copy MD → .windsurf/            │
│     ↓                                             │
│  7. Validate created files                        │
│     ↓                                             │
│  8. Log to .aios-sync.log                         │
│     ↓                                             │
│  9. Display summary                               │
│                                                   │
└──────────────────────────────────────────────────┘
```

## Conversão de Formatos

### MD → MDC (Cursor)

Cursor usa formato MDC com frontmatter YAML:

**Entrada (MD):**
```markdown
# legal-chief

ACTIVATION-NOTICE: This file contains...

## COMPLETE AGENT DEFINITION
...
```

**Saída (MDC):**
```markdown
---
description: Diretor Jurídico & Orquestrador de Especialistas
globs: []
alwaysApply: false
---

# legal-chief

ACTIVATION-NOTICE: This file contains...
...
```

### Extração de Description

A description é extraída de:
1. Campo `whenToUse` no YAML do agent
2. Primeiro parágrafo após o título
3. Campo `title` se disponível

## Flags

| Flag | Descrição | Default |
|------|-----------|---------|
| `--dry-run` | Preview sem criar arquivos | false |
| `--force` | Sobrescrever arquivos existentes | false |
| `--verbose` | Output detalhado | false |
| `--ide=X` | Sincronizar apenas para IDE específica | todas |
| `--no-validate` | Pular validação pós-sync | false |

## Tipos de Componentes

### Agent (`*command agent {name}`)

Sincroniza um arquivo de agent:
- Source: `squads/{squad}/agents/{name}.md`
- Claude: `.claude/commands/{Pack}/agents/{name}.md`
- Cursor: `.cursor/rules/{name}.mdc`

### Task (`*command task {name}`)

Sincroniza um arquivo de task:
- Source: `squads/{squad}/tasks/{name}.md`
- Claude: `.claude/commands/{Pack}/tasks/{name}.md`

### Workflow (`*command workflow {name}`)

Sincroniza um arquivo de workflow:
- Source: `squads/{squad}/workflows/{name}.yaml`
- Claude: `.claude/commands/{Pack}/workflows/{name}.yaml`

### Squad (`*command squad {name}`)

Sincroniza TODOS os componentes de um squad:
- Agents (todos em `agents/`)
- Tasks (todos em `tasks/`)
- Workflows (todos em `workflows/`)
- Checklists (todos em `checklists/`)
- Data (todos em `data/`)
- Templates (todos em `templates/`)

## Error Handling

| Error | Causa | Solução |
|-------|-------|---------|
| `Source not found` | Arquivo não existe em squads/ | Verifique o nome e tipo |
| `Pack alias not found` | Squad não está em pack_aliases | Adicione ao .aios-sync.yaml |
| `File exists` | Destino já existe | Use --force ou escolha ação |
| `IDE not active` | IDE não está em active_ides | Ative no .aios-sync.yaml |
| `Invalid YAML` | Arquivo fonte com YAML inválido | Corrija o arquivo fonte |

## Implementation Guide

### Para Execução pelo Agent

```javascript
// 1. Parse argumentos
const [type, name] = args;
const flags = parseFlags(args);

// 2. Validar tipo
const validTypes = ['agent', 'task', 'workflow', 'squad'];
if (!validTypes.includes(type)) {
  error(`Invalid type: ${type}. Use: ${validTypes.join(', ')}`);
  return;
}

// 3. Carregar configuração
const syncConfig = loadYaml('.aios-sync.yaml');
const activeIdes = syncConfig.active_ides || ['claude'];
const packAliases = syncConfig.pack_aliases || {};

// 4. Localizar source
let sourceFiles = [];
if (type === 'squad') {
  // Listar todos os componentes do squad
  sourceFiles = findAllSquadFiles(`squads/${name}/`);
} else {
  // Localizar arquivo específico
  const sourceFile = findSourceFile(type, name);
  if (!sourceFile) {
    error(`Source not found: ${name}`);
    return;
  }
  sourceFiles = [sourceFile];
}

// 5. Determinar pack alias
const squadName = extractSquadName(sourceFiles[0]);
const packAlias = packAliases[squadName] || capitalize(squadName);

// 6. Verificar existentes
for (const file of sourceFiles) {
  for (const ide of activeIdes) {
    const destPath = getDestPath(ide, packAlias, file);
    if (fs.existsSync(destPath) && !flags.force) {
      const action = await askUser(`${destPath} exists. Overwrite?`);
      if (action === 'skip') continue;
    }
  }
}

// 7. Dry run check
if (flags.dryRun) {
  output('DRY RUN - Would sync:');
  for (const file of sourceFiles) {
    for (const ide of activeIdes) {
      output(`  ${file} → ${getDestPath(ide, packAlias, file)}`);
    }
  }
  return;
}

// 8. Executar sync
const results = { created: 0, updated: 0, skipped: 0 };

for (const file of sourceFiles) {
  for (const ide of activeIdes) {
    const destPath = getDestPath(ide, packAlias, file);
    const content = fs.readFileSync(file, 'utf8');
    const converted = convertForIde(ide, content);

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, converted);

    results.created++;
    output(`✓ ${destPath}`);
  }
}

// 9. Validar
if (!flags.noValidate) {
  validateSyncedFiles(sourceFiles, activeIdes, packAlias);
}

// 10. Log
if (syncConfig.behavior?.log_sync_operations) {
  appendLog('.aios-sync.log', {
    timestamp: new Date().toISOString(),
    type,
    name,
    results
  });
}

// 11. Summary
output(`
═══════════════════════════════════════════════
✅ SYNC COMPLETE
═══════════════════════════════════════════════

Summary:
  Files created:  ${results.created}
  Files updated:  ${results.updated}
  Files skipped:  ${results.skipped}
  IDEs synced:    ${activeIdes.length}
`);
```

## Related Tasks

- `*create-squad` - Criar novo squad
- `*validate-squad` - Validar estrutura do squad
- `*install-commands` - Instalar commands (versão anterior)
- `*sync-squad-synkra` - Sincronizar para Synkra marketplace

## Changelog

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-01-27 | Full implementation with multi-IDE support |
| 0.1.0 | 2026-01-27 | Initial spec |
