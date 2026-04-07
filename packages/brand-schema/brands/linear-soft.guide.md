# Linear Soft — Guia Prático

> Muted purple on warm dark. Para SaaS, ferramentas de produtividade, plataformas B2B e gestão de projetos.
> Fonte: linear.app (extração real) | Tema: dark | Fonte tipográfica: Satoshi

---

## Visão Geral

Linear Soft é uma identidade visual inspirada no Linear — sofisticada, minimalista e funcional. O tema escuro com tons quentes de cinza e um roxo abafado transmite profissionalismo sem ser chamativo.

**Quando usar:** SaaS dashboards, ferramentas de produtividade, plataformas B2B, sistemas de gestão de projetos, painéis administrativos, documentação técnica.

**Personalidade:** Preciso, silencioso, eficiente. Como um instrumento bem calibrado — você não percebe o design, percebe que tudo funciona.

### Paleta Rápida

| Papel | Cor | Hex |
|-------|-----|-----|
| Background | Warm dark | `#0C0C10` |
| Surface | Elevated dark | `#16161C` |
| Surface elevated | Lighter dark | `#232330` |
| Border | Subtle | `#232330` |
| Border hover | Lighter | `#3A3A44` |
| Texto principal | Off-white | `#EDEDF0` |
| Texto secundário | Muted gray | `#B5B5BA` |
| Texto terciário | Dim gray | `#7C7C8A` |
| Primary (roxo) | Muted purple | `#8B8BF5` |
| Primary hover | Light purple | `#A5A5F7` |
| Accent | Deep muted | `#6E6E96` |
| Sucesso | Green | `#34D399` |
| Aviso | Yellow | `#FBBF24` |
| Erro | Red | `#F87171` |

---

## Tipografia — Regras de Uso

**Família:** Satoshi (display + body) | JetBrains Mono (código)
**CDN:** `https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap`
**Fallback:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### Escala Tipográfica

| Nível | Tamanho | Peso | Line Height | Letter Spacing |
|-------|---------|------|-------------|----------------|
| H1 | 52px | 700 (Bold) | 1.1 | -0.025em |
| H2 | 36px | 600 (SemiBold) | 1.2 | -0.015em |
| H3 | 28px | 600 (SemiBold) | 1.3 | -0.01em |
| H4 | 22px | 600 (SemiBold) | 1.35 | — |
| Body | 16px | 400 (Regular) | 1.6 | — |
| Body SM | 14px | 400 (Regular) | 1.5 | — |
| Caption | 13px | 400 (Regular) | 1.5 | — |
| Label | 11px | 500 (Medium) | 1.4 | 0.05em, UPPERCASE |

### Regras

- **NUNCA** substituir Satoshi por Inter, Poppins ou qualquer outra fonte
- Títulos (H1-H3) usam letter-spacing negativo — comprime para elegância
- Labels são SEMPRE uppercase com tracking largo (0.05em)
- Body nunca abaixo de 14px — acessibilidade
- Peso máximo: 700 para H1 apenas. Evitar Bold em corpo de texto

---

## Cores — Regras de Uso

### Hierarquia via Opacidade

A hierarquia de informação é construída com opacidade, não com cores diferentes. Isso mantém a coesão visual.

| Nível | Aplicação | Como |
|-------|-----------|------|
| Primário | Títulos, texto principal | `#EDEDF0` (100%) |
| Secundário | Descrições, subtextos | `#B5B5BA` (~70%) |
| Terciário | Placeholders, metadados | `#7C7C8A` (~50%) |
| Desativado | Elementos inativos | `#4E4E58` (~30%) |

### Superfícies

Três camadas de profundidade:

| Camada | Hex | Uso |
|--------|-----|-----|
| Background | `#0C0C10` | Fundo da página |
| Surface | `#16161C` | Cards, modais, sidebars |
| Surface Elevated | `#232330` | Dropdowns, tooltips, hovers |

### Regras

- **NUNCA** usar preto puro (`#000000`) — sempre `#0C0C10`
- O roxo `#8B8BF5` é muted — nunca aumentar saturação
- Sombras usam alta opacidade (0.35-0.55) para funcionar no tema escuro
- Bordas são sutis (`#232330`), nunca chamativas
- Sucesso/Erro/Aviso são cores semânticas — usar apenas para estados

---

## Landing Pages

### Hero

```html
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet">

<section style="background-color: #0C0C10; padding: 120px 24px 80px; text-align: center; font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 800px; margin: 0 auto;">
    <span style="display: inline-block; font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #8B8BF5; background: rgba(139,139,245,0.08); border: 1px solid rgba(139,139,245,0.15); border-radius: 9999px; padding: 6px 16px; margin-bottom: 24px;">Gestão de projetos reimaginada</span>
    <h1 style="font-size: 52px; font-weight: 700; line-height: 1.1; letter-spacing: -0.025em; color: #EDEDF0; margin: 0 0 20px;">Gerencie projetos<br>sem atrito</h1>
    <p style="font-size: 18px; font-weight: 400; line-height: 1.6; color: #B5B5BA; margin: 0 0 40px; max-width: 560px; margin-left: auto; margin-right: auto;">Fluxos que funcionam. Tarefas que se organizam. Equipes que entregam. Tudo em uma plataforma que sai do caminho.</p>
    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
      <a href="#" style="display: inline-block; background: #8B8BF5; color: #0C0C10; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px; text-decoration: none; transition: background 200ms;">Começar agora — grátis</a>
      <a href="#" style="display: inline-block; background: transparent; color: #EDEDF0; font-size: 14px; font-weight: 500; padding: 12px 28px; border-radius: 8px; text-decoration: none; border: 1px solid #232330;">Ver demonstração</a>
    </div>
  </div>
</section>
```

### Features

```html
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet">

<section style="background-color: #0C0C10; padding: 80px 24px; font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 1080px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 64px;">
      <span style="display: inline-block; font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #8B8BF5; margin-bottom: 16px;">Funcionalidades</span>
      <h2 style="font-size: 36px; font-weight: 600; line-height: 1.2; letter-spacing: -0.015em; color: #EDEDF0; margin: 0 0 16px;">Ferramentas que aceleram entregas</h2>
      <p style="font-size: 16px; color: #B5B5BA; line-height: 1.6; max-width: 520px; margin: 0 auto;">Cada funcionalidade foi desenhada para eliminar fricção. Menos cliques, mais resultado.</p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
      <!-- Card 1 -->
      <div style="background: #16161C; border: 1px solid #232330; border-radius: 12px; padding: 32px 24px;">
        <div style="width: 40px; height: 40px; background: rgba(139,139,245,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10h14M10 3v14" stroke="#8B8BF5" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <h3 style="font-size: 18px; font-weight: 600; color: #EDEDF0; margin: 0 0 8px;">Planejamento ágil</h3>
        <p style="font-size: 14px; color: #7C7C8A; line-height: 1.5; margin: 0;">Sprints, backlogs e roadmaps em uma visão única. Sem planilhas auxiliares.</p>
      </div>
      <!-- Card 2 -->
      <div style="background: #16161C; border: 1px solid #232330; border-radius: 12px; padding: 32px 24px;">
        <div style="width: 40px; height: 40px; background: rgba(139,139,245,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#8B8BF5" stroke-width="1.5"/><path d="M10 6v4l3 2" stroke="#8B8BF5" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <h3 style="font-size: 18px; font-weight: 600; color: #EDEDF0; margin: 0 0 8px;">Ciclos automáticos</h3>
        <p style="font-size: 14px; color: #7C7C8A; line-height: 1.5; margin: 0;">Tarefas avançam sozinhas entre etapas. Automações que economizam horas por semana.</p>
      </div>
      <!-- Card 3 -->
      <div style="background: #16161C; border: 1px solid #232330; border-radius: 12px; padding: 32px 24px;">
        <div style="width: 40px; height: 40px; background: rgba(139,139,245,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 15l4-4 3 3 5-7" stroke="#8B8BF5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <h3 style="font-size: 18px; font-weight: 600; color: #EDEDF0; margin: 0 0 8px;">Métricas em tempo real</h3>
        <p style="font-size: 14px; color: #7C7C8A; line-height: 1.5; margin: 0;">Velocity, burndown e lead time atualizados automaticamente. Decisões com dados, não com achismo.</p>
      </div>
    </div>
  </div>
</section>
```

### Stats

```html
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet">

<section style="background-color: #0C0C10; padding: 80px 24px; font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 960px; margin: 0 auto;">
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; text-align: center;">
      <!-- Stat 1 -->
      <div>
        <div style="font-size: 48px; font-weight: 700; color: #8B8BF5; line-height: 1.1; letter-spacing: -0.025em; margin-bottom: 8px;">3.200+</div>
        <div style="font-size: 14px; color: #7C7C8A; line-height: 1.5;">Equipes ativas</div>
      </div>
      <!-- Stat 2 -->
      <div>
        <div style="font-size: 48px; font-weight: 700; color: #8B8BF5; line-height: 1.1; letter-spacing: -0.025em; margin-bottom: 8px;">47%</div>
        <div style="font-size: 14px; color: #7C7C8A; line-height: 1.5;">Menos tempo em reuniões</div>
      </div>
      <!-- Stat 3 -->
      <div>
        <div style="font-size: 48px; font-weight: 700; color: #8B8BF5; line-height: 1.1; letter-spacing: -0.025em; margin-bottom: 8px;">2.4x</div>
        <div style="font-size: 14px; color: #7C7C8A; line-height: 1.5;">Mais entregas por sprint</div>
      </div>
      <!-- Stat 4 -->
      <div>
        <div style="font-size: 48px; font-weight: 700; color: #8B8BF5; line-height: 1.1; letter-spacing: -0.025em; margin-bottom: 8px;">99.9%</div>
        <div style="font-size: 14px; color: #7C7C8A; line-height: 1.5;">Uptime garantido</div>
      </div>
    </div>
  </div>
</section>
```

### CTA

```html
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet">

<section style="background-color: #0C0C10; padding: 80px 24px; font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 720px; margin: 0 auto; text-align: center; background: #16161C; border: 1px solid #232330; border-radius: 16px; padding: 64px 48px; position: relative; overflow: hidden;">
    <div style="position: absolute; top: -120px; left: 50%; transform: translateX(-50%); width: 400px; height: 400px; background: radial-gradient(circle, rgba(139,139,245,0.08) 0%, transparent 70%); pointer-events: none;"></div>
    <h2 style="font-size: 36px; font-weight: 600; line-height: 1.2; letter-spacing: -0.015em; color: #EDEDF0; margin: 0 0 16px; position: relative;">Comece a entregar mais rápido</h2>
    <p style="font-size: 16px; color: #B5B5BA; line-height: 1.6; margin: 0 0 32px; position: relative;">Configuração em 2 minutos. Sem cartão de crédito. Migre do Jira em um clique.</p>
    <a href="#" style="display: inline-block; background: #8B8BF5; color: #0C0C10; font-size: 14px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none; position: relative;">Criar conta gratuita</a>
  </div>
</section>
```

### Pricing

```html
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet">

<section style="background-color: #0C0C10; padding: 80px 24px; font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 1080px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 64px;">
      <span style="display: inline-block; font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #8B8BF5; margin-bottom: 16px;">Planos</span>
      <h2 style="font-size: 36px; font-weight: 600; line-height: 1.2; letter-spacing: -0.015em; color: #EDEDF0; margin: 0 0 16px;">Preço que escala com você</h2>
      <p style="font-size: 16px; color: #B5B5BA; line-height: 1.6;">Comece grátis. Escale quando precisar.</p>
    </div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; align-items: start;">
      <!-- Free -->
      <div style="background: #16161C; border: 1px solid #232330; border-radius: 12px; padding: 32px 24px;">
        <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #7C7C8A;">Starter</span>
        <div style="margin: 16px 0 24px;">
          <span style="font-size: 36px; font-weight: 700; color: #EDEDF0; line-height: 1;">R$ 0</span>
          <span style="font-size: 14px; color: #7C7C8A;">/mês</span>
        </div>
        <p style="font-size: 14px; color: #B5B5BA; line-height: 1.5; margin: 0 0 24px;">Para equipes pequenas que querem organizar o básico.</p>
        <a href="#" style="display: block; text-align: center; background: transparent; color: #EDEDF0; font-size: 14px; font-weight: 500; padding: 10px 20px; border-radius: 8px; text-decoration: none; border: 1px solid #232330; margin-bottom: 24px;">Começar grátis</a>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="font-size: 13px; color: #B5B5BA; padding: 8px 0; border-top: 1px solid #232330;">Até 5 membros</li>
          <li style="font-size: 13px; color: #B5B5BA; padding: 8px 0; border-top: 1px solid #232330;">Projetos ilimitados</li>
          <li style="font-size: 13px; color: #B5B5BA; padding: 8px 0; border-top: 1px solid #232330;">Integrações básicas</li>
        </ul>
      </div>
      <!-- Pro (destaque) -->
      <div style="background: #16161C; border: 1px solid #8B8BF5; border-radius: 12px; padding: 32px 24px; position: relative;">
        <span style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #0C0C10; background: #8B8BF5; padding: 4px 12px; border-radius: 9999px;">Popular</span>
        <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #8B8BF5;">Pro</span>
        <div style="margin: 16px 0 24px;">
          <span style="font-size: 36px; font-weight: 700; color: #EDEDF0; line-height: 1;">R$ 49</span>
          <span style="font-size: 14px; color: #7C7C8A;">/mês por membro</span>
        </div>
        <p style="font-size: 14px; color: #B5B5BA; line-height: 1.5; margin: 0 0 24px;">Para equipes que precisam de automação e métricas avançadas.</p>
        <a href="#" style="display: block; text-align: center; background: #8B8BF5; color: #0C0C10; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 8px; text-decoration: none; margin-bottom: 24px;">Testar 14 dias grátis</a>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="font-size: 13px; color: #B5B5BA; padding: 8px 0; border-top: 1px solid #232330;">Membros ilimitados</li>
          <li style="font-size: 13px; color: #B5B5BA; padding: 8px 0; border-top: 1px solid #232330;">Ciclos automáticos</li>
          <li style="font-size: 13px; color: #B5B5BA; padding: 8px 0; border-top: 1px solid #232330;">Integrações avançadas</li>
          <li style="font-size: 13px; color: #B5B5BA; padding: 8px 0; border-top: 1px solid #232330;">Métricas e relatórios</li>
        </ul>
      </div>
      <!-- Enterprise -->
      <div style="background: #16161C; border: 1px solid #232330; border-radius: 12px; padding: 32px 24px;">
        <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #7C7C8A;">Enterprise</span>
        <div style="margin: 16px 0 24px;">
          <span style="font-size: 36px; font-weight: 700; color: #EDEDF0; line-height: 1;">Custom</span>
        </div>
        <p style="font-size: 14px; color: #B5B5BA; line-height: 1.5; margin: 0 0 24px;">Para organizações com necessidades de segurança e compliance.</p>
        <a href="#" style="display: block; text-align: center; background: transparent; color: #EDEDF0; font-size: 14px; font-weight: 500; padding: 10px 20px; border-radius: 8px; text-decoration: none; border: 1px solid #232330; margin-bottom: 24px;">Falar com vendas</a>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="font-size: 13px; color: #B5B5BA; padding: 8px 0; border-top: 1px solid #232330;">SSO e SAML</li>
          <li style="font-size: 13px; color: #B5B5BA; padding: 8px 0; border-top: 1px solid #232330;">SLA dedicado</li>
          <li style="font-size: 13px; color: #B5B5BA; padding: 8px 0; border-top: 1px solid #232330;">Audit log completo</li>
          <li style="font-size: 13px; color: #B5B5BA; padding: 8px 0; border-top: 1px solid #232330;">Suporte prioritário</li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

### Footer

```html
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet">

<footer style="background-color: #0C0C10; border-top: 1px solid #232330; padding: 64px 24px 32px; font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 1080px; margin: 0 auto;">
    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px;">
      <!-- Brand -->
      <div>
        <div style="font-size: 18px; font-weight: 700; color: #EDEDF0; margin-bottom: 12px;">Linear Soft</div>
        <p style="font-size: 14px; color: #7C7C8A; line-height: 1.5; margin: 0; max-width: 280px;">Gestão de projetos para equipes que preferem entregar a planejar reuniões.</p>
      </div>
      <!-- Produto -->
      <div>
        <div style="font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #7C7C8A; margin-bottom: 16px;">Produto</div>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #B5B5BA; text-decoration: none;">Funcionalidades</a></li>
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #B5B5BA; text-decoration: none;">Integrações</a></li>
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #B5B5BA; text-decoration: none;">Preços</a></li>
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #B5B5BA; text-decoration: none;">Changelog</a></li>
        </ul>
      </div>
      <!-- Empresa -->
      <div>
        <div style="font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #7C7C8A; margin-bottom: 16px;">Empresa</div>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #B5B5BA; text-decoration: none;">Sobre</a></li>
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #B5B5BA; text-decoration: none;">Blog</a></li>
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #B5B5BA; text-decoration: none;">Carreiras</a></li>
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #B5B5BA; text-decoration: none;">Contato</a></li>
        </ul>
      </div>
      <!-- Legal -->
      <div>
        <div style="font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #7C7C8A; margin-bottom: 16px;">Legal</div>
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #B5B5BA; text-decoration: none;">Privacidade</a></li>
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #B5B5BA; text-decoration: none;">Termos</a></li>
          <li style="margin-bottom: 10px;"><a href="#" style="font-size: 14px; color: #B5B5BA; text-decoration: none;">Segurança</a></li>
        </ul>
      </div>
    </div>
    <div style="border-top: 1px solid #232330; padding-top: 24px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 13px; color: #7C7C8A;">&copy; 2026 Linear Soft. Todos os direitos reservados.</span>
      <div style="display: flex; gap: 16px;">
        <a href="#" style="color: #7C7C8A; text-decoration: none;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href="#" style="color: #7C7C8A; text-decoration: none;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        </a>
        <a href="#" style="color: #7C7C8A; text-decoration: none;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
      </div>
    </div>
  </div>
</footer>
```

---

## Instagram

### Carrossel (1080 x 1350px)

```html
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet">

<!-- Slide 1 — Capa -->
<div style="width: 1080px; height: 1350px; background: #0C0C10; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; position: relative; overflow: hidden;">
  <div style="position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(139,139,245,0.06) 0%, transparent 70%); pointer-events: none;"></div>
  <span style="font-size: 13px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #8B8BF5; margin-bottom: 32px; position: relative;">Gestão de projetos</span>
  <h1 style="font-size: 64px; font-weight: 700; line-height: 1.1; letter-spacing: -0.025em; color: #EDEDF0; text-align: center; margin: 0 0 24px; position: relative;">5 sinais de que<br>sua equipe precisa<br>de um novo fluxo</h1>
  <p style="font-size: 20px; color: #7C7C8A; text-align: center; position: relative;">Deslize para identificar →</p>
  <div style="position: absolute; bottom: 48px; display: flex; gap: 8px;">
    <div style="width: 24px; height: 4px; background: #8B8BF5; border-radius: 9999px;"></div>
    <div style="width: 8px; height: 4px; background: #232330; border-radius: 9999px;"></div>
    <div style="width: 8px; height: 4px; background: #232330; border-radius: 9999px;"></div>
    <div style="width: 8px; height: 4px; background: #232330; border-radius: 9999px;"></div>
    <div style="width: 8px; height: 4px; background: #232330; border-radius: 9999px;"></div>
  </div>
</div>

<!-- Slide 2 — Conteúdo -->
<div style="width: 1080px; height: 1350px; background: #0C0C10; display: flex; flex-direction: column; justify-content: center; padding: 80px; font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <span style="font-size: 80px; font-weight: 700; color: rgba(139,139,245,0.15); margin-bottom: 24px; line-height: 1;">01</span>
  <h2 style="font-size: 44px; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; color: #EDEDF0; margin: 0 0 24px;">Reuniões de status<br>que deveriam ser<br>um dashboard</h2>
  <p style="font-size: 20px; color: #B5B5BA; line-height: 1.6; margin: 0; max-width: 700px;">Se a equipe precisa de uma reunião para saber o que está acontecendo, o problema não é comunicação — é visibilidade.</p>
  <div style="margin-top: 48px; padding: 24px; background: #16161C; border: 1px solid #232330; border-radius: 12px; max-width: 700px;">
    <p style="font-size: 16px; color: #8B8BF5; margin: 0; font-weight: 500;">Um bom sistema mostra o progresso em tempo real. Sem perguntar nada.</p>
  </div>
</div>

<!-- Slide Final — CTA -->
<div style="width: 1080px; height: 1350px; background: #0C0C10; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; text-align: center; position: relative; overflow: hidden;">
  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 500px; height: 500px; background: radial-gradient(circle, rgba(139,139,245,0.06) 0%, transparent 70%); pointer-events: none;"></div>
  <h2 style="font-size: 48px; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; color: #EDEDF0; margin: 0 0 24px; position: relative;">Fluxo que funciona<br>começa com a<br>ferramenta certa</h2>
  <p style="font-size: 20px; color: #B5B5BA; margin: 0 0 40px; position: relative;">Teste grátis — link na bio</p>
  <div style="background: #8B8BF5; color: #0C0C10; font-size: 16px; font-weight: 600; padding: 16px 40px; border-radius: 8px; position: relative;">linearsoft.app/start</div>
</div>
```

### Post Quadrado (1080 x 1080px)

```html
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet">

<div style="width: 1080px; height: 1080px; background: #0C0C10; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px; font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; text-align: center; position: relative; overflow: hidden;">
  <div style="position: absolute; top: -150px; right: -150px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(139,139,245,0.06) 0%, transparent 70%); pointer-events: none;"></div>
  <span style="font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #8B8BF5; background: rgba(139,139,245,0.08); border: 1px solid rgba(139,139,245,0.15); padding: 6px 16px; border-radius: 9999px; margin-bottom: 32px;">Dica rápida</span>
  <h2 style="font-size: 48px; font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; color: #EDEDF0; margin: 0 0 20px;">Pare de gerenciar<br>tarefas. Gerencie<br>resultados.</h2>
  <p style="font-size: 18px; color: #B5B5BA; line-height: 1.6; margin: 0; max-width: 640px;">A diferença entre equipes que entregam e equipes que apagam incêndio está no fluxo, não no esforço.</p>
  <div style="position: absolute; bottom: 48px; display: flex; align-items: center; gap: 8px;">
    <div style="width: 32px; height: 32px; background: #8B8BF5; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8h8M8 4v8" stroke="#0C0C10" stroke-width="2" stroke-linecap="round"/></svg>
    </div>
    <span style="font-size: 14px; font-weight: 600; color: #EDEDF0;">Linear Soft</span>
  </div>
</div>
```

### Stories (1080 x 1920px)

```html
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet">

<div style="width: 1080px; height: 1920px; background: #0C0C10; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px 64px; font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; text-align: center; position: relative; overflow: hidden;">
  <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(ellipse at 50% 30%, rgba(139,139,245,0.06) 0%, transparent 60%); pointer-events: none;"></div>
  <!-- Logo -->
  <div style="position: absolute; top: 64px; left: 64px; display: flex; align-items: center; gap: 8px;">
    <div style="width: 32px; height: 32px; background: #8B8BF5; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8h8M8 4v8" stroke="#0C0C10" stroke-width="2" stroke-linecap="round"/></svg>
    </div>
    <span style="font-size: 14px; font-weight: 600; color: #EDEDF0;">Linear Soft</span>
  </div>
  <!-- Content -->
  <div style="position: relative; z-index: 1;">
    <span style="font-size: 13px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #8B8BF5; margin-bottom: 24px; display: block;">Novo recurso</span>
    <h1 style="font-size: 56px; font-weight: 700; line-height: 1.1; letter-spacing: -0.025em; color: #EDEDF0; margin: 0 0 24px;">Ciclos<br>automáticos<br>chegaram</h1>
    <p style="font-size: 20px; color: #B5B5BA; line-height: 1.5; margin: 0 0 48px;">Defina o ritmo. As tarefas se<br>organizam sozinhas.</p>
    <div style="background: #8B8BF5; color: #0C0C10; font-size: 16px; font-weight: 600; padding: 16px 40px; border-radius: 8px; display: inline-block;">Ativar agora</div>
  </div>
  <!-- Swipe up -->
  <div style="position: absolute; bottom: 80px; display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 19V5M5 12l7-7 7 7" stroke="#7C7C8A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <span style="font-size: 13px; color: #7C7C8A; font-weight: 500;">Saiba mais</span>
  </div>
</div>
```

---

## YouTube

### Thumbnail (1280 x 720px)

```html
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet">

<div style="width: 1280px; height: 720px; background: #0C0C10; display: flex; align-items: center; padding: 0; font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; position: relative; overflow: hidden;">
  <!-- Glow -->
  <div style="position: absolute; top: 50%; left: 30%; transform: translate(-50%, -50%); width: 500px; height: 500px; background: radial-gradient(circle, rgba(139,139,245,0.1) 0%, transparent 70%); pointer-events: none;"></div>
  <!-- Left content -->
  <div style="padding: 64px 80px; position: relative; z-index: 1; flex: 1;">
    <span style="font-size: 14px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #8B8BF5; margin-bottom: 16px; display: block;">Tutorial</span>
    <h1 style="font-size: 56px; font-weight: 700; line-height: 1.05; letter-spacing: -0.025em; color: #EDEDF0; margin: 0;">Gestão de<br>projetos sem<br>fricção</h1>
  </div>
  <!-- Right accent -->
  <div style="width: 400px; height: 100%; background: linear-gradient(135deg, rgba(139,139,245,0.08) 0%, transparent 100%); display: flex; align-items: center; justify-content: center; position: relative;">
    <div style="width: 120px; height: 120px; border: 2px solid rgba(139,139,245,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center;">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M20 16v16l12-8z" fill="#8B8BF5"/></svg>
    </div>
  </div>
  <!-- Bottom bar -->
  <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #8B8BF5, rgba(139,139,245,0.2));"></div>
</div>
```

### Banner (2560 x 1440px)

```html
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet">

<div style="width: 2560px; height: 1440px; background: #0C0C10; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; text-align: center; position: relative; overflow: hidden;">
  <!-- Glow central -->
  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 1000px; height: 1000px; background: radial-gradient(circle, rgba(139,139,245,0.05) 0%, transparent 70%); pointer-events: none;"></div>
  <!-- Grid decorativo -->
  <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: linear-gradient(rgba(139,139,245,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,139,245,0.03) 1px, transparent 1px); background-size: 80px 80px; pointer-events: none;"></div>
  <!-- Safe zone content (1546×423 central) -->
  <div style="position: relative; z-index: 1;">
    <div style="display: flex; align-items: center; gap: 16px; justify-content: center; margin-bottom: 24px;">
      <div style="width: 48px; height: 48px; background: #8B8BF5; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 12h12M12 6v12" stroke="#0C0C10" stroke-width="2.5" stroke-linecap="round"/></svg>
      </div>
      <span style="font-size: 32px; font-weight: 700; color: #EDEDF0; letter-spacing: -0.015em;">Linear Soft</span>
    </div>
    <p style="font-size: 22px; color: #B5B5BA; font-weight: 400; margin: 0;">Fluxos que funcionam. Equipes que entregam.</p>
  </div>
  <!-- Linha horizontal decorativa -->
  <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(139,139,245,0.08) 30%, rgba(139,139,245,0.08) 70%, transparent); pointer-events: none;"></div>
</div>
```

---

## Fotografia

### Diretrizes Visuais

| Aspecto | Regra |
|---------|-------|
| Estilo | Fotos em ambientes escuros, iluminação suave lateral, tons neutros |
| Overlays | Usar overlay `rgba(12,12,16,0.6)` para integrar fotos ao fundo |
| Saturação | Reduzida — dessaturar 20-30% para manter coerência com a paleta |
| Sujeitos | Pessoas trabalhando com foco, telas mostrando dados, escritórios minimalistas |
| Evitar | Fotos stock genéricas, sorrisos artificiais, backgrounds brancos |
| Gradientes | `rgba(139,139,245,0.06)` como glow sutil — nunca como fundo sólido |
| Ícones | Linha fina (1.5px stroke), cor `#8B8BF5` ou `#7C7C8A`, cantos arredondados |

### Tratamento de Imagem

```css
/* Overlay para integrar imagens */
.image-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(12,12,16,0.3) 0%, rgba(12,12,16,0.8) 100%);
}

/* Dessaturação para coerência */
.image-brand {
  filter: saturate(0.75) brightness(0.85);
}
```

---

## Componentes

### Botão Primário

```html
<a href="#" style="display: inline-block; background: #8B8BF5; color: #0C0C10; font-family: 'Satoshi', sans-serif; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 8px; text-decoration: none; border: none; cursor: pointer;">Começar agora</a>
```

### Botão Secundário

```html
<a href="#" style="display: inline-block; background: transparent; color: #EDEDF0; font-family: 'Satoshi', sans-serif; font-size: 14px; font-weight: 500; padding: 10px 20px; border-radius: 8px; text-decoration: none; border: 1px solid #232330; cursor: pointer;">Ver mais</a>
```

### Card

```html
<div style="background: #16161C; border: 1px solid #232330; border-radius: 12px; padding: 24px; font-family: 'Satoshi', sans-serif;">
  <h3 style="font-size: 18px; font-weight: 600; color: #EDEDF0; margin: 0 0 8px;">Título do card</h3>
  <p style="font-size: 14px; color: #7C7C8A; line-height: 1.5; margin: 0;">Descrição breve do conteúdo do card com informações relevantes.</p>
</div>
```

### Input

```html
<input type="text" placeholder="email@empresa.com" style="width: 100%; background: #16161C; color: #EDEDF0; font-family: 'Satoshi', sans-serif; font-size: 14px; padding: 10px 14px; border: 1px solid #232330; border-radius: 8px; outline: none;">
```

### Badge / Label

```html
<span style="display: inline-block; font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: #8B8BF5; background: rgba(139,139,245,0.08); border: 1px solid rgba(139,139,245,0.15); padding: 4px 12px; border-radius: 9999px; font-family: 'Satoshi', sans-serif;">Em progresso</span>
```

### Badge de Status

```html
<!-- Sucesso -->
<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: #34D399; font-family: 'Satoshi', sans-serif;">
  <span style="width: 6px; height: 6px; background: #34D399; border-radius: 9999px;"></span>Completo
</span>

<!-- Aviso -->
<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: #FBBF24; font-family: 'Satoshi', sans-serif;">
  <span style="width: 6px; height: 6px; background: #FBBF24; border-radius: 9999px;"></span>Em análise
</span>

<!-- Erro -->
<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: #F87171; font-family: 'Satoshi', sans-serif;">
  <span style="width: 6px; height: 6px; background: #F87171; border-radius: 9999px;"></span>Bloqueado
</span>
```

---

## Tom de Voz

### Princípios

| Princípio | Descrição | Exemplo |
|-----------|-----------|---------|
| Direto | Sem rodeios. Frase curta. Verbo forte. | "Gerencie projetos sem atrito" |
| Confiante | Afirmativo, nunca inseguro ou exagerado | "Fluxos que funcionam" — não "Os melhores fluxos do mundo!" |
| Técnico sem jargão | Clareza sobre complexidade | "Métricas em tempo real" — não "Dashboard analytics-driven KPI" |
| Funcional | Foco no que a pessoa ganha | "Menos reuniões, mais entregas" |

### Vocabulário da Marca

| Usar | Evitar |
|------|--------|
| Fluxo | Workflow (em copy pt-BR) |
| Equipe | Time (em contexto formal) |
| Entregar | Shipar |
| Sem atrito | Seamless |
| Funciona | É incrível / revolucionário |
| Organizar | Gerenciar de forma holística |

### Exemplos de Copy

| Contexto | Copy |
|----------|------|
| Hero headline | "Gerencie projetos sem atrito" |
| Hero sub | "Fluxos que funcionam. Tarefas que se organizam. Equipes que entregam." |
| Feature title | "Planejamento ágil" / "Ciclos automáticos" / "Métricas em tempo real" |
| CTA primário | "Começar agora — grátis" |
| CTA secundário | "Ver demonstração" |
| Pricing CTA | "Testar 14 dias grátis" |
| Social | "Pare de gerenciar tarefas. Gerencie resultados." |
| Status update | "Progresso visível. Reuniões dispensáveis." |

---

## Anti-slop — O Que Nunca Fazer

| Regra | Errado | Correto |
|-------|--------|---------|
| Purple é MUTED | Roxo vibrante `#7C3AED`, neon, gradientes chamativos | `#8B8BF5` com opacidade para variações |
| Background warm-dark | Preto puro `#000000`, cinza frio `#111111` | `#0C0C10` (sempre) |
| Hierarquia via opacidade | Cinco cores de texto diferentes | `#EDEDF0`, `#B5B5BA`, `#7C7C8A` (trio fixo) |
| Sombras escuras | `rgba(0,0,0,0.1)` (some no dark theme) | `rgba(0,0,0,0.4)` mínimo |
| Satoshi obrigatória | Inter, Poppins, Geist, system-ui sozinho | Satoshi via Fontshare CDN |
| Minimalista | Bordas decorativas, gradientes coloridos, ícones preenchidos | Menos elementos, mais espaço, linhas finas |
| Nunca branco puro | `#FFFFFF` para texto | `#EDEDF0` (off-white quente) |
| Bordas sutis | `border: 2px solid #8B8BF5` | `border: 1px solid #232330` |
| Raios consistentes | Mix de 4px, 8px, 16px, 24px aleatórios | `8px` padrão, `12px` cards, `9999px` pills |
| Animações discretas | Bounce, slide, fade longo | `200ms cubic-bezier(0.25, 0.1, 0.25, 1)` |

---

## Referência Rápida de Tokens

```
Background:       #0C0C10
Surface:          #16161C
Surface elevated: #232330
Border:           #232330
Border hover:     #3A3A44
Text:             #EDEDF0
Text secondary:   #B5B5BA
Text muted:       #7C7C8A
Primary:          #8B8BF5
Primary hover:    #A5A5F7
Accent:           #6E6E96
Success:          #34D399
Warning:          #FBBF24
Error:            #F87171

Font:             Satoshi (400, 500, 600, 700)
Font CDN:         https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap
Radius default:   8px
Radius card:      12px
Radius pill:      9999px
Shadow base:      rgba(0,0,0,0.4)
Animation:        200ms cubic-bezier(0.25, 0.1, 0.25, 1)
```
