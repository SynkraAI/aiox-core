#!/bin/bash
# Goku Super Saiyan - Retina Upgrade
# Using Braille characters for high-res detail and pulse aura

# 256 Colors
G_YELLOW='\033[38;5;226m'
G_GOLD='\033[38;5;214m'
G_ORANGE='\033[38;5;208m'
G_CYAN='\033[38;5;51m'
NC='\033[0m'

clear_screen() { printf "\033[H\033[2J"; }
hide_cursor() { printf "\033[?25l"; }

goku_aura() {
    local color=$1
    echo -e "       ${color}      .      ${NC}"
    echo -e "       ${color}     / \     ${NC}"
    echo -e "       ${color}   ⠠⠤⠶⠶⠤⠄   ${NC}"
    echo -e "       ${color}  ⢀⣴⣿⣿⣦⡀  ${NC}"
    echo -e "       ${color}  ⣾⣿⣿⣿⣿⣷  ${NC}"
    echo -e "       ${color}  ⠻⣿⣿⣿⣿⠟  ${NC}"
    echo -e "       ${color}   ⠙⠻⠟⠋   ${NC}"
}

goku_ssj() {
    local aura_color=$1
    echo -e "${aura_color}          ⢀⣤⣴⣶⣾⣿⣿⣿⣶⣶⣤⡀${NC}"
    echo -e "${G_YELLOW}         ⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄${NC}"
    echo -e "${G_YELLOW}        ⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦${NC}"
    echo -e "${G_YELLOW}       ⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧${NC}"
    echo -e "        ${NC}     ${G_CYAN}⠻⠿${NC}    ${G_CYAN}⠿⠟${NC}  "
    echo -e "        ${NC}      ${G_CYAN}⠙${NC}    ${G_CYAN}⠋${NC}  "
    echo -e "              ${G_ORANGE}⠤${NC}  "
}

hide_cursor
# Aura pulse animation
for i in {1..3}; do
    clear_screen; goku_ssj "${G_YELLOW}"; sleep 0.15
    clear_screen; goku_ssj "${G_GOLD}"; sleep 0.15
    clear_screen; goku_ssj "${G_ORANGE}"; sleep 0.15
done

clear_screen
echo -e "${G_GOLD}    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "${G_YELLOW}    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "${G_GOLD}    █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "${G_YELLOW}    ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "${G_GOLD}    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "${G_YELLOW}    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo -e "\n       ${G_ORANGE}⚡ IT'S OVER 9000! ⚡${NC}"
echo -e "          ${G_CYAN}AIOS Core v2.2${NC}\n"

printf "\033[?25h"
