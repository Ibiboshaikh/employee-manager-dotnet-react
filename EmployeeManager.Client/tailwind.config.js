/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand = NovIqra teal (mirrors the marketing site's --teal scale).
        // brand-600 (#2a93a8) is the site's primary teal used for buttons/links.
        brand: {
          50:  '#eef9fb',
          100: '#d4eef3',
          200: '#a9dde6',
          300: '#5cc2d4',
          400: '#36a8bd',
          500: '#36a8bd',
          600: '#2a93a8',
          700: '#23798b',
          800: '#1c6070',
          900: '#163a63',
        },
        // Navy = the site's --navy scale (deep brand base for headers/footers).
        navy: {
          700: '#163a63',
          800: '#102a4c',
          900: '#0b1f3a',
        },
        ink: '#1d2733',
        muted: '#5b6675',
        line: '#e4e8ee',
      },
      fontFamily: {
        // Body text uses Inter; headings use Poppins — same as the site.
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        // Soft navy-tinted card shadow matching the site's --shadow.
        card: '0 18px 40px -20px rgba(11, 31, 58, 0.28)',
      },
      borderRadius: {
        xl: '16px',
      },
    },
  },
  plugins: [],
};
