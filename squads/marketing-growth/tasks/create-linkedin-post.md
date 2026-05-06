# Create LinkedIn Post

**Task:** `create-linkedin-post`
**Agent:** @content-producer
**Type:** Creation

---

## Description

Criar post LinkedIn thought leadership com hook forte, valor e CTA para comentarios.

---

## Input

```yaml
tema: 'Tema do post'
angulo: 'educativo | provocativo | storytelling | case | dados'
tom: 'formal | semi-formal | conversacional'
```

---

## Process

### 1. Estrutura (@content-producer)

- Hook (linhas 1-2): gerar clique em "ver mais"
- Corpo (3-15 linhas): 3-5 paragrafos curtos
- CTA: pergunta para gerar comentarios

### 2. Formatacao

- Line breaks entre paragrafos
- Max 3000 chars
- 3-5 hashtags no final
- Sem emojis em excesso (0-3)

### 3. Quality Gate

- Checklist: content-quality

---

## Output

```
POST LINKEDIN:
[Texto completo formatado]

Sugestao de imagem: [sim/nao + descricao]
Hashtags: [3-5]
Melhor horario: [sugestao]
```

---

**Created:** 2026-02-05
**Version:** 1.0
