# AIOS Transcriber

Unified media transcription tool. Routes to the fastest path automatically:

- **YouTube** → caption extraction (seconds, no download)
- **Local files** → Deepgram API (fast, paid) or Whisper local (free, slower)
- **Hotmart/Cademi** → download + transcription

## Quick Start

```bash
# YouTube (fast path — subtitles, no download)
python3 tools/aios-transcriber/aios_transcriber.py youtube "https://youtube.com/watch?v=xxx" -o ~/output/

# Local file (will ask which engine: Deepgram or Whisper)
python3 tools/aios-transcriber/aios_transcriber.py local ~/video.mp4 -o ~/output/

# Local file (Deepgram, explicit)
python3 tools/aios-transcriber/aios_transcriber.py local ~/video.mp4 -o ~/output/ --engine deepgram

# Local file (Whisper local, explicit)
python3 tools/aios-transcriber/aios_transcriber.py local ~/video.mp4 -o ~/output/ --engine whisper

# Batch directory
python3 tools/aios-transcriber/aios_transcriber.py batch ~/Downloads/curso/ -o ~/output/

# Playlist YouTube
python3 tools/aios-transcriber/aios_transcriber.py youtube --playlist "https://youtube.com/playlist?list=xxx" -o ~/output/
```

## Requirements

- Python 3.10+
- `yt-dlp`: `pip install yt-dlp`
- `ffmpeg`: `brew install ffmpeg`
- For Deepgram: API key configured (see below)
- For Whisper: `pip install mlx-whisper` (Apple Silicon) or `pip install openai-whisper`

## Engines

### Deepgram API (recommended for speed)
- ~15s per hour of audio
- ~$0.0043/min (~R$2.50/hora)
- Parallel workers (3-5 simultaneous)
- Smart formatting with paragraphs

### Whisper local (free alternative)
- Runs locally on GPU/CPU
- Slower but free
- Models: tiny, base, small, medium (default), large
- Auto-detects: mlx-whisper > faster-whisper > openai-whisper > CLI

**If no engine is specified, the tool asks interactively.**

## API Keys

### Deepgram

Configure in `.aios/skills/groq-transcriber/.env` or `.aios/skills/deepgram-transcriber/.env`:
```
DEEPGRAM_API_KEY=your_key_here
```

## Commands

| Command | Description |
|---------|-------------|
| `youtube <url>` | Extract YouTube captions (fast, no download) |
| `local <file>` | Transcribe local audio/video file |
| `batch <dir>` | Batch process a directory |
| `hotmart <url>` | Download Hotmart + transcribe |
| `cademi <url>` | Download Cademi + transcribe |

## Flags

| Flag | Default | Description |
|------|---------|-------------|
| `-o, --output` | `.` | Output directory |
| `--engine` | ask | `deepgram` or `whisper` |
| `--language` | `pt-BR` | Language code |
| `--workers` | `3` | Parallel workers (Deepgram) |
| `--whisper-model` | `medium` | Whisper model size |
| `--no-compress` | off | Skip audio compression |
| `--bitrate` | `64k` | Compression bitrate |
| `--audio-only` | on | Download audio only (Hotmart/Cademi) |
| `--with-video` | off | Keep video files |

## Output Format

All engines produce identical markdown with YAML frontmatter:

```markdown
---
title: "Video Title"
source: "URL or filepath"
source_type: youtube_captions | deepgram_api | whisper_local
engine: youtube-captions | deepgram-nova-3 | whisper-mlx-medium
language: "pt-BR"
duration: "00:15:30"
word_count: 2450
transcribed_at: "2026-03-13 12:00"
---

# Video Title

Transcription text here...
```

## Features

- **Auto-compression**: MP3 mono 16kHz 64kbps before upload (74%+ reduction)
- **File splitting**: Auto-split files >24MB into 10min chunks
- **Resume**: Batch operations track state, resume after interruption
- **Parallel workers**: Deepgram supports concurrent transcription

## Architecture

```
tools/aios-transcriber/
├── aios_transcriber.py       # CLI entry point
└── lib/
    ├── youtube.py             # YouTube fast path (wraps youtube-captions)
    ├── deepgram_engine.py     # Deepgram API (urllib, zero deps)
    ├── whisper_engine.py      # Local Whisper (mlx/faster/openai)
    ├── audio.py               # ffmpeg compression
    ├── splitter.py            # File splitting for large uploads
    ├── formatter.py           # Standardized markdown output
    └── state.py               # Resume state management
```
