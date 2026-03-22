# Design System Extractor - Skill Index

Quick reference guide for the Design System Extractor skill.

## 📁 Skill Structure

```
design-system-extractor/
├── skill.json                    # Skill metadata and configuration
├── system-prompt.md              # Core system prompt (how the skill works)
├── README.md                     # User-facing documentation
├── CHANGELOG.md                  # Version history
├── INDEX.md                      # This file (quick reference)
├── .skillignore                  # Files to ignore
├── examples/                     # Usage examples
│   ├── example-01-single-website.md
│   └── example-02-multiple-pages.md
└── resources/                    # Templates and utilities
    ├── extraction-prompt.md      # WebFetch prompt template
    └── token-template.ts         # TypeScript token template

```

## 🚀 Quick Start

### Activate Skill
```bash
/AIOS:skills:design-system-extractor
```

### Provide Input
- **URLs**: Website pages to analyze (1-5 recommended)
- **Package Name**: Name for design system (e.g., "lendario")
- **Scope**: NPM scope (default: @fosc)
- **Description**: Package description (optional)

### Output
- Complete design system package in `packages/{name}-design-system/`
- Design tokens (TypeScript)
- Build configuration (Vite + TypeScript + Vitest)
- Documentation (README, guides, principles)
- Analysis reports

## 📖 Key Files

### For Users
- **README.md** - Comprehensive usage guide
- **examples/** - Real-world usage examples
- **CHANGELOG.md** - Version history and roadmap

### For Developers
- **skill.json** - Skill configuration and metadata
- **system-prompt.md** - Core AI instructions
- **resources/** - Templates and utilities

## 🎯 Main Features

1. **Website Analysis** - Extract design from any site
2. **Token Extraction** - Colors, typography, spacing, shadows, borders
3. **Component ID** - Identify UI patterns and components
4. **Package Generation** - Production-ready TypeScript package
5. **Documentation** - Auto-generated comprehensive docs
6. **Testing** - Vitest setup with token tests
7. **Build Tools** - Vite, TypeScript, ESLint configured
8. **Storybook** - Component documentation setup

## 📚 Documentation Map

| Document | Purpose | Audience |
|----------|---------|----------|
| README.md | Usage guide, features, examples | Users |
| system-prompt.md | AI instructions, workflow | Developers |
| skill.json | Configuration, metadata | System |
| examples/*.md | Real usage scenarios | Users |
| resources/extraction-prompt.md | WebFetch prompt template | Developers |
| resources/token-template.ts | TypeScript token structure | Developers |
| CHANGELOG.md | Version history, roadmap | All |

## 🔄 Workflow Overview

```
Input URLs
   ↓
WebFetch Analysis (structured prompt)
   ↓
Token Extraction (colors, typography, spacing, etc.)
   ↓
Package Structure Generation
   ↓
TypeScript Token Files
   ↓
Build Configuration (Vite, TypeScript, Vitest, ESLint)
   ↓
Documentation Generation
   ↓
Initial Build & Tests
   ↓
Output: Production-Ready Design System Package
```

## 💡 Common Use Cases

### 1. Single Website
Extract from one URL (homepage, landing page)
→ **See:** `examples/example-01-single-website.md`

### 2. Multiple Pages
Extract from multiple pages for comprehensive coverage
→ **See:** `examples/example-02-multiple-pages.md`

### 3. Component Library
Build component library using extracted tokens
→ **See:** README.md "After Generation" section

### 4. Design Migration
Migrate existing design to systematic tokens
→ **See:** README.md "Best Practices" section

## 🛠️ Customization

### Modify Extraction Logic
Edit `system-prompt.md` → Phase 1: Analysis & Extraction

### Change Package Structure
Edit `system-prompt.md` → Phase 2: Package Generation

### Add New Token Types
1. Update `resources/token-template.ts`
2. Update extraction prompt in `resources/extraction-prompt.md`
3. Update `system-prompt.md` token extraction section

### Change Build Tools
Edit `system-prompt.md` → Configuration Files section

## 🔗 Quick Links

- **Activate Skill:** `/AIOS:skills:design-system-extractor`
- **Documentation:** See README.md for comprehensive guide
- **Examples:** Check examples/ directory for usage patterns
- **Resources:** Templates and utilities in resources/ directory

## 📊 Skill Metadata

- **Version:** 1.0.0
- **Category:** design
- **Author:** AIOS Core
- **Created:** 2026-02-04
- **Status:** Active

## 🎓 Learning Path

1. Read **README.md** for overview
2. Check **examples/** for usage patterns
3. Review **system-prompt.md** to understand workflow
4. Study **resources/** for templates
5. Practice with real websites to refine extraction

## ⚡ Tips

- Analyze 2-5 pages for best results
- Include different page types (landing, app, dashboard)
- Review extraction report before finalizing
- Customize tokens after generation if needed
- Follow Atomic Design principles for component organization

---

**Ready to extract?** Run `/AIOS:skills:design-system-extractor`
