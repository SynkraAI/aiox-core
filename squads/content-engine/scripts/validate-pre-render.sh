#!/usr/bin/env bash
# validate-pre-render.sh — Validação pré-render de JSON batch (Story 4.2)
#
# Valida input JSON ANTES de renderizar slides:
#   - Campos obrigatórios por template
#   - Formato de cores (hex/rgba)
#   - Cores contra paleta aprovada (design-tokens.json)
#   - Limites de conteúdo (headline <=8 palavras, body <=25, lista <=5 items)
#   - Variant válida (light/dark)
#   - Lista TODOS os erros (não para no primeiro)
#
# Uso:
#   bash validate-pre-render.sh <batch.json>
#   bash validate-pre-render.sh --validate-only <batch.json>
#   bash validate-pre-render.sh --export-schema
#
# Exit codes: 0 = válido, 1 = inválido

set -euo pipefail

# --- Configuração ---

VALID_TEMPLATES="cover, slide-template, content-basic, content-list, static-post, story-frame"

# Props obrigatórias por template (compatível com bash 3)
get_required_props() {
  case "$1" in
    cover)            echo "HEADLINE" ;;
    slide-template)   echo "HEADLINE BODY" ;;
    content-basic)    echo "BADGE_NUM BADGE_LABEL HEADLINE BODY" ;;
    content-list)     echo "BADGE_NUM BADGE_LABEL HEADLINE LIST_ITEMS" ;;
    static-post)      echo "HEADLINE" ;;
    story-frame)      echo "HEADLINE BODY" ;;
    *)                echo "" ;;
  esac
}

is_valid_template() {
  case "$1" in
    cover|slide-template|content-basic|content-list|static-post|story-frame) return 0 ;;
    *) return 1 ;;
  esac
}
VALID_VARIANTS="light dark"
COLOR_PROPS="BG_COLOR TEXT_COLOR BODY_COLOR MUTED_COLOR"

# Paleta aprovada do design-tokens.json
APPROVED_COLORS=(
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
  "rgba(20,33,61,0.7)" "rgba(20, 33, 61, 0.7)"
  "rgba(20,33,61,0.3)" "rgba(20, 33, 61, 0.3)"
  "rgba(20,33,61,0.4)" "rgba(20, 33, 61, 0.4)"
)

# --- Funções ---

ERRORS=()
ERROR_COUNT=0

add_error() {
  local job_idx="$1"
  local msg="$2"
  ERRORS+=("Job $job_idx: $msg")
  ERROR_COUNT=$((ERROR_COUNT + 1))
}

is_valid_color_format() {
  local color="$1"
  # Hex: #RGB ou #RRGGBB
  if [[ "$color" =~ ^#[0-9A-Fa-f]{3}$ || "$color" =~ ^#[0-9A-Fa-f]{6}$ ]]; then
    return 0
  fi
  # rgba(R,G,B,A) ou rgb(R,G,B)
  if [[ "$color" =~ ^rgba?\( ]]; then
    return 0
  fi
  return 1
}

is_approved_color() {
  local color="$1"
  for valid in "${APPROVED_COLORS[@]}"; do
    if [[ "$color" == "$valid" ]]; then
      return 0
    fi
  done
  return 1
}

strip_html() {
  echo "$1" | sed 's/<[^>]*>//g'
}

word_count() {
  local text
  text="$(strip_html "$1")"
  text="$(echo "$text" | xargs)" # trim
  if [[ -z "$text" ]]; then
    echo 0
    return
  fi
  echo "$text" | wc -w | tr -d ' '
}

count_li() {
  echo "$1" | grep -oi '<li>' | wc -l | tr -d ' '
}

export_schema() {
  cat <<'SCHEMA'
{
  "cover": {
    "template": "cover.html",
    "required": ["HEADLINE"],
    "optional": ["BODY", "IMAGE_URL", "IMAGE_OVERLAY_OPACITY", "COUNTER", "ARROW_VISIBLE"]
  },
  "slide-template": {
    "template": "slide-template.html",
    "required": ["HEADLINE", "BODY"],
    "optional": ["COUNTER", "ARROW_VISIBLE"]
  },
  "content-basic": {
    "template": "content-basic.html",
    "required": ["BADGE_NUM", "BADGE_LABEL", "HEADLINE", "BODY"],
    "optional": ["COUNTER", "ARROW_VISIBLE"]
  },
  "content-list": {
    "template": "content-list.html",
    "required": ["BADGE_NUM", "BADGE_LABEL", "HEADLINE", "LIST_ITEMS"],
    "optional": ["BODY", "COUNTER", "ARROW_VISIBLE"]
  },
  "static-post": {
    "template": "static-post.html",
    "required": ["HEADLINE"],
    "optional": ["BODY", "AUTHOR", "COUNTER", "ARROW_VISIBLE"]
  },
  "story-frame": {
    "template": "story-frame.html",
    "required": ["HEADLINE", "BODY"],
    "optional": ["CTA", "COUNTER"]
  }
}
SCHEMA
  exit 0
}

# --- Parsing de argumentos ---

BATCH_JSON=""
VALIDATE_ONLY=false

for arg in "$@"; do
  case "$arg" in
    --validate-only) VALIDATE_ONLY=true ;;
    --export-schema) export_schema ;;
    --help|-h)
      echo "Uso: bash validate-pre-render.sh [--validate-only] <batch.json>"
      echo "      bash validate-pre-render.sh --export-schema"
      echo ""
      echo "Valida JSON batch para render de slides Instagram."
      echo "Exit code 0 = válido, 1 = inválido."
      exit 0
      ;;
    *) BATCH_JSON="$arg" ;;
  esac
done

if [[ -z "$BATCH_JSON" ]]; then
  echo "ERRO: Arquivo batch não informado."
  echo "Uso: bash validate-pre-render.sh [--validate-only] <batch.json>"
  exit 1
fi

if [[ ! -f "$BATCH_JSON" ]]; then
  echo "ERRO: Arquivo não encontrado: $BATCH_JSON"
  exit 1
fi

if ! command -v jq &> /dev/null; then
  echo "ERRO: jq é necessário. Instale com: apt install jq / brew install jq"
  exit 1
fi

# Validar JSON válido
if ! jq empty "$BATCH_JSON" 2>/dev/null; then
  echo "ERRO: JSON inválido em $BATCH_JSON"
  exit 1
fi

NUM_JOBS=$(jq 'length' "$BATCH_JSON")

if [[ "$NUM_JOBS" -eq 0 ]]; then
  echo "ERRO: Batch vazio (0 jobs)"
  exit 1
fi

echo "=========================================="
echo " Validação Pré-Render — Content Engine v3"
echo "=========================================="
echo "Batch: $BATCH_JSON ($NUM_JOBS jobs)"
echo ""

# --- Validação por job ---

for i in $(seq 0 $((NUM_JOBS - 1))); do
  JOB_NUM=$((i + 1))
  template=$(jq -r ".[$i].template // empty" "$BATCH_JSON")
  variant=$(jq -r ".[$i].variant // empty" "$BATCH_JSON")

  # 1. Template existe?
  if [[ -z "$template" ]]; then
    add_error "$JOB_NUM" "campo 'template' ausente"
    continue
  fi

  if ! is_valid_template "$template"; then
    add_error "$JOB_NUM" "template \"$template\" não existe. Templates válidos: $VALID_TEMPLATES"
    continue
  fi

  # 2. Variant válida?
  if [[ -n "$variant" ]]; then
    variant_ok=false
    for v in $VALID_VARIANTS; do
      [[ "$variant" == "$v" ]] && variant_ok=true
    done
    if ! $variant_ok; then
      add_error "$JOB_NUM" "variant \"$variant\" inválida. Opções: light, dark"
    fi
  fi

  # 3. Props obrigatórias presentes?
  required_props="$(get_required_props "$template")"
  for prop in $required_props; do
    # Skip color props se variant está definida (variant preenche automaticamente)
    is_color=false
    for cp in $COLOR_PROPS; do
      [[ "$prop" == "$cp" ]] && is_color=true
    done
    if $is_color && [[ -n "$variant" ]]; then
      continue
    fi

    val=$(jq -r ".[$i].data.$prop // empty" "$BATCH_JSON")
    if [[ -z "$val" ]]; then
      add_error "$JOB_NUM" "prop obrigatória \"$prop\" faltando para $template"
    fi
  done

  # 4. Formato e paleta de cores
  for prop in $COLOR_PROPS; do
    val=$(jq -r ".[$i].data.$prop // empty" "$BATCH_JSON")
    if [[ -n "$val" ]]; then
      if ! is_valid_color_format "$val"; then
        add_error "$JOB_NUM" "cor \"$val\" inválida para $prop. Use hex (#RRGGBB) ou rgba()"
      elif ! is_approved_color "$val"; then
        add_error "$JOB_NUM" "cor \"$val\" em $prop não pertence à paleta aprovada (design-tokens.json)"
      fi
    fi
  done

  # 5. Headline <= 8 palavras
  headline=$(jq -r ".[$i].data.HEADLINE // empty" "$BATCH_JSON")
  if [[ -n "$headline" ]]; then
    wc=$(word_count "$headline")
    if (( wc > 8 )); then
      add_error "$JOB_NUM" "HEADLINE com $wc palavras (máximo 8)"
    fi
  fi

  # 6. Body <= 25 palavras
  body=$(jq -r ".[$i].data.BODY // empty" "$BATCH_JSON")
  if [[ -n "$body" ]]; then
    wc=$(word_count "$body")
    if (( wc > 25 )); then
      add_error "$JOB_NUM" "BODY com $wc palavras (máximo 25)"
    fi
  fi

  # 7. LIST_ITEMS <= 5 items
  list_items=$(jq -r ".[$i].data.LIST_ITEMS // empty" "$BATCH_JSON")
  if [[ -n "$list_items" ]]; then
    li_count=$(count_li "$list_items")
    if (( li_count > 5 )); then
      add_error "$JOB_NUM" "LIST_ITEMS com $li_count itens (máximo 5)"
    fi
  fi

  # 8. ARROW_VISIBLE = "true"/"false"
  arrow=$(jq -r ".[$i].data.ARROW_VISIBLE // empty" "$BATCH_JSON")
  if [[ -n "$arrow" ]]; then
    arrow_lower=$(echo "$arrow" | tr '[:upper:]' '[:lower:]')
    if [[ "$arrow_lower" != "true" && "$arrow_lower" != "false" ]]; then
      add_error "$JOB_NUM" "ARROW_VISIBLE deve ser \"true\" ou \"false\", recebido \"$arrow\""
    fi
  fi

  # 9. out path presente
  out_path=$(jq -r ".[$i].out // empty" "$BATCH_JSON")
  if [[ -z "$out_path" ]]; then
    add_error "$JOB_NUM" "campo 'out' (caminho de saída) ausente"
  fi
done

# --- Resultado ---

echo ""
if (( ERROR_COUNT > 0 )); then
  echo "Validação falhou: $ERROR_COUNT erro(s) em $NUM_JOBS jobs"
  echo ""
  for err in "${ERRORS[@]}"; do
    echo "  $err"
  done
  echo ""
  exit 1
else
  echo "Validação OK: $NUM_JOBS jobs válidos"
  exit 0
fi
