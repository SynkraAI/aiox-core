# Handoff: Advisory Board Squad Creation

**Data:** 2026-03-12
**De:** Squad Architect (session pesquisa + ETL + fontes)
**Para:** Squad Architect (session clonagem + montagem)
**Status:** READY FOR CLONING

---

## O Que Foi Feito

1. **Pesquisa iterativa** — 3 iteracoes, 18 nomes analisados, 7 cortados com justificativa
2. **Perfil cognitivo mapeado** — ENTP, blind spots, heuristicas, MBTI/Big5
3. **Lista final aprovada pelo usuario** — 13 minds
4. **21 livros convertidos** — PDF/EPUB/MOBI -> Markdown (2.59M words total)
5. **Originais preservados** — epub/pdf copiados para `originals/` em cada mind
6. **Hormozi DNA consolidado** — extraido do squad existente (17 agents, 165+ files)
7. **Novos nomes pesquisados** — 15 sugestoes com gaps identificados (usuario ainda nao decidiu)

---

## Arquitetura de Minds (IMPORTANTE)

```
outputs/minds/                          <- MINDS SAO REUTILIZAVEIS
├── {slug}/                             <- DNA do mind (qualquer squad referencia)
│   ├── voice_dna.yaml                  <- Como comunica
│   ├── thinking_dna.yaml               <- Como decide
│   └── mind_dna_complete.yaml          <- Consolidado
│
├── advisor-board-sources/              <- STAGING AREA (livros para ETL)
│   ├── {slug}/                         <- Markdown convertido
│   │   ├── livro-convertido.md
│   │   └── originals/                  <- epub/pdf originais
│   └── ...
```

**Regra:** Minds vivem em `outputs/minds/{slug}/`. Squads REFERENCIAM, nao copiam.
**Upgrade:** `*update-mind {slug} --sources {path}` incrementa DNA sem perder o existente.

---

## Lista Final Aprovada: 13 Advisors

| # | Mind | Framework | Categoria | Material | Fonte |
|---|------|-----------|-----------|----------|-------|
| 1 | Hamilton Helmer | 7 Powers | Strategy & Moats | 1 livro (45K words) | livro local |
| 2 | Verne Harnish | Scaling Up | Scaling & Ops | 1 livro (94K words) | livro local |
| 3 | Chris Voss | Tactical Empathy | Negociacao | 1 livro (84K words) | livro local |
| 4 | Alex Hormozi | $100M Framework | Growth & Marketing | DNA consolidado do squad | squad existente |
| 5 | Clayton Christensen | JTBD + Disruptive Innovation | Innovation | 1 livro collection (264K words) | livro local |
| 6 | Annie Duke | Thinking in Bets | Decision Making | 1 livro (79K words) | livro local |
| 7 | Keith Cunningham | Thinking Time | Capital Allocation | 1 livro (76K words) | livro local |
| 8 | Naval Ravikant | Wealth + Happiness + Leverage | Philosophy & Wealth | **JA CLONADO** | mind existente |
| 9 | Nassim Taleb | Antifragility + Skin in the Game | Risk & Convexity | 3 livros (447K words) | livros locais |
| 10 | Shane Parrish | Great Mental Models | Mental Models | 2 livros (106K words) | livros locais |
| 11 | Steve Jobs | Simplicity + Product Vision | Product & Brand | 3 livros (383K words) | livros locais |
| 12 | Elon Musk | The Algorithm + First Principles | Execution & Scale | 2 livros (321K words) | livros locais |
| 13 | Walt Disney | Creative Strategy (3 Rooms) | Criatividade & Visao | 3 livros (579K words) | livros locais |

**Total: 21 livros, 2.59M words + 2 minds prontos (Naval + Hormozi)**

---

## Material Fonte Disponivel

### Minds Ja Prontos (referenciar direto)
- `outputs/minds/naval-ravikant/` — mind_dna_complete.yaml, voice_dna.yaml, thinking_dna.yaml
- `outputs/minds/alex_hormozi/consolidated-dna.md` — consolidado de 6 DNAs tematicos do squad

### Livros Convertidos (advisor-board-sources/{slug}/)

```
hamilton-helmer/
  7-powers-hamilton-helmer.md                           — 45K words
  originals/                                            — epub

verne-harnish/
  scaling-up-verne-harnish.md                           — 94K words
  originals/                                            — epub

chris-voss/
  never-split-the-difference-chris-voss.md              — 84K words
  originals/                                            — epub

clayton-christensen/
  disruptive-innovation-collection-clayton-christensen.md — 264K words (3 livros em 1!)
  originals/                                            — epub

annie-duke/
  thinking-in-bets-annie-duke.md                        — 79K words
  originals/                                            — epub

keith-cunningham/
  the-road-less-stupid-keith-cunningham.md              — 76K words
  originals/                                            — epub

nassim-taleb/
  antifragile-nassim-taleb.md                           — 193K words
  the-black-swan-nassim-taleb.md                        — 176K words
  skin-in-the-game-nassim-taleb.md                      — 78K words
  originals/                                            — epub + pdf

shane-parrish/
  great-mental-models-vol1-shane-parrish.md             — 41K words
  clear-thinking-shane-parrish.md                       — 66K words
  originals/                                            — epub + pdf

robert-cialdini/
  influence-robert-cialdini.md                          — 108K words
  originals/                                            — pdf

steve-jobs/
  steve-jobs-isaacson.md                                — 231K words
  insanely-simple-ken-segall.md                         — 75K words
  creative-selection-ken-kocienda.md                    — 77K words

elon-musk/
  elon-musk-isaacson.md                                 — 231K words
  liftoff-eric-berger.md                                — 90K words

walt-disney/
  walt-disney-neal-gabler.md                            — 383K words
  ride-of-a-lifetime-bob-iger.md                        — 86K words
  creativity-inc-ed-catmull.md                          — 110K words
```

### Perfil do Usuario (para personalizacao)
- `squads/luiz-fosc/data/dna/mind_dna_complete.yaml` — DNA completo
- `squads/luiz-fosc/data/dna/thinking_dna.yaml` — Heuristicas, frameworks
- `squads/luiz-fosc/data/dna/voice_dna.yaml` — Como se comunica
- `squads/luiz-fosc/data/mbti/` — MBTI completo (ENTP)
- `squads/luiz-fosc/data/facts-reference.md` — Fatos verificados

---

## Arquitetura do Squad

```
squads/advisor-board/
├── config.yaml
├── README.md
├── agents/
│   ├── board-chief.md          <- Orquestrador (le DNA + MBTI do usuario)
│   ├── hamilton-helmer.md       <- Referencia outputs/minds/hamilton-helmer/
│   ├── verne-harnish.md
│   ├── chris-voss.md
│   ├── alex-hormozi.md          <- Referencia outputs/minds/alex_hormozi/
│   ├── clayton-christensen.md
│   ├── annie-duke.md
│   ├── keith-cunningham.md
│   ├── naval-ravikant.md        <- Referencia outputs/minds/naval-ravikant/
│   ├── nassim-taleb.md
│   ├── shane-parrish.md
│   ├── steve-jobs.md
│   ├── elon-musk.md
│   └── walt-disney.md
├── tasks/
│   ├── board-session.md        <- Sessao de advisory (pergunta -> routing -> conselho)
│   ├── decision-council.md     <- Convoca multiplos advisors para 1 decisao
│   └── strategic-review.md     <- Review periodico dos negocios
├── workflows/
│   └── advisory-session.md     <- Workflow completo de sessao
└── data/
    └── luiz-fosc-profile.md    <- Link para DNA + MBTI + blind spots
```

### Tiers
```
Tier 0 (Diagnostico): board-chief — Analisa pergunta, consulta perfil ENTP, roteia
Tier 1 (Strategy): Helmer, Harnish, Christensen, Musk
Tier 1 (Execution): Hormozi, Cunningham, Voss
Tier 1 (Thinking): Duke, Taleb, Parrish, Naval
Tier 1 (Vision): Jobs, Disney
```

---

## Proximos Passos (Para Nova Sessao)

1. Ativar `/squad-creator-pro:squad-chief`
2. Executar `*clone-mind` para cada um dos 11 minds restantes:
   - **Com livros locais (alta fidelidade ~85%):** Helmer, Harnish, Voss, Christensen, Duke, Cunningham, Taleb, Parrish, Jobs, Musk, Disney
   - `--sources outputs/minds/advisor-board-sources/{slug}/`
3. **Naval:** ja pronto — apenas referenciar `outputs/minds/naval-ravikant/`
4. **Hormozi:** ja pronto — referenciar `outputs/minds/alex_hormozi/consolidated-dna.md`
5. Criar board-chief.md com integracao ao perfil luiz-fosc
6. Montar estrutura do squad (config, README, tasks, workflows)
7. Validar com `*validate-squad advisor-board`

### Ordem sugerida de clonagem (por complexidade)
1. Hamilton Helmer (1 livro, 45K — rapido)
2. Chris Voss (1 livro, 84K — rapido)
3. Annie Duke (1 livro, 79K — rapido)
4. Keith Cunningham (1 livro, 76K — rapido)
5. Verne Harnish (1 livro, 94K — medio)
6. Shane Parrish (2 livros, 106K — medio)
7. Clayton Christensen (1 collection, 264K — medio/grande)
8. Elon Musk (2 livros, 321K — grande)
9. Steve Jobs (3 livros, 383K — grande)
10. Nassim Taleb (3 livros, 447K — grande)
11. Walt Disney (3 livros, 579K — maior de todos)

---

## Nomes Extras Pesquisados (Usuario Ainda Nao Decidiu)

15 sugestoes com gaps identificados no board atual:

| Nome | Nova Dimensao | Livro Principal |
|------|---------------|-----------------|
| Seth Godin | Criacao de Categoria & Tribos | Purple Cow, This Is Marketing |
| Robert Cialdini | Psicologia da Persuasao | **Influence (JA CONVERTIDO)**, Pre-Suasion |
| Daniel Kahneman | Vieses Cognitivos | Thinking Fast and Slow |
| Patrick Lencioni | Cultura & Saude do Time | 5 Dysfunctions of a Team |
| Peter Thiel | Contrarian Thinking | Zero to One |
| Jim Collins | Excelencia Duravel | Good to Great |
| Rory Sutherland | Irracionalidade do Consumidor | Alchemy |
| Byron Sharp | Ciencia de Marca | How Brands Grow |
| Al Ries & Jack Trout | Posicionamento Classico | Positioning |
| Geoffrey Moore | Timing & Chasm | Crossing the Chasm |
| Howard Marks | Alocacao de Capital | The Most Important Thing |
| Simon Sinek | Proposito & Lideranca | Start With Why |
| Eric Ries | Validacao Rapida | The Lean Startup |
| Tim Ferriss | Eficiencia Pessoal | 4-Hour Workweek |
| Gary Vaynerchuk | Marketing de Conteudo | Jab Jab Jab Right Hook |

**Top 5 recomendados:** Godin, Cialdini (ja tem livro!), Lencioni, Thiel, Collins

---

## Decisoes do Usuario (Registradas)

- **Naval Ravikant obrigatorio** — ja clonado, filosofia + wealth
- **Nassim Taleb obrigatorio** — antifragilidade e um dos frameworks secundarios do usuario
- **Shane Parrish > Michael Mauboussin** — mais pratico, menos academico
- **Clayton Christensen > Teresa Torres + Marty Cagan** — mais estrategico, usuario nao e PM corporativo
- **Steve Jobs + Elon Musk + Walt Disney** — visionarios de negocios, fidelidade ~70-80%
- **Personalizacao ENTP** — cada advisor adapta comunicacao ao perfil cognitivo do usuario
- **Hormozi:** usar DNA consolidado do squad existente (nao clonar fresh)
- **Minds sao reutilizaveis** — vivem em `outputs/minds/{slug}/`, squads referenciam
- **Originais preservados** — epub/pdf guardados em `originals/` para re-extracao futura
