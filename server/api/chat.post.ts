import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";

// Initialize Bedrock Agent Runtime client
const bedrockAgentClient = new BedrockAgentRuntimeClient({
  region: 'us-east-1'
});

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { message } = body

    console.log('Sending message to Bedrock Agent:', message);

    // Create the command for the agent
    const command = new InvokeAgentCommand({
      agentId: process.env.BEDROCK_AGENT_ID,
      agentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID,
      sessionId: 'test-session',
      inputText: message,
      enableTrace: true
    });

    // Send request to the agent
    const response = await bedrockAgentClient.send(command);
    console.log('Raw Agent Response:', JSON.stringify(response, null, 2));

    // Handle chunked response
    let agentResponse = '';

    if (response.completion) {
      try {
        // Process the async iterator of chunks
        for await (const chunk of response.completion) {
          if (chunk.chunk?.bytes) {
            const decodedChunk = new TextDecoder().decode(chunk.chunk.bytes);
            console.log('Decoded chunk:', decodedChunk);
            agentResponse += decodedChunk;
          }
        }
      } catch (error) {
        console.error('Error processing chunks:', error);
      }
    }

    // If no chunked response, try other response formats
    if (!agentResponse) {
      if (typeof response.completion === 'string') {
        agentResponse = response.completion;
      } else if (response.responseMessage) {
        agentResponse = response.responseMessage;
      }
    }

    console.log('Final Agent Response:', agentResponse);

    return {
      response: agentResponse || 'No response from agent',
      debug: {
        metadata: response.$metadata,
        finalResponse: agentResponse
      }
    }

  } catch (error) {
    console.error('Error details:', error)
    throw createError({
      statusCode: 500,
      message: `Error processing agent request: ${error.message}`,
      cause: error
    })
  }
}) 