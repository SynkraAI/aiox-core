#!/bin/bash
# Transcreve audio de video YouTube usando yt-dlp + OpenAI Whisper API
# Uso: ./transcribe.sh "https://youtube.com/watch?v=xxx" [output.txt]
#
# Pre-requisitos:
#   brew install yt-dlp
#   export OPENAI_API_KEY="sk-..."
#
# O script:
#   1. Baixa audio do YouTube (formato m4a)
#   2. Envia para Whisper API (modelo whisper-1)
#   3. Salva transcricao em texto

set -euo pipefail

URL="${1:?Uso: ./transcribe.sh URL [output.txt]}"
OUTPUT="${2:-transcricao.txt}"
TEMP_DIR=$(mktemp -d)
AUDIO_FILE="$TEMP_DIR/audio.m4a"

# Verificar pre-requisitos
if ! command -v yt-dlp &> /dev/null; then
  echo "ERRO: yt-dlp nao instalado. Instale com: brew install yt-dlp"
  exit 1
fi

if [ -z "${OPENAI_API_KEY:-}" ]; then
  echo "ERRO: OPENAI_API_KEY nao definida. Export com: export OPENAI_API_KEY=sk-..."
  exit 1
fi

echo "1/3 Baixando audio de: $URL"
yt-dlp -x --audio-format m4a --audio-quality 5 -o "$AUDIO_FILE" "$URL" 2>/dev/null

# Verificar tamanho (Whisper aceita max 25MB)
FILE_SIZE=$(stat -f%z "$AUDIO_FILE" 2>/dev/null || stat --printf="%s" "$AUDIO_FILE" 2>/dev/null)
MAX_SIZE=$((25 * 1024 * 1024))

if [ "$FILE_SIZE" -gt "$MAX_SIZE" ]; then
  echo "AVISO: Audio > 25MB ($((FILE_SIZE / 1024 / 1024))MB). Dividindo em partes..."

  # Verificar ffmpeg
  if ! command -v ffmpeg &> /dev/null; then
    echo "ERRO: ffmpeg necessario para dividir audio. Instale com: brew install ffmpeg"
    rm -rf "$TEMP_DIR"
    exit 1
  fi

  # Dividir em partes de 10 minutos
  DURATION=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$AUDIO_FILE" | cut -d. -f1)
  SEGMENT=600  # 10 minutos
  PARTS=$(( (DURATION + SEGMENT - 1) / SEGMENT ))

  echo "   Audio: ${DURATION}s → $PARTS partes de ${SEGMENT}s"

  > "$OUTPUT"  # Limpar output

  for i in $(seq 0 $((PARTS - 1))); do
    START=$((i * SEGMENT))
    PART_FILE="$TEMP_DIR/part_${i}.m4a"

    ffmpeg -i "$AUDIO_FILE" -ss "$START" -t "$SEGMENT" -c copy "$PART_FILE" 2>/dev/null

    echo "2/3 Transcrevendo parte $((i + 1))/$PARTS..."

    RESPONSE=$(curl -s https://api.openai.com/v1/audio/transcriptions \
      -H "Authorization: Bearer $OPENAI_API_KEY" \
      -F model="whisper-1" \
      -F language="pt" \
      -F response_format="text" \
      -F "file=@$PART_FILE")

    echo "$RESPONSE" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  done
else
  echo "2/3 Transcrevendo audio ($(( FILE_SIZE / 1024 / 1024 ))MB)..."

  curl -s https://api.openai.com/v1/audio/transcriptions \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -F model="whisper-1" \
    -F language="pt" \
    -F response_format="text" \
    -F "file=@$AUDIO_FILE" \
    -o "$OUTPUT"
fi

# Limpar
rm -rf "$TEMP_DIR"

WORD_COUNT=$(wc -w < "$OUTPUT" | tr -d ' ')
echo "3/3 Transcricao salva em: $OUTPUT ($WORD_COUNT palavras)"
