# Extraction Completeness Checklist

Verificacao de completude da extracao de regras de um arquivo.

## Cobertura Estrutural

- [ ] Todas as funcoes/procedures/paragrafos do arquivo foram analisados
- [ ] Todos os blocos condicionais (IF/SWITCH/EVALUATE) foram mapeados
- [ ] Todos os blocos de calculo foram identificados
- [ ] Todas as validacoes de entrada foram documentadas
- [ ] Todas as transicoes de estado foram mapeadas
- [ ] Imports/includes/copys foram verificados para regras externas

## Qualidade da Extracao

- [ ] Cada regra tem rule_id unico
- [ ] Cada regra tem referencia ao codigo-fonte (arquivo + linhas)
- [ ] Cada regra tem descricao em linguagem de negocio
- [ ] Cada regra tem nivel de confianca atribuido (alta/media/baixa)
- [ ] Cada regra tem severidade atribuida (critica/importante/informativa)
- [ ] Nenhuma regra foi inventada (todas tem evidencia no codigo)

## Logica de Negocio

- [ ] Formulas de calculo estao documentadas com todas as variaveis
- [ ] Regras de arredondamento foram capturadas
- [ ] Valores magicos (hardcoded) foram flagados e documentados
- [ ] Excecoes e casos especiais foram documentados
- [ ] Codigos de erro e mensagens foram capturados
- [ ] Regras de validacao incluem condicao valida E acao de rejeicao

## Dependencias

- [ ] Dependencias entre regras foram mapeadas
- [ ] Chamadas externas (CALL, stored proc, API) foram documentadas
- [ ] Fontes de dados (tabelas, arquivos) foram identificadas
- [ ] Regras orfas (sem dependencia) foram verificadas se sao realmente independentes

## Regras Implicitas

- [ ] Numeros magicos foram investigados (o que significa 42?)
- [ ] Datas hardcoded foram investigadas (prazo fiscal? vigencia?)
- [ ] Codigo comentado foi verificado (regra desativada?)
- [ ] Convencoes de nomenclatura foram usadas como pistas
- [ ] TODOs/FIXMEs foram verificados para regras pendentes
