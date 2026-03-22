# Design Tokens Audit Checklist (W3C DTCG)

Use este checklist para auditar implementação de Design Tokens em projetos frontend.

## Hierarquia de Tokens (3 Camadas)

### Layer 1: Primitives (Raw Values)

- [ ] **Primitives definidos**
  - [ ] Colors: `blue-50`, `blue-500`, `blue-900`, etc
  - [ ] Spacing: `spacing-1` (0.25rem), `spacing-4` (1rem), etc
  - [ ] Typography: `font-size-sm`, `font-weight-bold`, etc
  - [ ] Outros: shadows, borders, radii

- [ ] **Localização**
  - [ ] Tailwind v3: `tailwind.config.ts` em `theme.extend`
  - [ ] Tailwind v4: `@theme { --color-blue-500: ... }`
  - [ ] Arquivo separado: `tokens/primitives.css` ou `tokens.json`

**Exemplo (Tailwind v4):**
```css
/* tokens/primitives.css */
@theme {
  /* Colors */
  --color-blue-50: oklch(0.97 0.01 250);
  --color-blue-500: oklch(0.55 0.22 250);
  --color-blue-900: oklch(0.25 0.15 250);

  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-4: 1rem;
  --spacing-8: 2rem;

  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-weight-normal: 400;
  --font-weight-bold: 700;
}
```

---

### Layer 2: Semantic (Meaning-based)

- [ ] **Tokens semânticos definidos**
  - [ ] Text: `text-primary`, `text-secondary`, `text-muted`
  - [ ] Background: `background-base`, `background-elevated`
  - [ ] Border: `border-default`, `border-accent`
  - [ ] Interactive: `interactive-primary`, `interactive-secondary`

- [ ] **Referenciando primitives**
  ```css
  /* GOOD - Layer 2 referencia Layer 1 */
  @theme {
    --color-text-primary: var(--color-blue-900);
    --color-text-secondary: var(--color-blue-500);
  }
  ```

- [ ] **Naming convention consistente**
  - [ ] Padrão: `--{category}-{concept}-{variant}`
  - [ ] Exemplo: `--color-text-primary`, `--spacing-input-padding`

**Exemplo completo:**
```css
/* tokens/semantic.css */
@theme {
  /* Text */
  --color-text-primary: var(--color-blue-900);
  --color-text-secondary: var(--color-blue-500);
  --color-text-muted: var(--color-gray-400);

  /* Background */
  --color-background-base: var(--color-white);
  --color-background-elevated: var(--color-gray-50);

  /* Spacing */
  --spacing-input-padding: var(--spacing-4);
  --spacing-card-gap: var(--spacing-8);
}
```

---

### Layer 3: Component-specific

- [ ] **Tokens por componente definidos**
  - [ ] Button: `button-primary-bg-default`, `button-primary-bg-hover`
  - [ ] Input: `input-border-default`, `input-border-focus`
  - [ ] Card: `card-background`, `card-border`, `card-shadow`

- [ ] **Referenciando Layer 2**
  ```css
  /* GOOD - Layer 3 referencia Layer 2 */
  @theme {
    --button-primary-background-default: var(--color-interactive-primary);
    --button-primary-background-hover: var(--color-interactive-primary-hover);
  }
  ```

- [ ] **Estados cobertos**
  - [ ] Default
  - [ ] Hover
  - [ ] Active
  - [ ] Focus
  - [ ] Disabled

**Exemplo completo:**
```css
/* tokens/components.css */
@theme {
  /* Button Primary */
  --button-primary-background-default: var(--color-blue-500);
  --button-primary-background-hover: var(--color-blue-600);
  --button-primary-background-active: var(--color-blue-700);
  --button-primary-background-disabled: var(--color-gray-300);

  --button-primary-text-default: var(--color-white);
  --button-primary-text-disabled: var(--color-gray-500);

  /* Input */
  --input-border-default: var(--color-border-default);
  --input-border-focus: var(--color-border-accent);
  --input-background: var(--color-background-base);
}
```

---

## W3C Design Tokens (DTCG) Compliance

- [ ] **Formato W3C** (se usando JSON)
  ```json
  {
    "color": {
      "blue": {
        "500": {
          "$value": "oklch(0.55 0.22 250)",
          "$type": "color"
        }
      }
    }
  }
  ```

- [ ] **Aliases suportados**
  ```json
  {
    "color": {
      "text": {
        "primary": {
          "$value": "{color.blue.900}",
          "$type": "color"
        }
      }
    }
  }
  ```

---

## Dark Mode

- [ ] **Dark mode suportado**
  - [ ] Via tokens semânticos (não hardcoded)
  - [ ] Implementação:
    - [ ] CSS `prefers-color-scheme`
    - [ ] JavaScript class toggle (`dark`)
    - [ ] Sistema de temas runtime

- [ ] **Tokens adaptativos**
  ```css
  @theme {
    --color-text-primary: var(--color-blue-900);
    --color-background-base: var(--color-white);
  }

  @media (prefers-color-scheme: dark) {
    @theme {
      --color-text-primary: var(--color-blue-100);
      --color-background-base: var(--color-gray-950);
    }
  }
  ```

  Ou com class:
  ```css
  .dark {
    --color-text-primary: oklch(0.9 0.01 250);
    --color-background-base: oklch(0.1 0 0);
  }
  ```

---

## Contraste e Acessibilidade

- [ ] **Contrastes validados** (WCAG AA mínimo)
  - [ ] Text normal: 4.5:1
  - [ ] Text large (>18pt): 3:1
  - [ ] UI components: 3:1
  - [ ] Estados interativos: 3:1 de diferença

- [ ] **Ferramentas de validação**
  - [ ] [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
  - [ ] [Accessible Color Palette Builder](https://toolness.github.io/accessible-color-matrix/)
  - [ ] Chrome DevTools Contrast Ratio

---

## OKLCH Color Space (Moderno)

- [ ] **OKLCH usado** (Tailwind v4 ou CSS moderno)
  - [ ] Vantagem: Contraste perceptual consistente
  - [ ] Formato: `oklch(L C H / A)`
    - L: Lightness (0-1)
    - C: Chroma (saturation, 0-0.4)
    - H: Hue (0-360)
    - A: Alpha (opcional, 0-1)

- [ ] **Conversão de hex/rgb → oklch**
  - [ ] Ferramenta: [oklch.com](https://oklch.com)
  - [ ] Exemplo: `#3b82f6` → `oklch(0.55 0.22 250)`

**Exemplo:**
```css
@theme {
  /* Primitives em OKLCH */
  --color-blue-500: oklch(0.55 0.22 250);
  --color-blue-600: oklch(0.50 0.22 250); /* Mesmo hue, menos lightness */

  /* Garantia de contraste consistente */
  --color-text-on-blue: oklch(0.95 0.05 250); /* Alto contraste */
}
```

---

## Naming Conventions

- [ ] **Padrão consistente seguido**
  - [ ] Layer 1: `--{type}-{name}-{scale}`
    - Exemplo: `--color-blue-500`, `--spacing-4`
  - [ ] Layer 2: `--{category}-{concept}-{variant}`
    - Exemplo: `--color-text-primary`, `--spacing-input-padding`
  - [ ] Layer 3: `--{component}-{property}-{state}`
    - Exemplo: `--button-primary-background-hover`

- [ ] **Sem prefixos inconsistentes**
  - [ ] ❌ BAD: `--primaryColor`, `--bg-color-primary`, `--colorPrimary`
  - [ ] ✅ GOOD: `--color-text-primary` (sempre mesmo padrão)

---

## Organização de Arquivos

- [ ] **Arquivos separados por camada**
  ```
  styles/tokens/
  ├── primitives.css    # Layer 1
  ├── semantic.css      # Layer 2
  └── components.css    # Layer 3
  ```

- [ ] **Import order correto**
  ```css
  @import "./tokens/primitives.css";
  @import "./tokens/semantic.css";
  @import "./tokens/components.css";
  ```

---

## Uso em Componentes

- [ ] **Componentes usam tokens semânticos**
  ```typescript
  // ✅ GOOD
  <button className="bg-primary text-primary-foreground">Click</button>

  // ❌ BAD
  <button className="bg-blue-500 text-white">Click</button>
  ```

- [ ] **Arbitrary values usam tokens CSS**
  ```typescript
  // ✅ GOOD
  <div className="bg-[var(--button-primary-background-default)]">...</div>

  // ❌ BAD
  <div className="bg-[#3b82f6]">...</div>
  ```

---

## Exportação e Sincronização

- [ ] **Tokens exportáveis** (se Design System compartilhado)
  - [ ] JSON (W3C DTCG format)
  - [ ] CSS variables
  - [ ] Figma tokens (via plugin)
  - [ ] iOS/Android (Style Dictionary)

- [ ] **Fonte da verdade definida**
  - [ ] Figma → código (design-led)
  - [ ] Código → Figma (dev-led)
  - [ ] Bidirecional (sync)

---

## Problemas Comuns

### ❌ Hardcoded Values Everywhere
```typescript
// BAD
<div className="text-[#1a1a1a] bg-[#f5f5f5]">...</div>

// GOOD
<div className="text-foreground bg-background">...</div>
```

### ❌ Sem Hierarquia
```css
/* BAD - tudo no mesmo nível */
@theme {
  --blue-500: oklch(...);
  --text-color: oklch(...);
  --button-bg: oklch(...);
}

/* GOOD - hierarquia clara */
@theme {
  /* Layer 1 */
  --color-blue-500: oklch(...);

  /* Layer 2 */
  --color-text-primary: var(--color-blue-900);

  /* Layer 3 */
  --button-primary-background: var(--color-text-primary);
}
```

### ❌ Dark Mode Quebrado
```css
/* BAD - valores hardcoded não funcionam em dark mode */
.button {
  background: #3b82f6;
  color: #ffffff;
}

/* GOOD - tokens adaptativos */
.button {
  background: var(--button-primary-background);
  color: var(--button-primary-text);
}
```

---

## Score Final

**Design Tokens Health Score:**

- [ ] 🟢 Excelente (90-100%) - 3 camadas completas, W3C compliant, dark mode
- [ ] 🟡 Bom (70-89%) - 2 camadas, alguns tokens, dark mode parcial
- [ ] 🟠 Aceitável (50-69%) - Alguns tokens, sem hierarquia clara
- [ ] 🔴 Crítico (<50%) - Hardcoded values everywhere, sem sistema de tokens

---

_Checklist gerado por: AIOS Skill `/tokenizacao`_
