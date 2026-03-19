# 📱 Presença Digital Squad

Squad de **execução de conteúdo multi-plataforma** para presença digital contínua. Cria posts, reels, carrosseis, stories, scripts de vídeo, blog posts, newsletters e campanhas de email.

## Filosofia

**Strategy Before Content. System Before Hustle. Distribute Before Create More.**

Este squad consome os artefatos do squad `brand` (upstream) como fundação e transforma posicionamento em conteúdo consistente e multi-plataforma.

## Pipeline

```
brand (upstream)           presenca-digital              growth-ops (downstream)
═══════════════           ═══════════════════           ═══════════════════════
Brand Book ──────→  Pilares + Calendário ──────→  Publicação + Métricas
Positioning ─────→  Posts + Reels + Blog  ──────→  A/B Testing + Ads
Voice Guide ─────→  Copy + Campanhas     ──────→  Automação + Reports
Soul Canvas ─────→  Hooks + Narrativa    ──────→  Escala + Otimização
```

## Agents

| Tier | Agent | Elite Mind | Role | Framework Core |
|------|-------|-----------|------|----------------|
| 0 | `presenca-digital-chief` | — | Orquestrador | Content Routing Matrix |
| 0 | `paulo-cuenca` | 🇧🇷 Paulo Cuenca | Content Strategist | Método da Cordilheira |
| 1 | `justin-welsh` | 🇺🇸 Justin Welsh | Content System Architect | Content OS + PAIPS |
| 1 | `ross-simmonds` | 🇨🇦 Ross Simmonds | Distribution Master | DREAM Framework |
| 1 | `natanael-oliveira` | 🇧🇷 Natanael Oliveira | Campaign & Copy Engine | Copy Andromeda + 7 Gatilhos |
| 1 | `brendan-kane` | 🇺🇸 Brendan Kane | Hook Engineer | Hook Point |
| 2 | `nicolas-cole` | 🇺🇸 Nicolas Cole | Digital Writer | Atomic Essays + Ship 30 |
| 2 | `camilo-coutinho` | 🇧🇷 Camilo Coutinho | Video Scriptwriter | Roteiro Chicote + CEQCOM |
| 2 | `vanessa-lau` | 🇨🇦 Vanessa Lau | Repurposing Architect | Content Matrix |

## Quick Start

### Ativação
```
@presenca-digital          # Ativa o chief (orquestrador)
@presenca-digital:paulo-cuenca   # Ativa agente específico
```

### Comandos Principais
```
*content-from-brand   — Transformar brand guidelines em pilares de conteúdo
*weekly-batch         — Criar batch semanal de conteúdo (4h session)
*create-post {plat}   — Criar post para plataforma específica
*create-reel {topic}  — Criar script de reel/short
*create-carousel      — Criar carrossel educativo
*create-youtube       — Criar script de vídeo YouTube
*create-blog          — Criar blog post
*create-newsletter    — Criar edição de newsletter
*campaign {trigger}   — Criar campanha semanal (7 gatilhos)
*repurpose {content}  — Repurposar conteúdo para múltiplas plataformas
*calendar {period}    — Gerar calendário de conteúdo
*help                 — Mostrar todos os comandos
```

## Workflows

| Workflow | Descrição | Duração |
|----------|-----------|---------|
| `wf-content-from-brand` | Brand guidelines → pilares + calendário editorial | 2-3h |
| `wf-weekly-content-batch` | Batch semanal de criação multi-plataforma | 4h |
| `wf-video-content` | Pipeline de conteúdo em vídeo (roteiro→hook→script) | 1-2h |
| `wf-campaign-week` | Campanha semanal com gatilho + copy Andromeda | 1-2h |

## Plataformas Cobertas

| Plataforma | Formatos | Agentes Responsáveis |
|-----------|----------|---------------------|
| Instagram | Post, Reel, Story, Carousel | Cole, Kane, Coutinho, Lau |
| LinkedIn | Post, Article, Carousel, Newsletter | Welsh, Cole |
| TikTok | Video, Carousel | Coutinho, Kane, Lau |
| YouTube | Long-form, Shorts | Coutinho, Lau |
| X (Twitter) | Post, Thread | Cole, Welsh |
| Facebook | Post, Reel, Story | Simmonds (distribuição) |
| Blog | Article, SEO Post | Cole, Welsh |
| Newsletter | Email, Sequence, Campaign | Welsh, Natanael |
| WhatsApp | Broadcast, ManyChat | Natanael |

## Cadência Semanal (Default)

```yaml
weekly_output:
  posts: 12-15 (across platforms)
  reels: 3-5
  stories: daily
  blog: 1-2
  newsletter: 1
  youtube: 1
  batch_session: "4h/week (Content OS)"
```

## Upstream: Squad Brand

O squad `presenca-digital` **depende** do squad `brand` para:
- **Brand Book** → define voz, tom, visual
- **Positioning Canvas** → define diferenciação e público
- **Brand Voice Guidelines** → como escrever e como NÃO escrever
- **Brand Soul Canvas** → narrativa, enemy, tribe

Execute `*content-from-brand` para transformar esses artefatos em pilares de conteúdo.

## Estrutura de Diretórios

```
squads/presenca-digital/
├── config.yaml              — Configuração do squad
├── squad.yaml               — Manifesto (agents, workflows, tasks)
├── README.md                — Esta documentação
├── agents/                  — 9 agent definitions
├── tasks/                   — Atomic content tasks
├── workflows/               — Multi-phase content workflows
├── templates/               — Output templates by format
├── checklists/              — Quality validation
├── data/                    — Knowledge base
│   ├── platform-specs.md    — Specs técnicos por plataforma
│   ├── hook-patterns-library.md — Biblioteca de hooks
│   ├── content-formats-guide.md
│   └── presenca-digital-kb.md
└── outputs/                 — Runtime artifacts
    ├── content/
    ├── calendars/
    ├── campaigns/
    └── distribution/
```

## Quality Standards

- Todo conteúdo passa por `*coherence-check` (alinhamento com brand)
- Hooks validados contra Hook Patterns Library
- Scripts de vídeo seguem Roteiro Chicote (6 perguntas)
- Posts seguem PAIPS Formula ou Atomic Essay structure
- Distribuição segue DREAM Framework
- Campanhas usam 1 dos 7 gatilhos do Sistema de Recompensa Central

---

*Presença Digital Squad v1.0.0*
*Elite minds: 3 BR + 4 Internacional*
*"Strategy Before Content. System Before Hustle."*
