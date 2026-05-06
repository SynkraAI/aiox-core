---
project: tocks-ads
created: 2026-05-06
status: ACTIONS PARCIAIS — 2 de 3 done; 1 aguarda user
sla_d_plus_plus: 2026-05-07 (D-1 a partir de hoje)
---

# Tocks Ads — Action Plan 06/Mai

## Diagnóstico (numbers que justificam cada action)

| Métrica | 30d | 7d | Sinal |
|---|---|---|---|
| Google spend | R$ 1.912 | R$ 225 | OK |
| Google clicks | 1.721 | 76 | normal |
| **Google conv** | 124 | **0** | 🔴 tracking off |
| Google CPC | R$ 1.11 | R$ 2.97 | bidder cego inflando |
| Google SIS | — | 9.99% | perdendo 90% imps |
| Meta spend | R$ 2.460 | R$ 952 | normal |
| Meta convo started 7d | 250 | **99** | ✅ engine real |
| Meta CTR | 2.39% | 2.37% | OK |

**Estado das campanhas Google:** 1 ativa (`TOCKS_Search_Alta-Intencao` R$ 75/d), 16 PAUSED (PMAX, Shopping, ORN, EB legacy).

## Action 1 — Deploy D++ (PR #645) [USER ACTION: pedir merge ao owner]

**Update 06/Mai 23h: 4 fixes CodeRabbit aplicados + main merged into branch + pushed.**

- Commit novo: `96f6edd9 fix(tocks-capi): address CodeRabbit review — try/catch + sanitize source_url`
- Push: lorDofPicanha/aiox-core (fork) — PR #645 head atualizado
- TypeScript check: PASS
- 4 issues CodeRabbit endereçadas:
  1. `capture-gclid.ts`: try/catch wrap em sha256 Promise.all + sanitize source_url (origin+pathname only)
  2. `fbq.ts`: try/catch wraps em fbqTrack + fbqTrackCustom
  3. `gtag.ts`: try/catch wraps em setUserData + gtagEvent
- main branch merged (era BEHIND, agora caught up)

**Bloqueadores remanescentes (não-Orion):**
- `lorDofPicanha` não tem write access em SynkraAI/aiox-core → não consegue mergear
- `lorDofPicanha` não é Vercel team Member → preview deploy continua "Authorization required"
- 2 reviewers humanos requested: `Pedrovaleriolopez`, `oalanicolas` — aguarda aprovação deles

**Ação user (você):**
1. Pedir pra owner SynkraAI org (ou Pedro/Alan) revisar + aprovar + mergear PR #645
2. OU pedir upgrade de permissões (write em SynkraAI + Vercel Member)
3. Após merge → main → Vercel auto-deploys production → tracking volta

**Production deploy NÃO precisa do "Authorization required" do Vercel.** Esse erro é só pra previews de contributors externos. Production deploy roda automaticamente em todo merge pra main da equipe trusted.

**Status:** PR `feat/tocks-capi-d-plus-plus` OPEN no `SynkraAI/aiox-core` desde 04/Mai. Não atualizado há 2 dias.

**Files que esse PR adiciona** (apps/tocks-website/src/lib/analytics/):
- `gtag.ts` — Google Analytics / Tag events client-side
- `fbq.ts` — Meta Pixel events client-side
- `capture-gclid.ts` — Google Click ID capture pra atribuição
- `hashing.ts` — SHA-256 server-side (CAPI requer)
- `normalize.ts` — phone/email PII normalization
- `trackers.ts` — orchestrator unificado

**Por que é a correção dos 0 conv Google:** o PR não é só Meta CAPI. O `gtag.ts` é o tracker Google que está faltando no site (memory: "tags Google nunca instaladas no GTM Tray"). Deploy desse PR fixa Google AND Meta tracking ao mesmo tempo.

**Bloqueador atual:**
- Vercel check: **FAILURE** — *"Authorization required to deploy"*
- URL pra autorizar: https://vercel.com/git/authorize?team=SINKRA%20-%20AIOX&slug=sinkra-aiox&prId=645&repo=aiox-core
- Memory também menciona "targetPort=None Railway" — mas isso é uma SEPARATE issue (possível CAPI backend collector ou Sales AI deploy, não o Vercel deploy do tocks-website)

**Ação user (você):**
1. Abrir o link de Vercel authorize acima → autorizar deploy do PR #645
2. Esperar Vercel preview build verde
3. Se preview passar e código estiver OK → merge pra `main` na aiox-core
4. Vercel auto-deploya production
5. Validar tracking via DebugView (GA4) e Test Events (Meta Events Manager)

**Se Vercel auth não resolve / production deploy falha:**
- Pode haver Vercel project mal configurado
- Posso fazer subagent debug DevOps se você der GO

## Action 2 — Marca Tocks ad group [DONE ✅]

**Antes:** 4 imps em 7d, 0 clicks. Ad group cadastrado mas sem keywords ativas que triggam (ou keywords tão fracas que não aparecem no top 100).

**Depois (06/Mai 12h):** 9 keywords adicionadas via MCP no ad group `194892667676` (03 - Marca Tocks):

| Keyword | Match | Bid |
|---|---|---|
| tocks custom | PHRASE | R$ 1.50 |
| tocks bilhar | PHRASE | R$ 1.50 |
| tocks mesa | PHRASE | R$ 1.50 |
| tocks sinuca | PHRASE | R$ 1.50 |
| tocks moveis | PHRASE | R$ 1.50 |
| tockscustom | PHRASE | R$ 1.50 |
| tocks industria | PHRASE | R$ 1.50 |
| mesa de bilhar tocks | PHRASE | R$ 2.00 |
| mesa de sinuca tocks | PHRASE | R$ 2.00 |

**Esperado em 48-72h:** 5-15 imps/dia em brand search a CPC R$ 0.50-1.50 (brand cheap), CTR ≥10%. Brand traffic é "lead já-quase-decidido" — Tocks Custom é nome próprio, quem busca já viu o site/Insta.

**Watch:** se CPC subir > R$ 2.50 ou Quality Score < 5 em 1 semana, ajustar match → EXACT pra reduzir broad spillover.

## Action 3 — Watch criteria [DONE ✅]

**Pergunta:** quando pausar a Search ativa (TOCKS_Search_Alta-Intencao R$ 75/d) se D++ não deploy?

**Threshold de decisão:**

| Condição | Ação |
|---|---|
| D++ deploy hoje (06/Mai) | Continuar ativa, validar tracking 24h |
| D++ deploy 07/Mai (no SLA) | Continuar ativa |
| D++ slip pra 08/Mai (D+1) | **PAUSAR Compra Direta** (R$ 184/7d — maior gasto sem track), manter 2em1 + Marca Tocks |
| D++ slip pra 09/Mai (D+2) | **PAUSAR campanha inteira** Search; reativar só após track validado |
| D++ slip > 5 dias (>11/Mai) | Investigar por que merge bloqueou + considerar approach alternativo (GTM manual no Tray) |

**Cálculo de custo do "esperar":**
- 1 dia de slip = R$ 75 a R$ 225 wasted (varia por SIS)
- 5 dias de slip = R$ 375 a R$ 1.125 wasted
- vs. custo de pausar = perdemos 76 clicks × possível conversão real = oportunidade de 1-3 leads/semana via Google

**Ponto crítico:** os 76 clicks Google em 7d são REAIS (humanos chegando no site). Eles podem estar convertendo via WhatsApp (que Meta capta). Então mesmo "0 conv Google" não significa 0 lead — significa 0 ATRIBUÍDO a Google. Pausar Google = perder atribuição → bidder Meta vai se canibalizar.

**Recomendação:** **NÃO pausar Search hoje.** Aguardar 48h pra D++ deploy. Se ainda 0 conv 08/Mai EOD, executar pause-Compra-Direta.

## Action 4 (proposta nova, baixo custo, alto impacto) — [USER GO?]

**Limpar campanhas zumbis Google (16 PAUSED há meses):**
- 16 campanhas PAUSED ocupando UI da conta, criando ruído de orçamento e poluindo histórico
- Várias duplicadas: "[EB] Performance Max" + "[EB] - Performance Max - Tocks" + "Performance Max - Shopping" + "[EB] - Performance Max" (4 PMAX paused)
- 4 Shopping paused
- 3 Search paused legacy

**Sugestão:** consolidar pra 4-6 campanhas máx (Search Alta-Intenção + Marca + 1 PMAX + 1 Shopping consolidado + Pebolim). Limpar 10-12 zombies.
