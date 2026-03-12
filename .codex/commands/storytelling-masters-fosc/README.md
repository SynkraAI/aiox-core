# Storytelling Masters Fosc

Squad de **11 elite minds reais** de storytelling, oratória, persuasão e narrativa, extraídos de 68 livros (~31MB de source material). Satélite do `palestras-master`.

**OalaNicolas Validation:** 9.2/10 (2026-03-03) — [Ver relatório completo](./OALANICOLAS-VALIDATION-REPORT.md)

## Filosofia

> Clone minds > create bots.

Cada agent tem **Voice DNA + Thinking DNA** extraídos diretamente dos livros originais em QUALITY mode (~90% fidelidade). Nenhum framework foi inventado — todos são rastreáveis aos livros fonte via `[SOURCE:]`.

### Diferenciais (v2.0.0)
- ✅ **Frameworks Compatibility Matrix** — Resolve conflitos entre 12+ frameworks
- ✅ **Lindy Effect Scoring** — Durabilidade formal (Aristotle 2300 anos, Campbell 50,000 anos)
- ✅ **Failure Modes Documented** — QUANDO NÃO usar cada framework
- ✅ **Integration Heuristics** — Decision trees para seleção de framework
- ✅ **Implicit Knowledge** — Heurísticas não-verbalizadas (Tier 2+ agents)

## Agents (11 + 1 Orchestrator)

### Orchestrator
| Agent | Role | Comando |
|-------|------|---------|
| `storytelling-masters-chief` | Squad Orchestrator & Narrative Strategy Router | `*diagnose`, `*consult`, `*compose` |

### Tier 0 — Diagnosis & Structure
| Agent | Role | Framework Principal |
|-------|------|-------------------|
| `robert-mckee` | Story Structure Architect | The Gap, Five-Part Design, Storynomics |
| `joseph-campbell` | Mythic Structure & Archetype Guide | Monomyth (17 estágios), Arquétipos |

### Tier 1 — Presentation Masters
| Agent | Role | Framework Principal |
|-------|------|-------------------|
| `nancy-duarte` | Presentation Design & Sparkline Architect | Sparkline, S.T.A.R. Moments, Big Idea |
| `carmine-gallo` | TED-Style Presentation Master | 9 Segredos TED, Método Steve Jobs |
| `matthew-dicks` | Personal Storytelling & 5-Second Moment | Storyworthy (10 componentes), Homework for Life |

### Tier 2 — Persuasion & Influence
| Agent | Role | Framework Principal |
|-------|------|-------------------|
| `robert-cialdini` | Persuasion Science & Influence Architect | 6 Princípios de Influência |
| `chip-dan-heath` | Sticky Ideas & Memorable Moments Architect | SUCCESs (6 elementos), Power of Moments |
| `jay-heinrichs` | Classical Rhetoric & Argumentation Strategist | Ethos/Pathos/Logos, Cicero 6-part |

### Tier 3 — Specialized
| Agent | Role | Framework Principal |
|-------|------|-------------------|
| `donald-miller` | StoryBrand & Business Narrative Architect | StoryBrand SB7 (7 elementos) |
| `blake-snyder` | Beat Sheet & Story Structure Specialist | BS2 (15 beats), 10 Genre Types |
| `dale-carnegie` | Public Speaking Fundamentals & Audience Connection | Método Carnegie (11 módulos) |

## Source Material

- **68 livros + 1 material autoral** convertidos para markdown (~31MB)
- **Categorias:** [S] S-Tier (9), [A] A-Tier (16), [B] B-Tier (15+1), [C] C-Tier (28)
- **Autoral:** "Conferência Mágica e Cinema" (LuizFosc) — ponte cinema/mágica/storytelling
- **Mapeamento:** `data/source-mapping.yaml`

## Integração

- **Federador:** `palestras-master` (diagnostica, roteia, compõe, valida)
- **Satélites irmãos:** `tathi-deandhela`, `renner-silva`
- **Ativação:** `/storytelling-masters-fosc:storytelling-masters-chief`

## Comandos Rápidos

```bash
# Diagnosticar necessidade narrativa
*diagnose

# Consultar expert específico
*consult robert-mckee

# Compor estratégia híbrida
*compose nancy-duarte carmine-gallo

# Ver todos os experts
*list-experts
```

## Referências Rápidas (v2.0.0)

### Seleção de Frameworks
- **Qual framework usar?** → `data/framework-selection-matrix.md`
  - Seleção por caso de uso (16 cenários)
  - Seleção por diagnóstico (11 problemas)
  - Seleção por audiência (8 tipos)
  - Seleção por tempo (6 durações)
  - Quick reference: "I need to..."

### Compatibilidade de Frameworks
- **Frameworks conflitam?** → `data/frameworks-compatibility-matrix.md`
  - 9 pares de frameworks analisados (McKee↔Campbell, Duarte↔Dicks, etc.)
  - Integration heuristics
  - Anti-patterns (mismatches)
  - Conflict resolution protocols

### Frameworks Reference
- **Lookup rápido de frameworks** → `data/frameworks-reference.yaml`
  - 12 frameworks documentados
  - Lindy Effect scoring (durabilidade 0-10)
  - Failure modes (quando NÃO usar)
  - Use when, key concepts, proven since

### Source Mapping
- **Quais livros cada agent usou?** → `data/source-mapping.yaml`
  - 68 livros mapeados (~31MB)
  - Primary + complementary sources
  - S/A/B/C tier classification

### Validation
- **Qualidade do squad** → `OALANICOLAS-VALIDATION-REPORT.md`
  - Score: 9.2/10
  - Gaps identificados e corrigidos
  - Self-validation checklist
  - Validator sign-off
