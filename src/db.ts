import Database from 'better-sqlite3'
import { XGeneric } from './Contracts/Generic';

const db = new Database('app.db')
db.pragma('journal_mode = WAL')

export function init (table = 'json_store') {
    return db.exec(`
        CREATE TABLE IF NOT EXISTS ${table} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE,
            value TEXT
        )
    `);
}

/**
 * Save a value to the database
 * 
 * @param key 
 * @param value 
 * @returns 
 */
export function write (key: string, value: any, table = 'json_store') {
    if (typeof value === 'boolean')
        value = value ? '1' : '0';
    if (value instanceof Object)
        value = JSON.stringify(value);

    const insert = db.prepare(`INSERT INTO ${table} (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value=excluded.value
    `)

    return insert.run(
        key,
        value
    ).lastInsertRowid
}

export function remove (key: string, table = 'json_store') {
    const insert = db.prepare(`DELETE FROM ${table} WHERE key = ?`)
    return insert.run(
        key,
    ).lastInsertRowid
}

/** 
 * Clear all values from the database
 */
export function clear (table = 'json_store') {
    const insert = db.prepare(`DELETE FROM ${table}`)
    return insert.run().changes
}

/**
 * Get all keys in the database
 * 
 * @returns 
 */
export function keys (table = 'json_store') {
    const rows = db
        .prepare(`SELECT key FROM ${table}`)
        .all() as { key: string }[];

    return rows.map(row => row.key);
}

/**
 * Get all data in the database
 * 
 * @returns 
 */
export function getData (table = 'json_store') {
    const rows = db
        .prepare(`SELECT * FROM ${table}`)
        .all() as { key: string, value: string }[];

    const data: XGeneric = {};
    rows.forEach(row => {
        try {
            data[row.key] = JSON.parse(row.value);
        } catch (e) {
            data[row.key] = row.value;
        }
    });
    return data;
}

/**
 * Read a value from the database
 * 
 * @param key 
 * @returns 
 */
export function read (key: string, table = 'json_store'): any {
    const row = db
        .prepare(`SELECT * FROM ${table} WHERE key = ?`)
        .get(key) as XGeneric | undefined;

    if (row) {
        try {
            return JSON.parse(row.value) as XGeneric;
        } catch (e) {
            return row.value;
        }
    }
    return null;
} 