import * as db from '../db';

import { executeSchema, promiseWrapper } from 'src/helpers';

import APIs from '../paystack/apis';
import { Command } from '@h3ravel/musket';
import { XSchema } from '../Contracts/Generic';
import { buildSignature } from 'src/utils/argument';
import { dataRenderer } from '../utils/renderer';
import ora from 'ora';
import { useCommand } from '../hooks';

export default () => {
    const commands: typeof Command[] = [];

    /**
     * We should map through the APIs and reduce all apis to a single key value pair
     * where key is the API key and the schema array entry api propety separated by a 
     * semicolon and the value is schema array entry.
     */
    const entries = Object.entries(APIs).reduce((acc, [key, schemas]) => {
        schemas.forEach((schema) => {
            const commandKey = key === schema.api ? key : `${key}:${schema.api}`;
            acc[commandKey] = schema;
        });
        return acc;
    }, {} as Record<string, XSchema>);

    for (const [key, schema] of Object.entries(entries)) {
        const args = schema.params.map(param => buildSignature(param, key)).join('\n')

        const command = class extends Command {

            protected signature = `${key} \n${args}`;
            protected description = schema.description || 'No description available.';

            handle = async () => {
                const [_, setCommand] = useCommand()
                setCommand(this);

                for (const param of schema.params)
                    if (param.required && !this.argument(param.parameter))
                        return void this.newLine().error(`Missing required argument: ${param.parameter}`).newLine();


                const selected_integration = db.read('selected_integration')?.id;
                const user = db.read('user')?.id;

                if (!selected_integration || !user) {
                    this.error("ERROR: You're not signed in, please run the [login] command before you begin").newLine();
                    return;
                }

                this.newLine();

                const spinner = ora('Loading...\n').start();

                let [err, result] = await promiseWrapper(
                    executeSchema(schema, { ...this.options(), ...this.arguments() }),
                );

                if (err || !result) return void spinner.fail((err || 'An error occurred') + '\n')

                spinner.succeed(result.message);

                this.newLine();

                dataRenderer(result.data);

                this.newLine();
            };
        }
        commands.push(command as unknown as typeof Command);
    }

    return commands;
};