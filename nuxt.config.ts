// https://nuxt.com/docs/api/configuration/nuxt-config
const isProduction = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  app: {
    baseURL: isProduction ? '/doc/' : '/',
  },
  experimental: {
    defaults: {
      nuxtLink: {
        prefetch: true,
        prefetchOn: {
          interaction: true,
        },
      },
    },
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
        '/': {
          prerender: true,
          headers: {
            'cache-control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400'
          }
        },
        '/contacts': {
          prerender: true,
          headers: {
            'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
          }
        },
        '/services': {
          prerender: true,
          headers: {
            'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
          }
        },
        '/brands': {
          prerender: true,
          headers: {
            'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
          }
        },
        '/delivery': {
          prerender: true,
          headers: {
            'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
          }
        },
        '/privacy': {
          prerender: true,
          headers: {
            'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
          }
        },
        '/terms': {
          prerender: true,
          headers: {
            'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
          }
        },
        '/products': {
          prerender: true,
          headers: {
            'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600'
          }
        },
        '/products/**': {
          prerender: true,
          headers: {
            'cache-control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600'
          }
        },
        '/_nuxt/**': {
          headers: {
            'cache-control': 'public, max-age=31536000, immutable'
          }
        },
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
    // GitHub Pages cannot run the on-demand image transformer, so we keep
    // NuxtImg as a declarative wrapper and let origin/CDN caching serve files.
    provider: 'none',
    domains: [
      'res.cloudinary.com',
      'images.unsplash.com'
    ]
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://doc-api-r2vu.onrender.com'
    }
  }
})
