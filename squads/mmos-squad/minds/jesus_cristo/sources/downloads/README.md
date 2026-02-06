# Biblical Sources - Downloads Directory

This directory contains **external biblical source texts** downloaded from public domain repositories for the **jesus_cristo mind** project.

## Quick Summary

**Total Downloads:** 16 gospel texts + 4 full Bible files
**Total Size:** 22 MB
**Languages:** Portuguese (Brazilian) and English
**Translations:** 4 different Bible translations
**License:** All public domain (except NVI - see notes)

---

## Downloaded Gospel Texts

### Portuguese Translations (12 files)

#### Almeida Corrigida e Fiel (ACF) - RECOMMENDED PRIMARY SOURCE
- `acf_mt.txt` - Mateus (Matthew) - 28 chapters
- `acf_mc.txt` - Marcos (Mark) - 16 chapters
- `acf_lc.txt` - Lucas (Luke) - 24 chapters
- `acf_jo.txt` - João (John) - 21 chapters

**Why ACF:** Classical Portuguese, widely used, public domain, formal language.

#### Nova Versão Internacional (NVI)
- `nvi_mt.txt` - Mateus (Matthew) - 28 chapters
- `nvi_mc.txt` - Marcos (Mark) - 16 chapters
- `nvi_lc.txt` - Lucas (Luke) - 24 chapters
- `nvi_jo.txt` - João (John) - 21 chapters

**Why NVI:** Modern Portuguese, contemporary language, accessible.
**LICENSE WARNING:** Creative Commons BY-NC (non-commercial use only).

#### Almeida Revisada (AA)
- `aa_mt.txt` - Mateus (Matthew) - 28 chapters
- `aa_mc.txt` - Marcos (Mark) - 16 chapters
- `aa_lc.txt` - Lucas (Luke) - 24 chapters
- `aa_jo.txt` - João (John) - 21 chapters

**Why AA:** Balanced between classical and modern Portuguese.

### English Translation (4 files)

#### King James Version (KJV)
- `kjv_matthew.txt` - Matthew - 28 chapters
- `kjv_mark.txt` - Mark - 16 chapters
- `kjv_luke.txt` - Luke - 24 chapters
- `kjv_john.txt` - John - 21 chapters

**Why KJV:** Classic English, public domain, literary masterpiece, historical significance.

---

## Full Bible Archives

These files contain the complete Bible and were used for gospel extraction:

- `acf_full.json` (3.8 MB) - Complete ACF Bible
- `nvi_full.json` (3.8 MB) - Complete NVI Bible
- `aa_full.json` (3.8 MB) - Complete AA Bible
- `kjv_full.txt` (4.2 MB) - Complete KJV Bible

**Note:** Keep these files for future extraction of additional books (Acts, Epistles, Old Testament, etc.).

---

## File Format

All extracted gospel files follow this structure:

```
# [Gospel Name]
## Translation: [TRANSLATION CODE]
## Abbreviation: [abbrev]

## Chapter 1

1. [Verse text...]
2. [Verse text...]
...
```

**Encoding:** UTF-8
**Line Endings:** Unix (LF)
**Structure:** Markdown headers with numbered verses

---

## Source Information

### Portuguese Bibles
- **Repository:** [thiagobodruk/biblia](https://github.com/thiagobodruk/biblia)
- **Format:** JSON (UTF-8 with BOM)
- **License:** ACF and AA are public domain; NVI is Creative Commons BY-NC

### English Bible
- **Source:** [Project Gutenberg](https://www.gutenberg.org/ebooks/10)
- **Format:** Plain Text (UTF-8)
- **License:** Public Domain

---

## Extraction Scripts

Two Python scripts are included for re-extraction or additional book extraction:

1. **`extract_gospels.py`** - Extracts Portuguese gospels from JSON files
2. **`extract_kjv_gospels.py`** - Extracts English gospels from KJV text

**Usage:**
```bash
python3 extract_gospels.py      # Extract Portuguese gospels
python3 extract_kjv_gospels.py  # Extract English gospels
```

---

## Metadata & Documentation

- **`download_log.md`** - Complete download log with sources, dates, and metadata
- **`README.md`** - This file (quick reference)

---

## Recommended Usage for jesus_cristo Mind

1. **Primary Source:** Use ACF (Almeida Corrigida e Fiel) for Portuguese
2. **Comparison:** Cross-reference with NVI and AA for linguistic variations
3. **English Reference:** Use KJV for English comparisons and translations
4. **Next Steps:**
   - Process texts into RAG knowledge base
   - Create embeddings for semantic search
   - Build context-aware retrieval system

---

## Gospel Coverage

Each translation includes the complete **Four Gospels**:

| Gospel | Portuguese Name | Chapters | Focus |
|--------|----------------|----------|-------|
| Matthew | Mateus | 28 | Jesus as Messiah/King |
| Mark | Marcos | 16 | Jesus as Servant |
| Luke | Lucas | 24 | Jesus as Man |
| John | João | 21 | Jesus as God |

**Total:** 89 chapters per Portuguese translation, 92 chapters in KJV (John has 21, not 24).

---

## License Compliance

### Public Domain (Safe to Use):
- ACF (Almeida Corrigida e Fiel) ✓
- AA (Almeida Revisada) ✓
- KJV (King James Version) ✓

### Requires Verification:
- NVI (Nova Versão Internacional) - Creative Commons BY-NC
  - **Action Required:** Confirm non-commercial use for jesus_cristo mind
  - If commercial use is planned, consult license or remove NVI

---

## File Statistics

```
Portuguese Gospel Files: 12 files
English Gospel Files:     4 files
Full Bible Archives:      4 files
Total Files:            20 files
Total Size:             22 MB
```

---

## Next Actions

- [ ] Integrate gospel texts into jesus_cristo RAG knowledge base
- [ ] Create text embeddings for semantic search
- [ ] Verify NVI license compliance for project usage
- [ ] Optional: Extract additional books (Acts, Epistles, Psalms, etc.)
- [ ] Optional: Download Greek/Hebrew original language texts

---

**Download Date:** 2025-10-06
**Downloaded By:** @analyst (Claude Code AIOS)
**Task:** TASK-R08 - Download External Biblical Sources

For complete documentation, see `download_log.md`.
