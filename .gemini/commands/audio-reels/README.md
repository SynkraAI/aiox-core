# Audio Reels — AI Cinema Pipeline

Pipeline automatizado que transforma audio de WhatsApp em video cinematografico animado (9:16) pronto para Reels, TikTok e Shorts.

## Fluxo Completo

```
WhatsApp / Voice Memo (audio)
    |
    v
[1] Transcricao (Gemini 2.0 Flash) ............. ~$0.002/min
    |
    v
[2] Analise de Cenas (Gemini 2.0 Flash) ........ Scene Director + Decision Tree
    |
    +---> [3a] Imagens 9:16 (Gemini 2.5 Flash Image) ... ~$0.04/img
    |         |
    |         v
    |     [3c] Animacao (Freepik Kling AI) .......... ~$0.05-0.10/clip
    |
    +---> [3b] SFX (ElevenLabs) ..................... ~$0.01/sfx
    |
    v
[4] Otimizacao de Pacing ........................ Reels Optimizer
    |
    v
[5] Render (Remotion 9:16 + legendas word-by-word)
    |
    v
[6] Compressao + Entrega (< 16MB)
```

**Custo estimado:** $0.80-1.20 por video
**Tempo estimado:** 8-12 minutos (inclui Kling AI)

---

## Pre-requisitos

### APIs Obrigatorias

Todas configuradas em `~/.config/aios/credentials.yaml`:

```yaml
google:
  api_key: "AIza..."      # Gemini (transcricao + cenas + imagens)

freepik:
  api_key: "FPSX..."      # Kling AI (image-to-video)

elevenlabs:
  api_key: "sk_..."        # Sound Effects
```

### Imagem de Referencia do Personagem (OBRIGATORIA)

O pipeline **sempre** requer uma foto de referencia do personagem para garantir consistencia visual em todas as cenas animadas.

| Requisito | Detalhe |
|-----------|---------|
| **Formato** | PNG ou JPG |
| **Resolucao** | Minimo 512x512 px |
| **Conteudo** | Foto frontal rosto/busto, fundo neutro |
| **Localizacao** | `{output_dir}/assets/character-reference.png` |

A referencia e usada de duas formas:
1. **Prompts de imagem**: descricao fisica do personagem incluida em cada prompt
2. **Kling AI video-reference**: imagem enviada como `reference_images` para consistencia facial

### Tools do Sistema

```bash
brew install ffmpeg       # Audio/video processing
node --version            # Node.js 18+ (Remotion)
python3 --version         # Python 3.8+ (scripts)
```

### Estilo de Animacao

O estilo visual e configuravel via `style.prompt_suffix` no spec. Estilos disponiveis:

| Estilo | Descricao |
|--------|-----------|
| **Comic Book** (padrao) | Graphic novel, ink outlines, cel-shaded, muted earth tones |
| **Cinematic Realistic** | Photorealistic, dramatic lighting, film grain, 35mm look |
| **Anime/Manga** | Vibrant colors, cel-shaded, clean linework, expressive |
| **Watercolor** | Soft washes, organic textures, muted palette, impressionistic |
| **Neon Cyberpunk** | Dark background, neon glow, rain reflections, futuristic |

---

## Quick Start

```bash
# 1. Verificar readiness
bash squads/audio-reels/scripts/check-readiness.sh

# 2. Processar um audio (pipeline completo com Kling)
bash squads/audio-reels/scripts/run-pipeline.sh /path/to/audio.m4a meu-reel

# 3. Ou via comando de agente
@audio-reels-chief
*process /path/to/audio.ogg
```

---

## Pipeline Detalhado (7 Steps)

### Step 0: Conversao de Audio
- **Input:** OGG, M4A, WAV, MP3
- **Output:** MP3 mono 16kHz
- **Tool:** ffmpeg

### Step 1: Transcricao (Gemini 2.0 Flash)
- **Script:** `scripts/transcribe.py`
- Multi-pass: texto + segmentos (Pass 1) → timestamps por palavra (Pass 2)
- Calibracao automatica de timestamps via ffprobe
- **QG-001:** Transcricao valida, timestamps presentes, duracao 5-300s

### Step 2: Analise de Cenas (Gemini 2.0 Flash)
- **Script:** `scripts/analyze-scenes.py`
- Decision tree de 5 passos: audio_layer → shot_type → camera_movement → transition → SFX
- Segmentacao por beats narrativos (McKee) e pontos de corte (Murch)
- **QG-002:** Cenas contiguas, 3-20 cenas, cada uma com shot_type e mood

### Step 3a: Geracao de Imagens (Gemini 2.5 Flash Image)
- **Script:** `scripts/generate-images.py`
- Prompts incluem descricao fisica do personagem (da referencia)
- Estilo aplicado via `prompt_suffix`
- Aspecto 9:16, ~2MB por imagem
- **QG-003a:** Todas as imagens existem e > 10KB

### Step 3b: Geracao de SFX (ElevenLabs)
- **Script:** `scripts/generate-sfx.py`
- Apenas para cenas com `sfx != null`
- Lookup table PT-BR → descricoes em ingles
- **QG-003b:** Todos os SFX existem (se aplicavel)

### Step 3c: Animacao Kling AI (Freepik)
- **Script:** `scripts/generate-videos.py`
- **SEMPRE EXECUTA** — transforma imagens estaticas em video clips de 5s
- Usa endpoint `video-reference` com `reference_images` (personagem + cena)
- Fallback para endpoint `first-frame` em wide shots se video-reference falhar (erro 500)
- Polling async: submit → poll a cada 10s → download MP4
- **QG-003c:** Todos os video clips existem e > 1KB

### Step 4: Otimizacao de Pacing
- Regras de hook (cena 1 = close-up + fade-from-black)
- Sem shot_type repetido em sequencia
- Cenas entre 2-7s
- **QG-004:** JSON spec valido, paths existem, duracao bate

### Step 5: Render (Remotion)
- 1080x1920, 30fps, H.264
- Video clips Kling como background (OffthreadVideo)
- Legendas word-by-word com highlight dourado
- Compressao automatica se > 16MB (CRF progressivo: 23→28→32)
- **QG-005:** Video existe, duracao ±1s do audio, < 16MB

---

## Agentes

| Agente | Tier | Minds | Responsabilidade |
|--------|------|-------|------------------|
| **audio-reels-chief** | Orchestrator | — | Coordena pipeline, gerencia estado, fallbacks |
| **scene-director** | Tier 0 | Murch, Deakins, McKee | Analisa transcricao, quebra em cenas, decision tree |
| **image-prompter** | Tier 1 | Deakins | Prompts otimizados para Nano Banana + Kling |
| **sfx-designer** | Tier 1 | Burtt | Efeitos sonoros via ElevenLabs |
| **remotion-assembler** | Tier 2 | — | JSON spec, render Remotion com video clips |
| **reels-optimizer** | Tier 3 | Galloway | Pacing, hook visual, retencao short-form |
| **ops** | Tools | — | Readiness, diagnostico, setup, custos |

## Tasks

| Task | Executor | Descricao |
|------|----------|-----------|
| `process-audio` | Chief | Task principal — pipeline ponta-a-ponta |
| `analyze-scenes` | Scene Director | Transcricao → cenas com decision tree |
| `generate-scene-images` | Image Prompter | Batch de imagens 9:16 |
| `generate-sfx` | SFX Designer | Efeitos sonoros por cena |
| `optimize-pacing` | Reels Optimizer | Ajuste de pacing para retencao |
| `render-and-deliver` | Remotion Assembler | Render com video clips + compressao + entrega |

## Workflow

**audio-to-reels** — Pipeline completo em 5 fases:

| Fase | Agente | Duracao | Quality Gate |
|------|--------|---------|-------------|
| 1. Ingestao + Transcricao | Chief | ~30s | QG-001: Transcricao Valida |
| 2. Analise de Cenas | Scene Director | ~15s | QG-002: Cenas Validas |
| 3. Geracao de Assets | Image Prompter + SFX + Kling AI | ~5-8min | QG-003: Assets Completos |
| 4. Otimizacao + Montagem | Reels Optimizer + Assembler | ~10s | QG-004: JSON Spec Valido |
| 5. Render + Entrega | Assembler | ~2min | QG-005: Video Entregavel |

---

## Scripts

| Script | Proposito | Input | Output |
|--------|-----------|-------|--------|
| `transcribe.py` | Audio → JSON com timestamps | audio.mp3 | transcription.json |
| `analyze-scenes.py` | Transcricao → Video Spec | transcription.json | spec.json |
| `generate-images.py` | Spec → Imagens 9:16 | spec.json | assets/scenes/*.png |
| `generate-sfx.py` | Spec → Efeitos sonoros | spec.json | assets/sfx/*.mp3 |
| `generate-videos.py` | Imagens → Video clips Kling | spec.json + images | assets/videos/*.mp4 |
| `run-pipeline.sh` | Orquestrador completo | audio file | video final .mp4 |
| `check-readiness.sh` | Verifica prerequisitos | — | status report |

---

## APIs e Custos

| API | Modelo | Uso | Custo |
|-----|--------|-----|-------|
| **Google Gemini** | 2.0 Flash | Transcricao multimodal | ~$0.002/min |
| **Google Gemini** | 2.0 Flash | Analise de cenas | ~$0.03-0.05/call |
| **Google Gemini** | 2.5 Flash Image | Geracao de imagens 9:16 | ~$0.04/img |
| **Freepik Kling AI** | O1 Standard | Image-to-video (5s clips) | ~$0.05-0.10/clip |
| **ElevenLabs** | Sound Effects | Efeitos sonoros | ~$0.01/sfx |
| **Remotion** | 4.0 (local) | Render H.264 | Gratuito |

---

## Data Files

| Arquivo | Descricao |
|---------|-----------|
| `scene-decision-tree.md` | Decision tree de 5 passos para cinematografia |
| `sfx-lookup.yaml` | 20 keywords PT-BR → descricoes SFX em ingles |
| `video-spec-schema.json` | JSON Schema do contrato LLM ↔ Remotion |
| `audio-reels-kb.md` | Knowledge base com best practices dos elite minds |

## Elite Minds

| Mind | Dominio | Framework Principal |
|------|---------|-------------------|
| **Walter Murch** | Edicao | Rule of Six (emocao > story > ritmo) |
| **Roger Deakins** | Cinematografia | Shot-Emotion Matrix |
| **Robert McKee** | Narrativa | Beat Theory (segmentar por mudancas emocionais) |
| **Ben Burtt** | Sound Design | Organic Sound Design (sons organicos > sinteticos) |
| **Paddy Galloway** | Short-Form | 3-Second Hook Rule + Visual Pacing |

---

## Output Structure

```
outputs/audio-reels/YYYY-MM-DD_{slug}/
  ├── original.mp3                              # Audio convertido
  ├── transcription.json                        # Transcricao com timestamps
  ├── spec.json                                 # Video spec completo
  ├── YYYY-MM-DD_{slug}_reels.mp4               # Video original (grande)
  ├── YYYY-MM-DD_{slug}_reels_compressed.mp4    # Video comprimido (< 16MB)
  └── assets/
      ├── character-reference.png               # Foto do personagem (OBRIGATORIA)
      ├── scenes/
      │   ├── scene_001.png                     # Imagens geradas
      │   ├── scene_002.png
      │   └── ...
      ├── videos/
      │   ├── scene_001.mp4                     # Video clips Kling AI
      │   ├── scene_002.mp4
      │   └── ...
      └── sfx/
          └── sfx_001.mp3                       # Efeitos sonoros (se houver)
```

---

## Patterns

| ID | Pattern | Descricao |
|----|---------|-----------|
| AR-001 | Hook visual forte | Cena 1: close-up + zoom-in + fade-from-black |
| AR-002 | Kling video-reference | Character reference em todas as cenas com personagem |
| AR-003 | Fallback first-frame | Wide shots usam endpoint standard se video-reference falhar |
| AR-004 | Dissolve em mood | Transicao dissolve entre mudancas de mood |
| AR-005 | Ken-burns fallback | Movimento padrao para cenas sem direcao clara |
| AR-006 | Compressao progressiva | CRF 18→23→28→32 para WhatsApp |

## Anti-Patterns

| Anti-Pattern | Motivo |
|-------------|--------|
| Pipeline sem character-reference | Personagem inconsistente entre cenas |
| Pular Step 3c (Kling) | Video estatico, baixa retencao |
| Cenas > 7s | Perde retencao em short-form |
| Mesmo shot 2x seguidas | Monotonia visual |
| SFX mais alto que narracao | Abafa conteudo |
| Wide-shot como primeiro frame | Hook fraco |
| Prompt sem descricao do personagem | Gera pessoa diferente em cada cena |

---

*Squad Version: 2.0.0*
*Updated: 2026-02-16*
*Author: Jose Carlos Amorim*
