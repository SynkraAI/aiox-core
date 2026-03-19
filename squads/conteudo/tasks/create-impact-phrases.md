# Criar Frases de Impacto

name: create-impact-phrases
agent: carousel-creator
description: Gerar frases de impacto para quote cards (feed) e stories a partir de atomos extraidos de conteudo pilar. Executado pelo carousel-creator porque frases de impacto sao conteudo de feed (mesmo territorio que carrosseis).
elicit: true

## INPUTS

- **Atomos tipo quote:** lista de quotes de impacto extraidas do conteudo pilar (obrigatorio)
- **Tema central:** assunto do conteudo pilar (obrigatorio)
- **Publico:** avatar especifico (obrigatorio)
- **Quantidade:** numero de frases a gerar (opcional — default: todas as quotes extraidas)
- **Tom:** imperial (default) ou personalizado

## STEPS

### Etapa 1: Selecao de Quotes

1. Receber lista de atomos classificados como "quote de impacto"
2. Avaliar cada quote por potencial de impacto:
   - E contraintuitiva? (surpreende a audiencia)
   - E memoravel? (fica na cabeca)
   - E compartilhavel? (pessoa quer mandar pra alguem)
   - E autoral? (so VOCE diria isso desse jeito)
3. Ranquear por potencial (alta, media, baixa)
4. Apresentar lista ranqueada ao usuario: "1. Confirmar, 2. Ajustar, 3. Adicionar quotes proprias"

### Etapa 2: Refinamento das Frases

5. Para cada quote selecionada:
   - Refinar para maxima concisao (quanto menor, mais forte)
   - Garantir que funciona ISOLADA (sem contexto do pilar)
   - Manter vocabulario e tom do autor original
   - Eliminar palavras desnecessarias — cada palavra deve PESAR
6. Maximo 2 linhas por frase (ideal: 1 linha)
7. Se a quote original e longa, extrair o nucleo e descartar o resto

### Etapa 3: Formato Feed (Quote Card)

8. Para cada frase, gerar especificacao de quote card:
   - **Frase principal:** a frase de impacto (1-2 linhas)
   - **Contexto curto:** 1 frase que situa a frase (opcional, para caption)
   - **Estilo visual sugerido:** fundo escuro / claro / texturizado
   - **Fonte sugerida:** bold, serif, handwriting
   - **CTA da caption:** o que postar na legenda do feed
9. Caption do feed deve ter:
   - A frase como destaque
   - 2-3 linhas de contexto ou provocacao
   - CTA de engajamento (salvar, compartilhar, comentar)

### Etapa 4: Formato Stories

10. Para cada frase, gerar versao Stories:
    - Frase adaptada para tela vertical (pode quebrar em 2 stories se necessario)
    - Sugestao de fundo (cor solida, foto com overlay, video com texto)
    - Sticker sugerido (enquete, pergunta, slider)
    - CTA do stories (responder, reagir, compartilhar)

### Etapa 5: Entrega

11. Entregar pacote completo:
    - Lista de frases ranqueadas por potencial
    - Versao feed (quote card) com especificacoes visuais
    - Versao stories com sugestoes de sticker
    - Caption pronta para cada quote card
12. Apresentar ao usuario para aprovacao

## VETO CONDITIONS

- Se frase tem mais de 2 linhas → Condensar ou dividir
- Se frase nao funciona isolada (precisa de contexto) → Reescrever para independencia
- Se frase e generica (qualquer pessoa diria) → Adicionar angulo autoral ou descartar
- Se frase usa palavras proibidas (segredo, dica, truque, hack, simples, facil) → Substituir
- Se tom nao e imperial → Reescrever no tom correto
- Se caption do feed e maior que 5 linhas → Condensar
- Se menos de 3 frases de impacto foram extraidas → Avisar que o pilar teve poucas quotes

## OUTPUT EXAMPLE

```
FRASES DE IMPACTO — Conteudo Pilar: Posicionamento de Marca
Total: 5 frases | Potencial alto: 3 | Medio: 2

---

FRASE #1 [POTENCIAL ALTO]
"Consistencia sem posicionamento e trabalho escravo digital."

FEED (Quote Card):
- Visual: Fundo preto, fonte branca bold serif
- Caption: "Voce posta todo dia. Todo santo dia. E ninguem compra.
  O problema nao e frequencia. E direcao.
  Salva esse post e manda pra quem precisa ouvir."
- CTA: Salvar + compartilhar

STORIES:
- Fundo: Preto solido
- Texto: Frase centralizada, fonte grande
- Sticker: Enquete "Concorda? Sim / Doi mas sim"
- Sequencia: 1 story unico

---

FRASE #2 [POTENCIAL ALTO]
"Voce nao perde cliente por cobrar caro. Perde por cobrar barato."

FEED (Quote Card):
- Visual: Fundo escuro texturizado, fonte branca handwriting
- Caption: "O medo de cobrar caro e uma estrategia de sobrevivencia.
  Preco baixo atrai quem compara. Preco alto atrai quem valoriza.
  Comenta VALOR se voce ta pronto pra parar de competir por preco."
- CTA: Comentar + salvar

STORIES:
- Fundo: Gradiente escuro
- Texto: Frase em 2 linhas, fonte bold
- Sticker: Slider "Quanto voce cobra?" (pouco → o justo)
- Sequencia: 1 story unico

---

FRASE #3 [POTENCIAL ALTO]
"95% dos empreendedores sao invisiveis pro comprador certo."

[...]

RESUMO:
- 3 frases de potencial alto → publicar primeiro
- 2 frases de potencial medio → usar como complemento
- Sugestao: publicar 1 frase a cada 3-4 dias (nao saturar feed com quotes)
```

## COMPLETION CRITERIA

- Todas as quotes recebidas foram avaliadas e ranqueadas
- Cada frase tem versao feed (quote card) com especificacoes visuais
- Cada frase tem versao stories com sugestoes de sticker
- Captions prontas para cada quote card
- Frases funcionam isoladamente (sem depender do pilar)
- Tom imperial mantido em todas as frases e captions
- Nenhuma palavra proibida usada
- Usuario aprovou as frases finais

## REFERENCES

- data/swipe-posts.md — templates de titulo e frases
- data/hooks-bank.md — referencia de frases de impacto
- data/cta-bank.md — CTAs por tipo de acao
- data/regras-inviolaveis.md — regras de tom e linguagem
- data/cliches-proibidos.md — palavras e expressoes proibidas
- data/posts-intencionais.md — principios de posts intencionais
