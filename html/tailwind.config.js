/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/components/**/*.{js,vue,ts}',
    './src/layouts/**/*.vue',
    './src/pages/**/*.vue',
    './src/plugins/**/*.{js,ts}',
    './src/app.vue',
    './src/error.vue',
  ],
  theme: {
    fontFamily: {
      sans: ['YakuHanJPs', 'sans-serif'],
      siteName: ['Dosis', 'sans-serif'],
    },
    extend: {
      colors: {
        'tkhd73-yellow': '#e6e100',
        'tkhd73-yellow-shadow': '#ced81c',
        'tkhd73-green': '#009177',
        'tkhd73-green-shadow': '#a1e9d6',
        'tkhd73-ur': '#73184b',
      },
    },
  },
};
