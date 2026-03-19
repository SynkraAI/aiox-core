---
task-id: validate-curation
name: Validate Curation Completeness & Quality
agent: curator-chief
version: 1.0.0
purpose: Standalone end-to-end validation of all curation outputs for a source

workflow-mode: automated
elicit: false
execution_type: Hybrid
responsible_executor: curator-chief

action_items:
  - "Check file existence for all 3 tiers (critical, important, optional)"
  - "Run mining quality checks (structure, integrity, ATHENA enforcement, timestamps)"
  - "Validate annotated transcript (segments, coverage, references)"
  - "Validate cut scripts if they exist (YAML syntax, required fields)"
  - "Run cross-consistency checks (moment IDs, timestamps, file sizes)"
  - "Generate VALIDATION_REPORT.md with weighted scores per category"

acceptance_criteria:
  - "All 4 checklists executed (mining-quality, output-quality, narrative-quality, curation-quality)"
  - "VALIDATION_REPORT.md generated at output/curated/{source-slug}/"
  - "Overall score computed as weighted average (File 25% + Mining 30% + Transcript 20% + Cuts 15% + Cross 10%)"
  - "Status correctly assigned (PASSED >= 85, NEEDS_REVIEW 70-84, FAILED < 70)"
  - "Recommendations list generated for any failing or warning items"
  - "All Tier 1 (critical) file existence checks pass or report blocking failure"
  - "Timestamp validation run (if transcript_raw exists) or internal consistency check (if not)"

inputs:
  - name: source_slug
    type: string
    description: Source slug identifier (e.g. "cohort-avancado-aula1")
    required: true
  - name: output_dir
    type: directory_path
    description: Output directory for this source
    required: false
    default: "output/curated/{source-slug}/"
  - name: report_only
    type: boolean
    description: Generate report without failing on errors
    required: false
    default: false

outputs:
  - path: "output/curated/{source-slug}/VALIDATION_REPORT.md"
    format: markdown
    description: Complete validation report with scores and recommendations

dependencies:
  checklists:
    - checklists/mining-quality.md
    - checklists/output-quality.md
    - checklists/narrative-quality.md
    - checklists/curation-quality.md
  scripts:
    - squads/curator/scripts/validate_timestamps.py
    - squads/curator/scripts/validate_transcription.py
    - squads/curator/scripts/_validation_common.py
---

# validate-curation

---

## Overview

Comprehensive standalone validation of all curation outputs for a given source. Can be invoked independently of any workflow — useful for QA audits, post-session validation, and pre-delivery checks.

**Use cases:**
- Validate mining output before proceeding to cuts
- Audit existing curation outputs after session break
- Pre-delivery quality check before handing to editor
- Spot-check after resume-mining

---

## Veto Conditions (BLOCKING — halt validation immediately)

The following conditions cause an immediate FAILED verdict regardless of weighted score. Fix before re-running.

```yaml
veto_conditions:
  - id: "VETO-01"
    name: "Phantom timestamps"
    condition: "Any timestamp in momentos.md does not exist in transcript_raw.txt (within ±2s tolerance)"
    action: "BLOCK — return FAILED"
    message: "Timestamps were fabricated or extracted incorrectly. Re-run Pass 4.7 (validate_timestamps.py)."
    applies_when: "transcript_raw.txt is available"

  - id: "VETO-02"
    name: "MQR scores without rubric justification"
    condition: "Any moment has impact_score but mqr field is empty or missing (H/E/S/C notation absent)"
    action: "BLOCK — return FAILED"
    message: "Scores must derive from MQR formula (H×0.35 + E×0.25 + S×0.25 + C×0.15). Bare scores not accepted."
    applies_when: "always"

  - id: "VETO-03"
    name: "Drift concentration above 20%"
    condition: "More than 20% of moments flagged as DRIFT by validate_transcription.py (transcription text doesn't match declared timestamp)"
    action: "BLOCK — return FAILED"
    message: "High drift indicates systematic timestamp misalignment. Re-mine affected sections."
    applies_when: "transcript_raw.txt is available"
```

---

## Validation Phases

### Phase 1: File Existence (Weight: 25%)

```yaml
checks:
  tier_1_critical:
    description: "Must exist — blocking if missing"
    threshold: "100%"
    files:
      - path: "output/curated/{source-slug}/momentos.md"
        name: "Banco de Momentos (compact)"
        required: true
      - path: "output/curated/{source-slug}/transcricao_anotada.md"
        name: "Annotated Transcript"
        required: true

  tier_2_important:
    description: "Should exist — warning if missing"
    threshold: "80%"
    files:
      - path: "output/curated/{source-slug}/INDEX.md"
        name: "Source Index"
        required: false
      - path: "_temp/mining/{source-slug}/all_moments_merged.md"
        name: "Archive (all moments)"
        required: false
      - path: "_temp/mining/{source-slug}/transcript_raw.txt"
        name: "Raw transcript"
        required: false

  tier_3_optional:
    description: "Nice to have — informational only"
    threshold: "60%"
    files:
      - path: "output/curated/{source-slug}/cortes/**/*.yaml"
        name: "Cut scripts"
        required: false
      - path: "output/curated/{source-slug}/cortes/**/*GUIA_EDITOR.md"
        name: "Editor guides"
        required: false
```

### Phase 2: Mining Quality (Weight: 30%)

```yaml
checks:
  momentos_structure:
    file: "output/curated/{source-slug}/momentos.md"
    validations:
      - "YAML frontmatter present and parseable"
      - "Metadata section complete (source, duration, speakers, extraction_date)"
      - "Distribution section present (por_tipo AND por_gatilho)"
      - "Quick Scan table present"
      - "Rankings section present"
      - "Coverage metrics section present"

  moment_integrity:
    for_each: "moment in momentos.md"
    validations:
      - "timestamp_inicio present (MM:SS or HH:MM:SS)"
      - "timestamp_fim present"
      - "Duration calculable (fim - inicio > 0)"
      - "tipo assigned from valid set (hook, insight, story, quote, transition, b_roll_cue)"
      - "gatilho_viral assigned from valid set"
      - "MQR notation present (H{n}/E{n}/S{n}/C{n})"
      - "impact_score present (1-10)"
      - "Transcription text present (not empty)"
      - "contexto_antes present"
      - "contexto_depois present"

  athena_enforcement:
    validations:
      - name: "Anti-laziness"
        formula: "total_moments >= duration_seconds / 180"
        type: blocking
      - name: "Territorial coverage"
        formula: "sum(moment_durations) / total_duration >= 0.40"
        type: blocking
      - name: "Quartile distribution"
        formula: "each quartile >= 10% of total moments"
        type: blocking
      - name: "MQR anti-inflation"
        formula: "average impact_score between 5.5 and 6.5"
        type: warning

  timestamp_validation:
    condition: "transcript_raw.txt exists"
    code: |
      python squads/curator/scripts/validate_timestamps.py \
        output/curated/{source-slug}/momentos.md \
        --transcript _temp/mining/{source-slug}/transcript_raw.txt \
        --tolerance 2
    on_unavailable: "Run internal consistency checks only (timestamps in order, fim > inicio)"
    type: blocking
```

### Phase 3: Annotated Transcript Quality (Weight: 20%)

```yaml
checks:
  file: "output/curated/{source-slug}/transcricao_anotada.md"
  validations:
    - "YAML frontmatter present"
    - "Legend section present (KEEP/REMOVE/BRIDGE definitions)"
    - "All KEEP segments reference valid moment IDs from momentos.md"
    - "All KEEP segments have corte_natural_in and corte_natural_out"
    - "BRIDGE segments have full transcription text"
    - "REMOVE segments have 1-line summary"
    - "No gaps in timeline coverage (every second accounted for)"
    - "Segment count > 0"
```

### Phase 4: Cut Script Quality (Weight: 15%)

```yaml
condition: "Cut scripts exist in output/curated/{source-slug}/cortes/"
checks:
  for_each: "cut_file in cortes/**/*.yaml"
  validations:
    - "Valid YAML syntax"
    - "titulo field present"
    - "momentos array present with entries"
    - "Each momento has exact timestamps"
    - "ordem_montagem present"
    - "transicoes defined"
    - "instrucoes_editor present and non-empty"
  editor_guide:
    for_each: "guia in cortes/**/*GUIA_EDITOR.md"
    validations:
      - "Source metadata header present"
      - "Timestamps match corresponding YAML"
      - "Editor instructions are clear and actionable"
```

### Phase 5: Cross-Consistency (Weight: 10%)

```yaml
checks:
  moment_references:
    - "All moment IDs in annotated transcript exist in momentos.md"
    - "All moment IDs in cut scripts exist in momentos.md"
    - "Timestamp values are consistent across all files"
  file_sizes:
    - "momentos.md is smaller than transcript_raw.txt (compact)"
    - "No zero-byte output files"
  naming_conventions:
    - "Source slug is consistent across all paths"
    - "File names follow convention"
```

---

## Validation Report Schema

```markdown
# VALIDATION REPORT: {source-slug}

**Date:** {timestamp}
**Validator:** validate-curation v1.0.0
**Overall Score:** {score}/100
**Status:** {PASSED | NEEDS_REVIEW | FAILED}

---

## File Existence (25%)
| File | Status | Tier |
|------|--------|------|
| momentos.md | ✅ Found | Critical |
| transcricao_anotada.md | ✅ Found | Critical |
| INDEX.md | ⚠️ Missing | Important |
| transcript_raw.txt | ✅ Found | Important |
| Cut scripts | ✅ 3 found | Optional |

Score: {X}/25

---

## Mining Quality (30%)
| Check | Status | Details |
|-------|--------|---------|
| Structure | ✅ | All sections present |
| Moments: {N} total | ✅ | All have required fields |
| Anti-laziness | ✅ | {actual} >= {minimum} |
| Coverage | ✅ | {X}% >= 40% |
| Quartiles | ✅ | Q1={a}% Q2={b}% Q3={c}% Q4={d}% |
| MQR avg | ✅ | {avg} (target: 5.5-6.5) |
| Timestamps | ✅ | validate_timestamps.py passed |

Score: {X}/30

---

## Annotated Transcript (20%)
| Check | Status | Details |
|-------|--------|---------|
| KEEP segments | ✅ | {N} segments, all reference valid moments |
| BRIDGE segments | ✅ | {N} segments with text |
| REMOVE segments | ✅ | {N} segments with summaries |
| Timeline coverage | ✅ | No gaps detected |

Score: {X}/20

---

## Cut Scripts (15%)
| Cut | Format | Moments | Timestamps | Status |
|-----|--------|---------|------------|--------|
| 01_titulo.yaml | shorts | 5 | ✅ exact | ✅ |
| 02_titulo.yaml | longform | 12 | ✅ exact | ✅ |

Score: {X}/15

---

## Cross-Consistency (10%)
| Check | Status |
|-------|--------|
| Moment ID consistency | ✅ |
| Timestamp consistency | ✅ |
| File size ratio | ✅ (momentos < transcript) |
| Naming conventions | ✅ |

Score: {X}/10

---

## SUMMARY

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| File Existence | {X}/25 | 25% | {W} |
| Mining Quality | {X}/30 | 30% | {W} |
| Annotated Transcript | {X}/20 | 20% | {W} |
| Cut Scripts | {X}/15 | 15% | {W} |
| Cross-Consistency | {X}/10 | 10% | {W} |
| **TOTAL** | | | **{TOTAL}/100** |

**Status:** {PASSED (>= 85) | NEEDS_REVIEW (70-84) | FAILED (< 70)}

## Next Actions
- {list of specific items to fix if any}
```

---

## Usage

```bash
# Via curator-chief
@curator:curator-chief
*validate {source-slug}

# Standalone
# Run validation for a specific source
validate-curation --source cohort-avancado-aula1

# Report only (don't fail on errors)
validate-curation --source cohort-avancado-aula1 --report-only
```

---

## Acceptance Criteria

- [ ] All Tier 1 (critical) files validated
- [ ] Mining quality checks executed
- [ ] Annotated transcript validated (if exists)
- [ ] Cut scripts validated (if exist)
- [ ] Cross-consistency verified
- [ ] VALIDATION_REPORT.md generated at output/curated/{source-slug}/
- [ ] Overall score calculated with weighted categories
- [ ] Clear next actions listed for any failures

---

## Handoff

```yaml
on_complete:
  pass_to: "curator-chief"
  deliver:
    - "output/curated/{source-slug}/VALIDATION_REPORT.md"
  context: "Validation complete. Score: {X}/100. Status: {status}."

  if_failed:
    pass_to: "content-miner-pro"
    context: "Re-mine or fix specific issues listed in validation report."
```

---

_Task Version: 1.0.0_
_Agent: curator-chief_
_Adapted from: ETL validate-collection.md pattern_
