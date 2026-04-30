# BACKTEST-1 Phase 1 — Ingest Report

**Gerado em:** 2026-04-29T05:05:18.097Z
**Janela:** 2025-05-01 -> 2026-04-28 (12 meses)
**Universo:** Polymarket + Kalshi, verticais politics/sports/finance/weather, resolucao <=7d

**Total de markets ingeridos:** 68198

## 1. Markets por source x vertical

| Source | Vertical | N |
|---|---|---|
| polymarket | finance | 48899 |
| polymarket | politics | 964 |
| polymarket | sports | 3203 |
| polymarket | weather | 15132 |

## 2. Survivorship breakdown (resolution_status)

| Source | Vertical | Status | N |
|---|---|---|---|
| polymarket | finance | pending | 7 |
| polymarket | finance | resolved | 48892 |
| polymarket | politics | pending | 5 |
| polymarket | politics | resolved | 959 |
| polymarket | sports | pending | 17 |
| polymarket | sports | resolved | 3186 |
| polymarket | weather | resolved | 15132 |

## 3. Brier-gate readiness por vertical

Critério "usable" = resolution_status=resolved AND mid_price_t12h IS NOT NULL AND resolved_outcome IS NOT NULL.

| Vertical | All | Resolved | Usable (Brier) | Threshold | Pass? | Flag |
|---|---|---|---|---|---|---|
| politics | 964 | 959 | 346 | 100 | PASS | - |
| sports | 3203 | 3186 | 925 | 100 | PASS | - |
| finance | 48899 | 48892 | 687 | 50 | PASS | - |
| weather | 15132 | 15132 | 3802 | 100 | PASS | - |

## 4. NOAA climatology coverage

| Metric | Value |
|---|---|
| Stations ingested | 30 |
| (station, doy, metric) rows | 54900 |

## 5. Red flags

- Nenhum vertical abaixo do threshold. Phase 2 GO.
- **Baseline coverage politics**: 36.1% dos resolved tem mid_price_t12h. Investigar perda em ingest-polymarket-clob-prices.
- **Baseline coverage sports**: 29.0% dos resolved tem mid_price_t12h. Investigar perda em ingest-polymarket-clob-prices.
- **Baseline coverage finance**: 1.4% dos resolved tem mid_price_t12h. Investigar perda em ingest-polymarket-clob-prices.
- **Baseline coverage weather**: 25.1% dos resolved tem mid_price_t12h. Investigar perda em ingest-polymarket-clob-prices.

## 6. Proximos passos (Phase 2)

- Implementar `compute_brier_per_vertical` (forecasts vs outcomes vs mid_price_t12h)
- Bootstrap 95% CI + shuffle test
- Calibration plot 10 buckets
- Profit-factor sim com fees stress-test (PM 2% taker, KA 1% flat)
- Go/No-Go report final
