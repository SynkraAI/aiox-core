# Enscape Renders Integration — 2026-05-01

## Source

5 PNG renders Enscape entregues pelo user (pasta Drive `20260501T142700Z-3-001/Imagens diversas/`):

| Arquivo origem | Tamanho raw | Cena | Slug saída |
|---|---|---|---|
| `Enscape_2024-08-15-13-29-55_Scene 24.png` | 9.7 MB | Adega + sofá camel + cortinas (parede de garrafas) | `adega-sofa.jpg` |
| `Enscape_2024-08-15-13-31-12_Scene 27.png` | 11.4 MB | Vista pra piscina + planta tropical + banco bar | `vista-piscina.jpg` |
| `Enscape_2024-08-15-13-32-01_Scene 28.png` | 9.5 MB | Cozinha gourmet mármore preto + banquetas + mesa estendida | `cozinha-marmore.jpg` |
| `Enscape_2024-08-15-13-34-08_Scene 29.png` | 8.5 MB | Sala+cozinha integrada wide + poltrona camel | `cozinha-wide.jpg` |
| `Enscape_2024-08-15-13-34-58_vista 25.png` | 9.0 MB | Adega com cesta de bolas coloridas em primeiro plano | `adega-bolas-coloridas.jpg` |

Total raw: ~48 MB.

## Optimização

Pipeline `scripts/generate-enscape-renders.mjs` (sharp, mozjpeg q88, 1920w max):

| Saída | Tamanho otimizado |
|---|---|
| `adega-sofa.jpg` | 214.7 KB |
| `vista-piscina.jpg` | 291.2 KB |
| `cozinha-marmore.jpg` | 216.8 KB |
| `cozinha-wide.jpg` | 179.0 KB |
| `adega-bolas-coloridas.jpg` | 201.7 KB |

Total otimizado: ~1.1 MB (redução 97% do raw, hero-grade quality).
Destino: `apps/bretda-lp/public/img/ambientes-enscape/`.

## Decisão de Placement

**Página: `/atelier`** — nova seção "5.4-bis Ambientes" inserida entre Materials (5.4) e Social Proof (5.4b).

### Por que /atelier (não home)

1. **Coerência narrativa**: Home tem hero com vídeo bg + 11Ravens grid de SKUs. Renders Enscape são de **ambientes**, não SKU isolado — encaixam na narrativa "atelier que faz mesas pra casas reais".
2. **Heritage proof visual**: Logo após "Cada lote tem nome, idade e história" (Materials), os renders traduzem madeira nobre em **objeto vivendo numa casa**. Antes do depoimento da cliente Bruna (5.4b) — fluxo: madeira → casa → cliente real.
3. **Polaridade**: A seção usa `--color-charcoal-v2` background (igual a craft-wrap 5.3), criando ritmo cream→charcoal→cream→**charcoal**→cream→cream que dá pulso editorial.

### Por que masonry 3-col (1 tall + 4 normais)

Reuse da classe CSS existente `.eleven-masonry` (já definida em globals.css linhas 1115-1152, sem consumidor — IDS REUSE). Segue padrão 11Ravens-clone overnight (docs/projects/bretda-redesign/13-eleven-ravens-clone/).

Ordem das imagens (esquerda→direita, top→bottom):
1. **adega-sofa** (tall, span 2 rows) — primeira leitura, parede de garrafas + sofá vermelho-camel ancora a composição.
2. **vista-piscina** — quebra dark com luz natural + plantas verdes.
3. **cozinha-marmore** — mostra mesa em escala (estendida c/ banquetas).
4. **cozinha-wide** — wide-shot, contexto de uso social.
5. **adega-bolas-coloridas** — close em primeiro plano, fechamento sensorial (cor das bolas).

### O que NÃO foi feito (e por quê)

- **Não inseri na home**: home tem hero vídeo Cristine + grid 11Ravens já estabelecido. Adicionar masonry seria ruído.
- **Não adicionei como `lifestyleImage` em SKU específico**: as cenas mostram a mesma mesa (pedestal triangular dourado) repetida — não temos SKU correspondente nas 12 mesas em catálogo. Tratar como "vista do atelier" é honesto.
- **Não criei rota /showroom dedicada**: 5 renders não justifica página inteira. Seção dentro de /atelier é proporcional.

## Hard rules respeitadas

- ✅ `scene.ts` intocado.
- ✅ Fontes Google atuais (Cormorant, Raleway, Inter, Josefin) preservadas como fallback.
- ✅ Cormorant Garamond preservado como fallback de TAN Aegean.
- ✅ Stay on `main`.

## Arquivos modificados/criados

```
M  apps/bretda-lp/src/app/atelier/page.tsx                 (nova seção 5.4-bis Ambientes)
A  apps/bretda-lp/scripts/generate-enscape-renders.mjs     (pipeline sharp)
A  apps/bretda-lp/scripts/copy-fonts-from-drive.mjs        (helper one-shot fontes)
A  apps/bretda-lp/public/fonts/TAN-AEGEANRegular.woff2     (34.6 KB)
A  apps/bretda-lp/public/fonts/CenturyGothic-Regular.woff2 (55.0 KB)
A  apps/bretda-lp/public/fonts/CenturyGothic-Bold.woff2    (24.6 KB)
A  apps/bretda-lp/public/fonts/CenturyGothic-Italic.woff2  (28.6 KB)
A  apps/bretda-lp/public/fonts/CenturyGothic-BoldItalic.woff2 (53.2 KB)
A  apps/bretda-lp/public/img/ambientes-enscape/adega-sofa.jpg
A  apps/bretda-lp/public/img/ambientes-enscape/vista-piscina.jpg
A  apps/bretda-lp/public/img/ambientes-enscape/cozinha-marmore.jpg
A  apps/bretda-lp/public/img/ambientes-enscape/cozinha-wide.jpg
A  apps/bretda-lp/public/img/ambientes-enscape/adega-bolas-coloridas.jpg
M  apps/bretda-lp/src/app/globals.css                      (5 @font-face rules + comment update)
A  docs/projects/bretda-redesign/15-enscape-integration/01-decisions.md
```

## TODOs Sprint 2

1. Confirmar visualmente (Playwright before/after) que TAN Aegean carrega como display em hero/h2 e Century Gothic como body em parágrafos.
2. Se desejado, mover renders Enscape PNG raw pra fora de `/tmp/` (eles foram lidos do diretório de extract Drive). Já estão em controle de versão como JPEGs otimizados em `/public/img/ambientes-enscape/`.
3. Considerar adicionar 1-2 dos renders em `/colecao/[slug]` SKUs específicos quando o user produzir cenas com SKUs reais (Aurora/Opal/Espinela em ambiente fotográfico de casa).
4. Avaliar se vale criar uma "Galeria do Atelier" /atelier?ambientes — separada do core editorial, pra clientes inspirarem em mais ambientes.
