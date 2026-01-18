import { Command } from '@h3ravel/musket'
import { init } from 'src/db'
import { useCommand } from 'src/hooks'

export class InitCommand extends Command {
    protected signature = 'init'
    protected description = 'Initialize the application.'
    async handle () {
        const [_, setCommand] = useCommand()
        setCommand(this)
        init()
        this.info('Application initialized successfully.').newLine()
    }
}