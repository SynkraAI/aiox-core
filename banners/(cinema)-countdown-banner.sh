#!/bin/bash
# Cinema Countdown — LUIZ FOSC banner
# 9-frame animation: 5→4→3→2→1→GO with different colors + film reel border

WHITE='\033[1;37m'
GREEN='\033[0;32m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;196m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;202m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;226m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;46m  ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;51m  ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;201m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;226m 🎬 Action! 🎬${NC}  ${WHITE}AIOS Core ${GREEN}v2.1${NC}"
echo -e "\033[38;5;226m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

film_border_top() {
  local color=$1
  echo -e "${color}    ╔╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╗${NC}"
}

film_border_bot() {
  local color=$1
  echo -e "${color}    ╚╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╫╝${NC}"
}

film_row() {
  local color=$1
  local content=$2
  echo -e "${color}    ║${NC}${content}${color}║${NC}"
}

# Frame 1 - 5 in cyan
frame1() {
local C='\033[0;36m'
film_border_top "$C"
film_row "$C" "                                                  "
film_row "$C" "         ███████╗                                 "
film_row "$C" "         ██╔════╝                                 "
film_row "$C" "         ███████╗                                 "
film_row "$C" "         ╚════██║                                 "
film_row "$C" "         ███████║                                 "
film_row "$C" "         ╚══════╝                                 "
film_row "$C" "                                                  "
film_border_bot "$C"
}

# Frame 2 - white flash
frame2() {
local C='\033[1;37m'
film_border_top "$C"
film_row "$C" "                                                  "
film_row "$C" "                                                  "
film_row "$C" "          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ "
film_row "$C" "          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ "
film_row "$C" "          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ "
film_row "$C" "                                                  "
film_row "$C" "                                                  "
film_row "$C" "                                                  "
film_border_bot "$C"
}

# Frame 3 - 4 in green
frame3() {
local C='\033[0;32m'
film_border_top "$C"
film_row "$C" "                                                  "
film_row "$C" "         ██╗  ██╗                                 "
film_row "$C" "         ██║  ██║                                 "
film_row "$C" "         ███████║                                 "
film_row "$C" "         ╚════██║                                 "
film_row "$C" "              ██║                                 "
film_row "$C" "              ╚═╝                                 "
film_row "$C" "                                                  "
film_border_bot "$C"
}

# Frame 4 - white flash
frame4() {
frame2
}

# Frame 5 - 3 in yellow
frame5() {
local C='\033[1;33m'
film_border_top "$C"
film_row "$C" "                                                  "
film_row "$C" "         ██████╗                                  "
film_row "$C" "         ╚════██╗                                 "
film_row "$C" "          █████╔╝                                 "
film_row "$C" "         ╚═══██╗                                  "
film_row "$C" "         ██████╔╝                                 "
film_row "$C" "         ╚═════╝                                  "
film_row "$C" "                                                  "
film_border_bot "$C"
}

# Frame 6 - 2 in orange
frame6() {
local C='\033[38;5;202m'
film_border_top "$C"
film_row "$C" "                                                  "
film_row "$C" "         ██████╗                                  "
film_row "$C" "         ╚════██╗                                 "
film_row "$C" "          █████╔╝                                 "
film_row "$C" "         ██╔═══╝                                  "
film_row "$C" "         ███████╗                                 "
film_row "$C" "         ╚══════╝                                 "
film_row "$C" "                                                  "
film_border_bot "$C"
}

# Frame 7 - 1 in red
frame7() {
local C='\033[0;31m'
film_border_top "$C"
film_row "$C" "                                                  "
film_row "$C" "          ██╗                                     "
film_row "$C" "         ███║                                     "
film_row "$C" "         ╚██║                                     "
film_row "$C" "          ██║                                     "
film_row "$C" "         ███║                                     "
film_row "$C" "         ╚══╝                                     "
film_row "$C" "                                                  "
film_border_bot "$C"
}

# Frame 8 - GO! in magenta
frame8() {
local C='\033[38;5;201m'
film_border_top "$C"
film_row "$C" "                                                  "
film_row "$C" "    \033[38;5;196m🔥\033[38;5;201m  ██████╗  ██████╗    \033[38;5;196m🔥\033[38;5;201m                 "
film_row "$C" "       ██╔════╝ ██╔═══██╗                        "
film_row "$C" "       ██║  ███╗██║   ██║                        "
film_row "$C" "       ██║   ██║██║   ██║                        "
film_row "$C" "       ╚██████╔╝╚██████╔╝                        "
film_row "$C" "    \033[38;5;196m🔥\033[38;5;201m   ╚═════╝  ╚═════╝    \033[38;5;196m🔥\033[38;5;201m                 "
film_row "$C" "                                                  "
film_border_bot "$C"
}

# Frame 9 - ACTION! rainbow
frame9() {
echo -e "\033[38;5;196m    🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥${NC}"
echo -e "\033[38;5;196m      ╔══════════════════════════════════════════════╗${NC}"
echo -e "\033[38;5;196m      ║  \033[38;5;202mA\033[38;5;226mC\033[38;5;46mT\033[38;5;51mI\033[38;5;21mO\033[38;5;201mN\033[38;5;196m!\033[1;37m  —  LIGHTS, CAMERA, AIOS CORE!  \033[38;5;196m║${NC}"
echo -e "\033[38;5;196m      ╚══════════════════════════════════════════════╝${NC}"
echo -e "\033[38;5;196m    🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥${NC}"
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.5
printf "\033[H\033[2J"; frame2; sleep 0.1
printf "\033[H\033[2J"; frame3; sleep 0.5
printf "\033[H\033[2J"; frame4; sleep 0.1
printf "\033[H\033[2J"; frame5; sleep 0.5
printf "\033[H\033[2J"; frame6; sleep 0.5
printf "\033[H\033[2J"; frame7; sleep 0.5
printf "\033[H\033[2J"; frame8; sleep 0.4
printf "\033[H\033[2J"; frame9; sleep 0.5

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
