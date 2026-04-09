#!/bin/bash
# Boot Sequence — LUIZ FOSC banner
# Sequential boot: BIOS → memory test → kernel → OPERATIONAL

AMBER='\033[38;5;214m'
WHITE='\033[1;37m'
GREEN='\033[0;32m'
DIM='\033[2m'
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
echo -e "${AMBER} ▶ System ready.${NC}  ${WHITE}AIOS Core ${GREEN}v2.1${NC}"
echo -e "\033[38;5;214m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Clear screen
printf "\033[?25l"
printf "\033[H\033[2J"

# BIOS header
echo -e "${AMBER}"
echo -e "  ╔════════════════════════════════════════════════════════════════╗"
echo -e "  ║           FOSC BIOS v4.2.1  —  AIOS Systems Inc.             ║"
echo -e "  ║              Copyright (c) 2024-2026 Luiz Fosc               ║"
echo -e "  ╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
sleep 0.4

# CPU/GPU detection
echo -e "${AMBER}  CPU: ${WHITE}FOSC-X9 Neural Engine @ 4.2 GHz  [16 cores detected]${NC}"
sleep 0.3
echo -e "${AMBER}  GPU: ${WHITE}CreativeForce RTX 9090  [24GB VRAM]${NC}"
sleep 0.3
echo -e "${AMBER}  SSD: ${WHITE}AIOS NVMe 2TB  /dev/nvme0n1${NC}"
sleep 0.25
echo ""

# Memory test
echo -e "${AMBER}  Memory test: ${NC}"
printf "${AMBER}  "
for i in $(seq 1 5 100); do
  printf "${WHITE}%d%%${AMBER}..." "$i"
  sleep 0.04
done
echo -e "  ${WHITE}128 GB OK${NC}"
sleep 0.2
echo ""

# Drive detection
echo -e "${AMBER}  Drive detection:${NC}"
sleep 0.2
echo -e "${AMBER}    /dev/sda1  ${WHITE}AIOS-ROOT     ${GREEN}[OK]${NC}"
sleep 0.15
echo -e "${AMBER}    /dev/sda2  ${WHITE}MINDS-VAULT   ${GREEN}[OK]${NC}"
sleep 0.15
echo -e "${AMBER}    /dev/sda3  ${WHITE}SQUADS-POOL   ${GREEN}[OK]${NC}"
sleep 0.15
echo -e "${AMBER}    /dev/sdb1  ${WHITE}SKILLS-STORE  ${GREEN}[OK]${NC}"
sleep 0.2
echo ""

# POST complete
echo -e "${AMBER}  POST: ${WHITE}All subsystems nominal${NC}"
sleep 0.2
echo -e "${AMBER}  ──────────────────────────────────────────────────────────────${NC}"
sleep 0.2
echo ""

# Loading bar
echo -e "${AMBER}  Loading FOSC-OS kernel...${NC}"
printf "${AMBER}  ["
for i in $(seq 1 40); do
  printf "${WHITE}█"
  sleep 0.03
done
echo -e "${AMBER}]  ${WHITE}Done${NC}"
sleep 0.2
echo ""

# Kernel modules
echo -e "${AMBER}  Loading kernel modules:${NC}"
sleep 0.15
echo -e "${AMBER}    [  ${GREEN}OK${AMBER}  ]  ${WHITE}creativity.service${NC}"
sleep 0.2
echo -e "${AMBER}    [  ${GREEN}OK${AMBER}  ]  ${WHITE}hustle.daemon${NC}"
sleep 0.2
echo -e "${AMBER}    [  ${GREEN}OK${AMBER}  ]  ${WHITE}magic.engine${NC}"
sleep 0.2
echo -e "${AMBER}    [  ${GREEN}OK${AMBER}  ]  ${WHITE}coffee.intake${NC}"
sleep 0.2
echo -e "${AMBER}    [  ${GREEN}OK${AMBER}  ]  ${WHITE}aios-core.orchestrator${NC}"
sleep 0.3
echo ""

# Final box
echo -e "${AMBER}  ╔════════════════════════════════════════════════════════════════╗"
echo -e "  ║                                                                ║"
echo -e "  ║          FOSC-OS v2.1  —  ALL SYSTEMS OPERATIONAL             ║"
echo -e "  ║                                                                ║"
echo -e "  ╚════════════════════════════════════════════════════════════════╝${NC}"
sleep 0.5

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
