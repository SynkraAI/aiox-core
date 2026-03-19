# f3-qa-derived-components

> **Phase 3, Step 9** — QA gate final de todos os componentes. Gate de conclusao do pipeline.

## Metadata

```yaml
task:
  id: f3-qa-derived-components
  phase: 3
  step: 9
  agent: ds-foundations-lead
  depends_on: f3-derive-components
  blocking: true
  gate: true
  final: true
```

## Objetivo

Validar TODOS os componentes shadcn (base + derivados) como um conjunto coeso, garantindo consistencia visual cross-component, acessibilidade, e dark mode.

## QA Checklist — Batch Validation

### Por Componente (todos)

- [ ] Importa sem erros de TypeScript
- [ ] Renderiza sem runtime errors
- [ ] Props API inalterada
- [ ] Tokens semanticos (sem hardcoded colors)
- [ ] Dark mode funcional
- [ ] Focus-visible presente (componentes interativos)

### Consistencia Cross-Component

- [ ] **Radius:** Mesmo border-radius para componentes de mesma categoria
- [ ] **Transitions:** Mesma duracao e easing em todos os interativos
- [ ] **Shadows:** Escala consistente (none → sm → md → lg)
- [ ] **Focus ring:** Mesmo estilo em todos os focusaveis
- [ ] **Disabled state:** Mesmo padrao visual em todos
- [ ] **Padding scale:** Proporcional entre tamanhos (sm, md, lg)
- [ ] **Typography:** Mesmos font-size/weight para elementos similares

### Acessibilidade — Batch

- [ ] Todos os pares foreground/background passam WCAG AA (4.5:1)
- [ ] Todos os componentes interativos tem focus-visible
- [ ] Nenhum ARIA attribute removido
- [ ] Keyboard navigation funcional em Forms e Navigation components

### Dark Mode — Batch

- [ ] Todos os componentes adaptam em `.dark`
- [ ] Contraste mantido em dark mode
- [ ] Cores de feedback (destructive, warning, info, success) visiveis em ambos os modos

### Integracao

- [ ] `npm run dev` executa sem erros
- [ ] Nenhum warning de Tailwind sobre classes desconhecidas
- [ ] `@theme inline` bridge cobre todas as variaveis usadas

## Grupos de Validacao

| Grupo | Componentes | Status |
|---|---|---|
| Forms | Select, Checkbox, RadioGroup, Switch, Slider, Textarea, Form, Label | [ ] |
| Overlays | Dialog, Drawer, Sheet, Popover, Tooltip, HoverCard, DropdownMenu, ContextMenu, Menubar, Command, AlertDialog | [ ] |
| Navigation | Tabs, Breadcrumb, NavigationMenu, Pagination, Sidebar | [ ] |
| Data Display | Table, Accordion, Carousel, Progress, Calendar, Avatar, Collapsible, Resizable, ScrollArea, Separator, Skeleton | [ ] |
| Feedback | Alert, Toast/Sonner, Toggle, ToggleGroup | [ ] |
| Base (re-check) | Button, Input, Badge, Card | [ ] |

## Verdicts

| Verdict | Condicao | Acao |
|---------|----------|------|
| **PASS** | Todos os checks ok | Pipeline completo |
| **PASS com observacoes** | Checks criticos ok, minor visual diffs documentados | Pipeline completo com notas |
| **FAIL** | API quebrada, acessibilidade comprometida, inconsistencia grave | Retornar para f3-derive-components |

## Metricas de Conclusao

Ao final, reportar:

- Total de componentes adaptados: X / 56
- Tokens customizados: X (core) + X (extensoes)
- Checks de contraste WCAG: X passed / X total
- Tempo total do pipeline: (registrar)

## Output

Report final de QA com:
- Resultado por grupo
- Metricas de conclusao
- Lista de observacoes (se houver)
- Verdict final

## Related Checklists

- `squads/design/checklists/component-adaptation-checklist.md`
