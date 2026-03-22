# Playwright Deep Research Workflow

## Overview

This workflow uses browser automation via Playwright MCP to query multiple LLMs (Grok, Claude.ai, Gemini) for deep research when traditional search methods don't achieve sufficient coverage.

## Prerequisites

1. Playwright MCP must be installed and configured
2. User must be logged into the target LLMs in their browser
3. Browser session must be accessible to Playwright

## Workflow Phases

### Phase 1: Pre-flight Checks

Before starting deep research:

```
1. Verify Playwright MCP is available:
   - Test: mcp__playwright__browser_navigate to https://example.com
   - Expected: Navigation succeeds without error

2. If MCP unavailable:
   - Log: "[PLAYWRIGHT] MCP not available - skipping deep research"
   - Return: { error: "playwright_unavailable", skip_reason: "MCP not configured" }
```

### Phase 2: Grok Workflow

```yaml
llm: grok
url: https://grok.x.ai
timeout: 60s
```

**Execution Steps:**

```
1. NAVIGATE to https://grok.x.ai
   Tool: mcp__playwright__browser_navigate
   Args: { url: "https://grok.x.ai" }

2. WAIT for page load (2-3 seconds)

3. SNAPSHOT page to check login state
   Tool: mcp__playwright__browser_snapshot

4. CHECK LOGIN STATE:
   - Look for: user menu, avatar, profile indicator
   - Selectors (try in order):
     a. [data-testid='user-menu']
     b. img[alt*='avatar']
     c. [class*='user-profile']

   IF NOT LOGGED IN:
     - Screenshot the page for evidence
     - Return: {
         llm: "grok",
         error: "not_logged_in",
         message: "Please log into Grok at grok.x.ai and try again",
         screenshot: "screenshot-grok-login-required.png"
       }

5. LOCATE CHAT INPUT:
   Selectors (try in order):
   a. textarea[placeholder*='Ask']
   b. textarea
   c. [contenteditable='true']

   IF NOT FOUND:
     - Log: "[GROK] Chat input not found - selectors may have changed"
     - Screenshot for debugging
     - Return error with screenshot

6. TYPE QUERY:
   Tool: mcp__playwright__browser_type
   Args: {
     element: <found_input_selector>,
     text: "{query}",
     submit: false
   }

7. LOCATE AND CLICK SUBMIT:
   Selectors (try in order):
   a. button[type='submit']
   b. button[aria-label*='Send']
   c. button:has-text('Send')

   Tool: mcp__playwright__browser_click
   Args: { element: <found_button_selector> }

8. WAIT FOR RESPONSE:
   - Poll every 2 seconds for response container
   - Max wait: 60 seconds
   - Selectors for response:
     a. [data-testid='message-content']
     b. .message-content
     c. [class*='response']

   Signs response is complete:
   - Stop button disappears
   - Response container stops growing
   - "Copy" button appears

9. EXTRACT RESPONSE TEXT:
   Tool: mcp__playwright__browser_snapshot
   Parse: Extract text from response container

10. SCREENSHOT FOR EVIDENCE:
    Tool: mcp__playwright__browser_take_screenshot
    Save to: {output_dir}/screenshot-grok.png

11. RETURN RESULT:
    {
      llm: "grok",
      success: true,
      response: "<extracted_text>",
      timestamp: "<ISO_timestamp>",
      screenshot: "screenshot-grok.png",
      selector_used: {
        input: "<which_selector_worked>",
        submit: "<which_selector_worked>",
        response: "<which_selector_worked>"
      }
    }
```

### Phase 3: Claude.ai Workflow

```yaml
llm: claude
url: https://claude.ai
timeout: 60s
```

**Execution Steps:**

Same structure as Grok, with Claude-specific selectors:

```
INPUT SELECTORS (try in order):
a. div[contenteditable='true']
b. [data-testid='chat-input']
c. textarea

SUBMIT SELECTORS:
a. button[aria-label='Send message']
b. button[type='submit']
c. button:has-text('Send')

RESPONSE SELECTORS:
a. [data-testid='assistant-message']
b. .assistant-message
c. [class*='response']

LOGIN INDICATORS:
a. button[data-testid='account-menu']
b. [class*='user-menu']
c. img[alt*='avatar']
```

**Special Considerations for Claude:**
- May need to click "New conversation" first
- Response may stream in chunks
- Look for "Stop generating" button to know when still processing

### Phase 4: Gemini Workflow

```yaml
llm: gemini
url: https://gemini.google.com
timeout: 60s
```

**Execution Steps:**

Same structure as Grok, with Gemini-specific selectors:

```
INPUT SELECTORS (try in order):
a. rich-textarea
b. textarea
c. [contenteditable='true']

SUBMIT SELECTORS:
a. button[aria-label='Send message']
b. button[type='submit']
c. button:has-text('Submit')

RESPONSE SELECTORS:
a. .model-response-text
b. [class*='response']
c. [class*='message-content']

LOGIN INDICATORS:
a. img[data-testid='user-avatar']
b. [class*='user-avatar']
c. img[alt*='Account']
```

**Special Considerations for Gemini:**
- Uses rich-textarea component (custom element)
- May need to handle Google account selection modal
- Response formatting may differ from other LLMs

### Phase 5: Aggregation

After collecting responses from all LLMs:

```python
def aggregate_results(results: dict) -> dict:
    """
    Aggregate and synthesize results from multiple LLMs.

    Input: {
      "grok": { success: bool, response: str, ... },
      "claude": { success: bool, response: str, ... },
      "gemini": { success: bool, response: str, ... }
    }

    Output: {
      "successful_llms": ["grok", "claude", "gemini"],
      "failed_llms": [],
      "consensus_points": [...],
      "divergent_points": [...],
      "synthesis": "..."
    }
    """

    successful = {k: v for k, v in results.items() if v.get('success')}
    failed = {k: v for k, v in results.items() if not v.get('success')}

    if len(successful) == 0:
        return {
            "error": "all_llms_failed",
            "failures": failed
        }

    # Extract key points from each response
    # (This would be done by LLM analysis)

    # Find consensus (mentioned by 2+ LLMs)
    # Find divergence (different recommendations)

    return aggregated_result
```

**Consensus Detection Criteria:**
- Same technique/approach mentioned by 2+ LLMs
- Similar numbers/statistics cited
- Same tools/libraries recommended

**Divergence Detection Criteria:**
- Conflicting recommendations
- Different priority ordering
- Unique insights from single LLM

### Phase 6: Output Generation

Generate the output file:

```markdown
# LLM Deep Research: {query}

**Date:** {timestamp}
**Query:** {original_query}
**LLMs Consulted:** {successful_llms}
**Failed LLMs:** {failed_llms} (if any)

---

## 1. Grok (X.AI)

{grok_response}

**Evidence:** [Screenshot](./screenshot-grok.png)

---

## 2. Claude (Anthropic)

{claude_response}

**Evidence:** [Screenshot](./screenshot-claude.png)

---

## 3. Gemini (Google)

{gemini_response}

**Evidence:** [Screenshot](./screenshot-gemini.png)

---

## 4. Synthesis & Comparison

### Consensus Points
- {point where all agree}
- {another consensus point}

### Divergent Views
| Topic | Grok | Claude | Gemini |
|-------|------|--------|--------|
| {topic1} | {view} | {view} | {view} |
| {topic2} | {view} | {view} | {view} |

### Reliability Assessment
- **Highest confidence:** {topics where all agree}
- **Needs verification:** {topics with divergent views}

---

*Generated by tech-research Playwright Deep Research phase*
*Timestamp: {generation_timestamp}*
```

## Error Handling

### Graceful Degradation Rules

1. **One LLM fails:** Continue with others, note in output
2. **Two LLMs fail:** Continue with remaining, add warning
3. **All LLMs fail:** Return error, suggest manual research

### Common Errors and Mitigations

| Error | Cause | Mitigation |
|-------|-------|------------|
| `not_logged_in` | User session expired | Prompt user to log in |
| `selector_not_found` | UI changed | Try fallback selectors |
| `timeout` | LLM slow to respond | Increase timeout, retry |
| `captcha_detected` | Bot detection | Use existing browser session |
| `rate_limited` | Too many requests | Add delay between LLMs |

### Logging

Log all selector attempts for debugging:

```
[2026-02-11T15:30:00] [GROK] Trying selector: textarea[placeholder*='Ask'] - FOUND
[2026-02-11T15:30:01] [GROK] Trying submit: button[type='submit'] - NOT FOUND
[2026-02-11T15:30:01] [GROK] Trying submit: button[aria-label*='Send'] - FOUND
[2026-02-11T15:30:02] [GROK] Query submitted, waiting for response...
[2026-02-11T15:30:45] [GROK] Response detected (43s)
[2026-02-11T15:30:46] [GROK] Screenshot saved: screenshot-grok.png
```

## Integration with tech-research Skill

This workflow integrates as Phase 3.7 in the tech-research pipeline:

```
Existing Pipeline:
  0. Auto-Clarify
  1. Clarify (if needed)
  1.5. Decompose
  2. Generate Prompt
  3. Execute Research (parallel sub-queries)
  3.2. Deep Read
  3.5. Evaluate Coverage
  3.6. Compress Wave

NEW:
  3.7. Playwright Deep Research (if coverage < 70% OR --deep flag)

Continue:
  4. Synthesize
  4.5. Verify Citations
  5. Document
```

### Trigger Conditions

```yaml
# Auto-trigger when:
- coverage_score < 0.70 after wave 2
- confidence_score < 0.60 on key topics

# Manual trigger when:
- User passes --deep flag
- User passes *deep command
- Query contains "multiple perspectives", "compare LLMs", etc.
```

## Testing

### Test Query

```
"What are the best practices for RAG in 2026?"
```

### Expected Results

1. All 3 LLMs respond (assuming logged in)
2. Screenshots captured for each
3. Consensus on: chunking strategies, embedding models, re-ranking
4. Possible divergence on: specific tools, chunk sizes, hybrid approaches
