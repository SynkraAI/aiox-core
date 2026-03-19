# Wireframe 07: Pagina de Checkpoints

**Screen:** All Checkpoints (`/checkpoints`)
**Priority:** Epic 1, Story 1.6
**Layout:** Default Layout

---

## Mobile (< 640px)

```
+------------------------------------------+
| [Logo] Metodo Aplauda de Pe    [O 15%]   |
+------------------------------------------+
| < Dashboard                              |
+------------------------------------------+
|                                          |
| Seus Checkpoints                         |
| 4 de 23 concluidos                       |
|                                          |
| [===============>                ] 17%   |
| (overall progress bar)                   |
|                                          |
| Filtro: [Todos] [Concluidos] [Pendentes] |
|                                          |
+------------------------------------------+
|                                          |
| MODULO 1: Conexao Inicial      3/4 [v]  |
| [mod-1 color bar]                        |
|                                          |
| +--------------------------------------+ |
| | [x] 1.1 Consegue criar rapport em   | |
| |     30 segundos com desconhecidos    | |
| |     Concluido em 12 fev 2026        | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | [x] 1.2 Domina pelo menos 3 tecnicas| |
| |     de abertura diferentes           | |
| |     Concluido em 12 fev 2026        | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | [x] 1.3 Consegue ler reacoes do     | |
| |     publico e adaptar em tempo real  | |
| |     Concluido em 13 fev 2026        | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | [ ] 1.4 Praticou exercicio do        | |
| |     Espelho pelo menos 3 vezes      | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
|                                          |
| MODULO 2: Promocao do Conteudo 1/4 [ ]  |
| [mod-2 color bar]                        |
|                                          |
| +--------------------------------------+ |
| | [x] 2.1 Consegue criar 3 hooks de   | |
| |     curiosidade distintos            | |
| |     Concluido em 13 fev 2026        | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | [ ] 2.2 Domina a tecnica de "vender" | |
| |     o conteudo antes de ensinar      | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | [ ] 2.3 Criou roteiro de promocao    | |
| |     para apresentacao real           | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | [ ] 2.4 Testou abertura com pelo     | |
| |     menos 2 pessoas reais           | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
|                                          |
| MODULO 3: Entrega Estruturada  0/5 [L]  |
| [mod-3 color bar]                        |
|                                          |
| +--------------------------------------+ |
| | [L] 3.1 Estrutura conteudo em 3     | |
| |     passos claros e memoraveis      | |
| |     Desbloqueie completando mod. 2  | |
| +--------------------------------------+ |
| | [L] 3.2 Usa transicoes fluidas      | |
| |     Desbloqueie completando mod. 2  | |
| +--------------------------------------+ |
| | [L] 3.3 ...                          | |
| | [L] 3.4 ...                          | |
| | [L] 3.5 ...                          | |
| +--------------------------------------+ |
|                                          |
| (... Modules 4, 5 continue below)       |
|                                          |
+------------------------------------------+
```

## Desktop (> 1024px)

```
+------------------------------------------------------------------------+
| [Logo] Metodo Aplauda de Pe  [Nav links]               [15%] [Avatar] |
+------------------------------------------------------------------------+
| Dashboard > Checkpoints                                                 |
+------------------------------------------------------------------------+
|                                                                          |
|  Seus Checkpoints                                                       |
|  4 de 23 concluidos                                                     |
|                                                                          |
|  [================================>                          ] 17%      |
|                                                                          |
|  Filtro: [Todos] [Concluidos] [Pendentes] [Bloqueados]                  |
|                                                                          |
+--------------------------------------------------------------------------+
|                                                                          |
|  +------------------------------------------------------------------+   |
|  | MODULO 1: Conexao Inicial                           3/4 [=====] |   |
|  | [mod-1 color bar ==========================================]     |   |
|  |                                                                   |   |
|  | [x] 1.1 Consegue criar rapport em 30 segundos     12 fev 2026   |   |
|  | [x] 1.2 Domina pelo menos 3 tecnicas de abertura  12 fev 2026   |   |
|  | [x] 1.3 Consegue ler reacoes e adaptar            13 fev 2026   |   |
|  | [ ] 1.4 Praticou exercicio do Espelho 3 vezes                    |   |
|  +------------------------------------------------------------------+   |
|                                                                          |
|  +------------------------------------------------------------------+   |
|  | MODULO 2: Promocao do Conteudo                      1/4 [==   ] |   |
|  | [mod-2 color bar ==========================================]     |   |
|  |                                                                   |   |
|  | [x] 2.1 Consegue criar 3 hooks de curiosidade     13 fev 2026   |   |
|  | [ ] 2.2 Domina tecnica de "vender" o conteudo                    |   |
|  | [ ] 2.3 Criou roteiro de promocao                                |   |
|  | [ ] 2.4 Testou abertura com 2 pessoas reais                      |   |
|  +------------------------------------------------------------------+   |
|                                                                          |
|  +------------------------------------------------------------------+   |
|  | MODULO 3: Entrega Estruturada                       0/5 [LOCKED]|   |
|  | [mod-3 color bar (muted) ====================================]   |   |
|  |                                                                   |   |
|  | [L] 3.1 Estrutura conteudo em 3 passos    Desbloqueie mod. 2    |   |
|  | [L] 3.2 Usa transicoes fluidas            Desbloqueie mod. 2    |   |
|  | [L] 3.3 Aplica regra da simplicidade      Desbloqueie mod. 2    |   |
|  | [L] 3.4 Criou material de apoio visual    Desbloqueie mod. 2    |   |
|  | [L] 3.5 Apresentou conteudo estruturado   Desbloqueie mod. 2    |   |
|  +------------------------------------------------------------------+   |
|                                                                          |
|  (... Modules 4, 5)                                                     |
|                                                                          |
+--------------------------------------------------------------------------+
```

## Behavior Notes

- **Checkbox interaction:** Click toggles completion. Toast feedback on complete: "Checkpoint concluido! [X]/23 total." Timestamp recorded.
- **Locked checkpoints:** Disabled checkbox with lock icon [L]. Shows reason: "Desbloqueie completando modulo X". Muted text.
- **Filter tabs:** "Todos" (default), "Concluidos" (only checked), "Pendentes" (unchecked but unlocked), "Bloqueados" (locked). Active filter highlighted.
- **Module sections:** Collapsible on mobile (tap header to expand/collapse). Always expanded on desktop.
- **Progress per module:** Mini progress bar in module header showing X/Y checkpoints.
- **Module color bar:** Full-width colored bar at top of each module section using `--module-N` color. Muted for locked modules.
- **Completion date:** Shown inline on desktop, below checkpoint text on mobile. Format: "DD mmm YYYY".
- **Unlock animation:** When enough checkpoints are completed (70%), next module's checkpoints animate from locked to unlocked state with fade-in.
- **Real-time updates:** Progress bar at top and stat counts update immediately on checkbox toggle.
- **Link to module:** Module title in section header is clickable, navigates to module detail page.
