# Conflict Analysis Checklist

Verificacao de qualidade da analise de conflitos entre sistemas.

## Preparacao

- [ ] Ambos os catalogos foram carregados e validados
- [ ] Catalogos tem dominios em comum (senao, nao ha conflitos possiveis)
- [ ] Metricas basicas de ambos os sistemas foram documentadas

## Deteccao

- [ ] Todos os dominios em comum foram comparados
- [ ] Regras com entidades similares foram pareadas
- [ ] Limiar de similaridade foi aplicado consistentemente
- [ ] Falsos positivos foram filtrados (regras similares mas de escopos diferentes)

## Classificacao

- [ ] Cada conflito tem tipo atribuido (contradicao/sobreposicao/lacuna/drift/temporal)
- [ ] Cada conflito tem ambas as referencias (sistema A e B)
- [ ] Cada conflito tem score de severidade calculado
- [ ] Cada conflito tem recomendacao de resolucao

## Relatorio

- [ ] Sumario executivo com contagem de conflitos por tipo
- [ ] Conflitos ordenados por severidade (mais grave primeiro)
- [ ] Cada conflito tem evidencia de ambos os lados
- [ ] Recomendacoes sao actionable (nao genericas)
- [ ] Gap analysis identifica regras exclusivas de cada sistema
