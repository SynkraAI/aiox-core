<!--
  Tradução: PT-BR
  Original: /docs/guides/user-guide.md
  Última sincronização: 2026-01-29
-->

# Guia do Usuário AIOS

> **PT-BR**

---

Guia completo para usar o Synkra AIOS - o Sistema Orquestrado por IA para Desenvolvimento Full Stack.

**Versão:** 2.1.0
**Última Atualização:** 2026-01-28

---

## Início Rápido

### Pré-requisitos

Antes de usar o AIOS, certifique-se de ter:

- **Node.js** versão 18.0.0 ou superior
- **npm** versão 8.0.0 ou superior
- **Git** para controle de versão
- Uma chave de API de provedor de IA (Anthropic, OpenAI ou compatível)

### Instalação

```bash
# Novo projeto (Greenfield)
npx aios-core init my-project

# Projeto existente (Brownfield)
cd existing-project
npx aios-core install
```

### Primeiros Passos

```bash
# Navegue até seu projeto
cd my-project

# Liste agentes disponíveis
aios agents list

# Ative um agente
@dev

# Obtenha ajuda
*help
```

---

## Conceitos Fundamentais

### Filosofia

> **"Estrutura é Sagrada. Tom é Flexível."**

O AIOS fornece estrutura orquestrada enquanto permite flexibilidade na comunicação. Isso significa:

- **Fixo:** Posições de templates, ordem de seções, formatos de métricas, estrutura de arquivos, workflows
- **Flexível:** Mensagens de status, escolhas de vocabulário, uso de emojis, personalidade, tom

### A Diferença do AIOS

| Desenvolvimento Tradicional com IA | AIOS                                        |
| ---------------------------------- | ------------------------------------------- |
| Agentes descoordenados             | 11 agentes especializados com papéis claros |
| Resultados inconsistentes          | Workflows estruturados com quality gates    |
| Contexto perdido entre sessões     | Memória persistente e aprendizado           |
| Reinventando a roda                | Tasks, workflows e squads reutilizáveis     |

---

## Agentes

O AIOS inclui 11 agentes especializados, cada um com papel e personalidade distintos:

| Agente    | ID               | Arquétipo    | Responsabilidade          |
| --------- | ---------------- | ------------ | ------------------------- |
| **Dex**   | `@dev`           | Construtor   | Implementação de código   |
| **Quinn** | `@qa`            | Guardião     | Garantia de qualidade     |
| **Aria**  | `@architect`     | Arquiteto    | Arquitetura técnica       |
| **Nova**  | `@po`            | Visionário   | Backlog do produto        |
| **Kai**   | `@pm`            | Equilibrador | Estratégia do produto     |
| **River** | `@sm`            | Facilitador  | Facilitação de processos  |
| **Zara**  | `@analyst`       | Explorador   | Análise de negócios       |
| **Dara**  | `@data-engineer` | Arquiteto    | Engenharia de dados       |
| **Felix** | `@devops`        | Otimizador   | CI/CD e operações         |
| **Uma**   | `@ux-expert`     | Criador      | Experiência do usuário    |
| **Pax**   | `@aios-master`   | Orquestrador | Orquestração do framework |

### Ativação de Agentes

```bash
# Ative um agente usando sintaxe @
@dev                # Ativar Dex (Desenvolvedor)
@qa                 # Ativar Quinn (QA)
@architect          # Ativar Aria (Arquiteto)
@aios-master        # Ativar Pax (Orquestrador)

# Comandos de agente usam prefixo *
*help               # Mostrar comandos disponíveis
*task <name>        # Executar task específica
*exit               # Desativar agente
```

### Contexto do Agente

Quando um agente está ativo:

- Siga a persona e expertise específicas daquele agente
- Use os padrões de workflow designados do agente
- Mantenha a perspectiva do agente durante toda a interação

---

## Tasks

Tasks são o ponto de entrada principal no AIOS. Tudo é uma task.

### Arquitetura Task-First

```
Requisição do Usuário --> Task --> Execução do Agente --> Saída
                           |
                      Workflow (se multi-etapa)
```

### Executando Tasks

```bash
# Executar uma task específica
*task develop-story --story=1.1

# Listar tasks disponíveis
aios tasks list

# Obter ajuda da task
*task --help
```

### Categorias de Tasks

| Categoria           | Exemplos                                |
| ------------------- | --------------------------------------- |
| **Desenvolvimento** | develop-story, code-review, refactor    |
| **Qualidade**       | run-tests, validate-code, security-scan |
| **Documentação**    | generate-docs, update-readme            |
| **Workflow**        | create-story, manage-sprint             |

---

## Workflows

Workflows orquestram múltiplas tasks e agentes para operações complexas.

### Workflows Disponíveis

| Workflow                 | Caso de Uso                | Agentes Envolvidos |
| ------------------------ | -------------------------- | ------------------ |
| `greenfield-fullstack`   | Novo projeto full-stack    | Todos os agentes   |
| `brownfield-integration` | Adicionar AIOS a existente | dev, architect     |
| `fork-join`              | Execução paralela de tasks | Múltiplos          |
| `organizer-worker`       | Execução delegada          | po, dev            |
| `data-pipeline`          | Workflows de ETL           | data-engineer, qa  |

### Executando Workflows

```bash
# Iniciar um workflow
aios workflow greenfield-fullstack

# Com parâmetros
aios workflow brownfield-integration --target=./existing-project
```

---

## Squads

Squads são equipes modulares de agentes de IA que estendem a funcionalidade do AIOS.

### O que é um Squad?

Um squad é um pacote autocontido contendo:

| Componente    | Propósito                               |
| ------------- | --------------------------------------- |
| **Agents**    | Personas de IA específicas do domínio   |
| **Tasks**     | Workflows executáveis                   |
| **Workflows** | Orquestrações multi-etapa               |
| **Config**    | Padrões de código, tech stack           |
| **Templates** | Templates de geração de documentos      |
| **Tools**     | Integrações de ferramentas customizadas |

### Níveis de Distribuição

```
Nível 1: LOCAL        --> ./squads/           (Privado)
Nível 2: AIOS-SQUADS  --> github.com/SynkraAI (Público/Gratuito)
Nível 3: SYNKRA API   --> api.synkra.dev      (Marketplace)
```

### Usando Squads

```bash
# Listar squads disponíveis
aios squads list

# Baixar um squad
aios squads download etl-squad

# Criar seu próprio squad
@squad-creator
*create-squad my-custom-squad
```

### Squads Oficiais

| Squad           | Descrição                          |
| --------------- | ---------------------------------- |
| `etl-squad`     | Coleta e transformação de dados    |
| `creator-squad` | Utilitários de geração de conteúdo |

---

## Uso Básico

### Estrutura do Projeto

```
my-project/
├── .aios-core/                # Configuração do framework
│   ├── development/agents/    # Definições de agentes
│   ├── development/tasks/     # Workflows de tasks
│   ├── product/templates/     # Templates de documentos
│   └── product/checklists/    # Checklists de validação
├── docs/
│   ├── stories/               # Stories de desenvolvimento
│   ├── architecture/          # Arquitetura do sistema
│   └── guides/                # Guias do usuário
├── squads/                    # Squads locais
└── src/                       # Código fonte da aplicação
```

### Comandos Comuns

```bash
# Comandos do AIOS Master
*help                # Mostrar comandos disponíveis
*create-story        # Criar nova story
*task {name}         # Executar task específica
*workflow {name}     # Executar workflow

# Comandos de Desenvolvimento
npm run dev          # Iniciar desenvolvimento
npm test             # Executar testes
npm run lint         # Verificar estilo de código
npm run build        # Build do projeto
```

### Desenvolvimento Orientado a Stories

1. **Criar uma story** - Use `*create-story` para definir requisitos
2. **Trabalhar a partir de stories** - Todo desenvolvimento começa com uma story em `docs/stories/`
3. **Atualizar progresso** - Marque checkboxes conforme tasks completam: `[ ]` --> `[x]`
4. **Rastrear mudanças** - Mantenha a seção File List na story
5. **Seguir critérios** - Implemente exatamente o que os critérios de aceitação especificam

---

## Configuração

### Arquivo Principal de Configuração

A configuração principal está em `.aios-core/core/config/`:

```yaml
# aios.config.yaml
version: 2.1.0
projectName: my-project

features:
  - agents
  - tasks
  - workflows
  - squads
  - quality-gates

ai:
  provider: anthropic
  model: claude-3-opus

environment: development
```

### Variáveis de Ambiente

```bash
# Configuração do Provedor de IA
ANTHROPIC_API_KEY=sua-chave-anthropic-api
# ou
OPENAI_API_KEY=sua-chave-openai-api

# Configurações do Framework
NODE_ENV=development
AIOS_DEBUG=false
```

### Integração com IDE

O AIOS suporta múltiplas IDEs. A configuração é sincronizada entre:

- Claude Code (`.claude/`)
- Cursor (`.cursor/`)
- VS Code (`.vscode/`)

```bash
# Sincronizar agentes para sua IDE
npm run sync:ide
```

---

## Solução de Problemas

### Problemas Comuns

**Agente não ativa**

```bash
# Verificar se agente existe
ls .aios-core/development/agents/

# Verificar configuração
aios doctor
```

**Execução de task falha**

```bash
# Verificar definição da task
cat .aios-core/development/tasks/{task-name}.md

# Executar com saída verbose
*task {name} --verbose
```

**Problemas de memória/contexto**

```bash
# Limpar cache
rm -rf .aios-core/core/cache/*

# Reconstruir índice
aios rebuild
```

### Obtendo Ajuda

- **GitHub Discussions**: [github.com/SynkraAI/aios-core/discussions](https://github.com/SynkraAI/aios-core/discussions)
- **Issue Tracker**: [github.com/SynkraAI/aios-core/issues](https://github.com/SynkraAI/aios-core/issues)
- **Discord**: [Entre no nosso servidor](https://discord.gg/gk8jAdXWmj)

---

## Próximos Passos

### Caminho de Aprendizado

1. **Início Rápido** - Siga este guia para começar
2. **Referência de Agentes** - Aprenda sobre as capacidades de cada agente: [Guia de Referência de Agentes](../agent-reference-guide.md)
3. **Arquitetura** - Entenda o sistema: [Visão Geral da Arquitetura](../architecture/ARCHITECTURE-INDEX.md)
4. **Squads** - Estenda funcionalidades: [Guia de Squads](./squads-guide.md)

### Tópicos Avançados

- [Guia de Quality Gates](./quality-gates.md)
- [Estratégia Multi-Repo](../../architecture/multi-repo-strategy.md)
- [Integração MCP](./mcp-global-setup.md)
- [Integração com IDE](../../ide-integration.md)

---

## Melhores Práticas

### 1. Comece com Stories

Sempre crie uma story antes de implementar funcionalidades:

```bash
@aios-master
*create-story
```

### 2. Use o Agente Certo

Escolha o agente apropriado para cada task:

| Task               | Agente     |
| ------------------ | ---------- |
| Escrever código    | @dev       |
| Revisar código     | @qa        |
| Projetar sistema   | @architect |
| Definir requisitos | @po        |

### 3. Siga Quality Gates

O AIOS implementa quality gates em 3 camadas:

1. **Camada 1 (Local)**: Hooks de pre-commit, linting, verificação de tipos
2. **Camada 2 (CI/CD)**: Testes automatizados, review do CodeRabbit
3. **Camada 3 (Humano)**: Review de arquitetura, aprovação final

### 4. Mantenha o Contexto

Mantenha o contexto entre sessões:

- Usando desenvolvimento orientado a stories
- Atualizando checkboxes de progresso
- Documentando decisões nas stories

### 5. Aproveite os Squads

Não reinvente a roda - verifique se existem squads:

```bash
aios squads search {keyword}
```

---

## Documentação Relacionada

- [Primeiros Passos](../getting-started.md)
- [Guia de Instalação](../installation/README.md)
- [Guia de Referência de Agentes](../agent-reference-guide.md)
- [Visão Geral da Arquitetura](../architecture/ARCHITECTURE-INDEX.md)
- [Guia de Squads](./squads-guide.md)
- [Solução de Problemas](../troubleshooting.md)

---

_Guia do Usuário Synkra AIOS v4.0_
