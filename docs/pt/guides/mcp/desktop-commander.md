# Desktop Commander MCP

> **PT**

---

Guia para usar o servidor MCP Desktop Commander com Claude Code para capacidades avançadas de gerenciamento de terminal e processos.

**Versão:** 1.0.0
**Última Atualização:** 2026-01-28

---

## Visão Geral

Desktop Commander é um servidor MCP que estende o Claude Code com capacidades avançadas para gerenciamento de ambiente local. Ele fornece recursos que as ferramentas nativas do Claude Code não podem fazer, tornando-o essencial para certos fluxos de trabalho.

### Quando Usar Desktop Commander

| Caso de Uso                         | Claude Code Nativo | Desktop Commander |
| ----------------------------------- | ------------------ | ----------------- |
| Sessões persistentes (SSH, REPL)    | Não suportado      | **Recomendado**   |
| Processos interativos               | Limitado           | **Recomendado**   |
| Edição difusa de arquivos           | Não suportado      | **Recomendado**   |
| Leitura de final de arquivo (offset negativo) | Não suportado | **Recomendado** |
| Execução de código em memória       | Não suportado      | **Recomendado**   |
| Operações simples de arquivo        | **Preferível**     | Mais lento        |
| Operações Git                       | **Preferível**     | Desnecessário     |
| Busca de arquivos (Glob, Grep)      | **Preferível**     | Desnecessário     |

---

## Comparação de Capacidades

### O Que Desktop Commander Faz Que Claude Code Não Pode

| Capacidade                   | Claude Code Nativo                                           | Desktop Commander                                      |
| ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| **Sessões Persistentes**     | Estado do shell não persiste entre chamadas (apenas diretório de trabalho) | Mantém sessões ativas (SSH, databases, REPL)          |
| **Execução de Código em Memória** | Requer Write → Bash                                    | Execução direta em REPL (Python, Node.js, R)           |
| **Edição Difusa**            | Edit requer correspondência EXATA de old_string              | Fallback inteligente com busca difusa                  |
| **Offset Negativo (tail)**   | Read tem apenas offset positivo                              | Leitura do final do arquivo (como Unix tail)           |
| **Processos Interativos**    | Limitado (background sem stdin)                              | stdin/stdout bidirecional                              |
| **Configuração Dinâmica**    | Requer reinicialização                                       | Muda shell, diretórios, comandos bloqueados dinamicamente |
| **Trilha de Auditoria**      | Básica em .claude.json                                       | Histórico completo de ferramentas e estatísticas de uso |

### Onde Claude Code Nativo é Suficiente

| Capacidade                   | Claude Code Nativo                 | Notas                             |
| ---------------------------- | ---------------------------------- | --------------------------------- |
| **Busca Paginada**           | Grep tem `head_limit` e `offset`   | Já possui capacidade de streaming |
| **Gerenciamento Multi-Sessão** | Task tool + TaskOutput + /tasks | Abordagem diferente mas funcional |
| **Análise CSV/JSON**         | Read + Bash com jq/python          | Funciona bem para a maioria dos casos |

---

## Instalação

### Pré-requisitos

- Node.js 18+
- Claude Code CLI instalado
- Suporte MCP habilitado

### Configuração

```bash
# Instalar desktop-commander globalmente
npm install -g @anthropic/desktop-commander

# Ou adicionar à configuração MCP do Claude Code
claude mcp add desktop-commander
```

### Configuração

Adicionar a `~/.claude.json`:

```json
{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@anthropic/desktop-commander"]
    }
  }
}
```

---

## Ferramentas Disponíveis

### Gerenciamento de Terminal

| Ferramenta        | Descrição                                     |
| ----------------- | --------------------------------------------- |
| `execute_command` | Executar comando shell com sessão persistente |
| `read_output`     | Ler saída de processo em execução             |
| `send_input`      | Enviar entrada para processo interativo       |
| `force_terminate` | Finalizar um processo em execução             |
| `list_sessions`   | Listar todas as sessões ativas                |
| `list_processes`  | Listar processos em execução                  |

### Operações de Arquivo

| Ferramenta       | Descrição                                              |
| ---------------- | ------------------------------------------------------ |
| `read_file`      | Ler arquivo com suporte a offset negativo (tail)       |
| `write_file`     | Escrever conteúdo de arquivo                           |
| `edit_block`     | Editar com fallback de correspondência difusa          |
| `search_files`   | Buscar com streaming/paginação                         |
| `get_file_info`  | Obter metadados de arquivo                             |
| `list_directory` | Listar conteúdo de diretório                           |

### Execução de Código

| Ferramenta     | Descrição                                       |
| -------------- | ----------------------------------------------- |
| `execute_code` | Executar código em memória (Python, Node.js, R) |
| `create_repl`  | Criar sessão REPL persistente                   |
| `repl_execute` | Executar em REPL existente                      |

### Configuração

| Ferramenta         | Descrição                            |
| ------------------ | ------------------------------------ |
| `get_config`       | Obter configuração atual             |
| `set_config_value` | Atualizar configuração dinamicamente |

---

## Exemplos de Uso

### Sessão SSH Persistente

```
# Criar sessão SSH
execute_command: ssh user@server.com

# Enviar comandos para a sessão
send_input: ls -la
read_output: [session_id]

# Manter sessão ativa para múltiplas interações
send_input: cd /var/log
send_input: tail -f syslog
```

### Análise Python em Memória

```
# Executar Python sem criar arquivos
execute_code:
  language: python
  code: |
    import pandas as pd
    df = pd.read_csv('/path/to/data.csv')
    print(df.describe())
    print(df.head(10))
```

### Edição Difusa de Arquivo

```
# Editar com correspondência aproximada (quando correspondência exata falha)
edit_block:
  file_path: /path/to/file.py
  old_text: "def process_data(data)"  # Correspondência aproximada
  new_text: "def process_data(data: dict) -> dict"
  fuzzy: true
```

### Leitura de Final de Arquivo

```
# Ler últimas 100 linhas de um arquivo de log grande
read_file:
  path: /var/log/application.log
  offset: -100  # Negativo = do final
  lines: 100
```

### REPL Interativo

```
# Criar REPL Node.js
create_repl:
  language: nodejs

# Executar em REPL (mantém estado)
repl_execute: const data = require('./config.json')
repl_execute: Object.keys(data).length
repl_execute: data.settings.enabled
```

---

## Melhores Práticas

### 1. Use Ferramentas Nativas Quando Possível

Desktop Commander adiciona latência. Prefira ferramentas nativas para:

```
# Bom - Use Read nativo
Read tool para leitura simples de arquivo

# Bom - Use Bash nativo
Bash tool para comandos rápidos

# Bom - Use Grep nativo
Grep tool para busca de arquivos
```

### 2. Use Desktop Commander Para

```
# Sessões persistentes
- Conexões SSH
- Conexões de banco de dados (psql, mysql, mongo shell)
- Sessões REPL (python, node, irb)

# Processos interativos
- Comandos de longa duração com monitoramento de saída
- Processos que requerem entrada stdin

# Operações avançadas de arquivo
- Arquivos grandes necessitando tail (offset negativo)
- Edições com correspondências inexatas (difusas)
```

### 3. Gerenciamento de Sessões

```
# Sempre liste sessões antes de criar novas
list_sessions

# Limpe sessões não utilizadas
force_terminate: [old_session_id]

# Nomeie sessões para clareza
execute_command:
  command: ssh prod-server
  session_name: prod-ssh
```

### 4. Tratamento de Erros

```
# Verifique status do processo antes de enviar entrada
list_processes

# Use timeouts para operações longas
execute_command:
  command: long-running-task
  timeout: 300000  # 5 minutos
```

---

## Integração com AIOX

### Prioridade de Seleção de Ferramentas

Conforme `.claude/rules/mcp-usage.md`:

| Tarefa             | USE ISTO               | NÃO desktop-commander            |
| ------------------ | ---------------------- | -------------------------------- |
| Ler arquivos locais | `Read` tool           | Mais lento                       |
| Escrever arquivos locais | `Write` / `Edit` tools | Mais lento                 |
| Executar comandos shell | `Bash` tool        | A menos que sessão persistente seja necessária |
| Buscar arquivos    | `Glob` tool            | Mais lento                       |
| Buscar conteúdo    | `Grep` tool            | Mais lento                       |

### Quando Desktop Commander é Necessário

1. Usuário solicita explicitamente sessão persistente
2. Tarefa requer execução em REPL
3. Necessita ler final de arquivos grandes
4. Edição requer correspondência difusa
5. Processo interativo com stdin/stdout

### Responsabilidades dos Agentes

| Agente             | Caso de Uso Desktop Commander                 |
| ------------------ | --------------------------------------------- |
| **@dev**           | Sessões REPL, debugging, codificação ao vivo  |
| **@devops**        | Sessões SSH, gerenciamento de servidor, análise de logs |
| **@data-engineer** | REPL de análise de dados, conexões de banco de dados |
| **@qa**            | Testes interativos, monitoramento de processos |

---

## Solução de Problemas

### Sessão Não Persiste

```bash
# Verificar se desktop-commander está rodando
claude mcp status

# Reiniciar servidor MCP
claude mcp restart desktop-commander
```

### Edição Difusa Não Funciona

```
# Garantir que flag fuzzy está configurada
edit_block:
  fuzzy: true
  threshold: 0.8  # Ajustar threshold de similaridade
```

### Timeout de Processo

```
# Aumentar timeout para operações longas
execute_command:
  timeout: 600000  # 10 minutos

# Ou usar modo background
execute_command:
  background: true
```

### Não Consegue Conectar ao Servidor

```bash
# Verificar configuração MCP
cat ~/.claude.json | grep -A 10 desktop-commander

# Verificar pacote npm
npm list -g @anthropic/desktop-commander

# Reinstalar se necessário
npm install -g @anthropic/desktop-commander@latest
```

---

## Documentação Relacionada

- [Tutorial Docker Gateway](./docker-gateway-tutorial.md)
- [Guia de Configuração Global MCP](../mcp-global-setup.md)
- [Configuração Docker MCP](../../docker-mcp-setup.md)
- [Regras de Uso MCP](../../../.claude/rules/mcp-usage.md)
- [Guia de Integração de Ferramentas de Agente](../../architecture/agent-tool-integration-guide.md)

---

## Resumo

| Recurso               | Claude Code Nativo | Desktop Commander     |
| --------------------- | ------------------ | --------------------- |
| Velocidade            | Rápido             | Mais lento (overhead MCP) |
| Sessões Persistentes  | Não                | Sim                   |
| Execução em Memória   | Não                | Sim                   |
| Edição Difusa         | Não                | Sim                   |
| Offset Negativo       | Não                | Sim                   |
| Processos Interativos | Limitado           | Completo              |

**Regra Geral:** Use ferramentas nativas por padrão. Mude para Desktop Commander apenas quando você precisar de suas capacidades únicas.

---

_Guia Desktop Commander MCP v1.0.0 - AIOX Framework_
