# create-prop-review

## Metadata
```yaml
task_id: AFF_PRP_002
agent: prop-trading-affiliate + seo-content
type: creation
complexity: high
estimated_time: "3h-6h"
source: "YMYL Content Standards (Google Search Quality Evaluator Guidelines) + FTC Affiliate Disclosure Requirements"
```

## Purpose
Produzir review completa e honesta de uma prop trading firm com estrutura padronizada (Quick Summary Table, Evaluation Process, Trading Rules, Payout, Platform, Pros/Cons, Verdict), incluindo obrigatoriamente risk disclaimer, declaração "not financial advice" e affiliate disclosure, em conformidade com YMYL e FTC.

## Prerequisites
- Prop firm validada com veredicto APROVADO ou CONDICIONAL (task AFF_PRP_001 concluída)
- Dados completos da validação: regulação, regras de trading, payout history, plataforma
- Conta de demonstração ou acesso ao dashboard da firma para screenshots reais
- Keyword research para o nome da firma + termos relacionados
- Template de review carregado

## Steps

1. **Definir estrutura e keyword strategy** — Planejar SEO antes de escrever.
   - Keyword primária: "[Nome da Firma] Review" + "[Nome da Firma] Review [ano]"
   - Keywords secundárias: "[nome firma] legit?", "[nome firma] payout", "[nome firma] trading rules"
   - Verificar SERP atual: quem ranqueia, qual conteúdo domina, gaps de informação
   - Definir meta title (<60 chars) e meta description (<155 chars) otimizados
   - Estimar volume de busca e dificuldade (Ahrefs/Semrush)

2. **Redigir Quick Summary Table** — Criar tabela de visão geral no topo da review.
   - Deve aparecer ACIMA do fold (primeiros 2 scrolls da página)
   - Incluir: rating geral, regulação, maior conta funded, profit split, drawdown máx, taxa de avaliação, tempo de payout
   - Incluir botão de CTA com link de afiliado + affiliate disclosure inline

3. **Redigir seção Evaluation Process** — Descrever o processo de avaliação em detalhes.
   - Quantas fases, objetivos de cada fase, regras específicas de cada fase
   - Usar exemplos numéricos: "Em conta de $100K, você precisa lucrar $10K (10%) em até 30 dias"
   - Incluir screenshots do dashboard (se disponível via conta de demo)
   - Mencionar o que acontece em caso de reprova (política de reset, custo)

4. **Redigir seção Trading Rules** — Documentar todas as regras operacionais.
   - Drawdown: tipo (fixo vs trailing), % diário, % total — com exemplos claros
   - Profit target por fase
   - Instrumentos permitidos (lista completa)
   - Restrições: news trading, weekend holding, EA/bots, copy trading, hedging
   - Consistency rule (se existir) — explicar o impacto prático
   - Minimum trading days (se exigido)

5. **Redigir seção Payout Process** — Explicar como e quando o trader recebe.
   - Frequência de payout (bi-weekly, mensal, sob demanda)
   - Métodos de pagamento aceitos (wire, Wise, cripto, etc.)
   - Prazo típico de processamento
   - % de profit split (progressivo ou fixo)
   - Primeira retirada: há período de carência? Valor mínimo?
   - Incluir evidências reais de payout (screenshots de proofs públicos com link de fonte)

6. **Redigir seção Platform** — Avaliar a experiência técnica de trading.
   - Software disponível e versões (MT4, MT5, cTrader)
   - Tipos de conta, tamanhos disponíveis, spreads e comissões
   - Servidores e latência (informação técnica relevante para traders sérios)
   - Mobile app disponível?
   - Qualidade do suporte (tempo de resposta real, idiomas, canais)

7. **Redigir Pros/Cons e Verdict** — Concluir a review com síntese honesta.
   - Pros: listar 3-5 pontos genuinamente positivos (sem exagero)
   - Cons: listar 2-4 pontos negativos reais (honestidade = credibilidade)
   - Verdict: rating geral + recomendação segmentada ("recomendo para X, mas não para Y")
   - CTA final com link de afiliado + affiliate disclosure

8. **Implementar obrigações legais e compliance** — Revisar antes de publicar.
   - Risk disclaimer: texto completo no início e no final da review (ver Framework)
   - "Not financial advice": declaração explícita nos disclaimers
   - Affiliate disclosure: visível acima do fold, texto claro sobre comissão recebida
   - YMYL fact-check: cada claim sobre regulação ou payout deve ter fonte linkada
   - FTC: disclosure antes de qualquer link de afiliado ou CTA

## Framework

### Estrutura Obrigatória da Review

```markdown
## [Nome da Firma] Review [Ano] — Vale a Pena?

[AFFILIATE DISCLOSURE — visível antes do primeiro link]
[RISK DISCLAIMER — texto completo]

## Quick Summary
[Tabela com dados-chave + CTA + disclosure inline]

## O Que é a [Nome da Firma]?
[Parágrafo introdutório + contexto do mercado]

## Processo de Avaliação
[Detalhamento de cada fase + exemplos numéricos]

## Regras de Trading
[Tabela + explicação prática de cada regra]

## Processo de Payout
[Como funciona + evidências + métodos de pagamento]

## Plataforma e Condições de Trading
[Software + spreads + suporte]

## Prós e Contras
[Lista honesta e balanceada]

## Veredicto Final
[Rating + recomendação segmentada + CTA]

## FAQ
[5-7 perguntas mais comuns da SERP (People Also Ask)]

[RISK DISCLAIMER — repetir no final]
```

### Textos de Compliance Obrigatórios

**Affiliate Disclosure (antes do primeiro link):**
```
Divulgação: Esta review contém links de afiliado. Se você se inscrever
através dos nossos links, podemos receber uma comissão sem custo adicional
para você. Nossa avaliação é baseada em pesquisa independente e não é
influenciada por acordos comerciais.
```

**Risk Disclaimer (início e fim, fonte mínima 12pt):**
```
AVISO DE RISCO: Trading de instrumentos financeiros envolve risco
significativo de perda e não é adequado para todos os investidores.
A prop trading implica riscos adicionais relacionados às regras de
drawdown e perda da taxa de avaliação. Resultados passados não garantem
resultados futuros. Nunca invista mais do que pode perder.
```

**Not Financial Advice:**
```
As informações neste artigo são apenas para fins educacionais e
informativos. Nada aqui constitui aconselhamento financeiro ou de
investimento. Consulte um profissional financeiro licenciado antes
de tomar qualquer decisão de investimento.
```

### Formato de Quick Summary Table

| Critério | Detalhe |
|---------|---------|
| Nossa Avaliação | ⭐ X.X / 5.0 |
| Regulação | [Regulador] — [País] |
| Maior Conta Funded | $[valor] |
| Profit Split | X% |
| Drawdown Máximo | X% (diário: X%) |
| Taxa de Avaliação | $[valor] (conta $X) |
| Payout | Bi-weekly / [prazo] |
| Plataforma | MT5, cTrader |

### Critérios YMYL para Reviews de Prop Trading

```
EXPERTISE — demonstrar conhecimento técnico de trading
AUTHORITATIVENESS — citar fontes regulatórias verificáveis
TRUSTWORTHINESS — incluir contras reais, não apenas elogios
SAFETY — risk disclaimer em fonte visível (>=12pt)
```

## Veto Conditions

- **HARD VETO:** Publicar review sem risk disclaimer em fonte >= 12pt — violação YMYL e risco legal
- **HARD VETO:** Publicar sem declaração "not financial advice" — responsabilidade legal de conselho financeiro não licenciado
- **HARD VETO:** Publicar sem affiliate disclosure antes do primeiro link — violação FTC e CONAR BR
- **HARD VETO:** Afirmar "resultados garantidos" ou "sem risco" — false advertising, risco legal sério
- **HARD VETO:** Escrever review sem ter concluído AFF_PRP_001 — review sem validação é desinformação
- **SOFT VETO:** Review sem seção de Contras/Cons — aparência de publicidade paga, destrói credibilidade SEO (YMYL penaliza reviews únicas positivas)
- **SOFT VETO:** Claims de payout sem evidências linkadas — sem prova, não é verificável pelo leitor

## Output

- **File:** `content/reviews/prop-trading/{firm-slug}-review-{year}.md`
- **Format:** Markdown para publicação (converter para HTML ao publicar)

## Output Example

```yaml
review_date: "2026-02-18"
firm: "Alpha Capital Pro"
url_slug: "/prop-firm-reviews/alpha-capital-pro-review-2026/"
author: "prop-trading-affiliate + seo-content"

seo:
  primary_keyword: "Alpha Capital Pro Review"
  secondary_keywords:
    - "Alpha Capital Pro legit"
    - "Alpha Capital Pro payout"
    - "Alpha Capital Pro trading rules 2026"
  meta_title: "Alpha Capital Pro Review 2026 — Vale a Pena? [Testado]"
  meta_description: "Review completa da Alpha Capital Pro: regulação, regras de trading, histórico de payout e veredicto honesto. Leia antes de comprar a avaliação."

compliance_elements:
  affiliate_disclosure: true
  affiliate_disclosure_position: "above_fold"
  risk_disclaimer: true
  risk_disclaimer_font_size_pt: 12
  not_financial_advice: true
  sources_linked: 8

content_structure:
  quick_summary_table: true
  sections:
    - "O Que é a Alpha Capital Pro?"
    - "Processo de Avaliação"
    - "Regras de Trading"
    - "Processo de Payout"
    - "Plataforma e Condições"
    - "Prós e Contras"
    - "Veredicto Final"
    - "FAQ (7 perguntas)"
  word_count: 3200
  screenshots_included: 6

overall_rating: 4.1
verdict_summary: |
  Alpha Capital Pro é uma escolha sólida para traders intermediários
  que buscam profit split de 80% com regras de drawdown razoáveis.
  O suporte em PT-BR é diferencial para traders brasileiros.
  Ponto de atenção: weekend holding proibido limita algumas estratégias.

cta_link: "https://alphacapitalpro.com/?ref=seuafiliado"
publish_date: "2026-02-25"
review_expiry: "2027-02-18"  # Re-validar em 12 meses
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
