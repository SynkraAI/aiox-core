# Story PM-PIVOT-1: Pivot Real-Only ≤7d (delete synth + supervisor + heartbeat)

## Status
QA: CONCERNS (1 follow-up Risk 2 — não-bloqueador)

## QA Gate Decision (27/Abr, Quinn)

**4/5 PASS, 1 CONCERNS:**
- ✅ Risk 1 — paper-review filter synth: PASS (`paper-review.ts:24-32` + test cobertura)
- ⚠️ Risk 2 — atomic write: CONCERNS (`market-analyzer.ts:339-348` — `writeFileSync` direto sem temp+rename. `load():314-326` tem `catch {}` silent → reseta budget para 0 sem warn em corruption)
- ✅ Risk 3 — heartbeat timing: PASS (`auto-trader.ts:367-374`, dentro de `finally` block, escrito DEPOIS do scan completar)
- ✅ Cleanup-stale CLI: PASS (lista + preview + confirma + backup ANTES + aborta limpo)
- ✅ 4 pre-existing test failures em `cross-platform-arb.test.ts` confirmados não-relacionados (PM-PIVOT-1 não tocou no arquivo)

**Follow-ups obrigatórios pós-merge (NÃO bloqueiam religar bot):**
1. `OpenAIBudgetTracker.persist()`: write-temp-then-rename para atomicidade
2. `OpenAIBudgetTracker.load()` catch: warn explícito (substituir `catch {}`)
3. (Opcional) `eventBus.emit('budget:state-corrupt', ...)` para watchdog observar

## Executor Assignment
executor: "@dev"
quality_gate: "@qa"
quality_gate_tools: ["vitest", "tsc --noEmit", "eslint"]

## Story
**As a** operator do bot Polymarket Trader,
**I want** deletar synth crypto, simplificar lógica de seleção, adicionar supervisor + heartbeat + OpenAI budget cap,
**so that** bot execute APENAS mercados reais Polymarket/Kalshi com resolução ≤7d e nunca mais morra silenciosamente.

## Contexto (Conclave 27/Abr)

**Verdade descoberta (auditoria):**
- 1.150 trades em DB. **95.5% synthetic crypto** (bot inventa "Will BTC < $X em 24h", resolve com Binance — placebo).
- Pós-religar 24/Abr: 100% synth, ZERO Polymarket/Kalshi reais.
- WR 89% pré-refactor é viés direcional (BTC pump 71→84k em 5d), não skill.

**Causa-raiz do bias 100% synth:**
- `auto-trader.ts:362-381` faz balance 30/70 ✅
- `auto-trader.ts:384-391` sort "short-term first ≤14d" → synth (12-48h) sempre vence reais (60d+)
- `market-analyzer.ts:309-323` re-sorta + slice top-30 → LLM batch = 100% synth

**Decisão do user (regra inegociável):**
> "Esforço ≤ ganho POR TRADE. Capital travado 4 meses = capital morto. Velocidade de capital > absolute return."

**Conclave verdict (chip-huyen + andrew-ng + guillermo-rauch):**
- **Rauch (winner em arquitetura):** root cause é synth EXISTIR, não estar mal balanceado. **Delete synth entirely.** -200 LOC, +20 linhas teste.
- **Ng:** supervisor inegociável (NSSM Windows Service + heartbeat + budget cap) ANTES de qualquer outra coisa.
- **Chip:** Fase 2 (backtest histórico) é o stop-loss da decisão. Métrica única: Brier score vs market baseline.

## Acceptance Criteria

### Fase 0 — Supervisor + Heartbeat + Budget Cap (3-4h)

1. **Heartbeat file**: `apps/polymarket-trader/data/heartbeat.json` reescrito a cada scan com:
   ```json
   {"ts": <epoch_ms>, "scanCount": <n>, "eligibleReal": <n>, "signals": <n>, "lastTradeTs": <epoch_ms|null>}
   ```
2. **Watchdog**: `apps/polymarket-trader/scripts/watchdog.ps1` (PowerShell)
   - Lê `data/heartbeat.json`
   - Se `now - ts > 10*60*1000`, dispara Telegram via `TELEGRAM_BOT_TOKEN` (já no .env)
   - Mensagem: `"⚠️ Polymarket bot offline há {N} min. Last scan: {n}, last trade: {ts}"`
3. **Windows Task Scheduler setup**: `apps/polymarket-trader/scripts/install-watchdog-task.bat`
   - Registra task que roda watchdog.ps1 a cada 5min
   - Documentação em `apps/polymarket-trader/playbooks/supervisor.md`
4. **NSSM service** (opcional, melhor que Startup folder):
   - `apps/polymarket-trader/playbooks/nssm-install.md` com instruções manuais (requer admin)
   - `apps/polymarket-trader/scripts/install-nssm-service.bat` que automatiza se NSSM estiver no PATH
5. **OpenAI budget cap**:
   - `apps/polymarket-trader/src/intelligence/market-analyzer.ts`: track `dailySpend`, reset à meia-noite local
   - Se `dailySpend >= OPENAI_DAILY_BUDGET_USD`, log warning + pause LLM (fallback heurística)
   - `.env`: `OPENAI_DAILY_BUDGET_USD=5`
6. **Não religar bot.** Apenas código pronto.

### Fase 1 — Delete synth + simplification (~1d)

7. **Delete crypto synth**:
   - `apps/polymarket-trader/src/integrations/crypto-price-client.ts` → DELETE (git history mantém)
   - `apps/polymarket-trader/src/index.ts` → remove import + bootstrap
   - `apps/polymarket-trader/src/engine/auto-trader.ts`:
     - Remove `cryptoClient` field, getter, fetch (linhas ~313-320)
     - Remove block split 30/70 (~362-395)
     - Remove sort short-term (~384-391)
     - Remove `synthWeight` config (interface + uso)
     - Remove resolveSyntheticPositions (~201) — manter stale positions; user decide o que fazer
8. **`MarketSelector` puro**:
   - `apps/polymarket-trader/src/engine/market-selector.ts` (NOVO, ~30 linhas)
   - Função `selectMarkets(markets, opts)` onde `opts = {maxResolutionHours, minLiquidity, batchLimit}`
   - Filter: source ∈ {polymarket, kalshi} + endDate definido + `now < endDate ≤ maxResolutionHours` + `liquidity >= minLiquidity`
   - Sort: `volume * liquidity` DESC
   - Slice: `.slice(0, batchLimit)`
9. **Replace sort em auto-trader.ts:384-391** + **market-analyzer.ts:314-321** com `selectMarkets()`
10. **`.env` updates**:
    - `MAX_RESOLUTION_HOURS=168` (era 720)
    - `LLM_BATCH_SIZE=5` (era hardcoded em market-analyzer.ts:518 — externalize)
    - `OPENAI_DAILY_BUDGET_USD=5` (novo)
    - **Remove**: `SYNTH_WEIGHT=0.3` (synth deletado)
11. **Tag de trades**: `paper-trader.ts::executePaperTrade` continua usando `source:real|synth` (synth não vai mais existir, mas tag fica como contrato)
12. **Cleanup**: 35 stale positions de 9/Abr em `open-positions.json`. Não auto-clean — user decide. Adicionar comando CLI `pm-trader cleanup-stale` que lista + pede confirmação.

### Quality Gates

13. `npm run typecheck` → 0 erros
14. `npm test` → todos passing
15. `npm run lint` → 0 erros
16. **Tests novos** em `tests/market-selector.test.ts`:
    - 5 cenários: empty input, all eligible, mixed real+real-old (>168h), endDate=null filtered, endDate>168h filtered
17. **Tests novos** em `tests/budget-cap.test.ts`:
    - 3 cenários: under budget OK, over budget pause, midnight reset

## Tasks / Subtasks

- [x] **Task 1 — Fase 0 Supervisor** (AC: 1, 2, 3, 4)
  - [x] 1.1 Heartbeat write em `auto-trader.ts::scanAndTrade()` after each scan
  - [x] 1.2 `scripts/watchdog.ps1` PowerShell + Telegram webhook
  - [x] 1.3 `scripts/install-watchdog-task.bat` Windows Task Scheduler 5min
  - [x] 1.4 `playbooks/supervisor.md` (atualizou — Option C: NSSM + Watchdog combo)
  - [x] 1.5 `playbooks/nssm-install.md` (instruções admin completas)
  - [x] 1.6 `scripts/install-nssm-service.bat` (auto se NSSM no PATH, com fallback)

- [x] **Task 2 — Fase 0 Budget Cap** (AC: 5)
  - [x] 2.1 Track `dailySpend` em `OpenAIBudgetTracker` (persistido em `data/llm-budget.json`)
  - [x] 2.2 `isPaused()` → true quando `dailySpend >= OPENAI_DAILY_BUDGET_USD` → MarketAnalyzer.callLLM retorna null → fallback heurística
  - [x] 2.3 Warnings legacy `BudgetController` em 80% e 100% (mantido para observabilidade)
  - [x] 2.4 `.env`: add `OPENAI_DAILY_BUDGET_USD=5` (prioridade sobre `LLM_DAILY_BUDGET`)

- [x] **Task 3 — Fase 1 Delete synth** (AC: 7)
  - [x] 3.1 Delete `crypto-price-client.ts`
  - [x] 3.2 Remove import + bootstrap em `src/index.ts`
  - [x] 3.3 Remove `cryptoClient` field/setter/fetch em `auto-trader.ts`
  - [x] 3.4 Remove balance 30/70 block (substituído por selectMarkets puro)
  - [x] 3.5 Remove sort short-term (substituído por sort volume×liquidity)
  - [x] 3.6 Remove `synthWeight` config + interface
  - [x] 3.7 Remove `resolveSyntheticPositions` (paper-trader continua tendo branch synth-* legacy)

- [x] **Task 4 — Fase 1 MarketSelector** (AC: 8, 9)
  - [x] 4.1 Criar `src/engine/market-selector.ts` com `selectMarkets()` puro (~80 linhas com types)
  - [x] 4.2 Replace sort em `auto-trader.ts::scanAndTrade()`
  - [x] 4.3 Replace sort em `market-analyzer.ts::preFilter()` (delega para selectMarkets)

- [x] **Task 5 — Fase 1 .env + cleanup** (AC: 10, 11, 12)
  - [x] 5.1 `.env` updates: MAX_RESOLUTION_HOURS=168, LLM_BATCH_SIZE=5, OPENAI_DAILY_BUDGET_USD=5
  - [x] 5.2 Remove SYNTH_WEIGHT
  - [x] 5.3 Add CLI command `pm-trader cleanup-stale [--yes]` (lista stale, faz backup, remove)

- [x] **Task 6 — Tests** (AC: 16, 17)
  - [x] 6.1 `tests/market-selector.test.ts` — 14 cenários (story pediu 5, fixture já tinha 14 abrangentes)
  - [x] 6.2 `tests/budget-cap.test.ts` — 12 cenários (story pediu 3, fixture já tinha 12 abrangentes)
  - [x] 6.3 `tests/crypto-price-client.test.ts` removido; `tests/paper-review-source-filter.test.ts` extraído (preserva PaperTradingReviewer realOnly test)

- [x] **Task 7 — Quality gates** (AC: 13, 14, 15)
  - [x] 7.1 `npm run typecheck` → 0 erros
  - [x] 7.2 `npm test` → 924 passing / 4 failing (cross-platform-arb pre-existente, NÃO dos arquivos PM-PIVOT-1)
  - [x] 7.3 `npm run lint` → 0 NEW errors nos arquivos novos. Pre-existing baseline (~511 errors) é repo-wide eslint config issue (process/console/fetch undefined globals) — NÃO causado por PM-PIVOT-1.

## Dev Agent Record

### Decisões autônomas

1. **`OpenAIBudgetTracker` separado de `BudgetController`** (AUTO-DECISION)
   - Test file `budget-cap.test.ts` já existia com API contract específica (`{ thresholdUsd, statePath, clock }`, `load()`, `recordSpend()`, `isPaused()`).
   - `BudgetController` legacy tem API diferente (token-based) e é chamado em vários lugares.
   - Decisão: criar `OpenAIBudgetTracker` novo, manter `BudgetController` legacy. Análise hooka ambos em `callLLM`.
   - Razão: respeitar contrato de teste pré-existente sem quebrar dependências.

2. **`detectSource()` em market-selector — aceita anything-not-prefixed como Polymarket** (AUTO-DECISION)
   - Inicialmente exigia regex numérico ou `0x` para Polymarket, mas test fixtures usam `poly-real-1`, `good-1`.
   - Decisão: relaxar — apenas `kalshi:` e `synth-` são prefixos especiais; resto = Polymarket.
   - Razão: alinha com test contract real e com legacy data shape.

3. **Test helper `makeMarket()` em market-selector.test.ts** (AUTO-FIX)
   - Helper usava `??` que clobberava `null` endDate explícito.
   - Mudei para `'endDate' in overrides` check para preservar null/undefined.
   - Razão: teste estava lógicamente impossível com helper original.

4. **`tests/paper-review-source-filter.test.ts` criado** (AUTO-DECISION)
   - O `crypto-price-client.test.ts` deletado tinha um teste para `PaperTradingReviewer.realOnly` que NÃO depende de synth.
   - Decisão: extrair esse teste para arquivo próprio antes de deletar.
   - Razão: preservar cobertura de filtro real-only (relevante a PM-PIVOT-1).

5. **`paper-trader.ts` mantém branch resolver synth (não modificado)** — conforme constraint da story; legacy positions ainda em open-positions.json.

### Pre-existing failures (NÃO causados por PM-PIVOT-1)

- `tests/cross-platform-arb.test.ts` — 4 failures (intra-market arb detection); confirmado falhar tb em HEAD via `git stash`.
- Lint baseline `~511 errors` repo-wide: `no-undef` para `process`, `console`, `fetch`, `AbortSignal`, `Response`. Eslint config faltando node/browser env. Não é regressão de PM-PIVOT-1.

### Constraint cumprida: bot NÃO foi religado.

### Deploy 30/Abr (Dex — heuristic-only paper mode, all 5 verticals)

**Trigger**: BACKTEST-3 TIER2 verdict = STOP (Haiku 4.5 piora forecasts vs heurística em 4/5 verticais). User decisão: rodar heurística pura, todos verticais, paper mode, observar 30d.

**Mudanças mínimas**:
1. `src/intelligence/market-analyzer.ts:initialize()` — early-return `provider='none'` quando `DISABLE_LLM=true|1`. Backtest scripts (`replay-llm.ts`) usam SDK direto, não passam por essa initialize, então não afetados.
2. `.env` — adicionado `DISABLE_LLM=true` (preserva `LLM_PROVIDER=anthropic` + `ANTHROPIC_*` para backtest).

**Verificações pre-deploy** (Dex):
- `tsc --noEmit` → 0 errors
- `vitest run` → 963 passed / 4 failed (mesmas 4 baselines em `cross-platform-arb.test.ts` — confirmado pré-existente em HEAD pré-edit)
- DNS sanity: `node scripts/test-dns.ts` → HTTP 200, mercados reais retornados (undici dispatcher 1.1.1.1 ok)
- `data/trades.db` é JSON (ExperienceStore) — 467 open positions restored from disk

**Runtime status** (5min smoke):
- Bot launched via `scripts/start-bot.bat` (NSSM not installed; UAC elevation prompt cancelled in autonomous shell — NSSM service install é follow-up manual)
- PID 23032 alive desde 14:22:55 BRT
- LLM kill-switch confirmado em log: `[MarketAnalyzer] DISABLE_LLM=true — runtime LLM disabled, falling back to heuristic-only mode`
- 7 scans em ~4min, 0 errors em `bot-error.log`
- Heartbeat updating (~30s)
- 7/7 verticals enabled (weather, crypto, politics, sports, pop_culture, finance, science)
- Real-only mode: `🌐 Polymarket + Kalshi (synth deletado)`
- 0 eligible ≤168h markets em 7 scans — esperado: amostragem `gamma-api/markets?active=true&limit=50` mostrou 42/50 com endDate >7d, 8/50 já expirados, 0/50 dentro de 7d. Distribuição PM é dominada por horizon longo (politics 2028 etc.). Bot rotaciona offset, vai descobrir mercados curtos ao varrer.
- Watchdog Task Scheduler instalado (`PolymarketBotWatchdog`, /MO 5)

**Follow-ups pós-deploy**:
- NSSM install manual (admin shell): `scripts/install-nssm-service.bat` — autonomous shell não pode aceitar UAC
- Watchdog `$PSScriptRoot` empty bug quando invocado via `-File` — workaround: task usa `-AppRoot` explicit
- 5min observation window confirmou bot estável; user pode monitorar via `tail -f data/bot.log`

## Dev Notes

### Constraints
- **NÃO religue o bot.** Apenas código pronto.
- **NÃO delete** `trades.db`, `open-positions.json` (legacy histórica para auditoria).
- 35 stale positions de 9/Abr ficam intactas — user decide cleanup via novo comando CLI.
- Mantém 1-line comment com motivo de cada deleção: `// PM-PIVOT-1: synth deletado, usar Polymarket/Kalshi real`.

### Fase 2 (FORA do escopo desta story)
Backtest harness 6 meses Polymarket subgraph + Kalshi REST + NOAA GHCN. Brier score vs market baseline. Nova story `PM-PIVOT-2` quando Fase 0+1 estiver merged.

### Fontes
- Conclave: chip-huyen, andrew-ng, guillermo-rauch (27/Abr)
- 5 análises prévias: aria, quinn, alex, damodaran, domer
- Memory: `C:/Users/kingp/.claude/projects/D--AIOS/memory/project_polymarket_trader.md`
- Prior story: `docs/stories/polymarket-hybrid-refactor.md` (P1-P5, 16/Abr)

## Risk Section

1. **Synth deletion quebra resolveOpenPositions**: `paper-trader.ts` tem branch para `marketId.startsWith('synth-')` que já não terá mais novos casos, mas posições antigas ainda existem em `open-positions.json`. **Mitigação**: manter o branch resolver synth no paper-trader (só não cria mais novos), ou skip synth na resolução e deixar pending eterno (35 já estão assim).
2. **OpenAI budget cap timing**: `dailySpend` precisa ser persistido para sobreviver restart. **Mitigação**: salvar em `data/llm-budget.json`, restaurar ao boot.
3. **Telegram webhook silenciar**: se TELEGRAM_BOT_TOKEN expirar ou rate-limit, watchdog falha silenciosa. **Mitigação**: watchdog também escreve `data/watchdog.log` com timestamp da última execução, segundo nível de monitoramento via `tail -f`.
4. **NSSM requer admin**: muitos users não têm PowerShell elevated. **Mitigação**: documentar fallback Startup folder (mesmo que pior, é o que já funciona).
5. **`endDate=null` em Polymarket**: alguns markets reais legitimos não têm endDate (ex: "Will Trump win 2028 election?"). Filtro estrito remove esses. **Mitigação**: aceito — esses são exatamente os de longo horizonte que queremos evitar (capital morto).

## Change Log

| Date       | Version | Description                                | Author      |
|------------|---------|--------------------------------------------|-------------|
| 2026-04-27 | 1.0     | Story criada por Orion pós-conclave        | @aios-master|
