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
    });

    const response = await bedrockAgentClient.send(command);
    const completion = response.completion;

    return {
      response: completion
    }

  } catch (error) {
    console.error('Error:', error)
    throw createError({
      statusCode: 500,
      message: `Error processing chat request: ${error.message}`
    })
  }
}) 