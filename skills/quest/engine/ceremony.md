# Ceremony Module

> Instructions for the Quest Engine LLM. This module generates the entrance ceremony from pack metadata. All output is plain text (NOT code blocks) for beautiful rendering.

---

## Inputs

Before producing any text output, the ceremony module MUST silently build the project inventory:

1. Read `scan_rule` fields from pack items in phases 0 and 1
2. Evaluate each `scan_rule` using the same scanner functions defined in `scanner.md` (e.g., `has_file()`, `has_dir()`, `has_content()`, etc.)
3. Store the results (found / absent) for use in the Project Card (Section 3 — Inventory Generation) and World Map status

This scan happens **SILENTLY** — no text output is produced during this step. The user sees only the final ceremony flow, with inventory data already resolved.

---

## 0. Ceremony Override Check

Before generating anything, check if the pack has a custom ceremony:

```
if pack.ceremony_override exists:
  Read the file at pack.ceremony_override (relative to pack directory)
  Output its contents AS-IS (plain text, no code blocks)
  THEN run Hero Identity (Section 1.5) — hero_name is REQUIRED for quest-log persistence
  STOP — do not generate any other ceremony sections below
```

**Why Hero Identity is mandatory:** `SKILL.md` Step 7 requires `hero_name` and `hero_title` to persist the quest-log (checklist.md §2 and §7). Skipping Hero Identity would leave the engine without the data it needs to write a valid quest-log. The override replaces the visual ceremony (title screen, loading, project card), NOT the data collection step.

If no override, proceed with the generated ceremony.

---

## 1. Title Screen

Output the fixed ASCII art "QUEST" followed by the pack's tagline. The ASCII art is ALWAYS the same — only the tagline changes.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                    ██████╗ ██╗   ██╗███████╗███████╗████████╗
                    ██╔═══██╗██║   ██║██╔════╝██╔════╝╚══██╔══╝
                    ██║   ██║██║   ██║█████╗  ███████╗   ██║
                    ██║▄▄ ██║██║   ██║██╔══╝  ╚════██║   ██║
                    ╚██████╔╝╚██████╔╝███████╗███████║   ██║
                     ╚══▀▀═╝  ╚═════╝ ╚══════╝╚══════╝   ╚═╝

                         {pack.tagline}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Substitution:** Replace `{pack.tagline}` with the pack's `tagline` field, centered.

---

## 1.5. Hero Identity

Right after the Title Screen, ask the user how they want to be called. This creates a personal connection — like choosing your character name before starting an RPG.

### Flow

**Step A — Ask name:**

```
  Antes de começar, preciso saber...

  Como devo te chamar, aventureiro(a)?
  (Seu nome, apelido, ou como preferir)

  > [user types their name]
```

**Step B — Suggest epic titles:**

After receiving the name, the Quest Master proposes 3 epic titles based on the pack theme and the user's name. The suggestions should feel natural and thematic — like an RPG character creation screen.

```
  {hero_name}... belo nome.

  Todo herói merece um título épico. Que tal um desses?

  1. {hero_name}, {title_suggestion_1}
  2. {hero_name}, {title_suggestion_2}
  3. {hero_name}, {title_suggestion_3}
  4. Prefiro sem título
  5. Quero escrever o meu próprio

  > [user picks 1-5]
```

**Title suggestion rules:**
- Generate 3 suggestions inspired by the **pack theme** (e.g., for app-development: "O Forjador de Apps", "Arquiteto do Código", "Mestre das Builds"; for squad-upgrade: "Senhor dos Squads", "O Estrategista", "Guardião do Ecossistema")
- Titles should sound RPG-epic but relate to what the quest is about
- Keep titles short (2-4 words max)
- If user picks 5, ask them to type their custom title

**If user picks 4 (no title):** set `hero_title` to empty string and move on. No judgment — "Sem título? Sem problema. Suas ações vão falar por você."

**If user picks 5 (custom):**
```
  Qual título você escolhe?

  > [user types their title]
```

### Storage

Store the responses in the quest-log `meta` block:
- `hero_name`: the name/nickname (REQUIRED — do not proceed without it)
- `hero_title`: the epic title (OPTIONAL — empty string if skipped)

### Usage

From this point forward, NEVER use "Builder" again. Always use `{hero_name}` to address the user. If they provided a `hero_title`, use it in special moments (celebrations, level ups, final victory) with the format: `{hero_name}, {hero_title}`.

### Input Validation

| Rule | What to do |
|------|-----------|
| Empty string (user presses Enter) | Retry: "Preciso de um nome para começar, herói! Pode ser só uma letra." Max 3 retries, then default to "Aventureiro" |
| Too long (> 30 chars) | Truncate to 30 and confirm: "Vou te chamar de '{truncated}', ok?" |
| Contains YAML-unsafe chars (`:`, `"`, `\n`, `\t`) | Strip them silently |
| Only spaces/special chars | Retry: "Hmm, preciso de algo pronunciável. Tenta de novo?" |

### Rules

- Ask ONCE during first ceremony, never again
- If user gives a single word, accept it (e.g., "Lu")
- If user gives name + title together (e.g., "Thorin, Escudo de Carvalho"), parse it: name = "Thorin", title = "Escudo de Carvalho" — skip Step B
- Collect the responses via normal conversational turn (ask in the chat, wait for user reply — no special tool needed)
- This step happens BEFORE the Loading Sequence — the loading bars should already use the hero name
- Same validation rules apply to custom hero_title (Step B, option 5)

---

## 2. Loading Sequence

Generate progress bars using the pack's phase names. Each phase becomes a loading step, plus a fixed opening and closing line.

### Template

```
  Escaneando projeto...

  ░░░░░░░░░░░░░░░░░░░░  Detectando ambiente
  {for each phase in pack.phases, progressively fill the bar}
  ████████████████████  Scan completo!
```

### Generation Rules

1. Count the total number of phases: `N = len(pack.phases)`
2. Calculate bar fill increment: each phase fills `floor(20 / (N + 1))` blocks (20 chars total)
3. First line is always: `░░░░░░░░░░░░░░░░░░░░  Detectando ambiente`
4. For each phase `i` (0-indexed), generate a line with `fill = round(20 * (i + 1) / (N + 1))` filled blocks:
   - Filled portion: `█` repeated `fill` times
   - Empty portion: `░` repeated `20 - fill` times
   - Label: derive a scanning verb from the phase name. Use the pattern: `Analisando {phase.name}...`
5. Last line is always: `████████████████████  Scan completo!`

**Contract — progress bar visual consistency:** The loading sequence progress bar MUST use the same character set (`█` for filled, `░` for empty), bar width (20 characters), and rounding logic (`round()`) as the Resumption Banner (§7) and `progress_bar()` in guide.md §5. If any of these implementations change, ALL others MUST be updated in the same commit.

### Example (pack with 4 phases)

```
  Escaneando projeto...

  ░░░░░░░░░░░░░░░░░░░░  Detectando ambiente
  ████░░░░░░░░░░░░░░░░  Analisando Torre de Observação...
  ████████░░░░░░░░░░░░  Analisando Laboratório de DNA...
  ████████████░░░░░░░░  Analisando Forja de Skills...
  ████████████████░░░░  Analisando Arena de Testes...
  ████████████████████  Scan completo!
```

---

## 3. Project Card

Show the "Ficha do Projeto" using scan results and pack metadata.

### Template

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  FICHA DO PROJETO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Nome:     {project_name}
  Local:    {project_path}
  Classe:   {project_class}
  Nível:    {level_number} — {level_name}

  INVENTÁRIO:
  {inventory_lines}

  CAMINHO DA QUEST:
  {world_map}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Field Sources

| Field | Source |
|-------|--------|
| `project_name` | Directory name from `cwd` |
| `project_path` | Absolute `cwd` path |
| `project_class` | Determined by classification rules (Section 4) |
| `level_number` | From xp-system calculation (1 for new projects) |
| `level_name` | `pack.levels[level_number].name` |
| `inventory_lines` | Generated from pack items with `scan_rule` (see below) |
| `world_map` | Generated from pack phases (see below) |

### Inventory Generation

Build the inventory from pack items that have a `scan_rule` defined in early phases (phase 0 and phase 1). These represent the project's foundational elements.

For each such item:

1. Evaluate the item's `scan_rule` using the scanner functions
2. If the rule evaluates to true: `[+] {item.label} .......... Encontrado`
3. If the rule evaluates to false: `[-] {item.label} .......... Ausente`

Pad with dots to align the status column. Use the item's `label` field as the display name.

**Example:**

```
  INVENTÁRIO:
    [+] README e config.yaml .... Encontrado
    [+] Diretório de agents ..... Encontrado
    [-] Voice DNA nos agents .... Ausente
    [-] Testes de coerência ..... Ausente
```

**Rules:**
- Only show items from phases 0 and 1 that have `scan_rule` defined
- Order follows the item order in the pack
- If a pack has no items with `scan_rule` in phases 0-1, show: `(Nenhum item escaneável nesta fase)`

### World Map Generation

Generate a horizontal path from the pack's phases. Each phase is a node on the path.

**Determine phase status from scan results:**
- A phase is `DONE` if ALL its required items can be evaluated AND all evaluate to true. Specifically: every required item in the phase MUST have a `scan_rule` defined, and every such `scan_rule` must evaluate to true. If ANY required item lacks a `scan_rule`, the phase CANNOT be `DONE` (treat as `CURRENT` or `FUTURE` instead) — absence of evidence is not evidence of completion
- A phase is `CURRENT` if it's the first phase that is NOT done
- A phase is `FUTURE` if it comes after the current phase

**Node symbols:**
- Done: `[DONE]` connected with `━━━`
- Current: `[>>>]` connected with `━━━` (left) and `───` (right)
- Future: `[·]` connected with `───`

**First node label:** `{pack.phases[0].name}`
**Last node label:** Uses the last phase name

**Template for new project (nothing done):**

```
    [>>>] ─── [·] ─── [·] ─── [·] ─── [·]
    {phase_0}                        {phase_N}
```

**Template for in-progress project:**

```
    [DONE] ━━━ [DONE] ━━━ [>>>] ─── [·] ─── [·]
    {phase_0}  {phase_1}  {phase_2}        {phase_N}
```

**Template for completed project:**

```
    [DONE] ━━━ [DONE] ━━━ [DONE] ━━━ [DONE] ━━━ [DONE]
    {phase_0}  {phase_1}  {phase_2}  {phase_3}  {phase_4}
                                                  LENDÁRIO!
```

**Rules:**
- Show phase names below the first node, current node, and last node at minimum
- If there are 5 or fewer phases, show all names
- If there are more than 5, show first, current, and last
- For a completed project, add `LENDÁRIO!` below the last node

---

## 4. Project Classification

Determine the project's class based on scan results. Evaluate rules top-to-bottom — first match wins.

| # | Classe | Condição | Descrição |
|---|--------|----------|-----------|
| 5 | Fortaleza Ativa | Has quest-log (`.aios/quest-log.yaml` exists) | "Jornada em andamento. Bem-vindo de volta." |
| 4 | Fortaleza em Obras | Has AIOS (`.aios/` dir exists) AND has code/content (any source files or pack-relevant content) | "A construção começou. Continue." |
| 3 | Fundação | Has git (`.git/` dir exists) AND has package manager config (`package.json`, `Cargo.toml`, `pyproject.toml`, `config.yaml`, or equivalent) | "Os alicerces existem. Hora de subir paredes." |
| 2 | Pergaminho | Has docs only (`docs/` dir OR `*.md` files OR PRD exists) but no code | "Tem a planta. Falta construir." |
| 1 | Terreno Virgem | Empty folder or only minimal files (< 3 files, no directories) | "Uma página em branco. Tudo é possível." |

### Detection Logic

```
scan results = {
  has_quest_log:  Glob(".aios/quest-log.yaml") found
  has_aios:       Glob(".aios/") found
  has_git:        Glob(".git/") found
  has_pkg_mgr:    Glob("package.json") OR Glob("Cargo.toml") OR Glob("pyproject.toml") OR Glob("config.yaml") found
  has_docs:       Glob("docs/") OR any *.md files found
  has_code:       Glob("src/") OR Glob("lib/") OR Glob("app/") OR Glob("agents/") OR any source files found
  file_count:     total files in top-level directory
}

if has_quest_log  → Fortaleza Ativa
if has_aios AND (has_code OR has_docs)  → Fortaleza em Obras
if has_git AND has_pkg_mgr  → Fundação
if has_docs AND NOT has_code  → Pergaminho
else  → Terreno Virgem
```

**Important:** Classification uses generic signals. NO pack-specific hardcoding. The signals (`has_git`, `has_aios`, etc.) work for any type of project.

---

## 5. Welcome Message

After the Project Card, output a thematic welcome message based on the project's class. Each class has a fixed message template.

### Messages by Class

**Terreno Virgem:**

```
  "Uma nova jornada começa. Você está diante de um terreno virgem —
   sem limites, sem restrições. O primeiro passo? Montar a oficina."

  Preparando tudo para você...
```

**Pergaminho:**

```
  "Você já tem a planta. A visão existe. Agora precisa das
   ferramentas certas para transformar ideias em realidade."

  Equipando sua oficina...
```

**Fundação:**

```
  "Os alicerces estão firmes. Repositório configurado, dependências no lugar.
   Hora de trazer a orquestração para acelerar a construção."

  Ativando sistema de orquestração...
```

**Fortaleza em Obras:**

```
  "A construção está em andamento! Vou verificar onde você parou
   e preparar o próximo passo."

  Retomando de onde você parou...
```

**Fortaleza Ativa:**

```
  "Bem-vindo de volta, {hero_name}! Sua jornada continua.
   Vamos ver o que vem a seguir."

  Carregando quest log...
```

**Note:** These messages are universal — they work for any pack because they reference the project state, not pack-specific content.

---

## 6. Action Plan

After the welcome message, show a numbered list of what will happen next. The items depend on what the project needs based on its class.

### Template

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PLANO DE AÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {numbered_action_list}

  Executar? (s/n)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Action List Generation Rules

Build the action list dynamically based on what's missing:

| Condition | Action Item |
|-----------|-------------|
| No `.aios/` directory | "Instalar AIOS neste projeto" |
| No quest-log | "Criar quest log gamificado" |
| Quest-log exists but incomplete | "Rodar scan para atualizar progresso" |
| Dashboard not mentioned yet | "Iniciar dashboard no segundo monitor" |
| Always (last item) | "Mostrar primeira missão" or "Mostrar próxima missão" |

**Example for Terreno Virgem:**

```
  1. Instalar AIOS neste projeto
  2. Iniciar dashboard no segundo monitor
  3. Criar quest log gamificado
  4. Mostrar primeira missão

  Executar? (s/n)
```

**Example for Fortaleza em Obras:**

```
  1. Criar quest log gamificado
  2. Rodar scan para detectar progresso
  3. Iniciar dashboard no segundo monitor
  4. Mostrar próxima missão

  Executar? (s/n)
```

**CRITICAL:** Wait for user confirmation (`s` or `n`) before proceeding. If user says `n`, respect the decision and stop.

---

## 7. Resumption Banner

When a quest-log already exists (Fortaleza Ativa), do NOT show the full ceremony. Instead, show a compact resumption banner with current stats and go straight to the next mission.

### Template

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {pack.icon} QUEST — {pack.name}                    {project_name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Nível {level_number}: {level_name}    XP: {total_xp}/{next_level_xp}
  Progresso: {items_done + items_skipped}/{items_total} ({percent}%)
  ████████████░░░░░░░░  {percent}%

  Bem-vindo de volta, {hero_name}!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Note:** This banner does NOT show the next mission — that is guide.md's responsibility. The SKILL.md orchestrator calls ceremony §7 for the banner, then guide.md §2+§3 for the mission card. This separation prevents duplicating mission selection logic.

### Field Sources

| Field | Source |
|-------|--------|
| `pack.icon` | Pack YAML `pack.icon` (fallback: empty string `""` if not present) |
| `pack.name` | Pack YAML `pack.name` |
| `project_name` | Directory name from `cwd` |
| `hero_name` | `quest_log.meta.hero_name` (fallback: "Aventureiro") |
| `level_number` | `quest_log.stats.level` |
| `level_name` | `pack.levels[level_number].name` |
| `total_xp` | `quest_log.stats.total_xp` |
| `next_level_xp` | `pack.levels[level_number + 1].xp` (or `MAX` if at max level) |
| `items_done` | `quest_log.stats.items_done` |
| `items_skipped` | `quest_log.stats.items_skipped` |
| `items_total` | `quest_log.stats.items_total` |
| `percent` | `quest_log.stats.percent` |

### Progress Bar Generation

Generate a 20-character progress bar using the canonical `progress_bar()` function from guide.md §5:

```
filled = round(20 * percent / 100)
bar = "█" * filled + "░" * (20 - filled)
```

**Note:** Uses `round()` (not `floor()`) to match `progress_bar()` in guide.md §5. If `percent` is 0 or `items_total` is 0, render an empty bar (`░` × 20).

**Contract — progress bar visual consistency:** The Resumption Banner progress bar MUST use the exact same character set (`█` for filled, `░` for empty), bar width (20 characters), and rounding logic (`round()`) as:
- The **loading sequence** in this file (Section 2)
- The **`progress_bar()` function** in guide.md §5
- The **summary view** in guide.md §6

If any of these implementations change their character set, width, or rounding strategy, ALL others MUST be updated in the same commit. This contract prevents visual drift across modules.

### Rules

- NO title screen ASCII art
- NO loading sequence
- NO project card
- NO welcome message
- NO action plan confirmation
- Just the banner → then hand off to guide.md for the next mission
- This should feel FAST — the user is returning, not discovering

---

## Execution Summary

The SKILL.md orchestrator calls this module in two scenarios:

### Scenario A: First Time (no quest-log)

Output in this exact order, as one continuous text flow:

1. Title Screen (Section 1)
2. Hero Identity (Section 1.5) — ask name and optional title
3. Loading Sequence (Section 2)
4. Project Card (Section 3) — uses classification from Section 4
5. Welcome Message (Section 5) — uses hero_name
6. Action Plan (Section 6) — wait for confirmation

### Scenario B: Resumption (quest-log exists)

Output only:

1. Resumption Banner (Section 7) — then hand off to guide.md

### Critical Reminders

- **All output is plain text** — never wrap in code blocks
- **All scan happens BEFORE output** — the user sees one smooth, uninterrupted visual flow
- **Pack-agnostic** — every template uses `pack.*` fields, never hardcoded pack content
- **Render in < 3 seconds** — keep it efficient, no unnecessary tool calls during output
