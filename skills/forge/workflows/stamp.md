# Workflow: Stamp (Reference Pattern Import)

> Clone repo → Extract patterns → Generate report → Cleanup

---

## When to Use

- User runs `/forge stamp {github-url}`
- User says "quero seguir o padrão de {url}" during a Forge run
- User wants to extract architecture patterns from a reference project
- Works standalone OR mid-run (during Phase 1)
- **Nota:** Stamps NÃO são injetados em runs QUICK. A injeção automática acontece apenas em fluxos que executam Phase 1 (ex.: FULL_APP, DESIGN_SYSTEM, LANDING_PAGE, CLONE_SITE). SINGLE_FEATURE pula Phase 1 — o stamp fica salvo em `.aios/stamps/` mas não é injetado automaticamente.

---

## Pipeline

```
CLONE → ANALYZE → REPORT → CLEANUP → [INTEGRATE]
```

No standard phases (0-5). This is a utility workflow.

---

## Execution

### Step 1: Clone (shallow)

1. Extract `{slug}` from URL: last path segment, minus `.git` suffix
   - `https://github.com/vercel/next.js` → slug = `next.js`
   - `https://github.com/user/my-app.git` → slug = `my-app`
2. Create temp directory: `mkdir -p .stamp/`
3. Shallow clone: `git clone --depth 1 {url} .stamp/{slug}`
4. If clone fails:
   - Check if URL is accessible (private repo? typo?)
   - Show: "Não consegui clonar {url}. Verifica se o repo é público e a URL está correta."
   - STOP — do not proceed

**Size guard:** After clone, check size:
```bash
du -sh .stamp/{slug}/.git | awk '{print $1}'
```
If > 500MB: warn "Repo grande ({size}). A análise pode demorar. Continuar?" — proceed on confirmation.

### Step 2: Analyze (@architect)

Dispatch @architect via Agent tool:
- Agent: `{AIOS_HOME}/.aios-core/development/agents/aios-architect.md`
- Task: Analyze reference project and extract patterns
- Input: `.stamp/{slug}/` directory
- Instructions — extract and document:

| Aspect | What to Look For |
|--------|-----------------|
| **Folder structure** | `tree -L 3 -I node_modules` output, annotated |
| **Tech stack** | Framework, database, ORM, styling, testing, deploy |
| **Design patterns** | State management, API layer, auth, error handling |
| **Naming conventions** | Files (kebab? camel?), components (Pascal?), variables |
| **Code organization** | Feature-based, layer-based, barrel exports, co-location |
| **Configuration** | Env strategy, config files, build setup, CI/CD |

- Output: Structured analysis as markdown

Show progress:
```
  🔍 @architect (Aria) está analisando .stamp/{slug}/...
  Extraindo padrões de folder structure, stack, naming e organização.
```

### Step 3: Generate Report

Create `stamp-report.md` from @architect analysis:

```markdown
# Stamp Report — {repo-name}

> Source: {url}
> Analyzed: {ISO 8601 timestamp}

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | {e.g., Next.js} | {e.g., 15.x} |
| Database | {e.g., PostgreSQL} | — |
| ORM | {e.g., Prisma} | {e.g., 6.x} |
| Styling | {e.g., Tailwind CSS} | — |
| Testing | {e.g., Vitest + Playwright} | — |
| Deploy | {e.g., Vercel} | — |

## Folder Structure

{tree output, annotated with purpose of each top-level directory}

## Design Patterns

### {Pattern Name}
- **Where:** {file path example}
- **How:** {brief description}
- **Adopt?** Yes/No — {reason}

{repeat for each major pattern found}

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | {e.g., kebab-case} | `user-profile.tsx` |
| Components | {e.g., PascalCase} | `UserProfile` |
| Functions | {e.g., camelCase} | `getUserById` |
| Constants | {e.g., SCREAMING_SNAKE} | `MAX_RETRIES` |
| Directories | {e.g., kebab-case} | `user-management/` |

## Code Organization

{Feature-based, layer-based, hybrid — with explanation of how files are grouped}

## Configuration

{Env strategy, notable config patterns, build pipeline}

## Recommended Adoption

### Adopt (strong patterns worth following)
- {pattern}: {why}

### Skip (patterns specific to this project or suboptimal)
- {pattern}: {why skip}

### Adapt (good idea, but modify for our context)
- {pattern}: {what to change and why}
```

**Save to:**
- If inside a Forge run (`state.json` exists with `status == "running"`):
  `.aios/forge-runs/{run_id}/spec/stamp-report.md`
- If standalone:
  `.aios/stamps/{slug}.md` (create `.aios/stamps/` if needed)

### Step 4: Cleanup

1. Delete temp directory: `rm -rf .stamp/`
2. Verify deletion: `test -d .stamp/ && echo "WARN: .stamp/ still exists" || echo "OK"`
3. If deletion fails: warn user with manual instruction `rm -rf .stamp/`

### Step 5: Integration

**If inside an active Forge run:**
- Update state.json:
  ```json
  {
    "stamp": {
      "url": "{github-url}",
      "slug": "{slug}",
      "report_path": ".aios/forge-runs/{run_id}/spec/stamp-report.md",
      "analyzed_at": "{ISO 8601}"
    }
  }
  ```
- Show: "Stamp importado. @pm e @architect vão usar esses padrões nas próximas fases."
- The `stamp-inject` plugin handles automatic injection into Phase 1 agents.

**If standalone:**
- Show report summary (Tech Stack + Recommended Adoption sections)
- Suggest: "Para usar esses padrões num novo projeto: `/forge {descrição}` — o stamp será injetado automaticamente."
- Mention: "Stamp salvo em `.aios/stamps/{slug}.md` — disponível para futuros runs."

---

## Mid-Run Support

When a user says "quero que siga o padrão de {url}" during Phase 1:

1. Detect intent: URL + pattern-related keywords ("padrao", "referencia", "estilo", "como o")
2. Pause current phase execution
3. Execute Steps 1-4 (Clone → Cleanup) inline
4. Save to `.aios/forge-runs/{run_id}/spec/stamp-report.md`
5. Update state.json with `stamp` field
6. Resume Phase 1 — @pm and @architect will receive stamp context via `stamp-inject` plugin

---

## Agent Mapping

| Step | Agent | Note |
|------|-------|------|
| 1 (Clone) | Forge (self) | Git operations only — Forge CAN do git clone |
| 2 (Analyze) | @architect | Pattern extraction is architecture work |
| 3 (Report) | Forge (self) | Report assembly from @architect output |
| 4 (Cleanup) | Forge (self) | File deletion |

---

## Error Recovery

| Error | Action |
|-------|--------|
| Clone fails (auth/404) | Show error + suggest checking URL. STOP. |
| Repo > 500MB | Warn + ask confirmation. Proceed if yes. |
| @architect fails | Retry 1x. If still fails: generate partial report from what was read. |
| Cleanup fails | Warn user + manual instruction. Continue (non-blocking). |
| Mid-run stamp during wrong phase | Save stamp, inject when Phase 1 starts (or re-enters). |

---

## Stale Stamp Cleanup

On `before:run` (handled by runner or lifecycle plugin):
- Check if `.stamp/` directory exists from a previous interrupted stamp
- If exists: delete silently (`rm -rf .stamp/`)
- Log: "Limpei .stamp/ de um stamp anterior interrompido."
