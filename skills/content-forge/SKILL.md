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

1. **Recebe** a demanda do usuário (texto livre)
2. **Carrega** a marca ativa (`data/active-brand.yaml`)
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

### Fase 1: Classificar Demanda

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

### Fase 2: Carregar Contexto

1. Ler `data/active-brand.yaml` → obter slug e path
2. Carregar brand via `packages/brand-schema/` → ter todos os tokens disponíveis
3. Se marca não configurada:
   - Perguntar: "Qual marca usar? Disponíveis: {listar brands}"
   - Ou: "Pode me dar uma cor hex e nome para criar uma marca rápida"

### Fase 3: Consultar Capability Map

Para cada tipo de output necessário:

1. Ler `data/capability-map.yaml`
2. Buscar a capability correspondente (ex: `carousel_copy` + `carousel_render` + `publish_ig_carousel`)
3. Verificar o campo `best` → squad/skill principal
4. Se urgência == quality: verificar `alternatives` com debate
5. Coletar `why` para justificar cada escolha no plano

### Fase 4: Montar Plano

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

### Fase 5: Executar (após aprovação)

Para cada etapa do plano aprovado:

1. Invocar o squad/skill correto via slash command ou Agent tool
2. Passar brand tokens como contexto
3. Pausar em checkpoints para revisão do usuário
4. Após conclusão, registrar em `data/content-log.jsonl`:

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
4. **Marca:** "Brand ativo é {nome}. Quer mudar?"

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
