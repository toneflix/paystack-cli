import { isJson, logger, parseURL, promiseWrapper } from 'src/helpers'
import { pingWebhook, refreshIntegration, setWebhook } from 'src/Paystack'
import { useCommand, useConfig } from 'src/hooks'

import { Command } from '@h3ravel/musket'
import { dataRenderer } from 'src/utils/renderer'
import ngrok from '@ngrok/ngrok'
import ora from 'ora'
import { read } from '../db'

export class WebhookCommand extends Command {
    protected signature = `webhook
    {command=listen : The command to run to listen for webhooks locally : [listen, ping]}
    {local_route? : Specify the local route to listen on for webhooks (only for listen command)}
    {--D|domain=test : Specify the domain to ping the webhook : [test, live]}
    {--F|forward? : Specify a URL to forward the webhook to instead of the saved webhook URL}
    {--E|event? : Specify the event type to simulate : [charge.success,transfer.success,transfer.failed,subscription.create]}
`
    protected description = 'Listen for webhook events locally, runs a webhook endpoint health check and listens for incoming webhooks, and ping your webhook URL from the CLI.'

    async handle () {
        const [_, setCommand] = useCommand()
        const [getConfig] = useConfig()
        setCommand(this)
        this.newLine()

        const config = getConfig()
        let event = this.option('event')
        let local_route = this.argument('local_route')
        const selected_integration = read('selected_integration')?.id
        const user = read('user')?.id

        if (!selected_integration || !user)
            return void this.error(
                `ERROR: You're not signed in, please run the ${logger('login', ['grey', 'italic'])} command before you begin`
            )

        if (this.argument('command') == 'listen' && !local_route) {
            local_route = await this.ask(
                'Enter the local route to listen on for webhooks: ',
                'http://localhost:8080/webhook'
            )
        } else if (this.argument('command') == 'ping' && !event) {
            event = await this.choice('Select event to simulate', [
                { name: 'Charge Success', value: 'charge.success' },
                { name: 'Transfer Success', value: 'transfer.success' },
                { name: 'Transfer Failed', value: 'transfer.failed' },
                { name: 'Subscription Create', value: 'subscription.create' },
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

            const url = parseURL(local_route)

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

            const ngrokURL = listener.url()!
            const domain = this.option('domain', 'test')

            const spinner = ora('Tunelling webhook events to ' + logger(local_route)).start()

            const [err, result] = await promiseWrapper(
                setWebhook(
                    ngrokURL,
                    token,
                    read('selected_integration').id,
                ),
            )

            if (err || !result) return void this.error('ERROR: ' + (err ?? 'Failed to set webhook URL')).newLine()

            spinner.succeed('Listening for incoming webhook events at ' + logger(local_route))

            this.newLine()
                .success(`INFO: Press ${logger('Ctrl+C', ['grey', 'italic'])} to stop listening for webhook events.`)
                .success(`INFO: Webhook URL set to ${logger(ngrokURL)} for ${domain} domain`)
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