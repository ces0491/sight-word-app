const INK = '#233059';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Picture-book palette. styles/globals.css exposes these as CSS variables.
        ink: INK,
        paper: '#ffffff',
        sky: '#d9eeff',
        mist: '#eef6ff',
        sun: '#ffc83d',
        leaf: '#26a96c',
        berry: '#ee4f7a',
        // Word card tints, used in rotation
        card: {
          sun: '#ffd96b',
          mint: '#a8e8c9',
          pink: '#ffc2d1',
          blue: '#b5dbff',
          lilac: '#dccfff',
        },
      },
      fontFamily: {
        // Andika: made for beginning readers (single-storey a and g)
        read: ['var(--font-read)', 'system-ui', 'sans-serif'],
        // Fredoka: rounded headings and buttons
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        cutout: `4px 4px 0 ${INK}`,
        'cutout-sm': `2px 2px 0 ${INK}`,
        'cutout-lg': `6px 6px 0 ${INK}`,
      },
      borderWidth: {
        3: '3px',
      },
    },
  },
  plugins: [],
}
