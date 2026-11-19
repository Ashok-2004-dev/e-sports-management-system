export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ESPORTS THEME: neutral charcoal base instead of the old navy. Every page uses these tokens, so the whole site re-themes from here.
        ink: { 950: '#08090c', 900: '#0d0f14', 800: '#12151c', 700: '#1a1e28', 600: '#272c3a' },
        brand: { DEFAULT: '#7c5cff', 400: '#a28bff' }, // electric violet: primary buttons, active tabs
        neon: { cyan: '#22d3ee', pink: '#f43f5e', lime: '#a3e635' }, // cyan is the interaction accent (hover glow, focus, links)
        live: { DEFAULT: '#ff2e4d', soft: '#ff6b81' }, // crimson is reserved for LIVE indicators only
      },
      fontFamily: {
        display: ['Rajdhani', 'Segoe UI', 'sans-serif'], // scores, numbers, card titles
        game: ['"Chakra Petch"', 'Rajdhani', 'Segoe UI', 'sans-serif'], // angular, futuristic headings (replaces Orbitron)
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'none' } },
        floaty: { '0%,100%': { transform: 'translateY(0) rotate(var(--r,0deg))' }, '50%': { transform: 'translateY(-26px) rotate(calc(var(--r,0deg) + 8deg))' } },
        orb: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(40px,-30px) scale(1.15)' } },
        scan: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100vh)' } },
        gridmove: { '0%': { backgroundPosition: '0 0' }, '100%': { backgroundPosition: '0 60px' } },
        ring: { '0%,100%': { transform: 'rotate(0)' }, '10%,30%,50%': { transform: 'rotate(14deg)' }, '20%,40%': { transform: 'rotate(-14deg)' }, '60%': { transform: 'rotate(0)' } },
        glowpulse: { '0%,100%': { opacity: 0.55 }, '50%': { opacity: 1 } },
        // ANIMATIONS (new): route fade, hero side panel slide-in, score "pop" when a live score changes
        pageIn: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'none' } },
        panelIn: { '0%': { opacity: 0, transform: 'translateX(24px)' }, '100%': { opacity: 1, transform: 'none' } },
        pop: { '0%': { transform: 'scale(1.5)', opacity: 0.4 }, '60%': { transform: 'scale(0.96)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
      },
      animation: {
        fadeUp: 'fadeUp .5s ease-out both',
        floaty: 'floaty 9s ease-in-out infinite',
        orb: 'orb 16s ease-in-out infinite',
        scan: 'scan 9s linear infinite',
        gridmove: 'gridmove 4s linear infinite',
        ring: 'ring 2.4s ease-in-out infinite',
        glowpulse: 'glowpulse 3s ease-in-out infinite',
        pageIn: 'pageIn .32s cubic-bezier(.2,.7,.2,1) both',
        panelIn: 'panelIn .6s cubic-bezier(.2,.7,.2,1) .35s both',
        pop: 'pop .5s cubic-bezier(.2,.9,.3,1.2) both',
      },
    },
  },
  plugins: [],
};
