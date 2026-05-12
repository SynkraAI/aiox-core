# AI Providers

Multi-provider AI integration for AIOX. Supports Claude Code and Gemini CLI with automatic fallback and task-based routing.

## Architecture

```
ai-providers/
├── ai-provider.js           # Base abstract class
├── claude-provider.js       # Claude Code implementation
├── gemini-provider.js       # Gemini CLI implementation
├── ai-provider-factory.js   # Factory with routing and fallback
└── index.js                 # Module exports
```

## Usage

### Basic Usage

```javascript
const { getPrimaryProvider, executeWithFallback } = require('./ai-providers');

// Get primary provider from config
const provider = getPrimaryProvider();
const response = await provider.execute('Write a hello world function');

// Execute with automatic fallback
const response = await executeWithFallback('Explain this code');
```

### Task-Based Routing

```javascript
const { getProviderForTask } = require('./ai-providers');

// Get optimal provider for task type
const provider = getProviderForTask('code_generation'); // Returns Gemini (faster)
const provider = getProviderForTask('security');        // Returns Claude (deeper reasoning)
```

### Direct Provider Access

```javascript
const { ClaudeProvider, GeminiProvider } = require('./ai-providers');

// Claude
const claude = new ClaudeProvider({ model: 'claude-3-5-sonnet' });
const response = await claude.execute('Explain this function');

// Gemini with JSON output
const gemini = new GeminiProvider({ jsonOutput: true });
const response = await gemini.executeJson('List 5 best practices');
```

### Check Provider Status

```javascript
const { getProvidersStatus } = require('./ai-providers');

const status = await getProvidersStatus();
console.log(status);
// {
//   claude: { available: true, version: '1.0.0', ... },
//   gemini: { available: true, version: '0.27.0', ... }
// }
```

## Configuration

Create `.aiox-ai-config.yaml` in project root:

```yaml
ai_providers:
  primary: claude
  fallback: gemini
  routing:
    simple_tasks: gemini
    complex_tasks: claude

claude:
  model: claude-3-5-sonnet
  timeout: 300000

gemini:
  model: gemini-2.0-flash
  previewFeatures: true
```

## Provider Comparison

| Feature | Claude | Gemini |
|---------|--------|--------|
| Best for | Complex reasoning, security | Speed, cost efficiency |
| JSON output | Manual parsing | Native `--output-format json` |
| Cost | Higher | ~4x cheaper (Flash) |
| SWE-bench | ~70% | 78% (Flash) |

## Epic Reference

- **Epic:** GEMINI-INT
- **Story:** Story 2 - AI Provider Factory Pattern
- **Status:** Completed
