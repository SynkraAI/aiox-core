# Design System Quality Fixes — Backlog de Correcoes

Bugs concretos nos scripts de geracao que degradam a qualidade do output.
Ordenados por impacto (alto → baixo).

Referencia de qualidade: `skills/design-system-quality-standard.md`

---

## ALTO IMPACTO

### ~~FIX-01: Cores mapeadas por ordem, nao por semantica~~ ✅ DONE (2026-04-02)
Corrigido em `tokens-to-tailwind.mjs`. Agora usa luminosidade + saturacao para inferir primary/background/foreground.

### ~~FIX-02: CVA instalado mas nunca usado no lp-generator~~ ✅ DONE (2026-04-02)
Adicionado `components/ui/button.tsx` com CVA. Hero, Offer e CTA agora usam `<Button>`.

### ~~FIX-03: `cn()` nunca importado nos componentes LP~~ ✅ DONE (2026-04-02)
Hero agora importa e usa `cn()`. Button usa `cn()` via CVA.

### ~~FIX-04: Light mode hardcoda primary como roxo~~ ✅ DONE (2026-04-02)
`lp-styles.mjs`: `--primary` e `--ring` removidos do override `[data-theme="light"]` — herdam do brand.

### ~~FIX-05: Animacoes com duracao hardcoded~~ ✅ DONE (2026-04-02)
`tokens-to-tailwind.mjs`: Agora preserva `duration`, `timingFunction` e `iterationCount` do CSS original.

### BONUS: FIX-06 lineHeight ✅ DONE (2026-04-02)
`tokens-to-tailwind.mjs`: Agora infere lineHeight por tamanho (headings 1.08-1.25, body 1.5-1.6) ou usa valor extraido.

### BONUS: FIX-10 focus-visible ✅ DONE (2026-04-02)
`lp-styles.mjs`: Adicionado `:focus-visible` com ring em todos os elementos interativos.

### BONUS: Tipo `any` removido ✅ DONE (2026-04-02)
`lp-nextjs-templates.mjs`: `getSectionByType` agora usa `{ type: string }` em vez de `any`.

---

### ~~FIX-01 (original):~~ Cores mapeadas por ordem, nao por semantica
- **Arquivo:** `skills/design-system-scaffold/lib/tokens-to-tailwind.mjs` (~linha 123-134)
- **Bug:** Cores atribuidas a `primary, secondary, accent, muted...` pela ordem que aparecem no YAML
- **Efeito:** A cor de botao pode virar `muted`, a cor de fundo pode virar `primary`
- **Correcao:** Ordenar por luminosidade + frequencia. Cor mais escura/frequente → `background`. Mais clara → `foreground`. Mais saturada → `primary`. Menos saturada → `muted`.

### FIX-02: CVA instalado mas nunca usado no lp-generator
- **Arquivo:** `skills/lp-generator/lib/lp-nextjs-templates.mjs`
- **Bug:** `class-variance-authority` esta no package.json mas nenhum componente LP o usa
- **Efeito:** Variantes de Button duplicadas em 6 componentes diferentes (hero, offer, cta, nav, sticky-cta, offer multi-tier)
- **Correcao:** Extrair `Button` com CVA para `components/ui/button.tsx` e importar nos templates

### FIX-03: `cn()` nunca importado nos componentes LP
- **Arquivo:** `skills/lp-generator/lib/lp-nextjs-templates.mjs`
- **Bug:** `cn()` existe em `lib/utils.ts` mas nenhum componente LP importa
- **Efeito:** Classes condicionais sao template literals vulneraveis a espacos duplos
- **Correcao:** Adicionar `import { cn } from '@/lib/utils'` em todos os componentes gerados

### FIX-04: Light mode hardcoda primary como roxo
- **Arquivo:** `skills/lp-generator/templates/lp-styles.mjs`
- **Bug:** `[data-theme="light"]` sobreescreve `--primary: 259 69% 56%` (roxo fixo)
- **Efeito:** Qualquer brand com primary diferente de roxo quebra no light mode
- **Correcao:** Delegar ao `brandToShadcnVars()` computar tambem o light theme

### FIX-05: Animacoes com duracao hardcoded
- **Arquivo:** `skills/design-system-scaffold/lib/tokens-to-tailwind.mjs` (~linha 181)
- **Bug:** Toda animacao recebe `"${name} 3s ease-in-out infinite"` fixo
- **Efeito:** Animacao de 0.3s no site original vira 3s no DS gerado — tudo fica em slow-motion
- **Correcao:** Preservar `duration`, `timing-function` e `iteration-count` do CSS original

---

## MEDIO IMPACTO

### FIX-06: lineHeight fixo 1.2
- **Arquivo:** `skills/design-system-scaffold/lib/tokens-to-tailwind.mjs` (~linha 148)
- **Bug:** `lineHeight: '1.2'` hardcoded para todos os font-sizes
- **Efeito:** Texto corrido fica apertado (deveria ser 1.5-1.6 para body)
- **Correcao:** Ler `line-height` do token de tipografia ou usar heuristica: headings 1.1-1.2, body 1.5-1.6

### FIX-07: Font-size nomeados por ordem, nao por tamanho
- **Arquivo:** `skills/design-system-scaffold/lib/tokens-to-css.mjs` (~linha 119-127)
- **Bug:** Primeiro tamanho encontrado recebe `xs`, segundo `sm`, etc.
- **Efeito:** Um tamanho de 80px pode ser nomeado `xs`
- **Correcao:** Ordenar por valor numerico antes de atribuir nomes

### FIX-08: Semantic colors genericas no extractor
- **Arquivo:** `skills/design-system-extractor/resources/token-template.ts` (~linha 13-75)
- **Bug:** `success: '#10B981'`, `error: '#EF4444'` sao cores Tailwind padrao, nao extraidas
- **Efeito:** Todo DS gerado tem as mesmas cores de feedback independente do site
- **Correcao:** Marcar como placeholder explicito ou tentar extrair do site (botoes de erro, alertas)

### FIX-09: Inline styles no HTML do lp-generator Mode A
- **Arquivo:** `skills/lp-generator/lib/lp-builder-gsap.mjs`
- **Bug:** Multiplos `style="..."` inline no HTML gerado
- **Efeito:** Impossivel customizar via CSS, viola padrao de DS
- **Correcao:** Substituir por classes CSS com tokens

### FIX-10: Focus ring ausente
- **Arquivos:** `skills/lp-generator/templates/lp-styles.mjs`, `skills/design-system-storybook/lib/generate-components.mjs`
- **Bug:** Nenhum `:focus-visible` nos elementos interativos gerados
- **Correcao:** Adicionar `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring` como padrao

---

## BAIXO IMPACTO

### FIX-11: Molecules/organisms sem variantes de cor
- **Arquivo:** `skills/design-system-storybook/lib/generate-components.mjs` (~linha 409-483)
- **Correcao:** Injetar `tokenColors` nas molecules como nas atoms

### FIX-12: forwardRef com tipo generico incorreto
- **Arquivo:** `skills/design-system-storybook/lib/generate-components.mjs` (~linha 312)
- **Bug:** `HTML${toPascalCase(htmlTag)}Element` pode gerar `HTMLSvgElement` (nao existe)
- **Correcao:** Mapear `svg → SVGSVGElement`, demais → `HTML*Element`

### FIX-13: Emojis como icones no LP Mode A
- **Arquivo:** `skills/lp-generator/lib/lp-builder-gsap.mjs`
- **Correcao:** Substituir por SVG inline com `aria-hidden="true"`

### FIX-14: 8 efeitos declarados mas nao implementados
- **Arquivo:** `skills/lp-generator/lib/effects-config.mjs`
- **Bug:** `magneticButtons`, `cursorGlow`, `loadingScreen`, etc. sao flags mortas
- **Correcao:** Implementar ou remover do array `VALID_EFFECTS`

### FIX-15: `dangerouslySetInnerHTML` sem sanitizacao
- **Arquivo:** `skills/lp-generator/lib/lp-nextjs-templates.mjs`
- **Correcao:** Sanitizar com `DOMPurify` ou gerar React elements em vez de HTML strings

---

*Criado 2026-04-02. Total: 15 fixes, 5 alto impacto, 5 medio, 5 baixo.*
