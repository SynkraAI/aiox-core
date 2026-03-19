# f3-derive-components — Changelog

> Phase 3, Step 8 — Componentes derivados dos padroes base.

---

## Padroes Aplicados

| Padrao | Valor | Fonte |
|---|---|---|
| Overlay container | `rounded-xl border border-border shadow-none dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]` | Dialog, Popover, DropdownMenu |
| Menu item radius | `rounded-lg` | DropdownMenu |
| Focus ring | `ring-2 ring-foreground ring-offset-2 ring-offset-background` | Button, Input |
| Disabled (controls) | `opacity-20 pointer-events-none` | Button, Checkbox, Radio, Switch |
| Disabled (inputs) | `opacity-50 pointer-events-none cursor-not-allowed` | Input, Textarea |
| Shadow | `shadow-none` on containers | Card, Input |
| Typography | `font-body` on body text | Input, Badge |
| Transition | `transition-all` | Button |
| Overlay bg | `bg-card text-card-foreground` | Dialog |

---

## Mudancas por Componente

### Forms

| Componente | Mudancas | Arquivo |
|---|---|---|
| Slider | thumb: `bg-white` → `bg-background`, `shadow-sm` → `shadow-none`, `ring-ring/50` → `ring-foreground/50`, disabled `opacity-50` → `opacity-20`; root: disabled `opacity-50` → `opacity-20` | `slider.tsx` |
| Label | Adicionado `font-body` | `label.tsx` |
| Form | Nenhuma mudanca (layout only, tokens corretos) | `form.tsx` |

### Overlays

| Componente | Mudancas | Arquivo |
|---|---|---|
| Drawer | content: `bg-background` → `bg-card text-card-foreground`, `rounded-t-lg` → `rounded-t-xl`, `rounded-b-lg` → `rounded-b-xl`, adicionado `border-border shadow-none dark:shadow-[...]` | `drawer.tsx` |
| Sheet | content: `bg-background` → `bg-card text-card-foreground`, `shadow-lg` → `shadow-none dark:shadow-[...]`; close: `rounded-xs` → `rounded-full`, focus ring unificado | `sheet.tsx` |
| HoverCard | content: `rounded-md` → `rounded-xl`, `border` → `border border-border`, `shadow-md` → `shadow-none dark:shadow-[...]` | `hover-card.tsx` |
| ContextMenu | content+subcontent: `rounded-md` → `rounded-xl`, `border` → `border border-border`, shadow pattern; items+subtrigger: `rounded-sm` → `rounded-lg` | `context-menu.tsx` |
| Menubar | root: `rounded-md` → `rounded-lg`, `shadow-xs` → `shadow-none`, `border` → `border border-border`; content+subcontent: `rounded-md` → `rounded-xl`, shadow pattern; items: `rounded-sm`/`rounded-xs` → `rounded-lg` | `menubar.tsx` |
| Command | container: `rounded-md` → `rounded-xl`; items: `rounded-sm` → `rounded-lg` | `command.tsx` |
| AlertDialog | content: `bg-background` → `bg-card text-card-foreground`, `rounded-lg` → `rounded-xl`, `border` → `border border-border`, `shadow-lg` → shadow pattern; media: `rounded-md` → `rounded-lg` | `alert-dialog.tsx` |

### Navigation

| Componente | Mudancas | Arquivo |
|---|---|---|
| Tabs | trigger: `rounded-md` → `rounded-lg`, adicionado `font-body` | `tabs.tsx` |
| Breadcrumb | Nenhuma mudanca (tokens corretos) | `breadcrumb.tsx` |
| NavigationMenu | trigger style: `rounded-md` → `rounded-lg`, adicionado `font-body`, `transition-[color,box-shadow]` → `transition-all`; viewport: `rounded-md` → `rounded-xl`, shadow pattern; link: `rounded-sm` → `rounded-lg`; no-viewport content: `rounded-md` → `rounded-xl` | `navigation-menu.tsx` |
| Pagination | Nenhuma mudanca (herda buttonVariants) | `pagination.tsx` |
| Sidebar | floating inner: `rounded-lg` → `rounded-xl`, `shadow-sm` → shadow pattern | `sidebar.tsx` |

### Data Display

| Componente | Mudancas | Arquivo |
|---|---|---|
| Table | head: adicionado `font-body` | `table.tsx` |
| Accordion | trigger: focus ring unificado, `rounded-md` → `rounded-lg`, adicionado `font-body` | `accordion.tsx` |
| Carousel | Nenhuma mudanca (herda Button) | `carousel.tsx` |
| Progress | Nenhuma mudanca (tokens corretos) | `progress.tsx` |
| Calendar | dropdown: `border-input` → `border-border`, `shadow-xs` → `shadow-none`, `rounded-md` → `rounded-lg` | `calendar.tsx` |
| Avatar | Nenhuma mudanca (tokens corretos) | `avatar.tsx` |
| AspectRatio | Nenhuma mudanca (wrapper only) | `aspect-ratio.tsx` |
| Collapsible | Nenhuma mudanca (thin wrapper) | `collapsible.tsx` |
| Resizable | handle grip: `rounded-xs` → `rounded-sm` | `resizable.tsx` |
| ScrollArea | Nenhuma mudanca (tokens corretos) | `scroll-area.tsx` |
| Separator | Nenhuma mudanca (usa `bg-border`) | `separator.tsx` |
| Skeleton | `rounded-md` → `rounded-lg` | `skeleton.tsx` |

### Feedback

| Componente | Mudancas | Arquivo |
|---|---|---|
| Toggle | `rounded-md` → `rounded-lg`, disabled `opacity-50` → `opacity-20`, focus ring unificado, `shadow-xs` → `shadow-none`, `transition-[color,box-shadow]` → `transition-all`; outline variant: `border-input` → `border-border` | `toggle.tsx` |
| ToggleGroup | Nenhuma mudanca (herda toggleVariants) | `toggle-group.tsx` |

### Extras

| Componente | Mudancas | Arquivo |
|---|---|---|
| InputOTP | slot: `border-input` → `border-border`, `shadow-xs` → `shadow-none`, `rounded-l-md`/`rounded-r-md` → `rounded-l-lg`/`rounded-r-lg`, active ring `ring-ring` → `ring-foreground` | `input-otp.tsx` |

---

## Resumo

| Metrica | Valor |
|---|---|
| **Componentes analisados** | 38 (excl. 15 base + 3 extras sem classes) |
| **Componentes modificados** | 19 |
| **Componentes inalterados** | 19 (tokens ja corretos ou herdam patterns) |
| **Breaking changes** | 0 |
| **Props removidas** | 0 |
| **TypeScript errors** | 0 |
| **Build status** | PASS |

*Aplicado em: 2026-02-21*
*Aplicado por: Foundations Pipeline — f3-derive-components*
