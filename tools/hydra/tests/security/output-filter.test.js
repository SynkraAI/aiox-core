import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  scanPII,
  redactPII,
  detectCopyright,
  filterOutput,
} from '../../src/security/output-filter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const piiSamples = JSON.parse(
  readFileSync(resolve(__dirname, '..', '__fixtures__', 'security', 'pii-samples.json'), 'utf-8')
);

// ========== scanPII ==========

describe('scanPII', () => {
  test('detects email addresses', () => {
    for (const email of piiSamples.emails) {
      const result = scanPII(`Contact ${email} for info`);
      expect(result.found).toBe(true);
      expect(result.types).toContain('email');
    }
  });

  test('detects Brazilian phone numbers', () => {
    for (const phone of piiSamples.phones_br) {
      const result = scanPII(`Call ${phone}`);
      expect(result.found).toBe(true);
      expect(result.types).toContain('phone_br');
    }
  });

  test('detects international phone numbers', () => {
    for (const phone of piiSamples.phones_intl) {
      const result = scanPII(`Call ${phone}`);
      expect(result.found).toBe(true);
    }
  });

  test('detects CPF numbers', () => {
    for (const cpf of piiSamples.cpf) {
      const result = scanPII(`CPF: ${cpf}`);
      expect(result.found).toBe(true);
      expect(result.types).toContain('cpf');
    }
  });

  test('detects CNPJ numbers', () => {
    for (const cnpj of piiSamples.cnpj) {
      const result = scanPII(`CNPJ: ${cnpj}`);
      expect(result.found).toBe(true);
      expect(result.types).toContain('cnpj');
    }
  });

  test('detects credit card numbers', () => {
    for (const cc of piiSamples.credit_cards) {
      const result = scanPII(`Card: ${cc}`);
      expect(result.found).toBe(true);
      expect(result.types).toContain('credit_card');
    }
  });

  test('detects US SSN', () => {
    for (const ssn of piiSamples.ssn_us) {
      const result = scanPII(`SSN: ${ssn}`);
      expect(result.found).toBe(true);
      expect(result.types).toContain('ssn_us');
    }
  });

  test('detects IP addresses in non-technical domains', () => {
    const result = scanPII('Server at 192.168.1.100', ['business']);
    expect(result.found).toBe(true);
    expect(result.types).toContain('ip_address');
  });

  test('does NOT flag IPs in technical domains', () => {
    const result = scanPII('Connect to 192.168.1.100', ['engenharia']);
    expect(result.types).not.toContain('ip_address');
  });

  test('does NOT flag IPs in ai-ml domain', () => {
    const result = scanPII('Server at 10.0.0.1', ['ai-ml']);
    expect(result.types).not.toContain('ip_address');
  });

  test('ignores safe content', () => {
    for (const safe of piiSamples.safe_content) {
      const result = scanPII(safe);
      expect(result.found).toBe(false);
    }
  });

  test('handles null input', () => {
    expect(scanPII(null).found).toBe(false);
  });
});

// ========== redactPII ==========

describe('redactPII', () => {
  test('redacts email addresses', () => {
    const { text, redactedCount } = redactPII('Contact user@example.com for info');
    expect(text).toContain('[PII REDACTED]');
    expect(text).not.toContain('user@example.com');
    expect(redactedCount).toBeGreaterThan(0);
  });

  test('redacts CPF numbers', () => {
    const { text } = redactPII('CPF: 123.456.789-00');
    expect(text).toContain('[PII REDACTED]');
    expect(text).not.toContain('123.456.789-00');
  });

  test('redacts multiple PII types in one text', () => {
    const { text, redactedCount } = redactPII(
      'Email: test@test.com, Phone: (11) 98765-4321, CPF: 123.456.789-00'
    );
    expect(redactedCount).toBeGreaterThanOrEqual(3);
    expect(text).not.toContain('test@test.com');
    expect(text).not.toContain('98765-4321');
  });

  test('does not redact IPs in technical domains', () => {
    const { text } = redactPII('Connect to 192.168.1.1', ['engenharia']);
    expect(text).toContain('192.168.1.1');
  });

  test('handles empty input', () => {
    expect(redactPII('').text).toBe('');
    expect(redactPII(null).text).toBe('');
  });
});

// ========== detectCopyright ==========

describe('detectCopyright', () => {
  test('detects copyright symbol', () => {
    expect(detectCopyright('\u00A9 2024 Company').detected).toBe(true);
  });

  test('detects (c) notation', () => {
    expect(detectCopyright('(c) 2024 Author').detected).toBe(true);
  });

  test('detects "all rights reserved"', () => {
    expect(detectCopyright('Content. All Rights Reserved.').detected).toBe(true);
  });

  test('detects "proprietary"', () => {
    expect(detectCopyright('This is proprietary content.').detected).toBe(true);
  });

  test('does not flag normal text', () => {
    expect(detectCopyright('This is a normal article about technology.').detected).toBe(false);
  });

  test('handles null', () => {
    expect(detectCopyright(null).detected).toBe(false);
  });
});

// ========== filterOutput (integration) ==========

describe('filterOutput', () => {
  test('redacts PII from insights', () => {
    const data = {
      insights: [
        { insight: 'Contact user@example.com for details', confidence: 4 },
        { insight: 'AI is transforming healthcare', confidence: 5 },
      ],
      summary: ['Summary of the article'],
      quotes: ['A famous quote'],
    };

    const result = filterOutput(data);
    expect(result.piiDetected).toBe(true);
    expect(result.piiCount).toBeGreaterThan(0);
    expect(result.data.insights[0].insight).toContain('[PII REDACTED]');
    expect(result.data.insights[1].insight).toBe('AI is transforming healthcare');
  });

  test('removes quotes containing PII', () => {
    const data = {
      insights: [],
      summary: [],
      quotes: [
        'Call (11) 98765-4321 for more info',
        'Clean quote without PII',
      ],
    };

    const result = filterOutput(data);
    expect(result.data.quotes).toHaveLength(1);
    expect(result.data.quotes[0]).toBe('Clean quote without PII');
  });

  test('detects copyright notices', () => {
    const data = {
      insights: [{ insight: 'All rights reserved by the author', confidence: 3 }],
      summary: [],
      quotes: [],
    };

    const result = filterOutput(data);
    expect(result.copyrightNotice).toBe(true);
  });

  test('handles string-type insights', () => {
    const data = {
      insights: ['Contact test@test.com', 'Normal insight'],
      summary: [],
      quotes: [],
    };

    const result = filterOutput(data);
    expect(result.data.insights[0]).toContain('[PII REDACTED]');
    expect(result.data.insights[1]).toBe('Normal insight');
  });

  test('handles null input', () => {
    const result = filterOutput(null);
    expect(result.piiDetected).toBe(false);
  });
});
