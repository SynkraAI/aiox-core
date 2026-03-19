---
title: "Brief Validation Checklist"
purpose: "Validate that incoming page composition briefs follow the 3-Input Framework before starting composition"
version: "1.0.0"
source: "Research: docs/research/2026-03-08-ai-design-tools-prompts/"
created: "2026-03-08"
agent: "page-composer"
command: "*validate-brief"
---

# Brief Validation Checklist

> Run BEFORE `*compose-page`. Blocks composition if score < 5/8.

## Scoring

| Score | Verdict | Action |
|-------|---------|--------|
| 8/8 | EXCELLENT | Proceed immediately |
| 6-7/8 | GOOD | Proceed with noted gaps |
| 5/8 | MINIMUM | Proceed with warnings |
| < 5/8 | INSUFFICIENT | Ask user for missing inputs before proceeding |

---

## Checks

### 1. Product Surface (3 checks)

- [ ] **1.1 Components specified** — Brief names specific UI elements (cards, tables, forms, charts), not vague descriptions ("a dashboard", "a nice page")
- [ ] **1.2 Data fields identified** — Brief specifies what data appears (revenue, user count, order status), not generic placeholders
- [ ] **1.3 User actions defined** — Brief lists actions users can take (filter, sort, submit, toggle, navigate)

### 2. Context of Use (2 checks)

- [ ] **2.1 Persona identified** — Brief states WHO uses the page (ops manager, end user, admin, visitor)
- [ ] **2.2 Decision/outcome stated** — Brief explains WHAT the user decides or achieves ("monitor daily performance", "compare pricing plans", "sign up for trial")

### 3. Constraints (3 checks)

- [ ] **3.1 Device/platform stated** — Brief specifies mobile-first, desktop-first, or responsive-all
- [ ] **3.2 Visual tone defined** — Brief includes at least one design buzzword (minimal, premium, bold, cinematic, playful, developer-focused, corporate, editorial) OR specific color/font direction
- [ ] **3.3 Technical stack confirmed** — Brief confirms or defaults to React + Tailwind + shadcn/ui + TypeScript

---

## Content Readiness (bonus, non-blocking)

- [ ] Real copy provided (not lorem ipsum)
- [ ] Copy framework identified (AIDA / PAS / StoryBrand)
- [ ] Brand assets referenced (logo, palette, fonts)

---

## When Brief Fails

If score < 5/8, ask the user ONE combined question:

```
Para compor a pagina com qualidade, preciso de mais contexto:

1. PRODUCT SURFACE: Quais componentes especificos, dados e acoes a pagina deve ter?
2. CONTEXT: Quem usa essa pagina e para tomar qual decisao?
3. CONSTRAINTS: Desktop ou mobile-first? Qual o tom visual (ex: minimal, premium, bold)?
```

Do NOT start composition until at least checks 1.1, 2.1, and 3.1 pass.

---

## Anti-Patterns

- Starting composition with "faz uma landing page" (no product surface)
- Assuming tone without asking (defaults to generic)
- Proceeding without device constraint (produces desktop-only or untested responsive)
