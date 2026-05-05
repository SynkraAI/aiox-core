# CONTEXT.md — Polymarket Trader

**Read FIRST when working on Polymarket bot.** Domain glossary + active state.
Last updated: 2026-05-05

---

## 1. One-line Identity

Bot autônomo de trade em Polymarket — pivot 27/Abr para mercados reais ≤7d (capital travado = morto). Backtest único PASS é vertical `weather` (PF 1.388–1.415). Deadline 19/Mai, kill criterion D+10 14/Mai PF<1.0.

---

## 2. Domain Glossary

| Term | Meaning | Notes |
|------|---------|-------|
| `PF` | Profit Factor | Métrica de sucesso. Threshold sobrevivência: PF≥1.0 |
| `Brier-elegível` | Mercados com volume + liquidez suficiente para Brier scoring | 7647 de 68k markets em 12m |
| `ACE` | Internal scoring engine | Override agora limita `minEdge` 0.08→2 |
| `edge` | Diferença entre estimativa do bot e preço de mercado | Patch 04/Mai força minEdge=2 |
| `heuristic-fallback gate` | Auto-trader linha 324 — gate adicional antes de signal | Patch 04/Mai habilita pra weather-only |
| `mid-price` | Baseline trivial — comprar pelo preço médio | Politics/sports/finance EMPATAM com mid-price = sem edge |
| `synth markets` | Mercados sintéticos (capital travado long-horizon) | DELETADOS no pivot 27/Abr (-200 LOC) |
| `MarketSelector` | Módulo puro pós-pivot — só mercados reais ≤7d | Substituiu synth |
| `PM-PIVOT-1` | Story do pivot 27/Abr | Ready for QA |
| `BACKTEST-1` | Story de backtest 12m | Phase 0+1+2 Tier 1 entregues |
| `Tier 2 LLM` | Re-scoring via LLM | Bloqueado: squad org limit |
| `weather vertical` | Único PASS no backtest | PF 1.388 (Phase 1) → 1.415 (Phase 2 weather-only) |
| `kill criterion` | Threshold pra desligar bot | D+10 (14/Mai) PF<1.0 |

---

## 3. Verticals (Polymarket categories)

| Code | Backtest verdict | Notes |
|------|-----------------|-------|
| weather | ✅ PASS — único | PF 1.388–1.415 |
| politics | ❌ Empata mid-price | Sem edge |
| sports | ❌ Empata mid-price | Sem edge |
| finance | ❌ Empata mid-price | Sem edge |
| crypto | ❓ Pendente (orion autorizado autônomo) | Re-ingest+replay autônomo |

**Configs ativos:**
- `PM_CATEGORIES=weather`
- `enabledVerticals=['weather']`

---

## 4. Stack & Key Files

| Layer | Tech | Notes |
|-------|------|-------|
| Bot | Node.js | PID 1488 LIVE |
| Process supervisor | NSSM + watchdog + budget cap | Implementado em PM-PIVOT-1 |
| Backtest | Custom harness | 68k markets, 7647 Brier-elegíveis |
| Storage | Local | Runbook morning: `docs/projects/polymarket-trader/BACKTEST-MORNING-RUNBOOK.md` |

**Key files:**
- `auto-trader:324` — heuristic-fallback gate (patch)
- `auto-trader:481` — ACE override minEdge (patch)

---

## 5. Active People & Roles

| Person | Role | Notes |
|--------|------|-------|
| Breno | Owner / decisor | Aprovou pivot real-only |
| @aios-dev | Implementação | Deletou synth, criou MarketSelector |
| @analyst | Backtest analysis | Atlas/Dara/Dex entregaram Tier 1 |

---

## 6. Tracking / Pixels / IDs

N/A (não é projeto de marketing — é trading bot)

| System | ID | Notes |
|--------|----|----|
| Process PID | `1488` | LIVE |
| Branch / commit | patches NÃO commitados ainda | 4 patches 04/Mai |

---

## 7. Constraints & Non-Negotiables

- ❌ **Capital travado = morto** — só mercados reais ≤7d (regra do pivot)
- ❌ **NÃO entrar em politics/sports/finance** — empatam com mid-price
- ✅ **Kill criterion respeitado** — se D+10 PF<1.0, desligar
- ✅ **Patches atuais bloqueiam vertical-leak** — `enabledVerticals=['weather']`

---

## 8. Known Dead Ends

- ❌ **Synth markets (capital travado long-horizon)** — pivot 27/Abr deletou. Ver `.out-of-scope/polymarket-synth-markets.md`
- ❌ **Politics/sports/finance verticals** — backtest 12m empatou com mid-price. Ver `.out-of-scope/polymarket-non-weather-verticals.md`
- ❌ **Tier 2 LLM re-scoring** — squad org limit bloqueou (29/Abr)

---

## 9. Current State Snapshot

**Last updated:** 2026-05-05
**Status:** 🟡 LIVE PID 1488, 9 signals em 6 scans pós-fix, ~15 trades/dia esperado
**Patches NÃO commitados** (4 fixes 04/Mai):
1. `PM_CATEGORIES=weather` env
2. `enabledVerticals=['weather']`
3. heuristic-fallback gate `auto-trader:324`
4. ACE override `auto-trader:481` minEdge 0.08→2

**Deadline / kill:**
- 14/Mai (D+10): kill se PF<1.0
- 19/Mai: deadline final

**Triggers úteis:**
- "status polymarket"
- "kill polymarket"
- "extend deadline polymarket"
- "commit polymarket"

---

## 10. Cross-References

- Backtest scoping: `docs/projects/polymarket-trader/BACKTEST-1-scoping.md`
- Morning runbook: `docs/projects/polymarket-trader/BACKTEST-MORNING-RUNBOOK.md`
- Research audit: `docs/projects/polymarket-trader/RESEARCH-INTELLIGENCE-AUDIT-2026-04-07.md`
- Ultraplan v2 overhaul: `docs/projects/polymarket-trader/ULTRAPLAN-v2-intelligence-overhaul.md`
- MEMORY keys: `session_polymarket_*`
- Mind clones: domer-polymarket, theo-polymarket, gcr-crypto
