# design-prop-comparison-page

## Metadata
```yaml
task_id: AFF_PRP_003
agent: prop-trading-affiliate + seo-affiliate
type: creation
complexity: high
estimated_time: "4h-8h"
source: "Wirecutter Comparison Page Architecture + Backlinko Hub Page Strategy (adapted for prop trading)"
```

## Purpose
Criar tabela comparativa multi-firma e hub page de prop trading (/best-prop-firms/) que centraliza avaliações, rankings e links de afiliado das firms validadas, funcionando como destino primário de SEO e referência de conversão no nicho.

## Prerequisites
- Mínimo 5 prop firms validadas com veredicto APROVADO ou CONDICIONAL (AFF_PRP_001)
- Reviews individuais publicadas para cada firma listada (AFF_PRP_002)
- Acesso ao CMS do site para criar e editar páginas
- Ferramenta de tabela responsiva (plugin WordPress ou HTML/CSS manual)
- Keyword research para termos de comparação de prop firms
- Dados atualizados de cada firma: fees, rules, profit split, platform, support, payout speed

## Steps

1. **Pesquisar keywords e estrutura SERP** — Planejar SEO antes de construir a página.
   - Keywords primárias: "best prop trading firms", "melhores prop firms", "prop firm comparison"
   - Keywords de intenção: "qual prop firm escolher", "prop firm review 2026"
   - Analisar top 5 resultados: estrutura, depth, número de firms comparadas, data de atualização
   - Identificar gaps: dimensões de comparação ausentes nos concorrentes
   - Definir meta title, meta description e H1 otimizados

2. **Selecionar firms para a tabela** — Curar o portfólio de firms a incluir.
   - Incluir apenas firms com veredicto APROVADO ou CONDICIONAL (AFF_PRP_001)
   - Mínimo: 5 firms, máximo: 15 (mais do que isso prejudica UX)
   - Incluir diversidade: diferentes price points, diferentes regras, diferentes público-alvo
   - Excluir firms com hard red flag mesmo que sejam populares — credibilidade primeiro

3. **Definir colunas da tabela comparativa** — Selecionar dimensões de comparação.
   - Colunas obrigatórias: Firma, Rating, Taxa de Avaliação, Maior Conta, Profit Split, Drawdown Máx, Payout Speed, Plataforma, Suporte PT-BR, Link
   - Colunas opcionais: Free Retake Policy, Trailing vs Fixed Drawdown, News Trading, Consistency Rule
   - Máximo 8-10 colunas para legibilidade em mobile
   - Definir qual dimensão será a coluna de ordenação padrão (recomendado: Rating ou Profit Split)

4. **Coletar e padronizar dados de cada firma** — Reunir dados uniformes para comparação.
   - Acessar página oficial de cada firma para confirmar dados atuais (fees mudam frequentemente)
   - Preencher planilha de dados com todas as colunas definidas
   - Marcar data de verificação de cada dado (para exibir "Dados verificados em [data]" na página)
   - Identificar e documentar diferenças entre contas/tipos da mesma firma

5. **Construir tabela comparativa responsiva** — Implementar tabela no CMS.
   - Usar tabela HTML com CSS responsivo (colapsa para scroll horizontal em mobile)
   - Alternativa: plugin de tabela comparativa (TablePress, WP Table Builder, Ninja Tables)
   - Implementar: sorting por coluna (clicar no cabeçalho ordena), destaque do melhor valor por coluna
   - Adicionar badge "Editor's Pick" ou "Melhor Custo-Benefício" para firma top
   - Incluir affiliate link em cada linha com disclosure explícita

6. **Criar seções de contexto editorial** — Adicionar conteúdo além da tabela.
   - **Introdução (200 palavras):** o que é prop trading, como funciona o processo de avaliação, para quem é indicado
   - **Como Usamos Esses Critérios (300 palavras):** explicar metodologia de avaliação (transparência YMYL)
   - **Análise Detalhada das Top 3 (500 palavras cada):** mini-review expandida das firms melhor rankeadas
   - **FAQ (10 perguntas):** perguntas mais comuns sobre prop firms extraídas do PAA (People Also Ask) do Google
   - **Quando Atualizado:** seção explícita de data de última atualização e frequência de revisão

7. **Implementar schema markup e SEO técnico** — Otimizar para mecanismos de busca.
   - Schema: ItemList para a lista de firms, Review schema para ratings individuais
   - Internal links: linkar cada firma para a review completa (AFF_PRP_002)
   - External links: linkar para fontes regulatórias como referência
   - Breadcrumb: Home > Prop Trading > Melhores Prop Firms
   - Open Graph tags para compartilhamento social

8. **Implementar compliance e disclaimers** — Garantir conformidade YMYL.
   - Risk disclaimer no início da página (texto completo, fonte >= 12pt)
   - Affiliate disclosure antes da primeira tabela e antes de cada CTA
   - "Not financial advice" no disclaimer
   - Data de última verificação dos dados visível na página
   - Política de como as firms são selecionadas para a lista (transparência)

## Framework

### Estrutura de URL e Hub Page

```
URL principal: /melhores-prop-firms/ (PT-BR) ou /best-prop-firms/ (EN)

Estrutura hub + spokes:
  Hub: /melhores-prop-firms/ (esta tarefa)
  Spokes:
    /reviews/alpha-capital-pro/
    /reviews/ftmo/
    /reviews/the5ers/
    /reviews/myforexfunds/
    [uma review por firma]

Internal links:
  Hub → cada spoke (link no nome da firma na tabela)
  Cada spoke → hub (link "Ver comparação completa")
  Cluster de autoridade para SEO
```

### Template de Tabela Comparativa

| Prop Firm | Rating | Taxa Aval. $100K | Profit Split | Drawdown Máx | Payout | Plataforma | PT-BR | |
|-----------|--------|-----------------|-------------|-------------|--------|-----------|-------|--|
| Alpha Capital | ⭐4.1 | $199 | 80% | 10% | Bi-weekly | MT5 | ✅ | [Ver Oferta →] |
| Firma B | ⭐4.3 | $149 | 85% | 12% | Mensal | MT4/MT5 | ❌ | [Ver Oferta →] |

*Preços verificados em [data]. Sujeitos a alteração.*

### Critérios de Ordenação da Tabela

```
ORDENAÇÃO PADRÃO (recomendado para página inicial):
  Primary: Rating geral (descendente)
  Secondary: Profit Split (descendente)
  Tie-break: Taxa de avaliação (ascendente)

FILTROS OPCIONAIS (melhoram UX):
  □ Apenas com suporte PT-BR
  □ Taxa < $200 (conta $100K)
  □ Profit Split > 80%
  □ Apenas MT5
```

### Conteúdo de Contexto Editorial — Padrão Wirecutter

```
O QUE FAZEMOS (transparência que gera confiança):
  "Testamos e pesquisamos cada firma nesta lista por pelo menos
  [X semanas/meses]. Verificamos regulação, lemos reclamações em
  fóruns e grupos, analisamos as regras e — quando possível —
  entrevistamos traders que usam a plataforma."

O QUE NÃO FAZEMOS (diferenciação):
  "Não aceitamos firmas apenas porque pagam comissão maior.
  Firms que rejeitamos incluem [critérios gerais — não nomes específicos
  sem provas]. Nossa lista muda quando as condições mudam."
```

### Frequência de Atualização

```
DADOS DA TABELA: verificar mensalmente (taxas mudam frequentemente)
RATINGS: verificar trimestralmente (re-executar AFF_PRP_001)
CONTEÚDO EDITORIAL: atualizar semestralmente
PUBLICAR DATA DE ATUALIZAÇÃO: sempre visível na página
```

## Veto Conditions

- **HARD VETO:** Incluir firma com hard red flag (AFF_PRP_001) na tabela — promover firma problemática para lucrar = desonestidade
- **HARD VETO:** Publicar sem affiliate disclosure antes da tabela — violação FTC e CONAR
- **HARD VETO:** Publicar sem risk disclaimer (fonte >= 12pt) — YMYL sem safety warning
- **HARD VETO:** Dados desatualizados > 60 dias sem indicação — taxas mudam; dados errados prejudicam o usuário
- **SOFT VETO:** Tabela com mais de 15 firms — paralisia de análise para o usuário, UX ruim
- **SOFT VETO:** Página sem seção FAQ — Google PAA é oportunidade de featured snippet perdida
- **SOFT VETO:** Nenhuma firm com suporte PT-BR marcada — audiência brasileira precisa desta informação

## Output

- **File:** `content/pages/melhores-prop-firms-{year}.md`
- **Format:** Markdown para publicação no CMS

## Output Example

```yaml
page_created: "2026-02-18"
url: "/melhores-prop-firms-2026/"
page_type: "hub_comparison"
last_data_verified: "2026-02-18"
next_data_verification: "2026-03-18"

seo:
  primary_keyword: "melhores prop firms"
  h1: "As Melhores Prop Trading Firms de 2026 — Revisadas e Comparadas"
  meta_title: "Melhores Prop Firms 2026 — Comparação Completa e Honesta"
  meta_description: "Comparamos as principais prop trading firms de 2026: taxas, regras, payout e regulação. Dados verificados. Leia antes de escolher."
  word_count_target: 4500

firms_in_table: 8
firms_approved: 6
firms_conditional: 2
firms_rejected_excluded: 4  # Não listadas

table_columns:
  - firma
  - rating_geral
  - taxa_avaliacao_100k
  - profit_split
  - drawdown_maximo_total
  - drawdown_maximo_diario
  - payout_frequencia
  - plataforma
  - suporte_pt_br
  - link_afiliado

compliance:
  affiliate_disclosure: above_table
  risk_disclaimer: beginning_and_end
  not_financial_advice: true
  data_verification_date_visible: true

schema_markup:
  - ItemList
  - Review
  - FAQPage
  - BreadcrumbList

internal_links:
  to_individual_reviews: 8  # Um link por firma na tabela
  from_individual_reviews: 8  # Cada review linka de volta ao hub

faq_count: 10
estimated_organic_traffic_3m: 800  # Estimativa conservadora
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
