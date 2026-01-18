import { XParam } from '../Contracts/Generic'
import { useShortcuts } from 'src/hooks'

/**
 * We would build a command signature string from an array of arguments.
 * Musket command signature for arguments follow this format:
 * 
 * - Optional arguments: {argumentName?}
 * - Required arguments: {argumentName}
 * - Optional argument with a default value: {argumentName=defaultValue}
 * - Arguments with description: {argumentName : description}
 * - Arguments Expecting multiple values: {argumentName*}
 * 
 * - Boolean flags are represented as: {--flag-name}
 * - Flags expecting values are represented as: {--flag-name=}
 * - Flags with description: {--flag-name : description}
 * - Flags expecting multiple values: {--flag-name=*}
 * - Flags with choices: {--flag-name : : choice1,choice2,choice3}
 * - Or {--flag-name : description : choice1,choice2,choice3}
 * 
 * For shortcuts: {--F|flag-name}
 * We will extract the first letter before the pipe as the shortcut, but we also 
 * need to ensure it is not already used by another option, in which case we check 
 * if the string is a multiword (camel, dash, underscore separated) then we try to use the first letter of the second word.
 * 
 * XParam properties used:
 * - parameter: The name of the argument or flag.
 * - required: A boolean indicating if the argument is required.
 * - type: The type of the argument (String, Number, Boolean, Array, Object).
 * - description: An optional description for the argument.
 * - default: An optional default value for the argument.
 * - options: An optional array of choices for the argument.
 * 
 * We will make required arguments with defaults arguments.
 * Everything else would be flags.
 * 
 * 
 * @param args 
 */
export const buildSignature = (param: XParam, cmd: string) => {
    const [_, setShortcut] = useShortcuts()

    let signature = ''

    // Determine if it's a flag or argument
    const isFlag = !param.required || param.default !== undefined || param.type === 'Boolean' || param.options

    if (isFlag && param.paramType !== 'path' && param.arg !== true) {
        signature += '{--'

        // Use cmd to track used shortcuts
        const shortcut = cmd + ':' + param.parameter.charAt(0).toLowerCase()
        if (setShortcut(shortcut)) {
            signature += `${param.parameter.charAt(0).toLowerCase()}|`
        } else {
            // Try to get first letter of second word if multiword
            const words = param.parameter.split(/[_-\s]/)
            if (words.length > 1) {
                const secondWordShortcut = cmd + ':' + words[1].charAt(0).toLowerCase()
                if (setShortcut(secondWordShortcut)) {
                    signature += `${words[1].charAt(0).toLowerCase()}|`
                }
            }
        }

        signature += `${param.parameter}`

        // Handle different types
        if (param.type !== 'Boolean') {
            signature += param.default ? `=${param.default}` : '?'
        }

        // Add description if available
        if (param.description) {
            signature += ` : ${param.description}`
        }

        // Add options if available
        if (param.options) {
            const optionsStr = param.options.join(',')
            signature += ` : ${optionsStr}`
        }

        signature += '}'
    } else {

        // It's a required argument
        signature += `{${param.parameter}`

        if (param.default) {
            signature += `=${param.default}`
        }

        // Add description if available
        if (param.description) {
            signature += ` : ${param.description}`
        }

        signature += '}'
    }

    return signature
} 