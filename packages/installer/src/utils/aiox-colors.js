/**
 * AIOX Color Palette v5.0.0
 *
 * Brand color system for CLI tools and terminal output.
 * Colors derived from AIOX brand identity: Lime + Cream on Dark surfaces.
 *
 * @see docs/standards/AIOX-COLOR-PALETTE-V2.1.md
 * @module aiox-colors
 */

const chalk = require('chalk');

/**
 * AIOX Brand Color Palette
 * All colors are WCAG AA compliant on dark terminals
 */
const colors = {
  // ============================================
  // CORE BRAND COLORS
  // ============================================

  /**
   * Primary brand color - AIOX Lime
   * Usage: Main questions, headers, CTAs, banner, primary actions
   */
  primary: chalk.hex('#D1FF00'),

  /**
   * Secondary brand color - AIOX Cream
   * Usage: Important highlights, special emphasis, key information
   */
  secondary: chalk.hex('#F4F4E8'),

  /**
   * Tertiary brand color - Lime dim for supporting elements
   * Usage: Secondary actions, links, complementary elements
   */
  tertiary: chalk.hex('#8BA600'),

  // ============================================
  // FUNCTIONAL COLORS
  // ============================================

  /**
   * Success state color
   * Usage: Checkmarks, completed steps, success messages
   */
  success: chalk.hex('#10B981'),

  /**
   * Warning state color
   * Usage: Warnings, confirmations, caution states
   */
  warning: chalk.hex('#F59E0B'),

  /**
   * Error state color
   * Usage: Errors, critical alerts, validation failures
   */
  error: chalk.hex('#EF4444'),

  /**
   * Info state color
   * Usage: Info messages, tips, helper text, additional context
   */
  info: chalk.hex('#06B6D4'),

  // ============================================
  // NEUTRAL COLORS
  // ============================================

  /**
   * Muted text color
   * Usage: Subtle text, disabled states, secondary content
   */
  muted: chalk.hex('#94A3B8'),

  /**
   * Dim text color
   * Usage: Secondary text, muted content, less important info
   */
  dim: chalk.hex('#64748B'),

  // ============================================
  // GRADIENT SYSTEM
  // ============================================

  /**
   * Brand gradient colors for animations and special effects
   * AIOX identity: Lime → Cream
   */
  gradient: {
    /** Gradient start - Lime (brand primary) */
    start: chalk.hex('#D1FF00'),

    /** Gradient middle - Lime dim */
    middle: chalk.hex('#8BA600'),

    /** Gradient end - Cream (brand secondary) */
    end: chalk.hex('#F4F4E8'),
  },

  // ============================================
  // SEMANTIC SHORTCUTS
  // ============================================

  /**
   * Highlighted text - Bold lime for key information
   */
  highlight: chalk.hex('#D1FF00').bold,

  /**
   * Primary branding - Bold lime for AIOX brand moments
   */
  brandPrimary: chalk.hex('#D1FF00').bold,

  /**
   * Secondary branding - Cream for supporting brand elements
   */
  brandSecondary: chalk.hex('#F4F4E8'),
};

/**
 * Pre-formatted status indicators with color and symbols
 */
const status = {
  /** Success indicator: ✓ (green) */
  success: (text) => `${colors.success('✓')} ${text}`,
  
  /** Error indicator: ✗ (red) */
  error: (text) => `${colors.error('✗')} ${text}`,
  
  /** Warning indicator: ⚠️ (orange) */
  warning: (text) => `${colors.warning('⚠️')} ${text}`,
  
  /** Info indicator: ℹ (cyan) */
  info: (text) => `${colors.info('ℹ')} ${text}`,
  
  /** Loading indicator: ⏳ (cyan) */
  loading: (text) => `${colors.info('⏳')} ${text}`,
  
  /** Skipped indicator: ⊘ (muted) */
  skipped: (text) => `${colors.muted('⊘')} ${text}`,
  
  /** Tip indicator: 💡 (info) */
  tip: (text) => `${colors.info('💡')} ${text}`,
  
  /** Party indicator: 🎉 (brand primary) */
  celebrate: (text) => `${colors.brandPrimary('🎉')} ${text}`,
};

/**
 * Formatted heading helpers
 */
const headings = {
  /** H1 - Brand primary, bold, large spacing */
  h1: (text) => `\n${colors.brandPrimary(text)}\n`,
  
  /** H2 - Primary color, bold */
  h2: (text) => `\n${colors.primary.bold(text)}\n`,
  
  /** H3 - Primary color */
  h3: (text) => colors.primary(text),
  
  /** Section divider */
  divider: () => colors.dim('─'.repeat(50)),
};

/**
 * Formatted list helpers
 */
const lists = {
  /** Bullet point (primary) */
  bullet: (text) => `${colors.primary('•')} ${text}`,
  
  /** Numbered item (primary) */
  numbered: (num, text) => `${colors.primary(`${num}.`)} ${text}`,
  
  /** Checkbox unchecked */
  checkbox: (text, checked = false) => {
    const icon = checked ? colors.success('☑') : colors.muted('☐');
    return `${icon} ${text}`;
  },
};

/**
 * Example usage for documentation
 */
const examples = {
  welcome: () => {
    console.log(headings.h1('🎉 Welcome to AIOX v4 Installer!'));
    console.log(colors.info('Let\'s configure your project in just a few steps...\n'));
  },
  
  question: () => {
    console.log(colors.primary('? Select your project type:'));
    console.log(lists.bullet('Greenfield (new project)'));
    console.log(lists.bullet('Brownfield (existing project)'));
  },
  
  progress: () => {
    console.log(status.loading('Installing dependencies...'));
    console.log(status.success('Dependencies installed'));
    console.log(status.loading('Configuring environment...'));
  },
  
  feedback: () => {
    console.log(status.success('Configuration complete!'));
    console.log(status.warning('Existing .env found. Overwrite?'));
    console.log(status.error('Invalid path provided'));
    console.log(status.tip('You can change this later in settings'));
  },
  
  complete: () => {
    console.log('\n' + headings.divider());
    console.log(status.celebrate('Installation Complete!'));
    console.log(colors.info('Your AIOX project is ready to use.'));
    console.log(headings.divider() + '\n');
  },
};

// Export all utilities
module.exports = {
  colors,
  status,
  headings,
  lists,
  examples,
};

// Also export as default for ESM compatibility
module.exports.default = module.exports;

