# Wireframe 04: Pagina de Exercicio

**Screen:** Exercise Detail (`/modules/[id]/exercises/[exerciseId]`)
**Priority:** Epic 1, Story 1.5
**Layout:** Default Layout (narrow container, max-w-3xl)

---

## Mobile (< 640px)

```
+------------------------------------------+
| [Logo] Metodo Aplauda de Pe    [O 12%]   |
+------------------------------------------+
| < Modulo 1: Conexao Inicial              |
+------------------------------------------+
|                                          |
| [Individual]  [30 min]  [Basico]         |
| (type badge)  (time)    (level)          |
|                                          |
| Espelho do Rapport                       |
| Pratique tecnicas de conexao imediata    |
| usando espelhamento corporal e verbal    |
|                                          |
+------------------------------------------+
|                                          |
| Instrucoes                               |
|                                          |
| 1. Encontre um parceiro de pratica ou    |
|    use um espelho de corpo inteiro       |
|                                          |
| 2. Posicione-se a 2 metros de distancia |
|    e faca contato visual                 |
|                                          |
| 3. Comece a espelhar sutilmente a        |
|    postura e gestos do parceiro          |
|                                          |
| 4. Apos 2 minutos, introduza uma        |
|    mudanca de postura e observe se       |
|    o parceiro acompanha                  |
|                                          |
| 5. Repita o exercicio 3 vezes,           |
|    variando a velocidade do              |
|    espelhamento                          |
|                                          |
+------------------------------------------+
|                                          |
| Criterios de Sucesso                     |
|                                          |
| [check] Consegue espelhar postura em     |
|         menos de 5 segundos              |
| [check] Parceiro acompanha sua mudanca   |
|         de postura involuntariamente     |
| [check] Manteve contato visual natural   |
|         durante todo o exercicio         |
|                                          |
+------------------------------------------+
|                                          |
| Recursos Necessarios                     |
|                                          |
| [icon] Espelho de corpo inteiro ou       |
|        parceiro de pratica               |
| [icon] Ambiente silencioso               |
| [icon] Cronometro (celular)              |
|                                          |
+------------------------------------------+
|                                          |
| Conceitos Relacionados                   |
|                                          |
| [Rapport Imediato] [Leitura de Plateia]  |
| (clickable badges linking to concepts)   |
|                                          |
+------------------------------------------+
|                                          |
| Minhas Anotacoes                         |
| +--------------------------------------+ |
| |                                      | |
| | Escreva suas reflexoes, insights     | |
| | e observacoes sobre este exercicio.. | |
| | (textarea, 4 rows min)              | |
| |                                      | |
| +--------------------------------------+ |
| [Salvar anotacao] (secondary button)     |
|                                          |
+------------------------------------------+
|                                          |
| +--------------------------------------+ |
| |  [ ] Marcar exercicio como concluido | |
| |                                      | |
| |  Ao marcar, este exercicio contara   | |
| |  para seu progresso no modulo.       | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
| [<- Anterior]            [Proximo ->]    |
+------------------------------------------+
```

## Desktop (> 1024px)

```
+------------------------------------------------------------------------+
| [Logo] Metodo Aplauda de Pe  [Nav links]               [12%] [Avatar] |
+------------------------------------------------------------------------+
| Dashboard > Modulo 1 > Exercicios > Espelho do Rapport                  |
+------------------------------------------------------------------------+
|                                                                          |
|  +------------------------------------------------------------------+   |
|  | [Individual]  [30 min]  [Basico]                                  |   |
|  |                                                                    |   |
|  | Espelho do Rapport                                                |   |
|  | Pratique tecnicas de conexao imediata usando espelhamento         |   |
|  | corporal e verbal com um parceiro ou espelho                      |   |
|  +------------------------------------------------------------------+   |
|                                                                          |
|  +------------------------------------+ +----------------------------+  |
|  | Instrucoes                         | | Criterios de Sucesso       |  |
|  |                                    | |                            |  |
|  | 1. Encontre um parceiro de pratica | | [v] Espelhar postura em    |  |
|  |    ou use um espelho de corpo      | |     menos de 5 segundos    |  |
|  |    inteiro                         | |                            |  |
|  |                                    | | [v] Parceiro acompanha     |  |
|  | 2. Posicione-se a 2 metros de      | |     mudanca involuntaria   |  |
|  |    distancia                       | |                            |  |
|  |                                    | | [v] Contato visual natural |  |
|  | 3. Comece a espelhar sutilmente    | |     durante o exercicio    |  |
|  |    a postura e gestos              | |                            |  |
|  |                                    | +----------------------------+  |
|  | 4. Apos 2 min, introduza mudanca   |                                 |
|  |    e observe acompanhamento        | +----------------------------+  |
|  |                                    | | Recursos Necessarios       |  |
|  | 5. Repita 3x, variando velocidade  | |                            |  |
|  +------------------------------------+ | [icon] Espelho/parceiro    |  |
|                                          | [icon] Ambiente silencioso |  |
|  Conceitos Relacionados                  | [icon] Cronometro         |  |
|  [Rapport Imediato] [Leitura Plateia]    +----------------------------+  |
|                                                                          |
|  +------------------------------------------------------------------+   |
|  | Minhas Anotacoes                                                  |   |
|  | +--------------------------------------------------------------+ |   |
|  | | Escreva suas reflexoes, insights e observacoes...             | |   |
|  | |                                                              | |   |
|  | +--------------------------------------------------------------+ |   |
|  | [Salvar anotacao]                                                |   |
|  +------------------------------------------------------------------+   |
|                                                                          |
|  +------------------------------------------------------------------+   |
|  |  [ ] Marcar exercicio como concluido                              |   |
|  |  Ao marcar, este exercicio contara para seu progresso.            |   |
|  +------------------------------------------------------------------+   |
|                                                                          |
|  [<- Exercicio anterior]                    [Proximo exercicio ->]      |
|                                                                          |
+--------------------------------------------------------------------------+
```

## Behavior Notes

- **Completion toggle:** Large checkbox area (48px touch target). On check: green checkmark animation, toast "Exercicio concluido!", timestamp saved. Optimistic update.
- **Notes:** Auto-save after 2s of inactivity (debounced). Manual "Salvar" button for explicit save. Markdown support (bold, italic, lists). Saved to Supabase when auth available, localStorage for v1.1.
- **Concept badges:** Clickable -- navigate to the concept within the module page (scroll to accordion and expand).
- **Navigation footer:** Previous/Next exercise within the same module. If last exercise, "Voltar ao modulo" instead of "Proximo".
- **Breadcrumb:** Full path on desktop. "< Modulo 1: Conexao Inicial" back link on mobile.
- **Success criteria:** Informational only (not checkable). Serve as self-assessment guide.
- **Type badges:** Color-coded -- Individual (blue), Grupo (purple), Projeto Final (amber).
- **Loading:** Skeleton for notes area and exercise content while data loads.
