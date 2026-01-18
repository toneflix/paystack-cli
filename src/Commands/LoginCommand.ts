import * as db from "src/db";

import { getIntegration, selectIntegration, signIn, storeLoginDetails } from "src/Paystack";

import { Command } from "@h3ravel/musket";
import { Logger } from "@h3ravel/shared";
import { promiseWrapper } from "src/helpers";
import { useCommand } from "src/hooks";

export class LoginCommand extends Command {
    protected signature = `login`;
    protected description = 'Log in to paystack cli';

    async handle () {
        const [_, setCommand] = useCommand()
        setCommand(this);
        let token, user;

        let expiry = parseInt(db.read('token_expiry')) * 1000;
        let now = parseFloat(Date.now().toString());

        if (expiry > now) {
            token = db.read('token');
            user = db.read('user');
            return void this.info("You're already logged in");
        } else {
            const remembered = db.read('remember_login');
            const email = await this.ask('Email address', remembered ? remembered.email : undefined);
            const password = await this.secret('Password', '*');
            const remember = await this.confirm('Remember Email Address?', true);

            if (remember) {
                db.write('remember_login', { email });
            } else {
                db.remove('remember_login');
            }

            const [e, response] = await promiseWrapper(
                signIn(email, password),
            );

            if (response && response.data) {
                storeLoginDetails(response);
                token = response.data.token;
                user = response.data.user;
            }
        }

        if (token && user) {
            const [err, integration] = await promiseWrapper(
                selectIntegration(user.integrations, token),
            );

            if (err || !integration) {
                this.error('ERROR: ' + (err ?? 'Integration selection failed')).newLine();
            } else {
                db.write('selected_integration', integration);
                let user_role = db.read('selected_integration').logged_in_user_role;
                const [err, integrationData] = await promiseWrapper(
                    getIntegration(integration.id, token),
                );

                if (err || !integrationData)
                    return void this.error('ERROR: ' + (err ?? 'Failed to fetch integration data')).newLine();

                integrationData.logged_in_user_role = user_role;
                db.write('selected_integration', integrationData);

                Logger.log([
                    ['Logged in as', 'white'],
                    [user.email, 'cyan'],
                    ['-', 'white'],
                    [integration.business_name, 'green'],
                    ['(' + integration.id + ')', 'white'],
                ], ' ')

                this.newLine();
            }
        }
    }
} 