---
project: tocks
asset_root: docs/projects/tocks/assets/
created: 2026-05-06 (Orion triage)
total_size: ~1.4 GB unpacked (gitignored except this MANIFEST + SVG logos)
source: User dropped 2 ZIPs + 28 WhatsApp photos via Downloads on 06/Mai 11h
---

# Tocks — Master Asset Library

This is the **canonical asset library** for Tocks. Everything brand/photo/video lives here.
The directory is gitignored except for this MANIFEST and SVG logos (small, vector, durable).
Photos/videos/HEIC/PSD/DOCX/fonts ZIP are **local-only** — back up via Drive/external storage.

## Directory map

```
docs/projects/tocks/assets/
├── MANIFEST.md                      ← (versioned)
├── master-drive/                    ← ZIP 1 (drive-download, 957 MB unpacked)
│   ├── Identidade Visual/
│   │   ├── Tocks/                   ← brand canon (versioned SVGs)
│   │   │   ├── Logos/tocks-logo.svg
│   │   │   ├── Símbolo/Simbolo-Branco-TOCKS.svg
│   │   │   ├── Símbolo/Simobolo-Azul-TOCKS.svg
│   │   │   ├── Símbolo/Simobolo-Dourado-TOCKS.svg
│   │   │   ├── Fontes/Libre_Caslon_Text.zip   ← official display
│   │   │   ├── Fontes/Poppins.zip             ← official body/UI
│   │   │   ├── Documentos - Papel Timbrado/   ← DOCX + PNG fundos
│   │   │   └── Apresentação/                  (empty)
│   │   └── Skara/                   ← sub-brand
│   │       ├── Logos/Logo{1,2}-{Azul,Branca}-SKARA.svg
│   │       └── Papelaria/  (3 DOCX)
│   └── Fotos/
│       ├── 001 - Arquivos recebidos/  ← raw (364 jpg, 41 HEIC, 111 MP4, 11 MOV)
│       │   ├── Pasta padrão da Skara/
│       │   └── Renders/
│       ├── 002 - Organização produtos/  ← curated by linha (see product matrix below)
│       └── Opções de acabamento Skara/
│           ├── Madeiras/  (10 PNG)
│           └── Tecidos/   (16 PNG)
├── material-apoio-2022/             ← ZIP 2 (Material de apoio, 430 MB unpacked)
│   └── Material de apoio/           ← legacy 2022 photos (205 HEIC iPhone, 279 jpg, 2 MOV, 1 MP4)
│       ├── Sinuca Contemporanea/
│       ├── Sinuca gabe/Sinuca monaco/
│       └── Sinuca nobus/
├── whatsapp-17abr-renders/          ← 28 WhatsApp images dated 17/Abr 2026
└── (formerly _unpack-* dirs — renamed to canonical names above)
```

## Brand canon

| Asset | Path | Use |
|---|---|---|
| Logo Tocks | `master-drive/Identidade Visual/Tocks/Logos/tocks-logo.svg` | Primary brand mark |
| Símbolo Branco | `…/Símbolo/Simbolo-Branco-TOCKS.svg` | Dark backgrounds |
| Símbolo Azul | `…/Símbolo/Simobolo-Azul-TOCKS.svg` | Light backgrounds primary |
| Símbolo Dourado | `…/Símbolo/Simobolo-Dourado-TOCKS.svg` | Premium/luxury context |
| Display font | Libre Caslon Text (zip) | Headlines, editorial display |
| Body/UI font | Poppins (zip) | Paragraphs, navigation, UI |

**Note (typo in source):** filenames `Simobolo-Azul/Dourado-TOCKS.svg` have typo (should be `Simbolo`). Branco is correct. Preserve as-is — these are the source-of-truth filenames.

## Product photo matrix

Photos in `master-drive/Fotos/002 - Organização produtos/` are the **curated commercial library**.
Subfolders named `No`, `no`, or `NO` = rejected/alternates (do not use without verification).

### Linha Premium (10 modelos)

| Modelo | Photos curated | Notes |
|---|---|---|
| Mesa de Bilhar Aparato Alto Padrão | 2 | |
| Mesa de Bilhar Elemento Personalizada | 2 | |
| Mesa de Bilhar Gabe Madeira Maciça | 3 (+4 in /No) | |
| Mesa de Bilhar Modern – Inox Premium | 3 (+4 in /no) | |
| Mesa de Bilhar Tenro Luxo | 3 | |
| Mesa de Sinuca e Jantar Dubai | 1 | low coverage |
| Mesa de Sinuca e jantar Mônaco Premium | 5 (+4 in /NO) | best-covered |
| Mesa de Sinuca Harley Moderna | 4 (+4 in /no) | |
| Mesa de Sinuca Nobus Premium | 4 (+4 in /no) | |
| Mesa de Sinuca Rustic Madeira Maciça | 3 | |

### Linha Criativa (4 modelos)

| Modelo | Photos curated |
|---|---|
| Mesa de Sinuca Berlin Alto Padrão | 3 |
| Mesa de Sinuca Contemporânea Premium | 4 |
| Mesa de Sinuca e Jantar Master Madeira Maciça | 2 |
| Mesa de Sinuca Modern Premium | 3 |

## Skara finishes

`master-drive/Fotos/Opções de acabamento Skara/`

- **Madeiras (10):** Angelin, Canelão, Carvalho Branco Linheiro, Cerejeira, Ebano Linheiro, Freijo, Goiabão Escuro, Itaúba, Marupa, Wengue
- **Tecidos (16):** códigos numéricos 102, 103-91, 143-1, 145-9, 148-91, 154-9, 191-801, 212-23, 247-24, 269-9, 269-21, 275-9, 284, 300-1, 309, 310

## Video assets (raw — needs curation)

`master-drive/Fotos/001 - Arquivos recebidos/`

- **111 MP4** + **11 MOV** (~520 MB) — uncategorized. Likely candidates for hero video on v4 site.
- Action: needs viewing pass to identify hero candidates (60-90s b-roll vs 5-10s loops).

## HEIC conversion needed

| Folder | HEIC count | Conversion target |
|---|---|---|
| master-drive/Fotos/001 | 41 | JPG/WebP for web use |
| material-apoio-2022/Material de apoio | 205 | JPG/WebP if/when promoted to use |

Conversion command: `magick mogrify -format jpg -quality 90 *.HEIC` (ImageMagick).
Or batch via Sharp/heic-convert in Node.

## Dados de acesso (sensitive — keep local)

`master-drive/Dados de acesso/` — CNPJ, CNH-e, Tocks Custom credentials. **NEVER commit.** Already gitignored.

## v4-fantastic implications

### Substitui placeholders nas 3 teses

| Thesis | Placeholder atual | Substitui por (real) |
|---|---|---|
| A — Editorial Magazine | Cardo italic + DM Sans | **Libre Caslon Text** (display) + **Poppins** (body) |
| B — Dark Gallery Theater | Big Shoulders Display 900 | Libre Caslon Text Bold (test) — verificar peso disponível |
| C — Underground Biennale | Space Grotesk + Crimson Pro | Reavaliar — Libre Caslon não bate com brutalist; manter Space Grotesk se squad escolheu |

### Resolve risco "fotos comerciais com filter CSS"

Thesis A/B/C reports flagaram que `/produtos/vertice/` e `/produtos/elipse/` usavam filter CSS sutil pra dar mood. Agora pode-se:

1. **Mapear** modelos atuais Vértice/Elipse → modelos do photo library:
   - Vértice = ?
   - Elipse = ?
   - **Action user:** confirmar correspondência ou se Vértice/Elipse são renames de modelos existentes
2. **Promover** photos curated da Linha Premium pros heroes da v4
3. **Substituir** product photos com filter por sources reais sem manipulação extra

### Skara — decisão 06/Mai

Recomendação subagent: **SEPARATE site** (skara.com.br), confiança MEDIUM-HIGH.
Razão principal: papelaria DOCX + 16×10 catálogo configurador-heavy = B2B/contratual; clash com editorial-luxury Tocks v4 (≤4 cores, 200px headlines, narrativa).

Ação: NÃO bloquear escolha de thesis v4 por causa de Skara. Stub page 30min se necessário; defer real Skara app pós-launch Tocks v4.

**Pergunta crítica pendente user:** Skara é (a) sub-brand mesmo CNPJ Tocks Custom, (b) sister company separada, (c) brand pra canal B2B/projeto-fechado vs Tocks DTC?

Detalhes completos: `docs/projects/tocks/v4-fantastic/research/skara-decision-06mai.md`

### Mapeamento Vértice/Elipse — 06/Mai

| Nome canon thesis | Real model master-drive | Razão |
|---|---|---|
| **Vértice** | **Mesa de Bilhar Gabe Madeira Maciça** | "geometria angular em madeira maciça" → A-frame trestle wood |
| **Elipse** | **Mesa de Bilhar Aparato Alto Padrão** | "base curva contínua" → wave-form continuous base (match exato) |

Photos promovidas pra `/apps/tocks-website/public/produtos/{vertice,elipse}/`:
- Backup placeholder antigos em `/public/produtos/_legacy-placeholder/`
- Vértice: hero (Gabe-003 outdoor twilight), lifestyle (Gabe-001 indoor pool), gallery-02 (Gabe-000 cutout), gallery-04 (Gabe-001)
- Elipse: hero (Aparato-001 black wave on marble), detail-base (Aparato-002 white wave), lifestyle (Aparato-002)

### Fontes oficiais aplicadas — 06/Mai

| Thesis | Antes | Agora |
|---|---|---|
| A — Editorial | Cardo + DM Sans (Google) | **Libre Caslon Text + Poppins** (oficiais via next/font/local) |
| B — Dark Gallery | Big Shoulders Display CSS-only | **Poppins** body (oficial) + Big Shoulders display fallback + Libre Caslon disponível como italic acento |
| C — Underground | Space Grotesk + Crimson Pro | **Mantido** (brutalist grotesque não bate com Caslon serif) |

Fontes copiadas pra `apps/tocks-website/public/fonts/`:
- `libre-caslon-text/` (Regular + Italic + Bold = 3 TTF + OFL.txt) ~280 KB
- `poppins/` (18 weights: Thin/ExtraLight/Light/Regular/Medium/SemiBold/Bold/ExtraBold/Black + italics) ~3 MB

### Vídeos — auditoria 06/Mai

122 raw videos auditados via ffprobe. ~78% (~95 files) são WhatsApp-comprimidos 848x480 (rejeitados, fail >=720p).

**Top 3 hero (16:9 1920x1080 H.264 30fps):**
1. `IMG_5112.mov` 42.8s 76.9 MB — narrative master, longest HD clip
2. `IMG_0895.mov` 26.8s 45.4 MB — clean hero loop length
3. `IMG_5113.mov` 26.3s 47.0 MB — alt angle pair de #1

**Top 3 Stories/Reels (9:16 1080x1920):** 3 vertical MP4s da batch `VIDEO-2024-04-13-*` (10-12s, coherent shoot).

**Gaps flagados:** pasta `Renders/` vazia; sem master 4K; sem drone/dolly. Recomendação: requisitar originais ao photographer/Skara pras tomadas críticas.

Detalhes completos: `docs/projects/tocks/v4-fantastic/research/video-curation-06mai.md`

### HEIC conversion — deferred

ImageMagick `magick` NÃO está instalado nesta máquina. Conversão dos 246 HEIC files (41 master + 205 legacy) deferida. Caminhos quando precisar:
- `npm i -g heic-convert && find ... -name '*.HEIC' -exec heic-convert {} {}.jpg \;`
- Sharp via Node script
- Online batch (manual)

## Backup recommendation

Original ZIPs ainda estão em `C:\Users\kingp\Downloads\` — manter como backup ou mover pra external drive.
