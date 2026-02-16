<!-- Tradução: PT-BR | Original: /docs/en/architecture/source-tree.md | Sincronização: 2026-01-26 -->

# Estrutura da Árvore de Código AIOS

> 🌐 [EN](../../architecture/source-tree.md) | **PT** | [ES](../../es/architecture/source-tree.md)

---

> ⚠️ **DESCONTINUADO**: Este arquivo é mantido apenas para compatibilidade retroativa.
>
> **Versão oficial:** [docs/framework/source-tree.md](../framework/source-tree.md)
>
> Este arquivo será removido no Q2 2026 após consolidação completa em `docs/framework/`.

---

# Estrutura da Árvore de Código AIOS

**Versão:** 1.1
**Última Atualização:** 2025-12-14
**Status:** DESCONTINUADO - Veja docs/framework/source-tree.md
**Aviso de Migração:** Este documento será migrado para o repositório `SynkraAI/aios-core` no Q2 2026 (veja Decisão 005)

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Estrutura Atual (aios-core Brownfield)](#estrutura-atual-aios-core-brownfield)
- [Framework Core (.aios-core/)](#framework-core-aios-core)
- [Documentação (docs/)](#documentação-docs)
- [Sistema de Squads](#sistema-de-squads)
- [Estrutura Futura (Pós-Migração Q2 2026)](#estrutura-futura-pós-migração-q2-2026)
- [Convenções de Nomenclatura de Arquivos](#convenções-de-nomenclatura-de-arquivos)
- [Onde Colocar Novos Arquivos](#onde-colocar-novos-arquivos)

---

## Visão Geral

AIOS utiliza uma **arquitetura de camada dupla**:

1. **Framework Core** (`.aios-core/`) - Componentes portáteis do framework
2. **Workspace do Projeto** (raiz) - Implementação específica do projeto

**Filosofia:**

- Componentes do framework são **portáteis** (movem entre projetos)
- Arquivos do projeto são **específicos** (implementação brownfield)
- Clara **separação de responsabilidades** (framework vs projeto)

---

## Estrutura Atual (aios-core Brownfield)

```
aios-core/                             # Raiz (projeto brownfield)
├── .aios-core/                        # Core do framework (portátil)
│   ├── core/                          # Essenciais do framework (v4)
│   │   ├── config/                    # Sistema de configuração
│   │   ├── data/                      # Base de conhecimento core
│   │   ├── docs/                      # Documentação core
│   │   ├── elicitation/               # Motor de prompting interativo
│   │   ├── session/                   # Gerenciamento de estado em runtime
│   │   └── utils/                     # Utilitários core
│   ├── product/                       # Ativos PM/PO (v4)
│   │   ├── templates/                 # Templates de documentos (52+ arquivos)
│   │   ├── checklists/                # Checklists de validação (6 arquivos)
│   │   └── data/                      # Dados específicos de PM (6 arquivos)
│   ├── agents/                        # Definições de agentes
│   ├── tasks/                         # Workflows de tarefas
│   ├── workflows/                     # Workflows de múltiplos passos
│   ├── scripts/                       # Scripts utilitários
│   ├── tools/                         # Integrações com ferramentas
│   └── core-config.yaml               # Configuração do framework
│
├── docs/                              # Documentação
│   ├── architecture/                  # Decisões de arquitetura + docs oficiais
│   ├── framework/                     # ⭐ NOVO: Docs oficiais do framework
│   ├── stories/                       # Stories de desenvolvimento
│   ├── epics/                         # Planejamento de epics
│   ├── decisions/                     # ADRs (Architecture Decision Records)
│   ├── guides/                        # Guias práticos
│   ├── qa/                            # Relatórios de QA
│   └── prd/                           # Requisitos de produto
│
├── templates/                         # Templates do projeto
│   └── squad/                         # Template de squad para extensões (veja docs/guides/squads-guide.md)
│
├── bin/                               # Executáveis CLI
│   ├── @synkra/aios-core.js              # Ponto de entrada principal da CLI
│   └── aios-minimal.js                # CLI mínima
│
├── tools/                             # Ferramentas de build e utilitários
│   ├── cli.js                         # Builder da CLI
│   ├── package-builder.js             # Builder de pacotes
│   └── installer/                     # Scripts de instalação
│
├── tests/                             # Suítes de testes
│   ├── unit/                          # Testes unitários
│   ├── integration/                   # Testes de integração
│   └── e2e/                           # Testes ponta a ponta
│
├── .claude/                           # Configuração da IDE Claude Code
│   ├── settings.json                  # Configurações do projeto
│   ├── CLAUDE.md                      # Instruções do projeto
│   └── commands/                      # Comandos slash (agentes)
│
├── outputs/                           # Saídas em runtime
│   ├── minds/                         # Clones cognitivos MMOS
│   └── architecture-map/              # Análise de arquitetura
│
├── .ai/                               # ⭐ NOVO: Artefatos de sessão IA
│   └── decision-log-{story-id}.md     # Logs de decisão do modo yolo
│
├── index.js                           # Ponto de entrada principal (CommonJS)
├── index.esm.js                       # Ponto de entrada ES Module
├── index.d.ts                         # Definições de tipos TypeScript
├── package.json                       # Manifesto do pacote
├── tsconfig.json                      # Configuração TypeScript
├── .eslintrc.json                     # Configuração ESLint
├── .prettierrc                        # Configuração Prettier
└── README.md                          # README do projeto
```

---

## Framework Core (.aios-core/)

**Propósito:** Componentes portáteis do framework que funcionam em qualquer projeto AIOS.

### Estrutura de Diretórios

```
.aios-core/
├── agents/                            # 145 definições de agentes
│   ├── aios-master.md                 # Orquestrador master
│   ├── dev.md                         # Agente desenvolvedor
│   ├── qa.md                          # Agente engenheiro de QA
│   ├── architect.md                   # Agente arquiteto de sistema
│   ├── po.md                          # Agente Product Owner
│   ├── pm.md                          # Agente Product Manager
│   ├── sm.md                          # Agente Scrum Master
│   ├── analyst.md                     # Agente Analista de Negócios
│   ├── ux-expert.md                   # Agente Designer UX
│   ├── data-engineer.md               # Agente Engenheiro de Dados
│   ├── devops.md                      # Agente DevOps
│   ├── db-sage.md                     # Agente arquiteto de banco de dados
│   └── .deprecated/                   # Agentes arquivados
│
├── tasks/                             # 60 workflows de tarefas
│   ├── create-next-story.md           # Workflow de criação de story
│   ├── develop-story.md               # Workflow de desenvolvimento de story
│   ├── validate-next-story.md         # Workflow de validação de story
│   ├── review-story.md                # Workflow de revisão de story
│   ├── apply-qa-fixes.md              # Workflow de correção de QA
│   ├── execute-checklist.md           # Execução de checklist
│   ├── document-project.md            # Documentação de projeto
│   ├── create-doc.md                  # Criação de documento
│   ├── shard-doc.md                   # Fragmentação de documento
│   └── ...                            # 50+ mais tarefas
│
├── templates/                         # 20 templates de documentos
│   ├── story-tmpl.yaml                # Template de story v2.0
│   ├── design-story-tmpl.yaml         # Template de design story v1.0
│   ├── prd-tmpl.yaml                  # Template de PRD
│   ├── epic-tmpl.md                   # Template de epic
│   ├── architecture-tmpl.yaml         # Template de arquitetura
│   ├── fullstack-architecture-tmpl.yaml  # Template de arquitetura full-stack
│   ├── brownfield-architecture-tmpl.yaml # Template de arquitetura brownfield
│   ├── schema-design-tmpl.yaml        # Template de schema de banco de dados
│   └── ...                            # 12+ mais templates
│
├── workflows/                         # 6 workflows de múltiplos passos
│   ├── greenfield-fullstack.yaml      # Workflow greenfield full-stack
│   ├── greenfield-service.yaml        # Workflow greenfield de serviço
│   ├── greenfield-ui.yaml             # Workflow greenfield de UI
│   ├── brownfield-fullstack.yaml      # Workflow brownfield full-stack
│   ├── brownfield-service.yaml        # Workflow brownfield de serviço
│   └── brownfield-ui.yaml             # Workflow brownfield de UI
│
├── checklists/                        # 6 checklists de validação
│   ├── po-master-checklist.md         # Checklist de validação PO
│   ├── story-draft-checklist.md       # Validação de rascunho de story
│   ├── architect-checklist.md         # Checklist de revisão de arquitetura
│   ├── qa-checklist.md                # Checklist de QA
│   ├── pm-checklist.md                # Checklist de PM
│   └── change-checklist.md            # Checklist de gerenciamento de mudanças
│
├── data/                              # 6 arquivos de base de conhecimento
│   ├── aios-kb.md                     # Base de conhecimento AIOS
│   ├── technical-preferences.md       # Preferências de tech stack
│   ├── elicitation-methods.md         # Técnicas de elicitação
│   ├── brainstorming-techniques.md    # Métodos de brainstorming
│   ├── test-levels-framework.md       # Níveis de teste
│   └── test-priorities-matrix.md      # Priorização de testes
│
├── scripts/                             # 54 scripts utilitários
│   ├── component-generator.js         # Scaffolding de componentes
│   ├── elicitation-engine.js          # Elicitação interativa
│   ├── story-manager.js               # Gerenciamento de ciclo de vida de story
│   ├── yaml-validator.js              # Validação YAML
│   ├── usage-analytics.js             # Analytics de uso do framework
│   └── ...                            # 49+ mais utilitários
│
├── tools/                             # Integrações com ferramentas
│   ├── mcp/                           # Configurações de servidor MCP
│   │   ├── clickup-direct.yaml        # Integração ClickUp
│   │   ├── context7.yaml              # Integração Context7
│   │   └── exa-direct.yaml            # Integração de busca Exa
│   ├── cli/                           # Wrappers de ferramentas CLI
│   │   ├── github-cli.yaml            # Wrapper GitHub CLI
│   │   └── railway-cli.yaml           # Wrapper Railway CLI
│   └── local/                         # Ferramentas locais
│
├── elicitation/                       # 3 motores de elicitação
│   ├── agent-elicitation.js           # Elicitação de criação de agente
│   ├── task-elicitation.js            # Elicitação de criação de tarefa
│   └── workflow-elicitation.js        # Elicitação de criação de workflow
│
├── agent-teams/                       # Configurações de times de agentes
│   └── ...                            # Definições de times
│
├── core-config.yaml                   # ⭐ Configuração do framework
├── install-manifest.yaml              # Manifesto de instalação
├── user-guide.md                      # Guia do usuário
└── working-in-the-brownfield.md       # Guia de desenvolvimento brownfield
```

### Padrões de Arquivos

```yaml
Agents:
  Location: .aios-core/agents/
  Format: Markdown com frontmatter YAML
  Naming: {agent-name}.md (kebab-case)
  Example: developer.md, qa-engineer.md

Tasks:
  Location: .aios-core/tasks/
  Format: Workflow Markdown
  Naming: {task-name}.md (kebab-case)
  Example: create-next-story.md, develop-story.md

Templates:
  Location: .aios-core/product/templates/
  Format: YAML ou Markdown
  Naming: {template-name}-tmpl.{yaml|md}
  Example: story-tmpl.yaml, prd-tmpl.md

Workflows:
  Location: .aios-core/workflows/
  Format: YAML
  Naming: {workflow-type}-{scope}.yaml
  Example: greenfield-fullstack.yaml, brownfield-service.yaml

Checklists:
  Location: .aios-core/product/checklists/
  Format: Markdown
  Naming: {checklist-name}-checklist.md
  Example: story-draft-checklist.md, architect-checklist.md

Utilities:
  Location: .aios-core/utils/
  Format: JavaScript (CommonJS)
  Naming: {utility-name}.js (kebab-case)
  Example: component-generator.js, story-manager.js
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
│   ├── coding-standards.md            # Padrões de codificação do framework
│   ├── tech-stack.md                  # Tech stack do framework
│   ├── source-tree.md                 # Árvore de código do framework
│   └── README.md                      # Aviso de migração
│
├── stories/                           # Stories de desenvolvimento
│   ├── aios migration/                # Stories de migração AIOS
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
├── guides/                            # Guias práticos
│   ├── git-workflow-guide.md
│   ├── migration-guide.md
│   └── ...                            # Outros guias
│
├── qa/                                # Artefatos de QA
│   └── backlog-archive/               # Itens arquivados de QA
│
├── prd/                               # Documentos de Requisitos de Produto
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
│   ├── project-decisions/             # ✅ ADRs deste projeto
│   │   ├── decision-005-repository-restructuring-FINAL.md
│   │   ├── architectural-review-contextual-agent-load.md
│   │   └── ...
│   └── diagrams/                      # Diagramas de arquitetura
│
├── stories/                           # Stories de desenvolvimento
│   ├── index.md                       # ⭐ Índice de stories (auto-gerado)
│   ├── backlog.md                     # ⭐ Backlog de stories (oficial)
│   └── ...                            # Arquivos de story
│
├── epics/
├── guides/
├── qa/
├── prd/
└── standards/
```

---

## Sistema de Squads

> **Nota:** Squads substituiu o sistema legado "Squads" no OSR-8. Veja [Guia de Squads](../guides/squads-guide.md) para documentação completa.

### Visão Geral

Squads são extensões modulares que adicionam capacidades especializadas ao AIOS. Diferente dos Squads descontinuados, Squads seguem uma estrutura de template padronizada.

### Localização do Template de Squad

```
templates/squad/                       # Template de squad para criar extensões
├── squad.yaml                         # Template de manifesto do squad
├── package.json                       # Template de pacote NPM
├── README.md                          # Template de documentação
├── LICENSE                            # Template de licença
├── .gitignore                         # Template de git ignore
├── agents/                            # Agentes específicos do squad
│   └── example-agent.yaml
├── tasks/                             # Tarefas específicas do squad
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
# CLI futura (planejada):
npx create-aios-squad my-squad-name

# Método atual:
cp -r templates/squad/ squads/my-squad-name/
# Depois customize squad.yaml e componentes
```

### Estrutura do Manifesto de Squad

```yaml
# squad.yaml
name: my-custom-squad
version: 1.0.0
description: Descrição do que este squad faz
author: Seu Nome
license: MIT

# Componentes fornecidos por este squad
agents:
  - custom-agent-1
  - custom-agent-2

tasks:
  - custom-task-1

workflows:
  - custom-workflow-1

# Dependências
dependencies:
  aios-core: '>=2.1.0'
```

### Migração de Squads

| Legado (Descontinuado)          | Atual (Squads)                  |
| ------------------------------- | ------------------------------- |
| Diretório `Squads/`             | Template `templates/squad/`     |
| Config `legacyPacksLocation` | Config `squadsTemplateLocation` |
| Manifesto `pack.yaml`           | Manifesto `squad.yaml`          |
| Carregamento direto             | Criação baseada em template     |

---

## Estrutura Futura (Pós-Migração Q2 2026)

**Decisão 005 define 5 repositórios separados:**

### REPO 1: SynkraAI/aios-core (MIT)

```
aios-core/
├── src/                               # Código fonte
│   ├── core/                          # Motor de orquestração core
│   │   ├── agent-executor.js
│   │   ├── task-runner.js
│   │   └── workflow-orchestrator.js
│   ├── integrations/                  # Integrações externas
│   │   ├── mcp/                       # Orquestração MCP
│   │   └── ide/                       # Integração com IDE
│   └── cli/                           # Interface CLI
│
├── .aios-core/                        # Ativos do framework (estrutura atual)
│   ├── agents/
│   ├── tasks/
│   ├── templates/
│   └── ...
│
├── docs/                              # Documentação do framework
│   ├── getting-started/
│   ├── core-concepts/
│   ├── integrations/
│   └── api/
│
├── examples/                          # Projetos de exemplo
│   ├── basic-agent/
│   ├── vibecoder-demo/
│   └── multi-agent-workflow/
│
└── tests/                             # Suítes de teste
    ├── unit/
    ├── integration/
    └── e2e/
```

### REPO 2: SynkraAI/squads (MIT)

```
squads/
├── verified/                          # Squads curados pelo AIOS
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
    └── create-aios-squad/
```

### REPO 3: SynkraAI/mcp-ecosystem (Apache 2.0)

```
mcp-ecosystem/
├── presets/                           # Presets MCP (Docker MCP Toolkit)
│   ├── aios-dev/
│   ├── aios-research/
│   └── aios-docker/
│
├── mcps/                              # Configurações base de MCP
│   ├── exa/
│   ├── context7/
│   └── desktop-commander/
│
└── ide-configs/                       # Integrações com IDE
    ├── claude-code/
    ├── gemini-cli/
    └── cursor/
```

### REPO 4: SynkraAI/certified-partners (Privado)

```
certified-partners/
├── premium-packs/                     # Squads Premium
│   ├── enterprise-deployment/
│   └── advanced-devops/
│
├── partner-portal/                    # Plataforma de Sucesso do Parceiro
│   ├── dashboard/
│   └── analytics/
│
└── marketplace/                       # Plataforma de marketplace
    ├── api/
    └── web/
```

### REPO 5: SynkraAI/mmos (Privado + NDA)

```
mmos/
├── minds/                             # 34 clones cognitivos
│   ├── pedro-valerio/
│   ├── paul-graham/
│   └── ...
│
├── emulator/                          # Motor de emulação MMOS
│   ├── mirror-agent/
│   └── dna-mental/
│
└── research/                          # Artefatos de pesquisa
    └── transcripts/
```

---

## Convenções de Nomenclatura de Arquivos

### Regras Gerais

```yaml
Diretórios: kebab-case (minúsculas, separados por hífen)
  ✅ .aios-core/
  ✅ Squads/
  ❌ .AIOS-Core/
  ❌ legacy-packs/

Arquivos (Código): kebab-case com extensão
  ✅ agent-executor.js
  ✅ task-runner.js
  ❌ AgentExecutor.js
  ❌ taskRunner.js

Arquivos (Docs): kebab-case com extensão .md
  ✅ coding-standards.md
  ✅ story-6.1.2.5.md
  ❌ CodingStandards.md
  ❌ Story_6_1_2_5.md

Arquivos (Config): minúsculas ou kebab-case
  ✅ package.json
  ✅ tsconfig.json
  ✅ core-config.yaml
  ❌ PackageConfig.json
```

### Casos Especiais

```yaml
Stories:
  Formato: story-{epic}.{story}.{substory}.md
  Exemplo: story-6.1.2.5.md

Epics:
  Formato: epic-{number}-{name}.md
  Exemplo: epic-6.1-agent-identity-system.md

Decisões:
  Formato: decision-{number}-{name}.md
  Exemplo: decision-005-repository-restructuring-FINAL.md

Templates:
  Formato: {name}-tmpl.{yaml|md}
  Exemplo: story-tmpl.yaml, prd-tmpl.md

Checklists:
  Formato: {name}-checklist.md
  Exemplo: architect-checklist.md
```

---

## Onde Colocar Novos Arquivos

### Matriz de Decisão

```yaml
# Estou criando um novo agente:
Localização: .aios-core/agents/{agent-name}.md
Exemplo: .aios-core/agents/security-expert.md

# Estou criando uma nova tarefa:
Localização: .aios-core/tasks/{task-name}.md
Exemplo: .aios-core/tasks/deploy-to-production.md

# Estou criando um novo workflow:
Localização: .aios-core/workflows/{workflow-name}.yaml
Exemplo: .aios-core/workflows/continuous-deployment.yaml

# Estou criando um novo template:
Localização: .aios-core/product/templates/{template-name}-tmpl.{yaml|md}
Exemplo: .aios-core/product/templates/deployment-plan-tmpl.yaml

# Estou escrevendo uma story:
Localização: docs/stories/{epic-context}/{story-file}.md
Exemplo: docs/stories/aios migration/story-6.1.2.6.md

# Estou documentando uma decisão de arquitetura:
Localização: docs/architecture/project-decisions/{decision-file}.md
Exemplo: docs/architecture/project-decisions/decision-006-auth-strategy.md

# Estou criando documentação oficial do framework:
Localização: docs/framework/{doc-name}.md
Exemplo: docs/framework/agent-development-guide.md

# Estou criando um script utilitário:
Localização: .aios-core/utils/{utility-name}.js
Exemplo: .aios-core/utils/performance-monitor.js

# Estou criando um teste:
Localização: tests/{type}/{test-name}.test.js
Exemplo: tests/unit/agent-executor.test.js

# Estou criando um squad:
Localização: Copie templates/squad/ para seu diretório de squads
Exemplo: squads/devops-automation/ (customize a partir do template)
```

---

## Diretórios Especiais

### Diretório .ai/ (NOVO - Story 6.1.2.6)

```
.ai/                                   # Artefatos de sessão IA
├── decision-log-6.1.2.5.md            # Log de decisão do modo yolo
├── decision-log-6.1.2.6.md            # Outro log de decisão
└── session-{date}-{agent}.md          # Transcrições de sessão (opcional)
```

**Propósito:** Rastrear decisões tomadas por IA durante sessões de desenvolvimento (especialmente modo yolo)

**Auto-gerado:** Sim (quando modo yolo habilitado)

### Diretório outputs/

```
outputs/                               # Saídas em runtime (gitignored)
├── minds/                             # Clones cognitivos MMOS
│   └── pedro_valerio/
│       ├── system-prompt.md
│       ├── kb/
│       └── artifacts/
│
└── architecture-map/                  # Análise de arquitetura
    ├── MASTER-RELATIONSHIP-MAP.json
    └── schemas/
```

**Propósito:** Artefatos de runtime não commitados no git

---

## Documentos Relacionados

- [Padrões de Codificação](./coding-standards.md)
- [Tech Stack](./tech-stack.md)

---

## Histórico de Versão

| Versão | Data       | Alterações                                                                        | Autor            |
| ------ | ---------- | --------------------------------------------------------------------------------- | ---------------- |
| 1.0    | 2025-01-15 | Documentação inicial da árvore de código                                          | Aria (architect) |
| 1.1    | 2025-12-14 | Atualizado org para SynkraAI, substituído Squads pelo sistema Squads [Story 6.10] | Dex (dev)        |

---

_Este é um padrão oficial do framework AIOS. Todo posicionamento de arquivos deve seguir esta estrutura._
