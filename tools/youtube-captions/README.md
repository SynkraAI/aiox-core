# YouTube Captions

Extrai legendas/captions do YouTube em segundos (sem baixar audio). Output .md pronto para `/etl-universal-converter`.

## Uso

```bash
# Video unico
python tools/youtube-captions/youtube_captions.py "https://youtube.com/watch?v=xxx" -o ~/transcripts/

# Playlist inteira
python tools/youtube-captions/youtube_captions.py --playlist "https://youtube.com/playlist?list=xxx" -o ~/transcripts/

# Idioma especifico
python tools/youtube-captions/youtube_captions.py "URL" -l en -o ~/transcripts/

# Output JSON
python tools/youtube-captions/youtube_captions.py "URL" --format json -o ~/transcripts/
```

## Prioridade de Legendas

1. Legendas manuais > auto-geradas
2. Idioma: pt-BR > pt > en > en-US > es

## Output

Arquivo .md com frontmatter:

```yaml
---
title: "Titulo do Video"
channel: "Nome do Canal"
date: "2024-01-15"
language: "pt-BR"
subtitle_type: "manual"
duration: "00:15:30"
source_url: "https://www.youtube.com/watch?v=xxx"
source_type: youtube_captions
word_count: 2450
extracted_at: "2026-03-13 10:00"
---
```

## Fluxo Completo

```
youtube_captions.py <url> -o ~/transcripts/     # Segundos
/etl-universal-converter *convert ~/transcripts/video.md  # Decupagem
```

## Requisitos

- Python 3.10+
- yt-dlp (`pip install yt-dlp`)
