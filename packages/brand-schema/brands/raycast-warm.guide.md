# Raycast Warm — Guia Prático

## Visao Geral

**Tema:** Dark quente com energia laranja controlada.
**Ideal para:** Ferramentas, produtos para devs, utilitários, launch pages.
**Fonte:** raycast.com (extração real).
**Personalidade:** Sensação macOS — cantos arredondados (12px), backdrop blur, laranja como única cor de acento usado com extrema contenção (máximo 5% da UI).

**Fontes:** General Sans (display + body) | JetBrains Mono (código)
**CDN:** `https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap`

**Paleta resumida:**

| Token | Cor | Uso |
|-------|-----|-----|
| Background | `#0D0B09` | Fundo principal — preto quente, nunca puro |
| Surface | `#1A1714` | Cards, inputs, áreas elevadas |
| Surface Elevated | `#2A2520` | Elementos em destaque, hover states |
| Border | `#2A2520` | Bordas padrão |
| Border Hover | `#3E3832` | Bordas em hover |
| Text | `#F0ECE8` | Texto principal — branco quente |
| Text Secondary | `#C4BAB0` | Texto secundário |
| Text Muted | `#8A8078` | Labels, captions, placeholders |
| Primary | `#FF6B2C` | Laranja — CTA, destaques (max 5%) |
| Primary Hover | `#FF8F5E` | Hover do primary |
| Accent | `#8A7058` | Acento sutil terroso |
| Success | `#34D399` | Sucesso |
| Warning | `#FBBF24` | Alerta |
| Error | `#F87171` | Erro |

---

## Tipografia — Regras de Uso

**Fonte principal:** General Sans (via Fontshare CDN).
**Mono:** JetBrains Mono para trechos de código.
**Fallback:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

| Elemento | Tamanho | Peso | Line-height | Extras |
|----------|---------|------|-------------|--------|
| H1 | 52px | 700 (Bold) | 1.1 | letter-spacing: -0.02em |
| H2 | 36px | 600 (Semi) | 1.2 | letter-spacing: -0.01em |
| H3 | 28px | 600 (Semi) | 1.3 | — |
| H4 | 22px | 500 (Medium) | 1.35 | — |
| Body | 15px | 400 (Regular) | 1.6 | — |
| Body SM | 14px | 400 (Regular) | 1.5 | — |
| Caption | 12px | 400 (Regular) | 1.5 | — |
| Label | 11px | 500 (Medium) | 1.4 | uppercase, letter-spacing: 0.04em |

**Regras:**
- General Sans é usada tanto em headings quanto body — a variação é feita por peso e tamanho.
- Nunca usar Inter, Roboto ou qualquer substituta.
- Headings sempre com letter-spacing negativo (mais apertado).
- Labels sempre uppercase com tracking aberto (0.04em).
- Body text em 15px, nunca menor que 14px para legibilidade.

---

## Cores — Regras de Uso

**Filosofia:** O laranja é energia controlada. Ele aparece em no máximo 5% da interface — CTAs, ícones de destaque, badges. O resto é warm gray.

**Background:** Sempre `#0D0B09` (warm black). Nunca `#000000` (preto puro).
**Superfícies:** `#1A1714` para cards, `#2A2520` para elementos elevados.
**Bordas:** Usar `rgba(255,255,255,0.08)` para bordas translúcidas em vez de sombras pesadas.
**Texto:** `#F0ECE8` (principal), `#C4BAB0` (secundário), `#8A8078` (muted).
**Sombras:** Sempre com `rgba(0,0,0,...)` em valores altos (0.4-0.75) — dark theme exige sombras fortes.

**Hierarquia de ênfase:**
1. `#FF6B2C` — ação principal (1 por seção, máximo)
2. `#F0ECE8` — texto principal, botões secondary
3. `#C4BAB0` — texto de suporte
4. `#8A8078` — metadados, timestamps

**Radii:** 12px padrão (feel macOS). Cards, botões, inputs — tudo 12px.
**Backdrop blur:** `blur(20px) saturate(180%)` com `rgba(26, 23, 20, 0.85)` — nunca 60px.

---

## Landing Pages

### Hero Section

```html
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet">

<section style="background-color: #0D0B09; padding: 120px 24px 80px; text-align: center; font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; position: relative; overflow: hidden;">
  <!-- Gradient glow sutil -->
  <div style="position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(255,107,44,0.08) 0%, transparent 70%); pointer-events: none;"></div>

  <div style="position: relative; z-index: 1; max-width: 720px; margin: 0 auto;">
    <div style="display: inline-block; background: rgba(255,107,44,0.1); border: 1px solid rgba(255,107,44,0.2); border-radius: 9999px; padding: 6px 16px; margin-bottom: 24px;">
      <span style="font-size: 12px; font-weight: 500; color: #FF6B2C; letter-spacing: 0.04em; text-transform: uppercase;">Novo — Versão 3.0</span>
    </div>

    <h1 style="font-size: 52px; font-weight: 700; color: #F0ECE8; line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 20px;">
      Automatize tudo.<br>Foque no que importa.
    </h1>

    <p style="font-size: 18px; font-weight: 400; color: #C4BAB0; line-height: 1.6; margin: 0 0 40px; max-width: 520px; margin-left: auto; margin-right: auto;">
      Produtividade no terminal. Atalhos inteligentes, comandos rápidos e extensões que transformam seu fluxo de trabalho.
    </p>

    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
      <a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: #FF6B2C; color: #0D0B09; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 12px; text-decoration: none; transition: background 200ms;">
        Começar Agora
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12l4-4-4-4" stroke="#0D0B09" stroke-width="2" stroke-linecap="round"/></svg>
      </a>
      <a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: transparent; color: #F0ECE8; font-size: 14px; font-weight: 500; padding: 12px 24px; border-radius: 12px; text-decoration: none; border: 1px solid #2A2520;">
        Ver Documentação
      </a>
    </div>
  </div>
</section>
```

### Features Grid

```html
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet">

<section style="background-color: #0D0B09; padding: 80px 24px; font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 1080px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 64px;">
      <span style="font-size: 11px; font-weight: 500; color: #FF6B2C; letter-spacing: 0.04em; text-transform: uppercase; display: block; margin-bottom: 12px;">Recursos</span>
      <h2 style="font-size: 36px; font-weight: 600; color: #F0ECE8; line-height: 1.2; letter-spacing: -0.01em; margin: 0 0 16px;">
        Tudo que você precisa. Nada que não precisa.
      </h2>
      <p style="font-size: 15px; color: #C4BAB0; line-height: 1.6; max-width: 480px; margin: 0 auto;">
        Construído para quem vive no terminal e quer velocidade real.
      </p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
      <!-- Card 1 -->
      <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 24px;">
        <div style="width: 40px; height: 40px; background: rgba(255,107,44,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 7l7-4 7 4v6l-7 4-7-4V7z" stroke="#FF6B2C" stroke-width="1.5"/></svg>
        </div>
        <h3 style="font-size: 18px; font-weight: 600; color: #F0ECE8; margin: 0 0 8px; line-height: 1.3;">Comandos Instantâneos</h3>
        <p style="font-size: 14px; color: #8A8078; line-height: 1.5; margin: 0;">
          Pesquise, execute e automatize sem tirar as mãos do teclado.
        </p>
      </div>

      <!-- Card 2 -->
      <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 24px;">
        <div style="width: 40px; height: 40px; background: rgba(255,107,44,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="3" stroke="#FF6B2C" stroke-width="1.5"/><path d="M7 10h6M10 7v6" stroke="#FF6B2C" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <h3 style="font-size: 18px; font-weight: 600; color: #F0ECE8; margin: 0 0 8px; line-height: 1.3;">Extensões Nativas</h3>
        <p style="font-size: 14px; color: #8A8078; line-height: 1.5; margin: 0;">
          Ecossistema de plugins que se integram perfeitamente ao seu workflow.
        </p>
      </div>

      <!-- Card 3 -->
      <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 24px;">
        <div style="width: 40px; height: 40px; background: rgba(255,107,44,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#FF6B2C" stroke-width="1.5"/><path d="M10 6v4l3 3" stroke="#FF6B2C" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <h3 style="font-size: 18px; font-weight: 600; color: #F0ECE8; margin: 0 0 8px; line-height: 1.3;">Velocidade Absurda</h3>
        <p style="font-size: 14px; color: #8A8078; line-height: 1.5; margin: 0;">
          Renderização nativa, sem Electron. Abre em milissegundos.
        </p>
      </div>

      <!-- Card 4 -->
      <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 24px;">
        <div style="width: 40px; height: 40px; background: rgba(255,107,44,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 16l4-4m0 0l4-4m-4 4l4 4m-4-4L4 8" stroke="#FF6B2C" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <h3 style="font-size: 18px; font-weight: 600; color: #F0ECE8; margin: 0 0 8px; line-height: 1.3;">Snippets Inteligentes</h3>
        <p style="font-size: 14px; color: #8A8078; line-height: 1.5; margin: 0;">
          Salve trechos, variáveis e templates reutilizáveis.
        </p>
      </div>

      <!-- Card 5 -->
      <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 24px;">
        <div style="width: 40px; height: 40px; background: rgba(255,107,44,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 10h10M10 5v10" stroke="#FF6B2C" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <h3 style="font-size: 18px; font-weight: 600; color: #F0ECE8; margin: 0 0 8px; line-height: 1.3;">AI Integrada</h3>
        <p style="font-size: 14px; color: #8A8078; line-height: 1.5; margin: 0;">
          Pergunte, gere código e automatize tarefas com inteligência artificial.
        </p>
      </div>

      <!-- Card 6 -->
      <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 24px;">
        <div style="width: 40px; height: 40px; background: rgba(255,107,44,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="2" stroke="#FF6B2C" stroke-width="1.5"/><path d="M6 9l3 2 3-2" stroke="#FF6B2C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <h3 style="font-size: 18px; font-weight: 600; color: #F0ECE8; margin: 0 0 8px; line-height: 1.3;">Window Management</h3>
        <p style="font-size: 14px; color: #8A8078; line-height: 1.5; margin: 0;">
          Organize janelas com atalhos. Sem arrastar, sem perder tempo.
        </p>
      </div>
    </div>
  </div>
</section>
```

### Social Proof / Stats

```html
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet">

<section style="background-color: #0D0B09; padding: 80px 24px; font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 1080px; margin: 0 auto;">
    <!-- Stats -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 64px;">
      <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 32px 24px; text-align: center;">
        <div style="font-size: 36px; font-weight: 700; color: #FF6B2C; line-height: 1.1; margin-bottom: 8px;">500K+</div>
        <div style="font-size: 14px; color: #8A8078; line-height: 1.5;">Desenvolvedores ativos</div>
      </div>
      <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 32px 24px; text-align: center;">
        <div style="font-size: 36px; font-weight: 700; color: #F0ECE8; line-height: 1.1; margin-bottom: 8px;">2.5M</div>
        <div style="font-size: 14px; color: #8A8078; line-height: 1.5;">Comandos por dia</div>
      </div>
      <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 32px 24px; text-align: center;">
        <div style="font-size: 36px; font-weight: 700; color: #F0ECE8; line-height: 1.1; margin-bottom: 8px;">1.200+</div>
        <div style="font-size: 14px; color: #8A8078; line-height: 1.5;">Extensões disponíveis</div>
      </div>
      <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 32px 24px; text-align: center;">
        <div style="font-size: 36px; font-weight: 700; color: #F0ECE8; line-height: 1.1; margin-bottom: 8px;">4.9</div>
        <div style="font-size: 14px; color: #8A8078; line-height: 1.5;">Nota na App Store</div>
      </div>
    </div>

    <!-- Testimonials -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
      <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 24px;">
        <p style="font-size: 15px; color: #C4BAB0; line-height: 1.6; margin: 0 0 20px; font-style: italic;">
          "Substituiu o Spotlight, Alfred e 5 outros apps. Tudo num lugar só."
        </p>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; background: #2A2520; border-radius: 9999px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 14px; font-weight: 600; color: #F0ECE8;">MR</span>
          </div>
          <div>
            <div style="font-size: 14px; font-weight: 500; color: #F0ECE8;">Marina R.</div>
            <div style="font-size: 12px; color: #8A8078;">Senior Dev @ Stripe</div>
          </div>
        </div>
      </div>

      <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 24px;">
        <p style="font-size: 15px; color: #C4BAB0; line-height: 1.6; margin: 0 0 20px; font-style: italic;">
          "Economizo 30 minutos por dia. Não é exagero — cronometrei."
        </p>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; background: #2A2520; border-radius: 9999px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 14px; font-weight: 600; color: #F0ECE8;">TK</span>
          </div>
          <div>
            <div style="font-size: 14px; font-weight: 500; color: #F0ECE8;">Thiago K.</div>
            <div style="font-size: 12px; color: #8A8078;">Tech Lead @ Vercel</div>
          </div>
        </div>
      </div>

      <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 24px;">
        <p style="font-size: 15px; color: #C4BAB0; line-height: 1.6; margin: 0 0 20px; font-style: italic;">
          "O melhor launcher que já usei. E olha que testei todos."
        </p>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 36px; height: 36px; background: #2A2520; border-radius: 9999px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 14px; font-weight: 600; color: #F0ECE8;">AL</span>
          </div>
          <div>
            <div style="font-size: 14px; font-weight: 500; color: #F0ECE8;">André L.</div>
            <div style="font-size: 12px; color: #8A8078;">Founder @ DevTools Inc.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### CTA Section

```html
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet">

<section style="background-color: #0D0B09; padding: 80px 24px; font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; position: relative; overflow: hidden;">
  <div style="position: absolute; bottom: -100px; left: 50%; transform: translateX(-50%); width: 800px; height: 400px; background: radial-gradient(ellipse, rgba(255,107,44,0.06) 0%, transparent 70%); pointer-events: none;"></div>

  <div style="position: relative; z-index: 1; max-width: 600px; margin: 0 auto; text-align: center;">
    <h2 style="font-size: 36px; font-weight: 600; color: #F0ECE8; line-height: 1.2; letter-spacing: -0.01em; margin: 0 0 16px;">
      Pronto para acelerar?
    </h2>
    <p style="font-size: 15px; color: #C4BAB0; line-height: 1.6; margin: 0 0 32px;">
      Grátis para uso pessoal. Sem limite de tempo. Sem cartão de crédito.
    </p>
    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
      <a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: #FF6B2C; color: #0D0B09; font-size: 14px; font-weight: 600; padding: 14px 28px; border-radius: 12px; text-decoration: none;">
        Baixar para macOS
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M4 9l4 4 4-4" stroke="#0D0B09" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
      <a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: transparent; color: #F0ECE8; font-size: 14px; font-weight: 500; padding: 14px 28px; border-radius: 12px; text-decoration: none; border: 1px solid #2A2520;">
        Planos para Times
      </a>
    </div>
    <p style="font-size: 12px; color: #8A8078; margin-top: 16px;">macOS 12+ necessário. Apple Silicon nativo.</p>
  </div>
</section>
```

### Pricing Card

```html
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet">

<section style="background-color: #0D0B09; padding: 80px 24px; font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 900px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 48px;">
      <h2 style="font-size: 36px; font-weight: 600; color: #F0ECE8; line-height: 1.2; letter-spacing: -0.01em; margin: 0 0 12px;">Escolha seu plano</h2>
      <p style="font-size: 15px; color: #C4BAB0; margin: 0;">Comece grátis. Escale quando precisar.</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: start;">
      <!-- Free -->
      <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 32px 24px;">
        <div style="font-size: 11px; font-weight: 500; color: #8A8078; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 8px;">Pessoal</div>
        <div style="font-size: 36px; font-weight: 700; color: #F0ECE8; margin-bottom: 4px;">Grátis</div>
        <p style="font-size: 14px; color: #8A8078; margin: 0 0 24px;">Para sempre. Sem pegadinhas.</p>
        <a href="#" style="display: block; text-align: center; background: transparent; color: #F0ECE8; font-size: 14px; font-weight: 500; padding: 12px 24px; border-radius: 12px; text-decoration: none; border: 1px solid #2A2520; margin-bottom: 24px;">Começar</a>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
          <li style="font-size: 14px; color: #C4BAB0; display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#34D399" stroke-width="1.5" stroke-linecap="round"/></svg>
            Comandos ilimitados
          </li>
          <li style="font-size: 14px; color: #C4BAB0; display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#34D399" stroke-width="1.5" stroke-linecap="round"/></svg>
            Extensões da loja
          </li>
          <li style="font-size: 14px; color: #C4BAB0; display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#34D399" stroke-width="1.5" stroke-linecap="round"/></svg>
            Window management
          </li>
        </ul>
      </div>

      <!-- Pro (destaque) -->
      <div style="background: #1A1714; border: 2px solid #FF6B2C; border-radius: 12px; padding: 32px 24px; position: relative;">
        <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #FF6B2C; color: #0D0B09; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; letter-spacing: 0.04em; text-transform: uppercase;">Popular</div>
        <div style="font-size: 11px; font-weight: 500; color: #FF6B2C; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 8px;">Pro</div>
        <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px;">
          <span style="font-size: 36px; font-weight: 700; color: #F0ECE8;">R$29</span>
          <span style="font-size: 14px; color: #8A8078;">/mês</span>
        </div>
        <p style="font-size: 14px; color: #8A8078; margin: 0 0 24px;">Para devs que querem mais.</p>
        <a href="#" style="display: block; text-align: center; background: #FF6B2C; color: #0D0B09; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 12px; text-decoration: none; margin-bottom: 24px;">Assinar Pro</a>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
          <li style="font-size: 14px; color: #C4BAB0; display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#34D399" stroke-width="1.5" stroke-linecap="round"/></svg>
            Tudo do Pessoal
          </li>
          <li style="font-size: 14px; color: #C4BAB0; display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#34D399" stroke-width="1.5" stroke-linecap="round"/></svg>
            AI integrada (GPT-4)
          </li>
          <li style="font-size: 14px; color: #C4BAB0; display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#34D399" stroke-width="1.5" stroke-linecap="round"/></svg>
            Cloud Sync
          </li>
          <li style="font-size: 14px; color: #C4BAB0; display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#34D399" stroke-width="1.5" stroke-linecap="round"/></svg>
            Temas personalizados
          </li>
        </ul>
      </div>

      <!-- Teams -->
      <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 32px 24px;">
        <div style="font-size: 11px; font-weight: 500; color: #8A8078; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 8px;">Times</div>
        <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 4px;">
          <span style="font-size: 36px; font-weight: 700; color: #F0ECE8;">R$49</span>
          <span style="font-size: 14px; color: #8A8078;">/usuário/mês</span>
        </div>
        <p style="font-size: 14px; color: #8A8078; margin: 0 0 24px;">Produtividade em escala.</p>
        <a href="#" style="display: block; text-align: center; background: transparent; color: #F0ECE8; font-size: 14px; font-weight: 500; padding: 12px 24px; border-radius: 12px; text-decoration: none; border: 1px solid #2A2520; margin-bottom: 24px;">Falar com Vendas</a>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
          <li style="font-size: 14px; color: #C4BAB0; display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#34D399" stroke-width="1.5" stroke-linecap="round"/></svg>
            Tudo do Pro
          </li>
          <li style="font-size: 14px; color: #C4BAB0; display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#34D399" stroke-width="1.5" stroke-linecap="round"/></svg>
            Admin dashboard
          </li>
          <li style="font-size: 14px; color: #C4BAB0; display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#34D399" stroke-width="1.5" stroke-linecap="round"/></svg>
            SSO e SAML
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

### Footer

```html
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet">

<footer style="background-color: #0D0B09; border-top: 1px solid #2A2520; padding: 64px 24px 32px; font-family: 'General Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 1080px; margin: 0 auto;">
    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px;">
      <!-- Brand -->
      <div>
        <div style="font-size: 18px; font-weight: 700; color: #F0ECE8; margin-bottom: 12px;">
          <span style="color: #FF6B2C;">⌘</span> SuaMarca
        </div>
        <p style="font-size: 14px; color: #8A8078; line-height: 1.5; max-width: 260px; margin: 0;">
          Produtividade para quem constrói. Rápido, extensível, bonito.
        </p>
      </div>

      <!-- Produto -->
      <div>
        <div style="font-size: 11px; font-weight: 500; color: #8A8078; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 16px;">Produto</div>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">
          <li><a href="#" style="font-size: 14px; color: #C4BAB0; text-decoration: none;">Recursos</a></li>
          <li><a href="#" style="font-size: 14px; color: #C4BAB0; text-decoration: none;">Extensões</a></li>
          <li><a href="#" style="font-size: 14px; color: #C4BAB0; text-decoration: none;">Preços</a></li>
          <li><a href="#" style="font-size: 14px; color: #C4BAB0; text-decoration: none;">Changelog</a></li>
        </ul>
      </div>

      <!-- Recursos -->
      <div>
        <div style="font-size: 11px; font-weight: 500; color: #8A8078; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 16px;">Recursos</div>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">
          <li><a href="#" style="font-size: 14px; color: #C4BAB0; text-decoration: none;">Documentação</a></li>
          <li><a href="#" style="font-size: 14px; color: #C4BAB0; text-decoration: none;">Blog</a></li>
          <li><a href="#" style="font-size: 14px; color: #C4BAB0; text-decoration: none;">Comunidade</a></li>
        </ul>
      </div>

      <!-- Legal -->
      <div>
        <div style="font-size: 11px; font-weight: 500; color: #8A8078; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 16px;">Legal</div>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;">
          <li><a href="#" style="font-size: 14px; color: #C4BAB0; text-decoration: none;">Privacidade</a></li>
          <li><a href="#" style="font-size: 14px; color: #C4BAB0; text-decoration: none;">Termos</a></li>
        </ul>
      </div>
    </div>

    <div style="border-top: 1px solid #2A2520; padding-top: 24px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 12px; color: #8A8078;">&copy; 2026 SuaMarca. Todos os direitos reservados.</span>
      <div style="display: flex; gap: 16px;">
        <a href="#" style="color: #8A8078; text-decoration: none;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href="#" style="color: #8A8078; text-decoration: none;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
        </a>
      </div>
    </div>
  </div>
</footer>
```

### Layout Rules

| Regra | Valor |
|-------|-------|
| Max-width container | 1080px |
| Padding de seção | 80px vertical, 24px horizontal |
| Gap entre cards | 16px |
| Grid padrão | 3 colunas para features/cards |
| Grid stats | 4 colunas |
| Border radius | 12px (tudo: cards, botões, inputs) |
| Backdrop blur | `blur(20px) saturate(180%)` com `rgba(26,23,20,0.85)` |
| Glow gradients | `radial-gradient(circle, rgba(255,107,44,0.05-0.08), transparent)` — sutil |
| Separação visual | Bordas (`#2A2520`) em vez de sombras — feel flat/macOS |
| Responsivo | Grid colapsa para 1 coluna em mobile (media query `max-width: 768px`) |

---

## Instagram

### Carrossel (1080x1350px)

```html
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet">

<!-- SLIDE 1 — COVER -->
<div style="width: 1080px; height: 1350px; background-color: #0D0B09; font-family: 'General Sans', -apple-system, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; position: relative; overflow: hidden;">
  <!-- Glow -->
  <div style="position: absolute; top: 100px; left: 50%; transform: translateX(-50%); width: 500px; height: 500px; background: radial-gradient(circle, rgba(255,107,44,0.1) 0%, transparent 70%); pointer-events: none;"></div>

  <div style="position: relative; z-index: 1; text-align: center;">
    <div style="display: inline-block; background: rgba(255,107,44,0.12); border: 1px solid rgba(255,107,44,0.25); border-radius: 9999px; padding: 8px 20px; margin-bottom: 32px;">
      <span style="font-size: 18px; font-weight: 500; color: #FF6B2C; letter-spacing: 0.04em; text-transform: uppercase;">5 Atalhos</span>
    </div>

    <h1 style="font-size: 64px; font-weight: 700; color: #F0ECE8; line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 24px;">
      Atalhos que<br>todo dev<br>deveria saber
    </h1>

    <p style="font-size: 24px; color: #C4BAB0; line-height: 1.5; margin: 0;">
      Produtividade real no terminal.
    </p>
  </div>

  <!-- Progress bar -->
  <div style="position: absolute; bottom: 60px; left: 80px; right: 80px; display: flex; gap: 6px;">
    <div style="flex: 1; height: 3px; background: #FF6B2C; border-radius: 2px;"></div>
    <div style="flex: 1; height: 3px; background: #2A2520; border-radius: 2px;"></div>
    <div style="flex: 1; height: 3px; background: #2A2520; border-radius: 2px;"></div>
    <div style="flex: 1; height: 3px; background: #2A2520; border-radius: 2px;"></div>
    <div style="flex: 1; height: 3px; background: #2A2520; border-radius: 2px;"></div>
  </div>

  <!-- Swipe arrow -->
  <div style="position: absolute; bottom: 60px; right: 80px;">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M12 8l8 8-8 8" stroke="#8A8078" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>
</div>

<!-- SLIDE 2 — INTERNAL -->
<div style="width: 1080px; height: 1350px; background-color: #0D0B09; font-family: 'General Sans', -apple-system, sans-serif; display: flex; flex-direction: column; justify-content: center; padding: 80px; position: relative;">
  <span style="font-size: 16px; font-weight: 500; color: #FF6B2C; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 24px;">01</span>

  <h2 style="font-size: 48px; font-weight: 700; color: #F0ECE8; line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 24px;">
    Cmd + K<br>para tudo
  </h2>

  <p style="font-size: 22px; color: #C4BAB0; line-height: 1.6; margin: 0 0 40px; max-width: 700px;">
    Abra qualquer app, arquivo ou comando sem tocar no mouse. O atalho universal que substitui 5 ferramentas.
  </p>

  <!-- Code block -->
  <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 24px; font-family: 'JetBrains Mono', monospace; font-size: 18px; color: #C4BAB0; line-height: 1.6;">
    <span style="color: #8A8078;">$</span> <span style="color: #F0ECE8;">raycast</span> <span style="color: #FF6B2C;">--search</span> "deploy production"
  </div>

  <!-- Progress bar -->
  <div style="position: absolute; bottom: 60px; left: 80px; right: 80px; display: flex; gap: 6px;">
    <div style="flex: 1; height: 3px; background: #3E3832; border-radius: 2px;"></div>
    <div style="flex: 1; height: 3px; background: #FF6B2C; border-radius: 2px;"></div>
    <div style="flex: 1; height: 3px; background: #2A2520; border-radius: 2px;"></div>
    <div style="flex: 1; height: 3px; background: #2A2520; border-radius: 2px;"></div>
    <div style="flex: 1; height: 3px; background: #2A2520; border-radius: 2px;"></div>
  </div>
</div>

<!-- SLIDE 5 — CTA -->
<div style="width: 1080px; height: 1350px; background-color: #0D0B09; font-family: 'General Sans', -apple-system, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; position: relative; overflow: hidden;">
  <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 600px; height: 400px; background: radial-gradient(circle, rgba(255,107,44,0.12) 0%, transparent 70%); pointer-events: none;"></div>

  <div style="position: relative; z-index: 1; text-align: center;">
    <h2 style="font-size: 52px; font-weight: 700; color: #F0ECE8; line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 24px;">
      Salva esse<br>carrossel.
    </h2>
    <p style="font-size: 22px; color: #C4BAB0; line-height: 1.5; margin: 0 0 40px;">
      E me segue para mais dicas de produtividade no terminal.
    </p>
    <div style="display: inline-block; background: #FF6B2C; color: #0D0B09; font-size: 20px; font-weight: 600; padding: 16px 40px; border-radius: 12px;">
      @seuhandle
    </div>
  </div>

  <!-- Progress bar -->
  <div style="position: absolute; bottom: 60px; left: 80px; right: 80px; display: flex; gap: 6px;">
    <div style="flex: 1; height: 3px; background: #3E3832; border-radius: 2px;"></div>
    <div style="flex: 1; height: 3px; background: #3E3832; border-radius: 2px;"></div>
    <div style="flex: 1; height: 3px; background: #3E3832; border-radius: 2px;"></div>
    <div style="flex: 1; height: 3px; background: #3E3832; border-radius: 2px;"></div>
    <div style="flex: 1; height: 3px; background: #FF6B2C; border-radius: 2px;"></div>
  </div>
</div>
```

### Post Unico (1080x1080px)

```html
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet">

<div style="width: 1080px; height: 1080px; background-color: #0D0B09; font-family: 'General Sans', -apple-system, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; position: relative; overflow: hidden;">
  <div style="position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(255,107,44,0.08) 0%, transparent 70%); pointer-events: none;"></div>

  <div style="position: relative; z-index: 1; text-align: center;">
    <div style="display: inline-block; background: rgba(255,107,44,0.12); border-radius: 9999px; padding: 8px 20px; margin-bottom: 32px;">
      <span style="font-size: 16px; font-weight: 500; color: #FF6B2C; text-transform: uppercase; letter-spacing: 0.04em;">Dica rápida</span>
    </div>

    <h1 style="font-size: 56px; font-weight: 700; color: #F0ECE8; line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 24px;">
      Não use<br>o mouse.
    </h1>

    <p style="font-size: 22px; color: #C4BAB0; line-height: 1.5; margin: 0 0 40px; max-width: 600px;">
      Cada segundo que sua mão sai do teclado é produtividade perdida.
    </p>

    <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 20px 32px; display: inline-flex; align-items: center; gap: 12px;">
      <span style="font-size: 20px; font-weight: 600; color: #FF6B2C; font-family: 'JetBrains Mono', monospace;">Cmd+K</span>
      <span style="font-size: 18px; color: #8A8078;">=</span>
      <span style="font-size: 18px; color: #C4BAB0;">Acesso instantâneo</span>
    </div>
  </div>

  <div style="position: absolute; bottom: 40px; font-size: 16px; color: #8A8078;">@seuhandle</div>
</div>
```

### Stories (1080x1920px)

```html
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet">

<div style="width: 1080px; height: 1920px; background-color: #0D0B09; font-family: 'General Sans', -apple-system, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; position: relative; overflow: hidden;">
  <!-- Glow top -->
  <div style="position: absolute; top: 200px; left: 50%; transform: translateX(-50%); width: 500px; height: 500px; background: radial-gradient(circle, rgba(255,107,44,0.1) 0%, transparent 70%); pointer-events: none;"></div>

  <div style="position: relative; z-index: 1; text-align: center; max-width: 800px;">
    <div style="font-size: 16px; font-weight: 500; color: #FF6B2C; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 40px;">Enquete</div>

    <h1 style="font-size: 56px; font-weight: 700; color: #F0ECE8; line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 48px;">
      Qual launcher<br>você usa?
    </h1>

    <!-- Options -->
    <div style="display: flex; flex-direction: column; gap: 16px; width: 100%;">
      <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 24px; text-align: center;">
        <span style="font-size: 24px; font-weight: 600; color: #F0ECE8;">Spotlight</span>
      </div>
      <div style="background: rgba(255,107,44,0.1); border: 1px solid rgba(255,107,44,0.3); border-radius: 12px; padding: 24px; text-align: center;">
        <span style="font-size: 24px; font-weight: 600; color: #FF6B2C;">Raycast</span>
      </div>
      <div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 24px; text-align: center;">
        <span style="font-size: 24px; font-weight: 600; color: #F0ECE8;">Alfred</span>
      </div>
    </div>
  </div>

  <!-- Swipe up -->
  <div style="position: absolute; bottom: 80px; text-align: center;">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M8 20l8-8 8 8" stroke="#8A8078" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div style="font-size: 14px; color: #8A8078; margin-top: 4px;">Arraste para cima</div>
  </div>
</div>
```

---

## YouTube

### Thumbnail (1280x720px)

```html
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet">

<div style="width: 1280px; height: 720px; background-color: #0D0B09; font-family: 'General Sans', -apple-system, sans-serif; display: flex; align-items: center; padding: 64px; position: relative; overflow: hidden;">
  <!-- Orange glow right -->
  <div style="position: absolute; right: -100px; top: 50%; transform: translateY(-50%); width: 500px; height: 500px; background: radial-gradient(circle, rgba(255,107,44,0.15) 0%, transparent 70%); pointer-events: none;"></div>

  <div style="position: relative; z-index: 1; flex: 1;">
    <h1 style="font-size: 72px; font-weight: 700; color: #F0ECE8; line-height: 1.05; letter-spacing: -0.02em; margin: 0 0 16px; max-width: 700px;">
      10 ATALHOS<br><span style="color: #FF6B2C;">QUE NINGUÉM</span><br>USA
    </h1>
    <p style="font-size: 28px; color: #C4BAB0; margin: 0;">Produtividade no terminal</p>
  </div>

  <!-- Right side accent -->
  <div style="position: relative; z-index: 1; width: 300px; height: 300px; background: #1A1714; border: 2px solid #FF6B2C; border-radius: 24px; display: flex; align-items: center; justify-content: center;">
    <span style="font-size: 120px; font-weight: 700; color: #FF6B2C;">10</span>
  </div>
</div>
```

### Banner (2560x1440px)

```html
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet">

<div style="width: 2560px; height: 1440px; background-color: #0D0B09; font-family: 'General Sans', -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
  <!-- Orange glow center -->
  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 800px; height: 800px; background: radial-gradient(circle, rgba(255,107,44,0.06) 0%, transparent 70%); pointer-events: none;"></div>

  <!-- Safe area (1546x423 centered) -->
  <div style="position: relative; z-index: 1; text-align: center;">
    <h1 style="font-size: 80px; font-weight: 700; color: #F0ECE8; line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 16px;">
      <span style="color: #FF6B2C;">Dev</span>Tools & Produtividade
    </h1>
    <p style="font-size: 28px; color: #C4BAB0; letter-spacing: 0.02em;">Terminal | Automação | macOS</p>
  </div>

  <!-- Subtle grid pattern -->
  <div style="position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 64px 64px; pointer-events: none;"></div>
</div>
```

---

## Fotografia e Imagem

### Prompts para IA (Midjourney, DALL-E, etc.)

**Produto/Screenshot:**
```
Product screenshot on warm dark background #0D0B09, subtle orange glow from behind, macOS window frame with 12px rounded corners, clean interface, General Sans typography, soft ambient lighting, professional product photography --ar 16:9 --style raw
```

**Ambiente/Lifestyle:**
```
Developer workspace at night, warm ambient lighting, single orange desk lamp, dark wood desk, mechanical keyboard, ultrawide monitor showing dark UI, cozy minimal setup, film grain, shallow depth of field --ar 3:4
```

**Abstrato/Pattern:**
```
Abstract geometric pattern, warm dark tones, subtle orange (#FF6B2C) accent lines on charcoal (#0D0B09) background, mathematical precision, blueprint aesthetic, minimal --ar 1:1 --style raw
```

### Overlays

**Overlay escuro (texto sobre imagem):**
```css
background: linear-gradient(to top, rgba(13,11,9,0.95) 0%, rgba(13,11,9,0.6) 50%, transparent 100%);
```

**Overlay com borda luminosa:**
```css
border: 1px solid rgba(255,107,44,0.15);
box-shadow: 0 0 40px rgba(255,107,44,0.05);
```

---

## Componentes (HTML Pronto)

### Botao Primary

```html
<a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: #FF6B2C; color: #0D0B09; font-family: 'General Sans', sans-serif; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 12px; text-decoration: none; border: none; cursor: pointer;">
  Texto do Botão
</a>
```

### Botao Secondary

```html
<a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: transparent; color: #F0ECE8; font-family: 'General Sans', sans-serif; font-size: 14px; font-weight: 500; padding: 12px 24px; border-radius: 12px; text-decoration: none; border: 1px solid #2A2520; cursor: pointer;">
  Texto do Botão
</a>
```

### Card

```html
<div style="background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 24px; font-family: 'General Sans', sans-serif;">
  <h3 style="font-size: 18px; font-weight: 600; color: #F0ECE8; margin: 0 0 8px;">Título do Card</h3>
  <p style="font-size: 14px; color: #8A8078; line-height: 1.5; margin: 0;">Descrição do conteúdo do card com informações relevantes.</p>
</div>
```

### Badge/Label

```html
<span style="display: inline-block; background: rgba(255,107,44,0.1); border: 1px solid rgba(255,107,44,0.2); color: #FF6B2C; font-family: 'General Sans', sans-serif; font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: 9999px; letter-spacing: 0.04em; text-transform: uppercase;">
  Label
</span>
```

### Lista com Icone

```html
<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; font-family: 'General Sans', sans-serif;">
  <li style="font-size: 15px; color: #C4BAB0; display: flex; align-items: center; gap: 10px;">
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9l3.5 3.5L14 6" stroke="#FF6B2C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    Item da lista com ícone laranja
  </li>
  <li style="font-size: 15px; color: #C4BAB0; display: flex; align-items: center; gap: 10px;">
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9l3.5 3.5L14 6" stroke="#FF6B2C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    Segundo item da lista
  </li>
</ul>
```

### Caixa de Destaque (Highlight Box)

```html
<div style="background: rgba(255,107,44,0.05); border-left: 3px solid #FF6B2C; border-radius: 0 12px 12px 0; padding: 20px 24px; font-family: 'General Sans', sans-serif;">
  <div style="font-size: 11px; font-weight: 500; color: #FF6B2C; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 8px;">Destaque</div>
  <p style="font-size: 15px; color: #C4BAB0; line-height: 1.6; margin: 0;">Conteúdo importante que merece atenção visual. Use com moderação — no máximo 1 por seção.</p>
</div>
```

### Input

```html
<input type="text" placeholder="Buscar comandos..." style="width: 100%; background: #1A1714; border: 1px solid #2A2520; border-radius: 12px; padding: 10px 14px; font-family: 'General Sans', sans-serif; font-size: 15px; color: #F0ECE8; outline: none; box-sizing: border-box;">
```

---

## Tom de Voz

**Personalidade:** Técnico, direto, confiante. Como um colega dev sênior que explica sem enrolar.

| Atributo | Descrição |
|----------|-----------|
| Tom | Profissional mas acessível — sem ser corporativo |
| Vocabulário | Termos técnicos quando necessário, sem jargão desnecessário |
| Frases | Curtas, ativas, imperativas. "Automatize." "Configure." "Execute." |
| Humor | Seco, pontual. Nunca piadas forçadas |
| Confiança | Afirmativo, sem hedging ("talvez", "pode ser") |

**Exemplos de copy:**

| Contexto | Texto |
|----------|-------|
| Hero headline | "Automatize tudo. Foque no que importa." |
| Subtítulo | "Produtividade no terminal para quem constrói." |
| Feature | "Comandos instantâneos, sem tirar as mãos do teclado." |
| CTA | "Começar agora" / "Baixar grátis" |
| Prova social | "500K+ devs já usam." |
| Preço | "Grátis para sempre. Sem pegadinhas." |

**Palavras-chave da marca:** automatize, acelere, construa, execute, simplifique, produtividade, terminal, workflow, extensões, comandos.

---

## Anti-slop (O que NUNCA fazer)

| Proibido | Por que | Alternativa |
|----------|---------|-------------|
| Laranja em mais de 5% da UI | Perde o impacto. Contenção é a chave. | Usar apenas em CTAs e destaques pontuais |
| Background `#000000` (preto puro) | Frio, sem personalidade | Sempre `#0D0B09` (warm black) |
| Backdrop blur > 20px | Visual amador, "glassmorphism genérico" | `blur(20px) saturate(180%)` |
| Sombras pesadas/coloridas | Quebra a estética flat macOS | Bordas finas (`#2A2520`) ou `rgba(white, 0.08)` |
| Fonte Inter, Roboto ou similar | Quebra a identidade | Sempre General Sans (Fontshare) |
| Border radius diferente de 12px | Inconsistência visual | 12px para tudo (cards, botões, inputs) |
| Gradientes lineares no background | Visual datado | Radial gradients sutis (`rgba(255,107,44,0.05)`) |
| Texto laranja em parágrafos | Cansa a vista, perde legibilidade | Laranja apenas em labels, badges, CTAs |
| Ícones coloridos demais | Compete com o laranja | Ícones monocromáticos (muted gray ou orange outline) |
| Padding apertado (< 24px cards) | Parece app genérico | 24px mínimo em cards, 80px em seções |
| Emojis no lugar de ícones SVG | Inconsistente cross-platform | Sempre SVG inline com cores da marca |
| Animações bouncy/spring | Não combina com o tom profissional | Transições suaves: `cubic-bezier(0.4, 0, 0.2, 1)` 200ms |
