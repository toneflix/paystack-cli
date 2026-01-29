import * as db from 'src/db'

import { logger, objectToTable } from 'src/helpers'

import { Command } from '@h3ravel/musket'
import { IIntegration } from 'src/Contracts/Interfaces'
import { useCommand } from 'src/hooks'

export class IntegrationInfoCommand extends Command {
    protected signature = 'integration:info'

    protected description = 'Get information about the currently selected integration.'

    async handle () {
        const [_, setCommand] = useCommand()
        setCommand(this)
        const selected_integration = db.read<IIntegration>('selected_integration')

        if (!selected_integration)
            return void this.error(
                `ERROR: No integration selected, please run the ${logger('integration:set', ['grey', 'italic'])} command to select an integration before proceeding.`,
            )

        console.log(objectToTable(selected_integration, true))
        this.newLine()
    }
} 