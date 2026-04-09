#!/bin/bash
# DOOM — LUIZ FOSC version
# 10-frame animation: Doomguy face healthy -> angry -> hurt -> pulls BFG 9000 -> charges -> FIRES green beam -> explosion -> victory smirk

RED1='\033[38;5;196m'
RED2='\033[38;5;160m'
RED3='\033[38;5;124m'
RED4='\033[38;5;88m'
RED5='\033[38;5;52m'
WHITE='\033[1;37m'
GREEN='\033[0;32m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;196m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;160m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;124m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;88m  ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;52m  ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;196m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;196m 💀 RIP AND TEAR! 💀${NC}  ${WHITE}${SYS_NAME:-AIOS Core} ${GREEN}v${SYS_VERSION:-2.1}${NC}"
echo -e "\033[38;5;160m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Doomguy healthy face (neutral)
frame1() {
cat << 'EOF'


          💀 DOOM 💀

              ⬛⬛⬛⬛⬛⬛
            ⬛🟫🟫🟫🟫🟫🟫⬛
            ⬛🟫⬛⬜🟫⬜⬛🟫⬛
            ⬛🟫🟫🟫🟫🟫🟫⬛
            ⬛🟫🟥🟥🟥🟥🟥🟫⬛
              ⬛⬛⬛⬛⬛⬛

          [ HEALTH: 100% ]


EOF
}

# Frame 2 - Doomguy grins (sees demons)
frame2() {
cat << 'EOF'


          💀 DOOM 💀

              ⬛⬛⬛⬛⬛⬛
            ⬛🟫🟫🟫🟫🟫🟫⬛
            ⬛🟫⬛🟫🟫🟫⬛🟫⬛
            ⬛🟫🟫🟫🟫🟫🟫⬛
            ⬛🟫⬜🟫🟫🟫⬜🟫⬛
              ⬛⬛⬛⬛⬛⬛

          [ DEMONS SPOTTED ]


EOF
}

# Frame 3 - Doomguy ANGRY (getting hit by demon)
frame3() {
cat << 'EOF'


          ☠️  TAKING DAMAGE ☠️

        🟥    ⬛⬛⬛⬛⬛⬛    🟥
            ⬛🟫🟫🟫🟫🟫🟫⬛
        🟥  ⬛🟫⬛🟥🟫🟥⬛🟫⬛  🟥
            ⬛🟫🟫🟫🟫🟫🟫⬛
            ⬛🟫🟥🟫🟫🟥🟫⬛
              ⬛⬛⬛⬛⬛⬛

          [ HEALTH: 47% ] 🩸


EOF
}

# Frame 4 - Doomguy pulls BFG 9000!
frame4() {
cat << 'EOF'


          🔫 BFG 9000 EQUIPPED 🔫

              ⬛⬛⬛⬛⬛⬛
            ⬛🟫🟫🟫🟫🟫🟫⬛
            ⬛🟫⬛🟫🟫🟫⬛🟫⬛
            ⬛🟫🟫🟫🟫🟫🟫⬛
            ⬛🟫🟥🟥🟥🟥🟥🟫⬛
              ⬛⬛⬛⬛⬛⬛
                          🟩🟩🟩🟩🟩🟩🟩
                        ⬛⬛⬛⬛⬛⬛⬛⬛

          [ AMMO: 40 ]


EOF
}

# Frame 5 - Charging BFG (green energy building)
frame5() {
cat << 'EOF'


          ⚡ CHARGING BFG 9000 ⚡

              ⬛⬛⬛⬛⬛⬛
            ⬛🟫🟫🟫🟫🟫🟫⬛
            ⬛🟫⬛🟩🟫🟩⬛🟫⬛
            ⬛🟫🟫🟫🟫🟫🟫⬛
            ⬛🟫🟥🟥🟥🟥🟥🟫⬛
              ⬛⬛⬛⬛⬛⬛
                          🟩🟩🟩🟩🟩🟩🟩
                        ⬛🟩🟩🟩🟩🟩🟩⬛
          🟩                🟩  🟩  🟩  🟩

          [ CHARGED: 75% ] 🟢


EOF
}

# Frame 6 - FIRES! Green beam shoots across
frame6() {
cat << 'EOF'


          🟢 FIRING BFG 9000!! 🟢

              ⬛⬛⬛⬛⬛⬛
            ⬛🟫🟫🟫🟫🟫🟫⬛
            ⬛🟫🟩🟩🟫🟩🟩🟫⬛
            ⬛🟫🟫🟫🟫🟫🟫⬛
            ⬛🟫🟥🟥🟥🟥🟥🟫⬛
              ⬛⬛⬛⬛⬛⬛
                          🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩

          [ FIRE!! ] 🔥🟢🔥


EOF
}

# Frame 7 - Explosion! (demon hit)
frame7() {
cat << 'EOF'


          💥 DIRECT HIT! 💥

              ⬛⬛⬛⬛⬛⬛
            ⬛🟫🟫🟫🟫🟫🟫⬛
            ⬛🟫⬛🟫🟫🟫⬛🟫⬛
            ⬛🟫🟫🟫🟫🟫🟫⬛
            ⬛🟫🟥🟥🟥🟥🟥🟫⬛
              ⬛⬛⬛⬛⬛⬛
                                    💥💥💥
                                  💥🟥🟥🟥💥
                                  💥🟥💥🟥💥
                                    💥💥💥

          [ DEMON SLAUGHTERED ] ☠️


EOF
}

# Frame 8 - All explosions! Carnage!
frame8() {
cat << 'EOF'


          ☠️  RIP AND TEAR! ☠️

          💥      💥      💥      💥

            💥  🟥💥🟥  💥  🟥💥  💥

          💥      💥  🩸    💥      💥

            💥  💥  🟥  💥  💥  💥

          💥      💥      💥      💥

          🩸🩸🩸🩸🩸🩸🩸🩸🩸🩸🩸🩸🩸


EOF
}

# Frame 9 - Doomguy smirks victorious
frame9() {
cat << 'EOF'


          😈 RIPPING AND TEARING 😈

              ⬛⬛⬛⬛⬛⬛
            ⬛🟫🟫🟫🟫🟫🟫⬛
            ⬛🟫⬛🟫🟫🟫⬛🟫⬛
            ⬛🟫🟫🟫🟫🟫🟫⬛
            ⬛🟫⬜🟫🟫🟫⬜🟫⬛
              ⬛⬛⬛⬛⬛⬛

          [ KILLS: 666 ] 🔱


EOF
}

# Frame 10 - Victory! Doomguy big grin with BFG
frame10() {
cat << 'EOF'


          🏆 UNTIL IT IS DONE! 🏆

              ⬛⬛⬛⬛⬛⬛
            ⬛🟫🟫🟫🟫🟫🟫⬛
          🟩⬛🟫⬛🟫🟫🟫⬛🟫⬛
          🟩⬛🟫🟫🟫🟫🟫🟫⬛
          🟩⬛🟫⬜🟫🟫🟫⬜🟫⬛
              ⬛⬛⬛⬛⬛⬛

          💀 RIP AND TEAR! 💀


EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.4
printf "\033[H\033[2J"; frame2; sleep 0.3
printf "\033[H\033[2J"; frame3; sleep 0.35
printf "\033[H\033[2J"; frame4; sleep 0.4
printf "\033[H\033[2J"; frame5; sleep 0.35
printf "\033[H\033[2J"; frame6; sleep 0.25
printf "\033[H\033[2J"; frame7; sleep 0.3
printf "\033[H\033[2J"; frame8; sleep 0.25
printf "\033[H\033[2J"; frame9; sleep 0.4
printf "\033[H\033[2J"; frame10; sleep 0.5

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
