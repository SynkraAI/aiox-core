# Business Rules Extraction Squad

Squad especializado em extrair, formalizar e padronizar regras de negocio de sistemas legados em documentacao consistente e reutilizavel.

## Filosofia

> "Business rules live in code, not in documentation. Extract them systematically."

Baseado em 7 elite minds com frameworks documentados para reverse engineering, business rules management e legacy modernization.

## Quick Start

```bash
# Ativar o squad
@bre-chief

# Iniciar extracao completa
*extract

# Apenas formalizar regras ja extraidas
*formalize

# Avaliar sistema para modernizacao
*assess
```

## Agentes

### Tier 0 — Diagnostico

| Agente | Expert | Foco |
|--------|--------|------|
| `bre-chief` | — | Orquestrador, triage e routing |
| `michael-feathers` | Michael Feathers | Analise de codigo legado, seams, characterization tests |

### Tier 1 — Extracao e Formalizacao

| Agente | Expert | Foco |
|--------|--------|------|
| `harry-sneed` | Harry M. Sneed | Extracao de regras de COBOL/mainframe |
| `barbara-von-halle` | Barbara von Halle | Decision Model, normalizacao de regras |
| `ronald-ross` | Ronald G. Ross | RuleSpeak, SBVR, vocabulario padronizado |

### Tier 2 — Sistematizacao

| Agente | Expert | Foco |
|--------|--------|------|
| `james-taylor` | James Taylor | Decision Management Systems, DMN |
| `robert-seacord` | Seacord/Lewis (SEI) | Risk-Managed Modernization |
| `jan-vanthienen` | Jan Vanthienen | Verificacao de decision tables |

## Workflows

### wf-extract-rules (Pipeline Completo)

```
Phase 0: Triage        → bre-chief (diagnostico do sistema)
Phase 1: Analysis      → michael-feathers (seams, dependencias)
Phase 2: Extraction    → harry-sneed (extracao de regras)
Phase 3: Formalization → barbara-von-halle (Decision Model)
Phase 4: Standardize   → ronald-ross (RuleSpeak)
Phase 5: Verification  → jan-vanthienen + james-taylor (verificacao + DMN)
```

### wf-formalize-rules (Apenas Formalizacao)

```
Phase 1: Organize   → barbara-von-halle (rule families)
Phase 2: Standardize → ronald-ross (RuleSpeak)
Phase 3: Verify     → jan-vanthienen + james-taylor (verificacao + DMN)
```

## Templates

| Template | Formato | Uso |
|----------|---------|-----|
| `business-rule-tmpl.yaml` | YAML | Formato padrao para cada regra |
| `decision-table-tmpl.yaml` | YAML | Formato de decision table |
| `rule-catalog-tmpl.md` | Markdown | Catalogo completo de regras |

## Quality Gates

- **BRE-QG-001**: Extraction Quality Gate (7 categorias, threshold 7.0/10)
- **BRE-CK-001**: Rule Completeness Checklist (por regra individual)

## Output Esperado

Ao final do pipeline, voce tera:

1. **Rule Catalog** — documento completo com todas as regras extraidas
2. **Business Glossary** — termos padronizados do dominio
3. **Decision Tables** — tabelas verificadas (completas, consistentes)
4. **DMN Export** — formato portavel para BRMS
5. **Source Traceability** — rastreabilidade ate o codigo fonte
6. **Modernization Assessment** — avaliacao de risco para modernizacao

## Stacks Suportados

- COBOL / Mainframe (CICS, IMS, DB2, VSAM)
- Java legado (EJB, Struts, Spring antigo)
- .NET legado (WinForms, WebForms, WCF)
- ERP (SAP ABAP, Oracle PL/SQL)
- Mix heterogeneo

## Modo de Criacao

- **Modo:** YOLO (sem materiais fonte dos experts)
- **Fidelidade:** 60-75%
- **Data de criacao:** 2026-03-09
