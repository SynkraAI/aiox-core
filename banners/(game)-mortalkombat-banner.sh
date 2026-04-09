#!/bin/bash
# Mortal Kombat — LUIZ FOSC version
# 10-frame animation: Dragon logo forms, FIGHT!

GREEN='\033[0;32m'
BLUE='\033[0;34m'
WHITE='\033[1;37m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;124m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;160m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;196m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;202m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;208m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;220m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;196m 🐉 FINISH HIM! 🐉${NC}  ${WHITE}${SYS_NAME:-AIOS Core} ${GREEN}v${SYS_VERSION:-2.1}${NC}"
echo -e "\033[38;5;124m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Black screen, just the MK circle outline
frame1() {
cat << 'EOF'



                     ⬛⬛⬛⬛⬛⬛⬛
                   ⬛              ⬛
                  ⬛                ⬛
                  ⬛                ⬛
                  ⬛                ⬛
                   ⬛              ⬛
                     ⬛⬛⬛⬛⬛⬛⬛

EOF
}

# Frame 2 - Dragon starts to form (top)
frame2() {
cat << 'EOF'



                     ⬛⬛⬛⬛⬛⬛⬛
                   ⬛    🟡🟡      ⬛
                  ⬛   🟡🟡🟡      ⬛
                  ⬛  🟡  🟡🟡     ⬛
                  ⬛      🟡        ⬛
                   ⬛              ⬛
                     ⬛⬛⬛⬛⬛⬛⬛

EOF
}

# Frame 3 - Dragon body forming
frame3() {
cat << 'EOF'



                     ⬛⬛⬛⬛⬛⬛⬛
                   ⬛    🟡🟡      ⬛
                  ⬛   🟡🟡🟡🟡    ⬛
                  ⬛  🟡  🟡🟡🟡   ⬛
                  ⬛      🟡🟡      ⬛
                   ⬛    🟡🟡     ⬛
                     ⬛⬛⬛⬛⬛⬛⬛

EOF
}

# Frame 4 - Dragon complete
frame4() {
cat << 'EOF'



                     ⬛⬛⬛⬛⬛⬛⬛
                   ⬛  🟡🟡🟡🟡    ⬛
                  ⬛  🟡🟡🟡🟡🟡   ⬛
                  ⬛ 🟡  🟡🟡🟡🟡  ⬛
                  ⬛    🟡🟡🟡🟡   ⬛
                   ⬛  🟡🟡🟡🟡  ⬛
                     ⬛⬛⬛⬛⬛⬛⬛

EOF
}

# Frame 5 - Dragon glows
frame5() {
cat << 'EOF'


                  ✨                    ✨
                     ⬛⬛⬛⬛⬛⬛⬛
                   ⬛  🟡🟡🟡🟡    ⬛
               ✨ ⬛  🟡🟡🟡🟡🟡   ⬛ ✨
                  ⬛ 🟡  🟡🟡🟡🟡  ⬛
                  ⬛    🟡🟡🟡🟡   ⬛
                   ⬛  🟡🟡🟡🟡  ⬛
                     ⬛⬛⬛⬛⬛⬛⬛
                  ✨                    ✨

EOF
}

# Frame 6 - Fire effect bottom
frame6() {
cat << 'EOF'


                  ✨                    ✨
                     ⬛⬛⬛⬛⬛⬛⬛
                   ⬛  🟡🟡🟡🟡    ⬛
               ✨ ⬛  🟡🟡🟡🟡🟡   ⬛ ✨
                  ⬛ 🟡  🟡🟡🟡🟡  ⬛
                  ⬛    🟡🟡🟡🟡   ⬛
                   ⬛  🟡🟡🟡🟡  ⬛
                     ⬛⬛⬛⬛⬛⬛⬛
               🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

EOF
}

# Frame 7 - Scorpion appears (left)
frame7() {
cat << 'EOF'

      ⬛🟡⬛
     ⬛🟡🟡🟡⬛
     ⬛⬜⬛⬜⬛
     ⬛🟡🟡🟡⬛
      ⬛🟡🟡⬛
       ⬛⬛⬛
     ⬛🟫⬛⬛🟫⬛

                  🆚

                                                ⬛🟦⬛
                                               ⬛🟦🟦🟦⬛
                                               ⬛⬜⬛⬜⬛

EOF
}

# Frame 8 - GET OVER HERE!
frame8() {
cat << 'EOF'

      ⬛🟡⬛
     ⬛🟡🟡🟡⬛
     ⬛⬜⬛⬜⬛
     ⬛🟡🟡🟡⬛ ─ ─ ─ ─ ─ 🗡️
      ⬛🟡🟡⬛
       ⬛⬛⬛
     ⬛🟫⬛⬛🟫⬛
                                                ⬛🟦⬛
              « GET OVER HERE! »               ⬛🟦🟦🟦⬛
                                               ⬛⬜⬛⬜⬛

EOF
}

# Frame 9 - FIGHT flash
frame9() {
cat << 'EOF'



           🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

                    ███████╗██╗ ██████╗ ██╗  ██╗████████╗██╗
                    ██╔════╝██║██╔════╝ ██║  ██║╚══██╔══╝██║
                    █████╗  ██║██║  ███╗███████║   ██║   ██║
                    ██╔══╝  ██║██║   ██║██╔══██║   ██║   ╚═╝
                    ██║     ██║╚██████╔╝██║  ██║   ██║   ██╗
                    ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝

           🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

EOF
}

# Frame 10 - FIGHT fading
frame10() {
cat << 'EOF'




                    ███████╗██╗ ██████╗ ██╗  ██╗████████╗██╗
                    ██╔════╝██║██╔════╝ ██║  ██║╚══██╔══╝██║
                    █████╗  ██║██║  ███╗███████║   ██║   ██║
                    ██╔══╝  ██║██║   ██║██╔══██║   ██║   ╚═╝
                    ██║     ██║╚██████╔╝██║  ██║   ██║   ██╗
                    ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝



EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.3
printf "\033[H\033[2J"; frame2; sleep 0.25
printf "\033[H\033[2J"; frame3; sleep 0.25
printf "\033[H\033[2J"; frame4; sleep 0.35
printf "\033[H\033[2J"; frame5; sleep 0.25
printf "\033[H\033[2J"; frame6; sleep 0.3
printf "\033[H\033[2J"; frame7; sleep 0.4
printf "\033[H\033[2J"; frame8; sleep 0.5
printf "\033[H\033[2J"; frame9; sleep 0.4
printf "\033[H\033[2J"; frame10; sleep 0.3

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
