// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  runtimeConfig: {
    bedrockAgentId: process.env.BEDROCK_AGENT_ID,
    bedrockAgentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID
  },

  compatibilityDate: "2024-12-15"
})