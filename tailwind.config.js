/** @type {import('tailwindcss').Config} */
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
    'btn-error'
  ],

  theme: {
    extend: {},
  },
  plugins: [
      require("daisyui")
  ],

  daisyui: {
    themes: [
      'light',
      'dark',
    ],
  },
}

