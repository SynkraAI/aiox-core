# Design System Quality Standard v1.0

Documento de referencia compartilhado entre TODAS as skills que geram componentes UI,
design systems ou landing pages. Qualquer output que nao atenda estes criterios e
considerado abaixo do padrao de qualidade aceitavel.

## Referencia: skills que DEVEM consultar este documento

- `design-system-scaffold`
- `design-system-storybook`
- `design-system-forge`
- `design-system-extractor`
- `lp-generator`
- Qualquer skill futura que gere componentes React/HTML

---

## 1. Tokens (NON-NEGOTIABLE)

### Cores
- Formato: HSL via CSS Custom Properties (`--primary: 32 27% 69%`)
- Uso: `hsl(var(--primary))` — NUNCA hex hardcoded em componentes
- Opacidade: `hsl(var(--primary) / 0.3)` — nunca rgba separado
- Semantica obrigatoria: `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`
- Semantica estendida: `--success`, `--warning`, `--info` com respectivos `-foreground`
- Dark mode: via classe `.dark` com redefinicao completa de todas as variaveis
- NUNCA usar cores Tailwind default como semantic colors (ex: `#10B981` para success)
- Mapear cores por SEMANTICA (luminosidade + frequencia + contexto), nao por ordem de aparicao

### Tipografia
- Minimo 2 font families com intencao semantica:
  - `--font-sans` — UI, controles, labels, botoes
  - `--font-serif` ou `--font-display` — headings de impacto, corpo editorial
  - `--font-mono` — codigo, valores numericos (quando aplicavel)
- NUNCA usar Inter/Roboto/Arial como padrao generico — usar a fonte real extraida do site
- Escala de font-size ordenada por valor px ANTES de nomear (`xs < sm < base < lg < xl`)
- line-height extraido do CSS computado real — NUNCA hardcoded `1.2`
- letter-spacing preservado (negativo em headings `-0.02em`, normal em body)

### Espacamento
- Tokenizado via CSS Custom Properties: `--space-1` a `--space-16` (escala base-4)
- OU via Tailwind spacing scale (p-1, p-2, p-4, p-8...)
- NUNCA valores magicos inline (`style="margin-bottom:2rem"`)

### Border Radius
- Tokenizado: `--radius` com derivacoes (`calc(var(--radius) - 2px)`)
- Consistente em todo o sistema

### Animacoes
- Duracoes e easings preservados do CSS original — NUNCA `3s ease-in-out infinite` hardcoded
- Keyframes nomeados semanticamente: `fade-in`, `slide-up`, `shimmer`, `float`, `pulse-slow`
- `prefers-reduced-motion` OBRIGATORIO em qualquer animacao

---

## 2. Componentes (MUST)

### Padrao de implementacao
- `React.forwardRef` em todo componente que renderiza elemento DOM interativo
- `displayName` definido em todo componente com forwardRef
- Interface TypeScript para props — NUNCA `any`
- `cn()` (clsx + tailwind-merge) para composicao de classes — NUNCA string literal
- Spread de props nativas (`...props`) no elemento raiz
- Named exports (sem `export default`)

### Variantes
- CVA (`class-variance-authority`) para componentes com variantes (Button, Badge, Alert, Input)
- Minimo: `variant` + `size` para componentes interativos
- Button: pelo menos `default`, `secondary`, `outline`, `ghost`, `destructive`
- Badge: semantic variants (success, warning, error, info) + role variants quando aplicavel

### Acessibilidade (MUST)
- `focus-visible` com ring: `outline: 2px solid hsl(var(--ring)); outline-offset: 2px`
- `aria-label` em botoes sem texto visivel (icon-only)
- `aria-hidden="true"` em icones decorativos
- `role` semantico em componentes interativos (tablist/tab, dialog, menu)
- Touch targets minimo 44px em mobile
- Contraste WCAG 2.1 AA (4.5:1 para texto, 3:1 para UI)
- `useReducedMotion()` em componentes com Framer Motion

### Composicao
- Cards: sub-pecas compostas (`CardHeader`, `CardTitle`, `CardContent`, `CardFooter`)
- Sem `dangerouslySetInnerHTML` com dados de usuario sem sanitizacao

---

## 3. Efeitos Visuais Premium (SHOULD)

### Micro-animacoes que elevam qualidade
- Button shimmer: pseudo-elemento `::before` com skew deslizando no hover
- Button glow: `box-shadow` com cor primary em baixa opacidade no hover
- Card hover: `translateY(-2px)` + sombra expandida
- Fade-in on scroll: `translateY(10px)` + opacity 0→1 via IntersectionObserver
- Float: `translateY(-10px)` alternando 3s ease-in-out
- Transitions: sempre `cubic-bezier(0.4, 0, 0.2, 1)` — easing do Material Design

### Detalhes de polimento
- Scrollbar customizada: largura, cor, border-radius
- Grain texture overlay (SVG feTurbulence `opacity: 0.02-0.03`)
- `::selection` com cor primary em 20% opacidade
- `font-smoothing: antialiased`

### Regra dos 8%
- Cor primaria/marca ocupa no maximo 8% da interface visivel
- Resto e monocromatico (escala de cinza em dark, off-whites em light)
- Acento de cor APENAS em: CTAs, links ativos, bordas de foco, badges de status

---

## 4. Estrutura de Projeto (SHOULD)

### Organizacao recomendada
```
src/
  components/
    ui/          — Atomos e moleculas reutilizaveis (Button, Card, Input, Badge...)
    templates/   — Layouts compostos (Hero, Pricing, FAQ, Footer...)
  lib/
    utils.ts     — cn() function
    theme.ts     — Sistema de temas (quando aplicavel)
  styles/
    tokens.css   — CSS Custom Properties
    globals.css  — Estilos globais (scrollbar, grain, selection)
```

### Dependencias aceitas
- `clsx` + `tailwind-merge` (obrigatorio)
- `class-variance-authority` (obrigatorio para componentes com variantes)
- `date-fns` (quando Calendar/DatePicker necessario)
- `framer-motion` (quando animacoes complexas necessarias)
- Nenhuma outra sem aprovacao explicita

---

## 5. Anti-Patterns (NEVER)

- NUNCA inline styles no HTML gerado (`style="margin:2rem"`)
- NUNCA emojis como icones (usar SVG ou icon library)
- NUNCA fontes genericas como padrao (Inter, Roboto, Arial sem contexto)
- NUNCA gradiente roxo em fundo branco (cliche de IA)
- NUNCA `href="#"` em CTAs de conversao
- NUNCA `any` em tipos TypeScript
- NUNCA valores fixos para animacoes extraidas (`3s ease-in-out infinite`)
- NUNCA mapear cores por ordem de iteracao — SEMPRE por semantica
- NUNCA `dangerouslySetInnerHTML` sem sanitizacao
- NUNCA lineHeight fixo `1.2` para todos os tamanhos

---

## 6. Checklist de Entrega

Antes de considerar um DS ou LP "pronto":

- [ ] Todos os tokens em CSS Custom Properties HSL
- [ ] Dark mode funcional via `.dark` class
- [ ] `cn()` usado em todos os componentes (nunca string literal)
- [ ] CVA em componentes com variantes
- [ ] `forwardRef` em componentes interativos
- [ ] `focus-visible` em todos os elementos clicaveis
- [ ] `prefers-reduced-motion` respeitado
- [ ] Zero inline styles
- [ ] Zero `any` no TypeScript
- [ ] Responsivo testado em 375px, 768px, 1440px
- [ ] Scrollbar customizada
- [ ] Fonte real do site (nao generica)
- [ ] Animacoes com duracao/easing reais (nao hardcoded)

---

*v1.0 — Criado 2026-04-02. Baseado na analise comparativa de designcode-ui, academia-lendaria DS v4.1, e lp-generator v3.1.*
