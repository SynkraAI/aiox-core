# segment-email-list

## Metadata
```yaml
task_id: AFF_EML_006
agent: email-nurture + performance-analyst
type: analysis
complexity: medium
estimated_time: "1h-2h30min"
source: "Digital Marketer — Customer Value Optimization; ActiveCampaign Segmentation Guide; Klaviyo Segmentation Playbook"
```

## Purpose
Segmentar a lista de email da operação de afiliado por estágio de intenção (awareness/consideration/decision), fonte de tráfego, nível de engajamento (30/90 dias) e produto de interesse, para permitir comunicação personalizada e maximizar conversões por segmento.

## Prerequisites
- Lista de email ativa com mínimo de 500 leads
- ESP com suporte a segmentação por tags e comportamento (ActiveCampaign, Klaviyo, ConvertKit, ou equivalente)
- Tags de fonte de tráfego configuradas no opt-in (`setup-email-automation.md` executado)
- Histórico de engajamento (opens, clicks) de pelo menos 30 dias
- Mínimo 2 produtos ou ângulos de oferta para direcionar por segmento

## Steps

1. **Auditar tags e dados existentes** — Verificar quais tags já estão aplicadas, quais dados de engajamento estão disponíveis, e quais segmentos já existem no ESP. Identificar gaps de dados.

2. **Definir a estrutura de segmentação** — Escolher quais dimensões de segmentação são prioritárias para o negócio atual. Implementar todas de uma vez pode ser complexo — priorizar por impacto.

3. **Criar segmentos por Intent Stage** — Classificar leads em Awareness (não clicou em produto), Consideration (clicou mas não comprou) e Decision (comprou). Criar segmentos dinâmicos no ESP.

4. **Criar segmentos por Fonte de Tráfego** — Agrupar leads por origem: Meta Ads, Google, orgânico, YouTube, indicação. Analisar qual fonte produz leads com melhor EPC.

5. **Criar segmentos por Engajamento** — Classificar leads em: ativos 30 dias (abriu email nos últimos 30d), ativos 90 dias (abriu nos últimos 90d), e inativos 90d+.

6. **Criar segmentos por Interesse de Produto** — Baseado em tags de clique e tags de quiz, agrupar leads por produto de interesse.

7. **Calcular e comparar métricas por segmento** — Para cada segmento, calcular: tamanho, open rate, CTR, conversão, EPC. Identificar segmentos de alto valor.

8. **Definir estratégia de comunicação por segmento** — Para cada segmento principal, definir: frequência ideal, tipo de conteúdo, produto a promover, tom de comunicação.

9. **Documentar e implementar** — Configurar segmentos no ESP e documentar no arquivo de output.

## Framework

### Dimensões de Segmentação

```
DIMENSÃO 1 — INTENT STAGE (Estágio de Intenção)
────────────────────────────────────────────────
AWARENESS:
  Critérios: Está na lista, NUNCA clicou em link de produto afiliado
  Tamanho estimado: 40-60% da lista
  Estratégia: Conteúdo de valor → construir crença → primeira exposição ao produto
  Frequência: 2x por semana (mais valor, menos pitch)

CONSIDERATION:
  Critérios: Clicou em link de produto afiliado, NÃO tem tag "comprou"
  Tamanho estimado: 20-35% da lista
  Estratégia: Remover objeções, prova social, urgência, comparações
  Frequência: 3x por semana (mais específico, mais orientado a conversão)

DECISION:
  Critérios: Tem tag "comprou-[produto]"
  Tamanho estimado: 5-15% da lista
  Estratégia: Upsell/cross-sell para próximo nível da Value Ladder
  Frequência: 1x por semana (manter relacionamento, não sobrecarregar)

DIMENSÃO 2 — FONTE DE TRÁFEGO
──────────────────────────────
meta_ads: "src-meta-ads" → tráfego pago, pode ser mais direto na oferta
google_ads: "src-google-ads" → alta intenção de busca, mais receptivo a comparações
organico_seo: "src-organico-seo" → pesquisou ativamente, maior confiança prévia
youtube: "src-youtube" → já te viu antes, maior familiaridade
email_viral: "src-indicacao" → veio por recomendação, alto nível de confiança

DIMENSÃO 3 — ENGAJAMENTO (Rolling)
────────────────────────────────────
ativo_30d: "Abriu email nos últimos 30 dias"
  → Lista mais valiosa. Priorizar para lançamentos. Open rate acima da média.

ativo_90d: "Abriu email nos últimos 30-90 dias (não nos últimos 30)"
  → Engajamento médio. Re-ativar com conteúdo. Cuidado com frequência.

inativo_90d: "Não abriu nos últimos 90 dias"
  → Iniciar re-engagement sequence (`create-re-engagement-sequence.md`)

DIMENSÃO 4 — INTERESSE DE PRODUTO
───────────────────────────────────
Baseado em cliques e quiz tags:
int-produto-a: "Clicou no link do Produto A"
int-produto-b: "Clicou no link do Produto B"
int-high-ticket: "Visitou página de produto > R$997"
int-multiplos: "Clicou em mais de 1 produto — lead de alta intenção"
```

### Matriz de Segmentos Prioritários

| Segmento | Tamanho Típico | EPC Esperado | Ação Principal |
|----------|---------------|--------------|----------------|
| Consideration × Ativo 30d | 10-15% da lista | R$3-8 | Campanha de conversão agora |
| Decision × Ativo 30d | 3-8% | R$5-15 | Upsell próximo nível |
| Awareness × src-organico | 15-25% | R$1-3 | Nurture + primeira exposição |
| Inativo 90d | 20-40% | R$0.1-0.5 | Re-engagement ou sunset |

### Análise de EPC por Segmento

```yaml
calcular_epc_por_segmento:
  formula: "Comissões geradas pelo segmento / Emails enviados ao segmento"
  periodo: "Últimos 90 dias"
  objetivo: "Identificar segmentos de alto valor e alocar mais comunicação"

  exemplo_resultado:
    consideration_ativo_30d:
      emails_enviados: 420
      vendas: 12
      comissao_total: "R$2.988"
      epc: "R$7.11"  # EXCELENTE — priorizar

    awareness_inativo_90d:
      emails_enviados: 1800
      vendas: 2
      comissao_total: "R$498"
      epc: "R$0.28"  # CRÍTICO — re-engagement ou sunset
```

### Plano de Comunicação por Segmento

| Segmento | Frequência | Conteúdo | Pitch | Canal Adicional |
|----------|-----------|----------|-------|-----------------|
| Consideration ativo | 3x/semana | FAQ, depoimentos, comparação | Direto | Retargeting Meta |
| Awareness ativo | 2x/semana | Tutoriais, valor, backstory | Indireto | — |
| Decision ativo | 1x/semana | Upsell, exclusividades | Suave | — |
| Qualquer inativo | 1x/semana | Re-engagement sequence | 1 email | — |

## Veto Conditions
- Segmentar sem dados de engajamento (ESP sem tracking de abertura) → BLOQUEAR (segmentação sem dados é aleatória — configurar tracking primeiro)
- Tratar compradores (Decision) com a mesma sequência de venda dos não compradores → BLOQUEAR (experiência horrível — sempre excluir compradores de sequências de venda)
- Criar mais de 20 segmentos para lista menor que 2.000 leads → ALERTAR (complexidade sem amostra suficiente — simplificar para 4-6 segmentos)
- Usar segmentação sem revisão mensal das tags de engajamento → ALERTAR (leads migram de segmento ao longo do tempo — tags de engajamento devem ser dinâmicas)
- Calcular EPC por segmento sem período mínimo de 30 dias de dados → ALERTAR (dados insuficientes para conclusão)

## Output
- **File:** `outputs/affiliates/{projeto-slug}/email-segmentation.md`
- **Format:** Markdown com estrutura de segmentos, tamanhos, EPCs e estratégia por segmento

## Output Example
```yaml
email_segmentation:
  project: "afiliado-educacao-financeira"
  list_size: 4820
  esp: "ActiveCampaign"
  analysis_period: "2026-01-01 to 2026-02-15"

segments:
  - id: "SEG-001"
    name: "Quentes — Consideration + Ativo 30d"
    criteria: "tag: int-produto-investimentos AND tag: eng-ativo-30d AND NOT tag: comprou"
    size: 412
    percentage: "8.5%"
    open_rate: "38%"
    ctr: "9.2%"
    epc_estimated: "R$5.80"
    strategy:
      frequency: "3x por semana"
      content: "Depoimentos, FAQ, comparações, urgência"
      pitch: "Direto com stack de valor"
      next_action: "Campanha de conversão ativa"

  - id: "SEG-002"
    name: "Compradores — Upsell Ready"
    criteria: "tag: comprou-curso-basico AND tag: eng-ativo-30d"
    size: 287
    percentage: "5.9%"
    open_rate: "42%"
    ctr: "11%"
    epc_estimated: "R$8.20"
    strategy:
      frequency: "1x por semana"
      content: "Valor exclusivo para compradores, case studies avançados"
      pitch: "Upsell para curso avançado (R$997)"
      next_action: "Sequência de upsell — 4 emails"

  - id: "SEG-003"
    name: "Dormentes — Inativos 90d+"
    criteria: "tag: eng-inativo-90d AND NOT tag: comprou"
    size: 1640
    percentage: "34%"
    open_rate: "2% (estimado)"
    ctr: "0.3% (estimado)"
    epc_estimated: "R$0.20"
    strategy:
      frequency: "Re-engagement sequence (5 emails)"
      content: "Miss you, valor, survey, oferta final, sunset"
      pitch: "Apenas no email 4"
      next_action: "Iniciar AFF_EML_005 para esse segmento"

source_analysis:
  meta_ads:
    leads: 2100
    epc: "R$1.82"
    best_product: "Curso Básico"
  organic_seo:
    leads: 1450
    epc: "R$3.40"
    best_product: "Curso Intermediário"
  youtube:
    leads: 820
    epc: "R$4.10"
    best_product: "Curso Avançado + Mentoria"

insights:
  - "Leads de YouTube têm EPC 2.25x maior — aumentar investimento em canal"
  - "34% da lista é inativa — iniciar re-engagement antes de qualquer campanha paga para não desperdiçar orçamento"
  - "Segmento Consideration é 8.5% da lista mas deve representar 60%+ das comissões — priorizar"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
