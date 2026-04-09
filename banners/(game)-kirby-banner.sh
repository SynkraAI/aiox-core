#!/bin/bash
# Kirby — LUIZ FOSC version
# 10-frame animation: Kirby walks -> sees Waddle Dee -> opens mouth -> INHALES -> swallows -> puffs up -> victory dance with star wand

PINK1='\033[38;5;218m'
PINK2='\033[38;5;212m'
PINK3='\033[38;5;206m'
PINK4='\033[38;5;200m'
PINK5='\033[38;5;199m'
PINK6='\033[38;5;198m'
WHITE='\033[1;37m'
GREEN='\033[0;32m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;218m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;212m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;206m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;200m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;199m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;198m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;212m ★ Poyo! ★${NC}  ${WHITE}${SYS_NAME:-AIOS Core} ${GREEN}v${SYS_VERSION:-2.1}${NC}"
echo -e "\033[38;5;218m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Kirby walking (left side)
frame1() {
cat << 'EOF'


          ★ KIRBY ★

              ⬛⬛⬛⬛
            ⬛🩷🩷🩷🩷🩷⬛
            ⬛🩷⬛🩷🩷⬛🩷⬛
            ⬛🩷🩷🩷🩷🩷⬛
            ⬛🩷🟥🩷🩷🟥🩷⬛
              ⬛🟥⬛🟥⬛

          [ Poyo! ]


EOF
}

# Frame 2 - Kirby walking (step 2, bouncy)
frame2() {
cat << 'EOF'


          ★ KIRBY ★

                ⬛⬛⬛⬛
              ⬛🩷🩷🩷🩷🩷⬛
              ⬛🩷⬛🩷🩷⬛🩷⬛
              ⬛🩷🩷🩷🩷🩷⬛
              ⬛🩷🟥🩷🩷🟥🩷⬛
              ⬛🟥  ⬛🟥

          [ Poyo! Poyo! ]


EOF
}

# Frame 3 - Kirby spots Waddle Dee!
frame3() {
cat << 'EOF'


          ★ KIRBY ★           🟠 WADDLE DEE!

              ⬛⬛⬛⬛                  ⬛⬛⬛
            ⬛🩷🩷🩷🩷🩷⬛              ⬛🟠🟠🟠⬛
            ⬛🩷⬛🩷🩷⬛🩷⬛            ⬛🟠⬛🟠⬛🟠⬛
            ⬛🩷🩷🩷🩷🩷⬛              ⬛🟠🟠🟠⬛
            ⬛🩷🟥🩷🩷🟥🩷⬛            ⬛⬛🟠⬛⬛
              ⬛🟥⬛🟥⬛

          [ !! ]


EOF
}

# Frame 4 - Kirby opens mouth WIDE (inhale starting)
frame4() {
cat << 'EOF'


          ★ INHALING... ★         🟠

              ⬛⬛⬛⬛⬛                ⬛⬛⬛
            ⬛🩷🩷🩷🩷🩷🩷⬛            ⬛🟠🟠🟠⬛
            ⬛🩷⬛🩷🩷🩷⬜⬜⬛          ⬛🟠⬛🟠⬛🟠⬛
            ⬛🩷🩷🩷🩷🩷🩷⬛            ⬛🟠🟠🟠⬛
            ⬛🩷🟥🩷🩷🟥🩷⬛            ⬛⬛🟠⬛⬛
              ⬛🟥⬛🟥⬛
          💨💨💨💨💨

          [ HAAAAAAA— ]


EOF
}

# Frame 5 - FULL INHALE! Waddle Dee flying toward Kirby
frame5() {
cat << 'EOF'


          ★ MAXIMUM INHALE ★

              ⬛⬛⬛⬛⬛⬛
            ⬛🩷🩷🩷🩷🩷🩷🩷⬛
            ⬛🩷⬛🩷🩷🩷⬜⬜⬜⬛     🟠
            ⬛🩷🩷🩷🩷🩷🩷🩷⬛
            ⬛🩷🟥🩷🩷🟥🩷⬛
              ⬛🟥⬛🟥⬛
        💨💨💨💨💨💨💨💨💨💨

          [ POOOOOOYOOO!! ]


EOF
}

# Frame 6 - Kirby SWALLOWS Waddle Dee!
frame6() {
cat << 'EOF'


          ★ GULP! ★

              ⬛⬛⬛⬛⬛⬛
            ⬛🩷🩷🩷🩷🩷🩷🩷⬛
            ⬛🩷⬛🩷🟠🩷🩷⬛🩷⬛
            ⬛🩷🩷🩷🩷🩷🩷🩷⬛
            ⬛🩷🟥🩷🩷🟥🩷⬛
              ⬛🟥⬛🟥⬛

          [ *GULP* ]


EOF
}

# Frame 7 - Kirby puffs up (full of air/power)
frame7() {
cat << 'EOF'


          ★ PUFFED UP! ★

            ⬛⬛⬛⬛⬛⬛⬛
          ⬛🩷🩷🩷🩷🩷🩷🩷🩷⬛
          ⬛🩷🩷⬛🩷🩷🩷⬛🩷🩷⬛
          ⬛🩷🩷🩷🩷🩷🩷🩷🩷⬛
          ⬛🩷🩷🟥🩷🩷🟥🩷🩷⬛
            ⬛⬛🟥⬛⬛🟥⬛⬛

          [ SO FULL... ]


EOF
}

# Frame 8 - Kirby spits star (victory)
frame8() {
cat << 'EOF'


          ✨ STAR POWER! ✨

            ⬛⬛⬛⬛⬛⬛⬛
          ⬛🩷🩷🩷🩷🩷🩷🩷🩷⬛
          ⬛🩷🩷⬛🩷🩷🩷⬛🩷🩷⬛
          ⬛🩷🩷🩷🩷🩷🩷🩷🩷⬛
          ⬛🩷🩷🟥🩷🩷🟥🩷🩷⬛
            ⬛⬛🟥⬛⬛🟥⬛⬛
                              ⭐💫✨💫⭐

          [ HIYAAAAH! ]


EOF
}

# Frame 9 - Kirby victory dance! (wand raised)
frame9() {
cat << 'EOF'


          ⭐ VICTORY DANCE! ⭐

                    ⭐
                    ✨
              ⬛⬛⬛⬛⬛⬛
            ⬛🩷🩷🩷🩷🩷🩷⬛
            ⬛🩷⬛🩷🩷🩷⬛🩷⬛
            ⬛🩷🩷🩷🩷🩷🩷⬛
            ⬛🩷🟥🩷🩷🟥🩷⬛
          ⬛🟥  ⬛🟥

          [ POYO! POYO! POYO! ]


EOF
}

# Frame 10 - Kirby final pose with star wand, sparkles everywhere
frame10() {
cat << 'EOF'


          ✨⭐ KIRBY WINS! ⭐✨

     ✨          ⭐              ✨
                ★
              ⬛⬛⬛⬛⬛⬛
     ✨      ⬛🩷🩷🩷🩷🩷🩷⬛      ✨
            ⬛🩷⬛🩷🩷🩷⬛🩷⬛
     ⭐      ⬛🩷🩷🩷🩷🩷🩷⬛      ⭐
            ⬛🩷🟥🩷🩷🟥🩷⬛
              ⬛🟥⬛🟥⬛

          ★ Poyo! ★


EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.3
printf "\033[H\033[2J"; frame2; sleep 0.3
printf "\033[H\033[2J"; frame3; sleep 0.4
printf "\033[H\033[2J"; frame4; sleep 0.35
printf "\033[H\033[2J"; frame5; sleep 0.3
printf "\033[H\033[2J"; frame6; sleep 0.35
printf "\033[H\033[2J"; frame7; sleep 0.3
printf "\033[H\033[2J"; frame8; sleep 0.35
printf "\033[H\033[2J"; frame9; sleep 0.4
printf "\033[H\033[2J"; frame10; sleep 0.5

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
