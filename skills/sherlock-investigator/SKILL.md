---
name: sherlock-investigator
description: >-
  Investigador de perfis reais em redes sociais. Extrai conteúdo,
  analisa padrões de engajamento, hooks, CTAs e vocabulário.
  Suporta Instagram, YouTube, Twitter/X e LinkedIn via Playwright.
  Produz raw-content, pattern-analysis e consolidated-analysis.
risk: safe
source: opensquad
paths:
  - "skills/sherlock-investigator/"
lazy_load: true
context_budget: 3000
---

# Sherlock Investigator

Investigador de perfis reais em redes sociais. É como contratar um detetive particular que analisa o conteúdo de influenciadores e extrai exatamente o que funciona, por que funciona, e como replicar.

## When to Use This Skill

- Analisar perfis de referência para criar squads de conteúdo
- Extrair padrões de hooks, CTAs, vocabulário e estrutura de posts
- Calibrar quality criteria com dados reais de engajamento
- Construir knowledge base baseada em evidências (não opinião)
- Pesquisar concorrentes ou referências de mercado

## Do NOT Use This Skill When

- Precisa apenas de métricas agregadas (use analytics da plataforma)
- O perfil é privado ou requer autenticação especial
- Precisa de scraping em massa (use Apify)

## Prerequisites

- MCP server Playwright configurado e funcionando
- Para vídeos (Reels, YouTube): `yt-dlp`, `ffmpeg`, `whisper` (opcionais)

### Verificação de Prerequisites

```bash
# Obrigatório
# Playwright MCP deve estar configurado

# Opcionais (para transcrição de vídeo)
yt-dlp --version        # pip install yt-dlp
ffmpeg -version          # brew install ffmpeg
whisper --help           # pip install openai-whisper
```

Se yt-dlp/ffmpeg/whisper não estiverem instalados, a investigação continua mas pula transcrição de vídeos. Conteúdo textual (carrosséis, tweets, posts LinkedIn) ainda é extraído normalmente.

## Investigation Modes

| Mode | Quando usar | Comportamento |
|------|------------|---------------|
| `single_post` | URL de um post específico | Analisa apenas aquele post |
| `profile_1` | Scan rápido | 1 post mais recente |
| `profile_5_10` | Análise de padrões (default) | 5-10 posts recentes |

## Plataformas Suportadas

### Instagram

**URLs**: `instagram.com/{username}`, `instagram.com/p/{id}`, `instagram.com/reel/{id}`

**Extração de Grid:**
1. `browser_navigate` para o perfil
2. `browser_snapshot` para ler o grid
3. Identificar tipo de cada post (carrossel, reel, imagem) pelos ícones
4. Clicar em cada post, extrair caption, slides, métricas
5. Para Reels: download de áudio via yt-dlp + transcrição via whisper

**Extração de Carrossel:**
1. Clicar no post no grid
2. `browser_snapshot` para caption e métricas
3. Ler texto de cada slide
4. Navegar entre slides via botão de seta
5. Repetir até último slide
6. Fechar modal com Escape

**Extração de Reel:**
1. Clicar no reel no grid
2. `browser_snapshot` para caption, métricas, views
3. Download áudio: `yt-dlp -x --audio-format wav -o "path/reel-{id}.%(ext)s" "URL"`
4. Transcrever: `whisper "path/reel-{id}.wav" --model small --output_dir "path/" --output_format txt`
5. Se falhar, continuar com caption only

### YouTube

**URLs**: `youtube.com/@{handle}`, `youtube.com/watch?v={id}`

**Extração:**
1. Navegar para `/videos` do canal
2. Identificar vídeos (título, views, data)
3. Clicar em cada vídeo, expandir descrição
4. Transcrição: legendas (yt-dlp --write-auto-sub) ou áudio+whisper como fallback

### Twitter/X

**URLs**: `x.com/{username}`, `twitter.com/{username}`

**Extração:**
1. Navegar para o perfil
2. `browser_snapshot` para ler timeline
3. Identificar tweets standalone e threads
4. Para tweets truncados: clicar para expandir
5. Threads: clicar no primeiro tweet, scroll para capturar todos

### LinkedIn

**URLs**: `linkedin.com/in/{username}`

**Extração:**
1. Navegar para `/recent-activity/all/`
2. Expandir posts truncados ("...see more")
3. Extrair texto completo, métricas, data
4. Artigos: clicar para abrir, scroll para capturar completo

## Output: 3 Arquivos

### 1. `raw-content.md` (por perfil)

Conteúdo bruto extraído, sem edição. Para cada post:
- Tipo e classificação (Carousel: 8 slides | Educational)
- Data e métricas (likes, comments, saves, views)
- URL original
- Caption completa (texto exato, sem editar)
- Conteúdo de cada slide/tweet/vídeo
- Transcrição (se vídeo)

### 2. `pattern-analysis.md` (por perfil)

Análise de padrões encontrados:
- **Content Mix**: tabela com tipos, contagem, percentual, engajamento médio
- **Structural Patterns**: estruturas de carrossel, duração de reels, comprimento de captions
- **Hook Patterns**: top 5 hooks mais efetivos com nome do padrão
- **CTA Patterns**: top 3 CTAs por frequência
- **Vocabulary Signature**: palavras/frases recorrentes que formam a voz do criador
- **Engagement Drivers**: padrões que correlacionam com alto engajamento
- **Underperforming Content**: padrões em posts abaixo da média
- **Recommendations**: 5 recomendações específicas e acionáveis

### 3. `consolidated-analysis.md` (cross-profile)

Síntese entre todos os perfis analisados:
- **Universal Patterns**: padrões que aparecem em TODOS os perfis
- **Profile Differentiators**: o que torna cada perfil único
- **Recommended Framework**: template de estrutura, voz, hooks e CTAs sintetizados
- **Hook Templates**: 5 templates de hook mais efetivos abstraídos para reuso
- **CTA Templates**: 3 templates de CTA mais efetivos
- **Anti-Patterns**: padrões ausentes no conteúdo de sucesso

## Browser Profile

Usa sessão persistente para preservar logins entre investigações.

- Primeira vez: pode encontrar login wall. Informar o usuário para logar manualmente
- Sessões subsequentes: cookies preservados automaticamente
- Sempre verificar login walls (plataformas podem expirar sessões)

## Timeout e Error Handling

- Máximo 10 minutos por perfil
- Se exceder, salvar o que foi coletado e informar
- Se plataforma bloquear, retry uma vez. Se falhar, pular perfil
- Sempre produzir arquivos de output mesmo em falha parcial (dados parciais > nenhum dado)

## Configuração por Tipo de Squad

| Tipo de Squad | Instagram | Twitter/X | LinkedIn | YouTube |
|--------------|-----------|-----------|----------|---------|
| Content/Copy | Carrosséis + Reels | Threads only | Long-form | Recent |
| Video | Reels only | Skip | Skip | Recent |
| Strategy | All types, deep dive | All | All | Mix |
| General | Standard, all types | Tweets + Threads | Posts + Articles | Recent |

## Como Usar os Outputs

| Output da Investigação | Usar para | Arquivo destino |
|----------------------|-----------|----------------|
| Conteúdo de alto engajamento | Output examples dos agentes | `data/output-examples.md` |
| Anti-patterns | Regras "never do" | `data/anti-patterns.md` |
| Métricas de engajamento | Calibrar quality criteria | `data/quality-criteria.md` |
| Framework recomendado | Operational framework | `data/domain-framework.md` |
| Vocabulary signature | Voice guidance | `data/tone-of-voice.md` |

**Regra de prioridade**: Dados da investigação (first-party, real) > dados de web research (third-party, agregados).
