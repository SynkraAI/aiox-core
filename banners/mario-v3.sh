#!/bin/bash
# Mario Revised - "The Great Revision" for AIOS Core
# Corrected Aspect Ratio and High-Density ASCII

# Colors
RED='\033[38;5;196m'
BLUE='\033[38;5;27m'
SKIN='\033[38;5;223m'
BROWN='\033[38;5;94m'
YELLOW='\033[38;5;226m'
WHITE='\033[38;5;255m'
NC='\033[0m'

clear_screen() { printf "\033[H\033[2J"; }
hide_cursor() { printf "\033[?25l"; }

mario_frame() {
    local offset=$1
    echo -e "${offset}      ${RED}██████████${NC}"
    echo -e "${offset}    ${RED}████████████████${NC}"
    echo -e "${offset}    ${BROWN}██████${SKIN}████${NC}${BROWN}██${NC}${SKIN}██${NC}"
    echo -e "${offset}    ${BROWN}██${SKIN}██${BROWN}██${SKIN}██████${NC}${BROWN}██${NC}${SKIN}████${NC}"
    echo -e "${offset}    ${BROWN}██${SKIN}██${BROWN}████${SKIN}██████████${NC}"
    echo -e "${offset}      ${BROWN}████${SKIN}██████████${NC}"
    echo -e "${offset}        ${SKIN}██████████${NC}"
    echo -e "${offset}    ${RED}████${BLUE}██${RED}██████${NC}"
    echo -e "${offset}  ${RED}██████${BLUE}██${RED}██████${BLUE}██${RED}████${NC}"
    echo -e "${offset}  ${RED}████████${BLUE}████████${RED}████${NC}"
    echo -e "${offset}  ${SKIN}████${RED}██${BLUE}██${YELLOW}██${BLUE}██${YELLOW}██${BLUE}██${RED}██${SKIN}████${NC}"
    echo -e "${offset}    ${SKIN}████${BLUE}██████████${SKIN}████${NC}"
    echo -e "${offset}      ${BLUE}██████  ██████${NC}"
    echo -e "${offset}    ${BROWN}██████      ██████${NC}"
    echo -e "${offset}  ${BROWN}████████      ████████${NC}"
}

jump_frame() {
    echo -e "              ${YELLOW}┏━━━━━┓${NC}"
    echo -e "              ${YELLOW}┃  ?  ┃${NC}"
    echo -e "              ${YELLOW}┗━━━━━┛${NC}"
    echo -e ""
    mario_frame "      "
}

hide_cursor
clear_screen
# Animation Sequence
mario_frame ""; sleep 0.4
clear_screen
jump_frame; sleep 0.3
clear_screen
mario_frame ""; sleep 0.2

# Final Branding
echo -e "\n${RED}    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "${RED}    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "${RED}    █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "${RED}    ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "${RED}    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "${RED}    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo -e "\n       ${YELLOW}★  REVISED & POWERED UP  ★${NC}"
echo -e "           ${WHITE}AIOS Core v2.2.1${NC}\n"

printf "\033[?25h"
