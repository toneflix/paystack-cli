import { describe, expect, it } from 'vitest'
import { isJson, parseURL, promiseWrapper, wait } from '../src/helpers'

describe('Helpers Test', () => {
    it('parseURL should correctly parse URLs', () => {
        const url1 = parseURL('http://localhost:3000/webhook')
        expect(url1.hostname).toBe('localhost')
        expect(url1.port).toBe('3000')
        expect(url1.pathname).toBe('/webhook')

        const url2 = parseURL('https://example.com')
        expect(url2.hostname).toBe('example.com')
        expect(url2.port).toBe('')
        expect(url2.pathname).toBe('/')

        const url4 = parseURL('no-protocol.com/path')
        expect(url4.hostname).toBe('no-protocol.com')
        expect(url4.port).toBe('')
        expect(url4.pathname).toBe('/path')
    })

    it('wait should delay execution for specified milliseconds', async () => {
        const start = Date.now()
        await wait(100)
        const end = Date.now()
        expect(end - start).toBeGreaterThanOrEqual(100)
    })

    it('isJson should correctly identify JSON objects', () => {
        expect(isJson({})).toBe(true)
        expect(isJson({ key: 'value' })).toBe(true)
        expect(isJson([])).toBe(true)
        expect(isJson([1, 2, 3])).toBe(true)
        expect(isJson('string')).toBe(false)
        expect(isJson(123)).toBe(false)
        expect(isJson(null)).toBe(false)
        expect(isJson(undefined)).toBe(false)
    })

    it('promiseWrapper should handle resolved and rejected promises', async () => {
        const resolvedPromise = Promise.resolve('success')
        const [err1, result1] = await promiseWrapper(resolvedPromise)
        expect(err1).toBeNull()
        expect(result1).toBe('success')

        const rejectedPromise = Promise.reject(new Error('failure'))
        const [err2, result2] = await promiseWrapper(rejectedPromise)
        expect(err2).toBe('failure')
        expect(result2).toBeNull()
    })
})