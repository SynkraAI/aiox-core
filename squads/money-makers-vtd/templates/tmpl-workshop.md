# Template: Workshop (Mid Ticket — R$197 a R$297)

## Metadados do Produto

```yaml
tipo: workshop
ticket: mid
faixa_preco: "R$197 – R$297"
duracao: "2 a 3 horas (ao vivo ou gravado)"
regras_ativas:
  - NO-F012  # oferta high ticket aparece ANTES do final
  - gatilho_6: "Demonstração ao vivo — mostrar, não só contar"
```

---

## 1. Tema e Roteiro Ao Vivo

```yaml
tema:
  instrucao: >
    O workshop resolve 1 problema específico em profundidade.
    A promessa deve ser executável durante as 2-3h do evento.
  formula_tema: "[Verbo de Ação] [Resultado Específico] em [Prazo] — Workshop Intensivo"
  exemplos:
    - "Construa sua primeira oferta high ticket em 3 horas"
    - "Escreva sua sequência de emails de venda hoje"
    - "Monte seu funil de lançamento ao vivo"

roteiro:
  bloco_1:
    nome: "Contexto e Diagnóstico"
    duracao_min: 15
    conteudo:
      - "Por que [problema] existe e por que é difícil resolver sozinho"
      - "O erro que 80% das pessoas cometem"
      - "O que vamos construir juntos hoje"
  bloco_2:
    nome: "Fundação — O Método"
    duracao_min: 30
    conteudo:
      - "Apresentação do framework central"
      - "Os 3 pilares que sustentam o resultado"
      - "Exercício rápido de aquecimento (5min)"
  bloco_3:
    nome: "Construção Prática — Parte 1"
    duracao_min: 40
    conteudo:
      - "Passo 1 ao vivo com demonstração"
      - "Participantes executam junto"
      - "Q&A rápido (5min)"
  bloco_4:
    nome: "Demonstração Ao Vivo (Gatilho 6)"
    duracao_min: 30
    conteudo:
      - "Demonstração real do resultado sendo gerado na tela"
      - "Caso real ou simulação com dados do participante"
      - "Prova visual do método funcionando"
  bloco_5:
    nome: "Construção Prática — Parte 2"
    duracao_min: 25
    conteudo:
      - "Passo 2 e 3 executados"
      - "Exercício de consolidação"
  bloco_6:
    nome: "Oferta High Ticket (NO-F012)"
    duracao_min: 20
    conteudo:
      - "Apresentação do próximo nível ANTES do encerramento"
      - "Pitch estruturado com ancoragem de valor"
      - "CTA com escassez real"
  bloco_7:
    nome: "Encerramento e Q&A Final"
    duracao_min: 20
    conteudo:
      - "Dúvidas dos participantes"
      - "Resumo do que foi construído"
      - "Próximo passo (reforço da oferta)"
```

---

## 2. Slides — Key Points

```yaml
slides:
  estrutura:
    - slide_1: "Capa — Título + Promessa + Nome do Mentor"
    - slide_2: "Agenda dos Blocos (visibilidade do roteiro)"
    - slide_3_5: "Contexto e problema — máx 3 slides"
    - slide_6_10: "Framework central — máx 5 slides"
    - slide_11_15: "Passo a passo — 1 slide por passo"
    - slide_16_18: "Demonstração ao vivo — slides de suporte"
    - slide_19_21: "Oferta high ticket — slides da oferta"
    - slide_22: "Próximo passo — CTA final"
  principios:
    - max_texto_por_slide: "1 ideia, máx 15 palavras"
    - usar_imagens_de_resultado: true
    - evitar_bullet_points_densos: true
    - contraste_alto_para_transmissao: true
```

---

## 3. Exercício Prático

```yaml
exercicio_pratico:
  momento: "Durante o Bloco 3 e Bloco 5"
  formato:
    tipo: "Construção no próprio ambiente do participante"
    instrucao: >
      O exercício deve produzir algo concreto que o participante
      leva para casa (doc, planilha, rascunho, sequência, página).
  estrutura:
    - passo_1: "[Instrução clara — faça X]"
    - passo_2: "[Instrução clara — agora Y]"
    - passo_3: "[Validação — confira com a referência na tela]"
  entregavel_do_exercicio: "[O que o participante terá ao final]"
  tempo_total_exercicio: "30-40 minutos distribuídos"
```

---

## 4. Demonstração Ao Vivo (Gatilho 6)

```yaml
demonstracao_ao_vivo:
  gatilho: 6
  nome_gatilho: "Prova / Demonstração"
  principio: >
    Mostrar o método funcionando em tempo real é mais persuasivo
    do que qualquer argumento ou depoimento. Ver é crer.
  formatos_possiveis:
    - "Tela compartilhada: mentor executa o método ao vivo"
    - "Caso real: resultado de aluno gerado durante o workshop"
    - "Simulação ao vivo: participante voluntário como cobaia"
    - "Antes/depois ao vivo: transformar algo feio em algo que converte"
  checklist_demonstracao:
    - duracao_minima_min: 15
    - resultado_visivel_na_tela: true
    - narrativa_em_voz_alta: true
    - momento_wow_claro: true
```

---

## 5. Oferta High Ticket ANTES do Encerramento (NO-F012)

```yaml
oferta_high_ticket:
  regra: >
    A oferta high ticket DEVE aparecer antes do encerramento do workshop,
    não apenas no final. Posicionar cedo aumenta tempo de decisão (NO-F012).
  timing_no_roteiro: "Bloco 6 — aproximadamente 80% do conteúdo entregue"
  estrutura_pitch:
    abertura: "Você viu hoje que [resultado] é possível. Agora imagine..."
    produto: "[Nome do Produto High Ticket]"
    preco: "R$[PRECO] — ou [condição especial para participantes]"
    o_que_inclui:
      - "[Item 1]"
      - "[Item 2]"
      - "[Item 3]"
    escassez: "[N] vagas / fecha [data real]"
    cta: "Link no chat agora"
  meta_conversao: "15-25% dos participantes"
```

---

## 6. Follow-up — 3 Emails Pós-Workshop

```yaml
follow_up:
  email_1:
    timing: "Até 2h após encerramento"
    assunto: "Replay + o que você construiu hoje"
    corpo:
      - "Link do replay (se disponível)"
      - "Recapitulação do que foi feito"
      - "Lembrete da oferta com prazo"
    cta: "Acesse o replay + saiba mais sobre [produto high ticket]"

  email_2:
    timing: "D+2"
    assunto: "Uma coisa que vi muita gente travada no workshop..."
    corpo:
      - "Objeção ou dúvida comum observada durante o evento"
      - "Resposta com contexto adicional (entrega de valor)"
      - "Abertura suave para a oferta"
    cta: "[Link da oferta high ticket]"

  email_3:
    timing: "D+4 ou último dia da escassez"
    assunto: "Fecha hoje — [nome do produto high ticket]"
    corpo:
      - "Lembrete de encerramento com escassez real"
      - "Depoimento de resultado (se disponível)"
      - "CTA direto sem rodeios"
    cta: "Garantir minha vaga agora"
```
