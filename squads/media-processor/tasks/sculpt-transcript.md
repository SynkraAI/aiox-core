# Task: Sculpt Transcript

## Metadata
- **Task ID:** TASK-MP-002
- **Version:** 1.0.0
- **Status:** Active
- **Created:** 2026-02-23
- **Last Updated:** 2026-02-23
- **Owner:** @media-processor-coordinator
- **Executor Type:** Delegation (to transcript-sculptor squad)
- **Estimated Duration:** 10-40min (varies by transcript size)
- **Complexity:** HIGH

---

## Purpose

Delegar a escultura de transcrições brutas para o squad especializado transcript-sculptor, que aplica análise estrutural, edição de qualidade e refinamento narrativo para produzir masterpieces prontas para consumo.

**Por que esta task existe:**
- Transcrições brutas têm repetições, vícios de linguagem, estrutura fraca
- Transcript-sculptor tem 5 agentes especializados em qualidade editorial
- Separação de responsabilidades: media-processor foca em pipeline, sculptor foca em qualidade

**Delegation justificativa:**
- Transcript-sculptor é squad autônomo com expertise própria
- Workflow interno complexo (analyze → edit → validate → convert)
- Reutilizável para outros squads (renner-silva, dan-koe, hormozi já usam)

---

## Inputs

| Input | Type | Source | Required | Validation |
|-------|------|--------|----------|------------|
| `transcription_clean.md` | File path | Previous task (transcribe-media) | YES | File exists, > 100 words |
| `output_dir` | Directory path | Lesson folder (same dir as transcription) | YES | Writable directory |
| `quality_level` | String | Config or default | NO | One of: standard, high, masterpiece |
| `preserve_timestamps` | Boolean | Config or default | NO | true/false |
| `target_audience` | String | User-provided or config | NO | Technical, general, executive |

**Default Values:**
- `quality_level`: high (balanço qualidade/tempo)
- `preserve_timestamps`: false (remove timestamps para fluidez)
- `target_audience`: general

---

## Preconditions

### System Requirements
- [x] transcript-sculptor squad instalado em `squads/transcript-sculptor/`
- [x] Squad commands sincronizados em `.claude/commands/transcript-sculptor/`
- [x] Slash command `/transcript-sculptor:process` disponível

### Input Validation
- [x] `transcription_clean.md` existe e é legível
- [x] Arquivo > 100 palavras (validação mínima de conteúdo)
- [x] `output_dir` existe ou pode ser criado
- [x] Espaço em disco suficiente (estimativa: 1.5x tamanho do input)

### Dependencies
- [x] PREVIOUS: `transcribe-media.md` (deve ter completado com sucesso)
- [x] BLOCKED_BY: Nenhuma task concorrente no mesmo arquivo

---

## Execution Steps

### Step 1: Prepare Handoff
```bash
# Validate input
test -f "{transcription_clean.md}" || { echo "Input transcript not found"; exit 1; }

# Check word count (minimum 100 words)
WORD_COUNT=$(wc -w < "{transcription_clean.md}")
test "$WORD_COUNT" -ge 100 || { echo "Transcript too short: $WORD_COUNT words"; exit 1; }

# Create output directory
mkdir -p "{output_dir}"

# Log handoff
echo "Handing off to transcript-sculptor: {transcription_clean.md} ($WORD_COUNT words)"
```

### Step 2: Invoke Transcript-Sculptor Squad
```bash
# Activate squad via slash command
# This is a DELEGATION — the transcript-sculptor squad takes over
/transcript-sculptor:process "{transcription_clean.md}" "{output_dir}"
```

**What happens inside transcript-sculptor:**
1. **sculptor-chief** orchestrates workflow
2. **transcript-analyst** analyzes structure, identifies issues
3. **transcript-editor** applies edits (remove repetitions, fix flow, add structure)
4. **quality-guardian** validates quality against 7-point checklist
5. **doc-converter** exports final masterpiece.md

**Expected outputs from sculptor:**
- `masterpiece.md` — final sculpted transcript
- `quality-report.json` — validation results
- `edit-log.md` — changelog of modifications
- `structural-analysis.json` — detected structure (optional)

### Step 3: Validate Sculptor Output
```bash
# Check required outputs exist
test -f "{output_dir}/masterpiece.md" || { echo "Sculptor failed: masterpiece.md missing"; exit 1; }
test -f "{output_dir}/quality-report.json" || { echo "Sculptor failed: quality-report.json missing"; exit 1; }

# Validate masterpiece quality
MASTERPIECE_WORDS=$(wc -w < "{output_dir}/masterpiece.md")
test "$MASTERPIECE_WORDS" -ge 100 || { echo "Masterpiece too short: $MASTERPIECE_WORDS words"; exit 1; }

# Check quality score
QUALITY_SCORE=$(jq -r '.overall_score' "{output_dir}/quality-report.json")
test "$QUALITY_SCORE" != "null" || { echo "Invalid quality report"; exit 1; }

# Log completion
echo "Sculpting complete: masterpiece.md ($MASTERPIECE_WORDS words, quality: $QUALITY_SCORE)"
```

### Step 3.5: Apply PT-BR Accentuation Fix

**Skill:** `/AIOS:skills:pt-br-accentuation`
**Purpose:** Corrigir acentuação, cedilhas, tils e pontuação no masterpiece gerado.

Transcrições Whisper frequentemente geram texto sem acentos (ex: "nao", "voce", "funcao").
O sculptor melhora estrutura e fluidez, mas pode herdar problemas de acentuação do input.
Este passo aplica a skill pt-br-accentuation como pós-processamento obrigatório.

**Protocolo:**
1. Ler `{output_dir}/masterpiece.md`
2. Carregar skill `pt-br-accentuation` (`skills/pt-br-accentuation/SKILL.md`)
3. Aplicar o Protocolo de Auto-Verificação (10 passos):
   - Scan de tils (ã, õ) — terminações -ão, -ões
   - Scan de cedilhas (ç) — terminações -ção
   - Scan de acentos agudos (á, é, í, ó, ú) — verbos, -ível/-ável, -ário/-ório
   - Scan de circunflexos (â, ê, ô) — têm, vêm, você
   - Verificar crase (à)
   - Proparoxítonas — TODAS acentuadas (código, número, página)
4. Salvar masterpiece corrigido (sobrescreve o original)
5. Registrar no edit-log: "PT-BR accentuation fix applied ({N} corrections)"

**Veto Conditions:**
- Masterpiece não está em português → SKIP (não aplicar)
- Masterpiece tem < 50 palavras → SKIP

**Zero tolerance para Top 20 erros críticos:**
`nao`, `voce`, `sao`, `estao`, `sera`, `tambem`, `acao`, `funcao`, `informacao`,
`possivel`, `necessario`, `unico`, `codigo`, `numero`, `ja`, `ate`, `esta` (verbo),
`conteudo`, `disponivel`, `experiencia`

---

### Step 4: Archive Original
```bash
# Keep original transcript for reference (in same lesson folder)
cp "{transcription_clean.md}" "{output_dir}/original_transcript.md"

# Update session metadata
jq '.sculpt_phase.status = "completed" | .sculpt_phase.quality_score = '"$QUALITY_SCORE" \
  "{session_dir}/session-state.json" > "{session_dir}/session-state.tmp.json"
mv "{session_dir}/session-state.tmp.json" "{session_dir}/session-state.json"
```

**Note:** No symlink needed — masterpiece.md lives in the lesson folder alongside the video and transcription, making it easy to find.

### Step 5: Quality Gate Check (QG-003)
```bash
# Automated checks
QUALITY_THRESHOLD=7.0

# Extract quality score (0-10 scale)
QUALITY_SCORE=$(jq -r '.overall_score' "{output_dir}/quality-report.json")

# Compare with threshold
if (( $(echo "$QUALITY_SCORE < $QUALITY_THRESHOLD" | bc -l) )); then
  echo "WARNING: Quality score $QUALITY_SCORE below threshold $QUALITY_THRESHOLD"
  echo "Review quality-report.json for details"
  # DO NOT FAIL — log warning and proceed (user can manually review)
fi

# Log gate result
echo "QG-003 Sculpting Quality: PASS (score: $QUALITY_SCORE)"
```

---

## Outputs

| Output | Type | Location | Description |
|--------|------|----------|-------------|
| `masterpiece.md` | Markdown | `{lesson_folder}/` | Final sculpted transcript (primary output) |
| `quality-report.json` | JSON | `{lesson_folder}/` | Quality validation results |
| `edit-log.md` | Markdown | `{lesson_folder}/` | Changelog of modifications |
| `original_transcript.md` | Markdown | `{lesson_folder}/` | Copy of input (for reference) |
| `structural-analysis.json` | JSON | `{lesson_folder}/` | Detected structure (optional) |

**Output Structure (Lesson Folder = Unidade Atômica):**

Sculpt outputs go into the **same lesson folder** as the transcription, keeping all artifacts co-located.

```
{lesson_folder}/                    # = output_dir
├── video.mp4                       # Phase 2: Download
├── transcription.json              # Phase 3: Transcription
├── transcription_clean.json        # Phase 3: Clean
├── transcription_clean.md          # Phase 3: Markdown
├── stats.json                      # Phase 3: Stats
├── chunks/                         # Phase 3: Chunks
├── masterpiece.md                  # Phase 4: PRIMARY OUTPUT
├── quality-report.json             # Phase 4: Quality metrics
├── edit-log.md                     # Phase 4: What changed
├── original_transcript.md          # Phase 4: Reference copy
└── structural-analysis.json        # Phase 4: (optional) metadata
```

---

## Validation Rules

### Quality Gate QG-003: Sculpting Quality

**Automated Checks:**
```bash
# 1. All required files exist
test -f "{output_dir}/masterpiece.md"
test -f "{output_dir}/quality-report.json"

# 2. Masterpiece is non-empty
MASTERPIECE_WORDS=$(wc -w < "{output_dir}/masterpiece.md")
test "$MASTERPIECE_WORDS" -ge 100

# 3. Quality score is valid (0-10)
QUALITY_SCORE=$(jq -r '.overall_score' "{output_dir}/quality-report.json")
test "$QUALITY_SCORE" != "null"
test $(echo "$QUALITY_SCORE >= 0 && $QUALITY_SCORE <= 10" | bc -l) -eq 1

# 4. Quality report has all 7 checks
CHECK_COUNT=$(jq '.checks | length' "{output_dir}/quality-report.json")
test "$CHECK_COUNT" -eq 7
```

**Quality Report Structure (Expected):**
```json
{
  "overall_score": 8.5,
  "checks": [
    { "name": "structure", "score": 9, "status": "pass" },
    { "name": "flow", "score": 8, "status": "pass" },
    { "name": "clarity", "score": 9, "status": "pass" },
    { "name": "repetitions", "score": 7, "status": "pass" },
    { "name": "grammar", "score": 9, "status": "pass" },
    { "name": "formatting", "score": 8, "status": "pass" },
    { "name": "completeness", "score": 9, "status": "pass" }
  ],
  "issues": [],
  "recommendations": []
}
```

**Thresholds:**
- Overall score > 7.0 (RECOMMENDED, not blocking)
- All checks present (CRITICAL)
- Masterpiece word count > 100 (CRITICAL)

---

## Quality Threshold

**Pass Criteria:**
- masterpiece.md exists and > 100 words
- quality-report.json valid with 7 checks
- Quality score > 0 (any score accepted, warning if < 7.0)

**Fail Criteria (Retry):**
- Missing masterpiece.md
- Invalid quality-report.json
- Sculptor squad returned error
- Empty masterpiece (word count = 0)

**Escalation Criteria:**
- Retry limit exceeded (2 attempts)
- Sculptor squad unavailable
- Quality score < 5.0 (critical quality issue)
- User-requested manual review

---

## Integration Points

### Downstream Tasks
- **NEXT:** `distill-content.md` (consumes `masterpiece.md`) — OPTIONAL
- **ALTERNATIVE:** Skip to `build-knowledge-base.md` if --no-distill flag set

### Upstream Tasks
- **PREVIOUS:** `transcribe-media.md` (provides `transcription_clean.md`)

### Squad Coordination
- **Delegates to:** transcript-sculptor squad (autonomous execution)
- **Receives from sculptor:** masterpiece.md, quality-report.json
- **Updates:** Session state with sculpting completion status
- **Logs:** Quality score and any warnings to batch status

---

## Error Handling

### Common Errors

| Error | Cause | Recovery |
|-------|-------|----------|
| `Sculptor failed: masterpiece.md missing` | Sculptor squad error | Retry with --debug flag |
| `Quality score < 5.0` | Poor input quality | Escalate for manual review |
| `Sculptor squad unavailable` | Missing squad installation | Install transcript-sculptor |
| `Invalid quality-report.json` | Sculptor version mismatch | Update sculptor to latest |
| `Transcript too short` | Input < 100 words | Skip sculpting, use original |

### Retry Strategy
- Max retries: 2
- Backoff: 10s, 30s
- Retry conditions: Sculptor timeout, missing files
- NO retry: Quality score issues (escalate instead)

---

## Performance Notes

**Benchmarks (estimados):**
- 1000 words → ~5min sculpting
- 5000 words → ~15min sculpting
- 10000 words → ~30min sculpting

**Bottlenecks:**
- transcript-editor is CPU-intensive (NLP processing)
- quality-guardian runs multiple validation passes
- Parallel processing not supported within sculptor (sequential pipeline)

**Optimization Tips:**
- Use `quality_level: standard` for faster processing (lower quality)
- Use `quality_level: masterpiece` for critical content (slower, best quality)
- Process multiple items in parallel (one sculptor instance per item)

---

## Configuration

### Environment Variables
```bash
# Optional: Override sculptor defaults
export SCULPTOR_QUALITY_LEVEL="high"           # standard, high, masterpiece
export SCULPTOR_PRESERVE_TIMESTAMPS="false"    # true, false
export SCULPTOR_TARGET_AUDIENCE="general"      # technical, general, executive
```

### Config File (squad-manifest.yaml)
```yaml
sculpting:
  quality_level: high
  preserve_timestamps: false
  target_audience: general
  quality_threshold: 7.0
  retry_limit: 2
```

---

## Examples

### Example 1: Standard Sculpting (Cademi course lesson)
```bash
# Input — transcription lives in lesson folder
transcription_clean.md: "sessions/mp-2026-0302-001/Método 30D/01 - Seja Bem-Vindo/01 - Bem-vindo/transcription_clean.md"
output_dir: "sessions/mp-2026-0302-001/Método 30D/01 - Seja Bem-Vindo/01 - Bem-vindo/"

# Execution — output goes to SAME lesson folder
/transcript-sculptor:process \
  "sessions/mp-2026-0302-001/Método 30D/01 - Seja Bem-Vindo/01 - Bem-vindo/transcription_clean.md" \
  "sessions/mp-2026-0302-001/Método 30D/01 - Seja Bem-Vindo/01 - Bem-vindo/"

# Output — masterpiece.md alongside video and transcription
sessions/mp-2026-0302-001/Método 30D/01 - Seja Bem-Vindo/01 - Bem-vindo/
├── video.mp4                       # Already here
├── transcription_clean.md          # Already here
├── masterpiece.md                  # NEW (11,200 words, quality: 8.5)
├── quality-report.json             # NEW (7 checks, all pass)
├── edit-log.md                     # NEW (420 edits applied)
└── original_transcript.md          # NEW (backup)
```

### Example 2: High-Quality Sculpting (Critical Content)
```bash
# Override quality level
export SCULPTOR_QUALITY_LEVEL="masterpiece"

# Execution — same pattern, output in lesson folder
/transcript-sculptor:process \
  "{lesson_folder}/transcription_clean.md" \
  "{lesson_folder}/"

# Output
masterpiece.md (quality: 9.2, extra refinement applied)
```

### Example 3: Batch Processing (Multiple Lessons)
```bash
# Each lesson folder gets its own sculptor invocation
# The media-chief iterates over lesson folders and invokes sculptor per lesson

# Lesson 1
/transcript-sculptor:process \
  "sessions/mp-2026-0302-001/Curso/01 - Módulo 1/01 - Aula 1/transcription_clean.md" \
  "sessions/mp-2026-0302-001/Curso/01 - Módulo 1/01 - Aula 1/"

# Lesson 2
/transcript-sculptor:process \
  "sessions/mp-2026-0302-001/Curso/01 - Módulo 1/02 - Aula 2/transcription_clean.md" \
  "sessions/mp-2026-0302-001/Curso/01 - Módulo 1/02 - Aula 2/"

# Each lesson folder now contains its own masterpiece.md
```

---

## Transcript-Sculptor Squad Overview

**Agents (5):**
1. **sculptor-chief** — Orchestrator, workflow coordinator
2. **transcript-analyst** — Structure analysis, issue detection
3. **transcript-editor** — Content editing, refinement
4. **quality-guardian** — Quality validation, 7-point checklist
5. **doc-converter** — Format export, final delivery

**Workflow (4 phases):**
1. Analyze → structural-analysis.json
2. Edit → draft-masterpiece.md
3. Validate → quality-report.json
4. Convert → masterpiece.md

**Quality Checks (7):**
1. Structure (headings, sections, logical flow)
2. Flow (narrative coherence, transitions)
3. Clarity (readability, conciseness)
4. Repetitions (duplicates, filler words)
5. Grammar (spelling, punctuation, style)
6. Formatting (markdown, code blocks, lists)
7. Completeness (no missing sections, all content preserved)

---

## Notes

- **Delegation model:** Esta task NÃO executa o sculpting diretamente. Ela invoca o transcript-sculptor squad e valida o output.
- **Squad autonomy:** O transcript-sculptor tem seu próprio workflow interno. Esta task apenas coordena handoff e validação.
- **Quality vs Speed:** Use `quality_level: standard` para processar grandes volumes rapidamente. Use `masterpiece` para conteúdo crítico.
- **Timestamps:** Por padrão, timestamps são removidos para melhorar fluidez. Use `preserve_timestamps: true` se precisar de referência temporal.
- **Batch support:** Sculptor suporta processar múltiplos arquivos de uma vez (um masterpiece por arquivo).

---

## References

- Squad: `squads/transcript-sculptor/`
- Squad manifest: `squads/transcript-sculptor/squad-manifest.yaml`
- Slash commands: `.claude/commands/transcript-sculptor/`
- Quality Gate: `.aios-core/core/quality-gates/QG-003-sculpting-quality.md`
- Sculptor README: `squads/transcript-sculptor/README.md`

---

**Task Owner:** @media-processor-coordinator
**Delegated To:** transcript-sculptor squad (@sculptor-chief)
**Last Review:** 2026-02-23
**Next Review:** After 10 executions or sculptor major update
