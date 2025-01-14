import { BedrockAgentRuntimeClient, InternalServerException, InvokeAgentCommand, ValidationException } from "@aws-sdk/client-bedrock-agent-runtime";
import { StringDecoder } from "string_decoder";

// Logger function to capture session data
const logSessionData = async (sessionId: string, query: string, response: string) => {
  try {
    // Log the session data asynchronously to not block the main flow
    setTimeout(async () => {
      console.log({
        timestamp: new Date().toISOString(),
        sessionId,
        query,
        response,
      });
      // Here you can add your preferred logging mechanism
      // For example: writing to a file, sending to a logging service,
      // or storing in a database
    }, 0);
  } catch (error) {
    // Silently handle logging errors to not affect main flow
    console.error('Logging error:', error);
  }
};

// Initialize Bedrock Agent Runtime client with just the region
const bedrockAgentClient = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION
});

interface Citation {
  title: string;
  snippet?: string;
  retrievedReference?: {
    metadata?: {
      web_source_url?: string;
      web_site_map?: string;
    };
  };
  location?: {
    start?: number;
    end?: number;
  };
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { message } = body

   
    // Get session ID from cookie or generate a new one
    let sessionId = getCookie(event, 'sessionId')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      setCookie(event, 'sessionId', sessionId, {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
        httpOnly: true
      })
    }
    // Create the command for the agent
    const command = new InvokeAgentCommand({
      agentId: process.env.BEDROCK_AGENT_ID,
      agentAliasId: process.env.BEDROCK_AGENT_ALIAS_ID,
      sessionId: sessionId,
      inputText: message
    });

    // Send request to the agent
    const response = await bedrockAgentClient.send(command);

    // Handle chunked response
    let agentResponse = '';
    let citations = [];

    if (response.completion) {
      try {
        // Process the async iterator of chunks
        for await (const chunk of response.completion) {
          // Handle text chunks
          if (chunk.chunk?.bytes) {
            const decodedChunk = new TextDecoder().decode(chunk.chunk.bytes);
            agentResponse += decodedChunk;
          }
          
          // Handle citations from retrievedReferences
          if (chunk.chunk?.attribution?.citations) {
            for (const citation of chunk.chunk.attribution.citations) {
              if (citation.retrievedReferences && Array.isArray(citation.retrievedReferences)) {
                console.log('Citation:', citation.retrievedReferences.metadata)
                const processedCitations = citation.retrievedReferences.map((ref, index) => ({
                  title: `Source ${index + 1}`,
                  url: ref.metadata?.web_source_url || null,
                  snippet: ref.metadata?.web_site_map || ref.content?.snippet || null,
                  location: ref.location || null
                }));
                citations = citations.concat(processedCitations);
              }
            }
          }
        }

        // Remove duplicate citations
        citations = citations.filter((citation, index, self) =>
          index === self.findIndex((c) => (
            (c.url && c.url === citation.url) || 
            (c.snippet && c.snippet === citation.snippet)
          ))
        );

        console.log('Final processed citations:', citations); // Debug final output
      } catch (error) {
        console.error('Error processing request:', error);
        if (error instanceof InternalServerException) {
          console.error('Error message InternalServerException:', error.message);
        }
        else if (error instanceof ValidationException){
          console.error('Error message ValidationException:', error.message);
          agentResponse += "Were setting things up behind the scenes. Please try again later."
        }
        else 
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

    // Log the session data without blocking the response
    await logSessionData(sessionId, message, agentResponse);

    return {
      response: agentResponse,
      citations: citations
    };

  } catch (error) {
    console.error('Error:', error)
    throw createError({
      statusCode: 500,
      message: `Error processing agent request: ${error.message}`
    })
  }
}) 