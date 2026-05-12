# Guia de Integração de Ferramentas de Agentes

> **PT** | [EN](../architecture/agent-tool-integration-guide.md) | [ES](../es/architecture/agent-tool-integration-guide.md)

---

**Versão:** 1.0.0
**Última Atualização:** 2026-01-26
**Status:** Referência Oficial

---

## Visão Geral

Este guia explica como ferramentas são integradas com agentes AIOX. Ferramentas estendem as capacidades dos agentes fornecendo acesso a serviços externos, APIs e recursos do sistema.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Integração de Ferramentas de Agentes      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Definição do Agente (arquivo .md com YAML)               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  dependencies:                                      │   │
│   │    tools: [git, coderabbit, context7]              │   │
│   │    tasks: [task-a.md, task-b.md]                   │   │
│   │    checklists: [checklist-a.md]                    │   │
│   └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Tipos de Ferramentas                               │   │
│   │  ├── Ferramentas CLI (git, npm, gh)                │   │
│   │  ├── Servidores MCP (EXA, Context7, Apify)          │   │
│   │  └── Serviços Externos (CodeRabbit, Supabase)      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Declaração de Dependências

Agentes declaram suas dependências no bloco YAML dentro de seu arquivo de definição `.md`.

### Tipos de Dependências

| Tipo           | Descrição                           | Localização                        |
| -------------- | ----------------------------------- | ---------------------------------- |
| `tools`        | Ferramentas CLI e serviços externos | PATH do sistema ou MCP             |
| `tasks`        | Arquivos de workflow de tarefas     | `.aiox-core/development/tasks/`    |
| `checklists`   | Checklists de validação             | `.aiox-core/product/checklists/`   |

### Exemplo de Declaração

```yaml
# Do arquivo .aiox-core/development/agents/dev.md
dependencies:
  checklists:
    - story-dod-checklist.md
  tasks:
    - apply-qa-fixes.md
    - create-service.md
    - dev-develop-story.md
    - execute-checklist.md
  tools:
    - coderabbit # Revisão de qualidade de código pré-commit
    - git # Operações locais: add, commit, status, diff
    - context7 # Lookup de documentação de bibliotecas
    - supabase # Operações de banco de dados
    - n8n # Automação de workflows
    - browser # Testes de aplicações web
    - ffmpeg # Processamento de arquivos de mídia
```

---

## Categorias de Ferramentas por Agente

### @dev (Dex - Agente Desenvolvedor)

| Ferramenta   | Tipo     | Propósito                                    |
| ------------ | -------- | -------------------------------------------- |
| `git`        | CLI      | Controle de versão (apenas operações locais) |
| `coderabbit` | Externa  | Revisão de qualidade de código pré-commit    |
| `context7`   | MCP      | Lookup de documentação de bibliotecas        |
| `supabase`   | Externa  | Operações de banco de dados e migrações      |
| `n8n`        | Externa  | Automação de workflows                       |
| `browser`    | MCP      | Testes de aplicações web                     |
| `ffmpeg`     | CLI      | Processamento de arquivos de mídia           |

**Restrições de Git para @dev:**

- Permitido: `git add`, `git commit`, `git status`, `git diff`, `git log`, `git branch`
- Bloqueado: `git push`, `gh pr create`, `gh pr merge`
- Operações de push requerem o agente @devops

### @devops (Gage - Agente DevOps)

| Ferramenta   | Tipo     | Propósito                           |
| ------------ | -------- | ----------------------------------- |
| `git`        | CLI      | Operações git completas incluindo push |
| `gh`         | CLI      | GitHub CLI para operações de PR     |
| `docker`     | CLI      | Operações de containers             |
| `coderabbit` | Externa  | Automação de revisão de código      |

**Capacidades Únicas:**

- Único agente autorizado para fazer push para remote
- Único agente autorizado para criar/fazer merge de PRs
- Gerenciamento de infraestrutura MCP

### @qa (Quinn - Agente QA)

| Ferramenta   | Tipo | Propósito                          |
| ------------ | ---- | ---------------------------------- |
| `jest`       | CLI  | Testes unitários                   |
| `playwright` | MCP  | Testes E2E e automação de browser  |
| `npm test`   | CLI  | Executor de testes                 |

### @architect (Aria - Agente Arquiteto)

| Ferramenta | Tipo | Propósito                   |
| ---------- | ---- | --------------------------- |
| `exa`      | MCP  | Pesquisa e análise          |
| `context7` | MCP  | Referência de documentação  |

---

## Integração MCP

### Ferramentas MCP Disponíveis

Servidores MCP (Model Context Protocol) fornecem APIs estruturadas para uso de agentes.

| Servidor MCP | Ferramentas Fornecidas                                               | Usado Por        |
| ------------ | -------------------------------------------------------------------- | ---------------- |
| EXA          | `web_search_exa`, `company_research_exa`, `get_code_context_exa`    | @architect       |
| Context7     | `resolve-library-id`, `query-docs`                                  | @dev, @architect |
| Playwright   | `browser_navigate`, `browser_screenshot`, `browser_click`           | @qa              |
| Apify        | `search-actors`, `call-actor`, `get-actor-output`                   | @devops          |

### Configuração de MCP

Servidores MCP são configurados via Docker MCP Toolkit. Veja [Gerenciamento de Chaves de API do MCP](./mcp-api-keys-management.md) para configuração.

### Padrão de Uso

```
1. Agente recebe tarefa que requer dados externos
2. Agente identifica a ferramenta MCP apropriada de suas dependências
3. Agente chama a ferramenta MCP via interface de ferramentas
4. MCP retorna resposta estruturada
5. Agente processa resposta e continua a tarefa
```

---

## Integração CodeRabbit

O agente @dev inclui CodeRabbit para verificações de qualidade pré-commit.

### Configuração

```yaml
coderabbit_integration:
  enabled: true
  installation_mode: wsl # ou 'native'

  self_healing:
    enabled: true
    type: light
    max_iterations: 2
    timeout_minutes: 15
    trigger: story_completion
    severity_filter:
      - CRITICAL
    behavior:
      CRITICAL: auto_fix
      HIGH: document_only
      MEDIUM: ignore
      LOW: ignore
```

### Workflow

Antes de marcar a story como "Pronto para Revisão":

1. Execute CodeRabbit em mudanças não commitadas
2. Se problemas CRÍTICOS forem encontrados, tente auto-fix (máximo 2 iterações)
3. Documente problemas ALTOS nas Notas de Dev da story
4. Se problemas CRÍTICOS permanecerem após iterações, PARE e notifique o usuário

---

## Arquitetura de Restrições de Git

AIOX implementa governança rigorosa de operações git:

### Permissões do Agente @dev

```yaml
git_restrictions:
  allowed_operations:
    - git add
    - git commit
    - git status
    - git diff
    - git log
    - git branch
    - git checkout
    - git merge
  blocked_operations:
    - git push
    - git push --force
    - gh pr create
    - gh pr merge
```

### Permissões do Agente @devops

```yaml
git_permissions:
  full_access: true
  special_capabilities:
    - push to remote
    - create pull requests
    - merge pull requests
    - admin bypass for branch protection
```

### Workflow de Handoff

```
@dev completa a story
    ↓
@dev marca status: "Pronto para Revisão"
    ↓
Usuário ativa @devops
    ↓
@devops cria PR e faz push
```

---

## Adicionando Novas Ferramentas

### Passo 1: Atualizar Definição do Agente

Adicione a ferramenta à lista `dependencies.tools` do agente:

```yaml
dependencies:
  tools:
    - existing-tool
    - new-tool # Adicione aqui
```

### Passo 2: Documentar Uso da Ferramenta

Se a ferramenta requer configuração específica ou tem padrões de uso especiais, adicione documentação:

```yaml
tool_integration:
  new-tool:
    purpose: 'Breve descrição'
    common_commands:
      - 'new-tool --help'
      - 'new-tool run <args>'
    when_to_use: 'Use quando condição X é atendida'
```

### Passo 3: Testar Integração

Ative o agente e verifique que a ferramenta é acessível e funcional.

---

## Melhores Práticas

### FAÇA

- Declare todas as dependências de ferramentas na definição do agente
- Use a ferramenta apropriada para cada tipo de tarefa
- Siga os limites de permissão do agente
- Registre o uso de ferramentas para debug
- Valide saídas de ferramentas antes de usar

### NÃO FAÇA

- Use ferramentas não declaradas em dependências
- Contorne restrições de git (use o agente apropriado)
- Ignore códigos de retorno de ferramentas
- Exponha dados sensíveis em logs de ferramentas
- Pule validação de entrada

---

## Troubleshooting

### Ferramenta Não Encontrada

1. Verifique se a ferramenta está instalada: `which <tool-name>`
2. Verifique variável de ambiente PATH
3. Verifique se a ferramenta está declarada nas dependências do agente

### Erros de Ferramenta MCP

1. Verifique se o servidor MCP está rodando
2. Verifique se as chaves de API estão configuradas (veja [Gerenciamento de Chaves de API do MCP](./mcp-api-keys-management.md))
3. Revise a documentação específica da ferramenta

### Permissão Negada

1. Verifique se a operação é bloqueada para este agente
2. Verifique se @devops deveria ser usado no lugar
3. Verifique permissões de arquivo/diretório

---

## Documentação Relacionada

- [Gerenciamento de Chaves de API do MCP](./mcp-api-keys-management.md)
- [Regras de Uso de MCP](../../../.claude/rules/mcp-usage.md)
- [Definições de Agentes](../../../.aiox-core/development/agents/)

---

**Mantenedor:** @architect (Aria)
