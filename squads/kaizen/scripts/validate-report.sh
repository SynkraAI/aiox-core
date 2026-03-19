#!/usr/bin/env bash
# validate-report.sh — Validacao de relatorio do Kaizen Squad
#
# Verifica se um relatorio semanal atende aos criterios de qualidade
# definidos no checklist report-quality-checklist.md
#
# Uso:
#   bash validate-report.sh <report-file.md>
#
# Exit codes:
#   0 = GATE-PASS (todas as secoes presentes e completas)
#   1 = GATE-FAIL (secoes obrigatorias ausentes)
#   2 = WARNING (secoes opcionais ausentes ou incompletas)

set -euo pipefail

REPORT_FILE="${1:-}"

if [[ -z "$REPORT_FILE" ]]; then
  echo "Uso: bash validate-report.sh <report-file.md>"
  exit 1
fi

if [[ ! -f "$REPORT_FILE" ]]; then
  echo "ERRO: Arquivo nao encontrado: $REPORT_FILE"
  exit 1
fi

echo "=== Kaizen Squad — Report Validation ==="
echo "Arquivo: $REPORT_FILE"
echo ""

ERRORS=0
WARNINGS=0

# Secoes obrigatorias (GATE-FAIL se ausente)
REQUIRED_SECTIONS=(
  "Executive Summary"
  "Topology"
  "Performance"
  "Bottleneck"
  "Capability"
  "Radar"
  "Cost"
  "Recomenda"
)

for section in "${REQUIRED_SECTIONS[@]}"; do
  if grep -qi "$section" "$REPORT_FILE"; then
    echo "  [PASS] Secao encontrada: $section"
  else
    echo "  [FAIL] Secao AUSENTE: $section"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""

# Verificar se tem recomendacoes com nivel
if grep -qE "(CRITICO|RECOMENDADO|SUGERIDO|MONITORAR)" "$REPORT_FILE"; then
  echo "  [PASS] Recomendacoes classificadas por nivel"
else
  echo "  [WARN] Recomendacoes sem classificacao de nivel"
  WARNINGS=$((WARNINGS + 1))
fi

# Verificar se tem metricas DORA
if grep -qiE "(lead time|task frequency|MTTR|rework rate)" "$REPORT_FILE"; then
  echo "  [PASS] Metricas DORA presentes"
else
  echo "  [WARN] Metricas DORA nao encontradas"
  WARNINGS=$((WARNINGS + 1))
fi

# Verificar se tem data do relatorio
if grep -qE "[0-9]{4}-[0-9]{2}-[0-9]{2}" "$REPORT_FILE"; then
  echo "  [PASS] Data do relatorio presente"
else
  echo "  [WARN] Data do relatorio nao encontrada"
  WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "=== Resultado ==="
echo "Erros: $ERRORS | Warnings: $WARNINGS"

if [[ $ERRORS -gt 0 ]]; then
  echo "Status: GATE-FAIL"
  exit 1
elif [[ $WARNINGS -gt 0 ]]; then
  echo "Status: WARNING (relatorio aceitavel com ressalvas)"
  exit 2
else
  echo "Status: GATE-PASS"
  exit 0
fi
