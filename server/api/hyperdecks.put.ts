import { getDb } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!Array.isArray(body)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const db = getDb()
  const deleteStmt = db.prepare('DELETE FROM hyperdecks')
  const insertStmt = db.prepare('INSERT INTO hyperdecks (id, ip, sort_order) VALUES (@id, @ip, @sort_order)')
  const insertMany = db.transaction((rows: { id: string; ip: string; sort_order: number }[]) => {
    deleteStmt.run()
    rows.forEach(row => insertStmt.run(row))
  })

  insertMany(
    body
      .filter((row) => row && typeof row.id === 'string' && typeof row.ip === 'string')
      .map((row, i) => ({ id: row.id, ip: row.ip, sort_order: typeof row.sort_order === 'number' ? row.sort_order : i + 1 }))
  )

  return { success: true }
})
