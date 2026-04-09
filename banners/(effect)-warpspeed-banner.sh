#!/bin/bash
# Warp Speed — LUIZ FOSC banner
# 10-frame animation: stars accelerating to warp speed and back to calm

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
echo -e "\033[38;5;51m ★ Punch it! ★${NC}  ${WHITE}AIOS Core ${GREEN}v2.1${NC}"
echo -e "\033[38;5;51m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - still field of dots
frame1() {
echo -e "\033[38;5;240m"
cat << 'EOF'
   ·          ·       ·          ·       ·          ·
       ·              ·    ·                 ·
  ·          ·                    ·    ·         ·
          ·      ·       ·              ·
    ·                  ·       ·              ·      ·
          ·      ·                    ·   ·
   ·           ·       ·    ·              ·
       ·              ·          ·               ·
  ·        ·                ·         ·     ·
EOF
echo -e "${NC}"
}

# Frame 2 - stars start moving slightly
frame2() {
echo -e "\033[38;5;244m"
cat << 'EOF'
   •          •       •          •       •          •
       •              •    •                 •
  •          •                    •    •         •
          •      •       •              •
    •                  •       •              •      •
          •      •                    •   •
   •           •       •    •              •
       •              •          •               •
  •        •                •         •     •
EOF
echo -e "${NC}"
}

# Frame 3 - small streaks begin
frame3() {
echo -e "\033[38;5;248m"
cat << 'EOF'
  -·         -·      -·         -·      -·         -·
      -·             -·   -·                -·
 -·         -·                   -·   -·        -·
         -·     -·      -·             -·
   -·                 -·      -·             -·     -·
         -·     -·                   -·  -·
  -·          -·      -·   -·             -·
      -·             -·         -·              -·
 -·       -·               -·        -·    -·
EOF
echo -e "${NC}"
}

# Frame 4 - streaking faster
frame4() {
echo -e "\033[38;5;251m"
cat << 'EOF'
  ─•        ─•      ─•        ─•      ─•        ─•
      ─•            ─•   ─•               ─•
 ─•        ─•                  ─•   ─•       ─•
        ─•     ─•      ─•            ─•
   ─•                ─•      ─•            ─•     ─•
        ─•     ─•                  ─•  ─•
  ─•         ─•      ─•   ─•            ─•
      ─•            ─•        ─•             ─•
 ─•       ─•              ─•       ─•    ─•
EOF
echo -e "${NC}"
}

# Frame 5 - long streaks
frame5() {
echo -e "\033[38;5;253m"
cat << 'EOF'
  ──•       ──•     ──•       ──•     ──•       ──•
      ──•           ──•  ──•              ──•
 ──•       ──•                 ──•  ──•      ──•
       ──•    ──•      ──•           ──•
   ──•               ──•     ──•           ──•    ──•
       ──•    ──•                 ──•  ──•
  ──•        ──•     ──•  ──•           ──•
      ──•           ──•       ──•            ──•
 ──•      ──•             ──•      ──•   ──•
EOF
echo -e "${NC}"
}

# Frame 6 - full warp! very long streaks
frame6() {
echo -e "\033[1;37m"
cat << 'EOF'
  ──────•   ──────•  ──────•   ──────•  ──────•   ──────•
      ──────•        ──────•  ──────•          ──────•
 ──────•   ──────•              ──────•  ──────•   ──────•
       ──────•  ──────•  ──────•       ──────•
   ──────•            ──────•  ──────•       ──────•  ──────•
       ──────•  ──────•              ──────•  ──────•
  ──────•       ──────•  ──────•  ──────•       ──────•
      ──────•          ──────•     ──────•           ──────•
 ──────•   ──────•          ──────•    ──────•  ──────•
EOF
echo -e "${NC}"
}

# Frame 7 - white flash! WARP
frame7() {
echo -e "\033[1;37m"
cat << 'EOF'
 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
EOF
echo -e "${NC}"
}

# Frame 8 - calm starfield after warp
frame8() {
echo -e "\033[38;5;245m"
cat << 'EOF'
    ✦              ✦         ✦              ✦
          ✦                       ✦
   ✦           ✦        ✦              ✦
         ✦         ✦          ✦
    ✦                    ✦        ✦         ✦
          ✦    ✦                       ✦
   ✦           ✦        ✦         ✦
         ✦                   ✦              ✦
    ✦         ✦       ✦           ✦
EOF
echo -e "${NC}"
}

# Frame 9 - brighter stars settling
frame9() {
echo -e "\033[38;5;251m"
cat << 'EOF'
    ✦              ✦         ✦              ✦
          ✦                       ✦
   ✦           ✦        ✦              ✦
         ✦         ✦          ✦
    ✦                    ✦        ✦         ✦
          ✦    ✦                       ✦
   ✦           ✦        ✦         ✦
         ✦                   ✦              ✦
    ✦         ✦       ✦           ✦
EOF
echo -e "${NC}"
}

# Frame 10 - serene destination starfield
frame10() {
echo -e "\033[38;5;253m"
cat << 'EOF'
    ✦              ✦         ✦              ✦      ✦
          ✦    ✦                  ✦    ✦
   ✦           ✦        ✦              ✦        ✦
    ✦    ✦         ✦          ✦       ✦
         ✦                    ✦        ✦         ✦
    ✦         ✦    ✦                       ✦    ✦
   ✦           ✦        ✦         ✦    ✦
    ✦     ✦         ✦        ✦              ✦
         ✦    ✦      ✦            ✦
EOF
echo -e "\033[38;5;51m"
echo -e "    ★ Punch it! ★  —  Destination: AIOS Core v2.1${NC}"
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.3
printf "\033[H\033[2J"; frame2; sleep 0.2
printf "\033[H\033[2J"; frame3; sleep 0.15
printf "\033[H\033[2J"; frame4; sleep 0.15
printf "\033[H\033[2J"; frame5; sleep 0.12
printf "\033[H\033[2J"; frame6; sleep 0.12
printf "\033[H\033[2J"; frame7; sleep 0.1
printf "\033[H\033[2J"; frame8; sleep 0.2
printf "\033[H\033[2J"; frame9; sleep 0.25
printf "\033[H\033[2J"; frame10; sleep 0.5

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
