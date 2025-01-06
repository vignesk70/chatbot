import { BedrockAgentRuntimeClient, InternalServerException, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";

// Initialize Bedrock Agent Runtime client
const bedrockAgentClient = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION
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
      inputText: message
    });

    // Send request to the agent
    const response = await bedrockAgentClient.send(command);

    // Handle chunked response
    let agentResponse = '';

    if (response.completion) {
      try {
        // Process the async iterator of chunks
        for await (const chunk of response.completion) {
          if (chunk.chunk?.bytes) {
            const decodedChunk = new TextDecoder().decode(chunk.chunk.bytes);
            agentResponse += decodedChunk;
          }
        }
      } catch (error) {
        console.error('Error processing request:', error);
        if (error instanceof InternalServerException) {
          console.error('Error message InternalServerException:', error.message);
        }
        agentResponse += 'Error processing request. Please try again later.';
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

    return {
      response: agentResponse || 'No response from agent'
    }

  } catch (error) {
    console.error('Error:', error)
    throw createError({
      statusCode: 500,
      message: `Error processing agent request: ${error.message}`
    })
  }
}) 