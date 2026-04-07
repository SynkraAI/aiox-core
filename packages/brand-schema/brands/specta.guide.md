# Specta — Guia Prático

## Visão Geral

| Propriedade | Valor |
|-------------|-------|
| **Nome** | Specta |
| **Tema** | Dark — deep navy-purple com acentos vibrantes purple + pink |
| **Origem** | Page UI / Specta template |
| **Ideal para** | Creator platforms, video tools, premium SaaS, AI products |

### Personalidade

Specta é **ousado, tecnológico e premium**. A paleta escura com gradientes purple-pink transmite inovação sem cair no clichê cyberpunk. O tom é de **confiança criativa** — uma marca que entende de tecnologia e não tem medo de chamar atenção.

### Fontes

| Função | Fonte | Por quê |
|--------|-------|---------|
| Display (títulos) | **Syne** (600–800) | Geométrica e expressiva — dá personalidade aos headings sem parecer genérico |
| Body (corpo) | **Cabinet Grotesk** (400–700) | Moderna e legível — complementa Syne sem competir |
| Mono (código) | **JetBrains Mono** | Padrão técnico, ótima legibilidade em blocos de código |
| Fallback | -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif | |

**CDN Display:** `https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap`
**CDN Body:** `https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&display=swap`

---

## Tipografia — Regras de Uso

### Escala Tipográfica

| Nível | Tamanho | Peso | Line-height | Letter-spacing | Fonte |
|-------|---------|------|-------------|----------------|-------|
| H1 | 56px | 800 | 1.05 | -0.03em | Syne |
| H2 | 40px | 700 | 1.15 | -0.02em | Syne |
| H3 | 28px | 700 | 1.25 | -0.01em | Syne |
| H4 | 22px | 600 | 1.3 | — | Syne |
| Body | 16px | 400 | 1.6 | — | Cabinet Grotesk |
| Body SM | 14px | 400 | 1.5 | — | Cabinet Grotesk |
| Caption | 13px | 400 | 1.5 | — | Cabinet Grotesk |
| Label | 11px | 700 | 1.4 | 0.08em | Cabinet Grotesk (UPPERCASE) |

### Regras

- **Syne** é EXCLUSIVA para headings (H1–H4). Nunca use em parágrafos, botões ou labels.
- **Cabinet Grotesk** é o "cavalo de batalha" — body, botões, labels, inputs, tudo que não é heading.
- Labels sempre em **UPPERCASE** com letter-spacing `0.08em` e peso 700.
- Nunca misture pesos dentro do mesmo nível tipográfico.

### O que NUNCA fazer

- Syne em corpo de texto (fica pesada e ilegível)
- Cabinet Grotesk em H1/H2 (perde a personalidade da marca)
- Peso 400 em headings (fraco demais para o tom bold da Specta)
- Letter-spacing positivo em headings (eles já são tight por design)
- Texto branco puro `#FFFFFF` — use `#F2F2F2` para reduzir fadiga visual

---

## Cores — Regras de Uso

### Paleta Semântica (uso principal)

| Token | Hex | Uso |
|-------|-----|-----|
| Background | `#0C0A1A` | Fundo principal de todas as páginas |
| Surface | `#161330` | Cards, inputs, seções elevadas |
| Surface Elevated | `#1E1A40` | Modais, dropdowns, tooltips |
| Border | `#272640` | Bordas padrão |
| Border Hover | `#3D3A5C` | Bordas em estado hover |
| Text | `#F2F2F2` | Texto principal |
| Text Secondary | `#D8B4FE` | Texto de destaque suave (purple claro) |
| Text Muted | `#9CA3AF` | Texto auxiliar, placeholders |
| Primary | `#A855F7` | Ações primárias, links |
| Primary Hover | `#C084FC` | Hover de ações primárias |
| Accent | `#EC4899` | Destaques, badges, urgência |
| Accent Hover | `#F472B6` | Hover de accent |
| Success | `#34D399` | Confirmações, status positivo |
| Warning | `#FBBF24` | Alertas |
| Error | `#F87171` | Erros |
| Info | `#818CF8` | Informações neutras |

### Paleta Purple (primitivas)

| Shade | Hex | Uso típico |
|-------|-----|-----------|
| 50 | `#FAF5FF` | — (raro em tema dark) |
| 100 | `#F3E8FF` | — |
| 200 | `#E9D5FF` | — |
| 300 | `#D8B4FE` | Text secondary |
| 400 | `#C084FC` | Primary hover, links hover |
| 500 | `#A855F7` | Primary — cor principal |
| 600 | `#9333EA` | Ênfase forte |
| 700 | `#7E22CE` | Backgrounds acentuados |
| 800 | `#6B21A8` | — |
| 900 | `#581C87` | — |
| 950 | `#3B0764` | — |

### Paleta Pink (primitivas)

| Shade | Hex | Uso típico |
|-------|-----|-----------|
| 50 | `#FDF2F8` | — (raro em tema dark) |
| 100 | `#FCE7F3` | — |
| 200 | `#FBCFE8` | — |
| 300 | `#F9A8D4` | — |
| 400 | `#F472B6` | Accent hover |
| 500 | `#EC4899` | Accent — segunda cor principal |
| 600 | `#DB2777` | — |
| 700 | `#BE185D` | — |
| 800 | `#9D174D` | — |
| 900 | `#831843` | — |
| 950 | `#500724` | — |

### Gradiente Purple→Pink

```css
background: linear-gradient(135deg, #A855F7, #EC4899);
```

**Quando usar:**
- Botões primários (CTA)
- Texto de destaque (com `-webkit-background-clip: text`)
- Indicadores de progresso
- Badges premium

**Quando NÃO usar:**
- Backgrounds inteiros de seção (fica pesado e genérico)
- Bordas (use cores sólidas)
- Textos longos (só headlines curtas ou números)
- Ícones pequenos (perde definição)

### Hierarquia de Opacidade para Texto

| Nível | Cor | Uso |
|-------|-----|-----|
| Primário | `#F2F2F2` | Títulos, texto principal |
| Secundário | `#D8B4FE` | Subtítulos, destaques suaves |
| Muted | `#9CA3AF` | Legendas, placeholders, metadados |

---

## Landing Pages

### Hero Section

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#0C0A1A;">
  <section style="
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 80px 24px;
    background: #0C0A1A;
    position: relative;
    overflow: hidden;
  ">
    <!-- Glow background effect -->
    <div style="
      position: absolute;
      top: -200px;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.08) 40%, transparent 70%);
      pointer-events: none;
    "></div>

    <!-- Label -->
    <div style="
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 9999px;
      border: 1px solid rgba(168,85,247,0.2);
      background: rgba(168,85,247,0.1);
      margin-bottom: 32px;
      position: relative;
    ">
      <span style="
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #C084FC;
      ">Novo: IA integrada ao seu conteúdo</span>
    </div>

    <!-- Headline -->
    <h1 style="
      font-family: 'Syne', sans-serif;
      font-size: 56px;
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: -0.03em;
      color: #F2F2F2;
      margin: 0 0 24px 0;
      max-width: 800px;
      position: relative;
    ">
      Transforme sua ideia em
      <span style="
        background: linear-gradient(135deg, #A855F7, #EC4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      ">plataforma</span>
    </h1>

    <!-- Subheadline -->
    <p style="
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: 18px;
      font-weight: 400;
      line-height: 1.6;
      color: #9CA3AF;
      margin: 0 0 40px 0;
      max-width: 560px;
      position: relative;
    ">
      Crie, publique e escale cursos online com a plataforma que já ajudou mais de 2.000 criadores a monetizar seu conhecimento.
    </p>

    <!-- CTA buttons -->
    <div style="display: flex; gap: 16px; position: relative;">
      <!-- Primary CTA -->
      <a href="#" style="
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 14px 28px;
        border-radius: 10px;
        background: linear-gradient(135deg, #A855F7, #EC4899);
        color: #FFFFFF;
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 15px;
        font-weight: 600;
        text-decoration: none;
        transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 0 40px rgba(168,85,247,0.15);
      ">Começar agora — é grátis</a>

      <!-- Secondary CTA -->
      <a href="#" style="
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 14px 28px;
        border-radius: 10px;
        background: rgba(168,85,247,0.1);
        color: #C084FC;
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 15px;
        font-weight: 500;
        text-decoration: none;
        border: 1px solid rgba(168,85,247,0.2);
        transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
      ">Ver demo ao vivo</a>
    </div>
  </section>
</body>
</html>
```

### Features Grid

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#0C0A1A;">
  <section style="padding: 80px 24px; background: #0C0A1A; max-width: 1200px; margin: 0 auto;">
    <!-- Section header -->
    <div style="text-align: center; margin-bottom: 64px;">
      <span style="
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #A855F7;
        display: block;
        margin-bottom: 16px;
      ">Funcionalidades</span>
      <h2 style="
        font-family: 'Syne', sans-serif;
        font-size: 40px;
        font-weight: 700;
        line-height: 1.15;
        letter-spacing: -0.02em;
        color: #F2F2F2;
        margin: 0 0 16px 0;
      ">Tudo que você precisa para escalar</h2>
      <p style="
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 16px;
        color: #9CA3AF;
        line-height: 1.6;
        max-width: 480px;
        margin: 0 auto;
      ">Ferramentas construídas para criadores que querem resultado, não complexidade.</p>
    </div>

    <!-- Grid -->
    <div style="
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    ">
      <!-- Card 1 -->
      <div style="
        background: #161330;
        border: 1px solid #272640;
        border-radius: 14px;
        padding: 28px;
        transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
      ">
        <div style="
          width: 48px; height: 48px;
          border-radius: 10px;
          background: rgba(168,85,247,0.1);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          font-size: 24px;
        ">⚡</div>
        <h3 style="
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 600;
          line-height: 1.3;
          color: #F2F2F2;
          margin: 0 0 12px 0;
        ">Editor inteligente</h3>
        <p style="
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 14px;
          color: #9CA3AF;
          line-height: 1.5;
          margin: 0;
        ">Crie módulos e aulas com arrastar e soltar. Suporte a vídeo, texto, quiz e certificados automáticos.</p>
      </div>

      <!-- Card 2 -->
      <div style="
        background: #161330;
        border: 1px solid #272640;
        border-radius: 14px;
        padding: 28px;
      ">
        <div style="
          width: 48px; height: 48px;
          border-radius: 10px;
          background: rgba(236,72,153,0.1);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          font-size: 24px;
        ">📊</div>
        <h3 style="
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 600;
          line-height: 1.3;
          color: #F2F2F2;
          margin: 0 0 12px 0;
        ">Analytics em tempo real</h3>
        <p style="
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 14px;
          color: #9CA3AF;
          line-height: 1.5;
          margin: 0;
        ">Acompanhe retenção, engajamento e receita. Dashboards que mostram exatamente onde otimizar.</p>
      </div>

      <!-- Card 3 -->
      <div style="
        background: #161330;
        border: 1px solid #272640;
        border-radius: 14px;
        padding: 28px;
      ">
        <div style="
          width: 48px; height: 48px;
          border-radius: 10px;
          background: rgba(168,85,247,0.1);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          font-size: 24px;
        ">🤖</div>
        <h3 style="
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 600;
          line-height: 1.3;
          color: #F2F2F2;
          margin: 0 0 12px 0;
        ">IA que aprende com você</h3>
        <p style="
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 14px;
          color: #9CA3AF;
          line-height: 1.5;
          margin: 0;
        ">Assistente que sugere melhorias, gera resumos e personaliza a experiência de cada aluno.</p>
      </div>

      <!-- Card 4 -->
      <div style="
        background: #161330;
        border: 1px solid #272640;
        border-radius: 14px;
        padding: 28px;
      ">
        <div style="
          width: 48px; height: 48px;
          border-radius: 10px;
          background: rgba(236,72,153,0.1);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          font-size: 24px;
        ">🔒</div>
        <h3 style="
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 600;
          line-height: 1.3;
          color: #F2F2F2;
          margin: 0 0 12px 0;
        ">Segurança de verdade</h3>
        <p style="
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 14px;
          color: #9CA3AF;
          line-height: 1.5;
          margin: 0;
        ">Proteção anti-pirataria, controle de acesso granular e criptografia ponta a ponta no conteúdo.</p>
      </div>

      <!-- Card 5 -->
      <div style="
        background: #161330;
        border: 1px solid #272640;
        border-radius: 14px;
        padding: 28px;
      ">
        <div style="
          width: 48px; height: 48px;
          border-radius: 10px;
          background: rgba(168,85,247,0.1);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          font-size: 24px;
        ">💳</div>
        <h3 style="
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 600;
          line-height: 1.3;
          color: #F2F2F2;
          margin: 0 0 12px 0;
        ">Checkout otimizado</h3>
        <p style="
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 14px;
          color: #9CA3AF;
          line-height: 1.5;
          margin: 0;
        ">Página de vendas integrada, upsell automático e split de pagamento. Receba em PIX, cartão ou boleto.</p>
      </div>

      <!-- Card 6 -->
      <div style="
        background: #161330;
        border: 1px solid #272640;
        border-radius: 14px;
        padding: 28px;
      ">
        <div style="
          width: 48px; height: 48px;
          border-radius: 10px;
          background: rgba(236,72,153,0.1);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          font-size: 24px;
        ">🚀</div>
        <h3 style="
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 600;
          line-height: 1.3;
          color: #F2F2F2;
          margin: 0 0 12px 0;
        ">Comunidade integrada</h3>
        <p style="
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 14px;
          color: #9CA3AF;
          line-height: 1.5;
          margin: 0;
        ">Fórum, chat ao vivo e gamificação. Seus alunos engajam entre si e reduzem churn naturalmente.</p>
      </div>
    </div>
  </section>
</body>
</html>
```

### Social Proof / Stats

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#0C0A1A;">
  <section style="padding: 80px 24px; background: #0C0A1A;">
    <div style="max-width: 1200px; margin: 0 auto;">
      <!-- Stats row -->
      <div style="
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 32px;
        text-align: center;
        margin-bottom: 64px;
      ">
        <!-- Stat 1 -->
        <div>
          <div style="
            font-family: 'Syne', sans-serif;
            font-size: 56px;
            font-weight: 800;
            line-height: 1.05;
            letter-spacing: -0.03em;
            background: linear-gradient(135deg, #A855F7, #EC4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 8px;
          ">2.4K+</div>
          <div style="
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 14px;
            color: #9CA3AF;
            line-height: 1.5;
          ">Criadores ativos</div>
        </div>

        <!-- Stat 2 -->
        <div>
          <div style="
            font-family: 'Syne', sans-serif;
            font-size: 56px;
            font-weight: 800;
            line-height: 1.05;
            letter-spacing: -0.03em;
            background: linear-gradient(135deg, #A855F7, #EC4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 8px;
          ">R$18M</div>
          <div style="
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 14px;
            color: #9CA3AF;
            line-height: 1.5;
          ">Processados por mês</div>
        </div>

        <!-- Stat 3 -->
        <div>
          <div style="
            font-family: 'Syne', sans-serif;
            font-size: 56px;
            font-weight: 800;
            line-height: 1.05;
            letter-spacing: -0.03em;
            background: linear-gradient(135deg, #A855F7, #EC4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 8px;
          ">99.9%</div>
          <div style="
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 14px;
            color: #9CA3AF;
            line-height: 1.5;
          ">Uptime garantido</div>
        </div>

        <!-- Stat 4 -->
        <div>
          <div style="
            font-family: 'Syne', sans-serif;
            font-size: 56px;
            font-weight: 800;
            line-height: 1.05;
            letter-spacing: -0.03em;
            background: linear-gradient(135deg, #A855F7, #EC4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 8px;
          ">&lt;2min</div>
          <div style="
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 14px;
            color: #9CA3AF;
            line-height: 1.5;
          ">Para publicar seu primeiro curso</div>
        </div>
      </div>

      <!-- Testimonial cards -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
        <!-- Testimonial 1 -->
        <div style="
          background: #161330;
          border: 1px solid #272640;
          border-radius: 14px;
          padding: 28px;
        ">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="
              width: 40px; height: 40px;
              border-radius: 9999px;
              background: linear-gradient(135deg, #A855F7, #EC4899);
              display: flex; align-items: center; justify-content: center;
              font-size: 16px; color: #FFFFFF; font-family: 'Syne', sans-serif; font-weight: 700;
            ">M</div>
            <div>
              <div style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; font-weight: 700; color: #F2F2F2;">Marina Costa</div>
              <div style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 13px; color: #9CA3AF;">@marinacosta.edu</div>
            </div>
          </div>
          <p style="
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 14px;
            color: #D8B4FE;
            line-height: 1.5;
            margin: 0;
          ">"Migrei da Hotmart e em 30 dias minha retenção subiu 40%. A experiência do aluno mudou completamente."</p>
        </div>

        <!-- Testimonial 2 -->
        <div style="
          background: #161330;
          border: 1px solid #272640;
          border-radius: 14px;
          padding: 28px;
        ">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="
              width: 40px; height: 40px;
              border-radius: 9999px;
              background: linear-gradient(135deg, #A855F7, #EC4899);
              display: flex; align-items: center; justify-content: center;
              font-size: 16px; color: #FFFFFF; font-family: 'Syne', sans-serif; font-weight: 700;
            ">R</div>
            <div>
              <div style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; font-weight: 700; color: #F2F2F2;">Rafael Mendes</div>
              <div style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 13px; color: #9CA3AF;">CEO, DevSchool</div>
            </div>
          </div>
          <p style="
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 14px;
            color: #D8B4FE;
            line-height: 1.5;
            margin: 0;
          ">"Finalmente uma plataforma que pensa como desenvolvedor. API robusta, webhooks funcionais e zero dor de cabeça."</p>
        </div>

        <!-- Testimonial 3 -->
        <div style="
          background: #161330;
          border: 1px solid #272640;
          border-radius: 14px;
          padding: 28px;
        ">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="
              width: 40px; height: 40px;
              border-radius: 9999px;
              background: linear-gradient(135deg, #A855F7, #EC4899);
              display: flex; align-items: center; justify-content: center;
              font-size: 16px; color: #FFFFFF; font-family: 'Syne', sans-serif; font-weight: 700;
            ">A</div>
            <div>
              <div style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; font-weight: 700; color: #F2F2F2;">Ana Beatriz Lima</div>
              <div style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 13px; color: #9CA3AF;">+12K alunos ativos</div>
            </div>
          </div>
          <p style="
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 14px;
            color: #D8B4FE;
            line-height: 1.5;
            margin: 0;
          ">"A comunidade integrada é absurda. Meu churn caiu pela metade só com a gamificação nativa."</p>
        </div>
      </div>
    </div>
  </section>
</body>
</html>
```

### CTA Section

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#0C0A1A;">
  <section style="padding: 80px 24px; background: #0C0A1A;">
    <div style="
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
      padding: 64px 48px;
      border-radius: 20px;
      background: #161330;
      border: 1px solid #272640;
      position: relative;
      overflow: hidden;
    ">
      <!-- Background glow -->
      <div style="
        position: absolute;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(168,85,247,0.12) 0%, rgba(236,72,153,0.06) 50%, transparent 70%);
        pointer-events: none;
      "></div>

      <h2 style="
        font-family: 'Syne', sans-serif;
        font-size: 40px;
        font-weight: 700;
        line-height: 1.15;
        letter-spacing: -0.02em;
        color: #F2F2F2;
        margin: 0 0 16px 0;
        position: relative;
      ">Pronto para escalar seu conhecimento?</h2>
      <p style="
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 16px;
        color: #9CA3AF;
        line-height: 1.6;
        margin: 0 0 32px 0;
        position: relative;
      ">Comece gratuitamente. Sem cartão de crédito. Migre seus alunos em menos de 5 minutos.</p>

      <div style="display: flex; gap: 16px; justify-content: center; position: relative;">
        <!-- Primary -->
        <a href="#" style="
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 28px;
          border-radius: 10px;
          background: linear-gradient(135deg, #A855F7, #EC4899);
          color: #FFFFFF;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          box-shadow: 0 0 40px rgba(168,85,247,0.15);
        ">Criar minha plataforma</a>

        <!-- Secondary -->
        <a href="#" style="
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 28px;
          border-radius: 10px;
          background: rgba(168,85,247,0.1);
          color: #C084FC;
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid rgba(168,85,247,0.2);
        ">Falar com especialista</a>
      </div>
    </div>
  </section>
</body>
</html>
```

### Pricing Card

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#0C0A1A;">
  <section style="padding: 80px 24px; background: #0C0A1A;">
    <div style="max-width: 1200px; margin: 0 auto;">
      <!-- Section header -->
      <div style="text-align: center; margin-bottom: 64px;">
        <span style="
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #A855F7; display: block; margin-bottom: 16px;
        ">Planos</span>
        <h2 style="
          font-family: 'Syne', sans-serif;
          font-size: 40px; font-weight: 700;
          line-height: 1.15; letter-spacing: -0.02em;
          color: #F2F2F2; margin: 0;
        ">Escolha seu ritmo de crescimento</h2>
      </div>

      <!-- Pricing grid -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: start;">

        <!-- Starter -->
        <div style="
          background: #161330;
          border: 1px solid #272640;
          border-radius: 14px;
          padding: 28px;
        ">
          <span style="
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 11px; font-weight: 700;
            letter-spacing: 0.08em; text-transform: uppercase;
            color: #9CA3AF; display: block; margin-bottom: 16px;
          ">Starter</span>
          <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px;">
            <span style="font-family: 'Syne', sans-serif; font-size: 40px; font-weight: 700; color: #F2F2F2;">R$97</span>
            <span style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF;">/mês</span>
          </div>
          <p style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF; line-height: 1.5; margin: 0 0 24px 0;">
            Para criadores que estão começando a monetizar.
          </p>
          <ul style="list-style: none; padding: 0; margin: 0 0 24px 0;">
            <li style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #F2F2F2; padding: 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #34D399;">&#10003;</span> Até 500 alunos
            </li>
            <li style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #F2F2F2; padding: 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #34D399;">&#10003;</span> 3 cursos ativos
            </li>
            <li style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #F2F2F2; padding: 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #34D399;">&#10003;</span> Checkout integrado
            </li>
            <li style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF; padding: 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #9CA3AF;">&#8212;</span> Comunidade
            </li>
            <li style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF; padding: 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #9CA3AF;">&#8212;</span> IA integrada
            </li>
          </ul>
          <a href="#" style="
            display: block; text-align: center;
            padding: 14px 28px; border-radius: 10px;
            background: rgba(168,85,247,0.1);
            color: #C084FC;
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 15px; font-weight: 500;
            text-decoration: none;
            border: 1px solid rgba(168,85,247,0.2);
          ">Começar grátis</a>
        </div>

        <!-- Pro (highlighted) -->
        <div style="
          background: #161330;
          border: 2px solid #A855F7;
          border-radius: 14px;
          padding: 28px;
          position: relative;
          box-shadow: 0 0 40px rgba(168,85,247,0.1);
        ">
          <!-- Badge -->
          <div style="
            position: absolute;
            top: -12px; left: 50%;
            transform: translateX(-50%);
            padding: 4px 16px;
            border-radius: 9999px;
            background: linear-gradient(135deg, #A855F7, #EC4899);
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 11px; font-weight: 700;
            letter-spacing: 0.08em; text-transform: uppercase;
            color: #FFFFFF;
          ">Mais popular</div>
          <span style="
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 11px; font-weight: 700;
            letter-spacing: 0.08em; text-transform: uppercase;
            color: #A855F7; display: block; margin-bottom: 16px;
          ">Pro</span>
          <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px;">
            <span style="font-family: 'Syne', sans-serif; font-size: 40px; font-weight: 700; color: #F2F2F2;">R$297</span>
            <span style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF;">/mês</span>
          </div>
          <p style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF; line-height: 1.5; margin: 0 0 24px 0;">
            Para criadores que querem escalar com inteligência.
          </p>
          <ul style="list-style: none; padding: 0; margin: 0 0 24px 0;">
            <li style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #F2F2F2; padding: 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #34D399;">&#10003;</span> Alunos ilimitados
            </li>
            <li style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #F2F2F2; padding: 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #34D399;">&#10003;</span> Cursos ilimitados
            </li>
            <li style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #F2F2F2; padding: 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #34D399;">&#10003;</span> Comunidade integrada
            </li>
            <li style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #F2F2F2; padding: 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #34D399;">&#10003;</span> IA integrada
            </li>
            <li style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #F2F2F2; padding: 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #34D399;">&#10003;</span> Domínio personalizado
            </li>
          </ul>
          <a href="#" style="
            display: block; text-align: center;
            padding: 14px 28px; border-radius: 10px;
            background: linear-gradient(135deg, #A855F7, #EC4899);
            color: #FFFFFF;
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 15px; font-weight: 600;
            text-decoration: none;
            box-shadow: 0 0 40px rgba(168,85,247,0.15);
          ">Assinar Pro</a>
        </div>

        <!-- Enterprise -->
        <div style="
          background: #161330;
          border: 1px solid #272640;
          border-radius: 14px;
          padding: 28px;
        ">
          <span style="
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 11px; font-weight: 700;
            letter-spacing: 0.08em; text-transform: uppercase;
            color: #9CA3AF; display: block; margin-bottom: 16px;
          ">Enterprise</span>
          <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px;">
            <span style="font-family: 'Syne', sans-serif; font-size: 40px; font-weight: 700; color: #F2F2F2;">Custom</span>
          </div>
          <p style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF; line-height: 1.5; margin: 0 0 24px 0;">
            Para empresas e operações de alto volume.
          </p>
          <ul style="list-style: none; padding: 0; margin: 0 0 24px 0;">
            <li style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #F2F2F2; padding: 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #34D399;">&#10003;</span> Tudo do Pro
            </li>
            <li style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #F2F2F2; padding: 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #34D399;">&#10003;</span> White-label completo
            </li>
            <li style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #F2F2F2; padding: 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #34D399;">&#10003;</span> API dedicada
            </li>
            <li style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #F2F2F2; padding: 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #34D399;">&#10003;</span> SLA 99.99%
            </li>
            <li style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #F2F2F2; padding: 8px 0; display: flex; align-items: center; gap: 8px;">
              <span style="color: #34D399;">&#10003;</span> Suporte prioritário
            </li>
          </ul>
          <a href="#" style="
            display: block; text-align: center;
            padding: 14px 28px; border-radius: 10px;
            background: rgba(168,85,247,0.1);
            color: #C084FC;
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 15px; font-weight: 500;
            text-decoration: none;
            border: 1px solid rgba(168,85,247,0.2);
          ">Falar com vendas</a>
        </div>
      </div>
    </div>
  </section>
</body>
</html>
```

### Footer

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#0C0A1A;">
  <footer style="padding: 64px 24px 32px; background: #0C0A1A; border-top: 1px solid #272640;">
    <div style="max-width: 1200px; margin: 0 auto;">
      <!-- Footer grid -->
      <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px;">
        <!-- Brand column -->
        <div>
          <div style="
            font-family: 'Syne', sans-serif;
            font-size: 22px; font-weight: 700;
            background: linear-gradient(135deg, #A855F7, #EC4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 16px;
          ">Specta</div>
          <p style="
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 14px; color: #9CA3AF;
            line-height: 1.5; max-width: 280px; margin: 0;
          ">A plataforma para criadores que querem mais do que apenas hospedar conteúdo.</p>
        </div>

        <!-- Product -->
        <div>
          <span style="
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 11px; font-weight: 700;
            letter-spacing: 0.08em; text-transform: uppercase;
            color: #F2F2F2; display: block; margin-bottom: 16px;
          ">Produto</span>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 12px;"><a href="#" style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF; text-decoration: none;">Funcionalidades</a></li>
            <li style="margin-bottom: 12px;"><a href="#" style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF; text-decoration: none;">Planos</a></li>
            <li style="margin-bottom: 12px;"><a href="#" style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF; text-decoration: none;">Integrações</a></li>
            <li style="margin-bottom: 12px;"><a href="#" style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF; text-decoration: none;">Changelog</a></li>
          </ul>
        </div>

        <!-- Company -->
        <div>
          <span style="
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 11px; font-weight: 700;
            letter-spacing: 0.08em; text-transform: uppercase;
            color: #F2F2F2; display: block; margin-bottom: 16px;
          ">Empresa</span>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 12px;"><a href="#" style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF; text-decoration: none;">Sobre nós</a></li>
            <li style="margin-bottom: 12px;"><a href="#" style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF; text-decoration: none;">Blog</a></li>
            <li style="margin-bottom: 12px;"><a href="#" style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF; text-decoration: none;">Carreiras</a></li>
            <li style="margin-bottom: 12px;"><a href="#" style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF; text-decoration: none;">Contato</a></li>
          </ul>
        </div>

        <!-- Legal -->
        <div>
          <span style="
            font-family: 'Cabinet Grotesk', sans-serif;
            font-size: 11px; font-weight: 700;
            letter-spacing: 0.08em; text-transform: uppercase;
            color: #F2F2F2; display: block; margin-bottom: 16px;
          ">Legal</span>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 12px;"><a href="#" style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF; text-decoration: none;">Privacidade</a></li>
            <li style="margin-bottom: 12px;"><a href="#" style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF; text-decoration: none;">Termos de uso</a></li>
            <li style="margin-bottom: 12px;"><a href="#" style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 14px; color: #9CA3AF; text-decoration: none;">LGPD</a></li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div style="
        border-top: 1px solid #272640;
        padding-top: 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <span style="font-family: 'Cabinet Grotesk', sans-serif; font-size: 13px; color: #9CA3AF;">
          &copy; 2026 Specta. Todos os direitos reservados.
        </span>
        <div style="display: flex; gap: 16px;">
          <a href="#" style="color: #9CA3AF; text-decoration: none; font-size: 14px;">Twitter</a>
          <a href="#" style="color: #9CA3AF; text-decoration: none; font-size: 14px;">Instagram</a>
          <a href="#" style="color: #9CA3AF; text-decoration: none; font-size: 14px;">LinkedIn</a>
          <a href="#" style="color: #9CA3AF; text-decoration: none; font-size: 14px;">YouTube</a>
        </div>
      </div>
    </div>
  </footer>
</body>
</html>
```

### Regras de Layout

| Propriedade | Valor | Nota |
|-------------|-------|------|
| Padding de seção | `80px` vertical | Consistente entre todas as seções |
| Max-width do conteúdo | `1200px` | Centralizado com `margin: 0 auto` |
| Gap entre cards | `24px` | Grid gap padrão |
| Padding interno de card | `28px` | Mais generoso que a média — feel premium |
| Border-radius padrão | `10px` | Botões, inputs, elementos genéricos |
| Border-radius de card | `14px` | Cards e containers maiores |
| Border-radius de badge | `9999px` | Labels, pills, tags |

**Responsividade:**
- Em telas menores que 768px, grids de 3 colunas viram 1 coluna
- Em telas menores que 1024px, grids de 4 colunas viram 2 colunas
- H1 reduz para ~36px em mobile, H2 para ~28px
- Section padding reduz para `48px 16px` em mobile
- Botões do Hero empilham verticalmente em mobile

---

## Instagram

### Carrossel (1080 x 1350px)

#### Slide de Capa

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#000;">
  <div style="
    width: 1080px;
    height: 1350px;
    background: #0C0A1A;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 80px 72px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  ">
    <!-- Background glow -->
    <div style="
      position: absolute;
      top: -200px; right: -200px;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%);
      pointer-events: none;
    "></div>
    <div style="
      position: absolute;
      bottom: -150px; left: -150px;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%);
      pointer-events: none;
    "></div>

    <!-- Top: logo + label -->
    <div style="position: relative;">
      <div style="
        font-family: 'Syne', sans-serif;
        font-size: 28px; font-weight: 700;
        background: linear-gradient(135deg, #A855F7, #EC4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 24px;
      ">Specta</div>
      <div style="
        display: inline-block;
        padding: 8px 16px;
        border-radius: 9999px;
        border: 1px solid rgba(168,85,247,0.2);
        background: rgba(168,85,247,0.1);
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 15px; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: #C084FC;
      ">Guia completo</div>
    </div>

    <!-- Center: headline -->
    <div style="position: relative;">
      <h1 style="
        font-family: 'Syne', sans-serif;
        font-size: 72px;
        font-weight: 800;
        line-height: 1.05;
        letter-spacing: -0.03em;
        color: #F2F2F2;
        margin: 0 0 24px 0;
      ">5 erros que matam a retenção dos seus alunos</h1>
      <p style="
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 24px;
        color: #9CA3AF;
        line-height: 1.5;
        margin: 0;
      ">E como corrigir cada um deles em menos de 1 hora.</p>
    </div>

    <!-- Bottom: progress bar + swipe -->
    <div style="display: flex; justify-content: space-between; align-items: center; position: relative;">
      <!-- Progress bar -->
      <div style="display: flex; gap: 6px; align-items: center;">
        <div style="width: 40px; height: 4px; border-radius: 9999px; background: linear-gradient(135deg, #A855F7, #EC4899);"></div>
        <div style="width: 24px; height: 4px; border-radius: 9999px; background: #272640;"></div>
        <div style="width: 24px; height: 4px; border-radius: 9999px; background: #272640;"></div>
        <div style="width: 24px; height: 4px; border-radius: 9999px; background: #272640;"></div>
        <div style="width: 24px; height: 4px; border-radius: 9999px; background: #272640;"></div>
        <div style="width: 24px; height: 4px; border-radius: 9999px; background: #272640;"></div>
      </div>
      <!-- Swipe indicator -->
      <span style="
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 16px; color: #9CA3AF;
      ">Arraste &rarr;</span>
    </div>
  </div>
</body>
</html>
```

#### Slide Interno (conteúdo)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#000;">
  <div style="
    width: 1080px;
    height: 1350px;
    background: #0C0A1A;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 80px 72px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  ">
    <!-- Top: number badge -->
    <div style="position: relative;">
      <div style="
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 64px; height: 64px;
        border-radius: 14px;
        background: linear-gradient(135deg, #A855F7, #EC4899);
        font-family: 'Syne', sans-serif;
        font-size: 32px; font-weight: 800;
        color: #FFFFFF;
      ">01</div>
    </div>

    <!-- Center: content -->
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; position: relative;">
      <h2 style="
        font-family: 'Syne', sans-serif;
        font-size: 52px;
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: -0.02em;
        color: #F2F2F2;
        margin: 0 0 32px 0;
      ">Conteúdo sem estrutura de progressão</h2>
      <p style="
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 22px;
        color: #D8B4FE;
        line-height: 1.5;
        margin: 0 0 32px 0;
      ">Quando o aluno não sabe onde está e para onde vai, ele desiste. Simples assim.</p>
      <!-- Tip box -->
      <div style="
        background: rgba(168,85,247,0.1);
        border: 1px solid rgba(168,85,247,0.2);
        border-radius: 14px;
        padding: 24px;
      ">
        <span style="
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #A855F7; display: block; margin-bottom: 8px;
        ">Como corrigir</span>
        <p style="
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 20px;
          color: #F2F2F2;
          line-height: 1.5;
          margin: 0;
        ">Crie trilhas de aprendizado com barra de progresso visível. O aluno precisa sentir que está avançando.</p>
      </div>
    </div>

    <!-- Bottom: progress bar -->
    <div style="display: flex; gap: 6px; align-items: center; position: relative;">
      <div style="width: 24px; height: 4px; border-radius: 9999px; background: #272640;"></div>
      <div style="width: 40px; height: 4px; border-radius: 9999px; background: linear-gradient(135deg, #A855F7, #EC4899);"></div>
      <div style="width: 24px; height: 4px; border-radius: 9999px; background: #272640;"></div>
      <div style="width: 24px; height: 4px; border-radius: 9999px; background: #272640;"></div>
      <div style="width: 24px; height: 4px; border-radius: 9999px; background: #272640;"></div>
      <div style="width: 24px; height: 4px; border-radius: 9999px; background: #272640;"></div>
    </div>
  </div>
</body>
</html>
```

#### Slide de CTA (final)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#000;">
  <div style="
    width: 1080px;
    height: 1350px;
    background: #0C0A1A;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 80px 72px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  ">
    <!-- Background glows -->
    <div style="
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 800px; height: 800px;
      background: radial-gradient(circle, rgba(168,85,247,0.12) 0%, rgba(236,72,153,0.06) 40%, transparent 70%);
      pointer-events: none;
    "></div>

    <!-- Logo -->
    <div style="
      font-family: 'Syne', sans-serif;
      font-size: 36px; font-weight: 700;
      background: linear-gradient(135deg, #A855F7, #EC4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 48px;
      position: relative;
    ">Specta</div>

    <!-- CTA headline -->
    <h2 style="
      font-family: 'Syne', sans-serif;
      font-size: 56px;
      font-weight: 800;
      line-height: 1.1;
      letter-spacing: -0.03em;
      color: #F2F2F2;
      margin: 0 0 24px 0;
      position: relative;
    ">Quer implementar tudo isso hoje?</h2>
    <p style="
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: 24px;
      color: #9CA3AF;
      line-height: 1.5;
      margin: 0 0 48px 0;
      position: relative;
    ">Link na bio para testar grátis por 14 dias.</p>

    <!-- CTA button visual -->
    <div style="
      display: inline-block;
      padding: 20px 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, #A855F7, #EC4899);
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: 22px; font-weight: 600;
      color: #FFFFFF;
      box-shadow: 0 0 60px rgba(168,85,247,0.2);
      position: relative;
    ">Começar agora</div>

    <!-- Social handles -->
    <div style="
      position: absolute;
      bottom: 80px;
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: 18px;
      color: #9CA3AF;
    ">@specta.io | specta.io</div>

    <!-- Progress bar -->
    <div style="
      position: absolute;
      bottom: 40px;
      display: flex; gap: 6px;
    ">
      <div style="width: 24px; height: 4px; border-radius: 9999px; background: #272640;"></div>
      <div style="width: 24px; height: 4px; border-radius: 9999px; background: #272640;"></div>
      <div style="width: 24px; height: 4px; border-radius: 9999px; background: #272640;"></div>
      <div style="width: 24px; height: 4px; border-radius: 9999px; background: #272640;"></div>
      <div style="width: 24px; height: 4px; border-radius: 9999px; background: #272640;"></div>
      <div style="width: 40px; height: 4px; border-radius: 9999px; background: linear-gradient(135deg, #A855F7, #EC4899);"></div>
    </div>
  </div>
</body>
</html>
```

#### Componentes Reutilizáveis para Carrossel

**Barra de progresso** (ajuste a posição do indicador ativo para cada slide):
```html
<div style="display: flex; gap: 6px; align-items: center;">
  <!-- Inactive -->
  <div style="width: 24px; height: 4px; border-radius: 9999px; background: #272640;"></div>
  <!-- Active -->
  <div style="width: 40px; height: 4px; border-radius: 9999px; background: linear-gradient(135deg, #A855F7, #EC4899);"></div>
  <!-- Inactive -->
  <div style="width: 24px; height: 4px; border-radius: 9999px; background: #272640;"></div>
</div>
```

**Seta de swipe:**
```html
<span style="
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 16px; color: #9CA3AF;
">Arraste &rarr;</span>
```

**Badge numerada:**
```html
<div style="
  display: inline-flex;
  align-items: center; justify-content: center;
  width: 64px; height: 64px;
  border-radius: 14px;
  background: linear-gradient(135deg, #A855F7, #EC4899);
  font-family: 'Syne', sans-serif;
  font-size: 32px; font-weight: 800;
  color: #FFFFFF;
">01</div>
```

**Label pill:**
```html
<div style="
  display: inline-block;
  padding: 8px 16px;
  border-radius: 9999px;
  border: 1px solid rgba(168,85,247,0.2);
  background: rgba(168,85,247,0.1);
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 15px; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: #C084FC;
">Dica especial</div>
```

### Post Único (1080 x 1080px)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#000;">
  <div style="
    width: 1080px;
    height: 1080px;
    background: #0C0A1A;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 72px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  ">
    <!-- Background glow -->
    <div style="
      position: absolute;
      top: -150px; right: -150px;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%);
      pointer-events: none;
    "></div>

    <!-- Top: logo -->
    <div style="
      font-family: 'Syne', sans-serif;
      font-size: 24px; font-weight: 700;
      background: linear-gradient(135deg, #A855F7, #EC4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      position: relative;
    ">Specta</div>

    <!-- Center: content -->
    <div style="position: relative;">
      <h1 style="
        font-family: 'Syne', sans-serif;
        font-size: 64px;
        font-weight: 800;
        line-height: 1.05;
        letter-spacing: -0.03em;
        color: #F2F2F2;
        margin: 0 0 20px 0;
      ">A retenção do seu curso depende de
      <span style="
        background: linear-gradient(135deg, #A855F7, #EC4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      ">experiência</span></h1>
      <p style="
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 22px;
        color: #9CA3AF;
        line-height: 1.5;
        margin: 0;
      ">Não de quantidade de módulos.</p>
    </div>

    <!-- Bottom: handle -->
    <div style="
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: 16px; color: #9CA3AF;
      position: relative;
    ">@specta.io</div>
  </div>
</body>
</html>
```

### Stories (1080 x 1920px)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#000;">
  <div style="
    width: 1080px;
    height: 1920px;
    background: #0C0A1A;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 120px 72px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  ">
    <!-- Background glow -->
    <div style="
      position: absolute;
      top: 30%; left: 50%;
      transform: translate(-50%, -50%);
      width: 700px; height: 700px;
      background: radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(236,72,153,0.08) 40%, transparent 70%);
      pointer-events: none;
    "></div>

    <!-- Label -->
    <div style="
      display: inline-block;
      padding: 8px 20px;
      border-radius: 9999px;
      border: 1px solid rgba(168,85,247,0.2);
      background: rgba(168,85,247,0.1);
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: 16px; font-weight: 700;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: #C084FC;
      margin-bottom: 40px;
      position: relative;
    ">Novidade</div>

    <!-- Headline -->
    <h1 style="
      font-family: 'Syne', sans-serif;
      font-size: 72px;
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: -0.03em;
      color: #F2F2F2;
      margin: 0 0 24px 0;
      position: relative;
    ">IA que personaliza cada aula</h1>

    <!-- Body -->
    <p style="
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: 26px;
      color: #9CA3AF;
      line-height: 1.5;
      margin: 0 0 48px 0;
      max-width: 800px;
      position: relative;
    ">Cada aluno recebe conteúdo adaptado ao seu ritmo. Sem configuração manual.</p>

    <!-- CTA -->
    <div style="
      display: inline-block;
      padding: 20px 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, #A855F7, #EC4899);
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: 22px; font-weight: 600;
      color: #FFFFFF;
      box-shadow: 0 0 60px rgba(168,85,247,0.2);
      position: relative;
    ">Saiba mais</div>

    <!-- Swipe up indicator -->
    <div style="
      position: absolute;
      bottom: 120px;
      font-family: 'Cabinet Grotesk', sans-serif;
      font-size: 16px; color: #9CA3AF;
    ">&uarr; Arraste para cima</div>
  </div>
</body>
</html>
```

---

## YouTube

### Thumbnail (1280 x 720px)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#000;">
  <div style="
    width: 1280px;
    height: 720px;
    background: #0C0A1A;
    display: flex;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  ">
    <!-- Background glow -->
    <div style="
      position: absolute;
      top: -100px; right: -100px;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%);
      pointer-events: none;
    "></div>

    <!-- Left side: text (60%) -->
    <div style="
      width: 60%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 48px 56px;
      position: relative;
      z-index: 1;
    ">
      <!-- Badge -->
      <div style="
        display: inline-block;
        padding: 6px 14px;
        border-radius: 9999px;
        background: linear-gradient(135deg, #A855F7, #EC4899);
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 14px; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: #FFFFFF;
        margin-bottom: 20px;
        width: fit-content;
      ">Tutorial</div>

      <!-- Title: MAX 5 WORDS for thumbnails -->
      <h1 style="
        font-family: 'Syne', sans-serif;
        font-size: 64px;
        font-weight: 800;
        line-height: 1.05;
        letter-spacing: -0.03em;
        color: #F2F2F2;
        margin: 0;
      ">Pare de perder alunos</h1>
    </div>

    <!-- Right side: face/image placeholder (40%) -->
    <div style="
      width: 40%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <!-- Placeholder for face/product image -->
      <div style="
        width: 300px;
        height: 400px;
        border-radius: 20px;
        background: linear-gradient(180deg, #1E1A40 0%, #161330 100%);
        border: 1px solid #272640;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 16px;
        color: #9CA3AF;
      ">Foto / Screenshot aqui</div>
    </div>

    <!-- Bottom-right: logo watermark -->
    <div style="
      position: absolute;
      bottom: 20px; right: 24px;
      font-family: 'Syne', sans-serif;
      font-size: 18px; font-weight: 700;
      background: linear-gradient(135deg, #A855F7, #EC4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    ">Specta</div>
  </div>
</body>
</html>
```

**Regras para thumbnails:**
- Máximo 5 palavras no título principal
- Alto contraste: texto branco/claro sobre fundo escuro
- Layout 60/40: texto à esquerda, rosto ou imagem à direita
- Badge de categoria (Tutorial, Dica, etc.) para contexto rápido
- Logo discreto no canto inferior direito
- Nunca use fonte menor que 48px no título

### Banner (2560 x 1440px)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  <link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#000;">
  <div style="
    width: 2560px;
    height: 1440px;
    background: #0C0A1A;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  ">
    <!-- Background glows -->
    <div style="
      position: absolute;
      top: -200px; left: 30%;
      width: 800px; height: 800px;
      background: radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%);
      pointer-events: none;
    "></div>
    <div style="
      position: absolute;
      bottom: -200px; right: 30%;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%);
      pointer-events: none;
    "></div>

    <!--
      SAFE AREA GUIDE (YouTube banner):
      - Full banner: 2560x1440
      - Desktop visible: 2560x423 (centered vertically — top 508px and bottom 508px are cropped)
      - Mobile visible: 1546x423 (centered horizontally — 507px cropped each side)
      - TV visible: full 2560x1440

      Keep critical content within the center 1546x423 zone.
    -->

    <!-- Safe area indicator (remove in production) -->
    <div style="
      position: absolute;
      top: 508px; left: 507px;
      width: 1546px; height: 423px;
      border: 2px dashed rgba(168,85,247,0.3);
      pointer-events: none;
      z-index: 10;
    "></div>

    <!-- Content (within safe area) -->
    <div style="position: relative; z-index: 1;">
      <!-- Logo -->
      <div style="
        font-family: 'Syne', sans-serif;
        font-size: 56px; font-weight: 800;
        background: linear-gradient(135deg, #A855F7, #EC4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 16px;
      ">Specta</div>

      <!-- Tagline -->
      <p style="
        font-family: 'Cabinet Grotesk', sans-serif;
        font-size: 28px;
        color: #9CA3AF;
        line-height: 1.5;
        margin: 0;
      ">Transforme conhecimento em plataforma. Tutoriais toda semana.</p>
    </div>
  </div>
</body>
</html>
```

**Áreas seguras do banner YouTube:**
- **TV (full):** 2560 x 1440px — tudo visível
- **Desktop:** 2560 x 423px — centrado verticalmente (corta 508px em cima e embaixo)
- **Mobile:** 1546 x 423px — centrado horizontal e verticalmente
- **Regra de ouro:** todo conteúdo crítico (logo, tagline) dentro da zona central de 1546 x 423px

---

## Fotografia e Imagem

### Estilo Visual

- **Tom:** escuro, luminoso, tech-forward
- **Iluminação:** luz de borda (rim light) em tons purple/pink, fundo escuro
- **Textura:** leve grain digital, nunca liso demais
- **Composição:** clean, bastante espaço negativo, foco no sujeito

### Templates de Prompt para IA

**Retrato profissional (para foto de perfil ou about):**
```
Professional portrait, dark background #0C0A1A, purple rim light, soft pink accent light from below, tech executive aesthetic, shallow depth of field, film grain, 85mm lens, editorial quality, moody and confident
```

**Product shot (interface/app):**
```
Dark UI screenshot mockup, floating in dark space #0C0A1A, subtle purple glow behind screen, depth of field, isometric angle, premium SaaS aesthetic, clean and minimal, soft shadows
```

**Abstrato/decorativo (para backgrounds ou social):**
```
Abstract dark geometric shapes, deep navy purple background, glowing purple and pink edges, minimal, futuristic, low-poly subtle mesh, soft bokeh particles, 4K, digital art
```

**Cenário de trabalho (lifestyle):**
```
Creator working at desk, dark ambient lighting, monitor glow casting purple light on face, cozy tech setup, shallow depth of field, cinematic grain, editorial photography style
```

### Regras de Overlay

- Overlay escuro sobre fotos: `rgba(12, 10, 26, 0.7)` mínimo para garantir legibilidade
- Nunca usar foto sem overlay em fundo dark — o contraste fica inconsistente
- Glow por cima de foto: `rgba(168, 85, 247, 0.08)` como blend suave
- Fotos coloridas/quentes devem receber dessaturação (filter: `saturate(0.6)`) para harmonizar com a paleta

---

## Componentes (HTML Pronto)

### Botão Primário

```html
<a href="#" style="
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 28px;
  border-radius: 10px;
  background: linear-gradient(135deg, #A855F7, #EC4899);
  color: #FFFFFF;
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 0 40px rgba(168,85,247,0.15);
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
">Ação principal</a>
```

### Botão Secundário

```html
<a href="#" style="
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 28px;
  border-radius: 10px;
  background: rgba(168,85,247,0.1);
  color: #C084FC;
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  border: 1px solid rgba(168,85,247,0.2);
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
">Ação secundária</a>
```

### Card

```html
<div style="
  background: #161330;
  border: 1px solid #272640;
  border-radius: 14px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(12,10,26,0.4), 0 0 0 1px rgba(168,85,247,0.05);
">
  <h3 style="
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 600;
    line-height: 1.3; color: #F2F2F2;
    margin: 0 0 12px 0;
  ">Título do card</h3>
  <p style="
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 14px; color: #9CA3AF;
    line-height: 1.5; margin: 0;
  ">Descrição do conteúdo do card com informações relevantes.</p>
</div>
```

### Input

```html
<input type="text" placeholder="Seu email profissional" style="
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  background: #161330;
  border: 1px solid #272640;
  color: #F2F2F2;
  font-family: 'Cabinet Grotesk', sans-serif;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 200ms;
">
```

### Caixa de Destaque (Highlight Box)

```html
<div style="
  background: rgba(168,85,247,0.1);
  border: 1px solid rgba(168,85,247,0.2);
  border-radius: 14px;
  padding: 24px;
">
  <span style="
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: #A855F7; display: block; margin-bottom: 8px;
  ">Importante</span>
  <p style="
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 16px; color: #F2F2F2;
    line-height: 1.6; margin: 0;
  ">Conteúdo de destaque que precisa de atenção especial do leitor.</p>
</div>
```

### Lista com Ícones (positiva)

```html
<ul style="list-style: none; padding: 0; margin: 0;">
  <li style="
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 16px; color: #F2F2F2;
    padding: 10px 0;
    display: flex; align-items: center; gap: 12px;
    line-height: 1.5;
  ">
    <span style="color: #34D399; font-size: 18px;">&#10003;</span>
    Alunos ilimitados na plataforma
  </li>
  <li style="
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 16px; color: #F2F2F2;
    padding: 10px 0;
    display: flex; align-items: center; gap: 12px;
    line-height: 1.5;
  ">
    <span style="color: #34D399; font-size: 18px;">&#10003;</span>
    Checkout integrado com PIX e cartão
  </li>
</ul>
```

### Lista com Ícones (negativa)

```html
<ul style="list-style: none; padding: 0; margin: 0;">
  <li style="
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 16px; color: #9CA3AF;
    padding: 10px 0;
    display: flex; align-items: center; gap: 12px;
    line-height: 1.5;
  ">
    <span style="color: #F87171; font-size: 18px;">&#10007;</span>
    Depender de plataforma de terceiros
  </li>
  <li style="
    font-family: 'Cabinet Grotesk', sans-serif;
    font-size: 16px; color: #9CA3AF;
    padding: 10px 0;
    display: flex; align-items: center; gap: 12px;
    line-height: 1.5;
  ">
    <span style="color: #F87171; font-size: 18px;">&#10007;</span>
    Pagar taxa de 20% por venda
  </li>
</ul>
```

---

## Tom de Voz

### Personalidade

| Atributo | Descrição |
|----------|-----------|
| **Energia** | Alta — confiante, direto, sem rodeios |
| **Tom** | Tech-forward, creator-first, levemente provocador |
| **Registro** | Profissional mas acessível — colega que manja, não professor |
| **Proibido** | Corporativês, jargão vazio, tom paternalista, excesso de emojis |

### Exemplos de Copy

**Headlines (Syne, bold, curtas):**
- "Pare de hospedar. Comece a escalar."
- "Seu conteúdo merece mais que um link."
- "Plataforma própria em 5 minutos."
- "Retenção não é sorte. É design."
- "Monetize o que você já sabe."

**CTAs (Cabinet Grotesk, ação clara):**
- "Começar agora — é grátis"
- "Criar minha plataforma"
- "Ver como funciona"
- "Testar por 14 dias"
- "Falar com especialista"

**Descrições (Cabinet Grotesk, informativa):**
- "A plataforma all-in-one para criadores que querem controle total sobre a experiência do aluno."
- "Crie, publique e escale cursos online sem depender de marketplace."
- "Analytics em tempo real que mostram exatamente onde seus alunos travam — e como destravar."

**Microcopy (Cabinet Grotesk, leve):**
- "Sem cartão de crédito. Cancele quando quiser."
- "Setup em menos de 2 minutos."
- "Já ajudamos 2.400+ criadores a escalar."

---

## Anti-slop (O que NUNCA fazer)

### Cores

| Proibido | Por quê | Correto |
|----------|---------|---------|
| Gradiente purple-pink em backgrounds inteiros | Fica genérico e perde o impacto | Use apenas em CTAs e text highlights |
| Preto puro `#000000` como background | Fora da paleta, quebra a coerência | Use `#0C0A1A` (deep navy-purple) |
| Glow neon/cyberpunk (opacity > 0.2) | Specta é premium, não arcade | Glow sutil: opacity 0.1–0.15 |
| Cores de status (success, error) em elementos decorativos | Confunde semântica — verde é "ok", vermelho é "erro" | Reserve para feedback funcional |
| Branco puro `#FFFFFF` em texto | Fadiga visual em tema dark | Use `#F2F2F2` |

### Tipografia

| Proibido | Por quê | Correto |
|----------|---------|---------|
| Syne em parágrafos ou body | Pesada demais, prejudica leitura | Syne só em H1–H4 |
| Cabinet Grotesk em H1/H2 | Perde personalidade | Cabinet é body, Syne é heading |
| Misturar mais de 2 fontes na mesma peça | Poluição visual | Syne + Cabinet (+ JetBrains Mono se código) |
| Texto em uppercase sem letter-spacing | Ilegível e amador | Sempre `0.08em` com uppercase |
| Fontes do sistema como fallback primário | Quebra identidade | Sempre carregar CDN primeiro |

### Layout

| Proibido | Por quê | Correto |
|----------|---------|---------|
| Cards sem border | Somem no background escuro | Sempre `border: 1px solid #272640` |
| Border-radius de 4px ou menos | Fora do visual moderno da Specta | Mínimo 6px (`sm`), padrão 10px |
| Padding < 20px em cards | Visual apertado, não premium | Mínimo 28px |
| Seções sem padding vertical generoso | Conteúdo "colado", sem respiro | Mínimo 80px entre seções |
| Gradiente como border | Complexidade desnecessária | Border sólida + glow sutil |

### Imagem

| Proibido | Por quê | Correto |
|----------|---------|---------|
| Fotos stock genéricas sem tratamento | Quebra o tom dark premium | Dessaturar, aplicar overlay, ajustar tons |
| Imagens claras/brancas sem overlay | Contraste gritante com o fundo | Overlay `rgba(12,10,26,0.7)` mínimo |
| Screenshots sem moldura/sombra | Parecem soltas e amadoras | Use mock device ou card com shadow |
| Emojis como ícones primários | OK para social, ruim para LP/app | Use ícones SVG ou icon fonts |

### Copy

| Proibido | Por quê | Correto |
|----------|---------|---------|
| "Solução inovadora" / "Líder de mercado" | Genérico e vazio | Seja específico: "2.400+ criadores usam" |
| Headlines com mais de 8 palavras | Perde impacto | 3–7 palavras, direto ao ponto |
| CTAs vagos ("Saiba mais", "Clique aqui") | Zero urgência ou valor | Ação + benefício: "Criar minha plataforma" |
| Texto em inglês misturado com pt-BR | Inconsistente | Mantenha idioma consistente por peça |
| Parágrafos com mais de 3 linhas em social | Ninguém lê | Frases curtas, respiro visual |

---

*Guia gerado a partir dos tokens em `specta.yaml` v2. Autocontido — use sem precisar consultar o YAML.*
