# Media Processor — Knowledge Base

## Overview

O media-processor é um meta-orchestrator que unifica ferramentas existentes em um pipeline único. Ele NÃO reimplementa lógica de download ou transcrição — apenas coordena as ferramentas certas na ordem certa.

---

## Architecture

```
User Request
    │
    ▼
┌──────────────┐
│ media-chief  │ ← Orchestrator (single agent)
│   (Atlas)    │
└──────┬───────┘
       │
       ├─── Phase 1: classify-request
       │         │
       ├─── Phase 2: download-{platform}
       │         │ QG-001
       ├─── Phase 3: transcribe-media
       │         │ QG-002
       ├─── Phase 4: sculpt-transcript ──→ /transcript-sculptor
       │         │
       ├─── Phase 5: distill-content ──→ /video-content-distillery
       │         │
       └─── Phase 6: build-knowledge-base ──→ /knowledge-base-builder
                 │ QG-003
```

---

## Supported Platforms

| Platform | Tool | CLI | Auth |
|----------|------|-----|------|
| Hotmart | hotmart-downloader | `hotmart-dl` | Browser cookies |
| Cademi | cademi-downloader | `cademi-dl` | Browser cookies (Playwright) |
| YouTube | aios-transcriber | `aios-transcriber` | None (public) / cookies (private) |
| Local files | aios-transcriber | `aios-transcriber ingest` | None |

---

## Key Concepts

### Per-Item Streaming
Cada item avança individualmente pelas fases. Não esperamos todos os downloads terminarem para começar a transcrever. Exceção: KB build espera todos os masterpieces.

### Resume Support
Toda sessão tem um `processing-manifest.json` que rastreia status por item e por fase. Se o pipeline for interrompido, `*resume` lê o manifest e continua do ponto de parada.

### Session Isolation
Cada execução cria um diretório de sessão: `sessions/mp-YYYY-MMDD-NNN/`. Sessões são independentes e não interferem entre si.

### Quality Gates
- **QG-001:** Valida downloads (file existence, size, ffprobe)
- **QG-002:** Valida transcrições (word count, hallucination, chunks)
- **QG-003:** Valida pipeline completo (item accounting, success rate, output integrity)

### Error Isolation
Falha em 1 item NÃO bloqueia os demais. Cada item tem tracking independente. Erros são logados no manifest e reportados no summary final.

---

## Pipeline Types

| Type | Command | Phases | Use Case |
|------|---------|--------|----------|
| Full | `*process` | 1-6 | Single URL, pipeline completo |
| Download only | `*download` | 1-2 | Apenas baixar mídia |
| Transcribe only | `*transcribe` | 1,3 | Arquivos locais já baixados |
| Batch | `*batch` | 1-6 | Cursos inteiros, playlists grandes |

---

## Delegation Pattern

O media-chief NÃO executa sculpt, distill ou KB build diretamente. Ele delega para squads especializados:

```
sculpt    → /transcript-sculptor:process {path}
distill   → /video-content-distillery:distill {path}
build_kb  → /knowledge-base-builder:ingest {directory}
```

---

## Whisper Model Fallback

Quando transcrição falha por OOM ou qualidade:
1. `medium` (default, melhor qualidade)
2. `small` (fallback, rápido)
3. `base` (último recurso)

---

## File Structure per Session

### Princípio: Lesson Folder = Unidade Atômica

Todos os artefatos de todas as fases vivem **dentro do folder da aula**. Não há diretórios separados para transcrições, masterpieces ou distilled — tudo fica co-localizado no lesson folder.

```
sessions/mp-YYYY-MMDD-NNN/
├── {Course Name}/                          # Hierarquia preservada do downloader
│   └── {NN}{SEP}{Module Name}/            # SEP = "_" (Hotmart) ou " - " (Cademi)
│       └── {NN}{SEP}{Lesson Name}/        # ← LESSON FOLDER (unidade atômica)
│           ├── video.mp4                   # Phase 2: Download
│           ├── video_16k.wav              # Phase 3: Audio prep (if applicable)
│           ├── transcription.json          # Phase 3: Raw Whisper output
│           ├── transcription_clean.json    # Phase 3: Clean transcription
│           ├── transcription_clean.md      # Phase 3: Markdown export
│           ├── stats.json                  # Phase 3: Metrics
│           ├── chunks/                     # Phase 3: Semantic chunks
│           │   ├── chunk-001.txt
│           │   └── manifest.json
│           ├── masterpiece.md              # Phase 4: Sculpted transcript
│           ├── quality-report.json         # Phase 4: Quality metrics
│           ├── edit-log.md                 # Phase 4: Edit changelog
│           ├── original_transcript.md      # Phase 4: Backup of input
│           └── distilled/                  # Phase 5: Distilled (optional)
│               ├── knowledge-fragments.json
│               ├── frameworks.json
│               ├── progressive-summary/
│               ├── multiplied-ideas.json
│               ├── atomized-content/
│               ├── metadata.json
│               └── distillation-report.json
├── knowledge-base/                         # Phase 6: KB batch (session level)
│   ├── knowledge-graph.json
│   ├── concepts/
│   ├── taxonomy.yaml
│   ├── index.md
│   └── kb-report.json
├── processing-manifest.json                # Rastreia cada lesson PATH
├── pipeline-status.json                    # Status global
└── pipeline-report.md                      # Relatório final
```

### Regras de Path

1. **output_dir de transcribe, sculpt = lesson folder** (mesmo dir do vídeo)
2. **output_dir de distill = lesson_folder/distilled/** (subfolder para evitar poluição)
3. **KB build opera no nível sessão** — scan recursivo encontra masterpieces na hierarquia
4. **Manifest rastreia paths reais** — `lesson_path: "Curso/01 - Módulo/01 - Aula"` em vez de IDs genéricos
5. **Ambos separadores aceitos** — Hotmart (`_`) e Cademi (` - `)
