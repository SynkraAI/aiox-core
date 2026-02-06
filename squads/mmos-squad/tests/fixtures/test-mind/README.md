# MMOS Test Fixtures

Test fixtures for MMOS Squad testing and validation.

## Files

### sample-sources.json
Sample source configurations for testing the source extraction pipeline.
Contains examples of:
- YouTube videos
- Blog articles
- PDF documents
- Excel spreadsheets

### sample-extraction.json
Sample extraction results representing successful source processing.
Used for testing:
- Result parsing
- Data transformation
- Storage operations

### sample-mind-data.json
Complete mind mapping data structure for testing synthesis and export.
Includes:
- Subject information
- Pattern definitions
- Mental models
- Synthesis summary

## Usage

```javascript
const path = require('path');
const fs = require('fs');

// Load fixtures
const fixturesPath = path.join(__dirname, 'fixtures/test-mind');
const sources = JSON.parse(fs.readFileSync(
  path.join(fixturesPath, 'sample-sources.json')
));
```

## Story Reference
- STORY-10.6: MMOS Testing & Validation
