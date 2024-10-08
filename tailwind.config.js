/** @type {import('tailwindcss').Config} */

const svgToDataUri = require('mini-svg-data-uri')

module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],

  // Fix for dynamic :class
  safelist: [
    'alert-info',
    'alert-success',
    'alert-warning',
    'alert-error',
    'alert-success',
    'btn-primary',
    'btn-secondary',
    'btn-accent',
    'btn-ghost',
    'btn-link',
    'btn-info',
    'btn-success',
    'btn-warning',
    'btn-error',
    'border-success',
    'border-warning',
    'border-error',
    'progress-success',
    'progress-warning',
    'progress-error',
    'max-w-72',
    'from-emerald-300/20',
    'bg-gradient-to-r',
    'font-bold',
    'brightness-125',
    'p-6',
    'pt-4',
    'modal-top',
    'sm:modal-middle'
  ],

  theme: {
    extend: {
      backgroundImage: (theme) => ({
        'multiselect-caret': ``,
        'multiselect-spinner': `url("${svgToDataUri(
            `<svg viewBox="0 0 512 512" fill="${theme('colors.green.500')}" xmlns="http://www.w3.org/2000/svg"><path d="M456.433 371.72l-27.79-16.045c-7.192-4.152-10.052-13.136-6.487-20.636 25.82-54.328 23.566-118.602-6.768-171.03-30.265-52.529-84.802-86.621-144.76-91.424C262.35 71.922 256 64.953 256 56.649V24.56c0-9.31 7.916-16.609 17.204-15.96 81.795 5.717 156.412 51.902 197.611 123.408 41.301 71.385 43.99 159.096 8.042 232.792-4.082 8.369-14.361 11.575-22.424 6.92z"></path></svg>`,
        )}")`,
        'multiselect-remove': ``,
      })
    },
  },

  plugins: [
      require("daisyui"),
      require('@neojp/tailwindcss-important-variant')
  ],

  daisyui: {
    themes: [
      'light',
      'dark',
    ],
  },
}

