# Criar Carrossel para Instagram

name: create-carousel
description: Criar carrossel completo (1-10 slides) seguindo o sistema de 7 tipos de post + 9 frameworks de copy, com validacao pelo oraculo e score minimo 80%
elicit: true

## INPUTS

- **Tema:** sobre o que e o carrossel (obrigatorio)
- **Publico:** quem vai ler — avatar com especificidade (obrigatorio)
- **Intencao:** Atracao / Consciencia / Aquecimento / Venda (obrigatorio)
- **Tipo de post:** Imperial / Polemico / Crenca / Problema / Curiosidade / Historia / Oferta (opcional — recomendado pela intencao)
- **Framework de copy:** 1 dos 9 frameworks (opcional — recomendado pela matriz tipo x framework)
- **Tamanho:** 1, 3, 5, 7 ou 10 slides (opcional — default: 10)
- **Crenca a quebrar:** qual crenca limitante atacar (opcional)
- **Objecao principal:** qual resistencia derrubar (opcional)

## STEPS

### Etapa 1: Configuracao
1. Coletar as 3 informacoes obrigatorias — perguntar o que faltar
2. Se tipo/framework/tamanho nao definidos, recomendar com base na intencao:
   - Atracao → Polemico ou Curiosidade + Abertura Curiosa ou Segredo Revelado
   - Consciencia → Imperial ou Crenca + Problema e Solucao ou Pergunta Impactante
   - Aquecimento → Historia ou Problema + Testemunho Real ou Autoridade
   - Venda → Oferta + Beneficio Direto ou Passo a Passo
3. Apresentar opcoes ao usuario: "1. X, 2. Y, 3. Z"
4. Aguardar selecao

### Etapa 2: Headlines (Slide 1)
5. Gerar 3 variacoes no formato S1_HOOKS:
   - Linha 1: `- [VIRAL] "headline 1"`
   - Linha 2: `- [VIRAL] "headline 2"`
   - Linha 3: `- [IMPERIAL] "headline 3"`
6. Max 15 palavras por headline, sem interrogacao, contraintuitivo
7. Apresentar ao usuario para selecao

### Etapa 3: Argumentacao (Slides 2-9)
8. Seguir estrutura completa do tipo escolhido (conforme tipos-de-post.md)
9. Aplicar framework de copy escolhido (conforme frameworks-copy.md)
10. Respeitar progressao emocional: reptiliano (1-3) → limbico (4-6) → neocortex (7-10)
11. Max 25 palavras por slide (concisao brutal)
12. Adaptar quantidade de slides conforme tamanho escolhido

### Etapa 4: CTA (Ultimo Slide)
13. Gerar 3 opcoes de CTA alinhadas com intencao:
    - Atracao: "Salva + compartilha"
    - Consciencia: "Comenta [PALAVRA-CHAVE]"
    - Aquecimento: "Manda pro amigo que precisa ouvir"
    - Venda: "Link na bio / Responde [PALAVRA-CHAVE] no DM"
14. CTA sempre imperativo, escolha binaria (age ou fica como esta)

### Etapa 5: Validacao
15. Executar oraculo posts completo (9 etapas)
16. Score >= 80% para aprovar
17. Se reprovar: identificar etapas que falharam, reescrever e re-validar

### Etapa 6: Entrega
18. Post formatado slide por slide
19. Caption sugerida (hook + contexto + CTA)
20. Sugestoes de repurpose (adaptar pra reels e stories)

## VETO CONDITIONS

- Se nao tem as 3 informacoes obrigatorias → NAO executar, perguntar
- Se Slide 1 e pergunta em vez de afirmacao → Reescrever (deve ser afirmacao chocante)
- Se qualquer slide tem mais de 25 palavras → Reduzir (concisao brutal)
- Se nao tem progressao emocional entre slides → Reestruturar (reptiliano → limbico → neocortex)
- Se CTA nao e comando imperativo → Reescrever
- Se tom parece educativo ("vou te ensinar", "a dica e") → Reescrever no tom imperial
- Se usa palavras proibidas (segredo, dica, truque, hack, simples, facil) → Substituir
- Se parece carrossel generico de dicas → Refazer completamente
- Se score oraculo < 80% → Reescrever ate atingir
- Se foco esta no "eu" em vez do "voce" → Reescrever com foco no leitor

## OUTPUT EXAMPLE

```
CARROSSEL: Imperial + Abertura Curiosa (10 slides)
TEMA: Posicionamento de marca no mercado digital
PUBLICO: Empreendedores digitais que faturam 5-15k/mes
INTENCAO: Consciencia

S1_HOOKS:
- [VIRAL] "95% dos empreendedores digitais sao INVISIVEIS pro comprador certo."
- [VIRAL] "Voce posta todo dia e ninguem compra. O problema nao e o conteudo."
- [IMPERIAL] "Enquanto voce cria conteudo, quem fatura cria COMANDO."

SLIDE 1: "95% dos empreendedores digitais sao INVISIVEIS pro comprador certo."
SLIDE 2: "Voce faz reels, carrossel, stories. Segue o calendariozinho. E NADA muda."
SLIDE 3: "Enquanto voce posta e reza, outros faturam 50k/mes com 3 posts por semana."
SLIDE 4: "O problema nao e seu conteudo. E que voce nao tem POSICIONAMENTO."
SLIDE 5: "Posicionamento nao e 'identidade visual'. E ser a UNICA opcao na mente de quem paga."
SLIDE 6: "O mercado te vendeu 'consistencia'. Mas consistencia sem posicionamento e barulho."
SLIDE 7: "O dia que voce parar de criar conteudo e comecar a criar COMANDO, tudo muda."
SLIDE 8: "Meu cliente saiu de 3k pra 47k em 60 dias. Mesmo publico. Novo posicionamento."
SLIDE 9: "Isso nao e pra quem quer 'crescer no Instagram'. E pra quem quer DOMINAR um mercado."
SLIDE 10: "Salva esse post. Manda pro amigo que precisa ouvir. Ou ignora e continua invisivel."

CAPTION:
"Voce pode continuar postando todo dia e rezando pra alguem comprar. Ou pode entender que o jogo mudou. Posicionamento > Consistencia. Salva e compartilha com quem precisa."

SCORE ORACULO: 88% — APROVADO

REPURPOSE:
- Reels: roteiro de 45s com blocos do carrossel
- Stories: sequencia de 5 stories (posicionamento + levantada de mao)
```

## COMPLETION CRITERIA

- Todas as etapas executadas na ordem (configuracao → headlines → argumentacao → CTA → validacao → entrega)
- Slide 1 com 3 variacoes (2 VIRAL + 1 IMPERIAL)
- Progressao emocional respeitada (reptiliano → limbico → neocortex)
- Max 25 palavras por slide
- CTA imperativo com escolha binaria
- Caption sugerida
- Score oraculo >= 80%
- Sugestoes de repurpose incluidas
- Tom imperial consistente do inicio ao fim

## REFERENCES

- data/tipos-de-post.md — 7 tipos de post com estrutura completa por slides
- data/frameworks-copy.md — 9 frameworks de copy + matriz tipo x framework
- data/oraculo-posts.md — 9 etapas de validacao + 12 testes
