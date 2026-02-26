---
paths:
  - .aios-core/data/tool-registry.yaml
  - .mcp.json
---
# Tool Response Filtering — Dynamic Token Reduction

When processing responses from MCP tools or large web fetches, apply the filter
configuration defined in `.aios-core/data/tool-registry.yaml` for the tool that
produced the response. This reduces context token consumption without losing
task-relevant information.

## Filter Types

### content
Extract the main informational content and discard noise (navigation, ads,
boilerplate, repetitive headers/footers). Limit the extracted output to
approximately `max_tokens` tokens, truncating at a natural paragraph or
sentence boundary. If `extract` fields are specified, prioritize those
fields from the response object.

**Apply to:** WebFetch HTML responses, EXA search results, Context7 docs.

### schema
From a JSON object or array of objects, select ONLY the fields listed in
`fields`. Discard all other keys. If `max_tokens` is set, truncate the
serialized result at that token limit.

**Apply to:** Playwright page data, API responses with known schemas.

### field
From an array of objects (tabular data), project ONLY the columns listed
in `fields` and limit the result to `max_rows` rows. This is analogous to
`SELECT field1, field2 FROM data LIMIT max_rows`.

**Apply to:** Apify scraper results, database query results, CSV-like data.

## How to Apply

1. After receiving a tool response, identify the tool name.
2. Look up the tool in `tool-registry.yaml` → check for a `filter` key.
3. If a filter exists, apply the corresponding type rules above.
4. If NO filter exists for the tool, use the full response as-is.
5. Present the filtered result in your reasoning — do NOT repeat the raw
   unfiltered payload.

## Fallback

If the filter would remove ALL content (empty result), fall back to the
full unfiltered response. Never produce an empty result from filtering.

## Performance Note

This is a zero-overhead optimization. The filter is applied during your
reasoning step — no external scripts are invoked. The utility scripts at
`.aios-core/utils/filters/` are available for batch post-processing of
saved responses but are NOT required during normal tool use.
