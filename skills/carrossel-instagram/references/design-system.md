# Design System — Carrossel Instagram

Componentes visuais HTML/CSS para renderização de slides de carrossel.
Cada slide é um arquivo HTML autônomo, pronto para screenshot via Playwright.

---

## Template Base (Todo Slide)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>@import url('https://fonts.googleapis.com/css2?family={TITLE_FONT}:wght@300;600;700&family={BODY_FONT}:wght@400;500;600&display=swap');</style>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1080px;
      height: 1350px;
      overflow: hidden;
      position: relative;
    }
    .serif { font-family: '{TITLE_FONT}', serif; }
    .sans { font-family: '{BODY_FONT}', sans-serif; }
    .slide {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 0 36px;
      position: relative;
    }
    .slide--center { justify-content: center; }
    .slide--bottom { justify-content: flex-end; padding-bottom: 52px; }
    .slide--light { background: {LIGHT_BG}; color: {DARK_BG}; }
    .slide--dark { background: {DARK_BG}; color: #fff; }
    .slide--gradient { background: linear-gradient(165deg, {BRAND_DARK} 0%, {BRAND_PRIMARY} 50%, {BRAND_LIGHT} 100%); color: #fff; }
  </style>
</head>
<body>
  <div class="slide slide--{variant}">
    <!-- Conteúdo do slide -->

    <!-- Barra de progresso (obrigatória) -->
    <!-- Seta de arraste (exceto último slide) -->
  </div>
</body>
</html>
```

---

## Componentes Obrigatórios

### 1. Barra de Progresso

Presente em TODOS os slides. Mostra posição no carrossel.

```html
<!-- Slide claro -->
<div style="position:absolute;bottom:0;left:0;right:0;padding:16px 28px 20px;z-index:10;display:flex;align-items:center;gap:10px;">
  <div style="flex:1;height:3px;background:rgba(0,0,0,0.08);border-radius:2px;overflow:hidden;">
    <div style="height:100%;width:{PERCENT}%;background:{BRAND_PRIMARY};border-radius:2px;"></div>
  </div>
  <span class="sans" style="font-size:11px;color:rgba(0,0,0,0.3);font-weight:500;">{CURRENT}/{TOTAL}</span>
</div>

<!-- Slide escuro / gradiente -->
<div style="position:absolute;bottom:0;left:0;right:0;padding:16px 28px 20px;z-index:10;display:flex;align-items:center;gap:10px;">
  <div style="flex:1;height:3px;background:rgba(255,255,255,0.12);border-radius:2px;overflow:hidden;">
    <div style="height:100%;width:{PERCENT}%;background:#fff;border-radius:2px;"></div>
  </div>
  <span class="sans" style="font-size:11px;color:rgba(255,255,255,0.4);font-weight:500;">{CURRENT}/{TOTAL}</span>
</div>
```

Cálculo: `PERCENT = (slideIndex / totalSlides) * 100`

### 2. Seta de Arraste

Presente em todos os slides EXCETO o último. Chevron sutil no lado direito.

```html
<!-- Slide claro -->
<div style="position:absolute;right:0;top:0;bottom:0;width:48px;z-index:9;display:flex;align-items:center;justify-content:center;background:linear-gradient(to right,transparent,rgba(0,0,0,0.06));">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M9 6l6 6-6 6" stroke="rgba(0,0,0,0.25)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</div>

<!-- Slide escuro / gradiente -->
<div style="position:absolute;right:0;top:0;bottom:0;width:48px;z-index:9;display:flex;align-items:center;justify-content:center;background:linear-gradient(to right,transparent,rgba(255,255,255,0.08));">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M9 6l6 6-6 6" stroke="rgba(255,255,255,0.35)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</div>
```

---

## Componentes de Conteúdo

### Tag / Rótulo de Categoria

Rótulo em caixa alta acima do título.

```html
<!-- Slide claro -->
<span class="sans" style="display:inline-block;font-size:10px;font-weight:600;letter-spacing:2px;color:{BRAND_PRIMARY};margin-bottom:16px;text-transform:uppercase;">{TEXTO}</span>

<!-- Slide escuro -->
<span class="sans" style="display:inline-block;font-size:10px;font-weight:600;letter-spacing:2px;color:{BRAND_LIGHT};margin-bottom:16px;text-transform:uppercase;">{TEXTO}</span>

<!-- Slide gradiente -->
<span class="sans" style="display:inline-block;font-size:10px;font-weight:600;letter-spacing:2px;color:rgba(255,255,255,0.6);margin-bottom:16px;text-transform:uppercase;">{TEXTO}</span>
```

### Logotipo (Slides 1 e último)

```html
<div style="display:flex;align-items:center;gap:12px;margin-bottom:32px;">
  <!-- Círculo com inicial (se não tiver logo SVG) -->
  <div style="width:40px;height:40px;border-radius:50%;background:{BRAND_PRIMARY};display:flex;align-items:center;justify-content:center;">
    <span class="sans" style="color:#fff;font-size:16px;font-weight:700;">{INICIAL}</span>
  </div>
  <span class="sans" style="font-size:13px;font-weight:600;letter-spacing:0.5px;color:{COR_TEXTO};">{NOME_MARCA}</span>
</div>
```

### Título Principal

```html
<h1 class="serif" style="font-size:34px;font-weight:600;letter-spacing:-0.5px;line-height:1.1;margin-bottom:20px;">
  {TÍTULO}
</h1>
```

### Corpo de Texto

```html
<p class="sans" style="font-size:14px;font-weight:400;line-height:1.55;color:{COR_CORPO};">
  {TEXTO}
</p>
```

### Lista de Features

Linhas com ícone + título + descrição.

```html
<div style="display:flex;align-items:flex-start;gap:14px;padding:10px 0;border-bottom:1px solid {LIGHT_BORDER};">
  <span style="color:{BRAND_PRIMARY};font-size:15px;width:18px;text-align:center;">{ICONE}</span>
  <div>
    <span class="sans" style="font-size:14px;font-weight:600;color:{DARK_BG};display:block;">{TÍTULO}</span>
    <span class="sans" style="font-size:12px;color:#8A8580;">{DESCRIÇÃO}</span>
  </div>
</div>
```

### Etapas Numeradas

Para slides de passo a passo.

```html
<div style="display:flex;align-items:flex-start;gap:16px;padding:14px 0;border-bottom:1px solid {LIGHT_BORDER};">
  <span class="serif" style="font-size:26px;font-weight:300;color:{BRAND_PRIMARY};min-width:34px;line-height:1;">01</span>
  <div>
    <span class="sans" style="font-size:14px;font-weight:600;color:{DARK_BG};display:block;">{TÍTULO}</span>
    <span class="sans" style="font-size:12px;color:#8A8580;">{DESCRIÇÃO}</span>
  </div>
</div>
```

### Pills com Tachado

Para slides de "o que está sendo substituído".

```html
<span style="font-size:11px;padding:5px 12px;border:1px solid rgba(255,255,255,0.1);border-radius:20px;color:#6B6560;text-decoration:line-through;">{TEXTO}</span>
```

### Pills de Tag

```html
<span style="font-size:11px;padding:5px 12px;background:rgba(255,255,255,0.06);border-radius:20px;color:{BRAND_LIGHT};">{TEXTO}</span>
```

### Caixa de Citação

```html
<div style="padding:16px;background:rgba(0,0,0,0.15);border-radius:12px;border:1px solid rgba(255,255,255,0.08);">
  <p class="sans" style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:6px;">{RÓTULO}</p>
  <p class="serif" style="font-size:15px;color:#fff;font-style:italic;line-height:1.4;">"{CITAÇÃO}"</p>
</div>
```

### Botão CTA (Apenas Último Slide)

```html
<div style="display:inline-flex;align-items:center;gap:8px;padding:12px 28px;background:{LIGHT_BG};color:{BRAND_DARK};font-family:'{BODY_FONT}',sans-serif;font-weight:600;font-size:14px;border-radius:28px;margin-top:24px;">
  {TEXTO_CTA}
</div>
```

---

## Regras de Layout

1. **Padding padrão:** `0 36px` em todos os slides
2. **Slides com barra de progresso:** padding-bottom de `52px` para não sobrepor
3. **Slides Hero/CTA:** `justify-content: center` (conteúdo centralizado)
4. **Slides com muito conteúdo:** `justify-content: flex-end` (texto na parte inferior)
5. **Alternância de fundos:** criar ritmo visual claro ↔ escuro ↔ gradiente
6. **Último slide:** SEM seta de arraste, barra de progresso em 100%
7. **Espaço para seta:** conteúdo não deve ultrapassar `right: 60px` nos slides com seta

---

## Princípios de Design

1. **Cada slide é exportável** — seta e barra de progresso fazem parte da imagem
2. **Alternância claro/escuro** — cria ritmo visual entre swipes
3. **Título + corpo** — fonte display para impacto, fonte corpo para legibilidade
4. **Paleta derivada** — todas as cores derivam de uma única cor principal
5. **Revelação progressiva** — barra de progresso preenche ao avançar
6. **Mobile-first** — todo design pensado para tela de celular (95%+ dos views)
7. **Consistência** — mesmo estilo de componentes em todos os slides
