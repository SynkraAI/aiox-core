#!/bin/bash
# AIOS Core — Backup to GitHub (Stream Deck)
# Commit all changes + push to your fork in one click

cd /Users/luizfosc/aios-core || {
  echo "🚨 ❌ ERRO: Não foi possível acessar /Users/luizfosc/aios-core"
  osascript -e 'display notification "🚨 Não consegui acessar o diretório aios-core" with title "❌ AIOS Backup - ERRO" sound name "Basso"'
  exit 1
}

# Check if there are changes to commit
if git diff --quiet HEAD && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo "👍"
  osascript -e 'display notification "Nada para enviar — tudo já está no GitHub" with title "AIOS Backup" sound name "Pop"'
  exit 0
fi

# Stage all changes
if ! git add -A; then
  echo "🚨 ❌ ERRO: Falha ao adicionar arquivos (git add -A)"
  osascript -e 'display notification "🚨 Falha ao adicionar arquivos. Verifique o terminal." with title "❌ AIOS Backup - ERRO" sound name "Basso"'
  exit 1
fi

# Commit with timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")
if ! git commit -m "backup: $TIMESTAMP"; then
  echo "🚨 ❌ ERRO: Falha ao criar commit"
  osascript -e 'display notification "🚨 Falha ao criar commit. Verifique o terminal." with title "❌ AIOS Backup - ERRO" sound name "Basso"'
  exit 1
fi

# Push to GitHub
if git push origin main; then
  echo "👍"
  osascript -e 'display notification "Backup enviado com sucesso!" with title "AIOS Backup ✓" sound name "Glass"'
else
  echo "🚨 ❌ ERRO: Push para GitHub falhou"
  osascript -e 'display notification "🚨 Push falhou. Pode ter conflito ou problema de rede." with title "❌ AIOS Backup - ERRO" sound name "Basso"'
  exit 1
fi
