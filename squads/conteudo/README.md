# Squad Conteudo v2.2

Squad de criacao de conteudo Instagram (carrosseis, Reels, Stories, campanhas, pesquisa de concorrentes, multiplicar conteudo) baseado em 3 sistemas proprietarios.

## Setup (Pre-requisitos)

Para usar todas as funcoes do squad, instalar:

```bash
# Obrigatorio para *multiplicar (transcricao de YouTube)
brew install yt-dlp
brew install ffmpeg

# Configurar chave OpenAI (Whisper API)
export OPENAI_API_KEY="sk-..."
```

**Sem yt-dlp/ffmpeg:** O comando *multiplicar ainda funciona com opcoes 2 (colar texto) e 3 (arquivo), mas nao consegue transcrever YouTube automaticamente.

## Fontes

- **AGENTE IMPERADOR** -- Sistema completo de posts intencionais (7 tipos narrativos, tom Torriani, hooks, CTAs, oraculo)
- **AGENTE BLAZE** -- Sistema de Reels (framework 6 blocos, 7 padroes virais, 500+ hooks)
- **BRANDCONTENT** -- 9 frameworks de copy para carrosseis + 5 tipos de abertura

## Agents (10)

| Agent | Tier | Role | Descricao |
|-------|------|------|-----------|
| content-chief | 0 | orchestrador | Orchestrador central. Diagnostica, recomenda e direciona. |
| carousel-creator | 1 | criador | Cria carrosseis de 1-10 slides. 7 tipos + 9 frameworks. |
| reels-creator | 1 | criador | Roteiros de Reels. DNA BLAZE completo. 6 blocos + 7 padroes. |
| stories-strategist | 1 | criador | Sequencias de Stories com intencao de conversao. |
| strategist | 1 | estrategista | 8 estrategias de campanha E1-E8 com cronograma integrado Feed + Stories. |
| positioning-expert | 1 | posicionamento | Bio Imperial, CLC, StoryAds e Sistema 21 dias. |
| competitor-analyst | 1 | pesquisador | Pesquisa concorrentes BR + US. Scrape, transcricao, analise de padroes. |
| content-planner | 2 | planejador | Planejamento estrategico. 5 niveis de consciencia. 25 ideias/ciclo. |
| content-repurposer | 2 | adaptador | Adapta conteudo entre formatos (carousel->reel, reel->stories, post->campanha). |
| content-validator | 2 | validador | Oraculo unificado. Valida carrosseis (12 testes) e Reels (3 niveis). |

## Tasks (26)

### Criacao (16)

| Task | Agent | Descricao |
|------|-------|-----------|
| create-carousel | carousel-creator | Criar carrossel completo |
| create-reels | reels-creator | Criar roteiro de Reels |
| create-stories | stories-strategist | Criar sequencia de Stories |
| create-stories-venda | stories-strategist | Stories de venda |
| create-stories-pas | stories-strategist | Stories com framework PAS |
| create-stories-funil | stories-strategist | Stories de funil |
| create-levantada-mao | stories-strategist | Stories de levantada de mao |
| create-strategy | strategist | Estrategia de campanha E1-E8 |
| create-bio | positioning-expert | Bio Imperial (3 fases) |
| create-storyadd | positioning-expert | StoryAds de manipulacao subliminar |
| create-clc | positioning-expert | Carrossel de Lavagem Cerebral |
| create-hook-batch | content-chief | Batch de hooks para teste |
| create-content-series | content-chief | Serie de conteudo multi-peca |
| create-campaign | content-chief | Campanha multi-formato |
| ingest-pillar | content-chief | Ingerir conteudo longo (YouTube, texto, arquivo) e gerar transcricao |
| create-impact-phrases | content-chief | Frases de impacto para quote card (feed) e stories |

### Planejamento e Diagnostico (3)

| Task | Agent | Descricao |
|------|-------|-----------|
| plan-content | content-planner | Gerar planejamento + calendario editorial |
| diagnose-avatar | content-planner | Diagnostico de avatar |
| plan-calendar | content-planner | Planejar calendario editorial semanal/mensal |

### Adaptacao e Validacao (4)

| Task | Agent | Descricao |
|------|-------|-----------|
| repurpose-content | content-repurposer | Adaptar conteudo entre formatos |
| validate-content | content-validator | Validar pelo Oraculo |
| audit-content | content-validator | Auditoria completa de conteudo |
| atomize-content | content-repurposer | Atomizar conteudo longo em pecas curtas |

### Pesquisa de Concorrentes (3)

| Task | Agent | Descricao |
|------|-------|-----------|
| research-competitors | competitor-analyst | Pesquisar concorrentes BR + US |
| transcribe-content | competitor-analyst | Transcrever conteudo de concorrente |
| analyze-competitor | competitor-analyst | Analisar padroes de concorrente |

## Workflows (9)

| Workflow | Descricao |
|----------|-----------|
| wf-create-content | Criacao de peca unica (briefing -> validacao) |
| wf-campaign | Campanha multi-formato integrada |
| wf-strategy | Estrategia completa E1-E8 |
| wf-positioning | Posicionamento completo (Bio + CLC + StoryAds + 21 dias) |
| wf-21-days | Sistema de dominacao 21 dias |
| wf-hook-testing | Teste de hooks 70-20-10 |
| wf-competitor-intel | Pipeline pesquisa de concorrentes BR + US |
| wf-atomization | Atomizacao de conteudo longo em pecas curtas |
| wf-multiplicar | **\*multiplicar:** 1 conteudo longo → 30+ micro-pecas com qualidade garantida |

## Checklists (10)

| Checklist | Funcao |
|-----------|--------|
| oraculo-posts | Validacao de posts/carrosseis (12 testes) |
| oraculo-reels | Validacao de Reels (3 niveis) |
| content-rules | Regras gerais de conteudo |
| hook-quality | Qualidade de hooks |
| belief-elements | Elementos de crenca |
| strategy-execution | Execucao de estrategia |
| bio-quality | Qualidade de Bio Imperial |
| storyadd-quality | Qualidade de StoryAds |
| campaign-coherence | Coerencia de campanha multi-formato |
| competitor-analysis | Qualidade de analise de concorrente |

## Data Files (34)

### Nucleo e Identidade
- `nucleo.md` -- DNA do posicionamento
- `expression.md` -- Expressao e tom de voz
- `modos-operacionais.md` -- Modos de operacao
- `regras-inviolaveis.md` -- Regras que nunca quebram
- `cliches-proibidos.md` -- Frases e expressoes proibidas

### Posts e Carrosseis
- `tipos-de-post.md` -- 7 tipos de post intencional
- `frameworks-copy.md` -- 9 frameworks de copy (BRANDCONTENT)
- `aberturas-poderosas.md` -- 5 tipos de abertura
- `hooks-bank.md` -- Banco de hooks
- `cta-bank.md` -- Banco de CTAs
- `swipe-posts.md` -- Swipe file de posts
- `belief-checklist.md` -- Checklist de elementos de crenca
- `posts-intencionais.md` -- Referencia de posts intencionais

### Reels
- `reels-framework.md` -- Framework 6 blocos (BLAZE)
- `reels-imperial.md` -- Reels no tom imperial
- `reels-patterns.md` -- 7 padroes virais
- `reels-swipefile.md` -- Swipe file de Reels
- `oraculo-posts.md` -- Oraculo de validacao de posts
- `oraculo-reels.md` -- Oraculo de validacao de Reels

### Stories e StoryAds
- `stories-categorias.md` -- Categorias de Stories
- `storyadds.md` -- Templates de StoryAds

### Estrategia e Posicionamento
- `estrategias.md` -- 8 estrategias E1-E8
- `posicionamento.md` -- Sistema de posicionamento
- `avatar-research.md` -- Pesquisa de avatar

### Pesquisa de Concorrentes
- `competitor-frameworks.md` -- Frameworks de analise de concorrentes

### Planejamento e Estrategia Avancada
- `planejamento-consciencia.md` -- Mapeamento dos 5 niveis de consciencia para conteudo
- `narrativas-card-by-card.md` -- Estruturas narrativas card a card para carrosseis
- `posts-bastidores.md` -- Templates e estrutura de posts de bastidores
- `templates-prompt-carrossel.md` -- Templates de prompt para criacao de carrosseis
- `sistema-htb.md` -- Sistema Hook-Tensao-Beneficio para conteudo
- `proporcao-conteudo.md` -- Proporcao ideal de tipos de conteudo (50-25-25)
- `instagram-algoritmo-2025.md` -- Regras do algoritmo Instagram 2025
- `calendario-framework.md` -- Framework de calendario editorial
- `frameworks-oferta.md` -- Frameworks de oferta para conteudo de conversao

## Modulo de Pesquisa de Concorrentes

Modulo novo (v2.0) para pesquisa e analise de concorrentes brasileiros e internacionais:

- **Agent:** `competitor-analyst` (Tier 1)
- **Tasks:** `research-competitors`, `transcribe-content`, `analyze-competitor`
- **Workflow:** `wf-competitor-intel` (pipeline completo)
- **Checklist:** `competitor-analysis`
- **Data:** `competitor-frameworks.md`

Pipeline: Pesquisa -> Scrape/Transcricao -> Analise de padroes -> Relatorio

## Proporcao de Conteudo

- 50% Tensao (incomoda, provoca, polariza)
- 25% Alinhamento (conecta, valida, gera empatia)
- 25% Demonstracao (prova, mostra resultados, converte)

## Comandos por Agent

### content-chief (Tier 0 — Orchestrador)

| Comando | Acao |
|---------|------|
| *briefing | Iniciar coleta de briefing |
| *diagnostico | Analisar e recomendar configuracao |
| *carrossel | Direcionar para carousel-creator |
| *reels | Direcionar para reels-creator |
| *stories | Direcionar para stories-strategist |
| *planejar | Direcionar para content-planner |
| *validar | Direcionar para content-validator |
| *campanha | Coordenar campanha multi-formato |
| *repurpose | Sugerir adaptacao de conteudo existente |
| **\*multiplicar** | **Multiplicar Conteudo: 1 peca longa → 30+ micro-pecas** |

### carousel-creator (Tier 1)

| Comando | Acao |
|---------|------|
| *carrossel | Criar carrossel completo (coleta briefing + executa) |
| *carrossel-imperial | Criar carrossel tipo Imperial (10 slides) |
| *carrossel-oferta | Criar carrossel tipo Oferta (10 slides com CTA de venda) |
| *carrossel-rapido | Criar carrossel curto (3-5 slides) |
| *frase | Criar frase de impacto (quote card feed + stories) |

### reels-creator (Tier 1)

| Comando | Acao |
|---------|------|
| *reel | Criar roteiro de Reel completo |
| *reel-blaze | Roteiro formato BLAZE (6 blocos, 45-60s) |
| *reel-4c | Roteiro formato 4C Imperial (5 blocos, 25-30s) |
| *reel-provocacao | Roteiro de provocacao (10-20s, hot take) |
| *hooks-reel | Gerar 5 opcoes de hook para um tema |

### stories-strategist (Tier 1)

| Comando | Acao |
|---------|------|
| *stories | Criar sequencia de Stories completa (3-7 stories) |
| *stories-venda | Sequencia de venda direta |
| *stories-pas | Sequencia PAS (Problema-Agitacao-Solucao) |
| *stories-funil | Sequencia de funil de pressao |
| *levantada-mao | Sequencia de levantada de mao (qualificacao) |
| *storyadd | StoryAds subliminar (direciona pro positioning-expert) |

### strategist (Tier 1)

| Comando | Acao |
|---------|------|
| *campanha | Montar campanha completa (E1-E8 + cronograma) |
| *lancamento | Campanha E1 — Lancamento de Pressao (5 dias) |
| *doutrina | Campanha E3 — Doutrina Silenciosa |
| *feed-guerra | Campanha E5 — Feed de Guerra Visual (5 posts) |
| *estrategia | Diagnosticar qual estrategia E1-E8 usar |

### positioning-expert (Tier 1)

| Comando | Acao |
|---------|------|
| *bio | Criar Bio Imperial completa (3 fases) |
| *clc | Carrossel de Lavagem Cerebral (10 slides) |
| *storyadd | StoryAds de manipulacao subliminar |
| *21dias | Sistema de Dominacao 21 Dias |
| *diagnostico-posicionamento | Diagnosticar posicionamento atual |

### competitor-analyst (Tier 1)

| Comando | Acao |
|---------|------|
| *concorrentes | Pesquisar concorrentes BR + US (pipeline completo) |
| *espionar | Analisar perfil de 1 concorrente especifico |
| *transcrever | Transcrever video de concorrente |
| *gaps | Identificar gaps de conteudo |
| *relatorio | Relatorio comparativo de concorrentes |

### content-planner (Tier 2)

| Comando | Acao |
|---------|------|
| *planejar | Gerar planejamento de conteudo (25 ideias/ciclo) |
| *calendario | Montar calendario editorial semanal/mensal |
| *ideias | Gerar ideias por nivel de consciencia |
| *avatar | Diagnosticar avatar/publico-alvo |

### content-repurposer (Tier 2)

| Comando | Acao |
|---------|------|
| *repurpose | Adaptar conteudo que performou para outro formato |
| *multiplicar | Sugerir 3 adaptacoes para conteudo que performou |
| *atomizar | Atomizar conteudo pilar em briefs de micro-pecas |

### content-validator (Tier 2)

| Comando | Acao |
|---------|------|
| *validar | Validar peca pelo Oraculo (posts ou reels) |
| *auditar | Auditoria completa de conteudo |
| *score | Calcular score rapido (sem reescrita) |

## Multiplicar Conteudo (*multiplicar)

Transforma 1 conteudo longo (live, aula, podcast, YouTube) em 30+ micro-pecas:

```
*multiplicar

→ Fase 0: Ingestao (YouTube URL / texto / arquivo → transcricao limpa)
→ Fase 1: Extracao (insights, quotes, dados, historias, provocacoes)
→ Fase 2: Planejamento (mapear atomos → formatos + aprovacao do usuario)
→ Fase 3: Criacao (carrosseis, reels, stories, frases de impacto)
→ Fase 4: Validacao (Oraculo, score >= 80%)
→ Fase 5: Entrega (calendario + briefs de email pro Squad Copywriters)
```

**Formatos de saida:**
- Carrosseis (create-carousel)
- Reels (create-reels)
- Stories (create-stories)
- Frases de impacto — quote card para feed + stories (create-impact-phrases)
- Briefs de email — handoff para Squad Copywriters (nao cria emails, gera briefs)

## Como Ativar

```
# Ativar o orchestrador do squad
@content-chief

# Multiplicar Conteudo (conteudo longo → micro-pecas)
*multiplicar

# Ou ativar tasks diretamente
Conteudo:tasks:create-carousel
Conteudo:tasks:create-reels
Conteudo:tasks:create-stories
Conteudo:tasks:plan-content
Conteudo:tasks:create-campaign
Conteudo:tasks:create-bio
Conteudo:tasks:research-competitors
Conteudo:tasks:atomize-content
Conteudo:tasks:plan-calendar
Conteudo:tasks:ingest-pillar
Conteudo:tasks:create-impact-phrases
```

## Workflow de Criacao (Peca Unica)

```
BRIEFING -> CONFIGURACAO -> HEADLINES -> ARGUMENTACAO -> CTA -> VALIDACAO -> ENTREGA
```

1. Tema + publico + crenca + contexto
2. Formato + Intencao + Tipo + Framework + Tamanho
3. 3 opcoes de headline (2 virais + 1 imperial), usuario seleciona
4. Fatos/argumentos + progressao emocional + framework aplicado
5. 3 opcoes de CTA, usuario seleciona
6. Oraculo (score >= 80%), reescreve se reprovar
7. Post formatado + caption + sugestoes de repurpose
