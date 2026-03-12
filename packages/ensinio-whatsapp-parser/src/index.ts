/**
 * @ensinio/whatsapp-parser
 * Standalone WhatsApp chat export parser
 */

export {
  // Types
  Message,
  Contact,
  DateRange,
  ParsedExport,
  ValidationCheck,
  ValidationMetrics,
  ValidationReport,
  ParsingError,
  PhoneNormalizationError,
  PhoneNormalizationOptions,
  WhatsAppFormat,
} from './types';

export { parseWhatsAppExport, detectChatFormat, extractName } from './parser';
export { normalizePhoneNumber, validatePhoneFormat, normalizePhoneNumbers } from './phone-normalizer';

// Export functions (to be implemented)
// export { validateParsedData } from './validator';
