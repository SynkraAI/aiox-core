# UltraPlan v2: Polymarket Intelligence Overhaul

> **Project:** polymarket-trader  
> **Date:** 2026-04-07  
> **Status:** PENDING APPROVAL  
> **Conclave ID:** 583dbb30-57a7-4187-9133-fe2b5222f218  
> **Experts Consulted:** chip-huyen, bruce-schneier, guillermo-rauch, aswath-damodaran, andrew-ng  
> **Supersedes:** ULTRAPLAN.md (2026-04-03) — Phase 0-3 construiram o demo, este plano transforma em sistema real

---

## Executive Summary

O bot atual e um demo funcional: 8 estrategias sem edge real, learning desconectado, execution dummy, 57k sinais que sao ruido. Este UltraPlan transforma o bot em sistema inteligente em **5 fases incrementais** com gates de validacao entre cada uma. A mudanca fundamental: **o bot passa a PENSAR (LLM), LEMBRAR (Experience Store ativo), VER (dados reais), e EXECUTAR (maker-first)**.

Estimativa: **15 dias dev**, custo operacional **~$5-10/dia** (LLM calls), edge alvo **2-4% net of fees**.

---

## Expert Conclave Synthesis

### CONSENSUS (Todos concordam)

1. **Evaluation ANTES de inteligencia** (chip-huyen, andrew-ng): Construir harness de backtesting com dados historicos reais ANTES de adicionar LLM. Sem baseline, nao saberemos se melhorou.

2. **LLM como FILTRO, nao oracle** (chip-huyen, andrew-ng, guillermo-rauch): LLM analisa top 10-20 candidatos pre-filtrados, NAO todos os mercados. Custo: ~$2-5/dia com Haiku para screening + Sonnet para top 5.

3. **Fewer verticals, deeper** (todos): Maximo 2 verticals ate provar profitabilidade. Weather e o beachhead (edge matematica comprovavel). Segundo vertical so apos Weather Brier < 0.20.

4. **Kelly 5%, nao 15%** (aswath-damodaran): 15% e para sistemas maduros com 500+ trades positivos. Bot e startup — comecar conservador (Kelly 5%), escalar com evidencia.

5. **Ship incrementally, nao rebuild** (guillermo-rauch): Modular architecture ja e boa. Fixar dados, conectar learning, adicionar LLM, melhorar execution — nessa ordem.

### DISSENT (Divergencias)

| Ponto | Posicao A | Posicao B | Veredicto |
|-------|-----------|-----------|-----------|
| LLM modelo | andrew-ng: Haiku para tudo, so upgrade com 5k+ labels | guillermo-rauch: Haiku screen + Sonnet final | **Haiku-first para todas as calls. Sonnet so em Fase 4 quando tiver dados de calibracao** |
| Segundo vertical | chip-huyen: Crypto (volume) | damodaran: Niche science (menos competicao) | **Crypto — volume necessario para acumular dados de learning mais rapido. Mas com implied vol real (Deribit), nao hardcoded** |
| Maker vs Taker | bruce-schneier: Maker expoe estrategia (info leak) | guillermo-rauch: Maker salva 1.56% fees | **Maker para posicoes > $20, taker para urgentes < $20. Fee savings > info leak risk neste volume** |
| Rebuild strategies | chip-huyen: Deletar 7 das 8 | guillermo-rauch: Nao deletar, desabilitar | **Desabilitar 6, manter Weather + Crypto. Reabilitar outras quando tiverem dados reais** |

### BLIND SPOTS IDENTIFICADOS

1. **Calibracao do LLM** (andrew-ng): LLMs tendem a ser overconfident em probabilidades. Precisamos de calibration correction factor — se LLM diz 80% e outcome e 60%, aplicar fator.
2. **Prompt injection via market data** (bruce-schneier): Se LLM le news/tweets, adversarios podem craftar conteudo para manipular decisoes. Sanitizar inputs.
3. **Data poisoning do learning** (bruce-schneier): Se learning auto-ingere licoes sem validacao, mercados manipulados ensinam licoes erradas. Minimo 50 trades por licao.
4. **Opportunity cost do capital** (damodaran): Capital em posicoes abertas tem custo. Trade de $20 que resolve em 30 dias = capital preso. Incluir no calculo de edge.
5. **Survivorship bias** (damodaran): Os 8-12% edge reportados por AI agents tem viés extremo. Target realista: 2-3%.

### VERDICT

Transformacao incremental em 5 fases com gates de validacao. **Nao reconstruir** — conectar o que ja existe, adicionar inteligencia camada por camada. Ordem: Avaliar → Dados → Learning → LLM → Execution.

---

## Decisoes Arquiteturais (Delta do ULTRAPLAN v1)

### D11: Evaluation-First Development
**Decisao:** Construir backtesting harness com dados reais ANTES de qualquer mudanca.
**Racional:** chip-huyen: "Evaluation Before Everything." Sem baseline, nao sabemos se melhoramos.
**Como:** Download Jon-Becker dataset, replay 6 meses de weather, medir Brier score atual.

### D12: LLM como Filtro Agentico
**Decisao:** LLM recebe tools (getOrderBook, getNews, getSimilarTrades) e DECIDE que dados precisa.
**Racional:** guillermo-rauch: "Agentic analysis — much more effective than pre-computed features."
**Como:** Claude Haiku com tool_use. Structured output: `{ probability, confidence, reasoning, shouldTrade }`.

### D13: RAG-based Online Learning
**Decisao:** Nao retreinar LLM. Crescer conhecimento via retrieval de trades resolvidos.
**Racional:** andrew-ng: "Online learning without parameter updates — knowledge grows through context, not weights."
**Como:** Antes de cada trade, buscar top-5 trades similares resolvidos do Experience Store. Incluir como few-shot no prompt.

### D14: Kelly 5% (nao 15%)
**Decisao:** Comecar com Kelly fraction 5%. Escalar para 10% apos 200 trades lucrativos, 15% apos 500.
**Racional:** damodaran: "Bot e startup, nao firma madura. Size accordingly."

### D15: Maker-First Execution
**Decisao:** Limit orders primeiro (0% fee), fallback para taker apos timeout.
**Racional:** 1.56% taker fee = maior custo do sistema. Maker elimina isso.
**Risco:** bruce-schneier: info leak. Mitigacao: usar maker so para posicoes > $20.

### D16: 2 Verticals Max
**Decisao:** Weather (beachhead) + Crypto (volume). Desabilitar politics, sports, pop_culture, finance, science.
**Racional:** Consenso de todos experts. Profundidade > amplitude.

---

## Risk Matrix

| # | Risk | Prob | Impact | Score | Mitigation |
|---|------|------|--------|-------|------------|
| R1 | LLM hallucina probabilidades → trades com edge fantasma | 4 | 4 | **16** | Calibration tracking semanal. Correction factor. Ensemble LLM + quant model |
| R2 | Edge insuficiente para cobrir fees (2-4% drag total) | 4 | 5 | **20** | Paper trading 30d com metricas reais. Kill switch se EV < 0 por 7 dias |
| R3 | Prompt injection via news/tweets manipulados | 2 | 4 | **8** | Sanitizar inputs antes do LLM. Cross-validate com dados quantitativos |
| R4 | Learning system overfit em <500 trades | 3 | 4 | **12** | Minimo 50 trades por licao. Walk-forward validation. Train/test Brier gap < 0.05 |
| R5 | Custo LLM escala sem controle | 3 | 3 | **9** | Budget diario hard cap. Haiku-only ate provar ROI. Max 100 calls/dia |
| R6 | Wallet compromise | 2 | 5 | **10** | Encrypted keystore. Withdrawal whitelist. Max balance = bankroll |
| R7 | API Polymarket muda/quebra | 3 | 4 | **12** | Abstraction layer. Health check diario. Fallback para CLI oficial |
| R8 | Data poisoning do Experience Store | 2 | 3 | **6** | Minimo sample size. Peso decrescente. Nunca descartar baseline historico |
| R9 | Over-engineering / scope creep | 3 | 3 | **9** | Phase gates rigorosos. Gate review obrigatorio antes de proxima fase |
| R10 | Drift silencioso pos-go-live | 3 | 3 | **9** | Drift Monitor conectado. Brier alert se > 0.25. Auto-halt |

**Top 3 Riscos:** R2 (edge vs fees — existencial), R1 (LLM hallucination), R4 (overfitting learning)

---

## Implementation Blueprint

### Fase 0: Evaluation Harness (2 dias)
> Gate: Ter baseline Brier score para Weather e metricas de custo real

| # | Task | Esforco | Deps |
|---|------|---------|------|
| 0.1 | Download Jon-Becker dataset (resolved weather markets, 6 meses) | 0.5d | — |
| 0.2 | Criar script de backtesting: replay mercados resolvidos contra estrategia atual | 1d | 0.1 |
| 0.3 | Calcular baseline: Brier score, calibration plot, profit factor, custo real por trade | 0.5d | 0.2 |
| 0.4 | Documentar baseline em `data/evaluation/baseline-report.json` | — | 0.3 |

**Deliverable:** Baseline numerico: "Estrategia atual tem Brier X, profit factor Y, custo Z por trade"
**Gate:** Baseline documentado → prosseguir

---

### Fase 1: Dados Reais + Learning Ativo (3 dias)
> Gate: Experience Store consultado antes de cada trade, dados de weather com ensemble

| # | Task | Esforco | Deps |
|---|------|---------|------|
| 1.1 | **Wiring Experience Store no analyzeMarket()** — buscar top-5 trades similares antes de gerar sinal | 1d | Fase 0 |
| 1.2 | **Auto-lesson extraction** — apos trade resolvido, extrair licao via template (sem LLM ainda, pattern matching) | 0.5d | 1.1 |
| 1.3 | **Pattern blacklist** — se 3+ losses no mesmo pattern (vertical + strategy + price_range), auto-blacklist | 0.5d | 1.1 |
| 1.4 | **Weather ensemble** — adicionar ECMWF + GFS alem de Open-Meteo. Media ponderada dos 3 forecasts | 1d | — |
| 1.5 | **Crypto implied vol** — substituir hardcoded (0.60/0.80) por Deribit API (options implied vol, gratis) | 0.5d | — |
| 1.6 | **Event calendar** — parser de endDate + catalogo de eventos conhecidos para filtrar markets sem data | 0.5d | — |
| 1.7 | Desabilitar 6 strategies (manter so Weather + Crypto). Subir minEdge para 5% | — | — |
| 1.8 | Reduzir Kelly de 15% para 5% | — | — |

**Deliverable:** Bot trada com dados reais, consulta experiencia passada, aprende com outcomes
**Gate:** Rodar backtesting com Fase 1 changes → Brier score melhorou vs baseline?

---

### Fase 2: LLM-in-the-Loop (4 dias)
> Gate: LLM analisa top candidatos com structured output, calibration tracking ativo

| # | Task | Esforco | Deps |
|---|------|---------|------|
| 2.1 | **Market Analyzer service** — novo modulo `src/intelligence/market-analyzer.ts` | 0.5d | — |
| 2.2 | **Claude Haiku integration** — client para Anthropic API com structured output (tool_use) | 1d | 2.1 |
| 2.3 | **Agentic tools para LLM** — implementar tools que Claude pode chamar: | 1d | 2.2 |
|     | — `getOrderBook(marketId)`: profundidade do order book | | |
|     | — `getRecentNews(query, limit)`: headlines HYDRA + Google News | | |
|     | — `getSimilarTrades(question, vertical)`: top-5 do Experience Store | | |
|     | — `getMarketHistory(marketId)`: price history ultimas 24h | | |
|     | — `getWeatherForecast(city, date)`: ensemble forecast (Fase 1.4) | | |
|     | — `getCryptoData(asset)`: preco + implied vol + 24h momentum | | |
| 2.4 | **Analysis prompt template** com calibration anchors | 0.5d | 2.2 |
| 2.5 | **Pipeline integration**: pre-filter (top 20 by volume+liquidity) → LLM analyze (top 20) → signal (top 3-5 com shouldTrade=true) → risk check → execute | 0.5d | 2.1-2.4 |
| 2.6 | **Calibration tracker** — log cada (LLM probability, actual outcome). Calcular calibration curve semanal. Aplicar correction factor se bias > 5% | 0.5d | 2.5 |
| 2.7 | **Budget controller** — hard cap $10/dia em LLM calls. Fallback para heuristica se budget excedido | — | 2.2 |

**Prompt template (2.4):**
```
You are a prediction market analyst. Analyze this market and estimate the TRUE probability.

Market: {question}
Current YES price: {yesPrice} | NO price: {noPrice}
Volume: ${volume} | Liquidity: ${liquidity}
End date: {endDate} ({daysLeft} days)

You have tools available to research this market. Use them as needed.

CALIBRATION: When you say 70%, you should be correct ~70% of the time. 
Be precise. Markets are semi-efficient — your edge comes from information the market hasn't priced in yet.

Similar past trades from our experience:
{top5SimilarTrades}

Respond with JSON:
{
  "probability": 0.XX,        // Your true probability estimate for YES
  "confidence": "high|medium|low",
  "shouldTrade": true|false,  // Only true if you have information edge
  "edge": 0.XX,               // |your_prob - market_price|
  "reasoning": "...",         // 2-3 sentence reasoning chain
  "key_factors": ["..."],    // What data drove your estimate
  "risk_flags": ["..."]      // Anything that makes you uncertain
}
```

**Deliverable:** LLM analisa top 20 mercados/scan, gera sinais com reasoning chain
**Gate:** Backtesting LLM vs heuristica → Brier score do LLM < Brier heuristica?

---

### Fase 3: Execution Inteligente (3 dias)
> Gate: Maker-first execution funcionando, slippage real medido contra orderbook

| # | Task | Esforco | Deps |
|---|------|---------|------|
| 3.1 | **Orderbook-based slippage estimator** — calcular slippage real ANTES de tradar (walk the book) | 1d | — |
| 3.2 | **Maker-first execution** — limit order no orderbook, wait timeout (30s-2min), fallback taker se nao preencher | 1d | 3.1 |
| 3.3 | **Order splitting** — posicoes > $30 divididas em 2-3 tranches para reduzir impacto | 0.5d | 3.1 |
| 3.4 | **Execution quality tracker** — medir slippage real vs estimado, fill rate, time-to-fill | 0.5d | 3.2 |

**Deliverable:** Execution inteligente que economiza 1-1.5% em fees
**Gate:** Fill rate maker > 60%? Slippage real < 1%?

---

### Fase 4: Paper Trading Validacao (5 dias de execucao, 1 dia analise)
> Gate: 30 dias paper trading com todas as melhorias, Go/No-Go para live

| # | Task | Esforco | Deps |
|---|------|---------|------|
| 4.1 | Resetar Experience Store (limpar trades do demo anterior) | — | Fases 1-3 |
| 4.2 | Rodar bot 24/7 por 30 dias em paper mode com sistema completo | 30d clock | 4.1 |
| 4.3 | Monitorar diariamente: Brier, profit factor, calibration LLM, drift | ongoing | 4.2 |
| 4.4 | Report final: win rate, EV/trade, profit factor, Brier por vertical, calibration curve | 1d | 4.2 |
| 4.5 | Go/No-Go gate automatico | — | 4.4 |

**Go/No-Go Criteria:**
| Metrica | Threshold | Kill Switch |
|---------|-----------|-------------|
| Win rate | > 55% | < 45% por 7 dias |
| Profit factor | > 1.2 | < 0.8 |
| Brier score | < 0.22 | > 0.30 |
| EV/trade (net of fees) | > $0.50 | < -$0.50 |
| LLM calibration gap | < 5% | > 15% |
| Trades executados | > 200 | — |
| Drawdown max | < -15% | > -25% |

**Deliverable:** Relatorio estatistico com evidencia de edge (ou nao)
**Gate:** PASS → Fase 5 (live). FAIL → iterar Fases 1-3.

---

### Fase 5: Go-Live + Scale (3 dias + ongoing)
> Gate: Live trading com $500, metricas positivas por 14 dias

| # | Task | Esforco | Deps |
|---|------|---------|------|
| 5.1 | Wallet security audit (bruce-schneier recommendations) | 0.5d | — |
| 5.2 | Encrypted keystore + withdrawal whitelist | 0.5d | 5.1 |
| 5.3 | Live mode com $500 USDC, Kelly 5%, max $25/trade | 0.5d | 5.2 + Gate 4 PASS |
| 5.4 | Telegram alertas (trade, drawdown, daily P&L) | 0.5d | 5.3 |
| 5.5 | PM2 auto-restart + health monitor | 0.5d | 5.3 |
| 5.6 | Monitorar 14 dias live. Se metricas positivas: escalar para $1000 e Kelly 10% | ongoing | 5.3 |
| 5.7 | Avaliar adicao de 3o vertical (politics?) apos 30 dias live | — | 5.6 |

---

## Critical Path

```
[Fase 0: Eval Harness] ──2d──→ GATE: baseline documentado?
         │
         ▼
[Fase 1: Dados + Learning] ──3d──→ GATE: Brier melhorou vs baseline?
         │
         ▼
[Fase 2: LLM-in-the-Loop] ──4d──→ GATE: LLM Brier < heuristica Brier?
         │
         ▼
[Fase 3: Execution] ──3d──→ GATE: maker fill rate > 60%?
         │
         ▼
[Fase 4: Paper Trading 30d] ──30d──→ GATE: Go/No-Go criteria met?
         │
         ▼
[Fase 5: Live $500] ──ongoing──→ Scale com evidencia
```

**Tempo de dev:** ~12 dias (Fases 0-3)
**Tempo total ate live:** ~42 dias (12 dev + 30 paper)
**Blocking dependency:** Fase 0 (evaluation) bloqueia tudo. Sem baseline, nao sabemos se melhoramos.

---

## Custo Operacional Estimado

| Item | Custo/mes |
|------|-----------|
| Claude Haiku (100 calls/dia) | $3-8/mes |
| Deribit API | $0 (free tier) |
| ECMWF/GFS APIs | $0 (free tier) |
| HYDRA pipeline | $0 (ja existe) |
| Polymarket API | $0 |
| Infra (local execution) | $0 |
| **Total operacional** | **$3-8/mes** |
| Bankroll (capital) | $500 (one-time) |

---

## Metricas de Sucesso por Fase

| Fase | Metrica Primaria | Target |
|------|------------------|--------|
| 0 | Baseline Brier score documentado | Qualquer valor (e o ponto de referencia) |
| 1 | Brier score melhorou vs baseline | Delta > 0.02 |
| 2 | LLM Brier < heuristica Brier | Sim, em backtesting |
| 3 | Maker fill rate | > 60% |
| 4 | Profit factor (30d paper) | > 1.2 |
| 5 | P&L positivo (14d live) | > $0 net of fees |

---

## Squad para Execucao

| Agente | Responsabilidade | Fases |
|--------|-----------------|-------|
| @dev | Implementacao de todas as fases | 0-5 |
| @qa | Backtesting harness, Go/No-Go gate | 0, 4 |
| @analyst | Analise de dados, calibration review | 0, 4 |
| @devops | Wallet security, PM2, deployment | 5 |
| @architect | Review de integracao LLM, data flow | 2 |

**Mind Clones consultados e com input incorporado:**
- chip-huyen → Evaluation-first, LLM como filtro, calibration
- aswath-damodaran → Kelly 5%, narrative-first, niche markets
- andrew-ng → RAG-based learning, structured prompts, Brier metric
- bruce-schneier → Wallet security, prompt injection defense, data poisoning
- guillermo-rauch → Incremental shipping, agentic tools, PM2 deployment

---

## Contingency Plans

| Se... | Entao... |
|-------|----------|
| Fase 0 mostra Brier > 0.40 (estrategia horrivel) | Deletar strategies, comecar do zero com LLM-only approach |
| LLM nao melhora Brier vs heuristica | Manter LLM como advisory (nao blocking), focar em dados + execution |
| Paper trading EV < 0 apos 30d | Pivotar para market making puro (maker rebates, sem direcional) |
| Custo LLM escala acima de $20/dia | Reduzir calls para top 5 candidatos apenas, ou usar cache agressivo |
| Weather nao tem mercados suficientes | Adicionar crypto como primary antes do planejado |
| Go/No-Go FAIL 2x consecutivas | Reavaliar se prediction market trading e viavel para nosso sistema |
| Wallet comprometida | Emergency: transferir para cold wallet, rotacionar keys, audit completo |

---

## Validacao contra Constitution

| Artigo | Validacao | Status |
|--------|-----------|--------|
| I - CLI First | Todo o sistema funciona via CLI. LLM e chamado via API, nao UI | PASS |
| II - Agent Authority | @dev implementa, @qa valida, @devops deploya | PASS |
| III - Story-Driven | Cada fase gera story em docs/stories/ | PASS |
| IV - No Invention | Usa APIs existentes, datasets publicos, patterns comprovados | PASS |
| V - Quality First | Gates entre fases, Go/No-Go com metricas | PASS |
| VII - Componentize | Modulos independentes: intelligence, learning, execution | PASS |

---

## Diferenca vs ULTRAPLAN v1

| Aspecto | v1 (03/Abr) | v2 (07/Abr) |
|---------|-------------|-------------|
| Filosofia | Build completo em 8 semanas | Fix incremental com gates de validacao |
| Strategies | 8 strategies em stack | 2 strategies (Weather + Crypto), 6 desabilitadas |
| LLM | Nao mencionado | Core: LLM-in-the-Loop com agentic tools |
| Learning | "Layer 0" mas nunca conectado | Experience Store no loop de decisao + RAG |
| Kelly | 15% desde inicio | 5% → 10% → 15% com evidencia |
| Evaluation | Backtesting na Phase 1 | Evaluation PRIMEIRO (Fase 0) |
| Execution | Taker only | Maker-first com slippage real |
| Edge target | "60% win rate" | 2-4% net edge, profit factor > 1.2 |
| Custo | ~$0/mes | ~$5-10/mes (LLM calls) |
| Go/No-Go | Configurado, nao usado | 7 metricas com thresholds especificos |

---

*UltraPlan v2 generated by Orion (aios-master) | Conclave: 5 experts | 2026-04-07*  
*Constitution validated: CLI First (Art. I), Agent Authority (Art. II), Story-Driven (Art. III), Quality First (Art. V)*
