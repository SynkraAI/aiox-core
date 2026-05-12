# cleanup-worktrees

Remove all stale git worktrees older than specified threshold.

## Purpose

Clean up abandoned worktrees to maintain repository hygiene.

## Usage

```bash
*cleanup-worktrees [--days=30]
```

## Parameters

- `--days` - Age threshold in days (default: 30)

## Steps

1. List all worktrees: `git worktree list`
2. Identify stale worktrees (no commits > threshold)
3. Present list for user confirmation
4. For each approved worktree:
   - Remove worktree: `git worktree remove {path}`
   - Delete branch if merged: `git branch -d {branch}`
5. Report cleanup summary

## Safety Checks

- Never remove worktree with uncommitted changes
- Always confirm with user before deletion
- Keep worktrees with recent activity

## Related

- `*list-worktrees` - List all worktrees
- `*remove-worktree` - Remove single worktree
- `*create-worktree` - Create new worktree
