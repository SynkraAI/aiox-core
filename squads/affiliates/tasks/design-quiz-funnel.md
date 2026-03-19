# design-quiz-funnel

## Metadata
```yaml
task_id: AFF_FUN_005
agent: funnel-architect
type: creation
complexity: high
estimated_time: "1h30min-3h"
source: "Ryan Levesque — Ask Method; Russell Brunson — Quiz Funnels (DotCom Secrets); Typeform Conversion Research"
```

## Purpose
Criar um funil de quiz interativo com 5-8 perguntas que segmenta os visitantes por perfil, recomenda o produto afiliado de forma personalizada e direciona cada segmento para o link afiliado mais adequado.

## Prerequisites
- Nicho e avatar principal definidos
- Dois ou mais produtos afiliados disponíveis para recomendação segmentada (OU um produto com ângulos diferentes por segmento)
- Plataforma de quiz disponível (Typeform, ScoreApp, Interact, ou implementação custom)
- Plataforma de email marketing para segmentação pós-quiz
- Funil geral mapeado (`design-affiliate-funnel.md` executado)

## Steps

1. **Definir o objetivo do quiz** — O quiz deve responder UMA pergunta central do avatar: "Qual é o meu perfil?", "O que devo fazer primeiro?", "Qual produto é ideal para mim?". Definir esta pergunta central antes de escrever qualquer pergunta.

2. **Mapear os segmentos de resultado** — Definir de 2 a 4 segmentos de resultado (perfis). Cada segmento deve mapear para: produto afiliado específico, ângulo de copy diferente, ou etapa da jornada do avatar.

3. **Criar as 5-8 perguntas** — Escrever perguntas que: (a) são relevantes e interessantes para o avatar, (b) qualificam o visitante, (c) aumentam o comprometimento progressivo com o quiz. Aplicar princípio de escalada de comprometimento.

4. **Mapear pontuação por resposta** — Para cada opção de resposta, atribuir pontuação que determina o segmento de resultado. Testar que as combinações de resposta levam ao segmento correto.

5. **Criar as páginas de resultado segmentadas** — Para cada segmento: headline personalizada para aquele perfil, explicação do resultado, recomendação do produto com copy orientada ao perfil, CTA com link afiliado.

6. **Configurar captura de email pré-resultado** — Inserir formulário de opt-in entre a última pergunta e a exibição do resultado ("Digite seu email para ver seu resultado personalizado"). Adicionar tag de segmento no ESP.

7. **Configurar sequência de email por segmento** — Cada segmento recebe sequência de email diferente, com copy e produto alinhados ao perfil.

8. **Testar todos os caminhos** — Completar o quiz para cada combinação de segmento, verificar resultado, email de entrega e link afiliado.

9. **Documentar o quiz** — Registrar estrutura completa no arquivo de output.

## Framework

### Estrutura do Quiz

```
[QUIZ COVER PAGE]
Título: "Descubra Qual {Resultado} é Ideal Para Você"
Subtítulo: "Responda {N} perguntas e receba sua recomendação personalizada"
CTA: "COMEÇAR O QUIZ →"
Estimativa de tempo: "Leva menos de 2 minutos"

[PERGUNTAS — 5 a 8]
Regra: escala de comprometimento progressivo
1ª-2ª: Perguntas fáceis, demográficas ou de contexto (baixo comprometimento)
3ª-5ª: Perguntas de comportamento/preferência (comprometimento médio)
6ª-8ª: Perguntas de objetivo e urgência (comprometimento alto)

[OPT-IN PRÉ-RESULTADO]
"Quase lá! Para onde enviamos seu resultado personalizado?"
Campos: Nome + Email
Microcopy: "Seu resultado chega em segundos. Sem spam."

[RESULTADO SEGMENTADO]
Headline: "Você é o {Tipo de Perfil}!"
Descrição: O que isso significa + validação do avatar
Recomendação: "Com base no seu perfil, {produto} é a escolha certa para você"
CTA: "QUERO CONHECER {PRODUTO} PARA {PERFIL} →"
```

### Modelo de Pontuação por Pergunta

```
Pergunta X → Resposta A = +2 pontos Segmento 1
Pergunta X → Resposta B = +2 pontos Segmento 2
Pergunta X → Resposta C = +1 ponto Segmento 1, +1 ponto Segmento 2

Total de pontos → define segmento dominante
```

### Tipos de Pergunta por Posição

| Posição | Tipo | Exemplo |
|---------|------|---------|
| 1-2 | Situação atual | "Qual é sua experiência atual com {nicho}?" |
| 3-4 | Comportamento | "Como você normalmente lida com {problema}?" |
| 5-6 | Objetivos | "O que você mais quer alcançar?" |
| 7-8 | Urgência/Bloqueio | "O que te impede de alcançar {objetivo}?" |

### Estrutura da Página de Resultado por Segmento

```yaml
segmento_1:
  nome: "O Iniciante Determinado"
  headline: "Você é o Iniciante Determinado — E Isso é Uma Vantagem!"
  descricao: "Você está no começo, mas tem clareza sobre onde quer chegar. Isso te coloca à frente de 80% das pessoas que nem sabem o que querem."
  produto_recomendado: "Curso Fundamentos — perfeito para construir base sólida"
  angulo_copy: "Começar do jeito certo para não ter que recomeçar depois"
  cta: "QUERO COMEÇAR DO JEITO CERTO →"
  link: "[link afiliado produto A]"

segmento_2:
  nome: "O Intermediário Frustrado"
  headline: "Você é o Intermediário Frustrado — E Existe Uma Razão Para Isso"
  descricao: "Você já sabe o básico, mas os resultados não chegam. Isso acontece com 70% dos que avançam além do iniciante — e tem solução específica."
  produto_recomendado: "Programa Avançado — resolve exatamente onde intermediários travam"
  angulo_copy: "Quebrar o platô que impede os próximos resultados"
  cta: "QUERO QUEBRAR MEU PLATÔ →"
  link: "[link afiliado produto B]"
```

### Métricas-Alvo do Quiz Funnel

| Métrica | Benchmark |
|---------|-----------|
| Quiz completion rate | 55-75% |
| Opt-in rate pré-resultado | 60-80% (alta porque já investiram no quiz) |
| CTR resultado → link afiliado | 25-40% |
| Conversão em compra (afiliado) | 3-8% |

## Veto Conditions
- Quiz com mais de 10 perguntas → ALERTAR (abandono aumenta 40% acima de 8 perguntas)
- Apenas 1 segmento de resultado (quiz sem personalização real) → BLOQUEAR (derrota o propósito — é só uma squeeze page com perguntas inúteis)
- Resultado que direciona todos os perfis para o mesmo link sem copy diferente → ALERTAR (personalização falsa — quebra confiança)
- Quiz sem opt-in pré-resultado → ALERTAR (perda de captura — visitante vê resultado e vai embora)
- Perguntas de posição 1-2 muito invasivas (renda, idade diretamente) → ALERTAR (abandono imediato)
- Plataforma de quiz sem integração com ESP → BLOQUEAR (segmentação se perde)

## Output
- **File:** `outputs/affiliates/{projeto-slug}/quiz-funnel.md`
- **Format:** Markdown com todas as perguntas, mapa de pontuação e páginas de resultado

## Output Example
```yaml
quiz_funnel:
  project: "afiliado-investimentos-iniciantes"
  central_question: "Qual perfil de investidor você é?"
  segments: 3
  platform: "ScoreApp"

questions:
  - number: 1
    text: "Há quanto tempo você investe ou acompanha o mercado?"
    type: "situação atual"
    options:
      - text: "Nunca investi nada"
        score: {iniciante: 3, intermediario: 0, avancado: 0}
      - text: "Tenho poupança mas nada além disso"
        score: {iniciante: 2, intermediario: 1, avancado: 0}
      - text: "Invisto em alguns produtos há menos de 1 ano"
        score: {iniciante: 1, intermediario: 2, avancado: 0}
      - text: "Invisto há mais de 1 ano em diferentes produtos"
        score: {iniciante: 0, intermediario: 1, avancado: 2}

  - number: 2
    text: "Qual é seu maior medo ao pensar em investir?"
    type: "comportamento/bloqueio"
    options:
      - text: "Perder o dinheiro que tenho"
        score: {iniciante: 3, intermediario: 1, avancado: 0}
      - text: "Não saber escolher os investimentos certos"
        score: {iniciante: 2, intermediario: 2, avancado: 0}
      - text: "Ficar preso em investimentos de baixo retorno"
        score: {iniciante: 0, intermediario: 2, avancado: 2}

optin_config:
  position: "after_last_question"
  fields: ["nome", "email"]
  headline: "Quase lá! Para onde enviamos seu perfil de investidor?"
  cta: "VER MEU RESULTADO →"
  esp_tags:
    iniciante: "quiz-investidor-iniciante"
    intermediario: "quiz-investidor-intermediario"
    avancado: "quiz-investidor-avancado"

results:
  iniciante:
    name: "O Construtor de Base"
    headline: "Você é o Construtor de Base — E Isso é o Começo Certo!"
    product: "Investidor Iniciante Completo — R$197"
    affiliate_link: "[link A]"
    cta: "QUERO CONSTRUIR MINHA BASE →"

  intermediario:
    name: "O Acelerador"
    headline: "Você é o Acelerador — Pronto Para o Próximo Nível!"
    product: "Portfólio Inteligente — R$397"
    affiliate_link: "[link B]"
    cta: "QUERO ACELERAR MINHA CARTEIRA →"

  avancado:
    name: "O Estrategista"
    headline: "Você é o Estrategista — Falta Só Afinar a Estratégia!"
    product: "Gestão de Ativos Avançada — R$797"
    affiliate_link: "[link C]"
    cta: "QUERO AFINAR MINHA ESTRATÉGIA →"

metrics:
  target_completion_rate: "65%"
  target_optin_rate: "70%"
  target_ctr_to_affiliate: "30%"
  target_affiliate_cr: "5%"
```

---
*Squad: affiliates | Version: 1.0.0 | Created: 2026-02-18*
