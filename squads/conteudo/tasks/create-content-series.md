# Criar Serie de Conteudo

name: create-content-series
description: Criar serie de conteudo multiplataforma — pecas conectadas que constroem narrativa progressiva em diferentes formatos (feed, stories, reels)
elicit: true

## INPUTS

- **Tema central:** assunto da serie (obrigatorio)
- **Avatar:** publico-alvo (obrigatorio)
- **Objetivo:** atracao, consciencia, aquecimento ou venda (obrigatorio)
- **Duracao:** quantos dias/semana (obrigatorio)
- **Formatos:** feed, stories, reels ou combinacao (default: todos)
- **Crenca a quebrar:** qual paradigma atacar na serie (opcional)
- **Oferta final:** se a serie leva a uma venda (opcional)

## STEPS

1. Coletar tema, avatar, objetivo e duracao
2. Definir arco narrativo da serie (inicio → meio → clímax → resolucao)
3. Distribuir conteudo por formato e dia:
   - Feed: pecas de profundidade (carrosseis, posts tipo)
   - Stories: bastidores, enquetes, interacao
   - Reels: hooks visuais, demonstracoes
4. Criar cada peca seguindo frameworks do sistema (tipos de post, hooks-bank, frameworks-copy)
5. Garantir conexao entre pecas (cross-reference, continuidade narrativa)
6. Validar cada peca pelo oraculo
7. Montar calendario editorial completo
8. Entregar serie formatada com cronograma

## VETO CONDITIONS

- Se nao tem as 4 informacoes obrigatorias → NAO executar, perguntar
- Se pecas nao tem conexao narrativa entre si → Reestruturar
- Se todos os formatos sao iguais → Diversificar
- Se serie nao tem progressao emocional → Adicionar arco
- Se tom nao e imperial → Reescrever
- Se calendario nao e praticavel (muito conteudo por dia) → Redistribuir

## OUTPUT EXAMPLE

```
SERIE: [Nome da Serie] — [Duracao]
TEMA: [tema central]
OBJETIVO: [objetivo]
ARCO: [descricao do arco narrativo]

DIA 1:
- Feed: [Carrossel tipo Imperial — "Hook do post"]
- Stories: [2 stories de bastidor + enquete]

DIA 2:
- Reels: [Roteiro 30s — hook + conteudo + CTA]
- Stories: [3 stories conectando ao reels]

DIA 3:
- Feed: [Post tipo Crenca — "Hook do post"]
- Stories: [Prints de comentarios + interacao]

[...]

DIA [N]:
- Feed: [Post tipo Oferta — CTA final]
- Stories: [Sequencia E4 de venda]
- Reels: [Video de prova/resultado]

CALENDARIO RESUMIDO:
| Dia | Feed | Stories | Reels |
|-----|------|---------|-------|
| 1   | X    | X       |       |
| 2   |      | X       | X     |
| ... |      |         |       |
```

## COMPLETION CRITERIA

- Serie completa com todas as pecas definidas
- Arco narrativo claro com progressao
- Mix de formatos (feed + stories + reels)
- Calendario editorial praticavel
- Conexao narrativa entre pecas
- Tom imperial consistente
- Score oraculo >= 80% em cada peca
- Cross-references entre pecas (stories mencionam post, reels complementam carrossel)

references:
  - data/tipos-de-post.md
  - data/frameworks-copy.md
  - data/hooks-bank.md
  - data/posts-intencionais.md
