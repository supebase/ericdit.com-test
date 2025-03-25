// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  ssr: false,
  modules: ["@nuxt/ui", "@vueuse/nuxt", "@nuxtjs/mdc", "nuxt-emoji-picker"],

  future: {
    compatibilityVersion: 4,
  },

  runtimeConfig: {
    public: {
      directusApiUrl: import.meta.env.DIRECTUS_API_URL,
    },
  },

  app: {
    keepalive: true,
    buildAssetsDir: "static",
    head: {
      htmlAttrs: {
        lang: "zh-CN",
      },
      viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
    },
  },

  vue: {
    propsDestructure: true,
  },

  vite: {
    build: {
      minify: "terser",
      target: "esnext",
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "@vueuse/core"],
    },
  },

  nitro: {
    compressPublicAssets: true,
    sourceMap: false,
    timing: false,
    esbuild: {
      options: {
        target: "esnext",
      },
    },
    prerender: {
      crawlLinks: true,
    },
  },

  build: {
    transpile: ["vue-router"],
    analyze: false,
  },

  router: {
    options: {
      scrollBehaviorType: "smooth",
    },
  },

  mdc: {
    highlight: {
      theme: {
        default: "github-light",
        dark: "github-dark",
      },
    },
    components: {
      prose: true,
    },
  },

  components: [
    {
      global: true,
      path: "./components",
    },
  ],

  icon: {
    serverBundle: {
      collections: ["hugeicons", "svg-spinners"],
      externalizeIconsJson: true,
    },
    clientBundle: {
      scan: true,
    },
  },

  colorMode: {
    preference: "dark",
  },

  css: ["~/assets/app.css"],
});
