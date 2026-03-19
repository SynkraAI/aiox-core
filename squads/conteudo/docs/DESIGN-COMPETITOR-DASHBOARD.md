# DESIGN: Competitor Intelligence Dashboard (Full)

**Status:** EM DESENVOLVIMENTO
**Versão:** Full
**Data:** 2026-03-08
**Porta:** 3050

## Visão Geral
Dashboard de inteligência competitiva que automatiza:
Analisar próprio perfil → Descobrir concorrentes → Coletar dados → Gerar insights → Sugerir conteúdo

## Features

### MVP (Fase 1-2)
- Meu Perfil (análise do próprio Instagram)
- Mapa de Concorrentes (CRUD, 5 BR + 5 US)
- Feed de Conteúdo (timeline de posts coletados)
- Análise de Post (hook, estrutura, CTA, framework)
- Sugestões com rastreabilidade de origem
- Scraping manual (Apify)

### v1.1 (Fase 3)
- Hook Lab (banco filtrado por tipo, engagement)
- Gap Analysis (visualização de gaps)
- Digest Semanal (relatório automático)
- Transcrição de Vídeos (Whisper)
- Comparação de Métricas
- Scraping Agendado (cron semanal)

### v2.0 (Fase 4-5)
- Alertas de post viral
- Auto-generate (sugestão → conteúdo pronto)
- Discovery Mode (novos concorrentes automático)
- YouTube Intelligence
- Benchmark Report mensal

## Stack
- Next.js 15 (App Router)
- Tailwind + shadcn/ui
- SQLite (Turso/LibSQL) + Drizzle ORM
- Apify API
- Whisper API (OpenAI)
- Claude API
- Porta: 3050

## Data Model

### competitors
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | TEXT PK | UUID |
| handle | TEXT | @ do Instagram |
| platform | TEXT | instagram (default) |
| market | TEXT | BR ou US |
| niche | TEXT | Nicho de atuação |
| followers_count | INTEGER | Seguidores |
| posts_count | INTEGER | Total de posts |
| biography | TEXT | Bio do perfil |
| posting_frequency | TEXT | Frequência de postagem |
| primary_format | TEXT | Formato principal |
| tone | TEXT | Tom de comunicação |
| offer | TEXT | Oferta principal |
| relevance_score | INTEGER | Score de relevância |
| relevance_reason | TEXT | Motivo da relevância |
| status | TEXT | active/inactive |
| last_scraped_at | TEXT | Último scraping |
| created_at | TEXT | Data de criação |

### posts
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | TEXT PK | UUID |
| competitor_id | TEXT FK | Ref competitors |
| post_url | TEXT | URL do post |
| post_type | TEXT | carrossel, reel, imagem, story |
| caption | TEXT | Legenda completa |
| likes_count | INTEGER | Curtidas |
| comments_count | INTEGER | Comentários |
| saves_count | INTEGER | Salvamentos |
| shares_count | INTEGER | Compartilhamentos |
| views_count | INTEGER | Visualizações |
| engagement_rate | REAL | Taxa de engajamento |
| posted_at | TEXT | Data de publicação |
| hook_text | TEXT | Texto do hook |
| hook_type | TEXT | Tipo do hook |
| post_narrative_type | TEXT | Tipo narrativo |
| copy_framework | TEXT | Framework de copy |
| cta_text | TEXT | Texto do CTA |
| tone | TEXT | Tom do post |
| slides_count | INTEGER | Nº de slides |
| analysis_status | TEXT | pending/analyzed |
| created_at | TEXT | Data de criação |

### transcriptions
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | TEXT PK | UUID |
| post_id | TEXT FK | Ref posts |
| full_text | TEXT | Transcrição completa |
| hook_text | TEXT | Parte do hook |
| retention_text | TEXT | Parte de retenção |
| content_text | TEXT | Parte de conteúdo |
| cta_text | TEXT | Parte do CTA |
| framework_used | TEXT | Framework detectado |
| tone | TEXT | Tom detectado |
| trigger_words | TEXT (JSON) | Palavras-gatilho |
| viral_pattern | TEXT | Padrão viral |
| duration_seconds | INTEGER | Duração em segundos |
| language | TEXT | Idioma |
| created_at | TEXT | Data de criação |

### analyses
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | TEXT PK | UUID |
| analysis_type | TEXT | Tipo de análise |
| competitor_id | TEXT | ID do concorrente |
| hook_patterns | TEXT (JSON) | Padrões de hook |
| structure_patterns | TEXT (JSON) | Padrões de estrutura |
| cta_patterns | TEXT (JSON) | Padrões de CTA |
| gaps | TEXT (JSON) | Gaps identificados |
| opportunities | TEXT (JSON) | Oportunidades |
| avg_engagement_rate | REAL | Engajamento médio |
| full_report | TEXT | Relatório completo |
| posts_analyzed | INTEGER | Posts analisados |
| created_at | TEXT | Data de criação |

### suggestions
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | TEXT PK | UUID |
| analysis_id | TEXT FK | Ref analyses |
| theme | TEXT | Tema sugerido |
| narrative_type | TEXT | Tipo narrativo |
| copy_framework | TEXT | Framework de copy |
| hook_suggestion | TEXT | Sugestão de hook |
| format | TEXT | Formato sugerido |
| brief | TEXT | Brief completo |
| source_type | TEXT | Tipo da fonte |
| source_competitor_id | TEXT | Concorrente fonte |
| source_post_id | TEXT | Post fonte |
| source_principle | TEXT | Princípio fonte |
| source_description | TEXT | Descrição da fonte |
| status | TEXT | pending/approved/rejected |
| priority | INTEGER | Prioridade (1-10) |
| created_at | TEXT | Data de criação |

### digests
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | TEXT PK | UUID |
| period_type | TEXT | weekly/monthly |
| period_start | TEXT | Início do período |
| period_end | TEXT | Fim do período |
| summary | TEXT | Resumo |
| top_posts | TEXT (JSON) | Top posts |
| trending_hooks | TEXT (JSON) | Hooks em tendência |
| new_gaps | TEXT (JSON) | Novos gaps |
| suggestions_count | INTEGER | Nº de sugestões |
| full_report | TEXT | Relatório completo |
| created_at | TEXT | Data de criação |

## Fases de Implementação
| Fase | Escopo |
|------|--------|
| 1 | Setup + DB + Tela "Meu Perfil" |
| 2 | Mapa de Concorrentes + Scraping + Feed |
| 3 | Análise + Classificação + Transcrição |
| 4 | Sugestões + Rastreabilidade + Squad Integration |
| 5 | Hook Lab + Scraping Agendado + Digest + Alertas + YouTube |

## Custos Estimados
~$30-50/mês (Apify + Whisper + Claude API + Vercel)
