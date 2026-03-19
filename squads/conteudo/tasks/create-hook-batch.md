# Gerar Batch de Hooks (Hormozi 70-20-10)

name: create-hook-batch
description: Gerar lote de hooks usando framework Hormozi 70-20-10 — 70% comprovados adaptados, 20% variacoes, 10% experimentais
elicit: true

## INPUTS

- **Nicho/mercado:** area de atuacao (obrigatorio)
- **Avatar:** quem vai ler (obrigatorio)
- **Formato:** carrossel, reels, stories ou misto (obrigatorio)
- **Quantidade:** quantos hooks gerar (default: 20)
- **Temas especificos:** assuntos para os hooks (opcional)
- **Hooks que ja funcionaram:** referencias de performance anterior (opcional)

## STEPS

1. Coletar nicho, avatar e formato
2. Consultar banco de hooks em data/hooks-bank.md
3. Gerar 70% dos hooks: adaptacoes de hooks comprovados do banco
4. Gerar 20% dos hooks: variacoes e combinacoes de hooks existentes
5. Gerar 10% dos hooks: hooks experimentais/contraintuitivos
6. Categorizar cada hook por tipo: Universal, Produto, Contraintuitivo, Provocativo
7. Marcar nivel de risco de cada hook: Seguro / Moderado / Ousado
8. Validar: especificidade pro nicho, tom imperial, concisao
9. Entregar batch organizado por categoria e risco

## VETO CONDITIONS

- Se hooks sao genericos e aplicaveis a qualquer nicho → Reescrever com especificidade
- Se proporcao 70-20-10 nao e respeitada → Rebalancear
- Se hooks sao longos (mais de 15 palavras) → Reduzir
- Se nao tem variedade de tipos → Adicionar tipos faltantes
- Se todos os hooks sao "seguros" → Adicionar hooks ousados
- Se tom nao e imperial → Reescrever

## OUTPUT EXAMPLE

```
BATCH DE HOOKS — [Nicho] — [Data]

70% COMPROVADOS (14 hooks):
1. [Seguro] "Voce esta postando errado. E por isso nao vende."
2. [Seguro] "A maioria dos [nicho] erra quando tenta [acao]..."
3. [Moderado] "Pare de fazer [X] se quiser [Y]"
...

20% VARIACOES (4 hooks):
15. [Moderado] "O que [concorrentes] nao te contam sobre [tema]..."
16. [Moderado] "[Numero] sinais de que voce esta [consequencia negativa]"
...

10% EXPERIMENTAIS (2 hooks):
19. [Ousado] "Isso deveria ser ilegal no [nicho]."
20. [Ousado] "Voce pode me deixar de seguir por dizer isso..."

LEGENDA:
[Seguro] = Formato testado, risco baixo
[Moderado] = Variacao com potencial, testar com cautela
[Ousado] = Experimental, pode viralizar ou dividir audiencia
```

## COMPLETION CRITERIA

- Quantidade solicitada de hooks entregue (default: 20)
- Proporcao 70-20-10 respeitada
- Cada hook categorizado por tipo e nivel de risco
- Hooks especificos pro nicho (nao genericos)
- Tom imperial consistente
- Concisao: max 15 palavras por hook
- Variedade de formatos (pergunta, afirmacao, comando, provocacao)

references:
  - data/hooks-bank.md
  - data/aberturas-poderosas.md
  - data/swipe-posts.md
  - data/regras-inviolaveis.md
