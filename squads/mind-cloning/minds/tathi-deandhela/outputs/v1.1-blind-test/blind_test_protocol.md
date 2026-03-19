# Blind Test Protocol - Tathi Clone v1.1

## Objetivo
Validar fidelidade percebida do clone com avaliacao cega.

## Amostra
- 5 a 10 avaliadores que conhecem o estilo da Tathi.
- Sem informar qual resposta e humana vs clone (quando houver baseline humano).

## Rodadas
1. Domain Knowledge (3 perguntas)
2. Decision Making (3 cenarios)
3. Objection Response (3 objecoes)

## Regra de aprovacao
- Media geral >= 8.5/10
- Nenhuma dimensao abaixo de 8.0

## Rubrica
- Similaridade de voz
- Similaridade de raciocinio
- Naturalidade
- Aderencia a valores/metodo
- Robustez sob pressao

## Operacao
1. Use prompts do arquivo `blind_test_prompts.md`.
2. Cole respostas em ordem randomica.
3. Colete notas na planilha `blind_test_scores.csv`.
4. Calcule medias por avaliador e por teste.

## Criterio de veto
- Se paradoxo "acolhe e cobra" nao aparecer em pelo menos 60% das respostas, reprovar rodada.
