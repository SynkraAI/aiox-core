# Arquitetura ADE - Motor de Desenvolvimento Autônomo

> **Versão:** 1.0
> **Última Atualização:** 2026-01-29
> **Status:** Padrão Oficial do Framework
>
> **PT** | [EN](../architecture/ade-architecture.md) | [ES](../es/architecture/ade-architecture.md)

---

## Sumário

- [Visão Geral](#visão-geral)
- [Princípios de Design](#princípios-de-design)
- [Arquitetura de Épicas](#arquitetura-de-épicas)
- [Componentes do Sistema](#componentes-do-sistema)
- [Pontos de Integração](#pontos-de-integração)
- [Gerenciamento de Estado em Runtime](#gerenciamento-de-estado-em-runtime)
- [Configuração](#configuração)
- [Sistema de Inteligência de Workflow (WIS)](#sistema-de-inteligência-de-workflow-wis)
- [Tratamento de Erros e Recuperação](#tratamento-de-erros-e-recuperação)

---

## Visão Geral

O **Motor de Desenvolvimento Autônomo (ADE)** é a infraestrutura do AIOX para workflows de desenvolvimento autônomo. Ele permite que agentes de IA trabalhem de forma independente através de pipelines inteligentes, loops auto-recuperáveis e aprendizado persistente.

### Capacidades Principais

| Capacidade                   | Descrição                                | Épica |
| ---------------------------- | ---------------------------------------- | ----- |
| **Isolamento de Story**      | Isolamento de branch baseado em worktree | Épica 1 |
| **Status do Projeto**        | Rastreamento de status baseado em YAML  | Épica 2 |
| **Pipeline de Especificação** | Automação de Requirements → Especificação | Épica 3 |
| **Planejamento de Implementação** | Geração de plano e rastreamento de progresso | Épica 4 |
| **Auto-Recuperação**        | Detecção de travamento e recuperação    | Épica 5 |
| **Evolução de QA**          | Loops automáticos de review → correção  | Épica 6 |
| **Camada de Memória**       | Aprendizado de padrões e documentação de gotchas | Épica 7 |

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Framework AIOX                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    ADE - Motor de Desenvolvimento Autônomo             │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │   Épica 1   │  │   Épica 2   │  │   Épica 3   │  │   Épica 4   │   │ │
│  │  │  Worktree   │→│   Status    │→│    Spec     │→│    Plano    │   │ │
│  │  │  Manager    │  │   Loader    │  │  Pipeline   │  │   Tracker   │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │         │                │                │                │          │ │
│  │         ▼                ▼                ▼                ▼          │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │                     Estado Runtime .aiox/                       │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │         │                │                │                │          │ │
│  │         ▼                ▼                ▼                ▼          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │   Épica 5   │  │   Épica 6   │  │   Épica 7   │  │     WIS     │   │ │
│  │  │ Auto-Cure  │←│   Loop QA   │←│   Memória   │←│  Mecanismo  │   │ │
│  │  │   Loop      │  │ Orchestrate │  │   Layer     │  │   Learning   │   │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Princípios de Design

### 1. Determinismo Primeiro

```yaml
Prioridade:
  1. Scripts determinísticos      # Sempre preferir
  2. Queries SQL/JSON             # Previsível, auditável
  3. Regex/pattern matching       # Reproduzível
  4. LLM como último recurso      # Apenas quando criatividade é necessária
```

### 2. Persistência de Estado

Todo o estado do ADE é persistido em `.aiox/` para:

- Recuperação de sessão
- Rastreamento de progresso
- Continuidade de aprendizado

### 3. Pipelines Compostos

Workflows são construídos a partir de tarefas compostas:

- Cada tarefa tem inputs/outputs definidos
- Tarefas podem ser executadas independentemente ou em sequência
- Pipelines se adaptam com base na complexidade

### 4. Loops Auto-Recuperáveis

Todo pipeline tem recuperação integrada:

- Detecção de travamento com limites configuráveis
- Capacidades de rollback automático
- Caminhos de escalação para estados irrecuperáveis

---

## Arquitetura de Épicas

### Épica 1: Isolamento de Branch de Story

**Propósito:** Isolar desenvolvimento de story em worktrees Git dedicadas.

```
Componente: worktree-manager.js
Localização: .aiox-core/infrastructure/scripts/

Fluxo:
  1. Story iniciada → Criar worktree
  2. Desenvolvimento → Trabalhar em isolamento
  3. Story completa → Merge e limpeza
```

**Funções Principais:**

- `createWorktree(storyId)` - Cria branch isolada
- `switchWorktree(storyId)` - Alterna contexto
- `mergeWorktree(storyId)` - Faz merge para main
- `cleanupWorktree(storyId)` - Remove worktree

### Épica 2: Sistema de Status do Projeto

**Propósito:** Rastrear status do projeto em YAML legível para humanos.

```
Componente: project-status-loader.js
Localização: .aiox-core/infrastructure/scripts/

Arquivo de Estado: .aiox/project-status.yaml
```

**Schema de Status:**

```yaml
projeto:
  nome: 'nome-projeto'
  storyAtual: 'STORY-001'

stories:
  STORY-001:
    status: em_progresso
    branch: feat/story-001
    specStatus: aprovada
    qaStatus: pendente
```

### Épica 3: Pipeline de Especificação

**Propósito:** Transformar requisitos em especificações.

```
Componentes:
  - Workflow: spec-pipeline.yaml
  - Tarefas: spec-gather-requirements.md
             spec-assess-complexity.md
             spec-research-dependencies.md
             spec-write-spec.md
             spec-critique.md
```

**Fases do Pipeline:**

| Fase       | Agente     | Saída             |
| ---------- | ---------- | ----------------- |
| 1. Coletar | @pm        | requirements.json |
| 2. Avaliar | @architect | complexity.json   |
| 3. Pesquisar | @analyst | research.json     |
| 4. Escrever | @pm        | spec.md           |
| 5. Criticar | @qa        | critique.json     |

**Adaptação de Complexidade:**

```yaml
SIMPLES: Coletar → Escrever → Criticar
PADRÃO: Coletar → Avaliar → Pesquisar → Escrever → Criticar → Planejar
COMPLEXO: Coletar → Avaliar → Pesquisar → Escrever → Criticar → Revisar → Criticar2 → Planejar
```

### Épica 4: Planejamento de Implementação

**Propósito:** Gerar e rastrear planos de implementação.

```
Componentes:
  - Scripts: plan-tracker.js
             subtask-verifier.js
  - Tarefas: plan-create-context.md
             plan-create-implementation.md
             plan-execute-subtask.md
             verify-subtask.md
  - Checklist: self-critique-checklist.md
```

**Estrutura do Plano:**

```json
{
  "storyId": "STORY-001",
  "subtarefas": [
    { "id": 1, "status": "completa", "verificada": true },
    { "id": 2, "status": "em_progresso", "verificada": false },
    { "id": 3, "status": "pendente", "verificada": false }
  ],
  "progresso": { "completas": 1, "total": 3, "percentual": 33 }
}
```

### Épica 5: Loops Auto-Recuperáveis

**Propósito:** Detectar estados travados e recuperar automaticamente.

```
Componentes:
  - Scripts: stuck-detector.js
             recovery-tracker.js
             rollback-manager.js
             approach-manager.js
  - Template: current-approach-tmpl.md
```

**Sinais de Detecção de Travamento:**

| Sinal          | Limite       | Ação                |
| -------------- | ------------ | ------------------- |
| Mesmo erro 3x  | 3 ocorrências | Sugerir alternativa |
| Sem progresso  | 10 minutos   | Solicitar revisão   |
| Revert repetido | 2 reverts    | Escalar             |

**Fluxo de Recuperação:**

```
Travamento Detectado → Registrar Abordagem → Tentar Alternativa → Sucesso?
                                                      ↓ Não
                                              Rollback → Escalar
```

### Épica 6: Evolução de QA

**Propósito:** Revisão automática de QA com loops de correção.

```
Componentes:
  - Workflow: qa-loop.yaml
  - Scripts: qa-loop-orchestrator.js
             qa-report-generator.js
  - Tarefas: qa-review-build.md (10 fases)
             qa-create-fix-request.md
             qa-fix-issues.md
  - Template: qa-report-tmpl.md
```

**Fluxo do Loop de QA:**

```
┌─────────────────────────────────────────────────────────────┐
│                      Loop QA                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │ Review  │ → │ Gerar   │ → │ Verificar│ → │  Corrigir?  │
│  │ Build   │    │ Report  │    │ Veredicto│    │         │  │
│  └─────────┘    └─────────┘    └─────────┘    └────┬────┘  │
│                                                     │       │
│                 ┌───────────────────────────────────┘       │
│                 │                                           │
│          ┌──────▼──────┐                                    │
│          │  APROVADA   │ → Concluído                        │
│          └─────────────┘                                    │
│          ┌──────▼──────┐                                    │
│          │PRECISA_REVISAR│ → Criar Requisição Correção → @dev Corrigir │
│          └─────────────┘    └────────────────────────┘     │
│                                      │                      │
│                 ┌────────────────────┘                      │
│                 │ (máx 5 iterações)                         │
│                 └──────→ Voltar para Review                 │
│                                                              │
│          ┌──────▼──────┐                                    │
│          │   BLOQUEADA │ → Escalar para @architect          │
│          └─────────────┘                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Review de 10 Fases:**

1. Sintaxe e Formatação
2. Estrutura de Código
3. Convenções de Nomenclatura
4. Tratamento de Erros
5. Padrões de Segurança
6. Padrões de Performance
7. Cobertura de Testes
8. Documentação
9. Acessibilidade
10. Avaliação Final

### Épica 7: Camada de Memória

**Propósito:** Aprendizado persistente entre sessões.

```
Componentes:
  - Scripts: codebase-mapper.js
             pattern-extractor.js
             gotchas-documenter.js
  - Tarefas: capture-session-insights.md
             extract-patterns.md
             document-gotchas.md
```

**Tipos de Memória:**

| Tipo                | Descrição                          | Armazenamento                     |
| ------------------- | ---------------------------------- | --------------------------------- |
| Padrões de Código   | Padrões reutilizáveis da base     | .aiox/patterns/code-patterns.json |
| Gotchas             | Problemas conhecidos e soluções   | .aiox/patterns/gotchas.json       |
| Insights de Sessão  | Descobertas durante sessões       | .aiox/sessions/                   |
| Mapa de Codebase    | Análise de estrutura do projeto   | .aiox/codebase-map.json           |

---

## Componentes do Sistema

### Scripts de Infraestrutura

| Script                     | Épica | Propósito                |
| -------------------------- | ----- | ----------------------- |
| `worktree-manager.js`      | 1     | Gerenciamento de worktree |
| `project-status-loader.js` | 2     | Rastreamento de status YAML |
| `spec-pipeline-runner.js`  | 3     | Automação de pipeline spec |
| `plan-tracker.js`          | 4     | Rastreamento de progresso do plano |
| `subtask-verifier.js`      | 4     | Verificação de subtarefa |
| `approach-manager.js`      | 5     | Rastreamento de abordagem |
| `stuck-detector.js`        | 5     | Detecção de estado travado |
| `recovery-tracker.js`      | 5     | Registro de recuperação |
| `rollback-manager.js`      | 5     | Gerenciamento de rollback |
| `qa-report-generator.js`   | 6     | Geração de relatório QA |
| `qa-loop-orchestrator.js`  | 6     | Automação de loop QA |
| `codebase-mapper.js`       | 7     | Mapeamento de estrutura do projeto |
| `pattern-extractor.js`     | 7     | Extração de padrões |
| `gotchas-documenter.js`    | 7     | Documentação de gotchas |

### Workflows

| Workflow             | Propósito           | Fases                         |
| -------------------- | ------------------- | ----------------------------- |
| `spec-pipeline.yaml` | Requirements → Spec | 5-8 fases com base na complexidade |
| `qa-loop.yaml`       | Review → Loop correção | 5 fases, máx 5 iterações   |

### Tarefas

**Tarefas do Pipeline de Spec:**

- `spec-gather-requirements.md` - Fase 1: Coletar requisitos
- `spec-assess-complexity.md` - Fase 2: Avaliar complexidade
- `spec-research-dependencies.md` - Fase 3: Pesquisar dependências
- `spec-write-spec.md` - Fase 4: Escrever especificação
- `spec-critique.md` - Fase 5: Gate de QA

**Tarefas de Implementação:**

- `plan-create-context.md` - Gerar contexto do projeto
- `plan-create-implementation.md` - Criar plano de implementação
- `plan-execute-subtask.md` - Executar subtarefa
- `verify-subtask.md` - Verificar conclusão de subtarefa

**Tarefas de QA:**

- `qa-review-build.md` - Review de 10 fases
- `qa-create-fix-request.md` - Gerar requisição de correção
- `qa-fix-issues.md` - Workflow de correção de issues

**Tarefas de Memória:**

- `capture-session-insights.md` - Capturar aprendizados de sessão
- `extract-patterns.md` - Extrair padrões de código
- `document-gotchas.md` - Documentar gotchas

---

## Pontos de Integração

### Integração com Agentes

ADE integra-se com agentes AIOX através de:

```yaml
autoClaude:
  specPipeline:
    phase: spec-gather
    role: primário

  qaLoop:
    phase: review
    role: revisor
```

### Integração com Status.json

Todos os componentes do ADE atualizam `.aiox/status.json`:

```json
{
  "storyAtual": "STORY-001",
  "specPipeline": {
    "phase": "critique",
    "iteration": 1
  },
  "qaLoop": {
    "iteration": 2,
    "verdict": "PRECISA_REVISAR"
  }
}
```

### Integração com devLoadAlwaysFiles

A documentação do ADE é carregada via devLoadAlwaysFiles:

- `docs/framework/source-tree.md` - Estrutura do framework
- `docs/framework/coding-standards.md` - Padrões de codificação
- `docs/framework/tech-stack.md` - Referência de tech stack

---

## Gerenciamento de Estado em Runtime

### Estrutura de Diretório de Estado

```
.aiox/
├── project-status.yaml        # Status do projeto
├── status.json                # Status de runtime
├── patterns/                  # Padrões aprendidos (Épica 7)
│   ├── code-patterns.json
│   └── gotchas.json
├── worktrees/                 # Estado de worktree (Épica 1)
│   └── story-{id}.json
├── sessions/                  # Insights de sessão (Épica 7)
│   └── session-{timestamp}.json
└── qa-loops/                  # Estado de loop QA (Épica 6)
    └── {story-id}/
        ├── iteration-1.json
        ├── iteration-2.json
        └── qa-report.md
```

### Ciclo de Vida do Estado

```
Início de Sessão → Carregar Estado → Executar → Atualizar Estado → Fim de Sessão
                       │                                 │
                       └── Recuperação se necessário ──┘
```

---

## Configuração

### Configuração Principal

Localizada em `.aiox-core/core-config.yaml`:

```yaml
ade:
  enabled: true

  worktrees:
    enabled: true
    baseDir: .worktrees
    autoCleanup: true

  specPipeline:
    enabled: true
    maxIterations: 3
    strictGate: true

  qaLoop:
    enabled: true
    maxIterations: 5
    autoFix: true

  memoryLayer:
    enabled: true
    patternStore: .aiox/patterns/
    sessionCapture: true

  selfHealing:
    enabled: true
    stuckThreshold: 3
    autoRollback: false
```

---

## Sistema de Inteligência de Workflow (WIS)

O WIS fornece sugestões inteligentes baseadas em padrões aprendidos.

### Componentes

```
.aiox-core/workflow-intelligence/
├── engine/
│   ├── confidence-scorer.js   # Pontuação de confiança de padrão
│   ├── output-formatter.js    # Formatação de saída
│   ├── suggestion-engine.js   # Sugestões inteligentes
│   └── wave-analyzer.js       # Análise de padrão wave
├── learning/
│   ├── capture-hook.js        # Hooks de captura de padrão
│   ├── pattern-capture.js     # Mecanismo de captura de padrão
│   ├── pattern-store.js       # Persistência de padrão
│   └── pattern-validator.js   # Validação de padrão
└── registry/
    └── workflow-registry.js   # Registro de workflow
```

### Integração com ADE

WIS integra-se com ADE através de:

1. **Captura de Padrão** - Aprende de workflows bem-sucedidos
2. **Mecanismo de Sugestão** - Sugere abordagens baseadas em contexto
3. **Pontuação de Confiança** - Classifica sugestões por confiabilidade

---

## Tratamento de Erros e Recuperação

### Categorias de Erro

| Categoria    | Tratamento               | Exemplo         |
| ------------ | ----------------------- | --------------- |
| Transitório  | Retry (3x)              | Timeout de rede |
| Recuperável  | Abordagem alternativa    | Falha de lint   |
| Bloqueante   | Escalar                 | Problema segurança |
| Fatal        | Parar + notificar       | Corrupção       |

### Estratégias de Recuperação

```yaml
estratégias:
  retry:
    maxTentativas: 3
    delay: exponencial

  alternativa:
    trigger: mesmo_erro_3x
    action: sugerir_abordagem

  rollback:
    trigger: corrupção_detectada
    action: restaurar_checkpoint

  escalar:
    trigger: max_iterações
    action: notificar_arquiteto
```

---

## Histórico de Versões

| Versão | Data       | Mudanças                                    | Autor              |
| ------ | ---------- | ------------------------------------------- | ------------------ |
| 1.0    | 2026-01-29 | Documentação inicial de arquitetura ADE     | Aria (arquiteta)   |

---

_Este é um padrão oficial do framework AIOX documentando o Motor de Desenvolvimento Autônomo._
