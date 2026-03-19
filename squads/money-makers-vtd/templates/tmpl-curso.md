# Template: Curso (Mid Ticket — R$297)

## Metadados do Produto

```yaml
tipo: curso
ticket: mid
faixa_preco: "R$297"
formato: "Gravado — acesso por plataforma"
regras_ativas:
  - NO-F021  # upsell para mentoria como próximo passo
```

---

## 1. Módulos (4 a 8)

```yaml
modulos:
  instrucao: >
    Cada módulo representa uma fase da jornada do aluno.
    A sequência deve ser progressiva: sem o módulo anterior,
    o próximo não faz sentido. Mín 4, máx 8 módulos.

  estrutura_tipo:
    - numero: 1
      nome: "Diagnóstico e Fundação"
      objetivo: "Onde o aluno está, onde vai chegar, por quê o método funciona"
      aulas: 3
    - numero: 2
      nome: "Princípio Central — [Nome do Conceito]"
      objetivo: "O núcleo do método explicado com clareza"
      aulas: 4
    - numero: 3
      nome: "Implementação — Passo 1"
      objetivo: "Primeira entrega concreta e implementável"
      aulas: 4
    - numero: 4
      nome: "Implementação — Passo 2"
      objetivo: "Segunda entrega com exercícios práticos"
      aulas: 4
    - numero: 5
      nome: "Otimização e Aceleração"
      objetivo: "Como ir mais rápido, evitar erros comuns"
      aulas: 3
    - numero: 6
      nome: "Casos Reais e Aplicações Avançadas"
      objetivo: "Provas do método em contextos variados"
      aulas: 3
    - numero: 7
      nome: "Sustentação e Escalada (opcional)"
      objetivo: "Como manter o resultado e crescer"
      aulas: 3
    - numero: 8
      nome: "Próximo Nível — Mentoria e Comunidade"
      objetivo: "Upsell natural para mentoria (NO-F021)"
      aulas: 2
```

---

## 2. Aulas por Módulo (3 a 5 Gravadas)

```yaml
aulas:
  quantidade_por_modulo: "3 a 5"
  duracao_ideal_por_aula: "10 a 20 minutos"
  justificativa: >
    Aulas curtas aumentam conclusão. Meta: 80% dos alunos
    chegam ao final do curso.
  estrutura_de_cada_aula:
    - abertura_15s: "O que você vai aprender nesta aula e por quê importa"
    - conteudo_principal: "Explicação + exemplo + demonstração"
    - resumo_30s: "Os 2-3 pontos principais desta aula"
    - cta_interno: "Faça o exercício da aula antes de continuar"
  formatos_de_gravacao:
    - tela_com_naracao: "Melhor para tutoriais e passo a passo"
    - talking_head: "Melhor para conceitos e motivação"
    - hibrido: "Talking head + tela (recomendado)"
  ferramenta_de_gravacao: "Loom / OBS / Riverside"
  plataforma_hospedagem: "Hotmart / Eduzz / Teachable / Cademi"
```

---

## 3. Material de Apoio

```yaml
material_de_apoio:
  tipos:
    - tipo: "PDF Resumo"
      quando: "1 por módulo — principais conceitos e exercícios"
    - tipo: "Planilha / Modelo"
      quando: "Módulos de implementação — ferramenta prática"
    - tipo: "Checklist de Módulo"
      quando: "Final de cada módulo — validação de aprendizado"
    - tipo: "Swipe File"
      quando: "Quando o conteúdo tem elementos de copy/template"
    - tipo: "Mapa Mental"
      quando: "Módulo de conceito complexo — visualização do framework"
  principio: >
    Material de apoio existe para acelerar implementação,
    não para substituir as aulas. Seja sintético e acionável.
```

---

## 4. Exercícios

```yaml
exercicios:
  frequencia: "1 exercício por aula ou 1 exercício por módulo (mínimo)"
  formato:
    - tipo: "Exercício de aplicação imediata"
      instrucao: "Faça [ação específica] agora — antes de passar para a próxima aula"
    - tipo: "Exercício de revisão"
      instrucao: "Revise [entregável anterior] à luz do que aprendeu"
    - tipo: "Exercício de consolidação"
      instrucao: "Combine [peça 1] e [peça 2] para criar [entregável do módulo]"
  entregavel_final_do_curso: >
    Ao final do curso, o aluno deve ter produzido [X] — descrito
    especificamente na apresentação do curso e na landing page.
```

---

## 5. Certificado

```yaml
certificado:
  emissao: "Automática via plataforma ao completar 100% das aulas"
  conteudo:
    - nome_do_aluno: true
    - nome_do_curso: true
    - carga_horaria: "[X] horas"
    - data_de_conclusao: true
    - assinatura_do_mentor: true
  valor_percebido: >
    Certificado aumenta senso de conclusão e compartilhamento social.
    Incentive o aluno a postar no LinkedIn com hashtag do curso.
  plataformas_que_emitem: "Hotmart / Certifymee / Canva (manual)"
```

---

## 6. Comunidade

```yaml
comunidade:
  plataforma: "Telegram (grupo privado de alunos)"
  acesso: "Incluso no curso — acesso por [período definido]"
  dinamicas:
    - tipo: "Boas-vindas"
      descricao: "Post fixado com regras, recursos e próximos passos"
    - tipo: "Check-in semanal"
      descricao: "Pergunta provocativa para engajamento"
    - tipo: "Vitórias da semana"
      descricao: "Alunos postam resultados — mentor reage"
    - tipo: "Q&A ao vivo mensal"
      descricao: "1h de perguntas e respostas com o mentor"
  moderacao:
    frequencia_minima: "3x por semana"
    responsavel: "Mentor ou assistente treinado"
```

---

## 7. Upsell para Mentoria

```yaml
upsell_mentoria:
  regra: >
    O upsell para mentoria DEVE estar visível no curso (NO-F021).
    Não é venda invasiva — é o próximo passo natural.
  onde_aparece:
    - modulo_final: "Aula de encerramento menciona a mentoria"
    - area_de_membros: "Banner ou bloco lateral com link da mentoria"
    - email_de_conclusao: "Email enviado ao terminar o curso"
  produto_destino: "Mentoria Individual — R$2.500 a R$5.000"
  copy_de_upsell:
    headline: "Você terminou o curso. Quer ir mais rápido?"
    corpo: >
      A mentoria individual é para quem quer resultado em [prazo]
      com acompanhamento direto. [N] vagas disponíveis agora.
    cta: "Saiba mais sobre a mentoria"
```

---

## 8. Sequência de Onboarding (Emails)

```yaml
onboarding:
  email_1:
    timing: "Imediato após compra"
    assunto: "Seu acesso ao [Nome do Curso] está pronto"
    corpo:
      - "Link de acesso à plataforma"
      - "Senha ou instrução de login"
      - "Dica: comece pelo Módulo 1, Aula 1 agora mesmo"
  email_2:
    timing: "D+1"
    assunto: "Uma coisa que os alunos que mais evoluem têm em comum"
    corpo:
      - "Hábito de estudo recomendado (ex: 1 aula por dia)"
      - "Como usar o material de apoio"
      - "Link do grupo da comunidade"
  email_3:
    timing: "D+3"
    assunto: "Você já chegou ao Módulo 2?"
    corpo:
      - "Check-in de progresso"
      - "Destaque de um ponto importante do Módulo 2"
      - "Encorajamento + dica prática"
  email_4:
    timing: "D+7"
    assunto: "Uma semana de [Nome do Curso] — como está indo?"
    corpo:
      - "Celebração de 1 semana"
      - "Apresentação suave da mentoria (upsell NO-F021)"
      - "Link para quem quiser ir mais fundo"
```
