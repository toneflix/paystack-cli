import * as db from './db'

import { Logger, LoggerChalk } from '@h3ravel/shared'
import { XGeneric, XSchema } from './Contracts/Generic.js'

import CliTable3 from 'cli-table3'
import { IResponse } from './Contracts/Interfaces'
import api from './axios'
import { existsSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import { useConfig } from './hooks'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Wrap a promise to return a tuple of error and result
 * 
 * @param promise 
 * @returns 
 */
export const promiseWrapper = <T> (promise: Promise<T>): Promise<[string | null, T | null]> =>
    promise
        .then((data) => [null, data] as [null, T])
        .catch((error) => [typeof error === 'string' ? error : error.message, null] as [string, null])

/**
 * Check if a value is JSON
 * 
 * @param val 
 * @returns 
 */
export function isJson (val: any): val is XGeneric {
    return val instanceof Array || val instanceof Object ? true : false
}

/**
 * Parse a URL
 * 
 * @param uri 
 * @returns 
 */
export function parseURL (uri: string) {
    if (!uri.startsWith('http')) uri = 'http://' + uri

    return new URL(uri)
}

/**
 * Get integration keys
 * 
 * @param token 
 * @param type 
 * @param domain 
 * @returns 
 */
function getKeys (token: string, type = 'secret', domain = 'test') {
    return new Promise((resolve, reject) => {
        api.get('/integration/keys', {
            headers: { Authorization: 'Bearer ' + token, 'jwt-auth': true },
        }).then((response) => {
            let key: XGeneric = {}
            const keys = response.data.data
            if (keys.length) {
                for (let i = 0; i < keys.length; i++) {
                    if (keys[i].domain === domain && keys[i].type === type) {
                        key = keys[i]
                        break
                    }
                }
            }
            resolve(key.key)
        }).catch((error) => {
            if (error.response) return void reject(error.response.data.message)

            reject(error)
        })
    })
}

/**
 * Execute a schema
 * 
 * @param schema 
 * @param options 
 * @returns 
 */
export async function executeSchema (schema: XSchema, options: XGeneric) {
    let domain = 'test'
    if (options.domain) {
        domain = options.domain
    }
    const token = db.read('token')
    const key = await getKeys(token, 'secret', domain)
    const [getConfig] = useConfig()
    const config = getConfig()

    return new Promise<IResponse<XGeneric>>((resolve, reject) => {
        let params = {}, data = {}

        if (schema.method == 'GET') params = options
        if (schema.method == 'POST') data = options

        const pathVars = [...schema.endpoint.matchAll(/\{([^}]+)\}/g)].map(match => match[1])

        if (pathVars.length >= 0) {
            for (const path of pathVars) {
                schema.endpoint = schema.endpoint.replace('{' + path + '}', options[path])
            }
        }

        const url = new URL(schema.endpoint, config.apiBaseURL || 'https://api.paystack.co')
        params = { ...params, ...Object.fromEntries(url.searchParams.entries()) }

        api.request<IResponse<XGeneric>>({
            url: url.pathname,
            method: schema.method,
            params,
            data: data!,
            timeout: config.timeoutDuration || 0,
            headers: { Authorization: 'Bearer ' + key },
        }).then(({ data }) => {
            resolve(data)
        }).catch((err) => {
            reject(err.response?.data?.message ?? err.response?.message ?? err.message ?? err.statusText)
        })
    })
}

/**
 * Wait for a specified number of milliseconds
 * 
 * @param ms 
 * @param callback 
 * @returns 
 */
export const wait = (ms: number, callback?: () => any) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            if (callback) resolve(callback())
            resolve()
        }, ms)
    })
}

/**
 * Logger helper
 * 
 * @param str 
 * @param config 
 * @returns 
 */
export const logger = (str: string, config: LoggerChalk = ['green', 'italic']) => {
    return Logger.log(str, config, false)
}

/**
 * Find the nearest package.json file
 * 
 * @param startDir 
 * @returns 
 */
export const findCLIPackageJson = (startDir = __dirname) => {
    let dir = startDir

    while (true) {
        const pkgPath = path.join(dir, 'package.json')
        if (existsSync(pkgPath)) {
            return pkgPath
        }

        const parent = path.dirname(dir)
        if (parent === dir) break
        dir = parent
    }

    return null
}

export const objectToTable = (obj: XGeneric, titleKeys: boolean = false) => {
    const table = new CliTable3()

    for (const rawKey in obj) {
        if (typeof obj[rawKey] === 'object') continue
        const key = logger((titleKeys ? rawKey.toCleanCase() : rawKey).truncate(30), ['bold'])

        table.push({ [key]: String(obj[rawKey]).truncate(40) })
    }

    return table.toString()
}