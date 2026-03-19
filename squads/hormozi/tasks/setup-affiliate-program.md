# setup-affiliate-program

## Metadata
```yaml
task_id: HZ_LAUNCH_003
agent: hormozi-launch
type: setup
complexity: medium
estimated_time: 30-45min
source: "$100M Launch Playbook - Network Effect"
```

## Purpose

Design a complete affiliate/referral program that transforms buyers into promoters — the N (Network Effect) component of E.V.E.N.T.O framework.

> "Transforme compradores em promotores instantaneos." — Alex Hormozi

---

## Input Required

```yaml
affiliate_context:
  product_name: ""
  product_price: ""
  margin_available: ""  # % disponivel para comissoes
  existing_affiliate_list: ""  # Quantos afiliados ja tem
  previous_launches: ""  # Historico
  tracking_platform: ""  # Plataforma atual ou a implementar
```

---

## The 3-Tier Affiliate Structure

### TIER 1: EMBAIXADORES (Top 1%)

**Perfil:** Influenciadores com audiencia alinhada
**Commitment:** Promover para audiencias, co-criar conteudo

| Beneficio | Descricao |
|-----------|-----------|
| Acesso Antecipado | 2 semanas antes do publico |
| Co-criacao | Participar do desenvolvimento |
| Status | Reconhecimento publico |
| Comissao | 30% |

```yaml
tier_embaixadores:
  criterio_entrada: ""  # Ex: 100K+ seguidores, nicho alinhado
  quantidade_target: ""  # Ex: 10-20 embaixadores
  beneficios:
    - acesso_antecipado: ""
    - co_criacao: ""
    - status: ""
  comissao: "30%"
  recursos_exclusivos:
    - ""
```

---

### TIER 2: ADVOGADOS (Top 10%)

**Perfil:** Clientes ativos com resultados
**Commitment:** Trazer 5+ pessoas qualificadas

| Beneficio | Descricao |
|-----------|-----------|
| Preco Especial | Desconto exclusivo |
| Bonus Exclusivos | Conteudo adicional |
| Comissao | 20% |
| Upgrades | Acesso a tiers superiores |

```yaml
tier_advogados:
  criterio_entrada: ""  # Ex: Cliente ativo + 5 referrals
  quantidade_target: ""
  beneficios:
    - preco_especial: ""
    - bonus_exclusivos: ""
    - upgrades: ""
  comissao: "20%"
```

---

### TIER 3: AMPLIFICADORES (Todos)

**Perfil:** Qualquer pessoa interessada
**Commitment:** 1 compartilhamento = 1 entrada

| Beneficio | Descricao |
|-----------|-----------|
| Ganhe ao Compartilhar | Bonus por share |
| Sorteios | Entrada em premiacoes |
| Comissao Base | 10% |

```yaml
tier_amplificadores:
  criterio_entrada: "Qualquer pessoa"
  mecanismo: ""  # Ex: Share to unlock, refer to earn
  beneficios:
    - bonus_compartilhamento: ""
    - sorteios: ""
  comissao: "10%"
```

---

## Incentive Leaderboard System

**Gamificacao para Afiliados:**

| Posicao | Requisito | Premio |
|---------|-----------|--------|
| Top 10 | Mais sign-ups que aparecem | Jantar privado + Fireside chat + Workshop presencial |
| Top 50 | Top 50 por sign-ups | Workshop presencial + Q&A grupo |
| 10+ Sign-ups | Minimo 10 registros | Sorteio para workshop + Audiobook exclusivo |
| Todos | Apenas registrar | $100M Ads Folder + Blackbook + Gravacao HD |

```yaml
leaderboard_incentives:
  top_10:
    requisito: ""
    premio: ""
  top_50:
    requisito: ""
    premio: ""
  threshold_10:
    requisito: "10+ registros"
    premio: ""
  baseline:
    requisito: "Participar"
    premio: ""
```

---

## Affiliate Resources Kit

### Swipe Files

| Tipo | Quantidade | Formatos |
|------|------------|----------|
| Emails | 10+ | Texto, HTML |
| Social Posts | 20+ | IG, FB, LinkedIn, Twitter |
| DMs | 5+ | Templates personalizaveis |

### Creative Assets

| Tipo | Quantidade | Tamanhos |
|------|------------|----------|
| Banners | 10+ | 1080x1080, 1200x628, Stories |
| Videos | 5+ | 15s, 30s, 60s |
| Thumbnails | 5+ | YouTube, Webinar |

### Training

| Tipo | Duracao | Conteudo |
|------|---------|----------|
| Kickoff Webinar | 60min | Produto, messaging, best practices |
| Tutorial Videos | 5x10min | Como usar cada recurso |
| FAQ Doc | - | Respostas para objecoes comuns |

```yaml
affiliate_resources:
  swipe_files:
    emails:
      quantidade: ""
      tipos: []
    social_posts:
      quantidade: ""
      plataformas: []
    dm_templates:
      quantidade: ""

  creative_assets:
    banners:
      quantidade: ""
      tamanhos: []
    videos:
      quantidade: ""
      duracoes: []

  training:
    kickoff_webinar:
      data: ""
      duracao: ""
    tutorial_videos:
      quantidade: ""
    faq_doc: ""  # Link
```

---

## Tracking & Attribution

### Platform Setup

```yaml
tracking_setup:
  plataforma: ""  # FirstPromoter, Rewardful, PartnerStack, etc
  tipo_tracking: ""  # Cookie, UTM, unique codes
  janela_atribuicao: ""  # Ex: 30 dias
  modelo_atribuicao: ""  # First touch, last touch, multi-touch
```

### Commission Structure

```yaml
commission_structure:
  tier_1_embaixadores:
    percentual: "30%"
    pagamento: ""  # Mensal, por venda, etc
    minimo_saque: ""
  tier_2_advogados:
    percentual: "20%"
    pagamento: ""
    minimo_saque: ""
  tier_3_amplificadores:
    percentual: "10%"
    pagamento: ""
    minimo_saque: ""

  bonus_estrutura:
    first_sale: ""  # Bonus primeira venda
    milestone_10: ""  # Bonus 10 vendas
    milestone_50: ""  # Bonus 50 vendas
```

---

## Launch Sequence for Affiliates

### Timeline

| Timing | Acao |
|--------|------|
| S-6 | Email para lista de afiliados existentes |
| S-5 | Kickoff webinar + acesso aos recursos |
| S-4 | Leaderboard ativado, contagem comeca |
| S-3 | Update semanal + highlights de top performers |
| S-2 | Intensificacao, bonus extra para Top 10 |
| S-1 | Last push, preview do evento |
| D-Day | Comissoes ao vivo, updates de leaderboard |
| D+3 | Encerramento, anuncio de vencedores |
| D+7 | Pagamento de comissoes |

```yaml
affiliate_launch_sequence:
  - timing: "S-6"
    acao: ""
    responsavel: ""
  - timing: "S-5"
    acao: ""
  - timing: "S-4"
    acao: ""
  - timing: "S-3"
    acao: ""
  - timing: "S-2"
    acao: ""
  - timing: "S-1"
    acao: ""
  - timing: "D-Day"
    acao: ""
  - timing: "D+3"
    acao: ""
  - timing: "D+7"
    acao: ""
```

---

## Communication Templates

### Kickoff Email

```
Subject: Voce esta convidado: [Produto] Affiliate Program

[Nome],

Estamos lancando [Produto] em [Data] e queremos voce no time.

O que voce ganha:
- [Comissao]% em cada venda
- Recursos prontos (emails, posts, videos)
- Premios exclusivos para top performers

Proximo passo: [CTA - Cadastrar como afiliado]

[Assinatura]
```

### Weekly Update

```
Subject: Leaderboard Update - Semana [X]

Top 10 ate agora:
1. [Nome] - [X] registros
2. [Nome] - [X] registros
...

Voce esta em #[posicao] com [X] registros.

Para subir no ranking: [Dica especifica]

[CTA - Acessar recursos]
```

---

## Output: Complete Affiliate Program

```yaml
affiliate_program:
  overview:
    nome: ""
    produto: ""
    lancamento: ""
    comissao_media: ""

  tiers:
    embaixadores:
      quantidade: ""
      comissao: ""
      beneficios: []
    advogados:
      quantidade: ""
      comissao: ""
      beneficios: []
    amplificadores:
      mecanismo: ""
      comissao: ""

  incentives:
    leaderboard: []
    premios: []

  resources:
    swipes: []
    creatives: []
    training: []

  tracking:
    plataforma: ""
    atribuicao: ""

  timeline:
    kickoff: ""
    encerramento: ""
    pagamento: ""
```

---

## Quality Gate

```yaml
affiliate_quality:
  - [ ] 3 tiers definidos com criterios claros
  - [ ] Comissoes competitivas (10-30%)
  - [ ] Leaderboard com premios atrativos
  - [ ] Kit de recursos completo (emails, posts, videos)
  - [ ] Plataforma de tracking configurada
  - [ ] Timeline de comunicacao mapeada
  - [ ] Templates de email prontos
```

## Handoff

After completion:
- → Marketing team para recrutar afiliados
- → `create-launch-timeline.md` para integrar datas
- → `hormozi-copy` para refinar swipe files

---
*Task: HZ_LAUNCH_003 | Agent: hormozi-launch | Version: 1.0*
*Source: $100M Launch Playbook - Network Effect*



<\!-- Criado com Squad Creator do AIOSPRO por @oalanicolas e @pedrovalerio | 2026-02-10 -->
