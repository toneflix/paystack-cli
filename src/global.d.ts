declare global {
    interface String {
        /**
         * Convert a string to Kebab Case
         * 
         * @returns 
         */
        toKebabCase (): string;

        /**
         * Convert a string to camel Case
         * 
         * @returns 
         */
        toCamelCase (): string;

        /**
         * Convert a string to Pascal Case
         * 
         * @returns 
         */
        toPascalCase (): string;

        /**
         * Convert a string to Snake Case
         * 
         * @returns 
         */
        toSnakeCase (): string;

        /**
         * Convert a string to Title Case
         * 
         * @returns
         */
        toTitleCase (): string;

        /**
         * Convert a string to Clean Case
         * We will format a string by replacing underscores and hyphens with spaces,
         * capitalizing the first letter of every word,
         * converting camelCase to spaced words,
         * and trimming any leading or trailing spaces.
         * If a sentence is only two letters long we will make it uppercase.
         * 
         * @returns
         */
        toCleanCase (): string;

        /**
         * Truncate a string to n characters
         * 
         * @param n 
         */
        truncate (n: number): string;
    }
}
export { } 