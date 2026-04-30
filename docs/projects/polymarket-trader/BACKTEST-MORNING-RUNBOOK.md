# Backtest — Runbook Manhã (29/Abr/2026)

**Para você ler quando acordar.**

## O que rodou de madrugada (timeline real)

### Round 1 (~01h-02h) — Crypto re-ingest FALHOU silenciosamente

- Patcheei classifier (`crypto` aceito) + schema CHECK (added 'crypto') + DB migration (preservou 65k markets).
- Re-rodei gamma+clob+unify+replay+report.
- **Bug oculto:** o Zod schema em `_lib.ts` ainda validava `vertical` enum SEM crypto. Resultado: `upsert failed for pm:1788807: invalid_enum_value, received: 'crypto'` em LOOP — Gamma processou 250k markets mas 0 crypto inseridos.
- TIER1-RESULTS.md gerado dessa rodada **NÃO tem crypto** (5760 markets, mesma tabela 4-vertical).

### Round 2 (~02h-03h+) — Fix Zod + re-pipeline completo

- Patch: `vertical: z.enum([..., 'crypto'])` em `scripts/backtest-ingest/_lib.ts:81`.
- Limpei checkpoints + re-disparei pipeline completo (gamma → clob → unify → replay → brier → report) em background sequencial.
- **DB intermediário (verificado 02h12):** crypto = 1742 markets e crescendo. Pipeline em andamento.

## O que vai estar no estado final (quando acordar)

1. **Crypto re-ingest COMPLETO** — gamma processa todos ~250k até HTTP 422 cap, agora com Zod aceitando.
2. **CLOB filtrado** hidrata baselines de crypto + outros novos volumes ≥$10k.
3. **Unify regenera INGEST-REPORT.md** com 5 verticais (crypto incluído).
4. **Replay heurístico re-roda** sobre todos 5 verticais.
5. **TIER1-RESULTS.md sobrescrito** com tabela 5-vertical.

## Onde checar resultado

| Arquivo | O que tem |
|---------|-----------|
| `apps/polymarket-trader/data/backtest/TIER1-RESULTS.md` | **Resultado final crypto vs baseline.** Olhar primeiro. |
| `apps/polymarket-trader/data/backtest/INGEST-REPORT.md` | Volume final por vertical (crypto tem N>100?) |
| `apps/polymarket-trader/data/backtest/.logs/crypto-ingest-*.log` | Log do re-ingest |
| `apps/polymarket-trader/data/backtest/.logs/replay-crypto-*.log` | Log do replay (REPLAY exit + BRIER exit + REPORT exit ao final) |

## Decisão pendente baseada no resultado

### Cenário A — Crypto PASS (Brier signal < baseline crypto, CI lower > 0)

- Bot expande: weather + crypto verticais aprovados
- Próximo passo: spawnar @dev pra adaptar `auto-trader.ts` ao MarketSelector real-only com weather + crypto filter
- Paper trading 30d antes de live
- Tier 2 LLM ($1,50) ainda vale rodar pra ver se LLM expande mais

### Cenário B — Crypto FAIL (empata ou pior que baseline)

- Confirmar tese de Damodaran: "mercados crypto também são eficientes em ≤7d"
- Manter weather-only (PF 1.388 confirmado)
- Re-considerar Tier 2 LLM ($1,50, ~2h) pra ver se LLM adiciona edge nos 4 verticais que falharam (politics/sports/finance/crypto)

### Cenário C — Crypto resultado misto (alguns subtipos sim, outros não)

- Improvável com a granularidade atual (vertical único, sem subtype)
- Mas se houver, documentar e decidir.

## O que NÃO foi feito (precisa sua autorização)

- ❌ **Nenhum commit** — alterações estão staged não-commitadas:
  - `src/backtest/vertical-classifier.ts` (crypto re-incluído)
  - `data/backtest/schema.sql` (CHECK constraint atualizada)
  - `_lib.ts` (DNS bypass undici)
  - `ingest-polymarket-gamma.ts` (sort fix + window logic fix)
  - `ingest-polymarket-clob-prices.ts` (volume filter + speed)
  - Plus arquivos novos do Dex (replay-heuristic, compute-brier, generate-tier1-report, heuristic-signal)
  - Plus docs/projects/polymarket-trader/BACKTEST-1-scoping.md

- ❌ **Não rodou Tier 2 LLM** — squad bateu org limit (próximo reset ~1/Mai)
- ❌ **Bot ainda DOWN** — não religado, não foi pivot ainda decidido

## Comandos úteis

```bash
# Ver resultado final
cat apps/polymarket-trader/data/backtest/TIER1-RESULTS.md

# Ver volume crypto no DB
cd apps/polymarket-trader && npx tsx -e "
const {DatabaseSync} = require('node:sqlite');
const db = new DatabaseSync('data/backtest/historical-markets.db', {readOnly:true});
console.log(db.prepare('SELECT vertical, COUNT(*) c FROM historical_markets GROUP BY vertical').all());
"

# Quando autorizar commits
git add apps/polymarket-trader/src/backtest/ apps/polymarket-trader/scripts/ apps/polymarket-trader/data/backtest/schema.sql apps/polymarket-trader/data/backtest/INGEST-REPORT.md apps/polymarket-trader/data/backtest/TIER1-RESULTS.md docs/projects/polymarket-trader/ docs/stories/PM-PIVOT-1-real-only-7d.md
git commit -m "feat(polymarket-trader): backtest Phase 1+2 Tier 1 [BACKTEST-1+2]"
# (mas @devops faz push)
```

## Próxima sessão

Você abre, lê `TIER1-RESULTS.md`, decide entre cenários A/B/C.
