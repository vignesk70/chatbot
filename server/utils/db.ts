import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'

// Initialize database
export const initDB = async () => {
  const db = await open({
    filename: path.join(process.cwd(), 'data', 'chat.db'),
    driver: sqlite3.Database
  })

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chat_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      query TEXT NOT NULL,
      response TEXT NOT NULL,
      is_helpful INTEGER,
      ip_address TEXT,
      user_agent TEXT,
      language TEXT,
      timezone TEXT,
      referer TEXT,
      platform TEXT,
      screen_resolution TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  return db
}

// Get database instance
export const getDB = async () => {
  return await initDB()
} 