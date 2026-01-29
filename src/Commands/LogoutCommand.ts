import { Command } from '@h3ravel/musket'
import { clearAuth } from '../Paystack'
import { useCommand } from '../hooks'
import { wait } from '../helpers'

export class LogoutCommand extends Command {
    protected signature = 'logout'
    protected description = 'Log out of paystack cli'

    async handle () {
        const [_, setCommand] = useCommand()
        setCommand(this)
        this.newLine()

        const spinner = this.spinner('Logging out...').start()

        try {
            // Clear stored login details
            await wait(1000, () => clearAuth())
            spinner.succeed('Logged out successfully')
        } catch (error) {
            spinner.fail('Logout failed')
            console.error('An error occurred during logout:', error)
        }

        this.newLine()
    }
}