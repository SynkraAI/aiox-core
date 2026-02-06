# DEPRECATED: Old System Prompts Structure

**⚠️ This directory structure is deprecated.**

## New Structure

System prompts have been reorganized with versioning:

```
system_prompts/
├── generalista/
│   ├── v1.0.0.md
│   └── latest.md -> v1.0.0.md
└── specialists/
    └── {specialist_name}/
        ├── v1.0.0.md
        └── latest.md -> v1.0.0.md
```

## Migration

Files in the root of `system_prompts/` have been copied to the new structure above.

- **Generalista prompts**: `generalista/v1.0.0.md`
- **Specialist prompts**: `specialists/{name}/v1.0.0.md`

## Usage

**Always use the versioned files:**
- For current version: Use `latest.md` symlink
- For specific version: Use `v1.0.0.md`, `v1.1.0.md`, etc.

## Old Files

Old files remain in this directory for backward compatibility but should not be used for new development.

---
*Created during Epic 3 Story 3.1 migration*
