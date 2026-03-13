---
name: deepgram-transcriber
description: >-
  Transcrição batch de áudios usando Deepgram Nova-3 API via aios-transcriber.
  Auto-compressão, processamento paralelo (multi-worker), resume automático.
  Use para transcrever grandes volumes de áudio de forma rápida e eficiente.
risk: safe
source: self
paths:
  - ".aios/skills/deepgram-transcriber/"
lazy_load: true
context_budget: 800
---

# Deepgram Transcriber

Transcrição batch usando Deepgram Nova-3, via **aios-transcriber** (ferramenta unificada).

## When to Use This Skill

- Transcrever grandes volumes de áudio (50+ arquivos, cursos completos)
- Quando o Groq estiver travando por rate limits
- Quando velocidade é prioridade (~15s por hora de áudio)
- Processar batch com workers paralelos (3-5 simultâneos)

## Do NOT Use This Skill When

- Volume pequeno (1-5 arquivos curtos) — use Groq (grátis)
- Precisa de transcrição em tempo real (streaming)
- Precisa de diarização — use outro serviço
- **Para YouTube:** use `aios-transcriber youtube` (extrai legendas em segundos)

## Prerequisites

- Python 3.10+
- `ffmpeg` instalado: `brew install ffmpeg`
- API key configurada em `.aios/skills/deepgram-transcriber/.env` ou `.aios/skills/groq-transcriber/.env`

**Zero dependências Python externas** — usa urllib (stdlib) para chamadas API.

## Quick Start

```bash
# Arquivo único (Deepgram)
python3 tools/aios-transcriber/aios_transcriber.py local ~/audio.m4a -o ~/output/ --engine deepgram

# Batch com 5 workers paralelos
python3 tools/aios-transcriber/aios_transcriber.py batch ~/audios/ -o ~/output/ --engine deepgram --workers 5

# Sem compressão
python3 tools/aios-transcriber/aios_transcriber.py local ~/audio.m4a -o ~/output/ --engine deepgram --no-compress
```

## Workflow

### Phase 1: Setup

1. Verificar se API key está configurada (`.env`)
2. Verificar se `ffmpeg` está instalado

**Veto conditions:**
- API key não configurada → PARAR, orientar criação do `.env`
- `ffmpeg` não instalado → PARAR, instruir `brew install ffmpeg`

### Phase 2: Execute

1. Rodar `aios-transcriber` com `--engine deepgram`
2. Workers paralelos processam múltiplos arquivos simultaneamente
3. Resume automático se interrompido

### Phase 3: Validate

1. Verificar `.md` files criados
2. Spot-check qualidade
3. Reportar resultado (arquivos, erros, custo estimado)

## Features

### Auto-compressão
- MP3 mono 16kHz a 64kbps antes do upload
- Redução típica: 74%+ do tamanho original
- Desativar com `--no-compress`

### Workers paralelos
- Default: 3 workers simultâneos
- Configurável com `--workers N`
- Deepgram tem rate limits generosos — 5 workers funciona bem

### Resume automático
- Progresso salvo em `.transcription-state.json`
- Re-executar após interrupção retoma de onde parou

## Output Format

```markdown
---
title: "Título"
source: "caminho/ou/url"
source_type: deepgram_api
engine: deepgram-nova-3
language: "pt-BR"
duration: "00:45:00"
word_count: 6200
transcribed_at: "2026-03-13 12:00"
---

# Título

Texto transcrito aqui com parágrafos formatados...
```

## CLI Reference

```
python3 tools/aios-transcriber/aios_transcriber.py <command> <input> [options]

Commands:
  local <file>         Transcribe local file via Deepgram
  batch <directory>    Batch process directory

Options:
  -o, --output DIR     Output directory
  --engine deepgram    Use Deepgram engine
  --workers N          Concurrent workers (default: 3)
  --no-compress        Skip compression
  --bitrate BITRATE    Compression bitrate (default: 64k)
  --language LANG      Audio language (default: pt-BR)
```

## API Key Configuration

Key em `.aios/skills/deepgram-transcriber/.env` ou `.aios/skills/groq-transcriber/.env` (gitignored):

```bash
DEEPGRAM_API_KEY=your_key_here
```

**Prioridade:**
1. `.aios/skills/deepgram-transcriber/.env`
2. `.aios/skills/groq-transcriber/.env` (compartilhado)
3. Variável de ambiente `DEEPGRAM_API_KEY`

## Pricing

- **$0.0043/min** (~R$2.50 por hora de áudio)
- $200 de crédito grátis no signup em console.deepgram.com
- ~770 horas de áudio com o crédito grátis

## Deepgram vs Groq

| Critério | Deepgram | Groq |
|----------|----------|------|
| Volume grande (50+ arquivos) | **Melhor** | Trava por rate limit |
| Custo zero | Não (pago) | **Melhor** (grátis) |
| Velocidade | **~15s/hora** | ~3min/hora |
| Paralelismo | **3-5 workers** | 1 por vez |
| Qualidade pt-BR | Excelente (Nova-3) | Excelente (Whisper Large) |

## Script Location

`tools/aios-transcriber/aios_transcriber.py`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ffmpeg not found` | `brew install ffmpeg` |
| Auth error (401/403) | Verificar API key no `.env` |
| Timeout errors | Reduzir `--workers` ou tentar novamente |
| Qualidade ruim | Tentar `--no-compress` ou `--bitrate 128k` |
| Script interrupted | Re-run — resume automático |
| Poucos arquivos | Use Groq (grátis): remover `--engine deepgram` |
