# Workflow: Carousel Creation

## Metadata
- id: carousel-creation
- version: 1.0.0
- type: multi-agent
- estimated_time: 1-2 hours
- agents_involved: [@alex-hormozi, @nicolas-cole, @vanessa-lau]

---

## ENFORCEMENT RULES

**REGRA ABSOLUTA: Este workflow tem 5 fases sequenciais + sub-workflows. Cada fase tem um GATE de saída. Se o GATE falhar, PARE. NÃO pule fases. NÃO avance sem completar TODOS os items do GATE.**

**Se você está lendo este workflow, siga estas regras:**
1. Execute as fases na ORDEM (1 → 2 → 2.5 → 3 → 3.5 → 4)
2. Ao final de cada fase, preencha o GATE Block correspondente
3. Se qualquer item do GATE for NÃO, PARE e corrija
4. Escreva "GATE-PASS: carousel-creation [fase] [data]" antes de avançar

---

## Purpose
Create a high-converting Instagram carousel — from hook strategy through final copy — aligned with "Clareza em meio ao caos" positioning and optimized for saves and shares.

## Inputs
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| topic | string | yes | Core topic for the carousel |
| target_audience_pain | string | yes | Specific pain point to address (e.g., "overwhelmed by too many priorities") |
| cta_goal | string | yes | Desired action: dm, link_click, save, share, follow, next_step |
| slide_count | integer | no | Number of slides (default: 8-10 including hook and CTA) |
| proof | string | no | Client result or data point to include |
| tone_override | string | no | Tone adjustment if needed (default: direto, sem verniz, pratico) |

## Phases

### Phase 1: HOOK STRATEGY + DATA RESEARCH
- **Agent**: @alex-hormozi
- **Framework**: Hook-Retain-Reward
- **Inputs**: topic, target_audience_pain, cta_goal
- **Steps**:
  1. Identify the core transformation: from [pain state] to [desired state]
  2. **PESQUISA DE DADOS (SEMPRE obrigatória — sem exceção)**:
     a. Verificar dados INTERNOS disponíveis: `data/icp-research.md` Seção 6.3 (banco aprovado), métricas de produtos/serviços
     b. Pesquisar dados EXTERNOS: fontes confiáveis (IBGE, ISMA-BR, pesquisas acadêmicas, relatórios de mercado)
     c. Usar ferramentas: EXA (web search), WebSearch, WebFetch para verificar/encontrar dados
     d. Compilar lista de dados verificados: `{dado, fonte, URL, ano}`
     e. Se tema não requer dados quantitativos: registrar `dados_verificados: N/A — tema não requer dados`
     f. **REGRA ABSOLUTA: Se não encontrar dados reais para um stat hook → usar outro tipo de hook. NUNCA inventar dados.**
     g. Dados de pesquisas com mais de 3 anos devem ser flaggeados como "verificar atualização"
     h. **VETO: Hook strategy sem campo dados_verificados (preenchido OU N/A) = GATE-FAIL automático**
  3. Generate 5 hook options using Hormozi's 6 hook types:
     - Question hook: "Voce trabalha o dia inteiro e sente que nao fez nada?"
     - Contrarian hook: "O problema nao e falta de foco. E excesso de input."
     - Story hook: "Ele faturava 50k/mes e nao conseguia decidir o proximo passo."
     - Stat hook: "32% dos brasileiros sofrem de burnout. Brasil é o 2º país do mundo. (ISMA-BR)"
     - Challenge hook: "Se voce nao consegue explicar sua direcao em 1 frase, leia isso."
     - List hook: "5 sinais de que obesidade mental esta travando sua carreira"
     **IMPORTANTE**: Stat hooks DEVEM usar dados do banco aprovado OU da pesquisa realizada no step 2. NUNCA inventar dados.
  4. Score each hook on curiosity gap (1-10) and positioning alignment (1-10)
  5. Select best hook and define the retention strategy (what keeps them swiping)
  6. Define the reward: what insight do they get that makes them save/share?
- **Outputs**: selected_hook, hook_alternatives[], retention_strategy, reward_definition, dados_verificados[]
- **Checkpoint**: Selected hook must score 8+/10 on curiosity gap AND connect to "obesidade mental" thesis
- **Checkpoint**: Se copy contém dados/estatísticas → TODOS devem ter fonte verificável
- **Estimated Time**: 25 min

---
### GATE-1: Hook Strategy Definida
**OBRIGATÓRIO antes de avançar para Phase 2**

- [ ] Hook selecionado com score 8+/10 no curiosity gap
- [ ] Hook conecta com a tese "obesidade mental"
- [ ] Retention strategy definida (o que mantém swipando)
- [ ] Reward definition clara (insight que gera save/share)
- [ ] **Se copy usa dados/estatísticas**: todos verificados com fonte + URL + ano
- [ ] **Nenhum dado inventado** — se não achou dado real, ângulo foi adaptado

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: gere novos hooks ou refine o selecionado. NÃO avance para Copy.
---

### Phase 2: COPY
- **Agent**: @nicolas-cole
- **Framework**: Headline Engineering + Rate of Revelation
- **Inputs**: selected_hook, retention_strategy, reward_definition, topic, proof
- **Steps**:
  1. Write hook slide (Slide 1): headline only, maximum 8 words, high contrast
  2. Write setup slides (Slides 2-3): establish the problem, create empathy
     - Use Rate of Revelation: reveal just enough to keep them swiping
     - Each slide = one idea, one sentence, one punch
  3. Write content slides (Slides 4-7): deliver the insight/framework
     - Apply Headline Engineering: every slide headline must work standalone
     - Use specificity over vagueness ("3 decisoes" not "algumas coisas")
     - Integrate proof naturally if available
  4. Write CTA slide (final): clear next step aligned with cta_goal
     - For next_step: "Quer clareza real? Link na bio — Next Step"
     - For save: "Salva pra reler quando a cabeca travar de novo"
     - For share: "Manda pra quem precisa ouvir isso"
  5. Write caption: 3-5 lines reinforcing the carousel message + relevant hashtags
- **Outputs**: slide_copy[] (headline + body per slide), caption, hashtags[]
- **Checkpoint**: Each slide headline must be readable in 2 seconds; body in 5 seconds
- **Estimated Time**: 40 min

---
### GATE-2: Copy Completa
**OBRIGATÓRIO antes de avançar para Phase 3**

- [ ] Cada slide legível em 5 segundos (body) e headline em 2 segundos
- [ ] CTA slide alinhado com cta_goal
- [ ] Caption escrita com hashtags relevantes
- [ ] Headline de cada slide funciona standalone

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: revise a copy dos slides. NÃO avance para Humanização.
---

### Phase 2.5: HUMANIZAÇÃO DA COPY (10 min)
- **Agent**: QA linguístico (qualquer agente com referência ao guia)
- **Reference obrigatória**: `docs/research/2026-02-12-escrita-instagram/CHEATSHEET.md`
- **Inputs**: slide_copy[] da Phase 2
- **Steps**:
  1. **Audit AI Tells** (3 min):
     - Buscar e eliminar em dashes (—). Máximo 1 por carrossel inteiro. Substituir por: vírgula, dois pontos, quebra de linha, ou ponto final
     - Buscar vocabulário corporativo vazio (lista de 30 palavras proibidas no CHEATSHEET)
     - Buscar estruturas "não X — Y" (clássico de IA)
     - Buscar conectores mecânicos (Moreover, Furthermore, In conclusion, etc.)
     - Buscar sentenças uniformes (todas 15-20 palavras = morte)
  2. **Injetar Burstiness** (3 min):
     - Variar comprimento das frases: 1-40 palavras por sentença
     - Frases de 1-2 palavras para impacto dramático
     - Quebras de linha estratégicas para ritmo emocional
     - Mix: frases curtas (punch) + médias (contexto) + longas (fluxo)
  3. **Adicionar Voz Humana** (2 min):
     - 2-3 perguntas retóricas no carrossel (engajam mentalmente)
     - Linguagem coloquial BR natural: tá, pra, né (sem forçar gíria)
     - Substituir dados técnicos por linguagem acessível (ex: "confusão 5.4 de 10" → "10 coisas pra fazer, todas parecem urgentes")
     - CTA emocional: substituir instrução direta por conexão (não "salve/clique/compartilhe", mas escolha/história/sensação)
  4. **Teste de Voz Alta** (2 min):
     - Ler cada slide em voz alta
     - Soa como conversa com amigo? → ✅ Approved
     - Soa como palestra ou manual? → ❌ Reescrever
     - Soa roboticamente ritmado? → ❌ Adicionar variação
- **Outputs**: slide_copy_humanized[] (copy limpa e humanizada)
- **Checkpoint**: Zero AI tells detectados; burstiness alta; CTA emocional
- **Estimated Time**: 10 min

---
### GATE-2.5: Copy Humanizada
**OBRIGATÓRIO antes de avançar para Phase 3**

- [ ] Zero em dashes excessivos (máximo 1 no carrossel inteiro)
- [ ] Zero vocabulário corporativo vazio (lista de 30 palavras)
- [ ] Alta burstiness (frases variam 1-40 palavras)
- [ ] Pelo menos 2 perguntas retóricas
- [ ] CTA usa emoção/escolha/curiosidade (não instrução direta)
- [ ] Teste de voz alta: soa como conversa, não palestra
- [ ] Dados técnicos traduzidos para linguagem acessível

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/7
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: reescreva os slides que falharam. NÃO avance para Format.
---

### Phase 3: FORMAT + ART DIRECTION
- **Agent**: @vanessa-lau
- **Framework**: 9 Content Pillars + ANC Funnel
- **Inputs**: slide_copy[], caption, cta_goal
- **Reference obrigatória**: `data/visual-rules.md` (regras visuais baseadas em neurociência)
- **Steps**:
  1. Map carousel to Content Pillar: Educational, Inspirational, Personal Story, Authority, Community, Behind-the-Scenes, Promotional, Trending, Controversial
  2. Map to ANC Funnel stage:
     - Attract: hook optimized for explore/shares
     - Nurture: content builds trust and credibility
     - Convert: CTA drives specific action
  3. Define visual specs (SEGUINDO `data/visual-rules.md`):
     - Slide dimensions: 1080x1350px (4:5 ratio)
     - Font hierarchy: headline (bold, large), body (regular, readable)
     - Color scheme: paleta validada (navy/branco + accent gold #C9A84C)
     - Max words per slide: headline 8, body 25
     - **7 Princípios**: cor dominante única, alta luminosidade, baixa saturação, background amplo, textura/grain, texto no 1o segundo, alternância claro/escuro
  4. Add formatting notes: text placement, whitespace, emphasis markers
  5. Suggest posting time and companion stories sequence
  6. **Art direction da capa** → **Executar sub-workflow `workflows/cover-art-direction.md`**
     - **OBRIGATÓRIO**: NÃO fazer art direction inline. Executar o pipeline completo de 5 steps + GATE.
     - Inputs para o sub-workflow: `slide_copy_hook` (headline do slide 1), `topic`, `content_pillar`, `cta_goal`
     - O sub-workflow gerencia: seleção de tipo, debate visual, critic, tipografia, consolidação
     - Só retornar para Phase 3.5 após GATE-PASS do sub-workflow
     - **VETO: Art direction feita sem executar cover-art-direction.md = processo incompleto**
- **Outputs**: format_specs, visual_guidelines, posting_recommendation, stories_sequence, cover_art_direction (do sub-workflow)
- **Checkpoint**: All slides respect word limits; visual specs match brand identity AND visual-rules.md
- **Estimated Time**: 25 min

---
### GATE-3: Formatação + Art Direction Completa
**OBRIGATÓRIO antes de avançar para Phase 4**

- [ ] Specs visuais definem dimensões, cores e fontes
- [ ] Word limits respeitados (headline max 8, body max 25)
- [ ] Posting time e companion stories definidos
- [ ] Visual specs compatíveis com brand identity E `data/visual-rules.md`
- [ ] Se capa com imagem: sub-workflow `cover-art-direction.md` executado com GATE-PASS

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: ajuste os specs visuais. NÃO avance para QA.
---

### Phase 3.5: QA VISUAL (5 min)
- **Agent**: QA reviewer
- **Inputs**: rendered PNGs from format specs
- **Steps**:
  1. Render carousel slides via render.ts (se não renderizados na Phase 3)
  2. Executar checklist: `squads/content-engine/checklists/visual-qa.md`
  3. Executar script automatizado: `bash squads/content-engine/scripts/run-qa-gate.sh <batch.json> <output-dir>`
  4. Registrar score e report
- **Output**: visual_qa_score, visual_qa_report

---
### GATE-VISUAL: QA Visual
**OBRIGATÓRIO antes de avançar para Phase 4**

Executar: `squads/content-engine/checklists/visual-qa.md`

- [ ] Seção 1: Tokens & Consistência (5/5)
- [ ] Seção 2: Hierarquia Visual (4/4)
- [ ] Seção 3: Legibilidade (4/4)
- [ ] Seção 4: Integridade do Render (3/3)

**Score**: _/16 x 10 = _/10
**Status**: [GATE-PASS | GATE-FAIL]
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: retornar a Phase 2 (Copy) com notas visuais.
Se Seção 4 (Integridade) falha: BLOQUEANTE independente do score.
NÃO avance para QA geral.

**Escalação visual**: 2 falhas GATE-VISUAL consecutivas = escalar para humano.
---

### Phase 4: QA
- **Agent**: All agents (review round)
- **Framework**: Quality Scorecard
- **Inputs**: All outputs from Phases 1-3
- **Steps**:
  1. Positioning check: Does every slide reinforce "Clareza em meio ao caos"?
  2. Hook strength: Would the target audience stop scrolling? (score 1-10)
  3. Retention: Is there a reason to swipe to the next slide? (score per transition)
  4. Reward: Does the audience feel smarter/clearer after reading? (score 1-10)
  5. CTA clarity: Is the next step obvious and frictionless? (score 1-10)
  6. Tone check: direto, sem verniz, pratico — no fluff, no jargon
  7. Calculate composite quality_score (weighted average)
- **Outputs**: quality_scorecard, quality_score, revision_notes (if score < 7)
- **Checkpoint**: quality_score must be 7+/10; if below, return to Phase 2 with revision_notes
- **Estimated Time**: 15 min

---
### GATE-4: QA Aprovado
**GATE FINAL — determina se carousel está aprovado**

- [ ] quality_score 7+/10 (composite)
- [ ] Tom direto, sem verniz — zero fluff
- [ ] Posicionamento alinhado com "Clareza em meio ao caos"
- [ ] Se score < 7: retornar a Phase 2 com revision_notes

**Status**: [GATE-PASS | GATE-FAIL]
**Score**: _/4
**Data**: YYYY-MM-DD HH:MM

Se GATE-FAIL: retorne a Phase 2 com revision_notes. NÃO publique.
GATE-PASS: escreva "GATE-PASS: carousel-creation QA [data]"
---

## Outputs
| Deliverable | Format | Description |
|-------------|--------|-------------|
| slide_copy | markdown[] | Headline + body for each slide (hook through CTA) |
| caption | string | Instagram caption with hashtags |
| format_specs | object | Visual guidelines, dimensions, fonts, colors |
| hook_alternatives | markdown[] | 4 backup hooks for A/B testing |
| quality_scorecard | object | Detailed scoring across 6 criteria |
| quality_score | float | Composite score (must be 7+/10) |
| posting_recommendation | object | Best time, day, companion stories |
| stories_sequence | markdown[] | Story frames to post alongside carousel |

## Quality Gates
- [ ] All 4 phases completed in order
- [ ] Hook scores 8+/10 on curiosity gap
- [ ] Every slide readable in under 5 seconds
- [ ] CTA aligned with cta_goal input
- [ ] Positioning alignment verified against thesis
- [ ] Tone is direto, sem verniz, pratico
- [ ] Visual specs match brand identity E `data/visual-rules.md` (7 Princípios)
- [ ] GATE-VISUAL passou (score >= 8.0/10, seção 4 sem falha)
- [ ] Composite quality_score 7+/10
- [ ] If proof provided, it's integrated naturally (not forced)
