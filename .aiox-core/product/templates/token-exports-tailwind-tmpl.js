/**
 * Design System Tokens - Tailwind CSS Configuration
 *
 * Project: {{PROJECT_NAME}}
 * Generated: {{GENERATION_DATE}}
 * Source: {{TOKEN_SOURCE_FILE}}
 *
 * Usage:
 * Import this file in your tailwind.config.js:
 *
 * ```javascript
 * const tokens = require('./tokens.tailwind.js');
 *
 * module.exports = {
 *   content: ['./src/**\/*.{js,jsx,ts,tsx}'],
 *   theme: {
 *     extend: tokens.theme.extend
 *   }
 * }
 * ```
 *
 * Then use in your components:
 * ```jsx
 * <button className="bg-primary text-white px-md py-sm rounded-base">
 *   Click Me
 * </button>
 * ```
 */

module.exports = {
  theme: {
    extend: {
      /* ============================================
         COLOR TOKENS
         ============================================ */

      colors: {
        // Primary Colors
        {{#EACH_COLOR_PRIMARY}}
        '{{COLOR_NAME}}': '{{COLOR_VALUE}}',
        {{/EACH_COLOR_PRIMARY}}

        // Semantic Colors
        {{#EACH_COLOR_SEMANTIC}}
        '{{COLOR_NAME}}': '{{COLOR_VALUE}}',
        {{/EACH_COLOR_SEMANTIC}}

        // Neutral/Grayscale
        {{#EACH_COLOR_NEUTRAL}}
        '{{COLOR_NAME}}': '{{COLOR_VALUE}}',
        {{/EACH_COLOR_NEUTRAL}}

        // State Colors
        {{#EACH_COLOR_STATE}}
        '{{COLOR_NAME}}': '{{COLOR_VALUE}}',
        {{/EACH_COLOR_STATE}}

        // Custom Color Palettes (if using scale)
        {{#EACH_COLOR_SCALE}}
        '{{COLOR_FAMILY}}': {
          {{#EACH_COLOR_SHADE}}
          '{{SHADE_NUMBER}}': '{{SHADE_VALUE}}',
          {{/EACH_COLOR_SHADE}}
        },
        {{/EACH_COLOR_SCALE}}
      },

      /* ============================================
         SPACING TOKENS
         ============================================ */

      spacing: {
        {{#EACH_SPACING}}
        '{{SPACING_NAME}}': '{{SPACING_VALUE}}',
        {{/EACH_SPACING}}
      },

      /* ============================================
         TYPOGRAPHY TOKENS
         ============================================ */

      fontFamily: {
        {{#EACH_FONT_FAMILY}}
        '{{FONT_NAME}}': {{FONT_VALUE_ARRAY}},
        {{/EACH_FONT_FAMILY}}
      },

      fontSize: {
        {{#EACH_FONT_SIZE}}
        '{{SIZE_NAME}}': ['{{SIZE_VALUE}}', {
          lineHeight: '{{LINE_HEIGHT}}',
          {{#IF_LETTER_SPACING}}
          letterSpacing: '{{LETTER_SPACING}}',
          {{/IF_LETTER_SPACING}}
        }],
        {{/EACH_FONT_SIZE}}
      },

      fontWeight: {
        {{#EACH_FONT_WEIGHT}}
        '{{WEIGHT_NAME}}': {{WEIGHT_VALUE}},
        {{/EACH_FONT_WEIGHT}}
      },

      lineHeight: {
        {{#EACH_LINE_HEIGHT}}
        '{{HEIGHT_NAME}}': '{{HEIGHT_VALUE}}',
        {{/EACH_LINE_HEIGHT}}
      },

      letterSpacing: {
        {{#EACH_LETTER_SPACING}}
        '{{SPACING_NAME}}': '{{SPACING_VALUE}}',
        {{/EACH_LETTER_SPACING}}
      },

      /* ============================================
         BORDER TOKENS
         ============================================ */

      borderWidth: {
        {{#EACH_BORDER_WIDTH}}
        '{{WIDTH_NAME}}': '{{WIDTH_VALUE}}',
        {{/EACH_BORDER_WIDTH}}
      },

      borderRadius: {
        {{#EACH_BORDER_RADIUS}}
        '{{RADIUS_NAME}}': '{{RADIUS_VALUE}}',
        {{/EACH_BORDER_RADIUS}}
      },

      borderColor: theme => ({
        ...theme('colors'),
        {{#EACH_BORDER_COLOR_CUSTOM}}
        '{{COLOR_NAME}}': '{{COLOR_VALUE}}',
        {{/EACH_BORDER_COLOR_CUSTOM}}
      }),

      /* ============================================
         SHADOW TOKENS
         ============================================ */

      boxShadow: {
        {{#EACH_SHADOW}}
        '{{SHADOW_NAME}}': '{{SHADOW_VALUE}}',
        {{/EACH_SHADOW}}
      },

      dropShadow: {
        {{#EACH_DROP_SHADOW}}
        '{{SHADOW_NAME}}': '{{SHADOW_VALUE}}',
        {{/EACH_DROP_SHADOW}}
      },

      /* ============================================
         Z-INDEX TOKENS
         ============================================ */

      zIndex: {
        {{#EACH_Z_INDEX}}
        '{{Z_NAME}}': {{Z_VALUE}},
        {{/EACH_Z_INDEX}}
      },

      /* ============================================
         TRANSITION/ANIMATION TOKENS
         ============================================ */

      transitionDuration: {
        {{#EACH_DURATION}}
        '{{DURATION_NAME}}': '{{DURATION_VALUE}}',
        {{/EACH_DURATION}}
      },

      transitionTimingFunction: {
        {{#EACH_EASING}}
        '{{EASING_NAME}}': '{{EASING_VALUE}}',
        {{/EACH_EASING}}
      },

      animation: {
        {{#EACH_ANIMATION}}
        '{{ANIMATION_NAME}}': '{{ANIMATION_VALUE}}',
        {{/EACH_ANIMATION}}
      },

      keyframes: {
        {{#EACH_KEYFRAME}}
        '{{KEYFRAME_NAME}}': {
          {{#EACH_KEYFRAME_STEP}}
          '{{STEP_PERCENTAGE}}': {{STEP_PROPERTIES}},
          {{/EACH_KEYFRAME_STEP}}
        },
        {{/EACH_KEYFRAME}}
      },

      /* ============================================
         BREAKPOINT TOKENS
         ============================================ */

      screens: {
        {{#EACH_BREAKPOINT}}
        '{{BP_NAME}}': '{{BP_VALUE}}',
        {{/EACH_BREAKPOINT}}
      },

      /* ============================================
         CONTAINER TOKENS
         ============================================ */

      container: {
        center: true,
        padding: {
          {{#EACH_CONTAINER_PADDING}}
          '{{BP_NAME}}': '{{PADDING_VALUE}}',
          {{/EACH_CONTAINER_PADDING}}
        },
        screens: {
          {{#EACH_CONTAINER_MAX_WIDTH}}
          '{{BP_NAME}}': '{{MAX_WIDTH}}',
          {{/EACH_CONTAINER_MAX_WIDTH}}
        },
      },

      /* ============================================
         CUSTOM COMPONENT TOKENS
         ============================================ */

      {{#EACH_CUSTOM_TOKEN_CATEGORY}}
      {{CATEGORY_NAME}}: {
        {{#EACH_CUSTOM_TOKEN}}
        '{{TOKEN_NAME}}': '{{TOKEN_VALUE}}',
        {{/EACH_CUSTOM_TOKEN}}
      },
      {{/EACH_CUSTOM_TOKEN_CATEGORY}}

      /* ============================================
         OPACITY TOKENS
         ============================================ */

      opacity: {
        {{#EACH_OPACITY}}
        '{{OPACITY_NAME}}': '{{OPACITY_VALUE}}',
        {{/EACH_OPACITY}}
      },

      /* ============================================
         ASPECT RATIO TOKENS
         ============================================ */

      aspectRatio: {
        {{#EACH_ASPECT_RATIO}}
        '{{RATIO_NAME}}': '{{RATIO_VALUE}}',
        {{/EACH_ASPECT_RATIO}}
      },

      /* ============================================
         GRID TOKENS
         ============================================ */

      gridTemplateColumns: {
        {{#EACH_GRID_COLUMNS}}
        '{{COLUMNS_NAME}}': '{{COLUMNS_VALUE}}',
        {{/EACH_GRID_COLUMNS}}
      },

      gridTemplateRows: {
        {{#EACH_GRID_ROWS}}
        '{{ROWS_NAME}}': '{{ROWS_VALUE}}',
        {{/EACH_GRID_ROWS}}
      },

      gap: {
        {{#EACH_GAP}}
        '{{GAP_NAME}}': '{{GAP_VALUE}}',
        {{/EACH_GAP}}
      },
    },
  },

  /* ============================================
     PLUGINS
     ============================================ */

  plugins: [
    // Custom plugin for design system utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        {{#EACH_CUSTOM_UTILITY}}
        '.{{UTILITY_CLASS}}': {
          {{#EACH_UTILITY_PROPERTY}}
          {{PROPERTY_NAME}}: {{PROPERTY_VALUE}},
          {{/EACH_UTILITY_PROPERTY}}
        },
        {{/EACH_CUSTOM_UTILITY}}
      };

      addUtilities(newUtilities, ['responsive', 'hover']);
    },

    {{#IF_FORMS_PLUGIN}}
    // Tailwind Forms plugin for design system form styles
    require('@tailwindcss/forms')({
      strategy: '{{FORMS_STRATEGY}}', // 'base' or 'class'
    }),
    {{/IF_FORMS_PLUGIN}}

    {{#IF_TYPOGRAPHY_PLUGIN}}
    // Tailwind Typography plugin
    require('@tailwindcss/typography'),
    {{/IF_TYPOGRAPHY_PLUGIN}}

    {{#IF_ASPECT_RATIO_PLUGIN}}
    // Aspect Ratio plugin
    require('@tailwindcss/aspect-ratio'),
    {{/IF_ASPECT_RATIO_PLUGIN}}
  ],

  /* ============================================
     SAFELIST (Optional)
     Ensure certain classes are never purged
     ============================================ */

  safelist: [
    {{#EACH_SAFELIST_PATTERN}}
    {
      pattern: /{{PATTERN_REGEX}}/,
      {{#IF_VARIANTS}}
      variants: [{{VARIANTS}}],
      {{/IF_VARIANTS}}
    },
    {{/EACH_SAFELIST_PATTERN}}
  ],

  /* ============================================
     DARK MODE CONFIGURATION
     ============================================ */

  darkMode: '{{DARK_MODE_STRATEGY}}', // 'media', 'class', or false

  /* ============================================
     IMPORTANT STRATEGY
     ============================================ */

  important: {{IMPORTANT_STRATEGY}}, // true, false, or '#app'
};

/* ============================================
   USAGE EXAMPLES
   ============================================ */

/**
 * Button Example:
 * ```jsx
 * <button className="bg-primary hover:bg-primary-dark text-white px-md py-sm rounded-base shadow-base transition-fast">
 *   Click Me
 * </button>
 * ```
 *
 * Card Example:
 * ```jsx
 * <div className="bg-white p-lg rounded-lg shadow-card border border-neutral-200">
 *   <h2 className="text-xl font-semibold text-neutral-900">Title</h2>
 *   <p className="text-base text-neutral-600 mt-sm">Content here</p>
 * </div>
 * ```
 *
 * Responsive Grid:
 * ```jsx
 * <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
 *   {items.map(item => <Card key={item.id} {...item} />)}
 * </div>
 * ```
 *
 * Dark Mode:
 * ```jsx
 * <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
 *   Content adapts to theme
 * </div>
 * ```
 */

/* ============================================
   TOKEN VALIDATION
   ============================================ */

/**
 * To verify tokens are configured correctly:
 *
 * 1. Check your tailwind.config.js imports this file correctly
 * 2. Run: `npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch`
 * 3. Use classes like: bg-primary, text-lg, p-md
 * 4. Check generated CSS includes your token values
 */
