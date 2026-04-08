---
name: image-creator
description: "Renderiza HTML/CSS em imagens PNG via Playwright (headless browser). É como uma impressora: você manda o HTML e ele \"imprime\" uma imagem pixel-perfect"
  Renderiza HTML/CSS em imagens PNG production-ready via Playwright.
  Motor genérico: qualquer formato visual é definido pelo template HTML.
  Suporta batch rendering (carrosséis), viewport presets por plataforma,
  e regras de tipografia para legibilidade mobile.
risk: safe
source: opensquad
version: 1.1.0
category: content-production
tags: [image, html, css, playwright, screenshot, carousel, social-media]
paths:
  - "skills/image-creator/"
lazy_load: true
context_budget: 1200
---

# Image Creator

Renderiza HTML/CSS em imagens PNG via Playwright (headless browser). É como uma impressora: você manda o HTML e ele "imprime" uma imagem pixel-perfect. Qualquer coisa que HTML/CSS consiga representar, esta skill transforma em PNG.

## When to Use This Skill

- Gerar imagens para redes sociais (posts, carrosséis, stories)
- Criar thumbnails, infográficos, slides de apresentação
- Qualquer visual que possa ser definido por HTML/CSS
- Batch rendering (múltiplos slides de um carrossel)
- Gerar imagens branded com tokens de marca (cores, fontes, logo)

## Do NOT Use This Skill When

- Precisa editar fotos/imagens existentes (use ferramentas de edição como ImageMagick)
- Precisa de animações ou vídeo → use `video-generator`
- O design já existe no Canva ou Figma → use a skill correspondente
- Precisa de imagens geradas por IA (ilustrações, fotos) → use `image-fetcher` ou APIs de geração

## Discovery Questions

Perguntas para fazer antes de executar. Use AskUserQuestion tool. Pule se o usuário já forneceu esse contexto.

1. **Para qual plataforma é a imagem? (Instagram, LinkedIn, YouTube, etc.)** — (define viewport/dimensões e font sizes mínimos)
2. **Quantas imagens precisa? (single ou batch/carrossel?)** — (determina se usa workflow unitário ou batch rendering)
3. **Tem referência visual ou direção de estilo? (cores, fontes, layout)** — (evita gerar algo fora do esperado)
4. **Onde salvar os arquivos de saída?** — (define output directory do HTML e PNGs) (opcional)

## Prerequisites

- MCP server Playwright configurado e funcionando
- Python 3 (para HTTP server local)
- Fontes Google Fonts acessíveis via internet (ou fontes locais instaladas)

## Core Workflow

### 1. Gerar HTML

Escrever um arquivo HTML completo e self-contained com CSS inline. O HTML DEVE seguir estas regras:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px;   /* Largura do viewport */
      height: 1440px;  /* Altura do viewport */
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }
  </style>
  <!-- Google Fonts via @import se necessário -->
  <style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');</style>
</head>
<body>
  <!-- Conteúdo aqui -->
</body>
</html>
```

**Regras obrigatórias do HTML:**
- Self-contained (CSS inline, sem dependências externas além de Google Fonts)
- Web-safe fonts OU Google Fonts via `@import`
- Imagens como paths absolutos ou base64 data URIs
- Body com dimensões exatas do viewport
- `margin: 0; padding: 0; overflow: hidden` no body
- `box-sizing: border-box` universal

### 2. Salvar HTML

No diretório de output do squad/projeto:
```
squads/{squad}/output/images/slide-01.html
squads/{squad}/output/images/slide-02.html
```

### 3. Iniciar HTTP Server

Servidor local para o Playwright acessar os HTMLs:

```bash
python3 -m http.server 8765 --directory "OUTPUT_DIR" &
for i in $(seq 1 30); do curl -s http://localhost:8765 > /dev/null 2>&1 && break || sleep 0.1; done
```

**Importante:** Iniciar o server UMA vez antes de renderizar todas as imagens, não uma vez por imagem.

### 4. Renderizar via Playwright MCP

Para cada HTML:
1. `browser_navigate` para `http://localhost:8765/slide-01.html`
2. `browser_resize` para dimensões do viewport (ex: 1080x1440)
3. `browser_take_screenshot` para salvar PNG

### 5. Verificar Qualidade

Ler o screenshot para confirmar:
- Texto legível e dentro dos mínimos de font-size
- Cores e fontes corretas
- Layout alinhado, sem overflow
- Imagens carregaram corretamente

### 6. Parar Server

```bash
pkill -f "http.server 8765" 2>/dev/null || true
```

## Viewport Presets

| Plataforma | Dimensões | Aspect Ratio |
|------------|-----------|-------------|
| Instagram Post | 1080 x 1080 | 1:1 |
| Instagram Carousel | 1080 x 1440 | 3:4 |
| Instagram Story/Reel | 1080 x 1920 | 9:16 |
| Facebook Post | 1200 x 630 | ~1.9:1 |
| Twitter/X Post | 1200 x 675 | 16:9 |
| LinkedIn Post | 1200 x 627 | ~1.9:1 |
| YouTube Thumbnail | 1280 x 720 | 16:9 |
| Pinterest Pin | 1000 x 1500 | 2:3 |
| Apresentação 16:9 | 1920 x 1080 | 16:9 |

## Regras de Tipografia (OBRIGATÓRIO)

Texto deve ser legível no menor contexto da plataforma (feed mobile). Pense assim: se alguém vê o post no celular enquanto rola o feed, cada letra precisa ser grande o suficiente para ler sem apertar os olhos. Estes são mínimos absolutos.

### Font Sizes Mínimos por Plataforma

| Papel do Texto | IG Post/Carousel | IG Story/Reel | LinkedIn/Facebook | YouTube Thumb |
|----------------|-----------------|---------------|-------------------|---------------|
| Hero/Display | 58px | 56px | 40px | 60px |
| Heading | 43px | 42px | 32px | 36px |
| Body/Bullets | 34px | 32px | 24px | 36px |
| Caption/Footer | 24px | 20px | 20px | 32px |

**Regra universal:** Nenhum texto legível pode usar font-size menor que 20px, em qualquer plataforma.

### Font Weight

| Papel | Weight Mínimo | Notas |
|-------|--------------|-------|
| Hero/Display | 700 (bold) | Sempre bold para máximo impacto |
| Heading | 600 (semibold) | Semibold ou bold |
| Body/Bullets | 500 (medium) | Medium para legibilidade |
| Caption/Footer | 500 (medium) | 400 só com contraste ≥ 4.5:1 |

**Evitar:** weights thin/light (100-300) para qualquer texto legível.

### Checklist de Verificação

Antes de `browser_take_screenshot`, confirmar:
- [ ] Todos os textos usam `px` explícito (não `em`/`rem`)
- [ ] Nenhum heading abaixo do mínimo da plataforma
- [ ] Nenhum body text abaixo do mínimo
- [ ] Nenhum caption abaixo do mínimo
- [ ] Nenhum texto legível com font-weight abaixo de 500
- [ ] Contraste texto/fundo adequado (mínimo 4.5:1 para corpo, 3:1 para títulos grandes)

## Batch Rendering (Carrosséis)

Workflow otimizado para múltiplas imagens:

1. Gerar um HTML por slide (nomeação: `slide-01.html`, `slide-02.html`, ...)
2. Iniciar HTTP server **UMA vez** antes do batch
3. Renderizar cada slide sequencialmente
4. **Verificar a primeira imagem** antes de continuar o batch
5. Parar HTTP server **UMA vez** ao final
6. Nomear PNGs: `slide-01.png`, `slide-02.png`, `slide-03.png`
7. Manter mesmas dimensões em todos os slides

### Por Que Verificar a Primeira Imagem?

Se o primeiro slide tem um problema (fonte não carregou, cor errada, texto overflow), todos os outros provavelmente terão o mesmo problema. Corrigir antes de renderizar os 10 slides do carrossel economiza tempo.

## Examples

### Exemplo 1: Post Instagram 1080x1080

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1080px; overflow: hidden;
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex; align-items: center; justify-content: center;
      color: white; text-align: center; padding: 80px;
    }
    h1 { font-size: 64px; font-weight: 700; line-height: 1.2; }
    p { font-size: 36px; font-weight: 500; margin-top: 24px; opacity: 0.9; }
  </style>
</head>
<body>
  <div>
    <h1>3 Dicas de Produtividade</h1>
    <p>Que vão mudar seu dia a dia</p>
  </div>
</body>
</html>
```

### Exemplo 2: Carrossel com Brand Tokens

```html
<!-- slide-01.html (hook) -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    :root {
      --brand-primary: #FF6B35;
      --brand-bg: #1A1A2E;
      --brand-text: #FFFFFF;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px; height: 1440px; overflow: hidden;
      font-family: 'Inter', sans-serif;
      background: var(--brand-bg);
      color: var(--brand-text);
      display: flex; flex-direction: column;
      justify-content: center; padding: 80px;
    }
    .badge {
      background: var(--brand-primary);
      padding: 12px 24px; border-radius: 8px;
      font-size: 28px; font-weight: 600;
      display: inline-block; margin-bottom: 32px;
    }
    h1 { font-size: 72px; font-weight: 700; line-height: 1.15; }
    .swipe {
      position: absolute; bottom: 60px; right: 80px;
      font-size: 24px; font-weight: 500; opacity: 0.6;
    }
  </style>
</head>
<body>
  <div>
    <span class="badge">GUIA COMPLETO</span>
    <h1>Como Criar um Design System do Zero</h1>
  </div>
  <span class="swipe">Deslize →</span>
</body>
</html>
```

### Exemplo 3: YouTube Thumbnail

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1280px; height: 720px; overflow: hidden;
      font-family: 'Inter', sans-serif;
      background: #0F0F0F;
      color: white;
      display: flex; align-items: center;
      padding: 60px;
    }
    .text { flex: 1; }
    h1 { font-size: 72px; font-weight: 700; line-height: 1.1; }
    .highlight { color: #FF0000; }
    .badge {
      background: #FF0000; padding: 8px 20px;
      border-radius: 4px; font-size: 36px;
      font-weight: 700; display: inline-block;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="text">
    <span class="badge">NOVO</span>
    <h1>Como Ganhar <span class="highlight">10x</span> Mais Produtividade</h1>
  </div>
</body>
</html>
```

## Best Practices

### Layout
- Usar CSS Grid ou Flexbox para layout (mais confiável que position absolute)
- Evitar `position: absolute` para elementos de conteúdo — usar só para decoração
- Testar text overflow: textos longos podem quebrar o layout
- Usar `overflow: hidden` no body para evitar scrollbars

### Cores e Contraste
- Contraste mínimo 4.5:1 para body text (WCAG AA)
- Contraste mínimo 3:1 para títulos grandes (> 24px bold)
- Testar cores com ferramenta de contraste se houver dúvida
- Gradientes: garantir que texto tem contraste em todas as posições do gradiente

### Imagens e Assets
- Imagens como base64 data URIs (mais confiável) ou caminhos absolutos
- Emojis: usar system fonts (`font-family: 'Apple Color Emoji', 'Segoe UI Emoji'`)
- Logo: preferencialmente SVG inline ou PNG com fundo transparente
- `border-radius` + `overflow: hidden` para cantos arredondados em imagens

### Performance
- Verificar primeira imagem antes de renderizar batch completo
- Manter HTTP server rodando durante todo o batch (não reiniciar entre imagens)
- Fontes Google Fonts podem demorar para carregar — adicionar um `sleep 1` se a fonte não aparecer

## Troubleshooting

### Fonte não carrega (aparece fonte genérica)

**Causa:** Google Fonts não carregou a tempo, ou URL do `@import` está incorreta.
**Soluções:**
1. Verificar URL do `@import` — acessar no navegador para confirmar
2. Adicionar delay antes do screenshot: aguardar 1-2 segundos após navigate
3. Usar fontes web-safe como fallback (`font-family: 'Inter', 'Helvetica Neue', sans-serif`)
4. Se persistir, usar fonte embutida via base64 `@font-face`

### Imagem renderiza em branco

**Causas comuns:**
1. HTTP server não está rodando — verificar com `curl http://localhost:8765`
2. Caminho do HTML está errado no `browser_navigate`
3. Body não tem dimensões explícitas (`width`/`height`)
4. Conteúdo com cor igual ao fundo

### Texto cortado ou com overflow

**Causa:** Texto mais longo que o espaço disponível.
**Soluções:**
1. Reduzir font-size (respeitando os mínimos da plataforma)
2. Usar `text-overflow: ellipsis` + `overflow: hidden` para cortar graciosamente
3. Dividir em múltiplos slides se for carrossel
4. Usar `-webkit-line-clamp` para limitar número de linhas

### Cores diferentes do esperado

**Causa:** Playwright pode ter color management diferente do navegador.
**Solução:** Usar valores hexadecimais explícitos (não `rgb()` ou nomes de cores). Comparar visualmente o screenshot com o esperado.

### Screenshot com resolução baixa

**Causa:** O `browser_resize` pode não ter sido chamado com as dimensões corretas.
**Solução:** Sempre chamar `browser_resize` com largura e altura exatas ANTES do `browser_take_screenshot`. Confirmar que o viewport bate com as dimensões do body no HTML.

### Porta 8765 já em uso

**Causa:** Um server anterior não foi encerrado corretamente.
**Solução:**
```bash
pkill -f "http.server 8765" 2>/dev/null || true
# Aguardar 1 segundo e reiniciar
python3 -m http.server 8765 --directory "OUTPUT_DIR" &
```

### Emojis não aparecem (quadrados vazios)

**Causa:** Falta de fonte de emoji no ambiente headless.
**Solução:** Adicionar `font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji'` ao elemento que contém emojis. No macOS, Apple Color Emoji geralmente funciona.

## Key Files

| Arquivo | Função |
|---------|--------|
| `skills/image-creator/SKILL.md` | Documentação e instruções desta skill |
