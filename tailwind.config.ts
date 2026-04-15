import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        mono: ['"Share Tech Mono"', 'monospace'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        bg: '#020818',
        bg2: '#050e24',
        navy: '#0a1628',
        cyan: '#00d4ff',
        cyan2: '#7dd3fc',
        neon: '#00f5d4',
        acid: '#39ff14',
        purple: '#818cf8',
        purple2: '#c4b5fd',
        red: '#f43f5e',
        muted: '#8899bb',
      },
      animation: {
        'scan': 'scan 8s linear infinite',
        'flicker': 'flicker 0.15s infinite linear',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glitch': 'glitch 1s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        glitch: {
          '0%,100%': { clipPath: 'inset(0 0 95% 0)', transform: 'translate(0)' },
          '20%': { clipPath: 'inset(30% 0 50% 0)', transform: 'translate(-3px, 1px)' },
          '40%': { clipPath: 'inset(60% 0 20% 0)', transform: 'translate(3px, -1px)' },
          '60%': { clipPath: 'inset(80% 0 5% 0)', transform: 'translate(-2px, 2px)' },
          '80%': { clipPath: 'inset(10% 0 75% 0)', transform: 'translate(2px, -2px)' },
        },
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)`,
        'hero-gradient': 'radial-gradient(ellipse at 20% 50%, rgba(0,100,150,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(79,70,229,0.12) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
export default config
