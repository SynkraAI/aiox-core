# md-to-landing-page

Converte Markdown em **landing pages de alta conversão** com seções semânticas (hero, problema, oferta, CTA, FAQ, etc.), reutilizando a engine de renderização de `md-to-branded-pdf` (26 temas visuais, dark/light mode, efeitos GSAP/Framer Motion).

## Quick Start

```bash
# GSAP (HTML único, zero build step)
node skills/md-to-landing-page/convert.mjs landing.md --brand=luizfosc --style=gsap --effects=premium

# Next.js (projeto completo)
node skills/md-to-landing-page/convert.mjs landing.md --brand=emerald-ai --style=nextjs --effects=full-framer

# Validar estrutura sem gerar
node skills/md-to-landing-page/convert.mjs landing.md --validate-only

# Listar temas disponíveis
node skills/md-to-landing-page/convert.mjs --list-brands
```

## Convenção Markdown

Escreva Markdown natural com H2 semânticos. O parser detecta automaticamente o tipo de seção:

```markdown
# Headline Principal
Subheadline descritiva.
*Badge opcional*

## Hero
Descrição do hero.
**CTA:** Texto do Botão

## Problema
❌ Dor 1 — detalhamento
❌ Dor 2 — detalhamento

## Solução
✅ **Benefício 1** — Descrição
✅ **Benefício 2** — Descrição

## Prova
> "Depoimento" — Autor, Cargo
- **2.847** alunos ativos

## Oferta
✅ Item 1 — Valor: R$3.000
**Total:** R$16.497
**HOJE:** R$997
### Garantia
30 dias incondicional.

## CTA Final
**Quero Começar Agora**
PS. Texto de urgência.

## FAQ
### Pergunta 1?
Resposta 1.
```

## Detecção de Seções

| Tipo | Keywords (pt-BR + en) |
|------|----------------------|
| hero | hero, above the fold, headline |
| problem | problema, problem, dor, pain |
| solution | solução, solution, mecanismo, método |
| proof | prova, proof, testimonial, depoimento |
| offer | oferta, offer, preço, pricing |
| cta | cta, call to action, cta final |
| faq | faq, dúvidas, perguntas |

## Efeitos LP-Específicos

| Efeito | full-framer | premium | minimal |
|--------|:-----------:|:-------:|:-------:|
| ctaPulse | ✅ | ✅ | ❌ |
| testimonialCarousel | ✅ | ✅ | ❌ |
| pricingGlow | ✅ | ✅ | ❌ |
| stickyCTA | ✅ | ✅ | ❌ |
| faqAccordion | ✅ | ✅ | ✅ |
| parallaxHero | ✅ | ❌ | ❌ |

Além dos efeitos base herdados de `md-to-branded-pdf` (textReveal, animatedCounters, parallax, staggeredCards, gradientText, glassmorphism, etc.).

## Flags CLI

| Flag | Descrição |
|------|-----------|
| `--brand=<name>` | Tema visual (obrigatório) |
| `--style=gsap\|nextjs` | Modo de saída |
| `--effects=full-framer\|premium\|minimal` | Nível de efeitos |
| `--output=<path>` | Diretório de saída |
| `--validate-only` | Valida estrutura sem gerar |
| `--list-brands` | Lista temas disponíveis |
| `--preview` | Abre galeria de temas no browser |
| `--help` | Mostra ajuda |

## Reuso da Skill Original

Importa diretamente de `md-to-branded-pdf`:
- `brand-loader.mjs` — 26 temas visuais
- `color-mapper.mjs` — hexToHSL, brandToTailwindConfig, brandToShadcnVars
- `html-utils.mjs` — escapeHTML, formatInline, buildTable
- `effects-config.mjs` — presets base (full-framer/premium/minimal)
- `nextjs-templates.mjs` — layout, providers, globals, tailwind config

## Estrutura

```
md-to-landing-page/
├── SKILL.md                    # Este arquivo
├── convert.mjs                 # CLI entry point
├── package.json                # Dependências (marked, js-yaml)
├── lib/
│   ├── lp-parser.mjs           # Parser semântico MD → seções LP
│   ├── lp-effects.mjs          # Presets LP (extends base)
│   ├── lp-builder-gsap.mjs     # Builder HTML GSAP
│   ├── lp-builder-nextjs.mjs   # Gerador projeto Next.js
│   └── lp-nextjs-templates.mjs # Templates TSX componentes LP
├── templates/
│   ├── lp-styles.mjs           # CSS componentes LP
│   └── lp-scripts.mjs          # JS/GSAP animações LP
└── examples/
    └── example-landing-page.md # Markdown de referência
```
