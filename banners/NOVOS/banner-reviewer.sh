#!/bin/zsh
# Banner Reviewer — Roda no terminal (zsh, macOS)
# Aprovados → ../banners/  |  Deletados → removidos  |  Pulados → ficam em NOVOS/

DEST="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$(cd "$(dirname "$0")" && pwd)"
NC=$'\033[0m'
GREEN=$'\033[38;5;46m'
RED=$'\033[38;5;196m'
YELLOW=$'\033[38;5;220m'
CYAN=$'\033[38;5;51m'
DIM=$'\033[38;5;240m'
BOLD=$'\033[1m'
KEPT=0
DELETED=0
SKIPPED=0

trap 'printf "\033[?25h"' EXIT

# Collect banners
BANNERS=()
for f in "$SRC"/*-banner.sh; do
  [ -f "$f" ] && BANNERS+=("$f")
done
TOTAL=${#BANNERS[@]}

if [ "$TOTAL" -eq 0 ]; then
  echo "${RED}Nenhum banner encontrado em: ${SRC}${NC}"
  exit 1
fi

clear
echo ""
echo "${CYAN}${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
echo "${CYAN}${BOLD}║            🎬  BANNER REVIEWER  🎬                      ║${NC}"
echo "${CYAN}${BOLD}╠══════════════════════════════════════════════════════════╣${NC}"
echo "${CYAN}${BOLD}║${NC}                                                          ${CYAN}${BOLD}║${NC}"
echo "${CYAN}${BOLD}║${NC}   Banners: ${YELLOW}$TOTAL encontrados${NC}                                ${CYAN}${BOLD}║${NC}"
echo "${CYAN}${BOLD}║${NC}                                                          ${CYAN}${BOLD}║${NC}"
echo "${CYAN}${BOLD}║${NC}   ${GREEN}[A]${NC} Aprovar (move pra banners/)                          ${CYAN}${BOLD}║${NC}"
echo "${CYAN}${BOLD}║${NC}   ${RED}[D]${NC} Deletar                                              ${CYAN}${BOLD}║${NC}"
echo "${CYAN}${BOLD}║${NC}   ${DIM}[S]${NC} Pular (fica em NOVOS/)                               ${CYAN}${BOLD}║${NC}"
echo "${CYAN}${BOLD}║${NC}   ${DIM}[Q]${NC} Sair                                                 ${CYAN}${BOLD}║${NC}"
echo "${CYAN}${BOLD}║${NC}                                                          ${CYAN}${BOLD}║${NC}"
echo "${CYAN}${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -n "  Pressione ENTER pra começar... "
read dummy

for i in {1..$TOTAL}; do
  FILE="${BANNERS[$i]}"
  NAME="$(basename "$FILE")"
  NUM=$i

  # STEP 1: Show name
  clear
  printf "\033[?25h"
  echo ""
  echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo "${BOLD}  [$NUM/$TOTAL]  ${YELLOW}$NAME${NC}"
  echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo "  ${DIM}Placar: ${GREEN}✓$KEPT${DIM} aprovados | ${RED}✗$DELETED${DIM} deletados | →$SKIPPED pulados${NC}"
  echo ""
  echo -n "  ENTER pra rodar a animação... "
  read dummy

  # STEP 2: Run banner
  bash "$FILE" </dev/null 2>/dev/null

  # STEP 3: Ask decision (banner final frame stays visible)
  printf "\033[?25h"
  echo ""
  echo ""
  echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo "${BOLD}  [$NUM/$TOTAL]  ${YELLOW}$NAME${NC}"
  echo "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "  ${GREEN}[A]${NC} Aprovar     ${RED}[D]${NC} Deletar     ${DIM}[S]${NC} Pular     ${DIM}[Q]${NC} Sair"
  echo ""

  while true; do
    echo -n "  Decisão (a/d/s/q): "
    read choice
    case "$choice" in
      a|A)
        mv "$FILE" "$DEST/"
        echo "  ${GREEN}✓ Aprovado → banners/$NAME${NC}"
        KEPT=$((KEPT + 1))
        break
        ;;
      d|D)
        rm "$FILE"
        echo "  ${RED}✗ Deletado${NC}"
        DELETED=$((DELETED + 1))
        break
        ;;
      s|S)
        echo "  ${DIM}→ Pulado${NC}"
        SKIPPED=$((SKIPPED + 1))
        break
        ;;
      q|Q)
        echo ""
        echo "${CYAN}━━━━━ RESULTADO PARCIAL ━━━━━${NC}"
        echo "  ${GREEN}✓ Aprovados: $KEPT${NC}"
        echo "  ${RED}✗ Deletados: $DELETED${NC}"
        echo "  ${DIM}→ Pulados:   $SKIPPED${NC}"
        echo ""
        exit 0
        ;;
      *)
        echo "  ${DIM}Use: a (aprovar) | d (deletar) | s (pular) | q (sair)${NC}"
        ;;
    esac
  done

  sleep 0.3
done

# FINAL
clear
REMAINING=0
for f in "$SRC"/*-banner.sh; do
  [ -f "$f" ] && REMAINING=$((REMAINING + 1))
done
echo ""
echo "${CYAN}${BOLD}╔══════════════════════════════════════════════════════════╗${NC}"
echo "${CYAN}${BOLD}║               📊  RESULTADO FINAL  📊                   ║${NC}"
echo "${CYAN}${BOLD}╠══════════════════════════════════════════════════════════╣${NC}"
echo "${CYAN}${BOLD}║${NC}                                                          ${CYAN}${BOLD}║${NC}"
echo "${CYAN}${BOLD}║${NC}   ${GREEN}✓ Aprovados: $(printf '%-43s' "$KEPT")${CYAN}${BOLD}║${NC}"
echo "${CYAN}${BOLD}║${NC}   ${RED}✗ Deletados: $(printf '%-43s' "$DELETED")${CYAN}${BOLD}║${NC}"
echo "${CYAN}${BOLD}║${NC}   ${DIM}→ Pulados:   $(printf '%-43s' "$SKIPPED")${CYAN}${BOLD}║${NC}"
echo "${CYAN}${BOLD}║${NC}   ${YELLOW}Restam em NOVOS/: $(printf '%-37s' "$REMAINING")${CYAN}${BOLD}║${NC}"
echo "${CYAN}${BOLD}║${NC}                                                          ${CYAN}${BOLD}║${NC}"
echo "${CYAN}${BOLD}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
