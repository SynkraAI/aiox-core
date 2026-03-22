# Smart Browser Playwright

AI-powered browser automation via Stagehand + OpenAI.
Navega sites de forma inteligente, extrai dados, contorna erros, e pede ajuda quando trava.

## Activation

Triggers: "smart browser", "navegar site", "extrair dados de site", "browser inteligente", "scrape inteligente"

## Usage

When this skill is activated, execute the appropriate command based on user intent:

### Mode 1: Full Agent (autonomous task)
```bash
cd tools/smart-browser-playwright && node run.js --task "<user's natural language task>"
```

### Mode 2: Navigate + Act (step by step actions)
```bash
cd tools/smart-browser-playwright && node run.js --interactive
```

## Options

| Flag | Description |
|------|-------------|
| `--task, -t` | Natural language task for autonomous agent |
| `--url, -u` | URL to navigate to |
| `--extract, -e` | What to extract (use with --url) |
| `--model, -m` | Model (default: openai/gpt-4o-mini) |
| `--headed` | Show browser window (default) |
| `--headless` | Hide browser window |
| `--interactive, -i` | Step-by-step mode with human input |
| `--timeout` | Max time in ms (default: 120000) |

## Examples

```bash
# Extract trending repos from GitHub
node run.js --task "go to github.com/trending and extract top 10 repos with name, description, and stars"

# Extract top stories from Hacker News
node run.js --task "go to news.ycombinator.com and extract the top 5 stories with title and points"

# Interactive exploration
node run.js --interactive

# Use a smarter model (costs more)
node run.js --task "..." --model "openai/gpt-4o"
```

## Configuration

Edit `tools/smart-browser-playwright/.env`:
```
OPENAI_API_KEY=sk-proj-...
SMART_BROWSER_MODEL=openai/gpt-4o-mini
SMART_BROWSER_HEADLESS=false
```

## How It Works

1. **You give rules** in natural language ("extract top 3 stories")
2. **Stagehand analyzes the DOM** — accessibility tree + chunks + ranks elements
3. **LLM decides** which element matches your intent (via OpenAI)
4. **Executes action** — click, type, scroll, extract
5. **Caches result** — next run on same site is faster
6. **On error** — retries with different strategy. In interactive mode, asks you.

## Cost

- Tool: free (open-source Stagehand)
- LLM: **~$0.001-0.005 per task** with gpt-4o-mini
- 100 tasks/day = ~$0.15/day (~R$0.80/dia)
- With gpt-4o (smarter): ~$0.01-0.05 per task

## Important Notes

- Stagehand v3 requires **OpenAI API directly** (not OpenRouter — structured outputs incompatible)
- Model format must be `openai/model-name` (e.g., `openai/gpt-4o-mini`)
- The `agent` mode is most reliable for complex multi-step tasks
- The `act` method works for single actions
- The `extract` method in v3.2 returns raw DOM — use `agent` mode for extraction instead
