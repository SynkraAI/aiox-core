# Research Report: Code Intelligence Alternatives for AIOS

**Date:** 2026-02-15
**Coverage Score:** 85/100
**Sources:** 15 (HIGH: 10, MEDIUM: 4, LOW: 1)

---

## 1. Nogic — Estado Atual (Baseline)

| Atributo | Valor |
|----------|-------|
| **Versao** | 0.1.0 (released Feb 14, 2026) |
| **Maturidade** | VERY EARLY — "early and rough, but usable" (criador) |
| **Linguagens** | JavaScript, TypeScript, Python (C planned) |
| **Instalacao** | `pip install nogic` (CLI/MCP) + VS Code extension |
| **Pricing** | Gratis (pre-monetizacao). ARR model futuro mencionado |
| **Installs** | 7,185 (VS Code Marketplace) |
| **Performance** | 2-3 FPS em codebases medios (M1). Problemas com 2000+ arquivos |
| **Codigo** | Closed-source (open-source "soon") |
| **MCP Server** | Mencionado mas NAO totalmente implementado na v0.1.0 |
| **Limitacoes** | Edge detection com frameworks (Django), links GitHub quebrados |

**Veredicto:** Ferramenta promissora mas extremamente imatura para ser dependencia de framework.

---

## 2. Alternativas MCP Descobertas

### 2.1 Code Graph MCP (entrepeneur4lyf/code-graph-mcp)

| Atributo | Valor |
|----------|-------|
| **Linguagens** | 25+ (JS, TS, Python, Java, C#, C++, Rust, Go, etc.) |
| **Tools** | 9: analyze_codebase, find_definition, find_references, find_callers, find_callees, complexity_analysis, dependency_analysis, project_statistics |
| **Performance** | 50-90% speed improvements via LRU caching, otimizado para 500+ files |
| **Backend** | ast-grep (tree-sitter based) |
| **Pricing** | Open source, gratis |
| **Maturidade** | v1.2.0 com tool guidance (PURPOSE, USAGE, PERFORMANCE, WORKFLOW, TIP) |

**Cobertura dos 5 Gaps:**
- IDS/duplicacao: find_references + dependency_analysis
- Brownfield: analyze_codebase + project_statistics
- PRD/Stories: dependency_analysis + find_callers/callees
- QA blast radius: find_references + complexity_analysis
- Entity Registry: find_references + find_callers

### 2.2 Sourcegraph MCP (Official)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Enterprise code intelligence platform |
| **Capabilities** | Symbol definition/reference finding (compiler-level precise), semantic NLS search, keyword search (boolean), commit/diff search, contributor tracking |
| **Protocolo** | SCIP (4x smaller than LSIF, 10x CI speedup) |
| **Linguagens** | 8 familias: Go, TS/JS, C/C++, Java/Kotlin/Scala, Rust, Python, Ruby, C#/VB |
| **Precisao** | Compiler-level accurate (vs heuristic) |
| **Pricing** | Enterprise (pago) |
| **MCP** | Official + community implementations |

**Cobertura:** Excelente para todos os 5 gaps, mas overkill e caro para AIOS.

### 2.3 AST MCP Server (angrysky56/ast-mcp-server)

| Atributo | Valor |
|----------|-------|
| **Tipo** | AST/ASG code analysis |
| **Capabilities** | AST parsing, code structure analysis, complexity metrics, AST diffing |
| **Linguagens** | Python, JavaScript |
| **Pricing** | Open source |
| **Limitacao** | Apenas 2 linguagens, sem dependency graph cross-file |

### 2.4 Dependency MCP (mkearl/dependency-mcp)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Dependency analysis |
| **Capabilities** | Dependency graph (JSON + DOT format), architectural insights |
| **Pricing** | Open source |
| **Limitacao** | Escopo estreito (so dependencias, sem symbols/references) |

### 2.5 Tree-sitter MCP

| Atributo | Valor |
|----------|-------|
| **Tipo** | Structure-aware code exploration |
| **Capabilities** | Multi-language AST parsing, structure navigation |
| **Pricing** | Open source |
| **Base** | tree-sitter (battle-tested) |

---

## 3. Ferramentas Complementares (Nao-MCP)

### 3.1 Semgrep

| Atributo | Valor |
|----------|-------|
| **Tipo** | Code analysis + security scanning |
| **MCP** | SIM — integra via MCP com Cursor, Copilot e Gemini CLI |
| **Linguagens** | 10 (JS, TS, Python, Java, Go, Ruby, PHP, C#, Scala, Swift) |
| **Capabilities** | Dataflow analysis cross-file, dependency graph visualization, supply chain analysis |
| **Pro Engine** | 98% false positive reduction via dataflow analysis |
| **Pricing** | Community (gratis) + Pro (pago) |

### 3.2 CodeQL (GitHub)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Semantic code analysis |
| **Capabilities** | Full AST + data flow + control flow graphs, variant analysis, multi-repo analysis |
| **Linguagens** | Compiled + interpreted (ampla cobertura) |
| **Integracao** | CLI, VS Code, GitHub Code Scanning |
| **Pricing** | Gratis para open source, Enterprise para privado |

### 3.3 SCIP (Sourcegraph Code Intelligence Protocol)

| Atributo | Valor |
|----------|-------|
| **Tipo** | Protocolo de indexacao (nao ferramenta) |
| **Performance** | 4x menor que LSIF (gzip), 10x mais rapido no CI |
| **Meta adoptou** | 8x reducao de tamanho, 3x mais rapido |
| **Uso** | Indexar codebase → gerar SCIP index → consumir via API |

### 3.4 tree-sitter-graph

| Atributo | Valor |
|----------|-------|
| **Tipo** | Biblioteca Rust para construir grafos de AST |
| **Capabilities** | DSL para definir regras de construcao de grafos a partir de ASTs |
| **Uso** | Base para ferramentas custom de code intelligence |

---

## 4. Matriz de Cobertura: Gap vs Ferramenta

| Gap do AIOS | Nogic | Code Graph MCP | Sourcegraph MCP | Semgrep | CodeQL | tree-sitter |
|-------------|-------|---------------|-----------------|---------|--------|-------------|
| **IDS (duplicacao)** | find_similar, before_writing | find_references | semantic search | pattern matching | variant analysis | AST compare |
| **Brownfield (graph)** | describe_project, list_files | analyze_codebase, dependency_analysis | full graph | dependency viz | data flow graph | tree-sitter-graph |
| **PRD/Stories (relacoes)** | get_file_dependencies | find_callers, find_callees | reference finding | cross-file traces | control flow | custom rules |
| **QA (blast radius)** | assess_impact | complexity_analysis, find_references | commit/diff search | dataflow analysis | taint tracking | — |
| **Entity Registry (usedBy)** | get_references | find_references, find_callers | precise references | — | — | custom |

| Criteria | Nogic | Code Graph MCP | Sourcegraph | Semgrep | CodeQL |
|----------|-------|---------------|-------------|---------|--------|
| **Linguagens** | 3 | 25+ | 8 familias | 10 | Amplo |
| **Maturidade** | v0.1.0 | v1.2.0 | Enterprise | Estavel | Estavel |
| **Open Source** | Nao (planned) | Sim | Parcial | Community | Parcial |
| **Custo** | Gratis (agora) | Gratis | Enterprise $$ | Community gratis | Gratis (OSS) |
| **MCP Nativo** | Sim (incompleto) | Sim | Sim | Sim | Nao |
| **Performance** | Lenta (2-3 FPS) | Otimizado (LRU cache) | Enterprise-grade | Rapida | Rapida |
| **Fallback risk** | Alto (v0.0.x) | Baixo (estavel) | Baixo | Baixo | Baixo |

---

## 5. Sources

### HIGH Credibility
1. [Nogic Official Website](https://www.nogic.dev/)
2. [Nogic VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Nogic.nogic)
3. [Sourcegraph MCP Server Docs](https://sourcegraph.com/docs/api/mcp)
4. [Code Graph MCP - GitHub](https://github.com/entrepeneur4lyf/code-graph-mcp)
5. [SCIP Protocol - Sourcegraph](https://sourcegraph.com/blog/announcing-scip)
6. [tree-sitter-graph - GitHub](https://github.com/tree-sitter/tree-sitter-graph)
7. [LSP Official Docs](https://microsoft.github.io/language-server-protocol/)
8. [CodeQL Docs](https://codeql.github.com/docs/codeql-overview/about-codeql/)
9. [Semgrep AI Agent Trends](https://semgrep.dev/blog/2025/what-a-hackathon-reveals-about-ai-agent-trends-to-expect-2026/)
10. [IBM tree-sitter-codeviews](https://github.com/IBM/tree-sitter-codeviews)

### MEDIUM Credibility
11. [Nogic - Hacker News](https://news.ycombinator.com/item?id=46605675)
12. [Best MCP Servers 2026 - Builder.io](https://www.builder.io/blog/best-mcp-servers-2026)
13. [CodeRAG with tree-sitter - Medium](https://medium.com/@shsax/how-i-built-coderag-with-dependency-graph-using-tree-sitter-0a71867059ae)
14. [Addy Osmani - LLM Coding Workflow](https://addyosmani.com/blog/ai-coding-workflow/)
