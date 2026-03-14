import Database from 'better-sqlite3'
import { join, dirname } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'

let db: Database.Database | null = null

export const getDb = () => {
  if (!db) {
    const dbPath = join(process.cwd(), 'data', 'cameras.db')
    const dir = dirname(dbPath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')

    db.prepare(`
      CREATE TABLE IF NOT EXISTS cameras (
        id TEXT PRIMARY KEY,
        ip TEXT NOT NULL
      )
    `).run()

    const row = db.prepare('SELECT COUNT(*) as count FROM cameras').get() as { count: number }
    if (!row || row.count === 0) {
      const insertStmt = db.prepare('INSERT INTO cameras (id, ip) VALUES (@id, @ip)')
      const seed = [
        { id: 'cam1', ip: '192.168.110.201' },
        { id: 'cam2', ip: '192.168.110.202' },
        { id: 'cam3', ip: '192.168.110.203' },
        { id: 'cam4', ip: '192.168.110.204' },
        { id: 'cam5', ip: '192.168.110.205' },
        { id: 'cam6', ip: '192.168.110.206' },
        { id: 'cam7', ip: '192.168.110.207' },
        { id: 'cam10', ip: '192.168.110.210' },
        { id: 'cam11', ip: '192.168.110.211' },
        { id: 'cam12', ip: '192.168.110.212' },
        { id: 'cam13', ip: '192.168.110.213' },
        { id: 'cam15', ip: '192.168.110.215' },
        { id: 'cam16', ip: '192.168.110.216' },
        { id: 'cam19', ip: '192.168.110.219' },
        { id: 'cam21', ip: '192.168.110.221' },
        { id: 'cam22', ip: '192.168.110.222' }
      ]

      const insertMany = db.transaction((rows: { id: string; ip: string }[]) => {
        rows.forEach(row => insertStmt.run(row))
      })

      insertMany(seed)
    }
  }

  return db
}

