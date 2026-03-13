/**
 * WhatsApp Utilities
 *
 * Utilities for generating WhatsApp links with different URL formats.
 */

/**
 * Clean phone number (remove everything except digits)
 * Note: Removes + sign for WhatsApp URLs (required format)
 * @param {string} phone - Phone number to clean
 * @returns {string} Cleaned phone number (digits only)
 */
function cleanPhoneForWhatsApp(phone) {
  if (!phone || typeof phone !== 'string') {
    return '';
  }
  // Remove everything except digits (including +)
  return phone.replace(/\D/g, '');
}

/**
 * Validate phone number has at least basic structure
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  // Extract digits only for validation
  const digitsOnly = phone.replace(/\D/g, '');
  // Must have at least 10 digits (minimum for most countries)
  return digitsOnly.length >= 10;
}

/**
 * Generate WhatsApp link for sending a message
 *
 * Supports 3 URL formats:
 * - 'wa.me': https://wa.me/{phone}?text={encoded} (universal, recommended)
 * - 'web': https://web.whatsapp.com/send?phone={phone}&text={encoded} (desktop)
 * - 'api': https://api.whatsapp.com/send?phone={phone}&text={encoded} (API official)
 *
 * @param {string} phone - Phone number in any format (will be cleaned)
 * @param {string} message - Message to send
 * @param {Object} [opts] - Options
 * @param {string} [opts.format='wa.me'] - URL format: 'wa.me', 'web', or 'api'
 * @returns {string} WhatsApp link (empty string if phone is invalid)
 *
 * @example
 * generateWhatsAppLink('+55 31 99988-7766', 'Oi João!');
 * // 'https://wa.me/5531999887766?text=Oi%20Jo%C3%A3o!'
 *
 * generateWhatsAppLink('+5531999887766', 'Olá!', { format: 'api' });
 * // 'https://api.whatsapp.com/send?phone=5531999887766&text=Ol%C3%A1!'
 */
function generateWhatsAppLink(phone, message, opts = {}) {
  const { format = 'wa.me' } = opts;

  // Validate phone
  if (!isValidPhone(phone)) {
    return '';
  }

  // Clean phone
  const cleanPhone = cleanPhoneForWhatsApp(phone);

  // Encode message
  const encodedMessage = encodeURIComponent(message || '');

  // Build URL based on format
  switch (format) {
    case 'wa.me':
      return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    case 'web':
      return `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;

    case 'api':
      return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;

    default:
      // Default to wa.me
      return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }
}

module.exports = {
  generateWhatsAppLink,
  cleanPhoneForWhatsApp,
  isValidPhone,
};
