# BACKTEST-3 Phase 2 Tier 2 — Replay LLM (Anthropic Claude Haiku)

**Gerado em:** 2026-04-30T16:57:30.581Z
**Story:** BACKTEST-3-tier2-llm
**Predecessor:** BACKTEST-2 Tier 1 (apenas weather PASS)
**Custo desta fase:** $0.6870 (Anthropic Claude Haiku)
**Parse OK rate:** 100.0% (1138/1138)

## 1. Resumo Executivo

- **N total replay LLM:** 1138
- **Brier global LLM:** 0.1724
- **Brier global heurística (mesmo subset):** 0.1696
- **Brier global baseline (mid_t12h):** 0.1701
- **CI 95% (LLM vs baseline):** [-0.0036, -0.0011]
- **CI 95% (LLM vs heurística):** [-0.0042, -0.0016]
- **Shuffle p-value (LLM):** 0.0000
- **Verticais PASS:** (nenhum)
- **Verticais FAIL:** politics, sports, finance, weather, crypto

### Recomendação
- **STOP — Damodaran stop-loss aciona em Tier 2.** LLM Haiku NÃO supera baseline+heurística em nenhum vertical. Antes de gastar mais $$$:
  - Considerar LLM melhor (Sonnet ou GPT-4o) — mas custo 5-10× maior.
  - Pivotar pra weather-only (Tier 1 já mostrou edge).
  - Pivotar pra cross-platform arb (PM vs Kalshi spreads), fora do escopo atual.

## 2. Brier por vertical — LLM vs Heurística vs Baseline

| Vertical | N | LLM Brier | Heur Brier | Base Brier | Δ(LLM vs base) | 95% CI | Δ(LLM vs heur) | 95% CI | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| politics | 256 | 0.1063 | 0.1055 | 0.1064 | +0.0001 | [-0.0009, 0.0012] | -0.0008 | [-0.0023, 0.0005] | **FAIL** |
| sports | 217 | 0.1717 | 0.1697 | 0.1704 | -0.0013 | [-0.0022, -0.0005] | -0.0020 | [-0.0036, -0.0005] | **FAIL** |
| finance | 216 | 0.2332 | 0.2255 | 0.2255 | -0.0077 | [-0.0133, -0.0023] | -0.0077 | [-0.0140, -0.0024] | **FAIL** |
| weather | 229 | 0.1367 | 0.1329 | 0.1343 | -0.0024 | [-0.0058, 0.0002] | -0.0038 | [-0.0075, -0.0009] | **FAIL** |
| crypto | 220 | 0.2273 | 0.2272 | 0.2269 | -0.0003 | [-0.0007, -0.0000] | -0.0001 | [-0.0005, 0.0004] | **FAIL** |
| GLOBAL | 1138 | 0.1724 | 0.1696 | 0.1701 | -0.0022 | [-0.0036, -0.0011] | -0.0028 | [-0.0042, -0.0016] | **FAIL** |

### Veredito por vertical
- **politics** (N=256, parse_ok=100.0%): FAIL — LLM Brier 0.1063 >= heuristic 0.1055 (LLM didn't justify its cost)
- **sports** (N=217, parse_ok=100.0%): FAIL — LLM Brier 0.1717 >= baseline 0.1704 (no edge over consensus)
- **finance** (N=216, parse_ok=100.0%): FAIL — LLM Brier 0.2332 >= baseline 0.2255 (no edge over consensus)
- **weather** (N=229, parse_ok=100.0%): FAIL — LLM Brier 0.1367 >= baseline 0.1343 (no edge over consensus)
- **crypto** (N=220, parse_ok=100.0%): FAIL — LLM Brier 0.2273 >= baseline 0.2269 (no edge over consensus)

## 3. Calibration buckets LLM (10 bins) — GLOBAL

Gate Chip Huyen: |predictedMean - observedFreq| <= 0.05 em buckets com N>=10.

| Bucket | N | Predicted Mean | Observed Freq | Abs Gap | Within 5pp? |
|---|---|---|---|---|---|
| 0-10% | 264 | 0.0417 | 0.0379 | 0.0038 | YES |
| 10-20% | 127 | 0.1433 | 0.1102 | 0.0331 | YES |
| 20-30% | 71 | 0.2549 | 0.3380 | 0.0832 | NO |
| 30-40% | 57 | 0.3454 | 0.4386 | 0.0932 | NO |
| 40-50% | 86 | 0.4567 | 0.5116 | 0.0549 | NO |
| 50-60% | 437 | 0.5066 | 0.5446 | 0.0380 | YES |
| 60-70% | 27 | 0.6357 | 0.4444 | 0.1913 | NO |
| 70-80% | 18 | 0.7317 | 0.5556 | 0.1761 | NO |
| 80-90% | 10 | 0.8515 | 1.0000 | 0.1485 | NO |
| 90-100% | 41 | 0.9560 | 0.9756 | 0.0196 | YES |

**Calibration fails (N>=10):** 6 bucket(s). Largest gap: 0.1913

## 4. Profit factor — Stress-test fees (PM 2% taker, Kelly 5%, bankroll $1000, cap $25)

| Vertical | Trades | Wins | Hit Rate | Profit Gross | Loss Gross | Fees | PnL | PF |
|---|---|---|---|---|---|---|---|---|
| politics | 17 | 10 | 58.8% | $29.50 | $13.59 | $0.94 | $14.97 | 2.030 |
| sports | 3 | 0 | 0.0% | $0.00 | $6.70 | $0.13 | $-6.84 | 0.000 |
| finance | 2 | 0 | 0.0% | $0.00 | $2.68 | $0.05 | $-2.73 | 0.000 |
| weather | 79 | 24 | 30.4% | $64.75 | $123.56 | $4.50 | $-63.31 | 0.506 |
| crypto | 2 | 0 | 0.0% | $0.00 | $3.28 | $0.07 | $-3.35 | 0.000 |
| GLOBAL | 103 | 34 | 33.0% | $94.25 | $149.81 | $5.70 | $-61.25 | 0.606 |

Gate G3: PF >= 1.15 com fees realistas.

## 5. LLM operational stats

| Vertical | N | Parse OK Rate | Cost USD |
|---|---|---|---|
| politics | 256 | 100.0% | $0.1582 |
| sports | 217 | 100.0% | $0.1258 |
| finance | 216 | 100.0% | $0.1235 |
| weather | 229 | 100.0% | $0.1514 |
| crypto | 220 | 100.0% | $0.1281 |
| GLOBAL | 1138 | 100.0% | $0.6870 |

**Total cost across all verticals: $0.6870**

## 6. Caveats e limitações

- **Sample stratificado, não population:** Tier 2 amostrou ~150/vertical (vs Tier 1 que rodou full 7647 markets). Bootstrap CIs aqui têm mais variância.
- **Heurística subset != Tier 1 full:** Esta heurística Brier vem do mesmo subset de markets que LLM viu. Compara LLM vs heurística "head-to-head" no MESMO sample.
- **Parse fallback usa mid_price:** Quando LLM output não parseia, forecast = baseline. Penaliza LLM Brier (parse fail = neutralidade forçada). Parse OK rate global = 100.0%.
- **Custo real pode divergir:** Estimativa usa Haiku 4.5 pricing oficial ($1/M input, $5/M output). Anthropic pode ter promo/desconto.
- **Sem retry logic complexo:** Erros API são logados mas markets pulados (não-fatal). Se >1% de mercados deram erro, considerar re-rodar com --resume.
- **LLM date awareness:** Claude conhece eventos até ~2025. Markets resolvidos em 2024-2025 podem ter "vazamento" parcial via training data. Mitigação: prompt explícito "estimate fair P", não "what happened".

## 7. Decisão Go-Live Paper

**STOP** — não vale paper trading com Haiku. Considerar:
1. Tier 2.5 com Claude Sonnet (5-10× custo, ~$8-15) em weather + 1 vertical FAIL pra ver se LLM melhor reverte.
2. Pivot para weather-only com heurística (já PF 1.388 stress no Tier 1) + climatology NOAA. Sem LLM.
3. Pausar pivot real-only (PM-PIVOT-1) e re-avaliar tese.

## 8. Apêndice — Gates Chip Huyen

| Gate | Threshold | Status |
|---|---|---|
| G1 — N por vertical | >=50 (Tier 2) | 5/5 |
| G2 — LLM Brier < min(base, heur) (CI lower > 0) | per vertical | 0 PASS |
| G3 — Profit factor (fees stress) | >=1.15 | ver §4 |
| G4 — Calibration | <=5pp em N>=10 buckets | 6 buckets fail |
| G5 — Shuffle test | p<0.05 | global p=0.0000 |
| G7 — Parse OK rate | >=90% | 100.0% PASS |
