# Tocks Website v2 — Page Wireframes

**Design System:** Gilded Noir
**Notation:** ASCII wireframes with section descriptions
**Grid:** 12-column, max-width 1280px, padding 32px

---

## HOME PAGE (`/`)

```
╔══════════════════════════════════════════════════════════════════════╗
║ [LOGO]        COLECAO  ATELIER  PROJETOS  BLOG  CONTATO   [W CTA] ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║                   ╔══════════════════════════╗                     ║
║                   ║    VIDEO BACKGROUND      ║                     ║
║                   ║    (autoplay, muted)      ║                     ║
║                   ║                          ║                     ║
║                   ║  Mesas de Bilhar         ║                     ║
║                   ║  Sob Medida              ║  ← display-lg       ║
║                   ║                          ║                     ║
║                   ║  Cada peca e unica.      ║  ← body-lg          ║
║                   ║  Criada para o seu       ║                     ║
║                   ║  espaco.                 ║                     ║
║                   ║                          ║                     ║
║                   ║  [ SOLICITE SEU PROJETO ]║  ← Button Primary   ║
║                   ║                          ║                     ║
║                   ║         ∨ scroll         ║                     ║
║                   ╚══════════════════════════╝                     ║
║                                                     height: 100vh  ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: COLECAO EM DESTAQUE                                      ║
║  ─── gold divider (48px) ───                                       ║
║  "Pecas que transformam ambientes"  ← H2                           ║
║                                                                    ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          ║
║  │  [img]   │  │  [img]   │  │  [img]   │  │  [img]   │          ║
║  │  Berlin  │  │  Vienna  │  │  Prague  │  │  Milan   │          ║
║  │  R$18.9k │  │  R$22.5k │  │  R$26k  │  │  R$15k  │          ║
║  │  [CTA]   │  │  [CTA]   │  │  [CTA]   │  │  [CTA]   │          ║
║  └──────────┘  └──────────┘  └──────────┘  └──────────┘          ║
║                                                                    ║
║  Mobile: horizontal scroll / swipe                                 ║
║  Desktop: 4-col grid                                               ║
║                                                                    ║
║  [ VER TODA COLECAO → ]  ← Button Secondary, centered             ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: ARTESANATO TEASER (split layout)                         ║
║                                                                    ║
║  ┌──────────────────────┬──────────────────────────────┐          ║
║  │                      │                              │          ║
║  │   [Workshop Photo]   │  Tradição Naval,             │          ║
║  │   aspect-ratio: 3/4  │  Arte em Madeira  ← H2      │          ║
║  │                      │                              │          ║
║  │                      │  Em Itajaí, berço da         │          ║
║  │                      │  construção naval catarinense│          ║
║  │                      │  cada mesa nasce das mãos    │          ║
║  │                      │  de artesãos... ← body-lg    │          ║
║  │                      │                              │          ║
║  │                      │  ① Consulta                  │          ║
║  │                      │  ② Design                    │          ║
║  │                      │  ③ Selecao        ← peek     │          ║
║  │                      │                              │          ║
║  │                      │  [ CONHECA O ATELIER → ]     │          ║
║  │                      │                              │          ║
║  └──────────────────────┴──────────────────────────────┘          ║
║                                                                    ║
║  Mobile: stacked (image on top, text below)                        ║
║  Desktop: 50/50 split, image left, text right                      ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: NUMBERS BAR (social proof strip)                         ║
║  bg: #1A1A1E                                                       ║
║                                                                    ║
║  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  ║
║  │   200+     │  │    6       │  │    8+      │  │   100%     │  ║
║  │  Mesas     │  │  Modelos   │  │  Madeiras  │  │  Sob Medida│  ║
║  │  Entregues │  │ Exclusivos │  │  Nobres    │  │            │  ║
║  └────────────┘  └────────────┘  └────────────┘  └────────────┘  ║
║                                                                    ║
║  Number: display-sm (48px), gold                                   ║
║  Label: label-md, text-secondary                                   ║
║  Layout: 4-col (desktop), 2x2 grid (mobile)                       ║
║  Animation: count-up on scroll intersection                        ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: PROJETOS REALIZADOS                                      ║
║  ─── gold divider ───                                              ║
║  "Ambientes transformados"  ← H2                                   ║
║                                                                    ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐                        ║
║  │          │  │          │  │          │                        ║
║  │  [foto]  │  │  [foto]  │  │  [foto]  │                        ║
║  │          │  │          │  │          │                        ║
║  │ overlay: │  │          │  │          │                        ║
║  │ Familia  │  │          │  │          │                        ║
║  │ Silva    │  │          │  │          │                        ║
║  │ Fpolis   │  │          │  │          │                        ║
║  └──────────┘  └──────────┘  └──────────┘                        ║
║                                                                    ║
║  3-col grid, images with hover overlay showing client + city       ║
║  [ VER TODOS PROJETOS → ]  ← Button Secondary                     ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: DEPOIMENTOS                                              ║
║  ─── gold divider ───                                              ║
║  "O que nossos clientes dizem"  ← H2                              ║
║                                                                    ║
║  ◄  [TestimonialCard]  [TestimonialCard]  [TestimonialCard]  ►    ║
║                   ●  ○  ○  ○                                       ║
║                                                                    ║
║  Carousel: 1 card mobile, 2 tablet, 3 desktop                     ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: CTA FINAL                                                ║
║  bg: linear-gradient(135deg, #D4AF37 0%, #8A6F3A 100%)            ║
║                                                                    ║
║          Transforme seu espaco   ← H2, #0B0B0F                    ║
║                                                                    ║
║          Solicite um projeto sob medida                            ║
║          e receba uma proposta exclusiva.  ← body-lg, #0B0B0F     ║
║                                                                    ║
║          [  FALE COM NOSSO ATELIER  ]  ← Button (dark variant)    ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  FOOTER (4-column layout — see organism spec)                      ║
║                                                                    ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Home Page Notes:**
- Total sections: 7 (Hero, Collection, Artesanato, Numbers, Projetos, Depoimentos, CTA Final) + Header/Footer
- Estimated scroll depth: ~5x viewport on desktop
- All sections animate on scroll intersection (fade-up, 600ms, staggered children)
- WhatsApp FAB visible on all sections after hero

---

## COLECAO PAGE (`/colecao`)

```
╔══════════════════════════════════════════════════════════════════════╗
║  HEADER (solid bg, not transparent — no hero video)                ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: PAGE HEADER                                              ║
║  py: 96px (top includes header offset 80px)                        ║
║                                                                    ║
║          Nossa Colecao  ← H1                                       ║
║          ─── gold divider ───                                      ║
║          Cada peca, uma historia unica  ← body-lg, text-secondary ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  FILTER TABS                                                       ║
║                                                                    ║
║  [ TODAS ]  [ MESAS DE BILHAR ]  [ PEBOLIM ]  [ ACESSORIOS ]      ║
║    active      inactive           inactive      inactive           ║
║                                                                    ║
║  Active: gold text + gold underline                                ║
║  Inactive: text-secondary, hover gold                              ║
║  Font: Label, uppercase, tracking 0.1em                            ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  PRODUCT GRID                                                      ║
║                                                                    ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            ║
║  │              │  │              │  │              │            ║
║  │  [img 4:3]   │  │  [img 4:3]   │  │  [img 4:3]   │            ║
║  │              │  │              │  │              │            ║
║  │  SOB MEDIDA  │  │              │  │  LANCAMENTO  │            ║
║  │  Mesa Berlin │  │  Mesa Vienna │  │  Mesa Prague │            ║
║  │  Elegancia.. │  │  Classica.. │  │  Moderna...  │            ║
║  │  R$ 18.900   │  │  R$ 22.500  │  │  R$ 26.000  │            ║
║  │  [CONHECER]  │  │  [CONHECER]  │  │  [CONHECER]  │            ║
║  └──────────────┘  └──────────────┘  └──────────────┘            ║
║                                                                    ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            ║
║  │  ...more     │  │  ...more     │  │  ...more     │            ║
║  └──────────────┘  └──────────────┘  └──────────────┘            ║
║                                                                    ║
║  Grid: 1-col (mobile), 2-col (768px), 3-col (1280px)              ║
║  Gap: 32px                                                         ║
║  Animation: staggered fade-up on load (100ms delay per card)       ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  CTA SECTION (condensed)                                           ║
║  "Nao encontrou o modelo ideal?"                                   ║
║  "Criamos pecas totalmente exclusivas."                            ║
║  [ SOLICITE UM PROJETO SOB MEDIDA ]                                ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║  FOOTER                                                            ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## PRODUTO PAGE (`/colecao/[slug]`)

```
╔══════════════════════════════════════════════════════════════════════╗
║  HEADER (solid bg)                                                 ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  BREADCRUMB: Colecao > Mesas de Bilhar > Mesa Berlin               ║
║  Font: body-sm, text-secondary, gold on hover                      ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: PRODUCT HERO (2-column)                                  ║
║                                                                    ║
║  ┌─────────────────────────────┬──────────────────────────┐        ║
║  │                             │                          │        ║
║  │  ┌───────────────────────┐  │  SOB MEDIDA  ← Badge     │        ║
║  │  │                       │  │                          │        ║
║  │  │   MAIN IMAGE          │  │  Mesa Berlin  ← H1       │        ║
║  │  │   aspect-ratio: 4/3   │  │  ─── gold divider ───   │        ║
║  │  │                       │  │                          │        ║
║  │  │   (click → lightbox)  │  │  "Elegancia em cada      │        ║
║  │  │                       │  │   detalhe. Linhas         │        ║
║  │  └───────────────────────┘  │   contemporaneas que      │        ║
║  │                             │   dialogam com qualquer   │        ║
║  │  [thumb] [thumb] [thumb]    │   ambiente."  ← body-lg   │        ║
║  │  [thumb] [thumb]            │                          │        ║
║  │                             │  A partir de              │        ║
║  │  Thumbnails: 64px, 8px gap  │  R$ 18.900  ← PriceTag   │        ║
║  │  Active: gold border        │                          │        ║
║  │  Inactive: 50% opacity      │  [SOLICITE SEU PROJETO]  │        ║
║  │                             │  ← Button Primary lg     │        ║
║  │                             │                          │        ║
║  │                             │  [W FALE PELO WHATSAPP]  │        ║
║  │                             │  ← WhatsApp Inline       │        ║
║  │                             │                          │        ║
║  └─────────────────────────────┴──────────────────────────┘        ║
║                                                                    ║
║  Mobile: stacked (gallery full-width, info below)                  ║
║  Desktop: 55% gallery / 45% info, gap 48px                         ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: ESPECIFICACOES TECNICAS                                  ║
║  bg: #1A1A1E                                                       ║
║                                                                    ║
║  "Especificacoes"  ← H2                                            ║
║                                                                    ║
║  ┌────────────────┬──────────────────────────────────┐             ║
║  │ Dimensoes      │ 2.40m x 1.40m x 0.82m (oficial) │             ║
║  ├────────────────┼──────────────────────────────────┤             ║
║  │ Peso           │ Aprox. 380kg                     │             ║
║  ├────────────────┼──────────────────────────────────┤             ║
║  │ Madeira        │ Ipe, Cumaru, Freijo (opcoes)     │             ║
║  ├────────────────┼──────────────────────────────────┤             ║
║  │ Pedra          │ Ardosia italiana 25mm             │             ║
║  ├────────────────┼──────────────────────────────────┤             ║
║  │ Tecido         │ Simonis 860 (24 cores)           │             ║
║  ├────────────────┼──────────────────────────────────┤             ║
║  │ Tamanhos       │ Oficial, Semi-oficial, Snooker   │             ║
║  └────────────────┴──────────────────────────────────┘             ║
║                                                                    ║
║  Label column: Label font, gold, uppercase                         ║
║  Value column: body-md, text-primary                               ║
║  Row divider: 1px solid rgba(212,175,55,0.1)                       ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: PERSONALIZACAO                                           ║
║                                                                    ║
║  "Personalize sua peca"  ← H2                                      ║
║                                                                    ║
║  MADEIRA:                                                          ║
║  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                        ║
║  │ Ipe │ │Cuma.│ │Frei.│ │Teca │ │Nogu.│                        ║
║  │[img]│ │[img]│ │[img]│ │[img]│ │[img]│                        ║
║  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                        ║
║  Circular swatches: 56px, border on selected (gold 2px)            ║
║  Label below each swatch: label-sm                                 ║
║                                                                    ║
║  TECIDO:                                                           ║
║  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                      ║
║  │  │ │  │ │  │ │  │ │  │ │  │ │  │ │  │  ... (24 cores)       ║
║  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ └──┘                      ║
║  Color swatches: 32px circles, selected = gold ring                ║
║  Tooltip on hover: color name                                      ║
║                                                                    ║
║  TAMANHO:                                                          ║
║  [ Oficial ]  [ Semi-oficial ]  [ Snooker ]                        ║
║  Pill-style radio buttons, selected = gold bg                      ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: PECAS RELACIONADAS                                       ║
║  "Voce tambem pode gostar"  ← H3                                  ║
║                                                                    ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐                        ║
║  │ProductCrd│  │ProductCrd│  │ProductCrd│                        ║
║  └──────────┘  └──────────┘  └──────────┘                        ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║  FOOTER                                                            ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## ATELIER PAGE (`/atelier`)

```
╔══════════════════════════════════════════════════════════════════════╗
║  HEADER (transparent over hero)                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: HERO (workshop photo, not video)                         ║
║  height: 70vh                                                      ║
║                                                                    ║
║  ┌──────────────────────────────────────────────────────────┐      ║
║  │  [Workshop panoramic photo]                              │      ║
║  │  Overlay gradient (bottom heavier)                       │      ║
║  │                                                          │      ║
║  │      Nosso Atelier  ← display-md                         │      ║
║  │      ─── gold divider ───                                │      ║
║  │      Onde a madeira ganha alma  ← body-lg                │      ║
║  └──────────────────────────────────────────────────────────┘      ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: ORIGIN STORY (split)                                     ║
║                                                                    ║
║  ┌──────────────────────┬──────────────────────────────┐          ║
║  │                      │                              │          ║
║  │  De Itajai para o    │  [Photo: Itajai harbor or    │          ║
║  │  Brasil  ← H2        │   shipyard historical]       │          ║
║  │                      │                              │          ║
║  │  Em Santa Catarina,  │  aspect-ratio: 4/3           │          ║
║  │  a tradicao da       │                              │          ║
║  │  construcao naval    │                              │          ║
║  │  corre nas veias...  │                              │          ║
║  │                      │                              │          ║
║  │  body-lg, 3-4        │                              │          ║
║  │  paragraphs          │                              │          ║
║  └──────────────────────┴──────────────────────────────┘          ║
║                                                                    ║
║  Text left / Image right (desktop); stacked (mobile)               ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: PROCESSO DE CRIACAO                                      ║
║  bg: #1A1A1E                                                       ║
║                                                                    ║
║  "Como uma peca nasce"  ← H2                                       ║
║                                                                    ║
║  ①──────②──────③──────④──────⑤──────⑥                            ║
║  Consul. Design Mater. Criacao Acabam. Entrega                     ║
║                                                                    ║
║  ProcessTimeline organism (see component spec)                     ║
║  Each step has: icon/illustration, title, 2-3 line description     ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: MATERIAIS                                                ║
║                                                                    ║
║  "Materiais nobres, escolhidos a dedo"  ← H2                      ║
║                                                                    ║
║  MADEIRAS:                                                         ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          ║
║  │  [foto]  │  │  [foto]  │  │  [foto]  │  │  [foto]  │          ║
║  │  Ipe     │  │  Cumaru  │  │  Freijo  │  │  Teca    │          ║
║  │  Descr.. │  │  Descr.. │  │  Descr.. │  │  Descr.. │          ║
║  └──────────┘  └──────────┘  └──────────┘  └──────────┘          ║
║                                                                    ║
║  TECIDOS:                                                          ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐                        ║
║  │ [foto]   │  │ [foto]   │  │ [foto]   │                        ║
║  │ Simonis  │  │ Gorina   │  │ Iwan     │                        ║
║  │ 860      │  │ Granito  │  │ Simonis  │                        ║
║  └──────────┘  └──────────┘  └──────────┘                        ║
║                                                                    ║
║  Cards: image (square), name (H4), short description (body-sm)     ║
║  Grid: 4-col desktop, 2-col mobile                                 ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: ARTESAOS                                                 ║
║                                                                    ║
║  "Os mestres por tras de cada peca"  ← H2                          ║
║                                                                    ║
║  ┌──────────────────────────────────────────────────────────┐      ║
║  │  [Wide photo: team working in workshop]                  │      ║
║  │  aspect-ratio: 21/9                                      │      ║
║  └──────────────────────────────────────────────────────────┘      ║
║                                                                    ║
║  "Uma equipe de X artesaos com mais de Y anos de                   ║
║   experiencia combinada..."  ← body-lg, centered, max-w 640px     ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: CTA                                                      ║
║  (Reuse CTA Final organism from Home)                              ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║  FOOTER                                                            ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## PROJETOS PAGE (`/projetos`)

```
╔══════════════════════════════════════════════════════════════════════╗
║  HEADER (solid)                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: PAGE HEADER                                              ║
║                                                                    ║
║          Projetos Realizados  ← H1                                 ║
║          ─── gold divider ───                                      ║
║          Ambientes transformados por todo o Brasil  ← body-lg      ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  FILTERS                                                           ║
║                                                                    ║
║  Cidade: [ Todas ▾ ]  Modelo: [ Todos ▾ ]  Ano: [ Todos ▾ ]      ║
║                                                                    ║
║  Select dropdowns: bg #1A1A1E, border gold-deep, text primary      ║
║  Active filter: gold border                                        ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  PROJECT GRID                                                      ║
║                                                                    ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            ║
║  │              │  │              │  │              │            ║
║  │  [installed  │  │  [installed  │  │  [installed  │            ║
║  │   table      │  │   table      │  │   table      │            ║
║  │   photo]     │  │   photo]     │  │   photo]     │            ║
║  │              │  │              │  │              │            ║
║  │  hover:      │  │              │  │              │            ║
║  │  overlay     │  │              │  │              │            ║
║  │  Fam. Silva  │  │              │  │              │            ║
║  │  Fpolis, SC  │  │              │  │              │            ║
║  │  Mesa Berlin │  │              │  │              │            ║
║  └──────────────┘  └──────────────┘  └──────────────┘            ║
║                                                                    ║
║  Cards: aspect-ratio 4/3                                           ║
║  Hover overlay: gradient from bottom, client name + city + model   ║
║  Grid: 1 (mobile), 2 (tablet), 3 (desktop)                        ║
║  Gap: 24px                                                         ║
║                                                                    ║
║  BEFORE/AFTER capability:                                          ║
║  Some cards have a "Antes e Depois" badge                          ║
║  Click opens a comparison slider (drag handle, split view)         ║
║                                                                    ║
║  PAGINATION or "Carregar mais" button at bottom                    ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║  CTA + FOOTER                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## BLOG PAGE (`/blog`)

```
╔══════════════════════════════════════════════════════════════════════╗
║  HEADER (solid)                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: FEATURED POST                                            ║
║                                                                    ║
║  ┌──────────────────────────────┬─────────────────────────┐        ║
║  │                              │                         │        ║
║  │  [Featured post image]       │  CUIDADOS  ← Badge      │        ║
║  │  aspect-ratio: 16/9          │                         │        ║
║  │                              │  Como manter sua mesa   │        ║
║  │                              │  de bilhar em perfeito  │        ║
║  │                              │  estado  ← H2            │        ║
║  │                              │                         │        ║
║  │                              │  16 de Abril, 2026      │        ║
║  │                              │  ← body-sm, secondary   │        ║
║  │                              │                         │        ║
║  │                              │  Preview text here...   │        ║
║  │                              │  ← body-md              │        ║
║  │                              │                         │        ║
║  │                              │  [ LER ARTIGO → ]       │        ║
║  └──────────────────────────────┴─────────────────────────┘        ║
║                                                                    ║
║  Mobile: stacked. Desktop: 60/40 split.                            ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: POST GRID                                                ║
║                                                                    ║
║  CATEGORIES: [Todos] [Cuidados] [Design] [Inspiracao] [Materiais] ║
║  (filter tabs like collection page)                                ║
║                                                                    ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            ║
║  │  [img 16:9]  │  │  [img 16:9]  │  │  [img 16:9]  │            ║
║  │              │  │              │  │              │            ║
║  │  DESIGN      │  │  MATERIAIS   │  │  INSPIRACAO  │            ║
║  │  Post title  │  │  Post title  │  │  Post title  │            ║
║  │  here...     │  │  here...     │  │  here...     │            ║
║  │              │  │              │  │              │            ║
║  │  12 Abr 2026 │  │  08 Abr 2026│  │  01 Abr 2026│            ║
║  └──────────────┘  └──────────────┘  └──────────────┘            ║
║                                                                    ║
║  Card: image + category badge + H4 title + date                    ║
║  No excerpt in grid (too noisy), only on featured                  ║
║  Grid: 1 (mobile), 2 (tablet), 3 (desktop)                        ║
║  Hover: image zoom 1.05, title turns gold                          ║
║                                                                    ║
║  PAGINATION: "Carregar mais" button                                ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║  FOOTER                                                            ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## CONTATO PAGE (`/contato`)

```
╔══════════════════════════════════════════════════════════════════════╗
║  HEADER (solid)                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: PAGE HEADER                                              ║
║                                                                    ║
║          Fale Conosco  ← H1                                        ║
║          ─── gold divider ───                                      ║
║          Estamos prontos para criar a sua peca  ← body-lg          ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: CONTACT SPLIT                                            ║
║                                                                    ║
║  ┌────────────────────────────┬───────────────────────────┐        ║
║  │                            │                           │        ║
║  │  FORM                      │  INFORMACOES              │        ║
║  │                            │                           │        ║
║  │  Nome *                    │  [W] WHATSAPP             │        ║
║  │  ┌──────────────────────┐  │  (47) 99999-9999          │        ║
║  │  │                      │  │  ← large, prominent       │        ║
║  │  └──────────────────────┘  │                           │        ║
║  │                            │  EMAIL                    │        ║
║  │  Telefone *                │  contato@tocks.com.br     │        ║
║  │  ┌──────────────────────┐  │                           │        ║
║  │  │                      │  │  ENDERECO                 │        ║
║  │  └──────────────────────┘  │  Rua ..., 123             │        ║
║  │                            │  Itajai, SC               │        ║
║  │  Email                     │  CEP 88300-000            │        ║
║  │  ┌──────────────────────┐  │                           │        ║
║  │  │                      │  │  HORARIO                  │        ║
║  │  └──────────────────────┘  │  Seg-Sex: 8h-18h          │        ║
║  │                            │  Sab: 9h-13h              │        ║
║  │  Modelo de interesse       │                           │        ║
║  │  ┌──────────────────┐ ▾    │  REDES SOCIAIS            │        ║
║  │  │ Selecione...     │      │  [IG] [FB] [YT]          │        ║
║  │  └──────────────────┘      │                           │        ║
║  │                            │                           │        ║
║  │  Mensagem                  │                           │        ║
║  │  ┌──────────────────────┐  │                           │        ║
║  │  │                      │  │                           │        ║
║  │  │                      │  │                           │        ║
║  │  └──────────────────────┘  │                           │        ║
║  │                            │                           │        ║
║  │  [ ENVIAR MENSAGEM ]       │                           │        ║
║  │  ← Button Primary          │                           │        ║
║  │                            │                           │        ║
║  └────────────────────────────┴───────────────────────────┘        ║
║                                                                    ║
║  Form inputs: bg #1A1A1E, border 1px #2A2A2E, focus border gold    ║
║  Labels: Label font, 12px, uppercase, text-secondary               ║
║  Input text: body-md, text-primary                                 ║
║  Input height: 48px, padding 12px 16px                             ║
║  Textarea: min-height 120px                                        ║
║  Mobile: stacked (form above, info below)                          ║
║  Desktop: 55/45 split                                              ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: MAP                                                      ║
║                                                                    ║
║  ┌──────────────────────────────────────────────────────────┐      ║
║  │                                                          │      ║
║  │  [Google Maps Embed - dark theme / grayscale filter]     │      ║
║  │  height: 400px                                           │      ║
║  │  border-radius: 8px                                      │      ║
║  │                                                          │      ║
║  └──────────────────────────────────────────────────────────┘      ║
║                                                                    ║
║  Map style: grayscale + dark, gold pin marker                      ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  SECTION: FAQ                                                      ║
║  bg: #1A1A1E                                                       ║
║                                                                    ║
║  "Perguntas Frequentes"  ← H2                                      ║
║                                                                    ║
║  ┌──────────────────────────────────────────────────────┐          ║
║  │  Qual o prazo de entrega?                       [+]  │          ║
║  ├──────────────────────────────────────────────────────┤          ║
║  │  Posso escolher o tipo de madeira?              [+]  │          ║
║  ├──────────────────────────────────────────────────────┤          ║
║  │  Voces entregam em todo o Brasil?               [+]  │          ║
║  ├──────────────────────────────────────────────────────┤          ║
║  │  Como funciona o processo de criacao?            [+]  │          ║
║  ├──────────────────────────────────────────────────────┤          ║
║  │  Qual a garantia das pecas?                     [+]  │          ║
║  ├──────────────────────────────────────────────────────┤          ║
║  │  Posso visitar o atelier?                       [+]  │          ║
║  ├──────────────────────────────────────────────────────┤          ║
║  │  Quais formas de pagamento?                     [+]  │          ║
║  ├──────────────────────────────────────────────────────┤          ║
║  │  A mesa precisa de manutencao?                  [+]  │          ║
║  ├──────────────────────────────────────────────────────┤          ║
║  │  Voces fazem mesas de pebolim tambem?           [+]  │          ║
║  ├──────────────────────────────────────────────────────┤          ║
║  │  Como solicito um orcamento?                    [+]  │          ║
║  └──────────────────────────────────────────────────────┘          ║
║                                                                    ║
║  FAQAccordion organism, max-width 800px, centered                  ║
║  10 questions                                                      ║
║                                                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║  FOOTER                                                            ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## Page Summary

| Page | Route | Sections | Estimated Scroll |
|------|-------|----------|-----------------|
| Home | `/` | 7 + header/footer | 5x viewport |
| Colecao | `/colecao` | 3 + header/footer | 2-4x viewport |
| Produto | `/colecao/[slug]` | 4 + header/footer | 3x viewport |
| Atelier | `/atelier` | 6 + header/footer | 4x viewport |
| Projetos | `/projetos` | 3 + header/footer | 3-5x viewport |
| Blog | `/blog` | 3 + header/footer | 3x viewport |
| Contato | `/contato` | 4 + header/footer | 3x viewport |
