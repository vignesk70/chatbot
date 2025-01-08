import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { sessionId, query, response, isHelpful } = body

    // Log feedback data for debugging
    console.log('Feedback received:', {
      timestamp: new Date().toISOString(),
      sessionId,
      query,
      response,
      isHelpful
    })

    return {
      status: 'success',
      message: 'Feedback recorded successfully'
    }

  } catch (error) {
    console.error('Error recording feedback:', error)
    throw createError({
      statusCode: 500,
      message: 'Error recording feedback'
    })
  }
})