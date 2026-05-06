# Build Component

**Task:** `build-component`
**Agent:** @design-architect
**Type:** Foundation
**Priority:** 3

---

## Description

Criar componente React seguindo Atomic Design com CVA variants, Radix primitives (se aplicavel), TypeScript strict e zero hardcoded values.

---

## Input

```yaml
component_name: 'Button'
component_type: 'atom | molecule | organism'
design_tokens: 'path para design-tokens.yaml'
variants:
  - primary
  - secondary
  - outline
  - ghost
sizes:
  - sm
  - md
  - lg
```

---

## Process

### 1. Definir Interface TypeScript

- Props tipadas com generics quando necessario
- Extend de HTML element props nativos

### 2. Implementar com CVA

- cva() para cada variant e size
- Composicao com tailwind-merge (cn helper)

### 3. Radix Primitive (se aplicavel)

- Usar Radix como base para Dialog, Dropdown, Tooltip, etc.
- Acessibilidade ARIA built-in

### 4. Storybook Story (opcional)

- Story com todas as variants
- Controls interativos

### 5. Validacao

- Zero hardcoded colors/spacing/fonts
- Todos os valores via tokens/Tailwind
- forwardRef implementado
- Keyboard navigation testada

---

## Output

```
Entregaveis:
1. [component-name].tsx - Componente React
2. [component-name].stories.tsx - Storybook (opcional)
3. index.ts - Re-export
```

---

**Created:** 2026-02-10
**Version:** 1.0
