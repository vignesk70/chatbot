// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  colorMode: {
    preference: 'system', // default value of $colorMode.preference
    fallback: 'light', // fallback value if not system preference found
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },
  ssr: true,
  runtimeConfig: {
    bedrockAgentId: process.env.BEDROCK_AGENT_ID,
    bedrockAgentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID,
    externalApiKey: process.env.EXTERNAL_API_KEY
  },

  compatibilityDate: "2024-12-15",

  nitro: {
    preset: 'node-server',
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
    }
  }
})