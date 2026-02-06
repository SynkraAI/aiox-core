# MMOS Minds Migration - Rollback Procedure

**Story:** STORY-10.7
**Migration Date:** 2026-01-02
**Executed By:** @dev (Dex)

---

## When to Rollback

Execute this procedure if:
1. Critical bugs discovered in migrated minds
2. System prompt files corrupted during migration
3. Integration failures with MMOS squad agents
4. Business decision to revert to legacy location

---

## Pre-Rollback Checklist

Before rollback, verify:
- [ ] All stakeholders notified
- [ ] No active mind clone sessions using new location
- [ ] Backup of any changes made in new location since migration

---

## Rollback Steps

### Step 1: Revert squad.yaml

Remove the minds configuration from `squads/mmos-squad/squad.yaml`:

```yaml
# REMOVE these lines:
mindsLocation: minds/
mindsCount: 28
mindsManifest: minds/MIGRATION_MANIFEST.yaml
```

### Step 2: Remove Migration Markers

Delete `_MIGRATED.md` files from legacy locations:

```powershell
$source = "expansion-packs/mmos/minds"
$minds = @(
    "joao_lozano", "paul_graham", "sam_altman", "pedro_valerio",
    "cagan_patton", "jeff_patton", "adriano_de_marqui", "steve_jobs",
    "marty_cagan", "brad_frost", "elon_musk", "alan_nicolas",
    "jesus_cristo", "seth_godin", "andrej_karpathy", "napoleon_hill",
    "alex_hormozi", "ray_kurzweil", "daniel_kahneman",
    "jose_amorim", "don_norman", "kapil_gupta",
    "guillermo_rauch", "kent_beck", "mitchell_hashimoto",
    "eugene_schwartz", "thiago_finch"
)

foreach ($mind in $minds) {
    $marker = Join-Path $source "$mind/_MIGRATED.md"
    if (Test-Path $marker) {
        Remove-Item $marker
        Write-Host "Removed: $marker"
    }
}
```

### Step 3: Delete Migrated Minds (Optional)

If you need to completely remove the migrated copies:

```powershell
$target = "squads/mmos-squad/minds"

# WARNING: This deletes all migrated minds!
Remove-Item -Path $target -Recurse -Force

# Recreate empty directory
New-Item -ItemType Directory -Path $target
```

### Step 4: Revert alex_hormozi Restructure

If alex_hormozi was restructured, restore original structure:

```powershell
$alexPath = "expansion-packs/mmos/minds/alex_hormozi"
$systemPrompts = Join-Path $alexPath "system_prompts"

# Remove system_prompts folder if created during migration
if (Test-Path $systemPrompts) {
    Remove-Item -Path $systemPrompts -Recurse -Force
}

# Note: COGNITIVE_OS.md should remain in artifacts/
```

### Step 5: Update References

Check and update any code that references the new location:
- Search for `squads/mmos-squad/minds`
- Replace with `expansion-packs/mmos/minds`

---

## Verification After Rollback

1. **Check legacy location:**
   ```powershell
   Get-ChildItem "expansion-packs/mmos/minds" | Measure-Object
   # Should show 27+ directories (original minds)
   ```

2. **Verify no markers:**
   ```powershell
   Get-ChildItem "expansion-packs/mmos/minds/*/_MIGRATED.md"
   # Should return empty/no results
   ```

3. **Test mind loading:**
   ```bash
   # Run existing MMOS tests
   npm test -- tests/squads/mmos-squad/
   ```

---

## Recovery Points

### Backup Locations

- **Source (unchanged):** `expansion-packs/mmos/minds/`
- **Migration manifest:** `squads/mmos-squad/minds/MIGRATION_MANIFEST.yaml`
- **Migration script:** `.temp/migrate-minds.ps1`

### If Source Was Modified

If legacy location was modified after migration, use git:

```bash
# Find last commit before migration
git log --oneline expansion-packs/mmos/minds/ | head -5

# Restore specific mind from git
git checkout <commit-hash> -- expansion-packs/mmos/minds/<mind-slug>/
```

---

## Support

For migration issues, contact:
- **Technical:** @dev (Dex)
- **Product:** @po (Pax)

**Related Documents:**
- `docs/stories/epic-10/sprint-10/STORY-10.7-MMOS-MINDS-MIGRATION.md`
- `docs/handoffs/HANDOFF-MMOS-MINDS-MIGRATION-TESTING.md`
- `docs/reports/mmos-migration-results.yaml`

---
*Generated during STORY-10.7 migration execution*
