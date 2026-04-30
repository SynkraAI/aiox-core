# BACKTEST-1 Phase 2 Tier 1 — Replay Heurístico (Sem LLM)

**Gerado em:** 2026-04-30T16:02:53.466Z
**Story:** BACKTEST-2-tier1-heuristic
**Predecessor:** BACKTEST-1 Phase 1 (ingest, 7.647 markets eligíveis)
**Custo desta fase:** $0,00 (heurística pura, zero LLM)

## 1. Resumo Executivo

- **N total replay:** 7809
- **Brier global:** 0.1695 vs baseline 0.1701 (Δ=+0.0005)
- **Bootstrap 95% CI (Δ):** [0.0003, 0.0007]
- **Shuffle p-value:** 0.0000
- **Verticais PASS:** weather

### Recomendação
- **GO Tier 2 (LLM ~$1.50)** — pelo menos um vertical PASS detecta edge estatisticamente significativo. Vale o investimento de Tier 2 para ver se LLM amplifica o sinal.

## 2. Brier por vertical — Population completa

Forecasts do bot heurístico para TODOS markets resolvidos (mesmo onde shouldTrade=false → forecast = mid_price_t12h, replay neutro). Compara contra mid_price_t12h baseline.

| Vertical | N | Signal Brier | Baseline Brier | Δ | 95% CI (Δ) | Shuffle p | Verdict |
|---|---|---|---|---|---|---|---|
| politics | 346 | 0.1134 | 0.1139 | +0.0005 | [-0.0006, 0.0016] | 0.0000 | **FAIL** |
| sports | 929 | 0.1700 | 0.1705 | +0.0005 | [-0.0002, 0.0012] | 0.0000 | **FAIL** |
| finance | 687 | 0.2301 | 0.2303 | +0.0002 | [-0.0002, 0.0006] | 0.0000 | **FAIL** |
| weather | 3838 | 0.1338 | 0.1347 | +0.0009 | [0.0005, 0.0012] | 0.0000 | **PASS** |
| crypto | 2009 | 0.2265 | 0.2265 | +0.0000 | [-0.0001, 0.0001] | 0.0000 | **FAIL** |
| GLOBAL | 7809 | 0.1695 | 0.1701 | +0.0005 | [0.0003, 0.0007] | 0.0000 | **PASS** |

### Veredito por vertical
- **politics** (N=346): FAIL — signal slightly better (0.1134 vs 0.1139) but CI lower -0.0006 <= 0 (not significant)
- **sports** (N=929): FAIL — signal slightly better (0.1700 vs 0.1705) but CI lower -0.0002 <= 0 (not significant)
- **finance** (N=687): FAIL — signal slightly better (0.2301 vs 0.2303) but CI lower -0.0002 <= 0 (not significant)
- **weather** (N=3838): PASS — Brier 0.1338 < baseline 0.1347, CI lower 0.0005 > 0
- **crypto** (N=2009): FAIL — signal slightly better (0.2265 vs 0.2265) but CI lower -0.0001 <= 0 (not significant)

## 3. Brier por vertical — Subset shouldTrade=true

Apenas markets onde a heurística EMITIU signal (rawEdge >= MIN_EDGE = 0.02). Esse é o verdadeiro teste de "skill quando o bot age".

| Vertical | N (traded) | Signal Brier | Baseline Brier | Δ | 95% CI (Δ) | Shuffle p | Verdict |
|---|---|---|---|---|---|---|---|
| politics | 100 | 0.2428 | 0.2445 | +0.0017 | [-0.0025, 0.0057] | 0.0680 | **FAIL** |
| sports | 283 | 0.2434 | 0.2450 | +0.0016 | [-0.0007, 0.0037] | 0.0030 | **FAIL** |
| finance | 61 | 0.2332 | 0.2355 | +0.0023 | [-0.0022, 0.0073] | 0.0280 | **FAIL** |
| weather | 1224 | 0.2383 | 0.2412 | +0.0028 | [0.0018, 0.0039] | 0.0000 | **PASS** |
| crypto | 36 | 0.2302 | 0.2315 | +0.0013 | [-0.0052, 0.0075] | 0.0560 | **INSUFFICIENT_N** |
| GLOBAL | 1704 | 0.2391 | 0.2416 | +0.0025 | [0.0015, 0.0034] | 0.0000 | **PASS** |

## 4. Calibration buckets (10 bins) — GLOBAL

Gate Chip Huyen: |predictedMean - observedFreq| <= 0.05 em todos os buckets com N>=10.

| Bucket | N | Predicted Mean | Observed Freq | Abs Gap | Within 5pp? |
|---|---|---|---|---|---|
| 0-10% | 2245 | 0.0265 | 0.0428 | 0.0163 | YES |
| 10-20% | 800 | 0.1457 | 0.1963 | 0.0506 | NO |
| 20-30% | 635 | 0.2587 | 0.3370 | 0.0784 | NO |
| 30-40% | 622 | 0.3417 | 0.3778 | 0.0361 | YES |
| 40-50% | 488 | 0.4553 | 0.4836 | 0.0283 | YES |
| 50-60% | 2603 | 0.5069 | 0.5044 | 0.0025 | YES |
| 60-70% | 87 | 0.6439 | 0.4943 | 0.1497 | NO |
| 70-80% | 44 | 0.7317 | 0.6136 | 0.1181 | NO |
| 80-90% | 45 | 0.8475 | 0.8222 | 0.0253 | YES |
| 90-100% | 240 | 0.9834 | 0.9875 | 0.0041 | YES |

**Calibration fails (N>=10):** 4 bucket(s). Largest gap: 0.1497

## 5. Profit factor — Stress-test fees (PM 2% taker, Kelly fração 5%, bankroll $1000, cap $25, min bet $1)

| Vertical | Trades | Wins | Hit Rate | Profit Gross | Loss Gross | Fees | PnL | PF |
|---|---|---|---|---|---|---|---|---|
| politics | 93 | 36 | 38.7% | $111.90 | $86.98 | $2.82 | $22.10 | 1.246 |
| sports | 276 | 115 | 41.7% | $320.77 | $255.72 | $8.81 | $56.24 | 1.213 |
| finance | 59 | 26 | 44.1% | $70.71 | $51.43 | $1.88 | $17.40 | 1.326 |
| weather | 1023 | 399 | 39.0% | $1327.04 | $907.86 | $29.80 | $389.38 | 1.415 |
| crypto | 35 | 14 | 40.0% | $39.62 | $32.27 | $1.09 | $6.26 | 1.188 |
| GLOBAL | 1486 | 590 | 39.7% | $1870.04 | $1334.26 | $44.40 | $491.38 | 1.356 |

Gate G3: PF >= 1.15 com fees realistas. Estes números usam fees de stress-test (PM 2% taker), conservadores. Fees reais (PM ~0.10%) renderiam PFs maiores.

## 6. Caveats e limitações

- **Baseline T-12h, não T-1h:** Limitação CLOB API (issue #216). Decisão #5 do scoping aceitou. Menos duro que T-1h, mas também menos otimista pra nós.
- **Signal 1 (price-mismatch) sempre = 0 no replay:** Por construção, noPrice = 1 - midPriceT12h, então priceSum sempre = 1.0. Em runtime, yes/no podem divergir → signal 1 ativo. Limitação inerente do replay com schema atual.
- **Sem ExperienceStore:** Heurística runtime usa boost/penalty baseado em similar past trades. No replay isso é zero — número de trades histórico in-replay é insuficiente para reconstruir.
- **KnowledgeStore hardcoded:** Biases ('favorite-longshot', 'anchoring') hardcoded por vertical (faithful default — todos quatro verticals exibem esses no KB padrão).
- **Survivorship:** 7809 markets vêm de Phase 1 com filtro `resolution_status='resolved'`. Markets void/disputed (~17 sports + 7 finance + 5 politics) excluídos por construção. <10% — passa G6.

## 7. Decisão Tier 2

**GO** — proceder para Tier 2 (LLM ~$1.50). Heurística pura mostra edge em 1 vertical(is): weather. Tier 2 testará se LLM amplifica esse signal e cobre verticals onde heurística sozinha falhou.

Próximos passos:
1. Spawn @dev story BACKTEST-3-tier2-llm (~$1.50, 4-6h dev).
2. Roda LLM (Claude Haiku ou GPT-4o-mini) em sample estratificado pelos 1 verticals que passaram + 1 que falhou (controle).
3. Re-corre Brier + bootstrap + shuffle nos forecasts LLM.
4. Se LLM piora ou empata: GO PARCIAL com heurística-only no(s) vertical(is) PASS.
5. Se LLM melhora: paper trading >=30 dias antes de live.

## 8. Apêndice — Gates Chip Huyen

| Gate | Threshold | Status |
|---|---|---|
| G1 — N por vertical | >=100 (>=50 finance) | 5/4 verticais |
| G2 — Signal Brier < Baseline (CI lower > 0) | per vertical | 1/4 verticals PASS |
| G3 — Profit factor (fees stress) | >=1.15 | ver §5 |
| G4 — Calibration | <=5pp em N>=10 buckets | 4 buckets fail |
| G5 — Shuffle test | p<0.05 | global p=0.0000 |
| G6 — Survivorship | <10% void/disputed | ~0.5% (passa) |
