# Tocks — Pivot OUTCOME_CONVERSIONS site

**Status:** REJECTED
**Decided:** 2026-04-30
**Decided by:** Conclave 5/5 mind clones (Hormozi, Brunson, Laja, Kim, Mandalia)
**Project:** tocks

## What was proposed
Pivotar campanhas Meta de Tocks de objective atual (lead/conversation) para `OUTCOME_CONVERSIONS` direto no site, otimizando para purchase/conversion-event no e-commerce Tray ao invés de WhatsApp.

## Why it was rejected
Conclave 5/5 unanimemente REJEITOU em 30/Abr ~22h. Razões consolidadas:

1. **Funnel não suporta** — Tocks tem ticket alto (R$15k-20k+ luxo), conversão direta no site é fricção máxima sem warm-up
2. **CAPI inexistente no momento da decisão** — sem signal back para algoritmo, OUTCOME_CONVERSIONS afoga sem aprender
3. **WhatsApp é qualificador essencial** para móveis sob encomenda (não é compra impulso)
4. **Reset learning total** — perderia ~21d de learning Smart Bidding atual
5. **Verdict alternativo: Opção D++** — CAPI server-side via Sales AI CRM + LAL 1% reconstruído (caminho que está sendo executado agora)

## Trigger to revisit
Reavaliar SE:
- D++ CAPI estiver LIVE há 60+ dias com hit-rate >70%
- AND ticket médio cair pra <R$5k (mudança de produto)
- AND user explicitamente pedir
- AND volume mensal >100 conv/mês no Sales AI

Caso contrário: **NÃO PROPOR**.

## Related
- Memory keys: `project_tocks_pivot_decision_30abr.md`, `session_tocks_d_plus_plus_04_05mai.md`
- Cross-rejections: `./tocks-shopping-google-ads.md`
- Active path: D++ Sales AI Railway (em andamento, SLA 07/Mai)
