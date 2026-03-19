# Wireframe 03: Pagina de Modulo Individual

**Screen:** Module Detail Page (`/modules/[id]`)
**Priority:** Epic 1, Story 1.5
**Layout:** Module Detail Layout (with sidebar on desktop)

---

## Mobile (< 640px)

```
+------------------------------------------+
| [Logo] Metodo Aplauda de Pe    [O 12%]   |
+------------------------------------------+
| < Dashboard                              |
+------------------------------------------+
| [============= module-1 color ===========|
| |                                        |
| | MODULO 1                               |
| | Conexao Inicial                        |
| |                                        |
| | Faca as pessoas gostarem de voce nos   |
| | primeiros minutos da sua palestra      |
| |                                        |
| | +----------+ +----------+ +----------+ |
| | | Nivel    | | Duracao  | | Ckpts    | |
| | | Basico   | | 2-3h     | | 1/4      | |
| | +----------+ +----------+ +----------+ |
| |                                        |
| | [===========] 25%                      |
| +========================================+
|                                          |
| [Conceitos] [Tecnicas] [Exercicios] [Ckpts]
| (horizontal scrollable tabs)             |
|                                          |
+------------------------------------------+
| TAB: Conceitos-Chave                     |
|                                          |
| +--------------------------------------+ |
| | v  Rapport Imediato         [mod-1]  | |
| |    ________________________________  | |
| |    Definicao:                        | |
| |    Tecnica de criar conexao          | |
| |    emocional rapida com o publico    | |
| |    nos primeiros segundos...         | |
| |                                      | |
| |    Importancia:                      | |
| |    Os primeiros 30 segundos definem  | |
| |    se o publico vai prestar atencao  | |
| |                                      | |
| |    Exemplos Praticos:                | |
| |    - Fazer pergunta direta ao pub... | |
| |    - Contar anedota pessoal...       | |
| |                                      | |
| |    Como Aplicar:                     | |
| |    1. Chegue 15min antes             | |
| |    2. Observe o publico              | |
| |    3. Adapte sua abertura            | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | >  Vulnerabilidade Estrategica       | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | >  Leitura de Plateia                | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
```

## Desktop (> 1024px)

```
+------------------------------------------------------------------------+
| [Logo] Metodo Aplauda de Pe  [Dashboard][Modulos][Trilhas][Badges] [O] |
+------------------------------------------------------------------------+
| Dashboard > Modulo 1 > Conexao Inicial                                  |
+------------------------------------------------------------------------+
|                                                                          |
| +----------+ +----------------------------------------------------------+|
| | SIDEBAR  | | MODULE HEADER (module-1 color background, 120px)        ||
| |          | | +------------------------------------------------------+||
| | Modulos  | | | MODULO 1                                             |||
| |          | | | Conexao Inicial                                      |||
| | [*] 1.   | | |                                                     |||
| |  Conexao | | | Faca as pessoas gostarem de voce nos primeiros       |||
| |  Inicial | | | minutos da sua palestra                              |||
| |          | | |                                                     |||
| | [ ] 2.   | | | [Basico] [2-3h] [1/4 checkpoints] [====] 25%        |||
| |  Promocao| | +------------------------------------------------------+||
| |  (locked)| |                                                          ||
| |          | | Conceitos-Chave                     (3 conceitos)        ||
| | [ ] 3.   | | +------------------------------------------------------+||
| |  Entrega | | | v  Rapport Imediato                        [mod-1]   |||
| |  (locked)| | |                                                      |||
| |          | | |  Definicao:                                          |||
| | [ ] 4.   | | |  Tecnica de criar conexao emocional rapida com o    |||
| |  Historia| | |  publico nos primeiros segundos de uma palestra...   |||
| |  (locked)| | |                                                      |||
| |          | | |  [Importancia] [Exemplos] [Como Aplicar]  (tabs)     |||
| | [ ] 5.   | | +------------------------------------------------------+||
| |  Finaliz.| | | >  Vulnerabilidade Estrategica                       |||
| |  (locked)| | +------------------------------------------------------+||
| |          | | | >  Leitura de Plateia                                |||
| |          | | +------------------------------------------------------+||
| | ________ | |                                                          ||
| |          | | Tecnicas                             (5 tecnicas)        ||
| | Sections | | +------------------------------------------------------+||
| | Conceitos| | | [icon] Tecnica do Espelho Emocional                   |||
| | Tecnicas | | | [icon] Pergunta Retoorica de Abertura                 |||
| | Exerc.   | | | [icon] Vulnerabilidade Calculada                      |||
| | Ckpts    | | | [icon] Humor Inteligente                              |||
| |          | | | [icon] Regra dos 30 Segundos                          |||
| +----------+ | +------------------------------------------------------+||
|              |                                                          ||
|              | Exercicios                           (3 exercicios)      ||
|              | +------------------+ +------------------+                ||
|              | | [Dumbbell]       | | [Dumbbell]       |                ||
|              | | Espelho do       | | Abertura          |               ||
|              | | Rapport          | | Irresistivel      |               ||
|              | | Individual | 30m | | Individual | 45m  |               ||
|              | | [Ver exercicio ->]| | [Ver exercicio ->]|               ||
|              | +------------------+ +------------------+                ||
|              |                                                          ||
|              | Armadilhas Comuns                                        ||
|              | +------------------------------------------------------+||
|              | | [AlertTriangle] Comecaar com "Bom dia, meu nome e..."|||
|              | | [AlertTriangle] Ler slides em voz alta               |||
|              | | [AlertTriangle] Ignorar linguagem corporal do pub... |||
|              | +------------------------------------------------------+||
|              |                                                          ||
|              | Checkpoints do Modulo                   1/4 concluidos  ||
|              | +------------------------------------------------------+||
|              | | [x] 1.1 Consegue criar rapport em 30s                |||
|              | | [ ] 1.2 Domina 3 tecnicas de abertura                |||
|              | | [ ] 1.3 Consegue ler reacoes do publico              |||
|              | | [ ] 1.4 Praticou exercicio do Espelho 3x             |||
|              | +------------------------------------------------------+||
|              |                                                          ||
|              | +------------------------+ +------------------------+    ||
|              | | [<- Voltar Dashboard]  | | [Modulo 2: Promocao ->]|    ||
|              | +------------------------+ +------------------------+    ||
|              +----------------------------------------------------------+|
+------------------------------------------------------------------------+
```

## Behavior Notes

- **Sidebar (desktop only):** Fixed 280px left panel showing all modules with active/locked states. Click navigates between modules. Sections within current module are anchor links.
- **Mobile tabs:** Horizontal scrollable tabs replace sidebar. Tap to switch between Conceitos, Tecnicas, Exercicios, Checkpoints.
- **Accordion behavior:** Only one concept expanded at a time (single mode). Radix Accordion with smooth height animation.
- **Concept detail tabs:** Inside expanded concept, sub-tabs for "Importancia", "Exemplos Praticos", "Como Aplicar". On mobile, these are stacked vertically instead of tabbed.
- **Checkpoints:** Interactive checkboxes. Clicking marks as complete, triggers toast "Checkpoint concluido!", updates progress bar in real-time.
- **Module unlocking:** If next module is locked, "Modulo 2: Promocao" button shows lock icon + "Faltam X checkpoints". If unlocked, shows arrow.
- **Exercise cards:** Click navigates to `/modules/[id]/exercises/[exerciseId]`.
- **Color theming:** Module header and color strip use the module's specific color (`--module-N`). Sidebar active state matches.
- **Breadcrumb:** Full path on desktop. "< Dashboard" back link on mobile.
- **Scroll behavior:** Smooth scroll to sections when clicking sidebar links. Scroll-spy highlights current section in sidebar.
