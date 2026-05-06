# Create Daily Content

**Task:** `create-daily-content`
**Agent:** @content-strategist + @content-producer + @visual-designer
**Type:** Creation

---

## Description

Criar conteudo diario para Instagram e/ou LinkedIn. Gera 3 angulos, produz conteudo no formato ideal, cria specs visuais e agenda publicacao.

---

## Input

```yaml
tema: 'Tema do conteudo (opcional - senao usa calendario)'
plataforma: 'ig | li | both'
formato: 'carousel | reel | post | article | auto'
```

---

## Process

### 1. Ideacao (@content-strategist)

- Gera 3 angulos de conteudo
- Define formato ideal por plataforma
- Output: 3 angulos com hooks

### 2. Aprovacao (@growth-cmo)

- Revisa angulos
- Aprova o melhor
- Output: angulo aprovado

### 3. Copy (@lead-copywriter ou @content-producer)

- Se copy complexa: bridge para Copy Squad
- Se post simples: @content-producer escreve direto
- Output: copy formatada

### 4. Producao (@content-producer)

- Formata para plataforma (slides, script, texto)
- Aplica voice clone (se disponivel)
- Cria hooks e CTAs
- Output: conteudo formatado

### 5. Design (@visual-designer)

- Specs visuais (cores, layout, imagens)
- Prompts para geracao de imagem (se necessario)
- Output: specs visuais

### 6. Quality Gate

- Checklist: content-quality + brand-consistency
- Score minimo: 80%

### 7. Human Approval

- Preview ao usuario
- Go/No-Go

### 8. Agendamento (@distribution-manager)

- Melhor horario
- Publica ou agenda
- Log

---

## Output

```
Conteudo:
- Texto/copy formatado para plataforma
- Specs visuais (dimensoes, cores, layout)
- Caption + hashtags (Instagram)
- Agendamento confirmado

Tempo estimado: 15-20 min
```

---

**Created:** 2026-02-05
**Version:** 1.0
