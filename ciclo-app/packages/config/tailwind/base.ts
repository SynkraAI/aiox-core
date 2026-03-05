import type { Config } from 'tailwindcss'

const config: Partial<Config> = {
  theme: {
    screens: {
      sm: '375px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Base Triade (neutros) - disponivel em todas as estacoes
        'base-dark': '#2d1810',
        'base-gold': '#d4a574',
        'base-sienna': '#8B4513',
        'base-bg': '#fef9f0',

        // Paleta Sazonal via CSS custom properties
        seasonal: {
          primary: 'var(--seasonal-primary)',
          secondary: 'var(--seasonal-secondary)',
          accent: 'var(--seasonal-accent)',
        },

        // shadcn/ui compatible tokens via CSS custom properties
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'season-fade': {
          '0%': { opacity: '0.7' },
          '100%': { opacity: '1' },
        },
        'season-slide': {
          '0%': { transform: 'translateY(4px)', opacity: '0.8' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'season-fade': 'season-fade 0.5s ease-out',
        'season-slide': 'season-slide 0.4s ease-out',
      },
      transitionProperty: {
        seasonal: 'background-color, border-color, color, fill, stroke, box-shadow',
      },
      transitionDuration: {
        seasonal: '500ms',
      },
    },
  },
}

export default config
