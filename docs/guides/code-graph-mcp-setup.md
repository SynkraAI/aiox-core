# Code Graph MCP — Setup Guide

Setup guide para instalacao, configuracao e validacao do Code Graph MCP como provider de code intelligence no AIOX.

---

## Pre-requisitos

| Requisito | Versao Minima | Verificar |
|-----------|---------------|-----------|
| Python | 3.12+ | `python --version` |
| pip | 24+ | `pip --version` |
| Node.js | 18+ | `node --version` |
| Claude Code | latest | `claude --version` |

---

## 1. Instalacao

### 1.1 Instalar Package e Dependencias

```bash
pip install code-graph-mcp ast-grep-py rustworkx
```

**Packages instalados:**
- `code-graph-mcp` (v1.2.4+) — MCP server principal
- `ast-grep-py` — AST parsing engine (tree-sitter based)
- `rustworkx` — Graph analysis library

### 1.2 Verificar Instalacao

```bash
code-graph-mcp --help
```

Output esperado:
```
Usage: code-graph-mcp [OPTIONS]

  Code Graph Intelligence MCP Server.

Options:
  --project-root TEXT  Root directory of the project to analyze
  -v, --verbose        Enable verbose logging
  --help               Show this message and exit.
```

---

## 2. Configuracao como MCP Server

### 2.1 Adicionar ao Projeto (Recomendado)

Editar `.mcp.json` na raiz do projeto:

```json
{
  "mcpServers": {
    "code-graph": {
      "command": "code-graph-mcp",
      "args": ["--project-root", "C:\\Users\\<USER>\\path\\to\\project"]
    }
  }
}
```

Ou via CLI (fora de uma sessao Claude Code ativa):

```bash
claude mcp add code-graph -s project -- code-graph-mcp --project-root /path/to/project
```

### 2.2 Verificacao Pos-Configuracao

1. Reiniciar Claude Code para carregar o novo MCP
2. Verificar que as tools estao disponiveis na sessao

**9 tools esperadas:**
| Tool | Descricao |
|------|-----------|
| `get_usage_guide` | Guia de uso e workflows |
| `analyze_codebase` | Analise completa da estrutura |
| `find_definition` | Localizar definicoes de symbols |
| `find_references` | Rastrear usos de symbols |
| `find_callers` | Funcoes que chamam um alvo |
| `find_callees` | Funcoes chamadas por um alvo |
| `complexity_analysis` | Analise de complexidade |
| `dependency_analysis` | Grafos de dependencia |
| `project_statistics` | Metricas e estatisticas |

---

## 3. Health Check

Execute o health check script para validar que tudo esta funcionando:

```bash
node scripts/code-intel-health-check.js
```

Output esperado (provider ativo):
```json
{
  "status": "available",
  "provider": "code-graph-mcp",
  "tools": [
    { "name": "find_definition", "available": true },
    { "name": "find_references", "available": true },
    ...
  ],
  "responseTimeMs": 1234,
  "errors": []
}
```

---

## 4. Troubleshooting

### Cenario 1: `code-graph-mcp: command not found`

**Causa:** Package nao instalado ou nao esta no PATH.

**Solucao:**
```bash
# Verificar instalacao
pip show code-graph-mcp

# Se nao instalado
pip install code-graph-mcp ast-grep-py rustworkx

# Verificar PATH (Windows)
python -c "import shutil; print(shutil.which('code-graph-mcp'))"
```

### Cenario 2: MCP server nao aparece no Claude Code

**Causa:** `.mcp.json` com sintaxe incorreta ou Claude Code nao reiniciado.

**Solucao:**
1. Validar JSON: `python -m json.tool .mcp.json`
2. Reiniciar Claude Code completamente
3. Verificar que o path no `--project-root` existe

### Cenario 3: Timeout ao executar tools

**Causa:** Codebase muito grande, primeira execucao faz indexacao.

**Solucao:**
1. Primeira execucao pode levar 10-30s em codebases grandes
2. Execucoes subsequentes usam cache LRU
3. Se persistir, use `--verbose` para diagnostico:
   ```bash
   code-graph-mcp --project-root /path/to/project --verbose
   ```

### Cenario 4: Tool especifica retorna erro

**Causa:** Symbol nao encontrado ou linguagem nao suportada.

**Solucao:**
1. Verificar que o arquivo alvo usa linguagem suportada (25+ linguagens)
2. Verificar nome exato do symbol (case-sensitive)
3. Executar `analyze_codebase` primeiro para confirmar que o provider reconhece o projeto

### Cenario 5: Conflito de dependencias (httpx)

**Causa:** `code-graph-mcp` requer httpx >= 0.27.1 que pode conflitar com supabase.

**Solucao:**
- Conflito nao afeta funcionalidade do Code Graph MCP
- Se necessario, use virtualenv isolado:
  ```bash
  python -m venv .venv-codegraph
  .venv-codegraph\Scripts\activate
  pip install code-graph-mcp ast-grep-py rustworkx
  ```
- Atualizar `.mcp.json` com path completo do executavel no venv

---

## Referencia

- **Repository:** [entrepeneur4lyf/code-graph-mcp](https://github.com/entrepeneur4lyf/code-graph-mcp)
- **PyPI:** [code-graph-mcp](https://pypi.org/project/code-graph-mcp/)
- **Versao instalada:** 1.2.4
- **Linguagens suportadas:** 25+ (JavaScript, TypeScript, Python, Rust, Go, Java, C, C++, etc.)
- **Research:** `docs/research/2026-02-15-code-intelligence-alternatives/03-recommendations.md`

---

*NOG-0 — Code Graph MCP Setup Guide v1.0*
*@devops (Gage) — 2026-02-15*
