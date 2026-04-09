# Critica Template — Mandatory Post-PERFECT File Format

Use this exact structure when writing `critica.md` (or `scopes/{name}/critica.md` in scoped mode).
The YAML frontmatter is MANDATORY and is the machine-readable contract.

---

````markdown
---
protocol: code-review-ping-pong
type: critica
round: {N}
date: "{YYYY-MM-DD}"
critica_by: "{Claude Code | other}"
branch: "{branch name from git branch --show-current}"
perfect_round_file: "round-{N}.md"
rounds_reviewed:
  - "{1}"
  - "{2}"
  - "{N}"
files_in_scope:
  - "{path/to/file1}"
  - "{path/to/file2}"
critica_verdict: "{APPROVED | NEEDS_WORK}"
issues_found: {count}
issues:
  - id: "C{N}.1"
    severity: "{CRITICAL | HIGH | MEDIUM | LOW}"
    title: "{short title}"
    file: "{path/to/file}"
    line: "{line number or range}"
    description: "{brief description of the problem found}"
---

# Code Review Ping-Pong — Crítica Obrigatória (Round {N})

**Crítica executada por:** {critica_by}
**Rounds revisados:** {1} a {N}
**Arquivo PERFECT:** `round-{N}.md`
**Veredicto:** {APPROVED | NEEDS_WORK}

---

## Phase 1 — Question

### 1. Blind Spots
> O que a revisão NÃO considerou? Áreas ou riscos ignorados.

- {observation with file/area reference, or "Nenhum blind spot identificado."}

### 2. Citation Verification
> Cada fix declarado no fix report deve traçar uma mudança real no código. Sem fonte = retracted.

- {Fix {N}.X — "{claim from fix report}" → {VERIFIED: code change found at line Y | RETRACTED: no matching code change}}

### 3. Red Team (3 ataques)
> Vetores adversariais realistas contra o código revisado.

1. **{Attack vector 1}** — {description of realistic attack and how the code is vulnerable or protected}
2. **{Attack vector 2}** — {description}
3. **{Attack vector 3}** — {description}

---

## Phase 2 — Discipline

### 4. Minimum Scope
> Os fixes tocaram apenas o que era necessário? Algum fix fez mais do que o issue pedia?

- {observation, or "Todos os fixes respeitaram o escopo mínimo."}

### 5. Ripple Effect
> Algum fix alterou uma interface, tipo ou contrato sem listar o impacto nos callers?

- {observation with specific file/function reference, or "Nenhum ripple effect identificado."}

---

## Issues Found (NEEDS_WORK only)

> Preencher apenas se `critica_verdict: NEEDS_WORK`. Se APPROVED, manter seção vazia.

### {🔴|🟠|🟡|🟢} {SEVERITY}

#### Issue C{N}.1 — {short title}
- **File:** `{path/to/file}`
- **Line:** {number or range}
- **Problem:** {clear description of what was found}
- **Required action:** {what must be fixed in the next review round}

---

## 📊 Summary

- **Total issues found:** {count}
- **By severity:** 🔴 {X} CRITICAL, 🟠 {X} HIGH, 🟡 {X} MEDIUM, 🟢 {X} LOW
- **Veredicto final:** {APPROVED — ciclo encerrado | NEEDS_WORK — novo round necessário}
- **Next action:** {Encerrar ciclo (cycle_state: COMPLETE) | Enviar issues para Codex revisar (cycle_state: WAITING_FOR_REVIEW)}
````

---

## Rules for filling the template

1. The YAML `issues` array MUST only be populated when `critica_verdict: NEEDS_WORK`. When `APPROVED`, it must be an empty array `[]`.
2. Every issue MUST use the `C` prefix for IDs (e.g. `C1.1`, `C2.3`) to distinguish from review issues (which use numeric IDs like `1.1`).
3. The 5 sections are focused — do NOT expand to the full `/critica` skill (10+ sections). Only these 5 apply.
4. **Citation Verification** is strict: if a fix report claims "fixed X" but no code change matches, mark as RETRACTED.
5. **Red Team** must list exactly 3 attacks. They must be realistic vectors, not theoretical edge cases.
6. `critica_verdict: APPROVED` means **no critical problems found** — the cycle can be closed.
7. `critica_verdict: NEEDS_WORK` means problems were found — a new REVIEW round is required.
8. `rounds_reviewed` must list every round that was read during this critica.
9. `files_in_scope` must match the `files_in_scope` from the PERFECT round file.
10. When APPROVED, write `next-step.md` with `cycle_state: COMPLETE`, `next_agent: NONE`, `critica_status: approved`.
11. When NEEDS_WORK, write `next-step.md` with `cycle_state: WAITING_FOR_REVIEW`, `next_agent: CODEX`, `critica_status: pending`.
