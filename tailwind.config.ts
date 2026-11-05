import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#05080F',      // base: rich blue-black
        panel: '#0B111D',
        raised: '#121A2A',
        snow: '#EEF2F8',     // primary text
        smoke: '#8D97AA',    // secondary text
        signal: '#7FA6FF',   // focus + active state only
        line: 'rgba(150,170,210,0.16)',
      },
      fontFamily: {
        sans: ['Barlow', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Barlow', 'sans-serif'],
      },
      maxWidth: { site: '1320px' },
    },
  },
  plugins: [],
}
export default config
