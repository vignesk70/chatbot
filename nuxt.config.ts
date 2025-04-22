// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  runtimeConfig: {
    bedrockAgentId: process.env.BEDROCK_AGENT_ID,
    bedrockAgentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID,
    externalApiKey: process.env.EXTERNAL_API_KEY
  },

  compatibilityDate: "2024-12-15",

  nitro: {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
    }
  }
})