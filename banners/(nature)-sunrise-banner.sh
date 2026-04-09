#!/bin/bash
# Sunrise — LUIZ FOSC version
# 10-frame animation: Dark horizon -> sun rises -> rays spread -> full sunrise

PURPLE='\033[0;35m'
ORANGE='\033[0;33m'
YELLOW='\033[1;33m'
WHITE='\033[1;37m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;220m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;214m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;208m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;202m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;196m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;226m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;226m ☀️  A new day begins ☀️${NC}  ${WHITE}${SYS_NAME:-AIOS Core} ${YELLOW}v${SYS_VERSION:-2.1}${NC}"
echo -e "\033[38;5;214m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Total darkness, just a horizon line
frame1() {
cat << 'EOF'

  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛

EOF
}

# Frame 2 - First light, purple glow at horizon
frame2() {
cat << 'EOF'

  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
  🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛

EOF
}

# Frame 3 - Purple sky growing, tiny sun peek
frame3() {
cat << 'EOF'

  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
  🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
  🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
  🟣🟣🟣🟣🟣🟣🟣🟣🟣⬜🟣🟣🟣🟣🟣🟣🟣🟣🟣🟣
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛

EOF
}

# Frame 4 - Pink sky, sun half visible
frame4() {
cat << 'EOF'

  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
  🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪
  🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪
  🩷🩷🩷🩷🩷🩷🩷🩷🩷🟪🟪🩷🩷🩷🩷🩷🩷🩷🩷🩷
  🩷🩷🩷🩷🩷🩷🩷🩷🩷⬜⬜🩷🩷🩷🩷🩷🩷🩷🩷🩷
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛

EOF
}

# Frame 5 - Orange sky, sun clearly rising
frame5() {
cat << 'EOF'

  🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪🟪
  🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷
  🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷
  🟠🟠🟠🟠🟠🟠🟠🟠🟠🩷🩷🟠🟠🟠🟠🟠🟠🟠🟠🟠
  🟠🟠🟠🟠🟠🟠🟠🟠🟠⬜⬜🟠🟠🟠🟠🟠🟠🟠🟠🟠
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛

EOF
}

# Frame 6 - Sun above horizon, first rays
frame6() {
cat << 'EOF'

  🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷🩷
  🟠🟠🟠🟠🟠🟠🟠🟠🩷🩷🩷🩷🟠🟠🟠🟠🟠🟠🟠🟠
  🟠🟠🟠🟠🟠🟠🟠🟠🟠⬜⬜🟠🟠🟠🟠🟠🟠🟠🟠🟠
  🟠🟠🟠🟠🟠🟠🟠🟠🟠⬜⬜🟠🟠🟠🟠🟠🟠🟠🟠🟠
  🟡🟡🟡🟡🟡🟡🟡🟡🟡🟠🟠🟡🟡🟡🟡🟡🟡🟡🟡🟡
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛

EOF
}

# Frame 7 - Sun high, rays spreading left and right
frame7() {
cat << 'EOF'

  🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
  🟡🟡🟡🟡🟡🟡🟡🟡🟠⬜⬜🟠🟡🟡🟡🟡🟡🟡🟡🟡
  🟡🟡🟡🟡🟡🟡🟡🟡🟡⬜⬜🟡🟡🟡🟡🟡🟡🟡🟡🟡
  🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
  🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛

EOF
}

# Frame 8 - Full sunrise, sun beams shooting outward
frame8() {
cat << 'EOF'

        ☀️
  🟡🟡🟡🟡🟡🟡🟡🟡🟡⬜🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
  🟡🟡🟡🟡🟡🟡🟡🟡⬜⬜⬜🟡🟡🟡🟡🟡🟡🟡🟡🟡
  🟡🟡🟡🟡🟡🟡🟡🟡🟡⬜🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
  🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛

EOF
}

# Frame 9 - Brilliant morning, rays everywhere
frame9() {
cat << 'EOF'

       ✨   ☀️   ✨
  🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
  🟡🟡🟡🟡🟡🟡🟡🟡⬜⬜⬜🟡🟡🟡🟡🟡🟡🟡🟡🟡
  🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
  🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛

EOF
}

# Frame 10 - Glorious sunrise complete!
frame10() {
cat << 'EOF'

  ✨     ✨   ☀️   ✨     ✨
  🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
  🟡🟡🟡🟡🟡🟡🟡⬜⬜⬜⬜⬜🟡🟡🟡🟡🟡🟡🟡🟡
  🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
  🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
  ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛

EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.3
printf "\033[H\033[2J"; frame2; sleep 0.25
printf "\033[H\033[2J"; frame3; sleep 0.25
printf "\033[H\033[2J"; frame4; sleep 0.2
printf "\033[H\033[2J"; frame5; sleep 0.2
printf "\033[H\033[2J"; frame6; sleep 0.2
printf "\033[H\033[2J"; frame7; sleep 0.2
printf "\033[H\033[2J"; frame8; sleep 0.2
printf "\033[H\033[2J"; frame9; sleep 0.2
printf "\033[H\033[2J"; frame10; sleep 0.35

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
