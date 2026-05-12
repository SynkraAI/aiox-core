# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
-

### Changed
-

### Deprecated
-

### Removed
-

### Fixed
-

### Security
-

---

## [X.Y.Z] - YYYY-MM-DD

### Added
- New feature description ([#issue](link))
- Another new feature

### Changed
- Description of change
- Updated dependency X to version Y

### Deprecated
- Feature X is deprecated and will be removed in vX.X.X

### Removed
- Removed feature Y (deprecated in vX.X.X)

### Fixed
- Fixed bug description ([#issue](link))
- Another bug fix

### Security
- Fixed security vulnerability in X ([CVE-XXXX-XXXX](link))

---

## Version Template

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features that were added

### Changed
- Changes in existing functionality

### Deprecated
- Features that will be removed in upcoming releases

### Removed
- Features that were removed

### Fixed
- Bug fixes

### Security
- Security vulnerability fixes
```

---

## Semantic Versioning Guide

- **MAJOR** (X.0.0): Breaking changes that are not backward compatible
- **MINOR** (0.X.0): New features that are backward compatible
- **PATCH** (0.0.X): Bug fixes that are backward compatible

### Examples

**MAJOR version bump:**
- Removing or renaming public API methods
- Changing function signatures
- Dropping support for Node.js version
- Database schema changes that require migration

**MINOR version bump:**
- Adding new API endpoints
- Adding new optional parameters
- New features that don't affect existing code
- Performance improvements

**PATCH version bump:**
- Bug fixes
- Security patches
- Documentation updates
- Internal refactoring (no API changes)

---

## Commit Message Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons)
- `refactor`: Code change (no feature/fix)
- `perf`: Performance improvement
- `test`: Adding/updating tests
- `chore`: Build/auxiliary tool changes

---

[Unreleased]: https://github.com/owner/repo/compare/vX.Y.Z...HEAD
[X.Y.Z]: https://github.com/owner/repo/compare/vX.Y.W...vX.Y.Z
