/**
 * Unit Tests: Phone Resolver
 *
 * Tests fuzzy matching strategies for resolving prospect names to phone numbers.
 *
 * Story: REFACTOR-1 (Consolidate Phone Resolver and WhatsApp Utils)
 */

const { resolvePhoneFromBook, normalizeForComparison } = require('../lib/phone-resolver');

describe('Phone Resolver', () => {
  const mockPhoneBook = {
    contacts: {
      'João Silva': {
        phone: '+5531999887766',
        notes: 'Coach',
      },
      'Maria Oliveira': {
        phone: '+5511988776655',
        notes: 'Freelancer',
      },
      'Pedro Santos': {
        phone: '+5521977665544',
        notes: '',
      },
      'Ana Carolina Ferreira': {
        phone: '+5585966554433',
        notes: 'Designer',
      },
    },
  };

  describe('normalizeForComparison', () => {
    it('should lowercase text', () => {
      expect(normalizeForComparison('JOÃO')).toBe('joao');
    });

    it('should remove accents (NFD normalization)', () => {
      expect(normalizeForComparison('José')).toBe('jose');
      expect(normalizeForComparison('María')).toBe('maria');
      expect(normalizeForComparison('Ñoño')).toBe('nono');
    });

    it('should combine lowercase + accent removal', () => {
      expect(normalizeForComparison('Luís Fábio')).toBe('luis fabio');
    });
  });

  describe('resolvePhoneFromBook - exact match', () => {
    it('should match exact name (case-insensitive)', () => {
      const result = resolvePhoneFromBook('joão silva', mockPhoneBook);
      expect(result).toEqual({
        phone: '+5531999887766',
        method: 'exact',
        notes: 'Coach',
      });
    });

    it('should match exact name with accents', () => {
      const result = resolvePhoneFromBook('Joao Silva', mockPhoneBook);
      expect(result).toEqual({
        phone: '+5531999887766',
        method: 'exact',
        notes: 'Coach',
      });
    });

    it('should match when prospect name is substring of contact', () => {
      const result = resolvePhoneFromBook('João', mockPhoneBook);
      expect(result).toEqual({
        phone: '+5531999887766',
        method: 'exact',
        notes: 'Coach',
      });
    });

    it('should match when contact name is substring of prospect', () => {
      const result = resolvePhoneFromBook('João Silva Santos', mockPhoneBook);
      expect(result).toEqual({
        phone: '+5531999887766',
        method: 'exact',
        notes: 'Coach',
      });
    });
  });

  describe('resolvePhoneFromBook - fuzzy match', () => {
    it('should match when 2+ name parts match', () => {
      // "Ana" + "Ferreira" match contact "Ana Carolina Ferreira"
      const result = resolvePhoneFromBook('Ana Ferreira', mockPhoneBook);
      expect(result).toEqual({
        phone: '+5585966554433',
        method: 'fuzzy',
        notes: 'Designer',
      });
    });

    it('should match when parts are in different order', () => {
      // "Carolina" + "Ana" match contact "Ana Carolina Ferreira"
      const result = resolvePhoneFromBook('Carolina Ana', mockPhoneBook);
      expect(result).toEqual({
        phone: '+5585966554433',
        method: 'fuzzy',
        notes: 'Designer',
      });
    });

    it('should ignore short parts (<= 2 chars)', () => {
      // "A." + "Ferreira" - "A." ignored, only 1 valid part
      // First name "a" is too short (<=2), so no match at all
      const result = resolvePhoneFromBook('A. Ferreira', mockPhoneBook);
      expect(result).toEqual({
        phone: '',
        method: 'none',
        notes: '',
      });
    });
  });

  describe('resolvePhoneFromBook - first-name fallback', () => {
    it('should match by exact when single name matches contact', () => {
      // "Maria" is substring of "Maria Oliveira", so exact match wins
      const result = resolvePhoneFromBook('Maria', mockPhoneBook);
      expect(result).toEqual({
        phone: '+5511988776655',
        method: 'exact',
        notes: 'Freelancer',
      });
    });

    it('should match first name when last name differs', () => {
      // "Pedro" matches "Pedro Santos" by first name
      // (last name "Alves" doesn't match "Santos")
      const result = resolvePhoneFromBook('Pedro Alves', mockPhoneBook);
      expect(result).toEqual({
        phone: '+5521977665544',
        method: 'first-name',
        notes: '',
      });
    });

    it('should not match if first name is too short', () => {
      const result = resolvePhoneFromBook('Jo Silva', mockPhoneBook);
      expect(result).toEqual({
        phone: '',
        method: 'none',
        notes: '',
      });
    });
  });

  describe('resolvePhoneFromBook - no match', () => {
    it('should return empty for completely unknown name', () => {
      const result = resolvePhoneFromBook('Carlos Alberto', mockPhoneBook);
      expect(result).toEqual({
        phone: '',
        method: 'none',
        notes: '',
      });
    });

    it('should return empty for empty name', () => {
      const result = resolvePhoneFromBook('', mockPhoneBook);
      expect(result).toEqual({
        phone: '',
        method: 'none',
        notes: '',
      });
    });

    it('should return empty for null name', () => {
      const result = resolvePhoneFromBook(null, mockPhoneBook);
      expect(result).toEqual({
        phone: '',
        method: 'none',
        notes: '',
      });
    });
  });

  describe('resolvePhoneFromBook - options', () => {
    it('should normalize phone to E.164 when opts.normalize = true', () => {
      // Mock phone book with non-E.164 phone
      const phoneBook = {
        contacts: {
          'Test User': {
            phone: '31999887766',
            notes: '',
          },
        },
      };

      const result = resolvePhoneFromBook('Test User', phoneBook, { normalize: true });
      expect(result.phone).toBe('+5531999887766'); // Normalized
      expect(result.method).toBe('exact');
    });

    it('should not normalize phone when opts.normalize = false (default)', () => {
      const phoneBook = {
        contacts: {
          'Test User': {
            phone: '31999887766',
            notes: '',
          },
        },
      };

      const result = resolvePhoneFromBook('Test User', phoneBook);
      expect(result.phone).toBe('31999887766'); // Not normalized
      expect(result.method).toBe('exact');
    });
  });

  describe('resolvePhoneFromBook - edge cases', () => {
    it('should handle empty phone book', () => {
      const result = resolvePhoneFromBook('João Silva', { contacts: {} });
      expect(result).toEqual({
        phone: '',
        method: 'none',
        notes: '',
      });
    });

    it('should handle invalid phone book', () => {
      const result = resolvePhoneFromBook('João Silva', {});
      expect(result).toEqual({
        phone: '',
        method: 'none',
        notes: '',
      });
    });

    it('should handle missing phone field', () => {
      const phoneBook = {
        contacts: {
          'Test User': {
            notes: 'Test',
          },
        },
      };

      const result = resolvePhoneFromBook('Test User', phoneBook);
      expect(result).toEqual({
        phone: '',
        method: 'exact',
        notes: 'Test',
      });
    });
  });
});
