/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx,md,mdx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        'ink-3': 'var(--ink-3)',
        mute: 'var(--mute)',
        'mute-2': 'var(--mute-2)',
        'mute-3': 'var(--mute-3)',
        paper: 'var(--paper)',
        'paper-2': 'var(--paper-2)',
        'paper-3': 'var(--paper-3)',
        accent: 'var(--accent)',
        'accent-bg': 'var(--accent-bg)',
        'accent-ink': 'var(--accent-ink)',
        danger: 'var(--danger)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        hairline: 'var(--border)',
      },
      fontFamily: {
        mono: ['var(--font-mono)'],
        serif: ['var(--font-serif)'],
      },
      borderRadius: {
        sm: '3px',
        md: '4px',
        lg: '12px',
      },
      maxWidth: {
        measure: '68ch',
        'measure-narrow': '60ch',
      },
      width: {
        rail: 'var(--rail-w)',
      },
    },
  },
  plugins: [],
};
