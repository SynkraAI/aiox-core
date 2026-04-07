# Ensinio — Guia Prático

> Guia completo e autossuficiente para qualquer agente AI ou designer humano produzir materiais on-brand para a Ensinio. Todos os snippets HTML usam estilos inline com valores reais — copie e cole.

---

## Visão Geral

| Campo | Valor |
|-------|-------|
| **Nome** | Ensinio |
| **Tema** | Dark — fundo preto puro com primária índigo, alto contraste, data-driven |
| **Ideal para** | EdTech, SaaS educacional, plataformas de cursos, conteúdo B2B |
| **Personalidade** | Direto, provocador, sem rodeios. Foco na dor ou no desejo do criador de cursos. Usa dados e números para credibilidade. |
| **Source** | ensinio.com + brand guide (extração manual) |
| **Logo** | `Assets/Logo_ensinio_whitemode.svg` — versão branca (fundos escuros). Nunca alterar proporções ou cores. |

---

## Tipografia — Regras de Uso

### Fontes

| Uso | Fonte | Peso | Quando usar |
|-----|-------|------|-------------|
| Headlines / destaque | **Outfit** | 400 / 600 | Títulos de slide, frases de impacto, números grandes |
| Corpo / texto pequeno | **Inter** | 400 / 500 / 600 | Subtítulos, parágrafos, CTAs, rodapés, labels |
| Código (se necessário) | **JetBrains Mono** | 400 | Blocos de código, valores técnicos |

**Importação (Google Fonts):**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@400;600&display=swap" rel="stylesheet">
```

### Pesos em uso real

- **Outfit 400:** headlines narrativos, títulos de slide
- **Outfit 600:** SOMENTE números de impacto isolados (ex: "64,1%")
- **Outfit 700/800:** PROIBIDO — produz títulos pesados demais
- **Inter 400:** corpo de texto, parágrafos
- **Inter 500:** subtítulos
- **Inter 600:** CTAs, botões, labels, destaques em frase

### Escala tipográfica

#### Para slides Instagram (1080x1350px)

| Elemento | Fonte | Tamanho | Peso | Line-height | Notas |
|----------|-------|---------|------|-------------|-------|
| Headline principal | Outfit | 72–96px | 600 | 1.02 | Números de impacto, hero stat (ex: "64,1%") |
| Headline secundária | Outfit | 38–64px | 400 | 1.02 | Títulos de slide — NUNCA usar 600 nessa faixa |
| Subtítulo | Inter | 28–36px | 500 | 1.3 | |
| Corpo de texto | Inter | 22–26px | 400 | 1.6 | |
| CTA / botão | Inter | 18–22px | 600 | 1.0 | |
| Rodapé / crédito | Inter | 16px | 400 | 1.4 | |

#### Para landing pages (web)

| Elemento | Fonte | Tamanho | Peso | Line-height | Letter-spacing |
|----------|-------|---------|------|-------------|----------------|
| H1 (hero) | Outfit | 56px | 600 | 1.02 | -0.02em |
| H2 (seção) | Outfit | 44px | 400 | 1.02 | -0.01em |
| H3 (card title) | Inter | 28px | 500 | 1.3 | — |
| H4 (subheading) | Inter | 22px | 500 | 1.35 | — |
| Body | Inter | 16px | 400 | 1.65 | — |
| Body small | Inter | 14px | 400 | 1.6 | — |
| Caption | Inter | 13px | 400 | 1.5 | — |
| Label | Inter | 11px | 600 | 1.4 | 0.04em, UPPERCASE |

### Regras obrigatórias

- **Line-height 1.02 em TODO headline Outfit** — mantém os títulos compactos e com impacto visual.
- **Sempre usar `<br>` manual em headlines** para controlar onde cada linha quebra. Nunca deixar o browser quebrar automaticamente — gera palavras isoladas ("órfãs") que destroem o ritmo visual. Verificar se nenhuma linha ficou com uma única palavra e se os comprimentos são parecidos entre si.
- **Máximo 2 pesos tipográficos visualmente distintos por slide de capa.** Nunca misturar 3 tamanhos/pesos diferentes.

---

## Cores — Regras de Uso

### Paleta principal

| Token | Valor | Uso |
|-------|-------|-----|
| Background primário | `#000000` | Fundo padrão |
| Background secundário | `#111111` | Variação de fundo, inputs |
| Background card | `#1A1A1A` | Cards e painéis |
| Border padrão | `#262626` | Bordas de cards, inputs |
| Border hover | `#404040` | Bordas ao passar o mouse |
| Texto principal | `#FFFFFF` | Headlines, títulos |
| Texto secundário | `rgba(255,255,255,0.50)` | Body text, parágrafos |
| Texto muted | `rgba(255,255,255,0.35)` | Rodapés, hints |

### Cores de destaque

| Cor | Valor | Quando usar | Restrições |
|-----|-------|-------------|------------|
| **Brand Primary (índigo)** | `#3B37FF` | Botões CTA, um único elemento de destaque por slide | PONTUALMENTE — nunca em grandes áreas sobre fundo escuro. Nunca como barra/linha decorativa. |
| **Brand Primary Hover** | `#6560FF` | Hover de botões e links | Somente em estados interativos |
| **Vermelho** | `#ef4444` | Palavras-chave negativas, ícones ✗, listas de problemas, números alarmantes | Alertas e negativos apenas |
| **Verde** | `#22c55e` | Ícones ✓, listas de benefícios, resultados positivos | Positivos e sucesso apenas |
| **Azul (accent)** | `#3b82f6` | Palavras em destaque no meio de uma frase (uso sutil), links | Highlights pontuais em texto |
| **Warning** | `#f59e0b` | Avisos, atenção | Usar com moderação |

### Sistema de opacidades de texto

Em vez de cores diferentes, a hierarquia de texto é construída via `rgba(255,255,255,X)`:

| Nível | Valor | Uso |
|-------|-------|-----|
| Primário | `#ffffff` / 100% | Headlines, títulos |
| Destaque em frase | `rgba(255,255,255,0.85)` + weight 600 | Palavra-chave dentro de body text |
| Badge / label | `rgba(255,255,255,0.75)` | Badge "Arrasta", labels pequenos |
| Secundário | `rgba(255,255,255,0.50)` | Body text, parágrafos |
| Terciário | `rgba(255,255,255,0.35–0.40)` | Progress label, subtexto |
| Muito suave | `rgba(255,255,255,0.25–0.30)` | Rodapés, hints |

### Caixas de destaque — tabela de cores

| Tipo | Background | Border |
|------|-----------|--------|
| Azul/brand (dado positivo, info) | `rgba(59,55,255,0.08–0.10)` | `1px solid rgba(59,55,255,0.25–0.30)` |
| Vermelho (problema, alerta) | `rgba(239,68,68,0.15)` | `1px solid rgba(239,68,68,0.40)` |
| Verde (resultado, benefício) | `rgba(34,197,94,0.07)` | `1px solid rgba(34,197,94,0.2)` |

### Escala de índigo (primitivas)

Para gradientes, hovers e variações sutis:

| Step | Valor |
|------|-------|
| 50 | #EEEDFF |
| 100 | #D8D6FF |
| 200 | #B5B2FF |
| 300 | #8D89FF |
| 400 | #6560FF |
| 500 | #3B37FF (primária) |
| 600 | #2F2BCC |
| 700 | #232099 |
| 800 | #181566 |
| 900 | #0C0A33 |
| 950 | #06051A |

---

## Landing Pages

Todas as seções usam fundo `#000000`, fonte display `Outfit`, fonte body `Inter`, cor primária `#3B37FF`. HTML pronto para copiar e colar.

### Hero Section

<!-- Dimensão: largura total (100vw), altura mínima 100vh -->

```html
<section style="min-height:100vh;background:#000000;display:flex;align-items:center;justify-content:center;padding:80px 24px;position:relative;overflow:hidden;">
  <!-- Glow decorativo sutil -->
  <div style="position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:600px;height:600px;background:radial-gradient(circle,rgba(59,55,255,0.12) 0%,transparent 70%);pointer-events:none;"></div>

  <div style="max-width:800px;text-align:center;position:relative;z-index:1;">
    <!-- Label -->
    <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:600;color:rgba(255,255,255,0.75);letter-spacing:0.04em;text-transform:uppercase;">Plataforma de cursos online</span>

    <!-- Headline -->
    <h1 style="font-family:'Outfit',sans-serif;font-size:56px;font-weight:600;line-height:1.02;letter-spacing:-0.02em;color:#ffffff;margin:24px 0 0;">
      Tudo que você precisa<br>para vender cursos online
    </h1>

    <!-- Subtítulo -->
    <p style="font-family:'Inter',sans-serif;font-size:18px;font-weight:400;line-height:1.65;color:rgba(255,255,255,0.50);margin:20px auto 0;max-width:560px;">
      A plataforma completa para criar, vender e escalar seu negócio de educação digital. Sem complicação, sem código.
    </p>

    <!-- CTA buttons -->
    <div style="display:flex;gap:16px;justify-content:center;margin-top:40px;flex-wrap:wrap;">
      <a href="#" style="display:inline-flex;align-items:center;padding:14px 32px;background:#3B37FF;border-radius:999px;text-decoration:none;">
        <span style="font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#fff;letter-spacing:0.04em;">Começar agora</span>
      </a>
      <a href="#" style="display:inline-flex;align-items:center;padding:14px 32px;background:transparent;border:1px solid rgba(255,255,255,0.2);border-radius:999px;text-decoration:none;">
        <span style="font-family:'Inter',sans-serif;font-size:13px;font-weight:500;color:#fff;">Ver demonstração</span>
      </a>
    </div>
  </div>
</section>
```

**Regras de layout:**
- Headline centralizado, máximo 2 linhas com `<br>` manual
- Subtítulo com `max-width:560px` para manter legibilidade
- Glow decorativo sutil no topo — nunca agressivo
- Botão primário (`#3B37FF` sólido) + botão secundário (borda translúcida)

### Features Grid

<!-- Dimensão: largura total, padding vertical 80px -->

```html
<section style="background:#000000;padding:80px 24px;">
  <div style="max-width:1100px;margin:0 auto;">
    <!-- Título da seção -->
    <div style="text-align:center;margin-bottom:64px;">
      <h2 style="font-family:'Outfit',sans-serif;font-size:44px;font-weight:400;line-height:1.02;letter-spacing:-0.01em;color:#ffffff;margin:0;">
        Tudo em um só lugar
      </h2>
      <p style="font-family:'Inter',sans-serif;font-size:16px;font-weight:400;line-height:1.65;color:rgba(255,255,255,0.50);margin:16px auto 0;max-width:480px;">
        Funcionalidades integradas para cada etapa do seu negócio educacional.
      </p>
    </div>

    <!-- Grid 3 colunas -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;">
      <!-- Card 1 -->
      <div style="background:#1A1A1A;border:1px solid #262626;border-radius:14px;padding:24px;">
        <div style="width:40px;height:40px;border-radius:10px;background:rgba(59,55,255,0.08);border:1px solid rgba(59,55,255,0.28);display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B37FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        </div>
        <h3 style="font-family:'Inter',sans-serif;font-size:18px;font-weight:500;line-height:1.3;color:#ffffff;margin:0 0 8px;">Área de membros</h3>
        <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:400;line-height:1.6;color:rgba(255,255,255,0.50);margin:0;">
          Ambiente completo para seus alunos, com progresso, certificados e comunidade integrada.
        </p>
      </div>

      <!-- Card 2 -->
      <div style="background:#1A1A1A;border:1px solid #262626;border-radius:14px;padding:24px;">
        <div style="width:40px;height:40px;border-radius:10px;background:rgba(59,55,255,0.08);border:1px solid rgba(59,55,255,0.28);display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B37FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        </div>
        <h3 style="font-family:'Inter',sans-serif;font-size:18px;font-weight:500;line-height:1.3;color:#ffffff;margin:0 0 8px;">Checkout integrado</h3>
        <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:400;line-height:1.6;color:rgba(255,255,255,0.50);margin:0;">
          Pagamentos sem fricção. Pix, cartão e boleto com checkout transparente e otimizado para conversão.
        </p>
      </div>

      <!-- Card 3 -->
      <div style="background:#1A1A1A;border:1px solid #262626;border-radius:14px;padding:24px;">
        <div style="width:40px;height:40px;border-radius:10px;background:rgba(59,55,255,0.08);border:1px solid rgba(59,55,255,0.28);display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B37FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0022 16z"/></svg>
        </div>
        <h3 style="font-family:'Inter',sans-serif;font-size:18px;font-weight:500;line-height:1.3;color:#ffffff;margin:0 0 8px;">Inteligência artificial</h3>
        <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:400;line-height:1.6;color:rgba(255,255,255,0.50);margin:0;">
          IA nativa para criar conteúdo, gerar quizzes e personalizar a experiência do aluno automaticamente.
        </p>
      </div>
    </div>
  </div>
</section>
```

**Regras de layout:**
- Grid de 3 colunas no desktop, stack no mobile
- Ícone em caixa com fundo `rgba(59,55,255,0.08)` e borda `rgba(59,55,255,0.28)`
- Cards com fundo `#1A1A1A`, borda `#262626`, border-radius `14px`
- Para responsivo, adicionar `@media (max-width:768px) { grid-template-columns:1fr; }` em `<style>`

### Social Proof / Stats

<!-- Dimensão: largura total, padding vertical 80px -->

```html
<section style="background:#0a0a0a;padding:80px 24px;">
  <div style="max-width:900px;margin:0 auto;">
    <!-- Stats grid -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:48px;text-align:center;">
      <!-- Stat 1 -->
      <div>
        <span style="font-family:'Outfit',sans-serif;font-size:56px;font-weight:600;line-height:1.02;letter-spacing:-0.02em;color:#ffffff;">4.9</span>
        <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:400;line-height:1.6;color:rgba(255,255,255,0.50);margin:8px 0 0;">Nota média no Google</p>
      </div>

      <!-- Stat 2 -->
      <div>
        <span style="font-family:'Outfit',sans-serif;font-size:56px;font-weight:600;line-height:1.02;letter-spacing:-0.02em;color:#ffffff;">10k+</span>
        <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:400;line-height:1.6;color:rgba(255,255,255,0.50);margin:8px 0 0;">Criadores de cursos</p>
      </div>

      <!-- Stat 3 -->
      <div>
        <span style="font-family:'Outfit',sans-serif;font-size:56px;font-weight:600;line-height:1.02;letter-spacing:-0.02em;color:#ffffff;">99.9%</span>
        <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:400;line-height:1.6;color:rgba(255,255,255,0.50);margin:8px 0 0;">Uptime garantido</p>
      </div>
    </div>

    <!-- Divider -->
    <div style="height:1px;background:#262626;margin:64px 0;"></div>

    <!-- Depoimento -->
    <div style="text-align:center;">
      <p style="font-family:'Inter',sans-serif;font-size:18px;font-weight:400;line-height:1.65;color:rgba(255,255,255,0.85);font-style:italic;max-width:600px;margin:0 auto;">
        "A Ensinio transformou completamente a forma como entrego meus cursos. Meus alunos ficam até o fim."
      </p>
      <p style="font-family:'Inter',sans-serif;font-size:13px;font-weight:500;color:rgba(255,255,255,0.50);margin:16px 0 0;">— Nome do Cliente, cargo</p>
    </div>
  </div>
</section>
```

**Regras de layout:**
- Números em Outfit 600 (são impactos isolados — peso 600 permitido)
- Fundo `#0a0a0a` para variação sutil em relação ao `#000000`
- Depoimentos em itálico com opacidade 0.85 (nível destaque)

### CTA Section

<!-- Dimensão: largura total, padding vertical 80px -->

```html
<section style="background:#000000;padding:80px 24px;position:relative;overflow:hidden;">
  <!-- Glow de fundo -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:500px;height:500px;background:radial-gradient(circle,rgba(59,55,255,0.10) 0%,transparent 65%);pointer-events:none;"></div>

  <div style="max-width:600px;margin:0 auto;text-align:center;position:relative;z-index:1;">
    <h2 style="font-family:'Outfit',sans-serif;font-size:44px;font-weight:400;line-height:1.02;letter-spacing:-0.01em;color:#ffffff;margin:0;">
      Pronto para escalar<br>seu negócio educacional?
    </h2>
    <p style="font-family:'Inter',sans-serif;font-size:16px;font-weight:400;line-height:1.65;color:rgba(255,255,255,0.50);margin:20px 0 0;">
      Comece grátis. Sem cartão de crédito. Sem complicação.
    </p>
    <div style="margin-top:32px;">
      <a href="#" style="display:inline-flex;align-items:center;padding:14px 32px;background:#3B37FF;border-radius:999px;text-decoration:none;">
        <span style="font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#fff;letter-spacing:0.04em;">Começar agora</span>
      </a>
    </div>
    <p style="font-family:'Inter',sans-serif;font-size:12px;color:rgba(255,255,255,0.25);margin:16px 0 0;">ensinio.com</p>
  </div>
</section>
```

### Pricing Card

<!-- Dimensão: cards de ~350px de largura -->

```html
<section style="background:#000000;padding:80px 24px;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:48px;">
      <h2 style="font-family:'Outfit',sans-serif;font-size:44px;font-weight:400;line-height:1.02;letter-spacing:-0.01em;color:#ffffff;margin:0;">Planos</h2>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1050px;margin:0 auto;">
      <!-- Plano Básico -->
      <div style="background:#1A1A1A;border:1px solid #262626;border-radius:14px;padding:32px 24px;display:flex;flex-direction:column;">
        <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:600;color:rgba(255,255,255,0.75);letter-spacing:0.04em;text-transform:uppercase;">Básico</span>
        <div style="margin:16px 0 24px;">
          <span style="font-family:'Outfit',sans-serif;font-size:44px;font-weight:600;line-height:1.02;color:#ffffff;">R$97</span>
          <span style="font-family:'Inter',sans-serif;font-size:13px;color:rgba(255,255,255,0.35);">/mês</span>
        </div>
        <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:400;line-height:1.6;color:rgba(255,255,255,0.50);margin:0 0 24px;">Para quem está começando a vender cursos online.</p>
        <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:32px;flex:1;">
          <div style="display:flex;align-items:center;gap:10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);">Até 500 alunos</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);">Checkout integrado</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);">Suporte por e-mail</span>
          </div>
        </div>
        <a href="#" style="display:flex;align-items:center;justify-content:center;padding:14px 32px;background:transparent;border:1px solid rgba(255,255,255,0.2);border-radius:999px;text-decoration:none;">
          <span style="font-family:'Inter',sans-serif;font-size:13px;font-weight:500;color:#fff;">Escolher plano</span>
        </a>
      </div>

      <!-- Plano Pro (destaque) -->
      <div style="background:#1A1A1A;border:1px solid rgba(59,55,255,0.30);border-radius:14px;padding:32px 24px;display:flex;flex-direction:column;position:relative;">
        <div style="position:absolute;top:-1px;left:50%;transform:translateX(-50%);padding:4px 16px;background:#3B37FF;border-radius:0 0 8px 8px;">
          <span style="font-family:'Inter',sans-serif;font-size:10px;font-weight:600;color:#fff;letter-spacing:0.06em;text-transform:uppercase;">Popular</span>
        </div>
        <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:600;color:rgba(255,255,255,0.75);letter-spacing:0.04em;text-transform:uppercase;">Pro</span>
        <div style="margin:16px 0 24px;">
          <span style="font-family:'Outfit',sans-serif;font-size:44px;font-weight:600;line-height:1.02;color:#ffffff;">R$197</span>
          <span style="font-family:'Inter',sans-serif;font-size:13px;color:rgba(255,255,255,0.35);">/mês</span>
        </div>
        <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:400;line-height:1.6;color:rgba(255,255,255,0.50);margin:0 0 24px;">Para criadores que querem escalar com recursos avançados.</p>
        <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:32px;flex:1;">
          <div style="display:flex;align-items:center;gap:10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);">Alunos ilimitados</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);">IA integrada</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);">Suporte prioritário</span>
          </div>
        </div>
        <a href="#" style="display:flex;align-items:center;justify-content:center;padding:14px 32px;background:#3B37FF;border-radius:999px;text-decoration:none;">
          <span style="font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#fff;letter-spacing:0.04em;">Começar agora</span>
        </a>
      </div>

      <!-- Plano Enterprise -->
      <div style="background:#1A1A1A;border:1px solid #262626;border-radius:14px;padding:32px 24px;display:flex;flex-direction:column;">
        <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:600;color:rgba(255,255,255,0.75);letter-spacing:0.04em;text-transform:uppercase;">Enterprise</span>
        <div style="margin:16px 0 24px;">
          <span style="font-family:'Outfit',sans-serif;font-size:44px;font-weight:400;line-height:1.02;color:#ffffff;">Custom</span>
        </div>
        <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:400;line-height:1.6;color:rgba(255,255,255,0.50);margin:0 0 24px;">Para empresas e universidades corporativas.</p>
        <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:32px;flex:1;">
          <div style="display:flex;align-items:center;gap:10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);">Tudo do Pro</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);">White label</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);">Account manager dedicado</span>
          </div>
        </div>
        <a href="#" style="display:flex;align-items:center;justify-content:center;padding:14px 32px;background:transparent;border:1px solid rgba(255,255,255,0.2);border-radius:999px;text-decoration:none;">
          <span style="font-family:'Inter',sans-serif;font-size:13px;font-weight:500;color:#fff;">Falar com vendas</span>
        </a>
      </div>
    </div>
  </div>
</section>
```

**Regras de layout:**
- Plano destaque: borda `rgba(59,55,255,0.30)` + badge "Popular" no topo em `#3B37FF`
- Preços em Outfit 600 (números de impacto)
- Botão primário apenas no plano destaque, secundário nos outros
- Check icons em verde `#22c55e`

### Footer

<!-- Dimensão: largura total -->

```html
<footer style="background:#000000;border-top:1px solid #262626;padding:48px 24px 32px;">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:48px;margin-bottom:48px;">
      <!-- Logo + descrição -->
      <div style="max-width:280px;">
        <!-- Substituir pelo SVG do logo -->
        <div style="font-family:'Outfit',sans-serif;font-size:22px;font-weight:600;color:#ffffff;margin-bottom:16px;">ensinio</div>
        <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:400;line-height:1.6;color:rgba(255,255,255,0.50);margin:0;">
          A plataforma completa para criar, vender e escalar cursos online.
        </p>
      </div>

      <!-- Links coluna 1 -->
      <div>
        <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:600;color:rgba(255,255,255,0.75);letter-spacing:0.04em;text-transform:uppercase;display:block;margin-bottom:16px;">Produto</span>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <a href="#" style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);text-decoration:none;">Funcionalidades</a>
          <a href="#" style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);text-decoration:none;">Preços</a>
          <a href="#" style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);text-decoration:none;">Integrações</a>
        </div>
      </div>

      <!-- Links coluna 2 -->
      <div>
        <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:600;color:rgba(255,255,255,0.75);letter-spacing:0.04em;text-transform:uppercase;display:block;margin-bottom:16px;">Empresa</span>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <a href="#" style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);text-decoration:none;">Sobre</a>
          <a href="#" style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);text-decoration:none;">Blog</a>
          <a href="#" style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);text-decoration:none;">Carreiras</a>
        </div>
      </div>

      <!-- Links coluna 3 -->
      <div>
        <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:600;color:rgba(255,255,255,0.75);letter-spacing:0.04em;text-transform:uppercase;display:block;margin-bottom:16px;">Suporte</span>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <a href="#" style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);text-decoration:none;">Central de ajuda</a>
          <a href="#" style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);text-decoration:none;">Contato</a>
          <a href="#" style="font-family:'Inter',sans-serif;font-size:14px;color:rgba(255,255,255,0.50);text-decoration:none;">Status</a>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div style="border-top:1px solid #262626;padding-top:24px;display:flex;justify-content:space-between;align-items:center;">
      <span style="font-family:'Inter',sans-serif;font-size:13px;color:rgba(255,255,255,0.25);">© 2026 Ensinio. Todos os direitos reservados.</span>
      <div style="display:flex;gap:20px;">
        <a href="#" style="font-family:'Inter',sans-serif;font-size:13px;color:rgba(255,255,255,0.25);text-decoration:none;">Privacidade</a>
        <a href="#" style="font-family:'Inter',sans-serif;font-size:13px;color:rgba(255,255,255,0.25);text-decoration:none;">Termos</a>
      </div>
    </div>
  </div>
</footer>
```

### Layout Rules (Landing Pages)

| Regra | Valor |
|-------|-------|
| Max-width do conteúdo | 1100px |
| Padding de seção (vertical) | 80px |
| Padding lateral mínimo | 24px |
| Gap entre cards | 24px |
| Espaço entre seção title e conteúdo | 48–64px |
| Border-radius de cards | 14px |
| Border-radius de botões | 999px (pill) |
| Variação de fundo entre seções | `#000000` e `#0a0a0a` alternando |

**Do:**
- Alternar fundos entre seções (`#000` / `#0a0a0a`) para criar ritmo visual
- Usar glow radial sutil de `rgba(59,55,255,0.10)` como elemento decorativo
- Manter headlines com `<br>` manual
- Usar `max-width` em parágrafos para limitar a 560–600px

**Don't:**
- Nunca usar `#3B37FF` como fundo de seção inteira
- Nunca usar gradientes coloridos chamativos
- Nunca ultrapassar 2 CTAs por seção
- Nunca misturar mais de 2 pesos tipográficos por bloco visual

---

## Instagram

### Carrossel (1080x1350px)

<!-- Dimensão: 1080 x 1350px — proporção 4:5, padrão Instagram portrait -->
<!-- Quantidade por carrossel: 5–8 slides -->
<!-- Margem interna segura: 60px em todos os lados -->

#### Estrutura padrão de carrossel

| Slide | Nome | Função |
|-------|------|--------|
| 1 | Cover | Headline gancho + imagem de impacto + logo |
| 2 | Problema | Aprofunda a dor ou situação |
| 3–5 | Conteúdo | Lista, storytelling, solução, prova social |
| 6 | CTA | Chamada para ação + logo + "ensinio.com" |

#### Layouts de capa (Slide 1)

**Variante A — Alinhado à esquerda (padrão)**

Conteúdo alinhado à esquerda. Funciona bem com fundos escuros sólidos ou quando a foto tem elemento forte à direita.

```html
<!-- Slide 1 — Variante A: Alinhado à esquerda (1080x1350px) -->
<div style="width:1080px;height:1350px;background:#000000;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;text-align:left;padding:80px 36px 60px;">
  <!-- Logo -->
  <div style="position:absolute;top:22px;left:0;right:0;display:flex;justify-content:center;z-index:5;">
    <!-- Inserir SVG do logo aqui -->
    <div style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:600;color:#fff;letter-spacing:0.02em;">ensinio</div>
  </div>

  <!-- Conteúdo (z-index:2) -->
  <div style="position:relative;z-index:2;">
    <h1 style="font-family:'Outfit',sans-serif;font-size:44px;font-weight:400;line-height:1.02;letter-spacing:-0.5px;color:#ffffff;margin:0;">
      Seu checkout está<br>espantando alunos?
    </h1>
    <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:400;line-height:1.65;color:rgba(255,255,255,0.50);margin:22px 0 0;max-width:380px;">
      Descubra por que 64% dos alunos desistem antes de finalizar a compra.
    </p>
  </div>

  <!-- Badge "Arrasta" -->
  <div style="margin-top:28px;display:inline-flex;padding:10px 20px;border:1.5px solid rgba(255,255,255,0.2);border-radius:999px;background:rgba(255,255,255,0.08);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);">
    <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:600;color:rgba(255,255,255,0.75);letter-spacing:0.1em;text-transform:uppercase;">Arrasta para ver por quê →</span>
  </div>

  <!-- Swipe arrow -->
  <div style="position:absolute;right:0;top:0;bottom:0;width:48px;z-index:9;display:flex;align-items:center;justify-content:center;background:linear-gradient(to right,transparent,rgba(255,255,255,0.05));pointer-events:none;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="rgba(255,255,255,0.3)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>

  <!-- Progress bar -->
  <div style="position:absolute;bottom:0;left:0;right:0;padding:14px 28px 18px;z-index:10;display:flex;align-items:center;gap:10px;">
    <div style="flex:1;height:3px;border-radius:2px;overflow:hidden;background:rgba(255,255,255,0.1);">
      <div style="width:20%;height:100%;border-radius:2px;background:#fff;"></div>
    </div>
    <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:500;color:rgba(255,255,255,0.35);">1/5</span>
  </div>
</div>
```

**Variante B — Centralizado (com foto de fundo)**

Preferida quando há fotografia de fundo. Headline no topo, imagem respira no centro-inferior.

```html
<!-- Slide 1 — Variante B: Centralizado com foto (1080x1350px) -->
<div style="width:1080px;height:1350px;background:#000 url('cover-photo.png') center 70% / cover no-repeat;position:relative;overflow:hidden;">
  <!-- Overlay -->
  <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 32%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.40) 100%);z-index:1;"></div>

  <!-- Logo -->
  <div style="position:absolute;top:22px;left:0;right:0;display:flex;justify-content:center;z-index:5;">
    <div style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:600;color:#fff;letter-spacing:0.02em;">ensinio</div>
  </div>

  <!-- Conteúdo (topo) -->
  <div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center;padding:72px 48px 0;">
    <h1 style="font-family:'Outfit',sans-serif;font-size:38px;font-weight:600;line-height:1.02;color:#ffffff;margin:0;max-width:500px;">
      64,1% dos seus alunos<br>desistem no checkout
    </h1>
    <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:400;line-height:1.65;color:rgba(255,255,255,0.50);margin:18px 0 0;max-width:400px;">
      E você nem sabe por quê.
    </p>
  </div>

  <!-- Badge "Arrasta" (absoluto, sobre a foto) -->
  <div style="position:absolute;bottom:52px;left:0;right:0;display:flex;justify-content:center;z-index:6;">
    <div style="display:inline-flex;padding:10px 20px;border:1.5px solid rgba(255,255,255,0.2);border-radius:999px;background:rgba(255,255,255,0.08);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);">
      <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:600;color:rgba(255,255,255,0.75);letter-spacing:0.1em;text-transform:uppercase;">Arrasta para ver por quê →</span>
    </div>
  </div>

  <!-- Swipe arrow -->
  <div style="position:absolute;right:0;top:0;bottom:0;width:48px;z-index:9;display:flex;align-items:center;justify-content:center;background:linear-gradient(to right,transparent,rgba(255,255,255,0.05));pointer-events:none;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="rgba(255,255,255,0.3)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>

  <!-- Progress bar -->
  <div style="position:absolute;bottom:0;left:0;right:0;padding:14px 28px 18px;z-index:10;display:flex;align-items:center;gap:10px;">
    <div style="flex:1;height:3px;border-radius:2px;overflow:hidden;background:rgba(255,255,255,0.1);">
      <div style="width:20%;height:100%;border-radius:2px;background:#fff;"></div>
    </div>
    <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:500;color:rgba(255,255,255,0.35);">1/5</span>
  </div>
</div>
```

**Regras da Variante B:**
- Headline centralizado no topo, máximo 2 linhas — fonte 34–40px Outfit 600
- Nunca ultrapassar 40–45% da altura do slide com texto quando há foto
- Overlay escuro no topo para texto, abre no centro para revelar imagem
- Máximo 2 elementos textuais no slide (excluindo logo)
- Número isolado sem contexto é ilegível — incorporar na frase

**Variante C — Texto no topo, imagem com foco centro-inferior**

Usar quando a foto tem ponto focal no centro-inferior. Texto compacto no topo, imagem respira.

```html
<!-- Slide 1 — Variante C: Texto topo + foto inferior (1080x1350px) -->
<div style="width:1080px;height:1350px;background:#000 url('cover-photo.png') center 75% / cover no-repeat;position:relative;overflow:hidden;">
  <!-- Overlay -->
  <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 32%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.40) 100%);z-index:1;"></div>

  <!-- Logo -->
  <div style="position:absolute;top:22px;left:0;right:0;display:flex;justify-content:center;z-index:5;">
    <div style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:600;color:#fff;letter-spacing:0.02em;">ensinio</div>
  </div>

  <!-- Conteúdo (topo, sem padding inferior) -->
  <div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;padding:72px 48px 0;">
    <h1 style="font-family:'Outfit',sans-serif;font-size:32px;font-weight:400;line-height:1.02;color:#ffffff;margin:0;max-width:500px;">
      Seus alunos estão desistindo<br>antes de terminar o curso
    </h1>
  </div>

  <!-- Badge "Arrasta" (absoluto) -->
  <div style="position:absolute;bottom:52px;left:0;right:0;display:flex;justify-content:center;z-index:6;">
    <div style="display:inline-flex;padding:10px 20px;border:1.5px solid rgba(255,255,255,0.2);border-radius:999px;background:rgba(255,255,255,0.08);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);">
      <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:600;color:rgba(255,255,255,0.75);letter-spacing:0.1em;text-transform:uppercase;">Arrasta para ver por quê →</span>
    </div>
  </div>

  <!-- Swipe arrow -->
  <div style="position:absolute;right:0;top:0;bottom:0;width:48px;z-index:9;display:flex;align-items:center;justify-content:center;background:linear-gradient(to right,transparent,rgba(255,255,255,0.05));pointer-events:none;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="rgba(255,255,255,0.3)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>

  <!-- Progress bar -->
  <div style="position:absolute;bottom:0;left:0;right:0;padding:14px 28px 18px;z-index:10;display:flex;align-items:center;gap:10px;">
    <div style="flex:1;height:3px;border-radius:2px;overflow:hidden;background:rgba(255,255,255,0.1);">
      <div style="width:20%;height:100%;border-radius:2px;background:#fff;"></div>
    </div>
    <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:500;color:rgba(255,255,255,0.35);">1/5</span>
  </div>
</div>
```

**Regras da Variante C:**
- Headline único, Outfit 400, 26–36px, máximo 3 linhas
- Sem parágrafo de apoio, sem CTA button — a imagem e o headline falam sozinhos
- `object-position: center 75%` puxa o foco da imagem para baixo

#### Slide interno (slides 2–4)

Padrão para slides de conteúdo (problema, detalhe, dados). Conteúdo ancora na base, headline sobe naturalmente.

```html
<!-- Slide interno — Conteúdo (1080x1350px) -->
<div style="width:1080px;height:1350px;background:#0a0a0a;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;padding:36px 36px 58px;">
  <!-- Conteúdo -->
  <div style="position:relative;z-index:2;">
    <h2 style="font-family:'Outfit',sans-serif;font-size:42px;font-weight:400;line-height:1.02;letter-spacing:-0.5px;color:#ffffff;margin:0;">
      O problema não é<br>o seu conteúdo
    </h2>
    <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:400;line-height:1.65;color:rgba(255,255,255,0.50);margin:18px 0 0;max-width:420px;">
      A maioria dos criadores de cursos perde alunos porque a experiência de compra é confusa, lenta e cheia de fricção. O conteúdo pode ser excelente, mas se o checkout espanta, ninguém chega a ver.
    </p>

    <!-- Caixa de destaque (opcional) -->
    <div style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.40);border-radius:12px;padding:16px 20px;margin-top:20px;max-width:420px;">
      <p style="font-family:'Inter',sans-serif;font-size:13px;font-weight:500;color:#ef4444;margin:0;">64% dos checkouts são abandonados antes do pagamento</p>
    </div>
  </div>

  <!-- Swipe arrow -->
  <div style="position:absolute;right:0;top:0;bottom:0;width:48px;z-index:9;display:flex;align-items:center;justify-content:center;background:linear-gradient(to right,transparent,rgba(255,255,255,0.05));pointer-events:none;">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="rgba(255,255,255,0.3)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>

  <!-- Progress bar -->
  <div style="position:absolute;bottom:0;left:0;right:0;padding:14px 28px 18px;z-index:10;display:flex;align-items:center;gap:10px;">
    <div style="flex:1;height:3px;border-radius:2px;overflow:hidden;background:rgba(255,255,255,0.1);">
      <div style="width:40%;height:100%;border-radius:2px;background:#fff;"></div>
    </div>
    <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:500;color:rgba(255,255,255,0.35);">2/5</span>
  </div>
</div>
```

**Regras dos slides internos:**
- Fundo sólido escuro: `#000000`, `#0a0a0a` ou `#0d0d0d` (variação mínima entre slides — evita monotonia)
- Headline em Outfit 400, 40–44px, `line-height:1.02`, `letter-spacing:-0.5px` a `-1px`
- Body text em Inter 400, 14px, `line-height:1.65`, `color:rgba(255,255,255,0.5)`
- `margin-bottom` entre elementos: 12–22px dependendo da densidade

#### Slide de encerramento (CTA final)

O último slide tem três elementos obrigatórios: headline-pergunta, body de reforço e botão de ação.

```html
<!-- Slide CTA final (1080x1350px) -->
<div style="width:1080px;height:1350px;background:#000000;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:80px 48px 60px;">
  <!-- Logo -->
  <div style="position:absolute;top:22px;left:0;right:0;display:flex;justify-content:center;z-index:5;">
    <div style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:600;color:#fff;letter-spacing:0.02em;">ensinio</div>
  </div>

  <!-- Conteúdo -->
  <div style="position:relative;z-index:2;">
    <h2 style="font-family:'Outfit',sans-serif;font-size:40px;font-weight:400;line-height:1.02;color:#ffffff;margin:0;max-width:500px;">
      Quer ver como seus alunos<br>chegam até o fim?
    </h2>
    <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:400;line-height:1.65;color:rgba(255,255,255,0.50);margin:20px 0 0;max-width:400px;">
      Descubra como a Ensinio transforma a experiência do seu curso.
    </p>

    <!-- Botão CTA -->
    <div style="margin-top:28px;">
      <div style="display:inline-flex;align-items:center;padding:14px 32px;background:#3B37FF;border-radius:999px;">
        <span style="font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#fff;letter-spacing:0.04em;">Começar agora</span>
      </div>
    </div>

    <!-- URL -->
    <p style="font-family:'Inter',sans-serif;font-size:12px;color:rgba(255,255,255,0.20);margin:14px 0 0;">ensinio.com</p>
  </div>

  <!-- Progress bar -->
  <div style="position:absolute;bottom:0;left:0;right:0;padding:14px 28px 18px;z-index:10;display:flex;align-items:center;gap:10px;">
    <div style="flex:1;height:3px;border-radius:2px;overflow:hidden;background:rgba(255,255,255,0.1);">
      <div style="width:100%;height:100%;border-radius:2px;background:#fff;"></div>
    </div>
    <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:500;color:rgba(255,255,255,0.35);">5/5</span>
  </div>
</div>
```

**Regras do slide CTA:**
- Headline: pergunta direta conectada ao tema — nunca afirmação sobre feature
- Padrão: "Quer ver [tema] funcionando no seu curso?"
- Botão: fundo sólido `#3B37FF`, nunca transparente. Texto fixo: "Começar agora"
- Rodapé discreto: `ensinio.com` em `font-size:12px; color:rgba(255,255,255,0.2)`
- Exemplos de headline por tema:
  - Evasão: "Quer ver como seus alunos chegam até o fim?"
  - Drip content: "Quer ver o drip content funcionando no seu curso?"
  - IA: "Quer ver o que a IA pode fazer pelo seu curso?"

### Post Único (1080x1080px)

<!-- Dimensão: 1080 x 1080px — quadrado Instagram -->

```html
<!-- Post único Instagram (1080x1080px) -->
<div style="width:1080px;height:1080px;background:#000000;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:80px 60px;">
  <!-- Logo -->
  <div style="position:absolute;top:22px;left:0;right:0;display:flex;justify-content:center;z-index:5;">
    <div style="font-family:'Outfit',sans-serif;font-size:18px;font-weight:600;color:#fff;letter-spacing:0.02em;">ensinio</div>
  </div>

  <!-- Conteúdo -->
  <div style="position:relative;z-index:2;">
    <h1 style="font-family:'Outfit',sans-serif;font-size:48px;font-weight:400;line-height:1.02;letter-spacing:-0.5px;color:#ffffff;margin:0;">
      Seu curso merece<br>uma plataforma à altura
    </h1>
    <p style="font-family:'Inter',sans-serif;font-size:16px;font-weight:400;line-height:1.65;color:rgba(255,255,255,0.50);margin:20px 0 0;max-width:460px;">
      Tudo integrado: área de membros, checkout, IA e comunidade.
    </p>
  </div>

  <!-- URL rodapé -->
  <div style="position:absolute;bottom:28px;left:0;right:0;text-align:center;">
    <span style="font-family:'Inter',sans-serif;font-size:12px;color:rgba(255,255,255,0.20);">ensinio.com</span>
  </div>
</div>
```

**Regras de layout:**
- Proporção 1:1 (1080x1080px)
- Headline menor que no carrossel (48px vs 72–96px) por causa da altura reduzida
- Safe area: 60px em todos os lados
- Logo no topo, URL discreta no rodapé
- Sem progress bar nem swipe arrow

### Stories (1080x1920px)

<!-- Dimensão: 1080 x 1920px — formato 9:16 vertical -->

```html
<!-- Story Instagram (1080x1920px) -->
<div style="width:1080px;height:1920px;background:#000000;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:120px 60px;">
  <!-- Logo -->
  <div style="position:absolute;top:80px;left:0;right:0;display:flex;justify-content:center;z-index:5;">
    <div style="font-family:'Outfit',sans-serif;font-size:20px;font-weight:600;color:#fff;letter-spacing:0.02em;">ensinio</div>
  </div>

  <!-- Conteúdo -->
  <div style="position:relative;z-index:2;">
    <!-- Número de impacto (opcional) -->
    <span style="font-family:'Outfit',sans-serif;font-size:96px;font-weight:600;line-height:1.02;color:#ffffff;">64%</span>

    <h1 style="font-family:'Outfit',sans-serif;font-size:40px;font-weight:400;line-height:1.02;color:#ffffff;margin:24px 0 0;">
      dos alunos desistem<br>antes de terminar
    </h1>

    <p style="font-family:'Inter',sans-serif;font-size:16px;font-weight:400;line-height:1.65;color:rgba(255,255,255,0.50);margin:20px 0 0;max-width:460px;">
      Descubra como mudar essa história.
    </p>
  </div>

  <!-- CTA (perto do swipe-up zone) -->
  <div style="position:absolute;bottom:160px;left:0;right:0;display:flex;justify-content:center;z-index:5;">
    <div style="display:inline-flex;align-items:center;padding:14px 32px;background:#3B37FF;border-radius:999px;">
      <span style="font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#fff;letter-spacing:0.04em;">Saiba mais</span>
    </div>
  </div>
</div>
```

**Regras de layout:**
- Safe area: 80px no topo (barra de status), 160px na base (swipe-up zone)
- Headline maior que no post (40px) — mais espaço vertical disponível
- Número de impacto: Outfit 600, 96px (hero stat)
- CTA posicionado a 160px do bottom para ficar acima do swipe-up nativo
- Logo posicionado a 80px do topo para evitar barra de status

---

## YouTube

### Thumbnail (1280x720px)

<!-- Dimensão: 1280 x 720px — proporção 16:9 -->

```html
<!-- Thumbnail YouTube (1280x720px) -->
<div style="width:1280px;height:720px;background:#000 url('thumbnail-bg.png') center/cover no-repeat;position:relative;overflow:hidden;">
  <!-- Overlay -->
  <div style="position:absolute;inset:0;background:linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.40) 50%, transparent 100%);z-index:1;"></div>

  <!-- Conteúdo (esquerda) -->
  <div style="position:relative;z-index:2;display:flex;flex-direction:column;justify-content:center;height:100%;padding:40px 60px;max-width:640px;">
    <h1 style="font-family:'Outfit',sans-serif;font-size:64px;font-weight:600;line-height:1.02;letter-spacing:-1px;color:#ffffff;margin:0;text-shadow:0 2px 12px rgba(0,0,0,0.5);">
      POR QUE<br>DESISTEM?
    </h1>
    <!-- Highlight badge (opcional) -->
    <div style="margin-top:16px;display:inline-flex;padding:8px 18px;background:#3B37FF;border-radius:8px;align-self:flex-start;">
      <span style="font-family:'Inter',sans-serif;font-size:18px;font-weight:600;color:#fff;">64% de evasão</span>
    </div>
  </div>
</div>
```

**Regras de layout:**
- Máximo 5 palavras no headline — legibilidade em tela pequena é prioridade
- Alto contraste: texto branco com text-shadow sobre overlay escuro
- Overlay gradiente da esquerda (texto) para a direita (foto)
- Headline em CAPS para impacto (exceção à regra normal)
- Badge pode usar `#3B37FF` como fundo (único caso de área maior com brand primary)
- Peso 600 permitido no headline (números de impacto ou CAPS)
- Fonte mínima: 48px — abaixo disso fica ilegível na miniatura

### Banner (2560x1440px)

<!-- Dimensão: 2560 x 1440px — safe area central: 1546 x 423px -->

```html
<!-- Banner YouTube (2560x1440px) -->
<div style="width:2560px;height:1440px;background:#000000;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;">
  <!-- Glow decorativo -->
  <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:800px;height:800px;background:radial-gradient(circle,rgba(59,55,255,0.08) 0%,transparent 60%);pointer-events:none;"></div>

  <!-- Conteúdo (safe area central) -->
  <div style="position:relative;z-index:2;text-align:center;max-width:1200px;padding:0 40px;">
    <div style="font-family:'Outfit',sans-serif;font-size:28px;font-weight:600;color:#fff;letter-spacing:0.02em;margin-bottom:16px;">ensinio</div>
    <h1 style="font-family:'Outfit',sans-serif;font-size:48px;font-weight:400;line-height:1.02;letter-spacing:-0.5px;color:#ffffff;margin:0;">
      A plataforma completa para cursos online
    </h1>
    <p style="font-family:'Inter',sans-serif;font-size:18px;font-weight:400;line-height:1.5;color:rgba(255,255,255,0.50);margin:12px 0 0;">
      Crie, venda e escale seu negócio educacional.
    </p>
  </div>
</div>
```

**Safe area do banner YouTube:**
- **Desktop:** 2560 x 423px (centralizado verticalmente)
- **Mobile:** 1546 x 423px (centralizado)
- **TV:** 2560 x 1440px (tudo visível)
- Manter todo conteúdo essencial dentro de 1546 x 423px no centro
- Glow e elementos decorativos podem extrapolar a safe area

---

## Fotografia e Imagem

### Fluxo de geração de imagem

Imagens de capa são geradas externamente pelo usuário. O fluxo é:

1. Claude gera um **prompt de imagem** otimizado para o tema do carrossel
2. Usuário gera a imagem externamente (Midjourney, Firefly, Gemini, etc.)
3. Usuário fornece o arquivo de imagem
4. Claude embute a imagem no HTML via caminho relativo

**Enquanto a imagem não estiver disponível:** usar fundo dark com gradiente CSS e o hero stat (número de impacto) como elemento visual principal.

### Formato do prompt para imagem de capa

```
Cinematic dark photography, [tema específico], dramatic side lighting, 
high contrast, deep shadows, moody atmosphere, professional editorial style, 
no text, no typography, portrait orientation 4:5
```

### Templates de prompt por tema

| Tema do carrossel | Prompt base |
|---|---|
| Evasão / abandono | empty classroom, abandoned workspace, dramatic shadows |
| Checkout / e-commerce | close-up hand holding smartphone, payment screen glow, dark background |
| Crescimento / resultado | person silhouette, city lights, dramatic backlight |
| IA / tecnologia | abstract glowing data connections, deep black background |
| Comunidade / pessoas | diverse crowd, dramatic stage lighting, urban environment |

### Referência de imagem no HTML

Sempre usar **caminho relativo** — a imagem fica na mesma pasta do HTML. **Nunca usar base64.**

```html
<!-- Background de slide (padrão) -->
<div style="background:#000 url('nome-da-imagem.png') center 70% / cover no-repeat;">

<!-- Alternativa via <img> com object-fit (para Variante C) -->
<img src="nome-da-imagem.png"
     style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 70%;z-index:0;">
```

### Estilo visual

- Cinematográfico, dramático, alto contraste
- Sempre escura — aplicar overlay dark para garantir legibilidade
- Temas recorrentes: multidões, ambientes urbanos, objetos simbólicos

### Overlay recomendado por situação

| Situação | Overlay |
|----------|---------|
| Imagem escura (já dramática) | `linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.32) 45%, rgba(0,0,0,0.60) 100%)` |
| Imagem mais clara | `rgba(0,0,0,0.65)` uniforme |
| Slide interno com foto | `rgba(0,0,0,0.55)` uniforme |
| Texto sobre foto (Variantes B e C) | `linear-gradient(to bottom, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.55) 32%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.40) 100%)` |

---

## Componentes (HTML Pronto)

### Botão primário (CTA)

```html
<div style="display:inline-flex;align-items:center;padding:14px 32px;background:#3B37FF;border-radius:999px;">
  <span style="font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#fff;letter-spacing:0.04em;">Começar agora</span>
</div>
```

### Botão secundário (outline)

```html
<div style="display:inline-flex;align-items:center;padding:14px 32px;background:transparent;border:1px solid rgba(255,255,255,0.2);border-radius:999px;">
  <span style="font-family:'Inter',sans-serif;font-size:13px;font-weight:500;color:#fff;">Ver demonstração</span>
</div>
```

### Card padrão

```html
<div style="background:#1A1A1A;border:1px solid #262626;border-radius:14px;padding:24px;">
  <h3 style="font-family:'Inter',sans-serif;font-size:18px;font-weight:500;line-height:1.3;color:#ffffff;margin:0 0 8px;">Título do card</h3>
  <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:400;line-height:1.6;color:rgba(255,255,255,0.50);margin:0;">Descrição do conteúdo do card.</p>
</div>
```

### Caixa de destaque — Brand (info, dado positivo)

```html
<div style="background:rgba(59,55,255,0.08);border:1px solid rgba(59,55,255,0.28);border-radius:12px;padding:16px 20px;">
  <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:500;color:#ffffff;margin:0;">Informação em destaque aqui.</p>
</div>
```

### Caixa de destaque — Vermelho (problema, alerta)

```html
<div style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.40);border-radius:12px;padding:16px 20px;">
  <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:500;color:#ef4444;margin:0;">Dado alarmante ou problema.</p>
</div>
```

### Caixa de destaque — Verde (resultado, benefício)

```html
<div style="background:rgba(34,197,94,0.07);border:1px solid rgba(34,197,94,0.2);border-radius:12px;padding:16px 20px;">
  <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:500;color:#22c55e;margin:0;">Resultado positivo ou benefício.</p>
</div>
```

### Ícone de lista — Positivo (verde)

```html
<div style="display:flex;align-items:flex-start;gap:14px;">
  <div style="min-width:30px;height:30px;border-radius:50%;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.35);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
  <div>
    <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:600;color:#fff;margin:0;">Título do item</p>
    <p style="font-family:'Inter',sans-serif;font-size:12px;color:rgba(255,255,255,0.38);margin-top:3px;line-height:1.5;">Descrição curta do benefício</p>
  </div>
</div>
```

### Ícone de lista — Negativo (vermelho)

```html
<div style="display:flex;align-items:flex-start;gap:14px;">
  <div style="min-width:30px;height:30px;border-radius:50%;background:rgba(239,68,68,0.20);border:1px solid rgba(239,68,68,0.55);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 2l8 8M10 2l-8 8" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
    </svg>
  </div>
  <div>
    <p style="font-family:'Inter',sans-serif;font-size:14px;font-weight:600;color:#fff;margin:0;">Título do problema</p>
    <p style="font-family:'Inter',sans-serif;font-size:12px;color:rgba(255,255,255,0.38);margin-top:2px;line-height:1.5;">Descrição curta do problema</p>
  </div>
</div>
```

### Badge "Arrasta para ver"

Presente em slides de capa — convite para continuar o carrossel.

```html
<div style="display:inline-flex;padding:10px 20px;border:1.5px solid rgba(255,255,255,0.2);border-radius:999px;background:rgba(255,255,255,0.08);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);">
  <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:600;color:rgba(255,255,255,0.75);letter-spacing:0.1em;text-transform:uppercase;">Arrasta para ver por quê →</span>
</div>
```

**Posicionamento:**
- Layout centralizado (`justify-content:center`): inline no fluxo, `margin-top:24-30px`
- Layout com foto (Variantes B/C): `position:absolute; bottom:52px; left:0; right:0; display:flex; justify-content:center; z-index:6`
- O `backdrop-filter:blur(2px)` garante legibilidade sobre foto — não remover
- Sempre acima da progress bar (que ocupa os últimos ~40px)
- Texto recorrente: "ARRASTA PARA VER POR QUÊ →" — ajustar conforme o contexto

### Logo (slides 1 e 5)

```html
<div style="position:absolute;top:22px;left:0;right:0;display:flex;justify-content:center;z-index:5;">
  <svg width="93" height="24" ...><!-- SVG do logo Ensinio --></svg>
</div>
```

- Sempre versão branca sobre fundos escuros
- Posição preferencial: topo centralizado ou rodapé centralizado
- Nunca alterar proporções ou cores

### Progress bar

```html
<div style="position:absolute;bottom:0;left:0;right:0;padding:14px 28px 18px;z-index:10;display:flex;align-items:center;gap:10px;">
  <div style="flex:1;height:3px;border-radius:2px;overflow:hidden;background:rgba(255,255,255,0.1);">
    <div style="width:20%;height:100%;border-radius:2px;background:#fff;transition:width 0.38s ease;"></div>
  </div>
  <span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:500;color:rgba(255,255,255,0.35);">1/5</span>
</div>
```

- `width` do fill: 20% para 1/5, 40% para 2/5, 60% para 3/5, 80% para 4/5, 100% para 5/5

### Swipe arrow (todos os slides exceto o último)

```html
<div style="position:absolute;right:0;top:0;bottom:0;width:48px;z-index:9;display:flex;align-items:center;justify-content:center;background:linear-gradient(to right,transparent,rgba(255,255,255,0.05));pointer-events:none;">
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M9 6l6 6-6 6" stroke="rgba(255,255,255,0.3)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</div>
```

### Indicadores de slide (dots)

```html
<div style="display:flex;gap:6px;justify-content:center;">
  <div style="width:6px;height:6px;border-radius:50%;background:#ffffff;"></div>
  <div style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.3);"></div>
  <div style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.3);"></div>
  <div style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.3);"></div>
  <div style="width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.3);"></div>
</div>
```

- Dot ativo: `#ffffff`
- Dots inativos: `rgba(255,255,255,0.3)`

### Input field

```html
<input type="text" placeholder="Seu e-mail" style="font-family:'Inter',sans-serif;font-size:14px;font-weight:400;color:#ffffff;background:#111111;border:1px solid #262626;border-radius:12px;padding:12px 16px;outline:none;width:100%;">
```

---

## Tom de Voz

- **Direto, provocador, sem rodeios** — foco na dor ou no desejo do criador de cursos
- Usa dados e números para credibilidade
- Frases curtas no headline, mais denso nos slides internos
- Nunca genérico. Sempre situação específica do público

### Restrições de pontuação

- **Nunca usar travessão ( — ) ou hífen ( - ) no copy dos slides.** Substituir por ponto final, vírgula ou reescrita da frase.

### Restrições de layout tipográfico

- **Nunca usar eyebrow label (tag de categoria) acima do headline.** Exemplos proibidos: "O PROBLEMA OCULTO DOS CURSOS ONLINE", "ESTRATÉGIA", "SABIA DISSO?". O headline deve falar por si mesmo, sem contexto introdutório em caixa alta. Se precisar de contexto, incorporar na hierarquia do copy principal.
- **Máximo 2 pesos tipográficos visualmente distintos por slide de capa.** Misturar 3 tamanhos/pesos diferentes cria 3 pontos de foco que competem entre si. Padrão: 1 elemento hero (número de impacto ou headline principal, Outfit bold) + 1 elemento secundário (frase de apoio, Outfit regular ou Inter). Nunca adicionar uma terceira camada textual entre os dois.

---

## Anti-slop (O que NUNCA fazer)

### Tipografia

- **NUNCA** usar Outfit 700 ou 800 — pesado demais para a marca
- **NUNCA** usar Outfit 600 em headlines narrativos — 600 é SOMENTE para números de impacto isolados
- **NUNCA** usar line-height diferente de 1.02 em headlines Outfit
- **NUNCA** deixar o browser quebrar headlines automaticamente — sempre `<br>` manual
- **NUNCA** misturar mais de 2 pesos tipográficos visualmente distintos por slide de capa
- **NUNCA** usar eyebrow label (tag de categoria em caixa alta) acima do headline

### Cores

- **NUNCA** usar `#3B37FF` em grandes áreas sobre fundo escuro — PONTUALMENTE apenas
- **NUNCA** usar brand primary como barra/linha decorativa de topo ou lateral
- **NUNCA** criar hierarquia de texto com cores diferentes — usar sistema de opacidade (`rgba(255,255,255,X)`)
- **NUNCA** usar gradientes coloridos chamativos

### Layout

- **NUNCA** ultrapassar 40–45% da altura do slide com texto quando há foto de fundo
- **NUNCA** colocar mais de 2 elementos textuais no slide de capa com foto (excluindo logo)
- **NUNCA** isolar um número sem contexto imediato — incorporar na frase
- **NUNCA** centralizar verticalmente o conteúdo quando há foto (usar `justify-content:flex-start`)

### Copy

- **NUNCA** usar travessão ( — ) ou hífen ( - ) no copy dos slides
- **NUNCA** escrever headlines genéricos — sempre situação específica do público
- **NUNCA** usar afirmação sobre feature no slide CTA — sempre pergunta direta

### Fotografia

- **NUNCA** usar base64 para imagens — caminho relativo sempre
- **NUNCA** usar imagem sem overlay dark — legibilidade é prioridade
- **NUNCA** usar imagens claras/coloridas sem overlay `rgba(0,0,0,0.65)` uniforme

### Fundo

- **NUNCA** usar fundo diferente de `#000000`, `#0a0a0a` ou `#0d0d0d`
- A variação mínima entre slides é intencional — evita monotonia sem quebrar a marca

---

## Z-Index Layers

Elementos estruturais presentes em todos os carrosséis. Nunca alterar estes valores.

| Elemento | z-index | Posição |
|----------|---------|---------|
| Overlay de foto | 1 | `position:absolute; inset:0` |
| Conteúdo do slide | 2 | `position:relative` |
| Logo (topo) | 5 | `position:absolute; top:22px; left:0; right:0` |
| Badge "Arrasta" (absolute) | 6 | `position:absolute; bottom:52px; left:0; right:0` |
| Swipe arrow | 9 | `position:absolute; right:0; top:0; bottom:0; width:48px` |
| Progress bar | 10 | `position:absolute; bottom:0; left:0; right:0` |

---

## Referência rápida de tokens

Para copy-paste rápido em qualquer contexto:

```
Background:       #000000
Surface:          #111111
Card:             #1A1A1A
Border:           #262626
Text:             #FFFFFF
Text secondary:   rgba(255,255,255,0.50)
Text muted:       rgba(255,255,255,0.35)
Primary:          #3B37FF
Primary hover:    #6560FF
Success:          #22c55e
Error:            #ef4444
Accent:           #3b82f6
Warning:          #f59e0b
Font display:     'Outfit', sans-serif
Font body:        'Inter', sans-serif
Border-radius:    12px (cards), 999px (buttons)
```
