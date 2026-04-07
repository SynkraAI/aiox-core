# Notion Clean — Guia Prático

> Light clean theme inspirado no Notion. Para SaaS, documentação, ferramentas, corporate com alma.
> Source: `arctic-frost.yaml` | Theme: light | Font: DM Sans + DM Serif Display

---

## Visão Geral

**Notion Clean** é um tema claro e sofisticado, construído sobre neutrals quentes e contraste alto. Fundo off-white (#FAF9F7), texto quase-preto (#37352F), CTAs em preto puro (#000). O acento azul (#2EAADC) aparece com parcimônia — links, badges, destaques funcionais.

**Ideal para:** produtos SaaS, plataformas de produtividade, documentação, dashboards, ferramentas corporativas que precisam de alma sem perder seriedade.

**Personalidade visual:** limpo, funcional, humano. Notion, Linear, Calmly — não Stripe, não Vercel. Nada de gradientes chamativos ou sombras pesadas. Tudo respira.

| Token | Valor | Uso |
|-------|-------|-----|
| Background | `#FAF9F7` | Base de tudo — nunca branco puro |
| Surface | `#FFFFFF` | Cards, elevações |
| Text | `#37352F` | Corpo, parágrafos |
| Text Secondary | `#6B6966` | Subtítulos, descrições |
| Text Muted | `#9B9A97` | Labels, placeholders |
| Primary (CTA) | `#000000` | Botões principais, links fortes |
| Accent | `#2EAADC` | Destaques, badges, ícones |
| Border | `#E3E2DF` | Divisórias, bordas de cards |
| Success | `#0F7B6C` | Confirmações |
| Warning | `#CB912F` | Alertas |
| Error | `#EB5757` | Erros |

---

## Tipografia — Regras de Uso

**Famílias:**
- **DM Serif Display** — headings de impacto (h1, h2). Serifada, elegante, peso único.
- **DM Sans** — corpo, labels, botões. Geométrica, limpa, múltiplos pesos.
- **DM Mono** — código, dados técnicos.
- **Fallback:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

**CDN:**
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Escala Tipográfica

| Nível | Tamanho | Peso | Line Height | Letter Spacing | Fonte |
|-------|---------|------|-------------|----------------|-------|
| H1 | 48px | 700 | 1.15 | -0.02em | DM Serif Display |
| H2 | 36px | 600 | 1.25 | -0.01em | DM Serif Display |
| H3 | 24px | 600 | 1.3 | — | DM Sans |
| H4 | 20px | 500 | 1.4 | — | DM Sans |
| Body | 16px | 400 | 1.7 | — | DM Sans |
| Body SM | 14px | 400 | 1.6 | — | DM Sans |
| Caption | 13px | 400 | 1.5 | — | DM Sans |
| Label | 11px | 500 | 1.4 | 0.05em | DM Sans (UPPERCASE) |

### Restrições

- **DM Serif Display** só em h1 e h2. Nunca em body, botões ou labels.
- **Peso máximo body:** 600. Nunca 700/800 em DM Sans para parágrafos.
- **Labels** sempre uppercase com letter-spacing 0.05em.
- **Nunca** usar Inter, Poppins ou qualquer outra fonte. Família DM é obrigatória.

---

## Cores — Regras de Uso

### Hierarquia de Fundos

| Camada | Cor | Hex | Quando usar |
|--------|-----|-----|-------------|
| Base da página | Off-white | `#FAF9F7` | Background principal — SEMPRE |
| Cards / elevações | Branco | `#FFFFFF` | Elementos elevados sobre a base |
| Hover / active | Cinza claro | `#F7F6F3` | States interativos |
| Bordas | Neutral 300 | `#E3E2DF` | Divisórias, contornos de cards |

### Regras de Opacidade

- **Sombras:** opacity máxima 0.12 — `rgba(0,0,0,0.08)` é o padrão.
- **Overlays:** `rgba(55,53,47,0.03)` a `rgba(55,53,47,0.09)` — nunca opaco.
- **Backgrounds com acento:** `rgba(46,170,220,0.06)` — quase invisível.

### O Que Nunca Fazer

- Nunca usar `#FFFFFF` como fundo de página (usar `#FAF9F7`).
- Nunca usar azul Tailwind (`#3B82F6`). O acento é `#2EAADC`.
- Nunca usar `#333333` como texto. O texto é `#37352F` (warm, não neutral).
- Nunca usar cores saturadas em fundos. Tudo é sutil.

---

## Landing Pages

### Hero Section

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">

<section style="background-color: #FAF9F7; padding: 80px 24px; text-align: center; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;">
  <div style="max-width: 720px; margin: 0 auto;">
    <span style="display: inline-block; font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #2EAADC; margin-bottom: 16px;">Produtividade sem fricção</span>
    <h1 style="font-family: 'DM Serif Display', serif; font-size: 48px; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; color: #37352F; margin: 0 0 24px 0;">Organize suas ideias,<br>construa o que importa</h1>
    <p style="font-size: 18px; font-weight: 400; line-height: 1.7; color: #6B6966; margin: 0 0 32px 0; max-width: 540px; margin-left: auto; margin-right: auto;">Tudo o que você precisa para documentar, planejar e executar — em um único espaço que funciona como o seu cérebro.</p>
    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
      <a href="#" style="display: inline-block; background-color: #000000; color: #FFFFFF; font-size: 14px; font-weight: 500; padding: 8px 14px; border-radius: 4px; text-decoration: none;">Começar grátis</a>
      <a href="#" style="display: inline-block; background-color: #FFFFFF; color: #37352F; font-size: 14px; font-weight: 500; padding: 8px 14px; border-radius: 4px; text-decoration: none; border: 1px solid #E3E2DF;">Ver demonstração</a>
    </div>
  </div>
</section>
```

### Features Grid

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">

<section style="background-color: #FFFFFF; padding: 80px 24px; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;">
  <div style="max-width: 960px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 48px;">
      <span style="display: inline-block; font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #2EAADC; margin-bottom: 12px;">Funcionalidades</span>
      <h2 style="font-family: 'DM Serif Display', serif; font-size: 36px; font-weight: 600; line-height: 1.25; letter-spacing: -0.01em; color: #37352F; margin: 0;">Tudo conectado, nada solto</h2>
    </div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
      <!-- Card 1 -->
      <div style="background-color: #FFFFFF; border: 1px solid #E3E2DF; border-radius: 8px; padding: 24px;">
        <div style="width: 32px; height: 32px; background-color: rgba(46,170,220,0.06); border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <span style="color: #2EAADC; font-size: 16px;">📝</span>
        </div>
        <h3 style="font-size: 20px; font-weight: 500; line-height: 1.4; color: #37352F; margin: 0 0 8px 0;">Documentação viva</h3>
        <p style="font-size: 14px; font-weight: 400; line-height: 1.6; color: #6B6966; margin: 0;">Escreva, organize e compartilhe conhecimento sem atrito. Tudo atualizado em tempo real.</p>
      </div>
      <!-- Card 2 -->
      <div style="background-color: #FFFFFF; border: 1px solid #E3E2DF; border-radius: 8px; padding: 24px;">
        <div style="width: 32px; height: 32px; background-color: rgba(46,170,220,0.06); border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <span style="color: #2EAADC; font-size: 16px;">⚡</span>
        </div>
        <h3 style="font-size: 20px; font-weight: 500; line-height: 1.4; color: #37352F; margin: 0 0 8px 0;">Automações inteligentes</h3>
        <p style="font-size: 14px; font-weight: 400; line-height: 1.6; color: #6B6966; margin: 0;">Conecte tarefas, prazos e responsáveis. O sistema trabalha enquanto você foca no que importa.</p>
      </div>
      <!-- Card 3 -->
      <div style="background-color: #FFFFFF; border: 1px solid #E3E2DF; border-radius: 8px; padding: 24px;">
        <div style="width: 32px; height: 32px; background-color: rgba(46,170,220,0.06); border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <span style="color: #2EAADC; font-size: 16px;">🔒</span>
        </div>
        <h3 style="font-size: 20px; font-weight: 500; line-height: 1.4; color: #37352F; margin: 0 0 8px 0;">Permissões granulares</h3>
        <p style="font-size: 14px; font-weight: 400; line-height: 1.6; color: #6B6966; margin: 0;">Controle quem vê, edita e comenta. Segurança sem complicação para equipes de qualquer tamanho.</p>
      </div>
    </div>
  </div>
</section>
```

### Social Proof / Stats

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">

<section style="background-color: #FAF9F7; padding: 80px 24px; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;">
  <div style="max-width: 960px; margin: 0 auto; text-align: center;">
    <span style="display: inline-block; font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #9B9A97; margin-bottom: 32px;">Usado por equipes que entregam</span>
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; margin-bottom: 48px;">
      <div>
        <div style="font-family: 'DM Serif Display', serif; font-size: 48px; font-weight: 700; color: #37352F; line-height: 1.15;">12k+</div>
        <div style="font-size: 14px; color: #6B6966; margin-top: 4px;">Equipes ativas</div>
      </div>
      <div>
        <div style="font-family: 'DM Serif Display', serif; font-size: 48px; font-weight: 700; color: #37352F; line-height: 1.15;">98%</div>
        <div style="font-size: 14px; color: #6B6966; margin-top: 4px;">Taxa de retenção</div>
      </div>
      <div>
        <div style="font-family: 'DM Serif Display', serif; font-size: 48px; font-weight: 700; color: #37352F; line-height: 1.15;">4.9</div>
        <div style="font-size: 14px; color: #6B6966; margin-top: 4px;">Avaliação média</div>
      </div>
      <div>
        <div style="font-family: 'DM Serif Display', serif; font-size: 48px; font-weight: 700; color: #37352F; line-height: 1.15;">2M+</div>
        <div style="font-size: 14px; color: #6B6966; margin-top: 4px;">Documentos criados</div>
      </div>
    </div>
    <!-- Testimonial -->
    <div style="background-color: #FFFFFF; border: 1px solid #E3E2DF; border-radius: 8px; padding: 32px; max-width: 640px; margin: 0 auto; text-align: left;">
      <p style="font-size: 16px; font-weight: 400; line-height: 1.7; color: #37352F; margin: 0 0 16px 0; font-style: italic;">"Trocamos três ferramentas por uma só. O time parou de reclamar e começou a entregar. Simples assim."</p>
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 36px; height: 36px; background-color: #EDECE9; border-radius: 9999px;"></div>
        <div>
          <div style="font-size: 14px; font-weight: 500; color: #37352F;">Marina Costa</div>
          <div style="font-size: 13px; color: #9B9A97;">Head de Produto, TechFlow</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### CTA Section

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">

<section style="background-color: #FFFFFF; padding: 80px 24px; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; text-align: center;">
    <h2 style="font-family: 'DM Serif Display', serif; font-size: 36px; font-weight: 600; line-height: 1.25; letter-spacing: -0.01em; color: #37352F; margin: 0 0 16px 0;">Pronto para simplificar?</h2>
    <p style="font-size: 16px; font-weight: 400; line-height: 1.7; color: #6B6966; margin: 0 0 32px 0;">Comece grátis, sem cartão de crédito. Migre seus dados em minutos. Cancele quando quiser.</p>
    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
      <a href="#" style="display: inline-block; background-color: #000000; color: #FFFFFF; font-size: 14px; font-weight: 500; padding: 8px 14px; border-radius: 4px; text-decoration: none;">Criar conta grátis</a>
      <a href="#" style="display: inline-block; background-color: transparent; color: #37352F; font-size: 14px; font-weight: 500; padding: 8px 14px; border-radius: 4px; text-decoration: none; border: 1px solid #E3E2DF;">Falar com vendas</a>
    </div>
    <p style="font-size: 13px; color: #9B9A97; margin-top: 16px;">Setup em menos de 2 minutos. Sem compromisso.</p>
  </div>
</section>
```

### Pricing Card

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">

<section style="background-color: #FAF9F7; padding: 80px 24px; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;">
  <div style="max-width: 960px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 48px;">
      <h2 style="font-family: 'DM Serif Display', serif; font-size: 36px; font-weight: 600; line-height: 1.25; letter-spacing: -0.01em; color: #37352F; margin: 0 0 12px 0;">Planos que crescem com você</h2>
      <p style="font-size: 16px; color: #6B6966; margin: 0;">Comece grátis. Escale quando precisar.</p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: start;">
      <!-- Free -->
      <div style="background-color: #FFFFFF; border: 1px solid #E3E2DF; border-radius: 8px; padding: 32px;">
        <div style="font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #9B9A97; margin-bottom: 8px;">Grátis</div>
        <div style="font-size: 36px; font-weight: 700; color: #37352F; line-height: 1.25;">R$0</div>
        <div style="font-size: 13px; color: #9B9A97; margin-bottom: 24px;">para sempre</div>
        <ul style="list-style: none; padding: 0; margin: 0 0 24px 0;">
          <li style="font-size: 14px; color: #37352F; line-height: 1.6; padding: 4px 0; display: flex; align-items: center; gap: 8px;"><span style="color: #0F7B6C; font-size: 14px;">✓</span> Até 5 membros</li>
          <li style="font-size: 14px; color: #37352F; line-height: 1.6; padding: 4px 0; display: flex; align-items: center; gap: 8px;"><span style="color: #0F7B6C; font-size: 14px;">✓</span> 1.000 documentos</li>
          <li style="font-size: 14px; color: #37352F; line-height: 1.6; padding: 4px 0; display: flex; align-items: center; gap: 8px;"><span style="color: #0F7B6C; font-size: 14px;">✓</span> Integrações básicas</li>
        </ul>
        <a href="#" style="display: block; text-align: center; background-color: #FFFFFF; color: #37352F; font-size: 14px; font-weight: 500; padding: 8px 14px; border-radius: 4px; text-decoration: none; border: 1px solid #E3E2DF;">Começar grátis</a>
      </div>
      <!-- Pro (destaque) -->
      <div style="background-color: #FFFFFF; border: 2px solid #000000; border-radius: 8px; padding: 32px; position: relative;">
        <span style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background-color: #000000; color: #FFFFFF; font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; padding: 2px 10px; border-radius: 9999px;">Popular</span>
        <div style="font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #9B9A97; margin-bottom: 8px;">Pro</div>
        <div style="font-size: 36px; font-weight: 700; color: #37352F; line-height: 1.25;">R$49</div>
        <div style="font-size: 13px; color: #9B9A97; margin-bottom: 24px;">por membro / mês</div>
        <ul style="list-style: none; padding: 0; margin: 0 0 24px 0;">
          <li style="font-size: 14px; color: #37352F; line-height: 1.6; padding: 4px 0; display: flex; align-items: center; gap: 8px;"><span style="color: #0F7B6C; font-size: 14px;">✓</span> Membros ilimitados</li>
          <li style="font-size: 14px; color: #37352F; line-height: 1.6; padding: 4px 0; display: flex; align-items: center; gap: 8px;"><span style="color: #0F7B6C; font-size: 14px;">✓</span> Documentos ilimitados</li>
          <li style="font-size: 14px; color: #37352F; line-height: 1.6; padding: 4px 0; display: flex; align-items: center; gap: 8px;"><span style="color: #0F7B6C; font-size: 14px;">✓</span> Automações avançadas</li>
          <li style="font-size: 14px; color: #37352F; line-height: 1.6; padding: 4px 0; display: flex; align-items: center; gap: 8px;"><span style="color: #0F7B6C; font-size: 14px;">✓</span> API completa</li>
        </ul>
        <a href="#" style="display: block; text-align: center; background-color: #000000; color: #FFFFFF; font-size: 14px; font-weight: 500; padding: 8px 14px; border-radius: 4px; text-decoration: none;">Assinar Pro</a>
      </div>
      <!-- Enterprise -->
      <div style="background-color: #FFFFFF; border: 1px solid #E3E2DF; border-radius: 8px; padding: 32px;">
        <div style="font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #9B9A97; margin-bottom: 8px;">Enterprise</div>
        <div style="font-size: 36px; font-weight: 700; color: #37352F; line-height: 1.25;">Custom</div>
        <div style="font-size: 13px; color: #9B9A97; margin-bottom: 24px;">sob medida</div>
        <ul style="list-style: none; padding: 0; margin: 0 0 24px 0;">
          <li style="font-size: 14px; color: #37352F; line-height: 1.6; padding: 4px 0; display: flex; align-items: center; gap: 8px;"><span style="color: #0F7B6C; font-size: 14px;">✓</span> Tudo do Pro</li>
          <li style="font-size: 14px; color: #37352F; line-height: 1.6; padding: 4px 0; display: flex; align-items: center; gap: 8px;"><span style="color: #0F7B6C; font-size: 14px;">✓</span> SSO e SCIM</li>
          <li style="font-size: 14px; color: #37352F; line-height: 1.6; padding: 4px 0; display: flex; align-items: center; gap: 8px;"><span style="color: #0F7B6C; font-size: 14px;">✓</span> SLA dedicado</li>
          <li style="font-size: 14px; color: #37352F; line-height: 1.6; padding: 4px 0; display: flex; align-items: center; gap: 8px;"><span style="color: #0F7B6C; font-size: 14px;">✓</span> Suporte prioritário</li>
        </ul>
        <a href="#" style="display: block; text-align: center; background-color: #FFFFFF; color: #37352F; font-size: 14px; font-weight: 500; padding: 8px 14px; border-radius: 4px; text-decoration: none; border: 1px solid #E3E2DF;">Falar com vendas</a>
      </div>
    </div>
  </div>
</section>
```

### Footer

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">

<footer style="background-color: #FAF9F7; border-top: 1px solid #E3E2DF; padding: 48px 24px; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;">
  <div style="max-width: 960px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 32px;">
    <!-- Brand -->
    <div>
      <div style="font-size: 20px; font-weight: 600; color: #37352F; margin-bottom: 12px;">NomeApp</div>
      <p style="font-size: 14px; color: #6B6966; line-height: 1.6; margin: 0;">Organize suas ideias, construa o que importa. Produtividade sem fricção para equipes modernas.</p>
    </div>
    <!-- Produto -->
    <div>
      <div style="font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #9B9A97; margin-bottom: 16px;">Produto</div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <a href="#" style="font-size: 14px; color: #6B6966; text-decoration: none;">Funcionalidades</a>
        <a href="#" style="font-size: 14px; color: #6B6966; text-decoration: none;">Preços</a>
        <a href="#" style="font-size: 14px; color: #6B6966; text-decoration: none;">Changelog</a>
        <a href="#" style="font-size: 14px; color: #6B6966; text-decoration: none;">Documentação</a>
      </div>
    </div>
    <!-- Empresa -->
    <div>
      <div style="font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #9B9A97; margin-bottom: 16px;">Empresa</div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <a href="#" style="font-size: 14px; color: #6B6966; text-decoration: none;">Sobre nós</a>
        <a href="#" style="font-size: 14px; color: #6B6966; text-decoration: none;">Blog</a>
        <a href="#" style="font-size: 14px; color: #6B6966; text-decoration: none;">Carreiras</a>
      </div>
    </div>
    <!-- Legal -->
    <div>
      <div style="font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #9B9A97; margin-bottom: 16px;">Legal</div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <a href="#" style="font-size: 14px; color: #6B6966; text-decoration: none;">Privacidade</a>
        <a href="#" style="font-size: 14px; color: #6B6966; text-decoration: none;">Termos de uso</a>
        <a href="#" style="font-size: 14px; color: #6B6966; text-decoration: none;">Segurança</a>
      </div>
    </div>
  </div>
  <div style="max-width: 960px; margin: 32px auto 0; padding-top: 24px; border-top: 1px solid #E3E2DF; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-size: 13px; color: #9B9A97;">© 2026 NomeApp. Todos os direitos reservados.</span>
    <div style="display: flex; gap: 16px;">
      <a href="#" style="font-size: 13px; color: #9B9A97; text-decoration: none;">Twitter</a>
      <a href="#" style="font-size: 13px; color: #9B9A97; text-decoration: none;">LinkedIn</a>
      <a href="#" style="font-size: 13px; color: #9B9A97; text-decoration: none;">GitHub</a>
    </div>
  </div>
</footer>
```

### Layout Rules

| Regra | Valor | Observação |
|-------|-------|------------|
| Max-width conteúdo | 960px | Nunca 1200px+ |
| Max-width texto | 640-720px | Parágrafos e CTAs |
| Section padding | 80px vertical | Consistente em todas |
| Card padding | 24px | Interno dos cards |
| Gap entre cards | 24px | Grid gap padrão |
| Gap entre botões | 12px | Flex gap |
| Alinhamento hero | center | Sempre centralizado |
| Alinhamento features | center header, left cards | Título central, conteúdo left |

---

## Instagram

### Carrossel — 1080 × 1350px

**Slide 1 — Capa**

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">

<div style="width: 1080px; height: 1350px; background-color: #FAF9F7; font-family: 'DM Sans', -apple-system, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; box-sizing: border-box; position: relative;">
  <span style="font-size: 22px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #2EAADC; margin-bottom: 32px;">Produtividade</span>
  <h1 style="font-family: 'DM Serif Display', serif; font-size: 72px; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; color: #37352F; text-align: center; margin: 0 0 32px 0;">5 hábitos que<br>dobram sua<br>produtividade</h1>
  <p style="font-size: 28px; color: #6B6966; text-align: center; margin: 0;">Sem app novo. Sem hack milagroso.</p>
  <!-- Progress bar -->
  <div style="position: absolute; bottom: 60px; left: 80px; right: 80px; display: flex; gap: 8px;">
    <div style="flex: 1; height: 3px; background-color: #37352F; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
  </div>
</div>
```

**Slide 2-6 — Conteúdo interno**

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">

<div style="width: 1080px; height: 1350px; background-color: #FFFFFF; font-family: 'DM Sans', -apple-system, sans-serif; display: flex; flex-direction: column; justify-content: center; padding: 80px; box-sizing: border-box; position: relative;">
  <span style="font-size: 80px; font-weight: 700; color: rgba(46,170,220,0.15); margin-bottom: 24px; line-height: 1;">01</span>
  <h2 style="font-family: 'DM Serif Display', serif; font-size: 52px; font-weight: 700; line-height: 1.2; color: #37352F; margin: 0 0 24px 0;">Comece pelo mais difícil</h2>
  <p style="font-size: 28px; font-weight: 400; line-height: 1.6; color: #6B6966; margin: 0;">Seu cérebro tem mais energia de manhã. A tarefa que você evita é a que mais precisa de foco. Resolva primeiro, celebre depois.</p>
  <!-- Progress bar -->
  <div style="position: absolute; bottom: 60px; left: 80px; right: 80px; display: flex; gap: 8px;">
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #37352F; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
  </div>
</div>
```

**Slide 7 — CTA final**

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">

<div style="width: 1080px; height: 1350px; background-color: #FAF9F7; font-family: 'DM Sans', -apple-system, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; box-sizing: border-box; position: relative;">
  <h2 style="font-family: 'DM Serif Display', serif; font-size: 56px; font-weight: 700; line-height: 1.2; color: #37352F; text-align: center; margin: 0 0 24px 0;">Quer o checklist<br>completo?</h2>
  <p style="font-size: 28px; color: #6B6966; text-align: center; margin: 0 0 40px 0;">Link na bio. É grátis.</p>
  <div style="background-color: #000000; color: #FFFFFF; font-size: 24px; font-weight: 500; padding: 16px 32px; border-radius: 4px;">Salve para depois</div>
  <!-- Progress bar -->
  <div style="position: absolute; bottom: 60px; left: 80px; right: 80px; display: flex; gap: 8px;">
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #E3E2DF; border-radius: 9999px;"></div>
    <div style="flex: 1; height: 3px; background-color: #37352F; border-radius: 9999px;"></div>
  </div>
</div>
```

### Post Único — 1080 × 1080px

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">

<div style="width: 1080px; height: 1080px; background-color: #FAF9F7; font-family: 'DM Sans', -apple-system, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; box-sizing: border-box;">
  <span style="font-size: 22px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #2EAADC; margin-bottom: 24px;">Dica rápida</span>
  <h1 style="font-family: 'DM Serif Display', serif; font-size: 64px; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; color: #37352F; text-align: center; margin: 0 0 24px 0;">Menos ferramentas,<br>mais foco</h1>
  <p style="font-size: 26px; color: #6B6966; text-align: center; line-height: 1.5; margin: 0; max-width: 800px;">Cada app novo é uma decisão a mais. Simplifique a stack, libere espaço mental.</p>
  <div style="position: absolute; bottom: 48px; right: 64px; font-size: 18px; font-weight: 500; color: #9B9A97;">@seuhandle</div>
</div>
```

### Stories — 1080 × 1920px

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">

<div style="width: 1080px; height: 1920px; background-color: #FAF9F7; font-family: 'DM Sans', -apple-system, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; box-sizing: border-box; position: relative;">
  <!-- Top label -->
  <span style="position: absolute; top: 120px; font-size: 22px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #2EAADC;">Novo artigo</span>
  <!-- Content -->
  <h1 style="font-family: 'DM Serif Display', serif; font-size: 72px; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; color: #37352F; text-align: center; margin: 0 0 32px 0;">Como documentar<br>sem perder<br>3 horas</h1>
  <p style="font-size: 28px; color: #6B6966; text-align: center; line-height: 1.5; margin: 0 0 48px 0; max-width: 860px;">O método que uso para criar docs que o time realmente lê.</p>
  <!-- CTA -->
  <div style="background-color: #000000; color: #FFFFFF; font-size: 24px; font-weight: 500; padding: 16px 40px; border-radius: 4px;">Deslize para cima</div>
  <!-- Handle -->
  <span style="position: absolute; bottom: 120px; font-size: 20px; font-weight: 500; color: #9B9A97;">@seuhandle</span>
</div>
```

---

## YouTube

### Thumbnail — 1280 × 720px

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">

<div style="width: 1280px; height: 720px; background-color: #FAF9F7; font-family: 'DM Sans', -apple-system, sans-serif; display: flex; align-items: center; padding: 64px; box-sizing: border-box; position: relative;">
  <!-- Text side -->
  <div style="flex: 1; padding-right: 48px;">
    <span style="display: inline-block; background-color: #2EAADC; color: #FFFFFF; font-size: 16px; font-weight: 600; padding: 4px 12px; border-radius: 3px; margin-bottom: 16px;">GUIA COMPLETO</span>
    <h1 style="font-family: 'DM Serif Display', serif; font-size: 56px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; color: #37352F; margin: 0;">Produtividade<br>para quem<br>odeia planilha</h1>
  </div>
  <!-- Image placeholder -->
  <div style="width: 360px; height: 480px; background-color: #EDECE9; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
    <span style="font-size: 14px; color: #9B9A97;">Foto aqui</span>
  </div>
</div>
```

### Banner — 2560 × 1440px

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">

<div style="width: 2560px; height: 1440px; background-color: #FAF9F7; font-family: 'DM Sans', -apple-system, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box; position: relative;">
  <!-- Safe zone (1546x423 centered) -->
  <div style="text-align: center;">
    <h1 style="font-family: 'DM Serif Display', serif; font-size: 96px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; color: #37352F; margin: 0 0 16px 0;">Organize. Crie. Entregue.</h1>
    <p style="font-size: 32px; font-weight: 400; color: #6B6966; margin: 0;">Produtividade sem fricção para equipes que pensam diferente</p>
  </div>
  <!-- Accent line -->
  <div style="position: absolute; bottom: 480px; left: 50%; transform: translateX(-50%); width: 120px; height: 3px; background-color: #2EAADC; border-radius: 9999px;"></div>
</div>
```

---

## Fotografia e Imagem

### Estilo Visual

- **Clean e minimal.** Espaço negativo generoso. Sem elementos decorativos desnecessários.
- **Luz natural.** Prefira iluminação suave, difusa. Nada de flash direto ou neon.
- **Tons neutros quentes.** A paleta da foto deve harmonizar com #FAF9F7 / #37352F.
- **Pessoas reais.** Sem stock genérico. Prefira fotos com expressões naturais, contexto de trabalho.
- **Ambiente:** mesas limpas, notebooks, cafés, escritórios minimalistas, espaços de coworking.

### Prompts para IA (Midjourney / DALL-E / Flux)

**Ambiente de trabalho:**
```
Clean minimal workspace, natural soft light from large window, wooden desk with laptop and coffee, 
warm neutral tones, off-white walls, no clutter, shallow depth of field, editorial photography style, 
Canon EOS R5, 35mm f/1.4
```

**Retrato profissional:**
```
Professional portrait, person working on laptop in bright minimal office, warm natural lighting, 
soft shadows, neutral warm color palette matching #FAF9F7 background, genuine expression, 
editorial style, shot on medium format, 85mm f/2
```

**Abstract / hero background:**
```
Subtle abstract pattern, soft geometric shapes, warm off-white (#FAF9F7) base color, 
very low contrast, minimal, clean, suitable as website hero background, no text, 
noise texture, grain
```

### Tratamento

| Parâmetro | Valor |
|-----------|-------|
| Saturação | Reduzida (-10 a -20%) |
| Contraste | Suave, não extremo |
| Temperatura | Levemente quente |
| Sombras | Levantadas (sem preto esmagado) |
| Grão | Sutil, 5-10% |

---

## Componentes HTML Prontos

### Botões

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">

<!-- Primary -->
<a href="#" style="display: inline-block; background-color: #000000; color: #FFFFFF; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; padding: 8px 14px; border-radius: 4px; text-decoration: none; border: none; cursor: pointer;">Começar agora</a>

<!-- Secondary -->
<a href="#" style="display: inline-block; background-color: #FFFFFF; color: #37352F; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; padding: 8px 14px; border-radius: 4px; text-decoration: none; border: 1px solid #E3E2DF; cursor: pointer;">Saiba mais</a>

<!-- Ghost -->
<a href="#" style="display: inline-block; background-color: transparent; color: #6B6966; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; padding: 8px 14px; border-radius: 4px; text-decoration: none; border: none; cursor: pointer;">Cancelar</a>

<!-- Accent (uso esporádico) -->
<a href="#" style="display: inline-block; background-color: #2EAADC; color: #FFFFFF; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; padding: 8px 14px; border-radius: 4px; text-decoration: none; border: none; cursor: pointer;">Upgrade</a>
```

### Card

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">

<div style="background-color: #FFFFFF; border: 1px solid #E3E2DF; border-radius: 8px; padding: 24px; font-family: 'DM Sans', sans-serif; max-width: 360px;">
  <div style="font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #9B9A97; margin-bottom: 8px;">Categoria</div>
  <h3 style="font-size: 20px; font-weight: 500; line-height: 1.4; color: #37352F; margin: 0 0 8px 0;">Título do card</h3>
  <p style="font-size: 14px; font-weight: 400; line-height: 1.6; color: #6B6966; margin: 0 0 16px 0;">Descrição breve do conteúdo. Uma ou duas linhas no máximo para manter a leitura fluida.</p>
  <a href="#" style="font-size: 14px; font-weight: 500; color: #37352F; text-decoration: none;">Ler mais →</a>
</div>
```

### Lista com ícones

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">

<ul style="list-style: none; padding: 0; margin: 0; font-family: 'DM Sans', sans-serif;">
  <li style="display: flex; align-items: flex-start; gap: 12px; padding: 8px 0;">
    <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background-color: rgba(15,123,108,0.08); border-radius: 9999px; flex-shrink: 0; margin-top: 2px;"><span style="color: #0F7B6C; font-size: 13px;">✓</span></span>
    <span style="font-size: 16px; color: #37352F; line-height: 1.7;">Documentação colaborativa em tempo real</span>
  </li>
  <li style="display: flex; align-items: flex-start; gap: 12px; padding: 8px 0;">
    <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background-color: rgba(15,123,108,0.08); border-radius: 9999px; flex-shrink: 0; margin-top: 2px;"><span style="color: #0F7B6C; font-size: 13px;">✓</span></span>
    <span style="font-size: 16px; color: #37352F; line-height: 1.7;">Automações que eliminam trabalho repetitivo</span>
  </li>
  <li style="display: flex; align-items: flex-start; gap: 12px; padding: 8px 0;">
    <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background-color: rgba(15,123,108,0.08); border-radius: 9999px; flex-shrink: 0; margin-top: 2px;"><span style="color: #0F7B6C; font-size: 13px;">✓</span></span>
    <span style="font-size: 16px; color: #37352F; line-height: 1.7;">Permissões granulares por equipe e projeto</span>
  </li>
</ul>
```

### Input

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">

<input type="text" placeholder="Seu email de trabalho" style="font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 400; color: #37352F; background-color: #FAF9F7; border: 1px solid #E3E2DF; border-radius: 4px; padding: 8px 12px; width: 280px; outline: none;">
```

---

## Tom de Voz

### Princípios

| Pilar | Descrição | Exemplo |
|-------|-----------|---------|
| Clareza | Direto, sem jargão. Se precisa de glossário, reescreva. | "Organize seus projetos" (não "Otimize seus workflows") |
| Humano | Fala como colega, não como manual. | "Pronto para simplificar?" (não "Inicie sua jornada") |
| Funcional | Foca no que o produto faz, não no que ele é. | "Crie docs que o time lê" (não "Plataforma líder em...") |
| Confiante | Sem adjetivos inflados. O produto prova sozinho. | "Funciona." (não "A melhor solução revolucionária") |

### Tom por contexto

| Contexto | Tom | Exemplo |
|----------|-----|---------|
| Hero / headline | Inspirador + direto | "Organize suas ideias, construa o que importa" |
| Feature description | Funcional + breve | "Escreva, organize e compartilhe conhecimento sem atrito" |
| CTA button | Ação clara, sem pressão | "Começar grátis", "Ver demonstração" |
| Error message | Empático + solução | "Algo deu errado. Tente novamente em alguns segundos." |
| Empty state | Motivador + orientação | "Nenhum documento ainda. Que tal criar o primeiro?" |

### Palavras preferidas vs. evitadas

| Preferir | Evitar |
|----------|--------|
| Organizar | Revolucionar |
| Criar | Desbloquear |
| Simples | Disruptivo |
| Equipe | Stakeholders |
| Funciona | Game-changer |
| Prático | Sinérgico |
| Rápido | Cutting-edge |

---

## Anti-slop

Regras inegociáveis para manter a identidade Notion Clean:

| Regra | Por quê |
|-------|---------|
| ZERO animações hover scale | Notion é estático por design. Nada pulsa, cresce ou brilha. |
| Sombras ULTRA sutis | `rgba` com opacity < 0.12. Sombra visível = sombra errada. |
| Radii PEQUENOS (3-4px) | Sharp, não bubbly. Botão com `border-radius: 20px` quebra tudo. |
| Cores warm-neutral | `#37352F` para texto, nunca `#333`. `#FAF9F7` para fundo, nunca `#FFF`. |
| Botões compactos | `padding: 8px 14px`. Botão inflado (16px 32px) parece SaaS genérico. |
| Off-white background | `#FAF9F7` como base. Branco puro (#FFF) só em cards elevados. |
| Família DM consistente | DM Sans + DM Serif Display + DM Mono. Nunca misturar Inter, Poppins, etc. |
| Contraste alto real | Preto (#000) em botões. Texto (#37352F) sobre off-white. Nada cinza-claro-sobre-cinza. |
| Sem gradientes | Fundos sólidos. No máximo `rgba` sutil para tints de acento. |
| Sem ícones coloridos chamativos | Ícones monocromáticos (#37352F ou #9B9A97) ou acento sutil (#2EAADC com opacity). |
