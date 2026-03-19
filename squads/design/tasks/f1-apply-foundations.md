# f1-apply-foundations

> **Phase 1, Step 3** — Aplicar tokens mapeados no globals.css e @theme inline.

## Metadata

```yaml
task:
  id: f1-apply-foundations
  phase: 1
  step: 3
  agent: ds-foundations-lead
  depends_on: f1-map-tokens-to-shadcn
  blocking: false
  next: f1-qa-foundations
```

## Objetivo

Editar `app/app/globals.css` para substituir os tokens default do shadcn pelos tokens mapeados do Figma, mantendo a estrutura do arquivo intacta.

## Target File

`app/app/globals.css`

## Estrutura Atual do globals.css

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* Tailwind bridge: --color-{name}: var(--{name}) */
  /* Radius scale: --radius-{size}: calc(var(--radius) ± offset) */
}

:root {
  /* Light mode tokens in OKLch */
}

.dark {
  /* Dark mode tokens in OKLch */
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

## Execution Steps

### Step 1: Substituir Valores em `:root`

Para cada token mapeado, substituir o valor OKLch:

```css
:root {
  --radius: 0.625rem;          /* Usar valor do Figma se fornecido */
  --background: oklch(...);     /* Novo valor do Figma */
  --foreground: oklch(...);     /* Novo valor do Figma */
  /* ... todos os 18 core tokens ... */
  /* ... 5 chart tokens ... */
  /* ... 8 sidebar tokens ... */
}
```

### Step 2: Substituir Valores em `.dark`

Para cada token mapeado com valor dark:

```css
.dark {
  --background: oklch(...);     /* Novo valor dark do Figma */
  --foreground: oklch(...);     /* Novo valor dark do Figma */
  /* ... todos os tokens com valores dark ... */
}
```

### Step 3: Adicionar Extensoes no @theme inline

Se o Figma define tokens extras (warning, info, success, etc.):

```css
@theme inline {
  /* Existing bridges */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... existentes ... */

  /* Extensions from Figma DS */
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
}
```

E adicionar os valores em `:root` e `.dark`:

```css
:root {
  /* ... core tokens ... */
  --warning: oklch(...);
  --warning-foreground: oklch(...);
  --info: oklch(...);
  --info-foreground: oklch(...);
  --success: oklch(...);
  --success-foreground: oklch(...);
}
```

### Step 4: Preservar Estrutura

**NAO alterar:**
- Imports (`@import`)
- `@custom-variant dark`
- `@layer base` block
- Ordem das sections

**Manter se Figma nao fornecer:**
- Chart tokens (--chart-1 through --chart-5) — usar defaults
- Sidebar tokens — derivar de core tokens se nao fornecido:
  - `--sidebar: var(--background)` pattern

### Step 5: Validar Sintaxe

Verificar que o CSS resultante e valido:
- Todos os valores OKLch tem formato correto: `oklch(L C H)` ou `oklch(L C H / alpha)`
- Todas as variaveis referenciadas existem
- Nenhuma variavel duplicada
- Nenhuma variavel do shadcn original foi removida sem substituto

## Regras Criticas

1. **NUNCA remover uma variavel** que os 56 componentes shadcn possam referenciar
2. **SEMPRE usar OKLch** para valores de cor
3. **MANTER a ordem** das sections no arquivo
4. **NAO adicionar** CSS custom (classes, resets, etc.) — apenas variaveis
5. **Extensoes** devem ter bridge em `@theme inline` para funcionar com Tailwind

## Output

- `app/app/globals.css` modificado com novos tokens
- Log de mudancas: quais tokens foram substituidos, quais adicionados, quais mantidos

## Related Checklists

- `squads/design/checklists/token-mapping-checklist.md`
