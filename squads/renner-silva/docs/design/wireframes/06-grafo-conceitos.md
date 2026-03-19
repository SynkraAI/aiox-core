# Wireframe 06: Grafo de Conceitos

**Screen:** Concept Relationship Graph (`/concepts/graph`)
**Priority:** Epic 3, Story 3.2
**Layout:** Default Layout (full-width content area)

---

## Mobile (< 640px) -- List Fallback

On mobile, the interactive graph is replaced with a hierarchical list view showing the same relationships in a linear format.

```
+------------------------------------------+
| [Logo] Metodo Aplauda de Pe    [O 35%]   |
+------------------------------------------+
| < Dashboard                              |
+------------------------------------------+
|                                          |
| Mapa de Conceitos                        |
| 15 conceitos conectados                  |
|                                          |
| [Grafo] [Lista]  (toggle, Lista active)  |
|                                          |
+------------------------------------------+
|                                          |
| Legenda                                  |
| [mod-1] Conexao  [mod-2] Promocao       |
| [mod-3] Entrega  [mod-4] Historia        |
| [mod-5] Final                            |
| ___ prerequisito  --- relacionado        |
|                                          |
+------------------------------------------+
|                                          |
| MODULO 1: Conexao Inicial               |
|                                          |
| +--------------------------------------+ |
| | [mod-1] Rapport Imediato             | |
| |   -> Vulnerabilidade Estrategica     | |
| |   -> Leitura de Plateia              | |
| |   Prerequisito de: Narrativa Pessoal | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | [mod-1] Vulnerabilidade Estrategica  | |
| |   -> Rapport Imediato               | |
| |   Prerequisito de: Arco de Tensao   | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | [mod-1] Leitura de Plateia           | |
| |   -> Rapport Imediato               | |
| |   -> Ritmo e Timing                 | |
| +--------------------------------------+ |
|                                          |
| MODULO 2: Promocao do Conteudo          |
|                                          |
| +--------------------------------------+ |
| | [mod-2] Loop de Curiosidade          | |
| |   Prerequisito: Rapport Imediato     | |
| |   -> Estrutura em 3 Atos            | |
| +--------------------------------------+ |
|                                          |
| (... remaining concepts grouped by       |
|  module, showing connections)            |
|                                          |
+------------------------------------------+
```

## Desktop (> 1024px) -- Interactive Graph

```
+------------------------------------------------------------------------+
| [Logo] Metodo Aplauda de Pe  [Nav links]               [35%] [Avatar] |
+------------------------------------------------------------------------+
| Dashboard > Mapa de Conceitos                                           |
+------------------------------------------------------------------------+
|                                                                          |
|  Mapa de Conceitos                                                      |
|  Visualize como os 15 conceitos se conectam entre si                    |
|                                                                          |
|  [Grafo] [Lista]  (toggle)                                              |
|                                                                          |
+--------------------------------------------------------------------------+
|                                                                          |
|  +------------------------------------------------------------------+   |
|  |                                                                    |   |
|  |  Legend: [mod-1] [mod-2] [mod-3] [mod-4] [mod-5]                 |   |
|  |  ___ prerequisito    --- relacionado          [+] [-] (zoom)      |   |
|  |                                                                    |   |
|  |                   (Rapport)----(Leitura                           |   |
|  |                   [mod-1]       Plateia)                           |   |
|  |                      |         [mod-1]                            |   |
|  |                      |            |                               |   |
|  |                (Vulnerab.)        |                               |   |
|  |                [mod-1]            |                               |   |
|  |                   |               |                               |   |
|  |                   v               v                               |   |
|  |            (Loop Curiosidade)---(Ritmo e                          |   |
|  |              [mod-2]             Timing)                           |   |
|  |                   |             [mod-3]                           |   |
|  |                   v                                               |   |
|  |            (Estrutura 3 Atos)                                     |   |
|  |              [mod-3]                                              |   |
|  |                   |                                               |   |
|  |                   v                                               |   |
|  |            (Narrativa Pessoal)---(Arco de                         |   |
|  |              [mod-4]              Tensao)                          |   |
|  |                                  [mod-4]                          |   |
|  |                                     |                             |   |
|  |                                     v                             |   |
|  |                             (Fechamento                           |   |
|  |                              Emocional)                           |   |
|  |                              [mod-5]                              |   |
|  |                                                                    |   |
|  +------------------------------------------------------------------+   |
|                                                                          |
|  +------------------------------------------------------------------+   |
|  | TOOLTIP (on node hover/click):                                    |   |
|  | +--------------------------------------------------------------+ |   |
|  | | [mod-1] Rapport Imediato                                      | |   |
|  | |                                                                | |   |
|  | | Tecnica de criar conexao emocional rapida com o publico       | |   |
|  | | nos primeiros segundos de uma palestra.                       | |   |
|  | |                                                                | |   |
|  | | Dificuldade: Basico                                           | |   |
|  | | Modulo: 1 - Conexao Inicial                                   | |   |
|  | |                                                                | |   |
|  | | [Ver no modulo ->]                                             | |   |
|  | +--------------------------------------------------------------+ |   |
|  +------------------------------------------------------------------+   |
|                                                                          |
+--------------------------------------------------------------------------+
```

## Behavior Notes

- **Graph library:** react-force-graph-2d or d3-force (architect decision). Force-directed layout with module clustering.
- **Node styling:** Circle with radius proportional to connection count. Colored by module (`--module-N`). Label below node.
- **Edge styling:** Solid line = prerequisite (directed, with arrow). Dashed line = related (undirected).
- **Hover interaction:** Highlight the hovered node and all connected nodes/edges. Dim unconnected nodes. Show tooltip with concept summary.
- **Click interaction:** Open detail tooltip (persistent until clicked elsewhere). Tooltip includes "Ver no modulo" link.
- **Zoom/Pan:** Mouse wheel zoom, click-drag pan. Zoom controls (+/-) in top-right corner. Reset zoom button.
- **Mobile toggle:** Default view on mobile is "Lista" (hierarchical list). "Grafo" is available but shows simplified version with warning about limited interactivity.
- **Module clustering:** Nodes from the same module tend to cluster together due to force simulation.
- **Performance:** Canvas rendering (not SVG) for 15+ nodes with animations. Limit to 60fps.
- **Accessibility:** List view is the accessible alternative. Graph has `aria-label="Grafo interativo de conceitos"` and is `role="img"` with text alternative available via List tab.
