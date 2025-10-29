/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        console: {
          bg: '#0b0c0d',          // deep charcoal
          grid: '#111214',        // grid lines
          dot: '#1a1b1e',         // dotted mesh
          text: '#d8d5c6',        // warm off-white
          dim:  '#9f9a88',        // muted text
          accent: '#d6cfb6',      // beige accent
          warn: '#e0cf9f',        // warmer accent for pulses
        },
      },
      boxShadow: {
        glow: '0 0 0.5rem rgba(214,207,182,0.25), inset 0 0 1.25rem rgba(214,207,182,0.08)',
      },
      fontFamily: {
        mono: ['ui-monospace','SFMono-Regular','Menlo','Monaco','Consolas','Liberation Mono','Courier New','monospace'],
      },
      keyframes: {
        scan: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
        flicker: { '0%,19%,21%,23%,100%': { opacity: 1 }, '20%,22%': { opacity: .85 } },
        blink: { '0%,49%': { opacity: 0 }, '50%,100%': { opacity: 1 } },
        breathe: { '0%,100%': { opacity: .9 }, '50%': { opacity: 1 } },
        pulseDot: { '0%,100%': { opacity: .2 }, '50%': { opacity: .9 } }
      },
      animation: {
        scan: 'scan 4s linear infinite',
        flicker: 'flicker 5s infinite',
        blink: 'blink 1.2s steps(1,end) infinite',
        breathe: 'breathe 6s ease-in-out infinite',
        pulseDot: 'pulseDot 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
