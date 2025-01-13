module.exports = {
    apps: [
      {
        name: 'MOSTIChatbot',
        port: '3000',
        exec_mode: 'cluster',
        instances: 'max',
        script: './.output/server/index.mjs',
        env: {
          BEDROCK_AGENT_ID: "F5YWKHZCSF",
          BEDROCK_AGENT_ALIAS_ID: "NVULQ0KMOL"
        }
      }
    ]
  }