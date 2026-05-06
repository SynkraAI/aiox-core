# Configure MCP Servers

**Task:** `configure-mcp-servers`
**Agent:** @deploy-pilot
**Type:** Delivery (Setup)
**Priority:** 2

---

## Description

Configurar MCP servers necessarios para o squad: Playwright MCP (visual QA) e Netlify MCP (deploy). Testar conexao e funcionalidade.

---

## Input

```yaml
mcp_list:
  - name: playwright
    purpose: 'Visual QA - screenshots, browser automation'
  - name: netlify
    purpose: 'Automated deploy, site management'
api_keys:
  netlify_token: 'token (via DevOps @devops *add-mcp)'
```

---

## Process

### 1. Verificar Playwright MCP

- Ja instalado direto no Claude Code (global)
- Testar: screenshot de URL de teste
- Verificar: navigate, click, screenshot, evaluate

### 2. Verificar Netlify MCP

- Verificar se esta configurado (via Docker ou direto)
- Se nao: delegar para @devops (\*add-mcp netlify)
- Testar: list sites, deploy preview

### 3. Testar Conexao

- Playwright: screenshot de example.com
- Netlify: list sites do account

### 4. Documentar

---

## Output

```
Entregaveis:
1. mcp-config.md - Configuracao documentada
2. connection-test-results.md - Resultados dos testes
```

---

**Created:** 2026-02-10
**Version:** 1.0
