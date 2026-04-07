# Vercel Noir — Guia Prático

> Monocromático puro, precisão cirúrgica. Para SaaS, dev tools, produtos premium.
> Fonte: `vercel-noir.yaml` v2 — extração real de vercel.com

---

## Visão Geral

Vercel Noir é um sistema visual **100% monocromático**. Zero cores saturadas. A paleta inteira vive na escala de cinza entre `#09090B` (preto profundo) e `#FAFAFA` (branco quase puro). O resultado é uma estética que comunica: **caro, técnico, confiável**.

| Token | Valor | Uso |
|-------|-------|-----|
| Background | `#09090B` | Fundo principal de tudo |
| Surface | `#18181B` | Cards, blocos, áreas elevadas |
| Surface Elevated | `#27272A` | Hover states, menus, popovers |
| Border | `#27272A` | Bordas padrão |
| Border Hover | `#3F3F46` | Bordas em hover |
| Text | `#FAFAFA` | Texto principal |
| Text Secondary | `#A1A1AA` | Subtítulos, descrições |
| Text Muted | `#71717A` | Placeholders, captions |
| Primary | `#FAFAFA` | Botões primários, CTAs |
| Accent | `#A1A1AA` | Destaques sutis |

**Regra de ouro:** se você está prestes a usar uma cor saturada, **pare**. Use um cinza mais claro ou mais escuro.

---

## Tipografia — Regras de Uso

**Fonte:** Geist (display + body) / Geist Mono (código)
**CDN:** `https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans`
**Fallback:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### Escala Tipográfica

| Nível | Tamanho | Peso | Line Height | Letter Spacing |
|-------|---------|------|-------------|----------------|
| H1 | 56px | 700 | 1.1 | -0.02em |
| H2 | 40px | 600 | 1.2 | -0.01em |
| H3 | 32px | 600 | 1.3 | -0.005em |
| H4 | 24px | 600 | 1.35 | — |
| Body | 16px | 400 | 1.6 | — |
| Body SM | 14px | 400 | 1.5 | — |
| Caption | 13px | 400 | 1.5 | 0.01em |
| Label | 12px | 500 | 1.4 | 0.04em / UPPERCASE |

### Regras

1. **NUNCA** substituir Geist por Inter, Roboto ou qualquer outra fonte
2. H1 sempre com `letter-spacing: -0.02em` — tracking apertado comunica premium
3. Labels sempre em UPPERCASE com `letter-spacing: 0.04em`
4. Body text sempre 16px mínimo para legibilidade
5. Use Geist Mono para blocos de código, métricas e dados técnicos

---

## Cores — Regras de Uso

### Escala Completa de Cinzas

| Token | Hex | Uso Primário |
|-------|-----|-------------|
| Gray 50 | `#FAFAFA` | Texto principal, botão primário |
| Gray 100 | `#F4F4F5` | Hover de texto branco |
| Gray 200 | `#E4E4E7` | Primary hover, bordas claras |
| Gray 300 | `#D4D4D8` | Separadores, dividers |
| Gray 400 | `#A1A1AA` | Texto secundário, accent |
| Gray 500 | `#71717A` | Texto muted, placeholders |
| Gray 600 | `#52525B` | Ícones desativados |
| Gray 700 | `#3F3F46` | Border hover |
| Gray 800 | `#27272A` | Surface elevated, border |
| Gray 900 | `#18181B` | Surface (cards) |
| Gray 950 | `#09090B` | Background |

### Cores Semânticas (uso restrito)

Estas cores existem **apenas** para feedback de sistema. NUNCA use como decoração.

| Semântica | Hex | Quando usar |
|-----------|-----|-------------|
| Success | `#22C55E` | Confirmação de ação, deploy bem-sucedido |
| Warning | `#F59E0B` | Alertas não-críticos |
| Error | `#EF4444` | Erros, falhas, validação |
| Info | `#3B82F6` | Informações contextuais |

---

## Landing Pages

### Hero Section

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css">

<section style="background-color: #09090B; padding: 120px 24px 80px; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; text-align: center;">
  <div style="max-width: 800px; margin: 0 auto;">
    <span style="display: inline-block; font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: #A1A1AA; margin-bottom: 24px; padding: 6px 16px; border: 1px solid #27272A; border-radius: 9999px;">Novo: Deploy Global em 3 Segundos</span>
    <h1 style="font-size: 56px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; color: #FAFAFA; margin: 0 0 24px;">Deploy em segundos.<br>Performance no limite.</h1>
    <p style="font-size: 18px; font-weight: 400; line-height: 1.6; color: #A1A1AA; margin: 0 0 40px; max-width: 600px; margin-left: auto; margin-right: auto;">A plataforma que transforma código em produto. Infraestrutura invisível, resultados visíveis.</p>
    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
      <a href="#" style="display: inline-flex; align-items: center; padding: 12px 24px; background-color: #FAFAFA; color: #09090B; font-size: 14px; font-weight: 500; border-radius: 6px; text-decoration: none; transition: background-color 200ms cubic-bezier(0.4, 0, 0.2, 1);">Começar Agora</a>
      <a href="#" style="display: inline-flex; align-items: center; padding: 12px 24px; background-color: transparent; color: #FAFAFA; font-size: 14px; font-weight: 500; border-radius: 6px; text-decoration: none; border: 1px solid #27272A; transition: border-color 200ms cubic-bezier(0.4, 0, 0.2, 1);">Ver Documentação</a>
    </div>
  </div>
</section>
```

### Features Section

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css">

<section style="background-color: #09090B; padding: 80px 24px; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 1100px; margin: 0 auto;">
    <span style="display: block; font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: #A1A1AA; margin-bottom: 16px; text-align: center;">Recursos</span>
    <h2 style="font-size: 40px; font-weight: 600; line-height: 1.2; letter-spacing: -0.01em; color: #FAFAFA; text-align: center; margin: 0 0 64px;">Tudo que você precisa para escalar</h2>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
      <!-- Card 1 -->
      <div style="background-color: #18181B; border: 1px solid #27272A; border-radius: 12px; padding: 24px;">
        <div style="width: 40px; height: 40px; background-color: #27272A; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FAFAFA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <h3 style="font-size: 18px; font-weight: 600; color: #FAFAFA; margin: 0 0 8px;">Edge Functions</h3>
        <p style="font-size: 14px; color: #A1A1AA; line-height: 1.5; margin: 0;">Execute código na edge mais próxima do usuário. Latência mínima, performance máxima.</p>
      </div>
      <!-- Card 2 -->
      <div style="background-color: #18181B; border: 1px solid #27272A; border-radius: 12px; padding: 24px;">
        <div style="width: 40px; height: 40px; background-color: #27272A; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FAFAFA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        </div>
        <h3 style="font-size: 18px; font-weight: 600; color: #FAFAFA; margin: 0 0 8px;">Preview Deploys</h3>
        <p style="font-size: 14px; color: #A1A1AA; line-height: 1.5; margin: 0;">Cada pull request gera um ambiente completo. Revise mudanças antes de ir para produção.</p>
      </div>
      <!-- Card 3 -->
      <div style="background-color: #18181B; border: 1px solid #27272A; border-radius: 12px; padding: 24px;">
        <div style="width: 40px; height: 40px; background-color: #27272A; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FAFAFA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h3 style="font-size: 18px; font-weight: 600; color: #FAFAFA; margin: 0 0 8px;">Segurança Nativa</h3>
        <p style="font-size: 14px; color: #A1A1AA; line-height: 1.5; margin: 0;">SSL automático, headers de segurança e DDoS protection incluídos em cada deploy.</p>
      </div>
    </div>
  </div>
</section>
```

### Stats Section

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css">

<section style="background-color: #09090B; padding: 80px 24px; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; border-top: 1px solid #27272A; border-bottom: 1px solid #27272A;">
  <div style="max-width: 1100px; margin: 0 auto;">
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; text-align: center;">
      <!-- Stat 1 -->
      <div>
        <p style="font-size: 48px; font-weight: 700; letter-spacing: -0.02em; color: #FAFAFA; margin: 0; line-height: 1.1;">99.99%</p>
        <p style="font-size: 14px; color: #A1A1AA; margin: 8px 0 0; line-height: 1.5;">Uptime garantido</p>
      </div>
      <!-- Stat 2 -->
      <div>
        <p style="font-size: 48px; font-weight: 700; letter-spacing: -0.02em; color: #FAFAFA; margin: 0; line-height: 1.1;">50ms</p>
        <p style="font-size: 14px; color: #A1A1AA; margin: 8px 0 0; line-height: 1.5;">Latência média global</p>
      </div>
      <!-- Stat 3 -->
      <div>
        <p style="font-size: 48px; font-weight: 700; letter-spacing: -0.02em; color: #FAFAFA; margin: 0; line-height: 1.1;">100+</p>
        <p style="font-size: 14px; color: #A1A1AA; margin: 8px 0 0; line-height: 1.5;">Edge locations</p>
      </div>
      <!-- Stat 4 -->
      <div>
        <p style="font-size: 48px; font-weight: 700; letter-spacing: -0.02em; color: #FAFAFA; margin: 0; line-height: 1.1;">10M+</p>
        <p style="font-size: 14px; color: #A1A1AA; margin: 8px 0 0; line-height: 1.5;">Deploys por semana</p>
      </div>
    </div>
  </div>
</section>
```

### CTA Section

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css">

<section style="background-color: #09090B; padding: 80px 24px; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; text-align: center;">
  <div style="max-width: 700px; margin: 0 auto; background-color: #18181B; border: 1px solid #27272A; border-radius: 12px; padding: 64px 40px;">
    <h2 style="font-size: 40px; font-weight: 600; line-height: 1.2; letter-spacing: -0.01em; color: #FAFAFA; margin: 0 0 16px;">Pronto para o próximo nível?</h2>
    <p style="font-size: 16px; color: #A1A1AA; line-height: 1.6; margin: 0 0 32px;">Comece grátis. Escale sem limites. Pague quando crescer.</p>
    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
      <a href="#" style="display: inline-flex; align-items: center; padding: 12px 32px; background-color: #FAFAFA; color: #09090B; font-size: 14px; font-weight: 500; border-radius: 6px; text-decoration: none;">Criar Conta Grátis</a>
      <a href="#" style="display: inline-flex; align-items: center; padding: 12px 32px; background-color: transparent; color: #FAFAFA; font-size: 14px; font-weight: 500; border-radius: 6px; text-decoration: none; border: 1px solid #27272A;">Falar com Vendas</a>
    </div>
  </div>
</section>
```

### Pricing Section

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css">

<section style="background-color: #09090B; padding: 80px 24px; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 1100px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 64px;">
      <span style="display: inline-block; font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: #A1A1AA; margin-bottom: 16px;">Preços</span>
      <h2 style="font-size: 40px; font-weight: 600; line-height: 1.2; letter-spacing: -0.01em; color: #FAFAFA; margin: 0;">Transparente e previsível</h2>
    </div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
      <!-- Hobby -->
      <div style="background-color: #18181B; border: 1px solid #27272A; border-radius: 12px; padding: 32px 24px; display: flex; flex-direction: column;">
        <h3 style="font-size: 18px; font-weight: 600; color: #FAFAFA; margin: 0 0 8px;">Hobby</h3>
        <p style="font-size: 14px; color: #A1A1AA; line-height: 1.5; margin: 0 0 24px;">Para projetos pessoais e experimentos.</p>
        <p style="margin: 0 0 24px;"><span style="font-size: 40px; font-weight: 700; color: #FAFAFA; letter-spacing: -0.02em;">R$0</span><span style="font-size: 14px; color: #71717A;">/mês</span></p>
        <ul style="list-style: none; padding: 0; margin: 0 0 32px; flex: 1;">
          <li style="font-size: 14px; color: #A1A1AA; padding: 8px 0; border-bottom: 1px solid #27272A; display: flex; align-items: center; gap: 8px;"><span style="color: #FAFAFA;">&#10003;</span> 100GB de bandwidth</li>
          <li style="font-size: 14px; color: #A1A1AA; padding: 8px 0; border-bottom: 1px solid #27272A; display: flex; align-items: center; gap: 8px;"><span style="color: #FAFAFA;">&#10003;</span> SSL automático</li>
          <li style="font-size: 14px; color: #A1A1AA; padding: 8px 0; display: flex; align-items: center; gap: 8px;"><span style="color: #FAFAFA;">&#10003;</span> Preview deploys</li>
        </ul>
        <a href="#" style="display: block; text-align: center; padding: 12px 24px; background-color: transparent; color: #FAFAFA; font-size: 14px; font-weight: 500; border-radius: 6px; text-decoration: none; border: 1px solid #27272A;">Começar Grátis</a>
      </div>
      <!-- Pro (destaque) -->
      <div style="background-color: #18181B; border: 1px solid #FAFAFA; border-radius: 12px; padding: 32px 24px; display: flex; flex-direction: column; position: relative;">
        <span style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background-color: #FAFAFA; color: #09090B; font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px;">Popular</span>
        <h3 style="font-size: 18px; font-weight: 600; color: #FAFAFA; margin: 0 0 8px;">Pro</h3>
        <p style="font-size: 14px; color: #A1A1AA; line-height: 1.5; margin: 0 0 24px;">Para times que precisam de performance.</p>
        <p style="margin: 0 0 24px;"><span style="font-size: 40px; font-weight: 700; color: #FAFAFA; letter-spacing: -0.02em;">R$97</span><span style="font-size: 14px; color: #71717A;">/mês por membro</span></p>
        <ul style="list-style: none; padding: 0; margin: 0 0 32px; flex: 1;">
          <li style="font-size: 14px; color: #A1A1AA; padding: 8px 0; border-bottom: 1px solid #27272A; display: flex; align-items: center; gap: 8px;"><span style="color: #FAFAFA;">&#10003;</span> 1TB de bandwidth</li>
          <li style="font-size: 14px; color: #A1A1AA; padding: 8px 0; border-bottom: 1px solid #27272A; display: flex; align-items: center; gap: 8px;"><span style="color: #FAFAFA;">&#10003;</span> Analytics avançado</li>
          <li style="font-size: 14px; color: #A1A1AA; padding: 8px 0; border-bottom: 1px solid #27272A; display: flex; align-items: center; gap: 8px;"><span style="color: #FAFAFA;">&#10003;</span> Edge Functions ilimitadas</li>
          <li style="font-size: 14px; color: #A1A1AA; padding: 8px 0; display: flex; align-items: center; gap: 8px;"><span style="color: #FAFAFA;">&#10003;</span> Suporte prioritário</li>
        </ul>
        <a href="#" style="display: block; text-align: center; padding: 12px 24px; background-color: #FAFAFA; color: #09090B; font-size: 14px; font-weight: 500; border-radius: 6px; text-decoration: none;">Assinar Pro</a>
      </div>
      <!-- Enterprise -->
      <div style="background-color: #18181B; border: 1px solid #27272A; border-radius: 12px; padding: 32px 24px; display: flex; flex-direction: column;">
        <h3 style="font-size: 18px; font-weight: 600; color: #FAFAFA; margin: 0 0 8px;">Enterprise</h3>
        <p style="font-size: 14px; color: #A1A1AA; line-height: 1.5; margin: 0 0 24px;">Para organizações com requisitos avançados.</p>
        <p style="margin: 0 0 24px;"><span style="font-size: 40px; font-weight: 700; color: #FAFAFA; letter-spacing: -0.02em;">Custom</span></p>
        <ul style="list-style: none; padding: 0; margin: 0 0 32px; flex: 1;">
          <li style="font-size: 14px; color: #A1A1AA; padding: 8px 0; border-bottom: 1px solid #27272A; display: flex; align-items: center; gap: 8px;"><span style="color: #FAFAFA;">&#10003;</span> SLA 99.99%</li>
          <li style="font-size: 14px; color: #A1A1AA; padding: 8px 0; border-bottom: 1px solid #27272A; display: flex; align-items: center; gap: 8px;"><span style="color: #FAFAFA;">&#10003;</span> SSO / SAML</li>
          <li style="font-size: 14px; color: #A1A1AA; padding: 8px 0; border-bottom: 1px solid #27272A; display: flex; align-items: center; gap: 8px;"><span style="color: #FAFAFA;">&#10003;</span> Audit logs</li>
          <li style="font-size: 14px; color: #A1A1AA; padding: 8px 0; display: flex; align-items: center; gap: 8px;"><span style="color: #FAFAFA;">&#10003;</span> Suporte dedicado 24/7</li>
        </ul>
        <a href="#" style="display: block; text-align: center; padding: 12px 24px; background-color: transparent; color: #FAFAFA; font-size: 14px; font-weight: 500; border-radius: 6px; text-decoration: none; border: 1px solid #27272A;">Falar com Vendas</a>
      </div>
    </div>
  </div>
</section>
```

### Footer Section

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css">

<footer style="background-color: #09090B; padding: 64px 24px 32px; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; border-top: 1px solid #27272A;">
  <div style="max-width: 1100px; margin: 0 auto;">
    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px;">
      <!-- Brand -->
      <div>
        <p style="font-size: 18px; font-weight: 600; color: #FAFAFA; margin: 0 0 12px;">SuaMarca</p>
        <p style="font-size: 14px; color: #71717A; line-height: 1.5; margin: 0; max-width: 280px;">A plataforma que desenvolvedores escolhem quando performance importa.</p>
      </div>
      <!-- Produto -->
      <div>
        <p style="font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: #A1A1AA; margin: 0 0 16px;">Produto</p>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #71717A; text-decoration: none;">Features</a></li>
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #71717A; text-decoration: none;">Preços</a></li>
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #71717A; text-decoration: none;">Enterprise</a></li>
          <li><a href="#" style="font-size: 14px; color: #71717A; text-decoration: none;">Changelog</a></li>
        </ul>
      </div>
      <!-- Recursos -->
      <div>
        <p style="font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: #A1A1AA; margin: 0 0 16px;">Recursos</p>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #71717A; text-decoration: none;">Documentação</a></li>
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #71717A; text-decoration: none;">Guias</a></li>
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #71717A; text-decoration: none;">Blog</a></li>
          <li><a href="#" style="font-size: 14px; color: #71717A; text-decoration: none;">API Reference</a></li>
        </ul>
      </div>
      <!-- Legal -->
      <div>
        <p style="font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: #A1A1AA; margin: 0 0 16px;">Legal</p>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #71717A; text-decoration: none;">Privacidade</a></li>
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #71717A; text-decoration: none;">Termos</a></li>
          <li><a href="#" style="font-size: 14px; color: #71717A; text-decoration: none;">SLA</a></li>
        </ul>
      </div>
    </div>
    <div style="border-top: 1px solid #27272A; padding-top: 24px; display: flex; justify-content: space-between; align-items: center;">
      <p style="font-size: 13px; color: #71717A; margin: 0;">&copy; 2026 SuaMarca. Todos os direitos reservados.</p>
      <div style="display: flex; gap: 16px;">
        <a href="#" style="color: #71717A; text-decoration: none;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        </a>
        <a href="#" style="color: #71717A; text-decoration: none;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
      </div>
    </div>
  </div>
</footer>
```

---

## Instagram

### Carrossel (1080 x 1350px)

#### Slide de Capa

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css">

<div style="width: 1080px; height: 1350px; background-color: #09090B; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; box-sizing: border-box; position: relative;">
  <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background-color: #FAFAFA;"></div>
  <span style="font-size: 14px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: #A1A1AA; margin-bottom: 32px;">Dev Tips</span>
  <h1 style="font-size: 64px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; color: #FAFAFA; text-align: center; margin: 0 0 24px;">5 Erros de Deploy que Matam sua App</h1>
  <p style="font-size: 22px; color: #A1A1AA; text-align: center; line-height: 1.5; margin: 0; max-width: 800px;">E como corrigir cada um deles em menos de 5 minutos.</p>
  <div style="position: absolute; bottom: 80px; display: flex; align-items: center; gap: 12px;">
    <div style="width: 48px; height: 48px; background-color: #27272A; border-radius: 9999px;"></div>
    <div>
      <p style="font-size: 16px; font-weight: 500; color: #FAFAFA; margin: 0;">@suamarca</p>
      <p style="font-size: 13px; color: #71717A; margin: 2px 0 0;">Salve para consultar depois</p>
    </div>
  </div>
</div>
```

#### Slide de Conteúdo

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css">

<div style="width: 1080px; height: 1350px; background-color: #09090B; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; flex-direction: column; justify-content: center; padding: 80px; box-sizing: border-box; position: relative;">
  <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background-color: #FAFAFA;"></div>
  <span style="display: inline-block; font-size: 80px; font-weight: 700; color: #27272A; margin-bottom: 24px; line-height: 1;">01</span>
  <h2 style="font-size: 48px; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; color: #FAFAFA; margin: 0 0 24px;">Não configurar variáveis de ambiente</h2>
  <div style="width: 64px; height: 3px; background-color: #3F3F46; margin-bottom: 24px;"></div>
  <p style="font-size: 22px; color: #A1A1AA; line-height: 1.6; margin: 0; max-width: 850px;">Sua app funciona local mas quebra em produção? Provavelmente você esqueceu de configurar as env vars no painel de deploy. Sempre confira antes de subir.</p>
  <div style="position: absolute; bottom: 60px; right: 80px; display: flex; gap: 8px;">
    <div style="width: 8px; height: 8px; border-radius: 9999px; background-color: #FAFAFA;"></div>
    <div style="width: 8px; height: 8px; border-radius: 9999px; background-color: #3F3F46;"></div>
    <div style="width: 8px; height: 8px; border-radius: 9999px; background-color: #3F3F46;"></div>
    <div style="width: 8px; height: 8px; border-radius: 9999px; background-color: #3F3F46;"></div>
    <div style="width: 8px; height: 8px; border-radius: 9999px; background-color: #3F3F46;"></div>
  </div>
</div>
```

#### Slide Final (CTA)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css">

<div style="width: 1080px; height: 1350px; background-color: #09090B; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; box-sizing: border-box; position: relative;">
  <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background-color: #FAFAFA;"></div>
  <h2 style="font-size: 48px; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; color: #FAFAFA; text-align: center; margin: 0 0 24px;">Quer mais dicas assim?</h2>
  <p style="font-size: 22px; color: #A1A1AA; text-align: center; line-height: 1.5; margin: 0 0 48px;">Siga para receber conteúdo técnico toda semana.</p>
  <div style="padding: 16px 48px; background-color: #FAFAFA; border-radius: 6px;">
    <p style="font-size: 18px; font-weight: 500; color: #09090B; margin: 0;">Seguir @suamarca</p>
  </div>
</div>
```

### Post Quadrado (1080 x 1080px)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css">

<div style="width: 1080px; height: 1080px; background-color: #09090B; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; box-sizing: border-box; position: relative;">
  <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background-color: #FAFAFA;"></div>
  <div style="background-color: #18181B; border: 1px solid #27272A; border-radius: 12px; padding: 32px; width: 100%; margin-bottom: 40px;">
    <p style="font-size: 16px; font-weight: 400; color: #A1A1AA; margin: 0 0 8px; font-family: 'Geist Mono', monospace;">// terminal</p>
    <p style="font-size: 24px; font-weight: 500; color: #FAFAFA; margin: 0; font-family: 'Geist Mono', monospace;">npx deploy --prod</p>
  </div>
  <h2 style="font-size: 44px; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; color: #FAFAFA; text-align: center; margin: 0 0 16px;">Um comando. Produção.</h2>
  <p style="font-size: 20px; color: #A1A1AA; text-align: center; line-height: 1.5; margin: 0;">Sem configuração. Sem drama. Sem downtime.</p>
  <div style="position: absolute; bottom: 48px;">
    <p style="font-size: 14px; font-weight: 500; color: #71717A; margin: 0;">@suamarca</p>
  </div>
</div>
```

### Stories (1080 x 1920px)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css">

<div style="width: 1080px; height: 1920px; background-color: #09090B; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; box-sizing: border-box; position: relative;">
  <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background-color: #FAFAFA;"></div>
  <!-- Badge -->
  <span style="display: inline-block; font-size: 13px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: #09090B; background-color: #FAFAFA; padding: 6px 20px; border-radius: 9999px; margin-bottom: 48px;">Novidade</span>
  <!-- Main content -->
  <h1 style="font-size: 64px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; color: #FAFAFA; text-align: center; margin: 0 0 24px;">Performance no limite</h1>
  <p style="font-size: 24px; color: #A1A1AA; text-align: center; line-height: 1.5; margin: 0 0 64px; max-width: 800px;">Edge computing em 100+ regiões. Seu usuário nunca mais espera.</p>
  <!-- Stats row -->
  <div style="display: flex; gap: 48px; margin-bottom: 64px;">
    <div style="text-align: center;">
      <p style="font-size: 48px; font-weight: 700; color: #FAFAFA; margin: 0; letter-spacing: -0.02em;">50ms</p>
      <p style="font-size: 14px; color: #71717A; margin: 4px 0 0;">latência</p>
    </div>
    <div style="text-align: center;">
      <p style="font-size: 48px; font-weight: 700; color: #FAFAFA; margin: 0; letter-spacing: -0.02em;">100+</p>
      <p style="font-size: 14px; color: #71717A; margin: 4px 0 0;">regiões</p>
    </div>
  </div>
  <!-- CTA -->
  <div style="padding: 16px 48px; background-color: #FAFAFA; border-radius: 6px;">
    <p style="font-size: 18px; font-weight: 500; color: #09090B; margin: 0;">Arraste para cima</p>
  </div>
  <!-- Handle -->
  <p style="position: absolute; bottom: 80px; font-size: 14px; font-weight: 500; color: #71717A; margin: 0;">@suamarca</p>
</div>
```

---

## YouTube

### Thumbnail (1280 x 720px)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css">

<div style="width: 1280px; height: 720px; background-color: #09090B; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; padding: 64px; box-sizing: border-box; position: relative; overflow: hidden;">
  <!-- Subtle grid background -->
  <div style="position: absolute; inset: 0; background-image: linear-gradient(rgba(250,250,250,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(250,250,250,0.04) 1px, transparent 1px); background-size: 40px 40px;"></div>
  <!-- Content -->
  <div style="position: relative; z-index: 1; flex: 1;">
    <span style="display: inline-block; font-size: 14px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: #09090B; background-color: #FAFAFA; padding: 6px 16px; border-radius: 9999px; margin-bottom: 20px;">Tutorial</span>
    <h1 style="font-size: 56px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; color: #FAFAFA; margin: 0; max-width: 700px;">Deploy em<br>Segundos</h1>
    <p style="font-size: 22px; color: #A1A1AA; margin: 16px 0 0; max-width: 500px; line-height: 1.4;">Do git push ao ar em menos de 10 segundos. Sem config.</p>
  </div>
  <!-- Terminal mockup right side -->
  <div style="position: relative; z-index: 1; background-color: #18181B; border: 1px solid #27272A; border-radius: 12px; padding: 24px; width: 400px;">
    <div style="display: flex; gap: 8px; margin-bottom: 16px;">
      <div style="width: 12px; height: 12px; border-radius: 9999px; background-color: #3F3F46;"></div>
      <div style="width: 12px; height: 12px; border-radius: 9999px; background-color: #3F3F46;"></div>
      <div style="width: 12px; height: 12px; border-radius: 9999px; background-color: #3F3F46;"></div>
    </div>
    <p style="font-size: 16px; color: #71717A; margin: 0 0 8px; font-family: 'Geist Mono', monospace;">$ git push origin main</p>
    <p style="font-size: 16px; color: #A1A1AA; margin: 0 0 8px; font-family: 'Geist Mono', monospace;">Building...</p>
    <p style="font-size: 16px; color: #FAFAFA; margin: 0; font-family: 'Geist Mono', monospace;">Ready <span style="color: #22C55E;">https://app.vercel.app</span></p>
  </div>
</div>
```

### Banner (2560 x 1440px)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.css">

<div style="width: 2560px; height: 1440px; background-color: #09090B; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 120px; box-sizing: border-box; position: relative; overflow: hidden;">
  <!-- Background grid -->
  <div style="position: absolute; inset: 0; background-image: linear-gradient(rgba(250,250,250,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(250,250,250,0.03) 1px, transparent 1px); background-size: 60px 60px;"></div>
  <!-- Safe zone indicator (invisible, for reference: central 1546x423) -->
  <!-- Content centered in safe zone -->
  <div style="position: relative; z-index: 1; text-align: center;">
    <h1 style="font-size: 80px; font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; color: #FAFAFA; margin: 0 0 24px;">Código. Deploy. Escala.</h1>
    <p style="font-size: 28px; color: #A1A1AA; line-height: 1.5; margin: 0;">Tutoriais, ferramentas e arquitetura para desenvolvedores que levam performance a sério.</p>
  </div>
  <!-- Decorative lines -->
  <div style="position: absolute; top: 50%; left: 120px; width: 200px; height: 1px; background-color: #27272A;"></div>
  <div style="position: absolute; top: 50%; right: 120px; width: 200px; height: 1px; background-color: #27272A;"></div>
</div>
```

---

## Fotografia

### Diretrizes Visuais

| Regra | Diretriz |
|-------|----------|
| Tratamento | Preto e branco OU dessaturação pesada (< 10% saturação) |
| Contraste | Alto. Pretos profundos, highlights preservados |
| Iluminação | Lateral ou rim light. Evite flat lighting |
| Objetos | Hardware, teclados, monitores, ambientes de trabalho minimalistas |
| Pessoas | Close-up focado nas mãos digitando, ou silhuetas contra monitores |
| Proibido | Fotos coloridas, stock genérico, fundos com cor saturada |
| Overlays | Se usar texto sobre foto, adicione overlay `rgba(9,9,11,0.7)` mínimo |

### Overlay para Texto sobre Imagem

```html
<div style="position: relative; width: 1080px; height: 1080px; overflow: hidden;">
  <!-- Imagem de fundo (placeholder) -->
  <div style="position: absolute; inset: 0; background-color: #27272A;"></div>
  <!-- Overlay escuro -->
  <div style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(9,9,11,0.3), rgba(9,9,11,0.85));"></div>
  <!-- Texto -->
  <div style="position: absolute; bottom: 80px; left: 80px; right: 80px; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <h2 style="font-size: 44px; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; color: #FAFAFA; margin: 0 0 12px;">Infraestrutura invisível</h2>
    <p style="font-size: 18px; color: #A1A1AA; margin: 0;">Resultados visíveis.</p>
  </div>
</div>
```

---

## Componentes

### Botão Primário

```html
<a href="#" style="display: inline-flex; align-items: center; justify-content: center; padding: 12px 24px; background-color: #FAFAFA; color: #09090B; font-size: 14px; font-weight: 500; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; border-radius: 6px; text-decoration: none; border: none; cursor: pointer; transition: background-color 200ms cubic-bezier(0.4, 0, 0.2, 1);">Começar Agora</a>
```

### Botão Secundário

```html
<a href="#" style="display: inline-flex; align-items: center; justify-content: center; padding: 12px 24px; background-color: transparent; color: #FAFAFA; font-size: 14px; font-weight: 500; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; border-radius: 6px; text-decoration: none; border: 1px solid #27272A; cursor: pointer; transition: border-color 200ms cubic-bezier(0.4, 0, 0.2, 1);">Ver Documentação</a>
```

### Card

```html
<div style="background-color: #18181B; border: 1px solid #27272A; border-radius: 12px; padding: 24px; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 380px;">
  <div style="width: 40px; height: 40px; background-color: #27272A; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FAFAFA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  </div>
  <h3 style="font-size: 18px; font-weight: 600; color: #FAFAFA; margin: 0 0 8px;">Título do Card</h3>
  <p style="font-size: 14px; color: #A1A1AA; line-height: 1.5; margin: 0;">Descrição breve do recurso com linguagem técnica e direta.</p>
</div>
```

### Input Field

```html
<div style="font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <label style="display: block; font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: #A1A1AA; margin-bottom: 8px;">Email</label>
  <input type="email" placeholder="voce@empresa.com" style="width: 320px; padding: 10px 14px; background-color: #18181B; border: 1px solid #27272A; border-radius: 6px; color: #FAFAFA; font-size: 14px; font-family: 'Geist', sans-serif; outline: none; box-sizing: border-box;">
</div>
```

### Badge / Pill

```html
<span style="display: inline-flex; align-items: center; padding: 4px 12px; font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: #A1A1AA; border: 1px solid #27272A; border-radius: 9999px; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">Beta</span>
```

### Badge Branca (destaque)

```html
<span style="display: inline-flex; align-items: center; padding: 4px 12px; font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; color: #09090B; background-color: #FAFAFA; border-radius: 9999px; font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">Novo</span>
```

---

## Tom de Voz

### Princípios

| Princípio | Descrição |
|-----------|-----------|
| Técnico, não pedante | Use termos que devs conhecem, mas sem ser condescendente |
| Direto, sem floreio | Frases curtas. Parágrafos de 2-3 linhas. Sem "lorem ipsum" disfarçado |
| Confiante, não arrogante | "Funciona" em vez de "Acreditamos que funciona" |
| Verbos de ação | "Deploy", "Escale", "Configure", "Monitore" |

### Exemplos de Copy Aprovada

| Uso | Copy |
|-----|------|
| Headline hero | "Deploy em segundos. Performance no limite." |
| Subtítulo | "A plataforma que transforma código em produto." |
| Feature title | "Edge Functions" / "Preview Deploys" / "Analytics em Tempo Real" |
| Feature desc | "Execute código na edge mais próxima do usuário." |
| CTA primário | "Começar Agora" / "Criar Conta Grátis" |
| CTA secundário | "Ver Documentação" / "Falar com Vendas" |
| Stats | "99.99% uptime" / "50ms latência média" |
| Badge | "Novo" / "Beta" / "Popular" |
| Social | "Salve para consultar depois" / "Siga para conteúdo técnico" |

### Vocabulário Dev Tools

Prefira estes termos na copy:

- Deploy (nunca "publicar" ou "hospedar")
- Build (nunca "compilar" em contexto web)
- Edge (nunca "servidor mais próximo")
- Pipeline (nunca "fluxo de trabalho" em contexto CI)
- Runtime (nunca "tempo de execução")
- Produção (nunca "ambiente real")
- Staging (nunca "ambiente de teste")
- Rollback (nunca "reverter deploy")

---

## Anti-Slop

Regras invioláveis para manter a integridade visual Vercel Noir:

| Proibido | Por quê |
|----------|---------|
| Gradientes decorativos coloridos | Vercel Noir é monocromático puro. Gradientes permitidos: apenas `rgba(250,250,250,0.04)` para texturas sutis |
| Cores saturadas como decoração | ZERO saturação. Cinza apenas. Cores semânticas (verde/vermelho/amarelo/azul) SOMENTE para feedback de sistema |
| Hover scale acima de 1.02 | Sutileza cirúrgica. Scale 1.02 máximo |
| Sombras coloridas | Sombras SEMPRE com `rgba(0,0,0,x)`. Nunca colored shadows |
| Espaçamento apertado entre seções | Mínimo 80px entre seções. Respiro é parte da identidade |
| Substituir Geist por Inter/Roboto | Geist é obrigatória. NUNCA trocar, mesmo que "pareça igual" |
| Botão primário colorido | Primário SEMPRE branco (`#FAFAFA`) sobre fundo escuro. Texto preto (`#09090B`) |
| Border-radius grande (>16px) | Máximo 16px para containers. 9999px apenas para pills e avatares |
| Fontes abaixo de 12px | Mínimo 12px (label). Body mínimo 16px |
| Emojis em copy técnica | Zero emojis em headlines, features ou CTAs. Profissionalismo cirúrgico |
| Fundos brancos | Background SEMPRE `#09090B`. Superfícies `#18181B`. Nunca `#FFFFFF` |
| Imagens sem tratamento | Toda imagem precisa de dessaturação ou overlay escuro para manter coerência |
