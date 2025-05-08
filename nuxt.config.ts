// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  runtimeConfig: {
    bedrockAgentId: process.env.BEDROCK_AGENT_ID,
    bedrockAgentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID,
    externalApiKey: process.env.EXTERNAL_API_KEY,
    awsRegion: process.env.AWS_REGION,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    public: {
      // Only expose what's needed on the client side
      awsRegion: process.env.AWS_TRANSCRIBE_REGION
    }
  },

  compatibilityDate: "2024-12-15",

  nitro: {
    routeRules: {
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
        }
      }
    }
  }
})