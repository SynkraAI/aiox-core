# Workflow: Story Creation (Diario)

## Metadata
- id: story-creation
- version: 1.0.0
- type: multi-agent
- estimated_time: 15-30 minutos
- frequency: diario (1x por dia)
- agents_involved: [@caleb-ralston, @vanessa-lau, @nicolas-cole, @icp-lucas]

---

## ENFORCEMENT RULES

**REGRA ABSOLUTA: Este workflow tem 4 fases sequenciais. Cada fase tem um GATE de saida.**

1. Execute as fases na ORDEM (1 → 2 → 3 → 4)
2. Ao final de cada fase, preencha o GATE Block correspondente
3. Se qualquer item do GATE for NAO, PARE e corrija
4. Escreva "GATE-PASS: story-creation [fase] [data]" antes de avancar

---

## Purpose

Gerar direcao diaria de Instagram Stories — roteiro leve (talking points + graficos prontos) — conectado ao post do dia, alinhado ao posicionamento "Clareza em meio ao caos" e otimizado para nurture + trust compounding.

## Principios Estrategicos (Caleb Ralston)

- **Stories = 60% Nurture, 25% Attract, 15% Convert** — feed ja cobre attract; stories aprofundam e humanizam
- **Document > Create** — 80% dos stories devem ser momentos reais, nao roteiros elaborados
- **Trust compounds** — consistencia visual e linguistica todo dia (mesmo ambiente, mesmas frases de abertura)
- **70% complementa post + 30% tema proprio** (por semana, nao por dia)
- **Convert max 1x/semana** — nao queimar confianca com CTA diario
- **Accordion (Expand)**: stories expandem o feed sem criar tema paralelo

## Inputs

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|-------------|-----------|
| post_do_dia | object | sim | Batch.json + legenda + tema do post publicado hoje |
| stories_ontem | file | sim | `stories-YYYY-MM-DD.json` do dia anterior (continuidade) |
| tracker_semana | file | sim | `docs/instagram/output/semana-N/tracker.md` |
| feedbacks_recentes | list | nao | DMs, depoimentos, mencoes recentes |
| material_disponivel | list | nao | BTS fotos/videos, screenshots, prints |

### Inputs automaticos (carregados pelo workflow)

| Input | Arquivo | Uso |
|-------|---------|-----|
| Posicionamento | `squads/content-engine/data/positioning.md` | Tom, tese, signature phrases |
| ICP | `squads/content-engine/data/icp-research.md` | Pain points, linguagem, comportamento |
| Design system | `docs/instagram/design-tokens.json` | Cores, fontes, tokens |
| Visual rules | `squads/content-engine/data/visual-rules.md` | Regras de composicao |

---

## 5 Tipos de Story

| Tipo | Trigger | Tag ANC | Frames | Quando |
|------|---------|---------|--------|--------|
| **Amplify Post** | Dia de carrossel | Attract/Nurture | 3-5 | 3-4x/semana |
| **Behind-the-Scenes** | Dia de reels/gravacao | Nurture | 4-5 | 1-2x/semana |
| **Edu-Nugget** | Dia de static/insight | Nurture | 3-4 | 1-2x/semana |
| **Social Proof** | Feedback/DM recebido | Convert | 2-3 | 1x/semana |
| **Direct CTA** | Sexta-feira (fixo) | Convert | 4-5 | 1x/semana |

### Regras de distribuicao semanal ANC

- **Attract**: 2 dias/semana (amplify post com hook forte)
- **Nurture**: 4 dias/semana (BTS, edu-nugget, amplify aprofundado)
- **Convert**: 1 dia/semana (sexta = Direct CTA, ou Social Proof se tiver feedback)
- Se semana teve 0 Convert ate quinta → forcar Convert na quinta

---

## Fase 1 — CONTEXTO (5 min)

**Agente**: Orchestrator (automatico)

### Steps

1. **Carregar post do dia**
   - Ler batch.json do post de hoje
   - Extrair: tema, headline, tipo (carrossel/reels/static), pilar, legenda

2. **Verificar continuidade**
   - Ler stories do dia anterior (`stories-YYYY-MM-DD.json`)
   - Se teve enquete/quiz/pergunta → marcar como `closure_pendente`
   - Se nao teve interativo → sem closure necessario

3. **Consultar tracker semanal**
   - Ler `docs/instagram/output/semana-N/tracker.md`
   - Verificar: quantos stories Attract/Nurture/Convert ja foram na semana
   - Identificar gaps no funil ANC

4. **Determinar tipo de story**
   - Baseado no post do dia + tracker + dia da semana:
     - Sexta → Direct CTA (sempre)
     - Feedback disponivel → Social Proof
     - Dia de reels + BTS disponivel → Behind-the-Scenes
     - Dia de static → Edu-Nugget
     - Default → Amplify Post

5. **Carregar ICP micro-check**
   - Tres perguntas rapidas (validacao mental, nao precisa rodar agente):
     1. O Lucas (ICP) pararia de scrollar por isso?
     2. Ele se identificaria com a situacao?
     3. Ele agiria depois?
   - Se 2/3 = SIM → prosseguir. Se nao → ajustar angulo.

### GATE-1: Contexto Carregado

- [ ] Post do dia identificado (tema, tipo, pilar)
- [ ] Continuidade verificada (closure pendente ou nao)
- [ ] Tipo de story determinado
- [ ] Tag ANC definida
- [ ] ICP micro-check aprovado (2/3 SIM)

**Status**: [GATE-PASS | GATE-FAIL]

---

## Fase 2 — ROTEIRO (10 min)

**Agente**: @nicolas-cole (copy) + @caleb-ralston (estrategia)

### Steps

1. **Definir estrutura de frames**
   - Baseado no tipo de story (ver templates abaixo)
   - Definir quantidade de frames (3-5)
   - Marcar quais sao video e quais sao grafico

2. **Escrever talking points (frames de video)**
   - 2-3 bullet points por frame de video
   - Tom: direto, casual, como se falasse com um amigo
   - NUNCA linguagem de "palco" ou motivacional generico
   - Incluir pelo menos 1 signature phrase do Tiago se couber naturalmente

3. **Escrever copy (frames graficos)**
   - Headline: max 6 palavras, impacto visual
   - Body: max 15 palavras
   - Gold accent: 1 palavra/frase em `<span class="highlight">`
   - Line-break SEMPRE apos pontuacao

4. **Definir interativo (se aplicavel)**
   - Max 1 sticker por dia
   - Tipos permitidos: enquete (2 opcoes), pergunta aberta, quiz, slider
   - Posicionar no frame 3 ou 4 (nunca no primeiro frame)
   - Pergunta deve ser simples e respondivel em 2 segundos

5. **Definir CTA**
   - Amplify Post: "Post completo no feed" ou "Salva pra reler"
   - BTS: "Reels ta no feed" ou sem CTA (so conexao)
   - Edu-Nugget: "Salva isso" ou "Manda pra quem precisa"
   - Social Proof: "Next Step, link na bio"
   - Direct CTA: "Me manda 'Next Step' no DM" ou "Link na bio"

6. **Se tem closure pendente do dia anterior**
   - Frame 1: "Ontem perguntei X. Y% responderam Z."
   - Depois segue para o story normal do dia

### Templates de Estrutura por Tipo

#### Amplify Post (3-5 frames)

```
Frame 1: Video selfie — Hook: "Acabei de postar sobre [tema]..."
Frame 2: Grafico texto — Teaser: melhor slide ou quote do post
Frame 3: Video selfie — "O que eu NAO falei no post foi..."
Frame 4: [Opcional] Interativo — Enquete relacionada ao tema
Frame 5: [Opcional] Grafico CTA — "Post completo no feed"
```

#### Behind-the-Scenes (4-5 frames)

```
Frame 1: Video selfie — "Hoje gravei/fiz [X]..."
Frame 2: Video BTS — Bastidor real (setup, erro, processo)
Frame 3: Grafico texto — Licao/insight do bastidor
Frame 4: Video selfie — Reflexao pessoal
Frame 5: [Opcional] CTA suave — "Reels ta no feed"
```

#### Edu-Nugget (3-4 frames)

```
Frame 1: Grafico titulo — Hook provocativo
Frame 2: Video selfie — Explicacao do insight
Frame 3: Grafico aplicacao — Framework/passo pratico
Frame 4: [Opcional] CTA — "Salva isso" ou Next Step
```

#### Social Proof (2-3 frames)

```
Frame 1: Screenshot — DM/feedback real (anonimizado se necessario)
Frame 2: Video reacao — "Isso e exatamente o que resolve [conceito]"
Frame 3: Grafico CTA — "Next Step, link na bio"
```

#### Direct CTA (4-5 frames)

```
Frame 1: Video abertura — "Voce ta travado ha quanto tempo?"
Frame 2: Grafico problema — Dado/estatistica sobre a dor
Frame 3: Video pitch — Next Step: o que e, como funciona
Frame 4: Grafico CTA — "Link na bio → agende agora"
Frame 5: [Opcional] Interativo — "Vai agendar?" (Sim/Talvez)
```

### GATE-2: Roteiro Aprovado

- [ ] Estrutura de frames definida (tipo + quantidade)
- [ ] Talking points escritos para frames de video (2-3 bullets cada)
- [ ] Copy escrita para frames graficos (headline + body + gold)
- [ ] Interativo posicionado corretamente (se aplicavel, frame 3 ou 4)
- [ ] CTA definido e coerente com o tipo de story
- [ ] Tom: direto, casual, sem linguagem de palco
- [ ] Closure do dia anterior incluida (se pendente)

**Status**: [GATE-PASS | GATE-FAIL]

---

## Fase 3 — RENDER (5 min)

**Agente**: Render Engine (automatico)

### Steps

1. **Gerar JSON batch para frames graficos**
   - Template: `story-frame` (1080x1920, 9:16)
   - Campos: HEADLINE, BODY, CTA, BG_COLOR, TEXT_COLOR, BODY_COLOR, MUTED_COLOR, COUNTER
   - Alternancia: frames impares fundo escuro (#14213D), pares fundo claro (#FFFFFF)
   - Gold accent via `<span class="highlight">`

2. **Renderizar PNGs**
   - Comando: `npx tsx docs/instagram/render.ts --batch stories-batch.json --parallel 2`
   - Output: `docs/instagram/output/semana-N/story-[dia]/frame-NN.png`
   - Validar: arquivo existe, tamanho > 5KB, dimensoes 1080x1920

3. **Se frame precisa de imagem AI (nao texto puro)**
   - Gerar prompt Nano Banana 3.0 com 5 blocos obrigatorios:
     - Bloco 1: Arte (composicao, estilo)
     - Bloco 2: Tecnica (camera, iluminacao)
     - Bloco 3: Ambiente (cenario, elementos)
     - Bloco 4: Texto (OBRIGATORIO — posicao, fonte, conteudo exato)
     - Bloco 5: Design (ratio 9:16, grain, paleta)
   - Output: prompt em Markdown para execucao no Nano Banana

### GATE-3: Render Completo

- [ ] PNGs gerados para todos os frames graficos
- [ ] Dimensoes corretas (1080x1920)
- [ ] Gold accent presente nos graficos
- [ ] Line-breaks apos pontuacao
- [ ] Prompt Nano Banana gerado (se aplicavel)

**Status**: [GATE-PASS | GATE-FAIL]

---

## Fase 4 — ENTREGA (5 min)

**Agente**: Orchestrator

### Steps

1. **Gerar checklist de gravacao**
   - Formato markdown com:
     - Contexto do dia (post, tema, tipo de story, tag ANC)
     - Frames de video: talking points em bullet format
     - Frames graficos: indicar que estao prontos + path
     - Ordem de publicacao
     - Timing sugerido

2. **Salvar output estruturado**
   - Arquivo: `docs/instagram/output/semana-N/story-[dia]/roteiro.md`
   - Batch: `docs/instagram/output/semana-N/story-[dia]/batch.json` (se teve graficos)
   - PNGs em: `docs/instagram/output/semana-N/story-[dia]/`

3. **Atualizar tracker**
   - Marcar story do dia como "Em producao" no tracker
   - Registrar tipo, tag ANC, quantidade de frames

4. **Apresentar ao Tiago para revisao**
   - Mostrar checklist de gravacao
   - Aguardar aprovacao (human-in-the-loop)
   - Se aprovado → Tiago grava e publica
   - Se ajuste necessario → voltar para Fase 2

### GATE-4: Entrega Completa

- [ ] Checklist de gravacao gerado
- [ ] Arquivos salvos no path canonico
- [ ] Tracker atualizado
- [ ] Tiago revisou e aprovou

**Status**: [GATE-PASS | GATE-FAIL]

---

## Output Final

| Output | Formato | Descricao |
|--------|---------|-----------|
| `roteiro.md` | markdown | Checklist de gravacao com talking points |
| `batch.json` | JSON | Batch de frames graficos (se houver) |
| `frame-NN.png` | PNG 1080x1920 | Frames graficos renderizados |
| `prompt-nano-banana.md` | markdown | Prompt para imagem AI (se houver) |
| tracker atualizado | markdown | Status do story no tracker semanal |

---

## Regras de Ouro

1. **Stories NAO sao mini-carrosseis** — sao momentos rapidos, casualidade, conexao
2. **80% video, 20% grafico** — o rosto do Tiago e o ativo principal
3. **Tom conversacional** — como se falasse com 1 pessoa, nao com uma audiencia
4. **Document > Create** — se tem material real (BTS, feedback, print), usar ao inves de criar do zero
5. **Consistencia > Intensidade** — 4 frames medianos todo dia > 10 frames incriveis 2x/semana
6. **Max 1 interativo/dia** — enquete/pergunta no frame 3 ou 4, nunca no primeiro
7. **Convert max 1x/semana** — confianca se constroi devagar, se queima rapido
8. **Closure obrigatorio** — se ontem teve enquete, hoje comeca com resultado
9. **design-tokens.json e IMUTAVEL** — nunca editar manualmente
10. **Nano Banana 3.0 gera imagem COMPLETA com texto** — Bloco 4 e OBRIGATORIO

---

## Integracao com Weekly Sprint

- Este workflow e executado **diariamente** dentro do sprint semanal
- O sprint (Fase 3) define a **direcao geral** dos stories da semana
- Este workflow **instancia** essa direcao para cada dia especifico
- Stories alimentam o tracker semanal e o review da Fase 5

---

## Auto-Correcao — Se Falhar, Faca Isso

| Falha | Correcao |
|-------|----------|
| Story sem conexao com post do dia | Releia o batch.json e extraia 1 insight/quote do post |
| Tom motivacional ou generico | Reescreva como se fosse DM para 1 pessoa. Remova "voces" por "voce" |
| Muitos frames (>5) | Corte os mais fracos. Priorize video sobre grafico |
| Interativo no frame 1 | Mova para frame 3 ou 4. Frame 1 e sempre gancho (video ou grafico) |
| Sem gold accent nos graficos | Adicione `<span class="highlight">` em 1 palavra-chave por grafico |
| Line-break cortando frase | Mova `<br>` para apos pontuacao mais proxima |
| Convert todo dia | Reduza a 1x/semana. Troque CTA por "salva" ou "manda pra alguem" |
| Closure esquecido | Adicione frame 1: "Ontem perguntei X. Y% responderam Z." |
