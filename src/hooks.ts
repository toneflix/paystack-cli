import { read, write } from './db'

import { Command } from '@h3ravel/musket'
import { IConfig } from './Contracts/Interfaces'

let commandInstance: Command | undefined

/**
 * Hook to get or set the current Command instance.
 */
export function useCommand (): [() => Command, (newCommand: Command) => void] {
    return [
        () => {
            if (!commandInstance) {
                throw new Error('Commander instance has not been initialized')
            }
            
return commandInstance
        },
        (newCommand: Command) => {
            commandInstance = newCommand
        },
    ] as const
}

/**
 * Hook to get or set the application configuration.
 * 
 * @returns 
 */
export function useConfig () {
    return [
        (): IConfig => {
            return read('config') || {
                debug: false,
                apiBaseURL: 'https://api.paystack.co',
                timeoutDuration: 3000
            }
        },
        (config: IConfig): IConfig => {
            write('config', config)
            
return read('config')
        },
    ] as const
}


const shortcutUsed = new Set<string>()

/**
 * Hook to make command shortcuts unique across the application.
 * 
 * @returns 
 */
export function useShortcuts () {
    return [
        () => Array.from(shortcutUsed).filter(s => !!s),
        (shortcut?: string): boolean => {
            if (!shortcut) {
                shortcutUsed.clear()
                
return false
            }
            if (shortcutUsed.has(shortcut)) {
                return false
            }
            shortcutUsed.add(shortcut)
            
return true
        },
    ] as const
}