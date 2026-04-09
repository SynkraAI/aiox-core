#!/bin/bash
# Fire Effect — LUIZ FOSC banner
# 10-frame animation: flames rising from bottom, growing taller each frame

RED='\033[0;31m'
ORANGE='\033[38;5;202m'
YELLOW='\033[1;33m'
WHITE='\033[1;37m'
GREEN='\033[0;32m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;196m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;197m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;203m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;209m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;220m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;226m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;202m 🔥 Forged in fire 🔥${NC}  ${WHITE}AIOS Core ${GREEN}v2.1${NC}"
echo -e "\033[38;5;196m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - tiny embers at bottom
frame1() {
echo -e "\033[38;5;226m"
cat << 'EOF'




          .   .   .   .   .   .   .
        . 🟡 . . 🟡 . . 🟡 . . 🟡 .
EOF
echo -e "${NC}"
}

# Frame 2 - small flames appear
frame2() {
echo -e "\033[38;5;202m"
cat << 'EOF'




        🟠 .   🟠     🟠 .   🟠   .
        🟡🟠 🟡🟠   🟡🟠 🟡🟠
        🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
EOF
echo -e "${NC}"
}

# Frame 3 - flames grow
frame3() {
echo -e "\033[38;5;196m"
cat << 'EOF'



      🟥   🟥     🟥   🟥     🟥   🟥
      🟠🟥 🟠🟥   🟠🟥 🟠🟥   🟠🟥
      🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
      🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
EOF
echo -e "${NC}"
}

# Frame 4 - flames taller
frame4() {
echo -e "\033[38;5;196m"
cat << 'EOF'


    🟥       🟥       🟥       🟥
    🟥🟥   🟥🟥🟥   🟥🟥   🟥🟥🟥
    🟠🟥🟥🟠🟥🟠🟥🟠🟥🟥🟠🟥🟠🟥
    🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
    🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
EOF
echo -e "${NC}"
}

# Frame 5 - flames reaching mid
frame5() {
echo -e "\033[38;5;196m"
cat << 'EOF'

  🟥           🟥   🟥         🟥
  🟥🟥       🟥🟥🟥🟥🟥     🟥🟥🟥
  🟥🟠🟥   🟥🟠🟥🟠🟥🟠🟥 🟥🟠🟥
  🟠🟠🟠🟥🟠🟠🟠🟠🟠🟠🟠🟥🟠🟠🟠
  🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
EOF
echo -e "${NC}"
}

# Frame 6 - big roaring fire
frame6() {
echo -e "\033[38;5;196m"
cat << 'EOF'
       🟥               🟥
     🟥🟥🟥    🟥     🟥🟥🟥    🟥
   🟥🟥🟠🟥🟥🟥🟥🟥🟥🟠🟥🟥🟥🟥🟥
   🟠🟥🟠🟠🟥🟠🟥🟠🟥🟠🟠🟥🟠🟥🟠
   🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
   🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
EOF
echo -e "${NC}"
}

# Frame 7 - inferno peak
frame7() {
echo -e "\033[38;5;196m"
cat << 'EOF'
     🟥   🟥     🟥       🟥   🟥
   🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
   🟥🟠🟥🟠🟥🟠🟥🟥🟠🟥🟠🟥🟠🟥🟠
   🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
   🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
   🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
EOF
echo -e "${NC}"
}

# Frame 8 - flames dancing wildly
frame8() {
echo -e "\033[38;5;220m"
cat << 'EOF'
   🟥 🟥   🟥   🟥 🟥   🟥   🟥 🟥
   🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
   🟠🟥🟠🟥🟠🟥🟠🟥🟠🟥🟠🟥🟠🟥🟠
   🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
   🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
   🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
EOF
echo -e "${NC}"
}

# Frame 9 - flames towering high
frame9() {
echo -e "\033[38;5;196m"
cat << 'EOF'
   🟥     🟥   🟥     🟥     🟥   🟥
   🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
   🟠🟥🟠🟥🟠🟥🟠🟥🟠🟥🟠🟥🟠🟥🟠
   🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
   🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
   🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
   🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
EOF
echo -e "${NC}"
}

# Frame 10 - maximum inferno!
frame10() {
echo -e "\033[38;5;196m"
cat << 'EOF'
 🟥 🟥   🟥   🟥   🟥   🟥   🟥 🟥 🟥
 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥
 🟠🟥🟠🟥🟠🟥🟠🟥🟠🟥🟠🟥🟠🟥🟠🟥🟠
 🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠🟠
 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
 🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡🟡
EOF
echo -e "${NC}"
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.15
printf "\033[H\033[2J"; frame2; sleep 0.15
printf "\033[H\033[2J"; frame3; sleep 0.15
printf "\033[H\033[2J"; frame4; sleep 0.2
printf "\033[H\033[2J"; frame5; sleep 0.2
printf "\033[H\033[2J"; frame6; sleep 0.2
printf "\033[H\033[2J"; frame7; sleep 0.15
printf "\033[H\033[2J"; frame8; sleep 0.15
printf "\033[H\033[2J"; frame9; sleep 0.2
printf "\033[H\033[2J"; frame10; sleep 0.35

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
