# CONTEXT.md — Vorza (Low-Ticket 10K)

**Read FIRST when working on Vorza / low-ticket-10k.** Domain glossary + active state.
Last updated: 2026-05-01

---

## 1. One-line Identity

Funil low-ticket de prompts AI ("Copie. Cole. Cobre.") R$10-30 com order bump R$17 + upsell R$147 (Protocolo SCV-3) — landing page Netlify, Pixel híbrido LGPD LIVE, Pixel Kiwify atracado, AD05 PAUSED, budget cortado pra R$40/d em 01/Mai pré-viagem.

---

## 2. Domain Glossary

| Term | Meaning | Notes |
|------|---------|-------|
| `Vorza` | Marca do produto | Hero "Copie. Cole. Cobre." |
| `Protocolo SCV-3` | Upsell escolhido conclave | R$147, confidence 65%, dissent Hormozi/Brunson queriam C R$247 |
| `Order bump` | Bump R$17 | 3 artefatos squad em `low-ticket-10k/order-bump/` |
| `Caminho C` | Geração nova de criativos PNG (29/Abr) | 2ª rodada anti-AI Kodak Portra+phenotype real+objetos BR — 6/6 PASS |
| `Pixel híbrido LGPD` | Auto-fire PageView gated por consent | LIVE (LGPD Art. 7 IX legítimo interesse) |
| `Pixel Kiwify` | InitiateCheckout chegando | Atracado |
| `LP view rate` | Métrica primária funil | Saiu de 5.9% → 71% pós-redesign |
| `C1 INT` | Campanha 1 INTEREST targeting | R$20/d |
| `C3 BROAD` | Campanha 3 BROAD | R$20/d |
| `9 objetos PAUSED` | 9 objetos Meta criados+pausados | camp 6986644457499 + adsets + 6 ads |
| `API access blocked code 200` | Bug Meta criar+ativar muitos objetos paralelo | Anti-spam em ad account fresh |

---

## 3. Stack & Key Files

| Layer | Tech | Notes |
|-------|------|-------|
| Landing page | Netlify | `low-ticket-10k/landing-page/` |
| Tracking | Pixel Meta híbrido + Pixel Kiwify | Híbrido LGPD Art. 7 IX |
| Checkout | Kiwify | InitiateCheckout integrado |

**Production LP:** Netlify URL (consultar dashboard)
**Repo path:** `docs/projects/low-ticket-10k/landing-page/`

---

## 4. Product Funnel

| Step | Offer | Price |
|------|-------|-------|
| Front-end | "Copie. Cole. Cobre." prompts pack | R$10-30 |
| Order bump | (3 artefatos squad ready) | R$17 |
| Upsell | Protocolo SCV-3 | R$147 (decisão conclave) |

---

## 5. Active People & Roles

| Person | Role | Notes |
|--------|------|-------|
| Breno | Owner | Viajando 01/Mai, retornou 03/Mai |

---

## 6. Tracking / Pixels / IDs

| System | ID | Status |
|--------|----|----|
| Meta Pixel Vorza | (separado de Bretda — conta diferente) | Híbrido LGPD LIVE |
| Pixel Kiwify | atracado | InitiateCheckout chegando |
| Meta Camp PAUSED | `6986644457499` | 9 objetos prontos |
| Meta Adsets PAUSED | `6986644517499`, `6986644533099` | + 6 ads |

---

## 7. Constraints & Non-Negotiables

- ✅ **NUNCA misturar conta Vorza com Bretda/Tocks/KR** (regra global)
- ✅ **Pixel híbrido LGPD** — base legal Art. 7 IX legítimo interesse
- ✅ **Geo-targeting Brazil + PRESENCE**
- ⚠ **Budget cortado 01/Mai R$74→R$40/d** — pode resetar learning 48h, não julgar performance antes 03/Mai+

---

## 8. Known Dead Ends

- ❌ **1ª rodada criativos AI** (29/Abr) — user rejeitou "aparência de criativo barato". Ver `.out-of-scope/vorza-ai-creatives-generic.md`
- ❌ **Criar+ativar muitos objetos paralelo em ad account fresh** — Meta API blocked code 200 (anti-spam). Ver `.out-of-scope/meta-bulk-create-activate-fresh-account.md`

---

## 9. Current State Snapshot

**Last updated:** 2026-05-01
**LP redesign LIVE:** hero "Copie. Cole. Cobre." Fraunces + demo papel + 2 fotos reais user
**4 deploys Netlify** (30/Abr) — pain swap C1-A + solution swap foco.png
**View rate:** 5.9% → 71% pós-redesign
**Active blockers:**
- 🔴 9 objetos Meta PAUSED — após restart CC (token resolvido), validar overview + 9 update_status SEQUENCIAIS (não paralelo!)
- 🔴 3 decisões pendentes user pra subir order bump R$17:
  1. Caveat #2 (4× rápida)
  2. #5 (10 prompts dup?)
  3. Upsell B/E vs C
- 🟡 AD05 PAUSED

**Trigger retomada:** "vamos subir bump"

---

## 10. Cross-References

- LP folder: `docs/projects/low-ticket-10k/landing-page/`
- Order bump artefatos: `docs/projects/low-ticket-10k/order-bump/`
- Conclave upsell: decisão SCV-3 R$147 (sessão 01/Mai)
- MEMORY keys: `project_vorza_*`, `session_low_ticket_*`, `reminder_low_ticket_*`
- Related: Bretda (mesmo dono, contas separadas)
