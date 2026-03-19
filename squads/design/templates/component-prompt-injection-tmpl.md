# Component Prompt Injection Template

> Template ID: component-prompt-injection-tmpl
> Squad: Design
> Version: 1.0.0
> Source: Meeting Insights 2026-02-16 (#3)
> Governance Protocol: `squads/design/protocols/ai-first-governance.md`

## Purpose

Template para injetar regras obrigatórias em componentes que AI agents leem automaticamente.

**Princípio:** Se a regra está no código, AI não pode ignorar.

---

## AI-First Governance Gate

- [ ] Validar fontes canônicas (`workspace/system/*`, `workspace/ui/registry.json`, `workspace/domains/design-system/*`)
- [ ] Registrar status por claim: `Implemented`, `Partially implemented`, `Concept only`
- [ ] Explicitar contradições e itens não resolvidos
- [ ] Evitar bloqueio semântico em CI; usar checkpoints de task/workflow

---

## Template Base

```css
/*
@AIOX-RULES
===============================================================================
COMPONENT: [ComponentName]
SURFACE: [S1|S2|S3]
===============================================================================

COPY RULES:
- max_words_per_sentence: 25
- cta_rule: action_verb_specific (ex: "Criar conta" não "Clique aqui")
- error_rule: must_have_next_step (ex: "Email inválido. Use formato: nome@email.com")
- label_rule: noun_not_verb (ex: "Configurações" não "Configurar")

VISUAL RULES:
- tokens_source: squads/design/data/design-tokens-spec.yaml
- spacing_base: 4px (use multiples: 4, 8, 12, 16, 24, 32, 48, 64)
- border_radius: use token (sm|md|lg|xl), never hardcode px

BEHAVIORAL RULES:
- focus_visible: required for all interactive elements
- keyboard_nav: required (Tab, Enter, Escape)
- aria_labels: required for icons without text

NON-NEGOTIABLE:
- DO NOT recreate this component - extend via variants
- DO NOT hardcode colors - use CSS variables from tokens
- DO NOT skip accessibility attributes
===============================================================================
*/
```

---

## Surface Types

| Surface | Contexto | Regras Específicas |
|---------|----------|-------------------|
| **S1** | Transactional (checkout, forms) | Max 15 words/sentence, CTA = action verb |
| **S2** | Informational (dashboards, lists) | Max 25 words/sentence, scannable |
| **S3** | Educational (docs, help) | Max 30 words/sentence, examples required |

---

## Exemplos por Tipo de Componente

### Button

```css
/*
@AIOX-RULES
===============================================================================
COMPONENT: Button
SURFACE: S1
===============================================================================

COPY RULES:
- max_words: 3 (ideal: 1-2)
- cta_rule: action_verb_specific
- forbidden: "Clique aqui", "Enviar", "Submit" (muito genérico)
- recommended: "Criar conta", "Salvar alterações", "Excluir item"

VISUAL RULES:
- min_touch_target: 44x44px (WCAG 2.5.5)
- padding: use spacing tokens (py-2 px-4 minimum)
- contrast: 4.5:1 minimum (text on background)

VARIANTS:
- primary: high emphasis actions (1 per screen recommended)
- secondary: medium emphasis
- outline: low emphasis
- ghost: minimal emphasis
- destructive: dangerous actions (requires confirmation)

NON-NEGOTIABLE:
- DO NOT recreate - use variants or extend
- MUST have focus-visible ring
- MUST support keyboard activation (Enter, Space)
===============================================================================
*/
```

### Input

```css
/*
@AIOX-RULES
===============================================================================
COMPONENT: Input
SURFACE: S1
===============================================================================

COPY RULES:
- label: required, noun form, max 3 words
- placeholder: example format, not instructions
- error: specific problem + how to fix
- helper_text: optional, max 10 words

VISUAL RULES:
- min_height: 40px (touch target)
- label_position: above input (not inside)
- error_color: use semantic.error token

ACCESSIBILITY:
- aria-describedby: link to error/helper text
- aria-invalid: true when error
- autocomplete: use appropriate value

NON-NEGOTIABLE:
- MUST have visible label (no placeholder-only)
- MUST show error state with message
- MUST support paste
===============================================================================
*/
```

### Card

```css
/*
@AIOX-RULES
===============================================================================
COMPONENT: Card
SURFACE: S2
===============================================================================

COPY RULES:
- title: max 6 words, noun phrase
- description: max 25 words, scannable
- cta: 1-2 words, action verb

VISUAL RULES:
- padding: use card.padding tokens (p-4 minimum)
- border_radius: use borders.radius.lg token
- shadow: optional, use shadows.md for elevation

HIERARCHY:
- 1 primary action per card
- max 2 secondary actions
- actions at bottom or inline

NON-NEGOTIABLE:
- DO NOT nest cards
- MUST have clear visual boundary
- Interactive cards MUST be focusable
===============================================================================
*/
```

---

## Como Usar

### 1. Ao Criar Componente Novo

```tsx
// components/ui/button.tsx

/*
@AIOX-RULES
... (cole o template apropriado)
*/

import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  // base styles from tokens
)
```

### 2. Ao Revisar Componente Existente

1. Verificar se tem @AIOX-RULES
2. Se não tem, adicionar baseado no tipo
3. Validar que código segue as regras

### 3. Ao Gerar com AI

O AI agent DEVE:
1. Ler o @AIOX-RULES do componente
2. Seguir TODAS as regras listadas
3. Não criar componente novo se variante resolve
4. Referenciar tokens, não hardcode valores

---

## Validação

```bash
# Verificar se componentes têm @AIOX-RULES
grep -r "@AIOX-RULES" app/components/

# Verificar se há hardcoded colors (violação)
grep -r "#[0-9A-Fa-f]{6}" app/components/ --include="*.tsx"
```

---

## Referências

- Meeting Insights: `docs/research/2026-02-16-ux-writing-governance-ds-ai/meeting-insights-2026-02-16.md`
- Design Tokens: `squads/design/data/design-tokens-spec.yaml`
- WCAG Checklist: `squads/design/checklists/ds-accessibility-wcag-checklist.md`

---

*Template criado: 2026-02-16*
*Squad: Design*
*Insight Source: #3 Prompt Injection nos Componentes*
