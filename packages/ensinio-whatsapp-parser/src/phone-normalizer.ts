/**
 * Phone Number Normalizer
 * Converts phone numbers to E.164 format for international use
 */

import { PhoneNormalizationError, PhoneNormalizationOptions } from './types';

// E.164 format: +[country_code][number]
// Country codes: 1 (US/Canada), 55 (Brazil), 44 (UK), 33 (France), etc.

const BRAZIL_COUNTRY_CODE = '55';
const DEFAULT_COUNTRY_CODE = BRAZIL_COUNTRY_CODE;

/**
 * Strips all non-digit characters from a string
 * Preserves leading + if present
 * @param input - Phone number string
 * @returns String with only digits and optional leading +
 */
function stripNonDigits(input: string): string {
  const hasPlus = input.startsWith('+');
  const digitsOnly = input.replace(/\D/g, '');
  return hasPlus ? '+' + digitsOnly : digitsOnly;
}

/**
 * Validates Brazilian mobile number format
 * Mobile: +55[DDD]9[XXXX][XXXX] (13 digits after +55)
 * @param number - Digits only, starting with 55
 * @returns True if valid Brazilian mobile
 */
function isValidBrazilianMobile(number: string): boolean {
  // Total 13 digits: 55 (country) + 2 (DDD) + 9 (mobile indicator) + 8 (number)
  if (number.length !== 13) {
    return false;
  }

  if (!number.startsWith('55')) {
    return false;
  }

  // Check if 3rd digit (after DDD) is 9 (mobile indicator)
  const thirdDigit = number.charAt(4);
  return thirdDigit === '9';
}

/**
 * Validates Brazilian landline number format
 * Landline: +55[DDD][XXXX][XXXX] (12 digits after +55)
 * @param number - Digits only, starting with 55
 * @returns True if valid Brazilian landline
 */
function isValidBrazilianLandline(number: string): boolean {
  // Total 12 digits: 55 (country) + 2 (DDD) + 8 (number)
  if (number.length !== 12) {
    return false;
  }

  if (!number.startsWith('55')) {
    return false;
  }

  // Landline should NOT have 9 as 3rd digit
  const thirdDigit = number.charAt(4);
  return thirdDigit !== '9';
}

/**
 * Validates if a number is valid E.164 format for Brazil
 * @param number - Normalized number with + prefix
 * @returns True if valid
 */
function isValidBrazilian(number: string): boolean {
  if (!number.startsWith('+55')) {
    return false;
  }

  const digitsOnly = number.slice(1); // Remove +
  return isValidBrazilianMobile(digitsOnly) || isValidBrazilianLandline(digitsOnly);
}

/**
 * Validates if a number is valid E.164 format (international)
 * Basic check: starts with +, followed by 10-15 digits
 * @param number - Normalized number with + prefix
 * @returns True if valid E.164
 */
function isValidE164(number: string): boolean {
  if (!number.startsWith('+')) {
    return false;
  }

  const digitsOnly = number.slice(1); // Remove +
  const digitCount = digitsOnly.length;

  // E.164 allows 1-15 digits after +
  return digitCount >= 1 && digitCount <= 15 && /^\d+$/.test(digitsOnly);
}

/**
 * Handles Brazilian phone number formats
 * Converts various Brazilian input formats to E.164
 * @param input - Phone number in any Brazilian format
 * @returns Normalized number in E.164 format
 */
function normalizeBrazilian(input: string): string {
  const cleaned = stripNonDigits(input);

  // Handle different input patterns
  let normalized = cleaned;

  // If starts with 0, remove it (old format)
  if (normalized.startsWith('0')) {
    normalized = normalized.slice(1);
  }

  // If doesn't start with 55 or +, prepend +55
  if (!normalized.startsWith('55') && !normalized.startsWith('+55')) {
    normalized = '55' + normalized;
  }

  // Ensure + prefix
  if (!normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }

  return normalized;
}

/**
 * Normalizes an international phone number to E.164 format
 * Handles:
 * - Brazilian formats: "31 99988-7766", "(31) 99988-7766", "5531999887766", etc.
 * - International: "+1 (415) 555-2671", "+44 20 XXXX XXXX", etc.
 *
 * @param input - Phone number in any format
 * @param options - Normalization options
 * @returns Phone number in E.164 format (e.g., "+5531999887766")
 * @throws PhoneNormalizationError if format is invalid and throwOnInvalid is true
 *
 * @example
 * normalizePhoneNumber('31 99988-7766') // '+5531999887766'
 * normalizePhoneNumber('+55 31 99988-7766') // '+5531999887766'
 * normalizePhoneNumber('5531999887766') // '+5531999887766'
 * normalizePhoneNumber('+1 415 555 2671') // '+14155552671'
 */
export function normalizePhoneNumber(
  input: string,
  options: PhoneNormalizationOptions = {}
): string {
  const {
    defaultCountryCode = DEFAULT_COUNTRY_CODE,
    throwOnInvalid = false,
  } = options;

  if (!input || typeof input !== 'string') {
    const error = new PhoneNormalizationError(
      'Phone number input is required and must be a string',
      input || ''
    );
    if (throwOnInvalid) {
      throw error;
    }
    return '';
  }

  const trimmed = input.trim();

  // Try to detect if it's a Brazilian number
  // Brazilian patterns: contains "55", or DDD patterns like "31 ", "(31)", etc.
  const isBrazilian =
    trimmed.includes('55') ||
    trimmed.includes('3') || // Very common DDD start
    /\(\d{2}\)/.test(trimmed) || // Pattern: (XX)
    /\d{2}\s+9\d{4}/.test(trimmed); // Pattern: XX 9XXXX

  try {
    let normalized: string;

    if (isBrazilian) {
      normalized = normalizeBrazilian(trimmed);

      // Validate Brazilian format
      if (!isValidBrazilian(normalized)) {
        throw new PhoneNormalizationError(
          `Invalid Brazilian phone format: ${input}. Expected format: +55 DDD 9XXXX-XXXX (mobile) or +55 DDD XXXX-XXXX (landline)`,
          input
        );
      }
    } else {
      // International number - just clean and add + if needed
      const cleaned = stripNonDigits(trimmed);

      if (!cleaned) {
        throw new PhoneNormalizationError(
          'Phone number must contain digits',
          input
        );
      }

      // Add default country code if needed and number doesn't start with valid country code
      let withCountry = cleaned;
      if (!cleaned.startsWith('+')) {
        if (!cleaned.startsWith('1') && !cleaned.startsWith('44') &&
            !cleaned.startsWith('33') && !cleaned.startsWith('49') &&
            !cleaned.startsWith('39') && !cleaned.startsWith('34') &&
            cleaned.length < 11) {
          // Likely missing country code, use default
          withCountry = defaultCountryCode + cleaned;
        }
      }

      normalized = (withCountry.startsWith('+') ? '' : '+') + withCountry;

      // Validate E.164
      if (!isValidE164(normalized)) {
        throw new PhoneNormalizationError(
          `Invalid phone format: ${input}. Expected E.164 format: +[country_code][number]`,
          input
        );
      }
    }

    return normalized;
  } catch (error) {
    if (error instanceof PhoneNormalizationError) {
      if (throwOnInvalid) {
        throw error;
      }
      return '';
    }
    // Unexpected error
    const phoneError = new PhoneNormalizationError(
      `Unexpected error normalizing phone: ${error instanceof Error ? error.message : String(error)}`,
      input
    );
    if (throwOnInvalid) {
      throw phoneError;
    }
    return '';
  }
}

/**
 * Validates if a phone number is in valid E.164 format
 * @param phone - Phone number to validate (should already be normalized)
 * @returns True if valid E.164 format
 */
export function validatePhoneFormat(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  const trimmed = phone.trim();

  // Check if Brazilian
  if (trimmed.startsWith('+55')) {
    const digitsOnly = trimmed.slice(1); // Remove +
    return isValidBrazilianMobile(digitsOnly) || isValidBrazilianLandline(digitsOnly);
  }

  // Check generic E.164
  return isValidE164(trimmed);
}

/**
 * Batch normalize multiple phone numbers
 * Returns array with same length as input, with normalized numbers or empty strings
 * @param phones - Array of phone numbers to normalize
 * @param options - Normalization options
 * @returns Array of normalized phone numbers
 */
export function normalizePhoneNumbers(
  phones: string[],
  options: PhoneNormalizationOptions = {}
): string[] {
  return phones.map(phone => normalizePhoneNumber(phone, options));
}
