# Create LP Template

**Task:** `create-lp-template`
**Agent:** @template-engineer
**Type:** Production
**Priority:** 1

---

## Description

Criar template reutilizavel de landing page. Define estrutura de secoes, layout, configuracao e placeholders para copy/imagens. Usa design system do @design-architect.

---

## Input

```yaml
template_type: 'sales-long | webinar | lead-magnet | mini-sales | waitlist'
design_system: 'path para design tokens + componentes'
sections_config:
  - hero
  - problem
  - solution
  - how-it-works
  - benefits
  - social-proof
  - offer-stack
  - guarantee
  - faq
  - final-cta
  - footer
```

---

## Process

### 1. Definir Estrutura (@template-engineer)

- Selecionar secoes baseado no template_type
- Definir ordem e hierarquia
- Configurar slots para copy e imagens

### 2. Aplicar Design System (@design-architect assist)

- Aplicar tokens (cores, tipografia, spacing)
- Usar componentes da library
- Garantir zero hardcoded values

### 3. Adicionar Animacoes (@animation-designer assist)

- Presets de animacao por secao
- Scroll-triggered reveals
- Hover states nos CTAs

### 4. Configurar Responsividade

- Mobile-first (375px)
- Breakpoints: 640, 768, 1024, 1280, 1536
- Touch targets 44x44px

### 5. Testar Template

- Preencher com dados dummy
- Validar em todos os viewports
- Validar acessibilidade

---

## Output

```
Entregaveis:
1. template-[type].tsx - Template React
2. template-[type]-config.yaml - Configuracao de secoes
3. preview.html - Preview com dados dummy
```

---

**Created:** 2026-02-10
**Version:** 1.0
