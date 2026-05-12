# PM Adapters

Project Management tool adapters for AIOX. Enables story synchronization with various PM tools.

## Available Adapters

| Adapter | File | Description |
|---------|------|-------------|
| ClickUp | `clickup-adapter.js` | Full integration with ClickUp |
| GitHub Projects | `github-adapter.js` | GitHub Projects v2 integration |
| Jira | `jira-adapter.js` | Basic Jira integration |
| Local | `local-adapter.js` | Standalone mode (no external PM) |

## Usage

```javascript
const { getPMAdapter, isPMToolConfigured } = require('../scripts/pm-adapter-factory');

// Check if PM tool is configured
if (isPMToolConfigured()) {
  const adapter = getPMAdapter();

  // Sync story
  const result = await adapter.syncStory(storyPath);

  // Get story updates
  const updates = await adapter.pullStoryUpdates(storyId);
}
```

## Configuration

PM tool is configured via `.aiox-pm-config.yaml` in the project root:

```yaml
pmTool: clickup  # Options: clickup, github, jira, local
credentials:
  # Tool-specific credentials
```

If no configuration exists, Local adapter is used by default.

## Adapter Interface

All adapters extend `PMAdapter` and implement:

- `getName()` - Returns adapter name
- `syncStory(storyPath)` - Sync story to PM tool
- `pullStoryUpdates(storyId)` - Pull updates from PM tool
- `updateStoryStatus(storyId, status)` - Update story status

## Adding New Adapters

1. Create `new-adapter.js` extending `PMAdapter`
2. Implement required methods
3. Register in `pm-adapter-factory.js`
4. Add to adapter map in factory

See existing adapters for implementation examples.
