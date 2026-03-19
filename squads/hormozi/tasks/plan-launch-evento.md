# plan-launch-evento

## Metadata
```yaml
task_id: HZ_LAUNCH_001
agent: hormozi-launch
type: strategy
complexity: high
estimated_time: 60-90min
source: "$100M Launch Playbook - Framework E.V.E.N.T.O"
```

## Purpose

Design a complete launch strategy using the E.V.E.N.T.O framework — the systematic approach that turns attention into revenue within compressed time windows.

> "Um lancamento e um sistema, nao um evento. Se voce nao consegue replicar, voce nao possui." — Alex Hormozi

**Formula de Sucesso:**
```
SUCESSO = (Historia Irresistivel x Escassez Real x Oferta Incomparavel) ^ Energia do Evento
                                    /
                            Friccao de Compra
```

---

## Pre-Conditions

### Market Validation (Score minimo 8/12)

| Indicador | Pergunta | Score 0-3 |
|-----------|----------|-----------|
| Dor Massiva | O problema e doloroso o suficiente para pagar? | |
| Poder de Compra | O publico tem dinheiro para pagar? | |
| Facil de Atingir | Consegue encontrar essas pessoas? | |
| Crescendo | O mercado esta expandindo? | |

**Score Total:** ___/12 (Minimo 8 para GO)

### Sizing — Recursos Minimos

| Tamanho | Registros | Budget | Equipe | Duracao |
|---------|-----------|--------|--------|---------|
| Micro | 10K | $10K | 3 pessoas | 2 semanas |
| Small | 50K | $50K | 5 pessoas | 3 semanas |
| Medium | 250K | $250K | 10 pessoas | 4 semanas |
| Large | 500K | $1M | 20 pessoas | 5 semanas |
| Mega | 1M+ | $3M+ | 30+ pessoas | 6 semanas |

---

## Input Required

```yaml
launch_context:
  product_name: ""
  product_type: ""  # digital, fisico, servico, curso, B2B
  target_avatar: ""
  offer_price: ""
  offer_value_stack: ""  # ou executar create-grand-slam-offer.md primeiro
  available_budget: ""
  available_team_size: ""
  d_day_date: ""  # Data do evento principal
```

---

## The E.V.E.N.T.O Framework

### E - ESCASSEZ ARTIFICIAL (Engineered Scarcity)

Crie um momento unico e irrepetivel no tempo.

**Tipos de Escassez:**

| Tipo | Descricao | Exemplo |
|------|-----------|---------|
| Temporal | Janela unica de 24-72 horas | "So durante o evento ao vivo" |
| Quantitativa | Limite real de unidades | "Primeiro lote de 500 unidades" |
| Exclusividade | Acesso apenas para registrados | "Bonus exclusivo para quem estava ao vivo" |

**Aplicacao por Contexto:**

| Contexto | Escassez Genuina |
|----------|------------------|
| Produto Fisico | "Lote limitado da primeira producao" |
| Servico | "Apenas X vagas com founder/criador" |
| B2B | "Piloto exclusivo para primeiros clientes" |
| Local | "Soft opening apenas para lista VIP" |

```yaml
escassez_definida:
  tipo_principal: ""  # temporal, quantitativa, exclusividade
  mecanismo: ""  # Como funciona
  justificativa_real: ""  # Por que e genuina (capacidade, producao, etc)
  deadline: ""  # Data/hora exata
```

**ANTI-PATTERN:** NUNCA use escassez falsa. Encontre escassez genuina: capacidade de entrega, lote de producao, janela de tempo.

---

### V - VALOR EMPILHADO (Stacked Value)

Stack de ofertas que supera o preco em 10X minimo.

**Arquitetura do Stack:**
```
Produto Core: Valor $X
+ Bonus 1: Valor $Y (Remove objecao principal)
+ Bonus 2: Valor $Z (Acelera resultado)
+ Bonus 3: Valor $W (Seguranca/garantia)
+ Surpresa: Priceless (So hoje)
= Total: $X+Y+Z+W
Preco Hoje: $X/3
```

```yaml
value_stack:
  core_product:
    name: ""
    value: ""
  bonus_1:
    name: ""
    value: ""
    objecao_que_remove: ""
  bonus_2:
    name: ""
    value: ""
    resultado_que_acelera: ""
  bonus_3:
    name: ""
    value: ""
    seguranca_que_oferece: ""
  surpresa:
    name: ""
    condicao: "So durante o evento ao vivo"

  stack_total: ""
  preco_final: ""
  multiplicador: ""  # Deve ser >= 10X
```

---

### E - ESCADA DE COMPROMISSO (Commitment Ladder)

Micro-compromissos levando a grande conversao.

```
Register (Free) → Show Up → Engage → Consider → Buy Core → Upsell → Advocate
```

**Fluxo de Conversao:**
```
Trafego Frio → Registro (Free) → Show Up → Free Stack → Paid Reveal → Urgencia → Cart Close
     ^                                                                              |
     <------------ Retargeting & Follow-up Sequences <------------------------------
```

```yaml
commitment_ladder:
  step_1_register:
    mecanismo: ""  # Lead magnet, waitlist, etc
    conversion_target: ""
  step_2_show_up:
    incentivo: ""  # O que ganham por aparecer
    reminder_sequence: ""
  step_3_engage:
    gatilho: ""  # Como engaja durante evento
  step_4_consider:
    prova: ""  # Testimonials, demos
  step_5_buy:
    oferta: ""
    urgencia: ""
  step_6_upsell:
    oferta_adicional: ""
  step_7_advocate:
    programa: ""  # Referral, affiliate
```

---

### N - NETWORK EFFECT

Transforme compradores em promotores instantaneos.

**Tres Niveis de Multiplicadores:**

| Nivel | Perfil | Beneficio | Recompensa |
|-------|--------|-----------|------------|
| Embaixadores (Top 1%) | Influenciadores | Acesso antecipado + co-criacao | 30% comissao + status |
| Advogados (Top 10%) | Clientes ativos | Preco especial + bonus exclusivos | 20% comissao + upgrades |
| Amplificadores (Todos) | Qualquer pessoa | Ganhe ao compartilhar | 10% base + sorteios |

```yaml
network_effect:
  embaixadores:
    criterio: ""
    beneficio: ""
    recompensa: ""
  advogados:
    criterio: ""
    beneficio: ""
    recompensa: ""
  amplificadores:
    criterio: ""
    beneficio: ""
    recompensa: ""

  plataforma_tracking: ""  # Ferramenta de afiliados
```

---

### T - TENSAO NARRATIVA (Narrative Tension)

Historia com inicio, meio e climax emocional.

**Formula Narrativa:**
```
"Ha [tempo] eu [problema doloroso].
Depois de [jornada/tentativas], descobri [solucao].
Agora, pela primeira vez, vou [grande revelacao]."
```

**Estrategia de Conteudo por Semana:**

| Semana | Tema | Formato | Gatilho |
|--------|------|---------|---------|
| S-3 | PROBLEMA | Dados, casos, controversias | Agitacao |
| S-2 | POSSIBILIDADE | Demonstracoes, bastidores, teasers | Esperanca |
| S-1 | PROMESSA | Countdown, social proof, urgencia | FOMO |

**Regra 7-7-7 (Omnipresenca):**
```
7 pontos de contato x 7 dias x 7 plataformas
(Email, SMS, WhatsApp, Social, Ads, PR, Influencers)
```

```yaml
narrative_tension:
  historia_pessoal:
    problema_doloroso: ""
    jornada: ""
    solucao_descoberta: ""
    grande_revelacao: ""

  conteudo_s3_problema:
    - tipo: ""
      tema: ""
  conteudo_s2_possibilidade:
    - tipo: ""
      tema: ""
  conteudo_s1_promessa:
    - tipo: ""
      tema: ""
```

---

### O - OFERTA IRRECUSAVEL (Irresistible Offer)

Inversao de risco + garantias impossiveis.

**Componentes:**
- Valor empilhado 10X o preco
- Garantia que remove todo o risco
- Escassez genuina (temporal + quantitativa)
- Urgencia real (deadline que acontece)

**Scripts de Objecoes Universais:**

| Objecao | Resposta Framework |
|---------|-------------------|
| "Muito caro" | "Quanto custa NAO resolver [problema]?" |
| "Preciso pensar" | "O que especificamente precisa avaliar?" |
| "Nao e pra mim" | "Quem voce conhece que precisa disso?" |
| "Ja tentei antes" | "O que foi diferente do que mostrei hoje?" |

```yaml
oferta_irrecusavel:
  valor_total: ""
  preco: ""
  garantia:
    tipo: ""  # Satisfacao, resultado, incondicional
    prazo: ""
    condicoes: ""
  escassez: ""
  urgencia: ""

  objecoes_preparadas:
    - objecao: ""
      resposta: ""
```

---

## Output: Complete E.V.E.N.T.O Plan

```yaml
evento_launch_plan:
  overview:
    product: ""
    d_day: ""
    size: ""  # micro, small, medium, large, mega
    budget: ""
    team_size: ""
    revenue_target: ""

  escassez:
    tipo: ""
    mecanismo: ""
    deadline: ""

  valor_empilhado:
    stack_total: ""
    preco: ""
    multiplicador: ""

  escada_compromisso:
    steps: []
    conversion_targets: []

  network_effect:
    programa_afiliados: ""
    tiers: []

  tensao_narrativa:
    historia: ""
    calendario_conteudo: []

  oferta_irrecusavel:
    componentes: []
    garantia: ""
    scripts_objecoes: []

  next_steps:
    - "Executar create-launch-timeline.md para 8 fases"
    - "Executar setup-affiliate-program.md para network effect"
    - "Executar setup-war-room.md para operacoes"
```

---

## Quality Gate

```yaml
evento_quality:
  - [ ] Escassez e GENUINA (nao fake)
  - [ ] Valor Stack >= 10X preco
  - [ ] Commitment Ladder tem 5+ steps
  - [ ] Network Effect tem 3 tiers definidos
  - [ ] Historia narrativa completa
  - [ ] Todas objecoes principais cobertas
  - [ ] Market Score >= 8/12
  - [ ] Sizing apropriado para recursos
```

## Handoff

After completion:
- → `create-launch-timeline.md` para cronograma das 8 fases
- → `setup-affiliate-program.md` para detalhar network effect
- → `setup-war-room.md` para operacoes do Dia D
- → `hormozi-copy` para scripts e emails

---
*Task: HZ_LAUNCH_001 | Agent: hormozi-launch | Version: 1.0*
*Source: $100M Launch Playbook - Framework E.V.E.N.T.O*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
