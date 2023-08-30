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
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'i18n_lang',
            redirectOn: 'root',
        },

        locales: [
            {
                code: 'en',
                file: 'en-US.json'
            },
            {
                code: 'ru',
                file: 'ru-RU.json'
            }
        ],

        lazy: true,
        langDir: 'lang/',
        defaultLocale: 'en',

        strategy: "no_prefix"
    },

    runtimeConfig: {
        public: {
            apiURL: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8080/',
        },
    }
}

export default config