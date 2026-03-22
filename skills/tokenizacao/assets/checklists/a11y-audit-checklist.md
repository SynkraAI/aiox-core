# Acessibilidade (WCAG 2.2) Audit Checklist

Use este checklist para auditar acessibilidade em projetos React/Next.js.

## Focus Management

### Focus Visible

- [ ] **Focus visível em todos elementos interativos**
  ```typescript
  // ✅ GOOD - focus-visible com ring
  <button className="focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring">
    Submit
  </button>

  // ❌ BAD - outline-none sem substituição
  <button className="outline-none">
    Submit
  </button>
  ```

- [ ] **Buscar problemas:**
  ```bash
  # Encontrar outline-none sem foco alternativo
  grep -r "outline-none" --include="*.tsx" --include="*.jsx" | \
    grep -v "focus-visible\|focus:"
  ```

- [ ] **WCAG Criterion:** 2.4.7 Focus Visible (Level AA)

---

### Focus Trap

- [ ] **Dialogs/Modals com focus trap**
  - [ ] Focus retorna ao elemento que abriu
  - [ ] Tab navega apenas dentro do modal
  - [ ] ESC fecha o modal

- [ ] **Radix UI Dialog** (se usando shadcn/ui)
  ```typescript
  import * as Dialog from '@radix-ui/react-dialog'

  <Dialog.Root>
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay />
      <Dialog.Content>
        {/* Focus trap automático */}
        <Dialog.Title>Title</Dialog.Title>
        <Dialog.Description>Description</Dialog.Description>
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
  ```

- [ ] **WCAG Criterion:** 2.4.3 Focus Order (Level A)

---

## Keyboard Navigation

- [ ] **Todos elementos interativos acessíveis via teclado**
  - [ ] Botões: Enter/Space
  - [ ] Links: Enter
  - [ ] Inputs: Tab/Shift+Tab, Enter (submit)
  - [ ] Dropdowns: Arrow keys, Enter, ESC
  - [ ] Tabs: Arrow keys, Home, End

- [ ] **Radix UI Primitives** (keyboard automático)
  ```typescript
  // ✅ Dropdown com keyboard navigation
  import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

  <DropdownMenu.Root>
    <DropdownMenu.Trigger>Menu</DropdownMenu.Trigger>
    <DropdownMenu.Content>
      <DropdownMenu.Item onSelect={() => {}}>Item 1</DropdownMenu.Item>
      <DropdownMenu.Item onSelect={() => {}}>Item 2</DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Root>
  ```

- [ ] **WCAG Criterion:** 2.1.1 Keyboard (Level A)

---

## Screen Reader Support

### Labels e ARIA

- [ ] **Todos inputs têm labels**
  ```typescript
  // ✅ GOOD - label associado
  <div>
    <label htmlFor="email">Email</label>
    <input id="email" type="email" />
  </div>

  // ❌ BAD - sem label
  <input type="email" placeholder="Email" />
  ```

- [ ] **Botões com ícone têm texto acessível**
  ```typescript
  // ✅ GOOD - sr-only label
  <button className="h-10 w-10">
    <span className="sr-only">Close dialog</span>
    <X className="h-4 w-4" />
  </button>

  // ❌ BAD - apenas ícone
  <button className="h-10 w-10">
    <X className="h-4 w-4" />
  </button>
  ```

- [ ] **Buscar problemas:**
  ```bash
  # Botões com ícone sem label
  grep -r "<button.*<.*Icon" --include="*.tsx" --include="*.jsx" | \
    grep -v "sr-only\|aria-label\|<span"
  ```

- [ ] **WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)

---

### ARIA Landmarks

- [ ] **Landmarks semânticos usados**
  ```html
  <header>...</header>
  <nav aria-label="Main navigation">...</nav>
  <main>...</main>
  <aside aria-label="Sidebar">...</aside>
  <footer>...</footer>
  ```

- [ ] **ARIA roles quando necessário**
  ```typescript
  // Dialog
  <div role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-desc">
    <h2 id="dialog-title">Confirm action</h2>
    <p id="dialog-desc">Are you sure?</p>
  </div>

  // Alertas
  <div role="alert">Error: Form submission failed</div>

  // Loading
  <div role="status" aria-live="polite">
    <span className="sr-only">Loading...</span>
    <Spinner />
  </div>
  ```

- [ ] **WCAG Criterion:** 1.3.1 Info and Relationships (Level A)

---

## Contraste de Cores

- [ ] **Contraste mínimo atingido** (WCAG AA)
  - [ ] Texto normal (<18pt): **4.5:1**
  - [ ] Texto grande (≥18pt ou ≥14pt bold): **3:1**
  - [ ] UI components (botões, borders): **3:1**

- [ ] **Estados interativos contrastados**
  - [ ] Hover: mínimo 3:1 de diferença do default
  - [ ] Focus: ring visível com contraste adequado
  - [ ] Active: feedback visual claro

- [ ] **Ferramentas de validação:**
  - [ ] [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
  - [ ] Chrome DevTools (Inspect → Accessibility → Contrast)
  - [ ] [Accessible Color Palette Builder](https://toolness.github.io/accessible-color-matrix/)

- [ ] **Buscar problemas potenciais:**
  ```bash
  # Texto cinza claro (potencial problema de contraste)
  grep -r "text-gray-[1-4]00\|text-slate-[1-4]00" --include="*.tsx"
  ```

- [ ] **WCAG Criterion:** 1.4.3 Contrast (Minimum) - Level AA

---

## Alternative Text

- [ ] **Todas imagens têm alt text apropriado**
  ```typescript
  // ✅ GOOD - alt descritivo
  <img src="/logo.png" alt="Company Logo - Homepage Link" />

  // ✅ GOOD - decorativa (alt vazio)
  <img src="/decoration.svg" alt="" />

  // ❌ BAD - sem alt
  <img src="/photo.jpg" />

  // ❌ BAD - alt genérico
  <img src="/photo.jpg" alt="image" />
  ```

- [ ] **Next.js Image component:**
  ```typescript
  import Image from 'next/image'

  <Image
    src="/photo.jpg"
    alt="Descriptive text"
    width={500}
    height={300}
  />
  ```

- [ ] **WCAG Criterion:** 1.1.1 Non-text Content (Level A)

---

## Forms

### Labels e Instruções

- [ ] **Todos inputs têm labels claros**
  ```typescript
  <div>
    <label htmlFor="password">
      Password
      <span className="text-destructive ml-1">*</span>
    </label>
    <input
      id="password"
      type="password"
      aria-required="true"
      aria-describedby="password-hint"
    />
    <p id="password-hint" className="text-sm text-muted-foreground">
      Must be at least 8 characters
    </p>
  </div>
  ```

- [ ] **Campos obrigatórios indicados**
  - [ ] Visualmente: asterisco ou "(required)"
  - [ ] Programaticamente: `aria-required="true"` ou `required`

- [ ] **WCAG Criterion:** 3.3.2 Labels or Instructions (Level A)

---

### Validação e Erros

- [ ] **Mensagens de erro claras e acessíveis**
  ```typescript
  <div>
    <label htmlFor="email">Email</label>
    <input
      id="email"
      type="email"
      aria-invalid={hasError}
      aria-describedby={hasError ? "email-error" : undefined}
    />
    {hasError && (
      <p id="email-error" className="text-destructive text-sm" role="alert">
        Please enter a valid email address
      </p>
    )}
  </div>
  ```

- [ ] **ARIA states:**
  - [ ] `aria-invalid="true"` quando erro
  - [ ] `aria-describedby` apontando para mensagem de erro
  - [ ] `role="alert"` para erros dinâmicos

- [ ] **WCAG Criterion:** 3.3.1 Error Identification (Level A)

---

## Estados de Componentes

### Loading States

- [ ] **Loading acessível a screen readers**
  ```typescript
  // ✅ GOOD
  {isLoading && (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading content...</span>
      <Spinner />
    </div>
  )}

  // ❌ BAD - apenas spinner visual
  {isLoading && <Spinner />}
  ```

- [ ] **Button loading state:**
  ```typescript
  <button disabled={isLoading} aria-busy={isLoading}>
    {isLoading ? (
      <>
        <Spinner className="mr-2" />
        <span>Loading...</span>
      </>
    ) : (
      'Submit'
    )}
  </button>
  ```

---

### Disabled States

- [ ] **Elementos disabled têm feedback visual E programático**
  ```typescript
  // ✅ GOOD
  <button
    disabled={isDisabled}
    aria-disabled={isDisabled}
    className="disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Submit
  </button>

  // ⚠️ CONSIDER - tooltip explicando por que está disabled
  <Tooltip>
    <TooltipTrigger asChild>
      <button disabled={!hasChanges}>Save</button>
    </TooltipTrigger>
    <TooltipContent>No changes to save</TooltipContent>
  </Tooltip>
  ```

- [ ] **WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)

---

## Motion e Animações

- [ ] **Reduced motion respeitado**
  ```css
  .transition-all {
    transition: all 0.3s;
  }

  @media (prefers-reduced-motion: reduce) {
    .transition-all {
      transition: none;
    }
  }
  ```

  Ou com Tailwind:
  ```html
  <div class="transition-transform motion-reduce:transition-none">
    ...
  </div>
  ```

- [ ] **Animações essenciais mantidas** (loading spinners, progress bars)
  - [ ] Fornecer alternativa textual

- [ ] **WCAG Criterion:** 2.3.3 Animation from Interactions (Level AAA)

---

## Responsive Design

- [ ] **Mobile-first approach**
  - [ ] Touch targets mínimo: 44x44px
  - [ ] Espaçamento adequado entre elementos interativos

- [ ] **Zoom suportado**
  - [ ] Texto escala até 200% sem quebrar layout
  - [ ] Sem `user-scalable=no` no viewport meta tag

- [ ] **WCAG Criterion:** 1.4.4 Resize Text (Level AA), 2.5.5 Target Size (Level AAA)

---

## Headings Hierarchy

- [ ] **Hierarquia lógica de headings**
  ```html
  <!-- ✅ GOOD -->
  <h1>Page Title</h1>
    <h2>Section 1</h2>
      <h3>Subsection 1.1</h3>
    <h2>Section 2</h2>

  <!-- ❌ BAD - pulando níveis -->
  <h1>Page Title</h1>
    <h3>Section 1</h3> <!-- Pulou h2 -->
  ```

- [ ] **Headings descritivos** (não genéricos como "Details", "More")

- [ ] **WCAG Criterion:** 2.4.6 Headings and Labels (Level AA)

---

## Problemas Comuns

### ❌ Outline-None Sem Substituição
```html
<!-- BAD -->
<button class="outline-none">Click</button>

<!-- GOOD -->
<button class="focus-visible:outline-hidden focus-visible:ring-2">Click</button>
```

### ❌ Botão Ícone Sem Label
```html
<!-- BAD -->
<button><X /></button>

<!-- GOOD -->
<button>
  <span class="sr-only">Close</span>
  <X />
</button>
```

### ❌ Contraste Insuficiente
```css
/* BAD - cinza claro sobre branco (contraste ~2:1) */
.text {
  color: #999999;
  background: #ffffff;
}

/* GOOD - cinza escuro sobre branco (contraste ~7:1) */
.text {
  color: #333333;
  background: #ffffff;
}
```

### ❌ Formulário Sem Labels
```html
<!-- BAD -->
<input type="email" placeholder="Email" />

<!-- GOOD -->
<label for="email">Email</label>
<input id="email" type="email" />
```

---

## Ferramentas de Teste

### Automatizadas
- [ ] [axe DevTools](https://www.deque.com/axe/devtools/) - Chrome extension
- [ ] [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Chrome DevTools
- [ ] [eslint-plugin-jsx-a11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y) - Linting

### Manuais
- [ ] Navegação por teclado (Tab, Enter, Space, Arrow keys)
- [ ] Screen reader (NVDA, JAWS, VoiceOver)
- [ ] Zoom 200%
- [ ] Modo dark (se aplicável)

---

## Score Final

**Acessibilidade (WCAG 2.2) Health Score:**

- [ ] 🟢 Excelente (90-100%) - WCAG AA/AAA compliant
- [ ] 🟡 Bom (70-89%) - WCAG A compliant, alguns AA
- [ ] 🟠 Aceitável (50-69%) - Alguns critérios atendidos
- [ ] 🔴 Crítico (<50%) - Muitas barreiras de acessibilidade

---

_Checklist gerado por: AIOS Skill `/tokenizacao`_
