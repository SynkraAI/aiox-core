---
name: telegram
description: "Manage the Telegram remote agent — auto-detect config, start/stop/restart, status, logs, test, and ping-pong review integration."

version: 2.0.0
category: development
tags: [SKILL, telegram, remote-agent, ping-pong]
user-invocable: true
maxTurns: 20
---

# Telegram Gateway v2

Manage the Telegram remote agent (claude-remote-manager). Smart auto-detection: finds existing config, validates tokens, and acts without asking unnecessary questions.

## Usage

```bash
/telegram              # Smart status + auto-fix if needed
/telegram start        # Enable the agent (auto-detects config)
/telegram stop         # Disable the agent
/telegram restart      # Restart the agent
/telegram logs         # Tail recent logs
/telegram test         # Send a test message via the bot
/telegram setup        # Interactive setup (only if NOT configured)
/telegram ping-pong    # Start a code review ping-pong with the remote agent
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `<action>` | string | `status` | One of: `status`, `start`, `stop`, `restart`, `logs`, `test`, `setup`, `ping-pong` |

## Auto-Detection (CRITICAL — runs before every action)

Before ANY action, detect the environment automatically. NEVER ask the user for paths or tokens if they already exist.

### Step 0: Discover

```yaml
discovery:
  state_path: ~/.claude-remote/default
  
  steps:
    - Resolve CRM_HOME (first match wins):
        1. $CRM_HOME env var (if set)
        2. ~/CODE/tools/claude-remote-manager
        3. ~/claude-remote-manager
        4. None found → error with install instructions
    - Find configured agents: ls $CRM_HOME/agents/ (exclude agent-template)
    - For each agent, check .env for BOT_TOKEN + CHAT_ID
    - Check enabled-agents.json: ~/.claude-remote/default/config/enabled-agents.json
    - Pick the primary agent: first agent with enabled: true, or first with valid .env
    - Store: CRM_HOME, AGENT_NAME, BOT_TOKEN, CHAT_ID, ALLOWED_USER
```

#### Path Resolution (bash)
```bash
CRM_HOME="${CRM_HOME:-}"
for candidate in ~/CODE/tools/claude-remote-manager ~/claude-remote-manager; do
  [ -z "$CRM_HOME" ] && [ -d "$candidate" ] && CRM_HOME="$candidate"
done
[ -z "$CRM_HOME" ] && echo "ERROR: claude-remote-manager not found" && exit 1
```

All subsequent commands use `$CRM_HOME` instead of a hardcoded path.

### Agent Resolution Priority

1. Agent with `enabled: true` in enabled-agents.json
2. Agent with valid `.env` (has BOT_TOKEN + CHAT_ID)
3. If multiple: prefer `claudecode_fosc` > `aiox-master` > first alphabetically
4. If none found: guide to `/telegram setup`

## Execution Protocol

### Action: status (default)

```yaml
steps:
  - Run discovery (Step 0)
  - If no agent found: report NOT_SETUP, suggest /telegram setup
  - Check jq available: command -v jq
    - If missing: report "jq nao instalado. Instale com: brew install jq" and skip token validation
  - Validate bot token: curl -s https://api.telegram.org/bot$BOT_TOKEN/getMe
    - If curl fails (exit code != 0): report "Falha de rede ao validar token. Verifique sua conexao."
    - If jq available: parse with jq .ok
    - If .ok == false: report "Token invalido. Atualize via /telegram setup"
  - Check tmux: tmux has-session -t crm-default-$AGENT_NAME 2>/dev/null
  - Check fast-checker: ps aux | grep fast-checker | grep $AGENT_NAME | grep -v grep
  - Check launchd: launchctl list | grep claude-remote
  - Check tmux content: tmux capture-pane -t crm-default-$AGENT_NAME -p | tail -5
    - If session shows bash prompt (no Claude running): status = DEAD_SESSION
  - Report status table with emoji indicators

  auto_fix:
    - If DEAD_SESSION (tmux exists but Claude died inside):
      - Auto-restart: cd $CRM_HOME && bash enable-agent.sh $AGENT_NAME --restart
      - Report: "Sessao morta detectada. Reiniciando automaticamente..."
    - If tmux missing but config valid:
      - Auto-start: cd $CRM_HOME && bash enable-agent.sh $AGENT_NAME
      - Report: "Agent parado. Iniciando automaticamente..."
    - If fast-checker missing but tmux running:
      - Auto-restart: cd $CRM_HOME && bash enable-agent.sh $AGENT_NAME --restart
      - Report: "fast-checker ausente. Reiniciando automaticamente..."
```

### Action: start

```yaml
steps:
  - Run discovery (Step 0)
  - If no agent found: error, suggest /telegram setup
  - Run: cd $CRM_HOME && bash enable-agent.sh $AGENT_NAME
  - If "already enabled": run with --restart
  - Verify: tmux has-session + ps aux fast-checker
  - Report status
```

### Action: stop

```yaml
steps:
  - Run discovery (Step 0)
  - Run: cd $CRM_HOME && bash disable-agent.sh $AGENT_NAME
  - Verify stopped
  - Report
```

### Action: restart

```yaml
steps:
  - Run discovery (Step 0)
  - Run: cd $CRM_HOME && bash enable-agent.sh $AGENT_NAME --restart
  - Wait 3 seconds
  - Verify: tmux + fast-checker + capture-pane
  - Report
```

### Action: logs

```yaml
steps:
  - Run discovery (Step 0)
  - Check log dir exists: test -d ~/.claude-remote/default/logs/$AGENT_NAME
    - If missing: report "Sem logs ainda — o agent precisa rodar pelo menos uma vez."
    - If exists:
      - Tail: tail -50 ~/.claude-remote/default/logs/$AGENT_NAME/activity.log
      - If crash log exists: tail -20 ~/.claude-remote/default/logs/$AGENT_NAME/crashes.log
  - Check tmux available: command -v tmux
    - If missing: report "tmux nao instalado. Instale com: brew install tmux"
    - If available: tmux capture-pane -t crm-default-$AGENT_NAME -p | tail -30
      - If session not found: report "Nenhuma sessao tmux ativa para $AGENT_NAME."
```

### Action: test

```yaml
steps:
  - Run discovery (Step 0)
  - Check jq available: command -v jq
    - If missing: report "jq nao instalado. Instale com: brew install jq"
  - Validate token: curl -s https://api.telegram.org/bot$BOT_TOKEN/getMe
    - If curl fails (exit code != 0): report "Falha de rede. Verifique sua conexao."
    - If .ok == false: report "Token invalido. Crie novo bot no @BotFather e atualize .env"
  - Send test: CRM_TEMPLATE_ROOT=$CRM_HOME CRM_AGENT_NAME=$AGENT_NAME bash $CRM_HOME/core/bus/send-telegram.sh $CHAT_ID "Teste do /telegram skill — $(date '+%H:%M:%S')"
    - If send fails (exit code != 0): report "Envio falhou (exit $?). Tente /telegram restart ou /telegram setup"
  - Report success/failure
```

### Action: setup

```yaml
steps:
  - Run discovery (Step 0)
  - If agent already configured with valid token:
    - Show: "Agent ja configurado: @{bot_username}. Usar /telegram restart para reiniciar."
    - Do NOT re-run setup
  - If no valid config:
    - Instruct user: ! cd $CRM_HOME && ./setup.sh
    - This is interactive — CANNOT be automated
```

### Action: ping-pong

```yaml
description: >
  Start a code review ping-pong where the remote Telegram agent acts as REVIEWER
  and the local Claude Code session acts as FIXER. Communication happens via
  the agent-to-agent inbox system.

steps:
  - Run discovery (Step 0)
  - Verify agent is running (tmux + fast-checker alive)
  - If not running: auto-start first
  
  - Detect scope (same rules as code-review-ping-pong SKILL):
    1. Check docs/stories/active/ for active story
    2. Check scoped sessions: .code-review-ping-pong/scopes/*/session.md
    3. Check root session: .code-review-ping-pong/session.md
    4. Ask user only if none exist
  
  - Derive scope_dir from the resolved session location:
    - If scoped session found: scope_dir = .code-review-ping-pong/scopes/{scope-name}/
    - If root session found: scope_dir = .code-review-ping-pong/
    - Store scope_name for use in message composition and round file paths
  
  - Detect current round in scope_dir:
    - List round-*.md in scope_dir, excluding *-fixed.md and *-audit.md
    - Pick the highest round number found
    - Store NEXT_ROUND = highest + 1 (or 1 if none exist)
  
  - Compose review request message for the remote agent:
    ```
    Quero que voce faca um code review do projeto em {cwd}.
    
    Escopo: {scope_description}
    Arquivos: {file_list}
    Branch: {branch}
    Commit: {short_sha}
    
    Leia os arquivos, analise o codigo, e escreva suas findings em:
    {scope_dir}/round-{NEXT_ROUND}.md
    
    Use o template de review: score 1-10, issues categorizadas, verdict.
    Se score < 10: verdict CONTINUE. Se score = 10: verdict PERFECT.
    
    Apos escrever o round file, me avise no Telegram com o resumo.
    ```
  
  - Resolve local sender identity:
    - Check enabled-agents.json for a local sender agent
    - Fallback: use $AGENT_NAME as both sender and recipient context
    - Store as LOCAL_SENDER (default: $AGENT_NAME)
  
  - Send via agent-to-agent bus:
    CRM_TEMPLATE_ROOT=$CRM_HOME \
    CRM_AGENT_NAME="${LOCAL_SENDER:-$AGENT_NAME}" \
    bash $CRM_HOME/core/bus/send-message.sh "$AGENT_NAME" high "$message"
  
  - Also notify on Telegram:
    CRM_TEMPLATE_ROOT=$CRM_HOME \
    CRM_AGENT_NAME="${LOCAL_SENDER:-$AGENT_NAME}" \
    bash $CRM_HOME/core/bus/send-telegram.sh "$CHAT_ID" "Ping-pong review iniciado. Cheque seu inbox."
  
  - Report to user:
    "Review request enviado para @{bot_username}. O agente remoto vai analisar e escrever round-{NEXT_ROUND}.md.
     Quando ele terminar, voce recebe notificacao no Telegram.
     Depois, rode /code-review-ping-pong em modo FIX para corrigir."
```

## Error Handling

| Error | Auto-Fix |
|-------|----------|
| Repo not found | "Clone: git clone https://github.com/grandamenium/claude-remote-manager ~/CODE/tools/claude-remote-manager" |
| No .env found | Guide to /telegram setup |
| Token invalid (getMe fails) | "Token expirado. Crie novo bot no @BotFather e atualize $CRM_HOME/agents/{name}/.env" |
| tmux exists but Claude dead | Auto-restart with --restart flag |
| fast-checker not running | Auto-restart |
| Agent already enabled | Use --restart flag automatically |

## Prerequisites

- `claude-remote-manager` cloned (auto-detected in `~/CODE/tools/` or `~/`) and `install.sh` executed
- At least one agent configured with `.env` (BOT_TOKEN + CHAT_ID)
- `tmux`, `jq`, `curl` installed
- macOS (uses launchd for persistence)

---

*Skill: telegram v2.0 — Smart auto-detection, zero unnecessary questions*
*Backend: $CRM_HOME (grandamenium/claude-remote-manager)*
