# Template: Aula Ao Vivo (Free / Low Ticket)

## Metadados do Produto

```yaml
tipo: aula_ao_vivo
ticket: free_ou_low
faixa_preco: "Gratuita ou R$9 – R$47"
duracao: "60 a 90 minutos"
regras_ativas:
  - NO-H005  # horário padrão: manhã 11h
  - NO-H006  # escassez no domingo (último email da sequência)
  - NO-F022  # follow-up para os 98% que não compraram
meta_conversao_esperada: "~20% dos participantes ao vivo"
```

---

## 1. Roteiro (60 a 90 Minutos)

```yaml
roteiro:
  bloco_abertura:
    duracao_min: 10
    elementos:
      - "Boas-vindas e apresentação rápida (quem sou + credencial em 60s)"
      - "O que vamos ver hoje e o resultado que você vai ter ao final"
      - "Regra da aula: câmera ligada (se for zoom) ou comentem no chat"
      - "Gatilho de comprometimento: quem está aqui para [resultado]? Comenta."

  bloco_conteudo_1:
    duracao_min: 20
    elementos:
      - "Problema central nomeado com clareza"
      - "Por que as soluções comuns falham"
      - "O princípio que muda tudo — introdução do método"

  bloco_conteudo_2:
    duracao_min: 20
    elementos:
      - "Passo 1 do método com demonstração prática"
      - "Exemplo real ou case de resultado"
      - "Exercício rápido aplicado ao vivo (5 min)"

  bloco_conteudo_3:
    duracao_min: 15
    elementos:
      - "Passo 2 do método"
      - "Erro que a maioria comete aqui e como evitar"
      - "Resultado esperado ao aplicar os passos 1 e 2"

  bloco_pitch:
    duracao_min: 15
    posicao: "Últimos 15 minutos da aula"
    regra: >
      O pitch acontece nos ÚLTIMOS 15 min, não no final absoluto.
      Encerrar a aula com o pitch ativo — não após.
    elementos:
      - "Transição natural: 'Agora vou te mostrar como ir mais rápido...'"
      - "Apresentação do produto ofertado"
      - "Preço + condição especial para quem está ao vivo"
      - "Escassez real: vagas / tempo / bônus"
      - "CTA claro: 'Link no chat agora'"

  bloco_encerramento:
    duracao_min: 10
    elementos:
      - "Q&A rápido (apenas perguntas sobre o conteúdo)"
      - "Agradecimento + próximo passo para quem não comprou"
      - "Lembrete da oferta com prazo"
```

---

## 2. Horário (NO-H005)

```yaml
horario:
  padrao: "11h00 (manhã)"
  regra: >
    Aulas ao vivo do Natanael são às 11h da manhã como padrão (NO-H005).
    Fugir deste horário requer justificativa explícita e aprovação.
  justificativa: >
    11h captura a audiência após o rush matinal mas antes do almoço.
    Histórico de maior taxa de presença comparada a outros horários.
  alternativas_permitidas:
    - "19h30 (noite) — para público com trabalho formal"
    - "08h30 (manhã cedo) — para público empresarial"
  dia_semana_recomendado:
    - "Terça"
    - "Quarta"
    - "Quinta"
  evitar: "Segunda (planejamento) e Sexta (dispersão de fim de semana)"
```

---

## 3. Gatilho Ativo

```yaml
gatilho_ativo:
  instrucao: >
    Cada aula ao vivo deve ter 1 gatilho principal ativado intencionalmente.
    Não tente usar todos os 7 ao mesmo tempo.
  os_7_gatilhos:
    - id: 1
      nome: "Autoridade"
      como_usar: "Credencial + case + prova de resultado no início"
    - id: 2
      nome: "Prova Social"
      como_usar: "Depoimento de aluno durante a aula ou no pitch"
    - id: 3
      nome: "Escassez"
      como_usar: "Vagas limitadas, bônus para os primeiros N"
    - id: 4
      nome: "Urgência"
      como_usar: "Oferta encerra em X horas / domingo às 23h59"
    - id: 5
      nome: "Reciprocidade"
      como_usar: "Entregar algo de valor inesperado no início"
    - id: 6
      nome: "Demonstração"
      como_usar: "Executar o método ao vivo na tela"
    - id: 7
      nome: "Comprometimento"
      como_usar: "Pedir que comentem, participem, façam exercício ao vivo"
  gatilho_recomendado_padrao: 6
  gatilho_secundario: 3
```

---

## 4. Pitch nos Últimos 15 Minutos

```yaml
pitch:
  posicao: "Bloco 4 — min 60 de uma aula de 75min (ou min 75 de 90min)"
  estrutura:
    - passo_1_transicao:
        copy: >
          "Antes de encerrar, quero te mostrar algo. Você viu hoje que [resultado]
          é possível. Agora imagine fazer isso em [prazo menor] com [suporte]."
    - passo_2_apresentar_produto:
        copy: >
          "Criei o [Nome do Produto] especificamente para quem estava nessa aula hoje."
        o_que_inclui:
          - "[Benefício 1]"
          - "[Benefício 2]"
          - "[Bônus exclusivo para quem está aqui ao vivo]"
    - passo_3_preco:
        copy: >
          "Normalmente isso está a R$[PRECO CHEIO]. Para quem está ao vivo agora,
          abre por R$[PRECO ESPECIAL]. Mas só enquanto estou aqui."
    - passo_4_escassez:
        copy: >
          "[N] vagas / Link fecha em [X min] / Bônus para os primeiros [N]."
    - passo_5_cta:
        copy: "Link está no chat. Acesse agora enquanto falo."
```

---

## 5. Sequência Pós-Aula (3 Emails)

```yaml
sequencia_pos_aula:
  email_1:
    nome: "Replay"
    timing: "Até 2h após encerramento"
    assunto: "Replay da aula de hoje — [Título da Aula]"
    corpo:
      - "Link do replay (disponível por [X dias])"
      - "Resumo dos 3 principais pontos da aula"
      - "Lembrete da oferta com link e prazo"
    cta: "Assistir ao replay + ver a oferta"

  email_2:
    nome: "Valor Adicional"
    timing: "D+1"
    assunto: "Algo que não deu tempo de falar na aula..."
    corpo:
      - "Conteúdo complementar ao que foi ensinado (sacada extra)"
      - "Prova social: 'Quem comprou ontem já [resultado]'"
      - "Reforço da oferta com nova perspectiva"
    cta: "Aproveitar enquanto está aberto"

  email_3:
    nome: "Escassez no Domingo"
    timing: "Domingo — até 20h"
    assunto: "Fecha hoje à meia-noite — [Nome do Produto]"
    corpo:
      - "Lembrete final com urgência real"
      - "Última chamada para a oferta"
      - "O que acontece para quem não aproveitar"
    cta: "Garantir antes de fechar"
    regra: >
      Email de escassez SEMPRE no domingo (NO-H006).
      Escassez deve ser REAL — não criar urgência falsa.
```

---

## 6. Meta de Conversão (~20%)

```yaml
meta_conversao:
  percentual_alvo: 20
  base_de_calculo: "Participantes ao vivo ativos (não inscritos)"
  exemplos:
    - "100 ao vivo → meta: 20 vendas"
    - "500 ao vivo → meta: 100 vendas"
  fatores_que_aumentam_conversao:
    - pitch_estruturado: true
    - gatilho_de_demonstracao: true
    - escassez_real: true
    - bônus_exclusivo_para_ao_vivo: true
    - aula_entregou_resultado_parcial: true
  follow_up_98_porcento:
    regra: "NO-F022 — os 98% que não compraram recebem sequência específica"
    sequencia: "Replay + valor + escassez domingo"
    objetivo: "Converter parte dos 80% que ficaram em cima do muro"
```
