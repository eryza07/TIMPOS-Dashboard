/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        puskesmas: {
          50: '#F0FDF8',
          100: '#DCFCEE',
          500: '#0D5C46',
          600: '#0B4F3C',
          700: '#084031',
          800: '#063227',
          900: '#04221A',
          DEFAULT: '#0D5C46',
        },
        clinical: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          dark: '#0F172A',
          muted: '#475569',
          lightMuted: '#94A3B8',
        },
        status: {
          normalBg: '#DCFCE7',
          normalText: '#166534',
          normalBorder: '#86EFAC',
          normalBadge: '#15803D',
          waspadaBg: '#FEF9C3',
          waspadaText: '#854D0E',
          waspadaBorder: '#FDE047',
          waspadaBadge: '#B45309',
          bahayaBg: '#FEE2E2',
          bahayaText: '#991B1B',
          bahayaBorder: '#FCA5A5',
          bahayaBadge: '#B91C1C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'clinical': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px 0 rgba(15, 23, 42, 0.03)',
        'clinical-md': '0 4px 6px -1px rgba(15, 23, 42, 0.06), 0 2px 4px -1px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
