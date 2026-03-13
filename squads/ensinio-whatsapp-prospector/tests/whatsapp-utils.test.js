/**
 * Unit Tests: WhatsApp Utils
 *
 * Tests WhatsApp link generation with different URL formats.
 *
 * Story: REFACTOR-1 (Consolidate Phone Resolver and WhatsApp Utils)
 */

const { generateWhatsAppLink, cleanPhoneForWhatsApp, isValidPhone } = require('../lib/whatsapp-utils');

describe('WhatsApp Utils', () => {
  describe('cleanPhoneForWhatsApp', () => {
    it('should remove spaces', () => {
      expect(cleanPhoneForWhatsApp('+55 31 99988 7766')).toBe('5531999887766');
    });

    it('should remove dashes', () => {
      expect(cleanPhoneForWhatsApp('+55-31-99988-7766')).toBe('5531999887766');
    });

    it('should remove parentheses', () => {
      expect(cleanPhoneForWhatsApp('+55 (31) 99988-7766')).toBe('5531999887766');
    });

    it('should remove + sign (required for WhatsApp URLs)', () => {
      expect(cleanPhoneForWhatsApp('+5531999887766')).toBe('5531999887766');
    });

    it('should remove all non-digit characters including +', () => {
      expect(cleanPhoneForWhatsApp('+55 (31) 9.9988-7766')).toBe('5531999887766');
    });

    it('should return empty for null/undefined', () => {
      expect(cleanPhoneForWhatsApp(null)).toBe('');
      expect(cleanPhoneForWhatsApp(undefined)).toBe('');
    });

    it('should return empty for non-string', () => {
      expect(cleanPhoneForWhatsApp(123456)).toBe('');
    });
  });

  describe('isValidPhone', () => {
    it('should accept valid Brazilian mobile (E.164)', () => {
      expect(isValidPhone('+5531999887766')).toBe(true);
    });

    it('should accept valid Brazilian landline (E.164)', () => {
      expect(isValidPhone('+553133445566')).toBe(true);
    });

    it('should accept valid US number', () => {
      expect(isValidPhone('+14155552671')).toBe(true);
    });

    it('should accept phone with formatting (cleaned internally)', () => {
      expect(isValidPhone('+55 31 99988-7766')).toBe(true);
    });

    it('should reject phone with < 10 digits', () => {
      expect(isValidPhone('+55319998')).toBe(false); // Only 8 digits
    });

    it('should reject empty string', () => {
      expect(isValidPhone('')).toBe(false);
    });

    it('should reject null/undefined', () => {
      expect(isValidPhone(null)).toBe(false);
      expect(isValidPhone(undefined)).toBe(false);
    });

    it('should reject non-string', () => {
      expect(isValidPhone(123456)).toBe(false);
    });
  });

  describe('generateWhatsAppLink - wa.me format (default)', () => {
    it('should generate wa.me link with message', () => {
      const link = generateWhatsAppLink('+5531999887766', 'Olá João!');
      expect(link).toBe('https://wa.me/5531999887766?text=Ol%C3%A1%20Jo%C3%A3o!');
    });

    it('should encode special characters in message', () => {
      const link = generateWhatsAppLink('+5531999887766', 'Olá! Como vai?');
      expect(link).toContain('Ol%C3%A1!%20Como%20vai%3F');
    });

    it('should handle empty message', () => {
      const link = generateWhatsAppLink('+5531999887766', '');
      expect(link).toBe('https://wa.me/5531999887766?text=');
    });

    it('should clean phone before generating link', () => {
      const link = generateWhatsAppLink('+55 31 99988-7766', 'Test');
      expect(link).toBe('https://wa.me/5531999887766?text=Test');
    });

    it('should return empty for invalid phone', () => {
      const link = generateWhatsAppLink('invalid', 'Test');
      expect(link).toBe('');
    });

    it('should return empty for empty phone', () => {
      const link = generateWhatsAppLink('', 'Test');
      expect(link).toBe('');
    });
  });

  describe('generateWhatsAppLink - web format', () => {
    it('should generate web.whatsapp.com link', () => {
      const link = generateWhatsAppLink('+5531999887766', 'Test', { format: 'web' });
      expect(link).toBe('https://web.whatsapp.com/send?phone=5531999887766&text=Test');
    });

    it('should encode message in web format', () => {
      const link = generateWhatsAppLink('+5531999887766', 'Olá!', { format: 'web' });
      expect(link).toContain('text=Ol%C3%A1!');
    });
  });

  describe('generateWhatsAppLink - api format', () => {
    it('should generate api.whatsapp.com link', () => {
      const link = generateWhatsAppLink('+5531999887766', 'Test', { format: 'api' });
      expect(link).toBe('https://api.whatsapp.com/send?phone=5531999887766&text=Test');
    });

    it('should encode message in api format', () => {
      const link = generateWhatsAppLink('+5531999887766', 'Olá!', { format: 'api' });
      expect(link).toContain('text=Ol%C3%A1!');
    });
  });

  describe('generateWhatsAppLink - edge cases', () => {
    it('should default to wa.me for unknown format', () => {
      const link = generateWhatsAppLink('+5531999887766', 'Test', { format: 'unknown' });
      expect(link).toBe('https://wa.me/5531999887766?text=Test');
    });

    it('should handle multiline messages', () => {
      const message = 'Line 1\nLine 2\nLine 3';
      const link = generateWhatsAppLink('+5531999887766', message);
      expect(link).toContain('Line%201%0ALine%202%0ALine%203');
    });

    it('should handle long messages', () => {
      const longMessage = 'a'.repeat(1000);
      const link = generateWhatsAppLink('+5531999887766', longMessage);
      expect(link).toContain('text=' + 'a'.repeat(1000));
    });

    it('should handle emoji in message', () => {
      const link = generateWhatsAppLink('+5531999887766', 'Olá 👋');
      expect(link).toContain('Ol%C3%A1%20%F0%9F%91%8B');
    });

    it('should handle phone without + prefix', () => {
      const link = generateWhatsAppLink('5531999887766', 'Test');
      expect(link).toBe('https://wa.me/5531999887766?text=Test');
    });
  });

  describe('generateWhatsAppLink - all formats consistency', () => {
    const testCases = [
      { format: 'wa.me', expected: 'https://wa.me/' },
      { format: 'web', expected: 'https://web.whatsapp.com/send?phone=' },
      { format: 'api', expected: 'https://api.whatsapp.com/send?phone=' },
    ];

    testCases.forEach(({ format, expected }) => {
      it(`should produce valid ${format} URL`, () => {
        const link = generateWhatsAppLink('+5531999887766', 'Test', { format });
        expect(link).toContain(expected);
        expect(link).toContain('5531999887766');
        expect(link).toContain('Test');
      });
    });
  });
});
