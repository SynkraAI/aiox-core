# f2-ingest-base-components

> **Phase 2, Step 5** — Receber especificacoes visuais de componentes base do Figma.

## Metadata

```yaml
task:
  id: f2-ingest-base-components
  phase: 2
  step: 5
  agent: ds-foundations-lead
  depends_on: f1-qa-foundations (PASS)
  blocking: false
  next: f2-adapt-shadcn-components
```

## Objetivo

Receber do usuario as especificacoes visuais dos componentes base do Figma (via Dev Mode CSS, screenshots, ou ambos) e extrair propriedades visuais por componente.

## Componentes Base (ordem de prioridade)

1. **Button** — Componente mais usado, define padrao visual
2. **Input** — Define padrao de formularios
3. **Badge** — Componente simples, valida tokens
4. **Card** — Container fundamental
5. **Alert** — Feedback component
6. **Dialog** — Overlay fundamental

## Formatos de Input

### CSS do Dev Mode (recomendado)

```css
/* Button — Default variant */
background: #3B82F6;
color: #FFFFFF;
border-radius: 8px;
padding: 8px 16px;
font-size: 14px;
font-weight: 500;

/* Button — Hover */
background: #2563EB;

/* Button — Disabled */
opacity: 0.5;
```

### Screenshots/Prints

- Imagem do componente em cada estado (default, hover, focus, active, disabled)
- **REQUER validacao humana** dos valores extraidos

### Ambos (recomendado)

CSS do Dev Mode + screenshot para validacao visual cruzada.

## Execution Steps

### Step 1: Solicitar Input por Componente

Para cada componente base, perguntar:

```
Componente: Button

Cole o CSS do Dev Mode do Figma para cada variante/estado:
- Default
- Hover
- Focus
- Active
- Disabled

(Opcional: cole tambem screenshot para validacao cruzada)
```

### Step 2: Extrair Propriedades

Para cada componente, extrair:

| Propriedade | Valores por Estado |
|---|---|
| `background` | default, hover, focus, active, disabled |
| `color` (text) | default, hover, focus, active, disabled |
| `border` | color, width, style |
| `border-radius` | valor |
| `padding` | top, right, bottom, left |
| `font-size` | valor |
| `font-weight` | valor |
| `line-height` | valor |
| `box-shadow` | default, focus |
| `opacity` | disabled |
| `transition` | propriedade, duracao, easing |

### Step 3: Mapear para Tokens Semanticos

Relacionar valores visuais com tokens da Phase 1:

```
Button background → --primary (ja mapeado)
Button text color → --primary-foreground (ja mapeado)
Button radius → --radius (ou valor especifico)
Button hover → variacao de --primary
```

### Step 4: Documentar Spec

Para cada componente, gerar spec:

```yaml
component: Button
variants:
  default:
    background: "var(--primary)"
    color: "var(--primary-foreground)"
    border-radius: "var(--radius)"
    padding: "8px 16px"
  hover:
    background: "oklch(0.55 0.214 259.815)"  # slightly darker primary
  focus:
    ring: "var(--ring)"
    ring-offset: "2px"
  disabled:
    opacity: "0.5"
    pointer-events: "none"
sizes:
  sm: { padding: "4px 12px", font-size: "12px" }
  md: { padding: "8px 16px", font-size: "14px" }
  lg: { padding: "12px 24px", font-size: "16px" }
```

## Validacao

- [ ] Pelo menos Button e Input especificados
- [ ] Todos os estados basicos cobertos (default, hover, disabled)
- [ ] Valores podem ser mapeados para tokens existentes
- [ ] Screenshots confirmam CSS do Dev Mode (se ambos fornecidos)

## Output

- Spec visual por componente (em memoria ou JSON)
- Lista de componentes prontos para adaptacao

## Related Checklists

- `squads/design/checklists/component-adaptation-checklist.md`
