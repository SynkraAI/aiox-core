#!/usr/bin/env bash
# run-qa-gate.sh — Wrapper GATE-VISUAL para integração no pipeline
#
# Executa visual-qa-check.sh e decide: PASS / FAIL / WARNING
#
# Regras:
#   - Seção 4 (Integridade do Render) é BLOQUEANTE — se falhar, FAIL imediato
#   - Score >= 8.0/10 → GATE-PASS
#   - Score < 8.0/10 (sem falha seção 4) → WARNING (não bloqueia, mas reporta)
#   - 2 falhas consecutivas → escalação para humano
#
# Uso:
#   bash run-qa-gate.sh <batch.json> <output-dir> [--strict]
#
# Flags:
#   --strict   Seções 1-3 com score < 8.0 também bloqueiam (modo CI/CD)
#
# Exit codes:
#   0 = GATE-PASS
#   1 = GATE-FAIL (bloqueante)
#   2 = WARNING (score baixo mas sem falha bloqueante)
#
# Escalação:
#   Se arquivo .qa-gate-failures existe e contém 1+ falha recente,
#   uma nova falha = 2 consecutivas → escalar para humano.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
QA_CHECK="$SCRIPT_DIR/visual-qa-check.sh"
FAILURE_TRACKER="$SCRIPT_DIR/.qa-gate-failures"

BATCH_JSON=""
OUTPUT_DIR=""
STRICT=false

for arg in "$@"; do
  case "$arg" in
    --strict) STRICT=true ;;
    --help|-h)
      echo "Uso: bash run-qa-gate.sh <batch.json> <output-dir> [--strict]"
      echo ""
      echo "Executa GATE-VISUAL e decide PASS/FAIL/WARNING."
      echo ""
      echo "Flags:"
      echo "  --strict   Score < 8.0 também bloqueia (modo CI/CD)"
      echo ""
      echo "Exit codes: 0=PASS, 1=FAIL, 2=WARNING"
      exit 0
      ;;
    *)
      if [[ -z "$BATCH_JSON" ]]; then
        BATCH_JSON="$arg"
      elif [[ -z "$OUTPUT_DIR" ]]; then
        OUTPUT_DIR="$arg"
      fi
      ;;
  esac
done

if [[ -z "$BATCH_JSON" || -z "$OUTPUT_DIR" ]]; then
  echo "ERRO: Argumentos faltando."
  echo "Uso: bash run-qa-gate.sh <batch.json> <output-dir> [--strict]"
  exit 1
fi

if [[ ! -f "$QA_CHECK" ]]; then
  echo "ERRO: Script visual-qa-check.sh não encontrado em: $QA_CHECK"
  exit 1
fi

echo "============================================"
echo " GATE-VISUAL — Content Engine v3"
echo "============================================"
echo ""

# Executar visual-qa-check.sh e capturar output + exit code
QA_OUTPUT=""
QA_EXIT=0
QA_OUTPUT=$(bash "$QA_CHECK" "$BATCH_JSON" "$OUTPUT_DIR" 2>&1) || QA_EXIT=$?

echo "$QA_OUTPUT"
echo ""

# Extrair score do output
SCORE_LINE=$(echo "$QA_OUTPUT" | grep -E "^Score:" || echo "")
if [[ -z "$SCORE_LINE" ]]; then
  echo "ERRO: Não foi possível extrair score do visual-qa-check.sh"
  echo ""
  echo "============================================"
  echo " GATE-VISUAL: FAIL (erro na execução)"
  echo "============================================"
  record_failure
  exit 1
fi

SCORE=$(echo "$SCORE_LINE" | grep -oE '[0-9]+\.[0-9]+/10' | head -1 | cut -d'/' -f1)

# Verificar se seção 4 falhou (bloqueante)
SECTION4_FAIL=false
if echo "$QA_OUTPUT" | grep -q "seção 4"; then
  SECTION4_FAIL=true
fi

# Função para registrar falha (para tracking de escalação)
record_failure() {
  local timestamp
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "$timestamp|$BATCH_JSON|$SCORE" >> "$FAILURE_TRACKER"
}

# Função para limpar falhas (após PASS)
clear_failures() {
  if [[ -f "$FAILURE_TRACKER" ]]; then
    rm -f "$FAILURE_TRACKER"
  fi
}

# Função para verificar escalação (2 falhas consecutivas)
check_escalation() {
  if [[ ! -f "$FAILURE_TRACKER" ]]; then
    return 1
  fi
  local count
  count=$(wc -l < "$FAILURE_TRACKER" | tr -d ' ')
  if (( count >= 1 )); then
    return 0  # Já tem 1 falha, esta seria a 2a → escalar
  fi
  return 1
}

echo "============================================"

# Decisão
if $SECTION4_FAIL; then
  # Seção 4 falhou — BLOQUEANTE
  echo " GATE-VISUAL: FAIL"
  echo " Motivo: Seção 4 (Integridade do Render) com falha bloqueante"
  echo ""

  if check_escalation; then
    echo "============================================"
    echo " ESCALACAO: 2 falhas GATE-VISUAL consecutivas"
    echo "============================================"
    echo ""
    echo " Decisão necessária: corrigir render pipeline"
    echo " ou aprovar manualmente."
    echo ""
    echo " Histórico de falhas:"
    if [[ -f "$FAILURE_TRACKER" ]]; then
      while IFS='|' read -r ts batch sc; do
        echo "   $ts — score: $sc — batch: $batch"
      done < "$FAILURE_TRACKER"
    fi
    echo "   $(date '+%Y-%m-%d %H:%M:%S') — score: $SCORE — batch: $BATCH_JSON (atual)"
    echo ""
    echo " PARE. Aguarde decisão humana."
    echo "============================================"
  fi

  record_failure
  echo "============================================"
  exit 1

elif [[ -n "$SCORE" ]] && (( $(echo "$SCORE < 8.0" | bc) )); then
  # Score baixo mas seção 4 OK
  if $STRICT; then
    echo " GATE-VISUAL: FAIL (modo --strict)"
    echo " Score: $SCORE/10 (mínimo 8.0 em modo strict)"
    echo "============================================"
    record_failure
    exit 1
  else
    echo " GATE-VISUAL: WARNING"
    echo " Score: $SCORE/10 (abaixo de 8.0, mas seção 4 OK)"
    echo " Recomendação: corrigir items com falha antes de publicar"
    echo "============================================"
    # Warning não conta como falha para escalação
    exit 2
  fi

else
  # PASS
  echo " GATE-VISUAL: PASS"
  echo " Score: $SCORE/10"
  echo "============================================"
  clear_failures
  exit 0
fi
