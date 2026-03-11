# Auditoria: Ciclo de Vida de Projetos — Relatório Consolidado

**Data:** 2026-03-11
**Squad de Auditoria:** @qa, @po, @architect, Pedro Valério
**Skills auditados:** `/new-project`, `/checkpoint`, `/resume`

---

## Score Geral

| Skill | @qa | @po | @architect | Pedro Valério | Média |
|-------|-----|-----|-----------|---------------|-------|
| `/new-project` | NEEDS_WORK | NEEDS_WORK (67%) | 4/10 | VETO | **FAIL** |
| `/checkpoint` | NEEDS_WORK | 85% | — | VETO | **NEEDS_WORK** |
| `/resume` | NEEDS_WORK | 84% | — | VETO | **NEEDS_WORK** |
| **Fluxo integrado** | — | — | — | **40/100 VETO** | **VETO** |

---

## Top 10 Findings Deduplicados (Priorizados)

### CRITICAL (Bloqueadores)

| # | Finding | Skills afetados | Reportado por |
|---|---------|----------------|---------------|
| **C1** | Sem verificação de projeto duplicado | new-project | @qa, @architect, PV |
| **C2** | Sobrescrita de session files (YYYY-MM-DD.md) | checkpoint | @qa, PV |
| **C3** | Data contract quebrado: "Project Path" vs "Local" | todos | PV |
| **C4** | Campo "Tipo" coletado mas não gravado | new-project | @qa, PV |
| **C5** | Violação Agent Authority (commit por qualquer agente) | checkpoint | @po |

### HIGH

| # | Finding | Skills afetados | Reportado por |
|---|---------|----------------|---------------|
| **H1** | Sem validação de input (nome, tipo, status) | new-project | @qa |
| **H2** | Fallback perigoso: checkpoint cria INDEX.md malformado | checkpoint | PV |
| **H3** | Template INDEX.md hardcoded e inconsistente | new-project | @architect |
| **H4** | Zero integração com IDS/Entity Registry | new-project | @architect |
| **H5** | ACTIVE.md não tratado quando ausente | new-project, checkpoint | @qa |

### MEDIUM

| # | Finding | Skills afetados |
|---|---------|----------------|
| **M1** | Acentuação pt-BR incompleta | todos |
| **M2** | Sem handoff inicial ao criar projeto | new-project |
| **M3** | Sem git branch/status no resumo | resume |
| **M4** | Descrição breve coletada mas não usada | new-project |
| **M5** | Skill monolítico, sem tasks reutilizáveis | new-project |

---

## Relatórios Individuais Completos

Disponíveis nos outputs dos agentes (sessão 2026-03-11).

## Ação Tomada

Todos os findings CRITICAL, HIGH e MEDIUM foram corrigidos nos 3 skills nesta mesma sessão.
