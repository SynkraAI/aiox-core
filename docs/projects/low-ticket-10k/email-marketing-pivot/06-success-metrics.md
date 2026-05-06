# 06 — Métricas de Sucesso, KPIs, Targets e Gate D+14

**Princípio (Hormozi):** "If you don't measure it, you can't manage it. If you can't manage it, you can't grow it."

---

## 1. KPIs Principais (4 níveis)

### Nível 1 — INPUT (o que controlamos)

| KPI | Definição | Source |
|---|---|---|
| **Spend Meta** | Gasto diário em Meta Ads | Meta Ads Manager |
| **Emails enviados** | Total de emails saindo no mês | Resend Dashboard |
| **Visitas LP (orgânico + paid)** | Total visits agregadas | Netlify Analytics + GA4 |

### Nível 2 — OUTPUT primário (o que o funil produz)

| KPI | Definição | Source |
|---|---|---|
| **Leads novos** | Opt-in confirmado (double opt-in) | Resend Audiences |
| **CPL (Cost per Lead)** | Spend Meta / Leads novos | Meta + Resend |
| **Lista total** | Subscribers ativos (não unsubscribed) | Resend Audiences |
| **Lista crescimento %** | Crescimento semana-sobre-semana | Calculado |

### Nível 3 — ENGAGEMENT (qualidade da lista)

| KPI | Definição | Source | Target BR |
|---|---|---|---|
| **Open Rate (OR)** | Emails abertos / emails enviados | Resend | 30-45% |
| **Click-Through Rate (CTR)** | Cliques únicos / emails enviados | Resend | 4-10% |
| **Click-to-Open Rate (CTOR)** | Cliques únicos / emails abertos | Resend | 12-25% |
| **Unsubscribe Rate** | Unsubs / emails enviados | Resend | <0.3% |
| **Spam Complaint Rate** | Marcas como spam / emails enviados | Resend | <0.1% |
| **Bounce Rate** | Emails não entregues / emails enviados | Resend | <2% |

### Nível 4 — REVENUE (o que paga as contas)

| KPI | Definição | Source |
|---|---|---|
| **Conversion Rate (lead → purchase)** | Sales / leads inscritos no mesmo período | Kiwify + Resend |
| **AOV (Average Order Value)** | Receita / # transações (inclui bump + upsell) | Kiwify |
| **EPL (Earnings Per Lead)** | Receita total no período / leads novos | Calculado |
| **ROAS Meta** | Receita atribuída / spend Meta | Meta + Kiwify |
| **LTV (Lifetime Value)** | Receita total / clientes únicos | Kiwify (90d window) |
| **Receita Mensal** | Total faturado no mês | Kiwify |

---

## 2. Targets Numéricos (3 cenários)

### 2.1. Cenário Pessimista (PROBABILIDADE 30%)

| KPI | Mês 1 | Mês 2 | Mês 3 |
|---|---|---|---|
| Leads novos | 100 | 120 | 150 |
| Lista total | 100 | 220 | 370 |
| CPL Meta | R$5+ | R$4 | R$3.50 |
| Open Rate | 25% | 28% | 30% |
| CTR | 3% | 3.5% | 4% |
| Conv (lead → purchase) | 0.5% | 0.8% | 1.0% |
| Sales/mês | 1 | 2 | 4 |
| AOV | R$32 | R$36 | R$40 |
| Receita/mês | R$32 | R$72 | R$160 |
| Spend Meta | R$600 | R$600 | R$600 |
| ROAS | 0.05x | 0.12x | 0.27x |
| **Resultado** | **-R$568** | **-R$528** | **-R$440** |

### 2.2. Cenário Realista (PROBABILIDADE 50%)

| KPI | Mês 1 | Mês 2 | Mês 3 |
|---|---|---|---|
| Leads novos | 200 | 240 | 290 |
| Lista total | 200 | 440 | 730 |
| CPL Meta | R$3 | R$2.50 | R$2 |
| Open Rate | 35% | 38% | 40% |
| CTR | 5% | 6% | 7% |
| Conv (lead → purchase) | 1.5% | 2.0% | 2.5% |
| Sales/mês | 3 | 5 | 7 |
| AOV | R$45 | R$50 | R$55 |
| Receita/mês | R$135 | R$250 | R$385 |
| Spend Meta | R$600 | R$600 | R$600 |
| ROAS | 0.22x | 0.42x | 0.64x |
| **Resultado** | **-R$465** | **-R$350** | **-R$215** |

### 2.3. Cenário Otimista (PROBABILIDADE 20%)

| KPI | Mês 1 | Mês 2 | Mês 3 |
|---|---|---|---|
| Leads novos | 350 | 450 | 600 |
| Lista total | 350 | 800 | 1.400 |
| CPL Meta | R$1.70 | R$1.30 | R$1.00 |
| Open Rate | 45% | 48% | 50% |
| CTR | 8% | 10% | 12% |
| Conv (lead → purchase) | 3% | 4% | 5% |
| Sales/mês | 10 | 18 | 30 |
| AOV | R$60 | R$70 | R$80 |
| Receita/mês | R$600 | R$1.260 | R$2.400 |
| Spend Meta | R$600 | R$600 | R$600 |
| ROAS | 1.0x | 2.1x | 4.0x |
| **Resultado** | **R$0** | **+R$660** | **+R$1.800** |

---

## 3. Gate D+14 — Critério GO/NO-GO

### 3.1. Métricas avaliadas em D+14 (2 semanas após primeiro email)

| Métrica | Threshold MÍNIMO (GO) | Threshold IDEAL |
|---|---|---|
| **Lista total** | ≥ 100 leads | ≥ 200 leads |
| **Open Rate médio (E1-E4)** | ≥ 30% | ≥ 38% |
| **CTR médio (E1-E4)** | ≥ 4% | ≥ 6% |
| **Spam complaint rate** | ≤ 0.2% | ≤ 0.05% |
| **Unsubscribe rate** | ≤ 0.5% | ≤ 0.2% |
| **Conversion (E5 first sale)** | ≥ 1 venda | ≥ 3 vendas |
| **Bump take rate** | — (informacional) | ≥ 25% |

### 3.2. Decisão Gate D+14

| Cenário | Métricas | Decisão | Próxima Ação |
|---|---|---|---|
| **A. STRONG GO** | Todas ≥ ideal | ✅ ESCALAR | Meta R$20 → R$50/d, lança Newsletter, planeja back-end |
| **B. GO COM AJUSTES** | Maioria ≥ mínimo | 🟢 MANTER | Otimizar 2-3 fraquezas, repete sequência para novos leads |
| **C. PIVÔ DE OFERTA** | Lista cresce mas zero conversion | 🟡 PIVÔ | Hormozi tinha razão — refazer oferta (preço ou produto) |
| **D. PIVÔ DE LEAD MAGNET** | Lista NÃO cresce (opt-in <3%) | 🟡 PIVÔ | Mudar lead magnet (vídeo? checklist? quiz?) |
| **E. KILL** | Tudo abaixo do mínimo | 🔴 PARAR | Cancelar Meta, manter newsletter mensal só para os ~100 leads coletados, redirecionar foco |

### 3.3. Como avaliar "STRONG GO" vs "GO COM AJUSTES"

**STRONG GO requer (TODOS):**
- ≥200 leads em 14d
- OR ≥38%
- CTR ≥6%
- ≥3 vendas
- Bump take rate ≥30%

**GO COM AJUSTES requer (TODOS os mínimos):**
- ≥100 leads
- OR ≥30%
- CTR ≥4%
- ≥1 venda
- Spam <0.2%

**PIVÔ se:**
- Lista <100 OU OR <30% OU CTR <4% OU 0 vendas

---

## 4. Gate D+30 — Re-avaliação Estratégica

**Objetivo:** decidir se o pivô email está funcionando ou se precisa pivotar de novo.

### 4.1. Métricas avaliadas em D+30

| Métrica | Threshold (GO) |
|---|---|
| Lista total | ≥ 250 leads |
| Conversion D+30 (% que comprou em 30d) | ≥ 1.5% |
| AOV | ≥ R$40 (com bump + upsell) |
| Receita acumulada | ≥ R$200 |
| EPL (Earning Per Lead) | ≥ R$0.80 |
| ROAS Meta | ≥ 0.50x (50% do investido recuperado) |
| Lista engajada (% que abriu pelo menos 1 dos últimos 4 emails) | ≥ 60% |

### 4.2. Decisão Gate D+30

| Cenário | Decisão | Próxima Ação |
|---|---|---|
| **GO** (todas threshold) | ✅ Escalar | Meta R$50/d, planejar back-end R$497 |
| **MANTER** (maioria) | 🟢 Continuar | Re-avaliar D+60 |
| **PIVÔ** (lista cresce mas conversion <1%) | 🟡 Mudar oferta | Front-end R$47 ou novo lead magnet |
| **KILL** (tudo abaixo) | 🔴 Cancelar email + Meta | Foco em outro projeto |

---

## 5. Dashboards e Tracking

### 5.1. Dashboard Diário (verificar 5 min/dia)

**Plataforma:** Google Sheets ou Notion (não precisa BI complexo).

**Colunas:**
- Data
- Leads novos (do dia)
- Spend Meta
- CPL (calculado: Spend / Leads)
- Lista total acumulada
- Sales (do dia)
- Receita (do dia)
- Notas

### 5.2. Dashboard Semanal (revisão 30 min toda segunda)

**Métricas agregadas semana:**
- Lista crescimento (% vs semana anterior)
- Open Rate semanal médio
- CTR semanal médio
- Conversion lead→purchase semanal
- Receita semanal
- ROAS semanal

**Decisões a tomar semanalmente:**
- Pausar/ativar adsets Meta com base em CPL
- A/B testar novo subject line se OR <30%
- Adicionar novo email de re-engagement se OR cair >5%

### 5.3. Dashboard Mensal (revisão estratégica 1h por mês)

**Análises:**
- LTV vs CAC
- Lista qualidade (% leads engajados vs zumbis)
- Tier dos leads (advogado vs MEI vs professor — qual converte mais?)
- Cohort analysis (leads do mês X vs Y)
- Próximos investimentos (back-end? mais ads? novo nicho?)

---

## 6. Eventos a Trackear (Pixel + Resend Webhooks)

### 6.1. Pixel Meta

| Evento | Quando dispara | Custom Conversions |
|---|---|---|
| `PageView` | Visita LP | — |
| `ViewContent` | View 25% LP | — |
| `Lead` | Submeteu form | OPTIMIZATION GOAL |
| `CompleteRegistration` | Confirmou email (double opt-in) | Lead qualificado |
| `InitiateCheckout` | Clicou link Kiwify | Funnel intent |
| `AddPaymentInfo` | Preencheu dados pagamento | Mid-funnel |
| `Purchase` | Comprou (de qualquer SKU) | ROAS |
| `PurchaseBump` | Comprou bump | Custom |
| `PurchaseUpsell` | Comprou upsell | Custom |

### 6.2. Resend Webhooks

| Evento | Action |
|---|---|
| `email.sent` | Log em DB |
| `email.delivered` | Confirma entrega |
| `email.opened` | Trigger pixel `EmailOpened` (custom conv Meta) |
| `email.clicked` | Trigger pixel `EmailClicked` |
| `email.bounced` | Remove da lista, log motivo |
| `email.complained` | URGENTE — investigar |
| `contact.created` | Confirma opt-in, dispara welcome |
| `contact.updated` | Resincronizar tags |

### 6.3. Kiwify Webhooks

| Evento | Action |
|---|---|
| `order.completed` | Adicionar tag `customer` no Resend, parar sequência |
| `order.refunded` | Adicionar tag `refunded`, monitorar |
| `subscription.cancelled` | (futuro back-end) |

---

## 7. Alertas Automáticos (configurar no Resend / Meta)

| Alerta | Threshold | Ação |
|---|---|---|
| Spam complaint rate > 0.1% em 24h | URGENTE | Pausar envios, investigar conteúdo |
| Bounce rate > 5% em 24h | ALTO | Verificar lista, possível compra de leads ruins |
| OR cair >10% em 1 semana | MÉDIO | Mudar subject lines, considerar re-engagement |
| CTR cair >20% em 1 semana | MÉDIO | Revisar copy, A/B test CTAs |
| CPL Meta > R$5 por 3 dias seguidos | ALTO | Pausar criativo perdedor, testar novos |
| Saldo Meta < R$50 | URGENTE | Recarregar (PIX) |
| Zero opt-ins em 24h | ALTO | Verificar form quebrado |

---

## 8. Métricas Que NÃO Devem Ser Otimizadas (vanity metrics)

| Métrica | Por que não otimizar |
|---|---|
| Number de impressões Meta | Não correlaciona com vendas |
| Followers Instagram | Não é lista de email, não é receita |
| Tempo na página (LP) | Pode subir por confusão, não engagement |
| Compartilhamentos do PDF | Bom mas não move agulha de receita |
| Tamanho da lista BRUTA (incluindo zumbis) | Lista engajada > lista grande indiferente (Godin) |

---

## 9. Como Apresentar Métricas para Decisão (Hormozi check)

**Princípio:** apresentar 1 NÚMERO PRINCIPAL por revisão, não dashboard de 50 KPIs.

| Reunião | Número principal |
|---|---|
| Diária (5min) | Leads novos do dia |
| Semanal (30min) | Lista crescimento % + Receita semanal |
| Mensal (1h) | EPL (Earning Per Lead) + ROAS mensal |
| Gate D+14 | Conversion lead→purchase no período |
| Gate D+30 | Receita acumulada vs spend acumulado |

**Se não conseguir explicar a estratégia em 1 frase com 1 número, está atirando no escuro.**

---

## 10. Worst Case — Sinais de Que Devemos Parar

**Se DEPOIS de 60 dias rodando:**
- Lista <300 leads
- Receita acumulada <R$500
- EPL <R$0.30
- ROAS <0.30x

**= KILL definitivo do canal email + Meta paralelo.**

**Próximas opções:**
1. Pivô para B2B / serviço high-ticket
2. Vorza vira side project (não foco)
3. Reposicionar produto inteiramente

**Honestidade radical:** se em 60 dias não saiu do chão, não é o canal. É a oferta, o público, ou o produto.

---

— *Métricas definidas. Targets numéricos. Gates D+14 e D+30 com critérios claros de GO/PIVÔ/KILL. Next: 07-implementation-checklist.md.*
