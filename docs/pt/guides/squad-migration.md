<!--
  Tradução: PT-BR
  Original: /docs/en/guides/squad-migration.md
  Última sincronização: 2026-01-26
-->

# Guia de Migração de Squad

> 🌐 [EN](../../guides/squad-migration.md) | **PT** | [ES](../../es/guides/squad-migration.md)

---

Como migrar squads legados para o formato AIOX 2.1.

## Visão Geral

AIOX 2.1 introduziu um novo formato de squad com:

- Arquitetura task-first
- Validação JSON Schema
- Distribuição em três níveis
- Manifesto padronizado (`squad.yaml`)

Squads legados usando `config.yaml` ou formatos mais antigos precisam de migração.

## Detectando Squads Legados

### Sinais de Formato Legado

| Indicador            | Legado        | Atual (2.1+)               |
| -------------------- | ------------- | -------------------------- |
| Arquivo de manifesto | `config.yaml` | `squad.yaml`               |
| Campo AIOX type      | Ausente       | `aiox.type: squad`         |
| Versão mínima        | Ausente       | `aiox.minVersion: "2.1.0"` |
| Estrutura            | Agent-first   | Task-first                 |

### Comando de Verificação

```bash
@squad-creator
*validate-squad ./squads/legacy-squad
```

A saída indicará se migração é necessária:

```
⚠️ Formato legado detectado (config.yaml)
   Execute: *migrate-squad ./squads/legacy-squad
```

## Comando de Migração

### Pré-visualizar Mudanças (Recomendado Primeiro)

```bash
@squad-creator
*migrate-squad ./squads/legacy-squad --dry-run
```

Mostra o que mudará sem modificar arquivos.

### Executar Migração

```bash
*migrate-squad ./squads/legacy-squad
```

### Saída Detalhada

```bash
*migrate-squad ./squads/legacy-squad --verbose
```

Mostra progresso detalhado passo a passo.

## O Que É Migrado

### 1. Renomeação do Manifesto

```
config.yaml → squad.yaml
```

### 2. Campos Adicionados

```yaml
# Estes campos são adicionados se ausentes
aiox:
  minVersion: '2.1.0'
  type: squad
```

### 3. Normalização de Estrutura

Componentes são reorganizados na estrutura padrão:

```
Antes:
├── config.yaml
├── my-agent.yaml
└── my-task.yaml

Depois:
├── squad.yaml
├── agents/
│   └── my-agent.md
└── tasks/
    └── my-task.md
```

### 4. Conversão de Formato de Arquivo

Arquivos YAML de agent são convertidos para formato Markdown:

```yaml
# Antes: my-agent.yaml
name: my-agent
role: Helper
```

```markdown
# Depois: agents/my-agent.md

# my-agent

ACTIVATION-NOTICE: ...

\`\`\`yaml
agent:
name: my-agent
...
\`\`\`
```

## Cenários de Migração

### Cenário 1: Squad Simples (apenas config.yaml)

**Antes:**

```
my-squad/
├── config.yaml
└── README.md
```

**Comando:**

```bash
*migrate-squad ./squads/my-squad
```

**Depois:**

```
my-squad/
├── squad.yaml         # Renomeado + atualizado
├── README.md
└── .backup/           # Backup criado
    └── pre-migration-2025-12-26/
```

### Cenário 2: Squad com Agents YAML

**Antes:**

```
my-squad/
├── config.yaml
├── agent.yaml
└── task.yaml
```

**Comando:**

```bash
*migrate-squad ./squads/my-squad
```

**Depois:**

```
my-squad/
├── squad.yaml
├── agents/
│   └── agent.md       # Convertido para MD
├── tasks/
│   └── task.md        # Convertido para MD
└── .backup/
```

### Cenário 3: Migração Parcial (Já Tem Alguns Recursos 2.1)

**Antes:**

```
my-squad/
├── squad.yaml         # Já renomeado
├── agent.yaml         # Ainda formato YAML
└── tasks/
    └── task.md        # Já formato MD
```

**Comando:**

```bash
*migrate-squad ./squads/my-squad
```

**Resultado:**

- Adiciona campos `aiox` ausentes ao manifesto
- Converte arquivos YAML restantes
- Pula arquivos já migrados

## Backup & Rollback

### Backup Automático

Toda migração cria um backup:

```
.backup/
└── pre-migration-{timestamp}/
    ├── config.yaml    # Manifesto original
    ├── agent.yaml     # Arquivos originais
    └── ...
```

### Rollback Manual

```bash
# Listar backups
ls ./squads/my-squad/.backup/

# Restaurar backup específico
cp -r ./squads/my-squad/.backup/pre-migration-2025-12-26/. ./squads/my-squad/
```

### Rollback Programático

```javascript
const { SquadMigrator } = require('./.aiox-core/development/scripts/squad');

const migrator = new SquadMigrator();
await migrator.rollback('./squads/my-squad');
```

## Solução de Problemas

### "Manifesto não encontrado"

```
Error: No manifest found (config.yaml or squad.yaml)
```

**Solução:** Crie um manifesto básico:

```yaml
# squad.yaml
name: my-squad
version: 1.0.0
description: Meu squad

aiox:
  minVersion: '2.1.0'
  type: squad

components:
  agents: []
  tasks: []
```

### "Sintaxe YAML inválida"

```
Error: YAML parse error at line 15
```

**Solução:**

1. Verifique sintaxe YAML com um linter
2. Problemas comuns: tabs (use espaços), aspas faltando
3. Corrija erros, depois tente a migração novamente

### "Falha no backup"

```
Error: Could not create backup directory
```

**Solução:**

1. Verifique permissões de escrita: `chmod 755 ./squads/my-squad`
2. Verifique espaço em disco
3. Tente com sudo (se apropriado)

### "Migração incompleta"

```
Warning: Some files could not be migrated
```

**Solução:**

1. Execute com `--verbose` para ver quais arquivos falharam
2. Corrija arquivos problemáticos manualmente
3. Re-execute a migração

## Checklist Pós-Migração

Após migração, verifique:

- [ ] `squad.yaml` existe e é válido
- [ ] `aiox.type` é `"squad"`
- [ ] `aiox.minVersion` é `"2.1.0"` ou superior
- [ ] Todos os agents estão na pasta `agents/`
- [ ] Todas as tasks estão na pasta `tasks/`
- [ ] Arquivos de agent estão em formato Markdown
- [ ] Arquivos de task seguem TASK-FORMAT-SPEC-V1
- [ ] Validação passa: `*validate-squad --strict`

## Migração Programática

```javascript
const { SquadMigrator } = require('./.aiox-core/development/scripts/squad');

const migrator = new SquadMigrator({
  verbose: true,
  dryRun: false,
  backupDir: '.backup',
});

// Verificar se migração é necessária
const needsMigration = await migrator.needsMigration('./squads/my-squad');

// Executar migração
const result = await migrator.migrate('./squads/my-squad');

console.log(result);
// {
//   success: true,
//   changes: ['config.yaml → squad.yaml', ...],
//   backupPath: '.backup/pre-migration-...'
// }
```

## Recursos Relacionados

- [Guia de Desenvolvimento de Squad](./squads-guide.md)
- [Guia de Contribuição de Squads](./contributing-squads.md)
- [Agente @squad-creator](../../../.aiox-core/development/agents/squad-creator.md)

---

**Versão:** 1.0.0 | **Atualizado:** 2025-12-26 | **Story:** SQS-8
