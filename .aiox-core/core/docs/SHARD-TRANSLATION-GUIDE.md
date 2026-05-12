# Document Sharding with Portuguese-to-English Translation

## Overview

Synkra AIOX now automatically translates Portuguese documentation into English filenames when sharding documents. This ensures consistency across all projects and compatibility with hardcoded English filenames in configuration files.

## Problem Solved

**Before:** Sharding a Portuguese PRD/Architecture resulted in filenames like:
- `viso-do-produto.md` (missing accent, Portuguese)
- `pilha-tecnolgica.md` (missing accent, Portuguese)
- `padroes-de-codigo.md` (missing accent, Portuguese)

**After:** Sharding now produces proper English filenames:
- `product-vision.md` ✅
- `tech-stack.md` ✅
- `coding-standards.md` ✅

## How It Works

### 1. Automatic Translation During Shard

When you run `*shard` (PO or Architect), the system:

1. **Detects language** by checking for Portuguese characters/terms
2. **Translates** section headings using built-in dictionary
3. **Normalizes** to `lowercase-dash-case`
4. **Removes** accents and special characters
5. **Creates** files with English names

### 2. Translation Dictionary

The shard task includes 60+ Portuguese→English mappings:

```yaml
Common Terms:
- visão → vision
- produto → product
- arquitetura → architecture
- pilha tecnológica → tech-stack
- padrões de código → coding-standards
- requisitos → requirements
- testes → tests
# ... and many more
```

**See full dictionary:** `.aiox-core/tasks/shard-doc.md` (Section 3)

### 3. Fallback System

If the Agent needs architecture files and finds Portuguese names:

**Order of attempts:**
1. `tech-stack.md` (primary)
2. `technology-stack.md` (fallback)
3. `pilha-tecnologica.md` (Portuguese fallback)

**Configuration:** `.aiox-core/core-config.yaml`

```yaml
devLoadAlwaysFiles:
  - docs/architecture/coding-standards.md
  - docs/architecture/tech-stack.md
  - docs/architecture/source-tree.md

devLoadAlwaysFilesFallback:
  - docs/architecture/padroes-de-codigo.md
  - docs/architecture/pilha-tecnologica.md
  - docs/architecture/code-standards.md
  # ... more alternatives
```

## Usage

### Creating New Documentation

#### Option 1: Write in English (Recommended)
```bash
# Write your PRD in English
docs/prd.md

# Shard normally
*shard docs/prd.md docs/prd

# Result: All English filenames automatically
```

#### Option 2: Write in Portuguese
```bash
# Write your PRD in Portuguese
docs/prd.md

# Shard with automatic translation
*shard docs/prd.md docs/prd

# Result: Portuguese content, English filenames
# Example: "## Visão do Produto" → product-vision.md
```

### Validating Filenames

After sharding, validate that all filenames are correct:

```bash
# Check for issues
node .aiox-core/scripts/validate-filenames.js

# Auto-fix issues (renames files)
node .aiox-core/scripts/validate-filenames.js --fix
```

**What the validator checks:**
- ❌ Portuguese characters (á, ã, ç, etc.)
- ❌ Portuguese terms (visão, pilha, padrões)
- ✅ English standard names

### Fixing Existing Projects

If you have an existing project with Portuguese filenames:

```bash
# 1. Backup current docs
cp -r docs docs.backup-portuguese

# 2. Validate to see issues
node .aiox-core/scripts/validate-filenames.js

# 3. Auto-fix (renames files)
node .aiox-core/scripts/validate-filenames.js --fix

# 4. Or re-shard from original
*shard docs/prd.md docs/prd
*shard docs/architecture.md docs/architecture
```

## Translation Examples

| Portuguese Heading | English Filename |
|-------------------|------------------|
| ## Visão do Produto | `product-vision.md` |
| ## Pilha Tecnológica | `tech-stack.md` |
| ## Padrões de Código | `coding-standards.md` |
| ## Estrutura do Projeto | `project-structure.md` |
| ## Requisitos Funcionais | `functional-requirements.md` |
| ## Estratégia de Testes | `testing-strategy.md` |
| ## Banco de Dados - Esquema | `database-schema.md` |
| ## API Design (tRPC) | `api-design-trpc.md` |
| ## Riscos Técnicos | `technical-risks.md` |
| ## Infraestrutura | `infrastructure.md` |

## Advanced: Adding Custom Translations

### For Project-Specific Terms

Edit `.aiox-core/tasks/shard-doc.md`, Section 3:

```yaml
# Add your custom translations
Custom Terms:
  seu-termo: your-term
  termo-específico: specific-term
```

### For New Languages

The system can be extended to support other languages by:

1. Adding language detection logic
2. Creating translation dictionary for that language
3. Updating the filename generation algorithm

## Troubleshooting

### Problem: Files still have Portuguese names

**Solution:**
1. Check you're using the updated `.aiox-core/tasks/shard-doc.md`
2. Run validator to confirm: `node .aiox-core/scripts/validate-filenames.js`
3. Use `--fix` flag to auto-correct

### Problem: core-config references missing files

**Solution:**
The fallback system handles this automatically. Agent will try:
1. Primary name (English)
2. Fallback alternatives
3. Portuguese equivalents

**Manual fix:**
Edit `.aiox-core/core-config.yaml` to add more fallbacks.

### Problem: Some terms aren't translating

**Solution:**
Add them to the dictionary in `shard-doc.md`:

```yaml
# Your custom term
novo-termo: new-term
```

### Problem: Validation shows false positives

**Solution:**
If a term is intentionally Portuguese (e.g., company name), add exception to validator:

```javascript
// .aiox-core/scripts/validate-filenames.js
const ALLOWED_EXCEPTIONS = ['your-term'];
```

## Best Practices

### ✅ Do

- **Write PRDs/Architecture in your preferred language**
- **Trust the automatic translation** during shard
- **Run validator** after sharding to confirm
- **Use English filenames** in git commits/PRs

### ❌ Don't

- **Manually create files** with Portuguese names
- **Bypass the shard process** and create docs directly
- **Mix languages** in single documents (content can be PT, but structure references should be EN)
- **Hardcode Portuguese filenames** in custom tasks/workflows

## Configuration Reference

### Files Modified by This Feature

```
.aiox-core/
├── tasks/
│   ├── shard-doc.md          # Translation logic + dictionary
│   └── create-next-story.md  # Fallback file loading
├── core-config.yaml          # Fallback patterns
└── utils/
    └── validate-filenames.js # Validation tool
```

### Key Configuration Options

**Enable/Disable Markdown Exploder:**
```yaml
# .aiox-core/core-config.yaml
markdownExploder: true  # Uses md-tree CLI (faster)
markdownExploder: false # Uses manual method (has translation)
```

**Note:** Translation currently works best with manual method. The `md-tree` CLI doesn't support translation yet.

## Migration Guide

### From Portuguese to English Filenames

#### Step 1: Assessment
```bash
# Check current state
ls docs/prd/
ls docs/architecture/

# Count Portuguese files
node .aiox-core/scripts/validate-filenames.js
```

#### Step 2: Backup
```bash
# Backup current structure
cp -r docs docs.backup-$(date +%Y%m%d)
```

#### Step 3: Re-shard or Fix
```bash
# Option A: Re-shard from source
*shard docs/prd.md docs/prd
*shard docs/architecture.md docs/architecture

# Option B: Auto-fix existing files
node .aiox-core/scripts/validate-filenames.js --fix
```

#### Step 4: Verify
```bash
# Confirm all files are English
node .aiox-core/scripts/validate-filenames.js

# Check stories can find files
*create-story  # Test story creation
```

#### Step 5: Update References
```bash
# Search for any hardcoded Portuguese filenames
grep -r "pilha-tecnologica" .
grep -r "padroes-de-codigo" .

# Update them to English equivalents
```

## FAQ

**Q: Can I keep writing PRDs in Portuguese?**
A: Yes! Content can be Portuguese, only filenames will be English.

**Q: What if I want Spanish/French support?**
A: Open an issue or extend the translation dictionary in `shard-doc.md`.

**Q: Does this work with md-tree CLI?**
A: Currently, translation works with manual shard method only. We're working on md-tree integration.

**Q: Will this break existing projects?**
A: No, the fallback system ensures compatibility with both naming conventions.

**Q: How do I add more translations?**
A: Edit `.aiox-core/tasks/shard-doc.md`, Section 3, and add to the YAML dictionary.

## Support

If you encounter issues:

1. Check this guide first
2. Run the validator: `node .aiox-core/scripts/validate-filenames.js`
3. Review `.aiox-core/tasks/shard-doc.md` for translation rules
4. Open an issue with:
   - Your PRD heading
   - Expected filename
   - Actual filename
   - Output of validator

---

**Last Updated:** January 2025
**Feature Version:** AIOX v4.x
**Related Stories:** Translation Enhancement Story 5.2
