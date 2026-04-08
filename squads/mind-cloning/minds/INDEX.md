# Mind Clones Index

> Local canônico: `squads/mind-cloning/minds/{slug}/`

## Mentes Clonadas

| # | Mente | Slug | Status | Fidelidade | Domínio |
|---|-------|------|--------|------------|---------|
| 1 | Naval Ravikant | `naval-ravikant` | Complete | Premium | Filosofia, Investimentos |
| 2 | Tim Ferriss | `tim-ferriss` | Complete | Premium | Produtividade, Lifestyle Design |
| 3 | Ítalo Marsili | `italo-marsili` | Complete | Premium | Psicologia, Filosofia |
| 4 | Tathi Deandhela | `tathi-deandhela` | Complete | Premium | Comunicação, Influência |
| 5 | Luiz Fosc | `luiz-fosc` | Complete | Premium | Tecnologia, AI, Negócios |
| 6 | Gui Ávila | `gui-avila` | Complete | Intermediate | Automação, Negócios |
| 7 | Thiago Tessman | `thiago-tessman` | Complete | Intermediate | Conversão, Tráfego Pago, Google/Meta Ads |
| 8 | Merlin Mann | `merlin-mann` | Complete | Intermediate | Produtividade, Criatividade |
| 9 | Tiago Forte | `tiago-forte` | Complete | Intermediate | Second Brain, PKM |
| 10 | Charlie Munger | `charlie-munger` | Complete | Intermediate | Mental Models, Investimentos |
| 11 | Paulo Vieira | `paulo-vieira` | Complete | Premium | Coaching, Inteligência Emocional |
| 12 | Alex Hormozi | `hormozi` | Complete | Premium | Ofertas, Escala, Ads, Copy |
| 13 | Renner Silva | `renner-silva` | Complete | Intermediate | Marketing, Vendas, Roteiros |
| 14 | Renan Vieira | `renan-vieira` | Complete | Intermediate | Funis, Vendas, Mentoria |
| 15 | Alistair Croll | `alistair-croll` | Complete | Intermediate | Lean Analytics |
| 16 | Eliyahu Goldratt | `eliyahu-goldratt` | Complete | Intermediate | Theory of Constraints |
| 17 | John Doerr | `john-doerr` | Complete | Intermediate | OKRs |
| 18 | Josh Bersin | `josh-bersin` | Complete | Intermediate | HR, People Analytics |
| 19 | Kaplan & Norton | `kaplan-norton` | Complete | Intermediate | Balanced Scorecard |
| 20 | Martin Fowler | `martin-fowler` | Complete | Intermediate | Software Architecture |
| 21 | Neal Ford | `neal-ford` | Complete | Intermediate | Evolutionary Architecture |
| 22 | Nicole Forsgren | `nicole-forsgren` | Complete | Intermediate | DevOps, DORA Metrics |
| 23 | Simon Wardley | `simon-wardley` | Complete | Intermediate | Wardley Mapping |
| 24 | Skelton & Pais | `skelton-pais` | Complete | Intermediate | Team Topologies |
| 25 | Annie Duke | `annie-duke` | Complete | Intermediate | Decision Making |
| 26 | Chris Voss | `chris-voss` | Complete | Intermediate | Negociação |
| 27 | Clayton Christensen | `clayton-christensen` | Complete | Intermediate | Disruptive Innovation |
| 28 | Elon Musk | `elon-musk` | Complete | Intermediate | Engenharia, Space, AI |
| 29 | Hamilton Helmer | `hamilton-helmer` | Complete | Intermediate | 7 Powers, Strategy |
| 30 | Keith Cunningham | `keith-cunningham` | Complete | Intermediate | Business, Thinking |
| 31 | Nassim Taleb | `nassim-taleb` | Complete | Intermediate | Antifragilidade, Risco |
| 32 | Robert Cialdini | `robert-cialdini` | Complete | Premium | Persuasão, Influência, Pre-Suasion |
| 33 | Shane Parrish | `shane-parrish` | Complete | Intermediate | Mental Models |
| 34 | Steve Jobs | `steve-jobs` | Complete | Intermediate | Design, Produto |
| 35 | Verne Harnish | `verne-harnish` | Complete | Intermediate | Scaling Up |
| 36 | Walt Disney | `walt-disney` | Complete | Intermediate | Criatividade, Storytelling |
| 37 | Leandro Ladeira | `leandro-ladeira` | Complete | Premium | Copy, Marketing Digital, Infoprodutos |
| 38 | Dan Koe | `dan-koe` | Complete | Premium | One-Person Business, Conteúdo |
| 39 | José Amorim | `jose-amorim` | Partial | Intermediate | Nexialismo, IA, Conteúdo |
| 40 | Marcos Hiller | `marcos-hiller` | Complete | Intermediate | Branding, Marketing |
| 41 | Pedro Sobral | `pedro-sobral` | Complete | Intermediate | Tráfego Pago, Gestão |
| 42 | Juliana Gomes | `juliana-gomes` | Complete | Intermediate | Conteúdo, Digital |
| 43 | Ícaro de Carvalho | `icaro-de-carvalho` | Complete | Intermediate | Marketing, Copywriting, Negócios |
| 44 | Luiz Fernando Garcia | `luiz-fernando-garcia` | Complete | Premium | Alta Performance, Neurociência Comportamental |

## Estatísticas

- **Total:** 44 mentes
- **Complete:** 43 (DNA extraído)
- **Partial:** 1 (jose-amorim — caso especial, indivíduo privado)
- **Sources Only:** 0 🎉

## Estrutura Padrão

```
squads/mind-cloning/minds/{slug}/
├── sources/                    # Materiais brutos (imutáveis)
│   ├── transcripts/
│   ├── books/
│   └── sources_inventory.yaml
├── outputs/                    # Artefatos gerados (regeneráveis)
│   ├── voice_dna.yaml
│   ├── thinking_dna.yaml
│   ├── mind_dna_complete.yaml
│   ├── quality_dashboard.md
│   └── smoke_test_result.yaml
└── intermediate/               # Rascunhos (opcional)
```

## Squads Consumidores

Squads que referenciam mentes deste diretório:

| Squad | Mentes Usadas | Referência |
|-------|---------------|------------|
| `advisor-board` | chris-voss, elon-musk, annie-duke, keith-cunningham, nassim-taleb, walt-disney, clayton-christensen, verne-harnish, steve-jobs, hamilton-helmer, shane-parrish, naval-ravikant | `agents/*.md` → mind_source |
| `conversao-extrema` | thiago-tessman | `agents/tessman-*.md` → mind_source |
| `copywriting-squad` | hormozi, dan-koe | `agents/*.md` → mind_source |
| `dan-koe` | dan-koe | `config.yaml` → mind_source |
| `design-system` | chris-do, marty-neumeier, peter-mckinnon | `agents/*.md` → mind_source |
| `high-ticket-sales` | hormozi, chris-voss, robert-cialdini | `agents/*.md` → knowledge_sources |
| `hormozi` | hormozi | `config.yaml` → mind_source |
| `icaro-de-carvalho` | icaro, marcos-hiller, pedro-sobral, juliana-gomes | `agents/*.md` → mind_source |
| `italo-marsili` | italo-marsili | `config.yaml` → mind_source |
| `jose-amorim` | jose-amorim | `config.yaml` → mind_source |
| `kaizen` + `kaizen-v2` | martin-fowler, nicole-forsgren, skelton-pais, john-doerr, josh-bersin | `agents/*.md` → mind_source |
| `knowledge-base-builder` | tiago-forte | `agents/taxonomy-architect.md` → mind_source |
| `leandro-ladeira` | leandro-ladeira | `config.yaml` → mind_source |
| `luiz-fosc` | luiz-fosc | `squad.yaml` → mind_source |
| `mmos-squad` | tim-ferriss, thiago-finch | Referência por path |
| `negotiation` | chris-voss, robert-cialdini | `agents/*.md` → mind_source |
| `paulo-vieira` | paulo-vieira | `config.yaml` → mind_source |
| `renner-silva` | renner-silva | `config.yaml` → mind_source |
| `storytelling-masters-fosc` | robert-cialdini | `agents/*.md` → mind_source |
| `tathi-deandhela` | tathi-deandhela | `config.yaml` → mind_source |

---

*Atualizado: 2026-04-07 (mind_source adoption: novos squads consumidores, tabela reorganizada A-Z, kaizen unificado com kaizen-v2)*
