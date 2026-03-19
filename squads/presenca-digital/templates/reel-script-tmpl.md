# Template de Roteiro de Reel / Short

> Define a estrutura de roteiro para Reels (Instagram), Shorts (YouTube) e TikToks. Baseado no Roteiro Chicote de Camilo Coutinho e Hook Point de Brendan Kane.

---

## Metadata

```yaml
template_id: reel-script-tmpl
format: reel-script
platform: [instagram, youtube-shorts, tiktok]
agent: camilo-coutinho, brendan-kane
method: roteiro-chicote + hook-point
duration_target: 30-60s
```

---

## Structure

```
---
PLATAFORMA: {PLATFORM}
TEMA: {TOPIC}
DURAÇÃO-ALVO: {DURATION}s
PERSONAGEM: {SPEAKER}      # quem aparece no vídeo
LOCAÇÃO: {LOCATION}
---

[GANCHO — 0s a 3s]
Fala:    "{HOOK_LINE}"
Ação:    {VISUAL_ACTION}   # ex: "aponta para câmera", "mostra produto"
Legenda: {CAPTION_HOOK}    # legenda sobreposta para assistir sem áudio
Nota: A primeira frase deve criar uma pergunta na cabeça do espectador

[CONTEXTO — 3s a 8s]
Fala:    "{CONTEXT_LINE}"
Ação:    {VISUAL_ACTION}
Legenda: {CAPTION_CONTEXT}
Nota: Por que esse assunto importa AGORA para essa pessoa

[CONTEÚDO — 8s a 45s]
  [PONTO 1 — {TIME_START}s]
  Fala:    "{POINT_1}"
  Ação:    {VISUAL_ACTION}
  Legenda: {CAPTION_1}

  [PONTO 2 — {TIME_START}s]
  Fala:    "{POINT_2}"
  Ação:    {VISUAL_ACTION}
  Legenda: {CAPTION_2}

  [PONTO 3 — {TIME_START}s]   ← opcional
  Fala:    "{POINT_3}"
  Ação:    {VISUAL_ACTION}
  Legenda: {CAPTION_3}

  [VIRADA / INSIGHT — {TIME_START}s]
  Fala:    "{KEY_INSIGHT}"
  Ação:    {VISUAL_ACTION}   # pode ser pausa dramática, corte, zoom
  Legenda: {CAPTION_INSIGHT}

[CTA — últimos 5s]
Fala:    "{CTA_LINE}"
Ação:    {VISUAL_ACTION}     # ex: "aponta para baixo (comentários)", "gesticula seguir"
Legenda: {CAPTION_CTA}

---
NOTAS DE PRODUÇÃO:
Ritmo:      {PACING_NOTES}   # ex: "cortes rápidos no conteúdo, pausa no insight"
Música:     {MUSIC_VIBE}     # ex: "energética no início, suave no final"
Legenda:    automática + revisão manual obrigatória
```

---

## Usage Notes

- O gancho DEVE prender em 3 segundos — se não prende, o vídeo morre no algoritmo
- Falar em ritmo natural, não em tom de apresentação
- Pausa antes do insight principal aumenta retenção
- CTA único e direto: não peça curtida E comentário E seguir ao mesmo tempo
- Roteiro escrito = guia, não script decorado — adaptar na gravação

## Platform Adaptations

| Platform         | Adjustment                                                          |
|------------------|---------------------------------------------------------------------|
| Instagram Reels  | Duração ideal: 15-30s para alcance orgânico. Áudio original valorizado. |
| YouTube Shorts   | Até 60s. Título do vídeo aparece abaixo — incluir keyword no title. |
| TikTok           | Até 60s (idealmente). Loop opcional: CTA pode conectar ao início.   |
```
