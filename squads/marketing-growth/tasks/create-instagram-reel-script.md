# Create Instagram Reel Script

**Task:** `create-instagram-reel-script`
**Agent:** @content-producer
**Type:** Creation

---

## Description

Criar script de Reel com hook, conteudo com timing e CTA.

---

## Input

```yaml
tema: 'Tema do reel'
duracao: '15 | 30 | 60 | 90'
estilo: 'educativo | storytelling | trend | behind-the-scenes'
```

---

## Process

### 1. Script (@content-producer)

- Hook (0-3s): interromper scroll
- Conteudo (3s - penultimos 5s): valor rapido
- CTA (ultimos 5s): acao clara

### 2. Detalhamento

- Timestamps por secao
- Texto na tela por momento
- Sugestao de audio/musica trend

---

## Output

```
REEL SCRIPT - [Tema] - [Duracao]s

0-3s: HOOK
  Texto na tela: "[frase impacto]"
  Acao: [descricao do que aparece]
  Audio: [narração ou trend]

3-Xs: CONTEUDO
  [Timestamp]: [acao + texto]
  [Timestamp]: [acao + texto]

Xs-Fim: CTA
  Texto na tela: "[CTA]"
  Acao: [apontar/seguir/etc]

CAPTION: [texto curto + hashtags]
```

---

**Created:** 2026-02-05
**Version:** 1.0
