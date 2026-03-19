# Transcrever Conteudo de Concorrentes

name: transcribe-content
description: Transcrever videos de concorrentes (Reels, YouTube, TikTok) em texto estruturado para analise de padroes
elicit: true

## INPUTS

- **URL do video:** link do reels, YouTube ou TikTok (obrigatorio)
- **Handle do concorrente:** @usuario (obrigatorio)
- **Plataforma:** Instagram Reels, YouTube, TikTok (obrigatorio)
- **Quantidade:** quantos videos transcrever (default: 1)
- **Contexto:** nicho do concorrente (opcional — melhora a analise)

## STEPS

1. Receber URL(s) e identificar plataforma
2. Extrair audio do video
3. Transcrever audio completo em texto
4. Estruturar transcricao em blocos:
   - Hook (0-3 segundos)
   - Retencao (3-10 segundos)
   - Conteudo (corpo principal)
   - CTA (final)
5. Identificar framework usado (BLAZE, PCS, outro)
6. Anotar: tom, ritmo, edicao, padroes visuais
7. Marcar palavras/frases de gatilho emocional
8. Entregar transcricao estruturada com anotacoes

## VETO CONDITIONS

- Se nao tem URL do video → NAO executar, pedir
- Se transcricao e so texto corrido sem estrutura → Estruturar em blocos
- Se nao identifica hook e CTA → Marcar explicitamente
- Se nao anota padroes (tom, ritmo, framework) → Adicionar
- Se transcricao tem erros grosseiros → Revisar

## OUTPUT EXAMPLE

```
TRANSCRICAO — @handle — [Plataforma]
Video: [URL]
Duracao: [tempo]
Views: [numero]

HOOK (0-3s):
"Pare de criar conteudo se voce quer vender."

RETENCAO (3-10s):
"Eu sei que parece contraintuitivo, mas o maior erro de 90% dos especialistas e..."

CONTEUDO (10s-50s):
"[transcricao completa do corpo]"

CTA (50s-60s):
"Salva esse video e me segue pra mais."

ANALISE:
- Framework: BLAZE (Bold statement + Loop + Action)
- Tom: Provocativo/autoritario
- Ritmo: Rapido, cortes a cada 3-5s
- Edicao: Jump cuts, legendas grandes
- Palavras-gatilho: "pare", "erro", "90%", "contraintuitivo"
- Padrao viral: Afirmacao contraintuitiva + dados + CTA simples
```

## COMPLETION CRITERIA

- Transcricao completa e precisa do audio
- Estruturada em blocos (Hook, Retencao, Conteudo, CTA)
- Framework identificado
- Tom, ritmo e edicao anotados
- Palavras/frases de gatilho marcadas
- Padrao viral identificado
- Formato utilizavel para analise posterior

references:
  - data/reels-framework.md
  - data/reels-patterns.md
  - data/competitor-frameworks.md
