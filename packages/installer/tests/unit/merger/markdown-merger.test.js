/**
 * @fileoverview Tests for MarkdownMerger
 * Story 9.3: Markdown Merge Implementation
 */

const { MarkdownMerger } = require('../../../src/merger/strategies/markdown-merger.js');
const {
  parseMarkdownSections,
  slugify,
  hasAioxMarkers,
} = require('../../../src/merger/parsers/markdown-section-parser.js');

describe('MarkdownMerger', () => {
  let merger;

  beforeEach(() => {
    merger = new MarkdownMerger();
  });

  describe('canMerge', () => {
    it('should return true for content with AIOX markers', () => {
      const content = `# Title
<!-- AIOX-MANAGED-START: section1 -->
Content
<!-- AIOX-MANAGED-END: section1 -->`;

      expect(merger.canMerge(content, '')).toBe(true);
    });

    it('should return false for content without AIOX markers', () => {
      const content = `# Title
Some content without markers`;

      expect(merger.canMerge(content, '')).toBe(false);
    });
  });

  describe('merge', () => {
    it('should update AIOX-managed sections', async () => {
      const existing = `# My Rules

<!-- AIOX-MANAGED-START: agent-system -->
## Old Agent System
Old content
<!-- AIOX-MANAGED-END: agent-system -->

## My Custom Section
Custom content`;

      const newContent = `# Template

<!-- AIOX-MANAGED-START: agent-system -->
## Agent System
New updated content
<!-- AIOX-MANAGED-END: agent-system -->`;

      const result = await merger.merge(existing, newContent);

      expect(result.content).toContain('## Agent System');
      expect(result.content).toContain('New updated content');
      expect(result.content).toContain('## My Custom Section');
      expect(result.content).toContain('Custom content');
      expect(result.stats.updated).toBe(1);
    });

    it('should preserve user sections', async () => {
      const existing = `# Rules

<!-- AIOX-MANAGED-START: core -->
Core content
<!-- AIOX-MANAGED-END: core -->

## My Custom Rules
1. Rule one
2. Rule two`;

      const newContent = `# Template

<!-- AIOX-MANAGED-START: core -->
Updated core
<!-- AIOX-MANAGED-END: core -->`;

      const result = await merger.merge(existing, newContent);

      expect(result.content).toContain('## My Custom Rules');
      expect(result.content).toContain('1. Rule one');
      expect(result.content).toContain('2. Rule two');
      expect(result.stats.preserved).toBeGreaterThan(0);
    });

    it('should add new AIOX sections that do not exist', async () => {
      const existing = `# Rules

<!-- AIOX-MANAGED-START: core -->
Core content
<!-- AIOX-MANAGED-END: core -->`;

      const newContent = `# Template

<!-- AIOX-MANAGED-START: core -->
Updated core
<!-- AIOX-MANAGED-END: core -->

<!-- AIOX-MANAGED-START: new-section -->
New section content
<!-- AIOX-MANAGED-END: new-section -->`;

      const result = await merger.merge(existing, newContent);

      expect(result.content).toContain('<!-- AIOX-MANAGED-START: new-section -->');
      expect(result.content).toContain('New section content');
      expect(result.stats.added).toBe(1);
    });

    it('should handle files with no AIOX sections', async () => {
      const existing = `# My Custom Rules

## Section 1
Content 1

## Section 2
Content 2`;

      const newContent = `# Template

<!-- AIOX-MANAGED-START: core -->
Core content
<!-- AIOX-MANAGED-END: core -->`;

      const result = await merger.merge(existing, newContent);

      // Should preserve existing content and add AIOX section
      expect(result.content).toContain('## Section 1');
      expect(result.content).toContain('Content 1');
    });
  });

  describe('migrateLegacy', () => {
    it('should append AIOX sections to legacy file', async () => {
      const existing = `# My Old Rules
Custom content here`;

      const template = `# Template

<!-- AIOX-MANAGED-START: core -->
Core content
<!-- AIOX-MANAGED-END: core -->`;

      // migrateLegacy expects a parsed template object, so use merge which handles that
      const result = await merger.merge(existing, template);

      expect(result.content).toContain('# My Old Rules');
      expect(result.content).toContain('Custom content here');
      expect(result.content).toContain('<!-- AIOX-MANAGED-START: core -->');
      expect(result.isLegacyMigration).toBe(true);
    });
  });
});

describe('parseMarkdownSections', () => {
  it('should identify AIOX-managed sections', () => {
    const content = `# Title

<!-- AIOX-MANAGED-START: section1 -->
Managed content
<!-- AIOX-MANAGED-END: section1 -->

## User Section
User content`;

    const result = parseMarkdownSections(content);

    const managedSection = result.sections.find((s) => s.id === 'section1');
    expect(managedSection).toBeDefined();
    expect(managedSection.managed).toBe(true);
    expect(managedSection.lines.join('\n')).toContain('Managed content');
  });

  it('should identify user sections', () => {
    const content = `# Title

<!-- AIOX-MANAGED-START: managed -->
Managed
<!-- AIOX-MANAGED-END: managed -->

## User Section
User content`;

    const result = parseMarkdownSections(content);

    const userSections = result.sections.filter((s) => !s.managed);
    expect(userSections.length).toBeGreaterThan(0);
  });

  it('should handle nested content in managed sections', () => {
    const content = `<!-- AIOX-MANAGED-START: test -->
## Heading
- List item 1
- List item 2

\`\`\`javascript
const code = true;
\`\`\`
<!-- AIOX-MANAGED-END: test -->`;

    const result = parseMarkdownSections(content);

    const section = result.sections.find((s) => s.id === 'test');
    const sectionContent = section.lines.join('\n');
    expect(sectionContent).toContain('## Heading');
    expect(sectionContent).toContain('- List item 1');
    expect(sectionContent).toContain('const code = true');
  });
});

describe('slugify', () => {
  it('should convert text to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should handle special characters', () => {
    expect(slugify('Test & Example!')).toBe('test-example');
  });

  it('should collapse multiple dashes', () => {
    expect(slugify('Multiple   Spaces')).toBe('multiple-spaces');
  });

  it('should trim leading and trailing dashes', () => {
    expect(slugify('  Trimmed  ')).toBe('trimmed');
  });

  it('should handle numbers', () => {
    // Dots are removed, so numbers become consecutive
    expect(slugify('Section 1.2.3')).toBe('section-123');
    // With spaces between numbers
    expect(slugify('Section 1 2 3')).toBe('section-1-2-3');
  });
});

describe('hasAioxMarkers', () => {
  it('should return true for content with AIOX markers', () => {
    const content = `<!-- AIOX-MANAGED-START: test -->
Content
<!-- AIOX-MANAGED-END: test -->`;

    expect(hasAioxMarkers(content)).toBe(true);
  });

  it('should return false for content without markers', () => {
    const content = '# Just a heading\nSome content';

    expect(hasAioxMarkers(content)).toBe(false);
  });

  it('should return false for incomplete markers', () => {
    const content = '<!-- AIOX-MANAGED-START: test -->';

    expect(hasAioxMarkers(content)).toBe(false);
  });
});
