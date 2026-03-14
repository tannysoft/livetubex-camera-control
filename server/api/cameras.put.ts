import { getDb } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const db = getDb()
  const deleteStmt = db.prepare('DELETE FROM cameras')
  const insertStmt = db.prepare('INSERT INTO cameras (id, ip) VALUES (@id, @ip)')
  const insertMany = db.transaction((rows: { id: string, ip: string }[]) => {
    deleteStmt.run()
    rows.forEach(row => insertStmt.run(row))
  })

  insertMany(
    body
      .filter((row) => row && typeof row.id === 'string' && typeof row.ip === 'string')
      .map((row) => ({ id: row.id, ip: row.ip }))
  )

  return { success: true }
})

