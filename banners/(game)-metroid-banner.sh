#!/bin/bash
# Metroid — LUIZ FOSC version
# 10-frame animation: Ship flies in -> lands -> Samus drops -> stands -> raises cannon -> charges -> FIRES -> enemy hit -> victory

ORANGE='\033[38;5;208m'
YELLOW='\033[38;5;226m'
WHITE='\033[1;37m'
GREEN='\033[0;32m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;208m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;214m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;220m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;226m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;190m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;154m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;220m 🚀 The last Metroid is in captivity. The galaxy is at peace. 🚀${NC}  ${WHITE}${SYS_NAME:-AIOS Core} ${GREEN}v${SYS_VERSION:-2.1}${NC}"
echo -e "\033[38;5;208m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Ship flying in from left (high)
frame1() {
cat << 'EOF'

    🟠🟠🟠🟠
   🟠🟢🟠🟠🟠
  🟠🟠🟠🟠🟠🟠
    🔥🔥




EOF
}

# Frame 2 - Ship flying in (mid)
frame2() {
cat << 'EOF'


          🟠🟠🟠🟠
         🟠🟢🟠🟠🟠
        🟠🟠🟠🟠🟠🟠
          🔥🔥



EOF
}

# Frame 3 - Ship descending (center)
frame3() {
cat << 'EOF'


                🟠🟠🟠🟠
               🟠🟢🟠🟠🟠
              🟠🟠🟠🟠🟠🟠
                🔥🔥



EOF
}

# Frame 4 - Ship landed, Samus drops
frame4() {
cat << 'EOF'


              🟠🟠🟠🟠🟠🟠
             🟠🟢🟠🟠🟠🟠🟠
              🟠🟠🟠🟠🟠🟠
              ⬛⬛⬛⬛⬛⬛
                   🟠
                   🟠
                   🟠

EOF
}

# Frame 5 - Samus standing in power suit
frame5() {
cat << 'EOF'


              🟠🟠🟠🟠🟠🟠
             🟠🟢🟠🟠🟠🟠🟠
              🟠🟠🟠🟠🟠🟠
              ⬛⬛⬛⬛⬛⬛
                  🟢🟢
                 🟠🟠🟠
                🟠🟩🟠🟠
                 🟠🟠🟠
                  🟠🟠

EOF
}

# Frame 6 - Samus raises arm cannon
frame6() {
cat << 'EOF'


              🟠🟠🟠🟠🟠🟠
             🟠🟢🟠🟠🟠🟠🟠
              🟠🟠🟠🟠🟠🟠
              ⬛⬛⬛⬛⬛⬛
                  🟢🟢
                 🟠🟠🟠🟩🟩🟩
                🟠🟩🟠🟠
                 🟠🟠🟠
                  🟠🟠

EOF
}

# Frame 7 - Charging! Energy building
frame7() {
cat << 'EOF'


              🟠🟠🟠🟠🟠🟠
             🟠🟢🟠🟠🟠🟠🟠
              🟠🟠🟠🟠🟠🟠
              ⬛⬛⬛⬛⬛⬛
                  🟢🟢
             ✨  🟠🟠🟠🟩🟩🟩🟡✨
                🟠🟩🟠🟠
                 🟠🟠🟠
                  🟠🟠

EOF
}

# Frame 8 - FIRES! Beam shoots across
frame8() {
cat << 'EOF'


              🟠🟠🟠🟠🟠🟠
             🟠🟢🟠🟠🟠🟠🟠
              🟠🟠🟠🟠🟠🟠
              ⬛⬛⬛⬛⬛⬛
                  🟢🟢
                 🟠🟠🟠🟩🟩🟩🟡🟡🟡🟡🟡🟡🟡🟡🟡
                🟠🟩🟠🟠
                 🟠🟠🟠
                  🟠🟠

EOF
}

# Frame 9 - Enemy hit! Explosion
frame9() {
cat << 'EOF'


              🟠🟠🟠🟠🟠🟠
             🟠🟢🟠🟠🟠🟠🟠
              🟠🟠🟠🟠🟠🟠
              ⬛⬛⬛⬛⬛⬛
                  🟢🟢
                 🟠🟠🟠🟩🟩🟩         💥💥💥
                🟠🟩🟠🟠                💥💥
                 🟠🟠🟠                  💥
                  🟠🟠

EOF
}

# Frame 10 - Victory pose! Samus victorious
frame10() {
cat << 'EOF'


              🟠🟠🟠🟠🟠🟠
             🟠🟢🟠🟠🟠🟠🟠
              🟠🟠🟠🟠🟠🟠
              ⬛⬛⬛⬛⬛⬛
          ✨      🟢🟢      ✨
                 🟠🟠🟠🟩🟩🟩
       ✨       🟠🟩🟠🟠       ✨
                 🟠🟠🟠
                  🟠🟠

EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.15
printf "\033[H\033[2J"; frame2; sleep 0.15
printf "\033[H\033[2J"; frame3; sleep 0.15
printf "\033[H\033[2J"; frame4; sleep 0.4
printf "\033[H\033[2J"; frame5; sleep 0.35
printf "\033[H\033[2J"; frame6; sleep 0.35
printf "\033[H\033[2J"; frame7; sleep 0.4
printf "\033[H\033[2J"; frame8; sleep 0.2
printf "\033[H\033[2J"; frame9; sleep 0.35
printf "\033[H\033[2J"; frame10; sleep 0.4

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
