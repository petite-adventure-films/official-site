// https://nuxt.com/docs/api/configuration/nuxt-config

const siteName = 'Petite Adventure Films';
const siteDescription =
  'インディペンデントのドキュメンタリー監督、早川由美子の作品と上映情報を紹介しています。これまでに、反戦・平和運動、住宅・貧困問題、震災・原発問題など、マスメディアでは取り上げられにくいテーマを、独自の視点で表現。これまでの主な作品『ブライアンと仲間たち』、『さようならUR』、『木田さんと原発、そして日本』など。';

export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: 'src/',

  app: {
    head: {
      htmlAttrs: {
        lang: 'ja',
        prefix: 'og: http://ogp.me/ns#',
      },
      charset: 'utf-8',
      title: siteName,
      meta: [
        {
          name: 'description',
          content: siteDescription,
        },
        {
          name: 'theme-color',
          content: '#ffffff',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: siteName },
        { property: 'og:description', content: siteDescription },
        { property: 'og:site_name', content: siteName },
        { property: 'og:url', content: 'https://petiteadventurefilms.com/' },
        { property: 'og:image', content: '/assets/images/ogp.jpg' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/assets/images/icon.svg' },
        {
          rel: 'apple-touch-icon',
          href: '/assets/images/apple-touch-icon.png',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/yakuhanjp@4.0.1/dist/css/yakuhanjp_s.css',
        },
      ],
    },
  },

  typescript: {
    strict: true,
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/eslint',
    '@vueuse/nuxt',
    'nuxt-headlessui',
    '@vee-validate/nuxt',
    'vue-recaptcha/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  components: {
    global: true,
    dirs: ['~/components'],
  },

  veeValidate: {
    autoImports: true,
  },

  runtimeConfig: {
    public: {
      SITE_NAME: siteName,
      API_BASE: '/',
      recaptcha: {
        v2SiteKey: '6LdBq5kiAAAAAFp2PvRbCv4U6DrqxTEOfLVqggJL',
      },
      STRIPE_PUBLISHABLE_KEY:
        'pk_test_51H8OJOKluK1zP0j9cc4YOhcbQhCa8G31WAFcxruwZkvh9VIFNfFO11CFbY7tqQtTuqZqXvfOlEYtcKlQjzhFNbYi00EsaSxkXR',
    },
  },

  nitro: {
    esbuild: {
      options: {
        target: 'es2022',
      },
    },
    prerender: {
      crawlLinks: true,
      failOnError: false,
    },
  },

  vite: {
    build: {
      target: ['es2022', 'edge89', 'firefox89', 'chrome89', 'safari15'],
    },
    optimizeDeps: {
      include: ['pdfjs-dist'],
      esbuildOptions: {
        supported: {
          'top-level-await': true,
        },
      },
    },
  },

  compatibilityDate: '2024-07-21',

  recaptcha: {
    plugin: false,
  },
});
