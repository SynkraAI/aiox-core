#!/bin/bash
# Pinball — LUIZ FOSC version
# 10-frame animation: ball launches -> bounces off bumpers -> hits LUIZ FOSC bumper -> TILT -> score

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;196m ██╗     ██╗   ██╗██╗███████╗\033[38;5;46m    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;202m ██║     ██║   ██║██║╚══███╔╝\033[38;5;51m    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;226m ██║     ██║   ██║██║  ███╔╝ \033[38;5;201m    █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;46m  ██║     ██║   ██║██║ ███╔╝  \033[38;5;226m    ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;51m  ███████╗╚██████╔╝██║███████╗\033[38;5;196m    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;201m ╚══════╝ ╚═════╝ ╚═╝╚══════╝\033[38;5;202m    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;196m 🔴 MULTIBALL! 🔴${NC}  ${WHITE}${SYS_NAME:-AIOS Core} \033[38;5;46mv${SYS_VERSION:-2.1}${NC}"
echo -e "\033[38;5;201m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Ball in the launcher, ready
frame1() {
cat << 'EOF'

    ╔══════════════════════════════════╗
    ║  ◆           ◆           ◆      ║
    ║     ◆                 ◆         ║
    ║           ◆     ◆               ║
    ║  ◆                    ◆         ║
    ║       ◆         ◆               ║
    ║                                 ║
    ║  ╔═══[ LUIZ FOSC ]═══╗          ║
    ║  ║                   ║          ║
    ║  ╚═══════════════════╝          ║
    ║                            ║ ● ║
    ╚════════════════════════════╩═══╝
    SCORE: 000000        BALL: 1

EOF
}

# Frame 2 - Ball launches upward
frame2() {
cat << 'EOF'

    ╔══════════════════════════════════╗
    ║  ◆           ◆           ◆      ║
    ║     ◆                 ◆         ║
    ║           ◆     ◆               ║
    ║  ◆                    ◆         ║
    ║       ◆         ◆          ●    ║
    ║                                 ║
    ║  ╔═══[ LUIZ FOSC ]═══╗          ║
    ║  ║                   ║          ║
    ║  ╚═══════════════════╝          ║
    ║                            ║   ║
    ╚════════════════════════════╩═══╝
    SCORE: 000000        BALL: 1

EOF
}

# Frame 3 - Ball hits first bumper (top right)
frame3() {
cat << 'EOF'

    ╔══════════════════════════════════╗
    ║  ◆           ◆           ◆  ✨  ║
    ║     ◆                 ◆    ●    ║
    ║           ◆     ◆               ║
    ║  ◆                    ◆         ║
    ║       ◆         ◆               ║
    ║                                 ║
    ║  ╔═══[ LUIZ FOSC ]═══╗          ║
    ║  ║                   ║          ║
    ║  ╚═══════════════════╝          ║
    ║                            ║   ║
    ╚════════════════════════════╩═══╝
    SCORE: 001000        BALL: 1  +1000!

EOF
}

# Frame 4 - Ball ricochets to center top
frame4() {
cat << 'EOF'

    ╔══════════════════════════════════╗
    ║  ◆           ◆     ●     ◆      ║
    ║     ◆                 ◆         ║
    ║           ◆     ◆               ║
    ║  ◆                    ◆         ║
    ║       ◆         ◆               ║
    ║                                 ║
    ║  ╔═══[ LUIZ FOSC ]═══╗          ║
    ║  ║                   ║          ║
    ║  ╚═══════════════════╝          ║
    ║                            ║   ║
    ╚════════════════════════════╩═══╝
    SCORE: 001000        BALL: 1

EOF
}

# Frame 5 - Ball hits center bumper, big flash
frame5() {
cat << 'EOF'

    ╔══════════════════════════════════╗
    ║  ◆           ◆✨          ◆      ║
    ║     ◆           ●     ◆         ║
    ║           ◆     ◆               ║
    ║  ◆                    ◆         ║
    ║       ◆         ◆               ║
    ║                                 ║
    ║  ╔═══[ LUIZ FOSC ]═══╗          ║
    ║  ║                   ║          ║
    ║  ╚═══════════════════╝          ║
    ║                            ║   ║
    ╚════════════════════════════╩═══╝
    SCORE: 003500        BALL: 1  +2500!

EOF
}

# Frame 6 - Ball heading toward LUIZ FOSC bumper
frame6() {
cat << 'EOF'

    ╔══════════════════════════════════╗
    ║  ◆           ◆           ◆      ║
    ║     ◆                 ◆         ║
    ║           ◆     ◆               ║
    ║  ◆             ●         ◆      ║
    ║       ◆         ◆               ║
    ║                                 ║
    ║  ╔═══[ LUIZ FOSC ]═══╗          ║
    ║  ║                   ║          ║
    ║  ╚═══════════════════╝          ║
    ║                            ║   ║
    ╚════════════════════════════╩═══╝
    SCORE: 003500        BALL: 1

EOF
}

# Frame 7 - DIRECT HIT on LUIZ FOSC bumper! EXPLOSION!
frame7() {
cat << 'EOF'

    ╔══════════════════════════════════╗
    ║  ◆           ◆           ◆      ║
    ║     ◆                 ◆         ║
    ║           ◆     ◆               ║
    ║  ◆                    ◆         ║
    ║       ◆         ◆               ║
    ║   ✨  ✨  ✨  ✨  ✨  ✨  ✨  ✨   ║
    ║  ╔═══[★LUIZ FOSC★]═══╗  ✨      ║
    ║  ║   ✨  ●  ✨  ✨     ║          ║
    ║  ╚═══════════════════╝          ║
    ║                            ║   ║
    ╚════════════════════════════╩═══╝
    SCORE: 013500        BALL: 1  JACKPOT +10000!

EOF
}

# Frame 8 - TILT WARNING! Screen flashes
frame8() {
cat << 'EOF'

    ╔══════════════════════════════════╗
    ║                                  ║
    ║                                  ║
    ║    ████████  ██  ██  ████████    ║
    ║       ██     ██  ██     ██       ║
    ║       ██     ██████     ██       ║
    ║       ██     ██  ██     ██       ║
    ║       ██     ██  ██     ██       ║
    ║                                  ║
    ║                                  ║
    ║          ⚠  T I L T  ⚠           ║
    ╚══════════════════════════════════╝
    SCORE: 013500        BALL: 1  🚨🚨🚨

EOF
}

# Frame 9 - Ball in drain, GAME OVER flash
frame9() {
cat << 'EOF'

    ╔══════════════════════════════════╗
    ║  ◆           ◆           ◆      ║
    ║     ◆                 ◆         ║
    ║           ◆     ◆               ║
    ║  ◆                    ◆         ║
    ║       ◆         ◆               ║
    ║                                 ║
    ║  ╔═══[ LUIZ FOSC ]═══╗          ║
    ║  ║  *** GAME OVER *** ║          ║
    ║  ╚═══════════════════╝          ║
    ║              ●             ║   ║
    ╚════════════════════════════╩═══╝
    SCORE: 013500        HIGH SCORE! 🏆

EOF
}

# Frame 10 - Score board, insert coin
frame10() {
cat << 'EOF'

    ╔══════════════════════════════════╗
    ║                                  ║
    ║      🔴  H I G H  S C O R E  🔴   ║
    ║                                  ║
    ║         PLAYER 1: 013500          ║
    ║         PLAYER 2: 000000          ║
    ║                                  ║
    ║        ★ ★ ★  LUIZ FOSC ★ ★ ★    ║
    ║                                  ║
    ║         >>> INSERT COIN <<<       ║
    ║                                  ║
    ╚══════════════════════════════════╝
    🔴 MULTIBALL  ◆ BUMPER  ✨ JACKPOT

EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.5
printf "\033[H\033[2J"; frame2; sleep 0.2
printf "\033[H\033[2J"; frame3; sleep 0.25
printf "\033[H\033[2J"; frame4; sleep 0.2
printf "\033[H\033[2J"; frame5; sleep 0.3
printf "\033[H\033[2J"; frame6; sleep 0.25
printf "\033[H\033[2J"; frame7; sleep 0.4
printf "\033[H\033[2J"; frame8; sleep 0.3
printf "\033[H\033[2J"; frame7; sleep 0.15
printf "\033[H\033[2J"; frame8; sleep 0.15
printf "\033[H\033[2J"; frame9; sleep 0.4
printf "\033[H\033[2J"; frame10; sleep 0.6

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
