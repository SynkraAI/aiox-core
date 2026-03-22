# Groq Transcriber

Transcrição em batch de áudios usando Groq Whisper API.

## Ativação

```
/AIOS:skills:groq-transcriber
```

## Features

- Auto-compressão (MP3 mono 16kHz)
- Rotação de múltiplas API keys
- Split automático de arquivos grandes
- Resume automático após interrupção

## Quick Start

```bash
GROQ_API_KEYS=key1,key2,key3 python3 tools/groq-batch-transcribe.py ./audios
```

## Referência completa

Ver `SKILL.md`
