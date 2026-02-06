# Handoff: MMOS Import + Agent Teams Testing

**Data:** 2026-02-06 (Atualizado 09:35)
**De:** @devops (Gage)
**Para:** Novo Terminal / Agente de Teste
**Status:** Importação Completa - Pronto para Testes

---

## Resumo Rápido

**Pontos de entrada principais:**
- **@pm (Bob)** - Ponto de entrada amigável, Product Manager
- **@aios-master (Orion)** - Orchestrator principal, pode ativar QUALQUER workflow

**Ativar workflows:** `*workflow {name}` via @aios-master ou @pm

---

## Contexto

Foi realizada a importação completa do MMOS (oalanicolas/mmos) para o aios-core (SynkraAI/aios-core). Esta importação traz o sistema de Agent Teams, Skills, Python Hooks de governança, e o Glue Script.

### Git Status
- **aios-core:** Sincronizado com `origin/main` (4 commits pulled)
- **MMOS fonte:** `oalanicolas/mmos` branch `main` (commits até 2026-02-06 07:36)

---

## Componentes Importados

### 1. Skills (`.claude/skills/`)

| Skill | Descrição |
|-------|-----------|
| `ralph.md` | Autonomous Development Loop - execução autônoma de desenvolvimento |
| `squad.md` | Squad Management - gerenciamento de equipes de agentes |
| `clone-mind.md` | Clone Mind - criação de clones de personalidade |
| `enhance-workflow.md` | Enhance Workflow - melhoria de workflows existentes |

### 2. Python Hooks de Governança (`.claude/hooks/`)

| Hook | Função |
|------|--------|
| `enforce-architecture-first.py` | Bloqueia código sem documentação prévia |
| `mind-clone-governance.py` | Bloqueia clones sem DNA definido |
| `read-protection.py` | Bloqueia leitura parcial de arquivos |
| `slug-validation.py` | Valida formato snake_case |
| `sql-governance.py` | Bloqueia CREATE/ALTER/DROP sem aprovação |
| `write-path-validation.py` | Valida paths de escrita |

### 3. Agents Standalone (`.claude/agents/`)

**Core AIOS (10):**
- `aios-dev.md`, `aios-qa.md`, `aios-architect.md`
- `aios-pm.md`, `aios-po.md`, `aios-sm.md`
- `aios-analyst.md`, `aios-data-engineer.md`
- `aios-devops.md`, `aios-ux.md`

**Chiefs/Specialists (14):**
- `copy-chief.md`, `cyber-chief.md`, `data-chief.md`
- `db-sage.md`, `design-chief.md`, `design-system.md`
- `legal-chief.md`, `story-chief.md`, `tools-orchestrator.md`
- `traffic-masters-chief.md`, `oalanicolas.md`, `pedro-valerio.md`
- `sop-extractor.md`, `squad.md`

### 4. Glue Script (`scripts/glue/`)

O Glue Script (`compose-agent-prompt.cjs`) é o componente central que:
- Compõe prompts para agentes baseado em missões
- Carrega contexto de arquivos externos
- Aplica templates de task blocks
- Gerencia o fluxo de desenvolvimento

### 5. Task Blocks (`.aios-core/development/tasks/blocks/`)

Templates reutilizáveis para construção de prompts:
- `agent-prompt-template.md`
- `context-loading.md`
- `execution-pattern.md`
- `finalization.md`

### 6. Workflow Documentation (`docs/guides/`)

- `glue-script-guide.md` - Guia completo do Glue Script
- `aios-workflows/bob-orchestrator-workflow.md` - Meta-workflow principal

---

## Testes Recomendados

### Teste 1: Glue Script Básico

```bash
cd C:\Users\AllFluence-User\Workspaces\AIOS\SynkraAI\aios-core

# Listar missions disponíveis para cada agente
node scripts/glue/compose-agent-prompt.cjs --agent dev --list-missions
node scripts/glue/compose-agent-prompt.cjs --agent qa --list-missions
node scripts/glue/compose-agent-prompt.cjs --agent po --list-missions
```

### Teste 2: Compor Prompt com Contexto

```bash
# Criar um prompt para desenvolver uma story
node scripts/glue/compose-agent-prompt.cjs \
  --agent dev \
  --mission develop-story \
  --context docs/stories/active/sample-story.md
```

### Teste 3: Skills via Claude Code

```
# No Claude Code, testar invocação de skills:
/ralph           # Autonomous Development Loop
/squad           # Squad Management
/clone-mind      # Clone Mind skill
/enhance-workflow # Workflow Enhancement
```

### Teste 4: Agent Teams

```
# Testar ativação de agentes standalone:
@aios-dev        # ou /AIOS:agents:aios-dev
@db-sage         # Database specialist
@copy-chief      # Copywriting specialist
@design-system   # Design System specialist
```

### Teste 5: Python Hooks

```bash
# Verificar sintaxe dos hooks Python
python -m py_compile .claude/hooks/enforce-architecture-first.py
python -m py_compile .claude/hooks/sql-governance.py
```

---

## Estrutura de Agent Teams

### Conceito

Agent Teams permite agrupar agentes especializados que trabalham juntos em tarefas complexas. Cada "Chief" coordena uma área específica:

```
┌─────────────────────────────────────────────────────────┐
│                    AIOS Master                          │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Dev Team │  │ QA Team  │  │Copy Team │  │Data Team│ │
│  │          │  │          │  │          │  │         │ │
│  │ @dev     │  │ @qa      │  │@copy-    │  │@data-   │ │
│  │ @devops  │  │          │  │ chief    │  │ chief   │ │
│  │@architect│  │          │  │          │  │@db-sage │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Squads Disponíveis

Os squads estão em `.claude/commands/`:
- `AIOS/` - Core development agents
- `mmos-squad/` - MMOS specialized agents
- `squad-creator/` - Squad creation tools

---

## Arquivos Temporariamente no .gitignore

Os seguintes paths estão no `.gitignore` até validação:

```gitignore
# MMOS IMPORT (TEMPORARY - Story MMOS-Sync)
scripts/glue/
.claude/skills/
.claude/hooks/
.claude/templates/
.claude/agents/
.claude/agent-memory/
.claude/setup/
docs/guides/aios-workflows/
docs/guides/glue-script-guide.md
```

**Após validação bem-sucedida:** Remover essas entradas e commitar os arquivos.

---

## Próximos Passos

1. [ ] Testar Glue Script com `--list-missions` para todos os agentes
2. [ ] Testar composição de prompt com contexto real
3. [ ] Validar invocação de skills no Claude Code
4. [ ] Testar Agent Teams com tarefas complexas
5. [ ] Verificar Python hooks de governança
6. [ ] Após validação, remover do `.gitignore` e commitar

---

## Comandos Rápidos para Copiar

```bash
# Ir para o diretório
cd C:\Users\AllFluence-User\Workspaces\AIOS\SynkraAI\aios-core

# Testar Glue Script
node scripts/glue/compose-agent-prompt.cjs --agent dev --list-missions

# Verificar estrutura importada
ls .claude/skills/
ls .claude/hooks/
ls .claude/agents/
ls scripts/glue/
```

---

## Referências

- **MMOS Source:** https://github.com/oalanicolas/mmos
- **Glue Script Guide:** `docs/guides/glue-script-guide.md`
- **Bob Orchestrator:** `docs/guides/aios-workflows/bob-orchestrator-workflow.md`
- **Constitution:** `.aios-core/constitution.md`

---

---

## Squads Disponíveis no MMOS (para importação futura)

Os seguintes squads/commands estão disponíveis no MMOS para importação:

| Squad | Descrição |
|-------|-----------|
| **AIOS** | Core agents (já importados) |
| **Ralph** | Autonomous Development Loop |
| **Framework** | Framework manipulation commands |
| **Copy** | Copywriting specialists |
| **Cybersecurity** | Security specialists |
| **Data** | Data specialists |
| **Design** | Design specialists |
| **Legal** | Legal specialists |
| **Storytelling** | Story/narrative specialists |
| **AdvisoryBoard** | Advisory personas (Charlie Munger, etc.) |
| **db-sage** | Database specialist |
| **squad-creator** | Squad creation tools |
| **Tools** | Tool orchestration |

Para importar um squad específico, use:
```bash
gh api repos/oalanicolas/mmos/contents/.claude/commands/{squad-name} --jq '.[] | .name'
```

---

*Handoff criado por @devops (Gage) - 2026-02-06*
*Status: Importação Completa | Pronto para Testes*
