# merge-worktree

Merge a worktree branch back to its base branch.

## Purpose

Complete worktree workflow by merging changes back to base branch.

## Usage

```bash
*merge-worktree {worktree-name}
```

## Parameters

- `worktree-name` - Name of the worktree to merge

## Steps

1. Verify worktree exists: `git worktree list`
2. Run quality gates on worktree branch:
   - `npm run lint`
   - `npm test`
   - `npm run typecheck`
3. Checkout base branch: `git checkout {base-branch}`
4. Merge worktree branch: `git merge {worktree-branch}`
5. Handle conflicts if any (with user assistance)
6. Push merged changes: delegate to `*push`
7. Optionally remove worktree: `*remove-worktree`

## Safety

- Quality gates must pass before merge
- User confirms merge direction
- Conflict resolution requires user input

## Related

- `*create-worktree` - Create worktree
- `*remove-worktree` - Remove worktree
- `*push` - Push merged changes
