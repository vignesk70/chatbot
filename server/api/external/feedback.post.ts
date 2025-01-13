import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { sessionId, query, response, isHelpful, apiKey } = body

    // Validate API key
    if (apiKey !== process.env.EXTERNAL_API_KEY) {
      throw createError({
        statusCode: 401,
        message: 'Invalid API key'
      })
    }

    // Log feedback
    console.log('External Feedback received:', {
      timestamp: new Date().toISOString(),
      sessionId,
      query,
      response,
      isHelpful
    })

    return {
      success: true,
      message: 'Feedback recorded successfully'
    }

  } catch (error) {
    console.error('Error recording external feedback:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Error recording feedback'
    })
  }
}) 