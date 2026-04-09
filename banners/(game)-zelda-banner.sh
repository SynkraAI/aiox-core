#!/bin/bash
# The Legend of Zelda — LUIZ FOSC version
# 10-frame animation: Link draws Master Sword, Triforce appears

GREEN='\033[0;32m'
BLUE='\033[0;34m'
WHITE='\033[1;37m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;22m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;28m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;34m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;40m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;46m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;82m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;220m ▲ It's dangerous to code alone! Take this. ▲${NC}  ${WHITE}${SYS_NAME:-AIOS Core} ${GREEN}v${SYS_VERSION:-2.1}${NC}"
echo -e "\033[38;5;22m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Pedestal with Master Sword
frame1() {
cat << 'EOF'

                          ⬜
                         ⬜⬜⬜
                        🟦⬜⬜⬜🟦
                          🟦🟦
                          🟦🟦
                          🟦🟦
                          🟦🟦
                       🟫🟫🟫🟫🟫🟫
                     🟫🟫🟫🟫🟫🟫🟫🟫

EOF
}

# Frame 2 - Link approaches (small, left)
frame2() {
cat << 'EOF'

                          ⬜
                         ⬜⬜⬜
       ⬛🟢⬛          🟦⬜⬜⬜🟦
      ⬛🟢🟢🟢⬛        🟦🟦
      ⬛🏽🏽🏽⬛        🟦🟦
       ⬛🟢🟢⬛          🟦🟦
        ⬛⬛⬛            🟦🟦
      ⬛🟫⬛⬛🟫⬛   🟫🟫🟫🟫🟫🟫
                     🟫🟫🟫🟫🟫🟫🟫🟫

EOF
}

# Frame 3 - Link closer
frame3() {
cat << 'EOF'

                          ⬜
                         ⬜⬜⬜
            ⬛🟢⬛     🟦⬜⬜⬜🟦
           ⬛🟢🟢🟢⬛   🟦🟦
           ⬛🏽🏽🏽⬛   🟦🟦
            ⬛🟢🟢⬛     🟦🟦
             ⬛⬛⬛       🟦🟦
           ⬛🟫⬛⬛🟫⬛🟫🟫🟫🟫🟫🟫
                     🟫🟫🟫🟫🟫🟫🟫🟫

EOF
}

# Frame 4 - Link grabs sword
frame4() {
cat << 'EOF'

                          ⬜
                         ⬜⬜⬜
                  ⬛🟢⬛⬜⬜⬜🟦
                 ⬛🟢🟢🟢⬛🟦
                 ⬛🏽🏽🏽⬛🟦
                  ⬛🟢🟢⬛🟦🟦
                   ⬛⬛⬛  🟦🟦
                 ⬛🟫⬛⬛🟫🟫🟫🟫🟫
                     🟫🟫🟫🟫🟫🟫🟫🟫

EOF
}

# Frame 5 - Pulling sword (halfway)
frame5() {
cat << 'EOF'

                      ⬜
                     ⬜⬜⬜
                  ⬛🟢⬜⬜⬜🟦
                 ⬛🟢🟢🟢⬛
                 ⬛🏽🏽🏽⬛  🟦
                  ⬛🟢🟢⬛   🟦
                   ⬛⬛⬛    🟦🟦
                 ⬛🟫⬛⬛🟫🟫🟫🟫🟫
                     🟫🟫🟫🟫🟫🟫🟫🟫

EOF
}

# Frame 6 - Sword drawn! Link holds it up
frame6() {
cat << 'EOF'

                    ⬜
                   ⬜⬜⬜
                  🟦⬜⬜⬜🟦
                  ⬛🟢🟦🟦⬛
                 ⬛🟢🟢🟢⬛
                 ⬛🏽🏽🏽⬛
                  ⬛🟢🟢⬛
                   ⬛⬛⬛
                 ⬛🟫⬛⬛🟫⬛
                   🟫🟫🟫🟫

EOF
}

# Frame 7 - Sword glow effect
frame7() {
cat << 'EOF'

               ✨  ⬜  ✨
                  ⬜⬜⬜
             ✨ 🟦⬜⬜⬜🟦 ✨
                  ⬛🟢🟦🟦⬛
                 ⬛🟢🟢🟢⬛
                 ⬛🏽🏽🏽⬛
                  ⬛🟢🟢⬛
                   ⬛⬛⬛
                 ⬛🟫⬛⬛🟫⬛
                   🟫🟫🟫🟫

EOF
}

# Frame 8 - Triforce appears (dim)
frame8() {
cat << 'EOF'

                        🟡
                       🟡🟡
                      🟡🟡🟡
                     🟡🟡🟡🟡

                  ⬛🟢🟦🟦⬛
                 ⬛🟢🟢🟢⬛
                 ⬛🏽🏽🏽⬛
                  ⬛🟢🟢⬛
                   ⬛⬛⬛

EOF
}

# Frame 9 - Full Triforce!
frame9() {
cat << 'EOF'

                        🟡
                       🟡🟡
                      🟡🟡🟡
                     🟡🟡🟡🟡
                    🟡🟡  🟡🟡
                   🟡🟡🟡🟡🟡🟡
                  🟡🟡🟡🟡🟡🟡🟡
                 🟡🟡🟡🟡🟡🟡🟡🟡

                  ⬛🟢🟦🟦⬛

EOF
}

# Frame 10 - Triforce blazing!
frame10() {
cat << 'EOF'

                   ✨    🟡    ✨
                       🟡🟡
                 ✨   🟡🟡🟡   ✨
                     🟡🟡🟡🟡
                    🟡🟡  🟡🟡
                ✨ 🟡🟡🟡🟡🟡🟡 ✨
                  🟡🟡🟡🟡🟡🟡🟡
                 🟡🟡🟡🟡🟡🟡🟡🟡
              ✨                    ✨
                  ⬛🟢🟦🟦⬛

EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.4
printf "\033[H\033[2J"; frame2; sleep 0.3
printf "\033[H\033[2J"; frame3; sleep 0.3
printf "\033[H\033[2J"; frame4; sleep 0.35
printf "\033[H\033[2J"; frame5; sleep 0.3
printf "\033[H\033[2J"; frame6; sleep 0.4
printf "\033[H\033[2J"; frame7; sleep 0.25
printf "\033[H\033[2J"; frame8; sleep 0.3
printf "\033[H\033[2J"; frame9; sleep 0.35
printf "\033[H\033[2J"; frame10; sleep 0.4

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
