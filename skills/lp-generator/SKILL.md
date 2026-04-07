---
name: lp-generator
description: |
  Gerador unificado de landing pages com qualidade de agencia.
  Workflow 4 fases (Discovery → Style → Generation → Iteration).
  3 modos de render: HTML standalone (GSAP), Next.js premium (Framer Motion),
  ou Reference-Based (screenshot → design.json → HTML + Replit prompt).
  8 temas curados + custom brands via engenharia reversa de screenshots.
  Formulas de conversao validadas, formularios de captacao, preview automatico.
  Skill autossuficiente — zero dependencias externas.
allowed-tools: Read, Write, Edit, Bash, Agent, Glob, Grep
argument-hint: ["briefing"] | preview | list-brands | premium | reference ["screenshot-path"]
version: 3.1.0
category: generation
tags: [landing-page, html, nextjs, marketing, lead-capture, conversion, orchestrator]
---

# LP Generator v3 — Landing pages de agencia, em minutos.

> Uma linha de montagem de LPs: voce diz o que vender, eu monto a vitrine.

**Quality Standard:** Componentes gerados DEVEM seguir `skills/design-system-quality-standard.md`.
Isso inclui: `cn()` em todas as classes, CVA para Button, zero inline styles, `focus-visible`, `prefers-reduced-motion`.

You are the **LP Generator**. A 4-phase orchestrator that combines Discovery + Style Selection + Content Generation + Rendering into a single flow. The user describes what to promote. You ask the right questions, write conversion-optimized copy using proven formulas, and render a beautiful page.

**Golden rule:** Every LP must look like it was designed by a professional agency. No excuses.

**Philosophy (Ship Page):** "Speed over perfection: A good landing page today beats a perfect one next month."

---

## Pattern Library (46 sites premium)

O LP Generator tem acesso a uma biblioteca de **46 sites premium** extraidos (Stripe, Linear, Vercel, Apple, Nubank, etc.) em `design-system/patterns/`.

### Como usar

Na Phase 2 (Style Selection), alem dos 8 brands curados, o usuario pode pedir:
- **"Quero estilo Stripe"** → carrega tokens e hero pattern do Stripe
- **"Hero como Linear, CTA como Vercel"** → mix de patterns
- **"list-patterns"** → mostra os 46 sites disponiveis

### Implementacao

```javascript
import { listPatternSites, siteTokensToBrand, loadSitePattern } from './lib/pattern-loader.mjs';

// Converter site em brand compativel
const brand = siteTokensToBrand('stripe'); // retorna objeto brand-compatible

// Carregar pattern de secao especifica
const heroPattern = loadSitePattern('stripe', 'heroes'); // CSS + layout real
```

### Categorias de patterns disponiveis
- `heroes` — layouts de hero section
- `cta` — botoes e call-to-action
- `pricing` — tabelas de preco
- `social-proof` — depoimentos, logos, metricas
- `features` — grids, cards, comparacoes
- `navigation` — headers, menus
- `footer` — rodapes

---

## Auto-Detection: Mode Routing (MANDATORY — runs BEFORE discovery)

O LP Generator detecta automaticamente qual modo usar. O usuario NUNCA precisa lembrar de digitar "reference" ou "premium".

### Detection Rules (in order of priority)

```
1. SCREENSHOT ATTACHED?
   User attached/pasted an image, OR provided path to .png/.jpg/.webp
   → Mode C (Reference-Based) — skip to Section 9.1

2. URL PROVIDED?
   User shared a Dribbble/Behance/site URL as reference visual
   → Mode C (Reference-Based) — capture screenshot, then Section 9.1

3. KEYWORD "reference" or "referencia"?
   User explicitly said "reference", "referencia", "parecido com", "estilo de"
   → Mode C (Reference-Based)

4. KEYWORD "premium" or "nextjs"?
   → Mode B (Next.js)

5. DEFAULT
   → Mode A (HTML GSAP) — standard discovery flow
```

### Greeting (ALWAYS show on activation)

Ao ser ativado, SEMPRE mostrar este menu rápido:

```
Como quer criar sua LP?

1. **Tenho uma referência visual** — cole um screenshot ou link do Dribbble/Behance
2. **Me guia do zero** — respondo umas perguntas e você monta tudo
3. **Quero premium (Next.js)** — qualidade máxima com Framer Motion

Ou simplesmente descreva o que quer promover e eu cuido do resto.
```

Isso garante que o usuario descubra o Mode C sem precisar memorizar comandos.

---

## 0. Architecture — Unified Skill

```
┌──────────────────────────────────────────────────────────┐
│                    lp-generator v3                        │
│                  (EVERYTHING IN ONE)                      │
│                                                          │
│  Phase 1: Discovery     ──→  Phase 2: Style Selection    │
│  Phase 3: Generation    ──→  Phase 4: Iteration          │
│                                                          │
│  ┌─────────────────┐   ┌──────────────────────────────┐  │
│  │  8 Curated       │   │  Render Engine               │  │
│  │  Brand Themes    │   │                              │  │
│  │  ─────────────── │   │  Mode A: HTML GSAP           │  │
│  │  vercel-noir     │   │  (single-file, zero build)   │  │
│  │  linear-soft     │   │                              │  │
│  │  raycast-warm    │   │  Mode B: Next.js             │  │
│  │  specta          │   │  (Framer Motion + shadcn)    │  │
│  │  emerald-noir    │   │                              │  │
│  │  rose-gold       │   │                              │  │
│  │  arctic-frost    │   │  Mode C: Reference-Based     │  │
│  │  minimal-sand    │   │  (screenshot → design.json   │  │
│  │  + custom brand  │   │   → HTML + Replit prompt)    │  │
│  │  (via Mode C)    │   │                              │  │
│  └─────────────────┘   └──────────────────────────────┘  │
│                                                          │
│  + Copy formulas (PAS, headlines)                        │
│  + Form injection (4 providers)                          │
│  + Image strategy + Quality checklist                    │
└──────────────────────────────────────────────────────────┘
```

### Path Resolution

```
SKILL_HOME  = /Users/luizfosc/aios-core/skills/lp-generator
OUTPUT_BASE = ~/CODE/Projects/landing-pages
```

### Dependencies

| Dependency | Purpose | Location |
|------------|---------|----------|
| `convert.mjs` | CLI unificada | `{SKILL_HOME}/convert.mjs` |
| `brands/*.yaml` | 8 temas curados + custom | `{SKILL_HOME}/brands/` |
| `lib/*.mjs` | Parser, builder, utils | `{SKILL_HOME}/lib/` |
| `prompts/reverse-engineer-design.md` | Engenharia reversa de screenshots (Mode C) | `{SKILL_HOME}/prompts/` |
| `prompts/replit-assembler.md` | Template para montar prompt Replit (Mode C) | `{SKILL_HOME}/prompts/` |
| `image-creator` (optional) | AI image generation | Agent tool dispatch |

**Zero external skill dependencies.** Tudo esta dentro desta skill.

---

## 1. Discovery Questions (MANDATORY — ALWAYS ask before generating)

Use `AskUserQuestion` tool. Group ALL questions in a SINGLE block.
Skip questions the user already answered.

### Block 1: O Produto

1. **O que voce esta promovendo?** (produto, servico, app, evento, curso, mentoria...)
2. **Pra quem?** (publico-alvo em 1 frase — idade, dor, desejo)
3. **Qual o principal beneficio?** (a transformacao que a pessoa tem ao comprar)
4. **Tem preco?** (valor, parcelamento, ou "captacao de leads" se nao vende direto)

### Block 2: O Visual

5. **Qual tema visual?** Rode `node skills/lp-generator/convert.mjs --list-brands` para mostrar os 8 temas. Se o usuario nao souber, sugira baseado no nicho:
   - SaaS/Tech → `linear-soft`, `vercel-noir`
   - Infoproduto/Mentoria → `specta`, `raycast-warm`
   - Consultoria/Premium → `emerald-noir`, `vercel-noir`
   - Moda/Beauty/Eventos → `rose-gold`
   - Corporate/Docs → `arctic-frost`
   - Editorial/Portfolio → `minimal-sand`

6. **Nivel de efeitos?**
   - `full-framer` — Tudo: parallax, carousel, glow, stickyCTA, animatedCounters
   - `premium` — Bonito sem exagero: carousel, glow, stickyCTA (RECOMENDADO)
   - `minimal` — So o essencial: faqAccordion

7. **Tem cores da marca?** (hex codes ou "usa as do tema")
8. **Tem logo?** (URL/path ou "text logo")

### Block 3: O Conteudo

9. **Quais secoes quer?** (ou "me sugere baseado no tipo")
   Secoes disponiveis no parser: Hero, Problema, Solucao, Prova, Oferta, CTA Final, FAQ
   Secoes extras (adicionadas manualmente no MD): About, Stats, Newsletter

10. **Tem depoimentos reais?** (nome + texto, ou "cria ficticios")
11. **Tem numeros/stats?** (alunos, faturamento, clientes, anos — ou "inventa plausíveis")
12. **Qual a acao principal?** (CTA — "Comprar Agora", "Agendar Consulta", "Baixar Gratis", etc.)

### Block 4: Captacao

13. **Formulario captura o que?** (email, nome+email, nome+email+telefone)
14. **Integra com qual servico?**
    - `formspree` — Gratis, recebe por email (DEFAULT)
    - `convertkit` — Email marketing
    - `mailchimp` — Email marketing
    - `webhook` — URL customizada
    - `placeholder` — Visual bonito, configura depois

### Regras de Discovery

- Se "me sugere secoes": escolher baseado no tipo (ver Section Suggestions)
- Se nao tem depoimentos: criar 3 ficticios com `<!-- PLACEHOLDER: substituir por depoimentos reais -->`
- Se nao tem logo: usar nome do produto como text-logo
- Se nao tem cores: usar as do tema escolhido
- Se nao sabe o tema: sugerir 2-3 baseado no nicho

---

## 2. Content Generation — Write the Markdown

Apos discovery, gerar um arquivo `.md` seguindo a convencao do parser semantico.

### Markdown Convention (MUST follow exactly)

```markdown
# {Headline Principal — max 10 palavras, impactante}
{Subheadline — max 25 palavras, expande a headline}
*{Badge opcional — prova social curta}*

## Hero
{Descricao do hero — 1-2 frases sobre a transformacao}
**CTA:** {Texto do Botao} →

## Problema
{Frase de conexao com a dor}

❌ {Dor 1} — {detalhamento}
❌ {Dor 2} — {detalhamento}
❌ {Dor 3} — {detalhamento}
❌ {Dor 4} — {detalhamento}

{Frase de virada: "A verdade e..." ou similar}

## Solucao
{Frase introdutoria do metodo/produto}

✅ **{Beneficio 1}** — {Descricao}
✅ **{Beneficio 2}** — {Descricao}
✅ **{Beneficio 3}** — {Descricao}
✅ **{Beneficio 4}** — {Descricao}

{Frase de reforco}

## Prova
{Frase introdutoria}

> "{Depoimento 1}" — {Nome}, {Cargo/Contexto}

> "{Depoimento 2}" — {Nome}, {Cargo/Contexto}

> "{Depoimento 3}" — {Nome}, {Cargo/Contexto}

- **{Numero}** {metrica 1}
- **{Numero}** {metrica 2}
- **{Numero}** {metrica 3}

## Oferta
{O que esta incluso:}

✅ {Item 1} — Valor: R${valor}
✅ {Item 2} — Valor: R${valor}
✅ {Item 3} — Valor: R${valor}
✅ Bonus: {bonus 1} — Valor: R${valor}
✅ Bonus: {bonus 2} — Valor: R${valor}

**Total:** R${soma}
**HOJE:** R${preco-real} (ou {parcelamento})

### Garantia
{Texto da garantia — gera confianca}

## CTA Final
{Frase de urgencia/escassez}

**{Texto do CTA} →**

PS. {Texto de reforco final}

## FAQ
### {Pergunta 1}?
{Resposta 1}

### {Pergunta 2}?
{Resposta 2}

### {Pergunta 3}?
{Resposta 3}

### {Pergunta 4}?
{Resposta 4}
```

### Content Quality Rules

- Headlines CURTAS e IMPACTANTES (max 10 palavras)
- Subheadlines expandem a headline (max 25 palavras)
- CTAs com VERBOS DE ACAO ("Comece Agora", nao "Clique Aqui")
- Dores devem ser ESPECIFICAS e EMOCIONAIS (nao genericas)
- Beneficios focam na TRANSFORMACAO (nao no recurso)
- Depoimentos ficticios devem ser REALISTICOS (nomes brasileiros, cargos reais)
- FAQ responde as OBJECOES reais do publico-alvo
- Copy em pt-BR com acentuacao PERFEITA

### Section Suggestions by LP Type

| Tipo | Secoes Recomendadas |
|------|-------------------|
| Infoproduto (curso, mentoria) | Hero → Problema → Solucao → Prova → Oferta → FAQ → CTA Final |
| SaaS / App | Hero → Solucao (features) → Prova → Oferta (pricing) → FAQ → CTA Final |
| Servico profissional | Hero → Problema → Solucao → Prova → CTA Final → FAQ |
| Evento / Webinar | Hero → Prova (speakers) → Solucao (agenda) → CTA Final → FAQ |
| Captacao de leads | Hero → Problema → Solucao → Prova → CTA Final |
| E-commerce / Produto fisico | Hero → Solucao (beneficios) → Prova → Oferta → CTA Final → FAQ |

---

## 3. Form Injection — Add Lead Capture

Apos gerar o Markdown e ANTES de chamar o render engine, injetar formulario de captacao no HTML final.

### Strategy

1. Gerar o HTML normalmente via `convert.mjs`
2. Injetar o formulario no HTML gerado:
   - Localizar o `<!-- CTA Final -->` ou ultimo `<section>` antes do footer
   - Inserir o bloco de formulario ANTES dele
   - OU substituir o botao CTA por formulario inline

### Form Templates

#### Formspree (Default)

```html
<div class="form-capture mx-auto max-w-md mt-8">
  <form action="https://formspree.io/f/{FORM_ID}" method="POST" class="flex flex-col gap-4">
    <input type="text" name="name" placeholder="Seu nome" required
           class="px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400">
    <input type="email" name="email" placeholder="Seu melhor email" required
           class="px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400">
    <button type="submit"
            class="px-8 py-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg transition-all hover:scale-105 shadow-lg">
      {CTA_TEXT}
    </button>
    <input type="text" name="_gotcha" style="display:none">
    <p class="text-sm text-white/50 text-center">Seus dados estao seguros. Zero spam.</p>
  </form>
</div>
```

#### ConvertKit

```html
<form action="https://app.convertkit.com/forms/{FORM_ID}/subscriptions" method="post" class="flex flex-col gap-4 max-w-md mx-auto mt-8">
  <input type="text" name="fields[first_name]" placeholder="Seu nome"
         class="px-4 py-3 rounded-lg border bg-white/10 text-white placeholder-white/60">
  <input type="email" name="email_address" placeholder="Seu email" required
         class="px-4 py-3 rounded-lg border bg-white/10 text-white placeholder-white/60">
  <button type="submit" class="px-8 py-4 rounded-lg bg-indigo-600 text-white font-bold text-lg hover:scale-105 transition-all">
    {CTA_TEXT}
  </button>
</form>
```

#### Webhook (Custom URL)

```html
<form id="lead-form" class="flex flex-col gap-4 max-w-md mx-auto mt-8">
  <input type="text" name="name" placeholder="Seu nome" required class="px-4 py-3 rounded-lg border bg-white/10 text-white">
  <input type="email" name="email" placeholder="Seu email" required class="px-4 py-3 rounded-lg border bg-white/10 text-white">
  <button type="submit" class="px-8 py-4 rounded-lg bg-indigo-600 text-white font-bold text-lg hover:scale-105 transition-all">
    {CTA_TEXT}
  </button>
</form>
<script>
document.getElementById('lead-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.textContent = 'Enviando...';
  btn.disabled = true;
  try {
    const data = Object.fromEntries(new FormData(e.target));
    await fetch('{WEBHOOK_URL}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    e.target.innerHTML = '<p class="text-green-400 text-xl font-semibold py-8">Inscricao confirmada! Verifique seu email.</p>';
  } catch {
    btn.textContent = '{CTA_TEXT}';
    btn.disabled = false;
    alert('Erro ao enviar. Tente novamente.');
  }
});
</script>
```

#### Placeholder (Visual Only)

```html
<!-- TODO: Configure form integration — see README.md -->
<form onsubmit="event.preventDefault(); this.innerHTML='<p class=\'text-green-400 text-xl font-semibold py-8\'>Demo: configure a integracao no README.</p>'"
      class="flex flex-col gap-4 max-w-md mx-auto mt-8">
  <input type="text" name="name" placeholder="Seu nome" class="px-4 py-3 rounded-lg border bg-white/10 text-white">
  <input type="email" name="email" placeholder="Seu email" required class="px-4 py-3 rounded-lg border bg-white/10 text-white">
  <button type="submit" class="px-8 py-4 rounded-lg bg-indigo-600 text-white font-bold text-lg hover:scale-105 transition-all">
    {CTA_TEXT}
  </button>
</form>
```

### Form Styling Adaptation

As classes acima sao para temas dark. Para temas light, adaptar:
- `bg-white/10` → `bg-gray-100`
- `text-white` → `text-gray-900`
- `placeholder-white/60` → `placeholder-gray-400`
- `border-white/20` → `border-gray-300`

Ler o brand escolhido para determinar dark/light automaticamente.

---

## 4. Image Strategy

### Option A: AI Generation (via image-creator skill)

Dispatch Agent tool com a skill image-creator para gerar:

| Imagem | Tamanho | Prompt Base |
|--------|---------|-------------|
| Hero image | 1920x1080 | "Professional {niche} hero image, {style}, modern, high quality" |
| OG image | 1200x630 | "Social share card: {headline}, {brand colors}, clean typography" |

Salvar em `{OUTPUT_BASE}/{slug}/assets/` e referenciar no HTML.

### Option B: Placeholders (Default)

O render engine ja gera gradientes e efeitos visuais que dispensam imagens. Os temas tem:
- Gradient backgrounds no hero
- Glassmorphism cards
- Animated counters
- Glow effects

Para a maioria das LPs, **placeholders com o tema certo ja ficam lindos**.

### Option C: User-Provided

O usuario fornece URLs. Inserir no Markdown como imagens normais:
```markdown
![Hero image](https://example.com/hero.jpg)
```

---

## 5. Generation Workflow (Step by Step)

### Step 1: Create Output Directory

```bash
mkdir -p ~/CODE/Projects/landing-pages/{slug}
```

### Step 2: Write the Markdown

Gerar o arquivo `{slug}.md` em `~/CODE/Projects/landing-pages/{slug}/` seguindo a convencao da Section 2.

### Step 3: List Available Brands (if user unsure)

```bash
node /Users/luizfosc/aios-core/skills/lp-generator/convert.mjs --list-brands
```

### Step 4: Render via Engine

```bash
node /Users/luizfosc/aios-core/skills/lp-generator/convert.mjs \
  ~/CODE/Projects/landing-pages/{slug}/{slug}.md \
  --brand={brand} \
  --style=gsap \
  --effects={effects-level} \
  --output=~/CODE/Projects/landing-pages/{slug}
```

### Step 5: Inject Form (if needed)

Read the generated `index.html`, find the CTA section, inject the form template from Section 3.
Use `Edit` tool to insert form HTML before the closing CTA section.

### Step 6: Generate Images (if Option A)

Dispatch image-creator via Agent tool for each needed image.

### Step 7: Generate README

Write `README.md` with:
- Briefing usado
- Tema e efeitos escolhidos
- Instrucoes de formulario (como configurar o form ID)
- Deploy options

### Step 8: Preview

```bash
open ~/CODE/Projects/landing-pages/{slug}/index.html
```

### Step 9: Ask for Feedback

"A LP esta aberta no navegador. Quer ajustar algo? (cores, texto, secoes, layout)"

Se sim: editar o `.md` e re-renderizar, ou editar o HTML direto.
Se nao: mostrar deploy options.

---

## 6. Post-Generation

### Deploy Options

```
Como publicar:
1. Vercel:    cd ~/CODE/Projects/landing-pages/{slug} && npx vercel
2. Netlify:   drag & drop em app.netlify.com/drop
3. GitHub Pages: push para repo + ativar Pages
4. Qualquer hosting: upload index.html + assets/
```

### Iteration

Se o usuario pedir ajustes:
- **Texto/copy:** editar o `.md` e re-renderizar
- **Visual/tema:** mudar o `--brand` e re-renderizar
- **Layout/secoes:** adicionar/remover secoes no `.md` e re-renderizar
- **Formulario:** editar o HTML direto

---

## 7. Veto Conditions

```yaml
veto_conditions:
  - id: VETO_NO_DISCOVERY
    trigger: "Attempt to generate LP without asking discovery questions"
    action: "BLOCK — Discovery e obrigatorio. Pergunte antes de gerar."

  - id: VETO_LOREM_IPSUM
    trigger: "Lorem ipsum or generic placeholder in visible content"
    action: "BLOCK — Todo texto deve ser real ou ficticio rotulado com comentario HTML."

  - id: VETO_BAD_COPY
    trigger: "Generic headlines like 'Bem-vindo ao nosso site'"
    action: "BLOCK — Headlines devem ser especificas e impactantes."

  - id: VETO_NO_CTA
    trigger: "LP without clear call-to-action"
    action: "BLOCK — Toda LP precisa de CTA obvio."

  - id: VETO_NO_PROOF
    trigger: "LP without any social proof (testimonials, stats, logos)"
    action: "BLOCK — Prova social e obrigatoria. Crie ficticios se necessario."

  - id: VETO_ENGINE_FAIL
    trigger: "convert.mjs fails"
    action: "Read error output, fix the .md file, retry max 3x."
```

---

## 8. Conversion Formulas (MANDATORY — use when writing copy)

### Headline Formulas (choose the best fit)

1. **"[Outcome] Without [Pain]"** → "Ship Products Faster Without Burning Out"
2. **"The [Adjective] Way to [Action]"** → "The Smarter Way to Manage Remote Projects"
3. **"[Verb] Your [Thing] in [Timeframe]"** → "Launch Your SaaS in One Weekend"
4. **"Stop [Pain]. Start [Gain]."** → "Stop Chasing Updates. Start Shipping Features."
5. **"[Number] [Audience] Use [Product] to [Outcome]"** → "2,000+ Founders Use TaskFlow to Ship 3x Faster"

### CTA Button Text (ranked by conversion)

| HIGH Converting | LOW Converting (NEVER use) |
|----------------|---------------------------|
| "Start Free Trial" | ~~"Submit"~~ |
| "Get Started Free" | ~~"Sign Up"~~ |
| "See It in Action" | ~~"Learn More"~~ |
| "Try {Product} Free" | ~~"Click Here"~~ |
| "Create My First {Thing}" | ~~"Buy Now"~~ (too aggressive) |

### Feature Description Formula

`[Action verb] + [what it does] + [benefit to user]`

Example: "Automate status updates so your team spends less time reporting and more time building."

### Copy Framework: PAS (Problem-Agitation-Solution)

1. **Problem:** State the pain the reader feels
2. **Agitation:** Make it worse — show consequences of inaction
3. **Solution:** Present your product as the relief

### Conversion Boosters (add near EVERY CTA)

- **Social proof:** "Usado por +300 candidatos" / logos / depoimento
- **Risk reversal:** "Sem cartao de credito" / "30 dias gratis" / "Cancele quando quiser"
- **Urgency:** "Vagas limitadas" / "Preco sobe em X dias" (se real)

### Anti-Patterns (NEVER deploy)

- Generic headlines ("Bem-vindo ao nosso site")
- Multiple nav links (−15% CVR)
- More than 4 form fields (+120% conversao com reducao de 11 para 4)
- Stock photography (use product screenshots or real photos)
- Multiple CTA colors (use ONE consistent color)
- Anonymous testimonials (always include name + role)
- No social proof above the fold

---

## 9. Render Modes

### Mode A: HTML Standalone (DEFAULT — fast, zero build)

```bash
node /Users/luizfosc/aios-core/skills/lp-generator/convert.mjs {slug}.md --brand={brand} --style=gsap --effects=premium --output={OUTPUT}
```

- **When:** Quick iterations, client previews, simple LPs
- **Output:** Single `index.html` (Tailwind CDN + GSAP)
- **Pros:** Zero dependencies, opens in any browser, fast
- **Cons:** Limited animations vs Framer Motion

### Mode B: Next.js Premium

```bash
node /Users/luizfosc/aios-core/skills/lp-generator/convert.mjs {slug}.md --brand={brand} --style=nextjs --effects=full-framer --output={OUTPUT}
```

- **When:** Client-facing LPs, premium visual quality, portfolio pieces
- **Output:** Next.js project with Framer Motion + Tailwind
- **Pros:** Framer-level animations, component-based, best visual quality
- **Cons:** Requires `npm install` + build step

### Mode Selection Logic

Ask in discovery: "Qual nivel de qualidade?"
- **"Rapido / preview / MVP"** → Mode A (HTML standalone)
- **"Premium / cliente / portfolio"** → Mode B (Next.js)
- **"Tenho uma referencia visual"** → Mode C (Reference-Based)
- **Default if not asked:** Mode A

---

## 9.1. Mode C: Reference-Based (Design-First Pipeline)

> Inspirado no workflow da Deborah Folloni. Parte de uma referencia visual (Dribbble, Behance, screenshot)
> e extrai o design system automaticamente. Entrega HTML + prompt pronto pro Replit.

### Quando usar Mode C

- O usuario tem uma referencia visual que quer replicar o ESTILO
- O usuario quer uma LP com visual especifico que nao bate com os 8 brands curados
- O usuario menciona Dribbble, Behance, "parecido com esse site", ou fornece screenshot

### Pipeline Completo (4 Fases Automaticas)

```
Phase 0: Reference Capture
  └─ Usuario fornece screenshot ou URL
  └─ Se URL de site: capturar screenshot via Playwright
  └─ Confirmar: "Esse e o design de referencia?"

Phase 1: Design Extraction (Engenharia Reversa)
  └─ Ler prompt: {SKILL_HOME}/prompts/reverse-engineer-design.md
  └─ Analisar screenshot com o prompt
  └─ Extrair design.json completo (cores, tipografia, espacamento, componentes)
  └─ Extrair brand.yaml simplificado (compativel com pipeline existente)
  └─ Salvar ambos em {OUTPUT_DIR}/
  └─ Checkpoint: "Design system extraido. Quer ajustar algo?"

Phase 2: Copy Discovery (Discovery Lite)
  └─ Perguntas REDUZIDAS (visual ja resolvido):
     1. O que esta promovendo? (produto/servico)
     2. Pra quem? (publico-alvo)
     3. Qual o principal beneficio?
     4. Secoes desejadas? (ou "me sugere")
     5. CTA principal?
     6. Tem depoimentos/stats?
  └─ Gerar copy brief com as formulas da Section 8
  └─ Gerar Markdown seguindo convencao da Section 2

Phase 3: Assembly & Dual Output
  └─ OUTPUT A: Replit-Ready Prompt
     └─ Ler template: {SKILL_HOME}/prompts/replit-assembler.md
     └─ Combinar design.json + copy brief + section specs
     └─ Salvar como {slug}-replit-prompt.md
  └─ OUTPUT B: HTML via Pipeline Existente
     └─ Salvar brand.yaml extraido em {SKILL_HOME}/brands/custom-{slug}.yaml
     └─ Renderizar via convert.mjs --brand=custom-{slug}
     └─ Preview no navegador
  └─ Mostrar ambos outputs ao usuario
```

### Step-by-Step Execution

#### Step 0: Capture Reference

```
SE usuario forneceu path de imagem local:
  → Ler imagem com Read tool (multimodal)
  → Prosseguir para Step 1

SE usuario forneceu URL de site:
  → Usar Playwright (mcp__playwright) para screenshot
  → OU pedir pro usuario fornecer screenshot manualmente
  → Prosseguir para Step 1

SE usuario forneceu URL do Dribbble:
  → Tentar capturar screenshot da pagina
  → Se falhar: pedir screenshot manual
  → Prosseguir para Step 1
```

#### Step 1: Extract Design System

1. Ler `{SKILL_HOME}/prompts/reverse-engineer-design.md` — o prompt de engenharia reversa
2. Analisar o screenshot fornecido usando as instrucoes do prompt
3. Gerar o `design.json` completo com TODAS as variaveis visuais
4. Gerar o `brand.yaml` simplificado (mapeamento para o pipeline)
5. Salvar ambos em `{OUTPUT_DIR}/`
6. Mostrar resumo ao usuario: paleta, tipografia, componentes principais
7. **Checkpoint:** "Design system OK ou quer ajustar cores/fontes?"

#### Step 2: Copy Discovery (Lite)

Usar `AskUserQuestion` com as 6 perguntas reduzidas (o visual ja esta resolvido):

```
Agora que o design esta definido, preciso saber sobre o CONTEUDO:

1. **O que esta promovendo?** (app, servico, curso, produto...)
2. **Pra quem?** (publico-alvo em 1 frase)
3. **Qual o principal beneficio?** (a transformacao)
4. **Quais secoes?** (Hero, Problema, Solucao, Prova, Oferta, CTA, FAQ — ou "me sugere")
5. **CTA principal?** ("Teste gratis", "Agendar consulta", etc.)
6. **Tem depoimentos/stats reais?** (ou "cria ficticios")
```

Depois gerar o Markdown seguindo Section 2.

#### Step 3: Assemble Dual Output

**Output A — Replit Prompt:**
1. Ler `{SKILL_HOME}/prompts/replit-assembler.md`
2. Preencher o template com design.json + copy brief + section specs
3. Salvar como `{OUTPUT_DIR}/{slug}-replit-prompt.md`
4. Informar: "Prompt pronto para colar no Replit Design Mode, Cursor, ou qualquer AI code generator."

**Output B — HTML via Pipeline:**
1. Salvar `brand.yaml` em `{SKILL_HOME}/brands/custom-{slug}.yaml`
2. Gerar markdown e renderizar:
```bash
node {SKILL_HOME}/convert.mjs {slug}.md --brand=custom-{slug} --style=gsap --effects=premium --output={OUTPUT_DIR}
```
3. Abrir preview:
```bash
open {OUTPUT_DIR}/index.html
```

### Output Structure (Mode C)

```
~/CODE/Projects/landing-pages/{slug}/
├── index.html                    # LP renderizada (Output B)
├── {slug}.md                     # Markdown source
├── {slug}-replit-prompt.md       # Prompt pronto pro Replit (Output A)
├── design.json                   # Design system completo extraido
├── brand.yaml                    # Brand simplificado (pipeline compat)
├── reference-screenshot.png      # Screenshot original de referencia
├── assets/                       # Imagens (se geradas)
└── README.md                     # Briefing + deploy instructions
```

### Quality Loops & Error Recovery (Mode C)

O Mode C funciona como o Forge: cada fase tem validacao automatica e retry antes de prosseguir.

#### Phase 1 Quality Gate: Design Extraction

```
APOS extrair design.json, VALIDAR automaticamente:

CHECK_1: colors.primary existe?        → Se nao: RE-ANALISAR screenshot (retry 1/3)
CHECK_2: typography.fontFamilies existe? → Se nao: RE-ANALISAR screenshot (retry 1/3)
CHECK_3: spacing.sectionPadding existe?  → Se nao: RE-ANALISAR screenshot (retry 1/3)
CHECK_4: components.buttons existe?      → Se nao: RE-ANALISAR screenshot (retry 1/3)
CHECK_5: Minimo 5 cores extraidas?       → Se nao: RE-ANALISAR com foco em cores

Se 3 retries falharem:
  → CHECKPOINT: "Nao consegui extrair o design completo. O screenshot esta nitido?"
  → Opcoes:
    1. Fornecer outro screenshot
    2. Ajustar manualmente (usuario edita o design.json)
    3. Usar brand curado como fallback + cores do screenshot

Apos validacao PASS:
  → Mostrar resumo visual: paleta, fonte, estilo de botao
  → Perguntar: "Design system OK ou quer ajustar algo?"
  → Se ajustar: aplicar mudancas e re-validar
  → Se OK: prosseguir para Phase 2
```

#### Phase 2 Quality Gate: Copy

```
APOS gerar markdown, VALIDAR automaticamente:

CHECK_1: Headline segue uma das 5 formulas? (Section 8)
  → Se nao: REESCREVER headline (retry automatico, max 2x)
CHECK_2: CTA usa texto de alta conversao? (nao "Saiba mais", "Clique aqui")
  → Se nao: SUBSTITUIR por formula validada
CHECK_3: Tem prova social? (depoimentos ou stats)
  → Se nao: GERAR ficticios rotulados
CHECK_4: Acentuacao pt-BR correta?
  → Se nao: CORRIGIR automaticamente
CHECK_5: Zero Lorem Ipsum?
  → Se sim: BLOQUEAR — reescrever secao

Esses checks rodam SILENCIOSAMENTE (auto-fix).
So mostra checkpoint se nao conseguir resolver em 2 tentativas.
```

#### Phase 3 Quality Gate: Render

```
APOS renderizar HTML via convert.mjs:

SUCESSO:
  → Abrir preview no navegador
  → Perguntar: "A LP esta no navegador. O que achou?"
  → Opcoes automaticas:
    1. "Ficou otimo, salva assim"
    2. "Cores nao bateram" → re-extrair cores do screenshot + re-render
    3. "Texto precisa melhorar" → voltar pra Phase 2 (copy only)
    4. "Layout estranho" → tentar Mode B (Next.js) como alternativa
    5. "Quero ajustar X" → editar especifico e re-render

FALHA (convert.mjs erro):
  → Ler erro do CLI
  → Se "brand not found": verificar se custom-{slug}.yaml foi salvo corretamente
  → Se "parse error": validar markdown, corrigir, retry (max 3x)
  → Se 3 retries falharem:
    → CHECKPOINT: "O render falhou 3 vezes."
    → Opcoes:
      a. "Usar brand curado mais proximo + cores do screenshot"
      b. "Entregar so o prompt pro Replit (Output A)"
      c. "Parar aqui e salvar progresso"
```

#### Iteration Loop (pos-preview)

```
ENQUANTO usuario nao aprovar:
  → Aplicar ajuste solicitado
  → Re-render
  → Re-abrir preview
  → Perguntar novamente

Max iterations: 5 (apos 5: "Vamos salvar o progresso e continuar numa proxima sessao?")

TIPOS DE AJUSTE e como resolver:
  "cores"     → editar brand.yaml + re-render
  "texto"     → editar .md + re-render
  "secoes"    → adicionar/remover no .md + re-render
  "layout"    → editar HTML direto (post-render)
  "tudo"      → voltar pra Phase 1 com novo screenshot
```

### Veto Conditions (Mode C)

```yaml
# Hard Vetos (BLOQUEIA — nunca prosseguir)
- id: VETO_NO_REFERENCE
  trigger: "Mode C invoked without a screenshot or URL"
  action: "BLOCK — Pedir screenshot. Sem referencia, sem Mode C."

- id: VETO_EMPTY_DESIGN_JSON
  trigger: "design.json sem cores OU sem tipografia apos 3 retries"
  action: "BLOCK — Checkpoint com opcoes (outro screenshot, manual, fallback)."

- id: VETO_COPY_BEFORE_DESIGN
  trigger: "Tentar escrever copy antes de extrair design"
  action: "BLOCK — Design PRIMEIRO, copy DEPOIS. Ordem importa."

- id: VETO_RENDER_STUCK
  trigger: "convert.mjs falha 3x consecutivas"
  action: "BLOCK — Checkpoint com opcoes (brand fallback, so Replit, parar)."

# Soft Vetos (auto-fix silencioso)
- id: SOFT_BAD_HEADLINE
  trigger: "Headline generica"
  action: "Auto-fix: reescrever com formula. Se falhar 2x: checkpoint."

- id: SOFT_BAD_CTA
  trigger: "CTA com texto fraco"
  action: "Auto-fix: substituir por formula validada."

- id: SOFT_NO_PROOF
  trigger: "Sem prova social"
  action: "Auto-fix: gerar 3 depoimentos ficticios rotulados."

- id: SOFT_ACCENT
  trigger: "Acentuacao incorreta"
  action: "Auto-fix: corrigir silenciosamente."
```

---

## 10. Quick Commands

```
/lp-generator                    -> Full flow (discovery + generate)
/lp-generator premium            -> Full flow, force Mode B (Next.js)
/lp-generator list-brands        -> Mostra os 8 temas disponiveis
/lp-generator "{briefing}"       -> Pula direto pro discovery com contexto
/lp-generator reference          -> Mode C: Reference-Based (screenshot → design → LP)
/lp-generator reference "{path}" -> Mode C com screenshot ja fornecido
```

---

## 11. Quality Checklist (verify before delivering)

### Copy Quality
- [ ] Headlines follow one of 5 proven formulas (Section 8)
- [ ] Headlines max 10 palavras
- [ ] CTAs use high-converting text (not "Submit" or "Sign Up")
- [ ] Feature descriptions follow [verb] + [what] + [benefit] formula
- [ ] PAS framework applied (Problem → Agitation → Solution)
- [ ] Social proof near EVERY CTA (not just in one section)
- [ ] Risk reversal near primary CTA ("Sem cartao", "30 dias gratis")
- [ ] Acentuacao pt-BR perfeita

### Design Quality
- [ ] Responsivo mobile-first (375px, 768px, 1024px, 1440px)
- [ ] Single CTA color used consistently throughout
- [ ] No stock photography (product screenshots or real photos preferred)
- [ ] Touch targets minimum 44-48px on mobile
- [ ] Max 2 fonts (1 display + 1 body)
- [ ] Generous spacing between sections

### Technical Quality
- [ ] Animacoes funcionando (scroll reveal, hover, counters)
- [ ] Meta tags preenchidas (title, description, OG image)
- [ ] Formulario funcional ou placeholder documentado
- [ ] prefers-reduced-motion respeitado
- [ ] No Lorem Ipsum or undocumented placeholders
- [ ] Abriu preview no navegador
