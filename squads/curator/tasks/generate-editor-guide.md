---
task-id: generate-editor-guide
name: Generate Editor Guide (GUIA_EDITOR.md)
agent: curator-chief
version: 1.0.0
purpose: Generate human-readable editor guide from YAML cut files via Python script

workflow-mode: automated
elicit: false

inputs:
  - name: cut_yaml
    type: file_path
    description: "Path to YAML cut file(s) — single file, directory, or glob pattern"
    required: true
  - name: output_dir
    type: directory_path
    description: "Override output directory (default: same dir as YAML)"
    required: false
  - name: format_filter
    type: enum
    description: "Filter by format type"
    required: false
    options: ["shorts", "longform", "longform_simple"]

outputs:
  - path: "output/curated/{source-slug}/cortes/{format}/{NN}_{name}_GUIA_EDITOR.md"
    format: markdown
    description: "Human-readable editor guide in pt-BR"

dependencies:
  scripts:
    - squads/curator/scripts/generate_editor_guide.py
---

# Task: Generate Editor Guide

**Command:** `*editor-guide {source-slug | yaml-path}`
**Execution Type:** Code (Python script — deterministic, no LLM judgment needed)

---

## Task Anatomy

```yaml
task_name: generate-editor-guide
status: active
responsible_executor: "worker (code execution)"
execution_type: code
input:
  required:
    - cut_yaml: "Path to YAML cut file(s) — single file, directory, or glob pattern"
  optional:
    - output_dir: "Override output directory (default: same dir as YAML)"
    - format_filter: "shorts | longform | longform_simple (default: auto-detect from YAML metadata.formato)"
output:
  file: "output/curated/{source-slug}/cortes/{format}/{NN}_{name}_GUIA_EDITOR.md"
  naming: |
    For each input .yaml file, produces a matching _GUIA_EDITOR.md in the same directory.
    Example: 04_ferramentas_e_pipeline.yaml → 04_ferramentas_e_pipeline_GUIA_EDITOR.md
action_items:
  - "Detect format from YAML metadata (shorts | longform | longform_simple)"
  - "Route to format-specific generator function"
  - "Generate MD guide with human-readable structure"
  - "Validate output exists alongside each YAML"
acceptance_criteria:
  - "_GUIA_EDITOR.md exists alongside each input .yaml cut file"
  - "Guide is 100% in Portuguese (pt-BR) — no English field names or technical jargon"
  - "Guide uses editor-friendly vocabulary: takes, cortes, jump cuts, pontes (NOT KEEP, REMOVE, BRIDGE, MQR, fora_janela, gap_antes)"
  - "Guide has clear linear flow: Resumo → Abertura → Fluxo Principal → Resumo Final"
  - "Each take includes: number, timestamp, full transcription, and instruction for what happens between this take and the next"
  - "Abertura section clearly separates engineered moments (out of order) from chronological flow"
  - "No technical data the editor doesn't need (scores, density, insertion counts, selection rationale)"
  - "STT disclaimer present at the top"
```

---

## Veto Conditions (BLOCKING)

| ID | Condition | Detection | Action |
|----|-----------|-----------|--------|
| VETO-01 | No roteiro_corte.yaml input | `cut_yaml` path does not exist or glob returns zero `.yaml` files | BLOCK — no cut script to generate guide from; run `*create-cut` first to produce a YAML cut file |
| VETO-02 | YAML without QG-004 validation | YAML file exists but `metadata.formato` field is absent or not one of `shorts`, `longform`, `longform_simple` | BLOCK — format field is required for generator routing; cut file may be incomplete or from an older template version |
| VETO-03 | Zero segments in cut script | YAML `momentos` list is empty or absent | BLOCK — cannot generate an editor guide with no takes; return to format-cut and ensure moments are assembled |

---

## Phase 1: Input Validation

**Executor:** Worker
**Duration:** ~5s

Verify all prerequisites before running the script.

### Pre-Actions

```yaml
pre_actions:
  loads:
    - id: "load-script"
      description: "Verify generate_editor_guide.py exists and has longform_simple support"
      source: "squads/curator/scripts/generate_editor_guide.py"
      required: true

  validations:
    - id: "val-yaml-exists"
      description: "At least one YAML cut file exists at the given path"
      check: "glob(input_path) returns >= 1 .yaml file"
      blocker: true
      error_message: "No YAML cut files found at path. Check path and try again."

    - id: "val-yaml-has-metadata"
      description: "Each YAML has metadata.formato field for format detection"
      check: "yaml.safe_load(file)['metadata']['formato'] in ['shorts', 'longform', 'longform_simple']"
      blocker: true
      error_message: "YAML missing metadata.formato. Ensure cut file follows template."

  questions: []
```

**Checkpoint (BLOCKING):**
- [ ] `generate_editor_guide.py` exists and is importable
- [ ] At least 1 YAML cut file found at input path
- [ ] All YAML files have `metadata.formato` field

---

## Phase 2: Guide Generation

**Executor:** Worker (code execution)
**Duration:** ~1-5s per YAML file

Run the Python script to generate editor guides from YAML cut files.

```yaml
steps:
  - step: 2.1
    action: "Run generate_editor_guide.py on input path"
    code: |
      python squads/curator/scripts/generate_editor_guide.py "{input_path}" [--output-dir "{output_dir}"]
    details: |
      The script:
      1. Finds all .yaml files at the path
      2. Auto-detects format from `metadata.formato`
      3. Routes to the correct generator:
         - `shorts` → `generate_shorts_guide()`
         - `longform_simple` → `generate_longform_simple_guide()`
         - `longform` → `generate_guide()`
      4. Writes `{filename}_GUIA_EDITOR.md` alongside each YAML

      **Output:** One _GUIA_EDITOR.md per YAML cut file.

  - step: 2.2
    action: "Validate each generated guide exists"
    checks:
      - "Corresponding _GUIA_EDITOR.md exists in same directory"
      - "File is non-empty (> 100 bytes)"
      - "File starts with '# GUIA DO EDITOR'"
```

**Checkpoint (BLOCKING):**
- [ ] One `_GUIA_EDITOR.md` generated per input YAML
- [ ] All output files are non-empty (> 100 bytes)
- [ ] All files start with `# GUIA DO EDITOR`

---

## Phase 3: Quality Check

**Executor:** Worker + Agent (spot-check)
**Duration:** ~30s

Spot-check generated guides for structural correctness and language compliance.

```yaml
steps:
  - step: 3.1
    action: "Verify guide structure (longform_simple format)"
    checks:
      required_sections:
        - "# GUIA DO EDITOR — {titulo} — Title with STT disclaimer"
        - "## Resumo Rápido — Duration, total takes, how-it-works explanation"
        - "## Abertura (primeiros ~2 minutos) — Hook + opening takes with transcriptions"
        - "## Fluxo Principal (ordem da conversa) — Chronological takes with instructions"
        - "## Resumo Final — Stats summary (takes na abertura, takes no fluxo, cortes, pontes)"

  - step: 3.2
    action: "Language compliance check"
    checks:
      must_be_true:
        - "100% Portuguese — no English field names"
        - "No technical jargon: MQR, KEEP, REMOVE, BRIDGE, fora_janela, gap_antes, densidade_keep, insercao_motivo"
        - "Uses editor vocabulary: takes, cortes secos, pontes, jump cuts, continuidade"

  - step: 3.3
    action: "Report delivery"
    format: |
      ✅ GUIA_EDITOR gerados:

      | Arquivo | Takes | Duração |
      |---------|-------|---------|
      | {path_1}_GUIA_EDITOR.md | {N} takes | ~{MM:SS} |
      | {path_2}_GUIA_EDITOR.md | {N} takes | ~{MM:SS} |

      📁 Location: output/curated/{source-slug}/cortes/{format}/
```

**Checkpoint (BLOCKING):**
- [ ] All required sections present in correct order
- [ ] Zero English technical terms in output
- [ ] Delivery report presented with exact file paths

---

## Template

```yaml
template:
  name: "guia-editor-longform-simple"
  description: "Output structure for longform_simple editor guides (generated by Python, not template)"
  note: "This template documents the EXPECTED output — actual generation is in generate_editor_guide.py"
  inline: |
    # GUIA DO EDITOR — {titulo}

    > Transcrição automática (STT). Nomes próprios e termos técnicos podem ter
    > erros de grafia. Consulte o áudio original em caso de dúvida.

    ## Resumo Rápido
    - **Duração estimada:** ~{duracao}
    - **Total de takes:** {total_takes}
    - **Como funciona:** Os primeiros ~2 minutos usam {N} momentos escolhidos a
      dedo (podem estar fora da ordem). Depois disso, o vídeo segue a ordem
      natural da conversa — é só cortar os trechos marcados.

    ---

    ## Abertura (primeiros ~2 minutos)

    A abertura usa {N} momentos fora da ordem para prender atenção.

    ### Take 1 — GANCHO ({timestamp_inicio} → {timestamp_fim})
    > {transcricao}

    **Nota:** {instrucao_editor}

    ### Take 2 — ({timestamp_inicio} → {timestamp_fim})
    > {transcricao}

    [... mais takes de abertura ...]

    **Depois do Take {N}, o vídeo segue na ordem natural da conversa.**

    ---

    ## Fluxo Principal (ordem da conversa)

    A partir daqui, siga a ordem abaixo. Entre cada take, corte o que estiver
    entre eles (são trechos de filler/repetição que foram removidos).
    Se houver um trecho de ligação marcado como "ponte", mantenha.

    ### Take {N} — ({timestamp_inicio} → {timestamp_fim})
    > {transcricao}
    **→ Corte seco até o próximo take** ({duracao_gap}s de filler removido)

    ### Take {N+1} — ({timestamp_inicio} → {timestamp_fim})
    > {transcricao}
    **→ Manter ponte até próximo take** (ligação natural de {duracao_ponte}s)
    > Texto da ponte: "{bridge_text}"

    [... continua ...]

    ---

    ## Resumo Final
    - Takes na abertura: {N}
    - Takes no fluxo principal: {N}
    - Cortes secos (jump cuts): {N}
    - Pontes mantidas: {N}
    - Continuidades naturais: {N}
```

---

## Output Example

Concrete snippet of a generated `_GUIA_EDITOR.md` for a `longform_simple` cut:

```markdown
# GUIA DO EDITOR — Como a IA Está Mudando o Mercado de Trabalho

> Transcrição automática (STT). Nomes próprios e termos técnicos podem ter
> erros de grafia. Consulte o áudio original em caso de dúvida.

## Resumo Rápido
- **Duração estimada:** ~22 minutos
- **Total de takes:** 18
- **Como funciona:** Os primeiros ~2 minutos usam 3 momentos escolhidos a
  dedo (podem estar fora da ordem). Depois disso, o vídeo segue a ordem
  natural da conversa — é só cortar os trechos marcados.

---

## Abertura (primeiros ~2 minutos)

A abertura usa 3 momentos fora da ordem para prender atenção.

### Take 1 — GANCHO (04:12 → 04:38)
> "A IA não vai substituir você. Ela vai substituir alguém que sabe usar IA melhor do que você. Isso é um ponto completamente diferente."

**Nota:** Corte seco direto para o Take 2. Não inclua o que vem antes.

### Take 2 — (43:07 → 43:41)
> "Quando eu parei de tentar otimizar meu tempo e comecei a otimizar minha energia, tudo mudou. Eu fazia 14 horas por dia e produzia menos do que hoje em 6 horas."

**Nota:** Corte seco para o Take 3.

### Take 3 — (18:55 → 19:22)
> "Mandamos 400 cold emails. Tivemos 47 respostas positivas. Isso é 11.75% de resposta — a média do mercado é 2 a 3%."

**Depois do Take 3, o vídeo segue na ordem natural da conversa.**

---

## Fluxo Principal (ordem da conversa)

A partir daqui, siga a ordem abaixo. Entre cada take, corte o que estiver
entre eles (são trechos de filler/repetição que foram removidos).

### Take 4 — (06:30 → 07:15)
> "Vamos começar com o básico. O que é um agente de IA? É um sistema que percebe o ambiente, toma decisões e age de forma autônoma."

**→ Corte seco até o próximo take** (48s de filler removido)

### Take 5 — (08:03 → 08:44)
> "A diferença entre um chatbot e um agente é que o agente tem memória, tem ferramentas, e tem autonomia para agir sem precisar de você em cada passo."

**→ Manter ponte até próximo take** (ligação natural de 12s)
> Texto da ponte: "E é exatamente isso que a gente vai construir hoje."

---

## Resumo Final
- Takes na abertura: 3
- Takes no fluxo principal: 15
- Cortes secos (jump cuts): 11
- Pontes mantidas: 4
- Continuidades naturais: 2
```

---

## Post-Actions

```yaml
post_actions:
  validations:
    - id: "post-val-files"
      description: "All GUIA_EDITOR.md files exist alongside YAMLs"
      check: "count(GUIA_EDITOR.md) == count(input .yaml)"

    - id: "post-val-language"
      description: "No English technical terms in output"
      check: "grep -c 'fora_janela|gap_antes|REMOVE|BRIDGE|KEEP|densidade|insercao_motivo|MQR' == 0"

  saves:
    - id: "save-guides"
      destination: "output/curated/{source-slug}/cortes/{format}/"
      filename: "{NN}_{name}_GUIA_EDITOR.md"

  next_steps:
    options:
      1:
        label: "Revisar guias gerados"
        action: "Abrir os arquivos _GUIA_EDITOR.md e verificar legibilidade"
      2:
        label: "Enviar para editor"
        action: "Entregar YAML + GUIA_EDITOR ao editor de vídeo"
      3:
        label: "Regenerar (se script foi atualizado)"
        action: "python squads/curator/scripts/generate_editor_guide.py {path}"
      4:
        label: "Outro"
        action: "custom"
```

---

## Dependencies

| Type | File | When Used |
|------|------|-----------|
| Script | `squads/curator/scripts/generate_editor_guide.py` | Core execution — generates the MD |
| Input | `output/curated/{source-slug}/cortes/{format}/*.yaml` | YAML cut files to process |
| Template ref | `squads/curator/templates/longform-simple-cut-tmpl.yaml` | Defines YAML structure script reads |
| Template ref | `squads/curator/templates/shorts-cut-tmpl.yaml` | Defines YAML structure for shorts |

---

## Format-Specific Guide Structure

### Longform Simple

```
Resumo Rápido → Abertura (takes engenheirados) → Fluxo Principal (takes cronológicos) → Resumo Final
```

**Key rules:**
- Abertura takes are numbered starting at 1
- Fluxo Principal takes continue numbering from where abertura left off
- Between each take in Fluxo Principal, show one of:
  - `→ Corte seco (jump cut)` — gap was REMOVE, editor cuts it
  - `→ Manter ponte` — gap was BRIDGE, include the bridge text
  - `→ Continuidade` — moments are adjacent, no gap

### Shorts

```
Hook Analysis → Beats Table → Detailed Beats → Text Overlays → Confidence
```

### Longform (Professional)

```
Cold Open → Chapter Summary → Detailed Chapters (with moments, bridges, continuity checks)
```

---

## Anti-Patterns

```yaml
never_do:
  - "Include MQR scores, density ratios, or selection rationale in editor guide"
  - "Mix English and Portuguese in the output"
  - "Use framework jargon (KEEP, REMOVE, BRIDGE, fora_janela, gap_antes)"
  - "Show two separate moment lists (summary table + details) without clear purpose"
  - "Omit transcription text from takes"
  - "Leave the editor guessing what to do between takes"

always_do:
  - "100% Portuguese in the output"
  - "Every take has: number, timestamp, transcription, instruction"
  - "Clear separation: Abertura (engineered) vs Fluxo Principal (chronological)"
  - "Between-take instructions using editor vocabulary"
  - "STT disclaimer at top"
  - "Resumo Final with counts"
```

---

## Usage

```bash
# Generate guides for all cuts in a directory
python squads/curator/scripts/generate_editor_guide.py output/curated/ia-vale-silicio-futuro-humanidade/cortes/longform/

# Generate guide for a single cut file
python squads/curator/scripts/generate_editor_guide.py "output/curated/ia-vale-silicio-futuro-humanidade/cortes/longform/04_ferramentas_e_pipeline.yaml"

# Generate with custom output directory
python squads/curator/scripts/generate_editor_guide.py output/curated/my-source/cortes/shorts/ --output-dir output/guides/

# Via curator-chief
@curator:curator-chief
*editor-guide ia-vale-silicio-futuro-humanidade
```

---

_Task Version: 1.0.0_
_Agent: curator-chief (code execution via squads/curator/scripts/generate_editor_guide.py)_
_Quality Gate: Part of QG-004 (editor guide exists alongside each YAML)_
_Input: YAML cut files (any format)_
_Output: _GUIA_EDITOR.md files (human-readable, 100% pt-BR)_
