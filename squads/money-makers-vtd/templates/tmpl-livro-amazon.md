# Template: Livro Amazon (Low Ticket — R$24 a R$44)

## Metadados do Produto

```yaml
tipo: livro_amazon
ticket: low
faixa_preco: "R$24 – R$44 (físico) / R$9 – R$14 (Kindle)"
regras_ativas:
  - NO-F050  # modelo de negócio pós-livro: livro→email→aula→venda
case_referencia: "Nésio — bestseller em categoria nicho com poucas vendas"
```

---

## 1. Categoria Nicho (Estratégia Bestseller)

```yaml
categoria_nicho:
  principio: >
    O livro não precisa vender muito para ser bestseller.
    A estratégia é escolher categoria com baixa competição de vendas,
    onde poucos livros vencem o ranking. Case: Nésio (NO-F050 implícito).
  como_encontrar_categoria:
    - passo_1: "Acesse Amazon KDP → pesquise por nichos do seu tema"
    - passo_2: >
        Filtre por subcategorias de 3 a 4 níveis de profundidade
        (ex: Negócios > Marketing > Mídias Sociais > Instagram para Pequenas Empresas)
    - passo_3: "Veja o ranking BSR (Best Seller Rank) do #1 da categoria"
    - passo_4: >
        Se o #1 tem BSR > 50.000, a categoria tem baixa competição
        (menos de 1-2 vendas/dia sustenta o topo)
    - passo_5: "Posicione o livro nessa categoria durante o lançamento"
  meta: "Selo 'Bestseller da Amazon' na capa para usar em marketing"
  categorias_exemplo:
    - "Marketing > Estratégia de Conteúdo > Nichos Específicos"
    - "Empreendedorismo > Solopreneurs"
    - "Desenvolvimento Pessoal > Produtividade > Sistemas"
```

---

## 2. Manuscrito (12 Capítulos)

```yaml
manuscrito:
  total_capitulos: 12
  total_palavras_estimado: "25.000 a 45.000"
  estrutura:
    - numero: 1
      nome: "Introdução — A Promessa e o Autor"
      objetivo: "Estabelecer credibilidade e criar conexão emocional"
      palavras: "1.500 – 2.000"
    - numero: 2
      nome: "O Problema que Este Livro Resolve"
      objetivo: "Nomear a dor com precisão"
      palavras: "2.000 – 3.000"
    - numero: 3
      nome: "Por Que as Soluções Comuns Falham"
      objetivo: "Quebrar crença limitante e abrir espaço para o método"
      palavras: "2.000 – 3.000"
    - numero: 4
      nome: "O Princípio Central — [Nome do Método]"
      objetivo: "Apresentar o framework do livro"
      palavras: "2.500 – 3.500"
    - numero: 5
      nome: "Capítulo de Implementação 1 — [Passo]"
      objetivo: "Primeiro passo prático com exemplo"
      palavras: "2.500 – 3.500"
    - numero: 6
      nome: "Capítulo de Implementação 2 — [Passo]"
      objetivo: "Segundo passo com case real"
      palavras: "2.500 – 3.500"
    - numero: 7
      nome: "Capítulo de Implementação 3 — [Passo]"
      objetivo: "Terceiro passo com exercício"
      palavras: "2.500 – 3.500"
    - numero: 8
      nome: "Erros Mais Comuns e Como Evitá-los"
      objetivo: "Validação e antecipação de objeções"
      palavras: "2.000 – 3.000"
    - numero: 9
      nome: "Casos Reais — Resultados de Quem Aplicou"
      objetivo: "Prova social e inspiração"
      palavras: "2.000 – 3.000"
    - numero: 10
      nome: "Aceleração — Como Ir Mais Rápido"
      objetivo: "Stack de ferramentas e atalhos"
      palavras: "2.000 – 3.000"
    - numero: 11
      nome: "O Próximo Nível — Além do Livro"
      objetivo: "Bridge para o funil digital (NO-F050)"
      palavras: "1.500 – 2.000"
    - numero: 12
      nome: "Conclusão e Próximo Passo"
      objetivo: "CTA para email / aula / produto"
      palavras: "1.000 – 1.500"
  ferramentas_de_escrita:
    - Notion
    - Google Docs
    - Scrivener
  formatacao_kdp:
    tamanho_pagina: "6x9 polegadas (padrão)"
    fonte: "Times New Roman ou Garamond — 11-12pt"
    margens: "Conforme guia KDP"
    ferramenta: "Reedsy ou Microsoft Word com template KDP"
```

---

## 3. Modelo de Negócio Pós-Livro (NO-F050)

```yaml
modelo_negocio_pos_livro:
  regra: >
    O livro sozinho não é o negócio. O livro é o topo do funil.
    O modelo: livro → email → aula → venda. (NO-F050)
  funil_completo:
    etapa_1_livro:
      descricao: "Leitor compra o livro (R$24-44 físico ou R$9-14 Kindle)"
      objetivo: "Estabelecer autoridade e iniciar relacionamento"
      cta_no_livro: "Acesse material gratuito em [URL] e entre na lista"
    etapa_2_email:
      descricao: "Leitor entra na lista via bônus do livro"
      bonus_sugerido:
        - "Planilha complementar ao livro"
        - "Vídeo de implementação rápida"
        - "Checklist PDF dos passos do livro"
      objetivo: "Capturar email e iniciar sequência"
    etapa_3_aula:
      descricao: "Sequência de email convida para aula ao vivo ou gravada"
      objetivo: "Aprofundar relação, demonstrar método ao vivo"
      produto: "Aula gratuita ou low ticket (R$9-47)"
    etapa_4_venda:
      descricao: "Aula vende produto mid ou high ticket"
      objetivo: "Conversão principal do funil"
      produto: "Curso (R$297) / Desafio (R$97-197) / Mentoria (R$2.500+)"
  ltv_esperado_por_leitor: "R$297 a R$2.500+ ao longo do funil"
```

---

## 4. Funil de Email

```yaml
funil_email:
  entrada: "Bônus do livro (página CTA dentro do livro — cap 1 e cap 12)"
  sequencia:
    email_1:
      timing: "Imediato"
      assunto: "Seu [nome do bônus] chegou — e tem mais..."
      corpo: "Entrega do bônus + apresentação da próxima etapa"
    email_2:
      timing: "D+2"
      assunto: "Você chegou ao capítulo [X]?"
      corpo: "Engajamento com conteúdo do livro + dica adicional"
    email_3:
      timing: "D+5"
      assunto: "Convite: aula gratuita sobre [tema central do livro]"
      corpo: "Convite para aula com benefícios claros"
    email_4:
      timing: "D+7"
      assunto: "Aula começa [data/hora] — link de acesso"
      corpo: "Confirmação + anticipation"
    email_5:
      timing: "D+10"
      assunto: "O que aprendi depois de [resultado que o livro promete]"
      corpo: "Valor adicional + oferta do produto mid ticket"
```

---

## 5. Amazon Ads

```yaml
amazon_ads:
  objetivo: "Manter ranking e gerar vendas recorrentes de forma paga"
  tipos_de_campanha:
    - tipo: "Sponsored Products"
      uso: "Aparecer em resultados de busca por palavras-chave do nicho"
      budget_inicial: "R$10-20/dia"
    - tipo: "Product Display Ads"
      uso: "Aparecer na página de livros concorrentes"
      budget_inicial: "R$5-15/dia"
  palavras_chave_estrategia:
    - "Palavras exatas do título e subtítulo do livro"
    - "Termos de busca do problema que o livro resolve"
    - "Nomes de autores concorrentes (conquista de audiência)"
  meta_acos: "< 70% (Amazon Cost of Sale)"
  nota: >
    O objetivo dos Ads não é lucrar no livro — é gerar leads para o funil.
    ROI real é medido no LTV do leitor no funil digital.
  quando_ativar: "Na semana do lançamento e manter em patamar base"
```
