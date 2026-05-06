# 07 — Implementation Checklist (User-Facing)

**Objetivo:** passos numerados para User levar a estratégia do papel ao deploy completo.

**Tempo total estimado:** ~16-22h de trabalho distribuído ao longo de 5-7 dias úteis.

**Pré-requisito:** ter lido o doc 00-strategy.md e validado a direção.

---

## Sprint 0 — Decisões Antes de Começar (1h)

| # | Tarefa | Tempo | Status |
|---|---|---|---|
| 0.1 | Ler doc 00-strategy.md (estratégia geral) | 15 min | [ ] |
| 0.2 | Decidir: aceitar recomendação contrária (5 entrevistas com não-compradores) ANTES de implementar? | 10 min | [ ] |
| 0.3 | Decidir: Resend (recomendado) ou MailerLite (fallback)? | 10 min | [ ] |
| 0.4 | Decidir: começar por nicho ÚNICO (advogado) ou 3 paralelos? | 15 min | [ ] |
| 0.5 | Decidir: Meta paralelo ON desde dia 1 ou só após 7 dias de email-only? | 10 min | [ ] |

**Recomendação Orion:**
- 0.2: SE puder esperar 5 dias, faça as entrevistas. SE pressa, pular.
- 0.3: Resend.
- 0.4: Começar por **advogado** (nicho mais específico, copy mais afiado, valida hipótese antes de escalar para 3).
- 0.5: Meta paralelo ON desde dia 3 (após templates de email prontos).

---

## Sprint 1 — Lead Magnet Production (4h)

| # | Tarefa | Tempo | Quem | Status |
|---|---|---|---|---|
| 1.1 | Escrever 10 prompts versão Advogado (usando template em doc 01) | 1.5h | User ou Copy Chief | [ ] |
| 1.2 | Diagramar PDF advogado (Canva, template minimalista) | 1h | User ou Designer | [ ] |
| 1.3 | Validar PDF (testar 1-2 prompts no ChatGPT antes de publicar) | 30 min | User | [ ] |
| 1.4 | Hospedar PDF (Netlify static folder ou S3) | 15 min | @aios-dev | [ ] |
| 1.5 | (Opcional Sprint 2) Repetir 1.1-1.4 para MEI e Professor | +3h cada | User | [ ] |

**Output:** URL do PDF acessível (ex: `vorza.com.br/downloads/pack-advogado.pdf`)

---

## Sprint 2 — Resend Setup (3h)

| # | Tarefa | Tempo | Quem | Status |
|---|---|---|---|---|
| 2.1 | Criar conta Resend (resend.com) | 5 min | User | [ ] |
| 2.2 | Adicionar domínio `mail.vorza.com.br` no Resend | 5 min | User | [ ] |
| 2.3 | Configurar DNS (SPF, DKIM, DMARC) no provider de domínio | 30 min | User + @aios-dev | [ ] |
| 2.4 | Aguardar verificação domínio (5-30 min, refresh manual) | 30 min | User | [ ] |
| 2.5 | Criar API Key Resend | 5 min | User | [ ] |
| 2.6 | Salvar API Key em `.env.production.local` (Netlify) | 10 min | @aios-dev | [ ] |
| 2.7 | Criar 4 Audiences (advogados, mei, professores, outros) | 15 min | User | [ ] |
| 2.8 | Configurar webhook Resend → endpoint de log | 30 min | @aios-dev | [ ] |
| 2.9 | Testar envio manual (Resend → seu próprio email) | 15 min | User | [ ] |

**Output:** Resend funcional, domínio verificado, audiences criadas.

---

## Sprint 3 — Form de Captura (Opt-in) (3h)

| # | Tarefa | Tempo | Quem | Status |
|---|---|---|---|---|
| 3.1 | Criar componente `<OptinForm>` em React/HTML | 1h | @aios-dev | [ ] |
| 3.2 | Criar Edge Function Netlify `/api/optin` que chama Resend API | 1h | @aios-dev | [ ] |
| 3.3 | Adicionar form INLINE na seção hero da LP principal | 30 min | @aios-dev | [ ] |
| 3.4 | Adicionar POPUP modal com 5s delay (ou exit-intent) | 30 min | @aios-dev | [ ] |
| 3.5 | Adicionar form nas 3 LPs verticais (advogado, mei, professor) com pré-seleção de profissão | 30 min | @aios-dev | [ ] |
| 3.6 | Configurar evento `Lead` no pixel Meta (disparo no submit) | 15 min | @aios-dev | [ ] |
| 3.7 | Testar fluxo (preencher form → email no inbox) | 30 min | User | [ ] |

**Output:** Form de opt-in funcional em todas as 4 LPs.

---

## Sprint 4 — Email Templates no Resend (4h)

| # | Tarefa | Tempo | Quem | Status |
|---|---|---|---|---|
| 4.1 | Copiar texto do E1 (doc 02) → criar template HTML simples no Resend | 30 min | User | [ ] |
| 4.2 | Repetir para E2 | 30 min | User | [ ] |
| 4.3 | Repetir para E3 | 30 min | User | [ ] |
| 4.4 | Repetir para E4 | 30 min | User | [ ] |
| 4.5 | Repetir para E5 | 30 min | User | [ ] |
| 4.6 | Repetir para E6 | 30 min | User | [ ] |
| 4.7 | Repetir para E7 | 30 min | User | [ ] |
| 4.8 | Adicionar botões CTA (HTML buttons) e variáveis `{{first_name}}` | 30 min | User | [ ] |
| 4.9 | Testar envio de cada template (preview e teste em email real) | 30 min | User | [ ] |

**Output:** 7 templates criados, testados, prontos para automation.

**Dica:** salve os templates em arquivo `/email-templates/` no repo Vorza para versionamento.

---

## Sprint 5 — Automation (Sequence) (2h)

| # | Tarefa | Tempo | Quem | Status |
|---|---|---|---|---|
| 5.1 | Verificar se Resend Sequences (GA) está disponível no plano free | 10 min | User | [ ] |
| 5.2 | Se SIM: configurar Sequence "Vorza Welcome 7 emails" | 1h | User | [ ] |
| 5.3 | Se NÃO: implementar via Trigger.dev OU Cron Edge Function (alternativa técnica) | 2h | @aios-dev | [ ] |
| 5.4 | Configurar trigger: "Quando contato é adicionado à audience X, inicia sequence" | 15 min | User | [ ] |
| 5.5 | Testar fluxo end-to-end: opt-in → recebe E1 imediato → recebe E2 dia seguinte | 30 min | User | [ ] |

**Output:** Sequence rodando automaticamente.

---

## Sprint 6 — Meta Paralelo Setup (3h)

| # | Tarefa | Tempo | Quem | Status |
|---|---|---|---|---|
| 6.1 | Pausar campanha antiga (já PAUSED, manter) | 0 | User | [✅] |
| 6.2 | Criar nova campanha `VRZ-LEAD-MAGNET-MAY26` (objetivo Lead) | 15 min | User | [ ] |
| 6.3 | Configurar 3 adsets (Adv/MEI/Prof) com R$6.67/d cada | 30 min | User | [ ] |
| 6.4 | Subir AD-VID-ADV (vídeo 30s para advogados) | 1h | User + Designer | [ ] |
| 6.5 | Subir AD-IMG-ADV (carrossel 3 slides) | 30 min | User + Designer | [ ] |
| 6.6 | Repetir 6.4 e 6.5 para MEI e Professor | 3h | User + Designer | [ ] |
| 6.7 | Configurar UTMs nos links | 15 min | User | [ ] |
| 6.8 | Validar pixel `Lead` está disparando | 15 min | User | [ ] |
| 6.9 | Ativar campanha (Meta R$20/d total) | 5 min | User | [ ] |

**Output:** Meta paralelo LIVE, 3 adsets segmentados rodando.

**Total Sprint 6:** ~5.5h se incluir todos 3 nichos. Se começar SÓ advogado: ~2h.

---

## Sprint 7 — Webhook Kiwify → Resend (2h)

| # | Tarefa | Tempo | Quem | Status |
|---|---|---|---|---|
| 7.1 | Criar Edge Function Netlify `/api/kiwify-webhook` | 1h | @aios-dev | [ ] |
| 7.2 | Configurar webhook no Kiwify (events: `order.completed`, `order.refunded`) | 15 min | User | [ ] |
| 7.3 | Lógica: ao receber `order.completed`, adicionar tag `customer` no Resend e remover do sequence | 30 min | @aios-dev | [ ] |
| 7.4 | Testar com 1 compra real (sandbox ou compra própria com refund) | 15 min | User | [ ] |

**Output:** Customers Kiwify automaticamente sincronizados com Resend.

---

## Sprint 8 — Dashboards e Tracking (1.5h)

| # | Tarefa | Tempo | Quem | Status |
|---|---|---|---|---|
| 8.1 | Criar Google Sheet com colunas do dashboard diário (doc 06 §5.1) | 15 min | User | [ ] |
| 8.2 | Bookmark Resend dashboard (audiences + analytics) | 5 min | User | [ ] |
| 8.3 | Bookmark Meta Ads Manager (filtro: campanha VRZ-LEAD-MAGNET) | 5 min | User | [ ] |
| 8.4 | Bookmark Kiwify dashboard (sales) | 5 min | User | [ ] |
| 8.5 | Configurar alerta Meta: saldo <R$50 | 10 min | User | [ ] |
| 8.6 | Configurar alerta Resend: spam complaint >0.1% | 10 min | User | [ ] |
| 8.7 | Agendar revisão semanal recorrente (toda segunda 9h-9:30h) | 5 min | User | [ ] |
| 8.8 | Agendar Gate D+14 (calendário) | 5 min | User | [ ] |
| 8.9 | Agendar Gate D+30 (calendário) | 5 min | User | [ ] |

**Output:** Visibilidade operacional completa.

---

## Sprint 9 — GO LIVE (30 min)

| # | Tarefa | Tempo | Quem | Status |
|---|---|---|---|---|
| 9.1 | Smoke test final: opt-in pelo seu próprio email → recebe E1 → clica link → vai pra Kiwify | 15 min | User | [ ] |
| 9.2 | Postar lead magnet em 1 lugar de tráfego orgânico (LinkedIn, Instagram, comunidade) | 15 min | User | [ ] |
| 9.3 | Confirmar Meta campanha ATIVA + saldo OK | 5 min | User | [ ] |
| 9.4 | Anotar timestamp do GO LIVE (para calcular D+14, D+30) | 1 min | User | [ ] |
| 9.5 | Respirar. O resto é otimização. | — | — | [ ] |

**Output:** SISTEMA EMAIL COMPLETO RODANDO.

---

## Sprint 10 — Otimização Contínua (recorrente)

### Diário (5 min)
- [ ] Verificar Google Sheet com leads + spend + sales
- [ ] Verificar Meta saldo
- [ ] Responder emails de leads que responderem (Reply é GOLD para deliverability)

### Semanal (30 min, segunda 9h)
- [ ] Revisar OR e CTR da semana
- [ ] Pausar pior criativo Meta (CPL >R$5)
- [ ] A/B testar próxima variante de subject (E5 ou E7)
- [ ] Validar lista crescimento %

### Mensal (1h, 1º domingo do mês)
- [ ] Cohort analysis
- [ ] Calcular EPL, LTV, ROAS
- [ ] Decidir: escalar Meta? Mudar lead magnet? Lançar back-end?
- [ ] Atualizar este checklist com lessons learned

---

## Resumo de Tempo Total

| Sprint | Tempo |
|---|---|
| Sprint 0 — Decisões | 1h |
| Sprint 1 — Lead Magnet (1 nicho) | 4h |
| Sprint 2 — Resend Setup | 3h |
| Sprint 3 — Form de Captura | 3h |
| Sprint 4 — Templates | 4h |
| Sprint 5 — Automation | 2h |
| Sprint 6 — Meta Paralelo (1 nicho) | 2h |
| Sprint 7 — Webhook Kiwify | 2h |
| Sprint 8 — Dashboards | 1.5h |
| Sprint 9 — GO LIVE | 0.5h |
| **TOTAL para 1 NICHO (advogado)** | **~23h** |

**Distribuído em 5-7 dias úteis (~3-5h/dia):**
- Dia 1: Sprints 0+1 (decisões + lead magnet)
- Dia 2: Sprints 2+3 (Resend + form)
- Dia 3: Sprint 4 (templates emails)
- Dia 4: Sprints 5+7 (automation + webhook)
- Dia 5: Sprints 6+8+9 (Meta + dashboards + GO LIVE)

**Para adicionar MEI e Professor depois:** +6-8h cada (lead magnet + 2 ads + ajustes copy).

---

## Bloqueadores Conhecidos

| Bloqueador | Mitigação |
|---|---|
| DNS demorar verificação Resend | Confirmar com provider que TXT records foram propagados (pode levar 24h) |
| Meta rejeitar ads (nicho IA) | Reescrever copy SEM "make money" / "automatize"; foco em "economia de tempo" |
| Templates HTML quebram em mobile | Testar em Litmus antes de blast; usar MJML para responsivo |
| User não tem tempo para 23h em 1 semana | Estender prazo para 14 dias (3h/dia em vez de 5h/dia) |
| Lead magnet PDF muito básico | Pedir feedback de 3 amigos do nicho antes de publicar |
| Form de opt-in convertendo <3% | A/B testar 3 versões headline + CTA |

---

## Ordem de Execução Recomendada (Otimizada)

**Se você só pode trabalhar 2-3h/dia:**

1. **Dia 1 (manhã):** Sprint 0 (decisões) + Sprint 2 (Resend)
2. **Dia 1 (tarde):** Sprint 1.1-1.3 (escrever prompts)
3. **Dia 2 (manhã):** Sprint 1.4 (PDF diagramado) + 3.1-3.2 (form Edge Function)
4. **Dia 2 (tarde):** Sprint 3.3-3.6 (form em LPs)
5. **Dia 3:** Sprint 4 (templates)
6. **Dia 4 (manhã):** Sprint 5 (automation) + Sprint 7 (webhook)
7. **Dia 4 (tarde):** Sprint 8 (dashboards)
8. **Dia 5 (manhã):** Sprint 6 (Meta paralelo, só Advogado primeiro)
9. **Dia 5 (tarde):** Sprint 9 (GO LIVE) + smoke test

**MEI e Professor:** Dia 8-10 (depois de validar advogado funciona).

---

## Quem Faz O Quê

| Atividade | Responsável Principal | Suporte |
|---|---|---|
| Decisões estratégicas | User | Orion (consulta) |
| Escrever prompts | User OR Copy Chief | — |
| Diagramar PDF | User OR @ux-design-expert | — |
| Setup Resend | User | @aios-dev (DNS) |
| Form de captura (código) | @aios-dev | User (validação) |
| Templates email (texto) | User | Copy Chief (review) |
| Automation Resend | User | @aios-dev (se Trigger.dev) |
| Setup Meta Ads | User | — |
| Criativos Meta (vídeo + imagem) | User OR Designer freelancer | — |
| Webhook Kiwify (código) | @aios-dev | User (config Kiwify) |
| Dashboards | User | — |
| Otimização contínua | User | Orion (consulta semanal) |

---

## Critério de Sucesso da Implementação

**SUCESSO = a primeira pessoa REAL que não é você opta-in pelo lead magnet, recebe os 7 emails, e (se possível) compra.**

Isso valida:
- Form funcionando
- Resend deliverando
- Sequence rodando
- Pixel disparando
- Kiwify integrado
- Webhook sincronizando

**Sem essa primeira pessoa real, está atirando no escuro.**

**Recomendação:** após GO LIVE, postar lead magnet em 2-3 grupos de WhatsApp / LinkedIn de advogados e medir as primeiras 10 respostas pessoalmente (responder cada um).

---

## Considerações Finais

- Esta sprint substitui a campanha Meta paga que estava drenando R$233 sem retorno em 7 dias.
- Investimento em TEMPO: ~23h de trabalho concentrado.
- Investimento em DINHEIRO: R$0 (Resend free tier) + R$600 Meta paralelo (1º mês).
- Resultado esperado em 30 dias (cenário REALISTA): 200-300 leads, 3-5 vendas, R$135-385 receita, ROAS ~0.4x.
- Resultado FINAL é construção de ATIVO (lista) — monetização real começa em 60-90 dias com newsletter sustentada e back-end.

**Se em 30 dias estiver em cenário PESSIMISTA, ler doc 00 §7 "Recomendação Contrária" e considerar fazer as 5 entrevistas com não-compradores antes de qualquer outro pivô.**

---

— *Implementation checklist completo. 8 documentos de pivô prontos. ROD ATÉ O FIM. Boa noite, Breno.*
