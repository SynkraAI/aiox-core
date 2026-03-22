#!/usr/bin/env bash
# Context Surgeon — Discover auto-loaded files
# Usage: bash discover.sh [project-root]
# Output: TSV to stdout (LABEL\tPATH). Read-only.

set -euo pipefail

PROJECT="${1:-.}"
PROJECT="$(cd "$PROJECT" && pwd)"
CLAUDE_HOME="${HOME}/.claude"

add() { [ -f "$1" ] && printf '%s\t%s\n' "$2" "$1" || true; }

add "$PROJECT/CLAUDE.md" "CLAUDE.md"
add "$PROJECT/.claude/CLAUDE.md" ".claude/CLAUDE.md"

if [ -d "$PROJECT/.claude/rules" ]; then
  for f in "$PROJECT"/.claude/rules/*.md; do
    [ -f "$f" ] && add "$f" ".claude/rules/$(basename "$f")"
  done
fi

add "$CLAUDE_HOME/CLAUDE.md" "~/.claude/CLAUDE.md"

# MEMORY.md — build expected hash from project path
# Claude Code uses: D:\marketing-os → D--marketing-os
# Git Bash gives: /d/marketing-os → we convert to D--marketing-os
POSIX_PATH="$PROJECT"
if [[ "$POSIX_PATH" =~ ^/([a-zA-Z])/(.*) ]]; then
  DRIVE="${BASH_REMATCH[1]^^}"
  REST="${BASH_REMATCH[2]}"
  PROJECT_HASH="${DRIVE}--${REST//\//-}"
elif [[ "$POSIX_PATH" =~ ^([A-Za-z]):[\\/](.*) ]]; then
  DRIVE="${BASH_REMATCH[1]^^}"
  REST="${BASH_REMATCH[2]}"
  REST="${REST//\\/-}"
  REST="${REST//\//-}"
  PROJECT_HASH="${DRIVE}--${REST}"
else
  PROJECT_HASH="$(basename "$PROJECT")"
fi

# Try exact hash match first
if [ -f "$CLAUDE_HOME/projects/$PROJECT_HASH/memory/MEMORY.md" ]; then
  add "$CLAUDE_HOME/projects/$PROJECT_HASH/memory/MEMORY.md" "~/.claude/projects/$PROJECT_HASH/memory/MEMORY.md"
else
  # Fallback: match by project folder name (exact suffix match)
  PROJECT_NAME="$(basename "$PROJECT")"
  if [ -d "$CLAUDE_HOME/projects" ]; then
    for dir in "$CLAUDE_HOME/projects/"*/; do
      DIRNAME="$(basename "$dir")"
      if [[ "$DIRNAME" == *"$PROJECT_NAME" ]]; then
        add "${dir}memory/MEMORY.md" "~/.claude/projects/$DIRNAME/memory/MEMORY.md"
        break
      fi
    done
  fi
fi
