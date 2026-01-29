import { dataRenderer, miniServer } from 'src/utils/builders'
import { isJson, logger, parseURL, promiseWrapper } from 'src/helpers'
import { pingWebhook, refreshIntegration, setWebhook } from 'src/Paystack'
import { useCommand, useConfig } from 'src/hooks'

import { Command } from '@h3ravel/musket'
import { ServerHandler, type Server } from 'srvx'
import ngrok from '@ngrok/ngrok'
import { read } from '../db'

export class WebhookCommand extends Command {
    protected signature = `webhook
    {command=listen : The command to run to listen for webhooks locally : [listen, ping]}
    {url? : Specify the url to listen on for webhooks (only for listen command, should be an accessible local url)}
    {--D|domain=test : Specify the domain to ping the webhook : [test, live]}
    {--F|forward? : Specify a URL to forward the webhook to instead of the saved webhook URL}
    {--E|event? : Specify the event type to simulate (leave empty to prompt with more options) : [charge.success,transfer.success,transfer.failed,subscription.create]}
    {--S|serve : Start a local server to receive webhooks (only for listen command, ignored if url is provided)}
    {--M|mod : Show options to modify the webhook payload before sending (only for ping command)}
`
    protected description = 'Listen for webhook events locally, runs a webhook endpoint health check and listens for incoming webhooks, and ping your webhook URL from the CLI.'

    async handle () {
        const [_, setCommand] = useCommand()
        const [getConfig] = useConfig()
        setCommand(this)
        this.newLine()

        const config = getConfig()
        let event = this.option('event')
        let server: Server<ServerHandler> | null = null
        let localUrl = this.argument('url')
        const selected_integration = read('selected_integration')?.id
        const user = read('user')?.id

        if (!selected_integration || !user)
            return void this.error(
                `ERROR: You're not signed in, please run the ${logger('login', ['grey', 'italic'])} command before you begin`
            )

        if (this.argument('command') == 'listen' && !localUrl) {
            if (this.option('serve'))
                server = await miniServer(3000)

            localUrl = server?.url ?? await this.ask(
                'Enter the url to listen on for webhooks: ',
                'http://localhost:8080/webhook'
            )
        } else if (this.argument('command') == 'ping' && !event) {
            event = await this.choice('Select event to simulate', [
                { name: 'Charge Success', value: 'charge.success' },
                { name: 'Transfer Success', value: 'transfer.success' },
                { name: 'Transfer Failed', value: 'transfer.failed' },
                { name: 'Subscription Create', value: 'subscription.create' },
                { name: 'Customer Identification Failed', value: 'customeridentification.failed' },
                { name: 'Customer Identification Success', value: 'customeridentification.success' },
                { name: 'DVA Assign Failed', value: 'dedicatedaccount.assign.failed' },
                { name: 'DVA Assign Success', value: 'dedicatedaccount.assign.success' }
            ], 0)
        }

        const domain = this.option('domain', 'test')
        const forward = this.option('forward') || null

        if (this.argument('command') == 'listen') {
            const token = read('token')
            const expiry = parseInt(read('token_expiry')) * 1000
            const now = parseFloat(Date.now().toString())

            if (expiry < now) {
                return void this.error('ERROR: Your session has expired. Please run the `login` command to sign in again.')
            }

            const url = parseURL(localUrl)

            if (!url.port)
                url.port = '8000'

            if (!url.search || url.search == '?')
                url.search = ''

            try {
                await ngrok.kill()
            } catch {
                this.debug('No existing ngrok process found to kill.')
            }

            const listener = await ngrok.forward({
                addr: url.port,
                authtoken: config.ngrokAuthToken || process.env.NGROK_AUTH_TOKEN,
                domain: process.env.NGROK_DOMAIN,
            })

            const webhookUrl = new URL(listener.url()! + url.pathname + url.search)

            const domain = this.option('domain', 'test')

            const spinner = this.spinner('Tunelling webhook events to ' + logger(localUrl)).start()

            const [err, result] = await promiseWrapper(
                setWebhook(
                    webhookUrl.toString(),
                    token,
                    read('selected_integration').id,
                ),
            )

            if (err || !result) return void this.error('ERROR: ' + (err ?? 'Failed to set webhook URL')).newLine()

            spinner.succeed()

            this.newLine()
                .success(`INFO: Listening for incoming webhook events at: ${logger(localUrl)}`)
                .success(`INFO: Webhook URL set to: ${logger(webhookUrl.toString())} for ${domain} domain`)
                .success(`INFO: Press ${logger('Ctrl+C', ['grey', 'italic'])} to stop listening for webhook events.`)
                .newLine()

            process.stdin.resume()
        } else if (this.argument('command') == 'ping') {
            await promiseWrapper(refreshIntegration())

            const [e, response] = await promiseWrapper(
                pingWebhook({ ...this.options(), domain, forward }, event),
            )

            if (e || !response) return void this.error('ERROR: ' + (e ?? 'Failed to ping webhook URL.')).newLine()

            this.newLine()
                .info(response.code + ' - ' + response.text)
                .newLine()

            if (isJson(response.data)) {
                dataRenderer(response.data)
            } else {
                dataRenderer({ body: response.data })
            }
        } else {
            this.error('ERROR: Invalid command. Please use either "listen" or "ping".').newLine()
        }
    }
} 