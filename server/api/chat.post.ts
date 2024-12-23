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
    let completion = "";

    if (response.completion) {
      for await (const chunkEvent of response.completion) {
        if (chunkEvent.chunk) {
          const chunk = chunkEvent.chunk;
          console.log(chunk);
          if (chunk.bytes) {
            const decodedResponse = new TextDecoder("utf-8").decode(chunk.bytes);
            completion += decodedResponse;
          }
        }
      }
    }
    console.log("Completion",completion);
    // Extract response from the agent response
    let agentResponse = '';

    if (response.completion) {
      if (typeof response.completion === 'string') {
        agentResponse = response.completion;
      } else if (response.completion.response) {
        agentResponse = response.completion.response;
      } else if (response.completion.text) {
        agentResponse = response.completion.text;
      } else {
        // Handle streaming response if present
        const streamResponse = response.completion?.options?.messageStream?.options?.decoder?.messageBuffer;
        if (Array.isArray(streamResponse)) {
          agentResponse = streamResponse.join('');
        }
      }
    }

    // If no response was extracted, try to get it from other properties
    if (!agentResponse) {
      if (response.responseMessage) {
        agentResponse = response.responseMessage;
      } else if (response.output) {
        agentResponse = typeof response.output === 'string' ? response.output : JSON.stringify(response.output);
      }
    }

    

    console.log('Formatted Agent Response:', agentResponse);

    return {
      response: agentResponse || 'No response from agent',
      debug: {
        rawResponse: response,
        metadata: response.$metadata
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