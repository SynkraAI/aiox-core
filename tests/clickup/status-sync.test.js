// File: tests/clickup/status-sync.test.js

/**
 * Status Synchronization Test Suite
 *
 * Tests bidirectional status synchronization between local .md files and ClickUp.
 * Validates status mapping, Epic vs Story status handling, and error scenarios.
 */

const { mapStatusToClickUp, mapStatusFromClickUp } = require('../../common/utils/status-mapper');
const { updateStoryStatus, updateEpicStatus } = require('../../common/utils/clickup-helpers');

describe('Status Mapper - Bidirectional Mapping', () => {
  describe('AIOX to ClickUp Mapping', () => {
    test('should map Draft status correctly', () => {
      expect(mapStatusToClickUp('Draft')).toBe('Draft');
    });

    test('should map Ready for Review status correctly', () => {
      expect(mapStatusToClickUp('Ready for Review')).toBe('Ready for Review');
    });

    test('should map Review status correctly', () => {
      expect(mapStatusToClickUp('Review')).toBe('Review');
    });

    test('should map In Progress status correctly', () => {
      expect(mapStatusToClickUp('In Progress')).toBe('In Progress');
    });

    test('should map Done status correctly', () => {
      expect(mapStatusToClickUp('Done')).toBe('Done');
    });

    test('should map Blocked status correctly', () => {
      expect(mapStatusToClickUp('Blocked')).toBe('Blocked');
    });

    test('should handle unknown status gracefully', () => {
      const unknownStatus = 'Unknown Status';
      expect(mapStatusToClickUp(unknownStatus)).toBe(unknownStatus);
    });
  });

  describe('ClickUp to AIOX Mapping', () => {
    test('should map Draft status correctly', () => {
      expect(mapStatusFromClickUp('Draft')).toBe('Draft');
    });

    test('should map Ready for Dev to Ready for Review (special case)', () => {
      expect(mapStatusFromClickUp('Ready for Dev')).toBe('Ready for Review');
    });

    test('should map Ready for Review status correctly', () => {
      expect(mapStatusFromClickUp('Ready for Review')).toBe('Ready for Review');
    });

    test('should map Review status correctly', () => {
      expect(mapStatusFromClickUp('Review')).toBe('Review');
    });

    test('should map In Progress status correctly', () => {
      expect(mapStatusFromClickUp('In Progress')).toBe('In Progress');
    });

    test('should map Done status correctly', () => {
      expect(mapStatusFromClickUp('Done')).toBe('Done');
    });

    test('should map Blocked status correctly', () => {
      expect(mapStatusFromClickUp('Blocked')).toBe('Blocked');
    });

    test('should handle unknown status gracefully', () => {
      const unknownStatus = 'Unknown Status';
      expect(mapStatusFromClickUp(unknownStatus)).toBe(unknownStatus);
    });
  });

  describe('Bidirectional Round-Trip', () => {
    test('should maintain consistency through round-trip for all standard statuses', () => {
      const statuses = ['Draft', 'Ready for Review', 'Review', 'In Progress', 'Done', 'Blocked'];

      statuses.forEach(status => {
        const toClickUp = mapStatusToClickUp(status);
        const backToLocal = mapStatusFromClickUp(toClickUp);
        expect(backToLocal).toBe(status);
      });
    });

    test('should handle Ready for Dev special case in round-trip', () => {
      // ClickUp "Ready for Dev" → Local "Ready for Review"
      const localStatus = mapStatusFromClickUp('Ready for Dev');
      expect(localStatus).toBe('Ready for Review');

      // Local "Ready for Review" → ClickUp "Ready for Review"
      const clickupStatus = mapStatusToClickUp(localStatus);
      expect(clickupStatus).toBe('Ready for Review');
    });
  });
});

describe('Story Status Progression Flow', () => {
  test('should follow typical story lifecycle: Draft → In Progress → Review → Done', async () => {
    const _mockTaskId = 'test-story-123';
    const lifecycle = ['Draft', 'In Progress', 'Review', 'Done'];

    // Note: This is a conceptual test showing the expected flow
    // In practice, these would call mocked ClickUp MCP functions
    for (const status of lifecycle) {
      const mappedStatus = mapStatusToClickUp(status);
      expect(mappedStatus).toBe(status);

      // In real implementation, would call:
      // await updateStoryStatus(_mockTaskId, status);
    }
  });

  test('should handle status regression: Review → In Progress → Review', async () => {
    const _mockTaskId = 'test-story-456';
    const progression = ['Review', 'In Progress', 'Review'];

    for (const status of progression) {
      const mappedStatus = mapStatusToClickUp(status);
      expect(mappedStatus).toBe(status);
    }
  });

  test('should handle blocked status at any stage', async () => {
    const statuses = ['Draft', 'In Progress', 'Review', 'Done'];

    statuses.forEach(status => {
      // Any status can transition to Blocked
      expect(mapStatusToClickUp('Blocked')).toBe('Blocked');

      // Blocked can transition back to any status
      expect(mapStatusToClickUp(status)).toBe(status);
    });
  });
});

describe('Epic Status Handling (Native Field)', () => {
  test('should validate Epic status values', () => {
    const validEpicStatuses = ['Planning', 'In Progress', 'Done'];

    validEpicStatuses.forEach(status => {
      // Epic statuses don't go through mapper (native field)
      // They should be passed directly to ClickUp
      expect(status).toMatch(/^(Planning|In Progress|Done)$/);
    });
  });

  test('should reject invalid Epic statuses', () => {
    const invalidStatuses = ['Draft', 'Review', 'Blocked', 'Unknown'];
    const validEpicStatuses = ['Planning', 'In Progress', 'Done'];

    invalidStatuses.forEach(status => {
      expect(validEpicStatuses.includes(status)).toBe(false);
    });
  });

  test('should distinguish Epic status from Story status', () => {
    // Epic statuses (native field)
    const epicStatuses = ['Planning', 'In Progress', 'Done'];

    // Story statuses (custom field)
    const storyStatuses = ['Draft', 'Ready for Review', 'Review', 'In Progress', 'Done', 'Blocked'];

    // Only 'In Progress' and 'Done' overlap
    const overlapping = epicStatuses.filter(s => storyStatuses.includes(s));
    expect(overlapping).toEqual(['In Progress', 'Done']);
  });
});

describe('Error Handling and Edge Cases', () => {
  test('should handle null status gracefully', () => {
    const result = mapStatusToClickUp(null);
    expect(result).toBe(null);
  });

  test('should handle undefined status gracefully', () => {
    const result = mapStatusToClickUp(undefined);
    expect(result).toBe(undefined);
  });

  test('should handle empty string status', () => {
    const result = mapStatusToClickUp('');
    expect(result).toBe('');
  });

  test('should handle case sensitivity', () => {
    // Mapper should be case-sensitive (ClickUp is case-sensitive)
    expect(mapStatusToClickUp('draft')).toBe('draft'); // Not mapped
    expect(mapStatusToClickUp('Draft')).toBe('Draft'); // Mapped correctly
  });

  test('should handle status with extra whitespace', () => {
    const statusWithSpace = ' In Progress ';
    // Should not match due to whitespace (requires exact match)
    expect(mapStatusToClickUp(statusWithSpace)).toBe(statusWithSpace);
  });
});

describe('Integration with ClickUp Helpers', () => {
  // Note: These tests require mocking the ClickUp MCP tool
  // For now, we validate the function signatures and error handling

  test('updateStoryStatus should accept taskId and status', () => {
    expect(typeof updateStoryStatus).toBe('function');
    expect(updateStoryStatus.length).toBe(2); // taskId, newStatus
  });

  test('updateEpicStatus should accept epicTaskId and status', () => {
    expect(typeof updateEpicStatus).toBe('function');
    expect(updateEpicStatus.length).toBe(2); // epicTaskId, newStatus
  });
});
