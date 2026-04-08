---
name: SKILL

description: "Manage the Telegram channel of the AIOX Message Gateway — setup, deploy, enable, disable, restart, status, and logs"
user-invocable: true
maxTurns: 15

version: 1.0.0
category: development
tags: [SKILL]
---

# Telegram Gateway

Manage the Telegram integration for the AIOX Message Gateway. Runs the full lifecycle: setup, deploy, enable/disable, status check, and log inspection.

## Usage

```bash
/telegram              # Show status (is it running?)
/telegram setup        # Interactive channel setup (needs BotFather token)
/telegram deploy       # Generate/update the agent runtime
/telegram start        # Enable the agent (launchd)
/telegram stop         # Disable the agent
/telegram restart      # Restart the agent
/telegram logs         # Tail recent logs
/telegram test         # Send a test message via the bot
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `<action>` | string | `status` | One of: `setup`, `deploy`, `start`, `stop`, `restart`, `logs`, `test`, `status` |

## Paths

All scripts live under `infrastructure/message-gateway/`:

| Script | Purpose |
|--------|---------|
| `setup-channel.sh` | Interactive Telegram token + chat ID onboarding |
| `deploy-agent.sh` | Generate agent in `.aiox/message-gateway/agents/` |
| `enable-agent.sh` | Start agent via launchd |
| `disable-agent.sh` | Stop agent |
| `core/bus/send-telegram.sh` | Send a message to a chat |
| `core/bus/check-telegram.sh` | Poll for new messages |
| `core/scripts/fast-checker.sh` | Daemon that polls every 3s |

## Execution Protocol

Read `$ARGUMENTS` to determine the action. Default to `status` if empty.

### Action: status

```yaml
steps:
  - Check if agent dir exists: .aiox/message-gateway/agents/aiox-master/
  - Check launchd: launchctl list | grep claude-remote
  - Check tmux session: tmux has-session -t crm-default-aiox-master 2>/dev/null
  - Check .env for BOT_TOKEN: ~/.claude-remote/default/config/aiox-master/.env
  - Report: CONFIGURED / RUNNING / STOPPED / NOT_SETUP
```

### Action: setup

```yaml
steps:
  - Run interactively: bash infrastructure/message-gateway/setup-channel.sh
  - This is interactive — user will select [1] Telegram and paste their token
  - After completion, report success
```

**IMPORTANT:** `setup-channel.sh` is interactive (reads from stdin). Run it directly so the user can interact.

### Action: deploy

```yaml
steps:
  - Run: bash infrastructure/message-gateway/deploy-agent.sh
  - Report generated files
```

### Action: start

```yaml
steps:
  - Run: bash infrastructure/message-gateway/enable-agent.sh aiox-master
  - Verify with: tmux has-session -t crm-default-aiox-master 2>/dev/null && echo RUNNING
  - Report status
```

### Action: stop

```yaml
steps:
  - Run: bash infrastructure/message-gateway/disable-agent.sh aiox-master
  - Verify stopped
```

### Action: restart

```yaml
steps:
  - Run: bash infrastructure/message-gateway/enable-agent.sh aiox-master --restart
  - Report status
```

### Action: logs

```yaml
steps:
  - Tail last 50 lines: tail -50 ~/.claude-remote/default/logs/aiox-master/activity.log
  - If crash log exists: tail -20 ~/.claude-remote/default/logs/aiox-master/crashes.log
```

### Action: test

```yaml
steps:
  - Load CHAT_ID from: ~/.claude-remote/default/config/aiox-master/.env
  - Run: bash infrastructure/message-gateway/core/bus/send-telegram.sh $CHAT_ID "Test from /telegram skill"
  - Report success/failure
```

## Error Handling

| Error | Action |
|-------|--------|
| No BOT_TOKEN configured | Guide user to run `/telegram setup` first |
| Agent dir missing | Guide user to run `/telegram deploy` first |
| launchd not loaded | Guide user to run `/telegram start` |
| tmux session not found | Check if launchd is loaded; may need restart |
| send-telegram fails | Check token validity: `curl https://api.telegram.org/bot<TOKEN>/getMe` |

## Prerequisites

- Telegram bot token from @BotFather
- `jq` and `curl` installed
- macOS (uses launchd for persistence)

---

*Skill: telegram v1.0*
*Gateway: infrastructure/message-gateway/*
