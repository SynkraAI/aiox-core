---
id: {{source_id}}
type: source
format: {{file_format}}
original_file: "{{original_filename}}"
original_path: "{{original_path}}"
pages: {{page_count}}
duration: {{duration}}
words_extracted: {{word_count}}
concepts_extracted: {{concept_count}}
processed_at: {{processed_at}}
confidence: {{confidence}}
tags: [source, {{format_tag}}]
---

# {{source_title}}

## Metadata

| Property | Value |
|----------|-------|
| Format | {{file_format}} |
| Pages/Duration | {{pages_or_duration}} |
| Words Extracted | {{word_count}} |
| Concepts Found | {{concept_count}} |
| Confidence | {{confidence}} |

## Concepts Extracted

{{#each concepts}}
- [[{{concept_name}}]] ({{extraction_type}}, p.{{page}})
{{/each}}

## Key Passages

{{#each passages}}
### {{passage_title}} (p.{{page}})

> {{passage_text}}

Concepts: {{#each concepts}}[[{{this}}]]{{#unless @last}}, {{/unless}}{{/each}}

{{/each}}

## Processing Notes

- Parser: {{parser_used}}
- Extraction date: {{processed_at}}
- Warnings: {{warnings}}
