#!/bin/bash
# Contra — LUIZ FOSC version
# 10-frame animation: P1 runs in -> P2 runs in -> both center -> spread gun pickup -> flash -> both shooting spread -> boss wall appears -> unloading -> boss explodes -> victory

GREEN='\033[0;32m'
WHITE='\033[1;37m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;34m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;40m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;46m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;82m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;118m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;154m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;82m ↑ ↑ ↓ ↓ ← → ← → B A START${NC}  ${WHITE}${SYS_NAME:-AIOS Core} ${GREEN}v${SYS_VERSION:-2.1}${NC}"
echo -e "\033[38;5;34m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Player 1 (blue) runs in from left
frame1() {
cat << 'EOF'

    1UP                                       2UP
    0000                                      0000

  🟦🟢
  🟦🟦
   🟦

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
}

# Frame 2 - P1 farther in, P2 starts entering from right
frame2() {
cat << 'EOF'

    1UP                                       2UP
    0000                                      0000

         🟦🟢                      🟢🟥
         🟦🟦                      🟥🟥
          🟦                        🟥

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
}

# Frame 3 - Both run to center
frame3() {
cat << 'EOF'

    1UP                                       2UP
    0000                                      0000

              🟦🟢          🟢🟥
              🟦🟦          🟥🟥
               🟦            🟥

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
}

# Frame 4 - Spread gun pickup appears!
frame4() {
cat << 'EOF'

    1UP                                       2UP
    0000                                      0000

              🟦🟢   🟡S🟡   🟢🟥
              🟦🟦   🟡🟡🟡  🟥🟥
               🟦             🟥

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
}

# Frame 5 - FLASH! Power up!
frame5() {
cat << 'EOF'

    1UP                                       2UP
    0000                                      0000

    ✨  ✨  ✨  ✨  ✨  ✨  ✨  ✨  ✨  ✨  ✨

    ✨  ✨  ✨  ✨  ✨  ✨  ✨  ✨  ✨  ✨  ✨

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
}

# Frame 6 - Both shooting spread pattern!
frame6() {
cat << 'EOF'

    1UP                                       2UP
    0000                                      0000

                        💛
              🟦🟢   💛💛💛   🟢🟥
    💛💛💛   🟦🟦   💛   💛  🟥🟥  💛💛💛
              🟦     💛💛💛    🟥

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
}

# Frame 7 - Boss alien wall appears on right!
frame7() {
cat << 'EOF'

    1UP                                       2UP
    0000                                      0000

                                         🟥🟥🟥🟥🟥
              🟦🟢          🟢🟥        🟥👾🟥👾🟥
              🟦🟦          🟥🟥        🟥🟥🟥🟥🟥
               🟦            🟥         🟥👾🟥👾🟥

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
}

# Frame 8 - Unloading on boss! Bullets flying
frame8() {
cat << 'EOF'

    1UP                                       2UP
    0000                                      0000

                                         🟥🟥🟥🟥🟥
              🟦🟢  💛💛💛💛 🟢🟥  💛  🟥👾🟥👾🟥
              🟦🟦  💛💛💛💛 🟥🟥  💛  🟥🟥🟥🟥🟥
               🟦   💛💛💛💛  🟥   💛  🟥👾🟥👾🟥

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
}

# Frame 9 - Boss EXPLODES!
frame9() {
cat << 'EOF'

    1UP                                       2UP
    0000                                      0000

                                         💥💥💥💥💥
              🟦🟢          🟢🟥        💥💥💥💥💥
              🟦🟦          🟥🟥        💥💥💥💥💥
               🟦            🟥         💥💥💥💥💥

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
}

# Frame 10 - VICTORY! Both heroes celebrate
frame10() {
cat << 'EOF'

    1UP                                       2UP
    0000                                      0000

        ✨                                  ✨
     ✨  🟦🟢  ✨    🏆  🏆  🏆    ✨  🟢🟥  ✨
        🟦🟦                              🟥🟥
     ✨   🟦   ✨                      ✨   🟥   ✨

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.15
printf "\033[H\033[2J"; frame2; sleep 0.15
printf "\033[H\033[2J"; frame3; sleep 0.3
printf "\033[H\033[2J"; frame4; sleep 0.4
printf "\033[H\033[2J"; frame5; sleep 0.15
printf "\033[H\033[2J"; frame6; sleep 0.3
printf "\033[H\033[2J"; frame7; sleep 0.4
printf "\033[H\033[2J"; frame8; sleep 0.3
printf "\033[H\033[2J"; frame9; sleep 0.35
printf "\033[H\033[2J"; frame10; sleep 0.4

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
