# Template: Imersão (High Ticket — R$997)

## Metadados do Produto

```yaml
tipo: imersao
ticket: high
faixa_preco: "R$997"
duracao: "1 a 2 dias (presencial ou online intensivo)"
regras_ativas:
  - NO-F012  # upsell para mentoria/kit aparece antes do encerramento
  - NO-F021  # follow-up 30 dias com próximo passo
```

---

## 1. Agenda (1 a 2 Dias)

```yaml
agenda:
  formato_1_dia:
    manha:
      - horario: "08h30"
        atividade: "Credenciamento e boas-vindas"
        duracao_min: 30
      - horario: "09h00"
        atividade: "Diagnóstico individual — onde cada participante está"
        duracao_min: 45
      - horario: "09h45"
        atividade: "Bloco 1 — Fundação e Método Central"
        duracao_min: 90
      - horario: "11h15"
        atividade: "Demonstração ao vivo (Gatilho 6)"
        duracao_min: 45
      - horario: "12h00"
        atividade: "Almoço + networking guiado"
        duracao_min: 60
    tarde:
      - horario: "13h00"
        atividade: "Bloco 2 — Implementação prática em grupo"
        duracao_min: 90
      - horario: "14h30"
        atividade: "Trabalho individual — construção do action plan"
        duracao_min: 60
      - horario: "15h30"
        atividade: "Apresentação dos action plans (cada participante)"
        duracao_min: 60
      - horario: "16h30"
        atividade: "Oferta — Mentoria / Kit Monetização (NO-F012)"
        duracao_min: 30
      - horario: "17h00"
        atividade: "Encerramento, fotos e networking livre"
        duracao_min: 30

  formato_2_dias:
    dia_1:
      foco: "Diagnóstico + Método + Construção"
      estrutura: "Seguir agenda de 1 dia até o bloco 2"
      encerramento_dia_1: "Jantar de networking (opcional) — não obrigatório"
    dia_2:
      foco: "Implementação Avançada + Action Plan + Oferta"
      manha: "Refinamento dos action plans + Q&A profundo"
      tarde: "Demonstração avançada + Oferta + Encerramento"
```

---

## 2. Networking

```yaml
networking:
  principio: >
    O networking da imersão é um produto em si.
    Participantes pagam para estar na sala com outras pessoas de nível semelhante.
    Facilitar conexões é responsabilidade do mentor.

  momentos_de_networking:
    - momento: "Credenciamento"
      dinamica: "Crachá com nome + resultado que quer alcançar"
    - momento: "Almoço"
      dinamica: "Mesas temáticas (por segmento ou objetivo)"
    - momento: "Break da tarde"
      dinamica: "Pergunta provocativa — cada um responde para o vizinho"
    - momento: "Apresentação dos action plans"
      dinamica: "Feedback cruzado — participantes se ajudam"
    - momento: "Encerramento"
      dinamica: "Grupo de WhatsApp/Telegram dos participantes criado ao vivo"

  grupo_pos_imersao:
    nome: "Alumni — Imersão [Nome] [Mês/Ano]"
    plataforma: "Telegram"
    duracao_acesso: "30 dias (alinhado com follow-up)"
    moderacao: "Mentor ou assistente — 3x por semana"
```

---

## 3. Action Plan Individual

```yaml
action_plan:
  o_que_e: >
    Documento produzido por cada participante durante a imersão
    com os próximos passos específicos para os 30 dias seguintes.
  estrutura:
    - secao_1: "Onde estou agora — diagnóstico honesto"
    - secao_2: "Onde quero estar em 30 dias — 1 meta mensurável"
    - secao_3: "Os 3 passos que vou executar esta semana"
    - secao_4: "O obstáculo mais provável e como vou contorná-lo"
    - secao_5: "Com quem vou me comprometer nesta sala?"
  formato: "Impresso ou digital (Google Docs / Notion)"
  momento_de_preenchimento: "Trabalho individual — 60 min no período da tarde"
  apresentacao: "Cada participante apresenta 2min — mentor dá feedback ao vivo"
  entrega_pos_imersao: "Participante recebe foto/PDF do seu action plan por email"
```

---

## 4. Demonstração Ao Vivo

```yaml
demonstracao_ao_vivo:
  gatilho: 6
  nome_gatilho: "Prova / Demonstração"
  formato_para_imersao:
    - "Aplicação do método no negócio de um participante (com permissão)"
    - "Diagnóstico ao vivo de uma situação real trazida pelo grupo"
    - "Transformação ao vivo: antes/depois de copy, oferta, ou estratégia"
  duracao: "30-45 minutos"
  impacto: >
    A demonstração ao vivo é o momento de maior impacto emocional da imersão.
    É quando o ceticismo cai e a crença no método sobe.
    Prepare o caso com antecedência se possível.
```

---

## 5. Upsell para Mentoria ou Kit (NO-F012)

```yaml
upsell:
  regra: >
    O upsell deve acontecer ANTES do encerramento, quando a energia
    ainda está alta e os participantes estão no pico emocional (NO-F012).
  timing: "30 minutos antes do encerramento — após apresentações dos action plans"
  produtos_para_upsell:
    opcao_1:
      nome: "Mentoria Individual"
      preco: "R$2.500 a R$5.000"
      pitch: "Para quem quer percorrer os 30 dias do action plan com acompanhamento direto"
    opcao_2:
      nome: "Sala Mente Mestre"
      preco: "R$40.000"
      pitch: "Para quem está pronto para o próximo nível de aceleração"
    opcao_3:
      nome: "Kit Monetização"
      preco: "R$997 a R$2.500"
      pitch: "Para quem quer ferramentas completas para implementar o que viu hoje"
  estrutura_pitch:
    duracao_min: 20
    abertura: "Você passou o dia construindo. Agora me deixa te mostrar o que acelera isso."
    ancoragem: "O que vimos hoje vale [X] vezes o que você pagou na imersão."
    oferta: "Tenho [N] vagas disponíveis. Condição especial para quem está nesta sala."
    escassez: "Se quiser, fale comigo no intervalo. Vagas fecham hoje."
```

---

## 6. Follow-up 30 Dias

```yaml
follow_up_30_dias:
  semana_1:
    email_1:
      timing: "D+1"
      assunto: "Sua foto + seu action plan — imersão [nome]"
      corpo: "Foto do evento + PDF do action plan individual + mensagem de encorajamento"
    email_2:
      timing: "D+3"
      assunto: "Como foi a primeira semana de implementação?"
      corpo: "Check-in + dica prática relacionada ao bloco mais importante da imersão"
  semana_2:
    email_3:
      timing: "D+7"
      assunto: "Uma coisa que a maioria negligencia na segunda semana"
      corpo: "Conteúdo de valor + abertura para mentoria (NO-F021)"
    email_4:
      timing: "D+10"
      assunto: "Resultado de [nome de aluno] que aplicou o action plan"
      corpo: "Case de resultado + prova social + CTA para mentoria"
  semana_3_4:
    email_5:
      timing: "D+14"
      assunto: "Meio do caminho — o que está funcionando no seu action plan?"
      corpo: "Engajamento + diagnóstico + sugestão de ajuste"
    email_6:
      timing: "D+21"
      assunto: "1 semana para encerrar o ciclo de 30 dias"
      corpo: "Urgência + convite para sessão de Q&A no grupo"
    email_7:
      timing: "D+30"
      assunto: "30 dias depois da imersão — o que aconteceu?"
      corpo: "Celebração + convite para próxima imersão ou mentoria"
      regra: "NO-F021 — próximo passo sempre presente"
```
