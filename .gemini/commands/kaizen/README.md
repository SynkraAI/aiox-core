# Kaizen Squad v1.2.0

Meta-squad de "RH + Ferramentas" do ecossistema AIOS. Analisa continuamente squads, agentes, ferramentas e competências. Detecta gaps, monitora performance, recomenda novos recursos. O "sistema nervoso" do AIOS.

**Status**: ACTIVE | **Cadência**: Semanal (domingo 20:00 BRT) | **Custo**: ~$4.50/semana

---

## Arquitetura 3-Tier

```text
┌─────────────────────────────────────────────────────────┐
│                   ORCHESTRATOR                          │
│              kaizen-chief                         │
│         (routing, síntese, relatório)                   │
├─────────────────────────────────────────────────────────┤
│                    TIER 0 — Diagnóstico                 │
│     topology-analyst  ║  performance-tracker            │
│     (Team Topologies) ║  (DORA + BSC + OKR)             │
├─────────────────────────────────────────────────────────┤
│                    TIER 1 — Operacional                 │
│  bottleneck-hunter ║ capability-mapper ║ tech-radar     │
│  (TOC + OMTM)      ║ (Wardley + 4R)    ║ (Radar + FF)  │
├─────────────────────────────────────────────────────────┤
│                    TIER 2 — Especialista                │
│                    cost-analyst                         │
│                    (FinOps + Kaplan)                    │
└─────────────────────────────────────────────────────────┘
```

---

## Agentes

| Agente | Tier | Frameworks | Heurísticas |
|---|---|---|---|
| kaizen-chief | Orchestrator | Cagan (routing) + orquestração | Routing table (8 triggers) |
| topology-analyst | T0 | Team Topologies (Skelton & Pais) | IN_TA_001-005 |
| performance-tracker | T0 | DORA + BSC + OKR (Forsgren, Kaplan, Doerr) | IN_PT_001-005 |
| bottleneck-hunter | T1 | TOC + OMTM (Goldratt, Croll) | IN_BH_001-010 |
| capability-mapper | T1 | Wardley Maps + 4R (Wardley, Bersin) | IN_CM_001-005 |
| tech-radar | T1 | Technology Radar + Fitness Functions (Fowler, Ford) | IN_TR_001-005 |
| cost-analyst | T2 | FinOps (Storment) + Financial (Kaplan) | IN_CA_001-005 |

**Total**: 35 heurísticas determinísticas | 11 frameworks codificados | 10 mentes elite

---

## Comandos

| Comando | Descrição | Workflow/Task |
|---|---|---|
| `*analyze` | Análise completa do ecossistema (6 dimensões) | wf-ecosystem-analysis |
| `*gaps` | Detectar gaps de competência e ferramentas | detect-gaps |
| `*performance` | Dashboard de performance (DORA + BSC + OKR) | performance-dashboard |
| `*radar` | Atualizar technology radar | update-radar |
| `*cost` | Análise de custos e ROI | cost-analysis |
| `*report` | Gerar relatório semanal de recomendações | wf-weekly-report |
| `*recommend` | Gerar recomendações de recursos | generate-recommendations |
| `*self-improve` | Meta-análise e auto-melhoria do squad | wf-self-improve |

---

## Workflows

| Workflow | Fases | Checkpoints | Descrição |
|---|---|---|---|
| wf-ecosystem-analysis | 5 (0-4) | QG-KZ-001, QG-KZ-002 | Análise completa com execução paralela por tier |
| wf-weekly-report | 3 (0-2) | QG-KZ-004 | Relatório semanal (usa cache se análise < 3 dias) |
| wf-self-improve | 3 (0-2) | Health thresholds + guardrails | Meta-análise e auto-melhoria |

### wf-self-improve — Detalhes

Meta-análise semanal onde o squad analisa sua própria eficácia.

| Fase | Nome | Duração | O que faz |
|------|------|---------|-----------|
| Phase 0 | Coleta de Meta-Dados | 1-2 min | Lê relatórios anteriores, classifica recomendações (IMPLEMENTADA/IGNORADA/PARCIAL/PENDENTE), analisa atividade do squad |
| Phase 1 | Diagnóstico de Eficácia | 2-3 min | Avalia 4 dimensões: taxa de implementação, cobertura de análise, precisão de gaps, atualidade do baseline |
| Phase 2 | Plano de Melhoria | 2-3 min | Gera max 3 melhorias por ciclo, auto-aplica triviais (baseline, calibração), reporta destrutivas para aprovação |

**Guardrails**: NUNCA remover agentes automaticamente. NUNCA modificar heurísticas de outros squads. Max 3 melhorias por ciclo. Changelog obrigatório de auto-modificações.

**Output**: `data/reports/self-improve-{date}.md`

**Cadência**: Domingo 20:30 BRT (após health check semanal)

---

## Quality Gates

| ID | Nome | Transição | Tipo |
|---|---|---|---|
| QG-KZ-001 | Data Collection Complete | Input → Diagnóstico | Blocking |
| QG-KZ-002 | Diagnosis Validated | Tier 0 → Tier 1 | Blocking |
| QG-KZ-003 | Recommendations Quality | Análise → Relatório | Blocking |
| QG-KZ-004 | Weekly Report Quality | Format → Delivery | Blocking |

---

## Regra Transversal: Defensibilidade (RULE-RD-001)

> Recomendações são baseadas em EVIDÊNCIA, não opinião. Regra do N<3: sinais com menos de 3 ocorrências não viram recomendação de ação.

Detalhes: `rules/recommendation-defensibility.md`

---

## Modos de Operação

### Proativo (Git Triggers)

| Trigger | Paths/Pattern | Ações |
|---|---|---|
| planning-phase | `docs/stories/`, `docs/prd/`, `docs/epics/` | detect-gaps, generate-recommendations |
| squad-change | `squads/*/agents/`, `squads/*/config/` | detect-gaps, update-radar |
| feature-complete | `^feat\(` (commit) | performance-dashboard, cost-analysis |
| workflow-change | `squads/*/workflows/`, `squads/*/tasks/` | performance-dashboard |

### Reativo (On-Demand)

Qualquer comando `*` ativa a análise correspondente sob demanda.

### Cadências Automáticas

| Cadência | Horário | Workflow | Entrega |
|---|---|---|---|
| Health check semanal | Domingo 20:00 BRT | wf-ecosystem-analysis | WhatsApp |
| Self-improvement | Domingo 20:30 BRT | wf-self-improve | WhatsApp |

---

## Estrutura de Arquivos

```text
squads/kaizen/
├── README.md                    # Este arquivo
├── CHANGELOG.md                 # Histórico de versões
├── config/
│   └── config.yaml              # Configuração central do squad
├── agents/                      # 7 agentes (Orchestrator + T0 + T1 + T2)
│   ├── kaizen-chief.md
│   ├── topology-analyst.md
│   ├── performance-tracker.md
│   ├── bottleneck-hunter.md
│   ├── capability-mapper.md
│   ├── tech-radar.md
│   └── cost-analyst.md
├── tasks/                       # 6 tasks executáveis
│   ├── detect-gaps.md
│   ├── performance-dashboard.md
│   ├── update-radar.md
│   ├── cost-analysis.md
│   ├── generate-recommendations.md
│   └── self-improve.md
├── workflows/                   # 3 workflows de orquestração
│   ├── wf-ecosystem-analysis.yaml
│   ├── wf-weekly-report.yaml
│   └── wf-self-improve.yaml
├── templates/                   # 4 templates de output
│   ├── weekly-report-tmpl.md
│   ├── tech-radar-tmpl.md
│   ├── capability-map-tmpl.md
│   └── performance-dashboard-tmpl.md
├── checklists/                  # 3 quality gates
│   ├── report-quality-checklist.md
│   ├── agent-activation-checklist.md
│   └── analysis-quality-checklist.md
├── rules/                       # Regras transversais
│   └── recommendation-defensibility.md
├── minds/                       # 10 mentes elite
│   ├── skelton_pais/
│   ├── eliyahu_goldratt/
│   ├── kaplan_norton/
│   ├── john_doerr/
│   ├── josh_bersin/
│   ├── nicole_forsgren/
│   ├── martin_fowler/
│   ├── neal_ford/
│   ├── alistair_croll/
│   └── simon_wardley/
├── data/                        # Baselines, relatórios, tracking
│   ├── baselines/
│   ├── reports/
│   ├── radar/
│   └── recommendation-tracker.yaml
└── scripts/                     # Automação
    ├── kaizen-trigger.sh
    └── validate-report.sh
```

---

## Ativação

```bash
# Via skill
/kaizen:chief

# Via comando direto
/kaizen:analyze
/kaizen:gaps
/kaizen:performance
```

## Cross-References

- **squad-creator**: Executa recomendações (cria novos squads/agentes/minds)
- **content-engine**: Principal squad monitorado (maior volume de atividade)
- **config**: `config/config.yaml` — configuração central com triggers, tiers, quality gates
