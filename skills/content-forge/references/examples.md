# Content Forge — Exemplos de Planos

## Exemplo 1: "3 carrosséis sobre hooks pra marca Specta"

```
PLANO DE PRODUÇÃO — Marca: Specta (dark, purple+pink)

Etapa 1: Copy dos Carrosséis
  Executor: squads/conteudo → carousel-creator
  Motivo: 9 frameworks BRANDCONTENT, Agente Imperador, Oráculo de validação
  Input: tema "hooks", 3 carrosséis, brand Specta
  Output: 3 scripts com slides + copy + CTAs

  ⏸ CHECKPOINT: revisar copy antes de renderizar

Etapa 2: Render Visual
  Executor: skills/carrossel-instagram → skills/image-creator
  Input: scripts da Etapa 1 + tokens Specta (purple #A855F7, pink #EC4899, dark bg #0C0A1A)
  Output: 3 × ~7 PNGs (1080x1350) com fontes Syne/Cabinet Grotesk

  ⏸ CHECKPOINT: revisar visuais antes de publicar

Etapa 3: Publicação
  Executor: skills/instagram-publisher
  Motivo: carrossel IG-only, Graph API direto com dry-run
  Input: PNGs da Etapa 2
  Output: 3 posts publicados no Instagram

Estimativa: 3 carrosséis × ~10 min = ~30 min total
```

## Exemplo 2: "preciso de conteúdo da semana inteira"

```
PLANO DE PRODUÇÃO — Marca: Specta | Semana de 07-11/04/2026

Etapa 1: Planejamento Editorial
  Executor: squads/conteudo → content-planner
  Motivo: 5 níveis de consciência, 25 ideias/ciclo
  Input: brand Specta, semana 07-11/04
  Output: calendário com 12-15 peças distribuídas

  ⏸ CHECKPOINT: aprovar calendário antes de produzir

Etapa 2: Produção de Carrosséis (4-5 peças)
  Executor: squads/conteudo → carousel-creator → carrossel-instagram → image-creator
  Input: temas do calendário + brand Specta
  Output: 4-5 conjuntos de PNGs

Etapa 3: Produção de Reels (3-5 peças)
  Executor: squads/conteudo → reels-creator
  Opção A: Tipografia animada (viral-squad)
  Opção B: Talking head (ai-reels)
  → Qual tipo de reel prefere? [A/B/misto]

  ⏸ CHECKPOINT: revisar roteiros antes de render

Etapa 4: Stories (diário)
  Executor: squads/conteudo → stories-strategist → image-creator
  Input: temas do calendário
  Output: 5 sequências de stories

Etapa 5: Publicação em Lote
  Executor: skills/blotato (multi-plataforma + agendamento)
  Input: todo o conteúdo produzido
  Output: posts agendados para a semana

Estimativa: ~2-3h de produção total
```

## Exemplo 3: "multiplicar esse vídeo do YouTube"

```
PLANO DE PRODUÇÃO — Marca: Specta | Multiplicação

Etapa 1: Ingestão e Transcrição
  Executor: squads/conteudo → *multiplicar (yt-dlp + Whisper)
  Input: URL do YouTube
  Output: transcrição completa + momentos-chave

Etapa 2: Extração de Micro-peças
  Executor: squads/conteudo → content-repurposer
  Motivo: 1 conteúdo longo → 30+ micro-peças
  Input: transcrição da Etapa 1
  Output: 5 carrosséis + 4 reels + 3 stories + 2 threads + captions

  ⏸ CHECKPOINT: revisar peças extraídas

Etapa 3: Render Visual (por tipo)
  Carrosséis: carrossel-instagram → image-creator
  Reels: viral-squad (tipografia animada)
  Stories: image-creator
  Input: micro-peças + brand Specta

Etapa 4: Publicação Escalonada
  Executor: skills/blotato
  Distribuição: 2-3 peças/dia ao longo de 2 semanas

Estimativa: ~1h ingestão + ~2h produção
```

## Exemplo 4: "reel com minha voz sobre investimentos"

```
PLANO DE PRODUÇÃO — Marca: Specta | Reel Talking Head

Etapa 1: Roteiro
  Executor: squads/ai-reels → hook-architect + script-director
  Motivo: roteiro otimizado para talking-head com avatar
  Input: tema "investimentos", brand Specta
  Output: roteiro com hooks, beats, CTA

  ⏸ CHECKPOINT: aprovar roteiro

Etapa 2: Voz + Avatar
  Executor: squads/ai-reels
  Pipeline: ElevenLabs (voz clonada) → HeyGen (avatar lip-sync)
  Input: roteiro aprovado
  Output: MP4 com avatar falando

Etapa 3: Pós-produção Remotion
  Executor: squads/ai-reels (8 camadas)
  Camadas: avatar + captions word-by-word + keywords + vignette + grain
  Input: MP4 da Etapa 2 + brand Specta
  Output: reel final (1080x1920, H.264)

Etapa 4: Publicação
  Executor: skills/blotato
  Plataforma: Instagram Reels + TikTok
  Output: reel publicado

Custo estimado: ~$12 (ElevenLabs + HeyGen)
```
