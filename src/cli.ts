#!/usr/bin/env node

import Commands from './Commands/Commands';
import { ConfigCommand } from './Commands/ConfigCommand';
import { InitCommand } from './Commands/InitCommand';
import { Kernel } from '@h3ravel/musket';
import { LoginCommand } from './Commands/LoginCommand';
import { LogoutCommand } from './Commands/LogoutCommand';
import { WebhookCommand } from './Commands/WebhookCommand';
import { initAxios } from './axios';
import logo from './logo';
import { useConfig } from './hooks';

class Application { }

initAxios()
Kernel.init(new Application(), {
    logo,
    exceptionHandler (exception) {
        const [getConfig] = useConfig()
        const config = getConfig()

        console.error(config.debug ? exception : exception.message);
    },
    baseCommands: [
        InitCommand,
        LoginCommand,
        LogoutCommand,
        ConfigCommand,
        WebhookCommand,
        ...Commands(),
    ],
})