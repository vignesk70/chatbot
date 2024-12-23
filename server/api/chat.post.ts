import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";

// Initialize Bedrock Agent Runtime client without explicit credentials
// It will automatically use the EC2 instance's IAM role
const bedrockAgentClient = new BedrockAgentRuntimeClient({
  region: 'us-east-1'
});

// Add this near the top of the file for testing
const TEST_QUERY = "What services does MOSTI provide?";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { message } = body

    // Inside the handler, add a log to see if the agent is receiving the query
    console.log('Sending query to agent:', message || TEST_QUERY);

    const formattedPrompt = `\n\nHuman: ${message}\n\nAssistant:`;

    // Create the command for the agent
    const command = new InvokeAgentCommand({
      agentId: process.env.BEDROCK_AGENT_ID,
      agentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID,
      sessionId: 'test-session',
      inputText: formattedPrompt,
      enableTrace: true // Enable tracing for debugging
    });

    const response = await bedrockAgentClient.send(command);
    
    // Debug log to see the full response structure
    console.log('Raw Bedrock Agent Response:', JSON.stringify(response, null, 2));

    // Handle streaming response
    let formattedResponse = '';
    
    if (response.completion?.options?.messageStream?.options?.decoder?.messageBuffer) {
      // Extract messages from buffer
      const messageBuffer = response.completion.options.messageStream.options.decoder.messageBuffer;
      formattedResponse = messageBuffer.join(' ');
    } else if (response.completion?.response) {
      // Direct response
      formattedResponse = response.completion.response;
    } else if (response.completion?.message) {
      // Message format
      formattedResponse = response.completion.message;
    } else if (response.completion) {
      // Try to extract any text content from completion
      formattedResponse = JSON.stringify(response.completion);
    }

    // If still no response, try to get raw response content
    if (!formattedResponse && response.body) {
      try {
        const rawResponse = await response.body.transformToString();
        formattedResponse = rawResponse;
      } catch (error) {
        console.error('Error transforming body:', error);
      }
    }

    // Log the formatted response for debugging
    console.log('Formatted Response:', formattedResponse);

    return {
      response: formattedResponse || 'No response content available',
      debug: {
        rawResponse: response,
        formattedResponse,
        metadata: response.$metadata
      }
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