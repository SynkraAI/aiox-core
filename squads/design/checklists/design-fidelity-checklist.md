# Design Fidelity Checklist

> Use este checklist para validar que componentes seguem o design spec.
> Referencia: `squads/super-agentes/data/design-tokens-spec.yaml`

---

## Pre-Validacao

### Carregar Spec
- [ ] Ler `design-tokens-spec.yaml` completo
- [ ] Identificar tokens relevantes para o componente
- [ ] Anotar valores esperados

### Identificar Componente
- [ ] Tipo de componente: _____________ (button, input, card, modal, etc.)
- [ ] Variantes: _____________ (primary, secondary, outline, etc.)
- [ ] Estados: _____________ (default, hover, focus, disabled, etc.)

---

## Validacao de Cores

### Cores Primarias
- [ ] Cor primaria usa `studio-primary` ou `var(--primary-color)`
- [ ] Hover usa `studio-primary-dark` ou `var(--primary-dark)`
- [ ] NUNCA hardcoded `#D4AF37` ou `#B8962E`

### Cores de Background
- [ ] Background principal usa `studio-bg` ou `bg-background`
- [ ] Cards usam `studio-card-bg` ou `bg-card`
- [ ] Surfaces usam `bg-surface` ou `bg-[#1a1a1f]` com comentario
- [ ] NUNCA hardcoded `#0A0A0F` ou `#111116` sem justificativa

### Cores de Texto
- [ ] Texto primario usa `text-foreground` ou `text-white`
- [ ] Texto secundario usa `text-muted-foreground` ou `text-studio-text-secondary`
- [ ] Texto muted usa `text-muted` ou `text-studio-text-muted`

### Cores Semanticas
- [ ] Success usa `text-green-500` ou `status-success`
- [ ] Warning usa `text-yellow-500` ou `status-warning`
- [ ] Error usa `text-red-500` ou `status-error`
- [ ] Info usa `text-blue-500` ou `status-info`

### Validacao Automatica
```bash
# Executar e verificar 0 resultados
grep -rn "#D4AF37\|#B8962E\|#0A0A0F\|#111116" {componente}/
```
- [ ] Comando executado, 0 resultados

---

## Validacao de Tipografia

### Font Family
- [ ] UI text usa `font-sans` (Inter)
- [ ] Headings usam `font-display` (Rajdhani) se aplicavel
- [ ] Code usa `font-mono` (JetBrains Mono)

### Font Size
| Uso | Token | Tailwind | Check |
|-----|-------|----------|-------|
| Caption | xs | text-xs | [ ] |
| Button/Secondary | sm | text-sm | [ ] |
| Body | base | text-base | [ ] |
| Lead | lg | text-lg | [ ] |
| Heading | xl-5xl | text-xl a text-5xl | [ ] |

### Font Weight
- [ ] Body text: `font-normal` (400)
- [ ] Buttons: `font-medium` (500)
- [ ] Headings: `font-semibold` (600)
- [ ] Emphasis: `font-bold` (700)

### Line Height
- [ ] Texto curto: `leading-tight` ou `leading-5`
- [ ] Body text: `leading-normal` ou `leading-6`
- [ ] Headings grandes: `leading-none` ou `leading-tight`

---

## Validacao de Espacamento

### Padding
| Contexto | Token | Tailwind | Check |
|----------|-------|----------|-------|
| Tight | 1-2 | p-1, p-2 | [ ] |
| Small | 3 | p-3 | [ ] |
| Standard | 4 | p-4 | [ ] |
| Medium | 5-6 | p-5, p-6 | [ ] |
| Large | 8+ | p-8+ | [ ] |

### Gap/Spacing
- [ ] Itens em lista: `gap-2` ou `gap-3`
- [ ] Secoes: `gap-4` ou `gap-6`
- [ ] Grupos: `gap-6` ou `gap-8`
- [ ] Secoes maiores: `gap-8` ou `gap-12`

### Validacao Automatica
```bash
# Verificar hardcoded pixel values
grep -rn "p-\[.*px\]\|m-\[.*px\]\|gap-\[.*px\]" {componente}/
```
- [ ] Comando executado, 0 resultados (ou justificados)

---

## Validacao de Bordas e Radius

### Border Width
- [ ] Default: `border` (1px)
- [ ] Emphasis: `border-2` (2px)
- [ ] NUNCA `border-[3px]` ou valores arbitrarios

### Border Radius
| Componente | Token | Tailwind | Check |
|------------|-------|----------|-------|
| Badge | sm | rounded-sm | [ ] |
| Button | md | rounded-md | [ ] |
| Input | md | rounded-md | [ ] |
| Card | lg-xl | rounded-lg ou rounded-xl | [ ] |
| Modal | 2xl | rounded-2xl | [ ] |
| Avatar/Pill | full | rounded-full | [ ] |

### Border Color
- [ ] Default: `border-border` ou `border-white/10`
- [ ] Primary: `border-studio-primary/50` ou `border-[var(--primary-color)]/50`
- [ ] Subtle: `border-white/5`

---

## Validacao de Sombras

- [ ] Sem sombra: `shadow-none`
- [ ] Sutil: `shadow-sm`
- [ ] Card/Dropdown: `shadow-md`
- [ ] Modal: `shadow-lg` ou `shadow-xl`
- [ ] Glow primario: custom com `rgba(212, 175, 55, 0.3)`

---

## Validacao de Motion

### Duracao
- [ ] Micro-interactions: `duration-100` (fast)
- [ ] Standard: `duration-200` (normal)
- [ ] Page transitions: `duration-300` (slow)

### Easing
- [ ] Enter: `ease-out`
- [ ] Exit: `ease-in`
- [ ] Standard: `ease-in-out`

### Transicoes
- [ ] Hover states: `transition-colors duration-200`
- [ ] Transform: `transition-transform duration-200`
- [ ] All: `transition-all duration-200`

---

## Validacao de Contraste (WCAG AA)

### Texto Normal (< 18px)
Minimo: **4.5:1**

| Combinacao | Ratio | Status |
|------------|-------|--------|
| text-white on bg-base | ~15:1 | [ ] OK |
| text-secondary on bg-base | ~7:1 | [ ] OK |
| text-muted on bg-base | ~4.5:1 | [ ] Check |
| text-muted on bg-elevated | ~3.8:1 | [ ] WARN |

### Texto Grande (>= 18px ou 14px bold)
Minimo: **3.0:1**

### UI Components
Minimo: **3.0:1**

### Ferramenta de Verificacao
```bash
# Usar WebAIM Contrast Checker ou similar
# https://webaim.org/resources/contrastchecker/
```

---

## Validacao de Componentes Especificos

### Button
- [ ] Padding: `py-2 px-4` (sm), `py-2.5 px-5` (md), `py-3 px-6` (lg)
- [ ] Border radius: `rounded-md`
- [ ] Font: `text-sm font-medium`
- [ ] Min height: 32px (sm), 40px (md), 48px (lg)
- [ ] Primary: `bg-studio-primary text-studio-bg hover:bg-studio-primary-dark`
- [ ] Focus ring: `focus:ring-2 focus:ring-studio-primary/50`

### Input
- [ ] Height: 32px (sm), 40px (md), 48px (lg)
- [ ] Padding: `py-2 px-3`
- [ ] Border: `border border-white/10`
- [ ] Background: `bg-surface` ou `bg-[#1a1a1f]`
- [ ] Focus: `focus:ring-2 focus:ring-studio-primary/50`

### Card
- [ ] Padding: `p-4` (sm), `p-6` (md), `p-8` (lg)
- [ ] Border radius: `rounded-xl`
- [ ] Background: `bg-card` ou `bg-studio-card-bg`
- [ ] Border: `border border-white/10`

### Modal
- [ ] Max width: 384px (sm), 448px (md), 512px (lg)
- [ ] Padding: `p-6`
- [ ] Border radius: `rounded-2xl`
- [ ] Background: `bg-card`
- [ ] Overlay: `bg-black/80`

---

## Metricas de Sucesso

| Metrica | Criterio | Check |
|---------|----------|-------|
| Hardcoded colors | 0 | [ ] |
| Hardcoded spacing | 0 (ou justificado) | [ ] |
| Contrast violations | 0 | [ ] |
| Wrong token usage | 0 | [ ] |
| Visual match to spec | 100% | [ ] |

---

## Comandos de Validacao Rapida

```bash
# 1. Cores hardcoded
grep -rn "#[0-9A-Fa-f]\{6\}" {componente}/ | grep -v "node_modules\|\.yaml\|\.json"

# 2. Spacing hardcoded
grep -rn "\[.*px\]" {componente}/ | grep -E "p-|m-|gap-|w-|h-"

# 3. Font sizes hardcoded
grep -rn "text-\[" {componente}/

# 4. Imports corretos
grep -rn "from '@/components/ui" {componente}/
```

---

*Checklist v1.0 - Baseado em design-tokens-spec.yaml v1.0.0*

---

## Scoring

### Point System
Each checkbox item = 1 point.

| Category | Items | Weight |
|----------|-------|--------|
| Pre-Validacao | 6 | 6pts |
| Validacao de Cores | 15 | 15pts |
| Validacao de Tipografia | 15 | 15pts |
| Validacao de Espacamento | 10 | 10pts |
| Validacao de Bordas e Radius | 12 | 12pts |
| Validacao de Sombras | 5 | 5pts |
| Validacao de Motion | 9 | 9pts |
| Validacao de Contraste | 4 | 4pts |
| Validacao de Componentes Especificos | 20 | 20pts |
| Metricas de Sucesso | 5 | 5pts |
| **Total** | **101** | **101pts** |

### Pass/Fail Thresholds
| Grade | Score | Action |
|-------|-------|--------|
| PASS | >= 80% (81+) | Proceed to next phase |
| CONDITIONAL | 60-79% (61-80) | Fix critical items, re-check |
| FAIL | < 60% (60-) | Major rework required |

### Auto-Correction
If items fail:
- Run `*ds-extract-tokens` to identify hardcoded values. Use `*contrast-matrix` for color issues.
