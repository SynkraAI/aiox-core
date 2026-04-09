#!/bin/bash
# Audio Equalizer — LUIZ FOSC version
# 10-frame animation: EQ bars bouncing -> bars freeze forming LUIZ FOSC logo

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;196m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;214m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;226m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;118m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;51m  ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;201m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;226m 🎵 Turn it up! 🎵${NC}  ${WHITE}${SYS_NAME:-AIOS Core} ${GREEN}v${SYS_VERSION:-2.1}${NC}"
echo -e "\033[38;5;196m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Helper to draw a bar of given height (max 10), colored green/yellow/red
draw_bar() {
  local h=$1
  local bar=""
  for i in $(seq 1 $((10 - h))); do bar="$bar  "; done
  for i in $(seq 1 $h); do
    if [ $i -le 3 ]; then
      bar="${GREEN}█${NC}$bar"
    elif [ $i -le 6 ]; then
      bar="${YELLOW}█${NC}$bar"
    else
      bar="${RED}█${NC}$bar"
    fi
  done
  printf "%s " "$bar"
}

# Frame 1 - EQ bouncing random
frame1() {
echo ""
echo ""
echo -e "  ${RED}█${NC}     ${RED}█${NC}           ${RED}█${NC}  ${RED}█${NC}     ${RED}█${NC}        ${RED}█${NC}  ${RED}█${NC}     ${RED}█${NC}     ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}"
echo -e "  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}        ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}     ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}"
echo -e "  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}     ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}"
echo -e "  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}"
echo -e "  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}"
echo -e "  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}"
echo -e "  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}"
echo ""
echo -e "  ${CYAN}♪ ♫  ♪  ♫   ♪  ♫  ♪   ♫  ♪  ♫   ♪  ♫  ♪   ♫  ♪${NC}"
echo ""
}

# Frame 2 - different heights
frame2() {
echo ""
echo ""
echo -e "        ${RED}█${NC}     ${RED}█${NC}  ${RED}█${NC}        ${RED}█${NC}     ${RED}█${NC}        ${RED}█${NC}        ${RED}█${NC}"
echo -e "  ${RED}█${NC}     ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}"
echo -e "  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}"
echo -e "  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}"
echo -e "  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}"
echo -e "  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}"
echo -e "  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}"
echo ""
echo -e "  ${CYAN}♫ ♪  ♫  ♪   ♫  ♪  ♫   ♪  ♫  ♪   ♫  ♪  ♫   ♪  ♫${NC}"
echo ""
}

# Frame 3 - peak energy
frame3() {
echo ""
echo -e "  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}"
echo -e "  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}"
echo -e "  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}"
echo -e "  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}"
echo -e "  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}"
echo -e "  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}"
echo -e "  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}"
echo ""
echo -e "  ${YELLOW}★  ★  ★  ★  ★  ★  ★  ★  ★  ★  ★  ★  ★  ★  ★  ★${NC}"
echo ""
}

# Frame 4 - bars starting to suggest L shape
frame4() {
echo ""
echo ""
echo -e "  ${RED}█${NC}        ${RED}█${NC}        ${RED}█${NC}     ${RED}█${NC}        ${RED}█${NC}        ${RED}█${NC}     ${RED}█${NC}"
echo -e "  ${RED}█${NC}  ${RED}█${NC}     ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}     ${RED}█${NC}  ${RED}█${NC}     ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}"
echo -e "  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}"
echo -e "  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}"
echo -e "  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}"
echo -e "  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}"
echo -e "  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}"
echo ""
echo -e "  ${CYAN}♪ ♫  ♪  ♫   ♪  ♫  ♪   ♫  ♪  ♫   ♪  ♫  ♪   ♫  ♪${NC}"
echo ""
}

# Frame 5 - bars dropping, starting to reveal logo shape
frame5() {
echo ""
echo ""
echo ""
echo -e "  ${RED}█${NC}        ${RED}█${NC}        ${RED}█${NC}  ${RED}█${NC}     ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}     ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}"
echo -e "  ${RED}█${NC}  ${RED}█${NC}     ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}  ${RED}█${NC}"
echo -e "  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}"
echo -e "  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}"
echo -e "  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}"
echo ""
echo -e "  ${CYAN}♪ ♫  ♪  ♫   ♪  ♫  ♪   ♫  ♪  ♫   ♪  ♫  ♪   ♫  ♪${NC}"
echo ""
}

# Frame 6 - bars settling, logo outline emerging
frame6() {
echo ""
echo ""
echo ""
echo -e "  ${MAGENTA}█${NC}        ${MAGENTA}█${NC}        ${MAGENTA}█${NC}  ${MAGENTA}█${NC}  ${MAGENTA}█${NC}     ${MAGENTA}█${NC}  ${MAGENTA}█${NC}     ${MAGENTA}█${NC}  ${MAGENTA}█${NC}"
echo -e "  ${MAGENTA}█${NC}        ${MAGENTA}█${NC}        ${MAGENTA}█${NC}  ${MAGENTA}█${NC}  ${MAGENTA}█${NC}  ${MAGENTA}█${NC}  ${MAGENTA}█${NC}  ${MAGENTA}█${NC}  ${MAGENTA}█${NC}  ${MAGENTA}█${NC}  ${MAGENTA}█${NC}"
echo -e "  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}"
echo -e "  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}"
echo -e "  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}"
echo ""
echo -e "  ${MAGENTA}✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦  ✦${NC}"
echo ""
}

# Frame 7 - logo text appears over bars (L U I Z)
frame7() {
cat << 'EOF'

  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  ░  LUIZ FOSC - AIOS CORE - EQ LOCK IN PROGRESS  ░
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

EOF
echo -e "  ${CYAN}█${NC}                                              ${CYAN}█${NC}"
echo -e "  ${CYAN}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${YELLOW}█${NC}  ${CYAN}█${NC}"
echo -e "  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}"
echo -e "  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}  ${GREEN}█${NC}"
echo ""
}

# Frame 8 - bars freeze, glitch flash
frame8() {
cat << 'EOF'

  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  ▓                                               ▓
  ▓   ██████   ██  ██  ██  ████████   ██████     ▓
  ▓   ██       ██  ██  ██     ██      ██         ▓
  ▓   ██       ██  ██  ██     ██      ██         ▓
  ▓   ██████   ██  ██████     ██      ██████     ▓
  ▓   ██          ██  ██      ██      ██         ▓
  ▓   ██          ██   ██     ██      ██         ▓
  ▓   ██████  ██  ██   ██     ██      ██████     ▓
  ▓                                               ▓
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

EOF
}

# Frame 9 - EQ bars locked into logo shape, rainbow colors
frame9() {
echo ""
echo -e "  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m \033[0m  \033[38;5;214m█\033[0m  \033[38;5;214m \033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m \033[0m  \033[38;5;118m█\033[0m  \033[38;5;118m \033[0m  \033[38;5;51m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;201m \033[0m  \033[38;5;201m█\033[0m"
echo -e "  \033[38;5;196m█\033[0m  \033[38;5;196m \033[0m  \033[38;5;196m \033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m \033[0m  \033[38;5;214m█\033[0m  \033[38;5;214m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m \033[0m  \033[38;5;226m \033[0m  \033[38;5;118m█\033[0m  \033[38;5;118m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;51m \033[0m  \033[38;5;201m█\033[0m  \033[38;5;201m \033[0m"
echo -e "  \033[38;5;196m█\033[0m  \033[38;5;196m \033[0m  \033[38;5;196m \033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m \033[0m  \033[38;5;214m█\033[0m  \033[38;5;214m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;118m█\033[0m  \033[38;5;118m \033[0m  \033[38;5;51m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;201m \033[0m"
echo -e "  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m \033[0m  \033[38;5;214m█\033[0m  \033[38;5;214m \033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m \033[0m  \033[38;5;226m \033[0m  \033[38;5;118m█\033[0m  \033[38;5;118m \033[0m  \033[38;5;51m█\033[0m  \033[38;5;51m \033[0m  \033[38;5;51m \033[0m  \033[38;5;201m█\033[0m"
echo -e "  \033[38;5;214m█\033[0m  \033[38;5;214m \033[0m  \033[38;5;214m \033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m \033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m \033[0m  \033[38;5;118m█\033[0m  \033[38;5;118m \033[0m  \033[38;5;118m \033[0m  \033[38;5;51m█\033[0m  \033[38;5;51m \033[0m  \033[38;5;201m█\033[0m  \033[38;5;201m \033[0m  \033[38;5;201m \033[0m  \033[38;5;196m \033[0m"
echo -e "  \033[38;5;226m█\033[0m  \033[38;5;226m \033[0m  \033[38;5;226m \033[0m  \033[38;5;118m█\033[0m  \033[38;5;118m \033[0m  \033[38;5;118m█\033[0m  \033[38;5;118m \033[0m  \033[38;5;51m█\033[0m  \033[38;5;51m \033[0m  \033[38;5;51m \033[0m  \033[38;5;201m█\033[0m  \033[38;5;201m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m \033[0m  \033[38;5;196m \033[0m  \033[38;5;214m \033[0m"
echo -e "  \033[38;5;226m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;118m█\033[0m  \033[38;5;118m \033[0m  \033[38;5;118m█\033[0m  \033[38;5;118m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;201m█\033[0m  \033[38;5;201m \033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;214m█\033[0m"
echo ""
echo -e "  \033[38;5;226m🎵  L  U  I  Z     F  O  S  C  🎵\033[0m"
echo ""
}

# Frame 10 - victory: logo + EQ celebrating
frame10() {
echo ""
echo -e "  \033[38;5;196m▂\033[0m  \033[38;5;196m▂\033[0m  \033[38;5;196m▂\033[0m  \033[38;5;196m▂\033[0m  \033[38;5;196m▂\033[0m  \033[38;5;214m▂\033[0m  \033[38;5;214m▂\033[0m  \033[38;5;226m▂\033[0m  \033[38;5;226m▂\033[0m  \033[38;5;226m▂\033[0m  \033[38;5;118m▂\033[0m  \033[38;5;118m▂\033[0m  \033[38;5;51m▂\033[0m  \033[38;5;51m▂\033[0m  \033[38;5;201m▂\033[0m  \033[38;5;201m▂\033[0m"
echo -e "  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;214m█\033[0m  \033[38;5;214m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;118m█\033[0m  \033[38;5;118m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;201m█\033[0m  \033[38;5;201m█\033[0m"
echo -e "  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;214m█\033[0m  \033[38;5;214m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;118m█\033[0m  \033[38;5;118m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;201m█\033[0m  \033[38;5;201m█\033[0m"
echo -e "  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;214m█\033[0m  \033[38;5;214m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;118m█\033[0m  \033[38;5;118m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;201m█\033[0m  \033[38;5;201m█\033[0m"
echo -e "  \033[38;5;214m█\033[0m  \033[38;5;214m█\033[0m  \033[38;5;214m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;118m█\033[0m  \033[38;5;118m█\033[0m  \033[38;5;118m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;201m█\033[0m  \033[38;5;201m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m"
echo -e "  \033[38;5;226m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;226m█\033[0m  \033[38;5;118m█\033[0m  \033[38;5;118m█\033[0m  \033[38;5;118m█\033[0m  \033[38;5;118m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;51m█\033[0m  \033[38;5;201m█\033[0m  \033[38;5;201m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;196m█\033[0m  \033[38;5;214m█\033[0m  \033[38;5;214m█\033[0m"
echo ""
echo -e "  \033[38;5;226m🎵  ✦  ✦  LUIZ FOSC LOCKED IN  ✦  ✦  🎵\033[0m"
echo ""
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.12
printf "\033[H\033[2J"; frame2; sleep 0.12
printf "\033[H\033[2J"; frame3; sleep 0.12
printf "\033[H\033[2J"; frame1; sleep 0.12
printf "\033[H\033[2J"; frame4; sleep 0.2
printf "\033[H\033[2J"; frame5; sleep 0.25
printf "\033[H\033[2J"; frame6; sleep 0.3
printf "\033[H\033[2J"; frame7; sleep 0.4
printf "\033[H\033[2J"; frame8; sleep 0.3
printf "\033[H\033[2J"; frame9; sleep 0.4
printf "\033[H\033[2J"; frame10; sleep 0.35

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
