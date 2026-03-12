/**
 * WhatsApp Parser Types
 */

/**
 * Represents a single message from a contact
 */
export interface Message {
  /** ISO 8601 timestamp of the message */
  timestamp: string;
  /** Message content */
  content: string;
}

/**
 * Represents a contact extracted from WhatsApp chat
 */
export interface Contact {
  /** Contact name as it appears in WhatsApp */
  name: string;
  /** Phone number in E.164 format (e.g., +5531999887766) */
  phone: string;
  /** Number of messages from this contact */
  message_count: number;
  /** ISO 8601 date of first message */
  first_message_date: string;
  /** ISO 8601 date of last message */
  last_message_date: string;
  /** Array of messages from this contact */
  messages: Message[];
}

/**
 * Date range for the chat export
 */
export interface DateRange {
  /** Start date in YYYY-MM-DD format */
  start: string;
  /** End date in YYYY-MM-DD format */
  end: string;
}

/**
 * Result of parsing a WhatsApp chat export
 */
export interface ParsedExport {
  /** Name of the group (from chat or filename) */
  group_name: string;
  /** Date range of the export */
  date_range: DateRange;
  /** Total number of messages (including system messages) */
  total_messages: number;
  /** Total number of unique contacts */
  total_contacts: number;
  /** Array of extracted contacts */
  contacts: Contact[];
}

/**
 * Result of a single validation check
 */
export interface ValidationCheck {
  /** Check identifier (e.g., "blocking_check_1") */
  id: string;
  /** Check description */
  reason: string;
  /** Severity level */
  severity: 'BLOCKING' | 'WARNING';
  /** Whether the check passed */
  passed: boolean;
}

/**
 * Quality metrics for parsed data
 */
export interface ValidationMetrics {
  /** Total number of contacts extracted */
  total_contacts: number;
  /** Number of contacts with phone numbers */
  contacts_with_phone: number;
  /** Phone coverage percentage (e.g., "65%") */
  phone_coverage: string;
  /** Total messages (including system messages) */
  total_messages: number;
  /** Number of system messages filtered out */
  system_messages_filtered: number;
  /** Average messages per contact */
  avg_messages_per_contact: number;
  /** Number of days in the export date range */
  date_range_days: number;
  /** Top 5 most active contacts with message counts */
  most_active_contacts_top5: string[];
}

/**
 * Result of validating parsed data
 */
export interface ValidationReport {
  /** Overall status */
  status: 'PASS' | 'FAIL';
  /** Blocking checks results */
  blocking_checks: {
    passed: number;
    failed: number;
  };
  /** Warning checks results */
  warning_checks: {
    passed: number;
    warnings: number;
  };
  /** Array of failed checks (if any) */
  failed_checks?: ValidationCheck[];
  /** Array of warning messages */
  warnings?: string[];
  /** Quality metrics */
  metrics: ValidationMetrics;
  /** Recommendation for next action */
  recommendation: string;
}

/**
 * Error thrown during parsing
 */
export class ParsingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly severity: 'BLOCKING' | 'WARNING' = 'BLOCKING'
  ) {
    super(message);
    this.name = 'ParsingError';
  }
}

/**
 * Error thrown during phone normalization
 */
export class PhoneNormalizationError extends Error {
  constructor(
    message: string,
    public readonly input: string
  ) {
    super(message);
    this.name = 'PhoneNormalizationError';
  }
}

/**
 * Options for phone number normalization
 */
export interface PhoneNormalizationOptions {
  /** Default country code (e.g., "55" for Brazil) */
  defaultCountryCode?: string;
  /** Whether to throw on invalid format or return null */
  throwOnInvalid?: boolean;
}

/**
 * Format variants supported by the parser
 */
export type WhatsAppFormat = 'android_br' | 'ios_br' | 'unknown';
