import { findCLIPackageJson, wait } from 'src/helpers'
import { init, useDbPath } from 'src/db'

import { Command } from '@h3ravel/musket'
import { createRequire } from 'module'
import { dataRenderer } from 'src/utils/renderer'
import ora from 'ora'
import os from 'os'
import { useCommand } from 'src/hooks'

export class InfoCommand extends Command {
    protected signature = 'info'
    protected description = 'Display application runtime information.'
    async handle () {
        let pkg = { version: 'unknown', dependencies: {} }
        const pkgPath = findCLIPackageJson()
        const require = createRequire(import.meta.url)
        const [_, setCommand] = useCommand()
        const [dbPath] = useDbPath()
        setCommand(this)
        init()

        const spinner = ora('Gathering application information...\n').start()

        if (pkgPath) {
            try {
                pkg = require(pkgPath)
            } catch { /** */ }
        }

        wait(500, () => {
            spinner.stop()

            const info = {
                appVersion: pkg.version,
                platform: os.platform(),
                arch: os.arch(),
                cpus: os.cpus().length,
                hostname: os.hostname(),
                totalMemory: os.totalmem(),
                freeMemory: os.freemem(),
                uptime: os.uptime(),
                username: os.userInfo().username,
                database: dbPath + '/app.db',
                dependencies: Object.keys(pkg.dependencies).join(', '),
            }

            dataRenderer(info)

            this.newLine()
        })

    }
}