import { H3, H3Event, serve } from 'h3'

import { Logger } from '@h3ravel/shared'
import { XGeneric } from '../Contracts/Generic'
import { detect } from 'detect-port'

/**
 * We will recursively map through the result data and log each key value pair
 * as we apply coloring based on the value type.
 * We also need to handle root or nested objects and arrays while considering
 * indentation for better readability.
 * 
 * @param data 
 */
export const dataRenderer = (data: XGeneric) => {
    const render = (obj: XGeneric, indent = 0) => {
        const indentation = ' '.repeat(indent)
        for (const key in obj) {
            const value = obj[key]
            if (typeof value === 'object' && value !== null) {
                console.log(`${indentation}${key.toCleanCase()}:`)
                render(value, indent + 2)
            } else {
                let coloredValue
                switch (typeof value) {
                    case 'string':
                        coloredValue = Logger.log(value, 'green', false)
                        break
                    case 'number':
                        coloredValue = Logger.log(String(value), 'yellow', false)
                        break
                    case 'boolean':
                        coloredValue = Logger.log(String(value), 'blue', false)
                        break
                    default:
                        coloredValue = value
                }
                console.log(`${indentation}${key.toCleanCase()}: ${coloredValue}`)
            }
        }
    }

    render(data)
}

/**
 * Starts a mini HTTP server on the specified port to listen for incoming webhook requests.
 * 
 * @param port 
 * @returns 
 */
export const miniServer = async (port: number = 3000) => {
    const route = async (event: H3Event) => {
        console.log('Incoming Webhook Request [', event.req.method, ']')
        const payload = JSON.parse(await event.req.text() || '{}')

        return Object.assign(
            {},
            { signature: event.req.headers.get('x-paystack-signature') ?? 'N/A' },
            payload
        )
    }

    const app = new H3()
        .get('/webhook', route)
        .post('/webhook', route)

    port = await detect(port)

    const server = serve(app, { port, silent: true })

    const url = `http://localhost:${port}/webhook`

    Logger.log([['🚀 Mini server is running at:', 'green'], [url, 'cyan']], ' ')

    return Object.assign({}, server, { url })
}