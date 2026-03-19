# Template: Mentoria Individual (High Ticket — R$2.500 a R$5.000)

## Metadados do Produto

```yaml
tipo: mentoria_individual
ticket: high
faixa_preco: "R$2.500 – R$5.000"
formato: "Sessões individuais de 40 minutos (modelo Jay Abraham)"
regras_ativas:
  - NO-H008  # qualificação do lead por dispositivo e comportamento
  - NO-F021  # upsell para Sala Mente Mestre como próximo passo
modelo_referencia: "Jay Abraham — sessões focadas de alto impacto, não grupos longos"
upsell_destino: "Sala Mente Mestre — R$40.000"
```

---

## 1. Formato — 40 Minutos Individual (Modelo Jay Abraham)

```yaml
formato_sessao:
  duracao_min: 40
  tipo: "Individual — 1 mentor + 1 cliente"
  justificativa: >
    Sessões de grupo de 3h diluem o foco e reduzem o impacto percebido.
    40 minutos individuais com foco total geram mais resultado e mais
    satisfação do que 3h em grupo. Modelo validado por Jay Abraham.
  estrutura_da_sessao:
    - minutos_1_5:
        nome: "Check-in e Contexto"
        o_que_fazer: >
          Perguntar onde o cliente está desde a última sessão.
          Identificar o ponto de maior tração ou maior travamento.
    - minutos_6_15:
        nome: "Diagnóstico"
        o_que_fazer: >
          Fazer as perguntas certas para entender a causa raiz do problema.
          Não dar solução ainda — diagnosticar primeiro.
        perguntas_chave:
          - "O que você tentou que não funcionou?"
          - "O que está impedindo de avançar?"
          - "Se você soubesse a resposta, qual seria?"
    - minutos_16_30:
        nome: "Intervenção Focada"
        o_que_fazer: >
          Dar a solução, framework ou perspectiva que muda o jogo.
          1 insight poderoso vale mais que 10 superficiais.
        principio: "Profundidade, não volume"
    - minutos_31_38:
        nome: "Plano de Ação"
        o_que_fazer: >
          Definir 1 a 3 ações que o cliente vai executar até a próxima sessão.
          Ações específicas com prazo, não intenções vagas.
    - minutos_39_40:
        nome: "Comprometimento"
        o_que_fazer: >
          Perguntar: 'Em qual dessas ações você se compromete até [data]?'
          Registrar e enviar por email como accountability.
  frequencia_das_sessoes:
    padrao: "2x por mês"
    intensivo: "4x por mês (para projetos críticos)"
    manutencao: "1x por mês (após resultado alcançado)"
  duracao_do_programa: "3 meses (padrão) / 6 meses (para transformações maiores)"
```

---

## 2. Script da Sessão

```yaml
script_sessao:
  abertura:
    copy: >
      "Oi [Nome], que bom te ver. Temos 40 minutos de foco total.
      Me conta: o que aconteceu desde a nossa última conversa?
      Onde você teve tração e onde travou?"
    objetivo: "Identificar o ponto de maior alavancagem"

  diagnostico:
    perguntas_padrao:
      - "Se esse problema não existisse, o que seria diferente no seu negócio?"
      - "Qual é o custo real (tempo + dinheiro + energia) desse problema?"
      - "O que você já tentou? Por que não funcionou?"
      - "Qual recurso ou informação te faltou?"
    postura_do_mentor: "Ouvir 70%, falar 30%. Resistir à urgência de dar resposta imediata."

  intervencao:
    estrutura:
      - "Nomear o padrão: 'O que estou vendo é...'"
      - "Dar o framework: 'A forma que funciona neste caso é...'"
      - "Mostrar o caminho: 'O próximo passo concreto é...'"
    copy_exemplo: >
      "O que estou vendo é [padrão identificado].
      A maioria das pessoas trava aqui porque [razão].
      O que funciona neste caso é [intervenção].
      Vou te mostrar como aplicar isso ao seu contexto."

  plano_de_acao:
    formato:
      - "Ação 1: [o quê] — prazo: [data]"
      - "Ação 2: [o quê] — prazo: [data]"
      - "Ação 3: [o quê] — prazo: [data] (opcional)"
    regra: "Máximo 3 ações. Menos é mais."
    registro: "Enviado por email ao cliente até 1h após a sessão"

  encerramento:
    copy: >
      "Você tem [1-3 ações]. A mais importante é [ação 1].
      Nos vemos em [data]. Qualquer dúvida até lá, me chama.
      Vai fundo."
```

---

## 3. Qualificação do Lead (NO-H008)

```yaml
qualificacao:
  regra: >
    Não aceitar qualquer lead. Qualificar por dispositivo de acesso,
    comportamento e nível de comprometimento (NO-H008).
  criterios_de_qualificacao:
    dispositivo:
      descricao: "Tipo de dispositivo que o lead usa indica maturidade digital"
      desktop_preferido: true
      mobile_apenas: "Alerta — pode indicar perfil mais passivo"
    comportamento_digital:
      - "Abriu emails da sequência (acompanhamento via plataforma)"
      - "Assistiu aula ou workshop antes de solicitar mentoria"
      - "Comentou, respondeu email, interagiu com conteúdo"
      - "Comprou produto low/mid ticket antes (prova de comprometimento)"
    perguntas_de_qualificacao_na_aplicacao:
      - "Qual é o resultado que você quer alcançar em 3 meses?"
      - "O que você já tentou para chegar lá?"
      - "Por que agora? O que mudou?"
      - "Você tem orçamento de R$[PRECO] disponível agora?"
      - "Qual é a sua maior resistência para investir nisso?"
  perfil_ideal:
    - "Sabe o que quer (resultado claro)"
    - "Já tentou sozinho e travou"
    - "Tem orçamento confirmado"
    - "Histórico de compra de produtos anteriores"
    - "Engajado com o conteúdo (não apenas inscrito)"
  perfil_desqualificado:
    - "Quer resultado vago ('quero melhorar minha vida')"
    - "Nunca comprou nada antes"
    - "Pede desconto antes de entender o produto"
    - "Comportamento passivo (nunca responde emails)"
```

---

## 4. Follow-up Pós-Mentoria

```yaml
follow_up_pos_mentoria:
  durante_o_programa:
    accountability_semanal:
      canal: "WhatsApp ou email"
      mensagem: "Oi [Nome] — como está a ação [X] que combinamos?"
      timing: "2 dias antes do prazo definido na sessão"
    material_de_apoio:
      quando: "Quando a sessão gerar um entregável"
      o_que_enviar: "PDF ou link com o plano de ação da sessão"

  pos_programa:
    email_1:
      timing: "D+7 após última sessão"
      assunto: "Como está indo a implementação?"
      corpo: "Check-in + resultado esperado + abertura para continuar"
    email_2:
      timing: "D+30"
      assunto: "Um mês depois — qual foi o resultado?"
      corpo: "Coleta de resultado + celebração + apresentação do próximo nível"
    email_3:
      timing: "D+60"
      assunto: "Convite — próximo ciclo de mentoria"
      corpo: "Oferta de renovação ou upsell (NO-F021)"
```

---

## 5. Upsell — Sala Mente Mestre (R$40.000)

```yaml
upsell_sala_mente_mestre:
  produto: "Sala Mente Mestre"
  preco: "R$40.000"
  quando_apresentar:
    - "Ao final do programa de mentoria (sessão de encerramento)"
    - "Quando cliente atinge resultado e quer próximo nível"
    - "Quando cliente demonstra potencial e comprometimento alto"
  quem_se_qualifica:
    - "Completou pelo menos 1 ciclo de mentoria"
    - "Implementou o que foi acordado nas sessões"
    - "Tem resultado concreto para mostrar"
    - "Receita ou potencial de receita que justifica o investimento"
  pitch:
    copy: >
      "Você provou que consegue implementar. Agora a pergunta é:
      até onde você quer ir? A Sala Mente Mestre é para quem está
      pronto para o próximo nível — com acesso, ferramentas e
      acompanhamento que a mentoria individual não cobre."
  regra: "NO-F021 — sempre apresentar o próximo passo, nunca deixar sem direção"
```
