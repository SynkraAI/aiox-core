#!/usr/bin/env bash
# visual-qa-check.sh — Validação automatizada do Visual QA Checklist (Content Engine v3)
#
# Uso: bash visual-qa-check.sh <batch.json> <output-dir>
#
# Verifica items automatizáveis do visual-qa.md:
#   1.1 Cores da paleta (nenhum hardcoded fora do design system)
#   1.2 Alternância light/dark correta
#   3.2 Headline <= 8 palavras
#   3.3 Body <= 25 palavras
#   3.4 Lista <= 5 items
#   4.1 PNG existe e > 10KB
#   4.2 Dimensões corretas (1080x1350 feed, 1080x1920 story)
#
# Exit codes: 0 = PASS, 1 = FAIL

set -euo pipefail

BATCH_JSON="${1:-}"
OUTPUT_DIR="${2:-}"

if [[ -z "$BATCH_JSON" || -z "$OUTPUT_DIR" ]]; then
  echo "Uso: bash visual-qa-check.sh <batch.json> <output-dir>"
  exit 1
fi

if [[ ! -f "$BATCH_JSON" ]]; then
  echo "ERRO: Arquivo batch não encontrado: $BATCH_JSON"
  exit 1
fi

if [[ ! -d "$OUTPUT_DIR" ]]; then
  echo "ERRO: Diretório de output não encontrado: $OUTPUT_DIR"
  exit 1
fi

# Paleta válida do design system (cores permitidas)
VALID_COLORS=(
  "#14213D" "#14213d"
  "#FFFFFF" "#ffffff" "#FFF" "#fff"
  "#FCA311" "#fca311"
  "#C9A84C" "#c9a84c"
  "#F5F5F5" "#f5f5f5"
  "#2D2D2D" "#2d2d2d"
  "#333333" "#333"
  "#999999" "#999"
  "rgba(255,255,255,0.7)" "rgba(255, 255, 255, 0.7)"
  "rgba(255,255,255,0.3)" "rgba(255, 255, 255, 0.3)"
  "rgba(20,33,61,0.4)" "rgba(20, 33, 61, 0.4)"
  "rgba(20,33,61,0.7)" "rgba(20, 33, 61, 0.7)"
)

TOTAL_CHECKS=0
PASSED_CHECKS=0
SECTION4_FAIL=0
FAILURES=()

pass() {
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  PASSED_CHECKS=$((PASSED_CHECKS + 1))
  echo "  PASS: $1"
}

fail() {
  local section="${2:-}"
  TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
  FAILURES+=("$1")
  echo "  FAIL: $1"
  if [[ "$section" == "4" ]]; then
    SECTION4_FAIL=1
  fi
}

is_valid_color() {
  local color="$1"
  for valid in "${VALID_COLORS[@]}"; do
    if [[ "$color" == "$valid" ]]; then
      return 0
    fi
  done
  return 1
}

strip_html() {
  # Remove tags HTML de um texto
  echo "$1" | sed 's/<[^>]*>//g'
}

word_count() {
  local text
  text="$(strip_html "$1")"
  echo "$text" | wc -w | tr -d ' '
}

count_li_items() {
  echo "$1" | grep -o '<li>' | wc -l | tr -d ' '
}

# Verificar se jq está disponível
if ! command -v jq &> /dev/null; then
  echo "ERRO: jq é necessário para parsing do JSON batch"
  exit 1
fi

NUM_JOBS=$(jq 'length' "$BATCH_JSON")
echo "========================================"
echo " Visual QA Check — Content Engine v3"
echo "========================================"
echo "Batch: $BATCH_JSON ($NUM_JOBS slides)"
echo "Output: $OUTPUT_DIR"
echo ""

# -- CHECK 1.1: Cores da paleta --
echo "--- 1.1 Cores da paleta ---"
COLOR_FIELDS=("BG_COLOR" "TEXT_COLOR" "BODY_COLOR" "MUTED_COLOR")
ALL_COLORS_VALID=true
for i in $(seq 0 $((NUM_JOBS - 1))); do
  template=$(jq -r ".[$i].template" "$BATCH_JSON")
  for field in "${COLOR_FIELDS[@]}"; do
    color=$(jq -r ".[$i].data.$field // empty" "$BATCH_JSON")
    if [[ -n "$color" ]]; then
      if ! is_valid_color "$color"; then
        echo "  Slide $((i+1)) ($template): $field=$color NÃO está na paleta"
        ALL_COLORS_VALID=false
      fi
    fi
  done
done
if $ALL_COLORS_VALID; then
  pass "1.1 Todas as cores pertencem à paleta do design system"
else
  fail "1.1 Cores fora da paleta detectadas" ""
fi

# -- CHECK 1.2: Alternância light/dark --
echo "--- 1.2 Alternância light/dark ---"
LIGHT_COLORS=("#FFFFFF" "#ffffff" "#FFF" "#fff" "#F5F5F5" "#f5f5f5")
DARK_COLORS=("#14213D" "#14213d" "#2D2D2D" "#2d2d2d")
ALTERNATION_OK=true
for i in $(seq 0 $((NUM_JOBS - 1))); do
  bg=$(jq -r ".[$i].data.BG_COLOR // empty" "$BATCH_JSON")
  template=$(jq -r ".[$i].template" "$BATCH_JSON")
  slide_num=$((i + 1))

  if [[ -z "$bg" ]]; then
    continue
  fi

  # Capa (slide 1) e CTA final (último slide) devem ser Navy
  if [[ $slide_num -eq 1 || $slide_num -eq $NUM_JOBS ]]; then
    if [[ "$template" == "cover" || $slide_num -eq $NUM_JOBS ]]; then
      if [[ "$bg" != "#14213D" && "$bg" != "#14213d" ]]; then
        echo "  Slide $slide_num: capa/CTA deveria ser Navy (#14213D), encontrado $bg"
        ALTERNATION_OK=false
      fi
      continue
    fi
  fi

  # Slides internos: ímpares=claro, pares=escuro (baseado na posição do slide, não no índice)
  is_light=false
  for lc in "${LIGHT_COLORS[@]}"; do
    [[ "$bg" == "$lc" ]] && is_light=true
  done

  is_dark=false
  for dc in "${DARK_COLORS[@]}"; do
    [[ "$bg" == "$dc" ]] && is_dark=true
  done

  if (( slide_num % 2 == 1 )); then
    # Ímpar — esperado claro
    if ! $is_light && ! $is_dark; then
      echo "  Slide $slide_num: cor $bg não reconhecida como claro ou escuro"
      ALTERNATION_OK=false
    elif $is_dark; then
      echo "  Slide $slide_num (ímpar): esperado claro, encontrado escuro ($bg)"
      ALTERNATION_OK=false
    fi
  else
    # Par — esperado escuro
    if ! $is_light && ! $is_dark; then
      echo "  Slide $slide_num: cor $bg não reconhecida como claro ou escuro"
      ALTERNATION_OK=false
    elif $is_light; then
      echo "  Slide $slide_num (par): esperado escuro, encontrado claro ($bg)"
      ALTERNATION_OK=false
    fi
  fi
done
if $ALTERNATION_OK; then
  pass "1.2 Alternância light/dark correta"
else
  fail "1.2 Alternância light/dark incorreta" ""
fi

# -- CHECK 3.2: Headline <= 8 palavras --
echo "--- 3.2 Headline <= 8 palavras ---"
HEADLINE_OK=true
for i in $(seq 0 $((NUM_JOBS - 1))); do
  headline=$(jq -r ".[$i].data.HEADLINE // empty" "$BATCH_JSON")
  if [[ -n "$headline" ]]; then
    wc=$(word_count "$headline")
    if (( wc > 8 )); then
      echo "  Slide $((i+1)): headline tem $wc palavras (max 8): $(strip_html "$headline")"
      HEADLINE_OK=false
    fi
  fi
done
if $HEADLINE_OK; then
  pass "3.2 Todos os headlines <= 8 palavras"
else
  fail "3.2 Headlines com mais de 8 palavras detectados" ""
fi

# -- CHECK 3.3: Body <= 25 palavras --
echo "--- 3.3 Body <= 25 palavras ---"
BODY_OK=true
for i in $(seq 0 $((NUM_JOBS - 1))); do
  body=$(jq -r ".[$i].data.BODY // empty" "$BATCH_JSON")
  if [[ -n "$body" ]]; then
    wc=$(word_count "$body")
    if (( wc > 25 )); then
      echo "  Slide $((i+1)): body tem $wc palavras (max 25)"
      BODY_OK=false
    fi
  fi
done
if $BODY_OK; then
  pass "3.3 Todos os bodies <= 25 palavras"
else
  fail "3.3 Bodies com mais de 25 palavras detectados" ""
fi

# -- CHECK 3.4: Lista <= 5 items --
echo "--- 3.4 Lista <= 5 items ---"
LIST_OK=true
HAS_LISTS=false
for i in $(seq 0 $((NUM_JOBS - 1))); do
  template=$(jq -r ".[$i].template" "$BATCH_JSON")
  if [[ "$template" == "content-list" ]]; then
    HAS_LISTS=true
    list_items=$(jq -r ".[$i].data.LIST_ITEMS // empty" "$BATCH_JSON")
    if [[ -n "$list_items" ]]; then
      count=$(count_li_items "$list_items")
      if (( count > 5 )); then
        echo "  Slide $((i+1)): lista tem $count items (max 5)"
        LIST_OK=false
      fi
    fi
  fi
done
if ! $HAS_LISTS; then
  pass "3.4 Nenhum template content-list (N/A)"
elif $LIST_OK; then
  pass "3.4 Todas as listas <= 5 items"
else
  fail "3.4 Listas com mais de 5 items detectadas" ""
fi

# -- CHECK 4.1: PNG existe e > 10KB --
echo "--- 4.1 PNG existe e > 10KB ---"
PNG_OK=true
for i in $(seq 0 $((NUM_JOBS - 1))); do
  out_path=$(jq -r ".[$i].out" "$BATCH_JSON")
  full_path="$OUTPUT_DIR/$out_path"
  if [[ ! -f "$full_path" ]]; then
    echo "  Slide $((i+1)): PNG não encontrado: $full_path"
    PNG_OK=false
  else
    size=$(stat -f%z "$full_path" 2>/dev/null || stat -c%s "$full_path" 2>/dev/null || echo "0")
    if (( size < 10240 )); then
      echo "  Slide $((i+1)): PNG muito pequeno (${size} bytes < 10KB): $full_path"
      PNG_OK=false
    fi
  fi
done
if $PNG_OK; then
  pass "4.1 Todos os PNGs existem e > 10KB"
else
  fail "4.1 PNGs ausentes ou abaixo de 10KB" "4"
fi

# -- CHECK 4.2: Dimensões corretas --
echo "--- 4.2 Dimensões corretas ---"
DIM_OK=true
# Precisa de identify (ImageMagick) ou file para verificar dimensões
HAS_IDENTIFY=false
if command -v identify &> /dev/null; then
  HAS_IDENTIFY=true
fi

for i in $(seq 0 $((NUM_JOBS - 1))); do
  template=$(jq -r ".[$i].template" "$BATCH_JSON")
  out_path=$(jq -r ".[$i].out" "$BATCH_JSON")
  full_path="$OUTPUT_DIR/$out_path"

  if [[ ! -f "$full_path" ]]; then
    continue
  fi

  if [[ "$template" == "story-frame" ]]; then
    expected_w=1080
    expected_h=1920
  else
    expected_w=1080
    expected_h=1350
  fi

  if $HAS_IDENTIFY; then
    dims=$(identify -format "%wx%h" "$full_path" 2>/dev/null || echo "0x0")
    actual_w="${dims%%x*}"
    actual_h="${dims##*x}"
    if (( actual_w != expected_w || actual_h != expected_h )); then
      echo "  Slide $((i+1)): dimensão ${actual_w}x${actual_h}, esperado ${expected_w}x${expected_h}"
      DIM_OK=false
    fi
  else
    # Fallback: extrair dimensões do header PNG via file
    file_info=$(file "$full_path" 2>/dev/null || echo "")
    if echo "$file_info" | grep -q "${expected_w} x ${expected_h}"; then
      : # OK
    elif echo "$file_info" | grep -q "${expected_w}x${expected_h}"; then
      : # OK
    elif echo "$file_info" | grep -qE "${expected_w}.?x.?${expected_h}"; then
      : # OK
    else
      echo "  Slide $((i+1)): não foi possível confirmar dimensão ${expected_w}x${expected_h} (instale ImageMagick para verificação precisa)"
      echo "    file info: $file_info"
      DIM_OK=false
    fi
  fi
done
if $DIM_OK; then
  pass "4.2 Todas as dimensões corretas"
else
  fail "4.2 Dimensões incorretas detectadas" "4"
fi

# -- RESULTADO --
echo ""
echo "========================================"
echo " RESULTADO"
echo "========================================"

SCORE=$(echo "scale=1; $PASSED_CHECKS * 10 / $TOTAL_CHECKS" | bc)
echo "Score: $PASSED_CHECKS/$TOTAL_CHECKS x 10 = $SCORE/10"

if (( ${#FAILURES[@]} > 0 )); then
  echo ""
  echo "Falhas:"
  for f in "${FAILURES[@]}"; do
    echo "  - $f"
  done
fi

echo ""
if (( SECTION4_FAIL == 1 )); then
  echo "STATUS: FAIL (seção 4 — Integridade do Render — tem falha bloqueante)"
  exit 1
fi

# Comparar score com 8.0 usando bc
PASS_CHECK=$(echo "$SCORE >= 8.0" | bc)
if (( PASS_CHECK == 1 )); then
  echo "STATUS: PASS ($SCORE/10 >= 8.0)"
  exit 0
else
  echo "STATUS: FAIL ($SCORE/10 < 8.0)"
  exit 1
fi
