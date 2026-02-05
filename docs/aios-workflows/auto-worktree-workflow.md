# Auto-Worktree Workflow

**Versão:** 1.0
**Criado:** 2026-01-28
**Autor:** @architect (Aria)
**Story:** 1.4 - Epic 1 - Worktree Manager

---

## Visão Geral

O **Auto-Worktree** é um workflow de automação que cria e gerencia worktrees Git isoladas para desenvolvimento de stories. Faz parte da infraestrutura **Auto-Claude ADE** (Autonomous Development Engine), permitindo desenvolvimento paralelo de multiplas stories sem conflitos entre branches.

### Principais Beneficios

| Benefício | Descrição |
|-----------|-----------|
| **Isolamento** | Cada story trabalha em um diretório e branch separados |
| **Paralelismo** | Multiplas stories podem ser desenvolvidas simultaneamente |
| **Automação** | Worktrees são criadas automaticamente ao iniciar uma story |
| **Limpeza** | Worktrees obsoletas podem ser removidas automaticamente |

### Quando o Workflow é Acionado

1. **Evento `story_started`**: Quando `@dev` inicia uma story
2. **Evento `story_assigned`**: Quando `@po` atribui uma story (opcional)
3. **Comando manual**: `*auto-worktree`

---

## Diagrama do Workflow

### Fluxo Principal

```mermaid
flowchart TB
    subgraph TRIGGER["Trigger"]
        T1[story_started<br/>@dev]
        T2[story_assigned<br/>@po]
        T3[*auto-worktree<br/>manual]
    end

    subgraph PREFLIGHT["Pre-Flight Checks"]
        PF1{Repositório Git?}
        PF2{Suporte a Worktree?}
        PF3{WorktreeManager?}
        PF4{Limite de Worktrees?}
    end

    subgraph WORKFLOW["Sequência do Workflow"]
        S1["STEP 1: Extract Story Context<br/>Extrair ID da Story"]
        S2["STEP 2: Check Existing<br/>Verificar Worktree Existente"]
        S3["STEP 3: Auto Cleanup<br/>Limpar Worktrees Obsoletas"]
        S4["STEP 4: Create Worktree<br/>Criar Worktree Isolada"]
        S5["STEP 5: Switch Context<br/>Mudar para Worktree"]
        S6["STEP 6: Display Summary<br/>Exibir Resumo"]
    end

    subgraph OUTPUT["Saída"]
        O1[storyId]
        O2[worktree.path]
        O3[worktree.branch]
        O4[worktree.status]
    end

    T1 --> PF1
    T2 --> PF1
    T3 --> PF1

    PF1 -->|Sim| PF2
    PF1 -->|Não| ERR1[Erro: Não é repositório git]

    PF2 -->|Sim| PF3
    PF2 -->|Não| ERR2[Erro: Git < 2.5]

    PF3 -->|Existe| PF4
    PF3 -->|Não existe| ERR3[Erro: AIOS incompleto]

    PF4 -->|OK| S1
    PF4 -->|Limite| WARN1[Aviso: Próximo do limite]
    WARN1 --> S1

    S1 --> S2
    S2 -->|Existe| S5
    S2 -->|Não existe| S3
    S3 --> S4
    S4 -->|Sucesso| S5
    S4 -->|Falha| ERR4[Erro: Criação falhou]
    S5 --> S6
    S6 --> O1
    S6 --> O2
    S6 --> O3
    S6 --> O4

    style TRIGGER fill:#e1f5fe
    style PREFLIGHT fill:#fff3e0
    style WORKFLOW fill:#e8f5e9
    style OUTPUT fill:#f3e5f5
    style ERR1 fill:#ffcdd2
    style ERR2 fill:#ffcdd2
    style ERR3 fill:#ffcdd2
    style ERR4 fill:#ffcdd2
    style WARN1 fill:#fff9c4
```

### Diagrama de Estados

```mermaid
stateDiagram-v2
    [*] --> TriggerReceived: Evento recebido

    TriggerReceived --> PreFlightChecks: Iniciar validação

    PreFlightChecks --> PreFlightFailed: Falha em check bloqueante
    PreFlightChecks --> ExtractContext: Todos checks passaram

    PreFlightFailed --> [*]: Workflow abortado

    ExtractContext --> CheckExisting: storyId extraído
    ExtractContext --> StoryIdNotFound: Não conseguiu extrair

    StoryIdNotFound --> PromptUser: Solicitar ID
    PromptUser --> CheckExisting: ID fornecido

    CheckExisting --> SwitchContext: Worktree já existe
    CheckExisting --> AutoCleanup: Worktree não existe

    AutoCleanup --> CreateWorktree: Cleanup opcional concluído

    CreateWorktree --> CreationFailed: Erro na criação
    CreateWorktree --> SwitchContext: Worktree criada

    CreationFailed --> [*]: Workflow falhou

    SwitchContext --> DisplaySummary: Contexto atualizado

    DisplaySummary --> [*]: Workflow concluído com sucesso
```

### Arquitetura de Componentes

```mermaid
graph TB
    subgraph AIOS["AIOS Core"]
        WF[auto-worktree.yaml<br/>Workflow Definição]
        TK[create-worktree.md<br/>Task Definição]
    end

    subgraph INFRA["Infrastructure"]
        WM[worktree-manager.js<br/>WorktreeManager Class]
        GIT[Git CLI<br/>git worktree]
    end

    subgraph FS["File System"]
        WT[.aios/worktrees/{storyId}/<br/>Worktree Directory]
        LOG[.aios/logs/merges/<br/>Merge Audit Logs]
    end

    subgraph AGENTS["Agentes"]
        DEV[@dev<br/>Gage - DevOps]
        PO[@po<br/>Product Owner]
    end

    DEV -->|Inicia story| WF
    PO -->|Atribui story| WF
    WF -->|Executa| TK
    TK -->|Usa| WM
    WM -->|Executa| GIT
    GIT -->|Cria| WT
    WM -->|Grava logs| LOG

    style AIOS fill:#e3f2fd
    style INFRA fill:#fce4ec
    style FS fill:#f3e5f5
    style AGENTS fill:#e8f5e9
```

---

## Steps Detalhados

### Step 1: Extract Story Context

| Propriedade | Valor |
|-------------|-------|
| **Phase** | 1 - Extract Context |
| **Action** | `extract_story_info` |
| **Agente** | Sistema (automático) |
| **Blocking** | Sim |

**Descrição:**
Extrai o ID da story do contexto do trigger. Busca em várias fontes:

1. Parametro explicito `storyId`
2. Caminho do arquivo da story (`storyFile`)
3. Task atual (`currentTask.storyId`)
4. Nome da branch atual (convenção `story-X.Y`)

**Input:**
```typescript
interface TriggerContext {
  storyId?: string;
  storyFile?: string;
  currentTask?: { storyId: string };
}
```

**Output:**
```typescript
{ storyId: string }
```

**Erro se falhar:**
```
Could not determine story ID. Please provide explicitly.
```

---

### Step 2: Check Existing

| Propriedade | Valor |
|-------------|-------|
| **Phase** | 2 - Check Existing |
| **Action** | `check_worktree_exists` |
| **Agente** | Sistema (automático) |
| **Blocking** | Não (pode pular para switch) |

**Descrição:**
Verifica se já existe uma worktree para a story. Se existir, pula para o Step 5 (Switch Context).

**Lógica:**
```javascript
const manager = new WorktreeManager();
const exists = await manager.exists(storyId);

if (exists) {
  return { exists: true, action: 'switch' };
}
return { exists: false, action: 'create' };
```

**Output:**
```typescript
interface CheckResult {
  exists: boolean;
  worktree?: WorktreeInfo;
  action: 'switch' | 'skip' | 'create';
}
```

---

### Step 3: Auto Cleanup

| Propriedade | Valor |
|-------------|-------|
| **Phase** | 3 - Auto Cleanup |
| **Action** | `cleanup_stale_worktrees` |
| **Agente** | @devops (Gage) |
| **Condicional** | `config.autoCleanup === true` |

**Descrição:**
Remove automaticamente worktrees obsoletas (mais de 30 dias sem uso) antes de criar uma nova. Este step só executa se `autoCleanup` estiver habilitado na configuração.

**Critério de Obsolescência:**
- Worktree criada há mais de `staleDays` (default: 30 dias)

**Output:**
```typescript
interface CleanupResult {
  cleaned: number;
  removedIds: string[];
}
```

**Log:**
```
Cleaned up {cleaned} stale worktrees
```

---

### Step 4: Create Worktree

| Propriedade | Valor |
|-------------|-------|
| **Phase** | 4 - Create Worktree |
| **Action** | `create_isolated_worktree` |
| **Agente** | @devops (Gage) |
| **Task** | `create-worktree.md` |
| **Blocking** | Sim |

**Descrição:**
Cria uma nova worktree isolada para a story usando o WorktreeManager.

**Estrutura Criada:**
```
.aios/worktrees/{storyId}/     # Diretório de trabalho
Branch: auto-claude/{storyId}   # Branch Git
```

**Input:**
```typescript
{ story_id: string }
```

**Output:**
```typescript
interface CreateResult {
  success: boolean;
  worktree: WorktreeInfo;
  path: string;
  branch: string;
  error?: string;
}
```

**Comandos Git Executados:**
```bash
git worktree add .aios/worktrees/{storyId} -b auto-claude/{storyId}
```

---

### Step 5: Switch Context

| Propriedade | Valor |
|-------------|-------|
| **Phase** | 5 - Switch Context |
| **Action** | `switch_to_worktree` |
| **Agente** | Sistema (automático) |
| **Condicional** | `config.autoSwitch === true` |

**Descrição:**
Configura variáveis de ambiente e exibe instruções para navegar até a worktree.

**Variáveis de Ambiente:**
```bash
AIOS_WORKTREE=/path/to/.aios/worktrees/{storyId}
AIOS_STORY={storyId}
```

**Output:**
```typescript
interface SwitchResult {
  worktreePath: string;
  instructions: string;  // "cd /path/to/worktree"
}
```

---

### Step 6: Display Summary

| Propriedade | Valor |
|-------------|-------|
| **Phase** | 6 - Summary |
| **Action** | `show_summary` |
| **Agente** | Sistema (automático) |
| **Condicional** | `config.verbose === true` |

**Descrição:**
Exibe um resumo completo da operação com informações da worktree e próximos passos.

**Template de Saída:**
```
+------------------------------------------------------------------+
|  Auto-Worktree Complete                                          |
+------------------------------------------------------------------+

Story:      {storyId}
Worktree:   {worktree.path}
Branch:     {worktree.branch}
Status:     {worktree.status}

-------------------------------------------------------------------
Quick Reference:

Navigate:   cd {worktree.path}
Status:     *list-worktrees
Merge:      *merge-worktree {storyId}
Remove:     *remove-worktree {storyId}

-------------------------------------------------------------------
Você agora está trabalhando em um ambiente isolado.
Alterações aqui não afetam a branch principal até o merge.
```

---

## Agentes Participantes

### @devops (Gage)

| Responsabilidade | Descrição |
|------------------|-----------|
| **Criação de Worktree** | Executa a task `create-worktree.md` |
| **Remoção de Worktree** | Executa a task `remove-worktree.md` |
| **Limpeza Automática** | Remove worktrees obsoletas |
| **Merge de Worktree** | Executa a task `merge-worktree.md` |

**Comandos do Agente:**
- `*create-worktree {storyId}` - Criar worktree isolada
- `*list-worktrees` - Listar worktrees ativas
- `*remove-worktree {storyId}` - Remover worktree
- `*merge-worktree {storyId}` - Fazer merge da worktree
- `*cleanup-worktrees` - Limpar worktrees obsoletas

### @dev (Desenvolvedor)

| Responsabilidade | Descrição |
|------------------|-----------|
| **Trigger Primário** | Inicia o workflow ao começar uma story |
| **Desenvolvimento** | Trabalha dentro da worktree isolada |

### @po (Product Owner)

| Responsabilidade | Descrição |
|------------------|-----------|
| **Trigger Secundário** | Pode disparar criação ao atribuir story |

---

## Tasks Executadas

### create-worktree.md

| Propriedade | Valor |
|-------------|-------|
| **Localização** | `.aios-core/development/tasks/create-worktree.md` |
| **Agente** | @devops (Gage) |
| **Versão** | 1.0 |
| **Story** | 1.3 |

**Modos de Execução:**

| Modo | Prompts | Uso Recomendado |
|------|---------|-----------------|
| **YOLO** (default) | 0-1 | Setup rápido de story |
| **Interactive** | 2-3 | Usuarios iniciantes |

**Pré-Condições:**
- [x] Diretório atual é repositório git
- [x] WorktreeManager disponível
- [x] Limite de worktrees não atingido

**Pós-Condições:**
- [x] Diretório da worktree existe
- [x] Branch `auto-claude/{storyId}` existe

---

## Pre-requisitos

### Requisitos de Sistema

| Requisito | Versão Mínima | Verificação |
|-----------|---------------|-------------|
| **Git** | >= 2.5 | `git --version` |
| **Node.js** | >= 18 | `node --version` |
| **AIOS Core** | Instalado | Verificar `.aios-core/` |

### Dependências NPM

| Pacote | Uso |
|--------|-----|
| **execa** | Execução de comandos git |
| **chalk** | Cores no terminal |

### Arquivos Necessários

```
.aios-core/
  infrastructure/
    scripts/
      worktree-manager.js     # Classe WorktreeManager
  development/
    workflows/
      auto-worktree.yaml       # Definição do workflow
    tasks/
      create-worktree.md       # Task de criação
      list-worktrees.md        # Task de listagem
      remove-worktree.md       # Task de remoção
      merge-worktree.md        # Task de merge
```

---

## Entradas e Saídas

### Entradas do Workflow

| Entrada | Tipo | Obrigatório | Origem | Descrição |
|---------|------|-------------|--------|-----------|
| `storyId` | string | Sim* | Contexto ou usuário | ID da story (ex: STORY-42, 1.3) |
| `storyFile` | string | Não | Contexto | Caminho do arquivo da story |
| `currentTask` | object | Não | Contexto | Task atual em execução |

*Obrigatório, mas pode ser extraído automaticamente do contexto.

### Saídas do Workflow

| Saída | Tipo | Descrição |
|-------|------|-----------|
| `storyId` | string | ID da story processada |
| `worktree` | WorktreeInfo | Objeto com informações da worktree |
| `path` | string | Caminho absoluto da worktree |
| `branch` | string | Nome da branch (`auto-claude/{storyId}`) |

### Interface WorktreeInfo

```typescript
interface WorktreeInfo {
  storyId: string;           // 'STORY-42'
  path: string;              // '/abs/path/.aios/worktrees/STORY-42'
  branch: string;            // 'auto-claude/STORY-42'
  createdAt: Date;           // Data de criação
  uncommittedChanges: number; // Número de alterações não commitadas
  status: 'active' | 'stale'; // Status baseado em idade
}
```

---

## Pontos de Decisão

### Diagrama de Decisão

```mermaid
flowchart TD
    D1{config.autoWorktree.enabled?}
    D1 -->|false| SKIP[Workflow não executa]
    D1 -->|true| D2

    D2{storyId disponível?}
    D2 -->|Não| PROMPT[Solicitar ao usuário]
    D2 -->|Sim| D3
    PROMPT --> D3

    D3{Worktree já existe?}
    D3 -->|Sim| D4
    D3 -->|Não| D5

    D4{config.autoSwitch?}
    D4 -->|true| SWITCH[Mudar para worktree existente]
    D4 -->|false| DONE[Finalizar sem mudar]

    D5{config.autoCleanup?}
    D5 -->|true| CLEANUP[Limpar worktrees obsoletas]
    D5 -->|false| CREATE
    CLEANUP --> CREATE[Criar nova worktree]

    CREATE -->|Sucesso| D6
    CREATE -->|Falha| ERROR[Tratar erro]

    D6{config.autoSwitch?}
    D6 -->|true| SWITCH2[Mudar para nova worktree]
    D6 -->|false| D7
    SWITCH2 --> D7

    D7{config.verbose?}
    D7 -->|true| SUMMARY[Exibir resumo]
    D7 -->|false| FINISH[Finalizar]
    SUMMARY --> FINISH

    style SKIP fill:#e0e0e0
    style ERROR fill:#ffcdd2
    style FINISH fill:#c8e6c9
```

### Configurações que Afetam Decisões

| Configuração | Default | Impacto |
|--------------|---------|---------|
| `enabled` | true | Habilita/desabilita o workflow |
| `createOnAssign` | false | Cria worktree quando @po atribui story |
| `autoSwitch` | true | Muda automaticamente para a worktree |
| `verbose` | true | Exibe resumo ao final |
| `autoCleanup` | false | Limpa worktrees obsoletas automaticamente |
| `maxWorktrees` | 10 | Limite de worktrees simultâneas |
| `staleDays` | 30 | Dias para considerar worktree obsoleta |

---

## Tratamento de Erros

### Erros Bloqueantes

| Erro | Causa | Resolução |
|------|-------|-----------|
| `Not a git repository` | Diretório não é repo git | Executar `git init` |
| `Git worktree not supported` | Git < 2.5 | Atualizar Git |
| `WorktreeManager not found` | AIOS incompleto | Reinstalar AIOS |
| `Maximum worktrees limit reached` | >= 10 worktrees | Executar `*cleanup-worktrees` |
| `Could not determine story ID` | ID não encontrado | Fornecer ID explicitamente |
| `Worktree creation failed` | Erro no git worktree | Verificar git status |

### Erros Não-Bloqueantes (Warnings)

| Warning | Causa | Ação |
|---------|-------|------|
| `Approaching worktree limit` | Próximo do limite | Considerar cleanup |
| `Could not delete branch` | Branch protegida ou em uso | Remover manualmente |

### Fluxo de Recuperação de Erro

```mermaid
flowchart TD
    E1[Erro Detectado] --> E2{Tipo de Erro?}

    E2 -->|Bloqueante| E3[Halt Workflow]
    E2 -->|Não-Bloqueante| E4[Log Warning]

    E3 --> E5[Exibir Mensagem]
    E5 --> E6[Exibir Sugestão]
    E6 --> E7[Abortar]

    E4 --> E8[Continuar Execução]

    E7 --> ROLLBACK{Rollback Necessário?}
    ROLLBACK -->|Sim| E9[Executar Rollback]
    ROLLBACK -->|Nao| END[Fim]
    E9 --> END
```

---

## Troubleshooting

### Problema: Worktree não é criada

**Sintomas:**
- Comando `*create-worktree` falha
- Mensagem "Failed to create worktree"

**Diagnóstico:**
```bash
# Verificar se é repositório git
git rev-parse --is-inside-work-tree

# Verificar versão do git
git --version

# Verificar worktrees existentes
git worktree list

# Verificar se WorktreeManager existe
ls .aios-core/infrastructure/scripts/worktree-manager.js
```

**Soluções:**
1. Inicializar repositório: `git init`
2. Atualizar Git para >= 2.5
3. Limpar worktrees: `*cleanup-worktrees`
4. Remover worktree específica: `*remove-worktree {storyId}`

---

### Problema: Limite de worktrees atingido

**Sintomas:**
- Mensagem "Maximum worktrees limit (10) reached"

**Diagnóstico:**
```bash
# Listar todas worktrees
*list-worktrees

# Verificar contagem
git worktree list | wc -l
```

**Soluções:**
1. Limpar worktrees obsoletas: `*cleanup-worktrees`
2. Remover worktrees não utilizadas: `*remove-worktree {storyId}`
3. Aumentar limite (se necessário) em `.aios/config.yaml`

---

### Problema: Conflitos ao fazer merge

**Sintomas:**
- `*merge-worktree` falha
- Mensagem com lista de arquivos em conflito

**Diagnóstico:**
```bash
# Verificar arquivos em conflito
git diff --name-only --diff-filter=U

# Visualizar diferenças
git diff HEAD...auto-claude/{storyId}
```

**Soluções:**
1. Resolver conflitos manualmente na worktree
2. Fazer rebase da worktree: `git rebase main` (dentro da worktree)
3. Usar merge staged: `*merge-worktree {storyId} --staged`

---

### Problema: Worktree corrompida

**Sintomas:**
- Comandos git falham na worktree
- Worktree aparece como "locked"

**Diagnóstico:**
```bash
# Verificar status da worktree
git worktree list

# Verificar se esta locked
ls .git/worktrees/{storyId}/locked
```

**Soluções:**
1. Remover lock: `rm .git/worktrees/{storyId}/locked`
2. Remover worktree com force: `*remove-worktree {storyId} --force`
3. Remocao manual:
   ```bash
   git worktree remove .aios/worktrees/{storyId} --force
   git branch -D auto-claude/{storyId}
   ```

---

### Problema: Story ID não detectado

**Sintomas:**
- Mensagem "Could not determine story ID"

**Soluções:**
1. Fornecer ID explicitamente: `*auto-worktree STORY-42`
2. Verificar se o arquivo da story existe
3. Verificar convenção de nome da branch atual

---

## Comandos Relacionados

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `*create-worktree` | Criar worktree manualmente | `*create-worktree STORY-42` |
| `*list-worktrees` | Listar todas worktrees | `*list-worktrees` |
| `*remove-worktree` | Remover worktree | `*remove-worktree STORY-42` |
| `*merge-worktree` | Fazer merge da worktree | `*merge-worktree STORY-42` |
| `*cleanup-worktrees` | Limpar worktrees obsoletas | `*cleanup-worktrees` |

---

## Referências

### Arquivos do Framework

| Arquivo | Caminho |
|---------|---------|
| **Workflow Definition** | `.aios-core/development/workflows/auto-worktree.yaml` |
| **Task Create** | `.aios-core/development/tasks/create-worktree.md` |
| **WorktreeManager** | `.aios-core/infrastructure/scripts/worktree-manager.js` |

### Documentação Relacionada

- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- Epic 1 - Worktree Manager (Stories 1.1-1.5)
- Auto-Claude ADE Architecture

### Stories Relacionadas

| Story | Título |
|-------|--------|
| 1.1 | WorktreeManager Core Class |
| 1.2 | Merge Functionality |
| 1.3 | CLI Commands for Worktree Management |
| 1.4 | Auto-Worktree Workflow Integration |
| 1.5 | Worktree Status in Project Context |

---

## Histórico de Versões

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
| 1.0 | 2026-01-28 | @architect (Aria) | Versão inicial |

---

*Documentação gerada automaticamente pelo AIOS-FULLSTACK*
