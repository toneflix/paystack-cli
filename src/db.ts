import path, { dirname } from 'path'

import Database from 'better-sqlite3'
import { XGeneric } from './Contracts/Generic'
import { fileURLToPath } from 'url'
import { mkdirSync } from 'fs'

let db: Database.Database
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const dirPath = path.normalize(path.join(__dirname, '..', 'data'))
mkdirSync(dirPath, { recursive: true })

/**
 * Hook to get or set the database instance.
 * 
 * @returns 
 */
export const useDb = () => {
    return [
        () => db,
        (newDb: Database.Database) => {
            db = newDb

            // Check current journal mode
            const [{ journal_mode }] = db.pragma('journal_mode') as [{ journal_mode: string }]
            if (journal_mode !== 'wal') {
                db.pragma('journal_mode = WAL')
            }
        },
    ] as const
}

const [getDatabase, setDatabase] = useDb()

setDatabase(new Database(path.join(dirPath, 'app.db')))

/**
 * Initialize the database
 * 
 * @param table 
 * @returns 
 */
export function init () {
    const db = getDatabase()

    return db.exec(`
        CREATE TABLE IF NOT EXISTS json_store (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE,
            value TEXT
        )
    `)
}

/**
 * Save a value to the database
 * 
 * @param key 
 * @param value 
 * @returns 
 */
export function write (key: string, value: any,) {
    const db = getDatabase()

    if (typeof value === 'boolean')
        value = value ? '1' : '0'
    if (value instanceof Object)
        value = JSON.stringify(value)

    const insert = db.prepare(`INSERT INTO json_store (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value=excluded.value
    `)

    return insert.run(
        key,
        value
    ).lastInsertRowid
}

/**
 * Remove a value from the database
 * 
 * @param key 
 * @param table 
 * @returns 
 */
export function remove (key: string,) {
    const db = getDatabase()

    const insert = db.prepare('DELETE FROM json_store WHERE key = ?')

    return insert.run(
        key,
    ).lastInsertRowid
}

/** 
 * Clear all values from the database
 */
export function clear () {
    const db = getDatabase()

    const insert = db.prepare('DELETE FROM json_store')

    return insert.run().changes
}

/**
 * Get all keys in the database
 * 
 * @returns 
 */
export function keys () {
    const db = getDatabase()

    const rows = db
        .prepare('SELECT key FROM json_store')
        .all() as { key: string }[]

    return rows.map(row => row.key)
}

/**
 * Get all data in the database
 * 
 * @returns 
 */
export function getData () {
    const db = getDatabase()

    const rows = db
        .prepare('SELECT * FROM json_store')
        .all() as { key: string, value: string }[]

    const data: XGeneric = {}
    rows.forEach(row => {
        try {
            data[row.key] = JSON.parse(row.value)
        } catch {
            data[row.key] = row.value
        }
    })

    return data
}

/**
 * Read a value from the database
 * 
 * @param key 
 * @returns 
 */
export function read (key: string,): any {
    const db = getDatabase()

    try {
        const row = db
            .prepare('SELECT * FROM json_store WHERE key = ?')
            .get(key) as XGeneric | undefined

        if (row) {
            try {
                return JSON.parse(row.value) as XGeneric
            } catch {
                return row.value
            }
        }

    } catch { /** */ }

    return null
} 