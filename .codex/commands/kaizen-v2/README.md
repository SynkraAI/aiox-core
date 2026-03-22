# Kaizen v2 — Ecosystem Intelligence with Daily Sensing

**Evolução do kaizen v1:** squad que vigia e melhora o ecossistema, agora com Tier 0 Sensorial para captura diária de learnings, pattern learning via forgetting curve, e briefings proativos de sessão.

## Dependencies

- **Requires:** `squads/kaizen/` (v1.3.0+) for base minds (10 mind clones referenced by kaizen-v2)
- Install kaizen v1 first, then kaizen-v2 extends it

## O que é Kaizen v2?

Kaizen v2 é uma **extensão fork do kaizen v1.3.0** (não modifica v1, estende capacidades):

- **v1 base:** análise semanal do ecossistema via 7 agentes (topology, performance, bottleneck, capability, radar, cost, kaizen-chief)
- **v2 extensão:** adiciona Tier 0 Sensorial com:
  - **Daily capture:** Stop hook coleta learnings automaticamente → `daily/YYYY-MM-DD.yaml`
  - **Pattern learning:** Reflexão overnight extrai padrões com forgetting curve (decay_score)
  - **Session briefings:** SessionStart hook injeta top patterns + learnings ≤ 2KB
  - **Memory-keeper agente:** novo agente especializado em daily intelligence

## Estrutura

```
squads/kaizen-v2/
├── squad.yaml                           # v2.0.0 manifesto
├── README.md                            # Este arquivo
├── SETUP.md                             # Guia técnico de hooks + troubleshooting
├── CHANGELOG.md
│
├── config/
│   └── config.yaml                      # Schedules, hooks, intelligence settings
│
├── agents/
│   ├── kaizen-chief.md                  # Orchestrator (atualizado para v2)
│   ├── memory-keeper.md                 # Tier 0 Sensorial [NOVO]
│   └── [6 mais]                         # v1 agents (copiados)
│
├── tasks/
│   ├── capture-daily.md                 # Captura manual [NOVO]
│   ├── reflect.md                       # Reflexão overnight [NOVO]
│   ├── mine-patterns.md                 # Mine patterns com decay [NOVO]
│   ├── build-report.md                  # Report com learnings [NOVO]
│   ├── compact-archive.md               # Archive rotation [NOVO]
│   ├── install.md                       # Auto-install [NOVO]
│   ├── uninstall.md                     # Remove hooks [NOVO]
│   ├── health-check.md                  # Verify hooks + dirs [NOVO]
│   └── [8 mais]                         # v1 tasks (copiados)
│
├── workflows/
│   ├── wf-daily-capture.yaml            # [NOVO]
│   ├── wf-overnight-reflect.yaml        # [NOVO]
│   ├── wf-install.yaml                  # [NOVO]
│   └── [3 mais]                         # v1 workflows (copiados)
│
├── templates/
│   ├── daily-digest-tmpl.yaml           # [NOVO]
│   ├── reflection-tmpl.md               # [NOVO]
│   ├── monthly-report-tmpl.md           # [NOVO]
│   └── [4 mais]                         # v1 templates (copiados)
│
├── checklists/
│   ├── daily-capture-checklist.md       # [NOVO]
│   ├── reflection-quality-checklist.md  # [NOVO]
│   ├── installation-checklist.md        # [NOVO]
│   └── [3 mais]                         # v1 checklists (copiados)
│
├── rules/
│   ├── forgetting-curve.md              # [NOVO] Decay formula + lifecycle
│   ├── extraction-criteria.md           # [NOVO] Pattern validation rules
│   └── recommendation-defensibility.md  # v1 (copiado)
│
├── minds/
│   ├── hermann_ebbinghaus/              # [NOVO] Forgetting curve framework
│   ├── lance_martin/                    # [NOVO] Claude-diary pattern
│   └── chris_argyris/                   # [NOVO] Double-loop learning
│   # v1 minds (10) referenced from squads/kaizen/minds/ — not duplicated
│
├── scripts/
│   ├── stop-capture.cjs                 # [NOVO] Stop hook → daily capture
│   ├── session-briefing.cjs             # [NOVO] SessionStart hook → inject briefing
│   └── [2 mais]                         # v1 scripts (copiados)
│
└── data/
    ├── intelligence/                    # [NOVO] Daily intelligence data
    │   ├── daily/                       # daily/YYYY-MM-DD.yaml files
    │   ├── reflections/                 # reflection-YYYY-MM-DD.md files
    │   ├── knowledge/
    │   │   └── patterns.yaml            # Master pattern db com decay_scores
    │   └── archive/                     # archived patterns (< decay 0.1)
    │
    ├── reports/                         # Generated weekly/monthly reports
    ├── baselines/                       # v1 (copiado)
    ├── radar/                           # v1 (copiado)
    ├── recommendation-tracker.yaml      # v1 (copiado)
    ├── gap-action-plan.md               # v1 (copiado)
    └── kill-switch-protocol.md          # v1 (copiado)
```

## Instalação Rápida

```bash
# Detecção automática + merge hooks + init dirs
/kaizen-v2:*install

# Verifica se tudo está funcionando
/kaizen-v2:*health
```

## Comandos Principais

### Daily Intelligence

| Comando | O que faz | Gatilho |
|---------|-----------|---------|
| `*capture` | Captura daily manualmente | Fallback se Stop hook falhar |
| `*reflect` | Reflexão overnight (capture → patterns → reflection) | Cron overnight (config) |
| `*patterns` | Mine patterns com forgetting curve | Manual ou via reflect |

### Relatórios & Reports

| Comando | O que faz | Output |
|---------|-----------|--------|
| `*report weekly` | Relatório semanal com learnings | `data/reports/report-YYYY-WXX.md` |
| `*report monthly` | Relatório mensal + tendências | `data/reports/report-YYYY-MM.md` |
| `*report yearly` | Relatório anual com insights | `data/reports/report-YYYY.md` |

### Operacional

| Comando | O que faz |
|---------|-----------|
| `*health` | Verifica hooks, dirs, patterns.yaml, último daily |
| `*archive` | Archiva dailies > 90 dias, delete patterns decayed < 0.05 |
| `*install` | Auto-detecção AIOS/AIOX + merge hooks + init dirs |
| `*uninstall` | Remove hooks (preserva `data/intelligence/`) |

### v1 Backward Compat

| Comando | v1 Original | Status |
|---------|-------------|--------|
| `*analyze` | Full ecosystem analysis | ✓ Idêntico |
| `*gaps` | Detect competency/tool gaps | ✓ Idêntico |
| `*performance` | Dashboard DORA + BSC | ✓ Idêntico |
| `*radar` | Tech radar update | ✓ Idêntico |

## Como Funciona

### Visão Geral: O Ciclo de Inteligência

```
Sessão termina ──→ Stop hook ──→ daily/YYYY-MM-DD.yaml (dado bruto)
                                        │
                                        ↓
                                  *reflect (overnight)
                                        │
                                   5 critérios de extração
                                        │
                                        ↓
                                  patterns.yaml (com decay_score)
                                        │
                                        ↓
Sessão inicia ──→ SessionStart hook ──→ briefing (top 5 patterns)
                                        │
                                        ↓
                              Agente usa pattern → reforço (score = 1.0)
                              Agente ignora → decay natural → archive → delete
```

### 1. Daily Capture (Stop Hook)

Quando você termina a sessão:

```
Stop hook (async, 5s timeout, fail-silent):
  1. Lê stdin JSON (session_id, last_assistant_message)
  2. Detecta learning signals ("descobri", "decidimos", "padrão é")
  3. Detecta decision signals ("decidimos", "vamos usar", "optamos")
  4. Extrai agentes mencionados (@agent-name)
  5. git log --since=today para activity
  6. Append daily/YYYY-MM-DD.yaml
  7. Never blocks session exit
```

**Resultado:** `data/intelligence/daily/YYYY-MM-DD.yaml` com learnings, decisions, agents, git stats.

### 2. Pattern Extraction (Reflect + Forgetting Curve)

Periodicamente (overnight via cron ou manual via `*reflect`), o memory-keeper analisa os dailies e extrai patterns verificados.

#### Critérios de Extração (5 gates obrigatórios)

Um learning **só vira pattern** se passar nos 5 critérios:

| # | Critério | Pergunta | Exemplo |
|---|----------|----------|---------|
| 1 | **VERIFIED** | Observado 2+ vezes independentes? | Bug apareceu 2x no git history |
| 2 | **NON_OBVIOUS** | Não está já documentado? | Insight novo sobre Windows hooks |
| 3 | **REUSABLE** | Aplica a mais de 1 cenário? | "Hooks timeout no Windows" → todos os hooks |
| 4 | **ACTIONABLE** | Tem trigger + ação? | "Quando implementar hooks, use timer.unref()" |
| 5 | **EMPIRICAL** | Baseado em observação real? | Rastreável a commit, task ou decisão documentada |

**Rejeitados automaticamente:**
- Observações únicas (ficam no daily, não viram pattern)
- Especulação ("talvez X funcione") → fica no daily
- Duplicatas → reforçam pattern existente ao invés de criar novo
- Triggers ambíguos → rejeitados com comentário

#### Pipeline de Reflexão

```
reflect:
  1. Lê últimos 7 dailies (ou todos se < 7)
  2. Extrai learnings candidates de cada daily
  3. Para cada candidate:
     ├─ Já existe em patterns.yaml? → REFORÇO (reset decay)
     └─ Novo? → Valida 5 critérios
         ├─ Passa → Adiciona como pattern (decay_score = 1.0)
         └─ Falha → Log do motivo, permanece no daily
  4. Recalcula decay_score de TODOS os patterns existentes
  5. Flagga patterns com score < 0.1 para archive
  6. Gera reflection-YYYY-MM-DD.md
```

**Resultado:** `data/intelligence/knowledge/patterns.yaml` atualizado.

### 3. Forgetting Curve (Ebbinghaus)

A curva de esquecimento controla a vida útil de cada pattern. Patterns que não são usados decaem naturalmente; patterns que são acessados se reforçam.

#### Fórmula

```
decay_score(t) = e^(-rate × dias_sem_acesso)
```

- `rate = 0.05` para patterns genéricos (~60 dias até score 0.05)
- `rate = 0.025` para patterns verificados (~120 dias, 2x mais lentos)

#### Tabela de Decay

| Dias sem usar | Score | Status | Ação |
|---------------|-------|--------|------|
| 0 | 1.00 | Fresh | Pattern ativo no briefing |
| 7 | 0.70 | Ativo | Normal |
| 14 | 0.50 | Morno | Ainda aparece no briefing |
| 30 | 0.22 | Frio | Sai do briefing (< 0.3) |
| 45 | 0.10 | Archive | Movido para `archive/` |
| 60 | 0.05 | Delete | Removido do sistema |

#### Reforço

Quando um pattern é **acessado** (reaparece num daily, é citado numa decisão, ou é usado pelo agente via briefing), o `days_since_observed` reseta para 0 e o score volta a `1.0`.

Isso imita como humanos lembram melhor o que revisam — conhecimento útil se auto-reforça, conhecimento obsoleto desaparece sozinho.

#### Lifecycle Completo

```
1. OBSERVED    → Sighting num daily, candidate
2. EXTRACTED   → Passa 5 critérios, decay_score = 1.0
3. REINFORCED  → Re-observado, days reset, score = 1.0
4. FADING      → score 0.1-0.5, aviso no briefing
5. ARCHIVED    → score < 0.1, movido para archive/
6. DELETED     → score < 0.05, removido (compact-archive)
```

#### Por que funciona para agentes de IA

Agentes de IA não têm memória entre sessões. Sem forgetting curve:
- Guardar tudo → ruído (context window poluído)
- Não guardar nada → repetir erros (zero aprendizado)

Com forgetting curve:
- O que é **útil** se reforça naturalmente (agente usa → score sobe)
- O que é **obsoleto** desaparece sozinho (ninguém usa → score cai)
- Briefing sempre tem **os patterns mais relevantes** (top 5 por score)
- Disco limpo: < 500 KB/ano projetado

**Analogia:** Se o Kaizen v1 é um médico que faz check-up semanal, o v2 é um smartwatch que monitora 24/7, lembra o que importa e esquece o que não.

### 4. Session Briefing (SessionStart Hook)

Início de cada sessão:

```
SessionStart hook (3s timeout, fail-silent):
  1. Lê patterns.yaml → filtra decay_score > 0.3
  2. Ordena por score descendente (mais frescos primeiro)
  3. Seleciona top 5 patterns
  4. Lê últimas 3 dailies → extrai activity summary
  5. Monta briefing ≤ 2KB
  6. Injeta via additionalContext
```

**Resultado:** O agente começa a sessão já sabendo os patterns mais importantes do projeto, sem precisar ler documentação.

### 5. Weekly Report (Synthesis)

Relatório semanal agrega:

- 6 dimensões v1 (structure, performance, bottleneck, capability, tools, cost)
- **NOVO:** Seção "Learnings" com top patterns extraídos
- Padrões reinforced esta semana (o que foi útil)
- Padrões archivados (o que ninguém usou)
- Tendência de decay (saúde da base de conhecimento)

## Troubleshooting

Veja **[SETUP.md](SETUP.md)** para guia técnico completo:
- Como verificar se hooks estão registrados
- Debug de Stop hook em Windows
- Debug de SessionStart injection
- Limpeza manual de patterns.yaml
- Fallback manual se hooks falhar

## Configuração

Veja `config/config.yaml`:

```yaml
# Hook schedules
hooks:
  stop_hook:
    enabled: true
    timeout_ms: 3000
    fail_silent: true

  session_start_hook:
    enabled: true
    timeout_ms: 1000
    fail_silent: true

# Reflection schedule (default: 2am daily)
schedules:
  overnight_reflect:
    cron: "0 2 * * *"
    timezone: "America/Sao_Paulo"

# Forgetting curve parameters
intelligence:
  decay:
    rate_general: 0.05
    rate_verified: 0.025
    archive_threshold: 0.1
    delete_threshold: 0.05

  briefing:
    max_patterns: 5
    max_kb: 2
    include_recent_dailies: 3
```

## Compatibilidade

- **AIOS 2.1.0+** (detecção automática)
- **AIOX 1.0.0+** (detecção automática)
- **Claude Code 60s+** (hooks via `.claude/settings.json`)
- **Windows/macOS/Linux** (hooks testados em todos)

## Diferença v1 vs v2

| Aspecto | v1 | v2 |
|--------|----|----|
| **Análise** | Semanal | Semanal + Daily |
| **Captura** | Manual | Automática (Stop hook) |
| **Memória** | Ad-hoc | Persistente via patterns.yaml |
| **Decay** | N/A | Forgetting curve (Ebbinghaus) |
| **Briefing** | N/A | SessionStart injection |
| **Minds** | 10 (included) | 3 v2-specific (+ 10 inherited from v1 by reference) |
| **Agentes** | 7 | 8 (+ memory-keeper) |
| **Ativação** | `/kaizen:*analyze` | `/kaizen-v2:*capture`, `/kaizen-v2:*report` |

## Logs & Debug

- Hook logs: `.aios/logs/kaizen-*.log`
- Pattern debug: `data/intelligence/knowledge/patterns.yaml` (veja decay_score)
- Daily debug: `data/intelligence/daily/YYYY-MM-DD.yaml`

## Status por Fase

| Fase | Descrição | Status |
|------|-----------|--------|
| Phase 1 | Foundation (structure + agents + tasks) | ✅ Complete |
| Phase 2 | Stop hook capture + daily YAML | ✅ Scripts funcionais, testados |
| Phase 3 | Reflect + forgetting curve + patterns seed | ✅ Specs + seed 7 patterns |
| Phase 4 | Reports com learnings section | ✅ Templates definidos |
| Phase 5 | Install + health-check | ✅ install.md v2 com instruções |
| Integration | Hook registration via `*install` | ⏳ Pendente |

## Pendências

- **Executar `*install`** para registrar hooks em `.claude/settings.json`
- **Completar 3 minds novas** (voice_dna.yaml para ebbinghaus, lance_martin, chris_argyris)
- **Criar `.synapse/manifest`** para integração com SYNAPSE L5 layer
- **Registrar em registries** (tool-registry, entity-registry)

---

**Versão:** 2.1.0 | **Status:** BETA (scripts prontos, hooks pendentes) | **Próximo:** `*install` para ativar
