/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // CarePath palette — calm clinical teal + warm trust accents
        ink: '#0F2A33',        // deep slate-teal, primary text
        slate2: '#3D5A63',     // muted secondary text
        mist: '#F3F7F7',       // page background
        card: '#FFFFFF',
        teal: {
          50: '#E8F4F3', 100: '#CDE8E6', 400: '#3BA6A0',
          500: '#1F8C86', 600: '#15716C', 700: '#0F5B57',
        },
        amber: { 50: '#FBF3E4', 400: '#E0A53A', 600: '#B97E1A' },
        rose: { 50: '#FBEDED', 400: '#D98A8A', 600: '#B14B4B' },
        leaf: { 50: '#EAF5EC', 500: '#3E9B57', 600: '#2E7A42' },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,42,51,.04), 0 8px 24px -12px rgba(15,42,51,.12)',
        lift: '0 4px 12px rgba(15,42,51,.08), 0 18px 40px -18px rgba(15,42,51,.22)',
      },
      borderRadius: { xl2: '1.25rem' },
    },
  },
  plugins: [],
};
