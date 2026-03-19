# f3-derive-components

> **Phase 3, Step 8** — Derivar componentes restantes seguindo padroes estabelecidos nas Fases 1 e 2.

## Metadata

```yaml
task:
  id: f3-derive-components
  phase: 3
  step: 8
  agent: ds-foundations-lead
  depends_on: f2-qa-base-components (PASS)
  blocking: false
  next: f3-qa-derived-components
```

## Objetivo

Atualizar os componentes shadcn restantes (alem dos base) aplicando os padroes visuais e tokens estabelecidos nas Fases 1 e 2. Esta fase e mais autonoma — o agente aplica os padroes sem precisar de input novo do Figma para cada componente.

## Logica de Derivacao

Os padroes extraidos dos componentes base servem como guia:

| Padrao | Fonte | Aplicacao |
|---|---|---|
| Border radius | Button, Card | Todos os containers e inputs |
| Transition | Button | Todos os interativos |
| Shadow | Card | Containers elevados |
| Focus ring | Input, Button | Todos os focusaveis |
| Padding scale | Button, Card | Componentes de tamanho similar |
| Typography | Badge, Alert | Componentes de texto |

**Regra:** Se Button usa `rounded-lg`, Dialog tambem usa `rounded-lg`. Se Input usa `transition-all duration-200`, Select tambem usa.

## Grupos de Componentes

### Forms

| Componente | Arquivo | Derivar de |
|---|---|---|
| Select | `components/ui/select.tsx` | Input (border, focus, padding) |
| Checkbox | `components/ui/checkbox.tsx` | Input (focus ring), Button (radius) |
| RadioGroup | `components/ui/radio-group.tsx` | Checkbox (pattern) |
| Switch | `components/ui/switch.tsx` | Button (transition), Input (focus) |
| Slider | `components/ui/slider.tsx` | Input (track), Button (thumb) |
| Textarea | `components/ui/textarea.tsx` | Input (direct extension) |
| Form | `components/ui/form.tsx` | Layout only (minimal changes) |
| Label | `components/ui/label.tsx` | Typography tokens |

### Overlays

| Componente | Arquivo | Derivar de |
|---|---|---|
| Drawer | `components/ui/drawer.tsx` | Dialog (backdrop, container) |
| Sheet | `components/ui/sheet.tsx` | Dialog (overlay pattern) |
| Popover | `components/ui/popover.tsx` | Card (container), Dialog (overlay) |
| Tooltip | `components/ui/tooltip.tsx` | Badge (compact), Popover (overlay) |
| HoverCard | `components/ui/hover-card.tsx` | Card + Popover |
| DropdownMenu | `components/ui/dropdown-menu.tsx` | Popover (container) |
| ContextMenu | `components/ui/context-menu.tsx` | DropdownMenu (same pattern) |
| Menubar | `components/ui/menubar.tsx` | DropdownMenu (same pattern) |
| Command | `components/ui/command.tsx` | Dialog + Input |
| AlertDialog | `components/ui/alert-dialog.tsx` | Dialog (direct extension) |

### Navigation

| Componente | Arquivo | Derivar de |
|---|---|---|
| Tabs | `components/ui/tabs.tsx` | Button (interactive), Badge (indicator) |
| Breadcrumb | `components/ui/breadcrumb.tsx` | Typography, muted colors |
| NavigationMenu | `components/ui/navigation-menu.tsx` | Button + Popover |
| Pagination | `components/ui/pagination.tsx` | Button (page numbers) |
| Sidebar | `components/ui/sidebar.tsx` | Sidebar tokens, Button |

### Data Display

| Componente | Arquivo | Derivar de |
|---|---|---|
| Table | `components/ui/table.tsx` | Card (container), border tokens |
| Accordion | `components/ui/accordion.tsx` | Card (container), Button (trigger) |
| Carousel | `components/ui/carousel.tsx` | Card + Button (controls) |
| Progress | `components/ui/progress.tsx` | Primary token (fill) |
| Calendar | `components/ui/calendar.tsx` | Button (days), Card (container) |
| Avatar | `components/ui/avatar.tsx` | Badge (shape), primary tokens |
| AspectRatio | `components/ui/aspect-ratio.tsx` | Container only (minimal) |
| Collapsible | `components/ui/collapsible.tsx` | Accordion (same pattern) |
| Resizable | `components/ui/resizable.tsx` | Border tokens |
| ScrollArea | `components/ui/scroll-area.tsx` | Border/muted tokens |
| Separator | `components/ui/separator.tsx` | Border token |
| Skeleton | `components/ui/skeleton.tsx` | Muted token |

### Feedback

| Componente | Arquivo | Derivar de |
|---|---|---|
| Toast/Sonner | `components/ui/sonner.tsx` | Alert (feedback pattern) |
| Toggle | `components/ui/toggle.tsx` | Button (interactive) |
| ToggleGroup | `components/ui/toggle-group.tsx` | Toggle (group pattern) |

## Execution Steps

### Step 1: Extrair Padroes dos Componentes Base

Ler os componentes base adaptados e extrair padroes:

```yaml
patterns:
  radius: "rounded-lg"           # from Button, Card
  transition: "transition-all duration-200"  # from Button
  shadow: "shadow-sm"            # from Card
  focus_ring: "focus-visible:ring-2 focus-visible:ring-ring"  # from Input
  border: "border"               # from Card, Input
  disabled: "disabled:opacity-50 disabled:pointer-events-none"  # from Button
```

### Step 2: Aplicar por Grupo

Processar cada grupo na ordem: Forms → Overlays → Navigation → Data Display → Feedback.

Para cada componente:
1. Ler arquivo atual
2. Identificar classes Tailwind que divergem dos padroes
3. Substituir para manter consistencia
4. Nao alterar estrutura/props/accessibility

### Step 3: Documentar Mudancas

Log de mudancas por componente (apenas componentes que foram alterados).

## Validacao

- [ ] Todos os componentes renderizam sem erros
- [ ] Consistencia visual cross-component
- [ ] Tokens semanticos usados em todos

## Output

- Componentes modificados em `components/ui/`
- Log de mudancas consolidado

## Related Checklists

- `squads/design/checklists/component-adaptation-checklist.md`
