// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  ssr: false,
  modules: ["@nuxt/ui", "@pinia/nuxt", "@vueuse/nuxt"],

  runtimeConfig: {
    public: {
      directusApiUrl: import.meta.env.DIRECTUS_API_URL,
    },
  },

  app: {
    keepalive: true,
  },

  colorMode: {
    preference: "dark",
  },

  css: ["~/assets/app.css"],
});
