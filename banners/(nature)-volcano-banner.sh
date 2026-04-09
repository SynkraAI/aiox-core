#!/bin/bash
# Volcano Eruption — LUIZ FOSC version
# 10-frame animation: Quiet mountain -> tremor -> ERUPTION -> lava rising -> ash falling

RED='\033[0;31m'
ORANGE='\033[0;33m'
YELLOW='\033[1;33m'
WHITE='\033[1;37m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;196m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;202m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;208m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;214m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;220m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;226m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;196m 🌋 Eruption mode 🌋${NC}  ${WHITE}${SYS_NAME:-AIOS Core} ${ORANGE}v${SYS_VERSION:-2.1}${NC}"
echo -e "\033[38;5;202m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Quiet mountain, peaceful
frame1() {
cat << 'EOF'

             ⬛
           ⬛🟫⬛
          ⬛🟫🟫⬛
         ⬛🟫🟫🟫⬛
        ⬛🟫🟫🟫🟫⬛
  ⬛⬛⬛⬛🟫🟫🟫🟫🟫⬛⬛⬛⬛⬛

EOF
}

# Frame 2 - Tremor! Mountain shifts left
frame2() {
cat << 'EOF'

            ⬛
          ⬛🟫⬛
         ⬛🟫🟫⬛
        ⬛🟫🟫🟫⬛
       ⬛🟫🟫🟫🟫⬛
  ⬛⬛⬛🟫🟫🟫🟫🟫⬛⬛⬛⬛⬛⬛

EOF
}

# Frame 3 - Tremor! Mountain shifts right
frame3() {
cat << 'EOF'

              ⬛
            ⬛🟫⬛
           ⬛🟫🟫⬛
          ⬛🟫🟫🟫⬛
         ⬛🟫🟫🟫🟫⬛
  ⬛⬛⬛⬛⬛🟫🟫🟫🟫🟫⬛⬛⬛⬛

EOF
}

# Frame 4 - First smoke, rumbling
frame4() {
cat << 'EOF'

           ░ ░ ░
             ⬛
           ⬛🟫⬛
          ⬛🟫🟫⬛
         ⬛🟫🟫🟫⬛
        ⬛🟫🟫🟫🟫⬛
  ⬛⬛⬛⬛🟫🟫🟫🟫🟫⬛⬛⬛⬛⬛

EOF
}

# Frame 5 - ERUPTION STARTS! First lava burst
frame5() {
cat << 'EOF'

        🟡🟡🟡🟡🟡
          🟠🟠🟠
           🟥⬛
           ⬛🟫⬛
          ⬛🟫🟫⬛
         ⬛🟫🟫🟫⬛
        ⬛🟫🟫🟫🟫⬛
  ⬛⬛⬛⬛🟫🟫🟫🟫🟫⬛⬛⬛⬛⬛

EOF
}

# Frame 6 - ERUPTION PEAK! Lava flying high
frame6() {
cat << 'EOF'

   🟡  🟡🟡🟡🟡🟡  🟡
    🟠🟠🟠🟠🟠🟠🟠🟠
      🟥🟥🟡🟡🟥🟥
         🟠🟠🟠
          ⬛🟫⬛
         ⬛🟫🟫⬛
        ⬛🟫🟫🟫⬛
  ⬛⬛⬛⬛🟫🟫🟫🟫🟫⬛⬛⬛⬛⬛

EOF
}

# Frame 7 - Lava raining down
frame7() {
cat << 'EOF'

  🟡        🟡    🟡    🟡
     🟠  🟠    🟠    🟠
  🟥    🟥        🟥
        🟠🟠🟠🟠🟠
          ⬛🟫⬛
         ⬛🟫🟫⬛
        ⬛🟫🟫🟫⬛
  ⬛⬛⬛⬛🟫🟫🟫🟫🟫⬛⬛⬛⬛⬛

EOF
}

# Frame 8 - Lava flowing down mountain sides
frame8() {
cat << 'EOF'

  ░     ░   ░     ░   ░
     ░     ░    ░    ░
          🟥⬛🟥
         ⬛🟫🟫⬛
    🟠  ⬛🟠🟫🟠⬛  🟠
       ⬛🟥🟫🟫🟥⬛
  ⬛⬛⬛🟠🟫🟫🟫🟫🟠⬛⬛⬛⬛⬛

EOF
}

# Frame 9 - Ash falling everywhere
frame9() {
cat << 'EOF'

  ░  ░  ░  ░  ░  ░  ░  ░  ░
   ░    ░    ░    ░    ░    ░
  ░  ░    ░  🟥⬛🟥  ░  ░  ░
   ░  ░  ░  ⬛🟫🟫⬛  ░  ░  ░
  ░  🟠  ░  ⬛🟫🟫⬛  ░  🟠  ░
   ░  ░  ⬛🟥🟫🟫🟥⬛  ░  ░  ░
  ⬛⬛⬛🟠🟫🟫🟫🟫🟠⬛⬛⬛⬛⬛

EOF
}

# Frame 10 - Aftermath: lava rivers, ash cloud
frame10() {
cat << 'EOF'

  ░░░░░░░░░░░░░░░░░░░░░░░░░
  ░░░░░░░░░░░░░░░░░░░░░░░░░
         🟥⬛🟥
        ⬛🟫🟫⬛
  🟠🟠🟠⬛🟫🟫⬛🟠🟠🟠🟠🟠🟠
  🟥🟥⬛⬛🟫🟫🟫⬛🟥🟥🟥🟥🟥
  ⬛⬛⬛🟠🟫🟫🟫🟫🟠⬛⬛⬛⬛⬛

EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.5
printf "\033[H\033[2J"; frame2; sleep 0.1
printf "\033[H\033[2J"; frame3; sleep 0.1
printf "\033[H\033[2J"; frame4; sleep 0.3
printf "\033[H\033[2J"; frame5; sleep 0.2
printf "\033[H\033[2J"; frame6; sleep 0.15
printf "\033[H\033[2J"; frame7; sleep 0.2
printf "\033[H\033[2J"; frame8; sleep 0.2
printf "\033[H\033[2J"; frame9; sleep 0.25
printf "\033[H\033[2J"; frame10; sleep 0.35

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
