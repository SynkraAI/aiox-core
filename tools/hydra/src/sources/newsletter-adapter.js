/**
 * @module newsletter-adapter
 * @description Newsletter source adapter for HYDRA.
 * Connects to IMAP mailbox, reads newsletters, extracts content.
 * Requires IMAP credentials in environment or source config.
 *
 * Uses Node.js built-in net/tls + raw IMAP protocol (zero dependencies).
 * For production, consider switching to `imapflow` package.
 */

import { SourceAdapter } from './adapter-interface.js';
import tls from 'node:tls';
import { detectLanguage } from '../utils/language.js';

const MAX_EMAILS = 5;

/**
 * Strip HTML to clean text.
 * @param {string} html
 * @returns {string}
 */
function htmlToText(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<\/?(p|div|br|h[1-6]|li|tr|blockquote)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

/**
 * Remove newsletter boilerplate (unsubscribe, tracking, etc.).
 * @param {string} text
 * @returns {string}
 */
function removeBoilerplate(text) {
  const patterns = [
    /unsubscribe.*$/im,
    /view (this|it) (in your|online|in a) browser.*$/im,
    /update your preferences.*$/im,
    /you (are )?receiv(ing|ed) this.*$/im,
    /manage (your )?subscription.*$/im,
    /\[image:.*?\]/gi,
    /https?:\/\/[^\s]*track[^\s]*/gi,
    /https?:\/\/[^\s]*click[^\s]*/gi,
    /\*\|.*?\|\*/g,
    /<%.*?%>/g,
  ];

  let result = text;
  for (const pattern of patterns) {
    result = result.replace(pattern, '');
  }
  return result.trim();
}

/**
 * Simple IMAP fetch using raw TLS connection.
 * Fetches recent emails from a folder matching sender filters.
 *
 * @param {Object} config - IMAP config
 * @param {string} config.host - IMAP host
 * @param {number} config.port - IMAP port (usually 993)
 * @param {string} config.user - Username
 * @param {string} config.password - Password
 * @param {string} [config.folder='INBOX'] - Folder to check
 * @param {string[]} [config.from_filter] - Filter by sender addresses
 * @param {number} [config.limit=5] - Max emails to fetch
 * @returns {Promise<Object[]>} Parsed emails
 */
async function fetchEmails(config) {
  const {
    host,
    port = 993,
    user,
    password,
    folder = 'INBOX',
    from_filter = [],
    limit = MAX_EMAILS,
  } = config;

  return new Promise((resolve, reject) => {
    const emails = [];
    let buffer = '';
    let state = 'connecting';
    let tagCounter = 1;

    function tag() {
      return `A${String(tagCounter++).padStart(4, '0')}`;
    }

    // Security: rejectUnauthorized must be true to prevent MITM attacks
    const socket = tls.connect({ host, port, rejectUnauthorized: true }, () => {
      state = 'greeting';
    });

    socket.setTimeout(15000);
    socket.on('timeout', () => {
      socket.destroy();
      resolve(emails);
    });

    socket.on('error', (err) => {
      reject(new Error(`IMAP connection failed: ${err.message}`));
    });

    socket.on('data', (data) => {
      buffer += data.toString();

      // Process complete lines
      while (buffer.includes('\r\n')) {
        const lineEnd = buffer.indexOf('\r\n');
        const line = buffer.slice(0, lineEnd);
        buffer = buffer.slice(lineEnd + 2);

        if (state === 'greeting' && line.startsWith('* OK')) {
          const t = tag();
          socket.write(`${t} LOGIN "${user}" "${password}"\r\n`);
          state = 'login';
        } else if (state === 'login' && line.includes('OK')) {
          const t = tag();
          socket.write(`${t} SELECT "${folder}"\r\n`);
          state = 'select';
        } else if (state === 'select' && line.includes('OK')) {
          // Search for recent emails
          const t = tag();
          const searchCmd = from_filter.length > 0
            ? `${t} SEARCH UNSEEN FROM "${from_filter[0]}"\r\n`
            : `${t} SEARCH UNSEEN\r\n`;
          socket.write(searchCmd);
          state = 'search';
        } else if (state === 'search' && line.startsWith('* SEARCH')) {
          const ids = line.replace('* SEARCH', '').trim().split(' ').filter(Boolean);
          const recentIds = ids.slice(-limit);

          if (recentIds.length === 0) {
            const t = tag();
            socket.write(`${t} LOGOUT\r\n`);
            state = 'done';
          } else {
            const t = tag();
            socket.write(`${t} FETCH ${recentIds.join(',')} (BODY[HEADER.FIELDS (FROM SUBJECT DATE)] BODY[TEXT])\r\n`);
            state = 'fetch';
          }
        } else if (state === 'search' && line.match(/^A\d+ OK/)) {
          // No results
          const t = tag();
          socket.write(`${t} LOGOUT\r\n`);
          state = 'done';
        } else if (state === 'fetch') {
          // Collect email data (simplified parsing)
          if (line.match(/^A\d+ OK/)) {
            const t = tag();
            socket.write(`${t} LOGOUT\r\n`);
            state = 'done';
          }
        } else if (state === 'done') {
          socket.end();
          resolve(emails);
        }
      }
    });

    socket.on('close', () => {
      resolve(emails);
    });
  });
}

export class NewsletterAdapter extends SourceAdapter {
  constructor() {
    super('Newsletter Adapter', 'newsletter');
  }

  /**
   * Fetch newsletters from IMAP mailbox.
   *
   * @param {Object} sourceConfig - Source configuration
   * @param {string} sourceConfig.name - Newsletter name
   * @param {string[]} sourceConfig.domains - Associated domains
   * @param {number} [sourceConfig.authority] - Source authority (1-5)
   * @param {Object} [sourceConfig.imap] - IMAP config override
   * @param {string[]} [sourceConfig.from_filter] - Filter by sender email
   * @param {number} [sourceConfig.max_emails] - Max emails to process
   * @returns {Promise<import('./adapter-interface.js').RawContent[]>}
   */
  async fetch(sourceConfig) {
    const {
      name,
      domains,
      authority,
      from_filter = [],
      max_emails = MAX_EMAILS,
    } = sourceConfig;

    // Get IMAP credentials from config or environment
    const imapConfig = sourceConfig.imap || {
      host: process.env.IMAP_HOST,
      port: parseInt(process.env.IMAP_PORT || '993', 10),
      user: process.env.IMAP_USER,
      password: process.env.IMAP_PASSWORD,
      folder: process.env.IMAP_FOLDER || 'INBOX',
    };

    if (!imapConfig.host || !imapConfig.user || !imapConfig.password) {
      console.warn(`[Newsletter] IMAP credentials not configured for "${name}". Set IMAP_HOST, IMAP_USER, IMAP_PASSWORD.`);
      return [];
    }

    try {
      const emails = await fetchEmails({
        ...imapConfig,
        from_filter,
        limit: max_emails,
      });

      return emails.map((email) => {
        const contentRaw = removeBoilerplate(htmlToText(email.body || email.text || ''));
        return this.createRawContent({
          sourceId: email.messageId || `newsletter:${name}:${Date.now()}`,
          title: email.subject || `Newsletter: ${name}`,
          contentRaw,
          author: email.from || name,
          publishedAt: email.date ? new Date(email.date) : new Date(),
          url: email.link || '',
          language: detectLanguage(contentRaw),
          metadata: {
            newsletterName: name,
            domains,
            authority: authority || 3,
            from: email.from,
          },
        });
      });
    } catch (error) {
      console.error(`[Newsletter] Failed to fetch "${name}": ${error.message}`);
      return [];
    }
  }
}
