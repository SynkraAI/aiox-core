#!/bin/bash
# Windows 95 Boot — LUIZ FOSC version
# 10-frame animation: cloud logo ░▒▓ → "Starting FOSC-OS 95..." → progress bar → "It is now safe to code"

BLUE='\033[0;34m'
CYAN='\033[1;36m'
WHITE='\033[1;37m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;39m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;45m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;51m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;87m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;123m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;159m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;51m 💾 Where do you want to code today? 💾${NC}  ${WHITE}${SYS_NAME:-AIOS Core} \033[38;5;39mv${SYS_VERSION:-2.1}${NC}"
echo -e "\033[38;5;39m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Black screen, BIOS style
frame1() {
echo ""
echo -e "  \033[1;37mFOSC-OS BIOS v2.1.0${NC}"
echo -e "  \033[0;37mCopyright (C) 2024 AIOS Core Systems${NC}"
echo ""
echo -e "  \033[0;37mCPU: CLAUDE SONNET @ 4.6GHz${NC}"
echo -e "  \033[0;37mMemory Test: 640K OK${NC}"
echo ""
echo -e "  \033[1;37mPress DEL to enter SETUP${NC}"
echo ""
echo -e "  \033[0;37mDetecting IDE drives...${NC}"
echo -e "  \033[0;37mPrimary Master:   AIOS-CORE-DISK${NC}"
echo -e "  \033[0;37mPrimary Slave:    MINDS-VAULT-HDD${NC}"
echo ""
}

# Frame 2 - Windows 95 cloud logo forming (░)
frame2() {
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[38;5;250m          ░░░   ░░░░░   ░░░   ░░░░░░░░░░   ░░░░░░░               \033[0m"
echo -e "\033[44m\033[38;5;250m         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░              \033[0m"
echo -e "\033[44m\033[38;5;250m          ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                \033[0m"
echo -e "\033[44m\033[38;5;250m           ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                 \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
}

# Frame 3 - Cloud logo thickening (▒)
frame3() {
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[38;5;250m          ▒▒▒   ▒▒▒▒▒   ▒▒▒   ▒▒▒▒▒▒▒▒▒▒   ▒▒▒▒▒▒▒               \033[0m"
echo -e "\033[44m\033[38;5;252m         ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒              \033[0m"
echo -e "\033[44m\033[38;5;254m          ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒                \033[0m"
echo -e "\033[44m\033[38;5;252m           ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒                 \033[0m"
echo -e "\033[44m\033[38;5;250m            ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒                  \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
}

# Frame 4 - Cloud logo solid (▓) + Windows 95 text forming
frame4() {
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[38;5;254m          ▓▓▓   ▓▓▓▓▓   ▓▓▓   ▓▓▓▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓               \033[0m"
echo -e "\033[44m\033[1;37m         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓              \033[0m"
echo -e "\033[44m\033[1;37m          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                \033[0m"
echo -e "\033[44m\033[1;37m           ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                 \033[0m"
echo -e "\033[44m\033[1;37m            ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                  \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m              F O S C - O S   9 5                                  \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
}

# Frame 5 - Starting FOSC-OS 95...
frame5() {
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m         Starting FOSC-OS 95...                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
}

# Frame 6 - Progress bar 25%
frame6() {
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m         Starting FOSC-OS 95...                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;36m         ┌────────────────────────────────────┐                   \033[0m"
echo -e "\033[44m\033[1;37m         │ \033[42m          \033[44m                          \033[1;37m│                   \033[0m"
echo -e "\033[44m\033[1;36m         └────────────────────────────────────┘                   \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
}

# Frame 7 - Progress bar 60%
frame7() {
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m         Starting FOSC-OS 95...                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;36m         ┌────────────────────────────────────┐                   \033[0m"
echo -e "\033[44m\033[1;37m         │ \033[42m                     \033[44m               \033[1;37m│                   \033[0m"
echo -e "\033[44m\033[1;36m         └────────────────────────────────────┘                   \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
}

# Frame 8 - Progress bar 100%
frame8() {
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m         Starting FOSC-OS 95...                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;36m         ┌────────────────────────────────────┐                   \033[0m"
echo -e "\033[44m\033[1;37m         │ \033[42m                                    \033[44m\033[1;37m│                   \033[0m"
echo -e "\033[44m\033[1;36m         └────────────────────────────────────┘                   \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
}

# Frame 9 - Desktop loading, taskbar appearing
frame9() {
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m   💾 My Computer    📁 AIOS Core    🗑️  Recycle Bin               \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[47m\033[0;34m ▶ Start  │ 💾 AIOS Core                              12:00 PM     \033[0m"
}

# Frame 10 - "It is now safe to code"
frame10() {
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m   💾 My Computer    📁 AIOS Core    🗑️  Recycle Bin               \033[0m"
echo -e "\033[44m\033[1;37m                                                                    \033[0m"
echo -e "\033[44m\033[1;37m         ┌─────────────────────────────────────┐                  \033[0m"
echo -e "\033[44m\033[0;34m         │ \033[1;37mFOSC-OS 95\033[0;34m                         ×  │                  \033[0m"
echo -e "\033[44m\033[0;34m         ├─────────────────────────────────────┤                  \033[0m"
echo -e "\033[44m\033[1;37m         │                                     │                  \033[0m"
echo -e "\033[44m\033[1;37m         │   It is now safe to code. 💾        │                  \033[0m"
echo -e "\033[44m\033[1;37m         │                                     │                  \033[0m"
echo -e "\033[44m\033[0;34m         └─────────────────────────────────────┘                  \033[0m"
echo -e "\033[47m\033[0;34m ▶ Start  │ 💾 AIOS Core                              12:00 PM     \033[0m"
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.5
printf "\033[H\033[2J"; frame2; sleep 0.2
printf "\033[H\033[2J"; frame3; sleep 0.2
printf "\033[H\033[2J"; frame4; sleep 0.4
printf "\033[H\033[2J"; frame5; sleep 0.3
printf "\033[H\033[2J"; frame6; sleep 0.25
printf "\033[H\033[2J"; frame7; sleep 0.25
printf "\033[H\033[2J"; frame8; sleep 0.3
printf "\033[H\033[2J"; frame9; sleep 0.4
printf "\033[H\033[2J"; frame10; sleep 0.5

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
