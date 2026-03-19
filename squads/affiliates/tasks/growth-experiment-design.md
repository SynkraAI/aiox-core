# growth-experiment-design

## Metadata
```yaml
task_id: AFF_GRW_003
agent: growth-optimizer
type: creation
complexity: medium
estimated_time: "30min-1h"
source: "MVE Framework — Sean Ellis + Experimentation Discipline — Ronny Kohavi (Microsoft ExP Team)"
```

## Purpose
Desenhar experimentos de crescimento mínimos e rigorosos (MVE — Minimum Viable Experiment) para o negócio de afiliados, garantindo que cada teste tenha hipótese clara, controle e variação isolados, tamanho de amostra adequado e timeline mínima de 14 dias para resultados confiáveis.

## Prerequisites
- Backlog ICE atualizado com hipóteses de crescimento priorizadas (AFF_GRW_001)
- Métricas de baseline disponíveis (AFF_ANL_002 ou AFF_ANL_005)
- Tráfego suficiente para o experimento (mínimo calculado no Step 5)
- Hipótese específica identificada para teste

## Steps

1. **Selecionar hipótese do backlog ICE** — Escolher a iniciativa de maior ICE Score que ainda não foi testada e que é adequada para experimento controlado. Confirmar que não há outros experimentos simultâneos afetando a mesma métrica.

2. **Formular hipótese no formato padrão** — Usar a estrutura obrigatória:
   ```
   "Se [mudança específica] então [métrica alvo] irá [direção] em [magnitude esperada]
   dentro de [janela de tempo], porque [mecanismo explicativo]."
   ```
   Exemplo: "Se adicionarmos um bônus exclusivo (PDF checklist) ao review article, então o EPC irá aumentar em 25% dentro de 14 dias, porque reduz fricção de decisão e aumenta perceived value da oferta."

3. **Definir controle e variação** — Especificar com precisão o que muda:
   - **Controle (A):** Estado atual, sem modificação
   - **Variação (B):** Uma e somente uma mudança
   Regra de ouro: nunca testar mais de uma variável por vez (exceto em testes multivariados planejados).

4. **Identificar a métrica primária** — Definir a única métrica que decide o vencedor:
   - Deve ser diretamente afetada pela mudança
   - Deve ser mensurável com precisão
   - Exemplos válidos: EPC, CTR do link afiliado, CR da bridge page, open rate do email

5. **Calcular tamanho de amostra mínimo** — Usar a fórmula simplificada para a taxa de conversão atual:
   ```
   Minimum Detectable Effect (MDE) = uplift esperado na métrica
   Para CR atual entre 2-5% e MDE de 20%, tamanho de amostra = ~400 usuários por variação
   Para CR atual > 5% ou MDE < 10%, calcular via ferramenta: AB Test Calculator (Evan Miller)
   ```
   Se o tráfego atual não permite atingir o tamanho mínimo em 30 dias, revisar o MDE ou adiar o teste.

6. **Definir timeline mínima de 14 dias** — O experimento deve rodar por no mínimo:
   - 14 dias corridos (captura ciclos semanais de comportamento)
   - Ou até atingir o tamanho de amostra calculado no Step 5
   O que vier DEPOIS é o critério de encerramento. Jamais encerrar antes de 7 dias.

7. **Definir métricas secundárias e guardrails** — Além da métrica primária, monitorar:
   - Métricas secundárias: métricas que não devem cair (ex: tempo na página, scroll depth)
   - Guardrails: se alguma guardrail cair > 15%, encerrar o teste mesmo com métrica primária positiva

8. **Configurar rastreamento do experimento** — Garantir que controle e variação são rastreáveis separadamente:
   - Para A/B de página: usar UTM diferente para cada variação OU ferramenta de A/B nativa (VWO, Optimizely, Google Optimize)
   - Para email: dividir lista aleatoriamente, enviar mesma hora do dia
   - Para ads: criar ad set separado para cada variação com budget equivalente

9. **Documentar protocolo de análise** — Definir antes de iniciar como o resultado será avaliado:
   - Significância estatística mínima: p < 0.05 (95% de confiança)
   - Ferramenta de cálculo: AB Test Significance Calculator
   - Quem toma a decisão final de winner/loser

10. **Salvar plano do experimento e agendar revisão** — Registrar tudo no arquivo de output antes de iniciar qualquer implementação. Nada muda no produto ou página sem o plano documentado primeiro.

## Framework

### Template de Hipótese MVE

```
"Se [ação/mudança específica e mensurável]
então [métrica primária] irá [aumentar/diminuir]
em [delta esperado em %]
dentro de [janela em dias],
porque [mecanismo causal plausível]."
```

**Boas hipóteses:**
- "Se adicionar timer de urgência 24h na bridge page, então o CTR para o link afiliado irá aumentar em 20%, dentro de 14 dias, porque urgência ativa FOMO e reduz procrastinação de decisão."
- "Se enviar email de follow-up no Dia 2 após opt-in (vs atual Dia 3), então o open rate do email #2 irá aumentar em 10%, dentro de 21 dias, porque menor intervalo mantém o usuário engajado enquanto a memória do opt-in ainda é fresca."

**Hipóteses ruins (não usar):**
- "Se melhorar o site, então mais vendas" (vago, não mensurável)
- "Se mudar headline E design E CTA ao mesmo tempo, então mais conversões" (múltiplas variáveis)

### Tamanho de Amostra — Guia Rápido

| CR Atual | MDE Esperado | Amostra por Variação | Duração (500 visitas/dia) |
|---------|-------------|---------------------|--------------------------|
| 2% | 30% → para 2.6% | ~750 | ~3 dias |
| 2% | 20% → para 2.4% | ~1.500 | ~6 dias |
| 2% | 10% → para 2.2% | ~6.000 | ~24 dias |
| 5% | 20% → para 6% | ~600 | ~3 dias |
| 5% | 10% → para 5.5% | ~2.400 | ~10 dias |

Para cálculo preciso: https://www.evanmiller.org/ab-testing/sample-size.html

### Critérios de Significância

```
p < 0.05  → Resultado confiável (95% de confiança) — pode tomar decisão
p 0.05-0.10 → Sinal, mas não decisivo — estender experimento
p > 0.10  → Sem evidência — hipótese nula vence (não há diferença detectável)
```

**Regra prática:** Se após 14 dias e tamanho de amostra atingido não há p < 0.05, a mudança testada provavelmente não tem impacto relevante. Encerrar e testar próxima hipótese do backlog.

### Tipos de Experimentos Comuns no Afiliado

| Tipo | O Que Testar | Métrica Primária | Dificuldade |
|------|-------------|-----------------|------------|
| Bridge page | Headline, CTA, layout, bônus | CTR → link afiliado | Baixa |
| Email | Assunto, dia de envio, conteúdo | Open rate / CTR | Baixa |
| Review article | Posição do CTA, headline, imagens | EPC / tempo na página | Média |
| Produto afiliado | Produto A vs Produto B no mesmo funil | EPC / receita | Média |
| Ads creative | Video vs imagem, headline, ângulo | ROAS / EPC | Baixa |
| Email timing | Horário de envio, intervalo entre emails | Open rate | Baixa |

## Veto Conditions

- **HARD VETO:** Iniciar experimento sem hipótese documentada no formato padrão — sem hipótese não há aprendizado, apenas mudança aleatória
- **HARD VETO:** Encerrar experimento antes de 7 dias, independente dos resultados aparentes — flutuações de curto prazo são ruidosas e enganosas
- **HARD VETO:** Testar mais de uma variável simultaneamente sem ser um teste multivariado planejado — impossibilita atribuição de causalidade
- **SOFT VETO:** Iniciar novo experimento na mesma página/canal enquanto um experimento está rodando — contaminação de dados; aguardar conclusão do atual
- **ALERTA:** Tamanho de amostra calculado exige mais de 45 dias de tráfego — reduzir MDE esperado ou escolher métrica com maior volume de eventos

## Output

- **File:** `outputs/affiliates/{projeto-slug}/experiment-{slug}-{YYYY-MM-DD}.md`
- **Format:** Markdown com plano completo do experimento

## Output Example

```yaml
experiment:
  id: "EXP-007"
  project: "afiliado-fitness-br"
  designer: "growth-optimizer"
  created_at: "2026-02-18"
  status: "PLANNED"

hypothesis:
  statement: "Se adicionarmos um bônus exclusivo (PDF Guia de 7 Dias para Emagrecer) ao review article principal, então o EPC do artigo irá aumentar de R$1.20 para R$1.50 (+25%) dentro de 14 dias, porque o bônus aumenta o perceived value da oferta e reduz a procrastinação de decisão do leitor."
  mde: "25%"
  mechanism: "Bônus exclusivo aumenta perceived value → reduz fricção de decisão → mais cliques qualificados"

control:
  name: "A — Review Article atual (sem bônus)"
  url: "/review/melhor-suplemento-emagrecimento"
  utm_content: "review-sem-bonus"
  description: "Página atual sem menção a bônus. CTA: 'Ver Oferta do Produto'"

variation:
  name: "B — Review Article com Bônus"
  url: "/review/melhor-suplemento-emagrecimento?v=bonus"
  utm_content: "review-com-bonus"
  description: "Mesma página + seção de bônus acima do CTA principal + CTA atualizado: 'Quero o Produto + Meu Guia Grátis'"
  change_type: "Conteúdo + CTA copy"
  single_variable: true

metrics:
  primary: "EPC (R$/clique no link afiliado)"
  baseline: "R$1.20"
  target: "R$1.50 (+25%)"
  secondary: ["CTR no link afiliado", "tempo médio na página"]
  guardrails: ["scroll_75pct não cair mais de 15%", "taxa de rejeição não subir mais de 10%"]

sample_size:
  cr_baseline: "3.2%"
  mde: "25%"
  per_variation: 620
  total: 1240
  daily_traffic_to_page: 95
  estimated_duration_days: 14

timeline:
  start: "2026-02-20"
  minimum_end: "2026-03-06"
  sample_size_achieved_estimate: "2026-03-06"

statistical_protocol:
  confidence_level: "95%"
  significance_threshold: "p < 0.05"
  calculator: "evanmiller.org/ab-testing/results.html"
  decision_owner: "growth-optimizer"

tracking:
  method: "UTM diferente por variação (utm_content)"
  ga4_event: "affiliate_click"
  revenue_source: "Hotmart dashboard — filtrar por UTM"

ice_score: 8.3
from_backlog_id: "GRW-001"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
