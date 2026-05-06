# Create Animation Set

**Task:** `create-animation-set`
**Agent:** @animation-designer
**Type:** Production
**Priority:** 3

---

## Description

Criar set de animacoes customizadas com Framer Motion para uma LP ou componente especifico. Inclui enter/exit, scroll-triggered, hover states e loading transitions.

---

## Input

```yaml
animation_type: 'page | section | component'
target_elements: ['hero', 'testimonials', 'cta', 'faq']
timing:
  duration: 300 # ms
  stagger: 100 # ms entre children
  easing: 'easeOut'
respect_reduced_motion: true
```

---

## Process

### 1. Definir Animation Map (@animation-designer)

- Mapear cada target element para tipo de animacao
- Hero: fade-in-up staggered
- Sections: scroll-reveal
- CTAs: hover-lift + pulse
- FAQ: accordion expand

### 2. Criar Framer Motion Configs

- motion variants para cada animacao
- AnimatePresence para enter/exit
- useInView para scroll triggers

### 3. Configurar Reduced Motion

- Fallback para prefers-reduced-motion
- Animacoes instant (duration: 0) ou removidas

### 4. Performance Check

- Testar em mobile (60fps target)
- Verificar will-change usage
- Garantir GPU compositing (transform + opacity only)

---

## Output

```
Entregaveis:
1. animation-config.ts - Framer Motion variants e configs
2. scroll-triggers.ts - IntersectionObserver hooks
3. usage-guide.md - Como usar as animacoes
```

---

**Created:** 2026-02-10
**Version:** 1.0
