# Task: Parse Chat Export

## Task Anatomy
- **task_name:** parse-chat-export
- **status:** active
- **responsible_executor:** chat-parser (Cipher)
- **execution_type:** Module-based (uses @ensinio/whatsapp-parser)
- **implementation:** `squads/ensinio-whatsapp-prospector/lib/parse-chat-export-impl.js`
- **input:** ZIP file path containing WhatsApp export
- **output:** Structured JSON with contacts and messages

## Integration Note (AC-5)

This task now uses the `@ensinio/whatsapp-parser` module for all parsing logic.
See **Story M0.1-AC5** for integration details.

**Module API:**
```javascript
const { parseWhatsAppExport, validateParsedData } = require('@ensinio/whatsapp-parser');

// Parse ZIP file
const result = await parseWhatsAppExport(zipPath);

// Validate result
const validation = validateParsedData(result);
```

**Implementation File:**
- `lib/parse-chat-export-impl.js` — Wraps module with error handling and recovery

## Action Items

### Step 1: Extract ZIP
1. Unzip the provided file to a temporary directory
2. Locate the `_chat.txt` file (main chat export)
3. Note any media files present (for reference only)

### Step 2: Parse Chat File
1. Read the `_chat.txt` file
2. Detect the format variant (Android BR, iOS BR, etc.)
3. Parse each line extracting:
   - Timestamp (date + time)
   - Sender name
   - Message content
4. Handle multi-line messages (continuation lines without timestamp)
5. Filter out system messages:
   - "Mensagens e chamadas sao protegidas com a criptografia"
   - "criou o grupo"
   - "adicionou"/"saiu"/"removeu"
   - "mudou o icone/descricao/assunto"
   - "apagou esta mensagem"
   - "<Midia oculta>"

### Step 3: Group by Contact
1. Group all messages by sender name
2. For each contact, extract:
   - Name (as it appears in WhatsApp)
   - Phone number (from contact name if format is +55XXXXXXXXXXX, or from vCard if available)
   - All messages with timestamps
   - Total message count
   - First and last message dates
3. Sort contacts by message count (descending)

### Step 4: Extract Group Metadata
1. Identify group name from system messages or ZIP filename
2. Calculate date range of the export
3. Count total messages and unique contacts

### Step 5: Output
Generate structured data with schema defined in Output Example section.

## Acceptance Criteria
- ZIP file successfully extracted
- All contacts have at least name and messages
- Phone numbers are in international format when available
- System messages are excluded from contact message counts
- Messages are chronologically ordered per contact
- Date range accurately reflects first and last message timestamps

## Veto Conditions

| Condition | Severity | Resolution |
|-----------|----------|------------|
| ZIP file does not exist or is corrupted | BLOCKING | Verify file path and file integrity |
| No _chat.txt file found in ZIP | BLOCKING | Verify this is a WhatsApp export (valid format) |
| File is empty (0 bytes) | BLOCKING | Request user to re-export chat with all messages |
| Format not auto-detected (requires manual regex) | WARNING | Trigger handle-parse-errors task for manual format detection |

## Output Example

```json
{
  "group_name": "Nome do Grupo",
  "date_range": { "start": "2025-01-01", "end": "2026-02-19" },
  "total_messages": 5000,
  "total_contacts": 150,
  "contacts": [
    {
      "name": "Joao",
      "phone": "+5531999999999",
      "message_count": 45,
      "first_message_date": "2025-03-15",
      "last_message_date": "2026-01-20",
      "messages": [
        { "timestamp": "2025-03-15T14:30:00", "content": "..." }
      ]
    }
  ]
}
```

## Error Handling
- **ZIP corruption:** HALT with error, trigger handle-parse-errors
- **Missing _chat.txt:** HALT with error, trigger handle-parse-errors
- **Empty file:** HALT with error, trigger handle-parse-errors
- **Unknown format:** Trigger handle-parse-errors for recovery attempt
- **Encoding issues:** Trigger handle-parse-errors with encoding_error type
- **Partial parsing:** If >70% success, continue with WARNING; if <70%, HALT

## Completion Criteria
All contacts extracted, phones normalized, system messages filtered, validation ready. Output JSON matches schema and can be consumed by validate-parsed-data task.
