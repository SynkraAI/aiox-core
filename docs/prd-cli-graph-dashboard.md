# CLI Graph Dashboard — Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Fornecer visualização interativa do dependency graph do code-intel no terminal
- Permitir inspeção de blast radius, entity relationships e métricas de cache/latency via CLI
- Manter alinhamento com Artigo I da Constitution (CLI First) — zero dependência de UI web
- Tornar dados internos do code-intel visíveis ao usuário (hoje fluem apenas internamente para agentes)
- Suportar múltiplos formatos de output (ASCII, DOT, Mermaid, JSON) para integração com ferramentas externas

### Background Context

O Epic NOGIC (Code Intelligence) construiu um módulo completo de inteligência de código com 8 capabilities primitivas, 5 compostas e 6 helpers por agente — totalizando 275 testes passando. Contudo, toda essa inteligência é consumida internamente pelos agentes e **não há nenhuma forma de visualizar os grafos, métricas ou relacionamentos no terminal**. Os dados existem (dependency graph, blast radius, entity stats, cache metrics, latency) mas são invisíveis ao usuário.

Este PRD define um CLI Graph Dashboard que expõe essa riqueza de dados de forma interativa no terminal, usando bibliotecas TUI maduras como `blessed-contrib` para widgets ricos (tree, sparkline, charts, gauges).

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-21 | 1.0 | Initial PRD draft baseado em deep research | Morgan (@pm) |

---

## Requirements

### Functional

- **FR1:** O sistema deve renderizar o dependency graph como uma árvore interativa com expand/collapse no terminal (`analyzeDependencies` → tree widget)
- **FR2:** O sistema deve exibir blast radius visual para qualquer arquivo selecionado (`assessImpact` → gauge/risk display)
- **FR3:** O sistema deve mostrar métricas de cache (hits/misses) como sparklines em tempo real (`client.getMetrics()` → sparkline widget)
- **FR4:** O sistema deve plotar latency das capabilities como line chart (`client._latencyLog` → line chart)
- **FR5:** O sistema deve exibir estatísticas de entidades do entity-registry (total, categorias, última atualização) como tabela (`registry-loader` → table widget)
- **FR6:** O sistema deve mostrar status do provider code-intel (ativo/inativo, circuit breaker state, failures, uptime) (`isCodeIntelAvailable` + CB → status widget)
- **FR7:** O sistema deve suportar output em múltiplos formatos: ASCII (padrão), DOT (Graphviz), Mermaid (docs), JSON (processamento programático)
- **FR8:** O sistema deve suportar modo `--watch` para atualização em tempo real do dashboard
- **FR9:** O sistema deve funcionar como CLI command (`aios graph`) com sub-comandos: `--deps`, `--blast <file>`, `--stats`, `--watch`
- **FR10:** O sistema deve fornecer fallback para dados estáticos do entity-registry quando o Code Graph MCP estiver offline

### Non Functional

- **NFR1:** O dashboard deve iniciar em menos de 2 segundos
- **NFR2:** Updates em modo `--watch` devem ocorrer a cada 5 segundos sem impacto perceptível de performance
- **NFR3:** O sistema deve funcionar em Windows Terminal, PowerShell, e terminais Unix (bash/zsh) — cross-platform
- **NFR4:** O sistema deve funcionar over SSH sem degradação significativa
- **NFR5:** Dependências novas devem ser mínimas e mantidas ativamente (blessed/neo-blessed, blessed-contrib, asciichart)
- **NFR6:** O sistema deve degradar graciosamente se o terminal não suportar Unicode box-drawing characters

---

## Technical Assumptions

### Repository Structure: Monorepo

O CLI Graph Dashboard será adicionado ao monorepo existente `aios-core`, como um novo módulo em `.aios-core/core/graph-dashboard/` com entrypoint em `bin/aios-graph.js`.

### Service Architecture

Módulo standalone dentro do monorepo que consome dados do `code-intel` module existente e do `entity-registry`. Sem serviços externos — tudo local no terminal.

### Testing Requirements

Unit + Integration tests. Unit tests para cada widget/data-source adapter. Integration tests para o dashboard completo com dados mock.

### Additional Technical Assumptions and Requests

- **TUI Framework:** `blessed` (ou `neo-blessed` fork) + `blessed-contrib` — widgets nativos para tree, charts, sparklines, gauges
- **ASCII Charts (MVP):** `asciichart` — zero deps, line charts em ASCII puro para o MVP sem blessed
- **DAG Layout (V2+):** `d3-dag` — algoritmos Sugiyama/Zherebko para computar layout de grafos complexos
- **Node.js:** Mínimo v18+ (já requisito do projeto)
- **Fallback Strategy:** Se `blessed` se tornar unmaintained, migrar para `neo-blessed` fork ou `Ink` (React-based TUI)
- **Data Sources:** Reutilizar 100% dos dados já disponíveis no code-intel module (analyzeDependencies, assessImpact, getMetrics, isCodeIntelAvailable) e entity-registry.yaml

---

## Epic List

### Epic 1: MVP — ASCII Text Output (`aios graph`)

**Goal:** Entregar visualização básica do dependency graph e entity stats como output ASCII no terminal, sem dependências TUI pesadas.

### Epic 2: Interactive TUI Dashboard (blessed-contrib)

**Goal:** Dashboard interativo multi-painel com tree widget, charts, sparklines e gauges usando blessed-contrib.

### Epic 3: Real-time & Advanced Visualization

**Goal:** Modo watch para updates em tempo real, blast radius visual, latency charts, e múltiplos formatos de output (DOT, Mermaid).

---

## Epic 1: MVP — ASCII Text Output

**Goal:** Estabelecer o CLI command `aios graph` com output ASCII do dependency graph e entity stats. Entrega valor imediato com zero dependências TUI pesadas — apenas `asciichart` para line charts simples. Este é o fundamento sobre o qual os epics seguintes construirão.

### Story 1.1: CLI Entrypoint e Dependency Tree ASCII

**As a** developer using AIOS,
**I want** to run `aios graph --deps` in the terminal,
**so that** I can see the dependency tree of code-intel entities as ASCII text.

#### Acceptance Criteria

1. Comando `npx aios-core graph` existe e é executável
2. Flag `--deps` renderiza dependency tree como texto indentado com box-drawing characters (`├─`, `└─`, `│`)
3. Dados vêm de `analyzeDependencies()` do code-intel module
4. Fallback para entity-registry.yaml quando Code Graph MCP está offline
5. Output é válido para pipe (`aios graph --deps | grep helper`)
6. Testes unitários cobrem: tree rendering, fallback data, empty graph

### Story 1.2: Entity Stats e Cache Metrics ASCII

**As a** developer using AIOS,
**I want** to run `aios graph --stats` to see entity statistics and cache metrics,
**so that** I can monitor the health of the code intelligence system.

#### Acceptance Criteria

1. Flag `--stats` exibe tabela formatada com: total entidades, categorias, última atualização
2. Inclui cache hit/miss ratio como percentagem e ASCII sparkline (via `asciichart`)
3. Inclui latency últimas N operações como ASCII line chart
4. Dados vêm de `registry-loader` + `client.getMetrics()` + `client._latencyLog`
5. Funciona sem Code Graph MCP (usa entity-registry.yaml como fallback)
6. Testes unitários cobrem: stats formatting, sparkline rendering, missing data handling

### Story 1.3: Provider Status e Output Formats

**As a** developer using AIOS,
**I want** to see provider status and export graph data in different formats,
**so that** I can integrate with other tools and monitor system health.

#### Acceptance Criteria

1. Sem flags adicionais, `aios graph` mostra summary view (dependency tree + stats + provider status)
2. Provider status mostra: Code Graph MCP (ACTIVE/OFFLINE), Circuit Breaker state, failure count
3. Flag `--format=json` output JSON estruturado do dependency graph
4. Flag `--format=dot` output formato DOT para Graphviz
5. Flag `--format=mermaid` output formato Mermaid para documentação
6. Testes unitários cobrem: cada formato de output, provider status rendering

---

## Epic 2: Interactive TUI Dashboard (blessed-contrib)

**Goal:** Construir dashboard interativo multi-painel usando `blessed-contrib` que combina tree widget (dependency graph), charts (latency, cache), e status indicators num único ecrã terminal. Navegação por teclado e mouse.

### Story 2.1: Dashboard Layout e Dependency Tree Widget

**As a** developer using AIOS,
**I want** an interactive dashboard with a dependency tree I can expand/collapse,
**so that** I can explore code relationships visually in the terminal.

#### Acceptance Criteria

1. `aios graph --interactive` abre dashboard blessed-contrib fullscreen
2. Grid layout com áreas definidas: tree (esquerda), stats (direita-topo), charts (direita-baixo)
3. Tree widget renderiza dependency graph com expand/collapse via Enter
4. Navegação por teclado (arrows, Enter, q para sair)
5. Screen resize é responsivo (adapta layout)
6. Testes unitários cobrem: layout rendering, tree data transformation, keyboard events

### Story 2.2: Métricas e Status Widgets

**As a** developer using AIOS,
**I want** to see cache metrics, latency charts and provider status in the dashboard,
**so that** I have a complete view of the code intelligence system health.

#### Acceptance Criteria

1. Sparkline widget mostra cache hit rate em tempo real
2. Line chart widget mostra latency das últimas N operações
3. Status widget mostra provider status (ACTIVE/OFFLINE) com cor (verde/vermelho)
4. Gauge widget mostra blast radius quando um nó é selecionado no tree
5. Todos os widgets atualizam ao navegar no tree (selecionar entity → atualiza blast radius)
6. Testes unitários cobrem: widget data binding, update cycle, error states

### Story 2.3: Data Source Adapters

**As a** developer using AIOS,
**I want** reliable data adapters that transform code-intel data for dashboard widgets,
**so that** the dashboard always shows accurate and up-to-date information.

#### Acceptance Criteria

1. `code-intel-source.js` adapter transforma output de analyzeDependencies → tree widget format
2. `registry-source.js` adapter transforma entity-registry.yaml → table/stats format
3. Adapters implementam caching local (5s TTL) para evitar queries repetidas
4. Adapters degradam graciosamente quando provider offline (mostram dados cached ou estáticos)
5. Adapters expõem interface uniforme: `getData()`, `getLastUpdate()`, `isStale()`
6. Testes unitários cobrem: data transformation, caching, graceful degradation, stale detection

---

## Epic 3: Real-time & Advanced Visualization

**Goal:** Adicionar modo watch para updates automáticos, blast radius interativo para qualquer arquivo, e comandos de agente (`*graph`) para integração no workflow dos agentes AIOS.

### Story 3.1: Watch Mode e Auto-refresh

**As a** developer using AIOS,
**I want** the dashboard to auto-refresh every N seconds,
**so that** I can monitor the system in real-time while developing.

#### Acceptance Criteria

1. Flag `--watch` ativa auto-refresh a cada 5 segundos (configurável via `--interval`)
2. Apenas widgets com dados alterados são re-renderizados (diff-based update)
3. Status bar mostra countdown para próximo refresh
4. `Ctrl+R` força refresh manual imediato
5. `Ctrl+C` ou `q` para sair cleanly
6. Testes unitários cobrem: refresh cycle, diff detection, graceful shutdown

### Story 3.2: Blast Radius Interativo

**As a** developer using AIOS,
**I want** to select any file and see its blast radius visually,
**so that** I can understand the impact of changes before making them.

#### Acceptance Criteria

1. `aios graph --blast <file>` mostra blast radius de um arquivo específico
2. No dashboard interativo, selecionar nó no tree mostra blast radius no painel direito
3. Blast radius inclui: direct consumers, indirect affected, risk level (gauge)
4. Risk levels: LOW (0-3 affected), MEDIUM (4-8), HIGH (9+) com cores
5. Dados vêm de `assessImpact()` do code-intel enricher
6. Testes unitários cobrem: blast radius calculation display, risk levels, file not found handling

### Story 3.3: Agent Commands Integration

**As a** developer using AIOS,
**I want** to use graph commands within agent sessions,
**so that** I can visualize code relationships without leaving my current workflow.

#### Acceptance Criteria

1. `*graph deps` no contexto de qualquer agente mostra dependency tree ASCII inline
2. `*graph blast <file>` mostra blast radius inline
3. `*graph stats` mostra entity stats inline
4. Output é formatado para contexto de chat (sem TUI, apenas texto formatado)
5. Comandos delegam para o módulo graph-dashboard internamente
6. Testes unitários cobrem: command parsing, inline rendering, agent context integration

---

## Checklist Results Report

> PRD gerado em YOLO mode baseado em deep research completo (`docs/research/2026-02-21-cli-graph-dashboard/`). Research cobriu 5 sub-queries com 16+ sources analisadas.

**Validações aplicadas:**
- [x] Goals claros e alinhados com Constitution (CLI First)
- [x] Requirements rastreáveis (FR1-FR10, NFR1-NFR6)
- [x] Epics sequenciais (MVP → Interactive → Advanced)
- [x] Stories com acceptance criteria testáveis
- [x] Technical assumptions documentadas com rationale
- [x] Dependências de dados mapeadas (code-intel module existente)
- [x] Riscos documentados no research (blessed maintenance, Windows compatibility, MCP offline)

---

## Next Steps

### UX Expert Prompt

> N/A — Este é um CLI-only product (terminal TUI). Não há UI web. O design visual é definido pelo blessed-contrib grid layout documentado no research (`docs/research/2026-02-21-cli-graph-dashboard/03-recommendations.md`).

### Architect Prompt

> @architect — Crie a arquitetura técnica detalhada para o CLI Graph Dashboard usando este PRD como input. Foco em: (1) estrutura de módulos dentro de `.aios-core/core/graph-dashboard/`, (2) data source adapters para code-intel e entity-registry, (3) widget composition pattern com blessed-contrib, (4) CLI command routing via `bin/aios-graph.js`, (5) fallback strategy quando Code Graph MCP está offline. Reference: `docs/research/2026-02-21-cli-graph-dashboard/03-recommendations.md` para stack recomendado.

---

*— Morgan, planejando o futuro 📊*
