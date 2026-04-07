# Rose Gold — Guia Prático

## Visao Geral

**Tema:** Luxo elegante com rosa e ouro. Dark com base burgundy profunda.
**Ideal para:** Beleza, moda, casamento, branding premium feminino, high-ticket.
**Fonte:** Estética de luxo premium beauty + fashion.
**Personalidade:** A assinatura visual é o contraste serif (Playfair Display) + sans-serif (DM Sans). Padding generoso — luxo respira. Gold usado com parcimônia (máx. 5%). Gradiente rose-gold somente em CTAs.

**Fontes:** Playfair Display (headings) + DM Sans (body) + DM Mono (código)
**CDN:** `https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap`

**Paleta resumida:**

| Token | Cor | Uso |
|-------|-----|-----|
| Background | `#1A0A14` | Fundo principal — burgundy profundo |
| Surface | `#261320` | Cards, inputs, áreas elevadas |
| Surface Elevated | `#33192D` | Elementos em destaque |
| Border | `#3D1E30` | Bordas padrão |
| Border Hover | `#5C2E4A` | Bordas em hover |
| Text | `#F0D4E4` | Texto principal — rosa claro |
| Text Secondary | `#D4A0C0` | Texto secundário |
| Text Muted | `#A67A94` | Labels, captions, placeholders |
| Primary | `#BE185D` | Rosa — ação principal |
| Primary Hover | `#F472B6` | Hover do primary |
| Accent | `#D4A574` | Ouro — destaques sparingly |
| Accent Hover | `#FBBF24` | Ouro hover |
| Success | `#34D399` | Sucesso |
| Info | `#F9A8D4` | Informação (rosa suave) |

---

## Tipografia — Regras de Uso

**Display (headings):** Playfair Display — serif clássica, elegante.
**Body:** DM Sans — sans-serif limpa e moderna.
**Mono:** DM Mono para trechos de código.
**Fallback:** `Georgia, 'Times New Roman', serif`

| Elemento | Fonte | Tamanho | Peso | Line-height | Extras |
|----------|-------|---------|------|-------------|--------|
| H1 | Playfair Display | 52px | 700 (Bold) | 1.1 | letter-spacing: -0.01em |
| H2 | Playfair Display | 38px | 600 (Semi) | 1.2 | — |
| H3 | Playfair Display | 28px | 600 (Semi) | 1.3 | — |
| H4 | DM Sans | 22px | 500 (Medium) | 1.35 | — |
| Body | DM Sans | 16px | 400 (Regular) | 1.7 | Arejado, elegante |
| Body SM | DM Sans | 14px | 400 (Regular) | 1.6 | — |
| Caption | DM Sans | 13px | 400 (Regular) | 1.5 | — |
| Label | DM Sans | 11px | 500 (Medium) | 1.4 | uppercase, letter-spacing: 0.1em |

**Regras:**
- Playfair Display **SOMENTE** em headings (H1, H2, H3). Nunca em body, labels ou botões.
- DM Sans para todo o resto — body, botões, labels, captions.
- O contraste serif + sans-serif **é a assinatura visual**. Nunca usar só uma das duas.
- Line-height 1.7 no body é obrigatório — o espaçamento arejado é parte da estética de luxo.
- Labels com letter-spacing 0.1em (mais aberto que o padrão) para elegância.

---

## Cores — Regras de Uso

**Filosofia:** Tons de rosa/burgundy muted como base, com ouro (`#D4A574`) como acento pontual. Nunca pink neon. Nunca gold dominante.

**Background:** Sempre `#1A0A14` (burgundy profundo). Nunca preto puro.
**Superfícies:** `#261320` para cards, `#33192D` para elementos elevados.
**Bordas:** `#3D1E30` padrão, `#5C2E4A` em hover.
**Texto:** `#F0D4E4` (principal rosa-claro), `#D4A0C0` (secundário), `#A67A94` (muted).
**Gradiente rose-gold:** `linear-gradient(135deg, #BE185D, #D4A574)` — **somente em CTAs e botões primários**. Nunca em backgrounds.
**Sombras:** Incluem glow sutil de rosa: `0 0 20px rgba(190,24,93,0.05)` — elegante, não chamativo.

**Hierarquia de ênfase:**
1. Gradiente rose-gold — ação principal (1 por seção)
2. `#BE185D` sólido — destaques secundários
3. `#D4A574` gold — acentos pontuais (ícones, linhas decorativas)
4. `#F0D4E4` — texto principal
5. `#D4A0C0` — texto de suporte

**Radii:** 8px padrão. Cards em 12px. Botões em 8px.

---

## Landing Pages

### Hero Section

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

<section style="background-color: #1A0A14; padding: 140px 24px 96px; text-align: center; font-family: 'DM Sans', Georgia, serif; position: relative; overflow: hidden;">
  <!-- Rose glow -->
  <div style="position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 700px; height: 700px; background: radial-gradient(circle, rgba(190,24,93,0.12) 0%, transparent 70%); pointer-events: none;"></div>
  <!-- Gold glow -->
  <div style="position: absolute; top: -100px; right: 10%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(212,165,116,0.06) 0%, transparent 70%); pointer-events: none;"></div>

  <div style="position: relative; z-index: 1; max-width: 720px; margin: 0 auto;">
    <div style="display: inline-block; border: 1px solid #3D1E30; border-radius: 9999px; padding: 8px 20px; margin-bottom: 32px;">
      <span style="font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; color: #D4A574; letter-spacing: 0.1em; text-transform: uppercase;">Coleção Exclusiva 2026</span>
    </div>

    <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 52px; font-weight: 700; color: #F0D4E4; line-height: 1.1; letter-spacing: -0.01em; margin: 0 0 24px;">
      Sua beleza,<br>elevada.
    </h1>

    <p style="font-family: 'DM Sans', sans-serif; font-size: 18px; font-weight: 400; color: #D4A0C0; line-height: 1.7; margin: 0 0 48px; max-width: 520px; margin-left: auto; margin-right: auto;">
      Exclusividade que se sente. Produtos artesanais com ingredientes nobres, pensados para quem não aceita menos que o extraordinário.
    </p>

    <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
      <a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #BE185D, #D4A574); color: #FFFFFF; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; padding: 16px 32px; border-radius: 8px; text-decoration: none;">
        Descobrir a Coleção
      </a>
      <a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: transparent; color: #F0D4E4; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; padding: 16px 32px; border-radius: 8px; text-decoration: none; border: 1px solid #3D1E30;">
        Agendar Consultoria
      </a>
    </div>
  </div>
</section>
```

### Features Grid

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

<section style="background-color: #1A0A14; padding: 96px 24px; font-family: 'DM Sans', Georgia, serif;">
  <div style="max-width: 1080px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 80px;">
      <span style="font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; color: #D4A574; letter-spacing: 0.1em; text-transform: uppercase; display: block; margin-bottom: 16px;">Diferenciais</span>
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 38px; font-weight: 600; color: #F0D4E4; line-height: 1.2; margin: 0 0 16px;">
        Por que somos diferentes
      </h2>
      <p style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #D4A0C0; line-height: 1.7; max-width: 480px; margin: 0 auto;">
        Cada detalhe pensado para uma experiência que transcende o comum.
      </p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
      <!-- Card 1 -->
      <div style="background: #261320; border: 1px solid #3D1E30; border-radius: 12px; padding: 32px;">
        <div style="width: 48px; height: 48px; background: rgba(190,24,93,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2L15 8.5L22 9.5L17 14.5L18 21.5L12 18.5L6 21.5L7 14.5L2 9.5L9 8.5L12 2Z" stroke="#D4A574" stroke-width="1.5" stroke-linejoin="round"/></svg>
        </div>
        <h3 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 600; color: #F0D4E4; margin: 0 0 12px; line-height: 1.3;">Ingredientes Nobres</h3>
        <p style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #A67A94; line-height: 1.6; margin: 0;">
          Selecionados à mão nas melhores fazendas do mundo. Pureza e potência em cada fórmula.
        </p>
      </div>

      <!-- Card 2 -->
      <div style="background: #261320; border: 1px solid #3D1E30; border-radius: 12px; padding: 32px;">
        <div style="width: 48px; height: 48px; background: rgba(190,24,93,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="#D4A574" stroke-width="1.5"/></svg>
        </div>
        <h3 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 600; color: #F0D4E4; margin: 0 0 12px; line-height: 1.3;">Feito à Mão</h3>
        <p style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #A67A94; line-height: 1.6; margin: 0;">
          Cada peça é produzida artesanalmente. Nenhuma é igual à outra — exclusividade real.
        </p>
      </div>

      <!-- Card 3 -->
      <div style="background: #261320; border: 1px solid #3D1E30; border-radius: 12px; padding: 32px;">
        <div style="width: 48px; height: 48px; background: rgba(190,24,93,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#D4A574" stroke-width="1.5"/><path d="M8 12l3 3 5-5" stroke="#D4A574" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <h3 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 600; color: #F0D4E4; margin: 0 0 12px; line-height: 1.3;">Consultoria Pessoal</h3>
        <p style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #A67A94; line-height: 1.6; margin: 0;">
          Especialistas dedicadas que entendem sua pele, seu estilo e suas necessidades únicas.
        </p>
      </div>

      <!-- Card 4 -->
      <div style="background: #261320; border: 1px solid #3D1E30; border-radius: 12px; padding: 32px;">
        <div style="width: 48px; height: 48px; background: rgba(190,24,93,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#D4A574" stroke-width="1.5"/><circle cx="12" cy="10" r="3" stroke="#D4A574" stroke-width="1.5"/></svg>
        </div>
        <h3 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 600; color: #F0D4E4; margin: 0 0 12px; line-height: 1.3;">Embalagem Premium</h3>
        <p style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #A67A94; line-height: 1.6; margin: 0;">
          Caixas de apresentação com acabamento em hot stamping dourado. Presente desde o primeiro toque.
        </p>
      </div>

      <!-- Card 5 -->
      <div style="background: #261320; border: 1px solid #3D1E30; border-radius: 12px; padding: 32px;">
        <div style="width: 48px; height: 48px; background: rgba(190,24,93,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#D4A574" stroke-width="1.5"/></svg>
        </div>
        <h3 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 600; color: #F0D4E4; margin: 0 0 12px; line-height: 1.3;">Cruelty Free</h3>
        <p style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #A67A94; line-height: 1.6; margin: 0;">
          Nenhum teste em animais. Beleza consciente com certificação internacional.
        </p>
      </div>

      <!-- Card 6 -->
      <div style="background: #261320; border: 1px solid #3D1E30; border-radius: 12px; padding: 32px;">
        <div style="width: 48px; height: 48px; background: rgba(190,24,93,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke="#D4A574" stroke-width="1.5"/><line x1="4" y1="22" x2="4" y2="15" stroke="#D4A574" stroke-width="1.5"/></svg>
        </div>
        <h3 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 600; color: #F0D4E4; margin: 0 0 12px; line-height: 1.3;">Entrega VIP</h3>
        <p style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #A67A94; line-height: 1.6; margin: 0;">
          Frete expresso com rastreio dedicado. Cada entrega é uma experiência, não só um pacote.
        </p>
      </div>
    </div>
  </div>
</section>
```

### Social Proof / Stats

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

<section style="background-color: #1A0A14; padding: 96px 24px; font-family: 'DM Sans', Georgia, serif;">
  <div style="max-width: 1080px; margin: 0 auto;">
    <!-- Stats -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 80px;">
      <div style="text-align: center; padding: 32px 16px;">
        <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 42px; font-weight: 700; color: #D4A574; line-height: 1.1; margin-bottom: 8px;">50K+</div>
        <div style="font-family: 'DM Sans', sans-serif; font-size: 13px; color: #A67A94; line-height: 1.5; letter-spacing: 0.1em; text-transform: uppercase;">Clientes satisfeitas</div>
      </div>
      <div style="text-align: center; padding: 32px 16px; border-left: 1px solid #3D1E30;">
        <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 42px; font-weight: 700; color: #F0D4E4; line-height: 1.1; margin-bottom: 8px;">98%</div>
        <div style="font-family: 'DM Sans', sans-serif; font-size: 13px; color: #A67A94; line-height: 1.5; letter-spacing: 0.1em; text-transform: uppercase;">Recompram</div>
      </div>
      <div style="text-align: center; padding: 32px 16px; border-left: 1px solid #3D1E30;">
        <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 42px; font-weight: 700; color: #F0D4E4; line-height: 1.1; margin-bottom: 8px;">4.9</div>
        <div style="font-family: 'DM Sans', sans-serif; font-size: 13px; color: #A67A94; line-height: 1.5; letter-spacing: 0.1em; text-transform: uppercase;">Avaliação média</div>
      </div>
      <div style="text-align: center; padding: 32px 16px; border-left: 1px solid #3D1E30;">
        <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 42px; font-weight: 700; color: #F0D4E4; line-height: 1.1; margin-bottom: 8px;">12</div>
        <div style="font-family: 'DM Sans', sans-serif; font-size: 13px; color: #A67A94; line-height: 1.5; letter-spacing: 0.1em; text-transform: uppercase;">Anos de mercado</div>
      </div>
    </div>

    <!-- Testimonials -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
      <div style="background: #261320; border: 1px solid #3D1E30; border-radius: 12px; padding: 32px;">
        <div style="display: flex; gap: 4px; margin-bottom: 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#D4A574"><path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8z"/></svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#D4A574"><path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8z"/></svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#D4A574"><path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8z"/></svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#D4A574"><path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8z"/></svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#D4A574"><path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8z"/></svg>
        </div>
        <p style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #D4A0C0; line-height: 1.7; margin: 0 0 24px; font-style: italic;">
          "Minha pele nunca esteve tão bonita. Os produtos têm um perfume sutil que faz a rotina de skincare virar um ritual."
        </p>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #BE185D, #D4A574); border-radius: 9999px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 14px; font-weight: 600; color: #FFFFFF;">CA</span>
          </div>
          <div>
            <div style="font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #F0D4E4;">Camila A.</div>
            <div style="font-family: 'DM Sans', sans-serif; font-size: 12px; color: #A67A94;">Empresária, São Paulo</div>
          </div>
        </div>
      </div>

      <div style="background: #261320; border: 1px solid #3D1E30; border-radius: 12px; padding: 32px;">
        <div style="display: flex; gap: 4px; margin-bottom: 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#D4A574"><path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8z"/></svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#D4A574"><path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8z"/></svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#D4A574"><path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8z"/></svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#D4A574"><path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8z"/></svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#D4A574"><path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8z"/></svg>
        </div>
        <p style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #D4A0C0; line-height: 1.7; margin: 0 0 24px; font-style: italic;">
          "A embalagem é tão linda que dá vontade de deixar exposta. Ganhei elogios antes mesmo de usar o produto."
        </p>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #BE185D, #D4A574); border-radius: 9999px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 14px; font-weight: 600; color: #FFFFFF;">JM</span>
          </div>
          <div>
            <div style="font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #F0D4E4;">Juliana M.</div>
            <div style="font-family: 'DM Sans', sans-serif; font-size: 12px; color: #A67A94;">Influenciadora, Rio de Janeiro</div>
          </div>
        </div>
      </div>

      <div style="background: #261320; border: 1px solid #3D1E30; border-radius: 12px; padding: 32px;">
        <div style="display: flex; gap: 4px; margin-bottom: 16px;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#D4A574"><path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8z"/></svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#D4A574"><path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8z"/></svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#D4A574"><path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8z"/></svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#D4A574"><path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8z"/></svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#D4A574"><path d="M8 1l2.2 4.5L15 6.3l-3.5 3.4.8 4.8L8 12.2 3.7 14.5l.8-4.8L1 6.3l4.8-.8z"/></svg>
        </div>
        <p style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #D4A0C0; line-height: 1.7; margin: 0 0 24px; font-style: italic;">
          "Presenteei minha mãe e ela chorou. A experiência de abrir a caixa já vale o investimento."
        </p>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #BE185D, #D4A574); border-radius: 9999px; display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 14px; font-weight: 600; color: #FFFFFF;">FS</span>
          </div>
          <div>
            <div style="font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #F0D4E4;">Fernanda S.</div>
            <div style="font-family: 'DM Sans', sans-serif; font-size: 12px; color: #A67A94;">Advogada, Belo Horizonte</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### CTA Section

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

<section style="background-color: #1A0A14; padding: 96px 24px; font-family: 'DM Sans', Georgia, serif; position: relative; overflow: hidden;">
  <!-- Rose glow -->
  <div style="position: absolute; bottom: -150px; left: 50%; transform: translateX(-50%); width: 800px; height: 500px; background: radial-gradient(ellipse, rgba(190,24,93,0.1) 0%, transparent 70%); pointer-events: none;"></div>
  <!-- Gold accent glow -->
  <div style="position: absolute; top: 0; right: 0; width: 300px; height: 300px; background: radial-gradient(circle, rgba(212,165,116,0.05) 0%, transparent 70%); pointer-events: none;"></div>

  <div style="position: relative; z-index: 1; max-width: 600px; margin: 0 auto; text-align: center;">
    <!-- Decorative line -->
    <div style="width: 60px; height: 1px; background: linear-gradient(90deg, transparent, #D4A574, transparent); margin: 0 auto 32px;"></div>

    <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 38px; font-weight: 600; color: #F0D4E4; line-height: 1.2; margin: 0 0 16px;">
      Pronta para se sentir extraordinária?
    </h2>
    <p style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #D4A0C0; line-height: 1.7; margin: 0 0 40px;">
      Consultoria personalizada grátis na primeira compra. Sua experiência começa agora.
    </p>
    <a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #BE185D, #D4A574); color: #FFFFFF; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; padding: 16px 40px; border-radius: 8px; text-decoration: none;">
      Agendar Minha Consultoria
    </a>
    <p style="font-family: 'DM Sans', sans-serif; font-size: 13px; color: #A67A94; margin-top: 16px;">Frete grátis em compras acima de R$299</p>
  </div>
</section>
```

### Pricing Card

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

<section style="background-color: #1A0A14; padding: 96px 24px; font-family: 'DM Sans', Georgia, serif;">
  <div style="max-width: 1000px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 64px;">
      <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 38px; font-weight: 600; color: #F0D4E4; line-height: 1.2; margin: 0 0 12px;">Escolha sua experiência</h2>
      <p style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #D4A0C0; line-height: 1.7; margin: 0;">Cada ritual pensado para um momento único.</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: start;">
      <!-- Essencial -->
      <div style="background: #261320; border: 1px solid #3D1E30; border-radius: 12px; padding: 40px 32px;">
        <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; color: #A67A94; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">Essencial</div>
        <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px;">
          <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 42px; font-weight: 700; color: #F0D4E4;">R$189</span>
        </div>
        <p style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #A67A94; margin: 0 0 32px;">Ritual básico para o dia a dia.</p>
        <a href="#" style="display: block; text-align: center; background: transparent; color: #F0D4E4; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; padding: 16px 32px; border-radius: 8px; text-decoration: none; border: 1px solid #3D1E30; margin-bottom: 32px;">Escolher</a>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px;">
          <li style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; display: flex; align-items: center; gap: 10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#D4A574" stroke-width="1.5" stroke-linecap="round"/></svg>
            Sérum hidratante
          </li>
          <li style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; display: flex; align-items: center; gap: 10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#D4A574" stroke-width="1.5" stroke-linecap="round"/></svg>
            Creme noturno
          </li>
          <li style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; display: flex; align-items: center; gap: 10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#D4A574" stroke-width="1.5" stroke-linecap="round"/></svg>
            Embalagem presente
          </li>
        </ul>
      </div>

      <!-- Luxe (destaque) -->
      <div style="background: #261320; border: 2px solid #BE185D; border-radius: 12px; padding: 40px 32px; position: relative; box-shadow: 0 0 40px rgba(190,24,93,0.08);">
        <div style="position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #BE185D, #D4A574); color: #FFFFFF; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; padding: 6px 16px; border-radius: 9999px; letter-spacing: 0.1em; text-transform: uppercase;">Mais vendido</div>
        <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; color: #BE185D; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">Luxe</div>
        <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px;">
          <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 42px; font-weight: 700; color: #F0D4E4;">R$389</span>
        </div>
        <p style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #A67A94; margin: 0 0 32px;">O ritual completo para brilhar.</p>
        <a href="#" style="display: block; text-align: center; background: linear-gradient(135deg, #BE185D, #D4A574); color: #FFFFFF; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; padding: 16px 32px; border-radius: 8px; text-decoration: none; margin-bottom: 32px;">Escolher Luxe</a>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px;">
          <li style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; display: flex; align-items: center; gap: 10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#D4A574" stroke-width="1.5" stroke-linecap="round"/></svg>
            Tudo do Essencial
          </li>
          <li style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; display: flex; align-items: center; gap: 10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#D4A574" stroke-width="1.5" stroke-linecap="round"/></svg>
            Máscara facial premium
          </li>
          <li style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; display: flex; align-items: center; gap: 10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#D4A574" stroke-width="1.5" stroke-linecap="round"/></svg>
            Óleo essencial de rosa
          </li>
          <li style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; display: flex; align-items: center; gap: 10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#D4A574" stroke-width="1.5" stroke-linecap="round"/></svg>
            Consultoria personalizada
          </li>
        </ul>
      </div>

      <!-- Prestige -->
      <div style="background: #261320; border: 1px solid #3D1E30; border-radius: 12px; padding: 40px 32px;">
        <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; color: #D4A574; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">Prestige</div>
        <div style="display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px;">
          <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 42px; font-weight: 700; color: #F0D4E4;">R$699</span>
        </div>
        <p style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #A67A94; margin: 0 0 32px;">A experiência mais exclusiva.</p>
        <a href="#" style="display: block; text-align: center; background: transparent; color: #F0D4E4; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; padding: 16px 32px; border-radius: 8px; text-decoration: none; border: 1px solid #3D1E30; margin-bottom: 32px;">Escolher Prestige</a>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px;">
          <li style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; display: flex; align-items: center; gap: 10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#D4A574" stroke-width="1.5" stroke-linecap="round"/></svg>
            Tudo do Luxe
          </li>
          <li style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; display: flex; align-items: center; gap: 10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#D4A574" stroke-width="1.5" stroke-linecap="round"/></svg>
            Caixa artesanal exclusiva
          </li>
          <li style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; display: flex; align-items: center; gap: 10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#D4A574" stroke-width="1.5" stroke-linecap="round"/></svg>
            Perfume artesanal 30ml
          </li>
          <li style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; display: flex; align-items: center; gap: 10px;">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l3 3 5-5" stroke="#D4A574" stroke-width="1.5" stroke-linecap="round"/></svg>
            Acesso VIP a lançamentos
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

### Footer

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

<footer style="background-color: #1A0A14; border-top: 1px solid #3D1E30; padding: 80px 24px 40px; font-family: 'DM Sans', Georgia, serif;">
  <div style="max-width: 1080px; margin: 0 auto;">
    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 64px;">
      <!-- Brand -->
      <div>
        <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 700; color: #F0D4E4; margin-bottom: 16px;">
          SuaMarca<span style="color: #D4A574;">.</span>
        </div>
        <p style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #A67A94; line-height: 1.7; max-width: 280px; margin: 0;">
          Beleza que se sente. Luxo que se vive. Exclusividade em cada detalhe.
        </p>
      </div>

      <!-- Coleção -->
      <div>
        <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; color: #A67A94; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px;">Coleção</div>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
          <li><a href="#" style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; text-decoration: none;">Skincare</a></li>
          <li><a href="#" style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; text-decoration: none;">Maquiagem</a></li>
          <li><a href="#" style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; text-decoration: none;">Fragrâncias</a></li>
          <li><a href="#" style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; text-decoration: none;">Kits Presente</a></li>
        </ul>
      </div>

      <!-- Sobre -->
      <div>
        <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; color: #A67A94; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px;">Sobre</div>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
          <li><a href="#" style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; text-decoration: none;">Nossa História</a></li>
          <li><a href="#" style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; text-decoration: none;">Ingredientes</a></li>
          <li><a href="#" style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; text-decoration: none;">Blog</a></li>
        </ul>
      </div>

      <!-- Atendimento -->
      <div>
        <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; color: #A67A94; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 20px;">Atendimento</div>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
          <li><a href="#" style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; text-decoration: none;">WhatsApp</a></li>
          <li><a href="#" style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; text-decoration: none;">Trocas e Devoluções</a></li>
          <li><a href="#" style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #D4A0C0; text-decoration: none;">FAQ</a></li>
        </ul>
      </div>
    </div>

    <div style="border-top: 1px solid #3D1E30; padding-top: 32px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-family: 'DM Sans', sans-serif; font-size: 13px; color: #A67A94;">&copy; 2026 SuaMarca. Todos os direitos reservados.</span>
      <div style="display: flex; gap: 20px;">
        <a href="#" style="color: #A67A94; text-decoration: none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
        </a>
        <a href="#" style="color: #A67A94; text-decoration: none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48 6.3 6.3 0 001.86-4.49V8.69a8.28 8.28 0 004.86 1.56V6.82a4.84 4.84 0 01-1.14-.13z"/></svg>
        </a>
        <a href="#" style="color: #A67A94; text-decoration: none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
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
| Padding de seção | **96px** vertical, 24px horizontal (luxo respira) |
| Gap entre cards | 24px (mais generoso que o padrão) |
| Card padding | 32px (mais generoso) |
| Button padding | 16px 32px (mais generoso) |
| Grid padrão | 3 colunas para features/cards |
| Grid stats | 4 colunas com divisores verticais |
| Border radius | 8px (botões, inputs), 12px (cards) |
| Gradiente rose-gold | `linear-gradient(135deg, #BE185D, #D4A574)` somente em CTAs |
| Glow sombras | Incluem `rgba(190,24,93,0.05-0.08)` — glow sutil rose |
| Separação visual | Bordas (`#3D1E30`) + linhas decorativas douradas |
| Line-height body | 1.7 sempre — arejado é luxo |
| Responsivo | Grid colapsa para 1 coluna em mobile (media query `max-width: 768px`) |

---

## Instagram

### Carrossel (1080x1350px)

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- SLIDE 1 — COVER -->
<div style="width: 1080px; height: 1350px; background-color: #1A0A14; font-family: 'DM Sans', Georgia, serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; position: relative; overflow: hidden;">
  <!-- Rose glow -->
  <div style="position: absolute; top: 150px; left: 50%; transform: translateX(-50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(190,24,93,0.15) 0%, transparent 70%); pointer-events: none;"></div>
  <!-- Gold glow -->
  <div style="position: absolute; bottom: 200px; right: 100px; width: 300px; height: 300px; background: radial-gradient(circle, rgba(212,165,116,0.08) 0%, transparent 70%); pointer-events: none;"></div>

  <div style="position: relative; z-index: 1; text-align: center;">
    <div style="display: inline-block; border: 1px solid #3D1E30; border-radius: 9999px; padding: 10px 24px; margin-bottom: 40px;">
      <span style="font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500; color: #D4A574; letter-spacing: 0.1em; text-transform: uppercase;">Rotina de Skincare</span>
    </div>

    <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 72px; font-weight: 700; color: #F0D4E4; line-height: 1.1; letter-spacing: -0.01em; margin: 0 0 32px;">
      5 passos para<br>uma pele<br>radiante
    </h1>

    <p style="font-family: 'DM Sans', sans-serif; font-size: 22px; color: #D4A0C0; line-height: 1.6; margin: 0;">
      Seu ritual de beleza começa aqui.
    </p>
  </div>

  <!-- Progress bar -->
  <div style="position: absolute; bottom: 60px; left: 80px; right: 80px; display: flex; gap: 8px;">
    <div style="flex: 1; height: 2px; background: linear-gradient(90deg, #BE185D, #D4A574); border-radius: 2px;"></div>
    <div style="flex: 1; height: 2px; background: #3D1E30; border-radius: 2px;"></div>
    <div style="flex: 1; height: 2px; background: #3D1E30; border-radius: 2px;"></div>
    <div style="flex: 1; height: 2px; background: #3D1E30; border-radius: 2px;"></div>
    <div style="flex: 1; height: 2px; background: #3D1E30; border-radius: 2px;"></div>
  </div>

  <!-- Swipe arrow -->
  <div style="position: absolute; bottom: 56px; right: 80px;">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M12 8l8 8-8 8" stroke="#A67A94" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </div>
</div>

<!-- SLIDE 2 — INTERNAL -->
<div style="width: 1080px; height: 1350px; background-color: #1A0A14; font-family: 'DM Sans', Georgia, serif; display: flex; flex-direction: column; justify-content: center; padding: 80px; position: relative;">
  <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 32px;">
    <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #BE185D, #D4A574); border-radius: 9999px; display: flex; align-items: center; justify-content: center;">
      <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 700; color: #FFFFFF;">01</span>
    </div>
    <span style="font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #D4A574; letter-spacing: 0.1em; text-transform: uppercase;">Primeiro Passo</span>
  </div>

  <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 52px; font-weight: 700; color: #F0D4E4; line-height: 1.15; margin: 0 0 24px;">
    Limpeza<br>profunda
  </h2>

  <p style="font-family: 'DM Sans', sans-serif; font-size: 20px; color: #D4A0C0; line-height: 1.7; margin: 0 0 40px; max-width: 700px;">
    Comece com um gel de limpeza suave. Massageie em movimentos circulares por 60 segundos. Sua pele precisa estar completamente limpa para absorver os ativos.
  </p>

  <!-- Decorative line -->
  <div style="width: 80px; height: 2px; background: linear-gradient(90deg, #BE185D, #D4A574); border-radius: 2px;"></div>

  <!-- Progress bar -->
  <div style="position: absolute; bottom: 60px; left: 80px; right: 80px; display: flex; gap: 8px;">
    <div style="flex: 1; height: 2px; background: #5C2E4A; border-radius: 2px;"></div>
    <div style="flex: 1; height: 2px; background: linear-gradient(90deg, #BE185D, #D4A574); border-radius: 2px;"></div>
    <div style="flex: 1; height: 2px; background: #3D1E30; border-radius: 2px;"></div>
    <div style="flex: 1; height: 2px; background: #3D1E30; border-radius: 2px;"></div>
    <div style="flex: 1; height: 2px; background: #3D1E30; border-radius: 2px;"></div>
  </div>
</div>

<!-- SLIDE 5 — CTA -->
<div style="width: 1080px; height: 1350px; background-color: #1A0A14; font-family: 'DM Sans', Georgia, serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; position: relative; overflow: hidden;">
  <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 700px; height: 500px; background: radial-gradient(ellipse, rgba(190,24,93,0.12) 0%, transparent 70%); pointer-events: none;"></div>

  <div style="position: relative; z-index: 1; text-align: center;">
    <!-- Decorative line -->
    <div style="width: 60px; height: 2px; background: linear-gradient(90deg, #BE185D, #D4A574); margin: 0 auto 40px; border-radius: 2px;"></div>

    <h2 style="font-family: 'Playfair Display', Georgia, serif; font-size: 56px; font-weight: 700; color: #F0D4E4; line-height: 1.1; margin: 0 0 24px;">
      Salva e<br>compartilha.
    </h2>
    <p style="font-family: 'DM Sans', sans-serif; font-size: 20px; color: #D4A0C0; line-height: 1.6; margin: 0 0 48px;">
      Manda para aquela amiga que precisa dessa rotina.
    </p>
    <div style="display: inline-block; background: linear-gradient(135deg, #BE185D, #D4A574); color: #FFFFFF; font-family: 'DM Sans', sans-serif; font-size: 18px; font-weight: 600; padding: 18px 40px; border-radius: 8px;">
      @seuhandle
    </div>
  </div>

  <!-- Progress bar -->
  <div style="position: absolute; bottom: 60px; left: 80px; right: 80px; display: flex; gap: 8px;">
    <div style="flex: 1; height: 2px; background: #5C2E4A; border-radius: 2px;"></div>
    <div style="flex: 1; height: 2px; background: #5C2E4A; border-radius: 2px;"></div>
    <div style="flex: 1; height: 2px; background: #5C2E4A; border-radius: 2px;"></div>
    <div style="flex: 1; height: 2px; background: #5C2E4A; border-radius: 2px;"></div>
    <div style="flex: 1; height: 2px; background: linear-gradient(90deg, #BE185D, #D4A574); border-radius: 2px;"></div>
  </div>
</div>
```

### Post Unico (1080x1080px)

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

<div style="width: 1080px; height: 1080px; background-color: #1A0A14; font-family: 'DM Sans', Georgia, serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; position: relative; overflow: hidden;">
  <!-- Rose glow -->
  <div style="position: absolute; top: -80px; left: 50%; transform: translateX(-50%); width: 500px; height: 500px; background: radial-gradient(circle, rgba(190,24,93,0.12) 0%, transparent 70%); pointer-events: none;"></div>

  <div style="position: relative; z-index: 1; text-align: center;">
    <div style="width: 50px; height: 2px; background: linear-gradient(90deg, #BE185D, #D4A574); margin: 0 auto 32px; border-radius: 2px;"></div>

    <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 60px; font-weight: 700; color: #F0D4E4; line-height: 1.1; letter-spacing: -0.01em; margin: 0 0 24px;">
      Beleza é<br>ritual.
    </h1>

    <p style="font-family: 'DM Sans', sans-serif; font-size: 20px; color: #D4A0C0; line-height: 1.7; margin: 0 0 40px; max-width: 600px;">
      Não é vaidade. É respeito por quem você é e pelo que você merece sentir todo dia.
    </p>

    <div style="display: inline-block; border: 1px solid #3D1E30; border-radius: 9999px; padding: 12px 28px;">
      <span style="font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500; color: #D4A574;">Descubra sua rotina ideal</span>
    </div>
  </div>

  <div style="position: absolute; bottom: 40px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #A67A94;">@seuhandle</div>
</div>
```

### Stories (1080x1920px)

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

<div style="width: 1080px; height: 1920px; background-color: #1A0A14; font-family: 'DM Sans', Georgia, serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; position: relative; overflow: hidden;">
  <!-- Rose glow -->
  <div style="position: absolute; top: 300px; left: 50%; transform: translateX(-50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(190,24,93,0.12) 0%, transparent 70%); pointer-events: none;"></div>

  <div style="position: relative; z-index: 1; text-align: center; max-width: 800px;">
    <div style="font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #D4A574; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 48px;">Novidade</div>

    <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 60px; font-weight: 700; color: #F0D4E4; line-height: 1.15; margin: 0 0 32px;">
      Sérum de Rosa<br>Mosqueta
    </h1>

    <p style="font-family: 'DM Sans', sans-serif; font-size: 22px; color: #D4A0C0; line-height: 1.7; margin: 0 0 48px;">
      Hidratação profunda + regeneração celular.<br>Resultados visíveis em 7 dias.
    </p>

    <!-- Product card -->
    <div style="background: #261320; border: 1px solid #3D1E30; border-radius: 12px; padding: 32px; display: inline-block;">
      <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 700; color: #F0D4E4; margin-bottom: 8px;">R$149</div>
      <div style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #A67A94;">ou 3x de R$49,67</div>
    </div>
  </div>

  <!-- Swipe up -->
  <div style="position: absolute; bottom: 100px; text-align: center;">
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M8 20l8-8 8 8" stroke="#D4A574" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div style="font-family: 'DM Sans', sans-serif; font-size: 13px; color: #A67A94; margin-top: 8px; letter-spacing: 0.1em; text-transform: uppercase;">Arraste para comprar</div>
  </div>
</div>
```

---

## YouTube

### Thumbnail (1280x720px)

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

<div style="width: 1280px; height: 720px; background-color: #1A0A14; font-family: 'DM Sans', Georgia, serif; display: flex; align-items: center; padding: 64px; position: relative; overflow: hidden;">
  <!-- Rose glow left -->
  <div style="position: absolute; left: -100px; top: 50%; transform: translateY(-50%); width: 500px; height: 500px; background: radial-gradient(circle, rgba(190,24,93,0.15) 0%, transparent 70%); pointer-events: none;"></div>
  <!-- Gold glow right -->
  <div style="position: absolute; right: -50px; bottom: -50px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(212,165,116,0.1) 0%, transparent 70%); pointer-events: none;"></div>

  <div style="position: relative; z-index: 1; flex: 1;">
    <div style="font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #D4A574; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px;">Tutorial Completo</div>
    <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 64px; font-weight: 700; color: #F0D4E4; line-height: 1.1; margin: 0 0 16px; max-width: 650px;">
      ROTINA DE<br><span style="color: #D4A574;">SKINCARE</span><br>NOTURNA
    </h1>
    <p style="font-family: 'DM Sans', sans-serif; font-size: 22px; color: #D4A0C0; margin: 0;">Passo a passo profissional</p>
  </div>

  <!-- Right side accent circle -->
  <div style="position: relative; z-index: 1; width: 280px; height: 280px; border: 2px solid #3D1E30; border-radius: 9999px; display: flex; align-items: center; justify-content: center;">
    <div style="width: 240px; height: 240px; background: linear-gradient(135deg, rgba(190,24,93,0.2), rgba(212,165,116,0.2)); border-radius: 9999px; display: flex; align-items: center; justify-content: center;">
      <span style="font-family: 'Playfair Display', Georgia, serif; font-size: 48px; font-weight: 700; color: #F0D4E4;">5 min</span>
    </div>
  </div>
</div>
```

### Banner (2560x1440px)

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

<div style="width: 2560px; height: 1440px; background-color: #1A0A14; font-family: 'DM Sans', Georgia, serif; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
  <!-- Rose glow center -->
  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 1000px; height: 1000px; background: radial-gradient(circle, rgba(190,24,93,0.08) 0%, transparent 70%); pointer-events: none;"></div>
  <!-- Gold glow right -->
  <div style="position: absolute; right: 200px; top: 50%; transform: translateY(-50%); width: 500px; height: 500px; background: radial-gradient(circle, rgba(212,165,116,0.05) 0%, transparent 70%); pointer-events: none;"></div>

  <!-- Safe area (1546x423 centered) -->
  <div style="position: relative; z-index: 1; text-align: center;">
    <!-- Decorative line -->
    <div style="width: 80px; height: 2px; background: linear-gradient(90deg, #BE185D, #D4A574); margin: 0 auto 24px; border-radius: 2px;"></div>

    <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 72px; font-weight: 700; color: #F0D4E4; line-height: 1.1; margin: 0 0 16px;">
      Beleza <span style="color: #D4A574;">&</span> Bem-Estar
    </h1>
    <p style="font-family: 'DM Sans', sans-serif; font-size: 24px; color: #D4A0C0; letter-spacing: 0.1em; text-transform: uppercase;">Skincare | Rituais | Autoestima</p>
  </div>
</div>
```

---

## Fotografia e Imagem

### Prompts para IA (Midjourney, DALL-E, etc.)

**Produto/Beauty:**
```
Luxury skincare product on dark burgundy velvet background, rose gold lighting, soft bokeh, ceramic texture, elegant minimal composition, warm tones, editorial beauty photography, high-end product shot --ar 4:5 --style raw
```

**Lifestyle/Feminino:**
```
Elegant woman applying skincare in warm ambient lighting, burgundy and rose gold tones, soft focus, luxury bathroom with marble and gold fixtures, intimate mood, editorial fashion photography, shallow depth of field --ar 3:4
```

**Abstrato/Textura:**
```
Abstract rose gold liquid texture on deep burgundy background (#1A0A14), metallic rose gold (#D4A574) flowing shapes, luxury beauty aesthetic, minimal, elegant, macro photography feel --ar 1:1 --style raw
```

**Flat Lay:**
```
Luxury beauty flat lay on dark burgundy surface, rose gold props, dried roses, silk fabric, skincare bottles with minimal labels, warm gold accent lighting from side, editorial beauty photography, overhead shot --ar 4:5 --style raw
```

### Overlays

**Overlay escuro (texto sobre imagem):**
```css
background: linear-gradient(to top, rgba(26,10,20,0.95) 0%, rgba(26,10,20,0.6) 50%, transparent 100%);
```

**Overlay com glow rosa:**
```css
box-shadow: 0 0 60px rgba(190,24,93,0.08);
border: 1px solid rgba(190,24,93,0.15);
```

**Overlay dourado sutil:**
```css
border: 1px solid rgba(212,165,116,0.15);
box-shadow: 0 0 40px rgba(212,165,116,0.05);
```

---

## Componentes (HTML Pronto)

### Botao Primary (Gradiente Rose-Gold)

```html
<a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #BE185D, #D4A574); color: #FFFFFF; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; padding: 16px 32px; border-radius: 8px; text-decoration: none; border: none; cursor: pointer;">
  Texto do Botão
</a>
```

### Botao Secondary

```html
<a href="#" style="display: inline-flex; align-items: center; gap: 8px; background: transparent; color: #F0D4E4; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; padding: 16px 32px; border-radius: 8px; text-decoration: none; border: 1px solid #3D1E30; cursor: pointer;">
  Texto do Botão
</a>
```

### Card

```html
<div style="background: #261320; border: 1px solid #3D1E30; border-radius: 12px; padding: 32px; font-family: 'DM Sans', sans-serif;">
  <h3 style="font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 600; color: #F0D4E4; margin: 0 0 12px;">Título do Card</h3>
  <p style="font-family: 'DM Sans', sans-serif; font-size: 14px; color: #A67A94; line-height: 1.6; margin: 0;">Descrição elegante do conteúdo do card com informações relevantes.</p>
</div>
```

### Badge/Label

```html
<span style="display: inline-block; border: 1px solid #3D1E30; color: #D4A574; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; padding: 6px 14px; border-radius: 9999px; letter-spacing: 0.1em; text-transform: uppercase;">
  Label
</span>
```

### Badge Destaque (Rose-Gold)

```html
<span style="display: inline-block; background: linear-gradient(135deg, #BE185D, #D4A574); color: #FFFFFF; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; padding: 6px 14px; border-radius: 9999px; letter-spacing: 0.1em; text-transform: uppercase;">
  Destaque
</span>
```

### Lista com Icone

```html
<ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; font-family: 'DM Sans', sans-serif;">
  <li style="font-size: 16px; color: #D4A0C0; display: flex; align-items: center; gap: 12px; line-height: 1.7;">
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9l3.5 3.5L14 6" stroke="#D4A574" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    Item da lista com ícone dourado
  </li>
  <li style="font-size: 16px; color: #D4A0C0; display: flex; align-items: center; gap: 12px; line-height: 1.7;">
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 9l3.5 3.5L14 6" stroke="#D4A574" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    Segundo item da lista
  </li>
</ul>
```

### Caixa de Destaque (Highlight Box)

```html
<div style="background: rgba(190,24,93,0.05); border-left: 3px solid #BE185D; border-radius: 0 8px 8px 0; padding: 24px 28px; font-family: 'DM Sans', sans-serif;">
  <div style="font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; color: #D4A574; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px;">Destaque</div>
  <p style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #D4A0C0; line-height: 1.7; margin: 0;">Conteúdo importante que merece atenção visual. O espaçamento generoso faz parte da elegância.</p>
</div>
```

### Linha Decorativa Dourada

```html
<div style="width: 60px; height: 2px; background: linear-gradient(90deg, #BE185D, #D4A574); border-radius: 2px;"></div>
```

### Input

```html
<input type="text" placeholder="Seu melhor e-mail..." style="width: 100%; background: #261320; border: 1px solid #3D1E30; border-radius: 8px; padding: 14px 18px; font-family: 'DM Sans', sans-serif; font-size: 16px; color: #F0D4E4; outline: none; box-sizing: border-box;">
```

---

## Tom de Voz

**Personalidade:** Elegante, íntima, confiante. Como uma amiga sofisticada que sabe exatamente o que funciona.

| Atributo | Descrição |
|----------|-----------|
| Tom | Luxuoso mas acolhedor — nunca frio ou distante |
| Vocabulário | Palavras sensoriais (textura, ritual, radiante, exclusivo) |
| Frases | Curtas e impactantes. Pausas dramáticas. Ponto final forte. |
| Elegância | Sem exclamações excessivas. A confiança é quieta. |
| Intimidade | Conversa de uma para uma. "Sua pele." "Seu ritual." |

**Exemplos de copy:**

| Contexto | Texto |
|----------|-------|
| Hero headline | "Sua beleza, elevada." |
| Subtítulo | "Exclusividade que se sente." |
| Feature | "Ingredientes nobres, selecionados à mão." |
| CTA | "Descobrir a Coleção" / "Agendar Minha Consultoria" |
| Prova social | "98% recompram." |
| Preço | "O ritual completo para brilhar." |
| Emocional | "Beleza é ritual. Não vaidade." |

**Palavras-chave da marca:** exclusividade, ritual, radiante, nobre, artesanal, premium, elegância, textura, experiência, sensorial.

**Nunca usar:** "compre agora", "promoção imperdível", "corre", "últimas unidades". O luxo não grita.

---

## Anti-slop (O que NUNCA fazer)

| Proibido | Por que | Alternativa |
|----------|---------|-------------|
| Playfair Display em body text | Perde legibilidade, quebra hierarquia | Playfair só em H1-H3. Body sempre DM Sans |
| Gradiente rose-gold em backgrounds | Visual pesado, perde o impacto | Gradiente somente em CTAs e badges de destaque |
| Gold (`#D4A574`) em mais de 5% | Perde a exclusividade do acento | Usar sparingly: ícones, linhas, labels |
| Pink neon ou rosa saturado | Parece genérico, barato | Tons muted: `#BE185D`, `#F472B6`, nunca `#FF00FF` |
| Usar só serif ou só sans-serif | Perde a assinatura visual | O contraste serif+sans é obrigatório |
| Padding apertado (< 32px em cards) | Parece app genérico, não luxo | 32px em cards, 96px em seções — luxo respira |
| Line-height < 1.6 no body | Texto apertado, não elegante | 1.7 obrigatório no body text |
| Background `#000000` (preto puro) | Frio, sem a temperatura burgundy | Sempre `#1A0A14` |
| Exclamações excessivas ("!!!") | Luxo não grita | Uma exclamação, se muito. Ponto final é mais forte. |
| Sombras sem glow rosa | Perde a identidade da marca | Sempre incluir `rgba(190,24,93,0.05)` nas sombras |
| Cantos vivos (radius 0) | Não combina com a suavidade da marca | 8px mínimo, 12px para cards |
| Animações rápidas (< 200ms) | Luxo é lento e suave | 300ms mínimo, easing `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Imagens com filtro frio/azulado | Quebra a paleta quente da marca | Sempre tons quentes: rosé, dourado, burgundy |
