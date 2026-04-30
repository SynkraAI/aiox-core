# Recovery Fase 4 — Despause Coordenado

**Projeto:** Low Ticket 10k — Vorza/Metodo3C
**Data:** 27/Abr/2026
**Owner da execução:** Orion (via MCP, somente após user OK explícito)
**Tempo de execução:** ~30 segundos
**Pré-requisitos:** Fases 1, 2, 3 todas concluídas + user enviou "Fase 3 OK — pode executar Fase 4"

---

## ⚠️ NÃO EXECUTAR sem autorização explícita

Este documento contém os comandos prontos para despausar os 4 ads. A execução SOMENTE acontece após o user enviar a mensagem **"pode executar Fase 4"** ou similar inequívoco. Mediação via Orion (`@aios-master`).

---

## Estado pré-despause (esperado)

| Objeto | ID | Estado esperado |
|--------|-----|-----------------|
| Campanha `[ABO] M3C — TOPO Frio v1` | `120242728863470621` | ACTIVE |
| Adset C1 (INT Advocacia) | `120242729974200621` | ACTIVE + Pixel + Purchase configured |
| Adset C3 (BROAD Superior) | `120242729976720621` | ACTIVE + Pixel + Purchase configured |
| Ad C1-A "Cronômetro" | `120244099410470621` | **PAUSED → ACTIVE** |
| Ad C1-B "Autoridade OAB" | `120244099412870621` | **PAUSED → ACTIVE** |
| Ad C3-A "Matemática Cruel" | `120244099414140621` | **PAUSED → ACTIVE** |
| Ad C3-B "Pergunta Provocativa" | `120244099414750621` | **PAUSED → ACTIVE** |

---

## Comandos MCP (executar em paralelo)

```
Tool: mcp__mcp-ads-bridge__meta_ads_update_status
Account: vorza
Calls em PARALELO (mesmo turn):

1. { "object_id": "120244099410470621", "status": "ACTIVE", "account": "vorza" }
2. { "object_id": "120244099412870621", "status": "ACTIVE", "account": "vorza" }
3. { "object_id": "120244099414140621", "status": "ACTIVE", "account": "vorza" }
4. { "object_id": "120244099414750621", "status": "ACTIVE", "account": "vorza" }
```

**Por que em paralelo:** todos 4 são updates idempotentes e independentes, sem ordem necessária. Paralelo reduz risco de janela onde só parte ativa (ex: Meta começa a entregar C1 com C3 ainda PAUSED → desbalanceia learning de C3).

---

## Validação pós-despause (executar imediatamente após)

```
Tool: mcp__mcp-ads-bridge__meta_ads_ads
Account: vorza
Filtro: ad_ids = [120244099410470621, 120244099412870621, 120244099414140621, 120244099414750621]
Esperado: cada um com effective_status = ACTIVE (não DISAPPROVED, não PAUSED, não CAMPAIGN_PAUSED)
```

Se algum ad voltar `DISAPPROVED` (rejeitado por policy) — investigar via review reasons na resposta. Provavelmente claim no copy precisa de ajuste.

Se algum voltar `CAMPAIGN_PAUSED` ou `ADSET_PAUSED` — pai (campanha ou adset) está paused. Ativar pai primeiro.

---

## Logging via ads_action_log

```
Tool: mcp__mcp-ads-bridge__ads_action_log
Args:
{
  "platform": "meta_ads",
  "account": "vorza",
  "object_type": "ad",
  "object_ids": ["120244099410470621","120244099412870621","120244099414140621","120244099414750621"],
  "action": "DESPAUSE_RECOVERY",
  "reason": "Pixel attached to ad account + CAPI Kiwify configured + domain verified — restoring planned launch from 24/Abr",
  "performed_by": "traffic-masters-chief",
  "timestamp": "<auto>"
}
```

(Se a tool tiver assinatura ligeiramente diferente, ajustar — o intuito é registrar que o despause foi intencional pós-recovery, não um erro.)

---

## Snapshot inicial (registrar nas memórias)

Logo após despause, capturar via `mcp__mcp-ads-bridge__meta_ads_insights`:

```
Tool: mcp__mcp-ads-bridge__meta_ads_insights
Account: vorza
date_preset: today
level: ad
ad_ids: [4 IDs acima]
```

Registrar no `reminder_low_ticket_live_24abr.md`:
- Timestamp do despause real (formato `27/Abr/2026 HH:MM BRT`)
- Spend até o momento (esperado próximo de R$0)
- Impressões (esperado 0 — Meta começa entregar em ~30min)

---

## Próximos checkpoints (relógio reseta a partir do despause REAL)

A partir do timestamp T0 (momento real do despause):

- **T0 + 1h:** primeira janela checagem entrega. Esperado: 100-500 impressões, 0-3 cliques, R$5-15 gasto.
  - Se ZERO impressões em 1h → algo errado: Meta não está entregando. Investigar `delivery_insights` via Ads Manager.

- **T0 + 24h:** primeira janela CTR/CPC. Não pausar nada (learning phase).
  - Esperado: 5-15k impressões, CTR 1-3%, CPC R$2-6.

- **T0 + 72h (D+3):** primeira janela kill rule.
  - Aplicar: R$100 gasto sem 1 Purchase → pause ad.
  - Aplicar: CPA > R$24 → pause ad.

- **T0 + 120h (D+5):** ajuste fino.
  - Avaliar se C1 vence C3 (provável — C1 tem targeting tight) ou vice-versa.
  - Se 1 dos 4 ads queimou kill rule, pausar e deixar os 3 restantes.

- **Após 50 Purchases acumulados** (provável D+10 a D+15 dependendo de CR):
  - Ativar C2 (`120243622860290621`) e C4 (`120243622876870621`).
  - Considerar advantage_audience=1 (Pixel já tem seed).

---

## Rollback (se algo der errado nas primeiras 24h)

Se descobrir post-despause que CAPI não está enviando Purchase real (descoberto via Test Events vs Production Events Manager mostrando zero), pausar ALL ads imediatamente:

```
mcp__mcp-ads-bridge__meta_ads_update_status x4 com status=PAUSED nos mesmos 4 IDs
```

Custo de rollback: ~R$5-15 (gasto da janela de descoberta). Aceitável vs queimar 7 dias.

---

## Referências cruzadas

- **Diagnóstico Pixel:** `RECOVERY-RUNBOOK-FASE1-PIXEL-ATTACH.md`
- **Setup CAPI:** `RECOVERY-RUNBOOK-FASE2-CAPI-KIWIFY.md`
- **Pré-despause check:** `RECOVERY-CHECKLIST-FASE3-PRE-DESPAUSE.md`
- **Plano original (kill rules + budget):** `META-ADS-CAMPAIGN-PLAN.md`
- **Memory do estado LIVE 24/Abr:** `reminder_low_ticket_live_24abr.md`
