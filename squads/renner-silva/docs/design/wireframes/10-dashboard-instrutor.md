# Wireframe 10: Dashboard do Instrutor

**Screen:** Instructor Dashboard (`/instructor`)
**Priority:** Epic 2, Story 2.4
**Layout:** Default Layout (protected by instructor role)

---

## Mobile (< 640px)

```
+------------------------------------------+
| [Logo] Metodo Aplauda de Pe    [Avatar]  |
| Painel do Instrutor                      |
+------------------------------------------+
|                                          |
| Visao Geral                              |
| Atualizado agora                         |
|                                          |
| +--------------------------------------+ |
| | [Users]     Total de Alunos          | |
| |             147                       | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | [UserCheck] Alunos Ativos (7d)       | |
| |             89                        | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | [Percent]   Taxa de Conclusao        | |
| |             23%                       | |
| +--------------------------------------+ |
| +--------------------------------------+ |
| | [Clock]     Tempo Medio              | |
| |             14.5h (est: 13-18h)      | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
|                                          |
| Conclusao por Modulo                     |
|                                          |
| Modulo 1: Conexao Inicial               |
| [================================] 78%  |
|                                          |
| Modulo 2: Promocao do Conteudo          |
| [======================          ] 54%  |
|                                          |
| Modulo 3: Entrega Estruturada           |
| [=============                   ] 31%  |
|                                          |
| Modulo 4: Historia de Essencia          |
| [=======                         ] 18%  |
|                                          |
| Modulo 5: Finalizacao Emocional         |
| [====                            ] 9%   |
|                                          |
+------------------------------------------+
|                                          |
| Checkpoint Mais Travado                  |
| +--------------------------------------+ |
| | [AlertTriangle]                      | |
| | 3.4 Criou material de apoio visual   | |
| | Modulo 3 - Entrega Estruturada       | |
| | Apenas 12% dos alunos completaram    | |
| |                                      | |
| | Sugestao: Considere adicionar        | |
| | exemplos ou simplificar o criterio   | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
|                                          |
| Distribuicao por Trilha                  |
|                                          |
| Intermediario  [==========] 42% (62)    |
| Iniciante      [=======   ] 28% (41)    |
| Express        [=====     ] 18% (26)    |
| Master         [===       ] 12% (18)    |
|                                          |
+------------------------------------------+
|                                          |
| Alunos Recentes                          |
|                                          |
| +--------------------------------------+ |
| | [Av] Maria S.   Inter.  45%  Hoje   | |
| | [Av] Joao P.    Inic.   32%  Hoje   | |
| | [Av] Ana C.     Master  78%  Ontem  | |
| | [Av] Carlos R.  Express 100% 2d     | |
| | [Av] Lucia M.   Inter.  12%  3d     | |
| +--------------------------------------+ |
|                                          |
| [Ver todos os alunos]                    |
|                                          |
+------------------------------------------+
```

## Desktop (> 1024px)

```
+------------------------------------------------------------------------+
| [Logo] Metodo Aplauda de Pe  [Painel Instrutor]           [Av] Renner  |
+------------------------------------------------------------------------+
|                                                                          |
|  Painel do Instrutor                          Atualizado: agora         |
|                                                                          |
|  +---------------+ +---------------+ +---------------+ +---------------+ |
|  | [Users]       | | [UserCheck]   | | [Percent]     | | [Clock]      | |
|  | Total Alunos  | | Ativos (7d)   | | Conclusao     | | Tempo Medio  | |
|  | 147           | | 89 (61%)      | | 23%           | | 14.5h        | |
|  | +12 esta sem. | | +8 esta sem.  | | +3% vs semana | | (est: 13-18h)| |
|  +---------------+ +---------------+ +---------------+ +---------------+ |
|                                                                          |
+--------------------------------------------------------------------------+
|                                                                          |
|  +------------------------------------+ +----------------------------+   |
|  | Conclusao por Modulo               | | Checkpoint Mais Travado    |   |
|  |                                    | |                            |   |
|  | 1. Conexao Inicial                 | | [AlertTriangle]            |   |
|  | [============================] 78% | |                            |   |
|  |                                    | | 3.4 Criou material de      |   |
|  | 2. Promocao do Conteudo            | | apoio visual               |   |
|  | [=====================     ] 54%   | |                            |   |
|  |                                    | | Modulo 3 - Entrega         |   |
|  | 3. Entrega Estruturada             | | Estruturada                |   |
|  | [=============             ] 31%   | |                            |   |
|  |                                    | | Apenas 12% completaram     |   |
|  | 4. Historia de Essencia            | |                            |   |
|  | [========                  ] 18%   | | Sugestao: Considere        |   |
|  |                                    | | adicionar exemplos ou      |   |
|  | 5. Finalizacao Emocional           | | simplificar o criterio.    |   |
|  | [====                      ] 9%    | |                            |   |
|  +------------------------------------+ +----------------------------+   |
|                                                                          |
|  +------------------------------------+ +----------------------------+   |
|  | Distribuicao por Trilha            | | Engajamento Semanal        |   |
|  |                                    | |                            |   |
|  | Intermediario  42% (62 alunos)     | | Seg  [=====] 45            |   |
|  | [====================        ]     | | Ter  [=======] 62          |   |
|  |                                    | | Qua  [========] 71         |   |
|  | Iniciante      28% (41 alunos)     | | Qui  [======] 55           |   |
|  | [==============              ]     | | Sex  [====] 38             |   |
|  |                                    | | Sab  [==] 18               |   |
|  | Express        18% (26 alunos)     | | Dom  [=] 12                |   |
|  | [=========                   ]     | |                            |   |
|  |                                    | |                            |   |
|  | Master         12% (18 alunos)     | |                            |   |
|  | [======                      ]     | |                            |   |
|  +------------------------------------+ +----------------------------+   |
|                                                                          |
+--------------------------------------------------------------------------+
|                                                                          |
|  Lista de Alunos                              [Buscar aluno...]         |
|                                                                          |
|  +------------------------------------------------------------------+   |
|  | Nome          | Trilha       | Progresso | Ultimo acesso | Streak |   |
|  |------------------------------------------------------------------ |   |
|  | Maria S.      | Intermediario| 45%  [==] | Hoje, 14:30   | 7 dias |   |
|  | Joao P.       | Iniciante    | 32%  [==] | Hoje, 11:15   | 3 dias |   |
|  | Ana C.        | Master       | 78%  [===]| Ontem, 18:45  | 14 dias|   |
|  | Carlos R.     | Express      | 100% [====| 2 dias atras  | --     |   |
|  | Lucia M.      | Intermediario| 12%  [=]  | 3 dias atras  | 0      |   |
|  | Pedro F.      | Iniciante    | 8%   [=]  | 5 dias atras  | 0      |   |
|  | Fernanda L.   | Master       | 65%  [===]| 1 dia atras   | 21 dias|   |
|  | Roberto G.    | Intermediario| 55%  [===]| Hoje, 09:30   | 5 dias |   |
|  +------------------------------------------------------------------+   |
|                                                                          |
|  Mostrando 1-8 de 147          [<] [1] [2] ... [19] [>]                |
|                                                                          |
+--------------------------------------------------------------------------+
```

## Behavior Notes

- **Access control:** Page is protected. Only users with `role: instructor` in Supabase can access. Non-instructors get redirected to dashboard with "Acesso restrito" message.
- **Role assignment:** Manual via Supabase dashboard (not via UI). Renner Silva's email gets instructor role directly in profiles table.
- **Data aggregation:** All metrics are aggregated. Instructor NEVER sees individual student activity details (RLS enforced). Only sees: name, trail, progress %, last active date, streak.
- **Stat cards (top row):**
  - Total Alunos: Count of profiles table
  - Ativos (7d): Profiles with progress update in last 7 days
  - Taxa de Conclusao: % of students who completed all checkpoints
  - Tempo Medio: Average estimated hours based on completed content
  - Desktop shows week-over-week delta ("+12 esta semana")
- **Completion by module:** Horizontal bar chart showing % of students who completed each module. Color-coded with module colors.
- **Most blocked checkpoint:** Single card highlighting the checkpoint with lowest completion rate. Includes actionable suggestion.
- **Trail distribution:** Horizontal bars showing student count per trail. Sorted by count descending.
- **Weekly engagement (desktop only):** Bar chart showing daily active student count for current week.
- **Student list:** Table with sortable columns. Search by name. Pagination (8 per page). Mini progress bar inline.
- **Refresh:** Auto-refresh every 60 seconds via SWR revalidation. Manual refresh button in header.
- **Mobile:** Stack all sections vertically. Student list becomes compact cards instead of table. No engagement chart (too complex for mobile).
- **Export:** "Exportar relatorio" button downloads CSV with anonymized aggregate data.
