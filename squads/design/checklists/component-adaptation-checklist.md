# Component Adaptation Checklist

> Checklist para validacao da adaptacao de componentes shadcn.
> Usado nos QA gates das Phases 2 e 3 (`f2-qa-base-components`, `f3-qa-derived-components`).

## Por Componente

### Integridade Funcional

- [x] Componente importa sem erros de TypeScript
- [x] Componente renderiza sem runtime errors
- [x] Todas as variantes renderizam
- [x] Todas as props existentes funcionam

### Props API

- [x] Nenhuma prop removida
- [x] Nenhuma prop obrigatoria adicionada
- [x] Types/interfaces inalterados
- [x] `className` prop faz merge corretamente
- [x] `ref` forwarding funciona (se aplicavel)

### Visual — Estados

- [x] Default state corresponde ao design
- [x] Hover state tem feedback visual
- [x] Focus state tem ring visivel (focus-visible)
- [x] Active/Pressed state tem feedback
- [x] Disabled state visualmente distinto e nao interativo

### Tokens

- [x] Nenhuma cor hardcoded (hex/rgb nas classes)
- [x] Usa tokens semanticos (`bg-primary`, `text-foreground`, etc.)
- [x] Extensoes (warning, info, success) usam tokens do @theme inline
- [x] Radius usa variavel `--radius` ou derivado

### Acessibilidade

- [x] ARIA attributes preservados
- [x] `data-slot` attributes preservados
- [x] Focus-visible ring presente (componentes interativos)
- [x] Keyboard navigation funcional
- [x] Contraste foreground/background >= 4.5:1

### Dark Mode

- [x] Componente adapta em `.dark` class
- [x] Contraste mantido em dark
- [x] Nenhum estado visual desaparece

## Cross-Component (batch)

### Consistencia

- [x] Border-radius consistente entre componentes similares
- [x] Transicoes (duracao, easing) consistentes
- [x] Shadow scale consistente
- [x] Focus ring style consistente
- [x] Disabled pattern consistente
- [x] Padding scale proporcional

### Integracao

- [x] `npm run dev` sem erros
- [x] Sem warnings de Tailwind
- [x] Sem warnings de React/Next.js

## Notas

- Componentes que NAO sao interativos (Separator, Skeleton, AspectRatio) podem pular checks de hover/focus/disabled
- Componentes de layout (Form, ScrollArea) tem mudancas minimas — validar apenas tokens e dark mode

---

**Resultado: 15/15 componentes PASS | 4 issues corrigidos | 0 pendentes**
**Build: PASS (TypeScript 0 errors, next build OK)**
**Verdict: PASS**

*Validado em: 2026-02-21*
*Validado por: Foundations Pipeline — f2-qa-base-components*
