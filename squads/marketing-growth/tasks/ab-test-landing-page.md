# A/B Test Landing Page

**Task:** `ab-test-landing-page`
**Agent:** @conversion-optimizer + @landing-page-architect
**Type:** Optimization

---

## Description

Criar variantes A/B de landing page para teste.

---

## Input

```yaml
landing_page_original: 'HTML ou URL da pagina original'
elemento_a_testar: 'headline | cta | hero | layout | social-proof | offer'
```

---

## Process

1. Identifica elemento a testar
2. Cria hipotese ("Se mudarmos X, esperamos Y porque Z")
3. Gera variante B (e opcionalmente C)
4. Define metricas de sucesso
5. Estima tamanho de amostra necessario

---

## Output

```
A/B Test Plan:
- Hipotese: [descricao]
- Elemento testado: [X]
- Variante A (controle): [descricao]
- Variante B: [descricao]
- Variante C (opcional): [descricao]
- Metrica primaria: [conversion rate / click rate / etc]
- Amostra necessaria: [N visitantes]
- Duracao estimada: [X dias]

Arquivos:
- variante-a.html (original)
- variante-b.html
```

---

**Created:** 2026-02-05
**Version:** 1.0
