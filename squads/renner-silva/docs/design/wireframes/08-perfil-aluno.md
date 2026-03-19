# Wireframe 08: Perfil do Aluno

**Screen:** Student Profile (`/profile`)
**Priority:** Epic 2, Story 2.3
**Layout:** Default Layout

---

## Mobile (< 640px)

```
+------------------------------------------+
| [Logo] Metodo Aplauda de Pe    [O 45%]   |
+------------------------------------------+
| < Dashboard                              |
+------------------------------------------+
|                                          |
| +--------------------------------------+ |
| |                                      | |
| |        [Avatar, 80px]                | |
| |        (circular, with border)       | |
| |                                      | |
| |        Maria Silva                   | |
| |        maria@email.com               | |
| |                                      | |
| |  [Trilha Intermediario] [Desde jan]  | |
| |                                      | |
| |  [Editar perfil]  (ghost button)     | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
|                                          |
| +----------+ +----------+               |
| | [BookOpen]| | [CheckSq]|               |
| | Modulos   | | Ckpts    |               |
| | 2/5       | | 12/23    |               |
| +----------+ +----------+               |
| +----------+ +----------+               |
| | [Clock]  | | [Flame]  |               |
| | Horas    | | Streak   |               |
| | ~8h      | | 7 dias   |               |
| +----------+ +----------+               |
|                                          |
+------------------------------------------+
|                                          |
| [Atividade] [Badges] [Notas] [Config]   |
| (tabs)                                   |
|                                          |
+------------------------------------------+
| TAB: Atividade Recente                   |
|                                          |
| Hoje                                     |
| +--------------------------------------+ |
| | [v] Checkpoint 2.3 concluido        | |
| |     Modulo 2 - Promocao    14:30    | |
| +--------------------------------------+ |
| | [v] Checkpoint 2.2 concluido        | |
| |     Modulo 2 - Promocao    11:15    | |
| +--------------------------------------+ |
|                                          |
| Ontem                                   |
| +--------------------------------------+ |
| | [Trophy] Badge "Dedicado" (7 dias)   | |
| |     Conquista desbloqueada  18:45    | |
| +--------------------------------------+ |
| | [v] Checkpoint 2.1 concluido        | |
| |     Modulo 2 - Promocao    16:20    | |
| +--------------------------------------+ |
|                                          |
| 11 fev 2026                             |
| +--------------------------------------+ |
| | [v] Checkpoint 1.4 concluido        | |
| |     Modulo 1 - Conexao     20:10    | |
| +--------------------------------------+ |
| | [star] Modulo 1 concluido!          | |
| |     Conexao Inicial        20:10    | |
| +--------------------------------------+ |
|                                          |
| (... older activities)                   |
|                                          |
| [Ver mais atividades]                    |
|                                          |
+------------------------------------------+
```

## Desktop (> 1024px)

```
+------------------------------------------------------------------------+
| [Logo] Metodo Aplauda de Pe  [Nav links]               [45%] [Avatar] |
+------------------------------------------------------------------------+
| Dashboard > Meu Perfil                                                  |
+------------------------------------------------------------------------+
|                                                                          |
|  +------------------------------------------------------------------+   |
|  |                                                                    |   |
|  |  [Avatar, 80px]  Maria Silva                    [Editar perfil]   |   |
|  |                   maria@email.com                                  |   |
|  |                   [Trilha Intermediario]  [Membro desde jan 2026] |   |
|  |                                                                    |   |
|  +------------------------------------------------------------------+   |
|                                                                          |
|  +---------------+ +---------------+ +---------------+ +---------------+ |
|  | [BookOpen]    | | [CheckSq]    | | [Clock]       | | [Flame]      | |
|  | Modulos       | | Checkpoints  | | Horas de      | | Streak       | |
|  | Concluidos    | | Atingidos    | | Estudo        | | Ativo        | |
|  | 2/5           | | 12/23        | | ~8h           | | 7 dias       | |
|  +---------------+ +---------------+ +---------------+ +---------------+ |
|                                                                          |
|  [Atividade] [Badges] [Notas] [Configuracoes]                          |
|  +------------------------------------------------------------------+   |
|  | TAB CONTENT                                                        |   |
|  |                                                                    |   |
|  | +---------------------------+ +-------------------------------+   |   |
|  | | Atividade Recente         | | Calendario de Atividade       |   |   |
|  | |                           | | (GitHub-style heatmap)       |   |   |
|  | | Hoje                      | |                               |   |   |
|  | | [v] Ckpt 2.3  14:30      | | [Jan][  ][Fev][  ][  ]       |   |   |
|  | | [v] Ckpt 2.2  11:15      | | Mo:  . ## .## ### ..         |   |   |
|  | |                           | | Tu:  . .# .## .## ..         |   |   |
|  | | Ontem                     | | We:  . ## ### .## ..         |   |   |
|  | | [Trophy] Badge 7 dias     | | Th:  . .# .## ### ..         |   |   |
|  | | [v] Ckpt 2.1  16:20      | | Fr:  . ## .## .## ..         |   |   |
|  | |                           | | Sa:  . .. ..  ..  ..         |   |   |
|  | | 11 fev                    | | Su:  . .. ..  ..  ..         |   |   |
|  | | [v] Ckpt 1.4  20:10      | |                               |   |   |
|  | | [star] Mod 1 concluido   | | Legenda: [ ] 0  [.] 1-2      |   |   |
|  | |                           | |          [#] 3-5 [#] 6+       |   |   |
|  | | [Ver mais]                | |                               |   |   |
|  | +---------------------------+ +-------------------------------+   |   |
|  +------------------------------------------------------------------+   |
|                                                                          |
|  +------------------------------------------------------------------+   |
|  | Acoes                                                              |   |
|  | [Trocar trilha]  [Exportar progresso (JSON)]  [Exportar notas]    |   |
|  +------------------------------------------------------------------+   |
|                                                                          |
+--------------------------------------------------------------------------+
```

## Edit Profile Modal

```
+--------------------------------------+
|                       [X]            |
| Editar Perfil                        |
|                                      |
| [Avatar preview]                     |
| [Trocar foto] (file upload)         |
|                                      |
| Nome                                 |
| [Maria Silva                    ]    |
|                                      |
| E-mail (nao editavel)               |
| maria@email.com                      |
|                                      |
| [Salvar]  [Cancelar]                |
+--------------------------------------+
```

## Behavior Notes

- **Avatar upload:** Click avatar or "Trocar foto" opens file picker. Image cropped to square, uploaded to Supabase Storage. Max 2MB, jpeg/png only. Preview before save.
- **Stats cards:** Real-time from Zustand store / Supabase. "Horas de estudo" is estimated based on module durations of completed content.
- **Activity feed:** Paginated (10 items default, "Ver mais" loads next 10). Grouped by date. Icons vary by activity type.
- **Activity calendar:** GitHub-style contribution heatmap. Green shades based on activity count. Only on desktop (hidden on mobile to save space).
- **Tabs:**
  - Atividade: Activity feed + calendar
  - Badges: Grid of earned badges with "Ver todas conquistas" link to badges page
  - Notas: List of personal notes across all entities, searchable, with entity link
  - Configuracoes: Trail change, data export, notification preferences, delete account
- **Trail change:** Opens confirmation dialog: "Trocar de Trilha Intermediario para ___? Seu progresso sera mantido."
- **Export progress:** Downloads JSON file with all progress data (checkpoints, timestamps, trail, streaks).
- **RLS:** Profile data protected by Row Level Security. Users can only see and edit their own profile.
- **Skeleton loading:** Profile card and stats show skeleton while data loads.
