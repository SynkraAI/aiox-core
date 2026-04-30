# BACKTEST-1 — Phase 0 Scoping

**Story alvo:** Backtest histórico Brier vs market baseline (gate Go/No-Go pré-paper)
**Autor:** Atlas (AIOS Analyst)
**Data:** 2026-04-28
**Status:** APPROVED — decisões 1-6 fixadas pelo user em 28/Abr/2026

## Decisões Finais (28/Abr/2026 — user)

| # | Decisão | Valor fixado |
|---|---------|--------------|
| 1 | Kalshi API key | **SKIP — PM-only** (28/Abr revisão: governo BR proibiu PM/Kalshi; KYC US-only inviável pra cidadão BR; Manifold sem histórico não serve; Betfair pago + cobertura Aussie/NZ não cobre nosso universo). Phase 4+ pode reavaliar com VPS US se Phase 2 GO. |
| 2 | Sports vertical | **Major-only (NBA/NFL/MLB) + futebol (soccer)** — Champions/Premier/World Cup/Brasileirão se houver depth em PM. Kalshi soccer = skip se depth insuficiente. |
| 3 | Fees | **Conservative stress-test** — PM 2% taker, Kalshi 1% flat. Se passar profit factor aqui, passa em fees reais menores. |
| 4 | Janela histórica | **12 meses** (Mai/2025 → Abr/2026) — garante N em finance |
| 5 | Baseline price | **T-12h aceitável** (CLOB limitation) — não forçar subgraph reconstruction |
| 6 | Stop-loss | **NO-GO total se 0 verticais passam G2** | **GO PARCIAL se ≥1 vertical passa** (bot opera só nos aprovados) |
**Predecessor:** PM-PIVOT-1 (Ready for QA — synth deletado, MarketSelector puro, supervisor)

---

## 0. Por que este backtest existe

**Verdade descoberta na auditoria 27/Abr:**
- 95.5% dos 1.150 trades em `trades.db` eram `synth-bitcoin-below-X-Yh-...` (placebo: bot inventa "Will BTC < $X em 24h", resolve via Binance, sem counterparty real).
- WR 89% pré-refactor é **artefato de regime** (BTC pump 71→84k em 5 dias, não skill).
- Pós-religar 24/Abr: **ZERO trades reais Polymarket/Kalshi executados** em 36h antes do bot morrer por OPENAI_DAILY_BUDGET esgotar.

**Conclave 27/Abr (chip-huyen + andrew-ng + guillermo-rauch):**
- **Ng:** "Get the data right first. Backtest histórico Brier vs market baseline ANTES de paper. Se Brier ≥ baseline, ABORTAR pivot."
- **Chip Huyen:** Gate de 4 não-negociáveis — fill model com book real, NOAA climatology baseline pra weather, fill-rate tracking pra arb, shuffle test. **N ≥ 100 trades/vertical, Brier <0.22, profit factor ≥1.15, bootstrap 95% CI, calibration ±5pp.**
- **Damodaran:** Stop-loss claro. Sunk-cost fallacy é o risco maior aqui.

**Regra dura do user (memory feedback, 27/Abr):**
> "Capital travado = capital morto. Velocidade de capital > absolute return. Esforço ≤ ganho POR TRADE."

→ Universo restrito a **mercados ≤7d resolução**, verticais **politics/sports/finance/weather**. Crypto está **EXPLICITAMENTE FORA** (foi placebo synth, não tem counterparty real ≤7d em PM/Kalshi).

---

## 1. Data Sources Audit

### 1.1 Polymarket — duas APIs distintas, escolher por finalidade

#### A) Gamma Markets API (REST) — metadados + listagem histórica
- **Base:** `https://gamma-api.polymarket.com`
- **Endpoint relevante:** `GET /markets`
- **Auth:** Pública, sem key
- **Query exemplo (resolved, paginação):**
  ```
  GET https://gamma-api.polymarket.com/markets?closed=true&limit=500&offset=0
  ```
- **Parâmetros úteis:** `closed=true` (markets fechados), `tag_id`, `limit` (default 100, suspeitamos cap em 500-1000), `offset`
- **Depth:** Polymarket existe desde 2020; Gamma indexa todo histórico on-chain
- **Rate limit:** Não documentado publicamente; observado <100 req/min em SDKs públicos. **REQUIRES LIVE VERIFICATION**
- **Schema de campos (típico):** `id`, `question`, `slug`, `endDate`, `closedTime`, `volume`, `liquidity`, `outcomes`, `outcomePrices`, `clobTokenIds`, `tags`, `umaResolutionStatuses`
- **Caveat crítico:** Gamma retorna preço atual/final, **NÃO** preço histórico T-1h. Pra baseline (price at T-1h before resolution) precisamos do CLOB API abaixo.

#### B) CLOB API (REST) — orderbook + price history retroativo
- **Base:** `https://clob.polymarket.com`
- **Endpoint price history:** `GET /prices-history`
- **Params obrigatórios:** `market` (token_id, NÃO market_id — corresponde ao `clobTokenIds[0]` do Gamma para outcome YES), `interval` ∈ {`1h`, `6h`, `1d`, `1w`, `1m`, `max`} **OU** `startTs`+`endTs` (Unix UTC), `fidelity` (resolução em minutos, default 200)
- **Auth:** Pública pra reads
- **Resposta:** Lista de `{t: epoch_ms, p: 0.0-1.0}`
- **⚠️ LIMITAÇÃO CRÍTICA (issue #216 do py-clob-client):** Para markets **resolvidos**, `/prices-history` retorna dados apenas em granularidade ≥12h. **Não conseguimos preço T-1h retroativo via API pública.**
- **Mitigação proposta:**
  - Opção α: usar granularidade 12h e definir baseline como "preço no último ponto disponível antes de resolução" (~12h, não 1h).
  - Opção β: pular price-history e usar **subgraph** (Polymarket subgraph indexa trades on-chain → reconstruir orderbook mid via VWAP de trades nas últimas N horas).

#### C) Polymarket Subgraph (The Graph) — trades on-chain
- **Endpoint:** `https://gateway.thegraph.com/api/{api-key}/subgraphs/id/Bx1W4S7kDVxs9gC3s2G6DS8kdNBJNVhMviCtin2DiBp`
- **Auth:** API key gratuita (100k queries/mês free tier) em https://thegraph.com/studio
- **Schema (open source):** https://github.com/Polymarket/polymarket-subgraph
- **Query exemplo (trades de 1 mercado):**
  ```graphql
  {
    fpmmTrades(
      where: { fpmm: "0x..." }
      orderBy: timestamp
      orderDirection: asc
      first: 1000
    ) {
      id
      timestamp
      outcomeIndex
      outcomeTokensTraded
      collateralAmount
      type   # Buy | Sell
    }
  }
  ```
- **Depth:** Todo histórico on-chain (Polygon, desde 2020)
- **Rate limit:** 100k queries/mês free; pode escalar via API key paga
- **Vantagem:** Reconstrói VWAP/mid em qualquer timestamp. Resolve a limitação 12h do CLOB.

**Decisão arquitetural (PROPOSTA):** Gamma pra inventário de markets resolved + Subgraph pra reconstruir mid-price T-1h. CLOB price-history fica como cross-check em granularidade 12h.

---

### 1.2 Kalshi — REST API v2

- **Base:** `https://api.elections.kalshi.com/trade-api/v2` (URL atual; `trading-api.kalshi.com/trade-api/v2` é alias legado)
- **Endpoint resolved:** `GET /historical/markets` (mercados settled antes do "historical cutoff" só vivem aqui)
- **Endpoint atuais/recentes:** `GET /markets?status=settled` (paginação cursor-based)
- **Auth:** **OBRIGATÓRIA mesmo pra reads** — Key ID + signed request com private key. Headers: `KALSHI-ACCESS-KEY`, `KALSHI-ACCESS-TIMESTAMP`, `KALSHI-ACCESS-SIGNATURE`.
  - **PENDING USER DECISION #1:** User precisa criar conta Kalshi (https://kalshi.com) + gerar API key. Sem isso, **não há backtest Kalshi.** Estima ~15min setup. Alternativa: omitir Kalshi do backtest inicial (politics e weather concentram em PM mesmo).
- **Pagination:** `limit` (1-1000, default 100) + `cursor` (vazio = primeira página, vazio na resposta = fim)
- **Rate limit:** Token-bucket por tier. Tier mais baixo (free) é restritivo; **REQUIRES LIVE VERIFICATION** após criar conta.
- **Campos relevantes pra backtest:** `ticker`, `event_ticker`, `open_time`, `close_time`, `latest_expiration_time`, `status`, `last_price_dollars`, `previous_price_dollars`, `yes_bid_dollars`, `yes_ask_dollars`, `volume_fp`, `liquidity_dollars`, `result` (settlement value: yes/no/void), `expiration_value`
- **Depth:** Kalshi opera regulada CFTC desde 2021; histórico completo disponível.
- **Snapshot de book histórico:** Kalshi expõe `previous_yes_bid_dollars`/`previous_yes_ask_dollars` mas é só o último tick; pra reconstruir mid T-1h precisamos do endpoint `GET /markets/trades` ou `/markets/{ticker}/orderbook` (snapshot atual, não retroativo). **Limitação simétrica à Polymarket.**

---

### 1.3 NOAA GHCN-Daily — climatology baseline pra weather

- **Bulk download HTTPS:** https://www.ncei.noaa.gov/data/global-historical-climatology-network-daily/
- **AWS Open Data mirror:** https://registry.opendata.aws/noaa-ghcn/ (S3, recomendado pra throughput)
- **Formato:** ASCII por estação (1 file/station) + GZIP-TAR consolidado. **Não há parquet/CSV oficial.** Conversor próprio necessário (~50-100 LOC Python `pandas`).
- **Tamanho:** ~30 GB descompactado (~4-6 GB compactado)
- **Update:** Diário; arquive-quality 45-60 dias após fim do mês
- **Campos relevantes:** `TMAX`, `TMIN`, `PRCP` (precipitation), `SNOW`, `SNWD` (snow depth)
- **Climatology baseline (a chave pro Brier baseline em weather):**
  - Dataset oficial: **1991-2020 U.S. Climate Normals** (https://www.ncei.noaa.gov/pub/data/cdo/documentation/normals-daily-1991-2020_documentation.pdf)
  - Estatísticas: 30-year averages + std dev + frequencies + percentiles **por dia do ano por estação**
  - **Como usar:** Para market "Will NYC TMAX exceed 75°F on 2026-05-15?", climatology baseline = P(TMAX>75°F | doy=135, station=USW00094728) computado dos 30 anos. Esse é o **null model** que precisamos derrotar.
- **Trabalho engenheiro:** Pipeline ingestion → S3 puxa estações relevantes (~50-100 estações cobrindo 90% dos weather markets PM/Kalshi) → calcula percentis por (station, doy) → cache em parquet local (~500 MB).

---

### 1.4 Datasets prontos (atalhos opcionais)

- **`jon-becker/prediction-market-analysis`** (GitHub) — PM + Kalshi combined dataset CSV/JSON. Citado em KB local. **REQUIRES LIVE VERIFICATION** (link/depth não confirmado nesta sessão).
- **Metaculus API** — questions + Brier scores (forecaster reference). Não é nosso universo de trade, mas serve como sanity check de calibration.

---

## 2. Universe Definition

### 2.1 Critérios de inclusão

| Critério | Valor proposto | Justificativa |
|---|---|---|
| `source` | `polymarket` OR `kalshi` | Único universo com counterparty real ≤7d |
| `vertical` | `politics`, `sports`, `finance`, `weather` | User rule + Domer/Chip recomendação |
| `resolution_horizon` | `endDate - now <= 168h` (≤7d) | Capital travado = morto |
| `liquidity_USD_at_entry` | `>= 5000` (PROPOSTA) | Filtra dust markets que distorcem Brier; alinhado com bot atual `MIN_LIQUIDITY` |
| `volume_USD_total` | `>= 10000` (PROPOSTA) | Garante book real, não air |
| `status` | resolved + outcome ∈ {YES, NO} | Exclui void/cancelled (survivorship-aware abaixo) |

**Survivorship bias mitigation:** Carregar **TODOS** os markets que entraram no critério ao "entry timestamp" (T-7d antes da resolução), incluindo os que depois foram void/cancelled. Reportar separadamente: `N_resolved_clean`, `N_void`, `N_disputed`. Excluir do Brier mas reportar fração.

### 2.2 Vertical mapping

Polymarket e Kalshi não tagueiam vertical de forma uniforme. Proposta de mapeamento:

| Vertical | Polymarket tags | Kalshi event prefixes |
|---|---|---|
| politics | "Politics", "Elections", "Trump" | `KXPRES`, `KXSEN`, `KXGOV`, `KXCONGRESS` |
| sports | "Sports", "NBA", "NFL", "Soccer" | `KXNBA`, `KXNFL`, `KXMLB`, `KXSOCCER` |
| finance | "Crypto" excluded; "Stocks", "Fed", "Inflation", "GDP" | `KXCPI`, `KXFED`, `KXSPX`, `KXNDX` |
| weather | "Weather" | `KXTEMP`, `KXSNOW`, `KXRAIN`, `KXHURRICANE` |

**PENDING USER DECISION #2:** Validar mapeamento. Sports é o mais ruidoso — incluir college/minor leagues ou só major? Domer recomendou NCAA "least efficient" mas user pode preferir começar conservador (NBA/NFL/MLB only).

### 2.3 Volume estimado por vertical (6 meses)

**Best guess com caveats — NÃO verificado contra DB ainda:**

| Vertical | PM markets/6m | Kalshi markets/6m | Total qualifying ≤7d |
|---|---|---|---|
| politics | ~800-1500 | ~500-800 | ~300-500 |
| sports | ~3000-5000 (jogos diários) | ~2000-3500 | ~2000-3000 |
| finance | ~100-300 (CPI/Fed mensais) | ~150-400 | ~50-150 |
| weather | ~50-150 (temp diária NYC/CHI) | ~200-400 | ~150-300 |

**Caveat:** PM tem muito "Trump out before GTA VI" tipo eternal — a maioria de politics não passa filtro ≤7d. Estimativa "qualifying ≤7d" assume corte agressivo. Valida-se em Phase 1 (data ingest).

**Chip's gate N ≥ 100/vertical** é factível em todos os 4 verticais com 6 meses de dados — **exceto possivelmente finance**, onde podemos ter <100. Considerar:
- Estender finance pra 12 meses
- Ou aceitar 50 trades em finance com CI mais largo, flagado

---

## 3. Baseline Metric — o "market mid-price"

### 3.1 Definição operacional

**Baseline = market mid-price em T = (resolution_time - 1h)** para markets PM/Kalshi.

**Por que T-1h e não outras alternativas:**
- **vs T-24h:** Em markets ≤7d, 24h captura ainda muito noise pré-resolução (last-minute news flow). T-1h é depois do "smart money settle" mas antes do final-tick volatility.
- **vs entry-time price:** Entry é nosso signal time; baseline = market consensus *no mesmo timestamp da nossa decisão* seria fair, MAS Chip's framework pede comparação contra o "best available market signal" → mid-price perto da resolução é o mais informado o mercado conseguiu ficar. Comparar nosso forecast (em entry) contra esse é o teste mais duro.
- **vs consensus médio:** Distorção por whales late-stage. Mid-price single-snapshot é ruído mas Brier promedia.

### 3.2 Implementação por fonte

**Polymarket:**
- **Plano A (subgraph):** Reconstruir mid via VWAP dos últimos 100 trades antes de T-1h. Se <10 trades em 1h, usar last-traded-price.
- **Plano B (CLOB price-history):** `interval=1h` na resposta agregada — limitação 12h pra resolved markets pode forçar usar mid em T-12h, não T-1h. **Flag em report.**

**Kalshi:**
- Usar `previous_yes_bid_dollars` + `previous_yes_ask_dollars` no `/historical/markets` é só último tick (não T-1h fixo).
- Plano A: `GET /markets/trades?ticker=...&min_ts=...&max_ts=...` agregar VWAP last 1h.
- **REQUIRES LIVE VERIFICATION** — endpoint trades existe mas pagination/auth precisa testar com conta real.

### 3.3 Baseline pra weather (NOAA climatology)

**Definição:** Para market "Will TMAX at station X exceed Y°F on date D?", o climatology baseline é:
```
P_climate = (count of past 30 years where TMAX_X_D > Y) / 30
```

Fórmula para cada market weather:
1. Identifica `station_id` (parsing da pergunta) + `doy` (day-of-year da resolução) + threshold
2. Pull GHCN history da estação de 1991-2020 (ou maior janela disponível)
3. Conta frequência histórica de outcome
4. P_climate é o baseline a derrotar

**Limitação:** Algumas perguntas não mapeiam pra estação única (e.g., "Will NYC have snow this week?" — qual estação? Central Park? JFK?). Manual mapping de ~30-50 markets recorrentes resolve 80% dos casos.

---

## 4. Brier Score Formulation

### 4.1 Fórmula

```
BS = (1/N) * Σ (p_forecast_i - y_outcome_i)²
```
- `p_forecast` = nossa probabilidade YES no entry (output do MarketAnalyzer LLM + heurística)
- `y_outcome` ∈ {0, 1} (1 = YES resolveu, 0 = NO resolveu)
- N = # trades por vertical

### 4.2 Por vertical (Chip's gate)

Calcular Brier separadamente:
- `BS_signal_politics`, `BS_signal_sports`, `BS_signal_finance`, `BS_signal_weather`
- `BS_baseline_politics`, etc. (market mid em T-1h pra PM/Kalshi; climatology pra weather)
- **Gate por vertical:** `BS_signal_v < BS_baseline_v` E lower bound 95% CI > 0

### 4.3 Bootstrap 95% CI

```python
def brier_bootstrap_ci(forecasts, outcomes, n_resamples=1000):
    diffs = []
    for _ in range(n_resamples):
        idx = np.random.choice(len(forecasts), size=len(forecasts), replace=True)
        bs_signal = np.mean((forecasts[idx] - outcomes[idx])**2)
        bs_baseline = np.mean((baseline[idx] - outcomes[idx])**2)
        diffs.append(bs_baseline - bs_signal)  # positive = signal melhor
    return np.percentile(diffs, [2.5, 97.5])
```

Gate: lower bound (`p2.5`) > 0 → improvement estatisticamente significativo.

### 4.4 Shuffle test (null hypothesis)

```python
def shuffle_test(forecasts, outcomes, n_shuffles=10000):
    observed_bs = brier(forecasts, outcomes)
    null_bs = []
    for _ in range(n_shuffles):
        shuffled = np.random.permutation(outcomes)
        null_bs.append(brier(forecasts, shuffled))
    p_value = np.mean(np.array(null_bs) <= observed_bs)
    return p_value
```

Gate: `p < 0.05` → BS observado é melhor que random pairing.

### 4.5 Calibration plot

10 buckets de probabilidade (0-10%, 10-20%, ..., 90-100%):
- Para cada bucket: average forecast vs actual frequency
- Gate Chip: **|avg_forecast_bucket - actual_freq_bucket| ≤ 5pp** em todos os buckets com N≥10

---

## 5. Gate Criteria (Go/No-Go)

| # | Critério | Threshold | Origem |
|---|---|---|---|
| G1 | N por vertical | ≥ 100 (finance flexibilizado pra ≥50 com flag) | Chip Huyen |
| G2 | Brier signal < Brier baseline | Por vertical, 95% CI lower > 0 | Chip + Andrew Ng |
| G3 | Profit factor com fees realistas | ≥ 1.15 | Chip Huyen |
| G4 | Calibration | ±5pp em todos buckets N≥10 | Chip Huyen |
| G5 | Shuffle test | p-value < 0.05 | Chip Huyen |
| G6 | Survivorship reporting | <10% void/disputed entre N qualifying | Boa prática backtest |

### 5.1 Profit factor — fees realistas

**Fees reais (do KB local `adv-backtesting-framework.md`, NÃO da story PM-PIVOT-1):**
- **Polymarket:** **0.10% taker, 0% maker** (NÃO 2% como na missão original — verificar atual em https://polymarket.com/fees)
- **Kalshi:** Probability-weighted formula — fee = `0.07 * trade_value * yes_price * (1 - yes_price)` aproximadamente; flat ~1% em mercados perto de 50/50, menor nos extremos
- **Slippage:** Adicionar 0.5pp adverso em markets com liquidity < $10k, 0.2pp em > $10k
- **Gas Polygon:** ~$0.01 por trade, negligible

**ATENÇÃO:** A story PM-PIVOT-1 cita "PM 2% taker, KA 1%" no parecer Chip — isso parece **DESATUALIZADO ou ERRADO** baseado em KB e docs públicos. **PENDING USER DECISION #3:** confirmar fees atuais com nota oficial Polymarket/Kalshi antes de profit factor, ou usar 2%/1% como conservative-stress-test.

### 5.2 Edge cases (regras pré-definidas pra Damodaran's stop-loss)

| Cenário | Decisão |
|---|---|
| Brier signal ≈ baseline (CI cruza 0) em 4/4 verticais | **NO-GO.** Pivot abandonado. Damodaran's stop-loss aciona. |
| Brier melhor em 1-2 verticais, pior em outros | **GO PARCIAL.** Bot opera só nos verticais aprovados. Documentar edge específico. |
| Brier melhor em todos mas profit factor < 1.15 | **GO CONDICIONAL.** Investigar — provavelmente fee/slippage maiores que esperado. Re-spec antes de paper. |
| N < 100 em algum vertical | **AGUARDAR.** Estender janela 6m → 12m antes de gate. |
| Calibration falha (>5pp off em algum bucket) | **GO COM RECALIBRAÇÃO.** LLM precisa Platt scaling antes de paper. |

---

## 6. Risks & Open Questions

### 6.1 O que NÃO sabemos (incertezas críticas)

1. **Polymarket CLOB price-history fidelity em resolved markets:** Issue #216 reporta granularidade ≥12h. Se confirmado em scale, baseline T-1h vira T-12h e enfraquece o teste (mid 12h antes captura menos do consensus final).
2. **Kalshi API key approval:** Pode levar dias se conta nova; rate limits em tier free desconhecidos sem live testing.
3. **Subgraph completeness pra mercados antigos:** Polymarket migrou de UMA-CTF v1 → v2; subgraph cobre ambos? Mercados pré-2023 podem ter gaps.
4. **NOAA station mapping pra weather markets:** Cada market PM/Kalshi precisa mapeamento manual estação → climatology. ~30-50 mappings esperados; se for 200+, cresce escopo.
5. **Sports vertical é heterogêneo:** NBA/NFL/MLB tem mercados de eficiência ENORMEMENTE diferente. Brier agregado pode mascarar edge em nicho.
6. **Survivorship bias residual:** Mesmo carregando "todos qualifying", PM API talvez já tenha removido markets cancelados antes de indexar. Documentar.

### 6.2 Backup plans

| Risco | Backup |
|---|---|
| Polymarket subgraph capa depth ≤6m | Usar dataset `jon-becker/prediction-market-analysis` GitHub |
| Kalshi API key demora > 5 dias | Phase 1 só com PM; Kalshi vira Phase 1.5 |
| CLOB price-history 12h granularidade | Aceitar baseline T-12h, flagar limitação no relatório final |
| NOAA station mapping >200 manual | Limitar weather a 5-10 cidades top-volume (NYC, LAX, CHI, DFW, MIA) |
| N < 100 em finance mesmo com 12m | Reportar Brier mas excluir de gate — flagar como "insufficient power" |

### 6.3 Data leak vigilance

**Mais perigoso:** Re-using anything que veio depois do entry timestamp.
- ✅ Use `volume_at_entry`, não `volume_total_lifetime`
- ✅ Use `price_at_entry` apenas pra signal; baseline é price_at_T-1h (calculado separadamente)
- ✅ News context: usar `news_published_before(entry_ts)` apenas
- ❌ NUNCA usar resolution outcome em feature engineering

---

## 7. Effort Estimate

### Phase 1 — Data Ingest (preparar tudo, sem analisar)
| Task | Hours |
|---|---|
| Setup Polymarket subgraph client + The Graph API key | 2h |
| Pull Gamma `/markets?closed=true` 6m → SQLite local | 3h |
| Pull subgraph trades pra cada market qualifying → SQLite | 6h (paginação 100k limit) |
| Setup Kalshi API key + auth signing | 2h (após user decisão #1) |
| Pull Kalshi `/historical/markets` 6m → SQLite | 4h |
| Setup NOAA GHCN ingestion AWS S3 → parquet local | 4h |
| Compute climatology baseline por (station, doy) | 3h |
| **Phase 1 subtotal** | **~24h (3 dias úteis)** |

### Phase 2 — Brier Compute + Gate Evaluation
| Task | Hours |
|---|---|
| Implementar `compute_brier_per_vertical(forecasts, outcomes, baselines)` | 2h |
| Bootstrap CI + shuffle test | 2h |
| Calibration plot (10 buckets) | 2h |
| Profit factor sim com fees realistas | 4h |
| Survivorship report | 1h |
| Run gate evaluation + draft Go/No-Go report | 3h |
| **Phase 2 subtotal** | **~14h (2 dias úteis)** |

### Phase 3 — Decisão
| Task | Hours |
|---|---|
| Apresentar ao user: gate result + edge cases + recomendação | 2h |
| Iterar (re-run com filtros ajustados se gate ambíguo) | até 8h |
| **Phase 3 subtotal** | **2-10h** |

**Total até Go/No-Go decision: 5-7 dias úteis (sem bloqueios externos).**

**Bloqueios externos a contornar antes:**
- Kalshi API key approval — 1-3 dias após submit
- The Graph API key — instantâneo
- NOAA dataset download — 4-8h primeira vez, depois cached

---

## 8. Sumário das Decisões PENDING USER

| # | Decisão | Impacto se "skip" |
|---|---|---|
| **#1** | Criar conta Kalshi + API key? | Skip = backtest só Polymarket; ~50% redução em politics+finance volume; sports/weather menos afetado |
| **#2** | Sports vertical: only major (NBA/NFL/MLB) ou incluir college/minor? | Major-only = N menor mas calibration mais limpa; including-all = N maior mas signal pode diluir |
| **#3** | Confirmar fees atuais PM (0.10% vs 2%) e Kalshi (formula vs 1%)? | Errado = profit factor inflado/deflado, gate G3 vira gambá |
| **#4** | Janela histórica: 6m, 12m, ou max disponível? | 6m = ~24h ingest; 12m = ~36h ingest mas N maior em finance |
| **#5** | Aceitar baseline T-12h em PM se CLOB API limitar? | Aceitar = teste menos duro mas factível; rejeitar = forçar subgraph reconstruction (+12h dev) |
| **#6** | Stop-loss criteria explícito: NO-GO em quantos verticais? | Default proposto: NO-GO se 0 verticais passam G2; GO PARCIAL se ≥1 passa |

---

## 9. Apêndice — Fontes verificadas nesta sessão

- Polymarket Gamma API — https://gamma-api.polymarket.com (confirmado via web search)
- Polymarket CLOB `/prices-history` — https://docs.polymarket.com/developers/CLOB/timeseries (confirmado: limitação 12h em resolved markets, py-clob-client issue #216)
- Polymarket Subgraph — https://gateway.thegraph.com/api/{key}/subgraphs/id/Bx1W4S7kDVxs9gC3s2G6DS8kdNBJNVhMviCtin2DiBp
- Kalshi REST — https://api.elections.kalshi.com/trade-api/v2 (auth obrigatória)
- Kalshi `/historical/markets` — https://docs.kalshi.com/api-reference/historical/get-historical-markets
- NOAA GHCN-Daily — https://www.ncei.noaa.gov/products/land-based-station/global-historical-climatology-network-daily
- NOAA 1991-2020 Climate Normals — https://www.ncei.noaa.gov/pub/data/cdo/documentation/normals-daily-1991-2020_documentation.pdf
- AWS Open Data NOAA mirror — https://registry.opendata.aws/noaa-ghcn/
- KB local Brier — `D:/jarvis/mega brain/knowledge/prediction-markets/strategies/brier-calibration.md`
- KB local Backtesting — `D:/jarvis/mega brain/knowledge/prediction-markets/strategies/adv-backtesting-framework.md`

---

*Atlas, investigando a verdade — 2026-04-28*
