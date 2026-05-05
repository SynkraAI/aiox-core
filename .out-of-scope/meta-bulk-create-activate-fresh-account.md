# Meta API — bulk create + activate em ad account fresh

**Status:** REJECTED (anti-pattern)
**Decided:** 2026-04-30
**Decided by:** Empirical (Meta API blocked code 200)
**Project:** low-ticket-10k (Vorza) — extensível a qualquer ad account fresh

## What was proposed
Criar campanha + adsets + múltiplos ads em ad account fresh (sem histórico) e ativar TODOS via API, em paralelo, na mesma sessão.

## Why it was rejected
**Meta API retornou "access blocked code 200"** — anti-spam trigger.

Mecanismo provável:
- Ad accounts novas têm threshold baixo de "atividade suspeita"
- Bulk-create + bulk-activate em < 1min lookalike a botnet
- Threshold mais permissivo: contas Bretda OK, conta Vorza fresh BLOQUEADA mesma sessão

**Custo:** sessão 30/Abr toda perdida na frente de despausa, exigiu user resolver token + restart Claude Code.

## Trigger to revisit (NÃO revisitar — virar regra)
**Regra permanente:** em ad account fresh:
1. Criar tudo PAUSED em batch (OK)
2. Ativar SEQUENCIALMENTE (não paralelo) com >5s gap entre cada
3. Idealmente: ativar 1 adset, esperar 5min, ativar próximo
4. Se possível, ativar manualmente via UI uma vez antes de usar API

Bulk-activate só é seguro em accounts com 30+ dias de histórico de atividade.

## Related
- Memory keys: `session_low_ticket_30abr_lp_redesign.md`, `reminder_low_ticket_live_24abr.md`
- Aplicável a: qualquer projeto novo (Bretda Brand New, Tocks segregada, future)
