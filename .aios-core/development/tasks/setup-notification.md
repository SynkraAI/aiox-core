# setup-notification

**Task ID:** setup-notification
**Version:** 1.0.0
**Created:** 2026-02-11
**Updated:** 2026-02-11
**Agent:** @aios-master (Orion)
**Story:** Community Contribution - Cross-platform notification system for Claude Code hooks

---

## Purpose

Install a cross-platform sound notification system that alerts users when Claude Code needs human input (permission prompts, elicitation dialogs). Replaces manual/legacy beep hooks with a managed, configurable system supporting Windows, macOS, and Linux.

**This task can be executed independently at any time after AIOS installation.**

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Auto-detect platform and install with default preset (ping)
- No user interaction
- **Best for:** Quick setup, CI environments

### 2. Interactive Mode - Balanced (2-3 prompts) **[DEFAULT]**
- Confirm before modifying settings.json
- Let user choose sound preset
- **Best for:** First-time setup, user preference selection

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: setupNotification()
responsavel: Orion (Commander)
responsavel_type: Agente
atomic_layer: Config

**Entrada:**
- campo: mode
  tipo: string
  origem: User Input
  obrigatorio: false
  validacao: yolo | interactive (default: interactive)

- campo: preset
  tipo: string
  origem: User Input
  obrigatorio: false
  validacao: beep | ping | glass | hero | purr (default: ping)

**Saida:**
- campo: hook_installed
  tipo: boolean
  destino: ~/.claude/settings.json
  persistido: true

- campo: config_created
  tipo: boolean
  destino: ~/.aios/notifications/config.yaml
  persistido: true
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Node.js available (>= 20.0.0)
    tipo: pre-condition
    blocker: true
    validacao: |
      node --version
    error_message: "Node.js not found. Install Node.js >= 20.0.0."

  - [ ] Claude Code installed (~/.claude/ directory exists)
    tipo: pre-condition
    blocker: true
    validacao: |
      Test-Path "$HOME/.claude" (PowerShell) or [ -d ~/.claude ] (bash)
    error_message: "Claude Code not installed. Install from https://claude.ai/code"

  - [ ] notification-player.js exists in project
    tipo: pre-condition
    blocker: true
    validacao: |
      Test-Path ".aios-core/scripts/notification-player.js"
    error_message: "notification-player.js not found. Run AIOS install first."

  - [ ] Audio output available on machine
    tipo: pre-condition
    blocker: false
    validacao: |
      Platform-specific audio check (non-blocking)
    warning_message: "Audio output not detected. Notification may not produce sound."

  - [ ] Not already installed (idempotency check)
    tipo: pre-condition
    blocker: false
    validacao: |
      Check ~/.claude/settings.json for existing notification-player.js hook
    warning_message: "AIOS notification already installed. Use --force to reinstall."
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Hook entry exists in ~/.claude/settings.json
    tipo: post-condition
    blocker: true
    validacao: |
      Parse ~/.claude/settings.json, check hooks.Notification contains notification-player.js
    error_message: "Hook installation failed - settings.json not updated"

  - [ ] Config file exists at ~/.aios/notifications/config.yaml
    tipo: post-condition
    blocker: true
    validacao: |
      Test-Path "$HOME/.aios/notifications/config.yaml"
    error_message: "Config file not created"

  - [ ] All existing settings.json content preserved
    tipo: post-condition
    blocker: true
    validacao: |
      Compare pre-install backup with post-install, verify no data loss
    error_message: "Settings.json data loss detected - restore from backup"

  - [ ] notification-player.js --test plays sound
    tipo: post-condition
    blocker: false
    validacao: |
      node .aios-core/scripts/notification-player.js --test (exit code 0)
    warning_message: "Sound test failed. Check audio output settings."
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Hook merged into settings.json without data loss
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Verify settings.json contains AIOS notification hook AND all previous settings
    error_message: "Hook merge failed or caused data loss"

  - [ ] Existing hooks and settings preserved (safe merge)
    tipo: acceptance-criterion
    blocker: true
    validacao: |
      Diff pre/post settings.json - only Notification hook should differ
    error_message: "Other settings were modified during installation"

  - [ ] Sound plays on current platform
    tipo: acceptance-criterion
    blocker: false
    manual_check: true
    validacao: |
      User confirms hearing notification sound after --test
    error_message: "Sound not audible on this platform"

  - [ ] Cooldown prevents notification spam (2s default)
    tipo: acceptance-criterion
    blocker: false
    validacao: |
      Run notification-player.js twice within 1s - second should be silent
    error_message: "Cooldown mechanism not working"

  - [ ] Legacy PowerShell beep hook replaced (if present)
    tipo: acceptance-criterion
    blocker: false
    validacao: |
      No [console]::beep entries remain in settings.json after install
    error_message: "Legacy hook not properly replaced"
```

---

## Tools

**External/shared resources used by this task:**

- **Tool:** node
  - **Purpose:** Execute notification-player.js and install scripts
  - **Source:** Built-in (Node.js runtime)

- **Tool:** notification-player.js
  - **Purpose:** Cross-platform sound playback with cooldown management
  - **Source:** .aios-core/scripts/notification-player.js

---

## Scripts

**Scripts created/used by this task:**

- **.aios-core/scripts/notification-player.js:**
  - description: Cross-platform sound notification player with cooldown, presets, and CLI
  - language: javascript
  - version: 1.0.0
  - platforms: Windows (PowerShell beep), macOS (afplay), Linux (paplay/bell)

- **.aios-core/infrastructure/scripts/notifications/install-notifications.js:**
  - description: Safe installer that merges hook into settings.json, handles legacy migration
  - language: javascript
  - version: 1.0.0

- **.aios-core/infrastructure/scripts/notifications/uninstall-notifications.js:**
  - description: Clean uninstaller that removes hook without affecting other settings
  - language: javascript
  - version: 1.0.0

- **.aios-core/infrastructure/scripts/notifications/templates/notification-config.yaml:**
  - description: Default configuration template with all platform options documented
  - language: yaml
  - version: 1.0.0

---

## Error Handling

**Strategy:** fallback-with-manual-instructions

**Common Errors:**

1. **Error:** settings.json parse error
   - **Cause:** Corrupted or invalid JSON in existing settings
   - **Resolution:** Backup original file, attempt repair
   - **Recovery:** Create new settings.json with hook only, warn user about backup location

2. **Error:** Sound doesn't play
   - **Cause:** Audio device unavailable, wrong preset, or platform incompatibility
   - **Resolution:** Try alternative preset, fall back to terminal bell
   - **Recovery:** Install completes successfully, warn user to check audio settings

3. **Error:** Permission denied writing settings.json
   - **Cause:** File locked or insufficient permissions
   - **Resolution:** Show manual installation instructions
   - **Recovery:** Output the JSON snippet user needs to add manually

4. **Error:** Legacy hook format unexpected
   - **Cause:** User has custom notification hooks not matching expected patterns
   - **Resolution:** Preserve existing hooks, add AIOS hook alongside them
   - **Recovery:** Do not remove unrecognized hooks, only add new one

---

## Performance

**Expected Metrics:**

```yaml
duration_expected: 10000ms  # ~10 seconds
cost_estimated: $0.00  # No AI tokens, local operations only
token_usage: ~200 tokens (for guidance text only)
cacheable: false
parallelizable: false
```

---

## Metadata

```yaml
story: community-contribution
version: 1.0.0
dependencies: []
breaking_changes: []
tags:
  - notification
  - hooks
  - cross-platform
  - setup
  - audio
  - claude-code
author: Cleverson Valle (community contributor)
created_at: 2026-02-11
updated_at: 2026-02-11
changelog:
  1.0.0:
    - Initial implementation
    - Cross-platform support (Windows, macOS, Linux)
    - 5 sound presets (beep, ping, glass, hero, purr)
    - Cooldown system to prevent notification spam
    - Safe merge into existing settings.json
    - Legacy PowerShell beep hook migration
    - Install/uninstall scripts
    - AIOS task for guided setup
```

---

## Elicitation

```yaml
elicit: true
interaction_points:
  - sound_preset: "Which notification sound do you prefer? (ping/beep/glass/hero/purr)"
  - confirm_install: "Ready to install notification hook into ~/.claude/settings.json?"
```

---

## Process

### Step 1: Detect Environment

**Action:** Check platform, existing installation, and prerequisites

```bash
echo "=== AIOS Notification System Setup ==="

# Detect platform
node -e "console.log('Platform: ' + process.platform)"

# Check Claude Code installation
node -e "
const fs = require('fs');
const path = require('path');
const home = require('os').homedir();
const claudeDir = path.join(home, '.claude');
const settingsPath = path.join(claudeDir, 'settings.json');
console.log('Claude dir exists:', fs.existsSync(claudeDir));
console.log('Settings exists:', fs.existsSync(settingsPath));
"

# Check if already installed
node .aios-core/scripts/notification-player.js --status
```

**Decision Point:**
- If already installed → show status and exit
- If not installed → continue to Step 2

---

### Step 2: Choose Sound Preset (Interactive Mode only)

**Action:** Present sound options to user

**Elicitation Point:**

```
Available notification presets:

  1. ping  - Short ping (default, recommended)
  2. beep  - Classic beep
  3. glass - Glass tap
  4. hero  - Longer hero sound
  5. purr  - Soft purr

Select preset (1-5, default: 1): _
```

**YOLO Mode:** Skip this step, use preset `ping`.

---

### Step 3: Run Installer

**Action:** Execute the installation script

```bash
# Interactive mode
node .aios-core/infrastructure/scripts/notifications/install-notifications.js

# YOLO mode (silent)
node .aios-core/infrastructure/scripts/notifications/install-notifications.js --silent
```

**What the installer does:**
1. Resolves path to `notification-player.js`
2. Reads existing `~/.claude/settings.json` (preserving all content)
3. Detects and replaces legacy PowerShell beep hooks (if present)
4. Merges AIOS notification hook into Notification hooks array
5. Creates `~/.aios/notifications/config.yaml` from template
6. Writes updated `settings.json` (safe merge)
7. Tests notification sound

---

### Step 4: Update Config with Chosen Preset

**Action:** If user chose a preset different from default, update config

```bash
# Only if preset != ping (default)
# Update ~/.aios/notifications/config.yaml with selected preset
```

---

### Step 5: Verify Installation

**Action:** Run verification checks

```bash
# Check status
node .aios-core/scripts/notification-player.js --status

# Test sound
node .aios-core/scripts/notification-player.js --test
```

---

### Step 6: Final Summary

**Action:** Display completion summary

```
AIOS Notification System installed successfully!

  Platform:  {os}
  Preset:    {preset}
  Config:    ~/.aios/notifications/config.yaml
  Hook:      ~/.claude/settings.json
  Events:    permission_prompt, elicitation_dialog

  Management Commands:
    *notification status  - Check current configuration
    *notification test    - Play test sound
    *notification off     - Disable notifications
    *notification on      - Enable notifications

  To uninstall:
    node .aios-core/infrastructure/scripts/notifications/uninstall-notifications.js

--- Orion, notifications configured
```

---

## Validation Checklist

- [ ] Pre-conditions verified (Node.js, Claude Code)
- [ ] Platform detected
- [ ] Sound preset selected (or default used)
- [ ] Installer executed successfully
- [ ] Config created at ~/.aios/notifications/config.yaml
- [ ] Hook merged into ~/.claude/settings.json
- [ ] Existing settings preserved
- [ ] Test sound played successfully
- [ ] Summary displayed to user

---

## Troubleshooting

### Issue 1: No sound on Windows

**Error:** Sound command executes but nothing is heard

**Fix:**
1. Check volume is not muted
2. Try different preset: edit `~/.aios/notifications/config.yaml`, change `preset: hero`
3. Test directly: `powershell -Command "[console]::beep(1000, 500)"`

### Issue 2: No sound on macOS

**Error:** `afplay` command fails

**Fix:**
1. Check if sound file exists: `ls /System/Library/Sounds/Ping.aiff`
2. Try alternative sound: change `sound_name: Glass` in config
3. Check system audio output: System Preferences → Sound

### Issue 3: No sound on Linux

**Error:** `paplay` not found

**Fix:**
1. Install PulseAudio: `sudo apt install pulseaudio-utils`
2. Or fall back to terminal bell: set `fallback: bell` in config
3. Check sound file: `ls /usr/share/sounds/freedesktop/stereo/`

### Issue 4: settings.json corrupted after install

**Fix:**
1. Uninstall: `node .aios-core/infrastructure/scripts/notifications/uninstall-notifications.js`
2. If still broken, manually edit `~/.claude/settings.json`
3. The installer always preserves the original structure - report bug if data loss occurs

---

## References

- [Claude Code Hooks Documentation](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [AIOS Task Format Specification V1.0](.aios-core/docs/standards/TASK-FORMAT-SPECIFICATION-V1.md)

---

**Status:** Production Ready
**Tested On:** Windows 11
**Platforms Supported:** Windows, macOS, Linux
