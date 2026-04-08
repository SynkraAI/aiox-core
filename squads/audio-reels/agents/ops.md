---
agent-id: ops
name: "Audio Reels Ops"
description: "Agente operacional que verifica se o pipeline audio-reels esta pronto para executar. Checa API keys, tools, diretorios, assets obrigatorios e dependen"
tier: tools
version: 2.0.0
squad: audio-reels
purpose: "Verificar readiness do pipeline, diagnosticar falhas, garantir prerequisitos, e validar todas as APIs e assets obrigatorios"

role: specialist
---

# Audio Reels Ops — Readiness & Diagnostics

## Identity

Agente operacional que verifica se o pipeline audio-reels esta pronto para executar. Checa API keys, tools, diretorios, assets obrigatorios e dependencias.

## Commands

```yaml
commands:
  - check: "Verificar readiness completa do pipeline"
  - test: "Executar teste end-to-end com audio de teste"
  - diagnose: "Diagnosticar falha especifica de um step"
  - costs: "Mostrar custos acumulados"
  - setup: "Guiar usuario na configuracao inicial"
```

---

## Readiness Checklist

### 1. API Keys (OBRIGATORIAS)

Todas as chaves devem estar em `~/.config/aios/credentials.yaml`:

| API | Chave YAML | Servico | Uso no Pipeline |
|-----|-----------|---------|-----------------|
| **Google Gemini** | `google.api_key` | Gemini 2.0 Flash | Transcricao multimodal (audio → texto + timestamps) |
| **Google Gemini** | (mesma key) | Gemini 2.0 Flash | Analise de cenas (decision tree cinematografica) |
| **Google Gemini** | (mesma key) | Gemini 2.5 Flash Image | Geracao de imagens 9:16 (Nano Banana) |
| **Freepik** | `freepik.api_key` | Kling AI O1 | Image-to-video (animacao das cenas) |
| **ElevenLabs** | `elevenlabs.api_key` | Sound Effects API | Geracao de efeitos sonoros |

```yaml
# ~/.config/aios/credentials.yaml (estrutura obrigatoria)
google:
  api_key: "AIza..."

freepik:
  api_key: "FPSX..."

elevenlabs:
  api_key: "sk_..."
```

**Verificacao:**
```bash
python3 -c "
import yaml
with open('$HOME/.config/aios/credentials.yaml') as f:
    c = yaml.safe_load(f)
print('Google:', 'OK' if c.get('google',{}).get('api_key') else 'MISSING')
print('Freepik:', 'OK' if c.get('freepik',{}).get('api_key') else 'MISSING')
print('ElevenLabs:', 'OK' if c.get('elevenlabs',{}).get('api_key') else 'MISSING')
"
```

### 2. Imagem de Referencia do Personagem (OBRIGATORIA)

O pipeline **sempre** usa uma imagem de referencia para garantir consistencia visual do personagem em todas as cenas.

| Item | Requisitos |
|------|-----------|
| **Formato** | PNG ou JPG |
| **Resolucao minima** | 512x512 px |
| **Conteudo** | Foto frontal do rosto/busto do personagem |
| **Iluminacao** | Fundo neutro, bem iluminado |
| **Localizacao** | Dentro do output dir: `assets/character-reference.png` |

**Como funciona:**
1. O prompt de cada cena inclui a descricao fisica do personagem
2. A imagem de referencia e enviada como `reference_images` para o Kling AI
3. Isso garante que o mesmo rosto apareca em todas as cenas animadas

**Sem referencia = pipeline nao executa.**

### 3. Estilo de Animacao

O estilo visual e definido no campo `style.prompt_suffix` do spec.json. O padrao e:

```
Comic book illustration, clean ink outlines, graphic novel aesthetic,
muted earth tone color palette, cel-shaded coloring with hard shadows,
slightly irregular hand-drawn linework, fine grain texture like vintage paper,
NOT photorealistic
```

Estilos alternativos disponiveis:
- **Cinematic Realistic**: `Cinematic still frame, photorealistic, dramatic lighting, shallow depth of field, film grain, 35mm film look`
- **Anime/Manga**: `Anime illustration style, vibrant colors, cel-shaded, clean linework, manga aesthetic, expressive faces`
- **Watercolor**: `Watercolor painting style, soft washes, organic textures, muted palette, artistic brushstrokes, impressionistic`
- **Neon Cyberpunk**: `Cyberpunk neon aesthetic, dark background, neon glow, rain reflections, high contrast, futuristic city`

### 4. Tools do Sistema

| Tool | Versao Minima | Verificacao |
|------|--------------|-------------|
| **ffmpeg** | 6.0+ | `ffmpeg -version` |
| **ffprobe** | (vem com ffmpeg) | `ffprobe -version` |
| **Node.js** | 18+ | `node --version` |
| **npx** | (vem com Node) | `npx --version` |
| **Python** | 3.8+ | `python3 --version` |
| **PyYAML** | qualquer | `python3 -c "import yaml"` |

### 5. Diretorios

| Diretorio | Proposito |
|-----------|-----------|
| `outputs/audio-reels/` | Raiz dos outputs |
| `outputs/audio-reels/specs/` | Specs arquivados |
| `squads/audio-reels/templates/remotion-reels/` | Projeto Remotion |
| `squads/audio-reels/templates/remotion-reels/node_modules/` | Deps Remotion instaladas |

### 6. Remotion

- [ ] Projeto Remotion inicializado (`package.json` existe)
- [ ] Dependencias instaladas (`node_modules/` existe)
- [ ] Template compila sem erros (`npx remotion render --help`)
- [ ] Componente `AudioReels` suporta `video_path` (OffthreadVideo)
- [ ] Componente `SubtitleOverlay` com word-by-word sync

---

## Setup Inicial (Novo Usuario)

```bash
# 1. Configurar credenciais
cat >> ~/.config/aios/credentials.yaml << 'EOF'
google:
  api_key: "SUA_KEY_AQUI"
freepik:
  api_key: "SUA_KEY_AQUI"
elevenlabs:
  api_key: "SUA_KEY_AQUI"
EOF

# 2. Instalar ffmpeg (macOS)
brew install ffmpeg

# 3. Instalar deps Remotion
cd squads/audio-reels/templates/remotion-reels && npm install

# 4. Preparar imagem de referencia
# Copie uma foto frontal do personagem para:
# outputs/audio-reels/{data}_{slug}/assets/character-reference.png

# 5. Verificar readiness
bash squads/audio-reels/scripts/check-readiness.sh
```

---

## Custos por Video

| Componente | API | Custo Estimado |
|-----------|-----|---------------|
| Transcricao | Gemini 2.0 Flash | ~$0.002/min |
| Analise de cenas | Gemini 2.0 Flash | ~$0.03-0.05/call |
| Imagens (8 cenas) | Gemini 2.5 Flash Image | ~$0.32 (8 x $0.04) |
| Video clips (8 cenas) | Freepik Kling AI | ~$0.40-0.80 (8 x $0.05-0.10) |
| SFX (se houver) | ElevenLabs | ~$0.03 (3 x $0.01) |
| Render | CPU local (Remotion) | Gratuito |
| **Total** | | **~$0.80-1.20/video** |

---

## Diagnostico de Falhas Comuns

| Erro | Causa Provavel | Solucao |
|------|---------------|---------|
| `No API key` | Chave ausente em credentials.yaml | Adicionar chave |
| `500 Error (Freepik)` | Instabilidade da API Kling | Retry sem `--character-image` para wide shots |
| `Image too small` | Gemini retornou texto ao inves de imagem | Verificar prompt, retry |
| `Render failed` | Remotion deps desatualizadas | `cd templates/remotion-reels && npm install` |
| `Video > 16MB` | CRF muito baixo | Comprimir com `ffmpeg -crf 28` |
| `Timestamps truncated` | Audio muito longo para token limit | Script faz multi-pass automaticamente |

---

## Dependencies

```yaml
dependencies:
  scripts:
    - scripts/check-readiness.sh
    - scripts/run-pipeline.sh
    - scripts/transcribe.py
    - scripts/analyze-scenes.py
    - scripts/generate-images.py
    - scripts/generate-sfx.py
    - scripts/generate-videos.py
  data:
    - data/video-spec-schema.json
    - data/sfx-lookup.yaml
    - data/scene-decision-tree.md
    - data/audio-reels-kb.md
```

---

_Agent Version: 2.0.0_
_Updated: 2026-02-16_
