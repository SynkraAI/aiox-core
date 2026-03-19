# Criar StoryAds

name: create-storyadd
description: Criar StoryAds de manipulacao subliminar — stories que parecem casuais mas sao projetados para gerar tensao e desejo
elicit: true

## INPUTS

- **Nicho:** area de atuacao do usuario (obrigatorio)
- **Resultado principal:** o que o usuario entrega aos clientes (obrigatorio)
- **Contexto visual preferido:** cafe, parque, setup, carro, paisagem (opcional)
- **Quantidade:** quantos StoryAds gerar (default: 5)
- **Tom especifico:** se quer mais provocativo, aspiracional ou de prova (opcional)

## STEPS

1. Coletar nicho e resultado principal
2. Identificar templates por nicho em data/storyadds.md
3. Adaptar templates universais para o nicho do usuario
4. Construir cada StoryAd com estrutura de 3 linhas:
   - Linha 1: ANTES (dor/situacao passada)
   - Linha 2: DEPOIS (resultado atual)
   - Linha 3: INSINUACAO (sem explicar como)
5. Sugerir imagem "acidental" para cada StoryAd
6. Validar: concisao (max 3 linhas), naturalidade, tom
7. Entregar batch completo com notas de execucao

## VETO CONDITIONS

- Se StoryAd parece intencional/vendedor → Reescrever mais casual
- Se tem mais de 3 linhas de texto → Reduzir
- Se explica o metodo em vez de insinuar → Reescrever
- Se vende diretamente → Reescrever (StoryAd gera desejo, nao vende)
- Se imagem sugerida nao parece espontanea → Trocar
- Se dois StoryAds tem mesmo contexto visual → Variar

## OUTPUT EXAMPLE

```
STORYAD 1:
[Imagem: foto casual com cafe]
"3 anos atras eu nao conseguia vender nem uma sessao.
Hoje acordo com notificacoes de pagamento.
Nao foi sorte. Foi uma decisao."

STORYAD 2:
[Imagem: print de PIX - parcial]
"Meu aluno vendeu 12k na primeira semana.
E nem precisou de live.
Metodo > esforco."

STORYAD 3:
[Imagem: vista de parque/paisagem]
"Enquanto voce 'se prepara',
alguem com metade do seu talento esta fechando.
Pensa nisso."

NOTAS DE EXECUCAO:
- Postar 1-2 por dia
- Salvar em destaques
- Horario: 10h-12h ou 18h-20h
- Variar imagens (nunca repetir contexto)
- Nunca parecer intencional
```

## COMPLETION CRITERIA

- Quantidade solicitada de StoryAds entregue (default: 5)
- Cada StoryAd com exatamente 3 linhas (antes/depois/insinuacao)
- Sugestao de imagem "acidental" para cada um
- Tom casual e nao-vendedor
- Variedade de contextos visuais
- Notas de execucao incluidas (frequencia, horario, destaques)
- Adaptado ao nicho especifico do usuario

references:
  - data/storyadds.md
  - data/stories-categorias.md
  - data/regras-inviolaveis.md
