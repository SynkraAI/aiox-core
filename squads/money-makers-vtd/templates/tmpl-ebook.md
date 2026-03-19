# Template: Ebook (Low Ticket — R$9 a R$14)

## Metadados do Produto

```yaml
tipo: ebook
ticket: low
faixa_preco: "R$9 – R$14"
regras_ativas:
  - NO-H001  # pesquisa IA antes de criar
  - NO-H002  # linguagem do público
  - NO-H003  # 1 produto = 1 problema
  - NO-F021  # próximo passo obrigatório no CTA
```

---

## 1. Título

```yaml
titulo:
  instrucao: >
    Gere 10 opções de título com IA antes de escolher.
    Valide qual ressoa mais com a dor específica do público (NO-H001).
  formula_sugerida: "[Número] + [Resultado Concreto] + [Prazo ou Condição]"
  exemplos:
    - "7 Passos para [Resultado] em [X Dias] Mesmo Sem [Objeção]"
    - "O Método [Nome] para [Resultado] que [Autoridade] Usa"
    - "Como [Verbo de Ação] [Resultado] Sem [Dor Principal]"
  validacao:
    - titulo_evoca_dor_especifica: true
    - titulo_promete_resultado_mensuravel: true
    - linguagem_e_do_publico_nao_jargao: true  # NO-H002
```

---

## 2. Estrutura de Capítulos (5 a 7)

```yaml
capitulos:
  instrucao: >
    Cada capítulo resolve uma micro-objeção ou entrega um passo do método.
    O ebook todo resolve APENAS 1 problema central (NO-H003).
  estrutura:
    - numero: 1
      nome: "A Dor / O Diagnóstico"
      objetivo: "Nomear o problema exato que o leitor tem"
      tamanho_paginas: "3-5"
    - numero: 2
      nome: "Por Que as Soluções Comuns Falham"
      objetivo: "Quebrar objeção e posicionar o método"
      tamanho_paginas: "3-5"
    - numero: 3
      nome: "O Princípio / A Virada"
      objetivo: "Apresentar o conceito central do método"
      tamanho_paginas: "4-6"
    - numero: 4
      nome: "Passo 1 — [Nome do Passo]"
      objetivo: "Primeira ação concreta e ensinável"
      tamanho_paginas: "4-6"
    - numero: 5
      nome: "Passo 2 — [Nome do Passo]"
      objetivo: "Segunda ação com exemplo real"
      tamanho_paginas: "4-6"
    - numero: 6
      nome: "Passo 3 — [Nome do Passo] (opcional)"
      objetivo: "Terceira ação ou aprofundamento"
      tamanho_paginas: "3-5"
    - numero: 7
      nome: "O Próximo Nível"
      objetivo: "Bridging para o próximo produto (NO-F021)"
      tamanho_paginas: "2-3"
```

---

## 3. Capa — Elementos Obrigatórios

```yaml
capa:
  elementos:
    - titulo_grande_e_legivel: true
    - subtitulo_com_promessa: true
    - nome_autor_com_credencial: true
    - imagem_ou_elemento_visual_de_resultado: true
    - cor_contrastante_com_fundo: true
  ferramentas_sugeridas:
    - Canva
    - Adobe Express
    - MidJourney (para ilustração)
  nota: >
    A capa deve comunicar o resultado prometido em menos de 3 segundos.
    Teste com alguém que não conhece o produto.
```

---

## 4. CTA Final — Próximo Passo Obrigatório (NO-F021)

```yaml
cta_final:
  regra: >
    Todo ebook DEVE terminar com um próximo passo claro.
    Nunca deixe o leitor sem direção após consumir o conteúdo.
  opcoes_de_proximo_passo:
    - tipo: "Aula Gratuita"
      copy: "Assista à aula gratuita onde mostro [resultado ao vivo]"
      link: "[URL_AULA]"
    - tipo: "Desafio"
      copy: "Entre no Desafio [Nome] e aplique em [X] dias"
      link: "[URL_DESAFIO]"
    - tipo: "Produto Mid Ticket"
      copy: "Acesse o [Nome do Curso/Workshop] por apenas R$[PRECO]"
      link: "[URL_PRODUTO]"
  formato_pagina_cta:
    - headline: "Agora Que Você Sabe [O Que Aprendeu]..."
    - corpo: "O próximo passo é [ação específica]. Clique aqui e [resultado]."
    - botao: "Sim, quero [resultado]"
```

---

## 5. Landing Page

```yaml
landing_page:
  secoes:
    headline:
      formula: "[Resultado Desejado] em [Prazo] — Mesmo Que [Objeção Principal]"
      sub_headline: "O ebook que [autoridade/prova social curta]"
    bullets_beneficios:
      instrucao: "3 a 5 bullets no formato 'Como [resultado] sem [dor]'"
      exemplos:
        - "Como [resultado 1] sem precisar de [dor/tempo/dinheiro]"
        - "O método para [resultado 2] que funciona mesmo se [objeção]"
        - "Por que [crença limitante] está te impedindo — e como virar o jogo"
    prova_social:
      minimo: "1 depoimento real ou resultado do autor"
    preco:
      exibicao: "De R$X por apenas R$9" # ou R$14
      garantia: "7 dias ou seu dinheiro de volta"
    cta_botao: "Quero o Ebook Agora por R$[PRECO]"
```

---

## 6. Sequência Email Pós-Compra (3 Emails)

```yaml
sequencia_email_pos_compra:
  email_1:
    nome: "Entrega"
    timing: "Imediato após compra"
    assunto: "Seu ebook chegou — [Título do Ebook]"
    corpo:
      - paragrafo_1: "Aqui está o link para acessar seu ebook: [LINK]"
      - paragrafo_2: "Dica rápida: comece pelo Capítulo [X], onde você vai [resultado imediato]."
      - paragrafo_3: "Qualquer dúvida, responda este email."
    cta: "Acessar meu ebook agora"

  email_2:
    nome: "Valor Adicional"
    timing: "D+2"
    assunto: "Você já leu o capítulo [X]? (tem uma sacada importante)"
    corpo:
      - paragrafo_1: "Quero chamar atenção para [ponto específico do ebook]."
      - paragrafo_2: "O erro que a maioria comete é [erro comum]. O ebook mostra como evitar."
      - paragrafo_3: "Se quiser aprofundar, tenho algo que pode te interessar."
    cta: "[Prévia do próximo produto — URL]"

  email_3:
    nome: "Próximo Produto"
    timing: "D+5"
    assunto: "Próximo passo depois do ebook (para quem quer [resultado maior])"
    corpo:
      - paragrafo_1: "Se você aplicou o que está no ebook, provavelmente está sentindo [resultado parcial]."
      - paragrafo_2: "Para ir para o próximo nível, criei [nome do produto] — [descrição em 1 linha]."
      - paragrafo_3: "Acesse por [R$PRECO] até [data/condição]."
    cta: "Quero o próximo passo"
    regra: "NO-F021 — nunca terminar sem direção"
```
