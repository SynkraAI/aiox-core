# FRAMEWORKS DE ANALISE DE CONCORRENTES

## VISAO GERAL

Sistema de pesquisa e analise de concorrentes para gerar insights de conteudo.
Funciona para mercados BR e US. Usa scraping, transcricao e analise de padroes.

---

## ETAPA 1: MAPEAMENTO DE CONCORRENTES

### Criterios de Selecao
- Mesmo nicho/mercado
- Audiencia de 10k a 500k seguidores (sweet spot)
- Conteudo ativo (postaram nos ultimos 30 dias)
- Resultados visiveis (engajamento alto, comentarios com intencao de compra)

### Dados a Coletar por Concorrente
| Campo | Descricao |
|-------|-----------|
| Nome/Handle | @usuario no Instagram/TikTok/YouTube |
| Plataformas | Onde esta ativo |
| Seguidores | Numero por plataforma |
| Frequencia | Posts/semana |
| Formatos | Carrossel, Reel, Story, Live, Post unico |
| Nicho | Especificidade do posicionamento |
| Oferta | O que vende (mentoria, curso, servico) |
| Ticket | Faixa de preco (se visivel) |
| Tom de voz | Provocativo, educativo, inspiracional, tecnico |
| Diferencial | O que faz diferente da maioria |

---

## ETAPA 2: COLETA DE CONTEUDO TOP

### Metricas de Performance (por plataforma)

**Instagram:**
- Likes / seguidores ratio (benchmark: >3% = bom, >5% = viral)
- Comentarios com intencao ("quanto custa?", "como funciona?", "quero")
- Saves (indicador de valor percebido)
- Shares (indicador de viralidade)

**YouTube/Reels:**
- Views / subscribers ratio
- Retencao media (se disponivel)
- Comentarios engajados vs spam

**TikTok:**
- Views / followers ratio
- Completion rate (videos assistidos ate o final)
- Stitches e duets (engajamento criativo)

### O que Coletar
- Top 10 posts por engajamento (ultimos 90 dias)
- Top 5 reels por views
- Hooks dos posts mais engajados
- Estrutura dos carrosseis que mais performaram
- CTAs que geraram mais respostas

---

## ETAPA 3: TRANSCRICAO E ANALISE

### Para Videos (Reels/YouTube)
1. Transcrever audio completo
2. Identificar estrutura usada (BLAZE? PCS? Outro?)
3. Marcar: Hook (0-3s), Retencao, Conteudo, CTA
4. Anotar: Padrao viral usado, tom, ritmo, edicao

### Para Carrosseis
1. Copiar texto de cada slide
2. Identificar tipo de post (Imperial, Crenca, Problema, etc)
3. Identificar framework de copy usado
4. Anotar: Hook, progressao emocional, CTA

### Para Stories
1. Capturar sequencia completa
2. Identificar estrategia (E4, E6, E7, E8?)
3. Anotar: Enquetes, CTAs, palavras-chave

---

## ETAPA 4: EXTRACAO DE PADROES

### Matriz de Analise
| Dimensao | O que Analisar | Output |
|----------|---------------|--------|
| Hooks | Que tipo de hook mais performa? | Top 10 hooks adaptaveis |
| Estrutura | Qual estrutura de post mais engaja? | Templates replicaveis |
| Tom | Qual tom gera mais engajamento? | Guia de tom adaptado |
| CTA | Qual CTA gera mais conversao? | Templates de CTA |
| Formato | Carrossel vs Reel vs Story — qual performa melhor? | Recomendacao de mix |
| Frequencia | Quantas vezes por semana os melhores postam? | Calendario sugerido |
| Temas | Quais temas geram mais engajamento? | Banco de ideias |

### Metricas de Comparacao
- Engagement rate medio do concorrente vs nosso
- Tipo de conteudo que mais performa (por formato)
- Gaps: O que eles fazem que a gente nao faz?
- Oportunidades: O que ninguem esta fazendo no nicho?

---

## ETAPA 5: GERACAO DE CONTEUDO BASEADO EM INSIGHTS

### Processo
1. Pegar top 10 conteudos do concorrente
2. Identificar o PRINCIPIO por tras do sucesso (nao copiar, entender)
3. Adaptar pro tom Torriani/Imperador
4. Gerar 3 variacoes usando frameworks proprios (7 tipos de post + 9 frameworks copy)
5. Validar pelo Oraculo

### Regras
- NUNCA copiar conteudo — adaptar o principio
- SEMPRE aplicar tom Imperador/Torriani na adaptacao
- SEMPRE validar pelo Oraculo antes de publicar
- Creditar inspiracao se for caso obvio

---

## FERRAMENTAS DISPONIVEIS

| Ferramenta | Uso |
|------------|-----|
| Apify | Scrape Instagram/TikTok/YouTube — posts, metricas, comentarios |
| Playwright | Screenshots de perfis, navegacao web |
| EXA | Pesquisa web complementar sobre concorrentes |
| Transcricao | Extrair texto de videos (via audio → texto) |

---

## CONFIGURACAO APIFY PARA ANALISE DE CONCORRENTES

### Passo 1: Escolher o Actor Correto

| Plataforma | Actor Recomendado | Actor ID |
|------------|-------------------|----------|
| Instagram (posts) | Instagram Post Scraper | `apify/instagram-post-scraper` |
| Instagram (perfil) | Instagram Profile Scraper | `apify/instagram-profile-scraper` |
| Instagram (comentarios) | Instagram Comment Scraper | `apify/instagram-comment-scraper` |
| TikTok | TikTok Scraper | `clockworks/tiktok-scraper` |
| YouTube | YouTube Scraper | `bernardo/youtube-scraper` |

### Passo 2: Configuracao do Instagram Post Scraper

**Input basico para coletar posts de um concorrente:**
```json
{
  "username": ["@handle_do_concorrente"],
  "resultsLimit": 50,
  "resultsType": "posts",
  "searchType": "user",
  "addParentData": true
}
```

**Campos retornados uteis:**
- `likesCount` — numero de curtidas
- `commentsCount` — numero de comentarios
- `timestamp` — data do post
- `caption` — texto/legenda completa
- `type` — carrossel, reel, imagem unica
- `url` — link direto do post
- `videoViewCount` — views (se reel)

### Passo 3: Configuracao do Instagram Profile Scraper

**Input para coletar dados do perfil:**
```json
{
  "usernames": ["handle1", "handle2", "handle3"],
  "resultsLimit": 5
}
```

**Campos retornados uteis:**
- `followersCount` — seguidores
- `followsCount` — seguindo
- `postsCount` — total de posts
- `biography` — bio do perfil
- `externalUrl` — link da bio
- `isVerified` — selo de verificacao

### Passo 4: Fluxo Completo de Analise

```
1. search-actors → buscar "instagram scraper"
2. fetch-actor-details → ver schema de input do Actor escolhido
3. call-actor → executar com os parametros acima
4. get-actor-output → coletar resultados
5. Analisar dados com a Matriz de Analise (Etapa 4)
```

### Passo 5: Analise dos Dados Coletados

**Calcular metricas-chave:**
```
Engagement Rate = (likes + comentarios) / seguidores * 100
Save Rate = saves / alcance * 100 (quando disponivel)
Viral Score = shares / alcance * 100 (quando disponivel)
```

**Ordenar posts por performance:**
1. Pegar todos os posts coletados
2. Calcular engagement rate de cada um
3. Ordenar do maior pro menor
4. Analisar Top 10: que tipo de hook? Que formato? Que tom? Que CTA?
5. Identificar padroes repetidos nos top performers

### Passo 6: Dicas Praticas

- **Frequencia:** Rodar scraping 1x por mes por concorrente (dados ficam salvos no Apify)
- **Volume:** Coletar ultimos 50-100 posts para ter amostra significativa
- **Comentarios:** Coletar top 20 comentarios dos posts mais engajados para identificar intencao de compra
- **Comparacao:** Montar planilha comparativa com 3-5 concorrentes lado a lado
- **Custo:** Instagram Post Scraper consome ~0.25 USD por 100 posts no plano Apify
- **Limite:** Respeitar rate limits — nao rodar mais de 3 scrapers simultaneos na mesma plataforma

---

## TEMPLATE DE RELATORIO POR CONCORRENTE

```markdown
# Analise: @[handle]

## Dados Gerais
- Plataforma: Instagram / TikTok / YouTube
- Seguidores: [N]
- Frequencia: [N] posts/semana
- Nicho: [especificidade]
- Oferta: [o que vende]
- Tom: [descricao]

## Top 5 Conteudos (por engajamento)
1. [tipo] — [hook] — [likes/comments/saves]
2. ...

## Padroes Identificados
- Hook dominante: [tipo]
- Estrutura mais usada: [tipo]
- CTA mais eficaz: [tipo]
- Formato mais performante: [carrossel/reel/story]

## Insights Aplicaveis
1. [insight + como adaptar pro nosso estilo]
2. ...

## Conteudos Sugeridos (baseados na analise)
1. [ideia adaptada]
2. ...
```

---

## CONTENT GAP ANALYSIS — Analise de Lacunas de Conteudo

### O que e Content Gap Analysis

E o processo de identificar o que concorrentes fazem no conteudo que voce NAO faz, e vice-versa. O objetivo e encontrar oportunidades inexploradas para se posicionar de forma unica.

### Distincao Fundamental: Concorrente de PRODUTO vs Concorrente de CONTEUDO

| Tipo | Definicao | Exemplo |
|------|-----------|---------|
| Concorrente de PRODUTO | Vende a mesma coisa para o mesmo publico | Outro mentor que vende mentoria de marketing digital |
| Concorrente de CONTEUDO | Compete pela ATENCAO do mesmo publico, mesmo vendendo outra coisa | Um canal de produtividade que atrai o mesmo avatar |

**Por que isso importa:**
- Concorrentes de PRODUTO competem por venda direta
- Concorrentes de CONTEUDO competem por atencao e autoridade
- Voce precisa analisar AMBOS para ter vantagem real
- Muitas vezes, os concorrentes de conteudo sao mais perigosos porque roubam atencao antes de voce vender

### Como Identificar Content Gaps Sistematicamente

#### Passo 1: Mapear o que eles fazem
Para cada concorrente (3-5), catalogar:
- Formatos usados (carrossel, reel, story, live, post unico)
- Temas recorrentes (top 10 assuntos)
- Tom de voz dominante
- Tipo de CTA mais usado
- Frequencia de postagem

#### Passo 2: Classificar por dimensao

| Dimensao | Pergunta-chave |
|----------|---------------|
| Formato | Que formato eles usam que eu NAO uso? |
| Tema | Que temas eles cobrem que eu NAO cubro? |
| Tom | Que tom eles adotam que eu NAO adoto? |
| Profundidade | Eles vao mais fundo ou mais raso que eu? |
| Frequencia | Eles postam mais ou menos que eu? |
| CTA | Que tipos de CTA eles usam que eu NAO uso? |
| Plataforma | Em que plataformas eles estao que eu NAO estou? |

#### Passo 3: Montar a Matriz de Gap

| Dimensao | Eu Faco | Concorrente A | Concorrente B | GAP |
|----------|---------|---------------|---------------|-----|
| Carrosseis | Sim | Sim | Sim | - |
| Reels | Pouco | Muito | Medio | GAP |
| Lives | Nao | Sim | Nao | GAP |
| Storytelling | Sim | Nao | Sim | - |
| Polemica | Sim | Nao | Nao | VANTAGEM |

#### Passo 4: Priorizar os Gaps

Nem todo gap vale a pena preencher. Priorize usando:

| Criterio | Peso |
|----------|------|
| Alinhamento com meu posicionamento | Alto |
| Demanda do meu avatar | Alto |
| Facilidade de execucao | Medio |
| Impacto potencial em vendas | Alto |
| Diferenciacao real | Medio |

#### Passo 5: Transformar Gaps em Conteudo

Para cada gap prioritario:
1. Definir o tema/formato que vai preencher o gap
2. Adaptar ao tom imperial/Torriani
3. Criar 3-5 pecas de conteudo piloto
4. Testar por 2-4 semanas
5. Medir performance vs baseline
6. Decidir: escalar, iterar ou descartar

### Oportunidades Comuns de Gap

| Gap Comum | O que Fazer |
|-----------|------------|
| Concorrentes so educam | Criar conteudo que PROVOCA e VENDE |
| Ninguem faz Reels longos | Testar Storytelling 40-60s |
| Todos usam tom suave | Apostar no tom imperial/brutal |
| Ninguem mostra bastidores | Criar sequencia de stories de bastidores |
| Todos vendem igual | Criar ofertas com tensao e escassez real |
| Ninguem segmenta | Criar conteudo especifico para ICP |
| Todos postam diario | Postar menos, mas com mais impacto |
| Ninguem usa prova social | Criar conteudo baseado em cases/resultados |

### Frequencia de Revisao

- **Mensal:** Verificar top 10 posts dos concorrentes
- **Trimestral:** Refazer a matriz de gap completa
- **Semestral:** Reavaliar lista de concorrentes (novos entrantes, saidas)
