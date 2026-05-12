# Guia de Configuração de Desenvolvimento

> [EN](../../guides/development-setup.md) | **PT** | [ES](../../es/guides/development-setup.md)

---

Guia completo para desenvolvedores que desejam contribuir com o projeto Synkra AIOX.

**Versão:** 1.0.0
**Última Atualização:** 2026-01-29

---

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Fork e Clone](#fork-e-clone)
3. [Configuração do Ambiente](#configuração-do-ambiente)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Executando Testes](#executando-testes)
6. [Adicionando Novos Agentes](#adicionando-novos-agentes)
7. [Criando Novas Tasks](#criando-novas-tasks)
8. [Criando Novos Workflows](#criando-novos-workflows)
9. [Padrões de Código](#padrões-de-código)
10. [Processo de PR e Code Review](#processo-de-pr-e-code-review)
11. [Debug e Solução de Problemas](#debug-e-solução-de-problemas)

---

## Pré-requisitos

Antes de começar, certifique-se de ter os seguintes itens instalados:

| Ferramenta     | Versão Mínima   | Comando de Verificação | Finalidade           |
| -------------- | --------------- | ---------------------- | -------------------- |
| **Node.js**    | 18.0.0          | `node --version`       | Runtime JavaScript   |
| **npm**        | 9.0.0           | `npm --version`        | Gerenciador de pacotes |
| **Git**        | 2.30+           | `git --version`        | Controle de versão   |
| **GitHub CLI** | 2.0+            | `gh --version`         | Operações no GitHub  |

### Ferramentas Recomendadas

| Ferramenta           | Finalidade                                    |
| -------------------- | --------------------------------------------- |
| **Claude Code**      | Desenvolvimento com IA usando agentes AIOX    |
| **VS Code / Cursor** | IDE com integração AIOX                       |
| **Docker Desktop**   | Servidores MCP e ferramentas containerizadas  |

### Instalando os Pré-requisitos

**macOS (Homebrew):**

```bash
# Instalar Node.js
brew install node@18

# Instalar GitHub CLI
brew install gh

# Autenticar GitHub CLI
gh auth login
```

**Windows (Chocolatey):**

```bash
# Instalar Node.js
choco install nodejs-lts

# Instalar GitHub CLI
choco install gh

# Autenticar GitHub CLI
gh auth login
```

**Linux (Ubuntu/Debian):**

```bash
# Instalar Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar GitHub CLI
sudo apt install gh

# Autenticar GitHub CLI
gh auth login
```

---

## Fork e Clone

### Passo 1: Fazer Fork do Repositório

1. Navegue até [github.com/SynkraAI/aiox-core](https://github.com/SynkraAI/aiox-core)
2. Clique no botão **Fork** no canto superior direito
3. Selecione sua conta do GitHub como destino

### Passo 2: Clonar Seu Fork

```bash
# Clonar seu fork
git clone https://github.com/YOUR_USERNAME/aiox-core.git
cd aiox-core

# Adicionar remote upstream
git remote add upstream https://github.com/SynkraAI/aiox-core.git

# Verificar remotes
git remote -v
# origin    https://github.com/YOUR_USERNAME/aiox-core.git (fetch)
# origin    https://github.com/YOUR_USERNAME/aiox-core.git (push)
# upstream  https://github.com/SynkraAI/aiox-core.git (fetch)
# upstream  https://github.com/SynkraAI/aiox-core.git (push)
```

### Passo 3: Manter-se Atualizado

```bash
# Buscar últimas alterações do upstream
git fetch upstream

# Fazer merge do main upstream no seu main local
git checkout main
git merge upstream/main

# Enviar para seu fork
git push origin main
```

---

## Configuração do Ambiente

### Passo 1: Instalar Dependências

```bash
# Instalar todas as dependências
npm install

# Isso também irá:
# - Configurar hooks do Husky (via script prepare)
# - Instalar dependências do workspace
```

### Passo 2: Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (este arquivo é ignorado pelo git):

```bash
# Configuração do Provedor de IA
ANTHROPIC_API_KEY=your-anthropic-api-key

# Opcional: Fallback OpenAI
OPENAI_API_KEY=your-openai-api-key

# Configurações do Framework
NODE_ENV=development
AIOX_DEBUG=false

# Opcional: Configuração MCP
SYNKRA_API_TOKEN=your-synkra-token
```

### Passo 3: Verificar Instalação

```bash
# Executar a suite de testes
npm test

# Verificar linting
npm run lint

# Verificar TypeScript
npm run typecheck

# Validar estrutura do projeto
npm run validate:structure
```

### Passo 4: Integração com IDE (Opcional)

Sincronizar agentes AIOX com sua IDE:

```bash
# Sincronizar para todas as IDEs suportadas
npm run sync:ide

# Sincronizar para IDE específica
npm run sync:ide:cursor

# Validar sincronização
npm run sync:ide:validate
```

---

## Estrutura do Projeto

Entendendo a estrutura de diretórios do `aiox-core`:

```
aiox-core/
├── .aiox-core/                    # Fonte do framework (commitado)
│   ├── core/                      # Utilitários e configurações principais
│   │   ├── config/                # Arquivos de configuração do framework
│   │   ├── docs/                  # Documentação interna
│   │   └── registry/              # Registro de componentes
│   │
│   ├── development/               # Assets de desenvolvimento
│   │   ├── agents/                # Definições de agentes (*.md)
│   │   ├── checklists/            # Checklists de validação
│   │   ├── scripts/               # Scripts utilitários (JS)
│   │   ├── tasks/                 # Workflows de tasks (*.md)
│   │   └── workflows/             # Workflows multi-etapas (*.yaml)
│   │
│   ├── infrastructure/            # Build e deployment
│   │   ├── scripts/               # Sincronização de IDE, validação
│   │   └── config/                # Configuração de infraestrutura
│   │
│   └── product/                   # Assets de produto
│       ├── templates/             # Templates de documentos
│       └── checklists/            # Checklists de produto
│
├── .claude/                       # Configuração do Claude Code
│   ├── commands/AIOX/agents/      # Comandos de skill dos agentes
│   ├── hooks/                     # Hooks de governança
│   └── rules/                     # Regras de comportamento da IA
│
├── bin/                           # Pontos de entrada do CLI
│   ├── aiox.js                    # CLI principal
│   └── aiox-minimal.js            # CLI mínimo
│
├── docs/                          # Toda documentação
│   ├── architecture/              # Arquitetura do sistema
│   ├── guides/                    # Guias de usuário e desenvolvedor
│   ├── migration/                 # Guias de migração
│   ├── prd/                       # Requisitos de produto
│   └── stories/                   # Stories de desenvolvimento
│
├── packages/                      # Pacotes do monorepo
│   └── */                         # Pacotes individuais
│
├── scripts/                       # Scripts de build e utilitários
│
├── squads/                        # Definições locais de squads
│
├── src/                           # Código fonte
│
├── tests/                         # Suites de teste
│   ├── health-check/              # Testes de health check
│   └── unit/                      # Testes unitários
│
├── tools/                         # Ferramentas CLI e utilitários
│
├── package.json                   # Manifesto do projeto
├── tsconfig.json                  # Configuração TypeScript
├── eslint.config.mjs              # Configuração ESLint
└── jest.config.js                 # Configuração Jest
```

### Diretórios Principais

| Diretório                           | Finalidade                    | Quando Modificar          |
| ----------------------------------- | ----------------------------- | ------------------------- |
| `.aiox-core/development/agents/`    | Personas e comportamentos de agentes | Adicionar/modificar agentes |
| `.aiox-core/development/tasks/`     | Workflows de tasks executáveis | Adicionar/modificar tasks |
| `.aiox-core/development/workflows/` | Orquestrações multi-etapas    | Criar workflows           |
| `.claude/rules/`                    | Regras de comportamento da IA | Adicionar restrições      |
| `docs/stories/`                     | Stories de desenvolvimento    | Trabalhar em features     |
| `src/`                              | Código fonte do framework     | Funcionalidade principal  |
| `tests/`                            | Suites de teste               | Todas as alterações       |

---

## Executando Testes

### Comandos de Teste

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (desenvolvimento)
npm run test:watch

# Executar testes com relatório de cobertura
npm run test:coverage

# Executar testes de health check
npm run test:health-check
```

### Estrutura de Testes

```
tests/
├── health-check/           # Testes de integração
│   └── *.test.js           # Arquivos de teste de health check
├── unit/                   # Testes unitários
│   └── *.test.js           # Arquivos de teste unitário
└── fixtures/               # Fixtures de teste e mocks
```

### Escrevendo Testes

**Exemplo de Teste Unitário:**

```javascript
// tests/unit/example.test.js
const { describe, it, expect } = require('@jest/globals');

describe('ComponentName', () => {
  describe('methodName', () => {
    it('should handle expected input', () => {
      const result = myFunction('input');
      expect(result).toBe('expected');
    });

    it('should throw on invalid input', () => {
      expect(() => myFunction(null)).toThrow('Invalid input');
    });
  });
});
```

### Executando Testes Específicos

```bash
# Executar testes correspondendo ao padrão
npm test -- --testPathPattern="agent"

# Executar arquivo de teste único
npm test -- tests/unit/agent.test.js

# Executar com saída detalhada
npm test -- --verbose
```

---

## Adicionando Novos Agentes

Agentes são personas de IA que fornecem capacidades especializadas. Cada agente é definido em um arquivo Markdown com frontmatter YAML.

### Passo 1: Planejar Seu Agente

| Aspecto           | Perguntas a Responder                        |
| ----------------- | -------------------------------------------- |
| **Propósito**     | Que problema específico este agente resolve? |
| **Expertise**     | Que conhecimento de domínio o agente deve ter? |
| **Comandos**      | Que ações o agente pode executar?            |
| **Colaboração**   | Com quais outros agentes ele trabalha?       |

### Passo 2: Criar Arquivo do Agente

Crie um novo arquivo em `.aiox-core/development/agents/`:

```bash
# Arquivo: .aiox-core/development/agents/my-agent.md
```

### Passo 3: Template de Agente

````markdown
# my-agent

ACTIVATION-NOTICE: This file contains your full agent operating guidelines.

## COMPLETE AGENT DEFINITION FOLLOWS

```yaml
agent:
  name: AgentName
  id: my-agent
  title: Agent Role Title
  icon: emoji
  whenToUse: 'Short description of when to use this agent'

persona_profile:
  archetype: ArchetypeType # Builder, Guardian, Orchestrator, etc.

  communication:
    tone: professional # pragmatic, analytical, friendly, etc.
    emoji_frequency: medium # low, medium, high

    vocabulary:
      - domain-specific
      - terms
      - here

    greeting_levels:
      minimal: 'icon Agent ready'
      named: 'icon AgentName ready!'
      archetypal: 'icon AgentName the Archetype ready!'

    signature_closing: '-- AgentName, closing phrase'

persona:
  role: Expert description
  style: Communication style description
  identity: Core identity statement
  focus: Primary focus area

core_principles:
  - Principle 1
  - Principle 2
  - Principle 3

commands:
  - name: help
    visibility: [full, quick, key]
    description: 'Show all available commands'
  - name: my-command
    visibility: [full, quick]
    description: 'Description of what this command does'

dependencies:
  tasks:
    - relevant-task.md
  checklists:
    - relevant-checklist.md
  tools:
    - tool-name
```
````

---

## Comandos Rápidos

**Comandos Principais:**

- `*help` - Mostrar todos os comandos
- `*my-command` - Executar comando personalizado
- `*exit` - Sair do modo agente

**Colaboração:**

- Trabalha com: @other-agent
- Delega para: @specialist-agent

---

````

### Passo 4: Adicionar Dependências

Se seu agente usa tasks ou checklists, certifique-se de que existem:

```yaml
dependencies:
  tasks:
    - my-agent-task.md       # Criar em .aiox-core/development/tasks/
  checklists:
    - my-agent-checklist.md  # Criar em .aiox-core/development/checklists/
  tools:
    - git
    - context7
````

### Passo 5: Sincronizar para IDEs

```bash
# Sincronizar novo agente para todas as IDEs
npm run sync:ide

# Verificar sincronização
npm run sync:ide:validate
```

---

## Criando Novas Tasks

Tasks são workflows executáveis que agentes usam para realizar ações.

### Passo 1: Planejar Sua Task

| Aspecto        | Descrição                       |
| -------------- | ------------------------------- |
| **Propósito**  | O que esta task realiza?        |
| **Entradas**   | Quais dados ela precisa?        |
| **Saídas**     | O que ela produz?               |
| **Etapas**     | Qual é o fluxo de execução?     |
| **Validação**  | Como sabemos se teve sucesso?   |

### Passo 2: Criar Arquivo de Task

Crie um novo arquivo em `.aiox-core/development/tasks/`:

```bash
# Convenções de nomenclatura:
# Específica de agente: {agent-id}-{task-name}.md
# Compartilhada: {task-name}.md

# Exemplos:
# .aiox-core/development/tasks/dev-build-component.md  (agente dev)
# .aiox-core/development/tasks/create-doc.md          (compartilhada)
```

### Passo 3: Template de Task

````markdown
---
## Modos de Execução

**Escolha seu modo de execução:**

### 1. Modo YOLO - Rápido, Autônomo (0-1 prompts)
- Tomada de decisão autônoma com logging
- Interação mínima com usuário
- **Ideal para:** Tasks simples e determinísticas

### 2. Modo Interativo - Equilibrado, Educacional (5-10 prompts) **[PADRÃO]**
- Checkpoints de decisão explícitos
- Explicações educacionais
- **Ideal para:** Aprendizado, decisões complexas

### 3. Planejamento Pre-Flight - Planejamento Abrangente Inicial
- Fase de análise da task (identificar todas as ambiguidades)
- Execução sem ambiguidades
- **Ideal para:** Requisitos ambíguos, trabalho crítico

---

## Definição da Task (AIOX Task Format V1.0)

```yaml
task: myTaskFunction()
responsável: AgentName
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: inputName
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be non-empty

**Saída:**
- campo: outputName
  tipo: string
  destino: File system
  persistido: true
```
````

---

## Pré-Condições

```yaml
pre-conditions:
  - [ ] Required inputs provided
    blocker: true
```

---

## Pós-Condições

```yaml
post-conditions:
  - [ ] Task completed successfully
    blocker: true
```

---

# Título da Task

## Propósito

Descrição clara do que esta task realiza.

## Pré-requisitos

- Pré-requisito 1
- Pré-requisito 2

## Processo de Elicitação Interativa

### Passo 1: Coletar Informações

```
ELICIT: Information Collection
1. What is the input?
2. What is the expected output?
```

### Passo 2: Validar

```
ELICIT: Validation
1. Is the input valid?
2. Are all dependencies available?
```

## Passos de Implementação

1. **Título do Passo Um**
   - Descrição da ação
   - Exemplo de código se necessário

2. **Título do Passo Dois**
   - Descrição da ação

3. **Título do Passo Três**
   - Descrição da ação

## Checklist de Validação

- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3

## Tratamento de Erros

- Se X falhar: Fazer Y
- Se Z estiver faltando: Solicitar entrada

## Saída de Sucesso

```
Task completed successfully!
Output: {output}
```

````

### Passo 4: Referenciar no Agente

Adicione a task às dependências do seu agente:

```yaml
dependencies:
  tasks:
    - my-new-task.md
````

---

## Criando Novos Workflows

Workflows orquestram múltiplos agentes e tasks para operações complexas.

### Passo 1: Planejar Seu Workflow

| Aspecto         | Descrição                     |
| --------------- | ----------------------------- |
| **Objetivo**    | Qual é o resultado final?     |
| **Etapas**      | Quais fases ele possui?       |
| **Agentes**     | Quais agentes participam?     |
| **Transições**  | Como as etapas se conectam?   |

### Passo 2: Criar Arquivo de Workflow

Crie um novo arquivo em `.aiox-core/development/workflows/`:

```bash
# Arquivo: .aiox-core/development/workflows/my-workflow.yaml
```

### Passo 3: Template de Workflow

```yaml
workflow:
  id: my-workflow
  name: My Workflow Name
  description: |
    Detailed description of what this workflow accomplishes
    and when it should be used.
  type: development # development, deployment, analysis
  scope: fullstack # ui, service, fullstack

stages:
  - id: stage-1-planning
    name: Planning Phase
    description: Initial planning and requirements gathering
    agent: pm
    tasks:
      - create-story
    outputs:
      - Story file created
      - Requirements documented
    next: stage-2-design

  - id: stage-2-design
    name: Design Phase
    description: Architecture and technical design
    agent: architect
    tasks:
      - analyze-impact
    outputs:
      - Architecture document
      - Technical specifications
    next: stage-3-implement

  - id: stage-3-implement
    name: Implementation Phase
    description: Code implementation
    agent: dev
    tasks:
      - develop-story
    outputs:
      - Source code
      - Unit tests
    next: stage-4-review

  - id: stage-4-review
    name: Review Phase
    description: Quality assurance
    agent: qa
    tasks:
      - code-review
    outputs:
      - Review feedback
      - Test results
    next: null # End of workflow

transitions:
  - from: stage-1-planning
    to: stage-2-design
    condition: "Story status is 'Ready for Design'"

  - from: stage-2-design
    to: stage-3-implement
    condition: 'Architecture approved'

  - from: stage-3-implement
    to: stage-4-review
    condition: 'All tests passing'

resources:
  templates:
    - story-template.md
    - architecture-template.md
  data:
    - project-config.yaml

validation:
  checkpoints:
    - stage: stage-1-planning
      criteria: 'Story file exists and is valid'
    - stage: stage-3-implement
      criteria: 'All acceptance criteria implemented'
    - stage: stage-4-review
      criteria: 'Code review approved'

metadata:
  version: 1.0.0
  author: Your Name
  created: 2026-01-29
  tags:
    - development
    - feature
```

---

## Padrões de Código

### Configuração ESLint

O projeto usa ESLint 9 com configuração flat:

```bash
# Executar linting
npm run lint

# Corrigir problemas auto-corrigíveis
npm run lint -- --fix
```

**Regras Principais:**

- Sem variáveis não utilizadas (error)
- Espaçamento e formatação consistentes
- Sem console.log em código de produção (warn)
- Preferir const sobre let

### Configuração TypeScript

```bash
# Executar verificação de tipos
npm run typecheck
```

**Configurações Principais do tsconfig.json:**

- `strict: true` - Segurança de tipos completa
- `noEmit: true` - Apenas verificação de tipos (sem compilação)
- `esModuleInterop: true` - Compatibilidade CommonJS/ES module

### Formatação Prettier

```bash
# Formatar todos os arquivos Markdown
npm run format
```

### Convenções de Nomenclatura

| Tipo          | Convenção   | Exemplo                     |
| ------------- | ----------- | --------------------------- |
| **Arquivos**  | kebab-case  | `my-component.js`           |
| **Classes**   | PascalCase  | `MyComponent`               |
| **Funções**   | camelCase   | `myFunction`                |
| **Constantes**| UPPER_SNAKE | `MAX_RETRIES`               |
| **Agentes**   | kebab-case  | `dev`, `qa`, `architect`    |
| **Tasks**     | kebab-case  | `create-story`, `dev-build` |

### Convenções de Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Feature
git commit -m "feat: add new agent validation"

# Correção de bug
git commit -m "fix: resolve task execution error"

# Documentação
git commit -m "docs: update development guide"

# Chore (manutenção)
git commit -m "chore: update dependencies"

# Com escopo
git commit -m "feat(agents): add data-engineer agent"
git commit -m "fix(tasks): handle missing input gracefully"
```

### Hooks Pre-commit

Husky executa estas verificações antes de cada commit:

1. **lint-staged**: Executa ESLint e Prettier nos arquivos staged
2. **IDE sync**: Atualiza configurações da IDE se agentes mudaram

---

## Processo de PR e Code Review

### Passo 1: Criar Branch de Feature

```bash
# Criar branch a partir do main
git checkout main
git pull upstream main
git checkout -b feat/my-feature

# Ou para correções
git checkout -b fix/bug-description
```

### Passo 2: Fazer Alterações

Siga a abordagem de desenvolvimento orientado a stories:

1. Verificar se existe uma story ou criar uma
2. Implementar alterações seguindo as tasks da story
3. Atualizar checkboxes da story conforme progride
4. Adicionar testes para novas funcionalidades
5. Atualizar documentação se necessário

### Passo 3: Executar Verificações de Qualidade

```bash
# Executar todas as verificações
npm test
npm run lint
npm run typecheck

# Validar estrutura
npm run validate:structure
```

### Passo 4: Commit e Push

```bash
# Stage das alterações
git add -A

# Commit com mensagem convencional
git commit -m "feat: implement my feature"

# Push para seu fork
git push origin feat/my-feature
```

### Passo 5: Criar Pull Request

```bash
# Usando GitHub CLI
gh pr create --title "feat: implement my feature" --body "$(cat <<'EOF'
## Summary
- Added feature X
- Updated component Y

## Test plan
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Documentation updated

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Diretrizes de Code Review

**Como Autor:**

- Mantenha PRs focados e pequenos (< 500 linhas quando possível)
- Forneça descrição clara e contexto
- Responda ao feedback prontamente
- Solicite re-review após alterações

**Como Revisor:**

- Revise dentro de 24 horas
- Seja construtivo e específico
- Aprove quando satisfeito ou solicite alterações
- Use sugestões do GitHub para pequenas correções

### Requisitos para Merge

| Requisito              | Descrição                       |
| ---------------------- | ------------------------------- |
| **Testes passando**    | Todos os testes de CI devem passar |
| **Lint limpo**         | Sem erros de ESLint             |
| **Tipos válidos**      | Compilação TypeScript bem-sucedida |
| **Review aprovado**    | Pelo menos uma aprovação        |
| **Conflitos resolvidos** | Sem conflitos de merge        |

---

## Debug e Solução de Problemas

### Habilitar Modo Debug

```bash
# Definir variável de ambiente
export AIOX_DEBUG=true

# Executar com saída de debug
npm test -- --verbose
```

### Visualizar Logs de Agentes

```bash
# Verificar logs de execução de agentes
ls -la .aiox/logs/

# Tail do log de agente
tail -f .aiox/logs/agent.log
```

### Problemas Comuns

#### Problema: Testes falhando localmente mas passando no CI

**Causa:** Diferenças de ambiente ou cache desatualizado

**Solução:**

```bash
# Limpar cache do Jest
npx jest --clearCache

# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules
npm install
```

#### Problema: Erros de ESLint após fazer pull de alterações

**Causa:** Cache do ESLint está desatualizado

**Solução:**

```bash
# Limpar cache do ESLint
rm .eslintcache

# Executar lint novamente
npm run lint
```

#### Problema: Erros de TypeScript na IDE mas não no CLI

**Causa:** Versão do TypeScript diferente na IDE

**Solução:**

```bash
# Forçar IDE a usar TypeScript do projeto
# No VS Code: Ctrl+Shift+P -> "TypeScript: Select TypeScript Version" -> "Use Workspace Version"
```

#### Problema: Agente não ativando

**Causa:** Erro de sintaxe no arquivo do agente ou dependências faltando

**Solução:**

```bash
# Validar YAML do arquivo do agente
npx js-yaml .aiox-core/development/agents/my-agent.md

# Verificar se dependências existem
ls .aiox-core/development/tasks/my-task.md
```

#### Problema: IDE não mostrando comandos do agente

**Causa:** Sincronização de IDE não executada ou falhou

**Solução:**

```bash
# Executar sincronização
npm run sync:ide

# Validar sincronização
npm run sync:ide:validate

# Verificar diretório específico da IDE
ls .cursor/  # Para Cursor
```

#### Problema: Hooks pre-commit não executando

**Causa:** Husky não instalado corretamente

**Solução:**

```bash
# Reinstalar Husky
npm run prepare

# Verificar se hooks existem
ls -la .husky/
```

### Debugando Execução de Workflow

```bash
# Rastrear execução de workflow
AIOX_DEBUG=true npm run trace -- workflow-name

# Verificar estado do workflow
cat .aiox/state/workflow-state.json
```

### Profiling de Performance

```bash
# Fazer profiling da execução de testes
npm test -- --detectOpenHandles

# Verificar vazamentos de memória
node --inspect node_modules/.bin/jest
```

---

## Obtendo Ajuda

### Recursos

- **GitHub Discussions:** [github.com/SynkraAI/aiox-core/discussions](https://github.com/SynkraAI/aiox-core/discussions)
- **Issue Tracker:** [github.com/SynkraAI/aiox-core/issues](https://github.com/SynkraAI/aiox-core/issues)
- **Discord:** [discord.gg/gk8jAdXWmj](https://discord.gg/gk8jAdXWmj)

### Labels de Issues

| Label              | Caso de Uso                  |
| ------------------ | ---------------------------- |
| `bug`              | Algo está quebrado           |
| `feature`          | Solicitação de nova funcionalidade |
| `documentation`    | Melhorias na documentação    |
| `good-first-issue` | Bom para iniciantes          |
| `help-wanted`      | Ajuda da comunidade apreciada |

### Contatar Mantenedores

- Veja o arquivo `CODEOWNERS` para propriedade de módulos
- Marque `@SynkraAI/core-team` para issues urgentes

---

## Documentação Relacionada

- [Guia do Usuário](./user-guide.md) - Documentação para usuários finais
- [Visão Geral da Arquitetura](../architecture/ARCHITECTURE-INDEX.md) - Design do sistema
- [Contribuindo com Squads](./contributing-squads.md) - Desenvolvimento de squads
- [Guia de Quality Gates](./quality-gates.md) - Garantia de qualidade
- [Configuração Global MCP](./mcp-global-setup.md) - Configuração MCP

---

_Synkra AIOX Development Setup Guide v1.0.0_
_Última Atualização: 2026-01-29_
