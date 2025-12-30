# Contribuindo para o Synkra AIOS

> **[English Version](CONTRIBUTING.md)**

Bem-vindo ao AIOS! Obrigado pelo seu interesse em contribuir. Este guia vai ajuda-lo a entender nosso fluxo de trabalho, processo de contribuicao e como submeter suas alteracoes.

## Indice

- [Inicio Rapido](#inicio-rapido)
- [Tipos de Contribuicoes](#tipos-de-contribuicoes)
- [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
- [Contribuindo Agents](#contribuindo-agents)
- [Contribuindo Tasks](#contribuindo-tasks)
- [Contribuindo Squads](#contribuindo-squads)
- [Processo de Code Review](#processo-de-code-review)
- [Sistema de Validacao](#sistema-de-validacao)
- [Padroes de Codigo](#padroes-de-codigo)
- [Requisitos de Testes](#requisitos-de-testes)
- [Perguntas Frequentes](#perguntas-frequentes)
- [Obtendo Ajuda](#obtendo-ajuda)

---

## Inicio Rapido

### 1. Fork e Clone

```bash
# Faca fork via GitHub UI, depois clone seu fork
git clone https://github.com/SEU_USUARIO/aios-core.git
cd aios-core

# Adicione o remote upstream
git remote add upstream https://github.com/SynkraAI/aios-core.git
```

### 2. Configure o Ambiente de Desenvolvimento

**Pre-requisitos:**

- Node.js >= 20.0.0
- npm
- Git
- GitHub CLI (`gh`) - opcional mas recomendado

```bash
# Instale as dependencias
npm install

# Verifique a configuracao
npm test
npm run lint
npm run typecheck
```

### 3. Crie uma Branch

```bash
git checkout -b feature/nome-da-sua-feature
```

**Convencoes de Nomenclatura:**
| Prefixo | Uso |
|---------|-----|
| `feature/` | Novas funcionalidades, agents, tasks |
| `fix/` | Correcoes de bugs |
| `docs/` | Atualizacoes de documentacao |
| `refactor/` | Refatoracao de codigo |
| `test/` | Adicoes/melhorias de testes |

### 4. Faca Suas Alteracoes

Siga o guia relevante abaixo para seu tipo de contribuicao.

### 5. Execute a Validacao Local

```bash
npm run lint      # Estilo de codigo
npm run typecheck # Verificacao de tipos
npm test          # Executar testes
npm run build     # Verificar build
```

### 6. Push e Crie o PR

```bash
git push origin feature/nome-da-sua-feature
```

Depois crie um Pull Request no GitHub apontando para a branch `main`.

---

## Tipos de Contribuicoes

| Contribuicao          | Descricao                            | Dificuldade |
| --------------------- | ------------------------------------ | ----------- |
| **Documentacao**      | Corrigir erros, melhorar guias       | Facil       |
| **Correcoes de Bugs** | Corrigir issues reportadas           | Facil-Medio |
| **Tasks**             | Adicionar novos workflows de tarefas | Medio       |
| **Agents**            | Criar novas personas de agentes IA   | Medio       |
| **Squads**            | Pacote de agents + tasks + workflows | Avancado    |
| **Core Features**     | Melhorias no framework               | Avancado    |

---

## Fluxo de Desenvolvimento

### Convencoes de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>: <descricao>

<corpo opcional>
```

**Tipos:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Exemplos:**

```bash
git commit -m "feat(agent): adicionar agent security-auditor"
git commit -m "fix: resolver memory leak no config loader"
git commit -m "docs: atualizar guia de contribuicao"
```

### Processo de Pull Request

1. **Crie o PR** apontando para a branch `main`
2. **Verificacoes automaticas** executam (lint, typecheck, test, build)
3. **Review do CodeRabbit** fornece feedback automatizado
4. **Review do maintainer** - minimo 1 aprovacao necessaria
5. **Merge** apos todas as verificacoes passarem

---

## Contribuindo Agents

Agents sao personas de IA com expertise e comandos especificos.

### Localizacao do Arquivo

```
.aios-core/development/agents/seu-agent.md
```

### Estrutura Obrigatoria

```yaml
agent:
  name: NomeDoAgent
  id: agent-id # kebab-case, unico
  title: Titulo Descritivo
  icon: emoji
  whenToUse: 'Quando ativar este agent'

persona_profile:
  archetype: Builder | Analyst | Guardian | Operator | Strategist

  communication:
    tone: pragmatic | friendly | formal | analytical
    emoji_frequency: none | low | medium | high

    vocabulary:
      - termo-dominio-1
      - termo-dominio-2

    greeting_levels:
      minimal: 'Saudacao curta'
      named: 'Saudacao com nome e personalidade'
      archetypal: 'Saudacao arquetipal completa'

    signature_closing: 'Frase de assinatura'

persona:
  role: 'Papel principal do agent'
  style: 'Estilo de comunicacao'
  identity: 'Descricao da identidade'
  focus: 'No que o agent foca'

  core_principles:
    - Principio 1
    - Principio 2

commands:
  - help: Mostrar comandos disponiveis
  - comando-custom: Descricao do comando

dependencies:
  tasks:
    - task-relacionada.md
  tools:
    - nome-ferramenta
```

### Checklist para Agents

- [ ] ID do agent e unico e usa kebab-case
- [ ] `persona_profile` esta completo com archetype e communication
- [ ] Todos os comandos tem descricoes
- [ ] Dependencies listam todas as tasks necessarias
- [ ] Sem credenciais ou dados sensiveis hardcoded
- [ ] Segue padroes existentes no codebase

### Template de PR para Agents

Use o template **Agent Contribution** ao criar seu PR.

---

## Contribuindo Tasks

Tasks sao workflows executaveis que agents podem rodar.

### Localizacao do Arquivo

```
.aios-core/development/tasks/sua-task.md
```

### Estrutura Obrigatoria

```markdown
# Nome da Task

**Descricao:** O que esta task faz
**Agent(s):** @dev, @qa, etc.
**Elicit:** true | false

---

## Pre-requisitos

- Pre-requisito 1
- Pre-requisito 2

## Passos

### Passo 1: Primeiro Passo

Descricao do que fazer.

**Ponto de Elicitacao (se elicit: true):**

- Pergunta para o usuario
- Opcoes a apresentar

### Passo 2: Segundo Passo

Continue com mais passos...

## Entregaveis

- [ ] Entregavel 1
- [ ] Entregavel 2

## Tratamento de Erros

Se X acontecer, faca Y.

---

## Dependencias

- `dependencia-1.md`
- `dependencia-2.md`
```

### Checklist para Tasks

- [ ] Task tem descricao e proposito claros
- [ ] Passos sao sequenciais e logicos
- [ ] Pontos de elicitacao sao claros (se aplicavel)
- [ ] Entregaveis estao bem definidos
- [ ] Orientacao de tratamento de erros incluida
- [ ] Dependencias existem no codebase

### Template de PR para Tasks

Use o template **Task Contribution** ao criar seu PR.

---

## Contribuindo Squads

Squads sao pacotes de agents, tasks e workflows relacionados.

### Estrutura de Squad

```
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

### Recursos para Squads

- [Guia de Squads](docs/guides/squads-guide.md) - Documentacao completa
- [Template de Squad](templates/squad/) - Comece de um template funcional
- [Discussoes de Squads](https://github.com/SynkraAI/aios-core/discussions/categories/ideas) - Compartilhe ideias

---

## Processo de Code Review

### Verificacoes Automaticas

Quando voce submete um PR, as seguintes verificacoes executam automaticamente:

| Verificacao    | Descricao                    | Obrigatoria |
| -------------- | ---------------------------- | ----------- |
| **ESLint**     | Estilo e qualidade de codigo | Sim         |
| **TypeScript** | Verificacao de tipos         | Sim         |
| **Build**      | Verificacao de build         | Sim         |
| **Tests**      | Suite de testes Jest         | Sim         |
| **Coverage**   | Minimo 80% cobertura         | Sim         |

### Review do CodeRabbit

[CodeRabbit](https://coderabbit.ai) automaticamente revisa seu PR e fornece feedback sobre:

- Qualidade de codigo e boas praticas
- Preocupacoes de seguranca
- Padroes especificos do AIOS (agents, tasks, workflows)
- Problemas de performance

**Niveis de Severidade:**

| Nivel        | Acao Necessaria                                |
| ------------ | ---------------------------------------------- |
| **CRITICAL** | Deve corrigir antes do merge                   |
| **HIGH**     | Fortemente recomendado corrigir                |
| **MEDIUM**   | Considere corrigir ou documente como tech debt |
| **LOW**      | Melhoria opcional                              |

**Respondendo ao CodeRabbit:**

- Enderece issues CRITICAL e HIGH antes de solicitar review
- Issues MEDIUM podem ser documentadas para follow-up
- Issues LOW sao informativas

### Review do Maintainer

Apos as verificacoes automaticas passarem, um maintainer ira:

1. Verificar se as alteracoes atendem aos padroes do projeto
2. Checar implicacoes de seguranca
3. Garantir que a documentacao foi atualizada
4. Aprovar ou solicitar alteracoes

### Requisitos para Merge

- [ ] Todas as verificacoes de CI passam
- [ ] Pelo menos 1 aprovacao de maintainer
- [ ] Todas as conversas resolvidas
- [ ] Sem conflitos de merge
- [ ] Branch atualizada com main

---

## Sistema de Validacao

AIOS implementa uma estrategia de **Defesa em Profundidade** com 3 camadas de validacao:

### Camada 1: Pre-commit (Local)

**Performance:** < 5 segundos

- ESLint com cache
- Compilacao incremental TypeScript
- IDE sync (auto-stage de arquivos de comando IDE)

### Camada 2: Pre-push (Local)

**Performance:** < 2 segundos

- Validacao de checkboxes de story
- Verificacoes de consistencia de status

### Camada 3: CI/CD (Cloud)

**Performance:** 2-5 minutos

- Lint e verificacao de tipos completos
- Suite de testes completa
- Relatorio de cobertura
- Validacao de story
- Regras de protecao de branch

---

## Padroes de Codigo

### JavaScript/TypeScript

- Recursos ES2022
- Prefira `const` sobre `let`
- Use async/await sobre promises
- Adicione comentarios JSDoc para APIs publicas
- Siga o estilo de codigo existente

### Organizacao de Arquivos

```
.aios-core/
├── development/
│   ├── agents/      # Definicoes de agents
│   ├── tasks/       # Workflows de tasks
│   └── workflows/   # Workflows multi-etapas
├── core/            # Utilitarios core
└── product/
    └── templates/   # Templates de documentos

docs/
├── guides/          # Guias do usuario
└── architecture/    # Arquitetura do sistema
```

### ESLint & TypeScript

- Estende: `eslint:recommended`, `@typescript-eslint/recommended`
- Target: ES2022
- Modo strict habilitado
- Sem console.log em producao (avisos)

---

## Requisitos de Testes

### Requisitos de Cobertura

- **Minimo:** 80% cobertura (branches, funcoes, linhas, statements)
- **Testes Unitarios:** Obrigatorios para todas as novas funcoes
- **Testes de Integracao:** Obrigatorios para workflows

### Executando Testes

```bash
npm test                    # Executar todos os testes
npm run test:coverage       # Com relatorio de cobertura
npm run test:watch          # Modo watch
npm test -- caminho/para/teste.js # Arquivo especifico
```

### Escrevendo Testes

```javascript
describe('MeuModulo', () => {
  it('deve fazer algo', () => {
    const resultado = minhaFuncao();
    expect(resultado).toBe(esperado);
  });
});
```

---

## Perguntas Frequentes

### P: Quanto tempo demora o review?

**R:** Nosso objetivo e o primeiro review em 24-48 horas. Alteracoes complexas podem demorar mais.

### P: Posso contribuir sem testes?

**R:** Testes sao fortemente encorajados. Para alteracoes apenas de documentacao, testes podem nao ser necessarios.

### P: E se meu PR tiver conflitos?

**R:** Faca rebase da sua branch na main mais recente:

```bash
git fetch upstream
git rebase upstream/main
git push --force-with-lease
```

### P: Posso contribuir em portugues?

**R:** Sim! Aceitamos PRs em portugues. Voce esta lendo o guia certo!

### P: Como me torno um maintainer?

**R:** Contribuicoes consistentes e de alta qualidade ao longo do tempo. Comece com pequenas correcoes e avance para features maiores.

### P: Minhas verificacoes de CI estao falhando. O que faco?

**R:** Verifique os logs do GitHub Actions:

```bash
gh pr checks  # Ver status das verificacoes do PR
```

Correcoes comuns:

- Execute `npm run lint -- --fix` para problemas de estilo
- Execute `npm run typecheck` para ver erros de tipo
- Garanta que os testes passam localmente antes do push

---

## Obtendo Ajuda

- **GitHub Issues:** [Abra uma issue](https://github.com/SynkraAI/aios-core/issues)
- **Discussoes:** [Inicie uma discussao](https://github.com/SynkraAI/aios-core/discussions)
- **Comunidade:** [COMMUNITY-PT.md](COMMUNITY-PT.md)

---

## Recursos Adicionais

- [Guia da Comunidade](COMMUNITY-PT.md) - Como participar
- [Guia de Squads](docs/guides/squads-guide.md) - Crie equipes de agents
- [Arquitetura](docs/architecture/) - Design do sistema
- [Roadmap](ROADMAP-PT.md) - Direcao do projeto

---

**Obrigado por contribuir para o Synkra AIOS!**
