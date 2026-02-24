# Synkra AIOS: Framework Universal de Agentes IA 🚀

> 🌍 [English](README.en.md) | **[Português](README.md)**

[![Versão NPM](https://img.shields.io/npm/v/aios-core.svg)](https://www.npmjs.com/package/aios-core)
[![Licença: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Versão Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![CI](https://github.com/SynkraAI/aios-core/actions/workflows/ci.yml/badge.svg)](https://github.com/SynkraAI/aios-core/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/SynkraAI/aios-core/branch/main/graph/badge.svg)](https://codecov.io/gh/SynkraAI/aios-core)
[![Documentação](https://img.shields.io/badge/docs-disponível-orange.svg)](https://synkra.ai)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-success.svg)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/code%20of%20conduct-Contributor%20Covenant-blue.svg)](CODE_OF_CONDUCT.md)

Framework de Desenvolvimento Auto-Modificável Alimentado por IA. Fundado em Desenvolvimento Ágil Dirigido por Agentes, oferecendo capacidades revolucionárias para desenvolvimento dirigido por IA e muito mais. Transforme qualquer domínio com expertise especializada de IA: desenvolvimento de software, entretenimento, escrita criativa, estratégia de negócios, bem-estar pessoal e muito mais.

## Comece Aqui (10 Min)

Se é sua primeira vez no AIOS, siga este caminho linear:

1. Instale em um projeto novo ou existente:
```bash
# novo projeto
npx aios-core init meu-projeto

# projeto existente
cd seu-projeto
npx aios-core install
```
2. Escolha sua IDE/CLI e o caminho de ativação:
- Claude Code: `/agent-name`
- Gemini CLI: `/aios-menu` → `/aios-<agent>`
- Codex CLI: `/skills` → `aios-<agent-id>`
- Cursor/Copilot/AntiGravity: siga os limites e workarounds em `docs/ide-integration.md`
3. Ative 1 agente e confirme o greeting.
4. Rode 1 comando inicial (`*help` ou equivalente) para validar first-value.

Definição de first-value (binária): ativação de agente + greeting válido + comando inicial com output útil em <= 10 minutos.


## Compatibilidade de Hooks por IDE (Realidade AIOS 4.2)

Muitos recursos avançados do AIOS dependem de eventos de ciclo de vida (hooks). A tabela abaixo mostra a paridade real entre IDEs/plataformas:

| IDE/CLI | Paridade de Hooks vs Claude | Impacto Prático |
| --- | --- | --- |
| Claude Code | Completa (referência) | Automação máxima de contexto, guardrails e auditoria |
| Gemini CLI | Alta (eventos nativos) | Cobertura forte de automações pre/post tool e sessão |
| Codex CLI | Parcial/limitada | Parte das automações depende de `AGENTS.md`, `/skills`, MCP e fluxo operacional |
| Cursor | Sem lifecycle hooks equivalentes | Menor automação de pre/post tool; foco em regras, MCP e fluxo do agente |
| GitHub Copilot | Sem lifecycle hooks equivalentes | Menor automação de sessão/tooling; foco em instruções de repositório + MCP no VS Code |
| AntiGravity | Workflow-based (não hook-based) | Integração por workflows, não por eventos de hook equivalentes ao Claude |

Impactos e mitigação detalhados: `docs/ide-integration.md`.

## Acknowledgments & Attribution

Synkra AIOS was originally derived from the [BMad Method](https://github.com/bmad-code-org/BMAD-METHOD), created by [Brian Madison](https://github.com/bmadcode) (BMad Code, LLC). We gratefully acknowledge the BMad Method for providing the foundation from which this project began.

**Important:** This project is **NOT affiliated with, endorsed by, or sanctioned by** the BMad Method or BMad Code, LLC. Contributors appearing in the git history from the original BMad Method repository do not imply active participation in or endorsement of Synkra AIOS.

Since its origin, AIOS has evolved significantly with its own architecture, terminology, and features (v4.x+), and does not depend on BMad for current operation. The BMad Method remains an excellent framework in its own right — please visit the [official BMad Method repository](https://github.com/bmad-code-org/BMAD-METHOD) to learn more.

BMad, BMad Method, and BMad Core are trademarks of BMad Code, LLC. See [TRADEMARK.md](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/TRADEMARK.md) for usage guidelines.

## Visão Geral

### Premissa Arquitetural: CLI First

O Synkra AIOS segue uma hierarquia clara de prioridades:

```
CLI First → Observability Second → UI Third
```

| Camada            | Prioridade | Foco                                                                          | Exemplos                                     |
| ----------------- | ---------- | ----------------------------------------------------------------------------- | -------------------------------------------- |
| **CLI**           | Máxima     | Onde a inteligência vive. Toda execução, decisões e automação acontecem aqui. | Agentes (`@dev`, `@qa`), workflows, comandos |
| **Observability** | Secundária | Observar e monitorar o que acontece no CLI em tempo real.                     | Dashboard SSE, logs, métricas, timeline      |
| **UI**            | Terciária  | Gestão pontual e visualizações quando necessário.                             | Kanban, settings, story management           |

**Princípios derivados:**

- A CLI é a fonte da verdade - dashboards apenas observam
- Funcionalidades novas devem funcionar 100% via CLI antes de ter UI
- A UI nunca deve ser requisito para operação do sistema
- Observabilidade serve para entender o que o CLI está fazendo, não para controlá-lo

---

**As Duas Inovações Chave do Synkra AIOS:**

**1. Planejamento Agêntico:** Agentes dedicados (analyst, pm, architect) colaboram com você para criar documentos de PRD e Arquitetura detalhados e consistentes. Através de engenharia avançada de prompts e refinamento com human-in-the-loop, estes agentes de planejamento produzem especificações abrangentes que vão muito além da geração genérica de tarefas de IA.

**2. Desenvolvimento Contextualizado por Engenharia:** O agente sm (Scrum Master) então transforma estes planos detalhados em histórias de desenvolvimento hiperdetalhadas que contêm tudo que o agente dev precisa - contexto completo, detalhes de implementação e orientação arquitetural incorporada diretamente nos arquivos de histórias.

Esta abordagem de duas fases elimina tanto a **inconsistência de planejamento** quanto a **perda de contexto** - os maiores problemas no desenvolvimento assistido por IA. Seu agente dev abre um arquivo de história com compreensão completa do que construir, como construir e por quê.

**📖 [Veja o fluxo de trabalho completo no Guia do Usuário](docs/guides/user-guide.md)** - Fase de planejamento, ciclo de desenvolvimento e todos os papéis dos agentes

## Pré-requisitos

- Node.js >=18.0.0 (v20+ recomendado)
- npm >=9.0.0
- GitHub CLI (opcional, necessário para colaboração em equipe)

> **Problemas de instalação?** Consulte o [Guia de Troubleshooting](docs/guides/installation-troubleshooting.md)

**Guias específicos por plataforma:**

- 📖 [Guia de Instalação para macOS](docs/installation/macos.md)
- 📖 [Guia de Instalação para Windows](docs/installation/windows.md)
- 📖 [Guia de Instalação para Linux](docs/installation/linux.md)

**Documentação multilíngue disponível:** [Português](docs/pt/installation/) | [Español](docs/es/installation/)

## Navegação Rápida

### Entendendo o Fluxo de Trabalho AIOS

**Antes de mergulhar, revise estes diagramas críticos de fluxo de trabalho que explicam como o AIOS funciona:**

1. **[Fluxo de Planejamento (Interface Web)](docs/guides/user-guide.md#the-planning-workflow-web-ui)** - Como criar documentos de PRD e Arquitetura
2. **[Ciclo Principal de Desenvolvimento (IDE)](docs/guides/user-guide.md#the-core-development-cycle-ide)** - Como os agentes sm, dev e qa colaboram através de arquivos de histórias

> ⚠️ **Estes diagramas explicam 90% da confusão sobre o fluxo Synkra AIOS Agentic Agile** - Entender a criação de PRD+Arquitetura e o fluxo de trabalho sm/dev/qa e como os agentes passam notas através de arquivos de histórias é essencial - e também explica por que isto NÃO é taskmaster ou apenas um simples executor de tarefas!

### O que você gostaria de fazer?

- **[Instalar e Construir software com Equipe Ágil Full Stack de IA](#início-rápido)** → Instruções de Início Rápido
- **[Aprender como usar o AIOS](docs/guides/user-guide.md)** → Guia completo do usuário e passo a passo
- **[Ver agentes IA disponíveis](#agentes-disponíveis)** → Papéis especializados para sua equipe
- **[Explorar usos não técnicos](#-além-do-desenvolvimento-de-software---squads)** → Escrita criativa, negócios, bem-estar, educação
- **[Criar meus próprios agentes IA](#criando-seu-próprio-squad)** → Construir agentes para seu domínio
- **[Navegar Squads prontos](docs/guides/squads-overview.md)** → Veja como criar e usar equipes de agentes IA
- **[Entender a arquitetura](docs/architecture/ARCHITECTURE-INDEX.md)** → Mergulho técnico profundo
- **[Reportar problemas](https://github.com/SynkraAI/aios-core/issues)** → Bug reports e feature requests

## Importante: Mantenha Sua Instalação AIOS Atualizada

**Mantenha-se atualizado sem esforço!** Para atualizar sua instalação AIOS existente:

```bash
npx aios-core@latest install
```

Isto vai:

- ✅ Detectar automaticamente sua instalação existente
- ✅ Atualizar apenas os arquivos que mudaram
- ✅ Criar arquivos de backup `.bak` para quaisquer modificações customizadas
- ✅ Preservar suas configurações específicas do projeto

Isto facilita beneficiar-se das últimas melhorias, correções de bugs e novos agentes sem perder suas customizações!

## Início Rápido

### 🚀 Instalação via NPX (Recomendado)

**Instale o Synkra AIOS com um único comando:**

```bash
# Criar um novo projeto com assistente interativo moderno
npx aios-core init meu-projeto

# Ou instalar em projeto existente
cd seu-projeto
npx aios-core install

# Ou usar uma versão específica
npx aios-core@latest init meu-projeto
```

### ✨ Assistente de Instalação Moderno

O Synkra AIOS agora inclui uma experiência de instalação interativa de última geração, inspirada em ferramentas modernas como Vite e Next.js:

**Recursos do Instalador Interativo:**

- 🎨 **Interface Moderna**: Prompts coloridos e visuais com @clack/prompts
- ✅ **Validação em Tempo Real**: Feedback instantâneo sobre entradas inválidas
- 🔄 **Indicadores de Progresso**: Spinners para operações longas (cópia de arquivos, instalação de deps)
- 📦 **Seleção Multi-Componente**: Escolha quais componentes instalar com interface intuitiva
- ⚙️ **Escolha de Gerenciador de Pacotes**: Selecione entre npm, yarn ou pnpm
- ⌨️ **Suporte a Cancelamento**: Ctrl+C ou ESC para sair graciosamente a qualquer momento
- 📊 **Resumo de Instalação**: Visualize todas as configurações antes de prosseguir
- ⏱️ **Rastreamento de Duração**: Veja quanto tempo levou a instalação

**O instalador oferece:**

- ✅ Download da versão mais recente do NPM
- ✅ Assistente de instalação interativo moderno
- ✅ Configuração automática do IDE (Codex CLI, Cursor ou Claude Code)
- ✅ Configuração de todos os agentes e fluxos de trabalho AIOS
- ✅ Criação dos arquivos de configuração necessários
- ✅ Inicialização do sistema de meta-agentes
- ✅ Verificações de saúde do sistema
- ✅ **Suporte Cross-Platform**: Testado em Windows, macOS e Linux

> **É isso!** Sem clonar, sem configuração manual - apenas um comando e você está pronto para começar com uma experiência de instalação moderna e profissional.

**Pré-requisitos**: [Node.js](https://nodejs.org) v18+ necessário (v20+ recomendado) | [Troubleshooting](docs/guides/installation-troubleshooting.md)

### Atualizando uma Instalação Existente

Se você já tem o AIOS instalado:

```bash
npx aios-core@latest install
# O instalador detectará sua instalação existente e a atualizará
```

### Configure Seu IDE para Desenvolvimento AIOS

O Synkra AIOS inclui regras pré-configuradas para IDE para melhorar sua experiência de desenvolvimento:

#### Para Cursor:

1. Abra as configurações do Cursor
2. Navegue até **User Rules**
3. Copie o conteúdo de `.cursor/global-rules.md`
4. Cole na seção de regras e salve

#### Para Claude Code:

- ✅ Já configurado! O arquivo `.claude/CLAUDE.md` é carregado automaticamente
- Sync dedicado de agentes: `npm run sync:ide:claude`
- Validacao dedicada: `npm run validate:claude-sync && npm run validate:claude-integration`

#### Para Codex CLI:

- ✅ Integração de primeira classe no AIOS 4.2 (pipeline de ativação e greeting compartilhado)
- ✅ Já configurado! O arquivo `AGENTS.md` na raiz é carregado automaticamente
- Opcional: sincronize agentes auxiliares com `npm run sync:ide:codex`
- Recomendado neste repositório: gerar e versionar skills locais com `npm run sync:skills:codex`
- Use `npm run sync:skills:codex:global` apenas fora deste projeto (para evitar duplicidade no `/skills`)
- Validacao dedicada: `npm run validate:codex-sync && npm run validate:codex-integration`
- Guardrails de skills/paths: `npm run validate:codex-skills && npm run validate:paths`

#### Para Gemini CLI:

- ✅ Regras e agentes sincronizaveis com `npm run sync:ide:gemini`
- Arquivos gerados em `.gemini/rules.md`, `.gemini/rules/AIOS/agents/` e `.gemini/commands/*.toml`
- ✅ Hooks e settings locais no fluxo de instalacao (`.gemini/hooks/` + `.gemini/settings.json`)
- ✅ Ativacao rapida por slash commands (`/aios-menu`, `/aios-dev`, `/aios-architect`, etc.)
- Validacao dedicada: `npm run validate:gemini-sync && npm run validate:gemini-integration`
- Paridade multi-IDE em um comando: `npm run validate:parity`

Estas regras fornecem:

- 🤖 Reconhecimento e integração de comandos de agentes
- 📋 Fluxo de trabalho de desenvolvimento dirigido por histórias
- ✅ Rastreamento automático de checkboxes
- 🧪 Padrões de teste e validação
- 📝 Padrões de código específicos do AIOS

### Início Mais Rápido com Interface Web (2 minutos)

1. **Instale o AIOS**: Execute `npx aios-core init meu-projeto`
2. **Configure seu IDE**: Siga as instruções de configuração para Codex CLI, Cursor ou Claude Code
3. **Comece a Planejar**: Ative um agente como `@analyst` para começar a criar seu briefing
4. **Use comandos AIOS**: Digite `*help` para ver comandos disponíveis
5. **Siga o fluxo**: Veja o [Guia do usuário](docs/guides/user-guide.md) para mais detalhes

### Referência de Comandos CLI

O Synkra AIOS oferece uma CLI moderna e cross-platform com comandos intuitivos:

```bash
# Gerenciamento de Projeto (com assistente interativo)
npx aios-core init <nome-projeto> [opções]
  --force              Forçar criação em diretório não vazio
  --skip-install       Pular instalação de dependências npm
  --template <nome>    Usar template específico (default, minimal, enterprise)

# Instalação e Configuração (com prompts modernos)
npx aios-core install [opções]
  --force              Sobrescrever configuração existente
  --quiet              Saída mínima durante instalação
  --dry-run            Simular instalação sem modificar arquivos

# Comandos do Sistema
npx aios-core --version   Exibir versão instalada
npx aios-core --help      Exibir ajuda detalhada
npx aios-core info        Exibir informações do sistema
npx aios-core doctor      Executar diagnósticos do sistema
npx aios-core doctor --fix Corrigir problemas detectados automaticamente

# Manutenção
npx aios-core update      Atualizar para versão mais recente
npx aios-core uninstall   Remover Synkra AIOS
```

**Recursos da CLI:**

- ✅ **Help System Abrangente**: `--help` em qualquer comando mostra documentação detalhada
- ✅ **Validação de Entrada**: Feedback imediato sobre parâmetros inválidos
- ✅ **Mensagens Coloridas**: Erros em vermelho, sucessos em verde, avisos em amarelo
- ✅ **Cross-Platform**: Funciona perfeitamente em Windows, macOS e Linux
- ✅ **Suporte a Dry-Run**: Teste instalações sem modificar arquivos

### 💡 Exemplos de Uso

#### Instalação Interativa Completa

```bash
$ npx aios-core install

🚀 Synkra AIOS Installation

◆ What is your project name?
│  my-awesome-project
│
◇ Which directory should we use?
│  ./my-awesome-project
│
◆ Choose components to install:
│  ● Core Framework (Required)
│  ● Agent System (Required)
│  ● Squads (optional)
│  ○ Example Projects (optional)
│
◇ Select package manager:
│  ● npm
│  ○ yarn
│  ○ pnpm
│
◆ Initialize Git repository?
│  Yes
│
◆ Install dependencies?
│  Yes
│
▸ Creating project directory...
▸ Copying framework files...
▸ Initializing Git repository...
▸ Installing dependencies (this may take a minute)...
▸ Configuring environment...
▸ Running post-installation setup...

✔ Installation completed successfully! (34.2s)

Next steps:
  cd my-awesome-project
  aios-core doctor     # Verify installation
  aios-core --help     # See available commands
```

#### Instalação Silenciosa (CI/CD)

```bash
# Instalação automatizada sem prompts
$ npx aios-core install --quiet --force
✔ Synkra AIOS installed successfully
```

#### Simulação de Instalação (Dry-Run)

```bash
# Testar instalação sem modificar arquivos
$ npx aios-core install --dry-run

[DRY RUN] Would create: ./my-project/
[DRY RUN] Would copy: .aios-core/ (45 files)
[DRY RUN] Would initialize: Git repository
[DRY RUN] Would install: npm dependencies
✔ Dry run completed - no files were modified
```

#### Diagnóstico do Sistema

```bash
$ npx aios-core doctor

🏥 AIOS System Diagnostics

✔ Node.js version: v20.10.0 (meets requirement: >=18.0.0)
✔ npm version: 10.2.3
✔ Git installed: version 2.43.0
✔ GitHub CLI: gh 2.40.1
✔ Synkra AIOS: v4.2.11

Configuration:
✔ .aios-core/ directory exists
✔ Agent files: 11 found
✔ Workflow files: 8 found
✔ Templates: 15 found

Dependencies:
✔ @clack/prompts: ^0.7.0
✔ commander: ^12.0.0
✔ execa: ^9.0.0
✔ fs-extra: ^11.0.0
✔ picocolors: ^1.0.0

✅ All checks passed! Your installation is healthy.
```

#### Obter Ajuda

```bash
$ npx aios-core --help

Usage: aios-core [options] [command]

Synkra AIOS: AI-Orchestrated System for Full Stack Development

Options:
  -V, --version                output the version number
  -h, --help                   display help for command

Commands:
  init <project-name>          Create new AIOS project with interactive wizard
  install [options]            Install AIOS in current directory
  info                         Display system information
  doctor [options]             Run system diagnostics and health checks
  help [command]               display help for command

Run 'aios-core <command> --help' for detailed information about each command.
```

### Alternativa: Clonar e Construir

Para contribuidores ou usuários avançados que queiram modificar o código fonte:

```bash
# Clonar o repositório
git clone https://github.com/SynkraAI/aios-core.git
cd aios-core

# Instalar dependências
npm install

# Executar o instalador
npm run install:aios
```

### Configuração Rápida para Equipe

Para membros da equipe ingressando no projeto:

```bash
# Instalar AIOS no projeto
npx aios-core@latest install

# Isto vai:
# 1. Detectar instalação existente (se houver)
# 2. Instalar/atualizar framework AIOS
# 3. Configurar agentes e workflows
```

## 🌟 Além do Desenvolvimento de Software - Squads

O framework de linguagem natural do AIOS funciona em QUALQUER domínio. Os Squads fornecem agentes IA especializados para escrita criativa, estratégia de negócios, saúde e bem-estar, educação e muito mais. Além disso, os Squads podem expandir o núcleo do Synkra AIOS com funcionalidade específica que não é genérica para todos os casos. [Veja o Guia de Squads](docs/guides/squads-guide.md) e aprenda a criar os seus próprios!

## Agentes Disponíveis

O Synkra AIOS vem com 11 agentes especializados:

### Agentes Meta

- **aios-master** - Agente mestre de orquestração (inclui capacidades de desenvolvimento de framework)
- **aios-orchestrator** - Orquestrador de fluxo de trabalho e coordenação de equipe

### Agentes de Planejamento (Interface Web)

- **analyst** - Especialista em análise de negócios e criação de PRD
- **pm** (Product Manager) - Gerente de produto e priorização
- **architect** - Arquiteto de sistema e design técnico
- **ux-expert** - Design de experiência do usuário e usabilidade

### Agentes de Desenvolvimento (IDE)

- **sm** (Scrum Master) - Gerenciamento de sprint e criação de histórias
- **dev** - Desenvolvedor e implementação
- **qa** - Garantia de qualidade e testes
- **po** (Product Owner) - Gerenciamento de backlog e histórias

## Documentação e Recursos

### Guias Essenciais

- 📖 **[Guia do Usuário](docs/guides/user-guide.md)** - Passo a passo completo desde a concepção até a conclusão do projeto
- 🏗️ **[Arquitetura Principal](docs/architecture/AIOS-VISUAL-OVERVIEW.md)** - Mergulho técnico profundo e design do sistema
- 🚀 **[Guia de Squads](docs/guides/squads-guide.md)** - Estenda o AIOS para qualquer domínio além do desenvolvimento de software

### Documentação Adicional

- 🤖 **[Guia de Squads](docs/guides/squads-guide.md)** - Crie e publique equipes de agentes IA
- 📋 **[Primeiros Passos](docs/getting-started.md)** - Tutorial passo a passo para iniciantes
- 🔧 **[Solução de Problemas](docs/troubleshooting.md)** - Soluções para problemas comuns
- 🎯 **[Princípios Orientadores](docs/GUIDING-PRINCIPLES.md)** - Filosofia e melhores práticas do AIOS
- 🏛️ **[Visão Geral da Arquitetura](docs/architecture/AIOS-VISUAL-OVERVIEW.md)** - Visão detalhada da arquitetura do sistema
- ⚙️ **[Guia de Ajuste de Performance](docs/performance-tuning-guide.md)** - Otimize seu fluxo de trabalho AIOS
- 🔒 **[Melhores Práticas de Segurança](docs/security-best-practices.md)** - Segurança e proteção de dados
- 🔄 **[Guia de Migração](docs/migration-guide.md)** - Migração de versões anteriores
- 📦 **[Versionamento e Releases](docs/versioning-and-releases.md)** - Política de versões

## 🤖 AIOS Autonomous Development Engine (ADE)

O Synkra AIOS introduz o **Autonomous Development Engine (ADE)** - um sistema completo para desenvolvimento autônomo que transforma requisitos em código funcional.

### 🎯 O Que é o ADE?

O ADE é um conjunto de **7 Epics** que habilitam execução autônoma de desenvolvimento:

| Epic  | Nome             | Descrição                                  |
| ----- | ---------------- | ------------------------------------------ |
| **1** | Worktree Manager | Isolamento de branches via Git worktrees   |
| **2** | Migration V2→V3  | Migração para formato autoClaude V3        |
| **3** | Spec Pipeline    | Transforma requisitos em specs executáveis |
| **4** | Execution Engine | Executa specs com 13 steps + self-critique |
| **5** | Recovery System  | Recuperação automática de falhas           |
| **6** | QA Evolution     | Review estruturado em 10 fases             |
| **7** | Memory Layer     | Memória persistente de padrões e insights  |

### 🔄 Fluxo Principal

```
User Request → Spec Pipeline → Execution Engine → QA Review → Working Code
                                      ↓
                              Recovery System
                                      ↓
                               Memory Layer
```

### ⚡ Quick Start ADE

```bash
# 1. Criar spec a partir de requisito
@pm *gather-requirements
@architect *assess-complexity
@analyst *research-deps
@pm *write-spec
@qa *critique-spec

# 2. Executar spec aprovada
@architect *create-plan
@architect *create-context
@dev *execute-subtask 1.1

# 3. QA Review
@qa *review-build STORY-42
```

### 📖 Documentação ADE

- **[Guia Completo do ADE](docs/guides/ade-guide.md)** - Tutorial passo a passo
- **[Alterações nos Agentes](docs/architecture/ADE-AGENT-CHANGES.md)** - Comandos e capabilities por agente
- **[Epic 1 - Worktree Manager](docs/architecture/ADE-EPIC1-HANDOFF.md)**
- **[Epic 2 - Migration V2→V3](docs/architecture/ADE-EPIC2-HANDOFF.md)**
- **[Epic 3 - Spec Pipeline](docs/architecture/ADE-EPIC3-HANDOFF.md)**
- **[Epic 4 - Execution Engine](docs/architecture/ADE-EPIC4-HANDOFF.md)**
- **[Epic 5 - Recovery System](docs/architecture/ADE-EPIC5-HANDOFF.md)**
- **[Epic 6 - QA Evolution](docs/architecture/ADE-EPIC6-HANDOFF.md)**
- **[Epic 7 - Memory Layer](docs/architecture/ADE-EPIC7-HANDOFF.md)**

### 🆕 Novos Comandos por Agente

**@devops:**

- `*create-worktree`, `*list-worktrees`, `*merge-worktree`, `*cleanup-worktrees`
- `*inventory-assets`, `*analyze-paths`, `*migrate-agent`, `*migrate-batch`

**@pm:**

- `*gather-requirements`, `*write-spec`

**@architect:**

- `*assess-complexity`, `*create-plan`, `*create-context`, `*map-codebase`

**@analyst:**

- `*research-deps`, `*extract-patterns`

**@qa:**

- `*critique-spec`, `*review-build`, `*request-fix`, `*verify-fix`

**@dev:**

- `*execute-subtask`, `*track-attempt`, `*rollback`, `*capture-insights`, `*list-gotchas`, `*apply-qa-fix`

## Criando Seu Próprio Squad

Squads permitem estender o AIOS para qualquer domínio. Estrutura básica:

```
squads/seu-squad/
├── config.yaml           # Configuração do squad
├── agents/              # Agentes especializados
├── tasks/               # Fluxos de trabalho de tarefas
├── templates/           # Templates de documentos
├── checklists/          # Checklists de validação
├── data/                # Base de conhecimento
├── README.md            # Documentação do squad
└── user-guide.md        # Guia do usuário
```

Veja o [Guia de Squads](docs/guides/squads-guide.md) para instruções detalhadas.

## Squads Disponíveis

Squads são equipes modulares de agentes IA. Veja a [Visão Geral de Squads](docs/guides/squads-overview.md) para mais informações.

### Squads Externos

- **[hybrid-ops](https://github.com/SynkraAI/aios-hybrid-ops-pedro-valerio)** - Operações híbridas humano-agente (repositório separado)

## AIOS Pro

O **AIOS Pro** (`@aios-fullstack/pro`) é o módulo premium do Synkra AIOS, oferecendo funcionalidades avançadas para equipes e projetos de maior escala.

> **Disponibilidade restrita:** O AIOS Pro está disponível exclusivamente para membros do **AIOS Cohort Advanced**. [Saiba mais sobre o programa](https://synkra.ai).

### Instalação

```bash
npm install @aios-fullstack/pro
```

### Features Premium

- **Squads Avançados** - Squads especializados com capacidades expandidas
- **Memory Layer** - Memória persistente de padrões e insights entre sessões
- **Métricas & Analytics** - Dashboard de produtividade e métricas de desenvolvimento
- **Integrações Enterprise** - Conectores para Jira, Linear, Notion e mais
- **Configuração em Camadas** - Sistema de configuração L1-L4 com herança
- **Licenciamento** - Gerenciamento de licença via `aios pro activate --key <KEY>`

Para mais informações, execute `npx aios-core pro --help` após a instalação.

## Suporte

- 🐛 [Rastreador de Issues](https://github.com/SynkraAI/aios-core/issues) - Bug reports e feature requests
- 💡 [Processo de Features](docs/FEATURE_PROCESS.md) - Como propor novas funcionalidades
- 📋 [Como Contribuir](CONTRIBUTING.md)
- 🗺️ [Roadmap](docs/roadmap.md) - Veja o que estamos construindo
- 🤖 [Guia de Squads](docs/guides/squads-guide.md) - Crie equipes de agentes IA

## Git Workflow e Validação

O Synkra AIOS implementa um sistema de validação de múltiplas camadas para garantir qualidade do código e consistência:

### 🛡️ Defense in Depth - 3 Camadas de Validação

**Camada 1: Pre-commit (Local - Rápida)**

- ✅ ESLint - Qualidade de código
- ✅ TypeScript - Verificação de tipos
- ⚡ Performance: <5s
- 💾 Cache habilitado

**Camada 2: Pre-push (Local - Validação de Stories)**

- ✅ Validação de checkboxes de histórias
- ✅ Consistência de status
- ✅ Seções obrigatórias

**Camada 3: CI/CD (Cloud - Obrigatório para merge)**

- ✅ Todos os testes
- ✅ Cobertura de testes (80% mínimo)
- ✅ Validações completas
- ✅ GitHub Actions

### 📖 Documentação Detalhada

- 📋 **[Guia Completo de Git Workflow](docs/git-workflow-guide.md)** - Guia detalhado do fluxo de trabalho
- 📋 **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guia de contribuição

### Comandos Disponíveis

```bash
# Validações locais
npm run lint           # ESLint
npm run typecheck      # TypeScript
npm test              # Testes
npm run test:coverage # Testes com cobertura

# Validador AIOS
node .aios-core/utils/aios-validator.js pre-commit   # Validação pre-commit
node .aios-core/utils/aios-validator.js pre-push     # Validação pre-push
node .aios-core/utils/aios-validator.js stories      # Validar todas stories
```

### Branch Protection

Configure proteção da branch master com:

```bash
node scripts/setup-branch-protection.js
```

Requer:

- GitHub CLI (gh) instalado e autenticado
- Acesso de admin ao repositório

## Contribuindo

**Estamos empolgados com contribuições e acolhemos suas ideias, melhorias e Squads!** 🎉

Para contribuir:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaNovaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Adicionar nova feature'`)
4. Push para a branch (`git push origin feature/MinhaNovaFeature`)
5. Abra um Pull Request

Veja também:

- 📋 [Como Contribuir com Pull Requests](docs/how-to-contribute-with-pull-requests.md)
- 📋 [Guia de Git Workflow](docs/git-workflow-guide.md)

## 📄 Legal

| Documento             | English                                     | Português                             |
| --------------------- | ------------------------------------------- | ------------------------------------- |
| **Licença**           | [MIT License](LICENSE)                      | -                                     |
| **Modelo de Licença** | [Core vs Pro](docs/legal/license-clarification.md) | -                               |
| **Privacidade**       | [Privacy Policy](docs/legal/privacy.md)     | -                                     |
| **Termos de Uso**     | [Terms of Use](docs/legal/terms.md)         | -                                     |
| **Código de Conduta** | [Code of Conduct](CODE_OF_CONDUCT.md)       | [PT-BR](docs/pt/code-of-conduct.md)   |
| **Contribuição**      | [Contributing](CONTRIBUTING.md)             | [PT-BR](docs/pt/contributing.md)      |
| **Segurança**         | [Security](docs/security.md)                | [PT-BR](docs/pt/security.md)          |
| **Comunidade**        | [Community](docs/community.md)              | [PT-BR](docs/pt/community.md)         |
| **Roadmap**           | [Roadmap](docs/roadmap.md)                  | [PT-BR](docs/pt/roadmap.md)           |
| **Changelog**         | [Version History](CHANGELOG.md)             | -                                     |

## Reconhecimentos

This project was originally derived from the [BMad Method](https://github.com/bmad-code-org/BMAD-METHOD) by [Brian Madison](https://github.com/bmadcode). We thank Brian and all BMad Method contributors for the original work that made this project possible.

**Note:** Some contributors shown in the GitHub contributors graph are inherited from the original BMad Method git history and do not represent active participation in or endorsement of Synkra AIOS.

[![Contributors](https://contrib.rocks/image?repo=SynkraAI/aios-core)](https://github.com/SynkraAI/aios-core/graphs/contributors)

<sub>Construído com ❤️ para a comunidade de desenvolvimento assistido por IA</sub>

---

**[⬆ Voltar ao topo](#synkra-aios-framework-universal-de-agentes-ia-)**
