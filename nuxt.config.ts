import { NuxtConfig } from '@nuxt/types'

const config: NuxtConfig = {
    ssr: false,

    css: ['~/assets/css/main.css'],

    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },

    modules: [
        '@nuxtjs/i18n',
    ],

    i18n: {
        defaultLocale: 'en',

        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'i18n_lang',
            redirectOn: 'root',
        },

        locales: [
            {
                code: 'en',
                name: 'English',
                file: 'en-US.json'
            },
            {
                code: 'ru',
                name: 'Russian',
                file: 'ru-RU.json'
            },
            {
                code: 'ro',
                name: 'Romanian',
                file: 'ro-RO.json'
            },
        ],

        langDir: 'lang/',
        vueI18n: './i18n.options.js',
        strategy: "no_prefix"
    },

    runtimeConfig: {
        public: {
            apiURL: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8080/',
        },
    }
}

export default config