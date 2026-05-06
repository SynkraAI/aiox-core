# Marketing Growth System Squad

**Version:** 1.0.0 | **Command:** `/mkt` | **Created:** 2026-02-05 | **License:** MIT

Sistema completo de marketing: conteudo + landing pages + funis. Integra com Copy Squad para copywriting de elite. Foco em Instagram + LinkedIn.

---

## Quick Start

```bash
# Pre-requisito: Copy Squad instalado em ../copy/
# Pre-requisito: AIOS v4.0.0+

# Criar landing page completa (prioridade 1)
/mkt-landing-page

# Conteudo diario
/mkt-daily-content

# Planejamento semanal
/mkt-weekly-plan

# Funil de lancamento
/mkt-launch-funnel

# Configurar voice clone
/mkt-setup-voice
```

---

## Arquitetura (9 Agentes em 5 Tiers)

```
TIER 1: ESTRATEGIA
  @growth-cmo (Coordenador) + @content-strategist

TIER 2: PRODUCAO
  @lead-copywriter (Bridge p/ Copy Squad) + @content-producer

TIER 3: DESIGN
  @visual-designer + @landing-page-architect

TIER 4: DADOS
  @data-analyst + @conversion-optimizer

TIER 5: DISTRIBUICAO
  @distribution-manager
```

### Fluxo Hierarquico

```
@growth-cmo
  |-- define estrategia e briefing
  |-- delega para agente especializado
  |-- revisa output
  |-- aprova ou solicita ajustes
  v
@content-strategist --> gera ideias/calendario
@lead-copywriter ----> bridge p/ Copy Squad (../copy/)
@content-producer ---> escreve posts IG/LI
@visual-designer ----> cria artes e design system
@lp-architect -------> estrutura landing pages
@data-analyst -------> analisa metricas
@conversion-optimizer > otimiza conversao (CRO)
@distribution-manager > publica (com aprovacao humana)
```

---

## Integracao com Copy Squad

O @lead-copywriter funciona como bridge entre os squads:

```
Marketing Growth Squad              Copy Squad (../copy/)
+-----------------------+           +------------------------+
|  @growth-cmo          |           |  @copy-chief           |
|  v delega             |           |  v orquestra           |
|  @lead-copywriter ----+-- bridge ->  @eugene-schwartz      |
|  (seleciona expert)   |           |  @gary-halbert         |
|                       |           |  @gary-bencivenga      |
|  @content-producer  <-+-- copy ---|  @david-ogilvy         |
|  (adapta p/ post)     |           |  @dan-kennedy          |
|                       |           |  @todd-brown           |
|  @lp-architect      <-+-- copy ---|  @jon-benson           |
|  (monta LP)           |           |  @joe-sugarman         |
+-----------------------+           +------------------------+
```

O lead-copywriter NAO duplica copywriters. Ele:

1. Recebe briefing do CMO
2. Analisa tipo de projeto + awareness + sofisticacao
3. Delega para Copy Squad (recomenda expert ideal)
4. Recebe copy pronta
5. Passa para content-producer (posts) ou lp-architect (LPs)

---

## Comandos Disponiveis

### Conteudo

| Comando                 | Descricao                           |
| ----------------------- | ----------------------------------- |
| `/mkt-daily-content`    | Conteudo do dia (IG + LI)           |
| `/mkt-weekly-plan`      | Planejamento semanal                |
| `/mkt-carousel`         | Carrossel Instagram (7-10 slides)   |
| `/mkt-reel`             | Script de Reel                      |
| `/mkt-linkedin-post`    | Post LinkedIn thought leadership    |
| `/mkt-linkedin-article` | Artigo LinkedIn (800-2000 palavras) |
| `/mkt-content-calendar` | Calendario editorial mensal         |

### Landing Pages

| Comando             | Descricao                               |
| ------------------- | --------------------------------------- |
| `/mkt-landing-page` | LP completa (long-form, alta conversao) |
| `/mkt-lead-magnet`  | LP curta (captura de leads)             |
| `/mkt-audit-lp`     | Auditoria de LP existente               |
| `/mkt-ab-test-lp`   | Criar variantes A/B                     |

### Funil & Email

| Comando              | Descricao                                     |
| -------------------- | --------------------------------------------- |
| `/mkt-launch-funnel` | Funil de lancamento completo (LP + 19 emails) |
| `/mkt-email-nurture` | Sequencia de nutricao (5-10 emails)           |

### Analise & Otimizacao

| Comando                | Descricao                      |
| ---------------------- | ------------------------------ |
| `/mkt-metrics`         | Relatorio semanal de metricas  |
| `/mkt-audit-content`   | Auditoria de performance       |
| `/mkt-optimize`        | Otimizacao CRO                 |
| `/mkt-campaign-report` | Relatorio completo de campanha |

### Setup

| Comando            | Descricao                      |
| ------------------ | ------------------------------ |
| `/mkt-setup-voice` | Configurar voice clone pessoal |
| `/mkt-scan-design` | Extrair design system de URL   |
| `/mkt-help`        | Ver todos os comandos          |
| `/mkt-team`        | Ver time completo              |

---

## Workflows (5)

### 1. Landing Page Full (PRIORIDADE)

Cria LP completa com copy + design + HTML/CSS responsivo.

```
Trigger: /mkt-landing-page "descricao do produto"

1. @growth-cmo --> briefing estrategico
2. @lead-copywriter --> bridge p/ Copy Squad (diagnostico + copy)
3. @lp-architect --> wireframe + PRD + HTML/CSS
4. @visual-designer --> design tokens
5. @conversion-optimizer --> auditoria CRO
6. [Quality Gate] --> checklists
7. [Human Approval] --> Go/No-Go
8. Output: HTML/CSS + PRD + A/B plan
```

### 2. Daily Content Creation

Conteudo diario automatizado para IG + LI.

```
1. @content-strategist --> 3 angulos
2. @growth-cmo --> aprova
3. @lead-copywriter --> delega copy
4. @content-producer --> formata p/ plataforma
5. @visual-designer --> arte
6. [Quality Gate] --> checklist
7. [Human Approval] --> Go/No-Go
8. @distribution-manager --> agenda
```

### 3. Weekly Content Planning

Planejamento semanal (segunda-feira).

```
1. @data-analyst --> analisa semana anterior
2. @content-strategist --> pesquisa trends
3. @growth-cmo --> define temas
4. Output: calendario 7 dias x 2 plataformas
```

### 4. Voice Clone Setup

Configuracao de clone de voz pessoal.

```
1. Coletar 5-10 textos do usuario
2. Analisar padroes de escrita
3. Criar voice-guide.md + writing-style.md
4. Testar com 3 textos-amostra
5. [Human Validation] --> soa como voce?
6. Ativar clone no config.yaml
```

### 5. Launch Funnel Complete

Funil de lancamento 360 graus.

```
Fase 1: Diagnostico (CMO + Analyst)
Fase 2: Copy (19 emails + LP via Copy Squad)
Fase 3: Assets visuais + paginas
Fase 4: Validacao CRO + quality gates
Fase 5: Deploy + automacao
Output: LP + 19 emails + assets + timeline
```

---

## Human-in-the-Loop

O squad NUNCA publica automaticamente. Gates obrigatorios:

| Gate                   | Quando                     | O que revisar                         |
| ---------------------- | -------------------------- | ------------------------------------- |
| before_publication     | Antes de publicar em IG/LI | Copy, visual, CTA, timing             |
| landing_page_launch    | Antes de lancar LP         | Copy, responsividade, links, tracking |
| launch_funnel_deploy   | Antes de ativar funil      | LP + emails + automacao + budget      |
| voice_clone_validation | Apos setup do clone        | Amostras soam como voce?              |

---

## Setup

### 1. Pre-requisitos

- AIOS v4.0.0+ instalado
- Copy Squad em ../copy/
- Node.js v18+

### 2. Configurar Plataformas (Opcional)

Editar config.yaml para ativar APIs de Instagram e LinkedIn.
Sem API: o squad gera conteudo pronto para publicacao manual.

### 3. Voice Clone (Recomendado)

```bash
/mkt-setup-voice
# Forneca 5-10 textos seus
# Valide as amostras geradas
```

### 4. Brand Guide

Preencher `data/brand/brand-guide.md` com suas cores, fontes e tom de voz.
Ou usar `/mkt-scan-design` para extrair de site existente.

---

## Custos Estimados

| Item                               | Custo Mensal         |
| ---------------------------------- | -------------------- |
| Claude (Sonnet 4.5 - uso intenso)  | R$ 200-800           |
| Geracao de imagens (Gemini/DALL-E) | R$ 150-300           |
| APIs Instagram/LinkedIn            | R$ 0 (gratis)        |
| **Total**                          | **R$ 350-1.100/mes** |

### ROI Comparado

| Alternativa           | Custo Mensal     |
| --------------------- | ---------------- |
| Social Media Jr.      | R$ 2.500         |
| Copywriter Jr.        | R$ 3.000         |
| Designer Jr.          | R$ 2.500         |
| **Total substituido** | **R$ 8.000/mes** |
| **ROI**               | **7-23x**        |

---

## Estrutura de Arquivos

```
marketing-growth/
+-- config.yaml              # Squad manifest
+-- README.md                # Este arquivo
+-- agents/ (9)              # Agentes especializados
+-- tasks/ (20)              # Tasks automatizadas
+-- workflows/ (5)           # Workflows YAML
+-- checklists/ (8)          # Quality gates
+-- templates/ (10)          # Templates reutilizaveis
+-- data/                    # Knowledge base
|   +-- brand/               # Guia de marca
|   +-- audience/            # ICP e jornada
|   +-- frameworks/          # Frameworks de copy/storytelling/CRO
|   +-- platforms/            # Specs Instagram/LinkedIn
|   +-- voice-clone/         # Clone de voz (apos setup)
+-- scripts/integrations/    # Guias de integracao API
```

---

**Dependency:** Copy Squad (../copy/)
**Ultima atualizacao:** 2026-02-05
