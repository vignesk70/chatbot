module.exports = {
    apps: [
      {
        name: 'MOSTIChatbot',
        port: '3000',
        exec_mode: 'cluster',
        instances: 'max',
        script: './.output/server/index.mjs',
        env: {
          AWS_REGION: "ap-northeast-1",
          BEDROCK_AGENT_ID: "19VLLTF2OD",
          BEDROCK_AGENT_ALIAS_ID: "JZKKSBXKTJ"
        }
      }
    ]
  }