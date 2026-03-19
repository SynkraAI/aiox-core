# QA Checkpoint Checklist — Insight Squad

**Version:** 1.0
**Used by:** @insight-chief
**Purpose:** Quality gates for all agent outputs before delivery

---

## IN-QA-001 — Dossier (Digital Profiler Output)

| # | Check | Blocking | Status |
|---|-------|----------|--------|
| D1 | Score 0-100 é coerente com os dados? | ✅ Yes | [ ] |
| D2 | Breakdown de score por canal presente? | ✅ Yes | [ ] |
| D3 | Todos os canais obrigatórios analisados (site, Maps, social, reputação)? | ✅ Yes | [ ] |
| D4 | Portais de nicho analisados (se niche_config tem portais)? | ❌ No | [ ] |
| D5 | Comparativo top 3 concorrentes presente? | ✅ Yes | [ ] |
| D6 | Gaps priorizados por impacto (não por facilidade)? | ❌ No | [ ] |
| D7 | Dados verificáveis (links, screenshots, datas)? | ✅ Yes | [ ] |
| D8 | NAP consistency verificada? | ❌ No | [ ] |
| D9 | Quick wins identificados (alto impacto + baixo esforço)? | ❌ No | [ ] |

**Veto Conditions (auto-reject):**
- Score sem justificativa → REJECT
- Canal obrigatório ignorado → REJECT
- Dados inventados (sem fonte verificável) → REJECT
- Sem comparativo de concorrentes → REJECT

---

## IN-QA-002 — Map (Market Scout Output)

| # | Check | Blocking | Status |
|---|-------|----------|--------|
| M1 | Keywords relevantes para o nicho e cidade? | ✅ Yes | [ ] |
| M2 | Business Potential Score (0-3) aplicado em todas? | ✅ Yes | [ ] |
| M3 | Big 5 classification aplicada (Sheridan)? | ❌ No | [ ] |
| M4 | 80/20 destacado (keywords de ouro)? | ❌ No | [ ] |
| M5 | Sazonalidade cruzada com calendário BR? | ❌ No | [ ] |
| M6 | Priorização por ROI (ICE), não por volume? | ✅ Yes | [ ] |
| M7 | Contexto brasileiro aplicado (WhatsApp, PIX, datas BR)? | ✅ Yes | [ ] |
| M8 | Awareness level classificado (Schwartz)? | ❌ No | [ ] |
| M9 | Output em formato tabela estruturada? | ❌ No | [ ] |

**Veto Conditions (auto-reject):**
- Keywords genéricas sem relação com nicho → REJECT
- Sem priorização (ICE ou equivalente) → REJECT
- Ignorou contexto brasileiro → REJECT
- Priorizou por volume sem considerar ROI → REJECT

---

## IN-QA-003 — Report (Data Storyteller Output)

| # | Check | Blocking | Status |
|---|-------|----------|--------|
| R1 | Headline de impacto presente (ABT em 1 frase)? | ✅ Yes | [ ] |
| R2 | Insights estruturados como ABT (And-But-Therefore)? | ✅ Yes | [ ] |
| R3 | Narrativa clara para não-técnico? | ✅ Yes | [ ] |
| R4 | Sem jargão técnico sem explicação? | ✅ Yes | [ ] |
| R5 | CTA definido no final? | ✅ Yes | [ ] |
| R6 | Tríade equilibrada (dados + narrativa + visuais)? | ❌ No | [ ] |
| R7 | Data-Ink Ratio aplicado (zero chartjunk)? | ❌ No | [ ] |
| R8 | SUCCESs test nos insights principais? | ❌ No | [ ] |
| R9 | Dados apresentados honestamente (Cairo 5 Qualities)? | ❌ No | [ ] |

**Veto Conditions (auto-reject):**
- Lista de números sem narrativa → REJECT
- Jargão técnico sem explicação → REJECT
- Sem CTA → REJECT
- Distorção de dados detectada (eixo manipulado, cherry-picking) → REJECT
- Report sem headline → REJECT

---

## Confidence Score Calculation

```
Base:     All blocking checks pass = +50
Bonus:    Each non-blocking pass = +7 (max ~35)
Quality:  Data freshness (0-10) + Source quality (0-10)
───────────────────────────────────────────────
Max:      100
Threshold: >= 70 for auto-approve (Level 2+)
           >= 85 for high confidence
           < 50 = escalate to operator
```

---

## Autonomy Decision Matrix

| Confidence | Level 1 | Level 2 | Level 3 |
|-----------|---------|---------|---------|
| >= 85 | Operator approves | Auto-approve | Auto-approve |
| 70-84 | Operator approves | Auto-approve (flag) | Auto-approve |
| 50-69 | Operator approves | Escalate | Auto-approve (flag) |
| < 50 | Operator approves | Escalate | Escalate |
