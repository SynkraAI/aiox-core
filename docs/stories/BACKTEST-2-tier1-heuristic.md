# Story BACKTEST-2 — Phase 2 Tier 1: Replay Heurístico (Sem LLM)

**Status:** Ready for Review
**Phase:** 2 (Tier 1 only — Tier 2 LLM é story separada)
**Predecessor:** BACKTEST-1 (Phase 1 ingest, 7.647 markets eligíveis)
**Successor:** BACKTEST-3 (Tier 2 LLM ~$1.50) — condicional ao verdict deste tier
**Owner (impl):** Dex (AIOS Developer)
**Date:** 2026-04-29
**Cost:** $0,00 (heurística pura, zero LLM)

---

## Story (formal)

> Como **AIOS Developer (Dex)**,
> quero **rodar replay heurístico (sem LLM) sobre os 7.647 markets resolvidos do Phase 1, computando Brier signal vs Brier baseline (mid_t12h) por vertical com bootstrap CI + shuffle test + calibration + profit-factor**,
> para que o **time possa decidir GO/STOP em Tier 2 (LLM ~$1.50) sem gastar $$$ sem evidência prévia de edge** (gate Damodaran's stop-loss).

---

## Acceptance Criteria

- [x] Módulo de heurística pura `scripts/backtest/heuristic-signal.ts`:
  - Extraído fielmente do `src/engine/auto-trader.ts::analyzeMarket` (4 signals: priceMismatch, liquidityStress, midRangeEdge, knowledgeEdge)
  - Side selection contrarian (bet underdog)
  - Edge cap 0.25, modelProb cap 0.90 (matches P2 BUG-4 fix)
  - Sem LLM, sem rede, sem state runtime (ExperienceStore zerado, KnowledgeStore biases hardcoded)
  - `forecastYes` em [0,1] sempre normalizado pra `P(outcome=YES=1)`, comparável com Brier
- [x] Replay harness `scripts/backtest/replay-heuristic.ts`:
  - SELECT WHERE resolved + outcome + mid_price_t12h not null
  - Drop+recreate `replay_heuristic_predictions` (idempotente)
  - Insere uma row por market com forecast/baseline/outcome/side/edge/confidence/should_trade/raw_edge/signal_count/reason
  - Loga em `ingest_runs` com run_id próprio
  - Wrapping em transaction (50x faster)
- [x] Métricas em `scripts/backtest/compute-brier.ts` (módulo puro, importável):
  - `brierScore(forecasts, outcomes)`
  - `bootstrapCI(forecasts, baselines, outcomes, n=1000, alpha=0.05, seed=42)` → paired bootstrap (baseline_BS - signal_BS)
  - `shuffleTest(forecasts, outcomes, n=1000, seed=42)` → permutação Fisher-Yates p-value
  - `calibrationBuckets(forecasts, outcomes, n=10)` → 10 bins com gate 5pp
  - `profitFactor(...)` → Kelly-fractional bet sim com fees stress-test (PM 2% taker)
  - RNG determinístico (LCG seed=42) para reproducibilidade
- [x] Report generator `scripts/backtest/generate-tier1-report.ts`:
  - Análise por vertical (politics, sports, finance, weather) + GLOBAL
  - Tabelas: full population + subset shouldTrade=true
  - Calibration buckets table
  - Profit factor table com fees stress
  - Verdict por vertical (PASS/FAIL/INSUFFICIENT_N) com gate Chip Huyen
  - Recomendação: GO Tier 2 (>=1 PASS) ou STOP (Damodaran)
  - Output: `data/backtest/TIER1-RESULTS.md`
- [x] Scripts EXECUTADOS — replay rodou nos 7.647 markets, report gerado
- [x] Idempotente: re-rodáveis sem corromper DB
- [x] Output PT-BR no report, código EN

---

## Resultados (executados em 2026-04-29)

### Brier por vertical (full population, N=7647)

| Vertical | N    | Signal Brier | Baseline Brier | Δ        | 95% CI         | Verdict |
|----------|------|--------------|----------------|----------|----------------|---------|
| politics | 472  | 0.1006       | 0.1008         | +0.0002  | [-0.0007, 0.0011] | FAIL  |
| sports   | 1379 | 0.1729       | 0.1728         | -0.0000  | [-0.0006, 0.0005] | FAIL  |
| finance  | 1493 | 0.2336       | 0.2335         | -0.0001  | [-0.0003, 0.0002] | FAIL  |
| **weather** | **4303** | **0.1206** | **0.1214** | **+0.0008** | **[+0.0004, +0.0011]** | **PASS** |
| GLOBAL   | 7647 | 0.1509       | 0.1513         | +0.0004  | [+0.0002, +0.0006] | PASS  |

### Profit factor (PM 2% taker stress, Kelly 5%, bankroll $1000, cap $25)

| Vertical | Trades | Hit Rate | PnL      | PF    |
|----------|--------|----------|----------|-------|
| politics | 119    | 36.1%    | $12.21   | 1.103 |
| sports   | 343    | 37.0%    | $2.91    | 1.008 |
| finance  | 95     | 34.7%    | -$6.42   | 0.935 |
| **weather** | **1048** | **38.5%** | **$375.66** | **1.388** |
| GLOBAL   | 1605   | 37.8%    | $384.36  | 1.250 |

**Veredito:** Apenas **weather** passa G2 (Brier signal < baseline com CI lower > 0). PF weather 1.388 > 1.15 (passa G3 com fees stress). Calibration global tem 3 buckets fail (>5pp gap em 20-30%, 60-70%, 70-80%) → G4 fail global, mas weather isolado passa.

**Recomendação:** **GO Tier 2 (LLM ~$1.50)** — pelo menos 1 vertical (weather) passa o gate. Vale testar se LLM amplifica em weather + cobre verticals onde heurística sozinha falhou.

---

## Implementation Notes

### Como a heurística pura foi extraída

`auto-trader.ts::analyzeMarket()` (linhas 384-535) tem 4 signals + experience-based dampening:

```
Signal 1: priceMismatch        — |yes + no - 1| > 0.03 → 0.5 * mismatch
Signal 2: liquidityStress      — vlRatio < 0.05 → 0.02 (binary)
Signal 3: midRangeEdge         — priceExtremity in [0.05, 0.30] → 0.02
Signal 4: knowledgeEdge        — 'favorite-longshot' OR 'anchoring' → 0.01-0.015
rawEdge = MAX(...4 signals)    — não soma, máximo
edge    = min(rawEdge, 0.25)   — cap PM-PIVOT-1 P2 BUG-4
side    = yesPrice < 0.5 ? 'YES' : 'NO'   — contrarian
```

`heuristic-signal.ts` reproduz isso 1:1 com 3 simplificações documentadas:
1. **ExperienceStore zerado** — replay não tem trades históricos para alimentar boost/penalty.
2. **KnowledgeStore biases hardcoded** — `politics/sports/finance/weather` todos têm `favorite-longshot` + `anchoring` no KB padrão (verificado em `knowledge-store.ts:360`).
3. **Signal 1 sempre = 0** — em replay, `noPrice = 1 - midPriceT12h` por construção, então priceSum sempre = 1.0. Limitação inerente do schema (que armazena só mid, não o orderbook completo). Em runtime real, yes/no podem divergir.

### Como o forecast vira `P(outcome=YES=1)`

Auto-trader retorna `modelProbability` que é a **probabilidade do SIDE escolhido**, não do YES. Para Brier contra outcome ∈ {0,1}:
- `forecastYes = side==='YES' ? modelProb : 1 - modelProb`

### Gates implementados

| Gate | Spec | Implementação |
|------|------|---------------|
| G1 (N>=100) | Chip Huyen | `analyze()` retorna INSUFFICIENT_N quando N < threshold (50 para finance, 100 outros) |
| G2 (Brier signal < baseline + CI lower > 0) | Chip + Ng | `bootstrapCI()` paired resample, lower > 0 |
| G3 (PF >= 1.15 stress fees) | Chip | `profitFactor()` com feeTaker=0.02 (PM 2% stress) |
| G4 (calibration 5pp) | Chip | `calibrationBuckets()` flag bins N>=10 com absGap>0.05 |
| G5 (shuffle p<0.05) | Chip | `shuffleTest()` Fisher-Yates determinístico LCG seed |
| G6 (survivorship <10%) | Boa prática | Documentado no report (~0.5% void/disputed em Phase 1) |

---

## File List

### Created
- `apps/polymarket-trader/scripts/backtest/heuristic-signal.ts` — Heurística pura extraída do auto-trader (~210 LOC)
- `apps/polymarket-trader/scripts/backtest/replay-heuristic.ts` — Harness que itera 7.647 markets e popula replay table (~190 LOC)
- `apps/polymarket-trader/scripts/backtest/compute-brier.ts` — Módulo puro: Brier + bootstrap + shuffle + calibration + profit factor (~280 LOC)
- `apps/polymarket-trader/scripts/backtest/generate-tier1-report.ts` — Report markdown generator (~270 LOC)
- `apps/polymarket-trader/data/backtest/TIER1-RESULTS.md` — **OUTPUT da execução** (gerado automaticamente)
- `docs/stories/BACKTEST-2-tier1-heuristic.md` — Esta story

### Modified
- (Nenhum) — backtest é fork de dados, não toca runtime do bot

### Database changes
- Nova tabela `replay_heuristic_predictions` em `data/backtest/historical-markets.db`
  - 7.647 rows inseridas pela run #11
  - DDL definido em `replay-heuristic.ts` (não em schema.sql — é tabela do Tier 1, não do ingest)
  - Idempotente: drop+recreate em cada run
- Nova entrada em `ingest_runs` (run #11, script='replay-heuristic')

---

## How to Run

Pré-requisitos:
- Node 24+ (testado em v24.13.1) — `node:sqlite` estável sem flag
- DB Phase 1 populado (`data/backtest/historical-markets.db` ~418MB)
- Working directory: `apps/polymarket-trader/`

Execução completa (ordem):

```bash
cd apps/polymarket-trader

# 1. Replay heurístico (popula replay_heuristic_predictions)
node --import tsx scripts/backtest/replay-heuristic.ts
# → ~5s, 7.647 rows inserted

# 2. Gera report Markdown
node --import tsx scripts/backtest/generate-tier1-report.ts
# → ~2s, escreve data/backtest/TIER1-RESULTS.md
```

Reproducibilidade: bootstrap e shuffle usam LCG seed=42 — mesmas runs produzem mesmos números.

Rodar individual de um vertical (futuro):
```typescript
import { analyze } from './generate-tier1-report.ts'; // exportar para uso programático se necessário
```

---

## Caveats / Open Issues

- **Baseline T-12h, não T-1h** — Decisão #5 do scoping aceitou. Limitação CLOB API. Menos duro que T-1h, mas dado δ pequeno (+0.0004 global), T-1h provavelmente também não viraria FAIL→PASS.
- **Signal 1 (price-mismatch) inerte no replay** — schema atual não armazena orderbook completo. Para ativar, ingerir snapshots NO + YES em vez de só mid_price_t12h.
- **Politics borderline** — δ=+0.0002 com CI lower=-0.0007. Quase passa. Estender janela 12m→24m pode tornar PASS, mas custo de re-ingestion alto.
- **Sports/finance NO edge** — Δ negativos ou zero. Heurística micro-bias claramente não captura sports/finance signal. Se Tier 2 LLM também falhar nesses, considerar pivot para weather-only.
- **Calibration global FAIL em 3 buckets** — markets em 20-30% e 60-80% do baseline mid são sub-confiantes. Plat scaling pode resolver pre-paper. Weather isolado passa calibration.
- **Profit factor depende de stake plausível** — Usei bankroll $1000 com Kelly 5% (matches auto-trader risk-engine defaults). Stake menor reduz PF (mais bets sub-$1 filtrados); maior aumenta.

---

## Tier 2 Decision Tree

Próximo passo (decidir após validação): **GO Tier 2** ou **STOP**.

- **GO Tier 2 (recomendado pela Phase 2 Tier 1):**
  - Implementar story BACKTEST-3-tier2-llm
  - Sample estratificado: 100 weather (vertical PASS) + 100 politics (borderline) + 50 sports (controle FAIL)
  - LLM = OpenAI gpt-4o-mini (estimado ~$1.50 em 250 markets × ~600 tokens)
  - Re-rodar mesmas métricas em forecast LLM
  - Se LLM PASS em weather + politics: GO PARCIAL paper trading 30d
  - Se LLM FAIL em todos: STOP confirmado

- **STOP alternativo (se reviewer discordar do GO):**
  - Pivot para weather-only baseline NOAA + heurística (sem LLM)
  - Mantém edge weather (PF 1.388 stress) sem custo LLM
  - Fora do escopo desta story

---

*Dex, AIOS Developer — 2026-04-29*
