# Contribuindo com o Synkra AIOX

> **[English Version](../../CONTRIBUTING.md)**

Bem-vindo ao AIOX! Obrigado pelo seu interesse em contribuir. Este guia vai ajudá-lo a entender nosso fluxo de desenvolvimento, processo de contribuição e como submeter suas alterações.

## Sumário

- [Início Rápido](#início-rápido)
- [Tipos de Contribuição](#tipos-de-contribuição)
- [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
- [Contribuindo com Agents](#contribuindo-com-agents)
- [Contribuindo com Tasks](#contribuindo-com-tasks)
- [Contribuindo com Squads](#contribuindo-com-squads)
- [Processo de Code Review](#processo-de-code-review)
- [Sistema de Validação](#sistema-de-validação)
- [Padrões de Código](#padrões-de-código)
- [Requisitos de Testes](#requisitos-de-testes)
- [Perguntas Frequentes](#perguntas-frequentes)
- [Obtendo Ajuda](#obtendo-ajuda)
- [Trabalhando com o Pro](#trabalhando-com-o-pro)
- [Recursos Adicionais](#recursos-adicionais)

---

## Início Rápido

### 1. Fork e Clone

```bash
# Faça o fork pela interface do GitHub, depois clone seu fork
git clone https://github.com/SEU_USUARIO/aiox-core.git
cd aiox-core

# Adicione o remote upstream
git remote add upstream https://github.com/SynkraAI/aiox-core.git
```

### 2. Configure o Ambiente de Desenvolvimento

**Pré-requisitos:**

- Node.js >= 20.0.0
- npm
- Git
- GitHub CLI (`gh`) - opcional, mas recomendado

```bash
# Instale as dependências
npm install

# Verifique a configuração
npm test
npm run lint
npm run typecheck
```

### 3. Crie uma Branch

```bash
git checkout -b feature/nome-da-sua-feature
```

**Convenções de Nomenclatura de Branches:**

| Prefixo | Uso |
|---------|-----|
| `feature/` | Novas funcionalidades, agents, tasks |
| `fix/` | Correções de bugs |
| `docs/` | Atualizações de documentação |
| `refactor/` | Refatoração de código |
| `test/` | Adição/melhoria de testes |

### 4. Faça Suas Alterações

Siga o guia relevante abaixo para o tipo da sua contribuição.

### 5. Execute a Validação Local

```bash
npm run lint      # Estilo de código
npm run typecheck # Verificação de tipos
npm test          # Executar testes
npm run build     # Verificar build
```

### 6. Push e Criação do PR

```bash
git push origin feature/nome-da-sua-feature
```

Em seguida, crie um Pull Request no GitHub apontando para a branch `main`.

---

## Tipos de Contribuição

| Contribuição      | Descrição                                  | Dificuldade     |
| ----------------- | ------------------------------------------ | --------------- |
| **Documentação**  | Corrigir erros, melhorar guias             | Fácil           |
| **Bug Fixes**     | Corrigir issues reportados                 | Fácil-Médio     |
| **Tasks**         | Adicionar novos workflows de tasks         | Médio           |
| **Agents**        | Criar novos agents de IA                   | Médio           |
| **Squads**        | Pacote de agents + tasks + workflows       | Avançado        |
| **Core Features** | Melhorias no framework                     | Avançado        |

---

## Fluxo de Desenvolvimento

### Convenções de Commit

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

```text
<tipo>: <descrição>

<corpo opcional>
```

**Tipos:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Exemplos:**

```bash
git commit -m "feat(agent): add security-auditor agent"
git commit -m "fix: resolve memory leak in config loader"
git commit -m "docs: update contribution guide"
```

### Processo de Pull Request

1. **Crie o PR** apontando para a branch `main`
2. **Checks automáticos** são executados (lint, typecheck, test, build)
3. **Review do CodeRabbit** fornece feedback automatizado por IA
4. **Review do maintainer** - pelo menos 1 aprovação é necessária
5. **Merge** após todos os checks passarem

---

## Contribuindo com Agents

Agents são personas de IA com expertise e comandos específicos.

### Localização dos Arquivos de Agent

```text
.aiox-core/development/agents/seu-agent.md
```

### Estrutura Obrigatória do Agent

```yaml
agent:
  name: AgentName
  id: agent-id # kebab-case, único
  title: Descriptive Title
  icon: emoji
  whenToUse: 'When to activate this agent'

persona_profile:
  archetype: Builder | Analyst | Guardian | Operator | Strategist

  communication:
    tone: pragmatic | friendly | formal | analytical
    emoji_frequency: none | low | medium | high

    vocabulary:
      - domain-term-1
      - domain-term-2

    greeting_levels:
      minimal: 'Short greeting'
      named: 'Named greeting with personality'
      archetypal: 'Full archetypal greeting'

    signature_closing: 'Signature phrase'

persona:
  role: "Agent's primary role"
  style: 'Communication style'
  identity: "Agent's identity description"
  focus: 'What the agent focuses on'

  core_principles:
    - Principle 1
    - Principle 2

commands:
  - help: Show available commands
  - custom-command: Command description

dependencies:
  tasks:
    - related-task.md
  tools:
    - tool-name
```

### Checklist de Contribuição de Agent

- [ ] O ID do agent é único e usa kebab-case
- [ ] O `persona_profile` está completo com archetype e communication
- [ ] Todos os comandos possuem descrições
- [ ] As dependências listam todas as tasks necessárias
- [ ] Não contém credenciais ou dados sensíveis hardcoded
- [ ] Segue os padrões existentes no codebase

### Template de PR para Agents

Use o template **Agent Contribution** ao criar seu PR.

---

## Contribuindo com Tasks

Tasks são workflows executáveis que os agents podem rodar.

### Localização dos Arquivos de Task

```text
.aiox-core/development/tasks/sua-task.md
```

### Estrutura Obrigatória da Task

```markdown
# Nome da Task

**Description:** O que esta task faz
**Agent(s):** @dev, @qa, etc.
**Elicit:** true | false

---

## Pré-requisitos

- Pré-requisito 1
- Pré-requisito 2

## Passos

### Passo 1: Primeiro Passo

Descrição do que fazer.

**Ponto de Elicitação (se elicit: true):**

- Pergunta para o usuário
- Opções a apresentar

### Passo 2: Segundo Passo

Continue com mais passos...

## Entregáveis

- [ ] Entregável 1
- [ ] Entregável 2

## Tratamento de Erros

Se X acontecer, faça Y.

---

## Dependências

- `dependency-1.md`
- `dependency-2.md`
```

### Checklist de Contribuição de Task

- [ ] A task possui descrição e propósito claros
- [ ] Os passos são sequenciais e lógicos
- [ ] Os pontos de elicitação estão claros (se aplicável)
- [ ] Os entregáveis estão bem definidos
- [ ] Orientações de tratamento de erros incluídas
- [ ] As dependências existem no codebase

### Template de PR para Tasks

Use o template **Task Contribution** ao criar seu PR.

---

## Contribuindo com Squads

Squads são pacotes de agents, tasks e workflows relacionados.

### Estrutura do Squad

```text
seu-squad/
├── manifest.yaml       # Metadados do squad
├── agents/
│   └── seu-agent.md
├── tasks/
│   └── sua-task.md
└── workflows/
    └── seu-workflow.yaml
```

### Manifesto do Squad

```yaml
name: seu-squad
version: 1.0.0
description: O que este squad faz
author: Seu Nome
dependencies:
  - base-squad (opcional)
agents:
  - seu-agent
tasks:
  - sua-task
```

### Recursos sobre Squads

- [Guia de Squads](docs/guides/squads-guide.md) - Documentação completa
- [Discussões sobre Squads](https://github.com/SynkraAI/aiox-core/discussions/categories/ideas) - Compartilhe ideias

---

## Processo de Code Review

### Checks Automáticos

Ao submeter um PR, os seguintes checks são executados automaticamente:

| Check          | Descrição                     | Obrigatório |
| -------------- | ----------------------------- | ----------- |
| **ESLint**     | Estilo e qualidade de código  | Sim         |
| **TypeScript** | Verificação de tipos          | Sim         |
| **Build**      | Verificação de build          | Sim         |
| **Tests**      | Suite de testes Jest          | Sim         |
| **Coverage**   | Cobertura mínima de 80%      | Sim         |

### Review do CodeRabbit por IA

O [CodeRabbit](https://coderabbit.ai) revisa automaticamente seu PR e fornece feedback sobre:

- Qualidade de código e boas práticas
- Preocupações de segurança
- Padrões específicos do AIOS (agents, tasks, workflows)
- Problemas de performance

**Níveis de Severidade:**

| Nível        | Ação Necessária                                  |
| ------------ | ------------------------------------------------ |
| **CRITICAL** | Deve ser corrigido antes do merge                |
| **HIGH**     | Fortemente recomendado corrigir                  |
| **MEDIUM**   | Considere corrigir ou documente como tech debt   |
| **LOW**      | Melhoria opcional                                |

**Respondendo ao CodeRabbit:**

- Resolva issues CRITICAL e HIGH antes de solicitar review
- Issues MEDIUM podem ser documentados para acompanhamento
- Issues LOW são informativos

### Review do Maintainer

Após os checks automáticos passarem, um maintainer irá:

1. Verificar se as alterações atendem aos padrões do projeto
2. Checar implicações de segurança
3. Garantir que a documentação foi atualizada
4. Aprovar ou solicitar alterações

### Requisitos para Merge

- [ ] Todos os checks de CI passando
- [ ] Pelo menos 1 aprovação de maintainer
- [ ] Todas as conversas resolvidas
- [ ] Sem conflitos de merge
- [ ] Branch atualizada com a main

---

## Sistema de Validação

O AIOS implementa uma estratégia de **Defesa em Profundidade** com 3 camadas de validação:

### Camada 1: Pre-commit (Local)

**Performance:** < 5 segundos

- ESLint com cache
- Compilação incremental do TypeScript
- Sincronização de IDE (auto-stage de arquivos de comando da IDE)

### Camada 2: Pre-push (Local)

**Performance:** < 2 segundos

- Validação de checkboxes de stories
- Verificações de consistência de status

### Camada 3: CI/CD (Cloud)

**Performance:** 2-5 minutos

- Lint e verificação de tipos completos
- Suite de testes completa
- Relatório de cobertura
- Validação de stories
- Regras de proteção de branch

---

## Padrões de Código

### JavaScript/TypeScript

- Recursos ES2022
- Prefira `const` ao invés de `let`
- Use async/await ao invés de promises
- Adicione comentários JSDoc para APIs públicas
- Siga o estilo de código existente

### Organização de Arquivos

```
.aiox-core/
├── development/
│   ├── agents/      # Definições de agents
│   ├── tasks/       # Workflows de tasks
│   └── workflows/   # Workflows multi-step
├── core/            # Utilitários principais
└── product/
    └── templates/   # Templates de documentos

docs/
├── guides/          # Guias de usuário
└── architecture/    # Arquitetura do sistema
```

### ESLint & TypeScript

- Extends: `eslint:recommended`, `@typescript-eslint/recommended`
- Target: ES2022
- Strict mode habilitado
- Sem console.log em produção (warnings)

---

## Requisitos de Testes

### Requisitos de Cobertura

- **Mínimo:** 80% de cobertura (branches, functions, lines, statements)
- **Testes Unitários:** Obrigatórios para todas as novas funções
- **Testes de Integração:** Obrigatórios para workflows

### Executando Testes

```bash
npm test                    # Executar todos os testes
npm run test:coverage       # Com relatório de cobertura
npm run test:watch          # Modo watch
npm test -- path/to/test.js # Arquivo específico
```

### Escrevendo Testes

```javascript
describe('MyModule', () => {
  it('should do something', () => {
    const result = myFunction();
    expect(result).toBe(expected);
  });
});
```

---

## Perguntas Frequentes

### P: Quanto tempo leva o review?

**R:** Nosso objetivo é dar o primeiro review dentro de 24-48 horas. Alterações complexas podem levar mais tempo.

### P: Posso contribuir sem testes?

**R:** Testes são fortemente encorajados. Para alterações apenas de documentação, testes podem não ser necessários.

### P: E se meu PR tiver conflitos?

**R:** Faça rebase da sua branch com a main mais recente:

```bash
git fetch upstream
git rebase upstream/main
git push --force-with-lease
```

### P: Posso contribuir em português?

**R:** Sim! Aceitamos PRs em português. Você está lendo este documento, que é a versão em português do [CONTRIBUTING.md](CONTRIBUTING.md).

### P: Como me torno um maintainer?

**R:** Contribuições consistentes e de alta qualidade ao longo do tempo. Comece com correções pequenas e evolua para funcionalidades maiores.

### P: Meus checks de CI estão falhando. O que faço?

**R:** Verifique os logs do GitHub Actions:

```bash
gh pr checks  # Ver status dos checks do PR
```

Correções comuns:

- Execute `npm run lint -- --fix` para problemas de estilo
- Execute `npm run typecheck` para ver erros de tipos
- Certifique-se de que os testes passam localmente antes de fazer push

---

## Obtendo Ajuda

- **GitHub Issues:** [Abra uma issue](https://github.com/SynkraAI/aiox-core/issues)
- **Discussões:** [Inicie uma discussão](https://github.com/SynkraAI/aiox-core/discussions)
- **Comunidade:** [Discussões](https://github.com/SynkraAI/aiox-core/discussions)

---

## Trabalhando com o Pro

O AIOX usa um modelo Open Core com um git submodule privado `pro/`.

### Para Contribuidores Open-Source

**Você NÃO precisa do submodule pro/.** O clone padrão funciona perfeitamente:

```bash
git clone https://github.com/SynkraAI/aiox-core.git
cd aiox-core
npm install && npm test  # Todos os testes passam sem o pro/
```

O diretório `pro/` simplesmente não existirá no seu clone — isso é esperado e todas as funcionalidades, testes e CI funcionam sem ele.

### Para Membros do Time (com Acesso ao Pro)

```bash
# Clone com submodule
git clone --recurse-submodules https://github.com/SynkraAI/aiox-core.git

# Ou adicione a um clone existente
git submodule update --init pro
```

**Ordem de push:** Sempre faça push das alterações do `pro/` primeiro, depois do `aiox-core`.

### Futuro: Configuração via CLI

```bash
# Disponível em uma versão futura
aios setup --pro
```

Para o guia completo de workflow de desenvolvimento, veja [Pro Developer Workflow](docs/guides/workflows/pro-developer-workflow.md).

---

## Recursos Adicionais

- [Guia da Comunidade](COMMUNITY.md) - Como participar
- [Guia de Squads](docs/guides/squads-guide.md) - Crie equipes de agents
- [Arquitetura](docs/architecture/) - Design do sistema
- [Roadmap](ROADMAP.md) - Direção do projeto

---

**Obrigado por contribuir com o Synkra AIOX!**
