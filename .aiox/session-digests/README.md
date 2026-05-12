# Session Digests Storage

Este diretório armazena digests de sessões capturados antes do context compact.

## Estrutura de Arquivos

**Naming Convention:**
```
{session-id}-{timestamp}.yaml
```

**Exemplo:**
```
session-abc123-2026-02-09T18-30-45-123Z.yaml
```

---

## Schema YAML (v1.0)

### Frontmatter

```yaml
---
schema_version: "1.0"         # Schema version (for evolution)
session_id: "session-abc123"  # Unique session identifier
timestamp: "2026-02-09T18:30:45.123Z"  # Digest creation time
duration_minutes: 45          # Session duration in minutes
agent_context: "@dev implementing Story MIS-3"  # Active agent/story
compact_trigger: "context_limit_90%"  # Reason for compact
---
```

### Body

```markdown
## User Corrections

- "Actually, the path should be `.aiox/sessions/` not `.aiox-sessions/`"
- "Tests should expect `null`, not objects"

## Patterns Observed

- Pattern: "Test expectations must match implementation changes"
- Pattern: "Always verify consumer count before removing modules"

## Axioms Learned

- Axiom: "Hooks unified require runners/ directory to function"
- Axiom: "CodeRabbit integration catches regressions early"

## Context Snapshot

**Active Agent:** @dev
**Active Story:** MIS-3
**Files Modified:** hook-interface.js, precompact-runner.js
**Commands Executed:** npm test, git add
```

---

## Schema Evolution

**Version Handling:**

- **v1.0:** Initial schema (schema_version field + 4 body sections)
- **Future versions:** Increment schema_version, maintain backward compatibility

**Backward Compatibility:**

Readers MUST handle older schema versions gracefully:

```javascript
function readDigest(filePath) {
  const digest = parseYAML(filePath);
  const version = digest.schema_version || "1.0";

  if (version === "1.0") {
    return parseV1(digest);
  } else if (version === "2.0") {
    return parseV2(digest);
  } else {
    throw new Error(`Unsupported schema version: ${version}`);
  }
}
```

---

## Storage Lifecycle

- **Created:** By PreCompact hook before context compact
- **Read:** By MIS-4 (Progressive Memory Retrieval) for context injection
- **Retention:** No automatic cleanup (managed by user or future MIS stories)

---

## Security

- **Content:** No sensitive data (only conversation patterns, not raw messages)
- **Access:** Local filesystem only (`.aiox/` is gitignored)
- **Privacy:** Session content never leaves local machine

---

*Schema Documentation - Story MIS-3*
*Created: 2026-02-09*
