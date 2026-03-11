#!/bin/bash
# Matrix Dynamic Glitch Upgrade
# Real character rain logic and flickering logo FX

GREEN='\033[38;5;82m'
BRIGHT_GREEN='\033[38;5;155m'
WHITE='\033[38;5;255m'
NC='\033[0m'

chars="ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789"

clear_screen() { printf "\033[H\033[2J"; }
hide_cursor() { printf "\033[?25l"; }

# Function to draw a column of rain
draw_rain() {
    clear_screen
    for i in {1..10}; do
        line=""
        for j in {1..40}; do
            if [ $((RANDOM % 5)) -eq 0 ]; then
                line+="${GREEN}${chars:$((RANDOM % ${#chars})):1}  ${NC}"
            else
                line+="   "
            fi
        done
        echo -e "  $line"
    done
}

# Glitch Effect for Logo
glitch_logo() {
    local color=$1
    clear_screen
    echo -e "${color}    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
    echo -e "${color}    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
    echo -e "${color}    █████╗  ██║   ██║███████╗██║     ${NC}"
    echo -e "${color}    ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
    echo -e "${color}    ██║     ╚██████╔╝███████║╚██████╗${NC}"
    echo -e "${color}    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
}

hide_cursor
# 1. Rain Phase
for i in {1..8}; do
    draw_rain; sleep 0.1
done

# 2. Glitch Assembly Phase
glitch_logo "${WHITE}"; sleep 0.05
glitch_logo "${GREEN}"; sleep 0.1
glitch_logo "${WHITE}"; sleep 0.05
glitch_logo "${BRIGHT_GREEN}"

echo -e "\n    ${BRIGHT_GREEN}⌐ Wake up, coder... the AIOS is here ¬${NC}"
echo -e "    ${WHITE}System Version: 2.2.0-STABLE${NC}"

printf "\033[?25h"
