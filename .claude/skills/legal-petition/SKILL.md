---
name: legal-petition
description: |
  This skill should be used when users need to create, analyze, or prepare legal petitions
  (peticoes iniciais) for Brazilian civil courts. Triggers include: contract disputes,
  debt collection, breach of contract, rescission, damages claims, evidence analysis,
  audio transcription for legal use, payment analysis, or any lawsuit preparation.
  Covers the full pipeline from raw evidence to court-ready petition with PDF output.
---

# Legal Petition Builder

## Overview

This skill orchestrates the complete pipeline for preparing legal petitions (peticoes iniciais)
in Brazilian civil courts. It transforms raw evidence (audio recordings, contracts, messages,
photos, payment records) into a structured, court-ready petition document with PDF output.

Core principle: every factual claim in a petition must be backed by at least one piece of
documentary evidence. The petition is only as strong as its evidence chain.

Scope: Brazilian civil law (Codigo Civil and Codigo de Processo Civil). Documents produced
in formal Portuguese without accents (court convention). Bilingual interaction supported.

## When to Use

- Preparing a lawsuit (acao judicial) from raw evidence
- Contract disputes with evidence to analyze
- Debt collection with payment records
- Breach of contract with communication records
- Audio/message transcription for legal evidence
- Evidence consolidation and timeline building
- Any Brazilian civil law petition preparation

## When NOT to Use

- Criminal law matters (different procedural rules)
- Administrative law petitions (different jurisdiction)
- Simple legal consultations without document preparation
- Jurisdictions outside Brazil

## Pipeline

```text
INVENTORY ──► TRANSCRIPTION ──► ANALYSIS ──► CONSOLIDATION ──► DRAFTING ──► REVIEW ──► PDF
 (Phase 1)      (Phase 2)       (Phase 3)     (Phase 4)       (Phase 5)   (Phase 6)  (Phase 7)
```

Create a task for each phase. Complete them in order:

1. **Inventory raw evidence** - Catalog all files, classify by type (audio, document, image, payment)
2. **Transcribe audio evidence** - Transcribe all audio files with timestamps and speaker identification
3. **Analyze each evidence category** - Contracts, communications, payments, photos, expert reports
4. **Build consolidated timeline** - Chronological narrative linking all evidence with damage calculations
5. **Draft petition sections** - Facts, legal foundations, calculations, evidence list, requests
6. **Review with user** - Present petition for feedback, iterate until approved
7. **Export to PDF** - Generate court-formatted PDF with proper styling

## Phase 1: Evidence Inventory

Scan the working directory and classify all files into categories:

| Category | File Types | Purpose |
|----------|-----------|---------|
| Audio | .ogg, .opus, .mp3, .m4a, .wav | Transcription needed |
| Documents | .pdf, .docx, .doc | Contracts, notifications, reports |
| Images | .jpg, .jpeg, .png | Photos of evidence, screenshots |
| Financial | .xlsx, .csv, .pdf | Payment records, bank statements |
| Messages | .txt, screenshots | WhatsApp, email, SMS |

Create `INVENTARIO_PROVAS.md` with total count per category, file list with descriptions,
missing evidence identification, and analysis priority order.

## Phase 2: Transcription

Convert all audio evidence to text with legal-grade accuracy using Whisper or equivalent.

For each audio file, produce: full text transcription, speaker identification, timestamp
markers, and highlighted key quotes. Naming convention: `transcricao_[original-name].md`.

Critical rules:
- Never fabricate or assume content in unclear audio
- Mark uncertain words with `[?]` suffix
- Flag unclear segments with `[INAUDIVEL]`
- Preserve original language including colloquialisms
- Note emotional tone when legally relevant (threats, coercion)

Output: individual transcription files + `INDICE_TRANSCRICOES.md`

## Phase 3: Evidence Analysis

Analyze each evidence category in depth. Create separate analysis documents.
Reference `references/evidence-analysis.md` for detailed methodology templates.

| Analysis Type | Output File | Key Focus |
|---------------|-------------|-----------|
| Contract | `ANALISE_CONTRATO.md` | Clause-by-clause review, breach mapping, penalties |
| Communications | `ANALISE_COMUNICACOES.md` | Timeline, admissions, contradictions, bad faith |
| Payments | `ANALISE_PAGAMENTOS.md` | Reconciliation, irregularities, outstanding balance |
| Photos | `ANALISE_IMAGENS.md` | Description, dating, evidentiary value |
| Expert Reports | `ANALISE_LAUDOS.md` | Key findings, market values, methodology |

Reference `references/legal-foundations.md` for applicable CC/CPC articles during analysis.

## Phase 4: Consolidation

Build a unified chronological narrative connecting all evidence.

1. Create master timeline with all events dated
2. Cross-reference evidence across categories
3. Identify patterns: systematic bad faith, broken promises, contradictions
4. Map evidence chain: each factual claim to its supporting evidence
5. Calculate total damages across three scenarios:

| Scenario | Description | Use |
|----------|-------------|-----|
| Conservative (minimum) | Based on documented evidence only | Floor for valor da causa |
| Technical (recommended) | Based on expert data + evidence | **Primary valor da causa** |
| Maximum | Based on all available indicators | Ceiling for potential recovery |

Always use market/expert value for damages, never just contract price. Include: dano emergente,
lucro cessante, multa contratual, correcao monetaria (INPC/IBGE), juros de mora (1%/month).
Consider: danos morais, desvalorizacao, honorarios advocaticios.

Output: `HISTORICO_CONSOLIDADO.md`

## Phase 5: Petition Drafting

Draft the complete petition following CPC requirements.
Reference `references/petition-structure.md` for detailed section templates.

Required sections (in order):

1. **Enderecamento** - Court identification
2. **Qualificacao das Partes** - Full identification of plaintiff and defendant
3. **Dos Fatos** - Chronological narrative with evidence references
4. **Do Direito** - Legal foundations (CC, CPC, jurisprudence)
5. **Do Calculo do Debito** - Detailed damage calculations with tables (3 scenarios)
6. **Das Provas** - Evidence inventory for the court
7. **Dos Pedidos** - Specific numbered requests
8. **Do Valor da Causa** - Calculated value (use technical scenario)
9. **Encerramento** - Date, location, attorney signature
10. **Rol de Documentos** - Numbered list of all attached documents

Drafting rules:
- Formal Portuguese without accents (court convention)
- Every factual claim must cite its evidence: `(Doc. N)`
- Show all calculations in tables with clear formulas
- Use proper legal citation format: `Art. XXX do Codigo Civil`
- Each pedido must be numbered and self-contained

Reference `references/legal-foundations.md` for CC/CPC articles and jurisprudence.

Output: `PETICAO_INICIAL.md`

## Phase 6: Review

Present petition to user for review. Iterate until approved.

Review checklist:
- [ ] All factual claims supported by evidence
- [ ] Legal foundations correctly cited
- [ ] Damage calculations mathematically correct
- [ ] Valor da causa properly calculated
- [ ] All parties correctly identified (name, CPF/CNPJ, address)
- [ ] Attorney information complete (name, OAB number)
- [ ] Court jurisdiction correct
- [ ] All pedidos are specific and actionable
- [ ] Rol de documentos matches actual evidence
- [ ] No accents in legal text (court convention)

Gather user feedback on: accuracy and completeness of facts, missing damages,
appropriateness of valor da causa, and additional pedidos needed.

## Phase 7: PDF Export

Generate a court-formatted PDF using the bundled conversion script.

```bash
python scripts/petition-to-pdf.py PETICAO_INICIAL.md --output PETICAO_INICIAL.pdf
```

PDF specifications (applied via `assets/petition-style.css`):

| Property | Value |
|----------|-------|
| Paper | A4 |
| Font | Times New Roman, 12pt |
| Line spacing | 1.5 |
| Margins | Top/Right/Bottom: 2.5cm, Left: 3cm |
| Text alignment | Justified |
| Page numbers | Bottom center |

Requirements: pandoc (for MD to HTML) and weasyprint (for HTML to PDF).

## Common Mistakes

| Mistake | Correction |
|---------|------------|
| Using contract price instead of market value | Always compare with expert appraisal or market data |
| Accepting opponent estimates uncritically | Cross-check with technical data (EMBRAPA, industry standards) |
| Missing multa contratual | Always check contract for penalty clauses |
| Forgetting inversao do onus da prova | Request when defendant holds exclusive evidence access |
| Not requesting exibicao de documentos | Request if defendant may have unrevealed records |
| Single damage scenario | Always present minimum/technical/maximum scenarios |
| Valor da causa based on minimum scenario | Use technical scenario as primary |
| Missing desvalorizacao claim | Check if property/asset value was diminished |

## Initial Assessment

On first activation, gather the following information:

1. Type of lawsuit (rescisao contratual, cobranca, indenizacao, execucao, cautelar, other)
2. Available evidence categories (audio, documents, photos, financial records, messages)
3. Whether an attorney is retained (needed for petition header)
4. Scan working directory for evidence files
5. Present evidence inventory and proposed pipeline

During execution, present progress after each phase, flag evidence gaps that could weaken
the case, and suggest additional evidence that would strengthen it. Request user validation
at key checkpoints: party identification, valor da causa determination, whether to include
danos morais, court jurisdiction selection, and damage scenario prioritization.

## File Organization

```text
case-directory/
├── audios/                    # Raw audio files
├── documentos/                # Contracts, notifications, reports
├── imagens/                   # Photos, screenshots
├── financeiro/                # Payment records, bank statements
├── transcricoes/              # Generated transcription files
│   ├── INDICE_TRANSCRICOES.md
│   └── transcricao_*.md
├── ANALISE_CONTRATO.md
├── ANALISE_COMUNICACOES.md
├── ANALISE_PAGAMENTOS.md
├── ANALISE_IMAGENS.md
├── ANALISE_LAUDOS.md
├── HISTORICO_CONSOLIDADO.md
├── INVENTARIO_PROVAS.md
├── PETICAO_INICIAL.md
└── PETICAO_INICIAL.pdf
```

## Resources

scripts/
- petition-to-pdf.py - Convert Markdown petition to court-formatted PDF (pandoc + weasyprint)

references/
- petition-structure.md - Complete Brazilian petition template with all required sections
- evidence-analysis.md - Systematic methodology for each evidence type
- legal-foundations.md - CC/CPC articles with full text and usage guidance

assets/
- petition-style.css - Court formatting CSS (A4, Times New Roman, 1.5 spacing)

## Safety Notice

This skill provides document preparation assistance, not legal advice. Always recommend
attorney review before filing. Flag gaps in evidence that could weaken the case. Never
modify original evidence files.
