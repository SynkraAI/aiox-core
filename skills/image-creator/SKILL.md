---
name: image-creator
description: >-
  Renderiza HTML/CSS em imagens PNG production-ready via Playwright.
  Motor genérico: qualquer formato visual é definido pelo template HTML.
  Suporta batch rendering (carrosséis), viewport presets por plataforma,
  e regras de tipografia para legibilidade mobile.
risk: safe
source: opensquad
paths:
  - "skills/image-creator/"
lazy_load: true
context_budget: 1200
---

# Image Creator

Renderiza HTML/CSS em imagens PNG via Playwright (headless browser). É como uma impressora: você manda o HTML e ele "imprime" uma imagem pixel-perfect.

## When to Use This Skill

- Gerar imagens para redes sociais (posts, carrosséis, stories)
- Criar thumbnails, infográficos, slides de apresentação
- Qualquer visual que possa ser definido por HTML/CSS
- Batch rendering (múltiplos slides de um carrossel)

## Do NOT Use This Skill When

- Precisa editar fotos/imagens existentes (use ferramentas de edição)
- Precisa de animações ou vídeo (screenshot é estático)
- O design já existe no Canva ou Figma (use a skill correspondente)

## Prerequisites

- MCP server Playwright configurado e funcionando
- Python 3 (para HTTP server local)

## Core Workflow

1. **Gerar HTML** — Escreva um arquivo HTML completo e self-contained com CSS inline
2. **Salvar HTML** — No diretório de output do squad/projeto
3. **Iniciar HTTP server** — Servidor local para o Playwright acessar:
   ```bash
   python -m http.server 8765 --directory "OUTPUT_DIR" &
   for i in $(seq 1 30); do curl -s http://localhost:8765 > /dev/null 2>&1 && break || sleep 0.1; done
   ```
4. **Renderizar** — Via Playwright MCP:
   - `browser_navigate` para `http://localhost:8765/slide-01.html`
   - `browser_resize` para dimensões do viewport
   - `browser_take_screenshot` para salvar PNG
5. **Verificar** — Ler o screenshot para confirmar qualidade
6. **Parar server** — `pkill -f "http.server 8765" 2>/dev/null || true`

## Viewport Presets (largura x altura)

| Plataforma | Dimensões |
|------------|-----------|
| Instagram Post | 1080 x 1080 |
| Instagram Carousel | 1080 x 1440 |
| Instagram Story/Reel | 1080 x 1920 |
| Facebook Post | 1200 x 630 |
| Twitter/X Post | 1200 x 675 |
| LinkedIn Post | 1200 x 627 |
| YouTube Thumbnail | 1280 x 720 |

## HTML Template Guidelines

O HTML DEVE ser:
- Self-contained (CSS inline, sem dependências externas)
- Web-safe fonts OU Google Fonts via `@import`
- Imagens como paths absolutos ou base64 data URIs
- Body com dimensões exatas do viewport
- `margin: 0; padding: 0; overflow: hidden` no body

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1080px; height: 1440px; overflow: hidden; }
  </style>
</head>
<body>
  <!-- Conteúdo -->
</body>
</html>
```

## Batch Rendering (Carrosséis)

1. Gerar um HTML por slide
2. Iniciar HTTP server UMA vez antes do batch
3. Renderizar cada slide sequencialmente
4. Parar HTTP server UMA vez ao final
5. Nomear: `slide-01.png`, `slide-02.png`, `slide-03.png`
6. Manter mesmas dimensões em todos os slides

## Regras de Tipografia (OBRIGATÓRIO)

Texto deve ser legível no menor contexto da plataforma (feed mobile). Estes são mínimos absolutos.

### Font Sizes Mínimos por Plataforma

| Papel do Texto | IG Post/Carousel | IG Story/Reel | LinkedIn/Facebook | YouTube Thumb |
|----------------|-----------------|---------------|-------------------|---------------|
| Hero/Display | 58px | 56px | 40px | 60px |
| Heading | 43px | 42px | 32px | 36px |
| Body/Bullets | 34px | 32px | 24px | 36px |
| Caption/Footer | 24px | 20px | 20px | 32px |

**Regra universal**: Nenhum texto legível pode usar font-size menor que 20px, em qualquer plataforma.

### Font Weight

- Body e acima: font-weight 500+ (medium/semibold/bold)
- Caption: 500+ recomendado; 400 só com contraste 4.5:1 mínimo
- Evitar weights thin/light (100-300) para texto legível

### Checklist de Verificação

Antes de `browser_take_screenshot`, confirmar:
- Todos os textos usam px explícito (não em/rem)
- Nenhum heading abaixo do mínimo da plataforma
- Nenhum body text abaixo do mínimo
- Nenhum caption abaixo do mínimo
- Nenhum texto legível com font-weight abaixo de 500

## Best Practices

- Verificar primeira imagem renderizada antes de batch
- CSS Grid/Flexbox para layout (mais confiável)
- Sem animações/transitions (screenshot estático)
- Rounded corners: CSS `border-radius` + `overflow`
- Emojis: system fonts (macOS: Apple Color Emoji)
- Testar text overflow antes de renderizar
