import { BedrockAgentRuntimeClient, InternalServerException, InvokeAgentCommand, ValidationException } from "@aws-sdk/client-bedrock-agent-runtime";
import { StringDecoder } from "string_decoder";
import { getDB } from '../utils/db'

// Add this interface for user details
interface UserDetails {
  ip: string;
  userAgent: string;
  language: string;
  timestamp: string;
  timezone?: string;
  referer?: string;
  platform?: string;
  screenResolution?: string;
}

// Update the logger function
const logSessionData = async (sessionId: string, query: string, response: string, userDetails: UserDetails) => {
  try {
    const db = await getDB()
    
    await db.run(`
      INSERT INTO chat_logs (
        session_id, query, response, ip_address, user_agent, 
        language, timezone, referer, platform, screen_resolution
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sessionId,
      query,
      response,
      userDetails.ip,
      userDetails.userAgent,
      userDetails.language,
      userDetails.timezone,
      userDetails.referer,
      userDetails.platform,
      userDetails.screenResolution
    ])
  } catch (error) {
    console.error('Database logging error:', error)
  }
}

// Initialize Bedrock Agent Runtime client with just the region
const bedrockAgentClient = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION
});

interface Citation {
  title: string;
  url?: string | null;
  snippet?: string | null;
  location?: {
    start?: number;
    end?: number;
  } | null;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { message } = body
    
    // Extract user details from request headers and body
    const headers = getHeaders(event)
    const userDetails: UserDetails = {
      ip: getRequestHeader(event, 'x-forwarded-for') || 'unknown',
      userAgent: headers['user-agent'] || 'unknown',
      language: headers['accept-language'] || 'unknown',
      timestamp: new Date().toISOString(),
      timezone: body.timezone || 'unknown',
      referer: headers['referer'] || 'unknown',
      platform: headers['sec-ch-ua-platform'] || 'unknown',
      screenResolution: body.screenResolution || 'unknown'
    }

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
          //Debug object chunh
          console.debug('chunk', JSON.stringify(chunk,null,2))
          
          // Handle citations from retrievedReferences
          if (chunk.chunk?.attribution?.citations) {
            for (const citation of chunk.chunk.attribution.citations) {
              if (citation.retrievedReferences && Array.isArray(citation.retrievedReferences)) {
                const processedCitations = citation.retrievedReferences.map((ref, index) => ({
                  title: `Source ${index + 1}`,
                  url: ref.metadata?.web_source_url || null,
                  snippet: ref.metadata?.web_site_map || ref.content?.text || null,
                  location: ref.location || null
                }));
                citations = citations.concat(processedCitations);
              }
            }
            // Debug citations
            console.log('Processed citations:', JSON.stringify(citations, null, 2));
          }
        }

        // Remove duplicate citations
        citations = citations.filter((citation, index, self) =>
          index === self.findIndex((c) => (
            (c.url && c.url === citation.url) || 
            (c.snippet && c.snippet === citation.snippet)
          ))
        );

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

    // Update the logging call
    await logSessionData(sessionId, message, agentResponse, userDetails);

    return {
      response: agentResponse,
      citations: citations,
      sessionId: sessionId // Return sessionId to client
    };

  } catch (error) {
    console.error('Error:', error)
    throw createError({
      statusCode: 500,
      message: `Error processing agent request: ${error.message}`
    })
  }
})