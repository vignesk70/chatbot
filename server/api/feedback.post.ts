import { createError } from 'h3'
import { getDB } from '../utils/db'

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

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { sessionId, query, response, isHelpful } = body

    // Extract user details from request headers
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

    const db = await getDB()

    // Update the chat log with feedback
    await db.run(`
      UPDATE chat_logs 
      SET is_helpful = ?, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE session_id = ? 
      AND query = ? 
      AND response = ?
    `, [isHelpful ? 1 : 0, sessionId, query, response])

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