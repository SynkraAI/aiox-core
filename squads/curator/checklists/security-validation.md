# Security Validation Checklist — Curator Squad

**Purpose:** Validate security and compliance for data curation operations (web data fetching, source attribution, external API usage)
**Used by:** data-curator, curator-chief
**Version:** 1.0.0
**Adapted from:** ETL security-validation.md

---

## 1. SOURCE ACCESS & ATTRIBUTION

### 1.1 Source Access Rights
- [ ] Legal right to access and reference each source
- [ ] Public data only (no unauthorized access to private content)
- [ ] YouTube content accessed via public API or transcript tools
- [ ] Web articles accessed from public URLs (not behind paywalls)
- [ ] Proper attribution maintained in curadoria.yaml output

### 1.2 Platform Compliance
- [ ] YouTube: Complies with YouTube Terms of Service
- [ ] News sites: Content referenced with proper citation (not copied verbatim)
- [ ] Social media: Posts cited with source URL and author
- [ ] Web scraping: Complies with robots.txt (if applicable)
- [ ] Statistics: Source cited with publication date

### 1.3 Copyright & Fair Use
- [ ] Transcription is for internal curation only (not republication)
- [ ] External data used for enrichment, not reproduction
- [ ] Quotes properly attributed to original speakers
- [ ] No wholesale copying of articles or reports
- [ ] Fair use principles applied (commentary, education, transformation)

---

## 2. DATA INTEGRITY

### 2.1 Source Verification
- [ ] News articles verified from reputable sources (not fabricated)
- [ ] Statistics verified with original publication
- [ ] Dates on external data are current (not stale)
- [ ] No hallucinated data in curadoria output
- [ ] URLs in curadoria.yaml are live and accessible

### 2.2 Transcript Integrity
- [ ] Raw transcript preserved unmodified in _temp/mining/
- [ ] STT corrections only fix sound-alike errors (no content added)
- [ ] Timestamps trace to real source blocks
- [ ] No fabricated quotes attributed to speakers
- [ ] Speaker attribution accurate

### 2.3 Output Integrity
- [ ] momentos.md transcriptions are word-for-word from source
- [ ] No invented text in annotated transcript
- [ ] BRIDGE segments contain actual transcript text
- [ ] Cut scripts reference only real moments
- [ ] Editor guides contain accurate timestamps

---

## 3. EXTERNAL API & TOOL SECURITY

### 3.1 API Usage
- [ ] API keys for external services (EXA, Apify) not hardcoded
- [ ] API keys not logged in plain text in outputs
- [ ] Rate limits respected for all external APIs
- [ ] No sensitive data sent to external search APIs

### 3.2 Web Fetch Security
- [ ] URLs validated before fetching
- [ ] No internal/localhost URLs accessed
- [ ] HTTPS used for all external requests
- [ ] No credential data in fetched URLs
- [ ] Response content validated before use

### 3.3 MCP Tool Security
- [ ] MCP tools used within their documented scope
- [ ] No sensitive project data sent through MCP queries
- [ ] Search queries don't contain API keys or credentials
- [ ] Results validated before incorporation into outputs

---

## 4. FILE HANDLING

### 4.1 Output Path Security
- [ ] Output paths are within project directory (no path traversal)
- [ ] File names sanitized (no special characters that could cause issues)
- [ ] Source slugs follow kebab-case convention
- [ ] No symlink attacks possible
- [ ] Temporary files cleaned up after processing

### 4.2 Sensitive Data in Outputs
- [ ] No API keys in output files
- [ ] No personal information beyond what's in public transcripts
- [ ] No internal system paths exposed in deliverables
- [ ] GUIA_EDITOR files contain only editorial content
- [ ] VALIDATION_REPORT doesn't leak system information

---

## 5. CONTENT SAFETY

### 5.1 Content Filtering
- [ ] Curated data doesn't introduce harmful content
- [ ] External enrichment doesn't inject misleading information
- [ ] No prompt injection risks in curated text
- [ ] Data-curator sources are editorially appropriate
- [ ] Content suitable for intended audience

### 5.2 Misinformation Prevention
- [ ] Facts in curadoria.yaml verifiable with cited source
- [ ] Statistics have publication date and source
- [ ] No outdated statistics presented as current
- [ ] Contradictory data flagged for human review
- [ ] "REAL DATA ONLY" principle enforced

---

## SIGN-OFF

**Review Date:** _______________
**Source:** _______________
**Critical Issues Found:** _______________
**Approved for Delivery:** [ ] YES  [ ] NO

---

**Checklist Version:** 1.0.0
**Last Updated:** 2026-02-07
**Part of:** Curator Squad v3.2.0
