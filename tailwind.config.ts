import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Modern light theme color palette (Linear/Notion/Height inspired)
        background: {
          DEFAULT: '#fafbfc',
          page: '#f8fafc',
          surface: '#ffffff',
        },
        border: {
          DEFAULT: '#e2e8f0',
          hover: '#cbd5e1',
        },
        text: {
          primary: '#0f172a',
          secondary: '#475569',
          muted: '#64748b',
        },
        accent: {
          DEFAULT: '#7c3aed',
          hover: '#6d28d9',
          light: '#ede9fe',
        },
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        sm: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.06)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
      },
    },
  },
  plugins: [forms, typography],
};

export default config;
