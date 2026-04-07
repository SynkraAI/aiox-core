# Minimal Sand — Guia Prático

> Ultra-clean editorial com tons quentes de pedra. Para editorial, blog, portfólio, escritores.

---

## Visão Geral

Minimal Sand é uma identidade visual editorial premium inspirada em revistas de alto padrão. A paleta warm-stone transmite sofisticação silenciosa — o tipo de design que respira, que dá espaço para o conteúdo brilhar.

**Tema:** Light | Tons quentes de areia e pedra — intencionalmente quieto
**Ideal para:** Editorial, blog, portfólio, marcas minimalistas, escritores
**Fonte de inspiração:** Estética de revistas e editoriais premium

### Tokens Rápidos

| Token | Valor |
|-------|-------|
| Background | `#FAF9F6` |
| Texto principal | `#44403C` |
| Texto secundário | `#57534E` |
| Texto muted | `#A8A29E` |
| Superfície | `#FFFFFF` |
| Borda | `#E7E5E4` |
| Accent (amber) | `#D97706` |
| Heading font | Libre Baskerville |
| Body font | Source Sans 3 |
| Body size | 17px / line-height 1.8 |
| Border radius padrão | 4px |
| Seção padding | 96px |

---

## Tipografia — Regras de Uso

### Famílias

| Uso | Família | Fallback |
|-----|---------|----------|
| Headings / Display | **Libre Baskerville** (serif) | Georgia, 'Times New Roman', serif |
| Body / UI | **Source Sans 3** (sans-serif) | system-ui, sans-serif |
| Código | **Source Code Pro** (mono) | monospace |

**CDN (Google Fonts):**
```
https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&family=Source+Code+Pro:wght@400;500&display=swap
```

### Escala Tipográfica

| Nível | Tamanho | Peso | Line-height | Letter-spacing | Família |
|-------|---------|------|-------------|----------------|---------|
| H1 | 44px | 700 | 1.2 | -0.01em | Libre Baskerville |
| H2 | 32px | 700 | 1.3 | — | Libre Baskerville |
| H3 | 24px | 700 | 1.35 | — | Libre Baskerville |
| H4 | 20px | 600 | 1.4 | — | Libre Baskerville |
| Body | 17px | 400 | 1.8 | — | Source Sans 3 |
| Body SM | 15px | 400 | 1.7 | — | Source Sans 3 |
| Caption | 13px | 400 | 1.5 | — | Source Sans 3 |
| Label | 11px | 600 | 1.4 | 0.08em | Source Sans 3 (UPPERCASE) |

### Regras

- Libre Baskerville **SOMENTE** em headings e destaques — body **SEMPRE** Source Sans 3
- Body text **obrigatoriamente** 17px com line-height 1.8 para leiturabilidade máxima
- Labels sempre uppercase com letter-spacing 0.08em
- Nunca usar Libre Baskerville abaixo de 20px — perde legibilidade

---

## Cores — Regras de Uso

### Paleta Completa (Stone)

| Nome | Hex | Uso |
|------|-----|-----|
| Stone 50 | `#FAF9F6` | Background principal |
| Stone 100 | `#F5F3EF` | Background alternativo |
| Stone 200 | `#E7E5E4` | Bordas, divisores |
| Stone 300 | `#D6D3D1` | Bordas hover |
| Stone 400 | `#A8A29E` | Texto muted |
| Stone 500 | `#78716C` | Ícones inativos |
| Stone 600 | `#57534E` | Texto secundário |
| Stone 700 | `#44403C` | Texto principal, botão primário |
| Stone 800 | `#292524` | Hover do primário |
| Stone 900 | `#1C1917` | Texto extra-bold (raro) |
| Stone 950 | `#0C0A09` | Reservado |

### Semânticas

| Função | Hex | Quando usar |
|--------|-----|-------------|
| Accent | `#D97706` | Links, destaques, CTAs secundários — **nunca dominante** |
| Accent hover | `#B45309` | Hover em elementos accent |
| Success | `#0F7B6C` | Confirmações, badges positivos |
| Warning | `#D97706` | Alertas (mesmo amber do accent) |
| Error | `#DC2626` | Erros, validações |
| Info | `#2563EB` | Informações neutras |

### Regras

- Accent amber/gold **SOMENTE** em links e destaques pontuais — nunca como cor dominante
- Paleta warm-stone: **NUNCA** usar cinzas puros (blue-gray, cool-gray)
- Sombras com base rgba(68,64,60) — mesma família stone, nunca preto puro
- Background sempre `#FAF9F6`, nunca `#FFFFFF` para a página (branco puro só em cards)

---

## Landing Pages

### Hero

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#FAF9F6; color:#44403C; font-family:'Source Sans 3',system-ui,sans-serif;">

<section style="padding:120px 24px 96px; max-width:800px; margin:0 auto; text-align:center;">
  <p style="font-family:'Source Sans 3',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#A8A29E; margin:0 0 24px;">Editorial Premium</p>
  <h1 style="font-family:'Libre Baskerville',Georgia,serif; font-size:44px; font-weight:700; line-height:1.2; letter-spacing:-0.01em; color:#44403C; margin:0 0 24px;">Histórias que importam,<br>contadas com intenção</h1>
  <p style="font-family:'Source Sans 3',sans-serif; font-size:17px; font-weight:400; line-height:1.8; color:#57534E; margin:0 0 40px; max-width:600px; margin-left:auto; margin-right:auto;">Cada palavra ocupa o lugar certo. Cada pausa tem propósito. Aqui, o conteúdo respira — e o leitor sente a diferença.</p>
  <div style="display:flex; gap:16px; justify-content:center; flex-wrap:wrap;">
    <a href="#" style="display:inline-block; background:#44403C; color:#FAF9F6; font-family:'Source Sans 3',sans-serif; font-size:15px; font-weight:600; padding:12px 24px; border-radius:4px; text-decoration:none;">Comece a ler</a>
    <a href="#" style="display:inline-block; background:transparent; color:#44403C; font-family:'Source Sans 3',sans-serif; font-size:15px; font-weight:500; padding:12px 24px; border-radius:4px; text-decoration:none; border:1px solid #D6D3D1;">Conheça o projeto</a>
  </div>
</section>

</body>
</html>
```

### Features

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#FAF9F6; color:#44403C; font-family:'Source Sans 3',system-ui,sans-serif;">

<section style="padding:96px 24px; max-width:1080px; margin:0 auto;">
  <div style="text-align:center; margin-bottom:64px;">
    <p style="font-family:'Source Sans 3',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#D97706; margin:0 0 16px;">Por que escolher</p>
    <h2 style="font-family:'Libre Baskerville',Georgia,serif; font-size:32px; font-weight:700; line-height:1.3; color:#44403C; margin:0 0 16px;">O poder da palavra certa</h2>
    <p style="font-family:'Source Sans 3',sans-serif; font-size:17px; line-height:1.8; color:#57534E; max-width:560px; margin:0 auto;">Ferramentas pensadas para quem escreve com propósito e quer que cada texto alcance o leitor certo.</p>
  </div>
  <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:32px;">
    <div style="background:#FFFFFF; border:1px solid #E7E5E4; border-radius:8px; padding:32px;">
      <div style="width:40px; height:40px; background:#FAF9F6; border:1px solid #E7E5E4; border-radius:4px; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
        <span style="font-size:18px; color:#D97706;">&#9998;</span>
      </div>
      <h3 style="font-family:'Libre Baskerville',Georgia,serif; font-size:20px; font-weight:700; line-height:1.4; color:#44403C; margin:0 0 12px;">Editor focado</h3>
      <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; line-height:1.7; color:#57534E; margin:0;">Sem distrações, sem ruído visual. Apenas você e o texto — do jeito que deveria ser.</p>
    </div>
    <div style="background:#FFFFFF; border:1px solid #E7E5E4; border-radius:8px; padding:32px;">
      <div style="width:40px; height:40px; background:#FAF9F6; border:1px solid #E7E5E4; border-radius:4px; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
        <span style="font-size:18px; color:#D97706;">&#9733;</span>
      </div>
      <h3 style="font-family:'Libre Baskerville',Georgia,serif; font-size:20px; font-weight:700; line-height:1.4; color:#44403C; margin:0 0 12px;">Tipografia editorial</h3>
      <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; line-height:1.7; color:#57534E; margin:0;">Cada heading, cada parágrafo respeita uma hierarquia visual que guia o olhar naturalmente.</p>
    </div>
    <div style="background:#FFFFFF; border:1px solid #E7E5E4; border-radius:8px; padding:32px;">
      <div style="width:40px; height:40px; background:#FAF9F6; border:1px solid #E7E5E4; border-radius:4px; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
        <span style="font-size:18px; color:#D97706;">&#9830;</span>
      </div>
      <h3 style="font-family:'Libre Baskerville',Georgia,serif; font-size:20px; font-weight:700; line-height:1.4; color:#44403C; margin:0 0 12px;">Paleta que acalma</h3>
      <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; line-height:1.7; color:#57534E; margin:0;">Tons de pedra e areia que reduzem a fadiga visual e convidam o leitor a ficar mais tempo.</p>
    </div>
  </div>
</section>

</body>
</html>
```

### Stats

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#FAF9F6; color:#44403C; font-family:'Source Sans 3',system-ui,sans-serif;">

<section style="padding:96px 24px; background:#FFFFFF; border-top:1px solid #E7E5E4; border-bottom:1px solid #E7E5E4;">
  <div style="max-width:960px; margin:0 auto; display:grid; grid-template-columns:repeat(4,1fr); gap:32px; text-align:center;">
    <div>
      <p style="font-family:'Libre Baskerville',Georgia,serif; font-size:44px; font-weight:700; line-height:1.2; letter-spacing:-0.01em; color:#44403C; margin:0 0 8px;">2.4M</p>
      <p style="font-family:'Source Sans 3',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#A8A29E; margin:0;">Leitores mensais</p>
    </div>
    <div>
      <p style="font-family:'Libre Baskerville',Georgia,serif; font-size:44px; font-weight:700; line-height:1.2; letter-spacing:-0.01em; color:#44403C; margin:0 0 8px;">847</p>
      <p style="font-family:'Source Sans 3',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#A8A29E; margin:0;">Artigos publicados</p>
    </div>
    <div>
      <p style="font-family:'Libre Baskerville',Georgia,serif; font-size:44px; font-weight:700; line-height:1.2; letter-spacing:-0.01em; color:#D97706; margin:0 0 8px;">12min</p>
      <p style="font-family:'Source Sans 3',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#A8A29E; margin:0;">Tempo médio de leitura</p>
    </div>
    <div>
      <p style="font-family:'Libre Baskerville',Georgia,serif; font-size:44px; font-weight:700; line-height:1.2; letter-spacing:-0.01em; color:#44403C; margin:0 0 8px;">98%</p>
      <p style="font-family:'Source Sans 3',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#A8A29E; margin:0;">Taxa de satisfação</p>
    </div>
  </div>
</section>

</body>
</html>
```

### CTA

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#FAF9F6; color:#44403C; font-family:'Source Sans 3',system-ui,sans-serif;">

<section style="padding:96px 24px; max-width:720px; margin:0 auto; text-align:center;">
  <p style="font-family:'Source Sans 3',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#D97706; margin:0 0 16px;">Próximo passo</p>
  <h2 style="font-family:'Libre Baskerville',Georgia,serif; font-size:32px; font-weight:700; line-height:1.3; color:#44403C; margin:0 0 16px;">Pronto para escrever<br>algo que importa?</h2>
  <p style="font-family:'Source Sans 3',sans-serif; font-size:17px; line-height:1.8; color:#57534E; margin:0 0 40px;">Junte-se a milhares de escritores que escolheram clareza em vez de ruído. Sem compromisso, sem cartão de crédito.</p>
  <a href="#" style="display:inline-block; background:#44403C; color:#FAF9F6; font-family:'Source Sans 3',sans-serif; font-size:15px; font-weight:600; padding:12px 24px; border-radius:4px; text-decoration:none;">Começar gratuitamente</a>
  <p style="font-family:'Source Sans 3',sans-serif; font-size:13px; line-height:1.5; color:#A8A29E; margin:16px 0 0;">Cancele quando quiser. Seus textos são sempre seus.</p>
</section>

</body>
</html>
```

### Pricing

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#FAF9F6; color:#44403C; font-family:'Source Sans 3',system-ui,sans-serif;">

<section style="padding:96px 24px; max-width:1080px; margin:0 auto;">
  <div style="text-align:center; margin-bottom:64px;">
    <p style="font-family:'Source Sans 3',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#D97706; margin:0 0 16px;">Planos</p>
    <h2 style="font-family:'Libre Baskerville',Georgia,serif; font-size:32px; font-weight:700; line-height:1.3; color:#44403C; margin:0 0 16px;">Escolha o espaço certo para suas palavras</h2>
    <p style="font-family:'Source Sans 3',sans-serif; font-size:17px; line-height:1.8; color:#57534E; max-width:520px; margin:0 auto;">Todos os planos incluem editor completo, tipografia editorial e exportação profissional.</p>
  </div>
  <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:32px; align-items:start;">
    <!-- Plano Leitor -->
    <div style="background:#FFFFFF; border:1px solid #E7E5E4; border-radius:8px; padding:32px;">
      <p style="font-family:'Source Sans 3',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#A8A29E; margin:0 0 8px;">Leitor</p>
      <p style="font-family:'Libre Baskerville',Georgia,serif; font-size:32px; font-weight:700; color:#44403C; margin:0;">Grátis</p>
      <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; margin:8px 0 24px; line-height:1.7;">Para quem quer consumir conteúdo de qualidade.</p>
      <div style="border-top:1px solid #E7E5E4; padding-top:24px;">
        <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; margin:0 0 12px; line-height:1.7;">&#10003; &nbsp;Acesso a todos os artigos</p>
        <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; margin:0 0 12px; line-height:1.7;">&#10003; &nbsp;Newsletter semanal</p>
        <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; margin:0 0 12px; line-height:1.7;">&#10003; &nbsp;Modo leitura limpo</p>
      </div>
      <a href="#" style="display:block; text-align:center; background:transparent; color:#44403C; font-family:'Source Sans 3',sans-serif; font-size:15px; font-weight:500; padding:12px 24px; border-radius:4px; text-decoration:none; border:1px solid #D6D3D1; margin-top:24px;">Criar conta</a>
    </div>
    <!-- Plano Escritor (destaque) -->
    <div style="background:#FFFFFF; border:2px solid #44403C; border-radius:8px; padding:32px; position:relative;">
      <div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#44403C; color:#FAF9F6; font-family:'Source Sans 3',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; padding:4px 12px; border-radius:2px;">Popular</div>
      <p style="font-family:'Source Sans 3',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#D97706; margin:0 0 8px;">Escritor</p>
      <p style="margin:0;"><span style="font-family:'Libre Baskerville',Georgia,serif; font-size:32px; font-weight:700; color:#44403C;">R$29</span><span style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#A8A29E;">/mês</span></p>
      <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; margin:8px 0 24px; line-height:1.7;">Para quem escreve e publica regularmente.</p>
      <div style="border-top:1px solid #E7E5E4; padding-top:24px;">
        <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; margin:0 0 12px; line-height:1.7;">&#10003; &nbsp;Tudo do plano Leitor</p>
        <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; margin:0 0 12px; line-height:1.7;">&#10003; &nbsp;Editor completo com markdown</p>
        <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; margin:0 0 12px; line-height:1.7;">&#10003; &nbsp;Publicação ilimitada</p>
        <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; margin:0 0 12px; line-height:1.7;">&#10003; &nbsp;Analytics de leitura</p>
      </div>
      <a href="#" style="display:block; text-align:center; background:#44403C; color:#FAF9F6; font-family:'Source Sans 3',sans-serif; font-size:15px; font-weight:600; padding:12px 24px; border-radius:4px; text-decoration:none; margin-top:24px;">Começar agora</a>
    </div>
    <!-- Plano Publicação -->
    <div style="background:#FFFFFF; border:1px solid #E7E5E4; border-radius:8px; padding:32px;">
      <p style="font-family:'Source Sans 3',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#A8A29E; margin:0 0 8px;">Publicação</p>
      <p style="margin:0;"><span style="font-family:'Libre Baskerville',Georgia,serif; font-size:32px; font-weight:700; color:#44403C;">R$79</span><span style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#A8A29E;">/mês</span></p>
      <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; margin:8px 0 24px; line-height:1.7;">Para equipes e publicações profissionais.</p>
      <div style="border-top:1px solid #E7E5E4; padding-top:24px;">
        <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; margin:0 0 12px; line-height:1.7;">&#10003; &nbsp;Tudo do plano Escritor</p>
        <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; margin:0 0 12px; line-height:1.7;">&#10003; &nbsp;Domínio personalizado</p>
        <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; margin:0 0 12px; line-height:1.7;">&#10003; &nbsp;Equipe com até 10 editores</p>
        <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; margin:0 0 12px; line-height:1.7;">&#10003; &nbsp;Monetização integrada</p>
      </div>
      <a href="#" style="display:block; text-align:center; background:transparent; color:#44403C; font-family:'Source Sans 3',sans-serif; font-size:15px; font-weight:500; padding:12px 24px; border-radius:4px; text-decoration:none; border:1px solid #D6D3D1; margin-top:24px;">Falar com equipe</a>
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
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#FAF9F6; color:#44403C; font-family:'Source Sans 3',system-ui,sans-serif;">

<footer style="padding:64px 24px 40px; border-top:1px solid #E7E5E4; max-width:1080px; margin:0 auto;">
  <div style="display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:40px; margin-bottom:48px;">
    <div>
      <p style="font-family:'Libre Baskerville',Georgia,serif; font-size:20px; font-weight:700; color:#44403C; margin:0 0 12px;">Minimal Sand</p>
      <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; line-height:1.7; color:#57534E; margin:0; max-width:280px;">Plataforma editorial para quem acredita que boas histórias merecem espaço para respirar.</p>
    </div>
    <div>
      <p style="font-family:'Source Sans 3',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#A8A29E; margin:0 0 16px;">Produto</p>
      <p style="margin:0 0 10px;"><a href="#" style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; text-decoration:none;">Editor</a></p>
      <p style="margin:0 0 10px;"><a href="#" style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; text-decoration:none;">Publicação</a></p>
      <p style="margin:0 0 10px;"><a href="#" style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; text-decoration:none;">Analytics</a></p>
    </div>
    <div>
      <p style="font-family:'Source Sans 3',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#A8A29E; margin:0 0 16px;">Conteúdo</p>
      <p style="margin:0 0 10px;"><a href="#" style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; text-decoration:none;">Blog</a></p>
      <p style="margin:0 0 10px;"><a href="#" style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; text-decoration:none;">Guias</a></p>
      <p style="margin:0 0 10px;"><a href="#" style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; text-decoration:none;">Changelog</a></p>
    </div>
    <div>
      <p style="font-family:'Source Sans 3',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#A8A29E; margin:0 0 16px;">Legal</p>
      <p style="margin:0 0 10px;"><a href="#" style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; text-decoration:none;">Privacidade</a></p>
      <p style="margin:0 0 10px;"><a href="#" style="font-family:'Source Sans 3',sans-serif; font-size:15px; color:#57534E; text-decoration:none;">Termos</a></p>
    </div>
  </div>
  <div style="border-top:1px solid #E7E5E4; padding-top:24px; display:flex; justify-content:space-between; align-items:center;">
    <p style="font-family:'Source Sans 3',sans-serif; font-size:13px; color:#A8A29E; margin:0;">&copy; 2026 Minimal Sand. Todos os direitos reservados.</p>
    <div style="display:flex; gap:20px;">
      <a href="#" style="font-family:'Source Sans 3',sans-serif; font-size:13px; color:#A8A29E; text-decoration:none;">Twitter</a>
      <a href="#" style="font-family:'Source Sans 3',sans-serif; font-size:13px; color:#A8A29E; text-decoration:none;">Instagram</a>
      <a href="#" style="font-family:'Source Sans 3',sans-serif; font-size:13px; color:#A8A29E; text-decoration:none;">LinkedIn</a>
    </div>
  </div>
</footer>

</body>
</html>
```

---

## Instagram

### Carrossel (1080 x 1350px)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#FAF9F6;">

<!-- Slide 1: Capa -->
<div style="width:1080px; height:1350px; background:#FAF9F6; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px; box-sizing:border-box; position:relative;">
  <div style="position:absolute; top:60px; left:80px;">
    <p style="font-family:'Source Sans 3',sans-serif; font-size:14px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#A8A29E; margin:0;">Minimal Sand</p>
  </div>
  <p style="font-family:'Source Sans 3',sans-serif; font-size:14px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#D97706; margin:0 0 32px;">Escrita com intenção</p>
  <h1 style="font-family:'Libre Baskerville',Georgia,serif; font-size:56px; font-weight:700; line-height:1.2; letter-spacing:-0.01em; color:#44403C; margin:0 0 32px; text-align:center;">5 princípios<br>da escrita<br>que conecta</h1>
  <p style="font-family:'Source Sans 3',sans-serif; font-size:22px; line-height:1.7; color:#57534E; margin:0; text-align:center; max-width:700px;">O que separa um texto esquecível de um que marca o leitor para sempre.</p>
  <div style="position:absolute; bottom:60px; right:80px;">
    <p style="font-family:'Source Sans 3',sans-serif; font-size:16px; color:#A8A29E; margin:0;">Deslize &rarr;</p>
  </div>
</div>

<!-- Slide 2: Conteúdo -->
<div style="width:1080px; height:1350px; background:#FFFFFF; display:flex; flex-direction:column; justify-content:center; padding:80px; box-sizing:border-box;">
  <div style="width:48px; height:48px; background:#FAF9F6; border:1px solid #E7E5E4; border-radius:4px; display:flex; align-items:center; justify-content:center; margin-bottom:32px;">
    <span style="font-family:'Libre Baskerville',Georgia,serif; font-size:24px; font-weight:700; color:#D97706;">1</span>
  </div>
  <h2 style="font-family:'Libre Baskerville',Georgia,serif; font-size:40px; font-weight:700; line-height:1.3; color:#44403C; margin:0 0 24px;">Clareza antes<br>de elegância</h2>
  <p style="font-family:'Source Sans 3',sans-serif; font-size:22px; line-height:1.8; color:#57534E; margin:0; max-width:800px;">Se o leitor precisa reler para entender, você não escreveu com clareza — escreveu para impressionar. E impressionar sem comunicar é só barulho bonito.</p>
  <div style="width:64px; height:2px; background:#D97706; margin-top:40px;"></div>
</div>

<!-- Slide 3: CTA final -->
<div style="width:1080px; height:1350px; background:#FAF9F6; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px; box-sizing:border-box; text-align:center;">
  <p style="font-family:'Source Sans 3',sans-serif; font-size:14px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#D97706; margin:0 0 32px;">Salve para revisitar</p>
  <h2 style="font-family:'Libre Baskerville',Georgia,serif; font-size:48px; font-weight:700; line-height:1.25; color:#44403C; margin:0 0 32px;">Escrever bem<br>é pensar bem</h2>
  <p style="font-family:'Source Sans 3',sans-serif; font-size:22px; line-height:1.7; color:#57534E; margin:0 0 48px; max-width:700px;">Se este conteúdo fez sentido, compartilhe com alguém que também acredita no poder da palavra certa.</p>
  <div style="display:inline-block; background:#44403C; color:#FAF9F6; font-family:'Source Sans 3',sans-serif; font-size:18px; font-weight:600; padding:16px 32px; border-radius:4px;">@minimalsand</div>
</div>

</body>
</html>
```

### Post Quadrado (1080 x 1080px)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#FAF9F6;">

<div style="width:1080px; height:1080px; background:#FAF9F6; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px; box-sizing:border-box; position:relative; text-align:center;">
  <div style="position:absolute; top:60px; left:80px;">
    <p style="font-family:'Source Sans 3',sans-serif; font-size:14px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#A8A29E; margin:0;">Minimal Sand</p>
  </div>
  <div style="width:64px; height:2px; background:#D97706; margin-bottom:40px;"></div>
  <h1 style="font-family:'Libre Baskerville',Georgia,serif; font-size:48px; font-weight:700; line-height:1.25; letter-spacing:-0.01em; color:#44403C; margin:0 0 24px;">A melhor<br>revisão é<br>deletar</h1>
  <p style="font-family:'Source Sans 3',sans-serif; font-size:20px; line-height:1.7; color:#57534E; margin:0; max-width:700px;">Quando cada palavra carrega peso, o texto inteiro fica mais leve para quem lê.</p>
  <div style="position:absolute; bottom:60px;">
    <p style="font-family:'Source Sans 3',sans-serif; font-size:14px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#D97706; margin:0;">Escrita com intenção</p>
  </div>
</div>

</body>
</html>
```

### Stories (1080 x 1920px)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#FAF9F6;">

<div style="width:1080px; height:1920px; background:#FAF9F6; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:100px 80px; box-sizing:border-box; text-align:center; position:relative;">
  <div style="position:absolute; top:80px;">
    <p style="font-family:'Source Sans 3',sans-serif; font-size:14px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#A8A29E; margin:0;">Minimal Sand</p>
  </div>
  <p style="font-family:'Source Sans 3',sans-serif; font-size:14px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#D97706; margin:0 0 40px;">Novo artigo</p>
  <h1 style="font-family:'Libre Baskerville',Georgia,serif; font-size:56px; font-weight:700; line-height:1.2; letter-spacing:-0.01em; color:#44403C; margin:0 0 32px;">Histórias<br>que importam</h1>
  <p style="font-family:'Source Sans 3',sans-serif; font-size:22px; line-height:1.8; color:#57534E; margin:0 0 48px; max-width:700px;">Como transformar experiências cotidianas em narrativas que prendem o leitor do início ao fim.</p>
  <div style="display:inline-block; background:#44403C; color:#FAF9F6; font-family:'Source Sans 3',sans-serif; font-size:18px; font-weight:600; padding:16px 32px; border-radius:4px;">Ler agora</div>
  <div style="position:absolute; bottom:100px;">
    <div style="width:48px; height:2px; background:#D97706; margin:0 auto 16px;"></div>
    <p style="font-family:'Source Sans 3',sans-serif; font-size:16px; color:#A8A29E; margin:0;">Deslize para cima</p>
  </div>
</div>

</body>
</html>
```

---

## YouTube

### Thumbnail (1280 x 720px)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#FAF9F6;">

<div style="width:1280px; height:720px; background:#FAF9F6; display:flex; align-items:center; padding:60px 80px; box-sizing:border-box; position:relative;">
  <div style="flex:1;">
    <p style="font-family:'Source Sans 3',sans-serif; font-size:14px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#D97706; margin:0 0 16px;">Episódio 47</p>
    <h1 style="font-family:'Libre Baskerville',Georgia,serif; font-size:52px; font-weight:700; line-height:1.2; letter-spacing:-0.01em; color:#44403C; margin:0 0 20px;">O segredo da<br>primeira frase</h1>
    <p style="font-family:'Source Sans 3',sans-serif; font-size:20px; line-height:1.6; color:#57534E; margin:0; max-width:500px;">Como prender a atenção antes do leitor pensar em sair.</p>
  </div>
  <div style="width:280px; height:280px; background:#FFFFFF; border:1px solid #E7E5E4; border-radius:8px; display:flex; align-items:center; justify-content:center;">
    <span style="font-family:'Libre Baskerville',Georgia,serif; font-size:120px; font-weight:700; color:#D97706; opacity:0.3;">&#8220;</span>
  </div>
  <div style="position:absolute; bottom:40px; left:80px;">
    <p style="font-family:'Source Sans 3',sans-serif; font-size:13px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#A8A29E; margin:0;">Minimal Sand &bull; Escrita com intenção</p>
  </div>
</div>

</body>
</html>
```

### Banner (2560 x 1440px)

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0; padding:0; background:#FAF9F6;">

<div style="width:2560px; height:1440px; background:#FAF9F6; display:flex; align-items:center; justify-content:center; position:relative; box-sizing:border-box;">
  <!-- Área segura central (1546x423 para TV/desktop) -->
  <div style="text-align:center;">
    <div style="width:80px; height:2px; background:#D97706; margin:0 auto 40px;"></div>
    <h1 style="font-family:'Libre Baskerville',Georgia,serif; font-size:72px; font-weight:700; line-height:1.2; letter-spacing:-0.01em; color:#44403C; margin:0 0 24px;">Minimal Sand</h1>
    <p style="font-family:'Source Sans 3',sans-serif; font-size:28px; font-weight:400; line-height:1.6; color:#57534E; margin:0 0 16px;">Escrita com intenção. Histórias que importam.</p>
    <p style="font-family:'Source Sans 3',sans-serif; font-size:16px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#A8A29E; margin:0;">Novos artigos toda semana</p>
  </div>
  <!-- Detalhes decorativos -->
  <div style="position:absolute; top:50%; left:120px; transform:translateY(-50%); width:1px; height:200px; background:#E7E5E4;"></div>
  <div style="position:absolute; top:50%; right:120px; transform:translateY(-50%); width:1px; height:200px; background:#E7E5E4;"></div>
</div>

</body>
</html>
```

---

## Fotografia — Diretrizes

### Estilo Visual

- **Tons quentes:** fotografias devem complementar a paleta stone — tons terrosos, areia, bege, marrom claro
- **Iluminação natural:** luz suave, difusa, sem flash direto. Hora dourada preferencial
- **Composição limpa:** espaço negativo generoso, poucos elementos por quadro
- **Texturas:** papel, linho, madeira crua, pedra, cerâmica — materiais naturais e táteis
- **Nunca:** cores saturadas demais, filtros frios (azul/cinza), cenários artificiais/plásticos

### Tratamento

- Reduzir saturação levemente (vibrance -10 a -20)
- Highlights quentes (tom areia/âmbar)
- Sombras suaves (nunca pretas 100%)
- Contraste moderado-baixo — editorial é suave, não dramático
- Grain sutil (3-5%) para textura analógica

### Overlay CSS (quando necessário)

```css
/* Overlay warm para unificar fotos com a paleta */
.photo-overlay {
  position: relative;
}
.photo-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(120,113,108,0.04),
    rgba(217,119,6,0.03)
  );
  pointer-events: none;
}
```

---

## Componentes — Referência Rápida

### Botão Primário

```html
<a href="#" style="display:inline-block; background:#44403C; color:#FAF9F6; font-family:'Source Sans 3',sans-serif; font-size:15px; font-weight:600; padding:12px 24px; border-radius:4px; text-decoration:none;">Texto do botão</a>
```

### Botão Secundário

```html
<a href="#" style="display:inline-block; background:transparent; color:#44403C; font-family:'Source Sans 3',sans-serif; font-size:15px; font-weight:500; padding:12px 24px; border-radius:4px; text-decoration:none; border:1px solid #D6D3D1;">Texto do botão</a>
```

### Card

```html
<div style="background:#FFFFFF; border:1px solid #E7E5E4; border-radius:8px; padding:32px;">
  <h3 style="font-family:'Libre Baskerville',Georgia,serif; font-size:20px; font-weight:700; line-height:1.4; color:#44403C; margin:0 0 12px;">Título do card</h3>
  <p style="font-family:'Source Sans 3',sans-serif; font-size:15px; line-height:1.7; color:#57534E; margin:0;">Descrição do card com texto editorial claro e objetivo.</p>
</div>
```

### Input

```html
<input type="text" placeholder="Seu melhor e-mail" style="width:100%; background:#FFFFFF; border:1px solid #E7E5E4; color:#44403C; font-family:'Source Sans 3',sans-serif; font-size:15px; padding:12px 16px; border-radius:4px; box-sizing:border-box; outline:none;">
```

### Label / Tag

```html
<span style="font-family:'Source Sans 3',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#D97706;">Destaque</span>
```

### Divider

```html
<div style="width:64px; height:2px; background:#D97706;"></div>
```

### Badge

```html
<span style="display:inline-block; background:#44403C; color:#FAF9F6; font-family:'Source Sans 3',sans-serif; font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; padding:4px 12px; border-radius:2px;">Popular</span>
```

---

## Tom de Voz

### Personalidade

| Atributo | Descrição |
|----------|-----------|
| Tom | Calmo, intencional, confiante sem arrogância |
| Registro | Culto mas acessível — como um ensaísta que escreve para todos |
| Ritmo | Frases curtas intercaladas com longas. Pausas estratégicas |
| Pessoa | 1a pessoa do plural (nós) ou 2a pessoa (você) — nunca impessoal |

### Vocabulário Preferencial

| Usar | Evitar |
|------|--------|
| Histórias que importam | Conteúdo viral |
| Escrita com intenção | Hack de produtividade |
| Clareza | Simplificação |
| O poder da palavra certa | A fórmula secreta |
| Narrativa que conecta | Storytelling disruptivo |
| Espaço para respirar | Minimalismo radical |

### Exemplos de Copy

**Headlines:**
- "Histórias que importam, contadas com intenção"
- "O poder da palavra certa"
- "Escrever bem é pensar bem"
- "Cada pausa tem propósito"
- "Pronto para escrever algo que importa?"

**Subtítulos:**
- "Cada palavra ocupa o lugar certo. Cada pausa tem propósito."
- "Aqui, o conteúdo respira — e o leitor sente a diferença."
- "O que separa um texto esquecível de um que marca o leitor para sempre."

**Microcopy:**
- "Cancele quando quiser. Seus textos são sempre seus."
- "Sem compromisso, sem cartão de crédito."
- "Novos artigos toda semana."

---

## Anti-Slop — O Que NUNCA Fazer

Regras inegociáveis para manter a integridade visual do Minimal Sand:

| Regra | Motivo |
|-------|--------|
| ZERO hover scale (transform: scale) | Editorial é estático, sóbrio — animação quebra a seriedade |
| Body text SEMPRE 17px, line-height 1.8 | Leiturabilidade é inegociável nessa marca |
| Libre Baskerville SOMENTE em headings | Em body text, serif nesse tamanho cansa o olho |
| Accent amber SOMENTE em links e destaques pontuais | Amber dominante vira fast food, não editorial |
| Sombras com opacity máx 0.14 | Sombras fortes gritam — editorial sussurra |
| Espaçamento LUXUOSO (96px entre seções) | O respiro entre blocos é tão importante quanto o conteúdo |
| Radii MÍNIMOS (2-4px, máx 8px em cards) | Editorial é sharp, não friendly/cute |
| NUNCA cinzas puros (blue-gray, cool-gray) | A paleta é warm-stone — cinza frio destrói a identidade |
| NUNCA gradientes coloridos ou neon | A sofisticação vem da restrição, não da exuberância |
| NUNCA fontes alternativas (Poppins, Inter, etc.) | Libre Baskerville + Source Sans 3 são a identidade — trocar é matar a marca |
| NUNCA bordas grossas (> 2px, exceto destaque intencional) | Bordas finas de 1px são o padrão — qualquer coisa acima é peso visual |
| NUNCA texto centralizado em parágrafos longos | Parágrafos são alinhados à esquerda — centro só para headings e labels curtas |

---

*Minimal Sand v2 — Ultra-clean editorial with warm stone tones*
