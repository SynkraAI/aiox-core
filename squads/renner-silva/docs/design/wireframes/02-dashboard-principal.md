# Wireframe 02: Dashboard Principal

**Screen:** Main Dashboard (Home)
**Priority:** Epic 1, Story 1.5 / 1.8
**Layout:** Default Layout
**Status:** MVP exists, wireframe documents the enhanced target state

---

## Mobile (< 640px)

```
+------------------------------------------+
| [Logo] Metodo Aplauda de Pe    [O 0%]    |
| por Renner Silva               (circle)  |
+------------------------------------------+
| < Skip nav link (sr-only) >              |
+------------------------------------------+
|                                          |
| Sua Jornada                    [Target]  |
| Comece sua transformacao                 |
|                                          |
| [============================] 0%       |
| (gradient progress bar, lg)              |
|                                          |
| +--------------------------------------+ |
| | [BookOpen] Modulos Concluidos  0/5   | |
| +--------------------------------------+ |
| | [CheckSq] Checkpoints         0/23  | |
| +--------------------------------------+ |
| | [Clock]   Tempo Estimado      13-18h | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
|                                          |
| Modulos do Metodo                        |
| 5 passos para aplausos de pe            |
|                                          |
| +--------------------------------------+ |
| | [====gradient bar====]               | |
| | Modulo 1          [Sparkles Proximo] | |
| | Conexao Inicial            [Circle] | |
| | Faca as pessoas gostarem de voce...  | |
| | +----------------------------------+ | |
| | | 0/4 checkpoints | 2-3h          | | |
| | +----------------------------------+ | |
| | [==========================] 0%     | |
| | Nao iniciado                        | |
| | [     Comecar       ->    ]         | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | [====gradient bar====]               | |
| | Modulo 2                     [Lock] | |
| | Promocao do Conteudo                | |
| | Crie desejo profundo pelo...        | |
| | +----------------------------------+ | |
| | | 0/4 checkpoints | 2-3h          | | |
| | +----------------------------------+ | |
| | [==========================] 0%     | |
| | Complete o modulo 1 para desbloquear | |
| +--------------------------------------+ |
|                                          |
| (... modules 3, 4, 5 continue below)    |
|                                          |
+------------------------------------------+
|                                          |
| Proximos Passos                          |
|                                          |
| (1) Comece pelo Modulo 1: Conexao       |
|  |  Inicial - aprenda a fazer as        |
|  |  pessoas gostarem de voce            |
|  |                                      |
| (2) Complete os exercicios praticos     |
|  |  e atinja os checkpoints             |
|  |                                      |
| (3) Desbloqueie os proximos modulos     |
|     completando pelo menos 70%          |
|                                          |
+------------------------------------------+
| Trilha Ativa                             |
| +--------------------------------------+ |
| | Nenhuma trilha selecionada           | |
| | [Escolher trilha ->]                 | |
| +--------------------------------------+ |
+------------------------------------------+
|                                          |
| Footer: Metodo "Aplauda de Pe"  v1.0    |
|                                          |
+------------------------------------------+
```

## Desktop (> 1024px)

```
+------------------------------------------------------------------------+
| [Logo] Metodo Aplauda de Pe  [Dashboard][Modulos][Trilhas][Badges] [O] |
| por Renner Silva             [Cmd+K Buscar...]          [12%] [Avatar] |
+------------------------------------------------------------------------+
|                                                                          |
|  Sua Jornada                                               [Target]     |
|  Comece sua transformacao como palestrante                              |
|                                                                          |
|  [=================================================] 0%                |
|                                                                          |
|  +--------------------+ +--------------------+ +--------------------+   |
|  | [BookOpen]         | | [CheckSq]         | | [Clock]            |   |
|  | Modulos Concluidos | | Checkpoints        | | Tempo Estimado     |   |
|  | 0/5                | | 0/23               | | 13-18h             |   |
|  +--------------------+ +--------------------+ +--------------------+   |
|                                                                          |
+--------------------------------------------------------------------------+
|                                                                          |
|  Modulos do Metodo                    5 passos para aplausos de pe      |
|                                                                          |
|  +------------------+ +------------------+ +------------------+         |
|  | [gradient bar]   | | [gradient bar]   | | [gradient bar]   |         |
|  | Modulo 1         | | Modulo 2         | | Modulo 3         |         |
|  | Conexao Inicial  | | Promocao do      | | Entrega          |         |
|  |                  | | Conteudo         | | Estruturada      |         |
|  | [Sparkles] Next  | | [Lock]           | | [Lock]           |         |
|  | 0/4 ckpts | 2-3h | | 0/4 ckpts | 2-3h | | 0/5 ckpts | 3-4h |       |
|  | [===] 0%         | | [===] 0%         | | [===] 0%         |         |
|  | [  Comecar ->  ] | | Desbloqueie...   | | Desbloqueie...   |         |
|  +------------------+ +------------------+ +------------------+         |
|                                                                          |
|  +------------------+ +------------------+                              |
|  | [gradient bar]   | | [gradient bar]   |                              |
|  | Modulo 4         | | Modulo 5         |                              |
|  | Historia de      | | Finalizacao      |                              |
|  | Essencia         | | Emocional        |                              |
|  | [Lock]           | | [Lock]           |                              |
|  | 0/5 ckpts | 4-5h | | 0/5 ckpts | 2-3h |                             |
|  | [===] 0%         | | [===] 0%         |                              |
|  | Desbloqueie...   | | Desbloqueie...   |                              |
|  +------------------+ +------------------+                              |
|                                                                          |
+--------------------------------------------------------------------------+
|                                                                          |
|  +-----------------------------+ +----------------------------+          |
|  | Proximos Passos            | | Trilha Ativa               |          |
|  |                            | |                            |          |
|  | (1) Comece pelo Modulo 1   | | Nenhuma trilha selecionada |          |
|  |  |                         | |                            |          |
|  | (2) Complete exercicios    | | [Escolher trilha ->]       |          |
|  |  |                         | |                            |          |
|  | (3) Desbloqueie proximos   | |                            |          |
|  +-----------------------------+ +----------------------------+          |
|                                                                          |
+--------------------------------------------------------------------------+
| Footer: Metodo "Aplauda de Pe" por Renner Silva                  v1.0  |
+--------------------------------------------------------------------------+
```

## Behavior Notes

- **Module cards:** Click navigates to `/modules/[id]` if unlocked. Locked cards show disabled state with explanation.
- **Next module glow:** The first unlocked non-completed module gets a `ring-2 ring-primary/30 shadow-glow` treatment with animated "Proximo" badge.
- **Progress updates:** Stats and progress bars update in real-time as checkpoints are completed (Zustand store subscription).
- **Trail section:** Shows "Nenhuma trilha selecionada" if no trail chosen. Links to `/paths`. If trail active, shows trail name + progress within trail.
- **Stagger animation:** Module cards animate in with 75ms stagger delay.
- **Empty state (first visit):** Welcome message replaces "X de 5 modulos concluidos" with "Comece sua transformacao como palestrante".
- **Returning user:** Shows actual progress, streak counter in header if active.
- **Desktop navigation:** Full horizontal nav with active state indicator (underline).
- **Mobile navigation:** Hamburger menu (slide-in from right) or bottom navigation bar.
