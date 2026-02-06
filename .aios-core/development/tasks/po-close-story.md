# PO Task: Close Story

**Agent:** @po
**Command:** `*close-story`
**Purpose:** Close a completed story, update epic/backlog, and suggest next story
**Created:** 2026-02-05 (Story PRO-5 retrospective)

---

## Overview

This task closes the PO story lifecycle that begins with `*validate-story-draft`. After a story is implemented, tested, and merged, this task:

1. Marks the story as **Done**
2. Updates the **Epic index** with completion status
3. Adds **changelog entry** with merge/PR info
4. Updates **backlog** counts and statistics
5. **Suggests next story** from the same epic or backlog

**Lifecycle:**
```
*validate-story-draft (START) --> Development --> PR/Merge --> *close-story (END)
        |                                                            |
        v                                                            v
   Story: Draft -> Approved                              Story: Done + Next suggested
```

---

## Execution Modes

**Choose your execution mode:**

### 1. YOLO Mode - Fast, Autonomous (0-1 prompts)
- Autonomous updates with logging
- Minimal user interaction
- **Best for:** Simple story closures with clear PR info

### 2. Interactive Mode - Balanced, Educational (5-10 prompts) **[DEFAULT]**
- Confirms each update before applying
- Educational explanations
- **Best for:** Learning, first-time users

### 3. Pre-Flight Planning - Comprehensive Upfront Planning
- Analyzes story, epic, and backlog state first
- Shows complete plan before execution
- **Best for:** Complex epics, critical milestones

**Parameter:** `mode` (optional, default: `interactive`)

---

## Task Definition (AIOS Task Format V1.0)

```yaml
task: poCloseStory()
responsável: Pax (Balancer)
responsavel_type: Agente
atomic_layer: Organism

**Entrada:**
- campo: story_path
  tipo: string
  origem: User Input
  obrigatório: true
  validação: Must be valid story file path

- campo: pr_number
  tipo: number
  origem: User Input
  obrigatório: false
  validação: Valid PR number if provided

- campo: commit_sha
  tipo: string
  origem: User Input
  obrigatório: false
  validação: Valid git SHA (7+ chars)

- campo: mode
  tipo: string
  origem: User Input
  obrigatório: false
  validação: yolo|interactive|pre-flight

**Saída:**
- campo: story_updated
  tipo: boolean
  destino: Story file
  persistido: true

- campo: epic_updated
  tipo: boolean
  destino: Epic index file
  persistido: true

- campo: next_story_suggestion
  tipo: object
  destino: User output
  persistido: false
```

---

## Pre-Conditions

**Purpose:** Validate prerequisites BEFORE task execution (blocking)

**Checklist:**

```yaml
pre-conditions:
  - [ ] Story file exists at provided path
    tipo: pre-condition
    blocker: true
    validação: File exists and is readable
    error_message: "Story file not found at: {story_path}"

  - [ ] Story status is NOT already 'Done'
    tipo: pre-condition
    blocker: false
    validação: Status field != Done
    error_message: "Story already marked as Done"

  - [ ] Epic index file exists (if story belongs to epic)
    tipo: pre-condition
    blocker: false
    validação: EPIC-*-INDEX.md exists in same directory
    error_message: "Epic index not found - story updates only"
```

---

## Post-Conditions

**Purpose:** Validate execution success AFTER task completes

**Checklist:**

```yaml
post-conditions:
  - [ ] Story Status field updated to 'Done'
    tipo: post-condition
    blocker: true
    validação: Status: Done in story frontmatter
    error_message: "Failed to update story status"

  - [ ] Changelog entry added with date and author
    tipo: post-condition
    blocker: true
    validação: New row in Change Log table
    error_message: "Failed to add changelog entry"
```

---

## Acceptance Criteria

**Purpose:** Definitive pass/fail criteria for task completion

**Checklist:**

```yaml
acceptance-criteria:
  - [ ] Story marked as Done with PR/commit reference
    tipo: acceptance-criterion
    blocker: true

  - [ ] Epic index updated (if applicable)
    tipo: acceptance-criterion
    blocker: false

  - [ ] Next story suggestion provided
    tipo: acceptance-criterion
    blocker: false
```

---

## Task Flow

### 1. Elicit Story and Merge Info

```yaml
elicit: true
questions:
  - Story path (relative to docs/stories/):
    input: text
    validation: File must exist
    example: "epics/epic-pro-aios-pro-architecture/story-pro-5-repo-bootstrap.md"

  - PR number (optional):
    input: text
    validation: Numeric or empty
    example: "84"

  - Merge commit SHA (optional):
    input: text
    validation: 7+ hex chars or empty
    example: "ce19c81a"

  - Additional notes for changelog (optional):
    input: textarea
    example: "CodeRabbit approved with 0 findings"
```

### 2. Read and Parse Story

```javascript
// Load story file
const storyPath = path.join('docs/stories', userInput.storyPath);
const storyContent = fs.readFileSync(storyPath, 'utf8');

// Extract metadata
const metadata = parseStoryFrontmatter(storyContent);
const epicId = extractEpicId(storyPath); // e.g., "PRO" from epic-pro-*
const storyId = metadata.storyId; // e.g., "PRO-5"

// Verify not already done
if (metadata.status === 'Done') {
  console.warn('⚠️ Story already marked as Done');
  // Continue anyway to update other fields
}
```

### 3. Update Story Status and Changelog

```javascript
// Update Status field
const updatedStory = storyContent.replace(
  /\*\*Status:\*\* .+/,
  '**Status:** Done'
);

// Add changelog entry
const today = new Date().toISOString().split('T')[0];
const version = getNextVersion(storyContent); // e.g., "1.3"
const prInfo = pr_number ? `PR #${pr_number}` : '';
const commitInfo = commit_sha ? `(commit ${commit_sha})` : '';
const notes = userInput.notes || '';

const changelogEntry = `| ${today} | ${version} | ${prInfo} merged ${commitInfo}. ${notes} Story closed. | Pax (@po) |`;

// Insert before last row of changelog table
const finalStory = insertChangelogEntry(updatedStory, changelogEntry);

// Write back
fs.writeFileSync(storyPath, finalStory);
console.log('✅ Story updated: Status → Done, Changelog added');
```

### 4. Update Epic Index (if applicable)

```javascript
if (epicId) {
  const epicIndexPath = findEpicIndex(storyPath);

  if (epicIndexPath) {
    const epicContent = fs.readFileSync(epicIndexPath, 'utf8');

    // Update story status in table (Draft/Approved → Done)
    let updatedEpic = epicContent.replace(
      new RegExp(`\\| ${storyId} \\| [📋🔄] \\w+`, 'g'),
      `| ${storyId} | ✅ Done`
    );

    // Update Epic status if all stories done
    const storiesRemaining = countPendingStories(updatedEpic);
    const totalStories = countTotalStories(updatedEpic);
    const completedStories = totalStories - storiesRemaining;

    if (storiesRemaining === 0) {
      updatedEpic = updatedEpic.replace(
        /\*\*Status:\*\* .+/,
        '**Status:** Complete'
      );
    } else {
      updatedEpic = updatedEpic.replace(
        /\*\*Status:\*\* .+/,
        `**Status:** Implementation In Progress (${completedStories}/${totalStories} stories done)`
      );
    }

    // Update review checkboxes if applicable
    updatedEpic = updateReviewStatus(updatedEpic, '@po', 'checked');

    fs.writeFileSync(epicIndexPath, updatedEpic);
    console.log(`✅ Epic index updated: ${completedStories}/${totalStories} complete`);
  }
}
```

### 5. Suggest Next Story

```javascript
// Find next story in epic
if (epicId) {
  const nextStory = findNextPendingStory(epicIndexPath, storyId);

  if (nextStory) {
    console.log('\n## 🎯 Suggested Next Story\n');
    console.log(`**${nextStory.id}:** ${nextStory.title}`);
    console.log(`**Status:** ${nextStory.status}`);
    console.log(`**Owner:** ${nextStory.owner}`);
    console.log(`**File:** ${nextStory.file}`);
    console.log('\n**Quick Actions:**');
    console.log(`- Validate: \`*validate-story-draft ${nextStory.file}\``);
    console.log(`- View: \`Read ${nextStory.file}\``);
  } else {
    console.log('\n## 🎉 Epic Complete!\n');
    console.log(`All stories in Epic ${epicId} are done.`);
    console.log('\n**Quick Actions:**');
    console.log('- Review backlog: `*backlog-review`');
    console.log('- Start new epic: `@pm *create-epic`');
  }
}
```

### 6. Update Backlog Statistics (optional)

```javascript
// Update docs/stories/backlog.md statistics if applicable
const backlogPath = 'docs/stories/backlog.md';
if (fs.existsSync(backlogPath)) {
  // Increment completed stories count
  // Update last updated date
  // Add to resolved items if story was in backlog
}
```

### 7. Summary Output

```markdown
## ✅ Story Closed: ${storyId}

**Story:** ${storyTitle}
**Status:** Done
**PR:** #${pr_number} (${commit_sha})
**Changelog:** v${version} added

### Epic Progress
**Epic:** ${epicId}
**Progress:** ${completedStories}/${totalStories} stories complete
**Status:** ${epicStatus}

### Next Steps
${nextStorySuggestion}

---
— Pax, equilibrando prioridades 🎯
```

---

## Error Handling

- **Story not found:** Show available stories in directory
- **Epic index not found:** Update story only, skip epic updates
- **PR not found:** Allow closing without PR info (manual merge)
- **Write permission denied:** Show manual update instructions

---

## Example Usage

```bash
# Interactive mode (recommended)
*close-story epics/epic-pro-aios-pro-architecture/story-pro-5-repo-bootstrap.md

# With PR info
*close-story story-pro-5-repo-bootstrap.md --pr 84 --commit ce19c81a

# YOLO mode for quick closure
*close-story story-pro-5.md --mode yolo
```

---

## Integration Points

**Complements:**
- `*validate-story-draft` - Start of story lifecycle (validation)
- `*close-story` - End of story lifecycle (closure)

**Related Tasks:**
- `po-backlog-add.md` - Add items discovered during closure
- `po-stories-index.md` - Regenerate story index after closure
- `po-sync-story.md` - Sync closed story to PM tool

---

## Testing

```bash
# Test with sample story
*close-story epics/epic-test/story-test-1.md --pr 999 --commit abc1234

# Verify:
# - Story status changed to Done
# - Changelog entry added
# - Epic index updated (if applicable)
# - Next story suggested
```

---

## Metadata

```yaml
story: PRO-5 retrospective
version: 1.0.0
dependencies:
  - validate-next-story.md
tags:
  - product-management
  - story-lifecycle
  - epic-management
created_at: 2026-02-05
updated_at: 2026-02-05
```

---

**Related Tasks:**
- `validate-next-story.md` - Validates story before implementation (START)
- `po-close-story.md` - Closes story after merge (END)
- `po-backlog-review.md` - Review backlog for sprint planning
