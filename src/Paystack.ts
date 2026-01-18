import * as db from './db'

import { IIntegration, ILogin, IResponse } from './Contracts/Interfaces.js'
import { XEvent, XGeneric } from './Contracts/Generic.js'

import { AxiosError } from 'axios'
import api from './axios.js'
import crypto from 'crypto'
import ora from 'ora'
import { promiseWrapper } from './helpers'
import { useCommand } from './hooks.js'
import webhookSamples from './paystack/webhooks'

/**
 * Select an integration
 * 
 * @param integrations 
 * @param token 
 * @returns 
 */
export async function selectIntegration (integrations: IIntegration[], token: string) {
    const [command] = useCommand()

    const id = await command().choice('Choose an integration', integrations.map(e => {
        return {
            value: e.id?.toString() || '',
            name: e.business_name || '',
        }
    }))

    return new Promise<IIntegration>((resolve, reject) => {

        const integration = integrations.find(i => i.id?.toString() === id)

        if (!integration) {
            reject('Invalid integration selected')

            return
        }

        api
            .post(
                '/user/switch_integration',
                { integration: integration.id },
                { headers: { Authorization: 'Bearer ' + token, 'jwt-auth': true } },
            )
            .then(() => {
                resolve(integration)
            })
            .catch((err) => {
                command().error('ERROR: ' + err.response.data)
                reject(err)
            })
    })
}

/**
 * Refresh integration data
 * 
 * @returns 
 */
export async function refreshIntegration () {
    const [command] = useCommand()

    let token = ''
    const user_role = db.read('selected_integration').logged_in_user_role
    const integration = db.read('selected_integration')
    const expiry = parseInt(db.read('token_expiry')) * 1000
    const now = parseFloat(Date.now().toString())

    if (expiry > now) {
        token = db.read('token')

        return true
    } else {
        const password = await command().secret(
            'What\'s your password: (' + db.read('user').email + ') ' + '\n>',
        )

        const [err, result] = await promiseWrapper(
            signIn(db.read('user').email, password),
        )
        if (err || !result) {
            return false
        }
        token = result.data.token
    }

    const [err, integrationData] = await promiseWrapper(
        getIntegration(integration.id, token),
    )

    if (err) {
        command().error('ERROR: ' + err)

        return false
    }
    if (integrationData) {
        integrationData.logged_in_user_role = user_role
    }
    db.write('selected_integration', integrationData)
}

/**
 * Set webhook URL for an integration
 * 
 * @param url 
 * @param token 
 * @param integrationId 
 * @param domain 
 * @returns 
 */
export function setWebhook (url: string, token: string, integrationId: string, domain = 'test') {
    return new Promise<string>((resolve, reject) => {
        const data: XGeneric = {
            [domain + '_webhook_endpoint']: url,
            integration: integrationId,
        }

        api
            .put('/integration/webhooks', data, {
                headers: {
                    Authorization: 'Bearer ' + token,
                    'jwt-auth': true,
                }
            })
            .then((resp) => {
                const integration = db.read('selected_integration')
                db.write('selected_integration', { ...integration, [domain + '_webhook_endpoint']: url })
                resolve(resp.data.message)
            })
            .catch((err) => {
                reject(err)
            })
    })
}

/**
 * Get integration keys
 * 
 * @param token 
 * @param type 
 * @param domain 
 * @returns 
 */
export function getKeys (token: string, type = 'secret', domain = 'test') {
    return new Promise<string>((resolve, reject) => {
        api
            .get('/integration/keys', {
                headers: { Authorization: 'Bearer ' + token, 'jwt-auth': true },
            })
            .then((response) => {
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
            })
            .catch((error) => {
                if (error.response) {
                    reject(error.response.data.message)

                    return
                }
                reject(error)
            })
    })
}

/**
 * Ping webhook URL
 * 
 * @param options 
 * @param event 
 * @returns 
 */
export async function pingWebhook (options: XGeneric, event: XEvent = 'charge.success') {
    const [command] = useCommand()

    let canProceed: boolean | undefined = false
    try {
        canProceed = await refreshIntegration()
    } catch (e) {
        console.error(e)
    }

    let domain = 'test'

    if (options.domain) {
        domain = options.domain
    }

    if (options.event) {
        event = options.event
    }
    const token = db.read('token')
    const key = await getKeys(token, 'secret', domain)

    return new Promise<{ code: number, text: string, data: XGeneric | string }>((resolve, reject) => {

        if (!canProceed) return void command().error('ERROR: Unable to ping webhook URL')

        const eventObject = webhookSamples[event]
        if (eventObject) {
            const hash = crypto.createHmac('sha512', key).update(JSON.stringify(eventObject)).digest('hex')
            const uri = db.read('selected_integration')[domain + '_webhook_endpoint']

            const spinner = ora(`Sending sample ${event} event payload to ${uri}`).start()
            api
                .post(uri, eventObject, {
                    headers: {
                        'x-paystack-signature': hash,
                    },
                })
                .then((response) => {
                    spinner.succeed(`Sample ${event} event payload sent to ${uri}`)
                    resolve({
                        code: response.status,
                        text: response.statusText,
                        data: response.data,
                    })
                })
                .catch((e: AxiosError) => {
                    spinner.fail(`Failed to send sample ${event} event payload to ${uri}`)
                    resolve({
                        code: e.response?.status ?? 0,
                        text: e.response?.statusText || 'No response',
                        data: typeof e.response?.data === 'string' && e.response?.data?.includes('<html')
                            ? { response: 'HTML Response' }
                            : e.response?.data || 'No response data',
                    })
                })
        } else {
            command().error('ERROR: Invalid event type - ' + event)
            reject()
        }
    })
}

/**
 * Get integration
 * 
 * @param id 
 * @param token 
 * @returns 
 */
export function getIntegration (id: number, token: string) {
    const [command] = useCommand()
    const spinner = ora('getting integration').start()

    return new Promise<IIntegration>((resolve, reject) => {
        api
            .get<IResponse<IIntegration>>('/integration/' + id, {
                headers: {
                    Authorization: 'Bearer ' + token,
                    'jwt-auth': true,
                },
            })
            .then((response) => {
                resolve(response.data.data)
            })
            .catch((e) => {
                command().error(`ERROR: ${e}`)
                reject(e.response.data.message)
            }).finally(() => {
                spinner.stop()
            })
    })
}

/**
 * Sign in user
 * 
 * @param email 
 * @param password 
 * @returns 
 */
export async function signIn (email: string, password: string) {
    const [command] = useCommand()
    const spinner = ora('Logging in...').start()

    try {
        const { data: response } = await api.post<IResponse<ILogin>>('/login', {
            email,
            password
        })

        if (response && response.data && !response.data.mfa_required) {
            spinner.succeed('Login successful')

            return response
        } else if (response && response.data && response.data.mfa_required) {
            spinner.stop()

            const totp: string = await command().secret('Enter OTP or MFA code:', '*')

            spinner.start('Verifying MFA...')

            const [e, payload] = await promiseWrapper(
                verifyMfa(totp, response.data.token),
            )

            if (payload && !e) {
                spinner.succeed('Login successful')

                return payload as IResponse<ILogin>
            } else {
                spinner.fail(e ?? 'MFA verification failed')
            }
        } else {
            spinner.fail('Login failed')
        }
    } catch (e: any) {
        spinner.fail(
            e.response?.data?.message?.text ||
            e.response?.data?.message ||
            'Unable to sign in, please try again in a few minutes',
        )
    }
}

/**
 * Verify MFA
 * 
 * @param totp 
 * @param token 
 * @returns 
 */
export function verifyMfa (totp: string, token: string) {
    return new Promise<IResponse<XGeneric>>((resolve, reject) => {
        api.post<IResponse<XGeneric>>('/verify-mfa', { totp }, {
            headers: {
                Authorization: `Bearer ${token}`,
                'jwt-auth': true,
            }
        }).then((response) => {
            resolve(response.data)
        }).catch(({ response }) => {
            const message = response.data.message || 'Unable to verify MFA, please try again in a few minutes'
            reject(message)
        })
    })
}

/**
 * Store login details
 * 
 * @param payload 
 */
export function storeLoginDetails (payload: IResponse<ILogin>) {
    db.write('token', payload.data.token)
    db.write('token_expiry', payload.data.expiry)
    db.write('user', payload.data.user)
}

/**
 * Clear authentication details
 */
export function clearAuth () {
    db.remove('token')
    db.remove('token_expiry')
    db.remove('user')
}