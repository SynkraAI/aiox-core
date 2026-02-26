# AIOS Performance Tips

**Version:** 1.0
**Last Updated:** 2026-02-21
**Status:** Official Framework Standard

---

## Git fsmonitor (Opt-in Optimization)

### What it does

Git's built-in `fsmonitor` feature uses a filesystem watcher daemon to track file changes, so `git status` doesn't need to scan the entire working directory. This can reduce `git status` time from **50-200ms to <10ms**.

### Why it matters for AIOS

The AIOS Unified Activation Pipeline runs `git status` during agent activation to detect modified files and project state. On large repositories, this can cause the `projectStatus` loader to timeout (~60% timeout rate observed). Enabling fsmonitor dramatically reduces this latency.

### Requirements

- **Git 2.37+** (introduced the built-in `fsmonitor--daemon`)
- **Local filesystem** (not NFS, CIFS, or other network-mounted filesystems)
- **Supported OS:** Windows (ReadDirectoryChangesW), macOS (FSEvents), Linux (inotify)

### How to enable

```bash
# Enable for current repository
git config core.fsmonitor true

# Verify it's enabled
git config core.fsmonitor
# Output: true
```

### How to disable

If you encounter issues (e.g., stale status, high CPU usage):

```bash
# Disable for current repository
git config --unset core.fsmonitor

# Stop the daemon if running
git fsmonitor--daemon stop
```

### Diagnostics

Run `aios doctor` to check fsmonitor status:

```bash
npx aios-core doctor
```

The doctor will report:
- **Enabled:** `✔ Git fsmonitor: enabled (git status acceleration active)`
- **Available but not enabled:** `ℹ️ Git fsmonitor: not enabled (opt-in optimization available)`
- **Not available:** `ℹ️ Git fsmonitor: not available (Git 2.37+ required)`

### Known limitations

- **Network filesystems:** Do not enable on NFS, CIFS, or other network-mounted filesystems — the daemon may not detect remote changes.
- **Very large repos (>100k files):** Initial daemon startup may take a few seconds. Subsequent operations are fast.
- **WSL:** Works, but cross-filesystem watchers (Windows ↔ WSL) may have latency.

---

## Related Documents

- [Tech Stack](./tech-stack.md)
- [Coding Standards](./coding-standards.md)

---

_This is an official AIOS framework standard._
