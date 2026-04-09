#!/bin/bash
# Ocean Wave — LUIZ FOSC version
# 10-frame animation: Wave builds from right -> crests -> crashes -> foam dissipates

BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;27m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;33m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;39m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;45m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;51m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;159m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;51m 🌊 Ride the wave 🌊${NC}  ${WHITE}${SYS_NAME:-AIOS Core} ${CYAN}v${SYS_VERSION:-2.1}${NC}"
echo -e "\033[38;5;27m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Calm ocean, flat horizon
frame1() {
cat << 'EOF'

  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵
  🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫

EOF
}

# Frame 2 - Small swell building on the right
frame2() {
cat << 'EOF'

  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🔵🔵🔵
  🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🟦🟦🟦
  🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫

EOF
}

# Frame 3 - Wave building, moving left
frame3() {
cat << 'EOF'

  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦⬜🔵🔵🔵🟦
  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🔵🔵🟦🟦🟦🟦
  🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🟦🟦🟦🟦🟦🟦
  🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫

EOF
}

# Frame 4 - Wave rising higher, crest forming
frame4() {
cat << 'EOF'

  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦⬜⬜🟦🟦🟦🟦🟦
  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🔵🔵⬜🔵🟦🟦🟦🟦
  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🔵🔵🟦🟦🟦🟦🟦🟦🟦
  🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫

EOF
}

# Frame 5 - Wave at peak, about to crest
frame5() {
cat << 'EOF'

  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦⬜⬜⬜🟦🟦🟦🟦🟦🟦🟦
  🟦🟦🟦🟦🟦🟦🟦🟦🟦🔵🔵⬜⬜⬜🟦🟦🟦🟦🟦🟦
  🟦🟦🟦🟦🟦🟦🟦🟦🔵🔵🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🔵🔵🔵🔵🔵🔵🔵🔵🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫

EOF
}

# Frame 6 - CRASH! Wave breaks at center
frame6() {
cat << 'EOF'

  🟦🟦🟦🟦🟦🟦🟦⬜⬜⬜⬜⬜🟦🟦🟦🟦🟦🟦🟦🟦
  🟦🟦🟦🟦🟦🟦🔵⬜⬜⬜⬜⬜⬜🟦🟦🟦🟦🟦🟦🟦
  🟦🟦🟦🟦🟦🔵🔵🔵⬜⬜🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🔵🔵🔵🔵🔵🔵🔵🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫

EOF
}

# Frame 7 - Wave crashed, foam spreading
frame7() {
cat << 'EOF'

  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🔵🔵🔵🟦🟦🟦
  🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🟦🟦🟦🟦🟦🟦
  🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫

EOF
}

# Frame 8 - Foam rushing across sand
frame8() {
cat << 'EOF'

  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵
  ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜🟫🟫🟫🟫🟫🟫🟫🟫🟫
  🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫

EOF
}

# Frame 9 - Foam pulling back
frame9() {
cat << 'EOF'

  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵
  🟫🟫🟫🟫🟫🟫🟫⬜⬜⬜⬜⬜🟫🟫🟫🟫🟫🟫🟫🟫
  🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫

EOF
}

# Frame 10 - Calm again, wet sand glistens
frame10() {
cat << 'EOF'

  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
  🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵🔵
  🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
  🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫

EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.3
printf "\033[H\033[2J"; frame2; sleep 0.2
printf "\033[H\033[2J"; frame3; sleep 0.2
printf "\033[H\033[2J"; frame4; sleep 0.2
printf "\033[H\033[2J"; frame5; sleep 0.2
printf "\033[H\033[2J"; frame6; sleep 0.15
printf "\033[H\033[2J"; frame7; sleep 0.15
printf "\033[H\033[2J"; frame8; sleep 0.2
printf "\033[H\033[2J"; frame9; sleep 0.2
printf "\033[H\033[2J"; frame10; sleep 0.35

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
