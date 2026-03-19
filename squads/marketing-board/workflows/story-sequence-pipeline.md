# Workflow: Story Sequence Pipeline

**Workflow ID**: story-sequence-pipeline
**Version**: 1.0.0
**Trigger**: `/weekly-story-sequence` ou manual
**Cadence**: Semanal (domingo — planeja semana inteira)
**Methodology**: Holistic Story Sequence Strategy (Nicolas Clay)
**Reference**: `outputs/research/biblioteca-maas/holistic-story-sequence-nicolas-clay.md`

---

## Overview

Pipeline semanal que gera 7 sequencias de Instagram Stories, cada dia com um framework psicologico diferente (Nicolas Clay). Usa 4 agentes em sequencia com 2 QA Gates. Output: 7 scripts completos + composicao de camadas + preview WhatsApp para aprovacao.

**Diferenca do daily-content-pipeline:** Este workflow e exclusivo para Instagram Stories (formato vertical, 5 stories/dia). O daily-content-pipeline e para posts de feed (carousel, imagem, texto). Sao complementares e rodam em paralelo.

---

## Conceito Central: Ativacao Neurológica Cumulativa

```
SEG          TER          QUA          QUI          SEX          SAB          DOM
PAIN    →    YOUR PROOF → CLIENT PROOF→ BREAK OBJ → EDUCATION → DIFFERENTI→ CONNECTION
[14%]        [28%]        [42%]        [57%]        [71%]        [85%]        [100%]
Light        Heavy        Heavy        Heavy        Light        Light        Light
```

Cada dia ativa uma area cerebral diferente. Ao final do ciclo, o prospecto tem cerebro 100% ativado para a oferta.

---

## Os 7 Frameworks Diarios

| Dia | Sequencia | 5 Blocos | Tom | Objetivo |
|-----|-----------|----------|-----|----------|
| **Seg** | PAIN | Pain Hook → Agitate → Proof → Desire → Break Objection | Light | Consciencia do problema |
| **Ter** | YOUR PROOF | Personal Win → Pain → Agitate → Proof → Relatability | Heavy | Autoridade pessoal |
| **Qua** | CLIENT PROOF | Client Win → Relatability → Pain → Agitate → Proof | Heavy | Validacao social |
| **Qui** | BREAK OBJECTION | Curiosity → Break Obj → Storytelling → Shift Mind → CTA | Heavy | Eliminar barreiras |
| **Sex** | EDUCATION | Pain Hook → Educate → Proof → Desire → Desire CTA | Light | Reciprocidade |
| **Sab** | DIFFERENTIATION | Storytelling → Different → Proof → Desire → Break Obj | Light | Posicionamento unico |
| **Dom** | CONNECTION | Authentic Hook → Storytelling → Storytelling → Proof → CTA | Light | Vinculo emocional |

---

## As 4 Camadas de Cada Story

Cada story individual e composto por:

| Camada | Nome | Funcao | Obrigatorio |
|--------|------|--------|-------------|
| L1 | **Texto (Script)** | Copy que guia retenção story-a-story | Sim |
| L2 | **Imagem (Background)** | Contexto subconsciente (lifestyle, prova) | Sim |
| L3 | **Prova (Screenshots)** | Prints de resultados sobrepostos | Quando aplicavel |
| L4 | **Visuais (Assets)** | Graficos, setas, diagramas | Opcional |

**Regra:** Nunca fundo vazio. Nunca promessa sem prova.

---

## Flow Diagram

```
DOMINGO — PLANEJAMENTO SEMANAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@marketing-cmo
       │
       ▼
  Definir foco da semana
  (lancamento? perpétuo? aquecimento?)
  Selecionar objecoes prioritarias
       │
       ▼
@marketing-ideation-ig
       │
       ▼
  Gerar 7 sequencias completas
  ┌────────────────────────────────────┐
  │ Para cada dia (seg-dom):           │
  │ 1. Aplicar framework do dia        │
  │ 2. Selecionar hook do banco        │
  │ 3. Mapear provas disponiveis       │
  │ 4. Definir historia (se aplicavel) │
  │ 5. Sugerir composicao de camadas   │
  └────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  GATE 1 — @cmo               │ ⛔ BLOQUEANTE
│  Para cada dia:               │
│  - Framework correto? (5/5)   │
│  - SVA servida?               │
│  - Ritmo Heavy/Light correto? │
│  - Proof disponivel?          │
│  Score < 4/5 → @ideation-ig  │
│  retrabalha (max 2 loops)     │
└──────────┬───────────────────┘
           │ APROVADO (7 dias)
           ▼
@marketing-production
           │
           ▼
  Escrever scripts dos 7 dias
  ┌────────────────────────────────────┐
  │ Para cada dia:                     │
  │ 1. Escrever 5 blocos de copy       │
  │ 2. Voz do Jose (casual, real)      │
  │ 3. Hook forte no bloco 1           │
  │ 4. Transicao fluida entre blocos   │
  │ 5. CTA natural (nao salesy)        │
  │                                    │
  │ REGRAS:                            │
  │ - Dias Heavy: copy afiada          │
  │ - Dias Light: casual, humano       │
  │ - Zero LLM blacklist words         │
  └────────────────────────────────────┘
           │
           ▼
@marketing-designer
           │
           ▼
  Compor 4 camadas para cada story
  ┌────────────────────────────────────┐
  │ Para cada dia (5 stories):         │
  │ 1. Selecionar imagem de fundo (L2) │
  │    do album "Story Sequences"      │
  │ 2. Overlay de screenshot (L3)      │
  │    do proof-bank                   │
  │ 3. Elementos visuais (L4)          │
  │    graficos, setas, diagrams       │
  │ 4. Brief visual completo           │
  └────────────────────────────────────┘
           │
           ▼
  Compilar output semanal
  outputs/hubs/marketing/YYYY-WNN-story-sequence/
           │
           ▼
┌──────────────────────────────┐
│  GATE 2 — Preview WhatsApp   │ ⛔ BLOQUEANTE
│                              │
│  Enviar resumo da semana:    │
│  - 7 hooks (1 por dia)       │
│  - Ritmo visual (H/L)        │
│  - Provas selecionadas       │
│                              │
│  Jose responde:              │
│  ✅ GO → salvar como final   │
│  ✏️ AJUSTAR → nota + retry   │
│  ❌ SKIP → cancelar semana   │
└──────────┬───────────────────┘
           │ GO
           ▼
  Semana aprovada!
  Scripts prontos para uso diario
  Jose posta manualmente no IG Stories
```

---

## Agents Envolvidos

| Ordem | Agent | Responsabilidade | Input | Output |
|-------|-------|-----------------|-------|--------|
| 1 | @marketing-cmo | Foco semanal + validacao Gate 1 | Estrategia + objecoes | Foco definido + aprovacao |
| 2 | @marketing-ideation-ig | Gerar 7 frameworks diarios | Foco + story-sequence-bank | 7 sequencias (conceito) |
| 3 | @marketing-production | Escrever scripts de copy | Sequencias aprovadas | 35 blocos de copy (7×5) |
| 4 | @marketing-designer | Compor camadas visuais | Scripts + proof-bank | 35 briefs visuais (7×5) |

---

## QA Gates

| Gate | Dono | Criterio | Falha |
|------|------|----------|-------|
| 1 CMO Validation | @marketing-cmo | Framework correto + SVA + ritmo H/L + proof exists | Volta para @ideation-ig (max 2 loops) |
| 2 Preview WhatsApp | Jose | Jose aprova preview da semana | Ajustar e reenviar ou cancelar |

---

## Data Dependencies

| Arquivo | Lido por | Escrito por |
|---------|----------|------------|
| `data/story-sequence-bank.yaml` | @ideation-ig, @production, @designer | Manual (Jose popula) |
| `data/content-map.yaml` | @ideation-ig (contexto) | — |
| `data/brand-guide.yaml` | @designer | — |
| `data/platform-specs.yaml` | @production (limites IG Stories) | — |
| `outputs/research/biblioteca-maas/holistic-story-sequence-nicolas-clay.md` | @ideation-ig (referencia) | — |

---

## Modos de Execucao

| Modo | Comando | Comportamento |
|------|---------|---------------|
| Semanal completo | `/weekly-story-sequence` | Gera 7 dias de uma vez |
| Com foco | `/weekly-story-sequence foco="lancamento cohort"` | Semana orientada a lancamento |
| Regerar dia | `/weekly-story-sequence dia="quinta"` | Regera apenas 1 dia |

---

## Output

| Output | Path | Frequencia |
|--------|------|------------|
| Plano semanal | `outputs/hubs/marketing/YYYY-WNN-story-sequence/plano.md` | 1x/semana |
| Scripts diarios (7) | `outputs/hubs/marketing/YYYY-WNN-story-sequence/seg.md` ... `dom.md` | 1x/semana |
| Preview WhatsApp | Via UazAPI | 1x/semana |

---

## Integracao com Weekly Marketing Cycle

```
DOMINGO — PLANEJAMENTO
━━━━━━━━━━━━━━━━━━━━━━

/weekly-content-plan          ← Feed (carousels, posts)
       +
/weekly-story-sequence        ← Stories (este workflow)
       │
       ▼
  Semana planejada:
  - 5 posts de feed (seg-sex)
  - 7 sequencias de stories (seg-dom)
  - Ambos se complementam e nao se repetem
```

---

## Metricas Especificas (Story Sequence)

| Metrica | Definicao | Meta |
|---------|-----------|------|
| Story View Rate | % seguidores que veem stories | ≥ 15% |
| Story Completion Rate | % que ve do 1o ao 5o story | ≥ 60% |
| Reply Rate | % que responde/reage | ≥ 2% |
| Link Tap Rate | % que toca no CTA | ≥ 3% |
| Weekly Fatigue | Queda de views seg→dom | < 10% |

Essas metricas sao coletadas pelo `/metrics-weekly` como extensao dos KPIs existentes.

---

*Workflow v1.0.0 — Holistic Story Sequence Strategy (Nicolas Clay) integrado ao Marketing OPES*
