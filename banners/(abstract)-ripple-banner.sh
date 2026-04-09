#!/bin/bash
# Ripple — LUIZ FOSC version
# 10-frame animation: water drop falls -> concentric ripple rings expand -> logo emerges

CYAN='\033[0;36m'
BLUE='\033[0;34m'
WHITE='\033[1;37m'
NC='\033[0m'

luizfosc_logo() {
echo ""
echo -e "\033[38;5;51m ██╗     ██╗   ██╗██╗███████╗    ███████╗ ██████╗ ███████╗ ██████╗${NC}"
echo -e "\033[38;5;45m ██║     ██║   ██║██║╚══███╔╝    ██╔════╝██╔═══██╗██╔════╝██╔════╝${NC}"
echo -e "\033[38;5;39m ██║     ██║   ██║██║  ███╔╝     █████╗  ██║   ██║███████╗██║     ${NC}"
echo -e "\033[38;5;33m ██║     ██║   ██║██║ ███╔╝      ██╔══╝  ██║   ██║╚════██║██║     ${NC}"
echo -e "\033[38;5;27m ███████╗╚██████╔╝██║███████╗    ██║     ╚██████╔╝███████║╚██████╗${NC}"
echo -e "\033[38;5;21m ╚══════╝ ╚═════╝ ╚═╝╚══════╝    ╚═╝      ╚═════╝ ╚══════╝ ╚═════╝${NC}"
echo ""
echo -e "\033[38;5;51m 💧 Every drop creates a ripple 💧${NC}  ${WHITE}${SYS_NAME:-AIOS Core} \033[38;5;45mv${SYS_VERSION:-2.1}${NC}"
echo -e "\033[38;5;39m ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
}

# Frame 1 - Drop high in the air
frame1() {
cat << 'EOF'




                            💧




                            ·
                           ···
                          ·····



EOF
}

# Frame 2 - Drop falling, closer
frame2() {
cat << 'EOF'




                            💧


                            ·
                           ···
                          ·····
                         ·······



EOF
}

# Frame 3 - Drop almost hitting surface
frame3() {
cat << 'EOF'




                            💧

                            ·
                           ···
                          ·····
                         ·······
                        ·········



EOF
}

# Frame 4 - Impact! First ripple
frame4() {
cat << 'EOF'



                           ~~~
                          ~   ~
                         ~     ~
                          ~   ~
                           ~~~
                            *
                           ~~~
                          ~   ~



EOF
}

# Frame 5 - Second ripple ring forms
frame5() {
cat << 'EOF'


                         ·~~~~~·
                        ~       ~
                       ~  ~~~~~  ~
                      ~  ~     ~  ~
                       ~  ~~~~~  ~
                        ~       ~
                         ·~~~~~·
                            ○
                          ·~~~·



EOF
}

# Frame 6 - Third ring, logo outline starts
frame6() {
cat << 'EOF'

                       ···~~~~~···
                      ~           ~
                     ~ ·~~~~~~~·   ~
                    ~  ~       ~    ~
                     ~ ·~~~~~~~·   ~
                      ~           ~
                       ···~~~~~···
                            ◯
                          ·~~~~~·
                         ~       ~
                          ·~~~~~·

EOF
}

# Frame 7 - Rings expanding outward
frame7() {
cat << 'EOF'

                    ·············
                   ·             ·
                  · ·~~·   ·~~·   ·
                 ·  ·  ·   ·  ·    ·
                  · ·~~·   ·~~·   ·
                   ·             ·
                    ·············
                         ◯
                       ·~~~~~·
                      ~       ~
                       ·~~~~~·

EOF
}

# Frame 8 - Ripples nearly full width, fading center
frame8() {
cat << 'EOF'

               ···················
              ·                   ·
             ·  ··             ··  ·
            ·  ·  ·           ·  ·  ·
             ·  ··             ··  ·
              ·                   ·
               ···················
                         ◯
                       ·~~~~~·
                      ~       ~
                       ·~~~~~·

EOF
}

# Frame 9 - Logo letters materialize from the rings
frame9() {
cat << 'EOF'

          ···~~~~~~~~~~~~~~~~~~~~~~~~···
         ·                              ·
        ·  L  U  I  Z     F  O  S  C    ·
       ·                                  ·
        ·  ·  ·  ·  ·     ·  ·  ·  ·    ·
         ·                              ·
          ···~~~~~~~~~~~~~~~~~~~~~~~~···
                         ◯
                       ·~~~~~·
                      ~       ~
                       ·~~~~~·

EOF
}

# Frame 10 - Full reveal, all ripples calm
frame10() {
cat << 'EOF'

       ·····~~~~~~~~~~~~~~~~~~~~~~~~~~~~~·····
      ·                                       ·
     ·   ██╗     ██╗   ██╗██╗███████╗          ·
    ·    ██║     ██║   ██║██║╚══███╔╝           ·
     ·   ██║     ██║   ██║██║  ███╔╝           ·
      ·  ╚══════╝ ╚═════╝ ╚═╝╚══════╝         ·
       ·····~~~~~~~~~~~~~~~~~~~~~~~~~~~~~·····
                       ◯
                     ·~~~~~·        💧

EOF
}

# Animation
printf "\033[?25l"

printf "\033[H\033[2J"; frame1; sleep 0.2
printf "\033[H\033[2J"; frame2; sleep 0.15
printf "\033[H\033[2J"; frame3; sleep 0.1
printf "\033[H\033[2J"; frame4; sleep 0.3
printf "\033[H\033[2J"; frame5; sleep 0.25
printf "\033[H\033[2J"; frame6; sleep 0.25
printf "\033[H\033[2J"; frame7; sleep 0.2
printf "\033[H\033[2J"; frame8; sleep 0.2
printf "\033[H\033[2J"; frame9; sleep 0.35
printf "\033[H\033[2J"; frame10; sleep 0.4

# Final
printf "\033[H\033[2J"
luizfosc_logo
printf "\033[?25h"
sleep 0.8
