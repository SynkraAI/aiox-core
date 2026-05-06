# Assemble Landing Page

**Task:** `assemble-landing-page`
**Agent:** @page-assembler
**Type:** Production (MAIN)
**Priority:** 1 (task principal do squad)

---

## Description

Montar landing page completa usando design system + template + copy. Output: React/HTML responsivo, acessivel e otimizado para performance. Task principal do squad.

---

## Input

```yaml
brief: 'Descricao do produto/servico e publico-alvo'
copy: 'Copy completa (do Copy Squad ou manual)'
template: 'template selecionado (ou auto-select baseado no brief)'
design_tokens: 'path para design-tokens.yaml'
images:
  hero: 'url ou path da imagem hero'
  product: 'url ou path da imagem do produto'
  testimonials: ['foto1', 'foto2', 'foto3']
```

---

## Process

### 1. Selecionar Template (@genesis-director → @page-assembler)

- Baseado no tipo de oferta (sales, webinar, lead, etc.)
- Ou usar template especifico do input

### 2. Integrar Copy (@page-assembler)

- Inserir copy em cada secao do template
- Headline, subheadline, body, bullets, CTAs, FAQ
- Copy vem do Copy Squad (via bridge) ou input direto

### 3. Aplicar Design System (@page-assembler)

- Tokens de cor, tipografia, spacing
- Componentes CVA com variants corretas
- Zero hardcoded values

### 4. Inserir Assets (@page-assembler)

- Hero image (WebP/AVIF, lazy load)
- Product images
- Testimonial photos
- Icons (Lucide React)

### 5. Aplicar Animacoes (@animation-designer assist)

- Framer Motion presets por secao
- Scroll reveals, hover states, CTA pulse

### 6. Responsividade (@page-assembler)

- Mobile-first build
- Testar 375px, 768px, 1024px, 1440px
- Touch targets, font sizes, spacing

### 7. Quality Gate

- Checklists: design-quality, responsive-mobile, accessibility-wcag
- Score minimo: 85%

### 8. Human Approval Gate

- Preview completo ao usuario
- Go/No-Go

---

## Output

```
Entregaveis:
1. landing-page.tsx - Componente React completo
2. landing-page.html - HTML self-contained (CSS inline)
3. assets/ - Imagens otimizadas
4. build-report.md - Metricas da build

Metrics:
- Secoes: X
- Word Count: X
- Images: X
- Responsive: Sim
- WCAG AA: Sim
- Performance Score: X/100
```

---

**Created:** 2026-02-10
**Version:** 1.0
