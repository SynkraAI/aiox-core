# @ensinio/whatsapp-parser

Standalone Node.js module for parsing WhatsApp chat exports. Zero dependencies, pure functions, fully typed.

## Features

- 📦 **Zero Dependencies** — Uses only Node.js stdlib
- 🔍 **Smart Parsing** — Detects Android BR and iOS BR formats automatically
- 📱 **Phone Normalization** — Converts to E.164 format
- ✅ **Data Validation** — Comprehensive checks with metrics
- 📝 **Full TypeScript** — Complete type safety with `.d.ts`
- 🧪 **80%+ Coverage** — Comprehensive test suite

## Installation

```bash
npm install @ensinio/whatsapp-parser
```

## Usage

### Parse WhatsApp Export

```typescript
import { parseWhatsAppExport } from '@ensinio/whatsapp-parser';

const result = await parseWhatsAppExport('/path/to/chat-export.zip');
console.log(`Extracted ${result.total_contacts} contacts`);
console.log(result.contacts); // Array of Contact objects
```

### Normalize Phone Numbers

```typescript
import { normalizePhoneNumber } from '@ensinio/whatsapp-parser';

// Brazilian mobile
normalizePhoneNumber('31 99988-7766'); // +5531999887766

// With country code
normalizePhoneNumber('+55 31 99988-7766'); // +5531999887766

// International
normalizePhoneNumber('+14155552671'); // +14155552671
```

### Validate Parsed Data

```typescript
import { validateParsedData } from '@ensinio/whatsapp-parser';

const report = validateParsedData(parsedData);

if (report.status === 'PASS') {
  console.log('Data is valid!');
  console.log(`Phone coverage: ${report.metrics.phone_coverage}`);
} else {
  console.log('Validation failed:');
  report.failed_checks?.forEach(check => {
    console.log(`  - ${check.reason}`);
  });
}
```

## API Reference

### Types

```typescript
interface ParsedExport {
  group_name: string;
  date_range: { start: string; end: string };
  total_messages: number;
  total_contacts: number;
  contacts: Contact[];
}

interface Contact {
  name: string;
  phone: string; // E.164 format
  message_count: number;
  first_message_date: string; // ISO 8601
  last_message_date: string;   // ISO 8601
  messages: Message[];
}

interface Message {
  timestamp: string; // ISO 8601
  content: string;
}

interface ValidationReport {
  status: 'PASS' | 'FAIL';
  blocking_checks: { passed: number; failed: number };
  warning_checks: { passed: number; warnings: number };
  failed_checks?: ValidationCheck[];
  warnings?: string[];
  metrics: ValidationMetrics;
  recommendation: string;
}
```

### Functions

#### `parseWhatsAppExport(zipPath: string): Promise<ParsedExport>`

Parses a WhatsApp chat export ZIP file.

**Parameters:**
- `zipPath` — Absolute path to the ZIP file containing `_chat.txt`

**Returns:** Parsed export with contacts and messages

**Throws:** `ParsingError` if ZIP is invalid or format is not recognized

**Features:**
- Auto-detects Android BR vs iOS BR format
- Filters system messages
- Extracts contact names, phones, messages
- Groups messages by sender
- Handles multi-line messages

#### `normalizePhoneNumber(input: string, options?: PhoneNormalizationOptions): string`

Normalizes phone numbers to E.164 format.

**Parameters:**
- `input` — Phone number in any format (e.g., "31 99988-7766", "+55 31 99988-7766", "5531999887766")
- `options.defaultCountryCode` — Default country code if not provided (default: "55" for Brazil)
- `options.throwOnInvalid` — Throw on invalid format or return null (default: false)

**Returns:** Normalized phone in E.164 format (e.g., "+5531999887766")

**Throws:** `PhoneNormalizationError` if `throwOnInvalid: true` and format is invalid

**Supported Formats:**
- `31 99988-7766` → `+5531999887766`
- `(31) 99988-7766` → `+5531999887766`
- `+55 31 99988-7766` → `+5531999887766`
- `5531999887766` → `+5531999887766`
- `031999887766` → `+5531999887766`
- International: `+1 (415) 555-2671` → `+14155552671`

#### `validateParsedData(data: ParsedExport): ValidationReport`

Validates parsed data against blocking and warning checks.

**Parameters:**
- `data` — ParsedExport object from `parseWhatsAppExport()`

**Returns:** ValidationReport with status, checks results, and metrics

**Blocking Checks:**
1. ZIP integrity
2. Chat file exists
3. File not empty
4. Contacts extracted (>= 1)
5. Messages parsed (>= 10 non-system messages)
6. System messages filtered

**Warning Checks:**
1. Phone coverage >= 50%
2. No duplicate contacts
3. Messages in chronological order
4. Valid encoding (no garbled names)
5. Group metadata present

**Metrics:**
- Total contacts, contacts with phone
- Phone coverage percentage
- Total messages, system messages filtered
- Average messages per contact
- Date range span
- Top 5 most active contacts

## Examples

### Complete Pipeline

```typescript
import {
  parseWhatsAppExport,
  normalizePhoneNumber,
  validateParsedData,
} from '@ensinio/whatsapp-parser';

// Step 1: Parse
const parsed = await parseWhatsAppExport('./export.zip');
console.log(`Extracted ${parsed.total_contacts} contacts`);

// Step 2: Validate
const report = validateParsedData(parsed);
if (report.status !== 'PASS') {
  throw new Error(`Validation failed: ${report.recommendation}`);
}
console.log(`Phone coverage: ${report.metrics.phone_coverage}`);

// Step 3: Process contacts
for (const contact of parsed.contacts) {
  // Normalize phone if not already E.164
  const normalized = normalizePhoneNumber(contact.phone);
  console.log(`${contact.name}: ${normalized} (${contact.message_count} messages)`);
}
```

### Error Handling

```typescript
import { parseWhatsAppExport, ParsingError } from '@ensinio/whatsapp-parser';

try {
  const result = await parseWhatsAppExport('./export.zip');
} catch (error) {
  if (error instanceof ParsingError) {
    console.error(`Parsing failed: ${error.message}`);
    console.error(`Code: ${error.code}`);
    console.error(`Severity: ${error.severity}`);
  }
}
```

## Supported Formats

### Android Brazil
```
DD/MM/YYYY HH:MM - Nome: Mensagem
25/03/2025 14:30 - João Silva: Olá, como vai?
```

### iOS Brazil
```
[DD/MM/YYYY HH:MM:SS] Nome: Mensagem
[25/03/2025 14:30:25] João Silva: Olá, como vai?
```

### System Messages (Filtered)
- "Mensagens e chamadas são protegidas com a criptografia"
- "criou o grupo"
- "adicionou"/"saiu"/"removeu"
- "mudou o ícone/descrição/assunto"
- "apagou esta mensagem"
- "<Mídia oculta>"

## Phone Number Formats

### E.164 Standard
`+[country_code][area_code][number]`

### Brazil
- **Mobile:** `+55[DDD]9[XXXX][XXXX]` (13 digits after +)
- **Landline:** `+55[DDD][XXXX][XXXX]` (12 digits after +)

## Testing

```bash
npm test                 # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

## Development

```bash
npm install
npm run build           # Compile TypeScript
npm run typecheck       # Type checking
npm run lint            # Linting
```

## License

MIT

## Contributing

See CONTRIBUTING.md for guidelines.
