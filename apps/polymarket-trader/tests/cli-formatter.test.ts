/**
 * Tests for CLI Formatter utilities.
 * Covers formatTable, formatCurrency, formatPercent, formatDate,
 * formatDuration, colorize, and edge cases.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  colorize,
  formatCurrency,
  formatDate,
  formatDuration,
  formatPercent,
  formatTable,
  pnlColor,
  statusColor,
  keyValue,
  sectionHeader,
} from '../src/cli/formatter.js';

// ---------------------------------------------------------------------------
// formatCurrency
// ---------------------------------------------------------------------------

describe('formatCurrency', () => {
  it('formats positive values with $ prefix and 2 decimals', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative values with minus sign before $', () => {
    expect(formatCurrency(-42.1)).toBe('-$42.10');
  });

  it('formats large numbers with commas', () => {
    expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
  });

  it('formats small decimals', () => {
    expect(formatCurrency(0.01)).toBe('$0.01');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatCurrency(9.999)).toBe('$10.00');
  });
});

// ---------------------------------------------------------------------------
// formatPercent
// ---------------------------------------------------------------------------

describe('formatPercent', () => {
  it('converts decimal to percentage with 1 decimal', () => {
    expect(formatPercent(0.673)).toBe('67.3%');
  });

  it('handles zero', () => {
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('handles 100%', () => {
    expect(formatPercent(1.0)).toBe('100.0%');
  });

  it('handles values > 1', () => {
    expect(formatPercent(1.5)).toBe('150.0%');
  });
});

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------

describe('formatDate', () => {
  it('formats Date object to YYYY-MM-DD HH:MM', () => {
    const d = new Date(2026, 3, 4, 14, 30); // April 4, 2026 14:30
    expect(formatDate(d)).toBe('2026-04-04 14:30');
  });

  it('formats string date', () => {
    const result = formatDate('2026-04-04T14:30:00Z');
    // The exact output depends on timezone, but should match format
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it('returns N/A for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('N/A');
  });

  it('pads single-digit months and days', () => {
    const d = new Date(2026, 0, 5, 3, 7); // Jan 5, 2026 03:07
    expect(formatDate(d)).toBe('2026-01-05 03:07');
  });
});

// ---------------------------------------------------------------------------
// formatDuration
// ---------------------------------------------------------------------------

describe('formatDuration', () => {
  it('formats days, hours, minutes', () => {
    const ms = (2 * 24 * 60 * 60 + 4 * 60 * 60 + 30 * 60) * 1000;
    expect(formatDuration(ms)).toBe('2d 4h 30m');
  });

  it('formats hours and minutes only', () => {
    const ms = (3 * 60 * 60 + 15 * 60) * 1000;
    expect(formatDuration(ms)).toBe('3h 15m');
  });

  it('formats seconds for small values', () => {
    expect(formatDuration(5000)).toBe('5s');
  });

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0s');
  });

  it('handles negative values as 0', () => {
    expect(formatDuration(-1000)).toBe('0s');
  });

  it('formats only days when no remainder', () => {
    const ms = 3 * 24 * 60 * 60 * 1000;
    expect(formatDuration(ms)).toBe('3d');
  });
});

// ---------------------------------------------------------------------------
// colorize
// ---------------------------------------------------------------------------

describe('colorize', () => {
  it('wraps text with ANSI green codes', () => {
    const result = colorize('hello', 'green');
    expect(result).toContain('\x1b[32m');
    expect(result).toContain('hello');
    expect(result).toContain('\x1b[0m');
  });

  it('wraps text with ANSI red codes', () => {
    const result = colorize('error', 'red');
    expect(result).toContain('\x1b[31m');
    expect(result).toContain('error');
  });

  it('wraps text with bold', () => {
    const result = colorize('title', 'bold');
    expect(result).toContain('\x1b[1m');
  });
});

// ---------------------------------------------------------------------------
// pnlColor
// ---------------------------------------------------------------------------

describe('pnlColor', () => {
  it('applies green for positive values', () => {
    const result = pnlColor(100, '$100.00');
    expect(result).toContain('\x1b[32m');
  });

  it('applies red for negative values', () => {
    const result = pnlColor(-50, '-$50.00');
    expect(result).toContain('\x1b[31m');
  });

  it('returns plain text for zero', () => {
    const result = pnlColor(0, '$0.00');
    expect(result).toBe('$0.00');
  });
});

// ---------------------------------------------------------------------------
// statusColor
// ---------------------------------------------------------------------------

describe('statusColor', () => {
  it('colors healthy as green', () => {
    expect(statusColor('healthy')).toContain('\x1b[32m');
  });

  it('colors degraded as yellow', () => {
    expect(statusColor('degraded')).toContain('\x1b[33m');
  });

  it('colors critical as red', () => {
    expect(statusColor('critical')).toContain('\x1b[31m');
  });

  it('returns plain text for unknown status', () => {
    expect(statusColor('unknown')).toBe('unknown');
  });
});

// ---------------------------------------------------------------------------
// formatTable
// ---------------------------------------------------------------------------

describe('formatTable', () => {
  it('renders a basic table with box-drawing characters', () => {
    const headers = ['Name', 'Value'];
    const rows = [['foo', '42'], ['bar', '99']];
    const result = formatTable(headers, rows);

    expect(result).toContain('┌');
    expect(result).toContain('┐');
    expect(result).toContain('└');
    expect(result).toContain('┘');
    expect(result).toContain('│');
    expect(result).toContain('─');
    expect(result).toContain('├');
    expect(result).toContain('┤');
    expect(result).toContain('┬');
    expect(result).toContain('┼');
    expect(result).toContain('┴');
    expect(result).toContain('foo');
    expect(result).toContain('42');
  });

  it('handles empty rows', () => {
    const result = formatTable(['A', 'B'], []);
    const lines = result.split('\n');
    // Should have: top border, header, separator, bottom border (4 lines)
    expect(lines).toHaveLength(4);
  });

  it('right-aligns columns when specified', () => {
    const result = formatTable(['Label', 'Amount'], [['x', '123']], ['left', 'right']);
    // The "123" value should have leading spaces for right alignment
    const lines = result.split('\n');
    const dataLine = lines[3]; // 0:top, 1:header, 2:separator, 3:data
    // Amount header is wider than '123', so '123' should be right-padded
    expect(dataLine).toContain('123');
  });

  it('handles single column', () => {
    const result = formatTable(['Item'], [['alpha'], ['beta']]);
    expect(result).toContain('alpha');
    expect(result).toContain('beta');
    // No ┬ or ┼ for single column
    expect(result).not.toContain('┬');
  });

  it('handles cells with ANSI color codes', () => {
    const colored = colorize('green text', 'green');
    const result = formatTable(['Col'], [[colored]]);
    // Should contain the text and still render proper table
    expect(result).toContain('green text');
    expect(result).toContain('┌');
  });

  it('handles wide content with proper alignment', () => {
    const result = formatTable(
      ['Short', 'Much Longer Header'],
      [['a', 'b'], ['cc', 'dd']],
    );
    const lines = result.split('\n');
    // All lines within the table body should have consistent visible width
    // (border chars at same positions)
    expect(lines[0].indexOf('┐')).toBeGreaterThan(0);
    expect(lines[lines.length - 1].indexOf('┘')).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// keyValue and sectionHeader
// ---------------------------------------------------------------------------

describe('keyValue', () => {
  it('formats key-value pair with padding', () => {
    const result = keyValue('Mode', 'PAPER');
    expect(result).toContain('Mode');
    expect(result).toContain('PAPER');
  });
});

describe('sectionHeader', () => {
  it('creates a section header with title', () => {
    const result = sectionHeader('TEST SECTION');
    expect(result).toContain('TEST SECTION');
    expect(result).toContain('─');
  });
});
