/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1600px',
        '4xl': '1920px',
      },
      colors: {
        y500: '#FFC700',
        y600: '#A68100',
        g500: '#0B8B00',
        g400: '#2AB514',
        b500: '#00168B',
        r500: '#951200',
        r400: '#FFBCBC',
        light: '#FFF5D1',
        grey: '#555555',
        black: '#032300',
        white: '#FFFFFF',
      },
      fontSize: {
        'auto-xs': 'calc(6px + 1vmin)',
        'auto-sm': 'calc(8px + 1vmin)',
        'auto-base': 'calc(11px + 1vmin)',
        'auto-lg': 'calc(14px + 1vmin)',
        'auto-xl': 'calc(16px + 1vmin)',
        'auto-2xl': 'calc(18px + 1vmin)',
      },
      keyframes: {
        light: {
          '0%, 100%': {
            transform: `rotate(-10deg)`,
            filter:
              `drop-shadow(1px 2px 2px rgb(255, 255, 0))
              drop-shadow(2px -2px 2px rgb(208, 255, 0))
              drop-shadow(-1px 1px 2px rgb(0, 242, 255))`
          },
          '50%': {
            transform: `rotate(10deg)`,
            filter:
              `drop-shadow(0px 2px 1px rgba(255, 255, 0, .5))
              drop-shadow(1px -1px 2px rgba(255, 255, 255, .25))
              drop-shadow(0px 2px 1px rgba(0, 242, 255, .5))`
          }
        }
      },
      animation: {
        light: `light 2s infinite`
      }
    },
  },
  plugins: [],
}

