# Commands

Comprehensive guide to all available Paystack CLI commands.

## Command Structure

All commands follow this general structure:

```bash
paystack-cli [resource]:[action] [options]
```

For example:

```bash
paystack-cli transaction:initialize --email=user@example.com --amount=10000
```

## Core Commands

### init

Initialize the Paystack CLI application and set up the local database.

```bash
paystack-cli init
```

**When to use:**

- First time setup
- After deleting the database file
- When you need to reset the CLI

### login

Authenticate with your Paystack account.

```bash
paystack-cli login
```

**Features:**

- Interactive email and password prompts
- Option to remember email
- Automatic integration selection
- Secure session management

### logout

Sign out and clear your authentication session.

```bash
paystack-cli logout
```

**What it does:**

- Clears authentication token
- Removes selected integration
- Requires re-login for API calls

### config

Configure CLI settings interactively.

```bash
paystack-cli config
```

**Configurable settings:**

- API Base URL
- Timeout Duration
- Debug Mode
- Ngrok Auth Token

## Webhook Commands

### webhook listen

Start a local webhook listener using ngrok tunneling.

```bash
paystack-cli webhook listen [local_route]
```

**Arguments:**

- `local_route` (optional) - Your local webhook endpoint

**Options:**

- `--domain, -D` - Domain to use (test/live) `[default: test]`
- `--forward, -F` - Forward to specific URL

**Examples:**

```bash
# Listen on default route
paystack-cli webhook listen

# Listen on specific route
paystack-cli webhook listen http://localhost:3000/api/webhook

# Listen on live domain
paystack-cli webhook listen http://localhost:8080 --domain=live
```

### webhook ping

Send a test webhook event to your configured webhook URL.

```bash
paystack-cli webhook ping
```

**Options:**

- `--event, -E` - Event type to simulate
- `--domain, -D` - Domain to ping (test/live)
- `--forward, -F` - Forward to specific URL

**Available events:**

- `charge.success` - Successful payment
- `transfer.success` - Successful transfer
- `transfer.failed` - Failed transfer
- `subscription.create` - New subscription

**Examples:**

```bash
# Test charge success
paystack-cli webhook ping --event=charge.success

# Test transfer on live
paystack-cli webhook ping --event=transfer.success --domain=live
```

## API Commands

All Paystack API resources are available as commands. See the [API Reference](/api/transactions) for detailed documentation on each resource:

- [Transactions](/api/transactions) - Payment transactions
- [Customers](/api/customers) - Customer management
- [Plans](/api/plans) - Subscription plans
- [Subscriptions](/api/subscriptions) - Customer subscriptions
- [Transfers](/api/transfers) - Money transfers
- [Transfer Recipients](/api/transfer-recipients) - Transfer recipient management
- [Subaccounts](/api/subaccounts) - Split payment subaccounts
- [Payment Pages](/api/payment-pages) - Payment page management
- [Payment Requests](/api/payment-requests) - Invoices and payment requests
- [Bulk Charges](/api/bulk-charges) - Bulk charge operations
- [Refunds](/api/refunds) - Transaction refunds
- [Banks](/api/banks) - Bank information
- [Settlements](/api/settlements) - Settlement information
- [Balance](/api/balance) - Account balance
- [Verifications](/api/verifications) - Customer verification
- [Invoices](/api/invoices) - Invoice management

## Command Options

### Common Options

Most API commands support these common options:

- `--help` - Display help for the command
- `-D, --domain` - Specify test or live mode
- `--perPage` - Number of results per page (for list commands)
- `--page` - Page number (for list commands)

### Getting Help

For detailed help on any command:

```bash
paystack-cli [command] --help
```

Example:

```bash
paystack-cli transaction:initialize --help
```

## Command Categories

### Read Operations

Commands that fetch data without modifying anything:

- `list` - List multiple resources
- `fetch` - Get a single resource
- `view` - View resource details
- `check` - Check resource status

### Write Operations

Commands that create or modify data:

- `create` - Create new resource
- `update` - Update existing resource
- `initialize` - Start a process
- `finalize` - Complete a process

### Action Operations

Commands that perform specific actions:

- `verify` - Verify a resource
- `send` - Send notifications
- `disable` - Disable a resource
- `enable` - Enable a resource
- `archive` - Archive a resource

## Next Steps

- Explore the [API Reference](/api/transactions) for specific command documentation
- Learn about [Webhook Testing](/guide/webhook-testing)
- See [Examples](/guide/examples) of common workflows
