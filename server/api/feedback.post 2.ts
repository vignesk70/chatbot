import { createError } from 'h3'
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB client with specific region and endpoint
const client = new DynamoDBClient({
  region: 'us-east-1', // Specific region for DynamoDB
  endpoint: process.env.DYNAMODB_ENDPOINT,
  credentials: {
    accessKeyId: process.env.DYNAMODB_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.DYNAMODB_SECRET_ACCESS_KEY || ''
  }
});

const docClient = DynamoDBDocumentClient.from(client);

// Interface for feedback data
interface FeedbackData {
  sessionId: string
  query: string
  response: string
  isHelpful: boolean
  timestamp: string
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { sessionId, query, response, isHelpful } = body

    if (!sessionId) {
      throw createError({
        statusCode: 400,
        message: 'Session ID is required'
      })
    }

    // Create feedback data object
    const feedbackData: FeedbackData = {
      sessionId,
      query,
      response,
      isHelpful,
      timestamp: new Date().toISOString()
    }

    // Create DynamoDB put command
    const command = new PutCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME || "chatbot-feedback",
      Item: {
        id: `${sessionId}-${Date.now()}`, // Create unique ID
        sessionId: sessionId,
        query: query,
        response: response,
        isHelpful: isHelpful,
        timestamp: feedbackData.timestamp,
        createdAt: Math.floor(Date.now() / 1000) // Unix timestamp for TTL
      }
    });

    // Send to DynamoDB
    await docClient.send(command);

    // Log feedback data for debugging
    console.log('Feedback stored in DynamoDB:', feedbackData)

    return {
      status: 'success',
      message: 'Feedback recorded successfully'
    }

  } catch (error) {
    console.error('Error recording feedback:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error recording feedback'
    })
  }
}) 