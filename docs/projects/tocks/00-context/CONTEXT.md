# CONTEXT.md — Tocks

**Read FIRST when working on Tocks.** Domain glossary + active state.
Last updated: 2026-05-05

---

## 1. One-line Identity

E-commerce de móveis de luxo — relógios e mesas premium high-ticket sob encomenda — operação Tray + Sales AI CRM, tracking Meta + Google Ads.

> **Atenção:** Tocks = MOVEIS DE LUXO high-ticket (regra `feedback_tocks_moveis_luxo.md`). Não é "loja de relógios baratos".

---

## 2. Domain Glossary

| Term | Meaning | Notes |
|------|---------|-------|
| `Vértice` | Mesa premium R$15.990 | Linha luxo |
| `Elipse` | Mesa premium R$19.900 | Linha luxo |
| `Monaco 2em1` | Mesa Monaco SS — winner histórico | Conversion CPL R$12,22, 77% spend C005 |
| `C005` / `C007` | Campanhas Meta numeradas | C005 = Monaco · C007 = Vértice+Elipse Premium |
| `[VRT-CLS]` Linhas | Ad winner emergente C007 | CTR 4,76%, 2 conv |
| `[COPY-v2]` | Geração nova de criativos (9 ads, 30/Abr) | Winner Monaco SS |
| `D++ CAPI` | Caminho aprovado conclave 30/Abr — CAPI server-side via Sales AI CRM | Substitui deploy `tocks-tracking` |
| `Sales AI` | CRM próprio com bridge CAPI | Railway project criado, 42 vars |
| `tocks-tracking` | Backend antigo separado | Substituído por D++, mas DNS ainda existia (parked) |
| `SU "Conversions API System User"` | System User Meta para CAPI | ID `122227374668268695`, app "Sales Ia" `1471521401018296`, expires NEVER |
| `js-yaml hotfix` | Patch aplicado pra D++ rodar | Aplicado |
| `Smart Bidding reset window` | 21 dias pós-GTM-fix antes de julgar performance | Não julgar antes de 21/Mai |
| `OUTBOUND_CLICK biddable` | Bug Google Ads — bidding em click ao invés de conv | Tocks tem isso |

---

## 3. Product Lines

| Code | Vertical | Notes |
|------|----------|-------|
| Monaco 2em1 SS | Mesas / relógios premium | Winner histórico CPL R$12 |
| Vértice | Mesa premium | R$15.990 |
| Elipse | Mesa premium | R$19.900 |
| Lead Qualificado | Conversion type | R$13k value, sem CRM upload (bug) |

---

## 4. Stack & Key Files

| Layer | Tech | Notes |
|-------|------|-------|
| Storefront | Tray (e-commerce) | Pixels + GTM |
| CRM / CAPI | Sales AI (Railway) | Project criado, 42 vars |
| Tracking deploy | Railway | Domain `tocks-sales-ai-production.up.railway.app` |
| Repos | Múltiplos | js-yaml hotfix aplicado |

**PR atual:** #645 OPEN — cherry-pick `b5f6244c`
**Storefront:** tockscustom.com.br
**SLA D++ activation:** 07/Mai

---

## 5. Active People & Roles

| Person | Role | Notes |
|--------|------|-------|
| Breno | Owner / decisor | Email `contato@tockscustom.com.br` (também conta Google Ads OAuth) |

---

## 6. Tracking / Pixels / IDs

| System | ID | Status |
|--------|----|----|
| Meta Ad Account | `act_1221671265457624` | OK |
| Meta SU Conversions | `122227374668268695` | Token validado, expires NEVER |
| Meta App "Sales Ia" | `1471521401018296` | Atrelado ao SU |
| Google Ads | conta OK | OAuth refresh ~29/Abr expira → reauth periódico |
| Tray webhook | `TRAY_WEBHOOK_SECRET` | Plantado em `.env.production.local` |
| GTM Tray | sem AddToCart/Purchase atualmente | Bug que zera atribuição |
| Storefront pixel | pendente reinstalar | Pós-D++ |

---

## 7. Constraints & Non-Negotiables

- ✅ **Tocks = LUXO high-ticket** — copy/visual sempre premium
- ✅ **Geo-targeting Brazil + PRESENCE** em toda campanha
- ✅ **Push só via @devops**
- ✅ **Token Meta no chat history → rotacionar em 30d** (caveat 05/Mai)
- ❌ **NÃO julgar Smart Bidding antes de 21/Mai** (reset window pós-GTM-fix)
- ❌ **NUNCA misturar conta com KR/Bretda** (regra `feedback_ads_contas_separadas.md`)

---

## 8. Known Dead Ends

- ❌ **Pivot OUTCOME_CONVERSIONS site** — 5/5 mind clones rejeitaram 30/Abr (Hormozi/Brunson/Laja/Kim/Mandalia). Verdict foi D++ CAPI server-side. Ver `.out-of-scope/tocks-pivot-outcome-conversions.md`
- ❌ **Tocks Shopping Google Ads** — pausado 23/Abr (1 conv/14d, conv_value=0 bug). Ver `.out-of-scope/tocks-shopping-google-ads.md`
- ❌ **Deploy `tocks-tracking` separado** — substituído por D++ (decisão 30/Abr conclave)

---

## 9. Current State Snapshot

**Last updated:** 2026-05-05
**Production:** D++ Sales AI Railway TUDO PRONTO
**Active blockers:**
- 🔴 **Domain `tocks-sales-ai-production.up.railway.app` `targetPort=None`** — user precisa fixar manual em dashboard (Settings→Public Networking→Target Port=3100)
- 🔴 Após port setado: redeploy → migration 006 + Tray webhooks + storefront pixel + PR #645 merge
- 🔴 SLA: 07/Mai
- 🟡 Saldo Tocks Meta R$155 — precisa PIX

**Caveats:**
- Token no chat history → rotação em 30d
- Smart Bidding: não julgar performance antes de 21/Mai

---

## 10. Cross-References

- Smoke test 04/Mai: `docs/projects/tocks/smoke-test-04may/`
- MEMORY keys: `session_tocks_*`, `project_tocks_*`, `reminder_tocks_*`
- D++ session: `session_tocks_d_plus_plus_04_05mai.md`
- PR #645 (Sales AI tracking): GitHub
- Related: Bretda (mesma stack tracking server-side)
