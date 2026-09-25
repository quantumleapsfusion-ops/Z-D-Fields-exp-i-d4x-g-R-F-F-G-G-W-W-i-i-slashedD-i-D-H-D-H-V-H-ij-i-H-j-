import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './features/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        blackboard: 'rgb(var(--color-blackboard) / <alpha-value>)',
        chalk: 'rgb(var(--color-chalk) / <alpha-value>)',
        dust: 'rgb(var(--color-dust) / <alpha-value>)',
        ochre: 'rgb(var(--color-ochre) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        label: '0.18em',
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
