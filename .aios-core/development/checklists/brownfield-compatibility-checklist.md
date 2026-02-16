# Brownfield Compatibility Checklist

> Story AIOS-DIFF-4.3.2: Checklist formal de compatibilidade retroativa

## Pre-Migration Compatibility Check

### 1. Source Control Status
- [ ] All changes committed to version control
- [ ] Working branch created from main/master
- [ ] Remote backup verified (push before migration)

### 2. Existing Configuration Preservation
- [ ] `.env` files backed up (never overwritten by AIOS)
- [ ] `package.json` scripts preserved
- [ ] Existing linting config (.eslintrc, .prettierrc) detected
- [ ] CI/CD workflows (.github/workflows) inventoried

### 3. Dependency Compatibility
- [ ] Node.js version compatible (>=18)
- [ ] No conflicting global dependencies
- [ ] Lock file (package-lock.json/yarn.lock) preserved

### 4. Directory Structure Analysis
- [ ] `docs/` directory status checked (empty/existing)
- [ ] `.aios-core/` not present (fresh install)
- [ ] No naming conflicts with AIOS directories

## During Migration Checks

### 5. Non-Destructive Operations
- [ ] AIOS creates new files, never overwrites existing
- [ ] Merge conflicts surfaced for user decision
- [ ] Original files preserved with `.backup` if conflict

### 6. Configuration Merge Strategy
- [ ] Existing `.gitignore` entries preserved + AIOS entries added
- [ ] TypeScript config extended (not replaced) if existing
- [ ] ESLint rules merged (not overwritten)

### 7. Rollback Points
- [ ] Pre-migration commit hash recorded
- [ ] AIOS files clearly identified (can be removed cleanly)
- [ ] No modifications to existing source code during install

## Post-Migration Validation

### 8. Existing Functionality
- [ ] `npm test` passes (if tests existed before)
- [ ] `npm run build` succeeds (if build existed)
- [ ] Application starts normally

### 9. AIOS Integration
- [ ] `npx aios-core doctor` reports healthy
- [ ] Agent activation works (@dev, @architect, etc.)
- [ ] Existing docs not duplicated

### 10. Rollback Verification
- [ ] `git diff HEAD~1` shows only AIOS additions
- [ ] `git checkout HEAD~1 -- .` would restore pre-AIOS state
- [ ] No orphaned AIOS processes or files

---

## Compatibility Matrix

| Existing Config | AIOS Behavior | User Action Required |
|-----------------|---------------|---------------------|
| `.eslintrc.*` | Detect + preserve | None |
| `.prettierrc.*` | Detect + preserve | None |
| `tsconfig.json` | Extend (not replace) | Review extends |
| `jest.config.*` | Detect + preserve | None |
| `docs/*.md` | Skip (don't overwrite) | Manual merge if needed |
| `.github/workflows/*` | Inventory only | User decides integration |
| `package.json` scripts | Preserve all | None |

## Rollback Procedure

If migration fails or is unwanted:

```bash
# Option 1: Full rollback to pre-migration state
git checkout HEAD~1 -- .

# Option 2: Remove only AIOS files
rm -rf .aios-core/
rm -rf docs/architecture/ docs/prd/ docs/stories/
# Review and revert .gitignore AIOS entries

# Option 3: Soft rollback (keep docs, remove runtime)
rm -rf .aios-core/
```

---

## Checklist Usage

**Pre-Migration:**
```bash
# Run compatibility check
npx aios-core doctor --pre-migration
```

**Post-Migration:**
```bash
# Validate migration
npx aios-core doctor
npm test  # if tests exist
npm run build  # if build exists
```

---

*AIOS Brownfield Compatibility Checklist v1.0*
*Story AIOS-DIFF-4.3.2*
