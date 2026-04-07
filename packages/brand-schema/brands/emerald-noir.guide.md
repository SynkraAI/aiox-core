# Emerald Noir — Guia Prático

> Dark luxury com verde esmeralda + ouro. Para consultoria, finanças, serviços premium e high-ticket.
> Fonte: `emerald-noir.yaml` v2 | Theme: dark | Font: Plus Jakarta Sans

---

## Visão Geral

Emerald Noir é uma identidade visual de luxo dark, inspirada nos princípios do Stripe com estética premium de finanças. A base navy-dark (#0C1117) transmite profundidade e sofisticação — não é preto puro, é navy com calor. O verde esmeralda (#059669) é a cor primária que guia ações, enquanto o ouro (#F59E0B) serve como acento cirúrgico (máximo 3% da UI).

**Ideal para:** consultoria empresarial, gestão financeira, wealth management, serviços high-ticket, SaaS premium, educação executiva.

**Princípios visuais:**
- Espaçamento generoso (96px entre seções — padrão Stripe)
- Tipografia arejada (weight 400 no body)
- Sombras com tint esmeralda nos níveis médio+
- Hover quase imperceptível (scale 1.015)
- Navy-dark, nunca preto puro

---

## Tipografia — Regras de Uso

**Família:** Plus Jakarta Sans (geométrica, premium, moderna)
**CDN:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap`
**Fallback:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
**Mono (código):** JetBrains Mono

### Escala Tipográfica

| Nível | Tamanho | Peso | Line Height | Letter Spacing | Uso |
|-------|---------|------|-------------|----------------|-----|
| H1 | 52px | 700 (Bold) | 1.1 | -0.02em | Título principal, hero |
| H2 | 36px | 600 (SemiBold) | 1.2 | -0.01em | Títulos de seção |
| H3 | 28px | 600 (SemiBold) | 1.3 | — | Subtítulos, cards |
| H4 | 22px | 500 (Medium) | 1.35 | — | Destaques internos |
| Body | 16px | 400 (Regular) | 1.7 | — | Texto corrido |
| Body SM | 14px | 400 (Regular) | 1.6 | — | Texto secundário |
| Caption | 13px | 400 (Regular) | 1.5 | — | Legendas, notas |
| Label | 11px | 600 (SemiBold) | 1.4 | 0.06em | Labels, badges (UPPERCASE) |

### Restrições

- **NUNCA** usar Inter, Roboto ou qualquer outra fonte — Plus Jakarta Sans é obrigatória
- **NUNCA** usar peso 300 (light) em títulos — mínimo 500
- **NUNCA** usar peso 700 em body text — máximo 400
- Labels SEMPRE em uppercase com letter-spacing 0.06em
- Line-height generoso no body (1.7) para respiração visual

---

## Cores — Regras de Uso

### Paleta Semântica (uso direto)

| Token | Hex | Uso |
|-------|-----|-----|
| Background | `#0C1117` | Fundo principal da página |
| Surface | `#151D28` | Cards, containers, modais |
| Surface Elevated | `#1E2A38` | Cards hover, dropdowns, popovers |
| Border | `#1E2A38` | Bordas de cards e inputs |
| Border Hover | `#374151` | Bordas em estado hover |
| Text | `#F3F4F6` | Texto principal |
| Text Secondary | `#D1D5DB` | Texto de apoio, descrições |
| Text Muted | `#6B7280` | Placeholders, labels inativos |
| Primary | `#059669` | CTAs, links, ícones ativos |
| Primary Hover | `#34D399` | Hover de elementos primários |
| Accent (Ouro) | `#F59E0B` | Destaques especiais, badges premium |
| Accent Hover | `#FBBF24` | Hover de elementos accent |
| Success | `#10B981` | Confirmações, checks |
| Warning | `#F59E0B` | Alertas (mesmo que accent) |
| Error | `#EF4444` | Erros, validações negativas |
| Info | `#3B82F6` | Informações neutras |

### Escala Emerald (primitivas)

| Nível | Hex | Uso típico |
|-------|-----|------------|
| 50 | `#ECFDF5` | Texto sobre bg escuro (raro) |
| 100 | `#D1FAE5` | Highlights sutis |
| 200 | `#A7F3D0` | Tags leves |
| 300 | `#6EE7B7` | Ícones hover |
| 400 | `#34D399` | Primary hover |
| 500 | `#10B981` | Success / alternativa primária |
| 600 | `#059669` | **Primary — cor principal** |
| 700 | `#047857` | Primary pressed |
| 800 | `#065F46` | Badges escuros |
| 900 | `#064E3B` | Backgrounds com tint |
| 950 | `#022C22` | Overlay escuro |

### Regras do Ouro (Accent)

- **Máximo 3% da UI** — ouro é cirúrgico, não decorativo
- Usar em: badges "Premium", preços destacados, ícones especiais, separadores de seção
- **NUNCA** usar como cor de fundo de cards ou seções inteiras
- **NUNCA** usar em texto corrido — apenas em labels, valores e destaques pontuais
- Combinar com transparência: `rgba(245, 158, 11, 0.05)` para gradientes sutis

### Hierarquia de Opacidade

| Camada | Cor | Opacidade | Uso |
|--------|-----|-----------|-----|
| Fundo | `#0C1117` | 100% | Base da página |
| Card | `#151D28` | 100% | Container principal |
| Card elevado | `#1E2A38` | 100% | Hover, selecionado |
| Overlay emerald | `#059669` | 5-12% | Gradientes decorativos |
| Overlay gold | `#F59E0B` | 3-5% | Tint premium sutil |
| Sombra emerald | `#059669` | 5-10% | Shadow md+ |

---

## Landing Pages

### Hero Section

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#0C1117; font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <section style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding:96px 24px; position:relative; overflow:hidden;">
    <!-- Gradiente decorativo -->
    <div style="position:absolute; top:-200px; right:-200px; width:600px; height:600px; background:radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 70%); pointer-events:none;"></div>
    <div style="position:absolute; bottom:-100px; left:-100px; width:400px; height:400px; background:radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%); pointer-events:none;"></div>

    <div style="max-width:720px; text-align:center; position:relative; z-index:1;">
      <!-- Label -->
      <div style="display:inline-block; padding:6px 16px; border:1px solid #1E2A38; border-radius:9999px; margin-bottom:24px;">
        <span style="font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#F59E0B;">Consultoria Estratégica</span>
      </div>

      <!-- Título -->
      <h1 style="font-size:52px; font-weight:700; line-height:1.1; letter-spacing:-0.02em; color:#F3F4F6; margin:0 0 24px 0;">
        Eleve seus resultados com <span style="color:#059669;">estratégia que gera lucro</span>
      </h1>

      <!-- Subtítulo -->
      <p style="font-size:18px; font-weight:400; line-height:1.7; color:#D1D5DB; margin:0 0 40px 0;">
        Transformamos dados em decisões e decisões em crescimento real. Mais de R$ 500M gerenciados para empresas que exigem excelência.
      </p>

      <!-- CTAs -->
      <div style="display:flex; gap:16px; justify-content:center; flex-wrap:wrap;">
        <a href="#" style="display:inline-block; padding:14px 28px; background:#059669; color:#FFFFFF; font-size:15px; font-weight:600; border-radius:8px; text-decoration:none; transition:all 240ms cubic-bezier(0.25,0.1,0.25,1);">
          Agendar Diagnóstico Gratuito
        </a>
        <a href="#" style="display:inline-block; padding:14px 28px; background:transparent; color:#F3F4F6; font-size:15px; font-weight:500; border-radius:8px; text-decoration:none; border:1px solid #1E2A38;">
          Ver Casos de Sucesso →
        </a>
      </div>

      <!-- Social proof micro -->
      <div style="margin-top:48px; display:flex; align-items:center; justify-content:center; gap:8px;">
        <div style="display:flex;">
          <div style="width:32px; height:32px; border-radius:9999px; background:#1E2A38; border:2px solid #0C1117;"></div>
          <div style="width:32px; height:32px; border-radius:9999px; background:#1E2A38; border:2px solid #0C1117; margin-left:-8px;"></div>
          <div style="width:32px; height:32px; border-radius:9999px; background:#1E2A38; border:2px solid #0C1117; margin-left:-8px;"></div>
        </div>
        <span style="font-size:13px; color:#6B7280;">+200 empresas confiam em nós</span>
      </div>
    </div>
  </section>

</body>
</html>
```

### Features Grid

```html
<section style="padding:96px 24px; background:#0C1117; font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:1120px; margin:0 auto;">

    <!-- Header da seção -->
    <div style="text-align:center; margin-bottom:64px;">
      <span style="font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#059669;">Nossos Diferenciais</span>
      <h2 style="font-size:36px; font-weight:600; line-height:1.2; letter-spacing:-0.01em; color:#F3F4F6; margin:16px 0 0 0;">
        Por que os melhores escolhem a gente
      </h2>
    </div>

    <!-- Grid 3 colunas -->
    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:24px;">

      <!-- Card 1 -->
      <div style="background:#151D28; border:1px solid #1E2A38; border-radius:12px; padding:32px;">
        <div style="width:48px; height:48px; border-radius:12px; background:rgba(5,150,105,0.1); display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
          <span style="font-size:24px; color:#059669;">📊</span>
        </div>
        <h3 style="font-size:22px; font-weight:500; line-height:1.35; color:#F3F4F6; margin:0 0 12px 0;">Diagnóstico Financeiro</h3>
        <p style="font-size:14px; font-weight:400; line-height:1.6; color:#D1D5DB; margin:0;">
          Análise completa da sua operação com indicadores reais. Sem achismo, só dados que direcionam ação.
        </p>
      </div>

      <!-- Card 2 -->
      <div style="background:#151D28; border:1px solid #1E2A38; border-radius:12px; padding:32px;">
        <div style="width:48px; height:48px; border-radius:12px; background:rgba(5,150,105,0.1); display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
          <span style="font-size:24px; color:#059669;">🎯</span>
        </div>
        <h3 style="font-size:22px; font-weight:500; line-height:1.35; color:#F3F4F6; margin:0 0 12px 0;">Estratégia Personalizada</h3>
        <p style="font-size:14px; font-weight:400; line-height:1.6; color:#D1D5DB; margin:0;">
          Plano sob medida para o seu negócio. Cada decisão baseada no seu mercado, seus números, seu momento.
        </p>
      </div>

      <!-- Card 3 -->
      <div style="background:#151D28; border:1px solid #1E2A38; border-radius:12px; padding:32px;">
        <div style="width:48px; height:48px; border-radius:12px; background:rgba(5,150,105,0.1); display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
          <span style="font-size:24px; color:#059669;">💰</span>
        </div>
        <h3 style="font-size:22px; font-weight:500; line-height:1.35; color:#F3F4F6; margin:0 0 12px 0;">Retorno Comprovado</h3>
        <p style="font-size:14px; font-weight:400; line-height:1.6; color:#D1D5DB; margin:0;">
          Média de 3.2x de ROI no primeiro ano. Nossos clientes não crescem por sorte — crescem por método.
        </p>
      </div>

      <!-- Card 4 -->
      <div style="background:#151D28; border:1px solid #1E2A38; border-radius:12px; padding:32px;">
        <div style="width:48px; height:48px; border-radius:12px; background:rgba(5,150,105,0.1); display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
          <span style="font-size:24px; color:#059669;">🔒</span>
        </div>
        <h3 style="font-size:22px; font-weight:500; line-height:1.35; color:#F3F4F6; margin:0 0 12px 0;">Sigilo Total</h3>
        <p style="font-size:14px; font-weight:400; line-height:1.6; color:#D1D5DB; margin:0;">
          NDA assinado antes da primeira reunião. Seus dados financeiros são tratados com a mesma segurança de um cofre.
        </p>
      </div>

      <!-- Card 5 -->
      <div style="background:#151D28; border:1px solid #1E2A38; border-radius:12px; padding:32px;">
        <div style="width:48px; height:48px; border-radius:12px; background:rgba(5,150,105,0.1); display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
          <span style="font-size:24px; color:#059669;">⚡</span>
        </div>
        <h3 style="font-size:22px; font-weight:500; line-height:1.35; color:#F3F4F6; margin:0 0 12px 0;">Execução Ágil</h3>
        <p style="font-size:14px; font-weight:400; line-height:1.6; color:#D1D5DB; margin:0;">
          Primeiros resultados em 30 dias. Sem relatórios infinitos que ninguém lê — ação desde a semana um.
        </p>
      </div>

      <!-- Card 6 -->
      <div style="background:#151D28; border:1px solid #1E2A38; border-radius:12px; padding:32px;">
        <div style="width:48px; height:48px; border-radius:12px; background:rgba(5,150,105,0.1); display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
          <span style="font-size:24px; color:#059669;">🏆</span>
        </div>
        <h3 style="font-size:22px; font-weight:500; line-height:1.35; color:#F3F4F6; margin:0 0 12px 0;">Time Sênior</h3>
        <p style="font-size:14px; font-weight:400; line-height:1.6; color:#D1D5DB; margin:0;">
          Consultores com mínimo 10 anos de mercado. Quem te atende é quem resolve — sem estagiário no meio.
        </p>
      </div>

    </div>
  </div>
</section>
```

### Social Proof / Stats

```html
<section style="padding:96px 24px; background:#0C1117; font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; border-top:1px solid #1E2A38; border-bottom:1px solid #1E2A38;">
  <div style="max-width:1120px; margin:0 auto;">

    <!-- Stats Grid -->
    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:32px; margin-bottom:80px;">

      <div style="text-align:center;">
        <div style="font-size:52px; font-weight:700; line-height:1.1; color:#059669; margin-bottom:8px;">R$ 500M+</div>
        <div style="font-size:14px; font-weight:400; color:#6B7280;">Sob gestão estratégica</div>
      </div>

      <div style="text-align:center;">
        <div style="font-size:52px; font-weight:700; line-height:1.1; color:#059669; margin-bottom:8px;">200+</div>
        <div style="font-size:14px; font-weight:400; color:#6B7280;">Empresas atendidas</div>
      </div>

      <div style="text-align:center;">
        <div style="font-size:52px; font-weight:700; line-height:1.1; color:#059669; margin-bottom:8px;">3.2x</div>
        <div style="font-size:14px; font-weight:400; color:#6B7280;">ROI médio no 1° ano</div>
      </div>

      <div style="text-align:center;">
        <div style="font-size:52px; font-weight:700; line-height:1.1; color:#059669; margin-bottom:8px;">97%</div>
        <div style="font-size:14px; font-weight:400; color:#6B7280;">Taxa de renovação</div>
      </div>

    </div>

    <!-- Testimonial -->
    <div style="max-width:720px; margin:0 auto; text-align:center;">
      <div style="font-size:48px; color:#1E2A38; margin-bottom:16px;">"</div>
      <p style="font-size:18px; font-weight:400; line-height:1.7; color:#D1D5DB; margin:0 0 24px 0; font-style:italic;">
        Em 6 meses, triplicamos o faturamento e reduzimos custos operacionais em 28%. O diagnóstico inicial sozinho já pagou o investimento inteiro.
      </p>
      <div>
        <div style="font-size:16px; font-weight:600; color:#F3F4F6;">Ricardo Mendes</div>
        <div style="font-size:13px; font-weight:400; color:#6B7280;">CEO, Mendes Capital — Gestão de R$ 120M</div>
      </div>
    </div>

  </div>
</section>
```

### CTA Section

```html
<section style="padding:96px 24px; background:#0C1117; font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; position:relative; overflow:hidden;">
  <!-- Gradiente decorativo -->
  <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:800px; height:400px; background:radial-gradient(ellipse, rgba(5,150,105,0.08) 0%, transparent 70%); pointer-events:none;"></div>

  <div style="max-width:720px; margin:0 auto; text-align:center; position:relative; z-index:1;">

    <!-- Badge -->
    <div style="display:inline-block; padding:6px 16px; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.2); border-radius:9999px; margin-bottom:24px;">
      <span style="font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#F59E0B;">Vagas Limitadas</span>
    </div>

    <h2 style="font-size:36px; font-weight:600; line-height:1.2; letter-spacing:-0.01em; color:#F3F4F6; margin:0 0 16px 0;">
      Pronto para escalar com método?
    </h2>

    <p style="font-size:16px; font-weight:400; line-height:1.7; color:#D1D5DB; margin:0 0 40px 0;">
      Agende um diagnóstico gratuito de 30 minutos. Sem compromisso, sem enrolação — só clareza sobre o próximo passo do seu negócio.
    </p>

    <a href="#" style="display:inline-block; padding:16px 40px; background:#059669; color:#FFFFFF; font-size:16px; font-weight:600; border-radius:8px; text-decoration:none;">
      Quero Meu Diagnóstico Gratuito
    </a>

    <p style="font-size:13px; color:#6B7280; margin-top:16px;">
      Apenas 5 vagas por mês · Resposta em até 24h
    </p>

  </div>
</section>
```

### Pricing Card

```html
<section style="padding:96px 24px; background:#0C1117; font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:1120px; margin:0 auto;">

    <div style="text-align:center; margin-bottom:64px;">
      <span style="font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#059669;">Investimento</span>
      <h2 style="font-size:36px; font-weight:600; line-height:1.2; letter-spacing:-0.01em; color:#F3F4F6; margin:16px 0 0 0;">
        Escolha o plano ideal para o seu momento
      </h2>
    </div>

    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:24px; align-items:start;">

      <!-- Plano 1 -->
      <div style="background:#151D28; border:1px solid #1E2A38; border-radius:12px; padding:32px;">
        <span style="font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#6B7280;">Diagnóstico</span>
        <div style="margin:16px 0 8px 0;">
          <span style="font-size:36px; font-weight:700; color:#F3F4F6;">R$ 2.500</span>
          <span style="font-size:14px; color:#6B7280;"> / único</span>
        </div>
        <p style="font-size:14px; color:#D1D5DB; line-height:1.6; margin:0 0 32px 0;">
          Raio-X completo da sua operação com plano de ação priorizado.
        </p>
        <ul style="list-style:none; padding:0; margin:0 0 32px 0;">
          <li style="font-size:14px; color:#D1D5DB; padding:8px 0; border-bottom:1px solid #1E2A38; display:flex; align-items:center; gap:8px;">
            <span style="color:#059669;">✓</span> Análise financeira completa
          </li>
          <li style="font-size:14px; color:#D1D5DB; padding:8px 0; border-bottom:1px solid #1E2A38; display:flex; align-items:center; gap:8px;">
            <span style="color:#059669;">✓</span> Relatório de oportunidades
          </li>
          <li style="font-size:14px; color:#D1D5DB; padding:8px 0; border-bottom:1px solid #1E2A38; display:flex; align-items:center; gap:8px;">
            <span style="color:#059669;">✓</span> Plano de ação 90 dias
          </li>
          <li style="font-size:14px; color:#D1D5DB; padding:8px 0; display:flex; align-items:center; gap:8px;">
            <span style="color:#059669;">✓</span> 1 reunião de apresentação
          </li>
        </ul>
        <a href="#" style="display:block; text-align:center; padding:14px 28px; background:transparent; color:#F3F4F6; font-size:15px; font-weight:500; border-radius:8px; text-decoration:none; border:1px solid #1E2A38;">
          Começar Agora
        </a>
      </div>

      <!-- Plano 2 (destaque) -->
      <div style="background:#151D28; border:2px solid #059669; border-radius:12px; padding:32px; position:relative;">
        <div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); padding:4px 16px; background:#059669; border-radius:9999px;">
          <span style="font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#FFFFFF;">Mais Popular</span>
        </div>
        <span style="font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#6B7280;">Consultoria</span>
        <div style="margin:16px 0 8px 0;">
          <span style="font-size:36px; font-weight:700; color:#F3F4F6;">R$ 8.900</span>
          <span style="font-size:14px; color:#6B7280;"> / mês</span>
        </div>
        <p style="font-size:14px; color:#D1D5DB; line-height:1.6; margin:0 0 32px 0;">
          Acompanhamento mensal com execução e ajustes contínuos.
        </p>
        <ul style="list-style:none; padding:0; margin:0 0 32px 0;">
          <li style="font-size:14px; color:#D1D5DB; padding:8px 0; border-bottom:1px solid #1E2A38; display:flex; align-items:center; gap:8px;">
            <span style="color:#059669;">✓</span> Tudo do Diagnóstico
          </li>
          <li style="font-size:14px; color:#D1D5DB; padding:8px 0; border-bottom:1px solid #1E2A38; display:flex; align-items:center; gap:8px;">
            <span style="color:#059669;">✓</span> 4 reuniões mensais
          </li>
          <li style="font-size:14px; color:#D1D5DB; padding:8px 0; border-bottom:1px solid #1E2A38; display:flex; align-items:center; gap:8px;">
            <span style="color:#059669;">✓</span> Dashboard em tempo real
          </li>
          <li style="font-size:14px; color:#D1D5DB; padding:8px 0; border-bottom:1px solid #1E2A38; display:flex; align-items:center; gap:8px;">
            <span style="color:#059669;">✓</span> Canal direto com consultor
          </li>
          <li style="font-size:14px; color:#D1D5DB; padding:8px 0; display:flex; align-items:center; gap:8px;">
            <span style="color:#059669;">✓</span> Relatório mensal executivo
          </li>
        </ul>
        <a href="#" style="display:block; text-align:center; padding:14px 28px; background:#059669; color:#FFFFFF; font-size:15px; font-weight:600; border-radius:8px; text-decoration:none;">
          Começar Agora
        </a>
      </div>

      <!-- Plano 3 -->
      <div style="background:#151D28; border:1px solid #1E2A38; border-radius:12px; padding:32px;">
        <span style="font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#F59E0B;">Premium</span>
        <div style="margin:16px 0 8px 0;">
          <span style="font-size:36px; font-weight:700; color:#F3F4F6;">R$ 25.000</span>
          <span style="font-size:14px; color:#6B7280;"> / mês</span>
        </div>
        <p style="font-size:14px; color:#D1D5DB; line-height:1.6; margin:0 0 32px 0;">
          Gestão completa com time dedicado e acesso ao board executivo.
        </p>
        <ul style="list-style:none; padding:0; margin:0 0 32px 0;">
          <li style="font-size:14px; color:#D1D5DB; padding:8px 0; border-bottom:1px solid #1E2A38; display:flex; align-items:center; gap:8px;">
            <span style="color:#059669;">✓</span> Tudo da Consultoria
          </li>
          <li style="font-size:14px; color:#D1D5DB; padding:8px 0; border-bottom:1px solid #1E2A38; display:flex; align-items:center; gap:8px;">
            <span style="color:#059669;">✓</span> Time sênior dedicado
          </li>
          <li style="font-size:14px; color:#D1D5DB; padding:8px 0; border-bottom:1px solid #1E2A38; display:flex; align-items:center; gap:8px;">
            <span style="color:#059669;">✓</span> Acesso ao advisory board
          </li>
          <li style="font-size:14px; color:#D1D5DB; padding:8px 0; border-bottom:1px solid #1E2A38; display:flex; align-items:center; gap:8px;">
            <span style="color:#059669;">✓</span> Reuniões semanais
          </li>
          <li style="font-size:14px; color:#D1D5DB; padding:8px 0; display:flex; align-items:center; gap:8px;">
            <span style="color:#059669;">✓</span> SLA de resposta 4h
          </li>
        </ul>
        <a href="#" style="display:block; text-align:center; padding:14px 28px; background:transparent; color:#F3F4F6; font-size:15px; font-weight:500; border-radius:8px; text-decoration:none; border:1px solid #1E2A38;">
          Falar com Especialista
        </a>
      </div>

    </div>
  </div>
</section>
```

### Footer

```html
<footer style="padding:64px 24px 32px; background:#0C1117; border-top:1px solid #1E2A38; font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:1120px; margin:0 auto;">

    <div style="display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:48px; margin-bottom:48px;">

      <!-- Coluna principal -->
      <div>
        <div style="font-size:22px; font-weight:700; color:#F3F4F6; margin-bottom:16px;">
          <span style="color:#059669;">Emerald</span> Capital
        </div>
        <p style="font-size:14px; color:#6B7280; line-height:1.6; margin:0; max-width:280px;">
          Consultoria estratégica para empresas que querem crescer com método, dados e excelência.
        </p>
      </div>

      <!-- Links -->
      <div>
        <div style="font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#6B7280; margin-bottom:16px;">Empresa</div>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <a href="#" style="font-size:14px; color:#D1D5DB; text-decoration:none;">Sobre nós</a>
          <a href="#" style="font-size:14px; color:#D1D5DB; text-decoration:none;">Casos de sucesso</a>
          <a href="#" style="font-size:14px; color:#D1D5DB; text-decoration:none;">Blog</a>
          <a href="#" style="font-size:14px; color:#D1D5DB; text-decoration:none;">Carreiras</a>
        </div>
      </div>

      <div>
        <div style="font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#6B7280; margin-bottom:16px;">Serviços</div>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <a href="#" style="font-size:14px; color:#D1D5DB; text-decoration:none;">Diagnóstico</a>
          <a href="#" style="font-size:14px; color:#D1D5DB; text-decoration:none;">Consultoria</a>
          <a href="#" style="font-size:14px; color:#D1D5DB; text-decoration:none;">Gestão Premium</a>
          <a href="#" style="font-size:14px; color:#D1D5DB; text-decoration:none;">Mentoria executiva</a>
        </div>
      </div>

      <div>
        <div style="font-size:11px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#6B7280; margin-bottom:16px;">Contato</div>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <a href="#" style="font-size:14px; color:#D1D5DB; text-decoration:none;">contato@emerald.com</a>
          <a href="#" style="font-size:14px; color:#D1D5DB; text-decoration:none;">LinkedIn</a>
          <a href="#" style="font-size:14px; color:#D1D5DB; text-decoration:none;">Instagram</a>
        </div>
      </div>

    </div>

    <!-- Copyright -->
    <div style="border-top:1px solid #1E2A38; padding-top:24px; display:flex; justify-content:space-between; align-items:center;">
      <span style="font-size:13px; color:#6B7280;">© 2026 Emerald Capital. Todos os direitos reservados.</span>
      <div style="display:flex; gap:24px;">
        <a href="#" style="font-size:13px; color:#6B7280; text-decoration:none;">Política de Privacidade</a>
        <a href="#" style="font-size:13px; color:#6B7280; text-decoration:none;">Termos de Uso</a>
      </div>
    </div>

  </div>
</footer>
```

### Layout Rules

| Regra | Valor | Nota |
|-------|-------|------|
| Max-width do conteúdo | 1120px | Centralizado com `margin: 0 auto` |
| Padding lateral | 24px | Mobile-safe mínimo |
| Padding entre seções | 96px top + 96px bottom | Padrão Stripe — generoso |
| Gap de grid (cards) | 24px | Consistente em todos os grids |
| Gap de grid (stats) | 32px | Mais espaço para respiração |
| Margin entre header de seção e conteúdo | 64px | Separação clara |
| Border entre seções | `1px solid #1E2A38` | Quando necessário, sutil |
| Gradientes decorativos | `radial-gradient` com emerald 12% e gold 5% | Sempre com `pointer-events: none` |

---

## Instagram

### Carrossel — 1080 x 1350px

#### Slide 1 (Capa)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0;">
  <div style="width:1080px; height:1350px; background:#0C1117; font-family:'Plus Jakarta Sans',-apple-system,sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:80px; box-sizing:border-box; position:relative; overflow:hidden;">

    <!-- Gradiente decorativo -->
    <div style="position:absolute; top:-100px; right:-100px; width:500px; height:500px; background:radial-gradient(circle, rgba(5,150,105,0.15) 0%, transparent 70%); pointer-events:none;"></div>

    <!-- Label -->
    <div style="padding:8px 20px; border:1px solid #1E2A38; border-radius:9999px; margin-bottom:40px;">
      <span style="font-size:22px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#F59E0B;">Finanças Estratégicas</span>
    </div>

    <!-- Título -->
    <h1 style="font-size:72px; font-weight:700; line-height:1.1; letter-spacing:-0.02em; color:#F3F4F6; text-align:center; margin:0 0 32px 0;">
      5 Métricas que todo CEO<br><span style="color:#059669;">deveria acompanhar</span>
    </h1>

    <!-- Subtítulo -->
    <p style="font-size:28px; font-weight:400; line-height:1.5; color:#D1D5DB; text-align:center; margin:0; max-width:800px;">
      A maioria ignora a #3. E é justamente ela que separa empresas que crescem das que estagnam.
    </p>

    <!-- Progress bar -->
    <div style="position:absolute; bottom:60px; left:80px; right:80px; display:flex; gap:8px;">
      <div style="flex:1; height:4px; background:#059669; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#1E2A38; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#1E2A38; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#1E2A38; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#1E2A38; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#1E2A38; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#1E2A38; border-radius:2px;"></div>
    </div>

    <!-- Swipe arrow -->
    <div style="position:absolute; bottom:100px; right:80px;">
      <span style="font-size:24px; color:#6B7280;">Deslize →</span>
    </div>

  </div>
</body>
</html>
```

#### Slides Internos (2-6)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0;">
  <div style="width:1080px; height:1350px; background:#0C1117; font-family:'Plus Jakarta Sans',-apple-system,sans-serif; display:flex; flex-direction:column; justify-content:center; padding:80px; box-sizing:border-box; position:relative;">

    <!-- Número da métrica -->
    <div style="font-size:120px; font-weight:700; color:rgba(5,150,105,0.1); position:absolute; top:60px; right:80px; line-height:1;">01</div>

    <!-- Título da métrica -->
    <span style="font-size:22px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#059669; margin-bottom:20px; display:block;">Métrica #1</span>

    <h2 style="font-size:56px; font-weight:700; line-height:1.15; color:#F3F4F6; margin:0 0 32px 0;">
      CAC — Custo de Aquisição de Cliente
    </h2>

    <!-- Explicação -->
    <p style="font-size:26px; font-weight:400; line-height:1.6; color:#D1D5DB; margin:0 0 40px 0;">
      Se você não sabe quanto custa trazer um cliente novo, está operando no escuro. CAC alto sem LTV proporcional é a receita para quebrar crescendo.
    </p>

    <!-- Highlight box -->
    <div style="background:#151D28; border-left:4px solid #F59E0B; border-radius:0 8px 8px 0; padding:24px 28px;">
      <p style="font-size:24px; font-weight:500; line-height:1.5; color:#F3F4F6; margin:0;">
        Regra de ouro: seu LTV precisa ser, no mínimo, <span style="color:#F59E0B; font-weight:700;">3x o CAC</span>. Abaixo disso, você está pagando para trabalhar.
      </p>
    </div>

    <!-- Progress bar -->
    <div style="position:absolute; bottom:60px; left:80px; right:80px; display:flex; gap:8px;">
      <div style="flex:1; height:4px; background:#059669; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#059669; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#1E2A38; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#1E2A38; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#1E2A38; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#1E2A38; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#1E2A38; border-radius:2px;"></div>
    </div>

  </div>
</body>
</html>
```

#### Slide CTA (último)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0;">
  <div style="width:1080px; height:1350px; background:#0C1117; font-family:'Plus Jakarta Sans',-apple-system,sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:80px; box-sizing:border-box; position:relative; overflow:hidden;">

    <!-- Gradiente -->
    <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:700px; height:700px; background:radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 70%); pointer-events:none;"></div>

    <!-- Conteúdo -->
    <div style="text-align:center; position:relative; z-index:1;">
      <h2 style="font-size:56px; font-weight:700; line-height:1.15; color:#F3F4F6; margin:0 0 24px 0;">
        Quer um diagnóstico<br><span style="color:#059669;">gratuito</span> da sua empresa?
      </h2>

      <p style="font-size:26px; font-weight:400; line-height:1.5; color:#D1D5DB; margin:0 0 48px 0; max-width:800px;">
        Link na bio ou mande "DIAGNÓSTICO" no DM.
      </p>

      <!-- CTA visual -->
      <div style="display:inline-block; padding:20px 48px; background:#059669; border-radius:12px;">
        <span style="font-size:28px; font-weight:600; color:#FFFFFF;">Salve este post 🔖</span>
      </div>

      <div style="margin-top:32px;">
        <span style="font-size:22px; color:#6B7280;">@emeraldcapital</span>
      </div>
    </div>

    <!-- Progress bar -->
    <div style="position:absolute; bottom:60px; left:80px; right:80px; display:flex; gap:8px;">
      <div style="flex:1; height:4px; background:#059669; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#059669; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#059669; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#059669; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#059669; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#059669; border-radius:2px;"></div>
      <div style="flex:1; height:4px; background:#059669; border-radius:2px;"></div>
    </div>

  </div>
</body>
</html>
```

### Post Único — 1080 x 1080px

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0;">
  <div style="width:1080px; height:1080px; background:#0C1117; font-family:'Plus Jakarta Sans',-apple-system,sans-serif; display:flex; flex-direction:column; justify-content:center; padding:80px; box-sizing:border-box; position:relative; overflow:hidden;">

    <!-- Gradiente -->
    <div style="position:absolute; bottom:-150px; right:-150px; width:500px; height:500px; background:radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 70%); pointer-events:none;"></div>

    <!-- Label -->
    <div style="display:inline-block; padding:8px 20px; border:1px solid #1E2A38; border-radius:9999px; margin-bottom:32px; align-self:flex-start;">
      <span style="font-size:20px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:#F59E0B;">Insight Financeiro</span>
    </div>

    <!-- Frase principal -->
    <h1 style="font-size:64px; font-weight:700; line-height:1.1; letter-spacing:-0.02em; color:#F3F4F6; margin:0 0 32px 0;">
      Faturamento não é lucro.<br><span style="color:#059669;">Lucro é o que sobra</span><br>depois que tudo fecha.
    </h1>

    <!-- Rodapé -->
    <div style="display:flex; align-items:center; gap:12px; margin-top:auto;">
      <div style="width:48px; height:48px; border-radius:9999px; background:#151D28; border:2px solid #059669;"></div>
      <div>
        <div style="font-size:18px; font-weight:600; color:#F3F4F6;">@emeraldcapital</div>
        <div style="font-size:14px; color:#6B7280;">Consultoria Estratégica</div>
      </div>
    </div>

  </div>
</body>
</html>
```

### Stories — 1080 x 1920px

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0;">
  <div style="width:1080px; height:1920px; background:#0C1117; font-family:'Plus Jakarta Sans',-apple-system,sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:80px; box-sizing:border-box; position:relative; overflow:hidden;">

    <!-- Gradiente top -->
    <div style="position:absolute; top:-200px; left:50%; transform:translateX(-50%); width:600px; height:600px; background:radial-gradient(circle, rgba(5,150,105,0.15) 0%, transparent 70%); pointer-events:none;"></div>

    <!-- Gradiente bottom -->
    <div style="position:absolute; bottom:-100px; right:-100px; width:400px; height:400px; background:radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%); pointer-events:none;"></div>

    <!-- Conteúdo central -->
    <div style="text-align:center; position:relative; z-index:1;">

      <!-- Stat destaque -->
      <div style="font-size:140px; font-weight:700; color:#059669; line-height:1; margin-bottom:24px;">78%</div>

      <h2 style="font-size:48px; font-weight:600; line-height:1.2; color:#F3F4F6; margin:0 0 24px 0;">
        das empresas que fecham<br>não acompanhavam o<br><span style="color:#F59E0B;">fluxo de caixa</span>
      </h2>

      <p style="font-size:26px; font-weight:400; line-height:1.5; color:#D1D5DB; margin:0 0 64px 0; max-width:800px;">
        Não seja estatística. Tenha controle.
      </p>

      <!-- CTA Story -->
      <div style="display:inline-block; padding:20px 48px; background:#059669; border-radius:12px;">
        <span style="font-size:26px; font-weight:600; color:#FFFFFF;">Toque para saber mais ↑</span>
      </div>

    </div>

    <!-- Username bottom -->
    <div style="position:absolute; bottom:60px; left:0; right:0; text-align:center;">
      <span style="font-size:20px; color:#6B7280;">@emeraldcapital</span>
    </div>

  </div>
</body>
</html>
```

---

## YouTube

### Thumbnail — 1280 x 720px

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0;">
  <div style="width:1280px; height:720px; background:#0C1117; font-family:'Plus Jakarta Sans',-apple-system,sans-serif; display:flex; align-items:center; padding:60px; box-sizing:border-box; position:relative; overflow:hidden;">

    <!-- Gradiente esquerda -->
    <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(135deg, rgba(5,150,105,0.12) 0%, transparent 50%, rgba(245,158,11,0.05) 100%); pointer-events:none;"></div>

    <!-- Texto lado esquerdo (60%) -->
    <div style="width:60%; position:relative; z-index:1;">

      <!-- Badge -->
      <div style="display:inline-block; padding:6px 16px; background:#F59E0B; border-radius:4px; margin-bottom:16px;">
        <span style="font-size:16px; font-weight:700; color:#0C1117; letter-spacing:0.04em; text-transform:uppercase;">NOVO</span>
      </div>

      <!-- Título (grande, impactante para thumbnail) -->
      <h1 style="font-size:64px; font-weight:700; line-height:1.05; letter-spacing:-0.02em; color:#F3F4F6; margin:0;">
        Como cortar <span style="color:#059669;">30%</span> dos custos sem demitir ninguém
      </h1>

    </div>

    <!-- Lado direito: elemento visual -->
    <div style="width:40%; display:flex; justify-content:center; align-items:center; position:relative; z-index:1;">
      <div style="width:260px; height:260px; border-radius:9999px; background:rgba(5,150,105,0.08); border:3px solid #059669; display:flex; align-items:center; justify-content:center;">
        <span style="font-size:80px; font-weight:700; color:#059669;">-30%</span>
      </div>
    </div>

    <!-- Borda inferior accent -->
    <div style="position:absolute; bottom:0; left:0; right:0; height:6px; background:linear-gradient(90deg, #059669 0%, #F59E0B 100%);"></div>

  </div>
</body>
</html>
```

### Banner — 2560 x 1440px

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0;">
  <div style="width:2560px; height:1440px; background:#0C1117; font-family:'Plus Jakarta Sans',-apple-system,sans-serif; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;">

    <!-- Gradientes decorativos -->
    <div style="position:absolute; top:-200px; right:200px; width:800px; height:800px; background:radial-gradient(circle, rgba(5,150,105,0.10) 0%, transparent 70%); pointer-events:none;"></div>
    <div style="position:absolute; bottom:-200px; left:200px; width:600px; height:600px; background:radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%); pointer-events:none;"></div>

    <!-- Safe area central (1546x423 — zona visível em todos os dispositivos) -->
    <div style="width:1546px; text-align:center; position:relative; z-index:1;">

      <!-- Logo / Nome -->
      <div style="font-size:72px; font-weight:700; color:#F3F4F6; margin-bottom:20px;">
        <span style="color:#059669;">Emerald</span> Capital
      </div>

      <!-- Tagline -->
      <p style="font-size:32px; font-weight:400; color:#D1D5DB; margin:0 0 28px 0;">
        Estratégia financeira para empresas que exigem excelência
      </p>

      <!-- Separador -->
      <div style="width:80px; height:3px; background:#F59E0B; margin:0 auto 28px auto; border-radius:2px;"></div>

      <!-- Info -->
      <div style="display:flex; justify-content:center; gap:48px;">
        <span style="font-size:20px; font-weight:500; color:#6B7280;">Diagnóstico · Consultoria · Gestão Premium</span>
      </div>

    </div>

    <!-- Linhas decorativas -->
    <div style="position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg, transparent, #059669, transparent);"></div>
    <div style="position:absolute; bottom:0; left:0; right:0; height:4px; background:linear-gradient(90deg, transparent, #059669, transparent);"></div>

  </div>
</body>
</html>
```

---

## Fotografia e Imagem

### Estilo Visual

- **Mood:** Sofisticado, limpo, autoridade silenciosa
- **Temperatura:** Fria a neutra (tons de azul/verde)
- **Iluminação:** Lateral suave, sombras profundas mas não opressivas
- **Composição:** Regra dos terços, espaço negativo generoso
- **Elementos:** Arquitetura moderna, escritórios premium, gráficos em telas, detalhes minimalistas

### Prompts para IA (Midjourney / DALL-E / Flux)

**Retrato corporativo:**
```
Professional business portrait, man in dark navy suit, subtle emerald green tie, clean modern office background with glass walls, soft directional lighting from left, shallow depth of field, Hasselblad medium format aesthetic, corporate premium, dark moody tones --ar 1:1 --style raw
```

**Ambiente de escritório:**
```
Luxury modern office interior, dark navy and emerald color scheme, glass meeting room, city skyline through windows at dusk, ambient warm lighting, minimal furniture, premium consulting firm aesthetic, architectural photography --ar 16:9 --style raw
```

**Abstrato para backgrounds:**
```
Abstract dark background with subtle emerald green light streaks and gold particle accents, premium dark theme, depth and dimension, suitable for text overlay, minimal and sophisticated --ar 16:9 --style raw
```

**Dados / Dashboard:**
```
Modern data dashboard on ultra-wide monitor in dark office, emerald green charts and graphs on dark navy UI, soft screen glow, no text readable, bokeh background, premium tech aesthetic --ar 16:9 --style raw
```

### Regras de Overlay

| Situação | Overlay | Opacidade |
|----------|---------|-----------|
| Foto como bg de seção | `#0C1117` linear gradient | 70-85% |
| Foto como bg de card | `#151D28` solid | 60-75% |
| Foto com texto por cima | Gradiente de baixo para cima `#0C1117` | 80% na base, 0% no topo |
| Foto decorativa (sem texto) | Nenhum | — |

**Nunca** usar foto sem tratamento como background direto. Sempre aplicar overlay para manter legibilidade e consistência com a identidade dark.

### Filtros e Tratamento

- Desaturar levemente (-15 a -25%)
- Aumentar contraste (+10%)
- Aplicar tint frio (azul/verde sutil)
- Sombras puxando para navy (#0C1117), nunca preto puro
- Highlights contidos (não estourar brancos)

---

## Componentes HTML Prontos

### Botões

```html
<!-- Primary Button -->
<a href="#" style="display:inline-block; padding:14px 28px; background:#059669; color:#FFFFFF; font-family:'Plus Jakarta Sans',sans-serif; font-size:15px; font-weight:600; border-radius:8px; text-decoration:none; border:none; cursor:pointer;">
  Começar Agora
</a>

<!-- Secondary Button -->
<a href="#" style="display:inline-block; padding:14px 28px; background:transparent; color:#F3F4F6; font-family:'Plus Jakarta Sans',sans-serif; font-size:15px; font-weight:500; border-radius:8px; text-decoration:none; border:1px solid #1E2A38; cursor:pointer;">
  Saiba Mais
</a>

<!-- Accent Button (ouro — usar com parcimônia) -->
<a href="#" style="display:inline-block; padding:14px 28px; background:#F59E0B; color:#0C1117; font-family:'Plus Jakarta Sans',sans-serif; font-size:15px; font-weight:600; border-radius:8px; text-decoration:none; border:none; cursor:pointer;">
  Oferta Exclusiva
</a>

<!-- Ghost Button -->
<a href="#" style="display:inline-block; padding:14px 28px; background:transparent; color:#059669; font-family:'Plus Jakarta Sans',sans-serif; font-size:15px; font-weight:500; border-radius:8px; text-decoration:none; border:none; cursor:pointer;">
  Ver Detalhes →
</a>
```

### Cards

```html
<!-- Card padrão -->
<div style="background:#151D28; border:1px solid #1E2A38; border-radius:12px; padding:32px; font-family:'Plus Jakarta Sans',sans-serif;">
  <h3 style="font-size:22px; font-weight:500; line-height:1.35; color:#F3F4F6; margin:0 0 12px 0;">Título do Card</h3>
  <p style="font-size:14px; font-weight:400; line-height:1.6; color:#D1D5DB; margin:0;">
    Descrição do conteúdo do card com texto secundário que explica o contexto.
  </p>
</div>

<!-- Card com borda primária (destaque) -->
<div style="background:#151D28; border:1px solid #059669; border-radius:12px; padding:32px; font-family:'Plus Jakarta Sans',sans-serif;">
  <h3 style="font-size:22px; font-weight:500; line-height:1.35; color:#F3F4F6; margin:0 0 12px 0;">Card Destacado</h3>
  <p style="font-size:14px; font-weight:400; line-height:1.6; color:#D1D5DB; margin:0;">
    Este card tem borda esmeralda para indicar destaque ou seleção ativa.
  </p>
</div>

<!-- Card com ícone -->
<div style="background:#151D28; border:1px solid #1E2A38; border-radius:12px; padding:32px; font-family:'Plus Jakarta Sans',sans-serif;">
  <div style="width:48px; height:48px; border-radius:12px; background:rgba(5,150,105,0.1); display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
    <span style="font-size:24px; color:#059669;">📈</span>
  </div>
  <h3 style="font-size:22px; font-weight:500; line-height:1.35; color:#F3F4F6; margin:0 0 12px 0;">Crescimento Sustentável</h3>
  <p style="font-size:14px; font-weight:400; line-height:1.6; color:#D1D5DB; margin:0;">
    Metodologia validada com mais de 200 empresas nos últimos 5 anos.
  </p>
</div>
```

### Highlight Boxes

```html
<!-- Highlight com borda esmeralda -->
<div style="background:#151D28; border-left:4px solid #059669; border-radius:0 8px 8px 0; padding:24px 28px; font-family:'Plus Jakarta Sans',sans-serif;">
  <p style="font-size:16px; font-weight:400; line-height:1.7; color:#D1D5DB; margin:0;">
    Empresas que implementam gestão baseada em dados crescem em média <span style="color:#059669; font-weight:600;">2.5x mais rápido</span> que as que operam por intuição.
  </p>
</div>

<!-- Highlight com borda ouro (premium) -->
<div style="background:#151D28; border-left:4px solid #F59E0B; border-radius:0 8px 8px 0; padding:24px 28px; font-family:'Plus Jakarta Sans',sans-serif;">
  <p style="font-size:16px; font-weight:400; line-height:1.7; color:#D1D5DB; margin:0;">
    <span style="color:#F59E0B; font-weight:600;">Dica premium:</span> revise seu fluxo de caixa semanalmente, não mensalmente. Uma semana de atraso pode custar meses de recuperação.
  </p>
</div>

<!-- Alert / Warning -->
<div style="background:rgba(239,68,68,0.05); border-left:4px solid #EF4444; border-radius:0 8px 8px 0; padding:24px 28px; font-family:'Plus Jakarta Sans',sans-serif;">
  <p style="font-size:16px; font-weight:400; line-height:1.7; color:#D1D5DB; margin:0;">
    <span style="color:#EF4444; font-weight:600;">Atenção:</span> nunca tome decisões financeiras baseadas apenas no faturamento bruto. O que importa é a margem líquida.
  </p>
</div>
```

### List Icons

```html
<!-- Lista com checks esmeralda -->
<ul style="list-style:none; padding:0; margin:0; font-family:'Plus Jakarta Sans',sans-serif;">
  <li style="font-size:16px; color:#D1D5DB; padding:12px 0; display:flex; align-items:flex-start; gap:12px; border-bottom:1px solid #1E2A38;">
    <span style="color:#059669; font-size:18px; flex-shrink:0; margin-top:2px;">✓</span>
    <span>Análise completa da estrutura de custos e receitas</span>
  </li>
  <li style="font-size:16px; color:#D1D5DB; padding:12px 0; display:flex; align-items:flex-start; gap:12px; border-bottom:1px solid #1E2A38;">
    <span style="color:#059669; font-size:18px; flex-shrink:0; margin-top:2px;">✓</span>
    <span>Mapeamento de oportunidades de crescimento</span>
  </li>
  <li style="font-size:16px; color:#D1D5DB; padding:12px 0; display:flex; align-items:flex-start; gap:12px;">
    <span style="color:#059669; font-size:18px; flex-shrink:0; margin-top:2px;">✓</span>
    <span>Plano de ação priorizado por impacto</span>
  </li>
</ul>

<!-- Lista com bullets esmeralda -->
<ul style="list-style:none; padding:0; margin:0; font-family:'Plus Jakarta Sans',sans-serif;">
  <li style="font-size:16px; color:#D1D5DB; padding:8px 0; display:flex; align-items:center; gap:12px;">
    <span style="width:6px; height:6px; border-radius:9999px; background:#059669; flex-shrink:0;"></span>
    <span>Diagnóstico financeiro completo</span>
  </li>
  <li style="font-size:16px; color:#D1D5DB; padding:8px 0; display:flex; align-items:center; gap:12px;">
    <span style="width:6px; height:6px; border-radius:9999px; background:#059669; flex-shrink:0;"></span>
    <span>Reuniões semanais de acompanhamento</span>
  </li>
  <li style="font-size:16px; color:#D1D5DB; padding:8px 0; display:flex; align-items:center; gap:12px;">
    <span style="width:6px; height:6px; border-radius:9999px; background:#059669; flex-shrink:0;"></span>
    <span>Dashboard executivo em tempo real</span>
  </li>
</ul>

<!-- Lista com números ouro -->
<ol style="list-style:none; padding:0; margin:0; font-family:'Plus Jakarta Sans',sans-serif; counter-reset:gold-list;">
  <li style="font-size:16px; color:#D1D5DB; padding:12px 0; display:flex; align-items:flex-start; gap:16px; border-bottom:1px solid #1E2A38; counter-increment:gold-list;">
    <span style="font-size:14px; font-weight:700; color:#F59E0B; min-width:24px;">01</span>
    <span>Defina seus indicadores-chave de performance (KPIs)</span>
  </li>
  <li style="font-size:16px; color:#D1D5DB; padding:12px 0; display:flex; align-items:flex-start; gap:16px; border-bottom:1px solid #1E2A38; counter-increment:gold-list;">
    <span style="font-size:14px; font-weight:700; color:#F59E0B; min-width:24px;">02</span>
    <span>Implemente um sistema de acompanhamento semanal</span>
  </li>
  <li style="font-size:16px; color:#D1D5DB; padding:12px 0; display:flex; align-items:flex-start; gap:16px; counter-increment:gold-list;">
    <span style="font-size:14px; font-weight:700; color:#F59E0B; min-width:24px;">03</span>
    <span>Revise e ajuste trimestralmente com base nos dados</span>
  </li>
</ol>
```

---

## Tom de Voz

### Personalidade

- **Sofisticado** — vocabulário preciso, frases enxutas, sem excesso de adjetivos
- **Autoritativo** — fala de quem já fez, não de quem acha. Dados antes de opiniões
- **Data-driven** — números concretos, métricas, percentuais. "3.2x de ROI" > "ótimos resultados"
- **Direto** — sem rodeios, sem disclaimers excessivos. Respeita o tempo do leitor

### Princípios

| Fazer | Evitar |
|-------|--------|
| "Reduzimos custos em 28% nos primeiros 90 dias" | "Ajudamos a reduzir custos de forma significativa" |
| "Empresas com CAC acima de R$ 500 precisam reavaliar" | "Talvez seja uma boa ideia olhar para o seu CAC" |
| "R$ 500M sob gestão estratégica" | "Trabalhamos com muitas empresas" |
| "Diagnóstico gratuito. 30 minutos. Sem compromisso." | "Entre em contato conosco para mais informações!" |
| "Método comprovado com 200+ empresas" | "Nossa metodologia inovadora e disruptiva" |

### Palavras da marca

**Usar:** estratégia, método, dados, resultado, crescimento, excelência, precisão, performance, retorno, diagnóstico, gestão, clareza

**Evitar:** hack, disruptivo, inovador (genérico), guru, segredo, fórmula mágica, faturamento de 7 dígitos, empreendedorismo, mindset (isolado)

### Tom por canal

| Canal | Tom | Exemplo |
|-------|-----|---------|
| Landing Page | Confiante, direto, dados como prova | "3.2x de ROI médio no primeiro ano" |
| Instagram (carousel) | Educativo, assertivo, com gancho | "A maioria ignora essa métrica. E quebra." |
| Instagram (post) | Provocativo, frase-impacto | "Faturamento não é lucro." |
| Stories | Urgente, conversacional, CTA claro | "78% não acompanham fluxo de caixa" |
| YouTube | Professor sênior, profundo, concreto | "Hoje eu vou te mostrar como cortar 30%..." |
| Email | Pessoal, direto ao ponto, value-first | "Ricardo, encontrei 3 oportunidades..." |

---

## Anti-slop

Checklist obrigatório antes de finalizar qualquer peça visual:

- [ ] Plus Jakarta Sans carregada via CDN (nunca Inter, Roboto ou system font sozinha)
- [ ] Background é `#0C1117` (navy-dark), nunca `#000000` (preto puro)
- [ ] Cards usam `#151D28` com borda `#1E2A38`
- [ ] Espaçamento entre seções é 96px (padrão Stripe)
- [ ] Ouro (#F59E0B) ocupa no máximo 3% da UI (badges, preços, separadores)
- [ ] Body text com weight 400, nunca bold
- [ ] Sombras em cards md+ têm tint esmeralda: `rgba(5,150,105,0.05-0.10)`
- [ ] Gradientes decorativos com emerald 12% e gold 5%, com `pointer-events: none`
- [ ] Hover scale é 1.015 (quase imperceptível)
- [ ] Todos os HTMLs são self-contained (CDN + inline styles = abre no browser e funciona)
- [ ] Texto em pt-BR com acentuação completa (ação, não, você, é, será, etc.)
- [ ] Copy realista temática (finanças/consultoria), nunca lorem ipsum
- [ ] Dimensões exatas para cada plataforma (1080x1350 carrossel, 1080x1080 post, etc.)
- [ ] Labels em uppercase com letter-spacing 0.06em
- [ ] Animações: duration 240ms, easing `cubic-bezier(0.25, 0.1, 0.25, 1)`
