# Exemplo de Roadmap (Anotado)

Este e um exemplo anotado de roadmap do Navigator para um projeto SaaS. Comentarios explicam cada secao.

---

```markdown
---
# Front-matter: Metadata do projeto
project_name: task-management-saas        # Kebab-case, usado em file paths
version: 1.0.0                            # Semantic versioning
created_at: 2026-02-15T10:00:00Z         # ISO 8601 timestamp
last_updated: 2026-02-15T14:30:00Z       # Atualizado automaticamente por sync
status: in-progress                       # Opcoes: planning, in-progress, complete
description: >
  Plataforma SaaS de gerenciamento de tarefas com colaboracao em time,
  updates em tempo real, e dashboard de analytics.

# Phases: Pipeline completo de 10 fases
phases:
  # Phase 1: Research (sempre primeiro, sem inputs)
  - id: 1
    name: Pesquisa                        # Nome da fase em Portugues (convencao AIOS)
    agent: "@analyst"                     # Agente responsavel (com prefixo @)
    icon: "🔍"                           # Emoji para identificacao visual
    command: "*research"                  # Comando para executar esta fase
    description: >                        # Descricao multi-linha
      Pesquisa de mercado, analise de competidores,
      e definicao de user persona para espaco de gerenciamento de tarefas.
    inputs: []                            # Fase 1 nao tem inputs (usuario fornece contexto)
    outputs:                              # Arquivos que devem existir para fase ser completa
      - "docs/research/market-analysis.md"
      - "docs/research/competitor-analysis.md"
      - "docs/research/user-personas.md"
    next_phase: 2                         # ID da proxima fase (sequencial)

  # Phase 2: PRD
  - id: 2
    name: PRD
    agent: "@pm"
    icon: "📋"
    command: "*create-prd"
    description: >
      Product Requirements Document com features,
      user stories, e metricas de sucesso.
    inputs:                               # Estes arquivos devem existir antes de comecar
      - "docs/research/**/*.md"          # Wildcard: todos arquivos .md em research/
    outputs:
      - "docs/prd/prd.yaml"              # Arquivo unico de PRD (formato YAML)
    next_phase: 3

  # Phase 3: Architecture
  - id: 3
    name: Arquitetura
    agent: "@architect"
    icon: "🏗️"
    command: "*design-architecture"
    description: >
      Arquitetura tecnica incluindo schema de banco de dados,
      design de API, e decisoes de infraestrutura.
    inputs:
      - "docs/prd/prd.yaml"              # Arquivo especifico da fase anterior
    outputs:
      - "docs/architecture/system-design.yaml"
      - "docs/architecture/database-schema.yaml"
      - "docs/architecture/api-spec.yaml"
    next_phase: 4

  # Phase 4: Epics
  - id: 4
    name: Epicos
    agent: "@pm"
    icon: "📚"
    command: "*create-epics"
    description: >
      Quebrar PRD em epics (features grandes)
      com escopo claro e dependencias.
    inputs:
      - "docs/prd/prd.yaml"
      - "docs/architecture/**/*.yaml"
    outputs:
      - "docs/epics/epic-*.md"           # Wildcard: multiplos arquivos de epic
    next_phase: 5

  # Phase 5: Stories
  - id: 5
    name: Stories
    agent: "@sm"
    icon: "📝"
    command: "*create-stories"
    description: >
      Converter epics em user stories detalhadas
      com criterios de aceitacao e estimativas.
    inputs:
      - "docs/epics/epic-*.md"
    outputs:
      - "docs/stories/story-*.md"        # Wildcard: muitos arquivos de story
    next_phase: 6

  # Phase 6: Validation
  - id: 6
    name: Validacao
    agent: "@po"
    icon: "✅"
    command: "*validate-stories"
    description: >
      Product Owner valida todas stories para
      completude, testabilidade, e alinhamento com PRD.
    inputs:
      - "docs/stories/story-*.md"
    outputs:
      - "docs/validation/validation-report.md"  # Relatorio unico de validacao
    next_phase: 7

  # Phase 7: Development (fase mais longa, story-driven)
  - id: 7
    name: Desenvolvimento
    agent: "@dev"
    icon: "💻"
    command: "*implement"
    description: >
      Implementacao de codigo de todas stories validadas.
      Acompanhar progresso via status de story no front-matter.
    inputs:
      - "docs/stories/story-*.md"
      - "docs/architecture/**/*.yaml"
    outputs:                              # Outputs de codigo (implementacao real)
      - "src/**/*.ts"                    # Arquivos de source code
      - "tests/**/*.test.ts"             # Arquivos de teste
      - "package.json"                    # Dependencias
    next_phase: 8

  # Phase 8: QA & Testing
  - id: 8
    name: QA & Testes
    agent: "@qa"
    icon: "🧪"
    command: "*test"
    description: >
      Quality assurance: testes unitarios, testes de integracao,
      testes E2E, e testes explorativos manuais.
    inputs:
      - "src/**/*.ts"
      - "tests/**/*.test.ts"
      - "docs/stories/story-*.md"        # QA valida contra criterios de aceitacao
    outputs:
      - "docs/qa/test-report.md"         # Relatorio de resultados de testes
      - "docs/qa/bug-list.md"            # Lista de bugs encontrados (se houver)
    next_phase: 9                         # Proximo e condicional (fix loop ou deploy)

  # Phase 9: Fix Loop (condicional, pode ser pulada)
  - id: 9
    name: Fix Loop
    agent: "@dev"
    icon: "🔧"
    command: "*fix"
    description: >
      Corrigir bugs identificados na fase QA.
      Loop de volta para Fase 8 para testes de regressao.
    inputs:
      - "docs/qa/bug-list.md"
    outputs:
      - "docs/fixes/fix-*.md"            # Documentacao de fix
    next_phase: 8                         # Loop de volta para QA! (nao 10)
    loop_back_to: 8                       # Marcador explicito de loop

  # Phase 10: Deploy (fase final)
  - id: 10
    name: Deploy
    agent: "@devops"
    icon: "🚀"
    command: "*deploy"
    description: >
      Push de codigo para remote, deploy para producao,
      e verificar saude do deployment.
    inputs:
      - "src/**/*.ts"
      - "docs/qa/test-report.md"         # Requer testes passando
    outputs:
      - ".github/workflows/deploy.yml"   # Pipeline de CI/CD
      - "docs/deployment/deployment-log.md"  # Registro de deployment
    next_phase: null                      # null = fase final, sem proxima

# Transition Rules: Logica avancada para auto-navegacao
transitions:
  auto_advance:                           # Avancar automaticamente se condicao atendida
    - condition: "phase 1 outputs exist"  # Todos outputs presentes
      action: "advance"
      phase: 2

    - condition: "phase 7 stories 100% complete"
      action: "advance"
      phase: 8

    - condition: "phase 8 tests passing, no bugs"
      action: "skip"                      # Pular fase 9 se sem bugs
      phase: 10

  blocked:                                # Bloquear se condicao nao atendida
    - condition: "phase 7 not 100% complete"
      action: "block"
      message: "Completar todas stories antes de QA"

    - condition: "phase 8 tests failing"
      action: "block"
      message: "Corrigir testes falhando antes de deploy"

  loop:                                   # Condicoes de loop
    - condition: "phase 8 has bugs"
      action: "loop"
      phase: 9                            # Ir para fix loop
      max_iterations: 5                   # Prevenir loops infinitos

    - condition: "phase 9 fixes complete"
      action: "loop"
      phase: 8                            # Retornar para QA

# Checkpoints: Configuracao de auto-checkpoint
checkpoints:
  auto_create:                            # Criar checkpoint automaticamente
    - on: "phase_complete"                # Apos cada conclusao de fase
      type: "auto"
    - on: "git_commit"                    # Apos cada commit (via hook)
      type: "auto"

  manual_prompt:                          # Solicitar usuario criar checkpoint
    - before: "destructive_operation"     # Antes de operacoes arriscadas
    - at: "phase_boundary"                # Entre fases

# Metadata: Configuracao adicional
metadata:
  tech_stack:
    frontend: "Next.js 14, TypeScript, Tailwind CSS"
    backend: "Node.js, Express, Prisma ORM"
    database: "PostgreSQL"
    deployment: "Vercel (frontend), Railway (backend)"

  team:
    size: 1                               # Desenvolvedor solo
    timezone: "America/Sao_Paulo"

  estimates:
    total_hours: 160                      # 4 semanas × 40 horas
    phase_breakdown:
      1: 8                                # Research: 1 dia
      2: 16                               # PRD: 2 dias
      3: 16                               # Architecture: 2 dias
      4: 8                                # Epics: 1 dia
      5: 16                               # Stories: 2 dias
      6: 4                                # Validation: 0.5 dia
      7: 80                               # Development: 10 dias (50%)
      8: 8                                # QA: 1 dia
      9: 4                                # Fixes: 0.5 dia
      10: 4                               # Deploy: 0.5 dia
---

# Task Management SaaS - Project Roadmap

Este roadmap foi gerado pelo Navigator em 2026-02-15.

## Visao Geral do Projeto

Uma plataforma SaaS moderna de gerenciamento de tarefas com colaboracao em tempo real,
analytics, e features de produtividade de time.

**Usuarios Alvo:** Times pequenos a medios (5-50 pessoas)
**Modelo de Negocio:** Freemium (tier gratis + planos pagos)
**Data de Lancamento:** Q2 2026

## Features Principais

1. **Gerenciamento de Tarefas**
   - Criar, assignar, e acompanhar tarefas
   - Prioridades, due dates, labels
   - Subtasks e checklists

2. **Colaboracao de Time**
   - Updates em tempo real (WebSockets)
   - Comentarios e mentions
   - Anexos de arquivos

3. **Dashboard de Analytics**
   - Metricas de produtividade de time
   - Trends de conclusao de tarefas
   - Time tracking

4. **Integracoes**
   - Notificacoes Slack
   - Sync de issues GitHub
   - Integracao de calendario

## Detalhes das Fases

### 1. Pesquisa (Semana 1)
**Objetivo:** Entender mercado e validar ideia

**Entregas:**
- Analise de tamanho de mercado
- Comparacao de competidores (Asana, Trello, Monday.com)
- User personas (3 tipos: manager, developer, designer)

---

### 2. PRD (Semana 2)
**Objetivo:** Definir escopo do produto

**Entregas:**
- Priorizacao de features (metodo MoSCoW)
- User stories (alto nivel)
- Metricas de sucesso (DAU, retencao, NPS)

---

### 3. Arquitetura (Semana 2-3)
**Objetivo:** Fundacao tecnica

**Entregas:**
- Diagrama de design de sistema
- Schema de banco de dados (15 tabelas)
- Especificacao de API (RESTful + WebSocket)

---

### 4-6. Epicos, Stories, Validacao (Semana 3-4)
**Objetivo:** Planejamento detalhado

**Entregas:**
- 8 epics
- 45 user stories
- Validadas por Product Owner

---

### 7. Desenvolvimento (Semana 5-12)
**Objetivo:** Construir o produto

**Stories:** 45 stories × 3.5 horas = 160 horas

---

### 8-10. QA, Fixes, Deploy (Semana 13-14)
**Objetivo:** Lancar para producao

**Entregas:**
- Cobertura de testes: 85%+
- Performance: < 200ms resposta API
- Deployment: CI/CD automatizado

---

## Criterios de Sucesso

- ✅ Todas 10 fases completas
- ✅ 45/45 stories implementadas
- ✅ Testes passando (85%+ coverage)
- ✅ Deploy em producao
- ✅ < 2 bugs criticos em producao

---

## Notas

- Este roadmap e versionado em git
- Updates sincronizam entre .aios/navigator/ e docs/
- Use `@navigator *where-am-i` para checar progresso
- Checkpoints auto-criados apos cada fase

---

*Gerado por Navigator v1.0.0 em 2026-02-15*
```

---

## Anatomia do Roadmap

### Secao Front-Matter
- **Formato YAML** entre marcadores `---`
- Contem todos dados estruturados que Navigator precisa
- Parseado por `phase-detector.js` para logica

### Corpo Markdown
- Descricao legivel do projeto para humanos
- Contexto para stakeholders
- Nao parseado pelo Navigator (apenas documentacao)

### Padroes Principais

**Inputs/Outputs:**
- Use padroes glob (`**/*.md`) para multiplos arquivos
- Paths especificos para arquivos unicos
- Navigator checa existencia de arquivo para detectar conclusao de fase

**Transitions:**
- `auto_advance`: Move automaticamente para proxima fase
- `blocked`: Previne avanco se condicao falha
- `loop`: Ciclo entre fases (ex: dev → QA → fixes → QA)

**Agents:**
- Sempre use prefixo `@`
- Deve corresponder a IDs de agente em `.aios-core/development/agents/`

**Commands:**
- Sempre use prefixo `*`
- Deve existir na lista de tasks do agente

---

## Como Usar Este Roadmap

1. **Copiar template** para seu projeto
2. **Customizar fases** para seu tech stack
3. **Ajustar outputs** para combinar com sua estrutura de arquivos
4. **Rodar Navigator** para seguir o roadmap

---

*Este exemplo e um template de roadmap completo, pronto para producao.*
