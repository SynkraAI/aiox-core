# Polymarket — verticals não-weather (politics/sports/finance)

**Status:** REJECTED
**Decided:** 2026-04-29 (Backtest BACKTEST-1 Phase 1+2)
**Decided by:** Backtest empírico 12 meses
**Project:** polymarket-trader

## What was proposed
Bot Polymarket operar em múltiplos verticals (politics, sports, finance, weather) ao invés de single-vertical.

## Why it was rejected
Backtest 12 meses (68k markets, 7647 Brier-elegíveis) — **único vertical com PF > 1.0 foi `weather`**.

| Vertical | Verdict | PF |
|----------|---------|----|
| weather | ✅ PASS | 1.388 (Phase 1) → 1.415 (Phase 2 weather-only) |
| politics | ❌ Empata mid-price | ~1.0 |
| sports | ❌ Empata mid-price | ~1.0 |
| finance | ❌ Empata mid-price | ~1.0 |
| crypto | ❓ Pendente (re-ingest+replay autônomo orion autorizado) | TBD |

"Empata mid-price" = comprar pelo preço médio (estratégia trivial sem inteligência) dá mesmo resultado. Sem edge = sem alpha.

**Patches 04/Mai forçam weather-only:**
- `PM_CATEGORIES=weather`
- `enabledVerticals=['weather']`

## Trigger to revisit
Reavaliar SE:
- Crypto re-ingest+replay (autônomo) der PF >1.2 sustentado em 30d backtest novo
- AND Tier 2 LLM re-scoring desbloquear (squad org limit)
- AND nova fonte de signal específica do vertical for adicionada (ex: API esportiva real-time pra sports)

Caso contrário: **não habilitar não-weather verticals**.

## Related
- Backtest scoping: `docs/projects/polymarket-trader/BACKTEST-1-scoping.md`
- Backtest runbook: `docs/projects/polymarket-trader/BACKTEST-MORNING-RUNBOOK.md`
- Memory keys: `session_polymarket_backtest_28abr_29abr.md`
- Cross-rejections: `./polymarket-synth-markets.md`
