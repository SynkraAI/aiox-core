# Tailwind CSS Audit Checklist

Use este checklist durante auditoria de projetos usando Tailwind CSS.

## Versão e Configuração

- [ ] **Versão detectada**
  - [ ] v3.x (JS config: `tailwind.config.ts`)
  - [ ] v4.x (CSS-first: `@import "tailwindcss"` + `@theme`)
  - [ ] Versão documentada em: `package.json`

- [ ] **Arquivo de configuração encontrado**
  - [ ] v3: `tailwind.config.js` ou `tailwind.config.ts`
  - [ ] v4: CSS file com `@theme { ... }`
  - [ ] PostCSS configurado (`postcss.config.js`)

- [ ] **Directives presentes** (v3)
  - [ ] `@tailwind base;`
  - [ ] `@tailwind components;`
  - [ ] `@tailwind utilities;`

---

## Padrões de Uso

### Classes e Conflitos

- [ ] **Sem conflitos de classes**
  ```bash
  # Buscar conflitos comuns
  grep -r "className.*p-[0-9].*p-[0-9]" --include="*.tsx" --include="*.jsx"
  grep -r "className.*m-[0-9].*m-[0-9]" --include="*.tsx" --include="*.jsx"
  ```
  - [ ] Exemplo de conflito: `p-2 px-4 p-4` (múltiplos paddings)
  - [ ] Solução: Usar `cn()` com `twMerge`

- [ ] **Utility `cn()` presente e usada**
  - [ ] Arquivo: `lib/utils.ts` ou similar
  - [ ] Implementação:
    ```typescript
    import { clsx } from 'clsx'
    import { twMerge } from 'tailwind-merge'

    export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs))
    }
    ```
  - [ ] Usado consistentemente em componentes

---

### Arbitrary Values

- [ ] **Uso moderado de arbitrary values** `[...]`
  ```bash
  # Buscar arbitrary values
  grep -r "\[.*\]" --include="*.tsx" --include="*.jsx" | grep className
  ```
  - [ ] Se repetidos (3+ vezes), criar token semântico
  - [ ] Exemplos aceitáveis:
    - `h-[calc(100vh-64px)]` (cálculo específico)
    - `bg-[var(--custom-color)]` (token CSS)
  - [ ] Exemplos a evitar:
    - `text-[#3b82f6]` (usar `text-blue-500` ou token)
    - `w-[200px]` (usar `w-50` ou criar token)

---

### @apply e @layer

- [ ] **`@apply` usado com moderação**
  ```bash
  grep -r "@apply" --include="*.css" -n
  ```
  - [ ] Apenas em componentes do Design System
  - [ ] Apenas para padrões reutilizáveis (3+ ocorrências)
  - [ ] **NÃO** usado apenas para "limpar código"

- [ ] **`@layer` usado corretamente** (se presente)
  ```css
  @layer base {
    /* Resets, base styles */
  }

  @layer components {
    /* Component classes */
  }

  @layer utilities {
    /* Custom utilities */
  }
  ```

---

## Organização e Tooling

- [ ] **Classes ordenadas automaticamente**
  - [ ] `prettier-plugin-tailwindcss` instalado
  - [ ] Configuração em `.prettierrc`:
    ```json
    {
      "plugins": ["prettier-plugin-tailwindcss"]
    }
    ```

- [ ] **Sem duplicação de classes**
  - [ ] Verificar manualmente em componentes chave
  - [ ] Exemplo de problema: `flex flex items-center` (flex repetido)

---

## Tokens Semânticos vs Hardcoded

- [ ] **Preferir tokens semânticos**
  - [ ] ✅ GOOD: `bg-primary`, `text-foreground`
  - [ ] ❌ BAD: `bg-blue-500`, `text-gray-900`

- [ ] **Cores hardcoded documentadas**
  ```bash
  # Buscar cores hardcoded
  grep -r "bg-blue-\|bg-red-\|bg-green-\|bg-gray-" --include="*.tsx"
  grep -r "text-blue-\|text-red-\|text-green-\|text-gray-" --include="*.tsx"
  ```
  - [ ] Se encontrado, justificar ou migrar para tokens

---

## Tailwind v4 Específico

### CSS-first Config

- [ ] **Configuração em CSS** (não JS)
  ```css
  @import "tailwindcss";

  @theme {
    --color-primary: oklch(0.55 0.22 250);
    --spacing-unit: 0.25rem;
  }
  ```

### Renomes e Mudanças

- [ ] **Renomes críticos aplicados**
  - [ ] `outline-none` → `outline-hidden`
  - [ ] Ring utilities ajustados (se necessário)
  - [ ] Sufixos `-sm` em utilities (se necessário)

### Features Modernas

- [ ] **Container Queries** (se aplicável)
  ```html
  <div class="@container">
    <div class="@lg:grid-cols-2">...</div>
  </div>
  ```

- [ ] **OKLCH Colors** (se aplicável)
  ```css
  @theme {
    --color-primary: oklch(0.55 0.22 250);
  }
  ```

- [ ] **3D Transforms** (se aplicável)
  ```html
  <div class="rotate-x-45 rotate-y-30">...</div>
  ```

- [ ] **@starting-style** (se aplicável)
  ```css
  @starting-style {
    .fade-in {
      opacity: 0;
    }
  }
  ```

---

## Responsividade

- [ ] **Mobile-first approach**
  - [ ] Base styles para mobile (sem breakpoint)
  - [ ] Breakpoints para telas maiores: `md:`, `lg:`, `xl:`
  - [ ] Exemplo:
    ```html
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    ```

- [ ] **Breakpoints customizados** (se necessário)
  ```typescript
  // tailwind.config.ts (v3)
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      // ...
    }
  }
  ```

---

## Estados e Variantes

- [ ] **Estados interativos cobertos**
  - [ ] `hover:` (desktop)
  - [ ] `active:` (click/tap)
  - [ ] `focus:` ou `focus-visible:` (keyboard)
  - [ ] `disabled:` (quando aplicável)

- [ ] **Reduced motion** (acessibilidade)
  ```html
  <div class="transition-transform motion-reduce:transition-none">
  ```

- [ ] **Dark mode** (se aplicável)
  - [ ] `dark:` variants usadas
  - [ ] Tokens semânticos funcionam em ambos os modos

---

## Performance

- [ ] **PurgeCSS/Tree-shaking configurado**
  - [ ] Tailwind automaticamente remove classes não usadas em produção
  - [ ] Verificar build output (`npm run build`)

- [ ] **Tamanho do CSS aceitável**
  - [ ] Development: ~3-5MB (completo, esperado)
  - [ ] Production: <50KB gzipped (ideal)
  - [ ] Production: <100KB gzipped (aceitável)

---

## Documentação

- [ ] **Convenções documentadas**
  - [ ] README ou docs explicam uso de Tailwind
  - [ ] Padrões de componentes documentados
  - [ ] Tokens customizados explicados

---

## Problemas Comuns

### ❌ Conflitos de Classes
```html
<!-- BAD -->
<div className="p-2 px-4 p-4">...</div>
<!-- Resultado: p-4 vence, mas comportamento não é óbvio -->

<!-- GOOD -->
<div className={cn("p-4")}>...</div>
```

### ❌ Hardcoded Values
```html
<!-- BAD -->
<button className="bg-[#3b82f6] text-white">Click</button>

<!-- GOOD (token semântico) -->
<button className="bg-primary text-primary-foreground">Click</button>

<!-- GOOD (Tailwind color se apropriado) -->
<button className="bg-blue-500 text-white">Click</button>
```

### ❌ Overuse de @apply
```css
/* BAD - usado apenas para "limpar" */
.btn {
  @apply px-4 py-2 rounded bg-blue-500 text-white;
}

/* GOOD - usado para padrão reutilizável em DS */
.btn-base {
  @apply inline-flex items-center justify-center;
  @apply focus-visible:outline-hidden focus-visible:ring-2;
  @apply transition-colors;
}
```

---

## Score Final

**Tailwind CSS Health Score:**

- [ ] 🟢 Excelente (90-100%) - Seguindo todas as best practices
- [ ] 🟡 Bom (70-89%) - Algumas melhorias necessárias
- [ ] 🟠 Aceitável (50-69%) - Várias melhorias recomendadas
- [ ] 🔴 Crítico (<50%) - Refatoração necessária

---

_Checklist gerado por: AIOS Skill `/tokenizacao`_
