# analyze-360

## Metadata
```yaml
task_id: AFF_CHF_001
agent: affiliates-chief
type: analysis
complexity: high
estimated_time: "3h-5h"
source: "Business Health Diagnostic Framework — Patrick Lencioni + Affiliate Business Audit Methodology"
```

## Purpose
Conduzir análise 360 graus do negócio de afiliados avaliando cinco dimensões de saúde (nicho, funil, email, social, receita), identificar riscos sistêmicos e oportunidades de crescimento, e produzir executive summary com action items priorizados para os próximos 30/60/90 dias.

## Prerequisites
- Dados de performance dos últimos 30-90 dias disponíveis em todas as dimensões avaliadas
- Acesso ao GA4, Search Console, dashboard da plataforma de afiliados, ESP (email service provider)
- Análise de performance recente disponível (AFF_ANL_002) como base de dados
- Pelo menos um ciclo completo de portfolio review executado (AFF_GRW_004)
- ICE backlog atualizado (AFF_GRW_001)

## Steps

1. **Coletar dados de todas as dimensões** — Antes de analisar, garantir que os dados das 5 dimensões estão disponíveis e atualizados. Se alguma dimensão não tem rastreamento, documentar como gap crítico.

2. **Analisar Dimensão 1: Nicho Health** — Avaliar a saúde do nicho como mercado:
   - Tendência de demanda (Google Trends 12 meses): crescendo, estável ou declinando?
   - Nível de competição SEO: novos sites fortes entraram? Big brands chegaram?
   - Saúde dos programas de afiliados: algum cortou comissão ou fechou nos últimos 90 dias?
   - Sazonalidade: o negócio está em pico, vale ou estável?
   - Score de saúde do nicho: 1-10

3. **Analisar Dimensão 2: Funil Health** — Avaliar a saúde do funil de conversão:
   - EPC e CR por etapa do funil (bridge page, review, email sequence)
   - Comparar EPC atual vs benchmark do nicho (AFF_ANL_006)
   - Gargalo principal: qual etapa do funil perde mais usuários?
   - A/B tests ativos ou resultados recentes (AFF_GRW_006)
   - Taxa de rejeição e tempo na página dos conteúdos principais
   - Score de saúde do funil: 1-10

4. **Analisar Dimensão 3: Email Health** — Avaliar a saúde do canal de email:
   - Tamanho da lista e taxa de crescimento MoM
   - Open rate e CTR vs benchmarks (> 22% BR, > 3% CTR)
   - Unsubscribe rate (alerta se > 0.5%)
   - Qualidade da sequência de boas-vindas: quantos novos subs chegam à compra?
   - Deliverability: algum sinal de spam (queda súbita de open rate, bounce rate alto)?
   - RPV do canal email vs outros canais
   - Score de saúde do email: 1-10

5. **Analisar Dimensão 4: Social Health** — Avaliar a saúde da presença social (se houver):
   - Crescimento de seguidores por canal ativo
   - Taxa de engajamento (likes + comentários + saves) / alcance
   - Quantidade de tráfego referenciado do social para o site (GA4)
   - RPV do tráfego social vs benchmark
   - Consistência de publicação (frequência real vs planejada)
   - Se não há canal social ativo, documentar como gap e avaliar necessidade
   - Score de saúde social: 1-10

6. **Analisar Dimensão 5: Revenue Diversification** — Avaliar a saúde da estrutura de receita:
   - Número de produtos afiliados ativos gerando receita
   - Concentração: qual % da receita vem do produto/plataforma principal?
   - Número de canais de tráfego ativos com receita atribuída
   - Presença em múltiplas plataformas (Hotmart, Monetizze, Amazon, Impact, etc.) ou dependência única
   - Presença de receita recorrente vs transacional
   - Score de diversificação de receita: 1-10

7. **Analisar Growth Trajectory** — Avaliar a trajetória geral de crescimento:
   - Crescimento de RPV nos últimos 90 dias (North Star — AFF_GRW_005)
   - Velocidade de crescimento vs meta de 90 dias
   - Em que acelerou nos últimos 30 dias?
   - O que desacelerou ou parou de funcionar?
   - Taxa de execução do backlog ICE (quantos Execute Now foram realmente executados?)
   - Score de trajectory: 1-10

8. **Aplicar mapa de risco sistêmico** — Para cada dimensão com score <= 6, avaliar:
   - Impacto se não corrigido em 90 dias (Low/Medium/High/Critical)
   - Velocidade de deterioração (rápida vs lenta)
   - Interdependência (este problema agrava outros?)
   Priorizar riscos por Impacto × Velocidade.

9. **Formular Executive Summary** — Sintetizar a análise em formato de liderança:
   - 3 forças: o que está funcionando melhor e por quê
   - 3 riscos: o que ameaça o crescimento e qual o prazo de ação
   - 1 oportunidade principal: o maior alavancador de crescimento não explorado
   - Veredito geral: Negócio em crescimento / Negócio estável / Negócio em risco

10. **Definir action items por horizonte** — Para cada item priorizado:
    - 30 dias: ações de urgência (riscos críticos e quick wins)
    - 60 dias: ações de estrutura (fundações que sustentam o crescimento)
    - 90 dias: ações de escala (expansão sobre base sólida)
    Cada ação com owner, deadline e KPI de sucesso.

## Framework

### Scorecard 360 — Dimensões e Pesos

| Dimensão | Peso | Métricas Principais | Score Min. Aceitável |
|---------|------|---------------------|---------------------|
| Nicho Health | 15% | Tendência de demanda, saúde dos programas | 6/10 |
| Funil Health | 30% | EPC, CR, gargalo principal | 7/10 |
| Email Health | 25% | Open rate, crescimento lista, RPV email | 7/10 |
| Social Health | 10% | Engajamento, tráfego referenciado | 5/10 |
| Revenue Diversification | 20% | Concentração, # de produtos e canais | 6/10 |

**Score Total = Média Ponderada das 5 Dimensões**

### Escala de Veredito

| Score Total | Veredito | Postura Recomendada |
|------------|---------|---------------------|
| >= 8.0 | Negócio em Alta Performance | Escalar agressivamente |
| 7.0-7.9 | Negócio Saudável em Crescimento | Manter ritmo, otimizar gargalos |
| 6.0-6.9 | Negócio Estável com Riscos | Resolver riscos antes de escalar |
| 5.0-5.9 | Negócio Frágil | Focar em fundações, parar expansão |
| < 5.0 | Negócio em Risco | Ação de emergência imediata |

### Mapa de Riscos Sistêmicos

| Combinação de Riscos | Diagnóstico | Ação |
|--------------------|------------|------|
| Funil baixo + Email baixo | Problema de conversão sistêmico | CRO + email rewrite urgente |
| Nicho baixo + Receita concentrada | Dependência de nicho em declínio | Diversificação de nicho urgente |
| Email alto + Funil baixo | Lista boa, funil quebrado | Direcionar tráfego da lista para pages otimizadas |
| Social alto + Email baixo | Não está capturando tráfego social | Adicionar captura de email em canais sociais |
| Crescimento rápido + Diversificação baixa | Crescimento frágil | Diversificar enquanto há margin |

### Interdependências entre Dimensões

```
Nicho Health → afeta tudo (mercado em declínio = teto de crescimento baixo)
Funil Health → afeta Receita (EPC ruim = receita baixa mesmo com tráfego alto)
Email Health → afeta RPV (email é o canal de maior RPV; queda aqui é queda do negócio)
Social Health → alimenta Email (social é fonte de novos leads, não de vendas diretas)
Revenue Diversification → afeta Resiliência (concentração = vulnerabilidade a um único evento)
```

### Cadência de Análise 360

| Frequência | Escopo | Executado por |
|-----------|--------|--------------|
| Mensal | Dimensões 2-3 (Funil + Email) | performance-analyst + growth-optimizer |
| Trimestral | Análise 360 completa (todas 5 dimensões) | affiliates-chief |
| Anual | Revisão estratégica de nicho + portfolio | affiliates-chief + affiliate-strategist |

## Veto Conditions

- **HARD VETO:** Executar análise 360 com dados de menos de 30 dias em qualquer dimensão avaliada — conclusões com dados insuficientes levam a ações erradas; aguardar dados ou documentar a limitação explicitamente
- **HARD VETO:** Recomendar escalar budget ou esforço quando Score Total < 6.0 — escalar um negócio frágil apenas amplifica os problemas; estabilizar primeiro
- **SOFT VETO:** Emitir executive summary sem definir owner para cada action item — análise sem responsável explícito é relatório de prateleira; cada item precisa de um nome
- **ALERTA:** Mais de 3 dimensões com score <= 6 — quando tudo está mal, nada tem prioridade real; identificar o gargalo primário (qual dimensão arrasta os outros) e agir apenas nele primeiro

## Output

- **File:** `outputs/affiliates/{projeto-slug}/analyze-360-{YYYY-MM}.md`
- **Format:** Markdown com scorecard, executive summary e plano 30/60/90 dias

## Output Example

```yaml
analyze_360:
  projeto: "afiliado-fitness-br"
  analista: "affiliates-chief"
  periodo_analisado: "2025-11 a 2026-01"
  data_analise: "2026-02-18"

scorecard:
  nicho_health:
    score: 7.5
    status: "SAUDAVEL"
    highlights:
      - "Google Trends estável para 'emagrecer em casa' — sem declínio visível em 12 meses"
      - "Hotmart — produto principal com comissão estável (foi reduzida e revertida em jan/26)"
    risks:
      - "Entrada de 2 novos players com sites de alta qualidade no nicho (DR 40+)"

  funil_health:
    score: 6.5
    status: "ATENCAO"
    highlights:
      - "Bridge page com CTR de 25% — acima do benchmark"
    risks:
      - "Review article com EPC 20% abaixo do benchmark de nicho"
      - "Sem A/B test ativo desde outubro/25 — estagnação de otimização"
    gargalo_principal: "Review article — EPC abaixo do potencial"

  email_health:
    score: 8.5
    status: "ALTA PERFORMANCE"
    highlights:
      - "Lista de 5.200 subs com open rate de 24.2% (benchmark: 22%)"
      - "RPV do canal email = R$2.40 (maior do portfólio)"
      - "Crescimento MoM de 8% sem lead magnet novo"
    risks:
      - "Sequência de boas-vindas com apenas 5 emails — extender para 10"

  social_health:
    score: 4.0
    status: "CRITICO"
    highlights:
      - "Sem presença social ativa. Zero tráfego social no GA4."
    risks:
      - "100% do tráfego orgânico depende de SEO — vulnerável a updates de algoritmo"
    nota: "Não é um risco imediato dado RPV alto de outros canais, mas é gap estratégico"

  revenue_diversification:
    score: 5.5
    status: "FRAGIL"
    highlights:
      - "2 plataformas ativas (Hotmart + Amazon)"
    risks:
      - "1 produto representa 72% da receita — concentração crítica"
      - "0% de receita recorrente — toda receita é transacional"

  growth_trajectory:
    score: 7.0
    rpv_growth_90d: "+18% (de R$0.53 para R$0.63)"
    vs_meta_90d: "63% da meta (meta era R$1.00 em 90 dias)"
    ice_execution_rate: "3 de 5 Execute Now concluídos — 60%"

score_total_ponderado: 6.6
veredito: "Negócio Estável com Riscos — resolver concentração de receita antes de escalar"

forcas:
  - "Email marketing: maior RPV do portfólio, crescimento consistente, lista engajada"
  - "Bridge page: CTR 25% acima do benchmark — copy funciona bem"
  - "Nicho estável: demanda não está caindo, competição ainda gerenciável"

riscos:
  - risco: "Concentração de receita em 1 produto (72%)"
    impacto: "CRITICAL"
    prazo: "Se o produto for descontinuado ou comissão cortada, perda imediata de 70% da receita"
    acao: "Adicionar 2 produtos alternativos ao funil nos próximos 30 dias"

  - risco: "Ausência de presença social (zero tráfego social)"
    impacto: "MEDIUM"
    prazo: "Vulnerabilidade crescente — se SEO cair, não há buffer"
    acao: "Iniciar TikTok ou Instagram nos próximos 60 dias (já no channel plan)"

  - risco: "Review article com EPC abaixo do benchmark"
    impacto: "HIGH"
    prazo: "Perda de receita corrente — artigo recebe tráfego alto mas converte pouco"
    acao: "A/B test de headline e CTA position — iniciar em 7 dias"

oportunidade_principal: |
  Email channel com RPV de R$2.40 mas lista crescendo apenas 8% MoM sem lead magnet.
  Um único lead magnet bem posicionado pode dobrar a taxa de crescimento da lista.
  Com lista crescendo 15%+ MoM, o RPV geral do negócio sobe proporcionalmente.
  Esta é a maior alavanca não explorada do portfólio atual.

action_items:
  trinta_dias:
    - action: "Lançar lead magnet (Guia 7 Dias) para acelerar crescimento da lista"
      owner: "email-nurture"
      deadline: "2026-02-25"
      kpi: "+500 novos subs em 30 dias"

    - action: "Adicionar Produto B afiliado ao funil (reduzir concentração de 72% para 50%)"
      owner: "affiliate-strategist"
      deadline: "2026-02-28"
      kpi: "Produto B representando >= 15% da receita em 30 dias"

    - action: "Iniciar A/B test no review article (headline + posição CTA)"
      owner: "growth-optimizer"
      deadline: "2026-02-20"
      kpi: "EPC sobe de R$1.20 para R$1.50+"

  sessenta_dias:
    - action: "Lançar primeiro canal social (TikTok — 3 vídeos/semana)"
      owner: "social-strategist"
      deadline: "2026-04-01"
      kpi: "> 5.000 views/vídeo média em 60 dias"

    - action: "Estender sequência de email de 5 para 10 emails"
      owner: "email-nurture"
      deadline: "2026-03-15"
      kpi: "Receita por lead da sequência aumenta 20%"

  noventa_dias:
    - action: "Adicionar Produto C com componente recorrente (assinatura)"
      owner: "affiliate-strategist"
      deadline: "2026-05-01"
      kpi: "Receita recorrente > 10% do total"

    - action: "Revisão 360 com meta de Score Total >= 7.5"
      owner: "affiliates-chief"
      deadline: "2026-05-18"
      kpi: "Revenue Diversification score >= 7.0"

proxima_analise_360: "2026-05-18"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
