/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 🌸 REVISÁ QUE ESTÉ ACÁ ADENTRO:
      colors: {
        spa: {
          principal: '#EAA0AB',
          oscuro: '#A87379',
          pastel: '#F4CFCC',
          fondo: '#FBF9F8',
        }
      },
    },
  },
  plugins: [],
}