import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";

// Initialize Bedrock Agent Runtime client
const bedrockAgentClient = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { message, apiKey } = body

    // Basic API key validation
    if (apiKey !== process.env.EXTERNAL_API_KEY) {
      throw createError({
        statusCode: 401,
        message: 'Invalid API key'
      })
    }

    // Generate session ID for external requests
    const sessionId = crypto.randomUUID()

    // Create the command for the agent
    const command = new InvokeAgentCommand({
      agentId: process.env.BEDROCK_AGENT_ID,
      agentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID,
      sessionId: sessionId,
      inputText: message
    });

    // Send request to the agent
    const response = await bedrockAgentClient.send(command);

    // Process response
    let agentResponse = '';
    if (response.completion) {
      for await (const chunk of response.completion) {
        if (chunk.chunk?.bytes) {
          agentResponse += new TextDecoder().decode(chunk.chunk.bytes);
        }
      }
    }

    // Return response in a format suitable for external consumption
    return {
      success: true,
      data: {
        sessionId,
        query: message,
        response: agentResponse || 'No response from agent',
        timestamp: new Date().toISOString()
      }
    }

  } catch (error) {
    console.error('External API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error processing request'
    })
  }
}) 