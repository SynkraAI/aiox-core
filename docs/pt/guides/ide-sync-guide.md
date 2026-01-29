<!--
  Tradução: PT-BR
  Original: /docs/guides/ide-sync-guide.md
  Última sincronização: 2026-01-29
-->

# Guia de Sincronização de IDE

Sincronize agentes, tasks, workflows e checklists do AIOS entre múltiplas configurações de IDE.

## Visão Geral

A task `*command` automatiza a sincronização de componentes do AIOS para todos os diretórios de IDE configurados (`.claude/`, `.cursor/`, `.gemini/`, etc.), eliminando operações manuais de cópia.

## Início Rápido

### 1. Configurar

Copie o template para a raiz do seu projeto:

```bash
cp .aios-core/infrastructure/templates/aios-sync.yaml.template .aios-sync.yaml
```

### 2. Configurar IDEs

Edite `.aios-sync.yaml` para habilitar suas IDEs:

```yaml
active_ides:
  - claude # Claude Code (.claude/commands/)
  - cursor # Cursor IDE (.cursor/rules/)
  # - gemini    # Google Gemini (.gemini/)
```

### 3. Adicionar Aliases de Pack

Mapeie seus diretórios de squad para prefixos de comando:

```yaml
pack_aliases:
  legal: Legal # squads/legal/ → .claude/commands/Legal/
  copy: Copy # squads/copy/ → .claude/commands/Copy/
  hr: HR # squads/hr/ → .claude/commands/HR/
```

## Uso

### Sincronizar Componentes Individuais

```bash
# Sincronizar um agente específico
*command agent legal-chief

# Sincronizar uma task específica
*command task revisar-contrato

# Sincronizar um workflow específico
*command workflow contract-review
```

### Sincronizar Squad Inteiro

```bash
# Sincronizar todos os componentes de um squad
*command squad legal
```

### Sincronizar Todos os Squads

```bash
# Sincronizar tudo
*command sync-all
```

## Como Funciona

```
squads/legal/agents/legal-chief.md
         │
         ▼
┌─────────────────────────────────────────────────────┐
│                 *command sync                        │
│                                                      │
│  1. Ler configuração .aios-sync.yaml                 │
│  2. Verificar se componente existe em squads/        │
│  3. Aplicar transformações de wrapper (se necessário)│
│  4. Copiar para cada destino de IDE ativo            │
│  5. Validar arquivos sincronizados                   │
│  6. Registrar operações no log                       │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────┐
│  .claude/commands/Legal/agents/legal-chief.md        │
│  .cursor/rules/legal-chief.mdc                       │
│  .gemini/agents/legal-chief.md                       │
└──────────────────────────────────────────────────────┘
```

## Mapeamentos de Sincronização

Mapeamentos padrão para tipos de componentes:

| Tipo de Componente | Claude | Cursor | Gemini | Windsurf |
| ------------------ | ------ | ------ | ------ | -------- |
| Agents             | ✅     | ✅     | ✅     | ✅       |
| Tasks              | ✅     | -      | -      | -        |
| Workflows          | ✅     | ✅     | -      | -        |
| Checklists         | ✅     | -      | -      | -        |
| Data               | ✅     | -      | -      | -        |

## Wrappers

Diferentes IDEs requerem diferentes formatos:

### Claude (Markdown)

Nenhuma transformação necessária - arquivos são copiados como estão.

### Cursor (MDC)

Arquivos são envolvidos com frontmatter:

```yaml
---
description: { extraído do agente }
globs: []
alwaysApply: false
---
{ conteúdo original }
```

## Estrutura de Diretórios

```
seu-projeto/
├── .aios-sync.yaml           # Configuração de sincronização
├── squads/                   # Fonte da verdade
│   └── legal/
│       ├── config.yaml
│       ├── agents/
│       ├── tasks/
│       └── checklists/
├── .claude/
│   └── commands/
│       └── Legal/           # Sincronizado automaticamente
│           ├── agents/
│           ├── tasks/
│           └── checklists/
├── .cursor/
│   └── rules/               # Sincronizado automaticamente (formato MDC)
└── .gemini/
    └── agents/              # Sincronizado automaticamente
```

## Melhores Práticas

1. **Nunca edite `.claude/commands/` diretamente** - Sempre edite em `squads/` e sincronize
2. **Use nomes descritivos** - Nomes de agentes se tornam comandos slash
3. **Mantenha config.yaml atualizado** - Necessário para sincronização correta
4. **Execute sync após alterações** - Garanta que todas as IDEs permaneçam sincronizadas

## Solução de Problemas

### Componente Não Encontrado

```
Erro: Componente 'my-agent' não encontrado em squads/
```

**Solução**: Verifique se o agente existe em `squads/*/agents/my-agent.md`

### Alias de Pack Ausente

```
Aviso: Nenhum alias de pack para 'new-squad'
```

**Solução**: Adicione o alias em `.aios-sync.yaml`:

```yaml
pack_aliases:
  new-squad: NewSquad
```

### IDE Não Sincronizando

Verifique se a IDE está habilitada na seção `active_ides`.

## Relacionados

- [Visão Geral de Squads](./squads-overview.md)
- [Referência de Agentes](../agent-reference-guide.md)
- [Arquitetura AIOS](../core-architecture.md)
