# PRD — Ecossistema Forge + Quest

**Versão:** 1.0.0
**Data:** 2026-03-31
**Autor:** Luiz Fosc x Claude
**Status:** Draft — aguardando revisão do Fosc

---

## 1. Visão Geral

O ecossistema Forge + Quest é um sistema de orquestração em duas camadas que automatiza a execução de workflows complexos com gamificação integrada.

**Em uma frase:** O usuário diz o que quer. O Quest gamifica a jornada. O Forge orquestra os agentes. Os agentes fazem o trabalho.

```
┌──────────────────────────────────────────────────────────────┐
│                        USUÁRIO                                │
│              "Quero clonar o design do Stripe"                │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    QUEST (Placar)                              │
│                                                                │
│  O usuário pode entrar por /quest (gamificado) ou             │
│  /forge (direto). Ambos chegam ao mesmo resultado.            │
│                                                                │
│  Via /quest:                                                   │
│  - Detecta pack (qual jornada gamificada usar)                │
│  - Mostra cerimônia RPG + mapa de worlds                      │
│  - Identifica próxima missão: "Deep CSS Extraction"           │
│  - Executa automaticamente via Forge (sem perguntar)          │
│                                                                │
│  Via /forge (direto):                                          │
│  - Pula Quest, vai direto pro Forge                           │
│  - Sem XP, sem cerimônia, sem levels                          │
│                                                                │
│  Quest NUNCA executa trabalho. Só rastreia XP e progresso.    │
└───────────────────────┬──────────────────────────────────────┘
                        │ forge-bridge.md (quando via Quest)
                        │ direto (quando via /forge)
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    FORGE (Técnico)                             │
│                                                                │
│  - Classifica intent: DESIGN_SYSTEM                           │
│  - Carrega workflow: design-system.md                         │
│  - Identifica fase: Phase 1 (Extraction)                      │
│  - Despacha agente: @dev → deep CSS extraction                │
│  - Gerencia estado: .aios/forge-runs/                         │
│  - Error recovery: retry → escalate → checkpoint              │
│                                                                │
│  NUNCA implementa. Só orquestra agentes/squads.               │
└───────────────────────┬──────────────────────────────────────┘
                        │ Agent Dispatch Protocol
                        ▼
┌──────────────────────────────────────────────────────────────┐
│               AGENTES / SQUADS (Jogadores)                    │
│                                                                │
│  @dev            → escreve código, implementa componentes     │
│  @qa             → roda testes, quality gates, visual diff    │
│  @devops         → git push, deploy, PR                       │
│  @architect      → decisões de arquitetura, tokens            │
│  @sm/@po         → cria/valida stories                        │
│  @pm             → PRD, epics, specs                          │
│  @analyst        → pesquisa, research                         │
│  @data-engineer  → schema, migrations, RLS (+ error recovery)│
│  @ux-design-expert → screenshots, a11y, visual spec          │
│  @aios-master    → escalação quando tudo falha                │
│  /design squad   → Brad Frost, Page Composer, Token Architect │
│  /copywriting    → 15 copywriters lendários                   │
│                                                                │
│  Eles fazem o trabalho REAL.                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Constituição (NON-NEGOTIABLE)

### 2.1 Quest — Regras Invioláveis

| # | Regra | Descrição |
|---|---|---|
| Q1 | Quest NUNCA executa trabalho | Não escreve código, não roda agentes, não cria arquivos de implementação |
| Q2 | TODA execução vai pelo Forge | Missões com agentes ou squads DEVEM ser delegadas ao Forge via forge-bridge |
| Q3 | Quest só faz 3 coisas | (a) Mostra próxima missão, (b) Rastreia XP/progresso, (c) Gerencia quest-log |

### 2.2 Forge — Regras Invioláveis

| # | Regra | Descrição |
|---|---|---|
| F1 | Forge NUNCA implementa | Não escreve código, não cria componentes, não faz design. SEMPRE delega |
| F2 | Toda ação tem dono | Cada passo de cada workflow DEVE mapear pra um agente ou squad específico |
| F3 | Forge só faz 3 coisas | (a) Classifica intent/seleciona workflow, (b) Despacha agentes na ordem certa, (c) Gerencia estado e error recovery |

### 2.3 Analogia

| Componente | Analogia Futebol | Analogia Fábrica |
|---|---|---|
| Quest | Placar eletrônico | Painel de controle |
| Forge | Técnico/Treinador | Gerente de produção |
| Agentes | Jogadores em campo | Operadores das máquinas |
| Workflows | Esquemas táticos | Linhas de montagem |
| Packs | Campeonatos (com tabela de pontos) | Ordens de produção gamificadas |

---

## 3. Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 1: ENTRY POINTS                                      │
│                                                               │
│  /quest              → Quest Engine (gamificação)            │
│  /forge {comando}    → Forge Runner (execução direta)        │
│                                                               │
│  O usuário pode entrar por qualquer porta:                   │
│  - /quest → gamificado (XP, cerimônia, mapa)                │
│  - /forge → direto (sem XP, sem cerimônia)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  CAMADA 2: WORKFLOWS (skills/forge/workflows/*.md)           │
│                                                               │
│  Cada workflow define:                                        │
│  - QUAIS fases executar e em qual ordem                      │
│  - QUAIS agentes participam de cada fase                     │
│  - QUAIS quality gates aplicar                               │
│  - COMO fazer error recovery                                 │
│                                                               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │ full-app   │ │ single-    │ │ bug-fix    │               │
│  │            │ │ feature    │ │            │               │
│  │ 6 fases    │ │ 3 fases    │ │ 3 fases    │               │
│  └────────────┘ └────────────┘ └────────────┘               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │ design-    │ │ squad-     │ │ brownfield │               │
│  │ system     │ │ upgrade    │ │            │               │
│  │ 6 fases    │ │ 5 fases    │ │ scan+plan  │               │
│  └────────────┘ └────────────┘ └────────────┘               │
│                                                               │
│  + FUTUROS: landing-page, content-pipeline, mind-clone...    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│  CAMADA 3: ENGINE (compartilhada por TODOS os workflows)     │
│                                                               │
│  runner.md           → State machine (INIT→PHASE→COMPLETE)  │
│  personality.md      → Visual, banners, tom de voz           │
│  ecosystem-scanner   → Detecta minds/squads/skills úteis     │
│  phase-0-discovery   → Discovery genérico (todas as rotas)   │
│  phase-5-deploy      → Deploy genérico (push, PR, verify)    │
│  .aios/forge-runs/   → State persistence + resume            │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Componentes do Quest

### 4.1 Módulos do Engine

| Módulo | Arquivo | Responsabilidade |
|---|---|---|
| **SKILL.md** | `skills/quest/SKILL.md` | Entry point, routing, constitution |
| **Scanner** | `engine/scanner.md` | Detecta projeto, seleciona pack, valida schema |
| **Ceremony** | `engine/ceremony.md` | Cerimônia RPG (ASCII art, loading bar, project card) |
| **Checklist** | `engine/checklist.md` | Check/skip/unused/sub/scan. Estado do quest-log |
| **Guide** | `engine/guide.md` | Seleção de missão, integration gates, interaction flow |
| **XP System** | `engine/xp-system.md` | Cálculo de XP, levels, streaks, achievements |
| **Forge Bridge** | `engine/forge-bridge.md` | Traduz missão Quest → comando Forge |

### 4.2 Packs (Gamificação)

| Pack | Arquivo | Workflow Forge | Itens |
|---|---|---|---|
| App Development | `packs/app-development.yaml` | (inferência por item) | ~35 |
| Design System Forge | `packs/design-system-forge.yaml` | `design-system` | ~49 |
| Squad Upgrade | `packs/squad-upgrade.yaml` | `squad-upgrade` | ~25 |

### 4.3 Sistema de XP

```
Item completado → XP base (definido no pack)
                  + Achievement bonus (se condição atingida)
                  + Streak bonus (itens consecutivos no mesmo dia)
                  = XP total → Level up check
```

**Levels:** Definidos por pack (ex: "Aprendiz Visual" → "Alquimista Visual")
**Achievements:** Condições como "first_item_done", "all_required_done_in_phase:0", etc.
**Streaks:** Itens completados sem interrupção no mesmo dia

### 4.4 Fluxo de Vida do Quest

```
/quest (primeira vez)
  │
  ├─ Scanner: detecta projeto, seleciona pack
  ├─ Ceremony: ASCII art, loading bar, project card
  ├─ Hero Identity: escolhe nome do personagem
  ├─ Action Plan: mostra worlds e missões
  ├─ Cria quest-log.yaml
  └─ Mostra primeira missão

/quest (retomada)
  │
  ├─ Lê quest-log.yaml
  ├─ Auto-Reconciliation: compara com forge state.json, sincroniza itens pendentes
  ├─ Resumption Banner (rápido, ~5s)
  └─ Mostra próxima missão (já atualizada)

/quest check {id}
  │
  ├─ Marca item como done
  ├─ Calcula XP + achievements
  ├─ Mostra celebração
  └─ Mostra próxima missão

/quest scan
  │
  ├─ Verifica scan_rules dos itens
  ├─ Auto-detecta itens já completados
  └─ Atualiza quest-log
```

---

## 5. Componentes do Forge

### 5.1 Modos de Operação

| Modo | Comando | Trigger Words | Workflow |
|---|---|---|---|
| **FULL_APP** | `/forge {desc}` | "app", "sistema", "plataforma" | 6 fases completas |
| **SINGLE_FEATURE** | `/forge feature {desc}` | "adicionar", "implementar" | Discovery→Build→Deploy |
| **BUG_FIX** | `/forge fix {desc}` | "bug", "corrigir", "erro" | Discovery→Fix→Deploy |
| **BROWNFIELD** | `/forge scan` | "analisar", "diagnosticar" | Scan→Diagnose→Plan |
| **DESIGN_SYSTEM** | `/forge design-system {url}` | "design system", "clonar visual" | Extract→Tokens→Components→Deploy |
| **SQUAD_UPGRADE** | `/forge squad-upgrade {name}` | "upgrade squad", "melhorar squad" | Diagnose→DNA→Quality→Validate |
| **RESUME** | `/forge resume` | "continuar", "retomar" | Retoma run interrompido |

### 5.2 Fases Genéricas (Compartilhadas)

| Fase | Arquivo | Usado por |
|---|---|---|
| **Phase 0: Discovery** | `phases/phase-0-discovery.md` | Todos os modos |
| **Phase 1: Spec** | `phases/phase-1-spec.md` | FULL_APP |
| **Phase 2: Stories** | `phases/phase-2-stories.md` | FULL_APP |
| **Phase 3: Build** | `phases/phase-3-build.md` | FULL_APP, SINGLE_FEATURE, BUG_FIX |
| **Phase 4: Integration** | `phases/phase-4-integration.md` | FULL_APP |
| **Phase 5: Deploy** | `phases/phase-5-deploy.md` | Todos os modos |

### 5.3 Agent Dispatch Protocol

```
Para cada fase que requer um agente:

1. Ler arquivo do agente   → .aios-core/development/agents/aios-{name}.md
2. Ler arquivo da task     → .aios-core/development/tasks/{task-name}.md
3. Montar context prompt   → Agent persona + task + project context + story
4. Despachar via Agent tool → subagent_type matching the agent role
5. Coletar output          → Parse resultado, checar erros
6. Atualizar state.json    → Marcar progresso da fase
```

### 5.4 Ecosystem Scanner (2 níveis)

O Forge escaneia o ecossistema AIOS antes de executar, com 2 níveis de profundidade:

#### Nível 1: Scan Rápido (automático, sempre roda)

```
1. Ler INDEX de minds    → squads/mind-cloning/minds/INDEX.md
2. Glob skills           → skills/*/SKILL.md (frontmatter)
3. Glob squads           → squads/*/README.md (primeiras 20 linhas)
4. Match com o projeto   → Routing Matrix (domínio → minds + skills + squads)
5. Injetar contexto      → Agentes recebem referências relevantes
```

#### Nível 2: Deep Scan (opcional, o Forge PERGUNTA ao usuário)

Após o scan rápido, o Forge oferece uma varredura completa:

```
"Encontrei {N} recursos relevantes. Quer que eu faça uma varredura mais profunda?"
1. Sim, varredura completa → escaneia TODOS os squads/skills/minds/workflows
2. Não, já está bom → segue com o que encontrou
3. Tenho uma sugestão → o usuário indica recursos específicos
```

O deep scan lê TUDO (não só a routing matrix), pontua relevância (0-10), e apresenta recursos que o scan rápido pode ter perdido — especialmente squads/skills criados recentemente.

**Exemplo:** Se o projeto envolve "copy" e "landing page", o scan rápido encontra o copywriting-squad via routing matrix. O deep scan pode encontrar adicionalmente o /seo squad, o /lp-generator skill, e o mind do hormozi que o routing matrix não mapeia.

### 5.5 Error Recovery

```
Erro detectado na Phase 3 (Build Loop)
  │
  ├─ Erro de arquitetura     → despacha @architect
  ├─ Erro de banco de dados  → despacha @data-engineer
  ├─ Requisito ambíguo       → CHECKPOINT (pergunta ao usuário)
  ├─ Mesmo erro 3x           → HALT + diagnóstico
  └─ Erro genérico           → Retry @dev (max 3x) → @aios-master
```

### 5.6 State Management

```
.aios/forge-runs/{run_id}/
├── state.json          ← Atualizado a cada transição de fase
├── context-pack.json   ← Resultados do ecosystem scan
├── spec/               ← PRD, docs de arquitetura
├── stories/            ← Arquivos de story
└── build-log/          ← Resultados de build por story
```

---

## 6. Integração Quest ↔ Forge

### 6.1 Forge Bridge (o tradutor)

O `forge-bridge.md` traduz missões do Quest em comandos do Forge.

```
                    Quest Mission
                         │
                         ▼
              ┌─────────────────────┐
              │  should_use_forge() │
              └────────┬────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
     who == @agent  who == squad  who == user
     who == agente                who == skill
          │            │            │
          ▼            ▼            ▼
     FORGE: YES    FORGE: YES    FORGE: NO
          │            │            │
          ▼            ▼            ▼
   build_forge_     build_forge_   Fluxo manual
   command()        command()      ou skill direta
          │            │
          ▼            ▼
    Skill("forge",  Skill("forge",
     args: ...)      args: ...)
          │            │
          ▼            ▼
   handle_forge_result()
          │
     ┌────┴────┐
     │         │
   SUCCESS   FAIL
     │         │
     ▼         ▼
  auto-check  "Tentar de
  + XP        novo? (s/n)"
```

### 6.2 Roteamento por `who`

| Valor de `who` | Vai pro Forge? | Ação |
|---|---|---|
| `@dev`, `@qa`, `@devops`, `@pm`, `@sm`, `@po` | SIM | Forge despacha agente |
| `@architect`, `@data-engineer`, `@analyst` | SIM | Forge despacha agente |
| `@ux-design-expert` | SIM | Forge despacha agente |
| `agente` | SIM | Forge infere qual agente |
| `squad` | SIM | Forge orquestra squad |
| `user` | NÃO | Instrução manual |
| `skill` | NÃO | Invoca skill diretamente |
| Comando com `/` | NÃO | Invoca slash command |

### 6.3 Pack-Level Workflow

Packs podem declarar `forge_workflow` no metadata:

```yaml
pack:
  id: design-system-forge
  forge_workflow: "design-system"   # → skills/forge/workflows/design-system.md
```

Quando definido, TODAS as missões Forge desse pack usam esse workflow. Quando não definido (ex: app-development), o bridge infere o modo por item.

### 6.4 Auto-Check

Quando o Forge completa com sucesso:

```
Forge retorna sucesso
  → forge-bridge chama handle_forge_result()
  → auto_check = true
  → checklist.md recebe: check {item.id} source=forge
  → quest-log atualizado: checked_by: "forge"
  → XP calculado, celebração mostrada
  → Próxima missão selecionada
```

---

## 7. Fluxogramas de Decisão

### 7.1 Fluxo Principal: Usuário → Resultado

```
USUÁRIO DIGITA /quest
         │
         ▼
    quest-log.yaml
    existe?
    ┌────┴────┐
    │ NÃO    │ SIM
    ▼         ▼
 Scanner    Auto-Reconciliation
 Ceremony   (sync Forge→Quest)
 Hero ID    Resumption Banner
 Quest-log    │
    │         │
    └────┬────┘
         │
         ▼
    Seleciona próxima
    missão (guide.md)
         │
         ▼
    Mostra Mission Card
    com campo EXECUÇÃO
         │
         ▼
    should_use_forge(item)?
    ┌────┴────┐
    │ SIM    │ NÃO
    ▼         ▼
 "Executar   who == user?
  via Forge?  ─► Instrução manual
  (s/n)"      who == skill?
    │          ─► Skill(skill: nome)
    │
    ▼ (s)
 forge-bridge
 build_forge_command()
    │
    ▼
 Skill("forge", args)
    │
    ▼
 FORGE EXECUTA
 (ver 7.2)
    │
    ▼
 handle_forge_result()
    │
    ┌────┴────┐
    │ SUCCESS │ FAIL
    ▼         ▼
 auto-check  "Retry?
 XP + celeb   (s/n/manual)"
    │
    ▼
 PRÓXIMA MISSÃO
 (loop)
```

### 7.2 Fluxo Forge: Execução de Workflow

```
FORGE RECEBE COMANDO
(ex: /forge design-system https://stripe.com)
         │
         ▼
    Intent Classification
    ┌──────┴──────┐
    │ Qual modo?  │
    └──────┬──────┘
           │
    ┌──────┼──────┬──────┬──────┬──────┐
    ▼      ▼      ▼      ▼      ▼      ▼
 FULL   FEATURE  FIX   BROWN  DESIGN  SQUAD
 APP              │     FIELD  SYSTEM  UPGRADE
    │      │      │      │      │      │
    ▼      ▼      ▼      ▼      ▼      ▼
 Carrega workflow correspondente
         │
         ▼
    Lê personality.md
    Mostra banner
         │
         ▼
    Run interrompido?
    ┌────┴────┐
    │ SIM    │ NÃO
    ▼         ▼
 Resume      Ecosystem
 from state  Scanner
    │         │
    └────┬────┘
         │
         ▼
    PHASE 0: Discovery
    (perguntas ao usuário)
         │
         ▼
    PLANO DE EXECUÇÃO
    (mostra TODAS as fases,
     agentes, squads, skills)
         │
         ▼
    CHECKPOINT: "Aprovar plano? (1/2/3)"
    ├─ 1. Aprovar → executa
    ├─ 2. Ajustar → modifica plano
    └─ 3. Parar → encerra
         │
         ▼
    PHASE 1...N: Execução
    ┌─────────────────────┐
    │ Para cada fase:     │
    │  1. Ler fase        │
    │  2. Despachar agent │
    │  3. Coletar output  │
    │  4. Quality gate    │
    │  5. Update state    │
    │  6. CHECKPOINT?     │
    └─────────┬───────────┘
              │
         ┌────┴────┐
         │ ERRO?   │
         ▼         ▼
       Error     PHASE N+1
       Recovery  (próxima)
         │
         ▼
    Retry → Escalate → HALT
         │
         ▼
    PHASE FINAL: Deploy
    (@devops push + PR)
         │
         ▼
    COMPLETE
    (completion banner)
```

### 7.3 Fluxo de Criação de Novo Workflow

```
DESENVOLVEDOR QUER
NOVO WORKFLOW
         │
         ▼
    Ler WORKFLOW-GUIDE.md
         │
         ▼
    Criar workflows/{nome}.md
    (seguir template)
         │
         ▼
    Editar SKILL.md
    ├─ § Intent Classification (+1 linha)
    └─ § Selective Reading (+1 linha)
         │
         ▼
    (Opcional) Criar pack Quest
    packs/{nome}.yaml
    com forge_workflow: "{nome}"
         │
         ▼
    Rodar validação:
    node scripts/validate-forge-quest-sync.cjs
         │
    ┌────┴────┐
    │ PASS   │ FAIL
    ▼         ▼
 Pronto!   Corrigir
           inconsistências
```

### 7.4 SDC (Story Development Cycle) — Dentro do Build

```
Para cada story (Phase 3):

    @sm cria story
         │
         ▼
    @po valida (score >= 7/10?)
    ┌────┴────┐
    │ SIM    │ NÃO
    ▼         ▼
 Story      Retorna @sm
 "Ready"    com feedback
    │        (max 2 retries)
    ▼
 @dev implementa
 (modo YOLO/autônomo)
    │
    ▼
 @qa quality gate
    ┌────┴────┐
    │ PASS   │ FAIL
    ▼         ▼
 Story      Error Recovery
 "Done"     ├─ Arquitetura → @architect
    │       ├─ Banco → @data-engineer
    ▼       ├─ Requisito → CHECKPOINT
 Próxima   └─ Stuck (3x) → HALT
 story
```

---

## 8. Inventário de Arquivos

### 8.1 Quest

```
skills/quest/
├── SKILL.md                    # Entry point + Constitution
├── engine/
│   ├── scanner.md              # Detecção de projeto e pack
│   ├── ceremony.md             # Cerimônia RPG visual
│   ├── checklist.md            # Estado: check/skip/unused/sub/scan
│   ├── guide.md                # Seleção de missão + interaction flow
│   ├── xp-system.md            # XP, levels, streaks, achievements
│   ├── forge-bridge.md         # Tradução Quest → Forge
│   └── FORGE-INTEGRATION-PLAN.md  # Plano de implementação
├── packs/
│   ├── app-development.yaml    # Pack genérico de dev
│   ├── design-system-forge.yaml # Pack de design system
│   └── squad-upgrade.yaml      # Pack de upgrade de squad
└── dashboard/                  # Dashboard web (observação)
```

### 8.2 Forge

```
skills/forge/
├── SKILL.md                    # Entry point + Constitution + Intent Classification
├── WORKFLOW-GUIDE.md           # Guia pra criar novos workflows
├── personality.md              # Visual, banners, tom de voz
├── runner.md                   # State machine + SDC + error recovery
├── ecosystem-scanner.md        # Scan de minds/squads/skills
├── phases/
│   ├── phase-0-discovery.md    # Discovery genérico
│   ├── phase-1-spec.md         # Spec (PRD + arquitetura)
│   ├── phase-2-stories.md      # Story factory
│   ├── phase-3-build.md        # Build loop (SDC)
│   ├── phase-4-integration.md  # Integração + QA
│   └── phase-5-deploy.md       # Deploy genérico
├── workflows/
│   ├── full-app.md             # App completo (6 fases)
│   ├── single-feature.md       # Feature (3 fases)
│   ├── bug-fix.md              # Bug fix (3 fases)
│   ├── brownfield.md           # Análise de projeto existente
│   ├── design-system.md        # Design system (6 fases)
│   └── squad-upgrade.md        # Upgrade de squad (5 fases)
└── scripts/
    └── validate-forge-quest-sync.cjs  # Validação de consistência
```

---

## 9. Workflows Existentes — Detalhamento

### 9.1 full-app (FULL_APP)

**Pipeline:** Discovery → Spec → Stories → Build → Integration → Deploy

| Fase | Agente Principal | O que faz |
|---|---|---|
| 0 - Discovery | Forge core | Perguntas ao usuário, ecosystem scan |
| 1 - Spec | @pm | PRD, epic, arquitetura (@architect), research (@analyst) |
| 2 - Stories | @sm | Cria stories do epic, @po valida cada uma |
| 3 - Build | @dev | SDC loop: @dev implementa → @qa valida (por story) |
| 4 - Integration | @qa | Testes de integração, @devops pre-push gate |
| 5 - Deploy | @devops | Push, PR, deploy |

### 9.2 single-feature (SINGLE_FEATURE)

**Pipeline:** Discovery → Build → Deploy

| Fase | Agente Principal | O que faz |
|---|---|---|
| 0 - Discovery | Forge core | Entende a feature, verifica projeto existente |
| 3 - Build | @dev | @sm cria 1-3 stories, @po valida, @dev implementa, @qa gate |
| 5 - Deploy | @devops | Push, PR |

### 9.3 bug-fix (BUG_FIX)

**Pipeline:** Discovery → Fix → Deploy

| Fase | Agente Principal | O que faz |
|---|---|---|
| 0 - Discovery | Forge core | Entende o bug, coleta contexto |
| 3 - Fix (light) | @dev | Cria story (pula @po), implementa fix, @qa review rápido |
| 5 - Deploy | @devops | Push com `fix: {desc}`, PR |

### 9.4 brownfield (BROWNFIELD)

**Pipeline:** Scan → Diagnose → Plan

| Fase | Agente Principal | O que faz |
|---|---|---|
| Scan | @architect | Assessment do projeto: stack, health, estrutura |
| Diagnose | @architect | Diagnostic report com achados |
| Plan | Forge core | Apresenta opções, roteia pra workflow adequado |

### 9.5 design-system (DESIGN_SYSTEM)

**Pipeline:** Discovery → Extract → Tokens → Components → Pages → Deploy

| Fase | Agente Principal | O que faz |
|---|---|---|
| 0 - Discovery | Forge core | URL alvo, goals, stack preference |
| 1 - Extraction | @ux-design-expert, @dev | Screenshots, Dembrandt, deep CSS, animações, componentes |
| 2 - Tokens | @architect, /design squad | Consolidar tokens, hierarquia, Tailwind config |
| 3 - Components | @dev | Atoms → Molecules → Organisms, animações, responsividade |
| 4 - Pages + QA | @dev, @qa | Composição de páginas, visual diff, responsive test |
| 5 - Deploy | @devops | Build, deploy, PR, comparação final |

### 9.6 squad-upgrade (SQUAD_UPGRADE)

**Pipeline:** Diagnose → DNA → Quality → Workflows → Validate

| Fase | Agente Principal | O que faz |
|---|---|---|
| Diagnose | @architect | Audit do squad existente |
| DNA | @architect, @dev | Reestruturar pra padrão AIOS |
| Quality | @qa | Quality gates, testes |
| Workflows | @dev | Workflows YAML, tasks |
| Validate | @qa | Validação final |

---

## 10. Fonte Única de Verdade (Estado e Memória)

### 10.1 Mapa de Estado

```
.aios/
├── quest-log.yaml              ← QUEST é dono
│   ├── meta (hero, pack)
│   ├── items (status, checked_by)
│   └── stats (XP, level)
│
├── forge-runs/                 ← FORGE é dono
│   └── {run_id}/
│       ├── state.json          ← Progresso do run (fase, status)
│       └── context-pack.json   ← Resultado do ecosystem scan
│
└── memory/                     ← COMPARTILHADO
    └── project-context.md      ← Decisões, stack, regras do projeto
```

### 10.2 Regras de Propriedade

| Dado | Dono | Local canônico | Quem lê | Quem escreve |
|---|---|---|---|---|
| Status dos itens | Quest | `quest-log.yaml` | Quest, Forge (via bridge) | Quest |
| XP, level, achievements | Quest | `quest-log.yaml` | Quest | Quest |
| Hero name, pack ativo | Quest | `quest-log.yaml` | Quest | Quest |
| Progresso do run (fase) | Forge | `state.json` | Forge, Quest (read-only) | Forge |
| Contexto do ecossistema | Forge | `context-pack.json` | Forge, agentes | Forge |
| Decisões do projeto | Compartilhado | `project-context.md` | Todos (read) | Agentes (via Forge), usuário manual. Quest NUNCA escreve. Forge NUNCA escreve diretamente. |

### 10.3 Regra de Ouro

**Quest NUNCA escreve em `forge-runs/`. Forge NUNCA escreve em `quest-log.yaml`.** Eles se comunicam APENAS pelo forge-bridge.

### 10.4 Sincronização Automática (2 mecanismos)

O usuário NUNCA precisa se preocupar com sincronização. Ela acontece automaticamente:

#### Mecanismo 1: Real-time (durante execução)

```
Forge completa item 4.2 com sucesso
  → forge-bridge chama check 4.2 source=forge (IMEDIATO)
  → Quest atualiza quest-log.yaml
  → Ambos os estados são consistentes
```

Este é o caminho feliz. Funciona 99% das vezes.

#### Mecanismo 2: Auto-reconciliação no Resumption (safety net)

```
Usuário roda /quest (retomada)
  → Quest lê quest-log.yaml
  → Quest lê TODOS os forge-runs/*/state.json
  → Compara: "Forge diz que completou 4.2, mas Quest tem como pendente?"
  → Auto-corrige ANTES de mostrar próxima missão
  → "Sincronizei 3 itens do último Forge run."
```

Este é o safety net. Captura casos onde:
- O contexto acabou no meio da execução do Forge
- Houve um erro no forge-bridge
- O Forge rodou direto (`/forge`) sem passar pelo Quest

#### Garantia

| Cenário | O que acontece |
|---|---|
| Forge completa durante a sessão | Real-time sync via forge-bridge ✅ |
| Contexto acaba no meio do Forge | Resumption sync na próxima sessão ✅ |
| Usuário roda `/forge` direto (sem Quest) | Resumption sync quando abrir Quest ✅ |
| Ambos os syncs falham | Impossível — resumption lê arquivos estáticos, sempre funciona |

### 10.5 Por que essa arquitetura

| Sem isso | Com isso |
|---|---|
| Forge anota, Quest não sabe → progresso desatualizado | Auto-sync em 2 camadas → sempre consistente |
| Quest marca done, Forge re-executa → trabalho duplicado | Donos separados + bridge → sem conflito |
| Anotação em lugar errado → contexto perdido | `.aios/memory/` único → sempre encontrável |
| Contexto acaba → estado corrompido | Resumption reconcilia → self-healing |

---

## 11. Fronteiras do Ecossistema

| Componente | Pertence a | Relação com Forge+Quest |
|---|---|---|
| Agentes AIOS (@dev, @qa, etc.) | `.aios-core/development/agents/` | Forge os despacha, mas não os define |
| Tasks AIOS | `.aios-core/development/tasks/` | Forge as referencia, mas não as define |
| Squads (design, copywriting, etc.) | `squads/` | Forge os orquestra, mas não os define |
| Skills independentes | `skills/` | Quest pode invocar diretamente (sem Forge) |
| Constitution AIOS | `.aiox-core/constitution.md` | Forge enforce, mas não define |
| Dashboard Quest | `skills/quest/dashboard/` | Observação apenas (Constitution: CLI First) |

---

## 12. Validação de Consistência

O script `validate-forge-quest-sync.cjs` verifica 9 categorias:

| # | Checagem | O que valida |
|---|---|---|
| 1 | Forge Workflows | Todos os .md em workflows/ são listados |
| 2 | SKILL.md → Workflows | Cada workflow é referenciado no Intent Classification |
| 3 | Workflow Structure | Seções obrigatórias: When to Use, Pipeline, Execution, Agent Mapping |
| 4 | Quest Packs ↔ Forge | forge_workflow nos packs aponta pra arquivo existente |
| 5 | Cobertura | Workflows sem pack (avisos, pode ser intencional) |
| 6 | Forge Bridge | forge-bridge.md existe e tem as 3 funções core |
| 7a | Quest Constitution | Regras NON-NEGOTIABLE existem no SKILL.md |
| 7b | Forge Constitution | Regras NON-NEGOTIABLE existem no SKILL.md |
| 7c | Squad Routing | Squads vão pro Forge, não pro fluxo manual |
| 8 | Checklist | Suporta source=forge e checked_by |
| 9 | Pack Items | Valores de `who` são válidos |

**Execução:** `node skills/forge/scripts/validate-forge-quest-sync.cjs`

---

## 13. Escalabilidade — Como Crescer

### Adicionar novo workflow ao Forge (AUTOMÁTICO)

O usuário NÃO precisa editar arquivos manualmente. Basta rodar:

```
/forge new-workflow landing-page
```

O Forge faz tudo sozinho:
1. Lê `WORKFLOW-GUIDE.md` (template)
2. Pergunta ao usuário o que o workflow faz, quais agentes usa, quantas fases tem
3. Deep scan no ecossistema (squads, skills, minds relevantes)
4. Gera `workflows/{nome}.md`
5. Edita `SKILL.md` (Intent Classification + Selective Reading)
6. Pergunta se quer gamificar → se sim, gera `packs/{nome}.yaml`
7. Roda `validate-forge-quest-sync.cjs` → se falhar, corrige automaticamente
8. Mostra resultado

### Gamificar um workflow existente

Se um workflow já existe mas não tem pack Quest:

```
/forge new-workflow {nome} --gamify-only
```

Gera apenas o pack YAML com `forge_workflow: "{nome}"` apontando pro workflow existente.

### Workflows futuros planejados

| Workflow | Comando | Pipeline estimada |
|---|---|---|
| `landing-page` | `/forge lp {url}` | Extract DNA → Copy → Compose → Render → Deploy |
| `content-pipeline` | `/forge content {briefing}` | Research → Outline → Write → Review → Publish |
| `mind-clone` | `/forge mind {nome}` | Sources → Voice DNA → Thinking DNA → Validate → Deploy |
| `brand-kit` | `/forge brand {empresa}` | Research → Posicionamento → Identity → Assets |
| `automation` | `/forge automation {processo}` | Map Process → Design → Build → Test → Deploy |

---

## 14. Riscos e Pontos de Atenção

| Risco | Mitigação |
|---|---|
| Forge tenta implementar em vez de delegar | Constitution NON-NEGOTIABLE + Agent Dispatch Protocol obrigatório |
| Quest executa trabalho diretamente | Constitution NON-NEGOTIABLE + forge-bridge routing |
| Pack e workflow ficam dessincronizados | Script `validate-forge-quest-sync.cjs` |
| Workflow antigo sem Agent Mapping | Adicionado em todos os 6 workflows (corrigido nesta sessão) |
| Squads caem no fluxo manual | Corrigido: forge-bridge roteia squads pro Forge |
| Novo workflow criado sem seguir padrão | `WORKFLOW-GUIDE.md` com template + checklist |
| Error recovery em loop infinito | Max 3 retries + HALT automático |
| Quest e Forge dessincronizados | Auto-reconciliação em 2 camadas: real-time (forge-bridge) + resumption (safety net) |
| Forge não conhece novos squads/skills | Deep scan oferecido no Phase 0 (Step 5b) — varredura completa do ecossistema |
| Usuário não sabe os comandos | `/quest help` e `/forge help` com lista formatada |
| Forge executa sem mostrar plano | Plano de execução obrigatório no Phase 0 (Step 7) com CHECKPOINT |

---

## 15. Cobertura de Agentes e Squads

### 14.1 Agentes AIOS — Status de Utilização

| Agente | Usado pelo Forge? | Em quais workflows? | Papel |
|---|---|---|---|
| `@dev` | ✅ Ativo | Todos | Implementação de código |
| `@qa` | ✅ Ativo | Todos | Quality gates, testes, visual diff |
| `@devops` | ✅ Ativo | Todos (deploy) | Push, PR, deploy, releases |
| `@architect` | ✅ Ativo | full-app, design-system, brownfield | Arquitetura, complexidade, tokens |
| `@sm` | ✅ Ativo | full-app, single-feature | Criação de stories |
| `@po` | ✅ Ativo | full-app, single-feature | Validação de stories |
| `@pm` | ✅ Ativo | full-app | PRD, epics, specs |
| `@analyst` | ✅ Ativo | full-app | Pesquisa de mercado, research |
| `@ux-design-expert` | ✅ Ativo | design-system | Screenshots, a11y, visual spec |
| `@data-engineer` | ✅ Error recovery | Qualquer workflow | Quando @dev trava em schema/migration/RLS |
| `@aios-master` | ✅ Escalação | Qualquer workflow | Quando error recovery falha 3x → última linha de defesa |
| `@navigator` | ❌ Não usado | — | Poderia auxiliar em discovery/brownfield |

### 14.2 Squads — Status de Utilização

| Squad | Usado pelo Forge? | Workflow atual | Workflows futuros |
|---|---|---|---|
| `/design` | ✅ Ativo | design-system | landing-page |
| `/copywriting` | ❌ Não usado | — | **landing-page**, content-pipeline |
| `/seo` | ❌ Não usado | — | **landing-page**, content-pipeline |
| `/branding` / `/brandcraft` | ❌ Não usado | — | **brand-kit** |
| `/storytelling-masters-fosc` | ❌ Não usado | — | **content-pipeline** |
| `/content-creator` / `/content-engine` | ❌ Não usado | — | **content-pipeline** |
| `/curator` | ❌ Não usado | — | **content-pipeline** (vídeo) |
| `/mind-cloning` | ❌ Não usado | — | **mind-clone** |
| `/hormozi` | ❌ Via ecosystem scanner | — | Injetado como contexto em oferta/high-ticket |
| `/advisor-board` | ❌ Não usado | — | Decisões estratégicas |
| `/negotiation` | ❌ Fora do escopo | — | — |
| `/icp-cloning` | ❌ Não usado | — | Marketing |

### 14.3 Mapa: Workflows Futuros → Agentes/Squads que Entram

| Workflow Futuro | Novos Agentes/Squads que serão utilizados |
|---|---|
| `landing-page` | /copywriting, /seo, /design, @ux-design-expert |
| `content-pipeline` | /content-creator, /storytelling, /curator, /seo |
| `mind-clone` | /mind-cloning, /curator (transcrições) |
| `brand-kit` | /branding, /brandcraft, /design |
| `automation` | @architect, @data-engineer, @dev |

### 14.4 Nota sobre Ecosystem Scanner

Mesmo sem workflow dedicado, o Forge já utiliza squads e minds indiretamente via `ecosystem-scanner.md`. Quando o Forge detecta que o projeto envolve "copy" ou "landing page", ele injeta referências ao copywriting-squad e minds relevantes (hormozi, schwartz, etc.) no contexto dos agentes. Isso enriquece a qualidade do output sem precisar de um workflow específico.

A diferença entre "usado via ecosystem scanner" e "usado via workflow" é:
- **Ecosystem scanner:** injeta contexto (passivo) — o agente SABE que o squad existe
- **Workflow dedicado:** orquestra diretamente (ativo) — o Forge CHAMA o squad pra fazer o trabalho

---

## 16. Métricas de Sucesso

| Métrica | Como medir |
|---|---|
| Workflows existentes passam no validador | `validate-forge-quest-sync.cjs` → 0 erros |
| Quest nunca executa trabalho | Auditoria do guide.md e forge-bridge.md |
| Forge sempre delega | Auditoria dos workflows (Agent Mapping completo) |
| Novo workflow criado em < 30 min | Template + guia no WORKFLOW-GUIDE.md |
| Usuário entende o fluxo | Este PRD + fluxogramas |
