import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        mustard: '#F8C62A',
        cream: '#FFF7E9',
        offwhite: '#FFFDF7',
        ink: '#111111',
        cyanpop: '#58D4F5',
        olivepop: '#8AA341',
        coralpop: '#FF6F61'
      },
      borderRadius: {
        brutal: '18px'
      },
      boxShadow: {
        brutal: '4px 4px 0 #111111',
        brutalSm: '2px 2px 0 #111111'
      },
      fontFamily: {
        display: ['"Trebuchet MS"', '"Avenir Next"', 'sans-serif'],
        body: ['"Nunito"', '"Trebuchet MS"', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
