---
name: groq-transcriber
description: >-
  Transcrição em batch de áudios usando Groq Whisper API via aios-transcriber.
  Auto-compressão, rotação de múltiplas API keys, split de arquivos grandes e resume automático.
  Use para transcrever qualquer volume de áudio de forma rápida e eficiente.
risk: safe
source: self
paths:
  - ".aios/skills/groq-transcriber/"
lazy_load: true
context_budget: 800
---

# Groq Transcriber

Transcrição em batch usando a API da Groq com Whisper, via **aios-transcriber** (ferramenta unificada).

## When to Use This Skill

- Transcrever áudios de cursos, palestras, mentorias, lives
- Processar batch de múltiplos arquivos de áudio
- Transcrever áudio de qualquer formato (.m4a, .wav, .mp3, .mp4)
- Quando precisar de transcrição rápida sem consumir RAM/GPU local
- **Para YouTube:** use `aios-transcriber youtube` (extrai legendas em segundos, sem download)

## Do NOT Use This Skill When

- O áudio já tem transcrição (batch detecta automaticamente via resume)
- Precisa de transcrição em tempo real (streaming)
- Precisa de diarização (identificação de falantes) — use outro serviço
- Volume muito grande (50+ arquivos longos) — considere Deepgram (`--engine deepgram`)

## Prerequisites

- Python 3.10+
- `ffmpeg` instalado: `brew install ffmpeg`
- `yt-dlp` instalado: `pip install yt-dlp` (para YouTube)
- API keys configuradas em `.aios/skills/groq-transcriber/.env`

**Zero dependências Python externas** — usa urllib (stdlib) para chamadas API.

## Quick Start

```bash
# Arquivo único (Groq, grátis)
python3 tools/aios-transcriber/aios_transcriber.py local ~/audio.m4a -o ~/output/

# Batch de diretório
python3 tools/aios-transcriber/aios_transcriber.py batch ~/audios/ -o ~/output/

# YouTube (fast path — legendas, sem download)
python3 tools/aios-transcriber/aios_transcriber.py youtube "https://youtube.com/watch?v=xxx" -o ~/output/

# Sem compressão
python3 tools/aios-transcriber/aios_transcriber.py local ~/audio.m4a -o ~/output/ --no-compress

# Compressão mais agressiva
python3 tools/aios-transcriber/aios_transcriber.py local ~/audio.m4a -o ~/output/ --bitrate 32k
```

## Workflow

### Phase 1: Setup

1. Verificar se `.aios/skills/groq-transcriber/.env` existe e tem keys configuradas
2. Verificar se `ffmpeg` está instalado: `which ffmpeg`

**Veto conditions (BLOQUEIA se qualquer uma falhar):**
- `.env` não existe ou não tem `GROQ_API_KEYS` → PARAR, orientar criação do `.env`
- `ffmpeg` não instalado → PARAR, instruir `brew install ffmpeg`

**Completion criteria:** Prerequisites verificados com sucesso.

### Phase 2: Execute

1. Determinar fonte (YouTube URL, arquivo local, ou diretório batch)
2. Rodar o comando `aios-transcriber` apropriado
3. Se houver rate limit em todas as keys, o script aguarda automaticamente
4. O script salva progresso — se interrompido, ao re-executar retoma de onde parou

**Veto conditions:**
- Erro de autenticação (401) → PARAR, verificar validade das API keys no `.env`
- Erro persistente (3+ falhas consecutivas) → PARAR, investigar causa

**Completion criteria:** Script finaliza com 0 erros, ou com erros parciais reportados.

### Phase 3: Validate

1. Verificar se os arquivos `.md` foram criados
2. Spot-check: ler o início de 1-2 transcrições para validar qualidade
3. Reportar resultado final: arquivos transcritos, erros, tempo total

**Completion criteria:** Pelo menos 1 transcrição validada por leitura.

## Features

### Auto-compressão
- Converte para MP3 mono 16kHz a 64kbps antes do upload
- Whisper usa 16kHz mono internamente — zero perda de qualidade
- Redução típica: 74-95% do tamanho original
- Desativar com `--no-compress`

### Rotação de API keys
- Configure múltiplas keys: `GROQ_API_KEYS=key1,key2,key3`
- Rate limit automático → rotaciona para próxima key
- Se todas em cooldown → espera a primeira liberar

### Split de arquivos grandes
- Arquivos >24MB são divididos em chunks de 10 minutos
- Cada chunk é transcrito separadamente e concatenado

### Resume automático
- Progresso salvo em `.transcription-state.json`
- Re-executar após interrupção retoma de onde parou
- Para forçar re-transcrição, deletar o arquivo de estado

## Output Format

```markdown
---
title: "Título"
source: "caminho/ou/url"
source_type: groq_api
engine: groq-whisper-large-v3-turbo
language: "pt-BR"
duration: "00:45:00"
word_count: 6200
transcribed_at: "2026-03-13 12:00"
---

# Título

Texto transcrito aqui...
```

## CLI Reference

```
python3 tools/aios-transcriber/aios_transcriber.py <command> <input> [options]

Commands:
  youtube <url>        YouTube captions (fast, no download)
  local <file>         Transcribe local file via Groq API
  batch <directory>    Batch process directory

Options:
  -o, --output DIR     Output directory (default: current)
  --no-compress        Skip audio compression
  --bitrate BITRATE    Compression bitrate (default: 64k)
  --language LANG      Audio language (default: pt-BR)
```

## API Keys Configuration

Keys em `.aios/skills/groq-transcriber/.env` (gitignored):

```bash
GROQ_API_KEYS=gsk_key1,gsk_key2,gsk_key3
```

**Prioridade de carregamento:**
1. `.aios/skills/groq-transcriber/.env` (preferido)
2. Variável de ambiente `GROQ_API_KEYS` (fallback)
3. Variável de ambiente `GROQ_API_KEY` (key única, fallback)

## Constraints

- Maximum file size per request: 25MB (auto-split)
- Rate limits: ~20 req/min por key (free tier)
- Formatos suportados: `.m4a`, `.wav`, `.mp3`, `.mp4`, `.mkv`, `.webm`

## Script Location

`tools/aios-transcriber/aios_transcriber.py`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ffmpeg not found` | `brew install ffmpeg` |
| Rate limit errors | Add more API keys em `.env` |
| File too large after split | Reduce `--bitrate` (e.g., `32k`) |
| Transcription quality issues | Try `--no-compress` |
| Script interrupted | Re-run — resume is automatic |
| Large volume (50+ files) | Use `--engine deepgram` |
