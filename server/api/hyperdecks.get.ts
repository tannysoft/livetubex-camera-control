import { getDb } from '../utils/db'

export default defineEventHandler(() => {
  const db = getDb()
  const rows = db.prepare('SELECT id, ip, sort_order FROM hyperdecks ORDER BY sort_order ASC, id ASC').all()
  return rows
})
