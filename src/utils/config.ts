import { useCommand, useConfig } from '../hooks'

import { IConfig } from '../Contracts/Interfaces'

export const configChoices = (config: IConfig) => {
    return [
        {
            name: 'Debug Mode',
            value: 'debug',
            description: `Enable or disable debug mode (${config.debug ? 'Enabled' : 'Disabled'})`
        },
        {
            name: 'API Base URL',
            value: 'apiBaseURL',
            description: `Set the base URL for the API (${config.apiBaseURL})`
        },
        {
            name: 'Timeout Duration',
            value: 'timeoutDuration',
            description: `Set the timeout duration for API requests (${config.timeoutDuration} ms)`
        },
        {
            name: 'Ngrok Auth Token',
            value: 'ngrokAuthToken',
            description: `Set the Ngrok Auth Token - will default to environment variable if not set (${config.ngrokAuthToken ? '************' : 'Not Set'})`
        },
        {
            name: 'Reset Configuration',
            value: 'reset',
            description: 'Reset all configurations to default values'
        },
    ]
}

export const saveConfig = async (choice: keyof IConfig) => {
    const [getConfig, setConfig] = useConfig()
    const [command] = useCommand()
    let config = getConfig()

    if (choice === 'debug') {
        const debug = await command().confirm(
            `${config.debug ? 'Dis' : 'En'}able debug mode?`, config.debug === true
        )
        config.debug = config.debug !== debug
    } else if (choice === 'apiBaseURL') {
        const apiBaseURL = await command().ask('Enter API Base URL', config.apiBaseURL)
        config.apiBaseURL = apiBaseURL
    } else if (choice === 'ngrokAuthToken') {
        const ngrokAuthToken = await command().ask('Enter Ngrok Auth Token', config.ngrokAuthToken || '')
        config.ngrokAuthToken = ngrokAuthToken
    } else if (choice === 'timeoutDuration') {
        const timeoutDuration = await command().ask('Enter Timeout Duration (in ms)', config.timeoutDuration.toString())
        config.timeoutDuration = parseInt(timeoutDuration)
    } else if (choice === 'reset') {
        config = {
            debug: false,
            apiBaseURL: 'https://api.paystack.co',
            timeoutDuration: 3000
        }
    }

    setConfig(config)
}