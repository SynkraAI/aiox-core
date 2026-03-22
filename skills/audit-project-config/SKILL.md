# Audit Project Config Skill

Valida configuracoes `.claude/` de projetos existentes contra templates atuais.

## Uso

```bash
/audit-project-config           # Apenas auditar
/audit-project-config --fix     # Auditar + oferecer auto-fix
```

---

## O Que Faz

1. **Scanneia todos os projetos ativos:**
   - Le `docs/projects/ACTIVE.md`
   - Detecta projetos CENTRALIZED e HYBRID
   - Identifica caminho de cada projeto

2. **Valida configuracao `.claude/` (3 camadas):**
   - **L1 Structural:** Arquivos existem? (.claude/, settings.json, CLAUDE.md, rules/)
   - **L2 Semantic:** Conteudo valido? (placeholders, hooks format, permissions)
   - Cada issue tem severidade: CRITICAL, HIGH, MEDIUM, LOW

3. **Gera relatorio de gaps:**
   - Health Score (X/Y OK, Z%)
   - Issues por severidade
   - Projetos sem `.claude/`, com config desatualizada, com placeholders

4. **Oferece auto-fix (opcional, com dry-run obrigatorio):**
   - Dry-run preview antes de qualquer alteracao
   - First-fix validation (corrige 1, valida, entao oferece batch)
   - Subprocess error handling (exit code, file exists, JSON valid)

---

## Implementacao

Execute estas acoes sequencialmente:

### 1. Rodar Audit

```bash
node tools/audit-project-configs.js
```

### 2. Ler Relatorio

Ler `docs/reports/project-config-audit.md` e extrair metricas.

### 3. Mostrar Resumo

Formatar output conciso para o usuario.

### 4. Se --fix, Rodar Dry-Run

```bash
node tools/fix-project-configs.js --dry-run
```

Mostrar preview e perguntar ao usuario (AskUserQuestion):
- "Corrigir todos (batch)"
- "Corrigir apenas 1 (validacao)"
- "Nao corrigir nada"

### 5. Executar Fix (se aprovado)

```bash
# Primeiro fix para validacao
node tools/fix-project-configs.js --first-only

# Batch completo (apos primeiro validado)
node tools/fix-project-configs.js
```

### 6. Re-Audit

Validar que gaps foram resolvidos.

### 7. Resumo Final

Mostrar delta (BEFORE vs AFTER).

---

## Veto System

O skill usa vetos que BLOQUEIAM execucao em condicoes inseguras:

| Veto | Condicao | Acao |
|------|----------|------|
| VETO_1 | ACTIVE.md nao existe | HALT |
| VETO_2 | Table sem colunas Projeto/INDEX | HALT |
| VETO_3 | Zero projetos encontrados | HALT |
| VETO_4 | Modo ambiguo (nem HYBRID nem CENTRALIZED) | SKIP + WARN |
| VETO_5 | Path computado fora do homedir | HALT |
| VETO_6 | Path relativo nao resolve | HALT |
| VETO_7 | Auto-fix sem dry-run preview | HALT |
| VETO_8 | Primeiro fix falha | HALT batch |
| VETO_9 | Destination not writeable | SKIP + WARN |
| VETO_10 | Subprocess exit code != 0 | HALT batch |
| VETO_11 | Arquivo esperado nao criado | HALT |
| VETO_12 | Arquivo criado mas JSON invalido | HALT |

---

## Validation Layers

### L1: Structural Validation

- `.claude/` directory existe
- Arquivos obrigatorios presentes:
  - `settings.json`
  - `CLAUDE.md`
  - `rules/behavioral-rules.md`

### L2: Semantic Validation

- `settings.json`:
  - `hooks` DEVE ser objeto `{}`, NAO array `[]` (CRITICAL)
  - Matchers devem ser strings, nao objetos (HIGH)
  - `permissions.allow` existe e e array (HIGH)
  - `permissions.deny` existe e e array (HIGH)
- `CLAUDE.md`:
  - Nenhum placeholder `{{}}` fora de code blocks (HIGH)
- `behavioral-rules.md`:
  - Tem conteudo (> 100 chars) (LOW)

---

## CENTRALIZED vs HYBRID

| Criterio | CENTRALIZED | HYBRID |
|----------|-------------|--------|
| Projeto vive em | `aios-core/` (squads, minds) | `~/CODE/Projects/` (apps externos) |
| INDEX.md em | `docs/projects/{name}/INDEX.md` | `{path}/.aios/INDEX.md` |
| .claude/ em | `docs/projects/{name}/.claude/` | `{path}/.claude/` |
| Use quando | Squad, mind clone, research interno | App full-stack, pipeline externo |

---

## Placeholders Validados

O skill verifica que NENHUM destes placeholders existe fora de code blocks:

| Placeholder | Exemplo (substituido) |
|-------------|----------------------|
| `{{PROJECT_NAME}}` | Minha App |
| `{{MODE}}` | HYBRID |
| `{{MODE_DESCRIPTION}}` | Governanca local |
| `{{INDEX_PATH}}` | .aios/INDEX.md |
| `{{STORIES_PATH}}` | .aios/stories/active/ |
| `{{SESSIONS_PATH}}` | .aios/sessions/ |
| `{{PROJECT_SLUG}}` | minha-app |
| `{{SAVE_LOCATION}}` | .aios/ |

---

## Project Types

Tipos validos detectados automaticamente via INDEX.md:

| Tipo | Detectado por | Exemplo |
|------|--------------|---------|
| `app` | "Type: App", "Next.js", "React" | meta-ads-prospector |
| `squad` | "Type: Squad", "Agent", "Workflow" | gui-avila-mind |
| `mind-clone` | "Type: Mind Clone", "Mind DNA" | naval-ravikant-mind |
| `pipeline` | "Type: Pipeline", "Automation", "ETL" | — |
| `research` | "Type: Research", "Study", "Analysis" | — |
| `knowledge` | Fallback (nenhum pattern match) | evolution-api |

---

## Dependencies

| Resource | Path | Usado Para |
|----------|------|-----------|
| ACTIVE.md | `docs/projects/ACTIVE.md` | Lista de projetos |
| audit script | `tools/audit-project-configs.js` | Executa audit |
| fix script | `tools/fix-project-configs.js` | Executa auto-fix |
| copy-project-config | `tools/copy-project-config.js` | Cria .claude/ novo |
| settings-format rules | `.claude/rules/settings-format.md` | Referencia hooks format |

---

## Scripts

| Script | Uso | Exit Codes |
|--------|-----|------------|
| `tools/audit-project-configs.js` | Valida todos os projetos | 0: OK, 1: CRITICAL issues, 2: VETO |
| `tools/fix-project-configs.js` | Corrige gaps | 0: OK, 1: Falhas parciais, 2: VETO |
| `tools/fix-project-configs.js --dry-run` | Preview sem alterar | 0: Sempre |
| `tools/fix-project-configs.js --first-only` | Corrige 1 projeto (validacao) | 0/1/2 |

---

**Versao:** 2.0 (Hardened — Tripartite Analysis 2026-03-18)
