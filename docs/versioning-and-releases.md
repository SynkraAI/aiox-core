# How to Release a New Version

> 🌐 **EN** | [PT](./pt/versioning-and-releases.md) | [ES](./es/versioning-and-releases.md)

---

## Automated Releases (Recommended)

The easiest way to release new versions is through **automatic semantic releases**. Just commit with the right message format and push and everything else happens automatically.

### Commit Message Format

Use these prefixes to control what type of release happens:

```bash
fix: resolve CLI argument parsing bug      # → patch release (4.1.0 → 4.1.1)
feat: add new agent orchestration mode     # → minor release (4.1.0 → 4.2.0)
feat!: redesign CLI interface              # → major release (4.1.0 → 5.0.0)
```

### What Happens Automatically

When you push commits with `fix:` or `feat:`, GitHub Actions will:

1. ✅ Analyze your commit messages
2. ✅ Bump version in `package.json`
3. ✅ Generate changelog
4. ✅ Create git tag
5. ✅ **Publish to NPM automatically**
6. ✅ Create GitHub release with notes

### Your Simple Workflow

```bash
# Make your changes
git add .
git commit -m "feat: add team collaboration mode"
git push

# That's it! Release happens automatically 🎉
# Users can now run: npx aios-core (and get the new version)
```

### Commits That DON'T Trigger Releases

These commit types won't create releases (use them for maintenance):

```bash
chore: update dependencies     # No release
docs: fix typo in readme      # No release
style: format code            # No release
test: add unit tests          # No release
```

### Test Your Setup

```bash
npm run release:test    # Safe to run locally - tests the config
```

---

## Manual Release Methods (Exceptions Only)

⚠️ Only use these methods if you need to bypass the automatic system

### Quick Manual Version Bump

```bash
npm run version:patch   # 4.1.0 → 4.1.1 (bug fixes)
npm run version:minor   # 4.1.0 → 4.2.0 (new features)
npm run version:major   # 4.1.0 → 5.0.0 (breaking changes)

# Then manually publish:
npm publish
git push && git push --tags
```

### Manual GitHub Actions Trigger

You can also trigger releases manually through GitHub Actions workflow dispatch if needed.

---

## Troubleshooting

### Release Not Triggered

If your merge to `main` didn't trigger a release:

1. **Check commit messages** - Only `fix:` and `feat:` prefixes trigger releases
2. **Verify CI passed** - Release only runs if lint, typecheck, and test pass
3. **Check workflow logs** - Go to Actions → Semantic Release to see details

### Release Failed

Common issues and solutions:

| Error | Solution |
|-------|----------|
| `ENOGHTOKEN` | GITHUB_TOKEN secret missing or expired |
| `ENOPKGAUTH` | NPM_TOKEN secret missing or invalid |
| `ENOTINHISTORY` | Branch doesn't have proper history (use `fetch-depth: 0`) |
| `EINVALIDNPMTOKEN` | Regenerate NPM token with publish permissions |

### Skip a Release

To merge without triggering a release, use one of these:

```bash
# Method 1: Use non-release prefix
git commit -m "chore: update dependencies"

# Method 2: Add [skip ci] to commit message
git commit -m "feat: new feature [skip ci]"
```

### Force a Manual Release

If automatic release fails, you can manually release:

```bash
npm run version:patch   # or minor/major
git push && git push --tags
npm publish
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `.releaserc.json` | Semantic release configuration |
| `.github/workflows/semantic-release.yml` | GitHub Actions workflow |
| `package.json` | Version source, npm scripts |

---

*Last updated: Story 6.17 - Semantic Release Automation*
