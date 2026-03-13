# TRANS-5: Consolidar referências de tools de transcrição nos squads

**Status:** Ready for Review
**Priority:** P1 (High)
**Effort:** 2h
**Sprint:** Transcription Quality Sprint
**Source:** Auditoria squad-chief + oalanicolas 2026-03-13

---

## Context

Após TRANS-1 (unificação youtube-captions como lib) e TRANS-2 (veto conditions), os tools estão consolidados. Mas os **squads consumidores** ainda referenciam ferramentas deprecadas:

- `video-transcriber`: 11 referências ativas em 3 squads (deprecated desde commit b7ab6e61e)
- `mcp-youtube-transcript`: 10 referências em squad-creator-pro (MCP não instalado, tool nativo existe)
- `youtube-transcript-api`: 2 referências diretas (já integrado via youtube-captions)

### Arquitetura atual (pós TRANS-1)

```
youtube-captions  ← ENGINE (standalone + lib, search mode exclusivo)
       ↑
aios-transcriber  ← WRAPPER (importa youtube-captions + Deepgram/Whisper)
```

### O que cada squad deveria referenciar

| Cenário | Tool canônico |
|---------|---------------|
| Auto-discover vídeos de expert | `youtube-captions --search` |
| Extrair legenda 1 vídeo/playlist | `aios-transcriber youtube` |
| Transcrever arquivo local | `aios-transcriber local` |
| Batch processar diretório | `aios-transcriber batch` |

## Acceptance Criteria

- [x] **AC-1:** Zero referências a `video-transcriber` em squads ativos
  - squads/mind-content-updater/ (README, tasks)
  - squads/media-processor/ (README, tasks)
  - squads/knowledge-base-builder/ (README)

- [x] **AC-2:** `auto-acquire-sources.md` referencia `youtube-captions --search` como tool primário (não mcp-youtube-transcript)
  - squads/squad-creator-pro/tasks/auto-acquire-sources.md
  - squads/squad-creator-pro/workflows/wf-auto-acquire-sources.yaml
  - squads/squad-creator-pro/workflows/wf-clone-mind.yaml

- [x] **AC-3:** `tool-registry.yaml` atualizado com status correto de cada tool
  - youtube-captions: status active, primary
  - aios-transcriber: status active, wrapper
  - video-transcriber: status deprecated
  - mcp-youtube-transcript: status optional (fallback)

- [ ] **AC-4:** .claude/commands/ sincronizado (refs atualizadas nos READMEs gerados) — pendente sync

## File List

| File | Action | Description |
|------|--------|-------------|
| `squads/mind-content-updater/README.md` | MODIFY | video-transcriber → aios-transcriber |
| `squads/mind-content-updater/tasks/collect-content.md` | MODIFY | video-transcriber → aios-transcriber |
| `squads/media-processor/README.md` | MODIFY | video-transcriber → aios-transcriber |
| `squads/media-processor/tasks/download-youtube.md` | MODIFY | video-transcriber → aios-transcriber |
| `squads/knowledge-base-builder/README.md` | MODIFY | video-transcriber → aios-transcriber |
| `squads/squad-creator-pro/tasks/auto-acquire-sources.md` | MODIFY | mcp-youtube-transcript → youtube-captions |
| `squads/squad-creator-pro/workflows/wf-auto-acquire-sources.yaml` | MODIFY | Atualizar tool_priority |
| `squads/squad-creator-pro/workflows/wf-clone-mind.yaml` | MODIFY | Atualizar tool_priority |
| `squads/squad-creator-pro/data/tool-registry.yaml` | MODIFY | Atualizar status dos tools |

## Definition of Done

- [x] `grep -r "video-transcriber" squads/ --include="*.md" --include="*.yaml"` retorna 0 resultados
- [x] Tool registry reflete arquitetura real
- [ ] .claude/commands/ atualizado via sync (pendente @devops)

## Execution Summary (2026-03-13)

### Squads atualizados
| Squad | Arquivos | Refs removidas |
|-------|----------|---------------|
| mind-content-updater | 9 | 30 (video-transcriber → aios-transcriber + youtube-captions) |
| media-processor | 11 | 90+ (video-transcriber → aios-transcriber, CLI commands remapped) |
| knowledge-base-builder | 5 | 5 (video-transcriber → aios-transcriber) |
| squad-creator-pro | 3 | 10 (mcp-youtube-transcript rebaixado, youtube-captions como primário) |

### Verificação final
```
grep -r "video-transcriber" squads/ --include="*.md" --include="*.yaml" → 0 resultados
```
