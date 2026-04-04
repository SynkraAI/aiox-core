/**
 * Telegram Inline Keyboards & Menus.
 * Builds InlineKeyboardMarkup objects for the Telegram Bot API.
 * Zero external dependencies.
 */

// ---------------------------------------------------------------------------
// Types (Telegram Bot API subset)
// ---------------------------------------------------------------------------

export interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

// ---------------------------------------------------------------------------
// Callback Data Encoding
// ---------------------------------------------------------------------------

/** Max callback_data length per Telegram spec is 64 bytes. Keep short. */

export const CB = {
  // Main menu
  STATUS: 'menu:status',
  PNL: 'menu:pnl',
  POSITIONS: 'menu:positions',
  RISK: 'menu:risk',
  HEALTH: 'menu:health',
  DRIFT: 'menu:drift',
  STRATEGIES: 'menu:strategies',
  VERTICALS: 'menu:verticals',
  MARKETS: 'menu:markets',
  WHALES: 'menu:whales',
  CONFIG: 'menu:config',
  GATE: 'menu:gate',
  HELP: 'menu:help',

  // Navigation
  BACK_MAIN: 'nav:main',
  TRADES_NEXT: 'trades:next',
  TRADES_PREV: 'trades:prev',

  // Control
  PAUSE: 'ctrl:pause',
  RESUME: 'ctrl:resume',
  EMERGENCY: 'ctrl:emergency',
  CIRCUIT_RESET: 'ctrl:cb_reset',
  MODE_PAPER: 'ctrl:mode_paper',
  MODE_LIVE: 'ctrl:mode_live',

  // Confirmations
  CONFIRM_PAUSE: 'cfm:pause',
  CONFIRM_RESUME: 'cfm:resume',
  CONFIRM_EMERGENCY: 'cfm:emergency',
  CONFIRM_CB_RESET: 'cfm:cb_reset',
  CONFIRM_MODE_LIVE: 'cfm:mode_live',
  CANCEL: 'cfm:cancel',

  // Signal actions
  SIGNAL_APPROVE: 'sig:approve',
  SIGNAL_SKIP: 'sig:skip',
  SIGNAL_DETAILS: 'sig:details',
} as const;

export type CallbackAction = typeof CB[keyof typeof CB];

// ---------------------------------------------------------------------------
// Signal callback helpers (include signal ID in callback_data)
// ---------------------------------------------------------------------------

export function signalApproveCallback(signalId: string): string {
  return `sig:approve:${signalId.slice(0, 48)}`;
}

export function signalSkipCallback(signalId: string): string {
  return `sig:skip:${signalId.slice(0, 50)}`;
}

export function signalDetailsCallback(signalId: string): string {
  return `sig:details:${signalId.slice(0, 47)}`;
}

export function tradesPageCallback(page: number): string {
  return `trades:page:${page}`;
}

/** Parse a callback_data string into action and optional parameter. */
export function parseCallback(data: string): { action: string; param?: string } {
  const parts = data.split(':');
  if (parts.length >= 3) {
    return { action: `${parts[0]}:${parts[1]}`, param: parts.slice(2).join(':') };
  }
  return { action: data };
}

// ---------------------------------------------------------------------------
// Keyboards
// ---------------------------------------------------------------------------

/** Main menu keyboard shown on /start. */
export function mainMenuKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: '\u{1F4CA} Status', callback_data: CB.STATUS },
        { text: '\u{1F4B0} P&L', callback_data: CB.PNL },
        { text: '\u{1F4C8} Positions', callback_data: CB.POSITIONS },
      ],
      [
        { text: '\u26A0\uFE0F Risk', callback_data: CB.RISK },
        { text: '\u{1F3E5} Health', callback_data: CB.HEALTH },
        { text: '\u{1F4C9} Drift', callback_data: CB.DRIFT },
      ],
      [
        { text: '\u{1F3AF} Strategies', callback_data: CB.STRATEGIES },
        { text: '\u{1F30D} Markets', callback_data: CB.MARKETS },
        { text: '\u{1F40B} Whales', callback_data: CB.WHALES },
      ],
      [
        { text: '\u2699\uFE0F Config', callback_data: CB.CONFIG },
        { text: '\u{1F6A6} Gate', callback_data: CB.GATE },
        { text: '\u2753 Help', callback_data: CB.HELP },
      ],
    ],
  };
}

/** Trade alert keyboard: approve, skip, or get details. */
export function tradeAlertKeyboard(signalId: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: '\u2705 Approve', callback_data: signalApproveCallback(signalId) },
        { text: '\u274C Skip', callback_data: signalSkipCallback(signalId) },
        { text: '\u2139\uFE0F Details', callback_data: signalDetailsCallback(signalId) },
      ],
    ],
  };
}

/** Position action keyboard. */
export function positionKeyboard(marketId: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: '\u{1F4CA} Details', callback_data: `pos:details:${marketId.slice(0, 46)}` },
        { text: '\u{1F534} Close', callback_data: `pos:close:${marketId.slice(0, 48)}` },
        { text: '\u{1F4C8} Chart', url: `https://polymarket.com/event/${marketId}` },
      ],
    ],
  };
}

/** Confirmation keyboard for dangerous actions. */
export function confirmationKeyboard(confirmAction: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: '\u2705 Confirm', callback_data: confirmAction },
        { text: '\u274C Cancel', callback_data: CB.CANCEL },
      ],
    ],
  };
}

/** Pagination keyboard for trade lists. */
export function paginationKeyboard(currentPage: number, totalPages: number): InlineKeyboardMarkup {
  const buttons: InlineKeyboardButton[] = [];

  if (currentPage > 1) {
    buttons.push({ text: '\u25C0\uFE0F Prev', callback_data: tradesPageCallback(currentPage - 1) });
  }

  buttons.push({ text: `Page ${currentPage}/${totalPages}`, callback_data: 'noop' });

  if (currentPage < totalPages) {
    buttons.push({ text: 'Next \u25B6\uFE0F', callback_data: tradesPageCallback(currentPage + 1) });
  }

  return {
    inline_keyboard: [
      buttons,
      [{ text: '\u{1F519} Back', callback_data: CB.BACK_MAIN }],
    ],
  };
}

/** Control menu keyboard. */
export function controlMenuKeyboard(isPaused: boolean): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        isPaused
          ? { text: '\u25B6\uFE0F Resume', callback_data: CB.RESUME }
          : { text: '\u23F8\uFE0F Pause', callback_data: CB.PAUSE },
      ],
      [
        { text: '\u{1F6D1} Emergency Shutdown', callback_data: CB.EMERGENCY },
      ],
      [
        { text: '\u{1F504} Reset Circuit Breaker', callback_data: CB.CIRCUIT_RESET },
      ],
      [
        { text: '\u{1F519} Back', callback_data: CB.BACK_MAIN },
      ],
    ],
  };
}

/** Back to main menu keyboard. */
export function backKeyboard(): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [{ text: '\u{1F519} Back to Menu', callback_data: CB.BACK_MAIN }],
    ],
  };
}
