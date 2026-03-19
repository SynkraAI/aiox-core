# Criar Stories de Venda Direta (E4)

name: create-stories-venda
description: Criar sequencia de 5 stories para venda direta (Estrategia E4 - Caixa Rapido)
elicit: true

## INPUTS

- **O que voce vende:** mentoria, produto ou servico (obrigatorio)
- **Para quem:** avatar com especificidade minima (obrigatorio)
- **Qual dor real:** dor que o avatar sente hoje (obrigatorio)
- **Qual transformacao entrega:** resultado mensuravel (obrigatorio)
- **Prints/provas disponiveis:** screenshots, depoimentos (opcional)

## STEPS

1. Coletar as 4 informacoes obrigatorias (uma por vez se necessario)
2. Criar Story 1 (Antecipacao): Gancho provocativo + enquete que gera identificacao
3. Criar Story 2 (Autoridade): Prints + provas sociais que comprovam resultado
4. Criar Story 3 (Qualificacao): Enquete de investimento para filtrar curiosos
5. Criar Story 4 (Qualificacao Avancada): Confirmar comprometimento real
6. Criar Story 5 (Oferta): CTA direto com palavra-chave especifica
7. Validar pelo oraculo (tom imperial, concisao, coerencia)
8. Entregar sequencia completa formatada com notas de execucao

## VETO CONDITIONS

- Se nao tem as 4 informacoes obrigatorias → NAO executar, perguntar
- Se qualquer story tem mais de 3 linhas de texto → Reescrever
- Se CTA nao tem palavra-chave definida → Reescrever
- Se tom nao e imperial (parece generico/educativo) → Reescrever
- Se enquetes nao tem opcoes polarizadoras → Reescrever
- Se sequencia nao tem progressao emocional clara → Reestruturar

## OUTPUT EXAMPLE

```
STORY 1 (ANTECIPACAO):
"Voce ja sentiu que faz tudo certo mas nao vende? Conta pra mim."
[Enquete: Sim / Nao]

STORY 2 (AUTORIDADE):
[Print de resultado]
"Isso aconteceu depois de aplicar 1 mudanca. UMA."

STORY 3 (QUALIFICACAO):
"Se existisse algo que resolve isso em 30 dias, voce investiria?"
[Enquete: Sim, quero / Nao agora]

STORY 4 (QUALIFICACAO AVANCADA):
"Voce dedica 1h por dia pra mudar isso?"
[Enquete: Sim / Talvez]

STORY 5 (OFERTA):
"Abrindo 5 vagas. Responde EU QUERO que te explico."
```

## COMPLETION CRITERIA

- 5 stories completos com texto e enquetes/stickers
- Palavra-chave definida pro CTA final
- Tom imperial consistente em toda sequencia
- Progressao emocional: curiosidade → prova → filtro → comprometimento → acao
- Score oraculo >= 80%
- Metricas esperadas informadas (200+ views = funcional, 2-5% conversao)

references:
  - data/stories-categorias.md
  - data/cta-bank.md
  - data/regras-inviolaveis.md
  - data/oraculo-posts.md
