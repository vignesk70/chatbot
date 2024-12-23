module.exports = {
    apps: [
      {
        name: 'MOSTIChatbot',
        port: '3000',
        exec_mode: 'cluster',
        instances: 'max',
        script: './.output/server/index.mjs',
        env: {
          BEDROCK_AGENT_ID: "LP261QVRT1",
          BEDROCK_AGENT_ALIAS_ID: process.env.BEDROCK_AGENT_ALIAS_ID
        }
      }
    ]
  }