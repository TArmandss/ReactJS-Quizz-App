/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['index.css',"./src/**/*.{html,js}"],
  theme: {
    extend: {
      backgroundColor: {
        'sky-blue': '#61dbfb',
        "customGray": '#343a40',
        "customTwo": "#ced4da",
        "color-light": "#f1f3f5",
        "color-dark": "#495057",
        "white-bg":"#F5F5F5"

      },
    },
  },
  plugins: [],
}