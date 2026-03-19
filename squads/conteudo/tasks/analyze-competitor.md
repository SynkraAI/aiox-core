# Analisar Concorrente em Profundidade

name: analyze-competitor
description: Analise profunda de padroes de conteudo de um concorrente especifico — hooks, estruturas, CTAs, tom e insights aplicaveis
elicit: true

## INPUTS

- **Handle do concorrente:** @usuario (obrigatorio)
- **Plataforma principal:** Instagram, TikTok, YouTube (obrigatorio)
- **Nicho:** area de atuacao do concorrente (obrigatorio)
- **Top posts coletados:** lista de conteudos mais engajados (obrigatorio — da task research-competitors)
- **Transcricoes disponiveis:** textos de videos ja transcritos (opcional — da task transcribe-content)
- **Nosso nicho:** para comparacao e adaptacao (opcional)

## STEPS

1. Receber dados do concorrente e top posts
2. Analisar hooks dos posts mais engajados — identificar padrao dominante
3. Analisar estrutura dos carrosseis — tipo de post e framework de copy usado
4. Analisar CTAs — qual tipo gera mais conversao
5. Analisar tom de voz — provocativo, educativo, autoritario, inspiracional
6. Analisar formatos — carrossel vs reels vs stories, qual performa melhor
7. Analisar frequencia e timing — quantas vezes por semana, horarios
8. Identificar temas recorrentes que geram mais engajamento
9. Extrair principios (nao copiar conteudo) adaptaveis pro tom imperial
10. Gerar 5 conteudos inspirados nos principios identificados
11. Entregar relatorio completo no template padrao

## VETO CONDITIONS

- Se nao tem handle e top posts → NAO executar, rodar research-competitors primeiro
- Se analise copia conteudo em vez de extrair principios → Reescrever
- Se nao gera conteudo adaptado → Sempre entregar pecas aplicaveis
- Se insights sao superficiais ("posts bons", "engajamento alto") → Aprofundar com dados
- Se conteudo gerado nao segue tom imperial → Reescrever
- Se nao valida pelo oraculo → Validar cada peca

## OUTPUT EXAMPLE

```
ANALISE PROFUNDA — @handle
Plataforma: Instagram
Nicho: [nicho]
Seguidores: [N]
Frequencia: [N] posts/semana

TOP 5 CONTEUDOS:
1. [tipo] — "[hook]" — [likes/comments/saves]
2. [tipo] — "[hook]" — [likes/comments/saves]
[...]

PADROES IDENTIFICADOS:

Hooks:
- Padrao dominante: Afirmacao contraintuitiva (70% dos top posts)
- Formato: "Pare de [X]" / "[Numero] coisas que [Y]"

Estrutura:
- Tipo de post mais usado: Polemico (40%), Crenca (30%)
- Framework: Contraste antes/depois (60%)

CTAs:
- Mais eficaz: "Salva + comenta [palavra]" (3x mais engajamento)
- Menos eficaz: "Link na bio" (baixa conversao)

Tom:
- Provocativo com autoridade (nao educativo)
- Frases curtas, diretas, sem rodeios

GAPS VS NOSSO CONTEUDO:
1. [gap identificado + recomendacao]
2. [gap identificado + recomendacao]

5 CONTEUDOS INSPIRADOS (adaptados pro tom imperial):
1. Carrossel: "[hook adaptado]" — baseado no principio [X]
2. Reels: "[roteiro adaptado]" — baseado no principio [Y]
[...]
```

## COMPLETION CRITERIA

- Analise completa dos top posts com dados de engajamento
- Padroes de hooks, estrutura, CTAs e tom identificados
- Gaps vs nosso conteudo mapeados
- 5 conteudos inspirados nos principios (nao copias)
- Conteudos gerados no tom imperial e validados pelo oraculo
- Relatorio no template padrao (conforme data/competitor-frameworks.md)
- Insights acionaveis (nao teoricos)

references:
  - data/competitor-frameworks.md
  - data/hooks-bank.md
  - data/tipos-de-post.md
  - data/frameworks-copy.md
