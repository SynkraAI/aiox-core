# Auto Worktree Workflow

> **EN** | [PT](../../aios-workflows/auto-worktree-workflow.md) | [ES](../../es/aios-workflows/auto-worktree-workflow.md)

---

**Full documentation available in:** [Portuguese Version](../../aios-workflows/auto-worktree-workflow.md)

---

## Summary

The **Auto Worktree Workflow** manages Git worktrees for parallel development. It automates:

- Worktree creation for feature branches
- Environment setup in new worktrees
- Worktree cleanup after merge
- Branch management and synchronization

### When to Use

- Working on multiple features simultaneously
- Isolating experimental changes
- Parallel development without stashing
- Review of pull requests locally

### Key Agents

- `@devops` - Git operations (exclusive push authority)
- `@dev` - Development in worktrees

### Main Phases

1. **Creation** - New worktree from branch
2. **Setup** - Dependencies and environment configuration
3. **Development** - Work in isolated worktree
4. **Sync** - Keeping worktrees updated
5. **Cleanup** - Removing merged worktrees

### Benefits

- No context switching with git stash
- Multiple features in parallel
- Clean separation of concerns
- Easy PR review setup

### Commands

```bash
# Create worktree for feature branch
git worktree add ../feature-name feature-branch

# List worktrees
git worktree list

# Remove worktree
git worktree remove ../feature-name
```

---

*For complete details, diagrams, and step-by-step instructions, see the [Portuguese documentation](../../aios-workflows/auto-worktree-workflow.md).*
