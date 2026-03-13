# Skill: Course Generation Workflow

**Type:** CreatorOS Standard Workflow
**Last Updated:** 2025-10-18

---

## Purpose

This skill defines the LINEAR, NO-SEARCH workflow for course generation using CreatorOS.

---

## Core Principle

**"If you're searching for files, the workflow is broken."**

Every file location must be known in advance. No Glob, no Grep, no hunting.

---

## Standard Workflow

### Step 1: Verify Inputs (Pre-Flight)

```bash
Required Files (check before starting):
1. outputs/courses/{slug}/COURSE-BRIEF.md (or will create)
2. expansion-packs/creator-os/checklists/checklist-aula-perfeita.md
3. expansion-packs/creator-os/templates/ (all templates)
4. squads/mind-cloning/minds/{professor_slug}/ (if clone mode)
```

**Action:** If ANY missing → STOP and ask user or create from template.

---

## File Location Map (NO SEARCHING)

```yaml
Templates: expansion-packs/creator-os/templates/
  - course-brief-template.md
  - curriculum-template.yaml
  - lesson-template.md

Checklists: expansion-packs/creator-os/checklists/
  - checklist-aula-perfeita.md

MMOS Personas: squads/mind-cloning/minds/{professor_slug}/
  - system_prompts/system-prompt-generalista.md
  - analysis/identity-core.yaml
  - synthesis/communication-style.md

Course Output: outputs/courses/{slug}/
  - COURSE-BRIEF.md
  - curriculum.yaml
  - lessons/modulo-{N}/aula-{N}.md
  - resources/
  - ANALISE-QUALIDADE-CHECKLIST.md
```

---

## Linear Execution Order

1. **Verify** all inputs exist at known locations
2. **Create/Read** COURSE-BRIEF.md
3. **Generate** curriculum.yaml
4. **Generate** lessons (one by one)
5. **Validate** quality with checklist
6. **Fix** priority issues
7. **Done** - no searching, no hunting

---

**Principle:** Know, don't search. Execute, don't hunt.
