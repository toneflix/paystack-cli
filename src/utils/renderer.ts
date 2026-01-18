import { Logger } from "@h3ravel/shared";
import { XGeneric } from "../Contracts/Generic";

/**
 * We will recursively map through the result data and log each key value pair
 * as we apply coloring based on the value type.
 * We also need to handle root or nested objects and arrays while considering
 * indentation for better readability.
 * 
 * @param data 
 */
export const dataRenderer = (data: XGeneric) => {
    const render = (obj: XGeneric, indent = 0) => {
        const indentation = ' '.repeat(indent);
        for (const key in obj) {
            const value = obj[key];
            if (typeof value === 'object' && value !== null) {
                console.log(`${indentation}${stringFormatter(key)}:`);
                render(value, indent + 2);
            } else {
                let coloredValue;
                switch (typeof value) {
                    case 'string':
                        coloredValue = Logger.log(value, 'green', false);
                        break;
                    case 'number':
                        coloredValue = Logger.log(String(value), 'yellow', false);
                        break;
                    case 'boolean':
                        coloredValue = Logger.log(String(value), 'blue', false);
                        break;
                    default:
                        coloredValue = value;
                }
                console.log(`${indentation}${stringFormatter(key)}: ${coloredValue}`);
            }
        }
    };

    render(data);
}

/**
 * We will format a string by replacing underscores and hyphens with spaces,
 * capitalizing the first letter of every word,
 * converting camelCase to spaced words,
 * and trimming any leading or trailing spaces.
 * If a sentence is only two letters long we will make it uppercase.
 * 
 * @param str 
 * @returns 
 */
export const stringFormatter = (str: string) => {
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to spaced words
        .replace(/[_-]+/g, ' ')               // underscores and hyphens to spaces
        .replace(/\s+/g, ' ')                 // multiple spaces to single space
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize first letter
        .join(' ')
        .trim()
        .replace(/^(\w{2})$/, (_, p1) => p1.toUpperCase()); // uppercase if two letters
}