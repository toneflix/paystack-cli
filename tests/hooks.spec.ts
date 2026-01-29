import { Command, Kernel } from '@h3ravel/musket'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, mkdirSync, rmSync, unlinkSync } from 'fs'
import { init, useDb, useDbPath } from 'src/db'
import { useCommand, useConfig, useShortcuts } from '../src/hooks'

import path from 'path'

class App {
    registeredCommands: typeof Command[] = []
}

let app, program: any

beforeAll(async () => {
    const [__, setDbPath] = useDbPath()
    const [_, setDatabase] = useDb()

    mkdirSync('./tests/temp-db', { recursive: true })
    setDbPath('./tests/temp-db')
    setDatabase('testdb.db')
    init()

    app = new App()
    program = await Kernel.init(
        app,
        {
            packages: ['ghit'],
            skipParsing: true,
            name: 'musket-cli',
            discoveryPaths: [path.join(process.cwd(), 'src/Commands/*.ts')]
        }
    )
})

afterAll(() => {
    if (existsSync(path.join('tests/temp-db', 'testdb.db'))) {
        unlinkSync(path.join('tests/temp-db', 'testdb.db'))
        unlinkSync(path.join('tests/temp-db', 'testdb.db-shm'))
        unlinkSync(path.join('tests/temp-db', 'testdb.db-wal'))
        rmSync('./tests/temp-db', { recursive: true, force: true })
    }
})

describe('Hooks Test', () => {
    beforeEach(() => {
        // Reset command instance before each test
        const [_, setCommand] = useCommand()
        setCommand(undefined as unknown as Command)

        // Reset config before each test
        const [__, setConfig] = useConfig()
        setConfig(undefined as unknown as any)

        // Reset shortcuts before each test
        const [___, clearShortcuts] = useShortcuts()
        clearShortcuts()
    })

    it('useCommand Hook', () => {
        const [getCommand, setCommand] = useCommand()

        const cmdInstance = new Command(new App(), program)
        setCommand(cmdInstance)

        expect(getCommand()).toBe(cmdInstance)
    })

    it('useConfig Hook', () => {
        const [getConfig, setConfig] = useConfig()

        const config = {
            debug: true,
            apiBaseURL: 'https://custom.api',
            timeoutDuration: 5000
        }
        setConfig(config)

        expect(getConfig()).toEqual(config)
    })

    it('useShortcuts Hook', () => {
        const [getShortcuts, addShortcut] = useShortcuts()

        expect(getShortcuts()).toEqual([])

        const added1 = addShortcut('ls')
        expect(added1).toBe(true)
        expect(getShortcuts()).toEqual(['ls'])

        const added2 = addShortcut('ls')
        expect(added2).toBe(false)
        expect(getShortcuts()).toEqual(['ls'])

        const added3 = addShortcut('rm')
        expect(added3).toBe(true)
        expect(getShortcuts()).toEqual(['ls', 'rm'])
    })
})