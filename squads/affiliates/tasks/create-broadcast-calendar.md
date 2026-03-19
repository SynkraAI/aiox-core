# create-broadcast-calendar

## Metadata
```yaml
task_id: AFF_EML_008
agent: email-nurture
type: creation
complexity: low
estimated_time: "30min-1h"
source: "Ben Settle — Email Players (Daily Email Method); Andre Chaperon — Broadcast Strategy; ConvertKit Creator Calendar"
```

## Purpose
Criar o calendário mensal de broadcasts de email com frequência de 2-3x por semana, mantendo ratio de 3:1 (valor:pitch), planejando temas, subject lines e A/B tests de assunto.

## Prerequisites
- Lista de email ativa com segmentos básicos configurados
- Welcome series ou SOS finalizada e ativa (novos leads na automação)
- Produto(s) afiliado(s) ativos para promover
- Calendário de eventos do nicho disponível (datas sazonais, lançamentos, etc.)
- Definição de frequência aprovada (2x ou 3x por semana)

## Steps

1. **Definir frequência e dias de envio** — Escolher os dias da semana para envio baseado no nicho e no histórico de open rate. Manter consistência — o lead aprende quando esperar seus emails.

2. **Mapear eventos e datas do mês** — Listar datas relevantes para o nicho (feriados, eventos, datas comemorativas) e datas do produto afiliado (início de lançamento, desconto, etc.).

3. **Planejar o ratio valor:pitch** — Para cada 4 emails planejados, 3 devem ser de valor puro e 1 de pitch (promoção). Em semanas de lançamento, o ratio pode ser 1:1.

4. **Definir os temas dos emails de valor** — Para cada email de valor, definir: tema principal, tipo de conteúdo (tutorial, case study, opinião controversa, dica rápida, lista), e o ângulo.

5. **Escrever as opções de subject line** — Para cada email, criar 2 variações de subject line para A/B test. Testar diferentes categorias: curiosidade, benefício direto, social proof, storytelling.

6. **Distribuir os emails de pitch** — Posicionar emails de pitch estrategicamente: nunca 2 seguidos, sempre após email de alto valor, preferencialmente em dias de maior engajamento.

7. **Montar o calendário visual** — Criar tabela com data, assunto A, assunto B, tipo (valor/pitch) e produto promovido (se pitch).

8. **Documentar e salvar** — Registrar o calendário completo no arquivo de output.

## Framework

### Regra do Ratio 3:1

```
Por semana com 3 emails:
  Email 1 (Seg): VALOR — Tutorial, case study ou insight
  Email 2 (Qua): VALOR — Dica, opinião ou storytelling
  Email 3 (Sex): PITCH — Produto afiliado com contexto de valor

Por semana com 2 emails:
  Email 1 (Ter): VALOR — Conteúdo educativo
  Email 2 (Qui): PITCH ou VALOR (alternado semana a semana)

EXCEÇÃO — Semana de lançamento:
  Ratio pode ir até 1:1 (metade valor, metade pitch)
  Nunca enviar 3+ pitches seguidos
```

### Tipos de Email de Valor

| Tipo | Descrição | Melhor Para |
|------|-----------|------------|
| Tutorial | Passo a passo de como fazer algo | Nichos de educação/habilidade |
| Case Study | História real de resultado com análise | Qualquer nicho |
| Opinião controversa | Posição diferente do consenso | Criar engajamento, polarizar |
| Curadoria | Lista de recursos úteis + seu comentário | Qualquer nicho |
| Dica rápida | Insight implementável em 2 minutos | Leitores ocupados |
| Pergunta + minha resposta | Responder pergunta real de leitor | Criar interação |
| Bastidores | O que está acontecendo nos bastidores | Construir persona |

### Tipos de Subject Line e A/B Test

| Tipo A | Tipo B | Teste |
|--------|--------|-------|
| Curiosidade: "Isso me surpreendeu..." | Benefício direto: "Como fazer X em Y minutos" | Curioso vs. Direto |
| Pergunta: "Você comete esse erro?" | Declaração: "O erro que {N}% cometeu" | Pergunta vs. Afirmação |
| Número: "3 erros que custam caro" | Storytelling: "O dia que aprendi a lição difícil" | Lista vs. Narrativa |
| Urgência: "Só até amanhã" | Social proof: "Por que +500 pessoas fazem X" | Urgência vs. Prova |

### Template de Calendário Mensal

```
SEMANA 1:
Segunda: [VALOR] Tema: ___  Assunto A: ___  Assunto B: ___
Quarta:  [VALOR] Tema: ___  Assunto A: ___  Assunto B: ___
Sexta:   [PITCH] Produto: ___  Assunto A: ___  Assunto B: ___

SEMANA 2:
Terça:  [VALOR] Tema: ___
Quinta: [VALOR] Tema: ___
(semana de 2 emails — descanso de pitch)

SEMANA 3:
Segunda: [VALOR] Tema: ___
Quarta:  [PITCH] Produto: ___
Sexta:   [VALOR] Tema: ___

SEMANA 4:
(Verificar se há lançamento — ajustar ratio)
Terça:  [VALOR ou PITCH-LAUNCH]
Quinta: [PITCH-LAUNCH]
Sexta:  [PITCH-LAUNCH urgência]
```

### Horários de Envio Recomendados por Tipo de Lista

| Perfil do Lead | Melhores Horários (BRT) | Piores Horários |
|----------------|------------------------|----------------|
| Profissional CLT | 07h-08h / 12h-13h / 19h-20h | 14h-16h (reunião) |
| Empreendedor | 07h-09h / 21h-22h | 11h-14h (pico de trabalho) |
| Estudante | 12h / 19h-21h | 08h-10h (aula) |
| Dona de casa (BR) | 09h-10h / 14h-15h | 07h, 18h-20h (rotina família) |

### Métricas de Broadcast

| Métrica | Benchmark Bom | Alerta |
|---------|--------------|--------|
| Open rate (broadcast) | > 20% | < 12% |
| CTR (broadcast geral) | > 2% | < 0.8% |
| CTR (broadcast pitch) | > 5% | < 2% |
| Unsubscribe rate | < 0.3% | > 0.5% |
| Revenue per email sent | > R$0.20 | < R$0.05 |

## Veto Conditions
- Mais de 2 pitches consecutivos → ALERTAR (descadastro e denúncia de spam aumentam)
- Frequência acima de 5x por semana sem justificativa de lançamento → ALERTAR (burnout de lista — unsubscribes disparam)
- Subject lines sem A/B test → ALERTAR (perda de 10-30% de open rate potencial)
- Email de pitch sem conteúdo de valor no corpo (só "compre agora") → ALERTAR (emails de pitch com contexto de valor convertem 2-3x mais)
- Calendário sem verificação de feriados BR → ALERTAR (enviar email de pitch em feriado reduz open rate em 20-40%)
- Assuntos em CAPS LOCK completo → BLOQUEAR (filtros de spam travam automaticamente)

## Output
- **File:** `outputs/affiliates/{projeto-slug}/broadcast-calendar-{mes-ano}.md`
- **Format:** Markdown com tabela de calendário, temas e subject lines

## Output Example
```yaml
broadcast_calendar:
  project: "afiliado-renda-extra"
  month: "março/2026"
  frequency: "3x por semana"
  days: ["segunda", "quarta", "sexta"]
  primary_product: "Curso Afiliado do Zero"
  ratio_valor_pitch: "3:1"

week_1:
  dates: "02-06 março"
  emails:
    - date: "02/03 (seg)"
      type: "VALOR"
      theme: "Tutorial"
      topic: "Como escrever uma bio de afiliado que converte"
      subject_a: "Sua bio está afastando compradores (como corrigir)"
      subject_b: "A bio que trouxe 47 vendas orgânicas em 30 dias"
      winner_criteria: "Maior open rate em 4 horas"
      estimated_open_rate: "24-28%"

    - date: "04/03 (qua)"
      type: "VALOR"
      theme: "Opinião Controversa"
      topic: "Por que a maioria dos afiliados não deveria usar Instagram"
      subject_a: "Opinião impopular sobre Instagram e afiliados"
      subject_b: "Eu parei de postar no Instagram — aqui está o que aconteceu"
      winner_criteria: "Maior open rate em 4 horas"
      estimated_open_rate: "26-32%"

    - date: "06/03 (sex)"
      type: "PITCH"
      product: "Curso Afiliado do Zero"
      theme: "Case Study + Pitch"
      topic: "Como Marcos fez R$3.200 em comissões no primeiro mês"
      subject_a: "R$3.200 em comissões — o que Marcos fez diferente"
      subject_b: "A estratégia que gerou 32 vendas em 28 dias"
      affiliate_link: "[link afiliado]"
      estimated_open_rate: "20-24%"
      estimated_ctr: "6-9%"
      revenue_target: "R$400-800"

week_4_launch_override:
  note: "Lançamento especial 23-30 março — ratio muda para 1:1"
  dates: "23-30 março"
  emails:
    - date: "23/03 (seg)"
      type: "VALOR"
      topic: "Preparação para o lançamento — contexto"
    - date: "25/03 (qua)"
      type: "PITCH-LAUNCH"
      topic: "Abertura do carrinho"
    - date: "27/03 (sex)"
      type: "PITCH-LAUNCH"
      topic: "Mid-launch — depoimentos"
    - date: "29/03 (dom)"
      type: "PITCH-LAUNCH"
      topic: "Últimas 48h — urgência"
    - date: "30/03 (seg)"
      type: "PITCH-LAUNCH"
      topic: "Último dia — last call manhã + noite"

ab_test_log:
  format: "Enviar variante A para 30% da lista, variante B para 30%, winner para os outros 40% após 4h"
  platform: "ActiveCampaign A/B Split"
  metric: "Open rate (4 horas após envio)"
  track_results: true

monthly_targets:
  total_emails: 12
  value_emails: 9
  pitch_emails: 3
  target_revenue: "R$2.500-4.500"
  target_open_rate_avg: "22%"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
