/** Palet pastel + font yang dipakai di seluruh aplikasi */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF9F5',
        ink: { DEFAULT: '#4A3F5C', soft: '#6F6482' },
        blush: { DEFAULT: '#FFC8DD', deep: '#FF8FB8', soft: '#FFE8F0' },
        minty: { DEFAULT: '#BDEBDD', deep: '#5CC7A3', soft: '#E4F7F1' },
        lilac: { DEFAULT: '#D9CCFF', deep: '#9B84F0', soft: '#F0EBFF' },
        peachy: { DEFAULT: '#FFD9C0', deep: '#FFA877', soft: '#FFF0E6' },
        skyp: { DEFAULT: '#BFE3FF', deep: '#6FB6F0', soft: '#E8F4FF' },
      },
      fontFamily: {
        display: ['"Fredoka Variable"', 'Fredoka', 'ui-rounded', 'sans-serif'],
        body: ['"Nunito Variable"', 'Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(155,132,240,.45)',
        pop: '0 5px 0 0 rgba(155,132,240,.28)',
      },
      borderRadius: { '4xl': '2rem' },
    },
  },
  plugins: [],
}
