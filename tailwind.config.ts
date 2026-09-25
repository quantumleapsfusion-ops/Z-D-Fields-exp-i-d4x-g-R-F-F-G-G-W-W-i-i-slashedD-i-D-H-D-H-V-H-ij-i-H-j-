import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'media',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blackboard: 'rgb(var(--color-blackboard) / <alpha-value>)',
        chalk: 'rgb(var(--color-chalk) / <alpha-value>)',
        dust: 'rgb(var(--color-dust) / <alpha-value>)',
        ochre: 'rgb(var(--color-ochre) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        spec: {
          red: 'rgb(var(--color-spec-red) / <alpha-value>)',
          orange: 'rgb(var(--color-spec-orange) / <alpha-value>)',
          yellow: 'rgb(var(--color-spec-yellow) / <alpha-value>)',
          green: 'rgb(var(--color-spec-green) / <alpha-value>)',
          teal: 'rgb(var(--color-spec-teal) / <alpha-value>)',
          blue: 'rgb(var(--color-spec-blue) / <alpha-value>)',
          violet: 'rgb(var(--color-spec-violet) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['var(--font-adventor)', 'Century Gothic', 'Questrial', 'sans-serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        label: '0.12em',
        display: '0.01em',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.25)' },
          '50%': { transform: 'scaleY(1)' },
        },
        drift: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.85' },
        },
        'ink-in': {
          '0%': { opacity: '0', filter: 'blur(6px)', transform: 'translateY(0.35em)' },
          '100%': { opacity: '1', filter: 'blur(0)', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        wave: 'wave 1.4s ease-in-out infinite',
        drift: 'drift 6s ease-in-out infinite',
        'ink-in': 'ink-in 520ms cubic-bezier(0.2, 0.7, 0.2, 1) both',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
