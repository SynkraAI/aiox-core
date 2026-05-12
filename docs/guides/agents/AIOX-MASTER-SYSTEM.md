# Sistema do Agente @aiox-master

> **Versao:** 1.0.0
> **Criado:** 2026-02-04
> **Owner:** @aiox-master (Orion)
> **Status:** Documentacao Oficial

---

## Visao Geral

O **@aiox-master** (Orion - The Orchestrator) e o meta-agente principal do framework AIOX-FULLSTACK. Ele atua como orquestrador universal, desenvolvedor de framework e especialista no metodo AIOX. Suas principais responsabilidades incluem:

- **Orquestracao Universal**: Executa qualquer task de qualquer agente diretamente
- **Desenvolvimento de Framework**: Cria e modifica agentes, tasks, workflows e templates
- **Gestao de Componentes**: Valida, deprecia e analisa componentes do sistema
- **Coordenacao Multi-Agente**: Gerencia workflows complexos entre multiplos agentes
- **Knowledge Base**: Acesso ao conhecimento completo do AIOX Method

### Quando Usar

- Criar ou modificar componentes do framework (agentes, tasks, workflows)
- Orquestrar workflows multi-agente complexos
- Executar qualquer task diretamente sem transformacao de persona
- Operacoes de meta-framework e coordenacao cross-agente
- Acessar o Knowledge Base do AIOX (*kb)

---

## Lista Completa de Arquivos

### Arquivos Core de Tasks do @aiox-master

| Arquivo | Comando | Proposito |
|---------|---------|-----------|
| `.aiox-core/development/tasks/create-agent.md` | `*create agent` | Cria nova definicao de agente usando sistema de templates |
| `.aiox-core/development/tasks/create-task.md` | `*create task` | Cria novo arquivo de task com estrutura padronizada |
| `.aiox-core/development/tasks/create-workflow.md` | `*create workflow` | Cria nova definicao de workflow multi-agente |
| `.aiox-core/development/tasks/modify-agent.md` | `*modify agent` | Modifica agente existente com backup e rollback |
| `.aiox-core/development/tasks/modify-task.md` | `*modify task` | Modifica task existente preservando compatibilidade |
| `.aiox-core/development/tasks/modify-workflow.md` | `*modify workflow` | Modifica workflow existente mantendo integridade |
| `.aiox-core/development/tasks/analyze-framework.md` | `*analyze-framework` | Analisa estrutura do framework, redundancias e performance |
| `.aiox-core/development/tasks/deprecate-component.md` | `*deprecate-component` | Deprecia componente com timeline e migracao |
| `.aiox-core/development/tasks/propose-modification.md` | `*propose-modification` | Cria proposta de modificacao para revisao colaborativa |
| `.aiox-core/development/tasks/execute-checklist.md` | `*execute-checklist` | Executa checklist de validacao |
| `.aiox-core/development/tasks/create-doc.md` | `*create-doc` | Cria documento a partir de template YAML |
| `.aiox-core/development/tasks/advanced-elicitation.md` | `*advanced-elicitation` | Executa elicitacao avancada com multiplos metodos |
| `.aiox-core/development/tasks/kb-mode-interaction.md` | `*kb` | Habilita modo Knowledge Base interativo |
| `.aiox-core/development/tasks/correct-course.md` | `*correct-course` | Analisa e corrige desvios de processo/qualidade |
| `.aiox-core/development/tasks/update-manifest.md` | `*update-manifest` | Atualiza manifesto de equipe com novos agentes |
| `.aiox-core/development/tasks/create-next-story.md` | `*create-next-story` | Cria proxima user story |
| `.aiox-core/development/tasks/create-deep-research-prompt.md` | - | Gera prompts de pesquisa profunda |
| `.aiox-core/development/tasks/improve-self.md` | - | Auto-melhoria do agente |
| `.aiox-core/development/tasks/shard-doc.md` | `*shard-doc` | Quebra documento em partes menores |
| `.aiox-core/development/tasks/document-project.md` | `*document-project` | Gera documentacao do projeto |
| `.aiox-core/development/tasks/index-docs.md` | `*index-docs` | Indexa documentacao para busca |

### Arquivos de Definicao do Agente

| Arquivo | Proposito |
|---------|-----------|
| `.aiox-core/development/agents/aiox-master.md` | Definicao completa do agente (persona, comandos, dependencias) |
| `.claude/commands/AIOX/agents/aiox-master.md` | Comando Claude Code para ativar @aiox-master |

### Arquivos de Templates do @aiox-master

| Arquivo | Proposito |
|---------|-----------|
| `.aiox-core/development/templates/agent-template.yaml` | Template para criacao de novos agentes |
| `.aiox-core/development/templates/task-template.md` | Template para criacao de novas tasks |
| `.aiox-core/development/templates/workflow-template.yaml` | Template para criacao de novos workflows |
| `.aiox-core/development/templates/prd-tmpl.yaml` | Template para PRD |
| `.aiox-core/development/templates/story-tmpl.yaml` | Template para stories |
| `.aiox-core/development/templates/architecture-tmpl.yaml` | Template para arquitetura |
| `.aiox-core/development/templates/brownfield-prd-tmpl.yaml` | Template PRD brownfield |
| `.aiox-core/development/templates/brownfield-architecture-tmpl.yaml` | Template arquitetura brownfield |
| `.aiox-core/development/templates/competitor-analysis-tmpl.yaml` | Template analise de concorrentes |
| `.aiox-core/development/templates/market-research-tmpl.yaml` | Template pesquisa de mercado |
| `.aiox-core/development/templates/project-brief-tmpl.yaml` | Template brief de projeto |
| `.aiox-core/development/templates/front-end-architecture-tmpl.yaml` | Template arquitetura frontend |
| `.aiox-core/development/templates/front-end-spec-tmpl.yaml` | Template spec frontend |
| `.aiox-core/development/templates/fullstack-architecture-tmpl.yaml` | Template arquitetura fullstack |

### Arquivos de Dados e Utilidades

| Arquivo | Proposito |
|---------|-----------|
| `.aiox-core/development/data/aiox-kb.md` | Knowledge Base do AIOX Method |
| `.aiox-core/development/data/brainstorming-techniques.md` | Tecnicas de brainstorming |
| `.aiox-core/development/data/elicitation-methods.md` | Metodos de elicitacao |
| `.aiox-core/development/data/technical-preferences.md` | Preferencias tecnicas |
| `.aiox-core/development/utils/security-checker.js` | Validador de seguranca |
| `.aiox-core/development/utils/yaml-validator.js` | Validador de YAML |
| `.aiox-core/development/utils/workflow-management.md` | Gestao de workflows |

### Arquivos de Workflows do @aiox-master

| Arquivo | Proposito |
|---------|-----------|
| `.aiox-core/development/workflows/brownfield-fullstack.md` | Workflow fullstack brownfield |
| `.aiox-core/development/workflows/brownfield-service.md` | Workflow servico brownfield |
| `.aiox-core/development/workflows/brownfield-ui.md` | Workflow UI brownfield |
| `.aiox-core/development/workflows/greenfield-fullstack.md` | Workflow fullstack greenfield |
| `.aiox-core/development/workflows/greenfield-service.md` | Workflow servico greenfield |
| `.aiox-core/development/workflows/greenfield-ui.md` | Workflow UI greenfield |

### Arquivos de Checklists do @aiox-master

| Arquivo | Proposito |
|---------|-----------|
| `.aiox-core/development/checklists/architect-checklist.md` | Checklist de arquitetura |
| `.aiox-core/development/checklists/change-checklist.md` | Checklist de mudancas |
| `.aiox-core/development/checklists/pm-checklist.md` | Checklist de PM |
| `.aiox-core/development/checklists/po-master-checklist.md` | Checklist de PO |
| `.aiox-core/development/checklists/story-dod-checklist.md` | Checklist DoD de stories |
| `.aiox-core/development/checklists/story-draft-checklist.md` | Checklist draft de stories |

### Arquivos Relacionados de Outros Agentes

| Arquivo | Agente | Proposito |
|---------|--------|-----------|
| `.aiox-core/development/tasks/brownfield-create-epic.md` | @pm | Criacao de epics (delegada) |
| `.aiox-core/development/tasks/brownfield-create-story.md` | @pm | Criacao de stories (delegada) |
| `.aiox-core/development/tasks/analyst-facilitate-brainstorming.md` | @analyst | Brainstorming (delegado) |
| `.aiox-core/development/tasks/generate-ai-frontend-prompt.md` | @architect | Geracao de prompts AI (delegada) |
| `.aiox-core/development/tasks/create-suite.md` | @qa | Criacao de suites de teste (delegada) |

---

## Flowchart: Sistema Completo

```mermaid
flowchart TB
    subgraph ACTIVATION["🚀 ATIVACAO"]
        USER["👤 Usuario"]
        ACTIVATE["@aiox-master"]
        GREETING["greeting-builder.js<br/>Saudacao Inteligente"]
    end

    USER -->|"@aiox-master"| ACTIVATE
    ACTIVATE --> GREETING

    subgraph COMMANDS["👑 COMANDOS PRINCIPAIS"]
        direction TB

        subgraph CREATE["📝 CRIACAO"]
            CREATE_AGENT["*create agent"]
            CREATE_TASK["*create task"]
            CREATE_WORKFLOW["*create workflow"]
            CREATE_DOC["*create-doc"]
        end

        subgraph MODIFY["🔧 MODIFICACAO"]
            MOD_AGENT["*modify agent"]
            MOD_TASK["*modify task"]
            MOD_WORKFLOW["*modify workflow"]
            UPDATE_MANIFEST["*update-manifest"]
        end

        subgraph ANALYZE["🔍 ANALISE"]
            ANALYZE_FW["*analyze-framework"]
            DEPRECATE["*deprecate-component"]
            PROPOSE["*propose-modification"]
            CORRECT["*correct-course"]
        end

        subgraph EXECUTE["⚡ EXECUCAO"]
            TASK_CMD["*task {name}"]
            WORKFLOW_CMD["*workflow {name}"]
            CHECKLIST["*execute-checklist"]
        end

        subgraph KB["📚 KNOWLEDGE"]
            KB_MODE["*kb"]
            HELP["*help"]
            GUIDE["*guide"]
            STATUS["*status"]
        end
    end

    GREETING --> COMMANDS

    subgraph TEMPLATES["📄 TEMPLATES"]
        AGENT_TMPL["agent-template.yaml"]
        TASK_TMPL["task-template.md"]
        WORKFLOW_TMPL["workflow-template.yaml"]
        DOC_TMPLS["prd-tmpl, story-tmpl, etc."]
    end

    CREATE_AGENT --> AGENT_TMPL
    CREATE_TASK --> TASK_TMPL
    CREATE_WORKFLOW --> WORKFLOW_TMPL
    CREATE_DOC --> DOC_TMPLS

    subgraph OUTPUTS["📁 OUTPUTS"]
        AGENTS_DIR[".aiox-core/agents/"]
        TASKS_DIR[".aiox-core/tasks/"]
        WORKFLOWS_DIR[".aiox-core/workflows/"]
        DOCS_DIR["docs/"]
    end

    AGENT_TMPL --> AGENTS_DIR
    TASK_TMPL --> TASKS_DIR
    WORKFLOW_TMPL --> WORKFLOWS_DIR
    DOC_TMPLS --> DOCS_DIR

    subgraph DELEGATION["🤝 DELEGACAO"]
        PM["@pm<br/>Epics/Stories"]
        ANALYST["@analyst<br/>Brainstorming"]
        ARCHITECT["@architect<br/>AI Prompts"]
        QA["@qa<br/>Test Suites"]
    end

    COMMANDS -->|"create-epic"| PM
    COMMANDS -->|"brainstorm"| ANALYST
    COMMANDS -->|"generate-ai-prompt"| ARCHITECT
    COMMANDS -->|"create-suite"| QA

    style ACTIVATION fill:#e3f2fd
    style COMMANDS fill:#fff8e1
    style TEMPLATES fill:#e8f5e9
    style OUTPUTS fill:#fce4ec
    style DELEGATION fill:#f3e5f5
```

### Diagrama de Ciclo de Vida de Componentes

```mermaid
stateDiagram-v2
    [*] --> IDEA: *propose-modification

    IDEA --> DRAFT: Usuario aprova
    IDEA --> REJECTED: Usuario rejeita

    DRAFT --> CREATED: *create {type}
    DRAFT --> MODIFIED: *modify {type}

    CREATED --> ACTIVE: Validacao OK
    MODIFIED --> ACTIVE: Validacao OK

    ACTIVE --> ANALYZED: *analyze-framework
    ACTIVE --> DEPRECATED: *deprecate-component

    ANALYZED --> MODIFIED: Melhorias identificadas
    ANALYZED --> ACTIVE: Sem mudancas

    DEPRECATED --> REMOVED: Apos timeline

    REMOVED --> [*]
    REJECTED --> [*]

    note right of IDEA: 💡 Proposta de modificacao
    note right of DRAFT: 📝 Rascunho em progresso
    note right of CREATED: ✨ Componente criado
    note right of ACTIVE: ✅ Em uso no sistema
    note right of DEPRECATED: ⚠️ Marcado para remocao
    note right of REMOVED: 🗑️ Removido do sistema
```

---

## Mapeamento de Comandos para Tasks

### Comandos de Criacao

| Comando | Task File | Operacao |
|---------|-----------|----------|
| `*create agent {name}` | `create-agent.md` | Cria novo agente via elicitacao progressiva |
| `*create task {name}` | `create-task.md` | Cria nova task com estrutura padronizada |
| `*create workflow {name}` | `create-workflow.md` | Cria novo workflow multi-agente |
| `*create-doc {template}` | `create-doc.md` | Cria documento a partir de template YAML |
| `*create-next-story` | `create-next-story.md` | Cria proxima user story |

### Comandos de Modificacao

| Comando | Task File | Operacao |
|---------|-----------|----------|
| `*modify agent {name}` | `modify-agent.md` | Modifica agente com backup/rollback |
| `*modify task {name}` | `modify-task.md` | Modifica task preservando compatibilidade |
| `*modify workflow {name}` | `modify-workflow.md` | Modifica workflow mantendo integridade |
| `*update-manifest` | `update-manifest.md` | Atualiza manifesto de equipe |
| `*propose-modification` | `propose-modification.md` | Cria proposta de modificacao |

### Comandos de Analise e Validacao

| Comando | Task File | Operacao |
|---------|-----------|----------|
| `*analyze-framework` | `analyze-framework.md` | Analise completa do framework |
| `*deprecate-component` | `deprecate-component.md` | Deprecia componente com timeline |
| `*execute-checklist {name}` | `execute-checklist.md` | Executa checklist de validacao |
| `*validate-component` | - | Valida seguranca e padroes |
| `*correct-course` | `correct-course.md` | Corrige desvios de processo |

### Comandos de Execucao

| Comando | Task File | Operacao |
|---------|-----------|----------|
| `*task {name}` | (dinamico) | Executa task especifica |
| `*workflow {name}` | (dinamico) | Inicia workflow multi-agente |
| `*plan [create\|status\|update]` | - | Planejamento de workflow |

### Comandos de Utilidade

| Comando | Task File | Operacao |
|---------|-----------|----------|
| `*help` | - | Mostra comandos disponiveis |
| `*kb` | `kb-mode-interaction.md` | Toggle modo Knowledge Base |
| `*status` | - | Mostra contexto e progresso atual |
| `*guide` | - | Mostra guia de uso do agente |
| `*yolo` | - | Toggle skip de confirmacoes |
| `*exit` | - | Sai do modo agente |
| `*advanced-elicitation` | `advanced-elicitation.md` | Elicitacao avancada |
| `*shard-doc` | `shard-doc.md` | Quebra documento em partes |
| `*doc-out` | - | Output documento completo |
| `*index-docs` | `index-docs.md` | Indexa documentacao |

---

## Integracoes entre Agentes

### Diagrama de Delegacao

```mermaid
flowchart LR
    subgraph MASTER["👑 @aiox-master (Orion)"]
        MASTER_DESC["Orquestra todos os agentes<br/>Cria/modifica componentes<br/>Executa qualquer task"]
    end

    subgraph DELEGATED["🔀 RESPONSABILIDADES DELEGADAS"]
        direction TB

        subgraph PM_BOX["📋 @pm"]
            PM_DESC["*create-epic<br/>*create-story"]
        end

        subgraph ANALYST_BOX["🔬 @analyst"]
            ANALYST_DESC["*brainstorm"]
        end

        subgraph ARCHITECT_BOX["🏛️ @architect"]
            ARCHITECT_DESC["*generate-ai-prompt"]
        end

        subgraph QA_BOX["🔍 @qa"]
            QA_DESC["*create-suite"]
        end
    end

    MASTER -->|"Epic/Story creation"| PM_BOX
    MASTER -->|"Brainstorming"| ANALYST_BOX
    MASTER -->|"AI prompt generation"| ARCHITECT_BOX
    MASTER -->|"Test suite creation"| QA_BOX

    subgraph SPECIALIZED["🎯 AGENTES ESPECIALIZADOS"]
        DEV["@dev - Implementacao"]
        SM["@sm - Story Management"]
        PO["@po - Product Ownership"]
        DATA["@data-engineer - Database"]
        UX["@ux-design-expert - UX/UI"]
        DEVOPS["@devops - Infrastructure"]
    end

    MASTER -.->|"Pode executar tasks de"| SPECIALIZED

    style MASTER fill:#fff3e0
    style DELEGATED fill:#e3f2fd
    style SPECIALIZED fill:#e8f5e9
```

### Quando Usar Agentes Especializados

| Cenario | Agente Recomendado | Razao |
|---------|-------------------|-------|
| Implementacao de story | @dev | Expertise em codigo |
| Code review | @qa | Foco em qualidade |
| Criacao de PRD | @pm | Expertise em produto |
| Criacao de stories | @sm ou @pm | Especializacao Agile |
| Decisoes de arquitetura | @architect | Expertise tecnica |
| Operacoes de database | @data-engineer | Expertise em dados |
| Design de UX/UI | @ux-design-expert | Expertise em design |
| Operacoes Git | @github-devops | Expertise em DevOps |
| Pesquisa e analise | @analyst | Expertise analitica |

---

## Configuracao

### Arquivos de Configuracao Relevantes

| Arquivo | Proposito |
|---------|-----------|
| `.aiox-core/core-config.yaml` | Configuracao central do framework |
| `.aiox-core/install-manifest.yaml` | Manifesto de instalacao |
| `.aiox-core/config/agent-config-requirements.yaml` | Requisitos de configuracao de agentes |
| `.aiox/project-registry.yaml` | Registry central de projetos |

### Configuracao de Seguranca

```yaml
security:
  authorization:
    - Check user permissions before component creation
    - Require confirmation for manifest modifications
    - Log all operations with user identification
  validation:
    - No eval() or dynamic code execution in templates
    - Sanitize all user inputs
    - Validate YAML syntax before saving
    - Check for path traversal attempts
  memory-access:
    - Scoped queries only for framework components
    - No access to sensitive project data
    - Rate limit memory operations
```

### Customizacao do Agente

```yaml
agent:
  customization: |
    - AUTHORIZATION: Check user role/permissions before sensitive operations
    - SECURITY: Validate all generated code for security vulnerabilities
    - MEMORY: Use memory layer to track created components and modifications
    - AUDIT: Log all meta-agent operations with timestamp and user info
```

---

## Best Practices

### 1. Criacao de Componentes

- **Sempre use templates**: Use `*create {type}` ao inves de criar manualmente
- **Siga a elicitacao**: Nao pule etapas do processo interativo
- **Valide antes de usar**: Execute `*validate-component` apos criacao
- **Documente dependencias**: Liste todas as dependencias no componente

### 2. Modificacao de Componentes

- **Backup primeiro**: O sistema cria backup automaticamente, mas verifique
- **Use propose-modify**: Para mudancas significativas, use `*propose-modification`
- **Teste apos modificar**: Sempre teste o componente modificado
- **Atualize manifestos**: Lembre de executar `*update-manifest` se necessario

### 3. Orquestracao de Workflows

- **Use agentes especializados**: Delegue para o agente mais apropriado
- **Planeje antes de executar**: Use `*plan` para workflows complexos
- **Monitore progresso**: Use `*status` para acompanhar

### 4. Gestao de Knowledge Base

- **Ative KB quando necessario**: Use `*kb` para consultas sobre o framework
- **Nao carregue automaticamente**: KB so e carregado sob demanda
- **Explore topicos especificos**: Use navegacao guiada do KB mode

### 5. Seguranca

- **Valide inputs**: Sempre sanitize inputs do usuario
- **Verifique permissoes**: Cheque autorizacao antes de operacoes sensiveis
- **Audite operacoes**: Todas as acoes sao logadas automaticamente

---

## Troubleshooting

### Problema: Componente nao encontrado

**Sintoma:** Erro "Component not found" ao tentar modificar/depreciar

**Solucao:**
1. Verifique o nome exato do componente
2. Use `*list-components` para ver componentes disponiveis
3. Cheque o tipo correto (agent, task, workflow, util)

### Problema: Template nao encontrado

**Sintoma:** Erro ao executar `*create-doc`

**Solucao:**
1. Liste templates disponiveis: verifique `.aiox-core/development/templates/`
2. Use nome correto do template sem extensao
3. Verifique se template existe e e valido YAML

### Problema: Workflow falha

**Sintoma:** Workflow interrompe com erro

**Solucao:**
1. Verifique logs com `*status`
2. Cheque dependencias do workflow
3. Valide agentes participantes
4. Use `*correct-course` para analise

### Problema: KB mode nao carrega

**Sintoma:** Conhecimento nao disponivel apos `*kb`

**Solucao:**
1. Verifique existencia de `.aiox-core/development/data/aiox-kb.md`
2. Certifique-se de que arquivo nao esta corrompido
3. Reinicie o agente se necessario

### Problema: Backup/rollback falha

**Sintoma:** Erro ao criar backup ou reverter

**Solucao:**
1. Verifique permissoes de escrita no diretorio
2. Cheque espaco em disco
3. Tente rollback manual do arquivo `.backups/`

### Problema: Elicitacao interrompida

**Sintoma:** Processo de elicitacao para no meio

**Solucao:**
1. Sessions sao salvas automaticamente
2. Use `*status` para ver progresso
3. Continue de onde parou ou reinicie

---

## Referencias

### Arquivos Core

- [Agente aiox-master](.aiox-core/development/agents/aiox-master.md)
- [Knowledge Base](.aiox-core/development/data/aiox-kb.md)
- [Guia do Usuario](.aiox-core/user-guide.md)

### Standards e Documentacao

- [AIOX Framework Master](.aiox-core/docs/standards/AIOX-FRAMEWORK-MASTER.md)
- [AIOX Livro de Ouro](.aiox-core/docs/standards/AIOX-LIVRO-DE-OURO.md)
- [Agent Personalization Standard](.aiox-core/docs/standards/AGENT-PERSONALIZATION-STANDARD-V1.md)

### Diretorio de Tasks

- [Tasks Directory](.aiox-core/development/tasks/)
- [Templates Directory](.aiox-core/development/templates/)
- [Workflows Directory](.aiox-core/development/workflows/)

---

## Resumo

| Aspecto | Detalhes |
|---------|----------|
| **Nome do Agente** | Orion (aiox-master) |
| **Arquetipo** | Orchestrator |
| **Icone** | 👑 |
| **Total de Tasks Diretas** | 21 tasks |
| **Total de Templates** | 14 templates |
| **Total de Workflows** | 6 workflows |
| **Total de Checklists** | 6 checklists |
| **Agentes que Delega** | 4 (@pm, @analyst, @architect, @qa) |
| **Comandos de Criacao** | 5 (`*create *`) |
| **Comandos de Modificacao** | 5 (`*modify *`, `*update-*`, `*propose-*`) |
| **Comandos de Analise** | 4 (`*analyze-*`, `*deprecate-*`, `*validate-*`, `*correct-*`) |
| **Comandos de Execucao** | 3 (`*task`, `*workflow`, `*execute-checklist`) |
| **Comandos de Utilidade** | 10 (`*help`, `*kb`, `*status`, etc.) |
| **Modos de Execucao** | 3 (YOLO, Interactive, Pre-Flight) |

---

## Changelog

| Data | Autor | Descricao |
|------|-------|-----------|
| 2026-02-04 | @aiox-master | Documento inicial criado com mapeamento completo |

---

*-- Orion, orquestrando o sistema*
