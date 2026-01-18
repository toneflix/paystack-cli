import * as db from './db'

import { Logger, LoggerChalk } from '@h3ravel/shared'
import { XGeneric, XSchema } from './Contracts/Generic.js'

import { IResponse } from './Contracts/Interfaces'
import api from './axios'
import { useConfig } from './hooks'

export const promiseWrapper = <T> (promise: Promise<T>): Promise<[string | null, T | null]> =>
    promise
        .then((data) => [null, data] as [null, T])
        .catch((error) => [typeof error === 'string' ? error : error.message, null] as [string, null])

export function isJson (val: any): val is XGeneric {
    return val instanceof Array || val instanceof Object ? true : false
}

export function parseURL (uri: string) {
    if (!uri.startsWith('http')) uri = 'http://' + uri
    
return new URL(uri)
}

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
            if (error.response) {
                reject(error.response.data.message)
                
return
            }
            reject(error)
        })
    })
}

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

export const wait = (ms: number, callback?: () => any) => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            if (callback) resolve(callback())
            resolve()
        }, ms)
    })
}

export const logger = (str: string, config: LoggerChalk = ['green', 'italic']) => {
    return Logger.log(str, config, false)
}