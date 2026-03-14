import { getDb } from '../utils/db'

export default defineEventHandler(() => {
  const db = getDb()
  const rows = db.prepare('SELECT id, ip FROM cameras').all()
  return rows
})

