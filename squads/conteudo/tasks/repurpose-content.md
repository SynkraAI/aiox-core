# Adaptar Conteudo para Outro Formato

name: repurpose-content
description: Adaptar conteudo existente (carrossel, reels, stories) para outro formato mantendo a essencia, tom imperial e validacao pelo oraculo
elicit: true

## INPUTS

- **Conteudo original:** texto completo do post/roteiro/sequencia existente (obrigatorio)
- **Formato de origem:** Carrossel / Reels / Stories (obrigatorio)
- **Formato destino:** Carrossel / Reels / Stories (obrigatorio)
- **Intencao:** Atracao / Consciencia / Aquecimento / Venda (obrigatorio)
- **Tipo de post desejado:** Imperial / Polemico / Crenca / Problema / Curiosidade / Historia / Oferta (opcional — recomendado automaticamente)
- **Framework de copy:** 1 dos 9 frameworks (opcional — recomendado automaticamente)

## STEPS

1. Receber conteudo original e identificar formato de origem
2. Extrair nucleo do conteudo: tema central, argumento principal, emocao dominante, CTA
3. Identificar tipo de post e framework de copy usados no original
4. Selecionar tipo de post e framework adequados pro formato destino (usar matriz tipo x framework)
5. Adaptar estrutura conforme regras do formato destino:
   - **Para Carrossel:** seguir estrutura do tipo escolhido (1-10 slides), max 30 palavras/slide, 3 variacoes de headline
   - **Para Reels:** roteiro com hook (3s), desenvolvimento (15-45s), CTA (5s), sugestao de cortes
   - **Para Stories:** sequencia de 3-7 stories com categoria estrategica (conforme stories-categorias.md)
6. Manter tom imperial — nunca suavizar na adaptacao
7. Ajustar CTA para o comportamento nativo do formato destino (salvar/compartilhar no carrossel, comentar no reels, responder/reagir nos stories)
8. Validar pelo oraculo (posts para carrosseis, niveis 1-3 para reels)
9. Se score < 80% → reescrever e re-validar
10. Entregar conteudo adaptado com sugestoes de publicacao

## VETO CONDITIONS

- Se nao tem conteudo original completo → NAO executar, pedir conteudo
- Se formato de origem = formato destino → NAO executar, nao e repurpose
- Se adaptacao perde a mensagem central do original → Refazer mantendo nucleo
- Se tom muda de imperial para educativo/generico → Reescrever no tom imperial
- Se carrossel adaptado tem mais de 30 palavras por slide → Reduzir
- Se reels adaptado nao tem hook nos primeiros 3 segundos → Reescrever hook
- Se stories adaptado nao tem intencao estrategica por story → Reestruturar
- Se score oraculo < 80% → Reescrever ate atingir

## OUTPUT EXAMPLE

```
REPURPOSE: Carrossel → Reels
TEMA: Posicionamento de marca no mercado digital
TIPO ORIGINAL: Imperial (Carrossel 10 slides)
TIPO DESTINO: Imperial (Reels 45s)

ROTEIRO REELS:

HOOK (0-3s):
"A estrategia que todo mundo ensina esta DESTRUINDO seu posicionamento."

DESENVOLVIMENTO (3-40s):
[Bloco 1 - Problema] "Voce posta todo dia, segue o calendariozinho bonito..."
[Bloco 2 - Contraste] "Enquanto isso, quem fatura de verdade posta 3x por semana..."
[Bloco 3 - Novo paradigma] "Nao e sobre volume. E sobre ser a UNICA opcao..."
[Bloco 4 - Prova] "Meu cliente saiu de 3k pra 47k em 60 dias. Mesmo publico."

CTA (40-45s):
"Salva esse video. Manda pro amigo que precisa ouvir isso."

SUGESTOES:
- Gravar olhando direto pra camera, tom firme
- Corte seco entre blocos
- Texto na tela no hook
- Melhor horario: 18h-20h
```

## COMPLETION CRITERIA

- Conteudo adaptado mantendo nucleo do original (tema + argumento + emocao)
- Formato destino respeitado com suas regras especificas
- Tom imperial consistente (sem suavizar)
- CTA adequado ao formato destino
- Score oraculo >= 80%
- Sugestoes de publicacao incluidas

## REFERENCES

- data/tipos-de-post.md — estruturas dos 7 tipos
- data/frameworks-copy.md — 9 frameworks e matriz tipo x framework
- data/oraculo-posts.md — validacao de carrosseis
- data/stories-categorias.md — categorias de stories
