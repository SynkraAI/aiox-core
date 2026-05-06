# Audit Landing Page

**Task:** `audit-landing-page`
**Agent:** @conversion-optimizer + @lead-copywriter
**Type:** Audit

---

## Description

Auditar landing page existente com framework CRO de 7 pontos + auditoria de copy.

---

## Input

```yaml
url: 'URL da landing page'
# ou
html_content: 'HTML da pagina'
```

---

## Process

### 1. Auditoria CRO (@conversion-optimizer)

Aplica framework 7 pontos:

1. Clarity - mensagem clara em 5s?
2. Relevance - relevante para visitante?
3. Value - valor percebido > custo?
4. Friction - obstaculos?
5. Distraction - distrações?
6. Urgency - razao para agir agora?
7. Anxiety - o que gera inseguranca?

### 2. Auditoria Copy (@lead-copywriter -> @copy-chief)

- @claude-hopkins: auditoria cientifica
- Analise de headlines, bullets, CTAs

### 3. Checklists

- conversion-elements.md
- mobile-first.md
- seo-basics.md
- accessibility-wcag.md

---

## Output

```
RELATORIO DE AUDITORIA - [URL/Nome]

Score Geral: X/100

Por Dimensao:
1. Clarity: X/10 - [comentario]
2. Relevance: X/10 - [comentario]
3. Value: X/10 - [comentario]
4. Friction: X/10 - [comentario]
5. Distraction: X/10 - [comentario]
6. Urgency: X/10 - [comentario]
7. Anxiety: X/10 - [comentario]

Top 3 Problemas (por impacto):
1. [Problema] - [Solucao sugerida]
2. [Problema] - [Solucao sugerida]
3. [Problema] - [Solucao sugerida]

Quick Wins:
- [Acao rapida 1]
- [Acao rapida 2]
- [Acao rapida 3]
```

---

**Created:** 2026-02-05
**Version:** 1.0
