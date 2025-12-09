import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Additional Brutalist colors
        'accent-purple': 'hsl(var(--accent-purple))',
        'accent-orange': 'hsl(var(--accent-orange))',
        'accent-cyan': 'hsl(var(--accent-cyan))',
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        info: 'hsl(var(--info))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // All borders are 0 radius in Brutalist style
        none: '0',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Type scale based on Major Third (1.250)
        xs: ['0.75rem', { lineHeight: '1.5' }],      // 12px
        sm: ['0.875rem', { lineHeight: '1.5' }],     // 14px
        base: ['1rem', { lineHeight: '1.5' }],       // 16px
        lg: ['1.25rem', { lineHeight: '1.5' }],      // 20px
        xl: ['1.563rem', { lineHeight: '1.4' }],     // 25px
        '2xl': ['1.953rem', { lineHeight: '1.3' }],  // 31px
        '3xl': ['2.441rem', { lineHeight: '1.2' }],  // 39px
        '4xl': ['3.052rem', { lineHeight: '1.2' }],  // 49px
        '5xl': ['3.815rem', { lineHeight: '1.1' }],  // 61px
        '6xl': ['4.768rem', { lineHeight: '1' }],    // 76px
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
      lineHeight: {
        tight: '1.2',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.75',
        loose: '2',
      },
      boxShadow: {
        // Brutalist hard shadows
        'brutal-sm': '2px 2px 0px hsl(var(--foreground))',
        'brutal': '4px 4px 0px hsl(var(--foreground))',
        'brutal-md': '6px 6px 0px hsl(var(--foreground))',
        'brutal-lg': '8px 8px 0px hsl(var(--foreground))',
        'brutal-xl': '12px 12px 0px hsl(var(--foreground))',
        // Colored shadows
        'brutal-primary': '4px 4px 0px hsl(var(--primary))',
        'brutal-secondary': '4px 4px 0px hsl(var(--secondary))',
        'brutal-accent': '4px 4px 0px hsl(var(--accent))',
        // No soft shadows
        none: 'none',
      },
      borderWidth: {
        DEFAULT: '1px',
        0: '0',
        2: '2px',
        3: '3px',
        4: '4px',
        6: '6px',
        8: '8px',
      },
      spacing: {
        // Extended spacing scale
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
        34: '8.5rem',
        38: '9.5rem',
      },
      animation: {
        // Minimal, functional animations only
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '350ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      // Custom utilities for grid patterns
      backgroundImage: {
        'grid-pattern': 'linear-gradient(hsl(var(--foreground) / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.05) 1px, transparent 1px)',
        'dots-pattern': 'radial-gradient(circle, hsl(var(--foreground) / 0.1) 1px, transparent 1px)',
        'diagonal-lines': 'repeating-linear-gradient(45deg, transparent, transparent 10px, hsl(var(--foreground) / 0.03) 10px, hsl(var(--foreground) / 0.03) 20px)',
      },
      backgroundSize: {
        'grid-32': '32px 32px',
        'dots-24': '24px 24px',
      },
    },
  },
  plugins: [],
} satisfies Config
