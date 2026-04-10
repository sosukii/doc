// https://nuxt.com/docs/api/configuration/nuxt-config
const isProduction = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  app: {
    baseURL: isProduction ? '/doc/' : '/',
  },
  nitro: isProduction
    ? {
        preset: 'github-pages',
      }
    : {},
  compatibilityDate: '2024-11-01',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/scripts',
    '@nuxtjs/i18n',
    '@nuxt/eslint'
  ],

  routeRules: isProduction
    ? {
        '/': { prerender: true },
        '/products': { prerender: true },
        '/products/*': { prerender: true },
      }
    : {},

  css: ['~/assets/css/main.css'],

  fonts: {
    families: [
      { name: 'Space Grotesk', provider: 'google' },
      { name: 'Inter', provider: 'google' }
    ]
  },

  i18n: {
    locales: [
      { code: 'ru', iso: 'ru-RU', file: 'ru.json', name: 'Русский' },
      { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' }
    ],
    defaultLocale: 'ru',
    lazy: true,
    langDir: 'locales/',
    strategy: 'prefix_except_default'
  },

  image: {
    domains: ['res.cloudinary.com']
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://doc-api-r2vu.onrender.com'
    }
  }
})
