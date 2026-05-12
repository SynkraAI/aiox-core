<!--
  Tradução: PT-BR
  Original: /docs/en/framework/source-tree.md
  Última sincronização: 2026-01-26
-->

# Estrutura do Source Tree AIOX

> 🌐 [EN](../../framework/source-tree.md) | **PT** | [ES](../../es/framework/source-tree.md)

---

**Versão:** 2.0
**Última Atualização:** 2025-12-15
**Status:** Padrão Oficial do Framework
**Repositório:** SynkraAI/aiox-core

---

## Sumário

- [Visão Geral](#visão-geral)
- [Arquitetura Modular](#arquitetura-modular)
- [Framework Core (.aiox-core/)](#framework-core-aiox-core)
- [Detalhes dos Módulos](#detalhes-dos-módulos)
- [Documentação (docs/)](#documentação-docs)
- [Sistema de Squads](#sistema-de-squads)
- [Convenções de Nomenclatura de Arquivos](#convenções-de-nomenclatura-de-arquivos)
- [Onde Colocar Novos Arquivos](#onde-colocar-novos-arquivos)

---

## Visão Geral

O AIOX usa uma **arquitetura modular** com clara separação de responsabilidades:

1. **Framework Core** (`.aiox-core/`) - Componentes portáveis do framework organizados por domínio
2. **Project Workspace** (root) - Implementação específica do projeto

**Filosofia:**

- **Organização orientada a domínio** - Componentes agrupados por função
- **Portabilidade** - Componentes do framework funcionam entre projetos
- **Separação de responsabilidades** - Limites claros entre módulos

---

## Arquitetura Modular

```
aiox-core/                             # Root project
├── .aiox-core/                        # Framework core (modular)
│   ├── cli/                           # CLI commands and utilities
│   ├── core/                          # Framework essentials
│   ├── data/                          # Shared data files
│   ├── development/                   # Development assets (agents, tasks, workflows)
│   ├── docs/                          # Internal framework docs
│   ├── elicitation/                   # Elicitation engines
│   ├── infrastructure/                # Infrastructure tools and scripts
│   ├── manifests/                     # Installation manifests
│   ├── product/                       # PM/PO assets (templates, checklists)
│   ├── quality/                       # Quality gate schemas
│   ├── scripts/                       # Utility scripts
│   └── core-config.yaml               # Framework configuration
│
├── docs/                              # Public documentation
│   ├── architecture/                  # Architecture docs
│   ├── framework/                     # Official framework standards
│   ├── guides/                        # How-to guides
│   ├── installation/                  # Installation guides
│   └── community/                     # Community docs
│
├── templates/                         # Project templates
│   └── squad/                         # Squad template (see docs/guides/squads-guide.md)
│
├── bin/                               # CLI executables
│   └── aiox.js                        # Main CLI entry point
│
├── tools/                             # Build and utility tools
│   ├── cli.js                         # CLI builder
│   └── installer/                     # Installation scripts
│
├── tests/                             # Test suites
│   ├── unit/                          # Unit tests
│   ├── integration/                   # Integration tests
│   └── e2e/                           # End-to-end tests
│
├── .claude/                           # Claude Code configuration
│   ├── CLAUDE.md                      # Project instructions
│   ├── commands/                      # Agent slash commands
│   └── rules/                         # IDE rules
│
├── index.js                           # Main entry point
├── package.json                       # Package manifest
└── README.md                          # Project README
```

---

## Framework Core (.aiox-core/)

**Propósito:** Componentes portáveis do framework organizados por domínio para clara separação de responsabilidades.

### Estrutura de Diretórios (v2.0 Modular)

```
.aiox-core/
├── cli/                               # Sistema CLI
│   ├── commands/                      # Implementações de comandos CLI
│   │   ├── generate/                  # Comandos de geração de código
│   │   ├── manifest/                  # Gerenciamento de manifests
│   │   ├── mcp/                       # Comandos de ferramentas MCP
│   │   ├── metrics/                   # Métricas de qualidade
│   │   ├── migrate/                   # Ferramentas de migração
│   │   ├── qa/                        # Comandos QA
│   │   └── workers/                   # Workers em background
│   └── utils/                         # Utilitários CLI
│
├── core/                              # Essenciais do Framework
│   ├── config/                        # Sistema de configuração
│   ├── data/                          # Base de conhecimento core
│   ├── docs/                          # Documentação core
│   ├── elicitation/                   # Engine de prompting interativo
│   ├── manifest/                      # Processamento de manifests
│   ├── mcp/                           # Orquestração MCP
│   ├── migration/                     # Utilitários de migração
│   ├── quality-gates/                 # Validadores de quality gate
│   ├── registry/                      # Registro de serviços
│   ├── session/                       # Gerenciamento de estado de runtime
│   └── utils/                         # Utilitários core
│
├── data/                              # Dados Compartilhados
│   └── aiox-kb.md                     # Base de conhecimento AIOX
│
├── development/                       # Assets de Desenvolvimento
│   ├── agents/                        # Definições de agentes (11 agentes core)
│   │   ├── aiox-master.md             # Orquestrador master
│   │   ├── dev.md                     # Agente desenvolvedor
│   │   ├── qa.md                      # Agente engenheiro QA
│   │   ├── architect.md               # Agente arquiteto de sistemas
│   │   ├── po.md                      # Agente Product Owner
│   │   ├── pm.md                      # Agente Product Manager
│   │   ├── sm.md                      # Agente Scrum Master
│   │   ├── analyst.md                 # Agente Business Analyst
│   │   ├── ux-design-expert.md        # Agente UX Designer
│   │   ├── data-engineer.md           # Agente Data Engineer
│   │   └── devops.md                  # Agente DevOps
│   ├── agent-teams/                   # Configurações de times de agentes
│   ├── tasks/                         # Workflows de tarefas (60+ tasks)
│   ├── workflows/                     # Workflows multi-etapas
│   └── scripts/                       # Scripts de desenvolvimento
│
├── docs/                              # Documentação Interna
│   └── standards/                     # Padrões do framework
│
├── elicitation/                       # Engines de Elicitação
│   ├── agent-elicitation.js           # Elicitação de criação de agentes
│   ├── task-elicitation.js            # Elicitação de criação de tasks
│   └── workflow-elicitation.js        # Elicitação de criação de workflows
│
├── infrastructure/                    # Infraestrutura
│   ├── integrations/                  # Integrações externas
│   │   └── pm-adapters/               # Adapters de ferramentas PM (ClickUp, GitHub, Jira)
│   ├── scripts/                       # Scripts de infraestrutura
│   │   ├── documentation-integrity/   # Sistema de integridade de docs
│   │   └── llm-routing/               # Utilitários de roteamento LLM
│   ├── templates/                     # Templates de infraestrutura
│   │   ├── core-config/               # Templates de config
│   │   ├── github-workflows/          # Templates CI/CD
│   │   ├── gitignore/                 # Templates de gitignore
│   │   └── project-docs/              # Templates de documentação de projeto
│   ├── tests/                         # Testes de infraestrutura
│   └── tools/                         # Integrações de ferramentas
│       ├── cli/                       # Wrappers de ferramentas CLI
│       ├── local/                     # Ferramentas locais
│       └── mcp/                       # Configs de servidor MCP
│
├── manifests/                         # Manifests de Instalação
│   └── schema/                        # Schemas de manifests
│
├── product/                           # Assets PM/PO
│   ├── checklists/                    # Checklists de validação
│   │   ├── po-master-checklist.md     # Validação PO
│   │   ├── story-draft-checklist.md   # Validação de draft de story
│   │   ├── architect-checklist.md     # Revisão de arquitetura
│   │   └── change-checklist.md        # Gerenciamento de mudanças
│   ├── data/                          # Dados específicos de PM
│   └── templates/                     # Templates de documentos
│       ├── engine/                    # Engine de templates
│       ├── ide-rules/                 # Templates de regras IDE
│       ├── story-tmpl.yaml            # Template de story
│       ├── prd-tmpl.yaml              # Template de PRD
│       └── epic-tmpl.md               # Template de epic
│
├── quality/                           # Sistema de Qualidade
│   └── schemas/                       # Schemas de quality gate
│
├── scripts/                           # Scripts Root
│   └── ...                            # Scripts utilitários
│
├── core-config.yaml                   # Configuração do framework
├── install-manifest.yaml              # Manifest de instalação
├── user-guide.md                      # Guia do usuário
└── working-in-the-brownfield.md       # Guia brownfield
```

### Patterns de Arquivos

```yaml
Agents:
  Location: .aiox-core/development/agents/
  Format: Markdown with YAML frontmatter
  Naming: {agent-name}.md (kebab-case)
  Example: dev.md, qa.md, architect.md

Tasks:
  Location: .aiox-core/development/tasks/
  Format: Markdown workflow
  Naming: {task-name}.md (kebab-case)
  Example: create-next-story.md, develop-story.md

Templates:
  Location: .aiox-core/product/templates/
  Format: YAML or Markdown
  Naming: {template-name}-tmpl.{yaml|md}
  Example: story-tmpl.yaml, prd-tmpl.md

Workflows:
  Location: .aiox-core/development/workflows/
  Format: YAML
  Naming: {workflow-type}-{scope}.yaml
  Example: greenfield-fullstack.yaml, brownfield-service.yaml

Checklists:
  Location: .aiox-core/product/checklists/
  Format: Markdown
  Naming: {checklist-name}-checklist.md
  Example: story-draft-checklist.md, architect-checklist.md

Core Utilities:
  Location: .aiox-core/core/utils/
  Format: JavaScript (CommonJS)
  Naming: {utility-name}.js (kebab-case)
  Example: component-generator.js, story-manager.js

CLI Commands:
  Location: .aiox-core/cli/commands/{category}/
  Format: JavaScript (CommonJS)
  Naming: {command-name}.js (kebab-case)
  Example: generate/agent.js, manifest/install.js

Infrastructure Scripts:
  Location: .aiox-core/infrastructure/scripts/{category}/
  Format: JavaScript
  Naming: {script-name}.js (kebab-case)
  Example: documentation-integrity/link-verifier.js
```

---

## Documentação (docs/)

### Organização Atual

```
docs/
├── architecture/                      # ⚠️ Misto: oficial + específico do projeto
│   ├── coding-standards.md            # ✅ Oficial (migra para REPO 1)
│   ├── tech-stack.md                  # ✅ Oficial (migra para REPO 1)
│   ├── source-tree.md                 # ✅ Oficial (migra para REPO 1)
│   ├── decision-analysis-*.md         # Decisões específicas do projeto
│   ├── architectural-review-*.md      # Revisões específicas do projeto
│   └── mcp-*.md                       # Docs do framework (migra para REPO 1)
│
├── framework/                         # ⭐ NOVO: Docs oficiais do framework (Q2 2026)
│   ├── coding-standards.md            # Padrões de código do framework
│   ├── tech-stack.md                  # Tech stack do framework
│   ├── source-tree.md                 # Source tree do framework
│   └── README.md                      # Aviso de migração
│
├── stories/                           # Stories de desenvolvimento
│   ├── aiox migration/                # Stories de migração AIOX
│   │   ├── story-6.1.2.1.md
│   │   ├── story-6.1.2.2.md
│   │   ├── story-6.1.2.3.md
│   │   ├── story-6.1.2.4.md
│   │   └── story-6.1.2.5.md
│   └── ...                            # Outras stories
│
├── epics/                             # Planejamento de epics
│   ├── epic-6.1-agent-identity-system.md
│   └── ...                            # Outros epics
│
├── decisions/                         # Architecture Decision Records
│   ├── decision-005-repository-restructuring-FINAL.md
│   └── ...                            # Outros ADRs
│
├── guides/                            # Guias how-to
│   ├── git-workflow-guide.md
│   ├── migration-guide.md
│   └── ...                            # Outros guias
│
├── qa/                                # Artefatos QA
│   └── backlog-archive/               # Itens QA arquivados
│
├── prd/                               # Product Requirements Documents
│   └── ...                            # Arquivos PRD
│
├── planning/                          # Documentos de planejamento
│   └── ...                            # Planos de sprint, roadmaps
│
├── standards/                         # Padrões do framework
│   └── AGENT-PERSONALIZATION-STANDARD-V1.md
│
└── STORY-BACKLOG.md                   # ⭐ Índice de backlog de stories
```

### Reorganização Proposta (Story 6.1.2.6)

```
docs/
├── framework/                         # ✅ Docs oficiais do framework
│   ├── coding-standards.md
│   ├── tech-stack.md
│   ├── source-tree.md
│   ├── agent-spec.md
│   ├── task-spec.md
│   └── workflow-spec.md
│
├── architecture/                      # Arquitetura específica do projeto
│   ├── project-decisions/             # ✅ ADRs para este projeto
│   │   ├── decision-005-repository-restructuring-FINAL.md
│   │   ├── architectural-review-contextual-agent-load.md
│   │   └── ...
│   └── diagrams/                      # Diagramas de arquitetura
│
├── stories/                           # Stories de desenvolvimento
│   ├── index.md                       # ⭐ Índice de stories (auto-gerado)
│   ├── backlog.md                     # ⭐ Backlog de stories (oficial)
│   └── ...                            # Arquivos de stories
│
├── epics/
├── guides/
├── qa/
├── prd/
└── standards/
```

---

## Sistema de Squads

> **Nota:** Squads substituíram o sistema legado "Squads" no OSR-8. Veja [Guia de Squads](../guides/squads-guide.md) para documentação completa.

### Visão Geral

Squads são extensões modulares que adicionam capacidades especializadas ao AIOX. Diferente dos Squads deprecados, Squads seguem uma estrutura de template padronizada.

### Localização do Template de Squad

```
templates/squad/                       # Template de squad para criar extensões
├── squad.yaml                         # Template de manifest de squad
├── package.json                       # Template de pacote NPM
├── README.md                          # Template de documentação
├── LICENSE                            # Template de licença
├── .gitignore                         # Template de git ignore
├── agents/                            # Agentes específicos do squad
│   └── example-agent.yaml
├── tasks/                             # Tasks específicas do squad
│   └── example-task.yaml
├── workflows/                         # Workflows específicos do squad
│   └── example-workflow.yaml
├── templates/                         # Templates específicos do squad
│   └── example-template.md
└── tests/                             # Testes do squad
    └── example-agent.test.js
```

### Criando um Novo Squad

```bash
# Future CLI (planejado):
npx create-aiox-squad my-squad-name

# Método atual:
cp -r templates/squad/ squads/my-squad-name/
# Então customize squad.yaml e componentes
```

### Estrutura do Manifest de Squad

```yaml
# squad.yaml
name: my-custom-squad
version: 1.0.0
description: Description of what this squad does
author: Your Name
license: MIT

# Components provided by this squad
agents:
  - custom-agent-1
  - custom-agent-2

tasks:
  - custom-task-1

workflows:
  - custom-workflow-1

# Dependencies
dependencies:
  aiox-core: '>=2.1.0'
```

### Migração de Squads

| Legado (Deprecado)              | Atual (Squads)                  |
| ------------------------------- | ------------------------------- |
| `Squads/` directory             | `templates/squad/` template     |
| `legacyPacksLocation` config | `squadsTemplateLocation` config |
| `pack.yaml` manifest            | `squad.yaml` manifest           |
| Direct loading                  | Template-based creation         |

---

## Estrutura Futura (Pós-Migração Q2 2026)

**Decision 005 define 5 repositórios separados:**

### REPO 1: SynkraAI/aiox-core (MIT)

```
aiox-core/
├── .aiox-core/                        # Framework assets (modular v2.0)
│   ├── cli/                           # CLI commands and utilities
│   ├── core/                          # Framework essentials
│   │   ├── config/                    # Configuration system
│   │   ├── quality-gates/             # Quality validators
│   │   └── utils/                     # Core utilities
│   ├── development/                   # Development assets
│   │   ├── agents/                    # Agent definitions (11 core)
│   │   ├── tasks/                     # Task workflows (60+)
│   │   └── workflows/                 # Multi-step workflows
│   ├── infrastructure/                # Infrastructure tools
│   │   ├── integrations/              # PM adapters, tools
│   │   ├── scripts/                   # Automation scripts
│   │   └── templates/                 # Infrastructure templates
│   ├── product/                       # PM/PO assets
│   │   ├── checklists/                # Validation checklists
│   │   └── templates/                 # Document templates
│   └── ...
│
├── bin/                               # CLI entry points
│   └── aiox.js                        # Main CLI
│
├── tools/                             # Build and utility tools
│   ├── cli.js                         # CLI builder
│   └── installer/                     # Installation scripts
│
├── docs/                              # Framework documentation
│   ├── framework/                     # Official standards
│   ├── guides/                        # How-to guides
│   ├── installation/                  # Setup guides
│   └── architecture/                  # Architecture docs
│
├── templates/                         # Project templates
│   └── squad/                         # Squad template
│
├── tests/                             # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── examples/                          # Example projects
    ├── basic-agent/
    ├── vibecoder-demo/
    └── multi-agent-workflow/
```

### REPO 2: SynkraAI/squads (MIT)

```
squads/
├── verified/                          # Squads curados pelo AIOX
│   ├── github-devops/
│   ├── db-sage/
│   └── coderabbit-workflow/
│
├── community/                         # Submissões da comunidade
│   ├── marketing-agency/
│   ├── sales-automation/
│   └── ...
│
├── templates/                         # Templates de squad
│   ├── minimal-squad/
│   └── agent-squad/
│
└── tools/                             # Ferramentas de desenvolvimento de squad
    └── create-aiox-squad/
```

### REPO 3: SynkraAI/mcp-ecosystem (Apache 2.0)

```
mcp-ecosystem/
├── presets/                           # MCP presets (Docker MCP Toolkit)
│   ├── aiox-dev/
│   ├── aiox-research/
│   └── aiox-docker/
│
├── mcps/                              # Base MCP configs
│   ├── exa/
│   ├── context7/
│   └── desktop-commander/
│
└── ide-configs/                       # Integrações de IDE
    ├── claude-code/
    ├── gemini-cli/
    └── cursor/
```

### REPO 4: SynkraAI/certified-partners (Privado)

```
certified-partners/
├── premium-packs/                     # Premium Squads
│   ├── enterprise-deployment/
│   └── advanced-devops/
│
├── partner-portal/                    # Partner Success Platform
│   ├── dashboard/
│   └── analytics/
│
└── marketplace/                       # Marketplace platform
    ├── api/
    └── web/
```

### REPO 5: SynkraAI/mmos (Privado + NDA)

```
mmos/
├── minds/                             # 34 cognitive clones
│   ├── pedro-valerio/
│   ├── paul-graham/
│   └── ...
│
├── emulator/                          # MMOS emulation engine
│   ├── mirror-agent/
│   └── dna-mental/
│
└── research/                          # Research artifacts
    └── transcripts/
```

---

## Convenções de Nomenclatura de Arquivos

### Regras Gerais

```yaml
Directories: kebab-case (minúsculas, separado por hífen)
  ✅ .aiox-core/
  ✅ Squads/
  ❌ .AIOX-Core/
  ❌ legacy-packs/

Files (Code): kebab-case com extensão
  ✅ agent-executor.js
  ✅ task-runner.js
  ❌ AgentExecutor.js
  ❌ taskRunner.js

Files (Docs): kebab-case com extensão .md
  ✅ coding-standards.md
  ✅ story-6.1.2.5.md
  ❌ CodingStandards.md
  ❌ Story_6_1_2_5.md

Files (Config): minúsculas ou kebab-case
  ✅ package.json
  ✅ tsconfig.json
  ✅ core-config.yaml
  ❌ PackageConfig.json
```

### Casos Especiais

```yaml
Stories:
  Format: story-{epic}.{story}.{substory}.md
  Example: story-6.1.2.5.md

Epics:
  Format: epic-{number}-{name}.md
  Example: epic-6.1-agent-identity-system.md

Decisions:
  Format: decision-{number}-{name}.md
  Example: decision-005-repository-restructuring-FINAL.md

Templates:
  Format: {name}-tmpl.{yaml|md}
  Example: story-tmpl.yaml, prd-tmpl.md

Checklists:
  Format: {name}-checklist.md
  Example: architect-checklist.md
```

---

## Onde Colocar Novos Arquivos

### Matriz de Decisão

```yaml
# Estou criando um novo agente:
Location: .aiox-core/development/agents/{agent-name}.md
Example: .aiox-core/development/agents/security-expert.md

# Estou criando uma nova task:
Location: .aiox-core/development/tasks/{task-name}.md
Example: .aiox-core/development/tasks/deploy-to-production.md

# Estou criando um novo workflow:
Location: .aiox-core/development/workflows/{workflow-name}.yaml
Example: .aiox-core/development/workflows/continuous-deployment.yaml

# Estou criando um novo template:
Location: .aiox-core/product/templates/{template-name}-tmpl.{yaml|md}
Example: .aiox-core/product/templates/deployment-plan-tmpl.yaml

# Estou criando um novo checklist:
Location: .aiox-core/product/checklists/{checklist-name}-checklist.md
Example: .aiox-core/product/checklists/security-review-checklist.md

# Estou criando um comando CLI:
Location: .aiox-core/cli/commands/{category}/{command-name}.js
Example: .aiox-core/cli/commands/generate/workflow.js

# Estou criando um utilitário core:
Location: .aiox-core/core/utils/{utility-name}.js
Example: .aiox-core/core/utils/performance-monitor.js

# Estou criando um script de infraestrutura:
Location: .aiox-core/infrastructure/scripts/{category}/{script-name}.js
Example: .aiox-core/infrastructure/scripts/llm-routing/router.js

# Estou adicionando um adapter de ferramenta PM:
Location: .aiox-core/infrastructure/integrations/pm-adapters/{adapter-name}.js
Example: .aiox-core/infrastructure/integrations/pm-adapters/monday-adapter.js

# Estou escrevendo uma story (docs internos de dev - gitignored):
Location: docs/stories/{sprint-context}/{story-file}.md
Example: docs/stories/v4.0.4/sprint-6/story-6.14-new-feature.md

# Estou criando documentação oficial do framework:
Location: docs/framework/{doc-name}.md
Example: docs/framework/agent-development-guide.md

# Estou criando um teste:
Location: tests/{type}/{test-name}.test.js
Example: tests/unit/agent-executor.test.js

# Estou criando um squad:
Location: Copy templates/squad/ to your squads directory
Example: squads/devops-automation/ (customize from template)
```

---

## Diretórios Especiais

### Diretório .ai/ (NOVO - Story 6.1.2.6)

```
.ai/                                   # AI session artifacts
├── decision-log-6.1.2.5.md            # Yolo mode decision log
├── decision-log-6.1.2.6.md            # Another decision log
└── session-{date}-{agent}.md          # Session transcripts (optional)
```

**Propósito:** Rastrear decisões orientadas por IA durante sessões de desenvolvimento (especialmente yolo mode)

**Auto-gerado:** Sim (quando yolo mode habilitado)

### Diretório outputs/

```
outputs/                               # Runtime outputs (gitignored)
├── minds/                             # MMOS cognitive clones
│   └── pedro_valerio/
│       ├── system-prompt.md
│       ├── kb/
│       └── artifacts/
│
└── architecture-map/                  # Architecture analysis
    ├── MASTER-RELATIONSHIP-MAP.json
    └── schemas/
```

**Propósito:** Artefatos de runtime não commitados no git

---

## Documentos Relacionados

- [Padrões de Código](./coding-standards.md)
- [Tech Stack](./tech-stack.md)

---

## Histórico de Versões

| Versão | Data       | Alterações                                                                                                              | Autor            |
| ------ | ---------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 1.0    | 2025-01-15 | Documentação inicial de source tree                                                                                     | Aria (architect) |
| 1.1    | 2025-12-14 | Atualizado org para SynkraAI, substituído Squads pelo sistema Squads [Story 6.10]                                       | Dex (dev)        |
| 2.0    | 2025-12-15 | Atualização maior para refletir arquitetura modular (cli/, core/, development/, infrastructure/, product/) [Story 6.13] | Pax (PO)         |

---

_Este é um padrão oficial do framework AIOX. Todo posicionamento de arquivos deve seguir esta estrutura._
