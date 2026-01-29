<!--
  Tradução: PT-BR
  Original: /docs/guides/ade-guide.md
  Última sincronização: 2026-01-29
-->

# AIOS Autonomous Development Engine (ADE) - Guia Completo

> **Versão:** 1.0.0
> **Data:** 2026-01-29
> **Status:** Pronto para Produção

---

## O que é o ADE?

O **AIOS Autonomous Development Engine (ADE)** é um sistema de desenvolvimento autônomo que transforma requisitos vagos em código funcional através de pipelines estruturados e agentes especializados.

### Características Principais

- **Spec Pipeline** - Transforma ideias em especificações executáveis
- **Execution Engine** - Executa subtasks com self-critique obrigatório
- **Recovery System** - Recupera de falhas automaticamente
- **QA Evolution** - Review estruturado em 10 fases
- **Memory Layer** - Aprende e documenta padrões

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Arquitetura ADE                                   │
│                                                                              │
│  Requisição ──► Spec Pipeline ──► Execution Engine ──► Código Funcional     │
│                                            │                                 │
│                                            ▼                                 │
│                                    Recovery System                           │
│                                            │                                 │
│                                            ▼                                 │
│                                    QA Evolution                              │
│                                            │                                 │
│                                            ▼                                 │
│                                    Memory Layer                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Os 7 Epics

### Epic 1: Worktree Manager

**Propósito:** Isolamento de branches via Git worktrees

**Comandos (@devops):**

- `*create-worktree {story}` - Criar worktree isolado
- `*list-worktrees` - Listar worktrees ativos
- `*merge-worktree {story}` - Fazer merge do worktree
- `*cleanup-worktrees` - Remover worktrees antigos

**Documentação:** [ADE-EPIC1-HANDOFF.md](../architecture/ADE-EPIC1-HANDOFF.md)

---

### Epic 2: Migração V2→V3

**Propósito:** Migração para formato autoClaude V3

**Comandos (@devops):**

- `*inventory-assets` - Inventário de assets V2
- `*analyze-paths` - Analisar dependências
- `*migrate-agent` - Migrar agente individual
- `*migrate-batch` - Migrar todos em batch

**Documentação:** [ADE-EPIC2-HANDOFF.md](../architecture/ADE-EPIC2-HANDOFF.md)

---

### Epic 3: Spec Pipeline

**Propósito:** Transformar requisitos em specs executáveis

**Fluxo:**

```
Requisição → Coletar → Avaliar → Pesquisar → Escrever → Criticar → Spec Pronta
```

**Comandos por Agente:**

| Agente     | Comando                | Fase                   |
| ---------- | ---------------------- | ---------------------- |
| @pm        | `*gather-requirements` | Coletar requisitos     |
| @architect | `*assess-complexity`   | Avaliar complexidade   |
| @analyst   | `*research-deps`       | Pesquisar dependências |
| @pm        | `*write-spec`          | Escrever spec          |
| @qa        | `*critique-spec`       | Criticar e aprovar     |

**Documentação:** [ADE-EPIC3-HANDOFF.md](../architecture/ADE-EPIC3-HANDOFF.md)

---

### Epic 4: Execution Engine

**Propósito:** Executar specs em código funcional

**13 Passos do Coder:**

1. Carregar Contexto
2. Ler Plano de Implementação
3. Entender Subtask Atual
4. Planejar Abordagem
5. Escrever Código
   - 5.5 SELF-CRITIQUE (obrigatório)
6. Executar Testes
   - 6.5 SELF-CRITIQUE (obrigatório)
7. Corrigir Problemas
8. Executar Linter
9. Corrigir Problemas de Lint
10. Verificar Manualmente
11. Atualizar Status do Plano
12. Commitar Alterações
13. Sinalizar Conclusão

**Comandos (@architect):**

- `*create-plan` - Criar plano de implementação
- `*create-context` - Gerar contexto do projeto

**Comandos (@dev):**

- `*execute-subtask` - Executar subtask

**Documentação:** [ADE-EPIC4-HANDOFF.md](../architecture/ADE-EPIC4-HANDOFF.md)

---

### Epic 5: Recovery System

**Propósito:** Recuperar de falhas em subtasks

**Fluxo:**

```
Subtask Falha → Registrar Tentativa → Retry (<3) → Detectar Travamento → Rollback → Escalar
```

**Comandos (@dev):**

- `*track-attempt` - Registrar tentativa
- `*rollback` - Voltar para estado anterior

**Documentação:** [ADE-EPIC5-HANDOFF.md](../architecture/ADE-EPIC5-HANDOFF.md)

---

### Epic 6: QA Evolution

**Propósito:** Review estruturado em 10 fases

**10 Fases:**

1. Configuração e Carregamento de Contexto
2. Análise de Qualidade de Código
3. Review de Cobertura de Testes
4. Varredura de Segurança
5. Verificação de Performance
6. Auditoria de Documentação
7. Review de Acessibilidade
8. Verificação de Pontos de Integração
9. Casos Extremos e Tratamento de Erros
10. Resumo Final e Decisão

**Comandos (@qa):**

- `*review-build {story}` - Review completo
- `*request-fix {issue}` - Solicitar correção
- `*verify-fix {issue}` - Verificar correção

**Comandos (@dev):**

- `*apply-qa-fix` - Aplicar correção do QA

**Documentação:** [ADE-EPIC6-HANDOFF.md](../architecture/ADE-EPIC6-HANDOFF.md)

---

### Epic 7: Memory Layer

**Propósito:** Memória persistente de padrões e insights

**Tipos de Memória:**

- **Insights** - Descobertas durante desenvolvimento
- **Patterns** - Padrões de código extraídos
- **Gotchas** - Armadilhas conhecidas
- **Decisions** - Decisões arquiteturais

**Comandos (@dev):**

- `*capture-insights` - Capturar insights da sessão
- `*list-gotchas` - Listar gotchas conhecidas

**Comandos (@architect):**

- `*map-codebase` - Gerar mapa do codebase

**Comandos (@analyst):**

- `*extract-patterns` - Extrair padrões do código

**Documentação:** [ADE-EPIC7-HANDOFF.md](../architecture/ADE-EPIC7-HANDOFF.md)

---

## Início Rápido

### 1. Criar Spec a partir de Requisito

```bash
# Ativar PM e coletar requisitos
@pm *gather-requirements

# Avaliar complexidade
@architect *assess-complexity

# Pesquisar dependências
@analyst *research-deps

# Escrever spec
@pm *write-spec

# Criticar e aprovar
@qa *critique-spec
```

### 2. Executar Spec Aprovada

```bash
# Criar plano de implementação
@architect *create-plan

# Criar contexto do projeto
@architect *create-context

# Executar subtasks (loop)
@dev *execute-subtask 1.1
@dev *execute-subtask 1.2
...
```

### 3. QA Review

```bash
# Review estruturado
@qa *review-build STORY-42

# Se há issues:
@qa *request-fix "Falta tratamento de erro"
@dev *apply-qa-fix
@qa *verify-fix
```

### 4. Capturar Aprendizado

```bash
# Capturar insights da sessão
@dev *capture-insights

# Documentar gotchas
@dev *list-gotchas
```

---

## Estrutura de Arquivos

```
.aios-core/
├── development/
│   ├── agents/              # Definições de agentes V3
│   ├── tasks/               # Tasks executáveis
│   │   ├── spec-*.md        # Tasks do Spec Pipeline
│   │   ├── plan-*.md        # Tasks do Execution Engine
│   │   ├── qa-*.md          # Tasks do QA Evolution
│   │   └── capture-*.md     # Tasks do Memory Layer
│   └── workflows/
│       ├── spec-pipeline.yaml
│       ├── qa-loop.yaml
│       └── auto-worktree.yaml
│
├── infrastructure/
│   ├── scripts/
│   │   ├── worktree-manager.js     # Epic 1
│   │   ├── asset-inventory.js      # Epic 2
│   │   ├── migrate-agent.js        # Epic 2
│   │   ├── subtask-verifier.js     # Epic 4
│   │   ├── plan-tracker.js         # Epic 4
│   │   ├── recovery-tracker.js     # Epic 5
│   │   ├── rollback-manager.js     # Epic 5
│   │   ├── qa-loop-orchestrator.js # Epic 6
│   │   ├── codebase-mapper.js      # Epic 7
│   │   └── pattern-extractor.js    # Epic 7
│   └── schemas/
│       ├── agent-v3-schema.json
│       └── task-v3-schema.json
│
└── product/
    ├── templates/
    │   ├── spec-tmpl.md
    │   └── qa-report-tmpl.yaml
    └── checklists/
        └── self-critique-checklist.md
```

---

## Formato autoClaude V3

### Definição de Agente

```yaml
autoClaude:
  version: '3.0'
  migratedAt: '2026-01-29T02:24:10.724Z'

  specPipeline:
    canGather: boolean # @pm
    canAssess: boolean # @architect
    canResearch: boolean # @analyst
    canWrite: boolean # @pm
    canCritique: boolean # @qa

  execution:
    canCreatePlan: boolean # @architect
    canCreateContext: boolean # @architect
    canExecute: boolean # @dev
    canVerify: boolean # @dev

  recovery:
    canTrackAttempts: boolean # @dev
    canRollback: boolean # @dev

  qa:
    canReview: boolean # @qa
    canRequestFix: boolean # @qa

  memory:
    canCaptureInsights: boolean # @dev
    canExtractPatterns: boolean # @analyst
    canDocumentGotchas: boolean # @dev
```

### Definição de Task

```yaml
autoClaude:
  version: '3.0'
  pipelinePhase: spec-gather|spec-assess|exec-plan|exec-subtask|etc
  deterministic: boolean
  elicit: boolean
  composable: boolean

  verification:
    type: none|command|manual
    command: 'npm test'

  selfCritique:
    required: boolean
    checklistRef: 'self-critique-checklist.md'
```

---

## QA Gates

Cada Epic tem um QA Gate que deve passar antes de prosseguir:

```bash
@qa *gate epic-{N}-{name}
```

**Decisões:**

- **PASS** - Próximo epic liberado
- **CONCERNS** - Aprovado com follow-ups
- **FAIL** - Retorna para correções
- **WAIVED** - Bypass autorizado por @po

---

## Solução de Problemas

### Subtask Falha Repetidamente

```bash
# Verificar histórico de tentativas
@dev *track-attempt --status

# Rollback para último estado bom
@dev *rollback --hard

# Tentar abordagem diferente
@dev *execute-subtask 2.1 --approach alternative
```

### Spec não Aprovada

```bash
# Ver feedback do critique
cat docs/stories/STORY-42/spec-critique.json

# Refinar spec
@pm *write-spec --iterate

# Re-submeter para critique
@qa *critique-spec
```

### Conflito no Worktree

```bash
# Listar worktrees
@devops *list-worktrees

# Resolver conflitos
@devops *merge-worktree STORY-42 --resolve

# Limpeza
@devops *cleanup-worktrees
```

---

## Documentação Relacionada

- [ADE Architect Handoff](../architecture/ADE-ARCHITECT-HANDOFF.md) - Visão geral
- [ADE Agent Changes](../architecture/ADE-AGENT-CHANGES.md) - Alterações em todos os agentes com matriz de capabilities
- [Epic 1 - Worktree Manager](../architecture/ADE-EPIC1-HANDOFF.md)
- [Epic 2 - Migração V2→V3](../architecture/ADE-EPIC2-HANDOFF.md)
- [Epic 3 - Spec Pipeline](../architecture/ADE-EPIC3-HANDOFF.md)
- [Epic 4 - Execution Engine](../architecture/ADE-EPIC4-HANDOFF.md)
- [Epic 5 - Recovery System](../architecture/ADE-EPIC5-HANDOFF.md)
- [Epic 6 - QA Evolution](../architecture/ADE-EPIC6-HANDOFF.md)
- [Epic 7 - Memory Layer](../architecture/ADE-EPIC7-HANDOFF.md)

---

_AIOS Autonomous Development Engine - Transformando Ideias em Código de Forma Autônoma_
