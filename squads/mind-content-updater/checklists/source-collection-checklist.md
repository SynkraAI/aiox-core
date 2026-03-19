# Source Collection Validation Checklist

## Pre-Collection
- [ ] Mind target identified and exists in `squads/mmos-squad/minds/{mind}/`
- [ ] Search queries defined in `config/search-queries.yaml`
- [ ] Content types configured in `config/content-types.yaml`

## Discovery Phase
- [ ] Exa/WebSearch returned results
- [ ] Sources deduplicated against existing `sources_master.yaml`
- [ ] Each source has valid URL and content type

## Collection Phase
- [ ] Content extracted successfully (WebFetch or aios-transcriber)
- [ ] Output saved to correct path: `squads/mmos-squad/minds/{mind}/sources/`
- [ ] Frontmatter applied to each source file
- [ ] File naming follows convention: `{slug}.md` or `{slug}/`

## Post-Collection
- [ ] `sources_master.yaml` updated with new entries
- [ ] No duplicate sources in inventory
- [ ] Discovery report generated
