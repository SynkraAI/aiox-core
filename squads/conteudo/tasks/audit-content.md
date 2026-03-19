# Auditar Conteudo pelo Oraculo

name: audit-content
description: Auditar conteudo existente contra os padroes do oraculo — identificar gaps, pontuar e sugerir melhorias
elicit: true

## INPUTS

- **Conteudo a auditar:** texto do post, carrossel, story ou reels (obrigatorio)
- **Formato:** carrossel, reels, stories, post unico (obrigatorio)
- **Intencao original:** atracao, consciencia, aquecimento ou venda (obrigatorio)
- **Avatar:** publico-alvo (opcional — melhora a analise)
- **Metricas atuais:** engajamento, views, saves (opcional)

## STEPS

1. Receber conteudo e formato
2. Identificar tipo de post atual (Imperial, Polemico, Crenca, Problema, Curiosidade, Historia, Oferta)
3. Aplicar checklist do oraculo correspondente (oraculo-posts ou oraculo-reels)
4. Pontuar cada criterio do oraculo (0-10)
5. Calcular score geral (%)
6. Identificar pontos fortes (o que ja funciona)
7. Identificar gaps criticos (o que precisa melhorar)
8. Gerar versao reescrita com melhorias aplicadas
9. Pontuar versao nova pelo oraculo
10. Entregar relatorio comparativo (antes vs depois)

## VETO CONDITIONS

- Se nao tem o conteudo a auditar → NAO executar, pedir
- Se formato nao e informado → Perguntar antes de auditar
- Se auditoria e superficial ("esta bom/ruim") → Detalhar criterio por criterio
- Se nao gera versao reescrita → Sempre entregar alternativa melhorada
- Se versao nova nao pontua mais que a original → Reescrever novamente

## OUTPUT EXAMPLE

```
AUDITORIA DE CONTEUDO

CONTEUDO ORIGINAL:
"[texto do post/carrossel/reels]"

TIPO IDENTIFICADO: Carrossel tipo Crenca
INTENCAO: Aquecimento

SCORE ORACULO: 62%

PONTUACAO POR CRITERIO:
| Criterio | Nota | Observacao |
|----------|------|-----------|
| Hook | 5/10 | Fraco, nao gera curiosidade |
| Tom Imperial | 7/10 | Bom, mas tem trechos educativos |
| Progressao | 6/10 | Slides 3-5 perdem ritmo |
| CTA | 4/10 | Generico, sem comando |
| Concisao | 8/10 | Dentro do limite |
| Especificidade | 5/10 | Muito generico pro avatar |
[...]

PONTOS FORTES:
- Slide 1 tem boa provocacao
- Tom geral esta na direcao certa

GAPS CRITICOS:
1. Hook precisa ser mais chocante
2. CTA precisa ser comando imperativo
3. Slides 3-5 parecem "dicas" em vez de argumentacao

VERSAO REESCRITA:
[Versao completa melhorada slide por slide]

SCORE NOVO: 84%
MELHORIA: +22 pontos
```

## COMPLETION CRITERIA

- Score oraculo calculado com criterios detalhados
- Cada criterio pontuado individualmente com observacao
- Pontos fortes identificados
- Gaps criticos listados com solucao
- Versao reescrita completa entregue
- Score da versao nova superior ao original
- Relatorio comparativo claro (antes vs depois)

## REFERENCES

references:
  - data/regras-inviolaveis.md
  - data/oraculo-posts.md
  - data/oraculo-reels.md
  - data/cliches-proibidos.md
