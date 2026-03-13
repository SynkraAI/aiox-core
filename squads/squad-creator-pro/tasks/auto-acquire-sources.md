---
task-id: auto-acquire-sources
name: Automated Source Acquisition
version: 2.0.0
estimated-time: 15-30 min
complexity: low

# NOTA: Este task agora é executado através do workflow wf-auto-acquire-sources.yaml
# que integra os MCPs descobertos (youtube-transcript, firecrawl, etc.)
# Ver: workflows/wf-auto-acquire-sources.yaml

workflow_reference: wf-auto-acquire-sources.yaml

inputs:
  required:
    - mind_name: "Nome do expert"
    - domain: "Área de expertise"
  optional:
    - target_count: "Número alvo de fontes (default: 15)"

outputs:
  primary:
    - acquired_sources: "Lista de fontes adquiridas automaticamente"
    - sources_inventory.yaml: "Inventário estruturado"

tools:
  installed:
    - exa: "Web search"
  primary:
    - youtube-captions: "YouTube transcript extraction (search + single video + playlist)"
    - aios-transcriber: "Unified transcriber (YouTube via youtube-captions, local via Deepgram/Whisper)"
  recommended:
    - firecrawl-mcp: "Web scraping"
  optional:
    - mcp-youtube-transcript: "Alternative MCP for YouTube transcripts (if installed)"
  see_also: "docs/TOOL-RECOMMENDATIONS.md"

elicit: false
---

# Automated Source Acquisition

> **Princípio:** "Maximize o material antes de extrair. Mais fontes = maior fidelidade."
>
> **Modo:** Executa automaticamente, sem input do usuário.

---

## FASE 1: YOUTUBE TRANSCRIPT MINING (5 min)

### 1.1 Queries de Busca

Execute estas buscas no YouTube:

```
"{mind_name}" interview
"{mind_name}" podcast
"{mind_name}" keynote
"{mind_name}" masterclass
"{mind_name}" talk
"{mind_name}" {domain} advice
```

### 1.2 Critérios de Seleção

Priorizar vídeos que:
- Têm 10+ minutos (conteúdo substancial)
- Expert é o entrevistado principal
- Legenda/transcrição disponível
- Alto engagement (views, likes)

### 1.3 Extração de Transcrição

```yaml
youtube_sources:
  - id: "YT01"
    title: ""
    channel: ""
    duration: ""
    url: ""
    transcript_status: "available|extracted|unavailable"
    tier: 1  # Primário - expert falando
    key_topics: []
```

**Ferramentas:**
- `youtube-captions --search "{mind_name}" --max 100` (auto-discovery + extraction em segundos)
- `aios-transcriber youtube "{url}"` (single video/playlist via caption extraction)
- `aios-transcriber local "{file}" --engine whisper` (fallback para arquivos sem legenda)

---

## FASE 2: BOOK SUMMARY MINING (5 min)

### 2.1 Identificar Livros do Expert

```
"{mind_name}" books
"{mind_name}" author
books by "{mind_name}"
```

### 2.2 Buscar Resumos Disponíveis

Para cada livro encontrado, buscar:

```
"{book_title}" summary
"{book_title}" book notes
"{book_title}" key takeaways
"{book_title}" chapter summary
```

### 2.3 Fontes de Resumos

| Fonte | Tier | Confiança |
|-------|------|-----------|
| Blinkist | 2 | Média (condensado) |
| Shortform | 2 | Alta (detalhado) |
| Four Minute Books | 3 | Baixa (muito condensado) |
| Blog reviews | 2-3 | Varia |

```yaml
book_sources:
  - id: "BK01"
    title: ""
    year: ""
    full_book_available: true|false
    summary_sources:
      - source: ""
        url: ""
        depth: "detailed|condensed|highlights"
    tier: 2  # Secundário até ter livro completo
```

---

## FASE 3: PODCAST ARCHIVE MINING (5 min)

### 3.1 Buscar Aparições em Podcasts

```
"{mind_name}" podcast guest
"{mind_name}" appeared on
"{mind_name}" interview episode
site:spotify.com "{mind_name}"
site:podcasts.apple.com "{mind_name}"
```

### 3.2 Extração de Áudio/Transcrição

```yaml
podcast_sources:
  - id: "PD01"
    show_name: ""
    episode_title: ""
    host: ""
    duration: ""
    url: ""
    transcript_available: true|false
    tier: 1  # Primário - expert falando
```

---

## FASE 4: ARTICLE/BLOG MINING (5 min)

### 4.1 Conteúdo Escrito pelo Expert

```
"{mind_name}" blog
"{mind_name}" newsletter
"{mind_name}" articles
site:medium.com "{mind_name}"
site:linkedin.com/pulse "{mind_name}"
```

### 4.2 Conteúdo Sobre o Expert

```
"{mind_name}" methodology
"{mind_name}" framework explained
"{mind_name}" principles
"{mind_name}" biography
```

```yaml
article_sources:
  - id: "AR01"
    title: ""
    author: ""  # É o expert ou sobre o expert?
    source: ""
    url: ""
    tier: 1|2  # 1 se autor é o expert, 2 se sobre
```

---

## FASE 5: CONSOLIDAÇÃO

### 5.1 Merge com Fontes Existentes

```yaml
acquisition_summary:
  youtube_found: 0
  books_found: 0
  podcasts_found: 0
  articles_found: 0
  total_new: 0

  by_tier:
    tier_1: 0
    tier_2: 0
    tier_3: 0

  estimated_content:
    hours: 0
    pages: 0
```

### 5.2 Priorização para Download

```yaml
download_queue:
  priority_1_immediate:
    - source_id: ""
      type: ""
      action: "download_transcript|download_pdf|save_url"

  priority_2_if_time:
    - source_id: ""
      type: ""
      action: ""

  priority_3_backup:
    - source_id: ""
      type: ""
      action: ""
```

---

## OUTPUT: ACQUIRED SOURCES

```yaml
# ═══════════════════════════════════════════════════════════════
# AUTO-ACQUIRED SOURCES - {MIND_NAME}
# Domain: {DOMAIN}
# Acquired: {DATE}
# ═══════════════════════════════════════════════════════════════

acquired_sources:
  metadata:
    mind_name: ""
    domain: ""
    acquisition_date: ""
    total_found: 0
    auto_acquired: true

  # ─────────────────────────────────────────────────────────────
  # YOUTUBE TRANSCRIPTS
  # ─────────────────────────────────────────────────────────────
  youtube:
    count: 0
    items:
      - id: "YT01"
        title: ""
        url: ""
        duration: ""
        transcript_path: ""
        tier: 1

  # ─────────────────────────────────────────────────────────────
  # BOOK SUMMARIES
  # ─────────────────────────────────────────────────────────────
  books:
    count: 0
    items:
      - id: "BK01"
        title: ""
        year: ""
        summary_source: ""
        summary_path: ""
        full_book_available: false
        tier: 2

  # ─────────────────────────────────────────────────────────────
  # PODCASTS
  # ─────────────────────────────────────────────────────────────
  podcasts:
    count: 0
    items:
      - id: "PD01"
        show: ""
        episode: ""
        url: ""
        transcript_path: ""
        tier: 1

  # ─────────────────────────────────────────────────────────────
  # ARTICLES
  # ─────────────────────────────────────────────────────────────
  articles:
    count: 0
    items:
      - id: "AR01"
        title: ""
        url: ""
        content_path: ""
        tier: 1|2

# ═══════════════════════════════════════════════════════════════
```

---

## INTEGRATION WITH collect-sources.md

Este task roda ANTES ou DURANTE collect-sources.md:

```yaml
workflow_integration:
  trigger: "collect-sources.md FASE 1"
  mode: "parallel"
  merge_point: "collect-sources.md FASE 2"

  decision_tree:
    if_yolo_mode:
      - "Rodar auto-acquire PRIMEIRO"
      - "Merge resultados em sources_by_tier"
      - "Prosseguir para validação"

    if_quality_mode:
      - "Rodar auto-acquire como COMPLEMENTO"
      - "Priorizar materiais do usuário"
      - "Auto-acquired = backup/triangulação"
```

---

## QUALITY CHECK

- [ ] 5+ vídeos YouTube encontrados com transcrição
- [ ] Livros principais identificados
- [ ] 3+ podcasts com aparição do expert
- [ ] Artigos escritos pelo expert encontrados
- [ ] Fontes classificadas por tier
- [ ] Download queue priorizada

---

**Squad Architect | Auto-Acquire v1.0**
*"More sources = higher fidelity. Automate the obvious."*
