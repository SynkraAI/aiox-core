#!/bin/bash
# Super Mario 16-bit Upgrade for AIOS Core
# Using Half-blocks for square pixels and 256-color palette

# Extended Colors (256-color mode)
M_RED='\033[38;5;196m'
M_BLUE='\033[38;5;27m'
M_SKIN='\033[38;5;223m'
M_BROWN='\033[38;5;94m'
M_YELLOW='\033[38;5;226m'
M_BLACK='\033[38;5;232m'
NC='\033[0m'

clear_screen() { printf "\033[H\033[2J"; }
hide_cursor() { printf "\033[?25l"; }
show_cursor() { printf "\033[?25h"; }

# Frame: Standing Mario (Higher Resolution)
mario_stand() {
    echo -e "           ${M_RED}▄▄▄▄▄▄${NC}"
    echo -e "          ${M_RED}█▀▀▀▀▀▀█${NC}"
    echo -e "         ${M_BROWN}▄▄▄${M_SKIN}▄▄${M_BLACK}▄${M_SKIN}▄${NC}"
    echo -e "        ${M_BROWN}█▀${M_SKIN}█${M_BROWN}█${M_SKIN}█${M_BLACK}█${M_SKIN}█${M_BLACK}█${M_SKIN}█${NC}"
    echo -e "        ${M_BROWN}█${M_SKIN}█${M_BROWN}█${M_SKIN}█${M_BROWN}▄${M_SKIN}█${M_SKIN}█${M_SKIN}█${NC}"
    echo -e "         ${M_BROWN}▀${M_SKIN}▄${M_SKIN}▀▀▀▀${M_SKIN}▄${NC}"
    echo -e "          ${M_RED}▄${M_BLUE}█${M_RED}▄▄${M_BLUE}█${M_RED}▄${NC}"
    echo -e "         ${M_BLUE}▄█${M_BLUE}█${M_BLUE}█${M_BLUE}█${M_BLUE}█${M_BLUE}█▄${NC}"
    echo -e "        ${M_BLUE}█▀${M_YELLOW}█${M_BLUE}█${M_BLUE}█${M_BLUE}█${M_YELLOW}█${M_BLUE}▀█${NC}"
    echo -e "        ${M_BROWN}▀▀  ▀▀${NC}"
}

mario_jump() {
    echo -e "           ${M_RED}▄▄▄▄▄▄${NC}"
    echo -e "          ${M_RED}█▀▀▀▀▀▀█${NC}"
    echo -e "         ${M_BROWN}▄▄▄${M_SKIN}▄▄${M_BLACK}▄${M_SKIN}▄${NC}"
    echo -e "        ${M_BROWN}█▀${M_SKIN}█${M_BROWN}█${M_SKIN}█${M_BLACK}█${M_SKIN}█${M_BLACK}█${M_SKIN}█${NC}"
    echo -e "        ${M_BROWN}█${M_SKIN}█${M_BROWN}█${M_SKIN}█${M_BROWN}▄${M_SKIN}█${M_SKIN}█${M_SKIN}█${NC}"
    echo -e "         ${M_BROWN}▀${M_SKIN}▄${M_SKIN}▀▀▀▀${M_SKIN}▄${NC}"
    echo -e "          ${M_RED}▄${M_BLUE}█${M_RED}▄▄${M_BLUE}█${M_RED}▄${NC}   ${M_YELLOW}❓${NC}"
    echo -e "         ${M_BLUE}▄█${M_BLUE}█${M_BLUE}█${M_BLUE}█${M_BLUE}█${M_BLUE}█▄${NC}"
    echo -e "       ${M_BLUE}▄▀${M_BLUE}█${M_YELLOW}█${M_BLUE}█${M_BLUE}█${M_BLUE}█${M_YELLOW}█${M_BLUE}█${M_BLUE}▀▄${NC}"
    echo -e "       ${M_BROWN}█▀      ▀█${NC}"
}

# Animation
hide_cursor
clear_screen
mario_stand; sleep 0.4
clear_screen
mario_jump; sleep 0.3
clear_screen
mario_stand; sleep 0.2

# Final Logo with Glitch Entry
clear_screen
echo -e "${M_RED}    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "${M_RED}    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "${M_RED}    █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "${M_RED}    ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "${M_RED}    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "${M_RED}    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo -e "\n      ${M_YELLOW}★ Super AIOS Core ★${NC} ${M_BLUE}v2.2${NC}"
echo ""
show_cursor
