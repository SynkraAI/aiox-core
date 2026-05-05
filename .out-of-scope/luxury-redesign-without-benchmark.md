# Luxury Redesign sem benchmark visual

**Status:** REJECTED (recurring failure pattern)
**Decided:** 2026-04-30 (4ª falha confirmada)
**Decided by:** User feedback (corretivo)
**Project:** bretda + qualquer projeto luxo futuro

## What was proposed
Squad de design implementar redesign luxury (Bretda, Tocks, qualquer projeto premium) lendo só PRD + brief textual, sem benchmark visual obrigatório contra sites luxo reais.

## Why it was rejected
**4ª falha visual em projeto luxo** (30/Abr noite). Padrão consistente:

1. Squad cumpre brief textual perfeitamente
2. Resultado parece "startup tentando ser premium"
3. User reage: "site mal feito" / "ainda simples"
4. Custo: 13 PRs merged + tempo squad + frustração

**Causa raiz:** brief textual subestima a sensibilidade visual de luxo. Diferença entre "luxury" e "looks luxury" só é detectável visualmente, não verbalmente.

**Regra extraída:** implementar luxo SEM comparação direta lado-a-lado com sites de referência (Cassina / Bottega / Aman / Brunello / Aston Martin) = falha garantida.

## Trigger to revisit
Esta NÃO é pra revisar. É **regra permanente**: qualquer redesign luxo DEVE incluir Phase 0 obrigatória de coleta de 3-5 referências visuais e comparação lado-a-lado antes de Phase 1.

Workflow correto:
1. Phase 0: deep dive visual (ex: Aston Martin 33 PNGs/19 tactics done 04/Mai pra Bretda)
2. Phase 1: brief baseado em padrões EXTRAÍDOS dos refs
3. Phase 2: implementação
4. Phase 3: comparação A/B vs ref antes de merge

## Related
- Memory keys: `feedback_luxury_taste_calibration.md` (regra mestra)
- Memory keys: `feedback_visual_before_code.md`
- Bretda Aston Martin deep dive: `docs/projects/bretda-redesign/03-luxury-research-2026-04-29/`
- Cross-rejections: `./bretda-meta-events-with-value.md`
- Mind clones to consult: dieter-rams, marty-neumeier, tobias-van-schneider, refika-anadol, vitaly-friedman
