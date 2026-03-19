# Token Mapping Checklist

> Checklist para validacao do mapeamento de tokens Figma → shadcn CSS vars.
> Usado no QA gate da Phase 1 (`f1-qa-foundations`).

## Token Completude

- [x] `--background` definido em `:root` e `.dark`
- [x] `--foreground` definido em `:root` e `.dark`
- [x] `--card` definido em `:root` e `.dark`
- [x] `--card-foreground` definido em `:root` e `.dark`
- [x] `--popover` definido em `:root` e `.dark`
- [x] `--popover-foreground` definido em `:root` e `.dark`
- [x] `--primary` definido em `:root` e `.dark`
- [x] `--primary-foreground` definido em `:root` e `.dark`
- [x] `--secondary` definido em `:root` e `.dark`
- [x] `--secondary-foreground` definido em `:root` e `.dark`
- [x] `--muted` definido em `:root` e `.dark`
- [x] `--muted-foreground` definido em `:root` e `.dark`
- [x] `--accent` definido em `:root` e `.dark`
- [x] `--accent-foreground` definido em `:root` e `.dark`
- [x] `--destructive` definido em `:root` e `.dark`
- [x] `--border` definido em `:root` e `.dark`
- [x] `--input` definido em `:root` e `.dark`
- [x] `--ring` definido em `:root` e `.dark`
- [x] `--radius` definido em `:root`

## Chart Tokens

- [x] `--chart-1` through `--chart-5` definidos em `:root` e `.dark`

## Sidebar Tokens

- [x] `--sidebar` definido em `:root` e `.dark`
- [x] `--sidebar-foreground` definido em `:root` e `.dark`
- [x] `--sidebar-primary` definido em `:root` e `.dark`
- [x] `--sidebar-primary-foreground` definido em `:root` e `.dark`
- [x] `--sidebar-accent` definido em `:root` e `.dark`
- [x] `--sidebar-accent-foreground` definido em `:root` e `.dark`
- [x] `--sidebar-border` definido em `:root` e `.dark`
- [x] `--sidebar-ring` definido em `:root` e `.dark`

## @theme inline Bridge

- [x] `--color-background: var(--background)` presente
- [x] `--color-foreground: var(--foreground)` presente
- [x] Todos os core tokens tem bridge `--color-{name}: var(--{name})`
- [x] Sidebar tokens tem bridge
- [x] Chart tokens tem bridge
- [x] Extensoes (warning, info, success) tem bridge
- [x] Radius scale mantido (`--radius-sm` through `--radius-4xl`)
- [x] Font vars mantidas (`--font-sans`, `--font-mono`, `--font-heading`, `--font-body`)

## Formato de Valores

- [x] Todos os valores de cor em OKLch
- [x] Formato correto: `oklch(L C H)` ou `oklch(L C H / alpha)`
- [x] L entre 0 e 1
- [x] C >= 0
- [x] H entre 0 e 360 (se C > 0)
- [x] Nenhum valor em hex, rgb, ou hsl

## Contraste WCAG AA

### Light Mode

- [x] foreground/background: 19.03:1 >= 4.5:1
- [x] primary-foreground/primary: 19.03:1 >= 4.5:1
- [x] secondary-foreground/secondary: 17.00:1 >= 4.5:1
- [x] muted-foreground/muted: 5.79:1 >= 3:1
- [x] accent-foreground/accent: 17.00:1 >= 4.5:1
- [x] card-foreground/card: 19.03:1 >= 4.5:1
- [x] popover-foreground/popover: 19.03:1 >= 4.5:1
- [x] destructive/background: 3.53:1 >= 3:1

### Dark Mode

- [x] foreground/background: 17.00:1 >= 4.5:1
- [x] primary-foreground/primary: 19.03:1 >= 4.5:1
- [x] secondary-foreground/secondary: 11.79:1 >= 4.5:1
- [x] muted-foreground/muted: 5.29:1 >= 3:1
- [x] accent-foreground/accent: 11.79:1 >= 4.5:1
- [x] card-foreground/card: 14.55:1 >= 4.5:1
- [x] popover-foreground/popover: 14.55:1 >= 4.5:1
- [x] destructive/background: 5.39:1 >= 3:1

## Estrutura do Arquivo

- [x] Imports inalterados (`@import "tailwindcss"`, `@import "tw-animate-css"`, `@import "shadcn/tailwind.css"`)
- [x] `@custom-variant dark` inalterado
- [x] `@layer base` inalterado
- [x] CSS valido (sem erros de sintaxe)
- [x] `next build` compila sem erros

## Componentes

- [x] Build passa — nenhum componente referencia variavel inexistente
- [x] Nenhum token shadcn original removido sem substituto

---

**Resultado: 138 PASS | 0 FAIL | 0 WARN**
**Contraste: 16/16 PASS (WCAG AA)**
**Verdict: PASS**

*Validado em: 2026-02-21*
*Validado por: Foundations Pipeline — f1-qa-foundations*
