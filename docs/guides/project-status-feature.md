# Project Status Feature - User Guide

> **EN** | [PT](../pt/guides/project-status-feature.md) | [ES](../es/guides/project-status-feature.md)

---

**Feature:** Dynamic Project Status Context for Agent Activation
**Version:** 1.0
**Story:** 6.1.2.4
**Created:** 2025-01-14

---

## Overview

The Project Status feature automatically displays your current work context when any AIOX agent activates. This includes:

- **Git branch** you're currently on
- **Modified files** in your working directory
- **Recent commits** (last 2)
- **Current story/epic** (if any story is InProgress)

This gives you immediate context about your work without manually running `git status` or searching for active stories.

---

## Example Display

When you activate an agent (e.g., `/dev`), you'll see:

```
💻 Dex (Builder) ready. Let's build something great!

Current Project Status:
  - Branch: main
  - Modified: story-6.1.2.4.md, po.md
  - Recent: chore: cleanup Utils Registry, Phase 4: Open-Source Preparation

Type *help to see available commands!
```

---

## Setup

### Prerequisites

- **Git repository** - Project must be initialized with `git init`
- **AIOX-FullStack** framework installed
- **Node.js 18+** with required packages

### Initial Setup

Run the initialization command via @devops agent:

```bash
/devops
*init-project-status
```

This will:
1. Detect your git repository
2. Enable `projectStatus` in `core-config.yaml`
3. Create `.aiox/project-status.yaml` cache file
4. Add cache file to `.gitignore`
5. Test the status display

**Alternative Manual Setup:**

If you prefer manual configuration:

1. Edit `.aiox-core/core-config.yaml`:
   ```yaml
   projectStatus:
     enabled: true
     autoLoadOnAgentActivation: true
     showInGreeting: true
     cacheTimeSeconds: 60
   ```

2. Create `.aiox/` directory:
   ```bash
   mkdir .aiox
   ```

3. Add to `.gitignore`:
   ```gitignore
   .aiox/project-status.yaml
   ```

---

## Configuration

### Full Configuration Options

Location: `.aiox-core/core-config.yaml`

```yaml
projectStatus:
  enabled: true                      # Enable/disable feature
  autoLoadOnAgentActivation: true    # Load on agent activation
  showInGreeting: true               # Display in greeting
  cacheTimeSeconds: 60               # Cache TTL (seconds)
  components:                        # Toggle individual components
    gitBranch: true                  # Show branch name
    gitStatus: true                  # Show modified files
    recentWork: true                 # Show recent commits
    currentEpic: true                # Show current epic
    currentStory: true               # Show current story
  statusFile: .aiox/project-status.yaml  # Cache file location
  maxModifiedFiles: 5                # Limit modified files shown
  maxRecentCommits: 2                # Limit commits shown
```

### Customization Examples

**Show only branch and story:**
```yaml
projectStatus:
  enabled: true
  components:
    gitBranch: true
    gitStatus: false      # Hide modified files
    recentWork: false     # Hide commits
    currentEpic: false
    currentStory: true
```

**Increase cache TTL to 5 minutes:**
```yaml
projectStatus:
  cacheTimeSeconds: 300
```

**Show more commits and files:**
```yaml
projectStatus:
  maxModifiedFiles: 10
  maxRecentCommits: 5
```

---

## How It Works

### Status Collection

When an agent activates, the system:

1. **Checks cache** - Looks for `.aiox/project-status.yaml`
2. **Validates TTL** - Is cache < 60 seconds old?
3. **Returns cached** - If valid, use cached status (fast)
4. **Generates fresh** - If expired, run git commands and scan stories
5. **Updates cache** - Save new status for next activation

### Git Commands Used

```bash
# Check if git repo
git rev-parse --is-inside-work-tree

# Get branch (modern git >= 2.22)
git branch --show-current

# Get branch (fallback for older git)
git rev-parse --abbrev-ref HEAD

# Get modified files
git status --porcelain

# Get recent commits
git log -2 --oneline --no-decorate
```

### Story Detection

Scans `docs/stories/` for files containing:
```markdown
**Status:** InProgress
**Story ID:** STORY-X.Y.Z
**Epic:** Epic X.Y - Name
```

Only shows stories with status: `InProgress` or `In Progress`.

---

## Performance

### Benchmarks

| Operation | Time | Notes |
|-----------|------|-------|
| **First Load** | 80-100ms | Runs git commands + file scan |
| **Cached Load** | 5-10ms | Read YAML from cache |
| **Cache Miss** | 80-100ms | TTL expired, regenerate |
| **Agent Overhead** | <100ms | Added to activation time |

### Cache Strategy

- **Cache TTL:** 60 seconds (configurable)
- **Cache Location:** `.aiox/project-status.yaml`
- **Cache Format:** YAML with status object + timestamp
- **Invalidation:** Automatic after TTL expires

**Why 60 seconds?**
- Long enough to avoid repeated git calls during agent switching
- Short enough to reflect recent changes
- Optimal balance between performance and freshness

---

## Affected Agents

All 11 AIOX agents display project status:

1. **@dev** (Dex - Builder)
2. **@po** (Pax - Balancer)
3. **@qa** (Quinn - Guardian)
4. **@sm** (River - Facilitator)
5. **@pm** (Morgan - Strategist)
6. **@architect** (Aria - Visionary)
7. **@analyst** (Atlas - Decoder)
8. **@devops** (Gage - Operator)
9. **@data-engineer** (Dara - Sage)
10. **@ux-design-expert** (Uma - Empathizer)
11. **@aiox-master** (Orion - Orchestrator)

---

## Troubleshooting

### Status Not Showing

**Symptom:** Agent activates without status display

**Check:**
1. Is `projectStatus.enabled: true` in core-config.yaml?
2. Is this a git repository? (`git rev-parse --is-inside-work-tree`)
3. Does `.aiox-core/infrastructure/scripts/project-status-loader.js` exist?
4. Any errors in agent activation output?

**Solution:**
```bash
# Re-run initialization
/devops
*init-project-status
```

### Stale Status Data

**Symptom:** Status shows old data

**Cause:** Cache not invalidating properly

**Solution:**
```bash
# Manually clear cache
rm .aiox/project-status.yaml

# Or restart agent session
```

### Git Commands Failing

**Symptom:** Branch shows "unknown", files missing

**Check:**
1. Is git in PATH? (`git --version`)
2. Is git version >= 2.0? (2.22+ recommended)
3. Repository corrupted? (`git fsck`)

**Fallback:** System uses older git commands automatically if modern commands fail.

### Performance Issues

**Symptom:** Agent activation > 200ms consistently

**Cause:** Large repository or slow disk I/O

**Solution:**
```yaml
# Reduce data collected
projectStatus:
  maxModifiedFiles: 3    # Default: 5
  maxRecentCommits: 1     # Default: 2
  components:
    recentWork: false     # Disable commits
```

### Non-Git Projects

**Expected Behavior:**
```
Current Project Status:
  (Not a git repository)
```

This is normal and harmless. Agents work normally without git.

---

## Advanced Usage

### Disable for Specific Agents

Currently, status displays in all agents. To disable globally:

```yaml
projectStatus:
  enabled: false
```

*Note: Per-agent disable not yet implemented (see Future Enhancements).*

### Custom Status File Location

```yaml
projectStatus:
  statusFile: .custom/my-status.yaml
```

Don't forget to update `.gitignore`.

### Programmatic Access

```javascript
const { loadProjectStatus, formatStatusDisplay } = require('./.aiox-core/infrastructure/scripts/project-status-loader.js');

// Get raw status object
const status = await loadProjectStatus();
console.log(status);

// Get formatted display string
const display = formatStatusDisplay(status);
console.log(display);

// Clear cache manually
const { clearCache } = require('./.aiox-core/infrastructure/scripts/project-status-loader.js');
await clearCache();
```

---

## Rollback

### Disable Feature

1. **Edit config:**
   ```yaml
   projectStatus:
     enabled: false
   ```

2. **Clear cache:**
   ```bash
   rm .aiox/project-status.yaml
   ```

3. **Restart agents** - New activations won't show status

### Complete Removal

To fully remove the feature:

```bash
# Remove script
rm .aiox-core/infrastructure/scripts/project-status-loader.js

# Remove task
rm .aiox-core/tasks/init-project-status.md

# Remove cache
rm .aiox/project-status.yaml

# Remove tests
rm .aiox-core/infrastructure/scripts/__tests__/project-status-loader.test.js

# Remove config section from core-config.yaml
# (manually edit file)

# Revert agent files to pre-6.1.2.4 state
git revert <commit-hash>
```

---

## Git Version Compatibility

### Recommended: git >= 2.22

Uses modern command:
```bash
git branch --show-current
```

### Supported: git >= 2.0

Falls back to:
```bash
git rev-parse --abbrev-ref HEAD
```

### Minimum: git 2.0+

Older versions may work but are untested.

**Check your version:**
```bash
git --version
```

---

## Future Enhancements

Potential improvements (not yet implemented):

- [ ] Per-agent status toggle (e.g., disable for @qa only)
- [ ] Color-coded status indicators (🟢 clean, 🟡 modified, 🔴 conflicts)
- [ ] Story progress percentage (completed tasks / total)
- [ ] Estimated time to complete current story
- [ ] Multiple story detection (show all InProgress)
- [ ] Custom status components via plugins
- [ ] Real-time file watching (remove cache delay)

---

## FAQ

**Q: Will this slow down agent activation?**
A: Initial load adds ~100ms. Cached loads add ~10ms. This is minimal and worth the context benefit.

**Q: Can I disable for specific agents?**
A: Not yet. You can disable globally via `projectStatus.enabled: false`.

**Q: What if I'm not using git?**
A: Status shows "(Not a git repository)" and agents work normally.

**Q: How often is status refreshed?**
A: Every 60 seconds by default (configurable via `cacheTimeSeconds`).

**Q: Does this work on Windows/Linux/macOS?**
A: Yes, tested on all platforms.

**Q: Can I customize the status format?**
A: Not yet. The format is fixed in `project-status-loader.js:formatStatusDisplay()`.

**Q: Is cache shared between agents?**
A: Yes, all agents use the same cache file (`.aiox/project-status.yaml`).

---

## Related Documentation

- **Story:** `docs/stories/aiox migration/story-6.1.2.4-project-status-context.md`
- **Config:** `.aiox-core/core-config.yaml` (projectStatus section)
- **Script:** `.aiox-core/infrastructure/scripts/project-status-loader.js`
- **Init Task:** `.aiox-core/tasks/init-project-status.md`
- **Tests:** `.aiox-core/infrastructure/scripts/__tests__/project-status-loader.test.js`

---

**Version:** 1.0
**Status:** ✅ Production Ready
**Last Updated:** 2025-01-14
