import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

// Initialize Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: 'us-east-1', // Explicitly set to us-east-1
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { message } = body

    // Format the prompt according to Claude's requirements
    const prompt = `\n\nHuman: ${message}\n\nAssistant:`

    // Prepare the payload for Claude
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 300,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: message
        }
      ]
    }

    // Create the command with your inference profile ARN
    const command = new InvokeModelCommand({
      modelId: 'arn:aws:bedrock:us-east-1:863518428030:inference-profile/us.anthropic.claude-3-5-haiku-20241022-v1:0', // Replace with your actual inference profile ARN
      body: JSON.stringify(payload),
      contentType: 'application/json',
      accept: 'application/json'
    })

    //arn:aws:bedrock:us-east-1:863518428030:inference-profile/us.anthropic.claude-3-5-haiku-20241022-v1:0

    // Send request and get response
    const response = await bedrockClient.send(command)
    const responseData = JSON.parse(new TextDecoder().decode(response.body))

    // Return the response
    return {
      response: responseData.content[0].text
    }

  } catch (error) {
    console.error('Error:', error)
    throw createError({
      statusCode: 500,
      message: `Error processing chat request: ${error.message}`
    })
  }
}) 