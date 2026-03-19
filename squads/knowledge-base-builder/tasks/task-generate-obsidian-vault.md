# Task: Generate Obsidian Vault

**Task ID:** knowledge-base-builder/generate-obsidian-vault
**Version:** 1.0.0
**Status:** Production Ready
**Created:** 2026-02-13
**Category:** Phase 2 - App Generation

---

## Executive Summary

This task generates a complete, ready-to-use Obsidian vault from the Phase 1 knowledge base data. The vault includes wikilinked concept notes, topic Maps of Content, source reference notes, learning paths, templates, and a Dataview-powered dashboard.

**Workflow Position:** Step 2.1b of Phase 2 (parallel with Next.js generation)
**Success Definition:** Vault opens in Obsidian without errors, wikilinks resolve
**Output Quality Gate:** KB-OBS-001 to KB-OBS-006

---

## Executor Type

**Agent (100%)**
- Agent generates all Markdown files, frontmatter, and configuration

---

## Inputs

```yaml
knowledge_base_path:
  field: "Path to Phase 1 knowledge base"
  format: "Absolute file path"
  required: true

options:
  plugins:
    dataview: true
    templater: true
    graph_analysis: false
    spaced_repetition: false
  publish: false
```

---

## Action Items

### Step 1: Vault Structure
1. Create directory structure:
   ```
   vault/
     Concepts/
     Topics/
     Sources/
     Learning Paths/
     Quizzes/
     Templates/
     .obsidian/
   ```
2. Create `.obsidian/app.json` with recommended settings
3. Create `.obsidian/appearance.json` with theme config
4. Create `.obsidian/graph.json` with color groups by tag

### Step 2: Concept Notes
For each concept in concepts.json:
1. Create `Concepts/{Concept Name}.md`
2. Generate YAML frontmatter:
   ```yaml
   ---
   id: cpt-001
   aliases: [alternative names]
   tags: [concept, category/subcategory, difficulty]
   category: "Category/Subcategory"
   difficulty: beginner|intermediate|advanced|expert
   status: verified
   sources: 3
   created: 2026-02-13
   completed: false
   ---
   ```
3. Generate sections:
   - Definition (from best_definition)
   - Key Points (bullet list)
   - Related Concepts (as `[[wikilinks]]`)
   - Examples (with source citations)
   - Sources (as `[[Sources/filename|location]]`)
   - Personal Notes (empty section for user)
4. Include extraction confidence in footer

### Step 3: Topic Notes (Maps of Content)
For each taxonomy category:
1. Create `Topics/{Category Name}.md`
2. Frontmatter with category metadata
3. Overview paragraph describing the topic
4. List of concepts as wikilinks, grouped by subcategory
5. Difficulty progression within topic
6. Related topics as wikilinks

### Step 4: Source Notes
For each source document:
1. Create `Sources/{Source Name}.md`
2. Frontmatter: format, pages/duration, original path
3. List of concepts extracted from this source
4. Key passages with block quote formatting
5. Processing metadata (confidence, extraction date)

### Step 5: Learning Path Notes
For each navigation path:
1. Create `Learning Paths/{Path Name}.md`
2. Description of the path and who it is for
3. Ordered list of concepts with checkboxes:
   ```markdown
   - [ ] [[Concept 1]] - Start here
   - [ ] [[Concept 2]] - Builds on Concept 1
   - [ ] [[Concept 3]] - Apply your knowledge
   ```
4. Previous/Next navigation between path notes

### Step 6: Quiz Notes
For each quiz section:
1. Create `Quizzes/{Topic} Quiz.md`
2. Use callout blocks for hidden answers:
   ```markdown
   > [!question] What is supervised learning?
   > > [!success]- Answer
   > > Supervised learning is a type of ML where...
   > > Source: [[Sources/textbook-ch3|p.12]]
   ```
3. Mix question types: definition recall, relationship, application

### Step 7: Special Notes
1. **Index.md**: Master MOC linking to all topics and paths
2. **Glossary.md**: A-Z list of all concepts with brief definitions and wikilinks
3. **Dashboard.md**: Dataview queries:
   ```dataview
   TABLE difficulty, status, sources
   FROM "Concepts"
   SORT file.name ASC
   ```
   ```dataview
   LIST
   FROM "Concepts"
   WHERE completed = true
   ```

### Step 8: Templates
1. `Templates/concept-template.md`: For adding new concepts manually
2. `Templates/topic-template.md`: For adding new topics
3. `Templates/source-template.md`: For adding new source references

### Step 9: Obsidian Configuration
1. `community-plugins.json`: List recommended plugins (dataview, templater)
2. `graph.json`: Configure graph color groups:
   - Green: concepts
   - Blue: topics
   - Orange: sources
   - Purple: learning paths

---

## Output

```yaml
output:
  vault_directory:
    path: "{output_path}/obsidian-vault/"
    contains:
      - "Concepts/*.md (one per concept)"
      - "Topics/*.md (one per category)"
      - "Sources/*.md (one per source document)"
      - "Learning Paths/*.md (one per path)"
      - "Quizzes/*.md (one per topic)"
      - "Templates/*.md (3 templates)"
      - "Index.md"
      - "Glossary.md"
      - "Dashboard.md"
      - ".obsidian/ (configuration)"
```

---

## Acceptance Criteria

- [ ] Vault opens in Obsidian v1.5+ without errors
- [ ] >= 95% wikilinks resolve to existing notes
- [ ] All notes have valid YAML frontmatter
- [ ] Graph view shows nodes and connections
- [ ] Dataview queries on Dashboard return results
- [ ] Templates are usable (Templater-compatible)
- [ ] Index.md links to all topics
- [ ] Glossary.md contains all concepts alphabetically
- [ ] Source notes correctly reference concept extractions
