# Golden Ratios Veto Checklist

> **Source:** $100M Offers + prompts-joao KB/v2.0/07_TESTING_OPTIMIZATION.md
> **Pattern:** SC-CK-VETO-003 (Veto Checklist - Blocks Scaling)
> **Version:** 1.0.0
> **Created:** 2026-02-10
> **Type:** VETO CONDITION - Must PASS before scaling
> **Agent:** hormozi-chief

---

## CRITICAL: Nao Escale um Modelo Quebrado

**"Tentar consertar um modelo de negocio quebrado injetando mais volume (marketing) apenas ACELERA o caminho para a falencia."**

Este checklist BLOQUEIA scaling se os ratios fundamentais nao estiverem saudaveis.

---

## Os 2 Ratios de Ouro (Non-Negotiable)

### Ratio 1: LTV:CAC >= 3:1

**Definicao:**
- **LTV (Lifetime Value):** Lucro Bruto acumulado durante toda a vida do cliente
- **CAC (Customer Acquisition Cost):** Custo total para adquirir um cliente

**Por que 3:1?**
- 1:1 = break-even (nenhum lucro para reinvestir)
- 2:1 = margem apertada (nao sobra para erro)
- 3:1 = negocio saudavel (margem para crescer e errar)
- 5:1+ = excelente (pode investir agressivamente)

### Ratio 2: FECC:CAC >= 2:1

**Definicao:**
- **FECC (Front End Cash Collected):** Caixa coletado na primeira transacao
- **CAC (Customer Acquisition Cost):** Custo para adquirir o cliente

**Por que 2:1?**
- Garante que o CAIXA da primeira venda paga o proximo cliente
- Elimina fluxo de caixa como GARGALO para crescimento
- Permite crescimento AUTOFINANCIADO (sem depender de investimento)

---

## GATE 1: Calculo do LTV

### Step 1: Lucro Bruto por Transacao

```
Receita Media por Venda:          $_______
(-) Custo Direto de Entrega:      $_______
(=) Lucro Bruto por Venda:        $_______
```

**Nota:** Custo Direto = apenas custo de atender cliente ADICIONAL (nao inclui overhead)

### Step 2: Numero de Transacoes

```
Numero medio de compras por cliente:     _______
Periodo medio de vida do cliente:        _______ meses
Frequencia media de compra:              _______ vezes/ano
```

### Step 3: Calculo Final do LTV

```
LTV = Lucro Bruto por Venda x Numero de Transacoes

LTV = $_______ x _______ = $_______
```

**Seu LTV: $___________**

---

## GATE 2: Calculo do CAC

### Step 1: Custos de Marketing

```
Gastos com Ads (mensal):              $_______
Gastos com Conteudo (mensal):         $_______
Ferramentas de Marketing (mensal):    $_______
Equipe de Marketing (mensal):         $_______
TOTAL Marketing Mensal:               $_______
```

### Step 2: Custos de Vendas

```
Salarios de Vendedores (mensal):      $_______
Comissoes Pagas (mensal):             $_______
Ferramentas de Vendas (mensal):       $_______
TOTAL Vendas Mensal:                  $_______
```

### Step 3: Calculo Final do CAC

```
Total de Novos Clientes no Mes:       _______
Total Gasto (Marketing + Vendas):     $_______

CAC = Total Gasto / Novos Clientes

CAC = $_______ / _______ = $_______
```

**Seu CAC: $___________**

---

## GATE 3: Calculo do FECC

### Step 1: Receita da Primeira Transacao

```
Preco do Produto/Servico Principal:   $_______
(+) Upsells na Primeira Compra:       $_______
(+) Order Bumps:                      $_______
(=) Receita Total Primeira Venda:     $_______
```

### Step 2: Caixa Coletado

```
Se venda a vista:
FECC = Receita Total = $_______

Se parcelado:
FECC = Entrada + Primeiras Parcelas Recebidas = $_______

Se assinatura:
FECC = Primeiro Pagamento = $_______
```

**Seu FECC: $___________**

---

## GATE 4: Validacao dos Ratios

### Ratio 1: LTV:CAC

```
LTV:CAC = LTV / CAC = $_______ / $_______ = _______:1
```

| Ratio | Status | Acao |
|-------|--------|------|
| >= 5:1 | EXCELENTE | Escalar agressivamente |
| 3:1 - 5:1 | SAUDAVEL | Escalar com monitoramento |
| 2:1 - 3:1 | ALERTA | Otimizar antes de escalar |
| < 2:1 | **VETO** | NAO escalar - modelo quebrado |

**Seu Status LTV:CAC:** [ ] EXCELENTE [ ] SAUDAVEL [ ] ALERTA [ ] **VETO**

---

### Ratio 2: FECC:CAC

```
FECC:CAC = FECC / CAC = $_______ / $_______ = _______:1
```

| Ratio | Status | Acao |
|-------|--------|------|
| >= 3:1 | EXCELENTE | Crescimento autofinanciado facil |
| 2:1 - 3:1 | SAUDAVEL | Crescimento autofinanciado possivel |
| 1:1 - 2:1 | ALERTA | Precisa de capital de giro |
| < 1:1 | **VETO** | Queima de caixa - NAO escalar |

**Seu Status FECC:CAC:** [ ] EXCELENTE [ ] SAUDAVEL [ ] ALERTA [ ] **VETO**

---

## VETO DECISION

### Consolidacao

| Ratio | Valor | Status |
|-------|-------|--------|
| LTV:CAC | :1 | [ ] PASS [ ] VETO |
| FECC:CAC | :1 | [ ] PASS [ ] VETO |

### Regra de Veto

```
SE LTV:CAC < 3:1 → VETO (nao escalar)
SE FECC:CAC < 2:1 → VETO (nao escalar sem capital externo)
SE ambos PASS → Liberado para escalar
```

### Decisao Final

- [ ] **PASS** - Ambos ratios saudaveis. Pode escalar.
- [ ] **VETO LTV:CAC** - Modelo de negocio nao e lucrativo o suficiente.
- [ ] **VETO FECC:CAC** - Ciclo de caixa quebrado, precisa de capital externo.
- [ ] **DOUBLE VETO** - Modelo fundamentalmente quebrado.

---

## Se VETO: Alavancas para Corrigir

### Para Melhorar LTV:CAC

**Aumentar LTV:**
- [ ] Aumentar preco (sem afetar volume significativamente)
- [ ] Criar upsells/cross-sells
- [ ] Implementar modelo de recorrencia
- [ ] Aumentar retencao (reduzir churn)
- [ ] Aumentar frequencia de compra
- [ ] Criar programa de indicacao

**Diminuir CAC:**
- [ ] Otimizar funil de conversao (CVR)
- [ ] Melhorar targeting de ads
- [ ] Investir em canais organicos (conteudo)
- [ ] Criar programa de referral
- [ ] Melhorar script de vendas

---

### Para Melhorar FECC:CAC

**Aumentar FECC:**
- [ ] Aumentar preco do front-end
- [ ] Adicionar order bumps
- [ ] Adicionar upsell imediato pos-compra
- [ ] Reduzir parcelamento (ou oferecer desconto a vista)
- [ ] Criar pacotes premium

**Diminuir CAC:**
- [ ] Mesmas taticas do LTV:CAC acima

---

## Metricas Auxiliares para Diagnostico

### Metricas de Aquisicao

```
CPL (Custo por Lead):        $_______
CVR (Taxa de Conversao):     _______%
CTR (Taxa de Cliques):       _______%
CPC (Custo por Clique):      $_______
```

### Metricas de Retencao

```
Taxa de Churn Mensal:        _______%
Taxa de Retencao Mensal:     _______%
Tempo Medio de Vida:         _______ meses
NPS (Net Promoter Score):    _______
```

### Red Flags

- [ ] Churn > 5% mensal para SaaS
- [ ] Churn > 10% mensal para servicos
- [ ] CVR < 1% para cold traffic
- [ ] CVR < 10% para warm traffic
- [ ] NPS < 30

---

## Benchmarks por Industria

### LTV:CAC Targets

| Industria | Target Minimo | Excelente |
|-----------|---------------|-----------|
| SaaS B2B | 3:1 | 5:1+ |
| E-commerce | 3:1 | 4:1+ |
| Info-produtos | 4:1 | 7:1+ |
| Servicos High-Ticket | 5:1 | 10:1+ |
| Agencias | 4:1 | 6:1+ |

### FECC:CAC Targets (Bootstrapped)

| Modelo | Target Minimo | Excelente |
|--------|---------------|-----------|
| One-time Sale | 2:1 | 3:1+ |
| Subscription | 1.5:1 | 2:1+ |
| High-Ticket | 2.5:1 | 4:1+ |

---

## Frequencia de Monitoramento

### Semanal
- [ ] CAC tracking (se rodando ads ativos)
- [ ] Conversao do funil

### Mensal
- [ ] LTV:CAC completo
- [ ] FECC:CAC completo
- [ ] Churn analysis

### Trimestral
- [ ] Benchmark vs industria
- [ ] Trend analysis (melhorando ou piorando?)

---

## Gatilhos de Re-avaliacao

Execute este checklist novamente se:

- [ ] Mudanca de preco > 20%
- [ ] Novo canal de aquisicao adicionado
- [ ] Churn aumentou > 30% vs baseline
- [ ] Conversao caiu > 20% vs baseline
- [ ] Lancamento de novo produto/oferta
- [ ] Mudanca significativa no mercado/competicao

---

## Assinatura de Aprovacao

| Gate | Responsavel | Data | Status |
|------|-------------|------|--------|
| Golden Ratios Veto | | | [ ] PASS [ ] VETO |

**Plano de Acao se VETO:**
________________________________________________

**Proxima Revisao Agendada:** _______________

---

**Checklist Version:** 1.0.0
**Based on:** $100M Offers + Testing & Optimization Framework



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
