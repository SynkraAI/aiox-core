# optimize-funnel-cro

## Metadata
```yaml
task_id: AFF_FUN_006
agent: growth-optimizer
type: audit
complexity: medium
estimated_time: "45min-1h30min"
source: "CXL Institute — CRO Framework; Peep Laja — Conversion Research; Bryan Eisenberg — Always Be Testing"
```

## Purpose
Realizar auditoria de CRO (Conversion Rate Optimization) em funil de afiliado existente, identificando o gargalo principal (opt-in rate, bridge CTR, conversion rate, EPC) e propondo experimentos priorizados para otimização.

## Prerequisites
- Funil de afiliado ativo com mínimo de 500 visitantes de dados históricos
- Acesso às métricas por etapa (Google Analytics, plataforma de ads, ESP, plataforma afiliado)
- Funil mapeado com etapas e objetivos definidos (`design-affiliate-funnel.md` executado)
- Acesso à ferramenta de heatmap/recording (Hotjar, Microsoft Clarity, ou equivalente) recomendado

## Steps

1. **Coletar métricas atuais por etapa** — Extrair dados das últimas 4 semanas (ou período com dados suficientes): tráfego total, taxa de opt-in, bridge CTR, taxa de conversão em compra, EPC, revenue per visitor (RPV).

2. **Calcular benchmark vs. alvo** — Comparar cada métrica com os benchmarks de referência do setor e identificar quais estão abaixo do esperado.

3. **Identificar o gargalo principal** — Localizar a etapa com maior desvio negativo em relação ao benchmark. O gargalo é onde 80% da otimização deve acontecer primeiro.

4. **Diagnosticar causa raiz do gargalo** — Para a etapa gargalo, aplicar o checklist de diagnóstico correspondente (hook, story, offer, friction, trust, urgency).

5. **Priorizar hipóteses de otimização** — Gerar lista de hipóteses usando o framework PIE (Potential, Importance, Ease). Selecionar 3-5 para testar primeiro.

6. **Planejar experimentos** — Para cada hipótese selecionada: definir variável a testar, métrica de sucesso, tamanho de amostra necessário, duração estimada.

7. **Documentar auditoria** — Salvar diagnóstico completo, gargalo identificado e plano de experimentos no arquivo de output.

## Framework

### Métricas e Benchmarks por Etapa

| Etapa | Métrica | Benchmark Bom | Crítico (abaixo disso) |
|-------|---------|---------------|----------------------|
| Tráfego → Opt-in | Opt-in rate | > 30% | < 15% |
| Opt-in → Bridge | Email open rate | > 25% | < 15% |
| Bridge → Afiliado | Bridge CTR | > 20% | < 8% |
| Afiliado → Compra | Conversion rate | > 3% | < 1% |
| Global | EPC (earnings/click) | > R$1,50 | < R$0,50 |
| Global | Revenue per visitor | > R$0,30 | < R$0,10 |
| Global | Funnel completion rate | > 2% | < 0,5% |

### Identificação do Gargalo — Regra dos 80%

```
Calcular "desvio negativo" por etapa:
Desvio = (Benchmark - Métrica Atual) / Benchmark × 100%

Ordenar etapas por desvio negativo (maior primeiro)
Gargalo = Etapa com maior desvio

Exemplo:
Opt-in rate: atual 18%, benchmark 30% → desvio 40%  ← GARGALO
Bridge CTR: atual 17%, benchmark 20% → desvio 15%
Conv. rate: atual 2.8%, benchmark 3% → desvio 7%

→ Priorizar otimização da Opt-in Page
```

### Diagnóstico por Etapa Gargalo

**Se Gargalo = Opt-in Rate:**
- [ ] Headline promete resultado específico?
- [ ] Bullets orientados a benefícios (não features)?
- [ ] Formulário tem mais de 2 campos?
- [ ] CTA do botão usa linguagem de ação?
- [ ] Prova social presente?
- [ ] Página carrega em < 3s no mobile?
- [ ] Há distrações/links que saem da página?

**Se Gargalo = Bridge CTR:**
- [ ] Hook da bridge para o scroll em < 3 segundos?
- [ ] Story usa Epiphany Bridge (não só lista de benefícios)?
- [ ] CTA visível acima do fold?
- [ ] Afirmações na bridge são verificáveis/críveis?
- [ ] Há múltiplos CTAs competindo?

**Se Gargalo = Conversion Rate:**
- [ ] Há alinhamento entre a copy da bridge e a página de vendas do produtor?
- [ ] Temperatura do tráfego condiz com a oferta (cold → offer cara)?
- [ ] O produto tem boa reputação (verificar reviews externos)?
- [ ] Comissão paga justifica o tráfego sendo enviado?

**Se Gargalo = EPC:**
- [ ] Mix de tráfego cold/warm está correto?
- [ ] Produto tem ticket adequado para o canal?
- [ ] Email sequence está ativa e engajando?

### Framework PIE para Priorização de Hipóteses

```
PIE Score = (Potential + Importance + Ease) / 3
Pontuar cada dimensão de 1-10:

Potential: Quanto a métrica pode melhorar?
Importance: Quanto impacto financeiro se melhorar?
Ease: Quão rápido/barato é implementar o teste?

Hipóteses com PIE Score > 7 = Testar primeiro
```

### Tamanho de Amostra para Testes A/B

```
Para detectar diferença de 20% com 95% de confiança:
Opt-in test (base 20%): ~1.000 visitantes por variante
Bridge CTR test (base 20%): ~1.500 visitantes por variante
Conversão test (base 3%): ~5.000 visitantes por variante (ou usar plataforma de afiliado)
```

## Veto Conditions
- Dados históricos insuficientes (< 500 visitantes por etapa) → BLOQUEAR (otimizar prematuramente sem dados = aleatoriedade)
- Múltiplos testes simultâneos na mesma etapa → ALERTAR (contamina resultados — testar UMA variável por vez)
- Concluir teste antes de atingir tamanho de amostra mínimo → BLOQUEAR (resultados não são estatisticamente válidos)
- Mudar o produto afiliado como "otimização" sem primeiro otimizar o funil → ALERTAR (pode ser problema de funil, não de produto)
- Otimizar etapas downstream (conversão) sem resolver gargalo upstream (opt-in) → ALERTAR (desperdício de esforço)

## Output
- **File:** `outputs/affiliates/{projeto-slug}/cro-audit.md`
- **Format:** Markdown com métricas atuais, gargalo identificado e plano de experimentos

## Output Example
```yaml
cro_audit:
  project: "afiliado-emagrecimento-q1"
  audit_period: "2026-01-15 to 2026-02-15"
  total_visitors: 3420
  data_source: "Meta Ads + Mailchimp + Hotmart"

current_metrics:
  optin_rate: "14%"        # CRÍTICO — benchmark 30%
  bridge_ctr: "22%"        # BOM — benchmark 20%
  affiliate_cr: "3.2%"     # BOM — benchmark 3%
  epc: "R$0.98"            # ABAIXO — benchmark R$1.50
  revenue_per_visitor: "R$0.14"  # CRÍTICO
  funnel_completion_rate: "1.0%" # CRÍTICO

bottleneck_analysis:
  ranking:
    - etapa: "Opt-in Page"
      metrica: "Opt-in rate"
      atual: "14%"
      benchmark: "30%"
      desvio_negativo: "53%"
      prioridade: 1  # GARGALO PRINCIPAL

    - etapa: "EPC Global"
      metrica: "EPC"
      atual: "R$0.98"
      benchmark: "R$1.50"
      desvio_negativo: "35%"
      prioridade: 2

    - etapa: "Bridge Page"
      metrica: "CTR"
      atual: "22%"
      benchmark: "20%"
      desvio_negativo: "0%"
      prioridade: "OK — não priorizar"

root_cause_optin:
  checklist:
    headline_especifica: false   # PROBLEMA — headline genérica
    bullets_beneficios: true
    formulario_max_2_campos: false  # PROBLEMA — tem 3 campos (nome+email+telefone)
    cta_acao: true
    prova_social: false  # PROBLEMA — sem contagem de downloads
    mobile_speed: "4.2s"  # PROBLEMA — acima de 3s
    sem_distracoes: true

hypotheses:
  - id: "H001"
    descricao: "Remover campo 'telefone' do formulário"
    etapa: "Opt-in Page"
    metrica: "Opt-in rate"
    potential: 8
    importance: 9
    ease: 10
    pie_score: 9.0
    prioridade: 1

  - id: "H002"
    descricao: "Adicionar contagem de downloads ('Já baixado por +2.300 pessoas')"
    etapa: "Opt-in Page"
    metrica: "Opt-in rate"
    potential: 6
    importance: 8
    ease: 9
    pie_score: 7.7
    prioridade: 2

  - id: "H003"
    descricao: "Testar headline específica vs atual"
    etapa: "Opt-in Page"
    metrica: "Opt-in rate"
    potential: 7
    importance: 9
    ease: 7
    pie_score: 7.7
    prioridade: 3

experiment_plan:
  - experiment: "H001 — Remover campo telefone"
    type: "implementação direta (não A/B)"
    expected_lift: "+8-15% opt-in rate"
    sample_needed: "N/A (implementação imediata)"
    duration: "1 semana de validação"

  - experiment: "H002 + H003 — A/B test headline + prova social"
    type: "A/B test"
    variants: ["A: atual", "B: nova headline + contagem"]
    success_metric: "Opt-in rate"
    min_sample: "500 visitantes por variante"
    estimated_duration: "2-3 semanas no volume atual"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
