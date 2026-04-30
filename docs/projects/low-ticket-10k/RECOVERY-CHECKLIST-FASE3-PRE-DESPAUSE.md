# Recovery Checklist — Fase 3: Pré-Despause

**Projeto:** Low Ticket 10k — Vorza/Metodo3C
**Data:** 27/Abr/2026
**Owner:** USER (confirma item-a-item) + Orion (valida via MCP)
**Tempo estimado:** 5-8 minutos
**Pré-requisitos:** Fase 1 + Fase 2 concluídas

---

## Por que esta fase existe

Despausar 4 ads = R$74/dia exposto = R$518 em 7 dias. Se algo estiver errado (Pixel não conectado, CAPI não enviando, ads sem promoted_object), Meta queima budget sem aprender nada.

**Esta é a última checagem antes do despause.** Se UM item falhar, NÃO avance pra Fase 4 — corrija e revalide.

---

## Checklist (10 itens)

### Tracking estrutural

- [ ] **1. Pixel `26458851600417959` atribuído à ad account `act_793656664671388`** com Full Control.
  - **Como confirmar:** Business Settings → Pixels → selecionar pixel → aba "Ad Accounts" → ver `act_793656664671388` listada.

- [ ] **2. Adset C1 (`120242729974200621`) com Conversion = Pixel `26458851600417959` + evento Purchase.**
  - **Como confirmar:** Ads Manager → editar adset C1 → seção Conversion → ver Pixel selecionado + Purchase.

- [ ] **3. Adset C3 (`120242729976720621`) com Conversion = Pixel `26458851600417959` + evento Purchase.**
  - **Como confirmar:** mesma coisa, adset C3.

### Tracking client-side

- [ ] **4. PageView ativo nas últimas 24h no Events Manager** (last fired < 24h, status verde).
  - **Como confirmar:** Events Manager → pixel → Overview → ver "Last received: há X minutos" (PageView).

- [ ] **5. Meta Pixel Helper na LP `vorza-metodo3c.netlify.app` mostra Pixel ID 26458851600417959 com indicador VERDE disparando PageView.**
  - **Como confirmar:** Chrome com extension Meta Pixel Helper → abrir LP → clicar no ícone → ver "1 pixel found, 1 event sent (PageView)".

### Tracking server-side (CAPI)

- [ ] **6. Access Token CAPI gerado e colado no produto Kiwify do `pay.kiwify.com.br/SnVHKmN`.**
  - **Como confirmar:** Kiwify dashboard → produto → Pixels → ver pixel `26458851600417959` com status conectado.

- [ ] **7. Test Events validou Purchase via CAPI com source=Server e EMQ ≥ 5.**
  - **Como confirmar:** screenshot ou nota do user do que apareceu no Test Events durante a compra teste.

- [ ] **8. Test Event Code REMOVIDO da Kiwify (modo produção ativo).**
  - **Como confirmar:** Kiwify dashboard → produto → Pixels → campo "Test Event Code" deve estar vazio.

### iOS 14.5+ readiness

- [ ] **9. Domain `vorza-metodo3c.netlify.app` verificado no BM Vorza.**
  - **Como confirmar:** Business Settings → Brand Safety → Domains → status "Verificado" (verde) ao lado do domínio.

### MCP-side validation (Orion executa)

- [ ] **10. Adsets C1 e C3 com `promoted_object.pixel_id = "26458851600417959"` válido via MCP.**
  - **Como confirmar:** Orion roda `mcp__mcp-ads-bridge__meta_ads_adsets` filtrando por adset_ids `120242729974200621` e `120242729976720621`, e verifica que cada um tem `promoted_object.pixel_id` populado e `optimization_goal: "OFFSITE_CONVERSIONS"` + `custom_event_type: "PURCHASE"`.

---

## Como o user reporta

Quando todos os 10 itens estiverem OK, envie ao Orion:

```
Fase 3 OK — todos 10 itens validados. Pode executar Fase 4.
```

Ou, se algum falhar:

```
Fase 3 BLOQUEADO — itens NOK: [lista de números]. Detalhe: {explicação}
```

---

## Decisão: despausar tudo de uma vez ou por etapa?

**Recomendação (Larry Kim Meta scaling consensus):** despausar **C1 e C3 simultaneamente**.

Razão:
- São apenas 2 adsets, ambos R$37/dia. Não há estrutura escalonada complexa.
- Meta learning phase exige ~50 conversion events por adset em 7 dias — diluir abrindo 1 por vez atrasa learning em 72h.
- Kill rule é por **ad** (não adset), então se um ad específico furar `R$100 sem 1 Purchase`, paura individualmente sem afetar o resto.
- Despausar em ordem só faria sentido se houvesse risco de overlap de audiência (overlapping audience auction price competition entre seus próprios adsets) — C1 (interesses jurídicos) vs C3 (broad) tem overlap mínimo.

**Por isso, Fase 4 = unpause coordenado dos 4 ads em paralelo.** A campanha + ambos os adsets já estão ACTIVE, falta só os 4 ads.

---

## Anti-checklist

- ❌ NÃO confunda "ad" com "adset". Os 2 adsets (C1, C3) já estão ACTIVE. Os 4 **ads** dentro deles que estão PAUSED.
- ❌ NÃO use Test Event Code em produção. Item 8 garante isso.
- ❌ NÃO troque o pixel ID em nenhum lugar. É sempre `26458851600417959`.
- ❌ NÃO mexa em C2 (`120243622860290621`) ou C4 (`120243622876870621`) — continuam PAUSED até 50 Purchases.
- ❌ NÃO altere budget agora. R$37 + R$37 = R$74/dia, conforme Conclave Hormozi/Brunson/Larry Kim.
