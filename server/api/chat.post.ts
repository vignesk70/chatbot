import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";

// Initialize Bedrock Agent Runtime client without explicit credentials
// It will automatically use the EC2 instance's IAM role
const bedrockAgentClient = new BedrockAgentRuntimeClient({
  region: 'us-east-1'
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { message } = body

    // Create the command for the agent
    const command = new InvokeAgentCommand({
      agentId: process.env.BEDROCK_AGENT_ID,
      agentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID,
      sessionId: 'test-session',
      inputText: message,
      enableTrace: true // Enable tracing for debugging
    });

    const response = await bedrockAgentClient.send(command);
    
    // Debug log to see the full response structure
    console.log('Raw Bedrock Agent Response:', JSON.stringify(response, null, 2));

    // Extract the response content
    let formattedResponse = '';
    
    if (response.completion) {
      formattedResponse = response.completion;
    } else if (response.messageVersion) {
      // Handle streaming response
      formattedResponse = response.messageVersion;
    } else if (response.messages && response.messages.length > 0) {
      formattedResponse = response.messages[0].content;
    } else if (response.chunks && response.chunks.length > 0) {
      // Handle chunked response
      formattedResponse = response.chunks.map(chunk => chunk.text || chunk.content).join('');
    } else if (response.text) {
      // Direct text response
      formattedResponse = response.text;
    } else if (typeof response === 'object') {
      // If none of the above, stringify the entire response for debugging
      formattedResponse = `Debug Response: ${JSON.stringify(response, null, 2)}`;
    }

    // Log the formatted response
    console.log('Formatted Response:', formattedResponse);

    return {
      response: formattedResponse || 'No response content available',
      debug: response // Include raw response for debugging
    }

  } catch (error) {
    console.error('Error details:', error)
    throw createError({
      statusCode: 500,
      message: `Error processing chat request: ${error.message}`,
      cause: error
    })
  }
}) 