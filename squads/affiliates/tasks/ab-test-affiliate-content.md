# ab-test-affiliate-content

## Metadata
```yaml
task_id: AFF_GRW_006
agent: growth-optimizer
type: analysis
complexity: medium
estimated_time: "45min-1h30min"
source: "CRO Testing Discipline — Peep Laja (CXL Institute) + Affiliate Content A/B Frameworks"
```

## Purpose
Executar testes A/B estruturados em elementos de conteúdo afiliado — headline, CTA, layout e comprimento — para identificar otimizações que aumentam o CTR do link afiliado, o EPC e a conversão geral, com rigor estatístico (p < 0.05) e isolamento de uma variável por teste.

## Prerequisites
- Artigo ou página de conteúdo afiliado com tráfego suficiente (mínimo 300 sessões/mês)
- Rastreamento de cliques em links afiliado configurado (AFF_ANL_001 — evento `affiliate_click`)
- Plano de experimento aprovado conforme AFF_GRW_003 (ou executar antes deste task)
- Ferramenta de A/B disponível: Google Optimize (descontinuado — usar alternativa), VWO, Optimizely, Cloudflare Worker redirect, ou UTM split manual

## Steps

1. **Selecionar elemento para teste** — Escolher somente um elemento por teste (regra fundamental). Prioridade recomendada por impacto histórico em sites afiliados:
   1. Headline principal (maior impacto em tempo na página e scroll)
   2. CTA — texto, cor, posição
   3. Posição do primeiro link afiliado (above the fold vs abaixo do primeiro parágrafo)
   4. Comprimento do conteúdo (artigo curto vs longo)
   5. Layout de comparação (tabela vs lista vs prose)
   6. Imagens e screenshots de produto

2. **Definir variações** — Criar exatamente uma variação (B) vs o controle atual (A):
   - Controle A: estado atual da página
   - Variação B: único elemento modificado
   Documentar a mudança com screenshots de antes e depois antes de implementar.

3. **Calcular tamanho de amostra** — Usar o calculator de Evan Miller com:
   - CR baseline (cliques afiliados / sessões da página)
   - MDE desejado (mínimo 20% para detectar efeito real)
   - Power: 80%
   - Significance: 95%
   Confirmar que o tráfego atual permite atingir o tamanho em <= 30 dias.

4. **Implementar divisão do teste** — Configurar split de tráfego 50/50:
   - **Método preferido:** URL Split Test com UTMs diferentes por variação
     - Controle: `/review/produto?utm_content=cta-original`
     - Variação: `/review/produto-v2?utm_content=cta-novo`
     - Usar Cloudflare Workers ou nginx para redirecionar 50% do tráfego para cada URL
   - **Método alternativo:** Ferramenta de A/B nativa (VWO, Hotjar, etc.)
   - **Método manual (menor tráfego):** Publicar variação por 7 dias, comparar vs 7 dias anteriores (menos rigoroso — documentar a limitação)

5. **Configurar rastreamento por variação** — Verificar no GA4 que o evento `affiliate_click` está sendo registrado separadamente por variação (via UTM ou dimension customizada). Validar no DebugView antes de iniciar o teste.

6. **Iniciar teste e documentar data de início** — Registrar data e hora de início. Não fazer outras alterações na página ou campanhas durante o teste.

7. **Monitorar diariamente sem interferir** — Verificar diariamente apenas para detectar problemas técnicos (tracking quebrado, variação não carregando). NÃO analisar resultados antes do tamanho de amostra ser atingido — multiple testing problem.

8. **Analisar resultado no prazo definido** — Após atingir tamanho de amostra E mínimo de 14 dias:
   - Calcular taxa de conversão (cliques afiliados / sessões) para A e B
   - Calcular p-value usando calculator estatístico
   - Verificar métricas secundárias (tempo na página, scroll depth)
   - Verificar guardrails (alguma métrica importante caiu?)

9. **Declarar vencedor e implementar** — Com p < 0.05:
   - Vencedor: implementar permanentemente e desativar variação perdedora
   - Sem vencedor (p > 0.05): manter controle, testar próxima hipótese do backlog

10. **Documentar aprendizado e atualizar backlog** — Registrar: o que foi testado, resultado, p-value, o que aprendemos sobre o comportamento do usuário. Adicionar insight ao backlog ICE para informar próximos experimentos.

## Framework

### Elementos de Teste por Impacto Esperado

| Elemento | Impacto Típico | Dificuldade de Implementação | Prioridade |
|---------|---------------|------------------------------|-----------|
| Headline principal | Alto (engajamento inicial) | Baixa | 1 |
| Texto do CTA | Alto (clique direto) | Baixa | 2 |
| Posição do primeiro CTA | Alto (above fold) | Baixa | 3 |
| Cor do botão CTA | Médio | Baixa | 4 |
| Comprimento do artigo | Médio-Alto | Média | 5 |
| Tabela de comparação | Médio | Média | 6 |
| Imagem hero do produto | Médio | Baixa | 7 |
| Prova social (depoimentos) | Alto | Média | 3 (empate) |
| Bônus exclusivo no CTA | Alto | Média | 3 (empate) |

### Boas Variações de Headline para Conteúdo Afiliado

| Tipo | Controle Exemplo | Variação Exemplo |
|------|-----------------|-----------------|
| Problema → Solução | "Melhor Suplemento para Emagrecer" | "Pare de Desperdiçar Dinheiro em Suplemento Ruim: O Ranking Honesto de 2026" |
| Curiosidade | "Review: Suplemento X" | "Testamos 7 Suplementos por 90 Dias. Só 1 Realmente Funcionou." |
| Autoridade | "Guia de Suplementos Fitness" | "O Que Nutricionistas Tomam (e o Que Eles Nunca Comprariam)" |
| Urgência | "Compre Suplemento X" | "Os 3 Suplementos que Ainda Valem o Preço em 2026 (Antes do Próximo Reajuste)" |

### Variações de CTA por Temperatura de Tráfego

| Temperatura | CTA Controle | CTA Variação A | CTA Variação B |
|------------|-------------|---------------|---------------|
| Cold | "Saiba Mais" | "Ver Preço e Detalhes" | "Quero Este Produto →" |
| Warm | "Comprar Agora" | "Garantir Minha Oferta" | "Ver Oferta Especial de Hoje" |
| Hot | "Comprar" | "Comprar com Bônus Exclusivo" | "Pedir Agora — Entrega Rápida" |

### Critério de Parada Antecipada

| Situação | Ação |
|---------|------|
| Variação B com CR 50%+ abaixo de A após 7 dias | Encerrar antecipadamente (dano claro) |
| Tracking quebrado em qualquer variação | Encerrar, corrigir, reiniciar |
| Mudança de algoritmo do Google durante o teste | Documentar como confundidor, analisar com cautela |
| Nova promoção do produtor afiliado durante o teste | Documentar o período — dados podem ser inválidos |

## Veto Conditions

- **HARD VETO:** Iniciar teste A/B sem calcular tamanho de amostra — "deixar rodar por uma semana e ver" não é metodologia; é risco de decisão baseada em ruído estatístico
- **HARD VETO:** Fazer múltiplas alterações simultâneas na página durante o teste — contamina os resultados; qualquer mudança durante o período do teste invalida o experimento
- **HARD VETO:** Declarar vencedor com p > 0.05 — resultado não estatisticamente significativo = sem evidência de diferença real; não agir em resultado insignificante
- **SOFT VETO:** Testar cor de botão antes de testar headline ou posição de CTA — priorizar elementos de maior impacto primeiro; micro-otimizações vêm depois
- **ALERTA:** Menos de 100 sessões/mês na página testada — volume muito baixo para A/B confiável em prazo razoável; considerar consolidar tráfego antes de testar

## Output

- **File:** `outputs/affiliates/{projeto-slug}/ab-test-{slug}-{YYYY-MM-DD}.md`
- **Format:** Markdown com setup do teste, resultados e decisão

## Output Example

```yaml
ab_test:
  id: "ABT-004"
  project: "afiliado-fitness-br"
  designer: "growth-optimizer"
  page: "/review/melhor-suplemento-emagrecimento"
  element_tested: "Headline principal"
  test_start: "2026-02-20"
  test_end: "2026-03-06"
  status: "COMPLETED"

setup:
  control_a:
    headline: "Melhor Suplemento para Emagrecer 2026 — Review Completo"
    utm_content: "headline-original"
    description: "Headline informativa atual, foco em completude do review"

  variation_b:
    headline: "Testamos 7 Suplementos por 90 Dias. Só 1 Realmente Funcionou."
    utm_content: "headline-curiosidade"
    description: "Headline de curiosidade com número específico e resultado concreto"

  split: "50/50"
  method: "URL split via Cloudflare Worker"

sample_size:
  baseline_cr: "3.1%"
  mde: "25%"
  per_variation: 620
  total: 1240
  achieved: 1387

results:
  control_a:
    sessions: 694
    affiliate_clicks: 22
    cr: "3.17%"
    avg_time_page: "2m 12s"
    scroll_75pct: "41%"

  variation_b:
    sessions: 693
    affiliate_clicks: 31
    cr: "4.47%"
    avg_time_page: "2m 44s"
    scroll_75pct: "53%"

  p_value: "0.031"
  significance: "96.9% — SIGNIFICATIVO (p < 0.05)"
  winner: "Variation B (+41% CR)"
  guardrails: "PASSED — tempo na página e scroll aumentaram junto com CR"

decision:
  verdict: "WINNER — Implementar Variation B permanentemente"
  action: "Atualizar headline do artigo. Desativar URL split. Monitorar EPC por 14 dias."
  implementation_date: "2026-03-07"

learning: |
  Headlines com prova de tempo ("90 dias de teste") e resultado específico ("só 1 funcionou")
  geram 41% mais cliques em link afiliado do que headlines descritivas.
  O mecanismo é curiosidade: o leitor quer descobrir qual dos 7 é o vencedor.
  Aplicar este padrão nos próximos 3 artigos do cluster.

next_test:
  hypothesis: "Se movermos o CTA principal para above the fold (acima do primeiro parágrafo), então CTR subirá 20%."
  ice_score: 7.5
  estimated_start: "2026-03-10"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
