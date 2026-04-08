# Content Forge — Orquestrador Inteligente de Conteúdo

> Um comando. Um plano. Tudo branded.

## Trigger

Ativar quando o usuário pedir para:
- Criar conteúdo (carrossel, reel, story, vídeo, landing page)
- Planejar conteúdo da semana/mês
- Multiplicar conteúdo existente
- Produzir qualquer asset visual branded
- Comando explícito: `/produce`, `/content-forge`

## O Que Este Skill Faz

Content Forge é o **cérebro** do ecossistema de conteúdo. Ele:

1. **Apresenta** as marcas disponíveis para o usuário escolher
2. **Recebe** a demanda do usuário (texto livre)
3. **Consulta** o capability map (`data/capability-map.yaml`)
4. **Gera um plano** em plan mode com etapas numeradas, motivos e checkpoints
5. **Executa** após aprovação, delegando para cada squad/skill correto

Ele NUNCA cria conteúdo diretamente — sempre delega para o squad/skill que faz aquilo de melhor.

## Pré-requisitos

1. **Marca ativa** configurada em `data/active-brand.yaml`
   - Se não existir, perguntar qual marca usar
   - Carregar tokens via `packages/brand-schema/`
2. **Capability map** em `data/capability-map.yaml`
   - Se não existir, avisar o usuário

## Fluxo de Execução

### Fase 1: Escolher Marca (OBRIGATÓRIO — SEMPRE PRIMEIRO)

**NUNCA** assumir uma marca padrão. SEMPRE apresentar as opções com preview visual.

1. Listar todos os arquivos `.yaml` em `packages/brand-schema/brands/`
2. Ler o cabeçalho de CADA brand YAML (primeiras ~10 linhas) para extrair: `name`, `theme`, fontes (`display` + `body`), e cor primária principal
3. Ler `data/active-brand.yaml` para saber qual estava ativa por último (apenas para indicar com ★)
4. Apresentar catálogo visual com AskUserQuestion, usando este formato:

```
🎨 Qual marca vamos usar nesta produção?

┌─────────────────────────────────────────────────────────┐
│  1. Notion Clean          ☀️ light                       │
│     🔤 DM Serif Display + DM Sans                       │
│     🎨 #37352F ██  #2EAADC ██  #FAF9F7 ██              │
│     → SaaS, documentação, tools, corporate              │
├─────────────────────────────────────────────────────────┤
│  2. Emerald Noir          🌙 dark                       │
│     🔤 Plus Jakarta Sans                                │
│     🎨 #10B981 ██  #F59E0B ██  #0A0F1E ██              │
│     → consulting, finance, premium, high-ticket         │
├─────────────────────────────────────────────────────────┤
│  3. Ensinio               ☀️ light                       │
│     🔤 {display} + {body}                               │
│     🎨 {primary} ██  {accent} ██  {bg} ██              │
│     → {ideal_for do cabeçalho}                          │
├─────────────────────────────────────────────────────────┤
│  ... (todas as marcas)                                  │
├─────────────────────────────────────────────────────────┤
│  9. Vercel Noir        ★ última usada   🌙 dark         │
│     🔤 Inter + Geist                                    │
│     🎨 #000 ██  #0070F3 ██  #111 ██                    │
│     → dev tools, SaaS, tech                             │
└─────────────────────────────────────────────────────────┘

👁️ Preview visual completo: packages/brand-schema/brand-catalog.html
   (abrir no browser para ver mockups reais de cada tema)

Digite o número ou nome da marca:
```

**Como montar o preview de cada brand:**
- `name`: campo `name` do YAML
- `theme`: campo `theme` → usar ☀️ para light, 🌙 para dark
- `fontes`: `typography.family.display` + `typography.family.body` (se iguais, mostrar só uma)
- `cores`: extrair 3 cores representativas:
  - Cor primária (primeira cor `500` das primitives)
  - Cor accent (segunda família de cores `500`, ou `accent` se existir)
  - Cor de fundo (background do tema — `50` para light, `900/950` para dark)
- `ideal_for`: extrair do comentário `# Ideal for:` no topo do YAML
- `★ última usada`: marcar a que consta em `data/active-brand.yaml`

5. Após escolha do usuário:
   - Carregar brand completa via `packages/brand-schema/` → ter todos os tokens disponíveis
   - Atualizar `data/active-brand.yaml` com a marca escolhida
   - Confirmar: "Marca **{nome}** carregada ✓ — {theme}, {fonts}"

**Regra:** O catálogo visual é a PRIMEIRA interação. Sem marca escolhida, sem plano.

### Fase 2: Classificar Demanda

Ler a mensagem do usuário e classificar:

```
Tipo: carousel | reel | story | video | landing-page | calendar | research | brand | design-system | batch
Volume: single | batch | week
Urgência: quick (produção direta) | quality (com debate/QA)
```

**Regras de classificação:**
- "carrossel", "carousel", "slides" → `carousel`
- "reel", "reels", "vídeo curto", "shorts" → `reel`
- "story", "stories", "sequência" → `story`
- "vídeo", "video", "mp4" → `video`
- "landing page", "LP", "página" → `landing-page`
- "semana", "calendário", "planejamento" → `calendar`
- "multiplicar", "repurpose", "adaptar" → `batch` (repurposing)
- "concorrente", "pesquisar", "analisar" → `research`
- "marca", "brand", "identidade" → `brand`
- "design system", "DS", "tokens" → `design-system`

**Se nenhum padrão casar (`type: unknown`):** Ativar Discovery Mode imediatamente. Perguntar ao usuário com AskUserQuestion (máx 3 perguntas):
1. "Que tipo de conteúdo você quer criar?" — listar opções (carrossel, reel, story, vídeo, LP, calendário)
2. "Para qual plataforma?" — Instagram, YouTube, TikTok, LinkedIn, site
3. "Tem referência ou exemplo do que imagina?" — texto livre

Re-classificar com as respostas. Se ainda `unknown` após discovery: avisar "Não consegui identificar o tipo. Tenta descrever de outro jeito?" e PARAR (não gerar plano vazio).

### Fase 3: Carregar Contexto Complementar

1. Brand já carregada na Fase 1 — tokens disponíveis
2. Se demanda requer contexto adicional (calendário existente, conteúdo fonte), carregar agora

### Fase 4: Consultar Capability Map

Para cada tipo de output necessário:

1. Ler `data/capability-map.yaml`
2. Buscar a capability correspondente (ex: `carousel_copy` + `carousel_render` + `publish_ig_carousel`)
3. Verificar o campo `best` → squad/skill principal
4. Se urgência == quality: verificar `alternatives` com debate
5. Coletar `why` para justificar cada escolha no plano

### Fase 5: Montar Plano

Entrar em **plan mode** e gerar um plano com este formato:

```
PLANO DE PRODUÇÃO — Marca: {nome}

Etapa 1: {título}
  Executor: {squad/skill} → {agent}
  Motivo: {why do capability map}
  Input: {o que entra}
  Output esperado: {o que sai}

Etapa 2: ...

Etapa N: Publicação
  Executor: {publisher}
  Plataforma: {onde}

Checkpoints: {onde pausar para aprovação}
Estimativa: {número de peças × tempo por peça}
```

**Regras do plano:**
- Cada etapa tem executor, motivo, input e output
- Se houver opções (ex: tipo de reel), apresentar como A/B para o usuário escolher
- Incluir checkpoints após: copy, render, e antes de publish
- Justificar CADA escolha com o campo `why` do capability map

### Fase 6: Executar (após aprovação)

Para cada etapa do plano aprovado:

1. Invocar o squad/skill correto via slash command ou Agent tool
2. Passar brand tokens como contexto
3. Pausar em checkpoints para revisão do usuário
4. **Verificar artefatos** antes de prosseguir para publicação: confirmar que os arquivos esperados (PNGs, vídeos, HTML) existem e têm tamanho > 0. Se ausentes, abortar publicação e avisar o usuário.
5. Após conclusão, registrar em `data/content-log.jsonl` (se o arquivo não existir, criar vazio antes do append):

```jsonl
{"ts":"ISO8601","type":"carousel","brand":"specta","topic":"hooks","pieces":3,"published":false,"executor":"squads/conteudo","skill":"content-forge"}
```

## Tabela de Routing

| Demanda | Copy | Render | Publish |
|---------|------|--------|---------|
| Carrossel IG | conteudo:carousel-creator | carrossel-instagram → image-creator | instagram-publisher |
| Reel tipografia | conteudo:reels-creator | viral-squad (Remotion) | blotato |
| Reel talking head | conteudo:reels-creator ou ai-reels:script-director | ai-reels (HeyGen + ElevenLabs) | blotato |
| Reel de áudio | — | audio-reels (Kling AI) | blotato |
| Story | conteudo:stories-strategist | image-creator | blotato |
| Vídeo branded | conteudo ou content-engine | video-generator → Remotion | blotato |
| Landing page | — | lp-generator | manual deploy |
| Calendário | conteudo:content-planner | — | — |
| Multiplicar | conteudo:wf-multiplicar | vários | vários |
| Pesquisa | conteudo:competitor-analyst | — | — |
| Brand | branding squad | — | — |
| Design System | design-system-forge | — | — |

## Discovery Mode

Quando a demanda for ambígua, perguntar (máximo 3 perguntas):

1. **Tipo de reel:** "Tipografia animada (viral-squad), talking head com avatar (ai-reels), ou animação de áudio (audio-reels)?"
2. **Plataforma:** "Publicar só no Instagram ou multi-plataforma?"
3. **Qualidade:** "Produção rápida ou com debate de qualidade (content-engine)?"

**Nota:** A marca já é escolhida na Fase 1 — NÃO perguntar sobre marca no Discovery Mode.
NÃO perguntar coisas que o capability map já responde (qual squad é melhor).

## Publish Router

```
Se conteúdo é carousel IG-only + sem agendamento → skills/instagram-publisher
Se conteúdo é vídeo/reel → skills/blotato (único que suporta vídeo)
Se multi-plataforma ou agendamento → skills/blotato
Se blotato não configurado → skills/instagram-publisher + warning
```

## Arquivos de Referência

- `data/active-brand.yaml` — marca ativa
- `data/capability-map.yaml` — mapa de capacidades
- `packages/brand-schema/` — carregamento de tokens
- `packages/capability-map/` — consulta programática
- `data/content-log.jsonl` — log de produção (append-only)

## Exemplos

Ver `references/examples.md` para exemplos completos de planos gerados.
