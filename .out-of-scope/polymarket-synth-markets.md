# Polymarket — synth markets (capital travado long-horizon)

**Status:** DEPRECATED (deletado do código)
**Decided:** 2026-04-27 (PM-PIVOT-1)
**Decided by:** User
**Project:** polymarket-trader

## What was proposed
Bot operar em "synth markets" — mercados sintéticos / long-horizon onde capital fica travado por períodos longos (>30d) esperando resolução.

## Why it was rejected
**Regra do user: "capital travado = morto"**.

Custo:
- Liquidez impedida → não posso reagir a novos signals
- Edge teórico vira edge real só na resolução → tempo de capital × oportunidade perdida = ROI negativo vs short-horizon
- Conclave 8 agentes (5 análise + 3 mind clones) confirmou pivot

**Pivot executado em 27/Abr:**
- @dev deletou synth (-200 LOC)
- Criou `MarketSelector` puro
- NSSM + watchdog + budget cap implementados
- Story PM-PIVOT-1 → Ready for QA

**Nova regra hardcoded:** só mercados reais ≤7d horizon.

## Trigger to revisit
Reavaliar SE:
- User explicitamente reabrir tese long-horizon
- AND tiver capital sobrando >>2x do usado em short-horizon
- AND backtest synth-only der PF >1.5 sustentado

Caso contrário: **não reintroduzir synth markets**.

## Related
- Memory keys: `session_polymarket_pivot_27abr.md`
- Story: PM-PIVOT-1 (Ready for QA)
- Cross-rejections: `./polymarket-non-weather-verticals.md`
