#!/usr/bin/env bash
# kaizen-trigger.sh — Detecta mudanças relevantes e sugere análise do Kaizen Squad
#
# Chamado pelo post-commit hook. Analisa o diff do último commit e identifica
# quando o Kaizen Squad deveria ser ativado.
#
# Uso:
#   bash squads/kaizen/scripts/kaizen-trigger.sh
#
# Exit codes:
#   0 = Nenhum trigger detectado
#   1 = Trigger detectado (mostra recomendação)

set -euo pipefail

# Arquivos modificados no último commit
CHANGED_FILES=$(git diff-tree --no-commit-id --name-only -r HEAD 2>/dev/null || echo "")

if [[ -z "$CHANGED_FILES" ]]; then
  exit 0
fi

TRIGGERS=()
COMMANDS=()

# ─────────────────────────────────────────────────────────────
# TRIGGER 1: Novo squad ou agente criado/modificado
# ─────────────────────────────────────────────────────────────
SQUAD_CHANGES=$(echo "$CHANGED_FILES" | grep -cE '^squads/[^/]+/(agents|config)/' || true)
if [[ "$SQUAD_CHANGES" -gt 0 ]]; then
  TRIGGERS+=("Squad/agente criado ou modificado ($SQUAD_CHANGES arquivos)")
  COMMANDS+=("/kaizen:gaps — verificar gaps de competência")
  COMMANDS+=("/kaizen:radar — atualizar technology radar")
fi

# ─────────────────────────────────────────────────────────────
# TRIGGER 2: Epic ou Story criada/modificada (planejamento)
# ─────────────────────────────────────────────────────────────
PLANNING_CHANGES=$(echo "$CHANGED_FILES" | grep -cE '^docs/(stories|prd|epics)/' || true)
if [[ "$PLANNING_CHANGES" -gt 0 ]]; then
  TRIGGERS+=("Epic/Story/PRD modificado ($PLANNING_CHANGES arquivos)")
  COMMANDS+=("/kaizen:gaps — verificar se há gaps para o novo trabalho")
  COMMANDS+=("/kaizen:analyze — análise completa pós-planejamento")
fi

# ─────────────────────────────────────────────────────────────
# TRIGGER 3: Feature completada (feat( no commit message)
# ─────────────────────────────────────────────────────────────
COMMIT_MSG=$(git log -1 --pretty=%B 2>/dev/null || echo "")
if echo "$COMMIT_MSG" | grep -qiE '^feat(\(|:)'; then
  TRIGGERS+=("Feature completada: ${COMMIT_MSG%%$'\n'*}")
  COMMANDS+=("/kaizen:performance — verificar impacto no ecossistema")
  COMMANDS+=("/kaizen:cost — análise de custo da feature")
fi

# ─────────────────────────────────────────────────────────────
# TRIGGER 4: Workflow ou task modificado (estrutural)
# ─────────────────────────────────────────────────────────────
WORKFLOW_CHANGES=$(echo "$CHANGED_FILES" | grep -cE '^squads/[^/]+/(workflows|tasks)/' || true)
if [[ "$WORKFLOW_CHANGES" -gt 0 ]]; then
  TRIGGERS+=("Workflow/task modificado ($WORKFLOW_CHANGES arquivos)")
  COMMANDS+=("/kaizen:performance — verificar se métricas mudam")
fi

# ─────────────────────────────────────────────────────────────
# TRIGGER 5: Minds ou frameworks alterados
# ─────────────────────────────────────────────────────────────
MIND_CHANGES=$(echo "$CHANGED_FILES" | grep -cE '^squads/[^/]+/minds/' || true)
if [[ "$MIND_CHANGES" -gt 0 ]]; then
  TRIGGERS+=("Minds/frameworks alterados ($MIND_CHANGES arquivos)")
  COMMANDS+=("/kaizen:radar — verificar alinhamento do radar")
fi

# ─────────────────────────────────────────────────────────────
# OUTPUT
# ─────────────────────────────────────────────────────────────
if [[ ${#TRIGGERS[@]} -eq 0 ]]; then
  exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  KAIZEN SQUAD — Trigger Detectado"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
for trigger in "${TRIGGERS[@]}"; do
  echo "  -> $trigger"
done
echo ""
echo "  Comandos recomendados:"

# Deduplica comandos preservando espaços
printf '%s\n' "${COMMANDS[@]}" | sort -u | while IFS= read -r cmd; do
  echo "     $cmd"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit 1
