---
name: imagemagick
description: "A faca suíça do processamento de imagens. Se envolve pixel, o ImageMagick resolve."
  Processamento de imagens via CLI usando ImageMagick. Splitting de screenshots
  longas, resize, conversão de formatos, composição, watermark, batch processing,
  otimização e extração de metadados.
description_pt-BR: >-
  Processamento de imagens via linha de comando usando ImageMagick. Divisão de
  screenshots longas, redimensionamento, conversão de formatos, composição,
  marca d'água, processamento em lote, otimização e extração de metadados.
version: "2.0.0"
categories: [utility, image-processing, ocr-support]
allowed-tools: Read, Bash, Glob

category: design
tags: [SKILL]
---

# ImageMagick — Processamento de Imagens via CLI

> A faca suíça do processamento de imagens. Se envolve pixel, o ImageMagick resolve.

**Analogia:** O ImageMagick é como um Photoshop que funciona por comando de voz — você diz o que quer ("corta aqui", "diminui ali", "coloca marca d'água") e ele faz. Sem interface, sem clique, pura eficiência.

## Quando Usar

- Screenshot muito alta (>2000px) que precisa ser dividida para leitura
- Redimensionamento de imagens (thumbnails, redes sociais)
- Conversão entre formatos (PNG → JPEG, WebP → PNG, etc.)
- Composição de imagens (sobreposição, montagem, colagem)
- Adição de marca d'água ou texto em imagens
- Otimização de tamanho de arquivo (compressão)
- Processamento em lote de múltiplas imagens
- Extração de metadados (dimensões, formato, EXIF)
- Criação de favicons e ícones multi-resolução
- Geração de placeholders e imagens de teste

## Quando NÃO Usar

- Edição interativa/visual (use um editor gráfico)
- Processamento de vídeo (use FFmpeg)
- OCR de texto (use Tesseract — mas pode preparar a imagem aqui)
- Manipulação de PDFs complexos (use tools dedicadas)

## Dependências

| Tool | Path | Instalação | Verificação |
|------|------|------------|-------------|
| ImageMagick 7.x | `/opt/homebrew/bin/magick` | `brew install imagemagick` | `magick --version` |

---

## Discovery Questions

Perguntas antes de executar. Usar AskUserQuestion tool. Pular se o contexto já foi fornecido.

1. **Qual o objetivo? (dividir, redimensionar, converter, compor, otimizar)** — (cada operação tem parâmetros diferentes)
2. **Quais são os arquivos de entrada?** — (path, formato, quantidade)
3. **Há requisitos de qualidade ou tamanho máximo?** — (compressão vs qualidade) (opcional)

---

## 1. Image Splitting (Screenshots Longas)

O caso mais comum: screenshot alta demais que fica comprimida e ilegível.

### Passo a passo

```bash
# 1. Identificar dimensões
magick identify screenshot.png
# Output: screenshot.png PNG 1170x8450 ...

# 2. Calcular slices
# Regra: partes de ~1500-2000px de altura
# Fórmula: num_parts = ceil(height / 1800)
# Exemplo: 8450 / 1800 ≈ 5 partes → slice_height = 1690

# 3. Criar diretório temporário
mkdir -p /tmp/image-splits

# 4. Dividir a imagem
magick screenshot.png -crop 1170x1690 +repage /tmp/image-splits/part-%02d.png

# 5. Ler cada parte com a tool Read
# 6. Cleanup
rm -rf /tmp/image-splits
```

### Script automatizado

```bash
#!/bin/bash
# Usage: split-image.sh <input> [max_height]
INPUT="$1"
MAX_H="${2:-1800}"

DIMS=$(magick identify -format "%w %h" "$INPUT")
W=$(echo "$DIMS" | cut -d' ' -f1)
H=$(echo "$DIMS" | cut -d' ' -f2)

if [ "$H" -le 2000 ]; then
    echo "Imagem pequena o suficiente ($H px), não precisa dividir."
    exit 0
fi

PARTS=$(( (H + MAX_H - 1) / MAX_H ))
SLICE_H=$(( H / PARTS ))

mkdir -p /tmp/image-splits
magick "$INPUT" -crop "${W}x${SLICE_H}" +repage /tmp/image-splits/part-%02d.png
echo "Dividido em $PARTS partes em /tmp/image-splits/"
```

---

## 2. Resize e Thumbnails

```bash
# Redimensionar mantendo proporção (fit dentro de 800x600)
magick input.png -resize 800x600 output.png

# Redimensionar forçando dimensão exata (pode distorcer)
magick input.png -resize 800x600! output.png

# Redimensionar apenas se maior que o tamanho alvo
magick input.png -resize 800x600\> output.png

# Thumbnail quadrado com crop central (para avatares)
magick input.png -resize 200x200^ -gravity center -extent 200x200 avatar.png

# Tamanhos para redes sociais
magick input.png -resize 1080x1080^ -gravity center -extent 1080x1080 instagram-square.png
magick input.png -resize 1200x630^ -gravity center -extent 1200x630 og-image.png
magick input.png -resize 1500x500^ -gravity center -extent 1500x500 twitter-header.png
```

### Tabela de tamanhos comuns

| Plataforma | Formato | Dimensão |
|-----------|---------|----------|
| Instagram | Post quadrado | 1080x1080 |
| Instagram | Story/Reel | 1080x1920 |
| Facebook/LinkedIn | OG Image | 1200x630 |
| Twitter/X | Header | 1500x500 |
| YouTube | Thumbnail | 1280x720 |
| Favicon | ICO | 16x16, 32x32, 48x48 |
| Apple Touch | Icon | 180x180 |

---

## 3. Conversão de Formatos

```bash
# PNG → JPEG (com qualidade)
magick input.png -quality 85 output.jpg

# JPEG → WebP (moderno, menor)
magick input.jpg -quality 80 output.webp

# PNG → WebP (com transparência preservada)
magick input.png output.webp

# SVG → PNG (rasterizar)
magick -density 300 input.svg -resize 1024x1024 output.png

# Múltiplos PNGs → GIF animado
magick -delay 50 frame-*.png animation.gif

# HEIC → JPEG (fotos de iPhone)
magick input.heic output.jpg

# Qualquer formato → PDF
magick input.png output.pdf
```

### Tabela de formatos

| Formato | Transparência | Compressão | Melhor para |
|---------|--------------|------------|-------------|
| PNG | Sim | Lossless | Screenshots, UI, ícones |
| JPEG | Não | Lossy | Fotos, imagens grandes |
| WebP | Sim | Ambos | Web (menor tamanho) |
| GIF | Sim (1-bit) | Lossless | Animações simples |
| SVG | Sim | N/A (vetor) | Ícones, logos |
| AVIF | Sim | Lossy | Web next-gen |
| ICO | Sim | N/A | Favicons |

---

## 4. Composição e Sobreposição

```bash
# Sobrepor logo no canto inferior direito (marca d'água)
magick base.png logo.png \
  -gravity southeast -geometry +20+20 \
  -composite result.png

# Sobrepor com opacidade (marca d'água transparente)
magick base.png \( logo.png -alpha set -channel A -evaluate set 30% +channel \) \
  -gravity southeast -geometry +20+20 \
  -composite result.png

# Montagem lado a lado (2 imagens)
magick input1.png input2.png +append side-by-side.png

# Montagem empilhada (vertical)
magick input1.png input2.png -append stacked.png

# Grid de imagens (montage)
magick montage img1.png img2.png img3.png img4.png \
  -tile 2x2 -geometry 400x400+10+10 grid.png
```

---

## 5. Texto e Anotações

```bash
# Adicionar texto simples
magick input.png -gravity south -pointsize 36 \
  -fill white -stroke black -strokewidth 2 \
  -annotate +0+20 "Texto aqui" output.png

# Texto com fundo semi-transparente (legenda)
magick input.png \
  -gravity south \
  -fill "rgba(0,0,0,0.6)" -draw "rectangle 0,880,1200,960" \
  -fill white -pointsize 28 -annotate +0+30 "Legenda da imagem" \
  output.png

# Adicionar borda com label
magick input.png -bordercolor "#333333" -border 2 \
  -gravity south -background "#333333" -fill white \
  -pointsize 20 -splice 0x30 -annotate +0+5 "Título" \
  output.png
```

---

## 6. Otimização e Compressão

```bash
# Otimizar PNG (reduzir tamanho sem perder qualidade)
magick input.png -strip -quality 95 optimized.png

# Comprimir JPEG (qualidade vs tamanho)
magick input.jpg -strip -quality 75 -sampling-factor 4:2:0 compressed.jpg

# Reduzir cores PNG (para ícones/UI simples)
magick input.png -colors 256 reduced.png

# WebP otimizado para web
magick input.png -strip -quality 80 -define webp:method=6 optimized.webp

# Verificar tamanho antes/depois
ls -lh input.png optimized.png
```

---

## 7. Batch Processing

```bash
# Converter todos os PNGs para WebP
for f in *.png; do
  magick "$f" -quality 80 "${f%.png}.webp"
done

# Redimensionar todos para thumbnail
mkdir -p thumbnails
for f in *.jpg; do
  magick "$f" -resize 300x300^ -gravity center -extent 300x300 "thumbnails/$f"
done

# Adicionar marca d'água em todas as imagens
for f in photos/*.jpg; do
  magick "$f" logo.png -gravity southeast -geometry +10+10 \
    -composite "watermarked/$(basename "$f")"
done

# Usando mogrify para edição in-place (cuidado!)
magick mogrify -resize 50% -quality 80 *.jpg
```

---

## 8. Favicon e Ícones Multi-Resolução

```bash
# Gerar favicon multi-resolução a partir de uma imagem
magick input.png -resize 16x16 favicon-16.png
magick input.png -resize 32x32 favicon-32.png
magick input.png -resize 48x48 favicon-48.png
magick favicon-16.png favicon-32.png favicon-48.png favicon.ico

# Apple Touch Icon
magick input.png -resize 180x180 apple-touch-icon.png

# Android Chrome icons
magick input.png -resize 192x192 android-chrome-192.png
magick input.png -resize 512x512 android-chrome-512.png
```

---

## 9. Extração de Metadados

```bash
# Informações básicas (formato, dimensões)
magick identify input.png

# Informações detalhadas (verbose)
magick identify -verbose input.jpg | head -50

# Apenas dimensões
magick identify -format "%w x %h\n" input.png

# Formato e tamanho do arquivo
magick identify -format "Formato: %m\nDimensões: %wx%h\nTamanho: %b\n" input.png

# Remover TODOS os metadados (EXIF, GPS, etc.) — privacidade
magick input.jpg -strip clean.jpg
```

---

## 10. Receitas Prontas

### Preparar imagem para OCR

```bash
# Aumentar contraste e converter para grayscale para melhor OCR
magick input.png -colorspace Gray -contrast-stretch 0.1x0.1% \
  -sharpen 0x1.0 -resize 200% ocr-ready.png
```

### Criar placeholder blur (LQIP)

```bash
# Low Quality Image Placeholder (para lazy loading)
magick input.jpg -resize 20x20 -quality 20 \
  -blur 0x8 -resize 800x600 placeholder.jpg
```

### Comparar duas imagens (diff visual)

```bash
# Gerar diff visual entre duas imagens
magick compare before.png after.png diff.png
```

### Criar imagem de teste com cor sólida

```bash
# Placeholder colorido
magick -size 800x600 xc:"#4A90D9" placeholder.png

# Com texto
magick -size 800x600 xc:"#4A90D9" \
  -gravity center -pointsize 48 -fill white \
  -annotate 0 "800 x 600" placeholder.png
```

---

## Veto Conditions

| ID | Trigger | Ação |
|----|---------|------|
| VETO_SMALL | Imagem < 2000px de altura (para splitting) | SKIP — ler direto, não precisa dividir |
| VETO_NO_MAGICK | `magick` não encontrado no PATH | HALT — pedir: `brew install imagemagick` |
| VETO_NOT_IMAGE | Arquivo não é imagem (PDF, doc) | REDIRECT — usar tool apropriada |
| VETO_IN_PLACE | mogrify sem backup | WARN — confirmar antes de editar in-place |

---

## Troubleshooting

| Problema | Causa | Solução |
|----------|-------|---------|
| `magick: command not found` | ImageMagick não instalado | `brew install imagemagick` |
| Transparência perdida ao converter para JPEG | JPEG não suporta alpha | Usar PNG ou WebP |
| Qualidade ruim após resize | Sem filtro de interpolação | Adicionar `-filter Lanczos` |
| Arquivo de saída muito grande | Sem compressão/strip | Adicionar `-strip -quality 80` |
| Cores erradas em CMYK | Perfil de cor incompatível | Adicionar `-colorspace sRGB` |
| Erro de memória com imagens gigantes | Limite de memória do IM | Usar `-limit memory 512MiB` |
