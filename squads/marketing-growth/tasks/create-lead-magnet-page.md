# Create Lead Magnet Page

**Task:** `create-lead-magnet-page`
**Agent:** @lead-copywriter + @landing-page-architect + @conversion-optimizer
**Type:** Creation

---

## Description

Criar landing page curta para captura de leads (ebook, checklist, template, video).

---

## Input

```yaml
lead_magnet_nome: 'Nome do lead magnet'
tipo: 'ebook | checklist | template | video | webinar'
avatar: 'Descricao do publico-alvo'
```

---

## Process

### 1. Copy (@lead-copywriter -> Copy Squad)

- Copy curta e direta
- Headline + 3-5 beneficios + CTA

### 2. Estrutura (@landing-page-architect)

- Hero (headline + subheadline + form + mockup)
- Beneficios (3-5 bullets)
- Social proof (compacto)
- CTA repetido
- Mini bio

### 3. Otimizacao (@conversion-optimizer)

- Form otimizado (max 3 campos)
- CTA above the fold
- Mobile-first

---

## Output

```
HTML/CSS responsivo single-page
- Max 1 scroll
- Sem navegacao (foco total no form)
- Form: nome + email (+ telefone opcional)
- Botao CTA contrastante
```

---

**Created:** 2026-02-05
**Version:** 1.0
