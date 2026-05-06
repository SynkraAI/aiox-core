# Vorza — Email Marketing Pivot

**Data:** 2026-05-05 (autopilot noturno enquanto user dormindo)
**Status:** 🟡 Estratégia pronta, aguardando triagem user

---

## ⚠️ LEIA ISTO PRIMEIRO — Conclave dissidente

3 de 5 mind clones (Hormozi + Brunson + Godin) **discordaram do pivot direto pra email** e recomendaram um passo prévio:

> **Antes de gastar 23h montando infra de email, fazer 5 entrevistas com pessoas que entraram na LP nos últimos 7 dias e NÃO compraram** (retargeting + R$10 gift card por 15min).
>
> Pergunta-chave: *por que não comprou? o que faria comprar? usaria PDF grátis?*
>
> - Se 4/5 disserem "PDF grátis não usaria" → **lead magnet errado**
> - Se "caro" → **oferta errada**
> - Se "não confio" → **falta autoridade**
>
> 7d Meta: R$233 / 0 purchases / 1 IC + LP view rate 71% pós-redesign sugere problema de **OFERTA + PÚBLICO + PREÇO**, não canal.
>
> **Email não salva oferta perdedora — só amplifica oferta vencedora.**

**Documentado em:** `00-strategy.md` §7

---

## ⚠️ Realismo financeiro (analyst)

Cenário realista mês 1-3 com email puro:

| Mês | Revenue | Custo Meta+Tools | ROAS |
|---|---|---|---|
| 1 | -R$465 | R$600 | 0.22× |
| 2 | -R$310 | R$600 | 0.48× |
| 3 | -R$215 | R$600 | 0.64× |
| **Breakeven** | **dia 24-28 cenário B** | — | — |

Email é **construção de ATIVO**, não funil que se paga sozinho. Recomendação analyst: **Cenário B** (Meta R$20/d otimizado pra LEAD + Email Nurture) — único com breakeven 90d.

**Documentado em:** `09-economics-model.md` + `10-risk-analysis.md`

---

## 🎯 Decisão pendente user (manhã)

Escolha 1:

### Opção A — Validar antes de construir (recomendação 3/5 conclave)
- 7 dias: 5 entrevistas (retargeting Vorza R$10 gift card)
- Custo: ~R$50 + 5h tempo
- Output: confirma/refuta hipótese problema = canal vs problema = oferta
- **Trigger:** `vai com opção A vorza` (Orion dispara campaign retargeting + script entrevista)

### Opção B — Email + Meta paralelo (recomendação analyst, default Orion)
- 5-7 dias setup técnico (~23h dev work)
- Meta paralelo R$20/d otimizado pra LEAD (não purchase)
- Email sequence 7-email rodando
- Breakeven dia 24-28
- **Trigger:** `vai com opção B vorza` (Orion dispara aios-dev pra deploy runbook + activation Resend)

### Opção C — Híbrido sequencial
- Semana 1: opção A (entrevistas)
- Semana 2+: se opção A confirmar canal-problem → opção B; se confirmar oferta-problem → ajustar oferta primeiro
- **Trigger:** `vai com opção C vorza`

### Opção D — Pivot completo (mais drástico)
- Conclave dissidente sugere refazer OFERTA antes de tudo
- Hormozi: garantia REAL articulada + value stack 5 itens
- Russell: tripwire R$27 + bump nativo checkout
- **Trigger:** `vai com opção D vorza` (Orion dispara copy-chief refazer oferta)

---

## 📁 Arquivos entregues (17 docs, ~245KB)

### copy-chief (Strategy + Copy)
| # | Arquivo | Conteúdo |
|---|---|---|
| 00 | [strategy.md](./00-strategy.md) | Estratégia + conclave 5 clones + dissent (235L) |
| 01 | [lead-magnet.md](./01-lead-magnet.md) | "Pack 10 Prompts AI por Profissão" 3 nichos (296L) |
| 02 | [email-sequence.md](./02-email-sequence.md) | 7 emails completos D+0→D+10 com 3 variantes A/B/C subject (907L) |
| 03 | [offer-adaptation.md](./03-offer-adaptation.md) | R$27/R$17/R$147 mapeados em emails (264L) |
| 04 | [meta-parallel.md](./04-meta-parallel.md) | Meta R$20/d para LEAD, 3 adsets segmentados (323L) |
| 05 | [tools-stack.md](./05-tools-stack.md) | **Resend recomendado**, Mailchimp eliminado (322L) |
| 06 | [success-metrics.md](./06-success-metrics.md) | KPIs + Gates D+14/D+30 + 3 cenários (319L) |
| 07 | [implementation-checklist.md](./07-implementation-checklist.md) | 10 sprints ~23h em 5-7 dias (304L) |

### aios-analyst (Economics + Risk)
| # | Arquivo | Conteúdo |
|---|---|---|
| 08 | [market-benchmark.md](./08-market-benchmark.md) | CPL Meta vs email BR + tools cost + LTV |
| 09 | [economics-model.md](./09-economics-model.md) | 3 cenários A/B/C com numbers BRL + sensitivity |
| 10 | [risk-analysis.md](./10-risk-analysis.md) | Top 5 risks + mitigations + saturação 4 verticais |

### aios-dev (Tech Architecture)
| # | Arquivo | Conteúdo |
|---|---|---|
| 11 | [tech-architecture.md](./11-tech-architecture.md) | Diagrama + componentes + trade-offs Kleppmann |
| 12 | [lp-form-implementation.md](./12-lp-form-implementation.md) | HTML+JS form completo (honeypot + idempotency + UTM + LGPD) |
| 13 | [resend-setup.md](./13-resend-setup.md) | DNS + API key + React Email + audiences + webhooks |
| 14 | [kiwify-integration.md](./14-kiwify-integration.md) | Webhook HMAC-SHA1 + async processor + backfill CSV |
| 15 | [database-schema.md](./15-database-schema.md) | 4 migrations Supabase + RLS LGPD |
| 16 | [runbook-deploy.md](./16-runbook-deploy.md) | 9 steps 90-120min, manual vs autopilot |

---

## 🔑 Decisões técnicas confirmadas

- **Tool:** Resend (free tier 3k/mo → $20-45/mo em escala)
- **DB:** Supabase (RLS LGPD desde dia 0)
- **Webhook:** Netlify/Vercel function HMAC validation
- **Domain:** `mail.vorza.com.br` (subdomain isolation pra deliverability)
- **Warm-up:** 4 semanas obrigatório antes de blast >100 subscribers

## 🚨 Top 3 Riscos

1. **Aritmética inviável curto prazo** — ROAS 0.22-0.64× mês 1-3 (analyst)
2. **Domain reputation cold-start** — sem warm-up = soft-bounce 30-50% Gmail/Outlook por 30-60d (aios-dev)
3. **Lead magnet conversion <3%** — sinal estatístico insuficiente, 4 alternativas em `01-lead-magnet.md` §10

## 📊 Mind Clones Consultados (10 únicos)

**copy-chief (5):** ann-handley, joanna-wiebe, russell-brunson, alex-hormozi, seth-godin
**analyst (4):** cassie-kozyrkov, aswath-damodaran, peep-laja, lincoln-murphy
**aios-dev (4):** werner-vogels, kelsey-hightower, paul-copplestone, martin-kleppmann

(Sobreposição: 0 — cada agent consultou clones distintos do seu domínio)

---

## ⏭️ Próximo Passo

User decide entre Opções A/B/C/D acima. Triggers documentados.

**Default Orion se silêncio:** **Opção C (Híbrido)** — entrevistas semana 1 + email B se canal-problem confirmado. Equilibra rigor (validar) com momentum (não parar).

---

**Autopilot:** noite 05/Mai · 3 squads · ~30 min total · 17 arquivos · 0 commits push (Constitution)
