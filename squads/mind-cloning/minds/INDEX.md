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
| 7 | Thiago Tessman | `thiago-tessman` | Partial | Intermediate | Conversão, Marketing Digital |
| 8 | Merlin Mann | `merlin-mann` | Complete | Intermediate | Produtividade, Criatividade |
| 9 | Tiago Forte | `tiago-forte` | Complete | Intermediate | Second Brain, PKM |
| 10 | Charlie Munger | `charlie-munger` | Complete | Intermediate | Mental Models, Investimentos |
| 11 | Paulo Vieira | `paulo-vieira` | Complete | Premium | Coaching, Inteligência Emocional |
| 12 | Alex Hormozi | `alex-hormozi` | Partial | Basic | Ofertas, Escala, Business |
| 13 | Renner Silva | `renner-silva` | Sources Only | - | Marketing, Vendas |
| 14 | Renan Vieira | `renan-vieira` | Sources Only | - | Funis, Vendas |
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
| 25 | Annie Duke | `annie-duke` | Sources Only | - | Decision Making |
| 26 | Chris Voss | `chris-voss` | Sources Only | - | Negociação |
| 27 | Clayton Christensen | `clayton-christensen` | Sources Only | - | Disruptive Innovation |
| 28 | Elon Musk | `elon-musk` | Sources Only | - | Engenharia, Space, AI |
| 29 | Hamilton Helmer | `hamilton-helmer` | Sources Only | - | 7 Powers, Strategy |
| 30 | Keith Cunningham | `keith-cunningham` | Sources Only | - | Business, Thinking |
| 31 | Nassim Taleb | `nassim-taleb` | Sources Only | - | Antifragilidade, Risco |
| 32 | Robert Cialdini | `robert-cialdini` | Sources Only | - | Persuasão, Influência |
| 33 | Shane Parrish | `shane-parrish` | Sources Only | - | Mental Models |
| 34 | Steve Jobs | `steve-jobs` | Sources Only | - | Design, Produto |
| 35 | Verne Harnish | `verne-harnish` | Sources Only | - | Scaling Up |
| 36 | Walt Disney | `walt-disney` | Sources Only | - | Criatividade, Storytelling |
| 37 | Leandro Ladeira | `leandro-ladeira` | Complete | Premium | Copy, Marketing Digital, Infoprodutos |
| 38 | Dan Koe | `dan-koe` | Complete | Premium | One-Person Business, Conteúdo |
| 39 | Alex Hormozi (Full) | `hormozi` | Complete | Premium | Ofertas, Escala, Ads, Copy |
| 40 | José Amorim | `jose-amorim` | Partial | Intermediate | Nexialismo, IA, Conteúdo |

## Estatísticas

- **Total:** 40 mentes
- **Complete:** 25 (DNA extraído)
- **Partial:** 3 (DNA incompleto)
- **Sources Only:** 12 (materiais brutos, aguardando extração)

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
| `hormozi` | alex-hormozi | `config.yaml` → mind_source |
| `italo-marsili` | italo-marsili | `config.yaml` → mind_source |
| `luiz-fosc` | luiz-fosc | `squad.yaml` → mind_source |
| `kaizen` | 10 mentes (Fowler, Wardley, etc.) | Referência por path |
| `design-system` | chris-do, marty-neumeier, peter-mckinnon | `agents/*.md` → mind_source |
| `mmos-squad` | tim-ferriss, alex-hormozi | Referência por path |
| `leandro-ladeira` | leandro-ladeira | Mind movido de `data/dna/` |
| `dan-koe` | dan-koe | Mind movido de `data/minds/` |
| `hormozi` | hormozi | Mind movido de `data/minds/` |
| `paulo-vieira` | paulo-vieira | Mind deduplicado (squad → mind) |
| `tathi-deandhela` | tathi-deandhela | DNA v2 movido do squad |
| `renner-silva` | renner-silva | Sources movidos do squad |
| `jose-amorim` | jose-amorim | Movido de `squad-creator/data/minds/` |

---

*Atualizado: 2026-03-18 (MINDS-1: normalização)*
