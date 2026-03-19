# Template: Desafio (Mid Ticket — R$97 a R$197)

## Metadados do Produto

```yaml
tipo: desafio
ticket: mid
faixa_preco: "R$97 – R$197"
duracao: "5 a 7 dias"
regras_ativas:
  - NO-H004  # material do desafio deve ter sido conteúdo pago anteriormente
  - NO-F021  # próximo passo obrigatório ao final
```

---

## 1. Nome do Desafio

```yaml
nome:
  formula: "Desafio [Número de Dias] Dias para [Resultado Específico]"
  exemplos:
    - "Desafio 7 Dias para [Resultado]"
    - "Desafio [Adjetivo]: [Resultado] em [Prazo]"
  criterios:
    - nome_comunica_resultado_claro: true
    - nome_tem_senso_de_urgencia_ou_movimento: true
    - resultado_e_mensuravel: true
```

---

## 2. Duração e Estrutura Geral

```yaml
duracao:
  minimo: 5
  maximo: 7
  recomendado: 7
  justificativa: >
    7 dias cria comprometimento real sem gerar abandono por exaustão.
    5 dias é opção para produto de entrada mais agressivo.

estrutura_geral:
  dia_1: "Diagnóstico / Ponto de partida"
  dia_2: "Fundação / Princípio central"
  dia_3: "Primeira ação prática"
  dia_4: "Aprofundamento / Objeção principal resolvida"
  dia_5: "Resultado parcial / Prova do método"
  dia_6: "Acelerador / Stack de resultados"
  dia_7: "Fechamento + Oferta high ticket"
```

---

## 3. Cronograma Diário

```yaml
cronograma_diario:
  formato_por_dia:
    material:
      tipo: "Aula gravada ou ao vivo (20-40min)"
      regra: >
        O material de cada dia DEVE ter sido conteúdo pago anteriormente
        (curso, workshop, mentoria). Não criar material novo do zero (NO-H004).
    tarefa:
      tipo: "1 ação prática implementável no dia"
      tempo_estimado: "15-30 minutos"
    entrega:
      tipo: "Participante posta resultado no grupo"
      plataforma: "Telegram ou WhatsApp"
    feedback:
      tipo: "Resposta do mentor ou moderador ao resultado postado"
      timing: "Mesmo dia ou manhã seguinte"

  horarios_sugeridos:
    liberacao_material: "08h00"
    ao_vivo_opcional: "11h00"  # NO-H005 quando aplicável
    encerramento_dia: "22h00"
```

---

## 4. Material que Era Conteúdo Pago (NO-H004)

```yaml
material_reutilizado:
  regra: >
    Cada dia do desafio DEVE usar conteúdo que já foi vendido separadamente.
    Isso valida o valor percebido e respeita a regra NO-H004.
  mapeamento:
    - dia: 1
      fonte: "[Nome do Produto Anterior] — Módulo/Aula [X]"
      adaptacao_necessaria: "Introdução contextualizada para o desafio"
    - dia: 2
      fonte: "[Nome do Produto Anterior] — Módulo/Aula [X]"
      adaptacao_necessaria: "Exercício prático adicionado"
    - dia: 3
      fonte: "[Nome do Produto Anterior] — Módulo/Aula [X]"
      adaptacao_necessaria: "Atualização com exemplo recente"
    - dia: 4
      fonte: "[Nome do Produto Anterior] — Módulo/Aula [X]"
      adaptacao_necessaria: "Mínima — usar como está"
    - dia: 5
      fonte: "[Nome do Produto Anterior] — Módulo/Aula [X]"
      adaptacao_necessaria: "Adicionar case de resultado real"
    - dia: 6
      fonte: "[Nome do Produto Anterior] — Módulo/Aula [X]"
      adaptacao_necessaria: "Mínima"
    - dia: 7
      fonte: "[Nome do Produto Anterior] — Módulo/Aula [X]"
      adaptacao_necessaria: "Preparar transição para oferta"
```

---

## 5. Grupo de Engajamento

```yaml
grupo:
  plataformas:
    - Telegram (preferido — mais controle de moderação)
    - WhatsApp (alternativa)
  nome_sugerido: "Desafio [Nome] — Turma [Mês/Ano]"
  regras_do_grupo:
    - "Poste seu resultado diário até as 22h"
    - "Apoie os colegas com um comentário por dia"
    - "Dúvidas técnicas no tópico fixado"
    - "Sem spam, sem links externos"
  moderacao:
    frequencia: "2x ao dia (manhã e noite)"
    responsavel: "[Mentor ou Assistente designado]"
  estrategia_engajamento:
    - destaque_resultado_do_dia: true
    - pergunta_provocativa_diaria: true
    - celebracao_de_wins: true
```

---

## 6. Oferta High Ticket no Último Dia

```yaml
oferta_ultimo_dia:
  timing: "Último 30min do Dia 7 (ao vivo ou vídeo especial)"
  produto_ofertado: "[Nome do Produto High Ticket — R$997 a R$5.000+]"
  estrutura_pitch:
    - recapitular_transformacao: "O que você conquistou em 7 dias..."
    - projecao: "Imagine o que é possível em [X meses] com [produto]..."
    - oferta: "Por isso estou abrindo [N] vagas para [produto] por R$[PRECO]"
    - escassez: "Vagas fecham em [prazo real]"
    - cta: "Link na bio / no grupo agora"
  meta_conversao: "10-20% dos participantes ativos"
  condicao_especial:
    tipo: "Desconto ou bônus exclusivo para quem completou o desafio"
    exemplo: "Bônus: sessão de 40min individual para os primeiros [N]"
```

---

## 7. Sequência Email Pré e Pós-Desafio

```yaml
sequencia_email:
  pre_desafio:
    email_1:
      timing: "D-3 (3 dias antes do início)"
      assunto: "O desafio começa em 3 dias — prepare-se"
      corpo: "O que você vai precisar, o que esperar, como se preparar"
    email_2:
      timing: "D-1"
      assunto: "Amanhã começa. Uma coisa que quero que você saiba."
      corpo: "Expectativa correta + comprometimento emocional"
    email_3:
      timing: "Dia 1 — manhã"
      assunto: "Começou! Acesse o material do Dia 1 agora"
      corpo: "Link do grupo + link do material + instrução clara"

  pos_desafio:
    email_1:
      timing: "D+1 após encerramento"
      assunto: "Você completou o desafio. Parabéns."
      corpo: "Celebração + recapitulação da transformação"
    email_2:
      timing: "D+3"
      assunto: "O que vem depois do desafio (para quem quer ir mais fundo)"
      corpo: "Apresentação do produto high ticket com contexto do que viveram"
    email_3:
      timing: "D+7"
      assunto: "Última chance — [oferta] fecha [data]"
      corpo: "Escassez real + depoimento de quem comprou + CTA direto"
      regra: "NO-F021 — próximo passo sempre presente"
```
