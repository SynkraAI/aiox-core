# Ecosystem Scanner — AIOS Knowledge Bridge (Built-in)

> PREMISSA: O Forge NUNCA trabalha sozinho. Antes de qualquer execução, ele escaneia
> o ecossistema para encontrar os melhores recursos disponíveis. Isso NÃO é opcional.

---

## Regra de Ouro

**Antes de despachar QUALQUER agente, o Forge DEVE verificar se existe um mind, squad ou skill que pode enriquecer o contexto.** Pular essa etapa é como um chef ignorando a despensa — você pode cozinhar, mas vai sair pior do que poderia.

---

## 1. Scan Protocol (Phase 0 — MANDATORY)

### Step 1: Read the Indexes

1. **Minds:** Read `squads/mind-cloning/minds/INDEX.md`
   - Extract: slug, fidelity level, expertise domain
   - Only consider minds with fidelity >= "partial" (skip "sources-only")

2. **Skills:** Glob `skills/*/SKILL.md` and read ONLY the frontmatter (name + description)
   - Extract: name, description, category

3. **Squads:** Glob `squads/*/config.yaml` or `squads/*/README.md` (first 20 lines)
   - Extract: name, purpose

### Step 2: Match Against Project

Analyze the user's project description + detected tech stack and match:

#### Routing Matrix

| Domain Keywords | Minds to Consult | Skills to Inject | Squads to Reference |
|----------------|------------------|-------------------|---------------------|
| copy, texto, vendas, persuasão, outreach, landing page | schwartz, cialdini, hormozi, ladeira | superpowers | copywriting-squad |
| oferta, pricing, value proposition, high-ticket | hormozi (offers, audit) | — | high-ticket-sales, high-ticket-mastery |
| estratégia, decisão, análise, investimento | munger, naval, taleb, helmer | deep-research | advisor-board |
| negociação, venda, prospecção, lead | chris-voss, jeb-blount | deep-research | negotiation, whatsapp-prospector |
| storytelling, palestra, narrativa, conteúdo | walt-disney, luiz-fosc | — | storytelling-masters-fosc, content-creator |
| marca, branding, identidade visual, logo | — | design-system-extractor | branding |
| frontend, react, nextjs, componentes, UI | — | nextjs-react-expert | — |
| mobile, react native, flutter, app mobile | — | app-builder (templates) | — |
| database, schema, migration, RLS, supabase | — | — | — (use @data-engineer) |
| segurança, vulnerabilidade, pentest | — | vulnerability-scanner | — |
| testes, quality, cobertura | — | bulletproof-test | — |
| design system, tokens, componentes UI | — | design-system-extractor | design-system |
| SEO, busca orgânica, schema markup | — | — | seo |
| automação, workflow, processo | goldratt | — | sop-factory |
| HR, corporativo, T&D, treinamento | josh-bersin, verne-harnish | — | — |
| pesquisa, investigação, deep dive | — | deep-research, deep-search, tech-search | insight |

#### Dynamic Detection (beyond the matrix)

If the project description contains terms NOT in the matrix:
1. Grep the term across `squads/*/README.md` and `skills/*/SKILL.md`
2. If matches found, include them in the context pack
3. If no matches, proceed without — the matrix covers 90% of cases

### Step 3: Build Context Pack

Save to `.aios/forge-runs/{run_id}/context-pack.json`:

```json
{
  "scan_timestamp": "2026-03-21T14:30:00Z",
  "project_keywords": ["instagram", "social media", "feed", "likes", "stories"],
  "detected_domains": ["frontend", "database", "mobile"],
  "minds": [
    {
      "slug": "hormozi",
      "relevance": "growth strategy for social platform",
      "path": "squads/mind-cloning/minds/hormozi/",
      "inject_in_phases": [1],
      "what_to_extract": "Value equation, growth levers"
    }
  ],
  "skills": [
    {
      "name": "nextjs-react-expert",
      "relevance": "frontend implementation patterns",
      "path": "skills/nextjs-react-expert/SKILL.md",
      "inject_in_phases": [3]
    },
    {
      "name": "app-builder",
      "relevance": "project scaffolding and templates",
      "path": "skills/app-builder/SKILL.md",
      "inject_in_phases": [0, 1]
    }
  ],
  "squads": [],
  "template": {
    "selected": "nextjs-fullstack",
    "path": "skills/app-builder/templates/nextjs-fullstack/TEMPLATE.md"
  }
}
```

---

## 2. Context Injection Protocol

### When dispatching an agent, inject ONLY relevant items:

For each item in context-pack where `inject_in_phases` includes current phase:

**For minds:**
1. Read the mind's `outputs/voice_dna.yaml` (if exists) — extract `primary_framework` and `signature_phrases`
2. OR read `agents/{slug}.md` in the relevant squad
3. Inject as: `"Consulte este especialista: {name} — {what_to_extract}. Detalhes em: {path}"`

**For skills:**
1. Read the skill's `SKILL.md` — extract the instructions section (skip frontmatter)
2. Inject as additional context after the agent's persona

**For squads:**
1. Read the squad's key agent files (max 2-3 most relevant)
2. Inject as: `"Recursos disponíveis no squad {name}: {list of agents with expertise}"`

### Injection Rules

1. **Max 3 minds per agent dispatch** — more than 3 is noise, not signal
2. **Max 2 skills per agent dispatch** — the agent's own skill takes priority
3. **Synthesize, dont stack** — the agent should produce ONE coherent output, not a committee report
4. **Document who was consulted** — in the agent's output, tag: `[Informed by: @expert — what was applied]`

---

## 3. Micro-Scans (During Execution)

Phase 0 does the main scan. But during execution, the runner can trigger micro-scans:

### When to micro-scan

- **Phase 1 (Spec):** If @architect identifies a technology not covered by context-pack, scan for relevant skills
- **Phase 3 (Build):** If a story involves a specific domain (e.g., "story about email templates"), check if there's a skill for that
- **Error recovery:** If @dev fails on something specific (e.g., "Supabase RLS"), check if there's a mind or squad that covers it

### How to micro-scan

1. Grep for the specific term in `skills/*/SKILL.md` and `squads/*/README.md`
2. If found, add to context-pack.json (append, don't overwrite)
3. Inject in the next agent dispatch

---

## 4. Show Scan Results to User

After the ecosystem scan, show the user what was found:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔍 Ecosystem Scan Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Encontrei recursos relevantes no ecossistema:

  🧠 Minds: @hormozi (growth), @schwartz (copy)
  ⚡ Skills: nextjs-react-expert, app-builder
  📦 Template: nextjs-fullstack

  Esses recursos serão injetados nos agentes certos
  durante a execução. Pense neles como consultores
  que ficam de plantão — cada um entra quando é a
  vez dele brilhar.
```

If NO relevant resources found:
```
  🔍 Ecosystem Scan: nenhum recurso específico encontrado.
  Os agentes AIOS vão trabalhar com seu conhecimento padrão.
  (Isso é normal pra projetos com domínio genérico)
```
