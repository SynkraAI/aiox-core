# Tocks — Shopping Google Ads campaigns

**Status:** PAUSED (não REJECTED — pode reabrir após bug fix)
**Decided:** 2026-04-23
**Decided by:** Performance audit
**Project:** tocks

## What was proposed
Manter Shopping campaigns ativas no Google Ads de Tocks rodando contínuo.

## Why it was paused
Auditoria estrutural (03/Mai traffic-chief, raio-X 3,5/10):

1. **1 conversion em 14 dias** — volume insuficiente pra Smart Bidding aprender
2. **Bug `conv_value=0` em 124 conversions 30d** — GTM/Tray sem `transaction_value`
3. **Lead Qualificado R$13k value sem CRM upload** — algoritmo cego
4. **OUTBOUND_CLICK biddable** — bid em click, não conversion
5. **9 SKU camps DELETADAS antes** — aprendizado zerado
6. **SIS Lost-Rank 62,5%** — gargalo é Ad Rank, não budget

**Custo ROAS cego R$100 fixo idêntico Bretda** (mesmo padrão de bug).

## Trigger to revisit
Reabrir SHOPPING SE (todos verdadeiros):
- ✅ Bug `transaction_value` GTM/Tray fixado
- ✅ CRM upload de Lead Qualificado funcionando
- ✅ OUTBOUND_CLICK desligado (deixar conversion-based)
- ✅ Smart Bidding reset window de 21d completado pós-fix
- ✅ Volume mínimo 30 conv/30d antes de ligar

**Estimativa:** disponível pra reavaliar ~15-21 dias após GTM fix completo.

## Related
- Memory keys: `session_tocks_auditoria_03mai.md`, `session_tocks_pos_viagem_23abr.md`
- Audit doc traffic-chief 03/Mai
- D++ CAPI activation (em curso) pode resolver várias dessas pendências
- Cross-rejections: `./tocks-pivot-outcome-conversions.md`
