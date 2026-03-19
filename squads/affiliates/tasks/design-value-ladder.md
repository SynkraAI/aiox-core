# design-value-ladder

## Metadata
```yaml
task_id: AFF_FUN_004
agent: funnel-architect
type: creation
complexity: high
estimated_time: "1h-2h30min"
source: "Russell Brunson — DotCom Secrets (Value Ladder); Expert Secrets (Attractive Character + Value Stack)"
```

## Purpose
Desenhar a Value Ladder completa para a operação de afiliado, estruturando os quatro níveis de ascensão: Bait (gratuito), Frontend ($7-27), Core (produto afiliado principal) e Backend (premium/recorrente), com fluxo de subida e LTV estimado.

## Prerequisites
- Nicho e avatar do comprador definidos
- Pelo menos um produto afiliado identificado (será posicionado como Core ou Backend)
- Capacidade de criar ou curar conteúdo nos níveis Bait e Frontend
- Plataforma de entrega digital disponível (Hotmart, Gumroad, Paytip, etc.) para níveis pagos próprios

## Steps

1. **Mapear o produto afiliado na escada** — Identificar em qual nível da Value Ladder o produto afiliado se encaixa (Frontend, Core ou Backend) com base no preço e na transformação entregue.

2. **Definir o nível Bait (gratuito)** — Criar ou selecionar o lead magnet que serve como porta de entrada. Deve resolver UM problema específico conectado ao produto afiliado. Meta: opt-in rate > 25%.

3. **Definir o nível Frontend ($7-27 — Tripwire)** — Produto de baixo custo (próprio ou co-produzido) cujo objetivo é converter assinante em comprador. O tripwire pode dar prejuízo — o objetivo é CRIAR O PRIMEIRO COMPRADOR.

4. **Posicionar o Core (produto afiliado principal)** — Definir a oferta central da escada. Na maioria das operações de afiliado, este é o produto que gera a maior parte da receita de comissões.

5. **Definir o Backend (premium + recorrente)** — Identificar produto(s) de ticket alto ou recorrente para maximizar LTV. Pode ser: outro produto afiliado de alto ticket, mentoria própria, ou comunidade.

6. **Mapear o fluxo de ascensão** — Descrever como o cliente sobe de um nível ao outro: triggers, emails de ascensão, upsells dentro do funil.

7. **Calcular o LTV estimado** — Projetar receita de um cliente que percorre todos os níveis. Comparar com CAC estimado para validar viabilidade.

8. **Identificar quick wins** — Determinar quais níveis podem ser lançados primeiro (geralmente Bait + Core) e quais são construídos progressivamente.

9. **Documentar a Value Ladder** — Salvar no arquivo de output com estrutura visual e plano de implementação.

## Framework

### Os Quatro Níveis da Value Ladder para Afiliados

```
CONTINUITY ────── Comunidade/Assinatura própria (R$47-297/mês)
     ↑                     Objetivo: receita recorrente previsível
BACKEND ─────────── Produto afiliado high ticket OU mentoria própria (R$997+)
     ↑                     Objetivo: margem máxima, LTV máximo
CORE ────────────── Produto afiliado principal (R$97-997)
     ↑                     Objetivo: maior volume de comissões
FRONTEND ────────── Produto próprio de entrada (R$7-27)
     ↑                     Objetivo: criar o primeiro comprador
BAIT ────────────── Lead magnet gratuito
                           Objetivo: captar email/WhatsApp
```

### Detalhamento por Nível

| Nível | Preço | Objetivo Principal | Produto Afiliado? | Métrica de Sucesso |
|-------|-------|-------------------|------------------|-------------------|
| Bait | Gratuito | Captar lead | Não | Opt-in rate > 25% |
| Frontend | R$7-27 | Criar comprador | Possível (se existir) | Conv. > 5% da lista |
| Core | R$97-997 | Receita de comissões | Sim — produto principal | EPC > R$2,00 |
| Backend | R$997+ | LTV máximo | Sim — high ticket | 5-10% dos clientes Core |
| Continuity | R$47-297/mês | Receita recorrente | Possível | Churn < 5%/mês |

### Cálculo de LTV Estimado

```
LTV = (Taxa Bait→Frontend × Preço Frontend)
    + (Taxa Frontend→Core × Comissão Core)
    + (Taxa Core→Backend × Comissão Backend)
    + (Taxa Core→Continuity × Ticket Continuity × Meses Médios)

Exemplo:
- 1.000 leads → 100 Frontend (10%) × R$17 = R$1.700
- 100 Frontend → 30 Core (30%) × R$194 comissão = R$5.820
- 30 Core → 3 Backend (10%) × R$500 comissão = R$1.500
- 30 Core → 5 Continuity (17%) × R$97/mês × 8 meses = R$3.880

LTV por 1.000 leads = R$12.900
LTV por lead = R$12,90
CAC máximo sustentável = R$4,30 (33% do LTV)
```

### Fluxo de Ascensão

```
[OPT-IN] → Email boas-vindas entrega Bait
    ↓
[SOAP OPERA SEQUENCE — 5 emails] → Oferta Frontend no email 5
    ↓
[COMPRA FRONTEND] → Email de entrega + Upsell Core imediato (order bump ou OTO)
    ↓
[COMPRA CORE] → Sequência de nutrição → Oferta Backend (email 14/30)
    ↓
[COMPRA BACKEND] → Oferta Continuity (upsell ou email separado)
```

### Exemplo de Value Ladder para Afiliado de Finanças

```
BAIT: eBook gratuito "10 Investimentos Para Quem Ganha Até R$3.000/mês"
FRONTEND: Mini-curso próprio R$17 "Reserva de Emergência em 90 Dias"
CORE: Curso afiliado "Investidor Inteligente" — comissão R$297 (50% de R$594)
BACKEND: Mentoria afiliada "Gestão Patrimonial" — comissão R$997 (30% de R$3.297)
CONTINUITY: Comunidade afiliada de investimentos — comissão R$47/mês
```

## Veto Conditions
- Value Ladder sem nível Bait (gratuito) → BLOQUEAR (sem captação de leads, sem controle da audiência)
- Frontend acima de R$97 → REPROVAR (derrota o propósito do tripwire — barreira psicológica do primeiro pagamento deve ser baixa)
- Nível Core sem produto afiliado identificado → BLOQUEAR (a escada não tem substância)
- LTV estimado menor que 3x o CAC projetado → ALERTAR (economia não fecha — revisar níveis ou canais de tráfego)
- Value Ladder sem fluxo de ascensão definido → ALERTAR (os níveis existem mas o cliente não tem como subir automaticamente)
- Mais de 6 níveis na escada → ALERTAR (complexidade desnecessária — simplificar)

## Output
- **File:** `outputs/affiliates/{projeto-slug}/value-ladder.md`
- **Format:** Markdown com estrutura visual ASCII + especificações por nível + cálculo de LTV

## Output Example
```yaml
value_ladder:
  project: "afiliado-saude-feminina"
  niche: "saúde e bem-estar feminino 30-50 anos"
  avatar: "Mulher 35-48 anos, mãe, sente que perdeu a energia e forma física"

levels:
  bait:
    name: "Checklist: 7 Hábitos de Saúde Para Mulheres Ocupadas"
    format: "PDF 1 página"
    price: "Gratuito"
    delivery: "Email imediato"
    objective: "Captar email e iniciar relacionamento"
    target_optin_rate: "35%"

  frontend:
    name: "Mini-curso: Energia em 14 Dias"
    format: "4 vídeos curtos + guia PDF"
    price: "R$17"
    delivery: "Área de membros própria (Hotmart ou Teachable)"
    objective: "Converter lead em comprador — quebrar barreira do 1º pagamento"
    target_conversion: "8% da lista"
    affiliate: false

  core:
    name: "Programa Mulher Renovada — 12 semanas"
    format: "Curso completo afiliado"
    price: "R$497 (público) / R$297 comissão (60%)"
    platform: "Hotmart"
    affiliate_link: "[inserir]"
    objective: "Receita principal de comissões"
    target_conversion: "15% dos compradores Frontend"
    target_epc: "R$2.50"

  backend:
    name: "Mentoria Transformação Total — 6 meses"
    format: "Programa afiliado high ticket"
    price: "R$2.997 (público) / R$900 comissão (30%)"
    objective: "LTV máximo"
    target_conversion: "8% dos compradores Core"

  continuity:
    name: "Clube Mulher em Forma — acesso mensal"
    format: "Comunidade afiliada"
    price: "R$97/mês / R$29/mês comissão (30%)"
    objective: "Receita recorrente"
    target_conversion: "20% dos compradores Core"
    target_churn: "< 5%/mês"

ltv_calculation:
  per_1000_leads:
    frontend_revenue: "R$1.360 (80 compradores × R$17)"
    core_commissions: "R$3.564 (12 compradores × R$297)"
    backend_commissions: "R$864 (1 comprador × R$900)"
    continuity_commissions: "R$2.784 (24 meses × 4 assinantes × R$29)"
    total_ltv_1000_leads: "R$8.572"
    ltv_per_lead: "R$8,57"
    max_cac: "R$2,85 (33% do LTV por lead)"

quick_wins:
  launch_order:
    - week_1_2: "Bait (checklist) + Core (produto afiliado) — funil mínimo viável"
    - week_3_4: "Frontend (mini-curso próprio) — aumenta LTV e cria compradores"
    - month_2: "Backend (identificar produto afiliado high ticket)"
    - month_3: "Continuity (comunidade afiliada)"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
