#!/bin/bash
# Castlevania — LUIZ FOSC version
# 10-frame animation: Moon + ground -> castle silhouette -> bats fly -> Belmont walks -> whip extends -> whip CRACK -> heart drops -> Dracula appears -> cross thrown -> Dracula hit

PURPLE='\033[38;5;125m'
RED='\033[38;5;196m'
WHITE='\033[1;37m'
GREEN='\033[0;32m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;53m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;89m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;125m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;161m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;197m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;196m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;197m 🦇 Die, monster! You don't belong in this world! 🦇${NC}  ${WHITE}${SYS_NAME:-AIOS Core} ${GREEN}v${SYS_VERSION:-2.1}${NC}"
echo -e "\033[38;5;53m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Moon rises, ground appears
frame1() {
cat << 'EOF'

              🌕

    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛



EOF
}

# Frame 2 - Castle silhouette rises
frame2() {
cat << 'EOF'

              🌕
          🟫      🟫
         🟫🟫      🟫🟫
    🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
    🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛

EOF
}

# Frame 3 - Bats fly out from castle
frame3() {
cat << 'EOF'

              🌕
          🟫      🟫
         🟫🟫  🦇  🟫🟫
    🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
    🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛

EOF
}

# Frame 4 - Bats scatter, Belmont walks in from left
frame4() {
cat << 'EOF'

    🦇          🌕       🦇
          🟫      🟫
         🟫🟫      🟫🟫
    🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
    🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
   🟫🟫🟫 🚶

EOF
}

# Frame 5 - Belmont at center, whip extends
frame5() {
cat << 'EOF'

                🌕
          🟫      🟫
         🟫🟫      🟫🟫
    🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
    🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
           🟫🟫🟫
                🟫 ~~~~~~~~~~~~~~~

EOF
}

# Frame 6 - Whip CRACK! Candle breaks
frame6() {
cat << 'EOF'

                🌕
          🟫      🟫
         🟫🟫      🟫🟫
    🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
    🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
           🟫🟫🟫
                🟫 ~~~~~~~~~~~~~~~💥🕯️

EOF
}

# Frame 7 - Heart drops from candle
frame7() {
cat << 'EOF'

                🌕
          🟫      🟫
         🟫🟫      🟫🟫
    🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
    🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
           🟫🟫🟫                        🧡
                🟫 ~~~~~~~~~~~    💛

EOF
}

# Frame 8 - Dracula appears!
frame8() {
cat << 'EOF'

                🌕
          🟫      🟫
         🟫🟫  🟪🟪  🟫🟫
    🟫🟫🟫🟫🟫🟪🟪🟪🟫🟫🟫🟫🟫🟫
    🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
           🟫🟫🟫
                🟫

EOF
}

# Frame 9 - Cross thrown at Dracula!
frame9() {
cat << 'EOF'

                🌕
          🟫      🟫
         🟫🟫  🟪🟪  🟫🟫
    🟫🟫🟫🟫🟫🟪🟪🟪🟫🟫🟫🟫🟫🟫
    🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
           🟫🟫🟫
                🟫   ✝️ ✝️ ✝️ ✝️ ✝️ →

EOF
}

# Frame 10 - Dracula hit! Victory!
frame10() {
cat << 'EOF'

                🌕
          🟫    💥💥💥  🟫
         🟫🟫  💥🟪💥  🟫🟫
    🟫🟫🟫🟫🟫💥🟪💥🟫🟫🟫🟫🟫🟫
    🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫
    ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
           🟫🟫🟫
                🟫

EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.15
printf "\033[H\033[2J"; frame2; sleep 0.3
printf "\033[H\033[2J"; frame3; sleep 0.25
printf "\033[H\033[2J"; frame4; sleep 0.35
printf "\033[H\033[2J"; frame5; sleep 0.35
printf "\033[H\033[2J"; frame6; sleep 0.3
printf "\033[H\033[2J"; frame7; sleep 0.35
printf "\033[H\033[2J"; frame8; sleep 0.4
printf "\033[H\033[2J"; frame9; sleep 0.3
printf "\033[H\033[2J"; frame10; sleep 0.4

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
