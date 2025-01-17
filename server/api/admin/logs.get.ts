import { getDB } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const db = await getDB()
    
    const logs = await db.all(`
      SELECT 
        id,
        session_id,
        query,
        response,
        is_helpful,
        ip_address,
        user_agent,
        language,
        timezone,
        referer,
        platform,
        screen_resolution,
        created_at,
        updated_at
      FROM chat_logs 
      ORDER BY created_at DESC
    `)

    return {
      success: true,
      data: logs
    }

  } catch (error) {
    console.error('Error fetching logs:', error)
    throw createError({
      statusCode: 500,
      message: 'Error fetching chat logs'
    })
  }
}) 