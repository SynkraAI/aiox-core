# Pesquisar Concorrentes (BR + US)

name: research-competitors
description: Pesquisa de concorrentes nos mercados BR e US — pipeline completo de mapeamento, coleta e ranking de conteudo
elicit: true

## INPUTS

- **Nicho/mercado:** area de atuacao (obrigatorio)
- **Plataformas:** Instagram, TikTok, YouTube (obrigatorio)
- **Mercados:** BR, US ou ambos (default: ambos)
- **Quantidade de concorrentes:** quantos mapear (default: 5-10)
- **Concorrentes conhecidos:** handles/nomes ja identificados (opcional)
- **Faixa de seguidores:** sweet spot desejado (default: 10k-500k)

## STEPS

1. Coletar nicho e plataformas alvo
2. DEFINIR: Listar criterios de selecao (mesmo nicho, audiencia ativa, conteudo recente)
3. MAPEAR: Identificar concorrentes por mercado (BR + US)
4. Coletar dados por concorrente: handle, seguidores, frequencia, formatos, oferta, tom, diferencial
5. COLETAR: Top 10 posts por engajamento (ultimos 90 dias) de cada concorrente
6. Extrair hooks, estruturas e CTAs dos posts mais engajados
7. RANQUEAR: Ordenar concorrentes por relevancia e performance
8. Gerar relatorio por concorrente no template padrao
9. Identificar gaps e oportunidades no nicho
10. Entregar analise consolidada com insights aplicaveis

## VETO CONDITIONS

- Se nao tem nicho definido → NAO executar, perguntar
- Se pesquisa so tem BR ou so US → Completar com o outro mercado
- Se dados sao superficiais (so nome e seguidores) → Aprofundar analise
- Se nao identifica padroes entre concorrentes → Analisar mais posts
- Se nao sugere insights aplicaveis → Adicionar recomendacoes praticas
- Se copia conteudo em vez de adaptar principios → Corrigir abordagem

## OUTPUT EXAMPLE

```
PESQUISA DE CONCORRENTES — [Nicho]
Data: [data]
Mercados: BR + US

CONCORRENTES MAPEADOS:

BR:
1. @handle1 — 45k seguidores — Carrosssel + Reels — Tom provocativo
2. @handle2 — 120k seguidores — Reels + Stories — Tom educativo
[...]

US:
1. @handle_us1 — 200k followers — Carousels — Provocative
2. @handle_us2 — 80k followers — Reels — Authority-based
[...]

TOP INSIGHTS:
1. Hooks que mais performam no nicho: [padrao identificado]
2. Formato dominante: [carrossel/reels/stories]
3. Tom que mais engaja: [provocativo/educativo/autoridade]
4. Gap identificado: [o que ninguem faz]
5. Oportunidade: [o que podemos fazer diferente]

RANKING POR RELEVANCIA:
| # | Handle | Mercado | Relevancia | Por que |
|---|--------|---------|------------|---------|
| 1 | @x     | BR      | Alta       | [motivo] |
[...]

PROXIMOS PASSOS:
- Analisar top 3 em profundidade (task: analyze-competitor)
- Transcrever videos dos top performers (task: transcribe-content)
- Gerar conteudo baseado nos insights
```

## COMPLETION CRITERIA

- Concorrentes mapeados em BR e US
- Dados completos por concorrente (handle, seguidores, formatos, tom, oferta)
- Top posts identificados por engajamento
- Padroes de hooks, estruturas e CTAs extraidos
- Ranking por relevancia com justificativa
- Gaps e oportunidades identificados
- Insights aplicaveis ao conteudo do usuario
- Relatorio no template padrao (conforme data/competitor-frameworks.md)

## REFERENCES

references:
  - data/competitor-frameworks.md
  - data/hooks-bank.md
  - data/tipos-de-post.md
  - data/frameworks-copy.md
