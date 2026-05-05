# CONTEXT.md — Bretda

**Read FIRST when working on Bretda.** Domain glossary + active state.
Last updated: 2026-05-04

---

## 1. One-line Identity

E-commerce de móveis de luxo (mesas de sinuca, ping-pong, pebolim, shuffleboard) sob encomenda — D2C, alto ticket, posicionamento "Aston Martin do segmento", site bretda.com.br LIVE.

---

## 2. Domain Glossary

| Term | Meaning | Notes |
|------|---------|-------|
| `Coleção Premium` | Linha topo de gama | 6 mesas finais renderizadas (PNG sem fundo) |
| `Aston Martin deep dive` | 33 PNGs / 19 tactics — referência visual do projeto luxo | Done 04/Mai |
| `Mesas reais` | Fotos de produtos reais já fabricados | **NUNCA editar/recriar via IA** (regra-mestra) |
| `Ambientes IA` | Backgrounds gerados por IA com mesa real composada | OK gerar |
| `Stats line` | Linha de credibilidade no site | Final: "10 anos · 100% sob encomenda · 5 anos garantia" |
| `CJ8v2` | Conjunto v2 de criativos atual em Meta Ads | R$120/d budget |
| `AD05` / `AD10` | Únicos criativos winners históricos | AD05 reativado 04/Mai |
| `v2 PAUSED pattern` | Versão nova fica criada mas pausada até conferir copy/qualificador | Padrão aplicado 04/Mai |

---

## 3. Product Lines

| Code | Vertical | Notes |
|------|----------|-------|
| Sinuca | 6 SKUs | Linha principal |
| Tênis (de mesa) | 2 SKUs | Ping-pong premium |
| Shuffle | 1 SKU | Shuffleboard |
| Pebolim | 3 SKUs | Foosball |

12 SKUs categorizados (28/Abr).

---

## 4. Stack & Key Files

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | Next.js + Vercel | Branch `feat/redesign-foundation-tokens` (ou main) |
| Tracking | Meta Pixel + CAPI server-side (Edge function) | CAPI gated em System User Token |
| Deploy | Vercel | Bug Git LFS bloqueia preview sem PAT |

**Production:** https://bretda.com.br
**Preview:** bloqueado — precisa GitHub PAT scope `repo` em `vercel env add GITHUB_LFS_TOKEN`
**Backup site antigo:** `D:/AIOS/backups/bretda-old-site-20260501/` (131MB)

---

## 5. Active People & Roles

| Person | Role | Notes |
|--------|------|-------|
| Breno | Owner | brenodecerqueira@gmail.com |
| (gestor antigo Google) | — | Removido, conta MCC 17/Abr |

CNPJ real: `54.670.686/0001-57` · Endereço: Blumenau/SC

---

## 6. Tracking / Pixels / IDs

| System | ID | Status |
|--------|----|----|
| Meta Pixel canon | `3348133485496539` | Confirmado 04/Mai (não `1130704285486234` como achou outra agente) |
| System User ID Meta | `61578657552599` | Token pendente user-action |
| Upstash Redis | já setado | Para CAPI |
| Google Ads | conta MCC removida | Reativação pendente — URL audit + MCP ativo |

---

## 7. Constraints & Non-Negotiables

- ❌ **NUNCA editar/recriar mesas reais via IA** — só ambientes (regra-mestra `feedback_bretda_mesas_reais.md`)
- ❌ **Zero `value` em events Meta** mesmo server-side — user já tentou com preço, perdeu receita (pivot 30/Abr)
- ❌ **Stats line travada em 3 itens** específicos: "10 anos · 100% sob encomenda · 5 anos garantia"
- ✅ **Foto Opal mantida** (pivot 17 — AD09 winner)
- ✅ **Push só via @devops** (Constitution Article)
- ✅ **Geo-targeting Brazil (2076) + PRESENCE** em toda campanha (regra global)
- ✅ **Padrão v2 PAUSED**: criar versão nova mas pausar até conferir promessa+qualificador

---

## 8. Known Dead Ends

- ❌ Server-side `value` em events — perdeu receita, ver `.out-of-scope/bretda-meta-events-with-value.md`
- ❌ Squad redesign sem benchmark visual luxo — 4ª falha 30/Abr ("startup tentando ser premium"), ver `.out-of-scope/luxury-redesign-without-benchmark.md`
- ❌ Squad fez token swap + copy update SEM redesenho de layout (Sprint 30/Abr) — user disse "site mal feito" depois de 13 PRs merged

---

## 9. Current State Snapshot

**Last updated:** 2026-05-04
**Branch / HEAD:** `feat/redesign-foundation-tokens`
**Production:** ✅ LIVE em bretda.com.br (DNS migrated 01/Mai)
**Active blockers:**
- 🔴 System User Token Meta (user action ~5min)
- 🔴 Test Event Code (user action)
- 🔴 Google Ads Conversion ID + Label (user action)
- 🔴 OAuth Testing→Production (janela ~06/Mai)
- 🔴 Enhanced Conversions setup Google Ads UI
- 🔴 LFS PAT pra preview Vercel destravar (5min)
- 🟡 Saldo Meta R$218 PIX em curso, AD10-v2 ATIVADO + AD05 reativado

---

## 10. Cross-References

- PRD luxury research: `docs/projects/bretda-redesign/03-luxury-research-2026-04-29/`
- Architecture spec: `docs/projects/bretda-redesign/05-architecture-spec/`
- CAPI activation: `docs/projects/bretda-redesign/20-capi-activation/`
- MEMORY keys: `session_bretda_*`, `project_bretda_*`, `reminder_bretda_*`
- Related projects: low-ticket-10k (Vorza — mesma stack tracking)
