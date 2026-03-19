# attribution-audit

## Metadata
```yaml
task_id: AFF_ANL_003
agent: performance-analyst
type: audit
complexity: medium
estimated_time: "1h-2h"
source: "Google Analytics 4 Attribution Documentation + Multi-Touch Attribution Best Practices (Wes Cao)"
```

## Purpose
Mapear todos os touchpoints do caminho de conversão do afiliado, validar se o modelo de atribuição atual reflete a realidade do negócio, e identificar lacunas onde crédito de conversão está sendo perdido ou mal distribuído.

## Prerequisites
- Rastreamento configurado e validado (`setup-affiliate-dashboard.md` — AFF_ANL_001)
- Pelo menos 30 dias de dados de conversão no GA4
- Acesso ao relatório "Modelo de Atribuição" no GA4 (Advertising > Attribution > Model Comparison)
- Pelo menos 50 conversões no período para análise estatisticamente relevante

## Steps

1. **Inventariar todos os touchpoints ativos** — Listar cada ponto de contato que pode aparecer no caminho do usuário antes de uma conversão de afiliado:
   - Canais: orgânico, pago (Meta/Google), email, social orgânico, YouTube, referral
   - Conteúdos: artigos de blog, páginas de review, bridge pages, emails da sequência, posts sociais
   - Dispositivos: mobile, desktop, tablet (cross-device paths)

2. **Exportar caminhos de conversão do GA4** — Acessar Advertising > Attribution > Conversion Paths. Filtrar para conversão `affiliate_click`. Exportar top 20 caminhos mais comuns.

3. **Comparar modelos de atribuição** — No GA4 Model Comparison, comparar:
   - **First Click:** qual canal inicia a jornada
   - **Last Click:** qual canal fecha a conversão
   - **Linear:** distribuição igual entre todos os touchpoints
   - **Data-Driven (GA4):** modelo probabilístico do Google
   Documentar diferença de crédito atribuído a cada canal em cada modelo.

4. **Identificar canais subestimados** — Canais que aparecem frequentemente em caminhos multi-touch mas recebem pouco crédito no modelo Last Click:
   - Geralmente afetados: orgânico, email, YouTube (canais de awareness/consideration)
   - Comparar First Click vs Last Click para identificar disparidade > 30%

5. **Identificar lacunas de rastreamento** — Verificar se existem touchpoints sem rastreamento adequado:
   - Links de email sem UTMs → tráfego vai para (direct)
   - Posts sociais sem UTMs → tráfego vai para (direct)
   - Aplicativos mobile → tracking cross-device ausente
   - Campanhas offline ou WhatsApp → sem rastreamento possível (documentar)

6. **Avaliar janela de atribuição** — Verificar se a janela configurada (padrão 30 dias) é adequada para o ciclo de decisão do nicho:
   - Infoprodutos BR: ciclo médio 3-7 dias → 30 dias é adequado
   - Produtos de alto valor (>R$500): ciclo pode ser 30-60 dias → ampliar janela
   - Subscriptions: ciclo pode ser > 60 dias → avaliar 90 dias

7. **Verificar consistência cross-platform** — Comparar dados de conversão GA4 vs plataforma nativa de afiliados (Hotmart, Impact, etc.):
   - Divergência esperada: até 15% (diferenças de cookie, bloqueadores de anúncio)
   - Divergência > 30%: investigar como problema de rastreamento

8. **Formular recomendação de modelo** — Com base nos dados coletados, recomendar o modelo de atribuição mais adequado para decisões de investimento (qual canal recebe mais budget) e justificar.

9. **Documentar gaps e plano de correção** — Para cada lacuna identificada, definir ação corretiva com prazo e responsável.

10. **Salvar relatório de auditoria** — Gerar arquivo de output e agendar próxima revisão de atribuição (trimestral recomendado).

## Framework

### Comparativo de Modelos de Atribuição

| Modelo | Crédito Para | Melhor Para | Limitação |
|--------|-------------|------------|-----------|
| First Click | Primeiro canal que trouxe o usuário | Avaliar canais de awareness | Ignora o que fechou a venda |
| Last Click | Canal que gerou o clique final | Avaliar canais de decisão | Ignora o trabalho de awareness |
| Linear | Igual para todos os canais | Visão holística simples | Não diferencia importância de cada toque |
| Time Decay | Canais mais recentes recebem mais | Ciclos de venda longos | Subvaloriza awareness |
| Data-Driven | Probabilístico (ML do Google) | Decisões de budget | Requer >400 conversões/mês para funcionar |

### Heurística de Decisão de Modelo

```
< 50 conversões/mês         → Last Click (dados insuficientes para modelos complexos)
50-400 conversões/mês       → Linear ou Time Decay (mais justo que Last Click)
> 400 conversões/mês        → Data-Driven (usar GA4 nativo)
Ciclo de decisão > 14 dias  → Time Decay ou Data-Driven
Negócio de awareness forte  → First Click para avaliar top-of-funnel
```

### Diagnóstico de Lacunas — Checklist

| Touchpoint | Rastreável? | Método | Gap Comum |
|-----------|------------|--------|-----------|
| SEO / Orgânico | Sim | GA4 + GSC | Sem issue |
| Meta Ads | Sim | Pixel + UTM | Cookie 7d IOS |
| Google Ads | Sim | GTM tag | Discrepância click vs session |
| Email | Sim (com UTM) | UTM obrigatório | Links sem UTM → direct |
| WhatsApp | Parcial | UTM manual | Impossível rastrear nativamente |
| YouTube (orgânico) | Parcial | UTM na descrição | Clicks do app não sempre trackados |
| Referral / Parceiros | Sim (com UTM) | UTM em todos os links | Links sem UTM → referral genérico |

### Thresholds de Divergência GA4 vs Plataforma

| Divergência | Diagnóstico | Ação |
|------------|------------|------|
| < 15% | Normal (cookies, bloqueadores) | Documentar, sem ação |
| 15-30% | Atenção — investigar | Verificar pixel de conversão |
| > 30% | Problema crítico de rastreamento | Auditoria completa do pixel |

## Veto Conditions

- **HARD VETO:** Menos de 50 conversões no período — volume insuficiente para qualquer análise de atribuição significativa; ampliar período ou adiar auditoria
- **HARD VETO:** Divergência > 50% entre GA4 e plataforma nativa sem explicação documentada — dados não são confiáveis para tomada de decisão
- **SOFT VETO:** Recomendar mudança de modelo de atribuição sem comparação explícita de pelo menos dois modelos — decisão sem evidência
- **ALERTA:** Mais de 20% das conversões em caminhos com touchpoint único em "direct" — sinal forte de perda de rastreamento (UTMs ausentes)

## Output

- **File:** `outputs/affiliates/{projeto-slug}/attribution-audit-{YYYY-MM}.md`
- **Format:** Markdown com tabelas de comparação e plano de correção

## Output Example

```yaml
attribution_audit:
  project: "afiliado-fitness-br"
  period: "2025-12 a 2026-01"
  analyst: "performance-analyst"
  conversions_analyzed: 187
  audit_date: "2026-02-18"

model_comparison:
  first_click:
    organic: "58%"
    facebook_ads: "22%"
    email: "12%"
    direct: "8%"
  last_click:
    organic: "31%"
    facebook_ads: "41%"
    email: "19%"
    direct: "9%"
  linear:
    organic: "44%"
    facebook_ads: "32%"
    email: "16%"
    direct: "8%"

insight: |
  Facebook Ads recebe 41% do crédito em Last Click mas apenas 22% em First Click.
  Isso indica que Meta Ads é forte em fechar conversões mas fraco em iniciar jornadas.
  Orgânico inicia 58% das jornadas mas fecha apenas 31% — subvalorizado em Last Click.
  Recomendação: usar modelo Linear para decisões de budget, pois reconhece
  o papel do SEO no topo do funil.

attribution_window:
  current: "30 days"
  recommended: "30 days"
  rationale: "Ciclo médio de decisão do nicho fitness digital = 5-8 dias. 30d é adequado."

gaps_identified:
  - gap: "15% das sessões de email aparecem como (direct) — UTMs ausentes em emails antigos"
    severity: "medium"
    fix: "Auditar sequência de email e adicionar UTMs em todos os links"
    deadline: "2026-02-25"
    owner: "email-nurture"
  - gap: "WhatsApp não rastreável — estima-se 5-10% do tráfego perdido"
    severity: "low"
    fix: "Usar encurtador com UTM para links compartilhados no WhatsApp"
    deadline: "2026-03-01"
    owner: "performance-analyst"

platform_divergence:
  ga4_conversions: 187
  hotmart_conversions: 201
  divergence_pct: "7.5%"
  status: "NORMAL — dentro do threshold de 15%"

recommended_model: "Linear"
next_audit: "2026-05-18"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
