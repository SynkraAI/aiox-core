# Workflow: Daily Content Pipeline

**Workflow ID**: daily-content-pipeline
**Version**: 1.0.0
**Trigger**: `/daily-content` ou manual
**Cadence**: Diario (seg-sex)

---

## Overview

Pipeline end-to-end que transforma uma Big Idea em post publicado no Instagram + LinkedIn via API. Envolve 6 agentes em sequencia com 3 QA Gates bloqueantes.

---

## Flow Diagram

```
@marketing-ideation
       │
       ▼
  Big Idea + 3 angulos
       │
       ▼ (Jose escolhe ou auto-seleciona)
┌──────────────────────┐
│  GATE 2.5 — @cmo     │ ⛔ BLOQUEANTE
│  SVA + Purple Cow +  │
│  Permission filter    │
│  Score < 4/5 → volta │
│  Max 2 loops          │
└──────┬───────────────┘
       │ APROVADO
       ▼
@marketing-production
       │ Post na voz do Jose
       │ Checklist: hook, cena real, zero LLM blacklist
       ▼
@marketing-designer
       │ Decision Tree → formato visual
       │ Carousel / Imagem / Text-only
       │ Visual Brief + prompt Gemini
       ▼
@marketing-distribution
       │ Adapta IG (≤2200 chars, casual)
       │ Adapta LinkedIn (≤3000 chars, profissional)
       │ NUNCA copy-paste
       ▼
  Salvar output
  outputs/hubs/marketing/YYYY-MM-DD.md
       │
       ▼ (se visual)
  Nano Banana Pro → gerar imagem
  outputs/hubs/marketing/YYYY-MM-DD-cover.png
       │
       ▼
┌──────────────────────┐
│  GATE 6 — publish.py │ ⛔ AUTOMATICO
│  LinkedIn API        │
│  Instagram API       │
│  WhatsApp confirm    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  GATE 7 — Confirm    │ ⛔ BLOQUEANTE
│  Verificar posts     │
│  Registrar IDs       │
│  Se erro → retry     │
└──────────────────────┘
```

---

## Agents Envolvidos

| Ordem | Agent | Responsabilidade | Input | Output |
|-------|-------|-----------------|-------|--------|
| 1 | @marketing-ideation | Big Idea + 3 angulos | content-map.yaml | Big Idea + angulo |
| 2 | @marketing-cmo | Gate 2.5 (SVA + Purple Cow) | Big Idea | Aprovado/Vetado + score |
| 3 | @marketing-production | Escrever post na voz Jose | Big Idea aprovada | Post completo |
| 4 | @marketing-designer | Direcao visual + prompt | Post + angulo | Visual Brief |
| 5 | @marketing-distribution | Adaptar IG + LinkedIn | Post + Visual Brief | 2 versoes prontas |
| 6 | publish.py | Publicar via API | Versoes finais | Post IDs |

---

## QA Gates

| Gate | Dono | Criterio | Falha |
|------|------|----------|-------|
| 2.5 CMO | @marketing-cmo | Purple Cow ≥ 4/5 + SVA especifica + Permission OK | Volta para @ideation (max 2 loops) |
| 6 Publish | publish.py | APIs respondem 2xx | Registrar erro, retry ou fallback manual |
| 7 Confirm | Jose/Sistema | Posts visiveis nas plataformas | Registrar falha para @metrics |

---

## Data Dependencies

| Arquivo | Lido por | Escrito por |
|---------|----------|------------|
| `data/content-map.yaml` | @ideation | @metrics (semanal) |
| `data/platform-specs.yaml` | @distribution | — |
| `data/brand-guide.yaml` | @designer | — |
| `~/.config/aios/credentials.yaml` | publish.py | — |

---

## Modos de Execucao

| Modo | Comando | Comportamento |
|------|---------|---------------|
| Interativo | `/daily-content` | Apresenta 3 angulos, Jose escolhe |
| Automatico | `/daily-content auto=true` | Auto-seleciona angulo mais forte |
| Com contexto | `/daily-content contexto="..."` | Usa contexto como materia-prima |

---

## Metricas Coletadas

Cada execucao registra em `outputs/hubs/marketing/YYYY-MM-DD.md`:
- Purple Cow score (Gate 2.5)
- Formato visual escolhido
- LinkedIn share ID
- Instagram media ID
- Horario de publicacao

Esses dados alimentam `/metrics-weekly` para calculo dos 3 KPIs.

---

*Workflow v1.0.0 — Extraido de tasks/daily-content.md v3.0.0*
