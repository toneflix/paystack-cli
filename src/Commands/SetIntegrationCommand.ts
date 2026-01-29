import * as db from 'src/db'

import { IIntegration, IUser } from 'src/Contracts/Interfaces'
import { getIntegration, selectIntegration } from 'src/Paystack'
import { logger, promiseWrapper } from 'src/helpers'

import { Command } from '@h3ravel/musket'
import { Logger } from '@h3ravel/shared'
import { useCommand } from 'src/hooks'

export class SetIntegrationCommand extends Command {
    protected signature = 'integration:set'

    protected description = 'Set the active integration for Paystack CLI usage.'

    async handle () {
        const [_, setCommand] = useCommand()
        setCommand(this)
        const user = db.read<IUser>('user')
        const token = db.read<string>('token')

        if (!token || !user)
            return void this.error(
                `ERROR: You're not signed in, please run the ${logger('login', ['grey', 'italic'])} command before you begin`
            )

        const [err, integration] = await promiseWrapper(
            selectIntegration(user.integrations, token),
        )

        if (err || !integration) {
            this.error('ERROR: ' + (err ?? 'Integration selection failed')).newLine()
        } else {
            db.write('selected_integration', integration)
            const user_role = db.read<IIntegration>('selected_integration').logged_in_user_role
            const [err, integrationData] = await promiseWrapper(
                getIntegration(integration.id, token),
            )

            if (err || !integrationData)
                return void this.error('ERROR: ' + (err ?? 'Failed to fetch integration data')).newLine()

            integrationData.logged_in_user_role = user_role
            db.write('selected_integration', integrationData)

            Logger.log([
                ['Switched to', 'white'],
                [integration.business_name, 'green'],
                ['(' + integration.id + ')', 'white'],
            ], ' ')

            this.newLine()
        }
    }
} 