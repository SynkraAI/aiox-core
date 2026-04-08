---
name: groq-transcriber
description: "Transcrição em batch usando a API da Groq com Whisper, via aios-transcriber (ferramenta unificada). É como ter um estagiário que digita na velocidade "
  Transcrição em batch de áudios usando Groq Whisper API via aios-transcriber.
  Auto-compressão, rotação de múltiplas API keys, split de arquivos grandes e resume automático.
  Use para transcrever qualquer volume de áudio de forma rápida e eficiente.
risk: safe
source: self
paths:
  - "skills/groq-transcriber/"
lazy_load: true
context_budget: 800

version: 1.0.0
category: development
tags: [SKILL]
---

# Groq Transcriber

Transcrição em batch usando a API da Groq com Whisper, via **aios-transcriber** (ferramenta unificada). É como ter um estagiário que digita na velocidade da luz — você entrega o áudio e ele devolve texto formatado.

## When to Use This Skill

| Cenário | Exemplo |
|---------|---------|
| Transcrever áudios de cursos, palestras, mentorias | "Transcreve as aulas do módulo 3" |
| Processar batch de múltiplos arquivos | "Transcreve tudo que está em ~/audios/" |
| Áudio em qualquer formato suportado | `.m4a`, `.wav`, `.mp3`, `.mp4`, `.mkv`, `.webm` |
| Transcrição rápida sem GPU local | Usa API da Groq — zero uso de RAM/GPU |
| Extrair legendas de YouTube | `aios-transcriber youtube` (legendas em segundos, sem download) |
| Volume pequeno a médio (1-30 arquivos) | Ideal para o tier gratuito da Groq |

## Do NOT Use This Skill When

| Cenário | Alternativa |
|---------|-------------|
| O áudio já tem transcrição | Batch detecta via resume — mas verifique antes |
| Transcrição em tempo real (streaming) | Use serviço de streaming dedicado |
| Diarização (identificação de falantes) | Use outro serviço (Assembly AI, etc.) |
| Volume grande (50+ arquivos longos) | Use `deepgram-transcriber` (`--engine deepgram`) |
| Precisa de workers paralelos | Deepgram suporta 3-5 workers; Groq processa 1 por vez |
| Qualidade máxima sem compressão importa | Teste `--no-compress`, mas considere Deepgram |

## Discovery Questions

Perguntas para fazer antes de executar. Use AskUserQuestion tool. Pule se o usuário já forneceu esse contexto.

1. **Qual a fonte do áudio? (arquivo local, diretório batch ou URL do YouTube)** — (define qual comando usar: `local`, `batch` ou `youtube`)
2. **Onde salvar as transcrições?** — (define `-o`, senão salva no diretório atual) *(opcional)*
3. **O idioma do áudio é pt-BR?** — (default é pt-BR; se for outro idioma, precisa do flag `--language`) *(opcional)*

## Prerequisites

| Requisito | Como verificar | Instalação |
|-----------|----------------|------------|
| Python 3.10+ | `python3 --version` | `brew install python` |
| ffmpeg | `which ffmpeg` | `brew install ffmpeg` |
| yt-dlp (para YouTube) | `which yt-dlp` | `pip install yt-dlp` |
| API keys | Verificar `skills/groq-transcriber/.env` | Criar com `GROQ_API_KEYS=key1,key2` |

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

1. Verificar se `skills/groq-transcriber/.env` existe e tem keys configuradas
2. Verificar se `ffmpeg` está instalado: `which ffmpeg`
3. Se for YouTube, verificar `yt-dlp`: `which yt-dlp`

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
- Arquivo de áudio corrompido → PULAR arquivo, reportar no final

**Completion criteria:** Script finaliza com 0 erros, ou com erros parciais reportados.

### Phase 3: Validate

1. Verificar se os arquivos `.md` foram criados no diretório de output
2. Spot-check: ler o início de 1-2 transcrições para validar qualidade
3. Verificar metadados no frontmatter (duração, word_count, idioma)
4. Reportar resultado final: arquivos transcritos, erros, tempo total

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
- Transparente para o usuário — output é um arquivo único

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

Keys em `skills/groq-transcriber/.env` (gitignored):

```bash
GROQ_API_KEYS=gsk_key1,gsk_key2,gsk_key3
```

**Prioridade de carregamento:**
1. `skills/groq-transcriber/.env` (preferido)
2. Variável de ambiente `GROQ_API_KEYS` (fallback)
3. Variável de ambiente `GROQ_API_KEY` (key única, fallback)

## Groq vs Deepgram — Quando Usar Cada Um

| Critério | Groq (esta skill) | Deepgram |
|----------|-------------------|----------|
| **Custo** | **Grátis** (free tier) | Pago ($0.0043/min) |
| **Volume ideal** | 1-30 arquivos | 50+ arquivos |
| **Velocidade** | ~3 min/hora de áudio | **~15s/hora de áudio** |
| **Paralelismo** | 1 por vez (rotação de keys) | **3-5 workers paralelos** |
| **Rate limits** | Frequentes (20 req/min/key) | Generosos |
| **Qualidade pt-BR** | Excelente (Whisper Large v3) | Excelente (Nova-3) |
| **YouTube** | **Sim** (legendas diretas) | Não |
| **Compressão automática** | Sim | Sim |
| **Resume automático** | Sim | Sim |

**Regra de ouro:** Comece com Groq (grátis). Se bater em rate limits ou tiver 50+ arquivos, mude para Deepgram (`--engine deepgram`).

## Constraints

- Maximum file size per request: 25MB (auto-split cuida disso)
- Rate limits: ~20 req/min por key (free tier)
- Formatos suportados: `.m4a`, `.wav`, `.mp3`, `.mp4`, `.mkv`, `.webm`
- Sem suporte a diarização (identificação de falantes)
- Sem suporte a streaming/tempo real

## Script Location

`tools/aios-transcriber/aios_transcriber.py`

## Troubleshooting

| Problema | Causa provável | Solução |
|----------|----------------|---------|
| `ffmpeg not found` | ffmpeg não instalado | `brew install ffmpeg` |
| `yt-dlp not found` | yt-dlp não instalado (YouTube) | `pip install yt-dlp` |
| Rate limit errors (429) | Poucas API keys ou volume alto | Adicionar mais keys no `.env` ou usar `--engine deepgram` |
| Auth error (401) | API key inválida ou expirada | Gerar nova key em console.groq.com e atualizar `.env` |
| File too large after split | Arquivo muito grande com alta bitrate | Reduzir `--bitrate` (ex: `32k`) |
| Transcrição com qualidade ruim | Compressão excessiva ou áudio ruidoso | Tentar `--no-compress` ou limpar áudio antes |
| Script interrupted mid-batch | Falha de rede ou rate limit global | Re-executar — resume automático retoma de onde parou |
| Volume grande (50+ arquivos) trava | Rate limits acumulam no free tier | Migrar para `--engine deepgram` com workers paralelos |
| YouTube URL não funciona | URL inválida ou vídeo privado | Verificar se o vídeo é público e a URL está correta |
| `.env` não encontrado | Arquivo não existe no path esperado | Criar `skills/groq-transcriber/.env` com `GROQ_API_KEYS=...` |
| Chunks desalinhados no split | Silêncio no meio do áudio causa corte ruim | Geralmente tolerável; se crítico, use `--no-compress` com arquivo menor |
| Output em idioma errado | Idioma detectado automaticamente errado | Forçar com `--language en` (ou outro código ISO) |

## Safety

- **API keys:** nunca expor keys em logs ou outputs. O script carrega do `.env` (gitignored).
- **Dados sensíveis:** transcrições podem conter informações confidenciais. Salve em diretórios adequados.
- **Custos:** Groq free tier não tem custo. Se usar Deepgram, monitore o consumo em console.deepgram.com.
