# Wireframe 05: Selecao de Trilha

**Screen:** Learning Path Selection (`/paths`)
**Priority:** Epic 1, Story 1.7
**Layout:** Default Layout

---

## Mobile (< 640px)

```
+------------------------------------------+
| [Logo] Metodo Aplauda de Pe    [O 0%]    |
+------------------------------------------+
| < Dashboard                              |
+------------------------------------------+
|                                          |
|  Escolha sua trilha                      |
|  de aprendizado                          |
|                                          |
|  Selecione o caminho que melhor se       |
|  adapta ao seu nivel e disponibilidade   |
|  de tempo.                               |
|                                          |
+------------------------------------------+
|                                          |
|  Descubra sua trilha ideal              |
|                                          |
|  1/3  Qual sua experiencia com           |
|       oratoria?                          |
|                                          |
|  ( ) Nunca apresentei para um publico    |
|  ( ) Ja apresentei algumas vezes         |
|  ( ) Apresento regularmente              |
|                                          |
|  [Proximo ->]                            |
|                                          |
+------------------------------------------+
|                                          |
|  Trilhas Disponiveis                     |
|                                          |
| +--------------------------------------+ |
| | [Sprout]                             | |
| | Trilha Iniciante             [15-20h]| |
| |                                      | |
| | Para quem esta comecando do zero.    | |
| | Cobre todos os fundamentos com       | |
| | exercicios guiados passo a passo.    | |
| |                                      | |
| | Nivel: Basico                        | |
| | Modulos: 1, 2, 3, 4, 5              | |
| | Entrega final: Apresentacao de 5min  | |
| |                                      | |
| | [  Selecionar trilha  ]             | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | [TrendingUp]                         | |
| | Trilha Intermediario         [25-30h]| |
| |                                      | |
| | Para quem ja tem alguma experiencia. | |
| | Foco em tecnicas avancadas e         | |
| | storytelling emocional.              | |
| |                                      | |
| | Nivel: Intermediario                 | |
| | Modulos: 1, 2, 3, 4, 5              | |
| | Entrega final: Palestra de 15min     | |
| |                                      | |
| | [  Selecionar trilha  ]             | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | [Crown]                              | |
| | Trilha Master                [50-60h]| |
| |                                      | |
| | Dominio completo do metodo. Todos os | |
| | exercicios, todas as tecnicas,       | |
| | projeto final completo.              | |
| |                                      | |
| | Nivel: Avancado                      | |
| | Modulos: 1, 2, 3, 4, 5              | |
| | Entrega final: TED-style de 18min   | |
| |                                      | |
| | [  Selecionar trilha  ]             | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | [Zap]                                | |
| | Trilha Express               [8-12h]| |
| |                                      | |
| | [!] Sacrifica profundidade por       | |
| | velocidade. Apenas conceitos         | |
| | essenciais e exercicios-chave.       | |
| |                                      | |
| | Nivel: Misto                         | |
| | Modulos: 1, 2, 3, 5 (pula 4)        | |
| | Entrega final: Pitch de 3min        | |
| |                                      | |
| | [  Selecionar trilha  ]             | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
```

## Desktop (> 1024px)

```
+------------------------------------------------------------------------+
| [Logo] Metodo Aplauda de Pe  [Nav links]               [0%] [Avatar]  |
+------------------------------------------------------------------------+
| Dashboard > Trilhas de Aprendizado                                      |
+------------------------------------------------------------------------+
|                                                                          |
|  Escolha sua trilha de aprendizado                                      |
|  Selecione o caminho que melhor se adapta ao seu nivel                  |
|  e disponibilidade de tempo.                                            |
|                                                                          |
+--------------------------------------------------------------------------+
|                                                                          |
|  Descubra sua trilha ideal                                              |
|  +------------------------------------------------------------------+   |
|  | 1. Qual sua experiencia?    | 2. Tempo disponivel? | 3. Obj?    |   |
|  | ( ) Nunca apresentei        | ( ) 2-3h/semana      | ( ) Basico |   |
|  | (*) Ja apresentei algumas   | (*) 5-8h/semana      | (*) Avanc. |   |
|  | ( ) Apresento regularmente  | ( ) 10h+/semana      | ( ) Domin. |   |
|  +------------------------------------------------------------------+   |
|  | Recomendacao: Trilha Intermediario (com base nas suas respostas) |   |
|  +------------------------------------------------------------------+   |
|                                                                          |
+--------------------------------------------------------------------------+
|                                                                          |
|  +---------------+ +---------------+ +---------------+ +---------------+ |
|  | [Sprout]      | | [TrendingUp]  | | [Crown]       | | [Zap]        | |
|  |               | | *RECOMENDADA* | |               | |              | |
|  | Iniciante     | | Intermediario | | Master        | | Express      | |
|  |               | |               | |               | |              | |
|  | Para quem     | | Para quem ja  | | Dominio       | | Velocidade   | |
|  | esta comecando| | tem alguma    | | completo do   | | [!] Sacrifica| |
|  | do zero.      | | experiencia.  | | metodo. Todos | | profundidade | |
|  |               | |               | | os exercicios | | por velocid. | |
|  | 15-20h        | | 25-30h        | | 50-60h        | | 8-12h        | |
|  | Basico        | | Intermediario | | Avancado      | | Misto        | |
|  | 5 modulos     | | 5 modulos     | | 5 modulos     | | 4 modulos    | |
|  |               | |               | |               | |              | |
|  | Entrega:      | | Entrega:      | | Entrega:      | | Entrega:     | |
|  | Apresentacao  | | Palestra      | | TED-style     | | Pitch        | |
|  | de 5min       | | de 15min      | | de 18min      | | de 3min      | |
|  |               | |               | |               | |              | |
|  | [Selecionar]  | | [Selecionar]  | | [Selecionar]  | | [Selecionar] | |
|  +---------------+ +---------------+ +---------------+ +---------------+ |
|                                                                          |
+--------------------------------------------------------------------------+
```

## Behavior Notes

- **Self-assessment quiz:** 3 simple questions (radio buttons). On completing all 3, recommendation appears highlighted with "Recomendada para voce" badge on the matching trail card.
- **Trail selection:** On click "Selecionar trilha" -> confirmation dialog: "Voce selecionou a Trilha Intermediario. Voce pode trocar de trilha a qualquer momento. Seu progresso sera mantido." -> [Confirmar] [Cancelar].
- **Active trail indicator:** If trail already selected, that card shows green border + "Trilha Ativa" badge. CTA changes to "Trilha Ativa (trocar)" link.
- **Express warning:** Yellow warning banner inside Express card: "Esta trilha sacrifica profundidade por velocidade. Recomendada apenas para quem precisa de resultados rapidos."
- **Module list in trail:** Shows which modules are included. Express skips module 4 (Historia de Essencia).
- **Post-selection redirect:** After confirming trail, redirect to Dashboard with toast "Trilha Intermediario ativada! Comece pelo Modulo 1."
- **Mobile:** Cards stack vertically. Quiz is full-width. Recommended trail has extra visual emphasis (ring + badge).
- **Desktop:** 4 cards in horizontal grid. Recommended card is visually elevated.
