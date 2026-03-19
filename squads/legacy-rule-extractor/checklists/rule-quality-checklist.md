# Rule Quality Checklist

Verificacao de qualidade de uma regra individual extraida.

## Campos Obrigatorios

- [ ] rule_id segue formato {DOMAIN}-{MODULE}-{SEQ}
- [ ] title e claro e descritivo (max 100 caracteres)
- [ ] domain esta entre os dominios validos da taxonomia
- [ ] module identifica o sub-dominio corretamente
- [ ] severity esta atribuida (critica/importante/informativa)
- [ ] confidence esta atribuida (alta/media/baixa)

## Referencia ao Codigo-Fonte

- [ ] source.file aponta para arquivo existente
- [ ] source.lines indica as linhas exatas
- [ ] source.language esta correto
- [ ] O trecho de codigo referenciado confirma a regra

## Descricao

- [ ] description explica a regra em linguagem de negocio
- [ ] logic mostra a logica real do codigo (pseudocodigo ou trecho)
- [ ] conditions lista todas as pre-condicoes
- [ ] exceptions lista casos especiais e excecoes
- [ ] Descricao nao e mera traducao do codigo — agrega entendimento

## Dependencias

- [ ] dependencies lista regras das quais esta depende
- [ ] IDs referenciados existem no catalogo
- [ ] tags sao relevantes e padronizadas

## Classificacao

- [ ] Severidade condiz com o impacto real da regra
- [ ] Confianca reflete a clareza da evidencia no codigo
- [ ] Dominio e o mais especifico aplicavel
