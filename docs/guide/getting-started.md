# Getting Started

Get up and running with Paystack CLI in just a few minutes.

## Installation

Install the CLI globally using your preferred package manager:

::: code-group

```bash [npm]
npm install -g @toneflix/paystack-cli
```

```bash [pnpm]
pnpm add -g @toneflix/paystack-cli
```

```bash [yarn]
yarn global add @toneflix/paystack-cli
```

:::

## Verify Installation

After installation, verify the CLI is installed correctly:

```bash
paystack-cli --version
```

This should display the current version of the CLI.

## Prerequisites

Before using the CLI, ensure you have:

1. **Node.js** - Version 18 or higher
2. **Paystack Account** - Sign up at [paystack.com](https://paystack.com)
3. **Active Integration** - At least one Paystack integration (test or live)

## First Steps

### 1. Initialize the CLI

Initialize the application and set up the local database:

```bash
paystack-cli init
```

This creates a local SQLite database to store your configuration and session data.

### 2. Login to Paystack

Authenticate with your Paystack account:

```bash
paystack-cli login
```

You'll be prompted for:

- Your Paystack account email
- Your password
- Whether to remember your email

After successful login, if you have multiple integrations, you'll select which one to use.

### 3. Start Using Commands

You're now ready to start using Paystack API commands:

```bash
# List all transactions
paystack-cli transaction:list

# Create a customer
paystack-cli customer:create --email=user@example.com --first_name=John

# Initialize a transaction
paystack-cli transaction:initialize --email=customer@email.com --amount=10000
```

## Next Steps

Now that you have the CLI installed and configured:

- Learn about [Authentication](/guide/authentication) and session management
- Explore [Commands](/guide/commands) to see what's available
- Set up [Webhook Testing](/guide/webhook-testing) for local development
- Check out [Examples](/guide/examples) for common workflows
