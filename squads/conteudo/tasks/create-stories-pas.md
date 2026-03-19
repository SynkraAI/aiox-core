# Criar Stories PAS (E7)

name: create-stories-pas
description: Criar sequencia de 11 stories com framework PAS (Problema-Agitacao-Solucao) para validar mentoria antes do lancamento oficial (Estrategia E7)
elicit: true

## INPUTS

- **O que voce vende:** mentoria, curso ou servico a ser validado (obrigatorio)
- **Para quem:** avatar especifico (obrigatorio)
- **Qual dor real:** problema principal do avatar (obrigatorio)
- **Qual transformacao entrega:** resultado mensuravel (obrigatorio)
- **Prova social disponivel:** depoimentos, cases, prints (opcional)
- **Preco/ticket previsto:** faixa de investimento (opcional)

## STEPS

1. Coletar as 4 informacoes obrigatorias
2. Criar Stories 1-2 (Problema): Perguntas que expoe a dor + enquete de validacao
3. Criar Stories 3-4 (Agitacao): Intensificar a dor mostrando consequencias de nao agir
4. Criar Stories 5-6 (Solucao): Apresentar o caminho sem revelar o metodo completo
5. Criar Stories 7-8 (Prova Social): Screenshots, depoimentos, casos reais
6. Criar Story 9 (Sondagem): Enquete de interesse para medir demanda
7. Criar Story 10 (Apresentacao): Descricao da mentoria + beneficios principais
8. Criar Story 11 (CTA Final): Chamada com link ou palavra-chave para pre-cadastro
9. Validar pelo oraculo (progressao PAS, tom, concisao)
10. Entregar sequencia completa formatada

## VETO CONDITIONS

- Se nao tem as 4 informacoes obrigatorias → NAO executar, perguntar
- Se qualquer story tem mais de 3 linhas de texto → Reescrever
- Se progressao PAS nao e clara (problema → agitacao → solucao) → Reestruturar
- Se tom parece educativo/generico em vez de imperial → Reescrever
- Se sondagem (story 9) nao tem enquete mensuravel → Reescrever
- Se CTA final nao tem acao especifica (link, DM ou palavra-chave) → Reescrever

## OUTPUT EXAMPLE

```
STORIES 1-2 (PROBLEMA):
Story 1: "Esta dificil captar novos clientes?"
[Enquete: Sim / Nao]

Story 2: "A maioria dos especialistas passa por isso e acha que o problema e conteudo..."

STORIES 3-4 (AGITACAO):
Story 3: "O mercado ficou mais sofisticado. Todos fazem as mesmas ofertas."
Story 4: "Enquanto voce 'se prepara', alguem com metade da sua experiencia esta fechando."

STORIES 5-6 (SOLUCAO):
Story 5: "Pra se destacar, precisa de orientacao personalizada. Nao de mais curso."
Story 6: "O segredo nao e mais conteudo. E posicionamento que vende sozinho."

STORIES 7-8 (PROVA SOCIAL):
Story 7: [Print] "Olha como a Fulana multiplicou vendas em 3x aplicando isso."
Story 8: [Depoimento] "Mais um resultado real. Sem formula magica."

STORY 9 (SONDAGEM):
"Voce gostaria da minha orientacao pra implementar isso no seu negocio?"
[Enquete: Sim, quero / Ainda nao]

STORY 10 (APRESENTACAO):
"Estou criando uma mentoria exclusiva pra resolver isso. [beneficios]"

STORY 11 (CTA FINAL):
"Se tem interesse, responde MENTORIA que te mando os detalhes."
```

## COMPLETION CRITERIA

- 11 stories completos seguindo framework PAS
- Enquetes estrategicas nos pontos de validacao (stories 1-2, 9)
- Progressao emocional clara: dor → agitacao → esperanca → prova → acao
- Tom imperial consistente
- Score oraculo >= 80%
- Dados de sondagem permitem medir demanda real

references:
  - data/stories-categorias.md
  - data/frameworks-copy.md
  - data/cta-bank.md
  - data/regras-inviolaveis.md
