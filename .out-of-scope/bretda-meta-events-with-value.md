# Bretda — Meta events com `value` field

**Status:** REJECTED
**Decided:** 2026-04-30
**Decided by:** User (depois de tentativa real)
**Project:** bretda

## What was proposed
Enviar `value` (preço do produto) nos events Meta — incluindo CAPI server-side — para ativar Conversion Value Optimization e ROAS bidding.

## Why it was rejected
**User já tentou em produção e perdeu receita.** Não é hipótese, é incidente confirmado.

Razão técnica provável (não 100% diagnosticada na época):
- Meta usa `value` como signal pra otimizar pra "compradores que valorizam mais" — em high-ticket sob encomenda esse signal é ruído
- Algoritmo prioriza audiences que historicamente compraram mais caro, mas em D2C luxo isso vira "people who saw price and didn't convert" → CPL infla
- Pivot 30/Abr: zerar `value` em todos os events Meta, mesmo server-side

Pivot 17 (relacionado): foto Opal mantida no AD09 — winner único.

## Trigger to revisit
Reavaliar SE:
- Bretda fizer 50+ purchases/mês no site (volume real pra algoritmo)
- AND CAPI estiver maduro 90+ dias com >80% match rate
- AND user explicitamente pedir teste A/B controlado

Caso contrário: **events Meta = sem `value` field, nem server-side**.

## Related
- Memory keys: `session_bretda_sprint_30abr_full_context.md` (Pivot 10), `project_bretda_lp_pixel_fix_30abr.md`
- CAPI activation context: `docs/projects/bretda-redesign/20-capi-activation/`
- Cross-rejections: `./luxury-redesign-without-benchmark.md`
