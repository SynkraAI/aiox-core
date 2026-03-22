# Memory & Context System — Deep Dive Analysis

**Data:** 2026-03-18
**Contexto:** Usuário reportou que AIOS "esquece" contexto a cada 5 minutos. Precisa de análise profunda antes de implementar melhorias.

---

## 🎯 Objetivo

Mapear TODO o ecossistema de memória/contexto no AIOS para:
1. Entender o que JÁ existe
2. Identificar gaps (o que falta)
3. Detectar conflitos/overlaps potenciais
4. Propor integração SEM contradições
5. Validar impacto em `/new-project` e estrutura de pastas

---

## 📊 Inventory Completo (O Que JÁ Existe)

### 1. **Core Memory System**

#### `.aiox-core/core/memory/gotchas-memory.js`
**Story:** 9.4 - Gotchas Memory (Epic 9 - Persistent Memory Layer)

**O que faz:**
- Auto-capture de erros repetidos (3x mesmo erro = gotcha)
- Categorização automática (build, test, lint, runtime, integration, security)
- Severity levels (info, warning, critical)
- **Context injection** para tasks relevantes
- Busca semântica de gotchas por keywords/files/category

**Onde persiste:**
- `.aiox/gotchas.json` (estruturado)
- `.aiox/gotchas.md` (human-readable)
- `.aiox/error-tracking.json` (histórico de erros)

**API pública:**
```javascript
const memory = new GotchasMemory(rootPath);

// Adicionar gotcha manualmente
memory.addGotcha({ title, description, category, severity, workaround });

// Auto-capture de erro
memory.trackError({ message, stack, file, category, context });

// Buscar gotchas relevantes para task
const relevant = memory.getContextForTask(taskDescription, relatedFiles);

// Formatar para injeção em prompt
const prompt = memory.formatForPrompt(relevant);
```

**Comandos CLI:**
```bash
node .aiox-core/core/memory/gotchas-memory.js add "description"
node .aiox-core/core/memory/gotchas-memory.js list --severity critical
node .aiox-core/core/memory/gotchas-memory.js context "implementing API endpoint"
```

**Escopo:** Memória de **erros técnicos e soluções**

---

### 2. **Session System**

#### `.aiox-core/core/session/context-loader.js`
**Story:** 6.1.2.5 UX Improvements

**O que faz:**
- Detecta agente anterior na sessão
- Rastreia últimos N comandos
- Identifica workflow ativo
- Gera resumo natural para novo agente

**Onde persiste:**
- `.aiox/session-state.json` (usado pelo detector)

**API:**
```javascript
const loader = new SessionContextLoader();
const context = loader.loadContext(currentAgentId);
// { sessionType, previousAgent, lastCommands, workflowActive, currentStory }
```

**Escopo:** Continuidade **entre agentes** na mesma sessão

---

#### `.aiox-core/core/session/context-detector.js`
**Story:** 6.1.2.5 UX Improvements

**O que faz:**
- Detecta tipo de sessão (new, resuming, multi-agent)
- Identifica se há handoff entre agentes

**Escopo:** **Detecção** de tipo de sessão

---

#### `.aiox-core/core/orchestration/session-state.js`
**Story:** 11.5 - Projeto Bob - Session State Persistence
**ADR:** ADR-011 - Unified Session State

**O que faz:**
- Persistência de estado de sessão para disco
- Resume trabalho dias depois sem perder contexto
- Crash recovery com state restoration
- Progress tracking cross epic/story

**Onde persiste:**
- `docs/stories/.session-state.yaml` (YAML, não JSON!)
- Legacy: `.aiox/workflow-state/` (migração automática)

**Fases:**
- validation, development, self_healing, quality_gate, push, checkpoint

**API:**
```javascript
const sessionState = new SessionState(projectRoot);
await sessionState.initialize();
await sessionState.update({ currentPhase: 'development', metadata: {...} });
const state = await sessionState.loadState();
```

**Escopo:** Estado de **workflow/epic** persistido entre sessões

---

### 3. **Workflow Context System**

#### `.aiox-core/core/orchestration/context-manager.js`
**Versão:** 1.0.0

**O que faz:**
- Salva outputs de cada fase de workflow em JSON
- Provê contexto para fases subsequentes
- Rastreia estado de execução
- Resume workflow de qualquer fase

**Onde persiste:**
- `.aiox/workflow-state/{workflowId}.json`
- `.aiox/workflow-state/handoffs/`
- `.aiox/workflow-state/confidence/`

**API:**
```javascript
const ctx = new ContextManager(workflowId, projectRoot);
await ctx.initialize();
await ctx.savePhaseOutput(phaseNumber, output);
const phaseData = await ctx.getPhaseOutput(phaseNumber);
```

**Escopo:** Estado de **workflow em execução** (phases)

---

### 4. **Checkpoint/Resume Skills**

#### `/checkpoint` (`.claude/commands/checkpoint.md`)
**O que faz:**
- Detecta modo de governança (HYBRID vs CENTRALIZED)
- Atualiza `INDEX.md` do projeto
- Atualiza `docs/projects/ACTIVE.md`
- Salva session file em `{sessions_path}/YYYY-MM-DD-{uuid4}.md`
- Rastreia stories/epics em andamento
- Health check de instruction files

**Estrutura do session file:**
```markdown
# Session {data}
## Projeto
## Working Directory (se HYBRID)
## O que foi feito
## Agente/Squad em uso
## Arquivos para contexto (máx 5)
## Stories em andamento
## Epic
## Decisões tomadas
## Próximo passo exato
## Arquivos modificados não commitados
```

**Escopo:** **Handoff manual** entre sessões

---

#### `/resume` (`.claude/commands/resume.md`)
**O que faz:**
- Lista projetos ativos (de `ACTIVE.md`)
- Detecta modo HYBRID vs CENTRALIZED
- Carrega `INDEX.md` + session file mais recente
- Lê até 5 arquivos de contexto
- Recupera estado de stories/epics
- Sugere comando de ativação de agente (NÃO ativa automaticamente)

**Argumentos:** `/resume {projeto}` (opcional)

**Escopo:** **Retomar trabalho** de sessões anteriores

---

### 5. **Project Governance**

#### `/new-project` (skill)
**O que faz:**
- Cria estrutura completa de projeto (INDEX.md + sessions/)
- Suporta modo HYBRID (externo) e CENTRALIZED (interno)
- Atualiza `ACTIVE.md`

**Estrutura criada (CENTRALIZED):**
```
docs/projects/{projeto}/
├── INDEX.md
└── sessions/
```

**Estrutura criada (HYBRID):**
```
{path-externo}/.aios/
├── INDEX.md
└── sessions/
```

**CRÍTICO:** INDEX.md é o source of truth de governança

---

## 🔍 Gaps Identificados (O Que Falta)

### 1. **User Profile Memory** (MISSING)
**O que:** Memória sobre quem é o usuário, suas preferências, contexto pessoal/profissional
**Onde deveria viver:** `.aios-core/data/memory/user/{user-id}-profile.md`
**Quem lê:** TODOS os agentes antes de iniciar
**Exemplo:**
```markdown
# Perfil: Luiz Fosc
## Identidade
- Empreendedor serial, 3 empresas (Ensinio, Prospector, Mentoria)
- Engenheiro de software, stack: Node.js, React, Supabase, TypeScript
## Preferências técnicas
- Sempre Tailwind CSS (NUNCA Material UI)
- Sempre PostgreSQL (NUNCA MySQL)
- Commits em inglês, docs em pt-BR
## Contexto de negócio
- Ensinio: Plataforma de cursos online (Kajabi BR)
- Prospector: Automação WhatsApp para prospecção
- Mentoria Palestra de Elite: High ticket, R$30k
```

---

### 2. **Project Context Memory** (PARTIAL)
**O que existe:** INDEX.md tem "Estado Atual" + "Última Sessão"
**O que falta:** Decisões técnicas, escolhas arquiteturais, "por quês"

**Proposta:** Adicionar `.aios/memory/project-context.md` com:
```markdown
# Decisões de Arquitetura
- Por que PostgreSQL? → Features avançadas (RLS, JSONB, full-text search)
- Por que Supabase? → Auth + DB + Storage + Edge Functions all-in-one

# Escolhas Técnicas Permanentes
- Stack: Node.js + TypeScript + Supabase
- UI: React + Tailwind (NUNCA Material UI)
- Testes: Vitest (NUNCA Jest)

# Regras de Ouro
- Sempre validar input do usuário
- Sempre usar absolute imports (@/)
- Sempre commits em inglês
```

---

### 3. **Feedback Loop Memory** (MISSING)
**O que:** Quando usuário corrige/critica algo, gravar para não repetir
**Onde deveria viver:** `.aios/memory/feedback/YYYY-MM-DD-{topic}.md`
**Formato:**
```markdown
---
date: 2026-03-18
topic: deploy-strategy
severity: high
---

Usuário corrigiu: "Não usar Docker no deploy, usar PM2 direto"

Contexto: Propus deploy com Docker, mas infra atual usa PM2 + systemd. Docker seria overhead desnecessário.

Aprendizado: Sempre perguntar sobre infra existente antes de propor deploy.
```

---

### 4. **Checkpoints DENTRO de Workflows** (MISSING)
**O que existe:** `/checkpoint` manual (fim de sessão)
**O que falta:** Checkpoints automáticos DURANTE execução de workflows

**Exemplo:** SDC workflow deveria pausar após cada step:
```
@sm draft → [CHECKPOINT: User approves?] → @po validate → [CHECKPOINT: Changes needed?] → @dev implement
```

Hoje: Workflow roda até o fim, ignorando feedback no meio.

---

### 5. **Cross-Session Memory Carryover** (MISSING)
**O que:** Session files são lidos manualmente via `/resume`
**O que falta:** Auto-load de memórias ao iniciar nova sessão no mesmo projeto

**Proposta:** Hook que detecta projeto ativo e carrega automaticamente:
- User profile
- Project context
- Feedback recente (últimos 7 dias)
- Session file mais recente

---

## ⚠️ Conflitos e Overlaps Detectados

### 1. **Session State Duplicado**
**Conflito:**
- `.aiox-core/core/orchestration/session-state.js` → `docs/stories/.session-state.yaml`
- `.aiox-core/core/session/context-loader.js` → `.aiox/session-state.json`

**Diferença:**
- `session-state.js`: Estado de WORKFLOW (fases, epic progress)
- `context-loader.js`: Estado de SESSÃO (agente anterior, comandos)

**Resolução:** São complementares, NÃO conflitam. Renomear para evitar confusão:
- `session-state.js` → `workflow-state.js`?
- Ou manter, mas documentar claramente a diferença

---

### 2. **Context Manager vs Session State**
**Overlap:**
- Ambos salvam estado de workflow em `.aiox/workflow-state/`
- `context-manager.js` → JSON por fase
- `session-state.js` → YAML único

**Resolução:** Consolidar? Ou usar ambos (JSON para dados estruturados, YAML para human-readable)?

---

### 3. **Gotchas vs Feedback**
**Overlap:**
- Gotchas: Memória de erros técnicos
- Feedback (proposto): Memória de correções do usuário

**Diferença:**
- Gotcha: "Este build error aparece 3x" (técnico, auto-detected)
- Feedback: "Usuário prefere X em vez de Y" (preferência, manual)

**Resolução:** Sistemas separados, sem conflito

---

## 🏗️ Proposta de Integração (Sem Contradições)

### **Estrutura de Diretórios Definitiva**

```
{project-root}/                      # Pode ser dentro ou fora de aios-core
├── .aios/                           # Governança (SEMPRE presente)
│   ├── INDEX.md                     # Source of truth (criado por /new-project)
│   ├── sessions/                    # Session files (criado por /checkpoint)
│   │   └── YYYY-MM-DD-{uuid}.md
│   ├── memory/                      # 🆕 NOVO (proposta)
│   │   ├── project-context.md       # Decisões, escolhas, "por quês"
│   │   └── feedback/                # Correções do usuário
│   │       └── YYYY-MM-DD-{topic}.md
│   ├── gotchas.json                 # Erros técnicos (já existe)
│   ├── gotchas.md
│   ├── error-tracking.json
│   ├── session-state.json           # Estado de sessão (já existe)
│   └── workflow-state/              # Estado de workflows (já existe)
│       ├── {workflowId}.json
│       ├── handoffs/
│       └── confidence/
│
├── docs/stories/                    # Stories e epics (se CENTRALIZED)
│   ├── active/
│   ├── completed/
│   ├── epics/
│   └── .session-state.yaml          # Estado de workflow (já existe)
│
└── .claude/                         # Instruções (SEMPRE presente)
    ├── CLAUDE.md
    └── rules/
```

**Para user profile (global, não por projeto):**
```
.aios-core/data/memory/user/
└── {user-id}-profile.md             # 🆕 NOVO
```

---

### **Memory Types (Taxonomy)**

| Tipo | Escopo | Onde vive | Quem grava | Quem lê |
|------|--------|-----------|------------|---------|
| **User Profile** | Global | `.aios-core/data/memory/user/` | Manual (ou auto via hook) | TODOS os agentes |
| **Project Context** | Projeto | `.aios/memory/project-context.md` | Manual (ou `/checkpoint`) | Agentes ao iniciar |
| **Feedback** | Projeto | `.aios/memory/feedback/` | Auto (hook detecta correção) | Agentes ao iniciar |
| **Gotchas** | Projeto | `.aios/gotchas.json` | Auto (3x erro) ou manual | Agentes ao começar task |
| **Session State** | Projeto | `.aios/session-state.json` | Auto (orquestração) | `/resume`, handoffs |
| **Workflow State** | Projeto | `.aios/workflow-state/` | Auto (ContextManager) | Workflows, recovery |
| **Session Files** | Projeto | `.aios/sessions/` | Manual (`/checkpoint`) | Manual (`/resume`) |

---

### **Read Memory Protocol (Novo)**

**TODOS os agentes devem seguir ANTES de iniciar:**

1. **Read User Profile** (global)
   ```bash
   .aios-core/data/memory/user/{user-id}-profile.md
   ```

2. **Read Project Context** (se existir)
   ```bash
   .aios/memory/project-context.md
   ```

3. **Read Recent Feedback** (últimos 7 dias)
   ```bash
   .aios/memory/feedback/*.md
   ```

4. **Read Gotchas Relevantes** (via API)
   ```javascript
   const memory = new GotchasMemory(rootPath);
   const relevant = memory.getContextForTask(taskDescription, files);
   ```

5. **Read Session File** (se `/resume` foi usado)
   ```bash
   .aios/sessions/{mais-recente}.md
   ```

**Implementação:** Adicionar seção "Memory Protocol" em TODOS os spawn files (`.aios-core/development/agents/*.md`)

---

### **Write Memory Protocol (Novo)**

**Agentes devem gravar DURANTE execução:**

| Evento | Ação |
|--------|------|
| Usuário diz "na verdade..." | Gravar feedback |
| Usuário diz "prefiro X" | Gravar feedback |
| Usuário aprova decisão técnica | Gravar project-context |
| Erro ocorre 3x | Auto-gravar gotcha (já existe) |
| Fim de sessão | `/checkpoint` (já existe) |

**Implementação:** Hook proativo que observa a conversa (como o validador de settings que já existe)

---

## 🚀 Impacto em `/new-project`

**O que `/new-project` DEVE criar agora:**

```diff
{project-root}/.aios/
├── INDEX.md                         # ✅ Já cria
├── sessions/                        # ✅ Já cria
+├── memory/                         # 🆕 NOVO
+│   ├── project-context.md          # 🆕 Template inicial
+│   └── feedback/                   # 🆕 Diretório vazio
└── (outros arquivos runtime)
```

**Template de `project-context.md`:**
```markdown
# Project Context: {nome}

## Decisões de Arquitetura
(A ser preenchido durante desenvolvimento)

## Escolhas Técnicas
- Stack: {detectado do PRD ou perguntado}

## Regras de Ouro
(Extraídas do usuário via perguntas ou defaults)
```

**Perguntas adicionais no `/new-project`:**
- "Qual stack principal? (Node.js/Python/Go/etc)"
- "Preferências de estilo? (ex: Tailwind, Material UI, nenhum)"
- "Convenções de commit? (Conventional Commits/Custom/etc)"

---

## 🔧 Impacto em Estrutura de Pastas

**Regra de Ouro (sem mudanças):**
```
~/
├── aios-core/                       # Framework
│   ├── .aios-core/                  # Core (L1-L2)
│   ├── docs/projects/               # Projetos CENTRALIZED
│   ├── squads/                      # Expansion packs
│   └── .aios/                       # Runtime do próprio aios-core
│
└── CODE/                            # Projetos externos
    ├── Projects/{nome}/.aios/       # HYBRID
    ├── design-systems/{nome}/.aios/ # HYBRID
    └── tools/{nome}/.aios/          # HYBRID
```

**Mudanças:**
- NENHUMA mudança na estrutura de diretórios principais
- Apenas ADICIONAR `.aios/memory/` em projetos (criado por `/new-project`)
- ADICIONAR `.aios-core/data/memory/user/` (global)

---

## 📋 Checklist de Implementação (Priorizado)

### **Phase 1: Foundation (1-2 dias)**
- [ ] Criar `.aios-core/data/memory/user/` (estrutura)
- [ ] Criar template de `user-profile.md`
- [ ] Copiar perfil do usuário (de ~/Library/Mobile Documents/...)
- [ ] Atualizar `/new-project` para criar `.aios/memory/`
- [ ] Criar template de `project-context.md`

### **Phase 2: Read Protocol (2-3 dias)**
- [ ] Adicionar "Memory Protocol" em TODOS os spawn files
- [ ] Testar com 1 agente (@dev) lendo user profile
- [ ] Validar que memórias são lidas ANTES de criar plano

### **Phase 3: Write Protocol (3-4 dias)**
- [ ] Criar hook de auto-save feedback (detecta "na verdade", "prefiro")
- [ ] Testar gravação automática durante conversa
- [ ] Validar formato de feedback files

### **Phase 4: Checkpoints em Workflows (4-5 dias)**
- [ ] Adicionar checkpoints no SDC workflow
- [ ] Implementar "pause and listen" entre steps
- [ ] Testar com epic real

### **Phase 5: Cross-Session Auto-Load (2-3 dias)**
- [ ] Hook SessionStart que detecta projeto e carrega memórias
- [ ] Validar que `/resume` ainda funciona
- [ ] Testar que memórias são carregadas mesmo sem `/resume`

---

## 🎯 Success Metrics

**Antes (Framework Amnésico):**
- Usuário corrige 5x a mesma coisa ❌
- Próximo agente começa do zero ❌
- Zero memórias gravadas automaticamente ❌
- Frustração alta ❌

**Depois (Framework Inteligente):**
- Usuário corrige 1x → agente grava → nunca mais repete ✅
- Próximo agente lê contexto → continua de onde parou ✅
- Memórias gravadas automaticamente (hook detecta) ✅
- Agentes parecem "lembrar" do que foi dito ✅

---

## 🚨 Risks & Mitigations

### **Risk 1: Conflito com gotchas-memory.js**
**Mitigação:** Sistemas separados (gotchas = erros técnicos, feedback = preferências)

### **Risk 2: Session state YAML vs JSON**
**Mitigação:** Documentar claramente diferença, ou consolidar em 1 formato

### **Risk 3: Memory bloat (arquivos demais)**
**Mitigação:** Cleanup automático de feedback >30 dias, limitar gotchas resolved

### **Risk 4: Breaking `/new-project` existente**
**Mitigação:** Adicionar, não modificar. Projetos antigos continuam funcionando.

### **Risk 5: Agents ignoram Memory Protocol**
**Mitigação:** Constitution Artigo VII (NON-NEGOTIABLE) + quality gate

---

## 📚 Referências

### **Arquivos Core Existentes**
- `.aiox-core/core/memory/gotchas-memory.js`
- `.aiox-core/core/session/context-loader.js`
- `.aiox-core/core/session/context-detector.js`
- `.aiox-core/core/orchestration/session-state.js`
- `.aiox-core/core/orchestration/context-manager.js`

### **Skills Existentes**
- `/checkpoint` — `.claude/commands/checkpoint.md`
- `/resume` — `.claude/commands/resume.md`
- `/new-project` — `skills/new-project/SKILL.md` (assumindo)

### **Stories/ADRs**
- Story 9.4 — Gotchas Memory
- Story 11.5 — Projeto Bob - Session State Persistence
- ADR-011 — Unified Session State

---

## ✅ Next Steps

1. **Validar esta análise com usuário** — confirmar que entendimento está correto
2. **Criar story para Phase 1** — Foundation (user profile + project-context)
3. **Prototipar Read Protocol** — testar com 1 agente
4. **Iterar** — adicionar phases incrementalmente

---

**Criado:** 2026-03-18
**Autor:** Claude (Sonnet 4.5)
**Status:** Draft — aguardando review do usuário
