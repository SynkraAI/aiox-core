# f2-qa-base-components

> **Phase 2, Step 7** — QA gate de componentes base. BLOQUEANTE para Phase 3.

## Metadata

```yaml
task:
  id: f2-qa-base-components
  phase: 2
  step: 7
  agent: ds-foundations-lead
  depends_on: f2-adapt-shadcn-components
  blocking: true
  gate: true
  next: f3-derive-components (se PASS)
```

## Objetivo

Validar que todos os componentes base adaptados estao corretos: renderizam sem erros, mantiveram API, correspondem visualmente ao Figma, e preservaram acessibilidade.

## QA Checklist (por componente)

### Renderizacao

- [ ] Componente importa sem erros de TypeScript
- [ ] Componente renderiza sem runtime errors
- [ ] Todas as variantes renderizam corretamente

### Props API

- [ ] Nenhuma prop removida
- [ ] Nenhuma prop obrigatoria adicionada
- [ ] Tipos TypeScript inalterados
- [ ] `className` prop funciona (merge com classes internas)

### Visual — Estados

- [ ] **Default** — Corresponde ao Figma
- [ ] **Hover** — Transicao visual conforme Figma
- [ ] **Focus** — Ring visivel, cor correta
- [ ] **Active/Pressed** — Feedback visual presente
- [ ] **Disabled** — Visualmente distinto, nao interativo

### Tokens Semanticos

- [ ] Nenhuma cor hardcoded (hex/rgb direto nas classes)
- [ ] Usa `bg-primary`, `text-foreground`, etc. (semantic tokens)
- [ ] Tokens customizados via `@theme inline` (se extensoes)

### Acessibilidade

- [ ] ARIA attributes preservados
- [ ] `data-slot` attributes preservados
- [ ] Focus ring visivel via teclado (`focus-visible`)
- [ ] Contraste texto/fundo >= 4.5:1 (WCAG AA)
- [ ] Keyboard navigation funcional

### Dark Mode

- [ ] Componente adapta corretamente em `.dark`
- [ ] Contraste mantido em dark mode
- [ ] Nenhum estado visual "desaparece" em dark mode

### Consistencia Cross-Component

- [ ] Mesmo border-radius entre componentes relacionados
- [ ] Mesma escala de padding
- [ ] Mesmas transicoes (duracao, easing)
- [ ] Mesmos shadow patterns

## Componentes a Validar

| Componente | Arquivo | Status |
|---|---|---|
| Button | `components/ui/button.tsx` | [ ] |
| Input | `components/ui/input.tsx` | [ ] |
| Badge | `components/ui/badge.tsx` | [ ] |
| Card | `components/ui/card.tsx` | [ ] |
| Alert | `components/ui/alert.tsx` | [ ] |
| Dialog | `components/ui/dialog.tsx` | [ ] |

## Verdicts

| Verdict | Condicao | Acao |
|---------|----------|------|
| **PASS** | Todos os checks ok para todos os componentes | Prosseguir para Phase 3 |
| **PASS com observacoes** | Checks criticos ok, minor visual diffs | Documentar e prosseguir |
| **FAIL** | API quebrada, acessibilidade comprometida, render error | Retornar para f2-adapt-shadcn-components |

## Output

Report de QA com resultado por componente e verdict final.

## Related Checklists

- `squads/design/checklists/component-adaptation-checklist.md`
