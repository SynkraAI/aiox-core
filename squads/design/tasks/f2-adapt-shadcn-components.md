# f2-adapt-shadcn-components

> **Phase 2, Step 6** — Adaptar componentes shadcn para o visual do Figma.

## Metadata

```yaml
task:
  id: f2-adapt-shadcn-components
  phase: 2
  step: 6
  agent: ds-foundations-lead
  depends_on: f2-ingest-base-components
  blocking: false
  next: f2-qa-base-components
```

## Objetivo

Modificar as classes Tailwind dos componentes shadcn/UI base para corresponder ao visual do Figma, preservando logica, props API e acessibilidade.

## Regras de Adaptacao

### PRESERVAR (nunca alterar)

- Estrutura JSX e composicao de componentes
- Todas as props existentes (type, variant, size, etc.)
- Radix UI primitives e event handlers
- `data-slot` attributes
- ARIA attributes e roles
- Keyboard navigation (onKeyDown handlers)
- `focus-visible` styles (pode mudar cor, nao remover)
- `disabled` behavior logic
- Exports e imports

### MODIFICAR (classes Tailwind apenas)

- Cores: `bg-primary` → confirmar que token corresponde ao Figma
- Border radius: `rounded-md` → `rounded-lg` (ou valor do Figma)
- Padding/spacing: `px-4 py-2` → valores do Figma
- Hover states: `hover:bg-primary/90` → transicao do Figma
- Focus ring: `focus-visible:ring-2` → estilo do Figma
- Transitions: `transition-colors` → `transition-all duration-200`
- Shadows: adicionar se Figma especificar
- Typography: `text-sm font-medium` → valores do Figma

### NUNCA FAZER

- Adicionar props novas obrigatorias
- Remover props existentes
- Mudar a estrutura de arquivos
- Hardcodar valores de cor (hex, rgb direto)
- Remover `focus-visible` styles
- Alterar logica de variantes (cva/class-variance-authority patterns)

## Ordem de Adaptacao

Adaptar na seguinte ordem (simples → composto):

1. **Button** (`components/ui/button.tsx`)
   - Padrao visual mais critico
   - Define patterns para todos os outros componentes

2. **Input** (`components/ui/input.tsx`)
   - Padrao de formularios
   - Border, focus ring, placeholder styles

3. **Badge** (`components/ui/badge.tsx`)
   - Componente simples
   - Valida que tokens semanticos funcionam

4. **Card** (`components/ui/card.tsx`)
   - Container pattern
   - Background, border, shadow, padding

5. **Alert** (`components/ui/alert.tsx`)
   - Feedback pattern
   - Usa destructive + possiveis extensoes (warning, info)

6. **Dialog** (`components/ui/dialog.tsx`)
   - Overlay pattern
   - Backdrop, container, animation

## Execution Steps (por componente)

### Step 1: Ler Componente Atual

```
Read("components/ui/{component}.tsx")
```

Entender a estrutura atual: variantes, slots, classes Tailwind.

### Step 2: Comparar com Spec do Figma

Comparar classes Tailwind atuais com spec visual da Step 5.

### Step 3: Gerar Diff de Classes

Documentar mudancas planejadas:

```
Button variant="default":
  ANTES: bg-primary text-primary-foreground shadow-xs hover:bg-primary/90
  DEPOIS: bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all duration-200

Button variant="outline":
  ANTES: border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground
  DEPOIS: border-2 bg-background shadow-none hover:bg-accent hover:text-accent-foreground
```

### Step 4: Aplicar Mudancas

Editar arquivo com mudancas minimas — alterar apenas classes Tailwind.

### Step 5: Documentar Changelog

Para cada componente adaptado:

```markdown
## Button — Changelog

### Visual Changes
- Increased border-radius from rounded-md to rounded-lg
- Added transition-all duration-200 for smoother hover
- Changed shadow-xs to shadow-sm for more depth
- outline variant: border → border-2

### Preserved
- All 6 variants (default, destructive, outline, secondary, ghost, link)
- All 4 sizes (default, sm, lg, icon)
- Radix Slot composition
- data-slot="button"
- Focus-visible ring
- Disabled state behavior
```

## Validacao por Componente

- [ ] Componente importa e renderiza sem erros
- [ ] Props API inalterada (TypeScript nao reclama)
- [ ] Hover state corresponde ao Figma
- [ ] Focus state tem ring visivel
- [ ] Disabled state funciona
- [ ] Dark mode correto
- [ ] Tokens semanticos usados (sem cores hardcoded)

## Output

- Componentes modificados em `components/ui/`
- Changelog por componente em `squads/design/data/`

## Related Checklists

- `squads/design/checklists/component-adaptation-checklist.md`
