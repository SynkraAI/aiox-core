/**
 * CLI Formatter: zero-dependency ASCII table renderer and formatting utilities.
 * Uses box-drawing characters and ANSI color codes.
 */

// ---------------------------------------------------------------------------
// ANSI Colors
// ---------------------------------------------------------------------------

type Color = 'green' | 'red' | 'yellow' | 'cyan' | 'bold' | 'dim' | 'reset';

const ANSI: Record<Color, string> = {
  green:  '\x1b[32m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  reset:  '\x1b[0m',
};

const NO_COLOR = !!process.env['NO_COLOR'];

export function colorize(text: string, color: Color): string {
  if (NO_COLOR) return text;
  return `${ANSI[color]}${text}${ANSI.reset}`;
}

export function pnlColor(value: number, formatted: string): string {
  if (value > 0) return colorize(formatted, 'green');
  if (value < 0) return colorize(formatted, 'red');
  return formatted;
}

export function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'ok' || s === 'healthy' || s === 'pass' || s === 'go' || s === 'improving') {
    return colorize(status, 'green');
  }
  if (s === 'warn' || s === 'degraded' || s === 'conditional' || s === 'stable') {
    return colorize(status, 'yellow');
  }
  if (s === 'fail' || s === 'critical' || s === 'no_go' || s === 'degrading' || s === 'tripped') {
    return colorize(status, 'red');
  }
  return status;
}

// ---------------------------------------------------------------------------
// Number Formatting
// ---------------------------------------------------------------------------

export function formatCurrency(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  const parts = abs.toFixed(2).split('.');
  const intPart = parts[0];
  const decPart = parts[1];
  // Add commas
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}$${withCommas}.${decPart}`;
}

export function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return 'N/A';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours % 24 > 0) parts.push(`${hours % 24}h`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
  if (parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(' ');
}

// ---------------------------------------------------------------------------
// ASCII Table Renderer
// ---------------------------------------------------------------------------

export type Alignment = 'left' | 'right' | 'center';

/**
 * Strip ANSI escape codes to get the visual length of a string.
 */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function visLen(str: string): number {
  return stripAnsi(str).length;
}

function padCell(text: string, width: number, align: Alignment): string {
  const vl = visLen(text);
  const diff = width - vl;
  if (diff <= 0) return text;

  if (align === 'right') return ' '.repeat(diff) + text;
  if (align === 'center') {
    const left = Math.floor(diff / 2);
    const right = diff - left;
    return ' '.repeat(left) + text + ' '.repeat(right);
  }
  return text + ' '.repeat(diff);
}

export function formatTable(
  headers: string[],
  rows: string[][],
  alignments?: Alignment[],
): string {
  const aligns = alignments ?? headers.map(() => 'left' as Alignment);
  const colCount = headers.length;

  // Convert all cells to strings and compute column widths
  const allRows = [headers, ...rows];
  const colWidths: number[] = new Array(colCount).fill(0);

  for (const row of allRows) {
    for (let c = 0; c < colCount; c++) {
      const cell = row[c] ?? '';
      const len = visLen(cell);
      if (len > colWidths[c]) colWidths[c] = len;
    }
  }

  // Build table lines
  const lines: string[] = [];

  // Top border: ┌───┬───┐
  lines.push(
    '┌' + colWidths.map(w => '─'.repeat(w + 2)).join('┬') + '┐',
  );

  // Header row
  const headerCells = headers.map((h, i) =>
    ' ' + padCell(colorize(h, 'bold'), colWidths[i], 'left') + ' ',
  );
  lines.push('│' + headerCells.join('│') + '│');

  // Header separator: ├───┼───┤
  lines.push(
    '├' + colWidths.map(w => '─'.repeat(w + 2)).join('┼') + '┤',
  );

  // Data rows
  for (const row of rows) {
    const cells = row.map((cell, i) => {
      const val = cell ?? '';
      return ' ' + padCell(val, colWidths[i], aligns[i] ?? 'left') + ' ';
    });
    lines.push('│' + cells.join('│') + '│');
  }

  // Bottom border: └───┴───┘
  lines.push(
    '└' + colWidths.map(w => '─'.repeat(w + 2)).join('┴') + '┘',
  );

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Section Header
// ---------------------------------------------------------------------------

export function sectionHeader(title: string): string {
  const line = '─'.repeat(60);
  return `\n${colorize(line, 'dim')}\n  ${colorize(title, 'bold')}\n${colorize(line, 'dim')}`;
}

export function keyValue(key: string, value: string, keyWidth = 22): string {
  return `  ${colorize(key.padEnd(keyWidth), 'cyan')} ${value}`;
}
