#!/bin/bash
# Neural Network — LUIZ FOSC version
# 10-frame animation: nodes connect one by one, sparks travel along connections, form logo

PURPLE='\033[0;35m'
BPURPLE='\033[1;35m'
CYAN='\033[0;36m'
BCYAN='\033[1;36m'
WHITE='\033[1;37m'
DIM='\033[2m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;129m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;135m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;51m  ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;45m  ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;141m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;147m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;129m 🧠 Neural network initialized 🧠${NC}  ${WHITE}${SYS_NAME:-AIOS Core} ${PURPLE}v${SYS_VERSION:-2.1}${NC}"
echo -e "\033[38;5;147m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Scattered dormant nodes (○)
frame1() {
echo -e "${DIM}${PURPLE}"
cat << 'EOF'

  NEURAL NETWORK BOOT — LAYER 0 INITIALIZING...

    ○           ○           ○           ○
          ○           ○           ○
    ○           ○           ○           ○
          ○           ○           ○
    ○           ○           ○           ○
          ○           ○           ○
    ○           ○           ○           ○

EOF
echo -e "${NC}"
}

# Frame 2 - First layer activates, connections start
frame2() {
echo -e "${PURPLE}"
cat << 'EOF'

  LAYER 1 — INPUT NODES ACTIVATING...

    ●───────────○           ○           ○
    │     ○           ○           ○
    ●───────────○           ○           ○
    │     ○           ○           ○
    ●───────────○           ○           ○
          ○           ○           ○
    ○           ○           ○           ○

EOF
echo -e "${NC}"
}

# Frame 3 - Sparks travel first connections (·)
frame3() {
echo -e "${BCYAN}"
cat << 'EOF'

  LAYER 1→2 — SIGNAL PROPAGATING...

    ●────·──────●           ○           ○
    │╲    ○     │     ○           ○
    ●─·──────── ●           ○           ○
    │  ╲  ○     │     ○           ○
    ●────·──────●           ○           ○
          ○           ○           ○
    ○           ○           ○           ○

EOF
echo -e "${NC}"
}

# Frame 4 - Second layer fires, sparks reach third
frame4() {
echo -e "${PURPLE}"
cat << 'EOF'

  LAYER 2→3 — DEEP PROPAGATION...

    ●───────────●────·──────○           ○
    │╲    ○     │╲    ○     │     ○
    ●───────────●─·─────────○           ○
    │  ╲  ○     │  ╲  ○     │     ○
    ●───────────●────·──────○           ○
          ○           ○           ○
    ○           ○           ○           ○

EOF
echo -e "${NC}"
}

# Frame 5 - Third layer activates, fourth layer sparks
frame5() {
echo -e "${BCYAN}"
cat << 'EOF'

  LAYER 3→4 — PATTERN RECOGNITION...

    ●───────────●───────────●────·──────○
    │╲    ○     │╲    ○     │╲    ○
    ●───────────●───────────●─·──────── ○
    │  ╲  ○     │  ╲  ○     │  ╲  ○
    ●───────────●───────────●────·──────○
          ○           ○           ○
    ○           ○           ○           ○

EOF
echo -e "${NC}"
}

# Frame 6 - Full network lit up, output layer waking
frame6() {
echo -e "${BPURPLE}"
cat << 'EOF'

  LAYER 4→OUTPUT — DECODING PATTERN...

    ●───────────●───────────●───────────●
    │╲    ○     │╲    ○     │╲    ○      ╲
    ●───────────●───────────●───────────●
    │  ╲  ○     │  ╲  ○     │  ╲  ○      ╲
    ●───────────●───────────●───────────●
          ○           ○           ○
    ○           ○           ○           ○

EOF
echo -e "${NC}"
}

# Frame 7 - Output layer fires, logo pixels appear
frame7() {
echo -e "${BCYAN}"
cat << 'EOF'

  OUTPUT DECODED — RENDERING IDENTITY...

    ●───────────●───────────●───────────● → ░░
    │╲          │╲          │╲           ╲  ░░
    ●───────────●───────────●───────────● → ░░
    │  ╲        │  ╲        │  ╲         ╲  ░░
    ●───────────●───────────●───────────● → ░░
                                           ░░
                                           ░░

EOF
echo -e "${NC}"
}

# Frame 8 - Logo partially rendered from network output
frame8() {
echo -e "${PURPLE}"
cat << 'EOF'

  OUTPUT DECODED — RENDERING IDENTITY...

    ●─────────●─────────●─────────● ══╗ ██╗ ███╗
                                   ██║ ██║ ██╔╝
    ●─────────●─────────●─────────● ██║ ██║ ███╗
                                   ██║ ██║ ██╔╝
    ●─────────●─────────●─────────● ╚═╝ ╚═╝ ╚══╝


EOF
echo -e "${NC}"
}

# Frame 9 - Network dims, logo glows bright
frame9() {
echo -e "${BPURPLE}"
cat << 'EOF'

  🧠 IDENTITY CONFIRMED — WEIGHTS LOADED

EOF
echo -e "\033[38;5;129m  ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;135m  ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;51m  ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;45m  ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;141m  ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;147m  ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "${DIM}${PURPLE}  ○ · · · · · · · · · · · · · · · · · · · · · · · · · · · · · · ○${NC}"
}

# Frame 10 - Logo with pulsing connections in background
frame10() {
echo -e "${BCYAN}  ·  ●  ·  ─  ·  ●  ·  ─  ·  ●  ·  ─  ·  ●  ·  ─  ·  ●  ·  ─  ·${NC}"
echo -e "\033[38;5;129m  ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;135m  ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;51m  ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;45m  ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;141m  ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;147m  ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo -e "${BCYAN}  ·  ●  ·  ─  ·  ●  ·  ─  ·  ●  ·  ─  ·  ●  ·  ─  ·  ●  ·  ─  ·${NC}"
echo ""
echo -e "\033[38;5;129m  🧠 NEURAL NETWORK ONLINE · 847 LAYERS · 0 ERRORS 🧠${NC}"
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.35
printf "\033[H\033[2J"; frame2; sleep 0.25
printf "\033[H\033[2J"; frame3; sleep 0.2
printf "\033[H\033[2J"; frame4; sleep 0.2
printf "\033[H\033[2J"; frame5; sleep 0.2
printf "\033[H\033[2J"; frame6; sleep 0.25
printf "\033[H\033[2J"; frame7; sleep 0.25
printf "\033[H\033[2J"; frame8; sleep 0.3
printf "\033[H\033[2J"; frame9; sleep 0.35
printf "\033[H\033[2J"; frame10; sleep 0.4

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
