# Template: Kit de Monetização (High Ticket — R$997 a R$2.500)

## Metadados do Produto

```yaml
tipo: kit_monetizacao
ticket: high
faixa_preco: "R$997 – R$2.500"
formato: "Bundle de produtos com página de vendas dedicada"
regras_ativas:
  - NO-F012  # high ticket posicionado cedo no funil
  - NO-F021  # próximo passo definido após o kit
escassez: "REAL — nunca criar urgência falsa"
```

---

## 1. Bundle — Quais Produtos Incluir

```yaml
bundle:
  principio: >
    O kit deve combinar produtos complementares que, juntos, entregam
    um resultado maior do que cada um separadamente. Coerência temática
    é obrigatória. Não é só empilhar produtos aleatórios.
  estrutura_recomendada:
    produto_ancora:
      descricao: "O produto principal — razão de comprar o kit"
      exemplos:
        - "Curso principal (R$297)"
        - "Workshop gravado (R$197-297)"
        - "Ebook premium (R$47-97)"
    produto_acelerador_1:
      descricao: "Ferramenta prática que acelera o resultado do produto âncora"
      exemplos:
        - "Planilha / Template / Swipe File"
        - "App de IA (R$50-60)"
        - "Checklist avançado"
    produto_acelerador_2:
      descricao: "Conteúdo complementar que resolve a segunda maior dor"
      exemplos:
        - "Ebook adicional (R$9-14)"
        - "Aula gravada (R$47-97)"
        - "Mini-curso de suporte"
    bonus_exclusivo:
      descricao: "Algo criado especificamente para o kit — não disponível avulso"
      exemplos:
        - "Sessão ao vivo de Q&A com o mentor"
        - "Diagnóstico por email"
        - "Acesso antecipado ao próximo produto"
  exemplos_de_kits_coerentes:
    - nome: "Kit Copy e Vendas"
      inclui:
        - "Curso: Copy para Lançamentos (R$297)"
        - "Swipe File de Emails que Vendem (R$47)"
        - "App de IA para Copy (R$50)"
        - "Bônus: Aula ao vivo de revisão de copy"
    - nome: "Kit Criação de Produtos Digitais"
      inclui:
        - "Workshop: Seu Primeiro Produto Digital (R$297)"
        - "Ebook: Precificação de Infoprodutos (R$14)"
        - "Planilha de Criação de Produto (exclusivo)"
        - "Bônus: Comunidade de 30 dias"
```

---

## 2. Ancoragem de Valor

```yaml
ancoragem:
  principio: >
    A soma dos valores individuais deve ser significativamente maior
    que o preço do kit. Quanto maior o spread, maior a percepção de valor.
  formula:
    valor_individual_total: "Soma de todos os produtos separados"
    preco_do_kit: "Desconto real de 40-60% sobre o total individual"
    spread_minimo: "R$500 de diferença entre total avulso e kit"
  exemplos_de_ancoragem:
    - valor_separado: "R$297 + R$197 + R$97 + R$47 = R$638"
      preco_kit: "R$997"
      nota: "Kit oferece MAIS do que esses 4 — mais valor por preço maior"
    - valor_separado: "R$297 + R$297 + R$197 + R$47 = R$838"
      preco_kit: "R$497"
      nota: "Kit oferece R$341 de desconto — 40% off"
  como_apresentar_ancoragem:
    pagina_de_vendas:
      - "Listar cada produto com preço individual riscado"
      - "Mostrar soma total em destaque"
      - "Apresentar preço do kit em contraste"
      - "Calcular economia em reais: 'Você economiza R$X'"
    copy_de_ancoragem: >
      "Tudo isso juntos vale R$[TOTAL]. No kit, você paga apenas R$[KIT].
      Isso é [ECONOMIA] de desconto — por [prazo/condição]."
```

---

## 3. Página de Vendas

```yaml
pagina_de_vendas:
  secoes_obrigatorias:
    headline:
      formula: "[Resultado Transformador] com o [Nome do Kit] — Por R$[PRECO]"
      sub_headline: "Tudo que você precisa para [resultado] em um único lugar"
    problema:
      objetivo: "Nomear a dor que o kit resolve com precisão"
      formato: "2-3 parágrafos ou bullets de 'você já sentiu isso?'"
    o_que_inclui:
      formato: "Lista visual de cada produto com valor individual e descrição"
      destaque: "Bônus exclusivo marcado visualmente como BÔNUS"
    prova_social:
      minimo: "3 depoimentos com resultado específico"
      formatos: "Texto + foto / Print de WhatsApp / Vídeo curto"
      foco: "Resultados mensuráveis, não apenas elogios"
    ancoragem_de_preco:
      posicao: "Após apresentar os produtos e antes do CTA principal"
      elementos:
        - "Tabela: produto | valor individual"
        - "Total em negrito"
        - "Preço do kit em destaque"
        - "Economia calculada"
    escassez_real:
      tipos_validos:
        - "Vagas limitadas (quando é real)"
        - "Prazo real de oferta (data específica)"
        - "Bônus disponível apenas por [período]"
      proibido: "Criar urgência falsa — contador que zera e reseta"
    cta_principal:
      copy: "Quero o [Nome do Kit] por R$[PRECO]"
      posicao: "Após ancoragem + após prova social"
      repeticao: "3x na página (topo, meio, fim)"
    garantia:
      tipo: "7 dias satisfação ou dinheiro de volta"
      copy: "Sem perguntas, sem burocracia"
    faq:
      perguntas_minimas:
        - "Para quem é este kit?"
        - "Por quanto tempo tenho acesso?"
        - "Posso comprar separado?"
        - "Como funciona a garantia?"
```

---

## 4. Sequência de Lançamento (7 Dias)

```yaml
sequencia_lancamento:
  pre_lancamento:
    dia_menos_3:
      canal: "Email + Stories"
      conteudo: "Teaser: 'Algo grande vem aí para quem quer [resultado]'"
    dia_menos_1:
      canal: "Email + Stories"
      conteudo: "Contagem regressiva: 'Amanhã abre — e só fica aberto por [X] dias'"

  lancamento:
    dia_1:
      canal: "Email + Stories + Feed"
      assunto_email: "Abriu — [Nome do Kit] por R$[PRECO]"
      conteudo: "Apresentação completa + link da página de vendas"
    dia_2:
      canal: "Email"
      assunto: "Você viu o que está dentro do [Kit]?"
      conteudo: "Detalhar cada produto com resultado esperado"
    dia_3:
      canal: "Email + Stories"
      assunto: "Depoimento: como [aluno] usou [Produto Âncora] para [resultado]"
      conteudo: "Prova social + reforço da oferta"
    dia_4:
      canal: "Email"
      assunto: "Dúvidas sobre o [Kit] — respondendo as mais frequentes"
      conteudo: "FAQ + objeções mais comuns respondidas"
    dia_5:
      canal: "Email + Stories"
      assunto: "Faltam 2 dias — [escassez real]"
      conteudo: "Urgência real + depoimento adicional"
    dia_6:
      canal: "Email + Stories"
      assunto: "Último dia amanhã — [condição de escassez]"
      conteudo: "Penúltimo lembrete + prova final"
    dia_7:
      canal: "Email (2x) + Stories"
      assunto_manha: "Último dia — [Kit] fecha hoje"
      assunto_noite: "Fecha em [X horas] — link de acesso"
      conteudo: "Urgência máxima + CTA direto"
```

---

## 5. Empilhamento com Outros Produtos

```yaml
empilhamento:
  principio: >
    O kit não vive isolado. Ele deve estar conectado ao mix completo
    de produtos — alimentado por produtos low ticket e alimentando
    produtos high ticket (mentoria, Sala Mente Mestre).
  funil_de_empilhamento:
    entrada:
      produto: "Ebook / Aula ao vivo / Livro Amazon (R$9-44)"
      funcao: "Atrair lead qualificado e iniciar relação"
    meio:
      produto: "Desafio / Workshop / Curso (R$97-297)"
      funcao: "Entregar resultado parcial e qualificar para o kit"
    kit:
      produto: "Kit Monetização (R$997-2.500)"
      funcao: "Produto de aceleração — resultado completo de uma vez"
    topo:
      produto: "Mentoria / Imersão / Sala Mente Mestre (R$2.500-40.000)"
      funcao: "Para quem quer o máximo de acompanhamento e resultado"
  cross_sell:
    quem_comprou_kit_pode_comprar:
      - "Mentoria individual (upsell — NO-F021)"
      - "Próximo kit com tema complementar"
    quem_nao_comprou_kit_recebe:
      - "Sequência de follow-up (NO-F022 — 98% rule)"
      - "Oferta de produto mid ticket como alternativa"
```
