/**
 * Phone Number Resolver
 *
 * Resolves prospect names to phone numbers using fuzzy matching strategies.
 * Integrates with @ensinio/whatsapp-parser for phone normalization.
 */

const { normalizePhoneNumber } = require('@ensinio/whatsapp-parser');

/**
 * Normalize text for comparison (lowercase + remove accents)
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
function normalizeForComparison(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Resolve phone number from phone book using fuzzy matching
 *
 * Algorithm (in order):
 * 1. Exact match: contact name contains prospect name (or vice versa)
 * 2. Multi-part fuzzy: ≥2 name parts match contact name
 * 3. First-name fallback: contact name starts with first name
 *
 * @param {string} name - Prospect name to resolve
 * @param {Object} phoneBook - Phone book object with contacts
 * @param {Object} [opts] - Options
 * @param {boolean} [opts.normalize] - Normalize phone to E.164 (default: false)
 * @returns {Object} Result with { phone, method, notes }
 *
 * @example
 * const phoneBook = { contacts: { 'João Silva': { phone: '+5531999887766', notes: 'Coach' } } };
 * resolvePhoneFromBook('Joao da Silva', phoneBook);
 * // { phone: '+5531999887766', method: 'exact', notes: 'Coach' }
 */
function resolvePhoneFromBook(name, phoneBook, opts = {}) {
  const { normalize = false } = opts;

  if (!name || typeof name !== 'string') {
    return { phone: '', method: 'none', notes: '' };
  }

  if (!phoneBook || !phoneBook.contacts || typeof phoneBook.contacts !== 'object') {
    return { phone: '', method: 'none', notes: '' };
  }

  const nameLower = normalizeForComparison(name);
  const contacts = phoneBook.contacts;

  // Strategy 1: Exact or contains match
  for (const [contactName, contactData] of Object.entries(contacts)) {
    const cLower = normalizeForComparison(contactName);
    if (cLower.includes(nameLower) || nameLower.includes(cLower)) {
      const rawPhone = contactData.phone || '';
      const phone = normalize ? normalizePhoneNumber(rawPhone) : rawPhone;
      return {
        phone,
        method: 'exact',
        notes: contactData.notes || '',
      };
    }
  }

  // Strategy 2: Multi-part fuzzy match (≥2 parts)
  const nameParts = nameLower.split(/\s+/).filter(p => p.length > 2);
  if (nameParts.length > 0) {
    for (const [contactName, contactData] of Object.entries(contacts)) {
      const cLower = normalizeForComparison(contactName);
      const matched = nameParts.filter(p => cLower.includes(p));
      if (matched.length >= 2) {
        const rawPhone = contactData.phone || '';
        const phone = normalize ? normalizePhoneNumber(rawPhone) : rawPhone;
        return {
          phone,
          method: 'fuzzy',
          notes: contactData.notes || '',
        };
      }
    }
  }

  // Strategy 3: First-name fallback
  const firstName = nameLower.split(/\s+/)[0];
  if (firstName && firstName.length > 2) {
    for (const [contactName, contactData] of Object.entries(contacts)) {
      const cLower = normalizeForComparison(contactName);
      if (cLower.startsWith(firstName)) {
        const rawPhone = contactData.phone || '';
        const phone = normalize ? normalizePhoneNumber(rawPhone) : rawPhone;
        return {
          phone,
          method: 'first-name',
          notes: contactData.notes || '',
        };
      }
    }
  }

  // No match found
  return { phone: '', method: 'none', notes: '' };
}

module.exports = {
  resolvePhoneFromBook,
  normalizeForComparison,
};
