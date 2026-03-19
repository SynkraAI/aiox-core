# viral-hypothesis-test

## Metadata
```yaml
task_id: AFF_SOC_005
agent: social-hooks + growth-optimizer
type: analysis
complexity: medium
estimated_time: "45min-1h30min + 48h observação"
source: "Brendan Kane — Hook Point Framework; Sean Ellis — Growth Hacking; CXL Institute — Experimentation Methodology"
```

## Purpose
Executar o ciclo completo de teste de hooks virais usando o framework Hypothesis-Test-Pivot: criar 3 variações de hook, definir hipóteses, rodar o teste por 48 horas, analisar métricas e escalar o vencedor ou pivotar com aprendizado.

## Prerequisites
- Hook set de pelo menos 3 variações criado (`create-hook-set.md` executado)
- Conteúdo base gravado ou pronto para produção rápida
- Plataforma com pelo menos 500 seguidores (menos que isso, os dados têm muito ruído)
- Capacidade de publicar 3 peças de conteúdo em um intervalo de 48-72h
- Planilha ou ferramenta de tracking de métricas configurada

## Steps

1. **Selecionar as 3 variações de hook para testar** — Do hook set criado, selecionar 3 que sejam substantivamente diferentes (ângulos distintos, não só palavras trocadas). Cada variação deve testar uma hipótese diferente.

2. **Documentar as hipóteses** — Para cada hook, escrever: (a) por que acredita que vai funcionar, (b) qual o mecanismo emocional que ativa, (c) qual segmento do avatar deve responder melhor.

3. **Criar o conteúdo** — Produzir as 3 peças de conteúdo. O corpo do conteúdo deve ser o mais similar possível entre as 3 versões — a variável testada é APENAS o hook.

4. **Definir a janela de teste** — Publicar as 3 versões no mesmo período (48 horas). Se possível, em horários similares em dias consecutivos para controlar a variável de timing.

5. **Monitorar as métricas** — Acompanhar a cada 6-12 horas as métricas definidas no Framework. Registrar os dados em planilha.

6. **Analisar os resultados após 48h** — Identificar o hook vencedor e o perdedor. Extrair o aprendizado principal.

7. **Escalar o vencedor** — Criar 3-5 variações do hook vencedor com temas ligeiramente diferentes ou ângulos complementares.

8. **Documentar o pivot (se nenhum performou)** — Se todos os hooks ficaram abaixo do benchmark, identificar o que mudar e documentar o próximo ciclo de teste.

## Framework

### O Ciclo Hypothesis-Test-Pivot

```
HYPOTHESIS
────────────
Para cada hook, definir:
  1. Nome da hipótese: "H{N} — {tipo de hook}"
  2. Mecanismo: "Acredito que este hook vai funcionar porque..."
  3. Audiência alvo: "Este hook vai ressoar principalmente com..."
  4. Métrica de sucesso: "Considerarei este hook vencedor se [métrica] > [número] em 48h"

TEST
────────────
Variável testada: APENAS o hook (primeiros 3 segundos)
Constantes: Mesmo nicho, mesmo produto, mesmo corpo de conteúdo, mesmo CTA
Duração: 48 horas após publicação
Amostra mínima: 1.000 impressões por variante (se abaixo disso, estender para 72h)
Horários: Publicar em horários de pico similares (ex: todos às 19h em dias consecutivos)

PIVOT (se não atingiu benchmark)
────────────
Mudar UMA variável:
  Option A — Mesmo tipo de hook, palavras diferentes
  Option B — Mesmo tema, tipo de hook diferente
  Option C — Mesmo hook, formato de conteúdo diferente (vídeo → carrossel)
  Option D — Mesmo hook, plataforma diferente
Registrar aprendizado de cada ciclo para construir conhecimento acumulado
```

### Métricas de Avaliação por Plataforma

**TikTok / Reels / Shorts:**

| Métrica | Peso | Excelente | Bom | Pivot |
|---------|------|-----------|-----|-------|
| Watch time % (completion) | 40% | > 70% | 50-70% | < 50% |
| Saves | 25% | > 5% | 2-5% | < 2% |
| Compartilhamentos | 20% | > 3% | 1-3% | < 1% |
| Comentários | 15% | > 2% | 0.5-2% | < 0.5% |

**Instagram Feed (Carrossel):**

| Métrica | Peso | Excelente | Bom | Pivot |
|---------|------|-----------|-----|-------|
| Saves | 40% | > 8% | 4-8% | < 4% |
| Reach (vs seguidores) | 30% | > 200% | 100-200% | < 100% |
| Compartilhamentos | 20% | > 3% | 1-3% | < 1% |
| Link clicks (se CTA) | 10% | > 3% | 1-3% | < 1% |

**Score Composto:**

```
Score = (Watch time% × 0.40) + (Saves% × 0.25) + (Compartilhamentos% × 0.20) + (Comentários% × 0.15)

Hook Vencedor: Score mais alto entre as 3 variantes
Threshold para Escalar: Score > 6.0
Threshold para Pivot: Score < 3.0
Zona de Aprendizado: Score 3.0-6.0 → otimizar antes de escalar
```

### Decisão Tree Pós-Teste

```
Hook A > Hook B > Hook C?
│
├── Hook A score > 6.0 → ESCALAR Hook A (criar 3-5 variações)
│
├── Hook A score 3.0-6.0 → OTIMIZAR Hook A antes de escalar
│   └── Testar: mudar a primeira palavra / adicionar número / mudar ângulo emocional
│
└── TODOS os scores < 3.0 → PIVOT completo
    ├── Tentar: tipo de hook completamente diferente
    ├── Tentar: formato de conteúdo diferente
    └── Tentar: plataforma diferente para o mesmo conteúdo
```

### Escalonamento do Hook Vencedor

```
Quando o hook vencedor é identificado, criar variações:

Exemplo — Hook Vencedor: "R$9.400 em comissões sem operar nenhuma conta"

Variações para escalar:
  V1: "R$12.000 em comissões — um mês, zero operações"
  V2: "3 afiliados que faturam mais de R$8k/mês sem operar"
  V3: "O modelo que gerou R$9.400 em fevereiro: [explicação]"
  V4: "Quanto ganha um afiliado de prop trading? (dados reais)"
  V5: "Afiliado vs Trader: por que o afiliado ganha mais"

Regra: Variar o número, o ângulo ou o formato — manter o PADRÃO que funcionou
(resultado concreto + sem o obstáculo comum + provocação)
```

## Veto Conditions
- Testar mais de 3 variantes simultaneamente → ALERTAR (dados ficam diluídos — impossível isolar o aprendizado)
- Comparar hooks que têm MÚLTIPLAS variáveis diferentes (hook + corpo + CTA diferente) → BLOQUEAR (não é possível atribuir o resultado ao hook — isolar 1 variável)
- Concluir teste com menos de 500 impressões por variante → ALERTAR (dados insuficientes — resultados aleatórios)
- Escalar hook antes das 48 horas completas → ALERTAR (algoritmos continuam distribuindo nas primeiras 24-48h — decisão prematura)
- Ignorar a métrica de saves/compartilhamentos e avaliar apenas likes → ALERTAR (likes são lagging indicator fraco — saves e compartilhamentos indicam conteúdo valioso e viral)
- Pivot sem registrar o aprendizado do ciclo anterior → ALERTAR (sem registro, o mesmo erro é repetido — cada ciclo deve gerar conhecimento documentado)

## Output
- **File:** `outputs/affiliates/{projeto-slug}/viral-test-{ciclo}.md`
- **Format:** Markdown com hipóteses, resultados, análise e próximos passos

## Output Example
```yaml
viral_hypothesis_test:
  project: "afiliado-prop-trading"
  cycle: 1
  platform: "TikTok"
  test_period: "2026-02-18 19h to 2026-02-20 19h"
  content_type: "Vídeo 45s talking head"

hypotheses:
  - id: "H1"
    type: "desejo"
    hook: "R$9.400 em comissões em fevereiro sem operar nenhuma conta"
    mechanism: "Resultado concreto com número específico — quebra ceticismo com prova"
    target_audience: "Traders iniciantes que conhecem prop trading"
    success_metric: "Watch time > 65% AND saves > 4%"
    published: "2026-02-18 19:00"

  - id: "H2"
    type: "surpresa"
    hook: "Prop trading não é sobre operar. É sobre quem você indica."
    mechanism: "Declaração contraintuitiva — interrompe padrão de pensamento estabelecido"
    target_audience: "Traders de qualquer nível que pensam em operar"
    success_metric: "Watch time > 60% AND comentários > 2%"
    published: "2026-02-19 19:00"

  - id: "H3"
    type: "medo"
    hook: "Esse erro está custando R$X/mês para afiliados de prop trading"
    mechanism: "Medo de perda + curiosidade sobre qual erro"
    target_audience: "Afiliados de prop trading já ativos"
    success_metric: "Watch time > 55% AND saves > 5%"
    published: "2026-02-20 19:00"

results_48h:
  H1:
    views: 8420
    watch_time_pct: "72%"
    saves: "5.2%"
    shares: "3.8%"
    comments: "1.9%"
    score: 7.8
    status: "VENCEDOR"

  H2:
    views: 3210
    watch_time_pct: "61%"
    saves: "2.1%"
    shares: "1.2%"
    comments: "4.1%"
    score: 4.9
    status: "APRENDIZADO — bom em comentários, fraco em saves"

  H3:
    views: 1850
    watch_time_pct: "48%"
    saves: "1.3%"
    shares: "0.9%"
    comments: "0.8%"
    score: 2.6
    status: "PIVOT NECESSÁRIO"

analysis:
  winner: "H1 — hook de resultado concreto com número específico"
  key_insight: "Audiência de prop trading responde a prova concreta (número) mais do que a declaração contraintuitiva. Medo de erro não resonou — provavelmente o público-alvo do H3 é muito específico (afiliados ativos) vs. traders em geral."
  h2_note: "Comentários altos indicam debate e curiosidade — pode ser bom para alcance, mas não converte direto"
  h3_pivot: "Mudar de 'medo de erro' para 'revelação de quanto se perde' — mais concreto"

scale_plan:
  hook_winner: "H1 — resultado concreto com número"
  variations_to_test:
    - "R$12.000 em comissões em março — veja como"
    - "Meu resultado real de fevereiro como afiliado de prop trading"
    - "Quanto ganha um afiliado de prop trading? (número real)"
  scale_frequency: "1x/dia por 5 dias para saturar o ângulo"

next_cycle:
  date: "2026-02-25"
  focus: "Testar resultado concreto vs. case study de terceiro vs. tutorial passo a passo"
  learning_carried: "Números específicos e resultados concretos superam declarações abstratas neste nicho"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
