# Paystack CLI

[![npm version](https://img.shields.io/npm/v/@toneflix/paystack-cli.svg)](https://www.npmjs.com/package/@toneflix/paystack-cli)
[![License](https://img.shields.io/npm/l/@toneflix/paystack-cli.svg)](https://github.com/toneflix/paystack-cli/blob/main/LICENSE)
[![CI](https://github.com/toneflix/paystack-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/toneflix/paystack-cli/actions/workflows/ci.yml)
[![Deploy Docs](https://github.com/toneflix/paystack-cli/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/toneflix/paystack-cli/actions/workflows/deploy-docs.yml)

The Paystack CLI helps you build, test, and manage your Paystack integration right from the terminal. Interact with the Paystack API, test webhooks locally, and manage your integration settings without leaving your command line.

**[View Documentation](https://paystack.cli.toneflix.net)**

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Authentication](#authentication)
- [Commands](#commands)
  - [Core Commands](#core-commands)
  - [API Commands](#api-commands)
  - [Webhook Commands](#webhook-commands)
- [Configuration](#configuration)
- [Webhook Testing](#webhook-testing)
- [API Resources](#api-resources)
- [Examples](#examples)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

**Complete Paystack API Access** - Access all Paystack API endpoints directly from your terminal

**Secure Authentication** - Login once and securely manage your Paystack integration

**Local Webhook Testing** - Test webhooks locally using ngrok integration

**Configuration Management** - Configure API settings, timeouts, and debug modes

**Beautiful Output** - Formatted JSON responses with colored output for better readability

**Developer Friendly** - Built with TypeScript for type safety and better DX

## Installation

### NPM

```bash
npm install -g @toneflix/paystack-cli
```

### PNPM

```bash
pnpm add -g @toneflix/paystack-cli
```

### Yarn

```bash
yarn global add @toneflix/paystack-cli
```

After installation, verify the CLI is installed correctly:

```bash
paystack-cli --version
```

## Quick Start

1. **Initialize the CLI**

   ```bash
   paystack-cli init
   ```

2. **Login to your Paystack account**

   ```bash
   paystack-cli login
   ```

3. **Start using Paystack API commands**

   ```bash
   # List all transactions
   paystack-cli transaction:list

   # Fetch customer details
   paystack-cli customer:fetch --id=CUS_xxxxx

   # Create a new plan
   paystack-cli plan:create --name="Monthly Plan" --amount=5000 --interval=monthly
   ```

## Authentication

### Login

The CLI uses your Paystack account credentials for authentication:

```bash
paystack-cli login
```

You'll be prompted for:

- **Email**: Your Paystack account email
- **Password**: Your Paystack account password
- **Remember**: Option to save your email for future logins

After successful login, you'll select which integration to use (if you have multiple).

### Logout

To logout and clear your session:

```bash
paystack-cli logout
```

### Session Management

- Sessions automatically expire after the token timeout period
- You'll be prompted to login again when your session expires
- Login credentials are securely stored in a local SQLite database

## Commands

### Core Commands

#### `init`

Initialize the Paystack CLI application and setup the local database.

```bash
paystack-cli init
```

#### `login`

Authenticate with your Paystack account.

```bash
paystack-cli login
```

Options:

- Interactive prompts for email and password
- Option to remember email for faster login
- Automatic integration selection for accounts with multiple integrations

#### `logout`

Sign out and clear your authentication session.

```bash
paystack-cli logout
```

#### `config`

Configure CLI settings like API base URL, timeout duration, and debug mode.

```bash
paystack-cli config
```

Available configurations:

- **API Base URL**: Default Paystack API endpoint
- **Timeout Duration**: Request timeout in milliseconds
- **Debug Mode**: Enable/disable detailed error logging
- **Ngrok Auth Token**: Set ngrok authentication token for webhook testing

### Webhook Commands

#### `webhook listen`

Start a local webhook listener using ngrok tunneling.

```bash
paystack-cli webhook listen [local_route]
```

Arguments:

- `local_route` (optional): Your local webhook endpoint (e.g., `http://localhost:8080/webhook`)

Options:

- `--domain, -D`: Specify domain to ping (test/live) `[default: test]`
- `--forward, -F`: Forward webhook to a specific URL

Example:

```bash
# Listen on default route
paystack-cli webhook listen

# Listen on specific route
paystack-cli webhook listen http://localhost:3000/api/webhook

# Listen with custom domain
paystack-cli webhook listen http://localhost:8080 --domain=live
```

#### `webhook ping`

Send a test webhook event to your configured webhook URL.

```bash
paystack-cli webhook ping
```

Options:

- `--event, -E`: Event type to simulate (charge.success, transfer.success, etc.)
- `--domain, -D`: Domain to ping (test/live) `[default: test]`
- `--forward, -F`: Forward to specific URL instead of saved webhook

Example:

```bash
# Test charge success event
paystack-cli webhook ping --event=charge.success

# Test transfer failed on live
paystack-cli webhook ping --event=transfer.failed --domain=live
```

### API Commands

All Paystack API endpoints are available as commands. The general format is:

```bash
paystack-cli [resource]:[action] [options]
```

## API Resources

The CLI provides access to the following Paystack resources:

### Transactions

Manage payment transactions.

```bash
# Initialize a transaction
paystack-cli transaction:initialize --email=customer@email.com --amount=10000

# List all transactions
paystack-cli transaction:list --perPage=50 --page=1

# Verify a transaction
paystack-cli transaction:verify --reference=xyz123

# View transaction details
paystack-cli transaction:view --id=123456

# Charge authorization
paystack-cli transaction:charge --authorization_code=AUTH_xxx --email=user@example.com --amount=5000

# Export transactions
paystack-cli transaction:export --from=2024-01-01 --to=2024-12-31

# Check authorization
paystack-cli transaction:check --authorization_code=AUTH_xxx --email=user@example.com --amount=5000

# Get transaction totals
paystack-cli transaction:transaction --from=2024-01-01 --to=2024-12-31

# Fetch transaction
paystack-cli transaction:fetch --id=12345
```

### Customers

Manage customer information.

```bash
# Create customer
paystack-cli customer:create --email=user@example.com --first_name=John --last_name=Doe

# Update customer
paystack-cli customer:update --code=CUS_xxx --first_name=Jane

# Fetch customer
paystack-cli customer:fetch --code=CUS_xxx

# List customers
paystack-cli customer:list --perPage=20 --page=1

# Set risk action
paystack-cli customer:set_risk_action --customer=CUS_xxx --risk_action=allow

# Deactivate authorization
paystack-cli customer:deactivate --authorization_code=AUTH_xxx
```

### Plans

Create and manage subscription plans.

```bash
# Create plan
paystack-cli plan:create --name="Premium Plan" --amount=50000 --interval=monthly

# Update plan
paystack-cli plan:update --code=PLN_xxx --amount=60000

# List plans
paystack-cli plan:list --interval=monthly --amount=50000

# Fetch plan
paystack-cli plan:fetch --code=PLN_xxx
```

### Subscriptions

Manage customer subscriptions.

```bash
# Create subscription
paystack-cli subscription:create --customer=CUS_xxx --plan=PLN_xxx

# Disable subscription
paystack-cli subscription:disable --code=SUB_xxx --token=email_token

# Enable subscription
paystack-cli subscription:enable --code=SUB_xxx --token=email_token

# Fetch subscription
paystack-cli subscription:fetch --code=SUB_xxx

# List subscriptions
paystack-cli subscription:list --customer=CUS_xxx --plan=PLN_xxx
```

### Transfers

Handle money transfers.

```bash
# Initiate transfer
paystack-cli transfer:initiate --source=balance --amount=10000 --recipient=RCP_xxx

# List transfers
paystack-cli transfer:list --perPage=50

# Verify transfer
paystack-cli transfer:verify --reference=TRF_xxx

# Finalize transfer
paystack-cli transfer:finalize --transfer_code=TRF_xxx --otp=123456

# Bulk transfer
paystack-cli transfer:initiate --transfers='[{"amount":10000,"recipient":"RCP_xxx"}]'

# Disable OTP
paystack-cli transfer:disable

# Enable OTP
paystack-cli transfer:enable

# Resend OTP
paystack-cli transfer:resend --transfer_code=TRF_xxx --reason=resend_otp

# Fetch transfer
paystack-cli transfer:fetch --code=TRF_xxx
```

### Transfer Recipients

Manage transfer recipients.

```bash
# Create recipient
paystack-cli transferrecipient:create --type=nuban --name="John Doe" --account_number=0123456789 --bank_code=033

# Update recipient
paystack-cli transferrecipient:update --code=RCP_xxx --name="Jane Doe"

# Delete recipient
paystack-cli transferrecipient:delete --code=RCP_xxx

# List recipients
paystack-cli transferrecipient:list --perPage=50
```

### Subaccounts

Manage split payment subaccounts.

```bash
# Create subaccount
paystack-cli subaccount:create --business_name="Vendor Co" --settlement_bank=033 --account_number=0123456789 --percentage_charge=10

# Update subaccount
paystack-cli subaccount:update --code=ACCT_xxx --business_name="New Name"

# Fetch subaccount
paystack-cli subaccount:fetch --code=ACCT_xxx

# List subaccounts
paystack-cli subaccount:list
```

### Payment Pages

Create and manage payment pages.

```bash
# Create page
paystack-cli page:create --name="Donation Page" --amount=5000

# Update page
paystack-cli page:update --code=PAGE_xxx --name="New Page Name"

# Fetch page
paystack-cli page:fetch --code=PAGE_xxx

# List pages
paystack-cli page:list

# Check slug availability
paystack-cli page:check --slug=my-page
```

### Payment Requests (Invoices)

Manage payment requests and invoices.

```bash
# Create payment request
paystack-cli paymentrequest:create --customer=CUS_xxx --amount=10000 --description="Invoice for services"

# List payment requests
paystack-cli paymentrequest:list

# Fetch payment request
paystack-cli paymentrequest:fetch --code=PRQ_xxx

# Update payment request
paystack-cli paymentrequest:update --code=PRQ_xxx --amount=15000

# Verify payment request
paystack-cli paymentrequest:verify --code=PRQ_xxx

# Send notification
paystack-cli paymentrequest:send --code=PRQ_xxx

# Finalize payment request
paystack-cli paymentrequest:finalize --code=PRQ_xxx

# View invoice
paystack-cli paymentrequest:invoice --code=PRQ_xxx
```

### Charges

Handle card charges and tokenization.

```bash
# Submit OTP
paystack-cli charge:submit --otp=123456 --reference=ref_xxx

# Submit PIN
paystack-cli charge:submit --pin=1234 --reference=ref_xxx

# Submit birthday
paystack-cli charge:submit --birthday=1990-01-01 --reference=ref_xxx

# Submit phone
paystack-cli charge:submit --phone=08012345678 --reference=ref_xxx

# Tokenize charge
paystack-cli charge:tokenize --card=xxx

# Check pending charge
paystack-cli charge:check --reference=ref_xxx

# Charge
paystack-cli charge:charge --email=user@example.com --amount=10000
```

### Bulk Charges

Manage bulk charge operations.

```bash
# Initiate bulk charge
paystack-cli bulkcharge:initiate --charges='[{"authorization":"AUTH_xxx","amount":10000}]'

# Fetch bulk charge
paystack-cli bulkcharge:fetch --code=BCH_xxx

# Fetch bulk charge charges
paystack-cli bulkcharge:fetch --code=BCH_xxx

# Pause bulk charge
paystack-cli bulkcharge:pause --code=BCH_xxx

# Resume bulk charge
paystack-cli bulkcharge:resume --code=BCH_xxx
```

### Refunds

Process refunds for transactions.

```bash
# Create refund
paystack-cli refund:create --transaction=TRX_xxx --amount=5000

# List refunds
paystack-cli refund:list --transaction=TRX_xxx

# Fetch refund
paystack-cli refund:fetch --code=RFD_xxx
```

### Banks

Get bank information.

```bash
# List banks
paystack-cli bank:list --country=nigeria --use_cursor=true

# Resolve account number
paystack-cli bank:resolve --account_number=0123456789 --bank_code=033

# Resolve BVN
paystack-cli bank:resolve --bvn=12345678901

# Match BVN with account
paystack-cli bank:match --account_number=0123456789 --bank_code=033 --bvn=12345678901
```

### Settlements

View settlement information.

```bash
# Fetch settlements
paystack-cli settlement:fetch --from=2024-01-01 --to=2024-12-31 --subaccount=ACCT_xxx
```

### Integration

Manage integration settings.

```bash
# Fetch payment session timeout
paystack-cli integration:fetch

# Update payment session timeout
paystack-cli integration:update --timeout=600
```

### Balance

Check account balance.

```bash
# Check balance
paystack-cli balance:check

# View balance ledger
paystack-cli balance:balance
```

### Verifications

Verify customer information.

```bash
# Resolve verification
paystack-cli verifications:resolve --verification_type=truecaller --phone=08012345678
```

### Decision

Card information lookup.

```bash
# Resolve card BIN
paystack-cli decision:resolve --bin=123456
```

### Invoices

Manage invoices.

```bash
# Archive invoice
paystack-cli invoice:archive --code=INV_xxx
```

## Configuration

The CLI stores configuration in a local database. Use the `config` command to modify settings:

```bash
paystack-cli config
```

### Available Settings

1. **API Base URL**
   - Default: `https://api.paystack.co`
   - Change this to use a different Paystack API endpoint

2. **Timeout Duration**
   - Default: `3000ms`
   - HTTP request timeout in milliseconds

3. **Debug Mode**
   - Default: `false`
   - Enable to see detailed error messages and stack traces

4. **Ngrok Auth Token**
   - Required for webhook testing
   - Get your token from [ngrok.com](https://dashboard.ngrok.com/get-started/your-authtoken)

### Environment Variables

You can also set configuration via environment variables:

- `NGROK_AUTH_TOKEN`: Your ngrok authentication token
- `NGROK_DOMAIN`: Custom ngrok domain (if you have a paid plan)

## Webhook Testing

### Setting Up

1. **Configure ngrok token** (first time only):

   ```bash
   paystack-cli config
   # Select "Ngrok Auth Token" and enter your token
   ```

2. **Start webhook listener**:
   ```bash
   paystack-cli webhook listen http://localhost:3000/webhook
   ```

The CLI will:

- Create an ngrok tunnel to your local server
- Update your Paystack webhook URL automatically
- Forward all webhook events to your local endpoint

### Testing Webhooks

Send test webhook events:

```bash
# Test successful charge
paystack-cli webhook ping --event=charge.success

# Test transfer events
paystack-cli webhook ping --event=transfer.success
paystack-cli webhook ping --event=transfer.failed

# Test subscription event
paystack-cli webhook ping --event=subscription.create
```

### Available Events

- `charge.success` - Successful payment
- `transfer.success` - Successful transfer
- `transfer.failed` - Failed transfer
- `subscription.create` - New subscription created

## Examples

### Complete Transaction Flow

```bash
# 1. Initialize transaction
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=50000 \
  --reference=ORDER_12345

# 2. After customer pays, verify transaction
paystack-cli transaction:verify --reference=ORDER_12345

# 3. View transaction details
paystack-cli transaction:view --id=123456
```

### Subscription Management

```bash
# 1. Create a plan
paystack-cli plan:create \
  --name="Monthly Premium" \
  --amount=50000 \
  --interval=monthly

# 2. Create customer
paystack-cli customer:create \
  --email=subscriber@example.com \
  --first_name=John \
  --last_name=Doe

# 3. Create subscription
paystack-cli subscription:create \
  --customer=CUS_xxx \
  --plan=PLN_xxx
```

### Transfer Workflow

```bash
# 1. Create transfer recipient
paystack-cli transferrecipient:create \
  --type=nuban \
  --name="Jane Doe" \
  --account_number=0123456789 \
  --bank_code=033

# 2. Initiate transfer
paystack-cli transfer:initiate \
  --source=balance \
  --amount=50000 \
  --recipient=RCP_xxx \
  --reason="Payment for services"

# 3. If OTP is required, finalize with OTP
paystack-cli transfer:finalize \
  --transfer_code=TRF_xxx \
  --otp=123456
```

## Development

### Prerequisites

- Node.js >= 18
- PNPM (recommended) or NPM

### Setup

```bash
# Clone repository
git clone https://github.com/toneflix/paystack-cli.git
cd paystack-cli

# Install dependencies
pnpm install

# Run in development mode
pnpm runner [command]

# Build
pnpm build

# Run tests
pnpm test
```

### Project Structure

```md
paystack-cli/
├── src/
│ ├── Commands/ # CLI command classes
│ │ ├── Commands.ts # Dynamic API command generator
│ │ ├── InitCommand.ts
│ │ ├── LoginCommand.ts
│ │ ├── LogoutCommand.ts
│ │ ├── ConfigCommand.ts
│ │ └── WebhookCommand.ts
│ ├── Contracts/ # TypeScript interfaces
│ ├── paystack/ # Paystack API definitions
│ │ ├── apis.ts # All API endpoint schemas
│ │ └── webhooks.ts # Webhook event handlers
│ ├── utils/ # Utility functions
│ ├── cli.ts # Application entry point
│ ├── db.ts # Local database management
│ ├── helpers.ts # Helper functions
│ ├── hooks.ts # Custom hooks
│ └── Paystack.ts # Paystack API client
├── bin/ # Executable files
├── tests/ # Test files
└── package.json
```

### Technology Stack

- **Framework**: [H3ravel Musket](https://github.com/h3ravel/musket) - CLI framework
- **Language**: TypeScript
- **Database**: SQLite (via better-sqlite3)
- **HTTP Client**: Axios
- **Tunneling**: ngrok
- **Build Tool**: tsdown

## Troubleshooting

### Common Issues

**1. "You're not signed in" error**

```bash
# Solution: Login first
paystack-cli login
```

**2. "Session expired" error**

```bash
# Solution: Login again
paystack-cli logout
paystack-cli login
```

**3. Webhook listener not working**

```bash
# Solution: Check ngrok token is configured
paystack-cli config
# Select "Ngrok Auth Token" and enter your token from ngrok.com
```

**4. Command not found**

```bash
# Solution: Ensure CLI is installed globally
npm install -g @toneflix/paystack-cli
# Or reinstall
npm uninstall -g @toneflix/paystack-cli
npm install -g @toneflix/paystack-cli
```

**5. Permission errors on macOS/Linux**

```bash
# Solution: Use sudo for global installation
sudo npm install -g @toneflix/paystack-cli
```

### Debug Mode

Enable debug mode to see detailed error information:

```bash
paystack-cli config
# Select "Debug Mode" and choose "true"
```

### Getting Help

For any command, you can get help by running:

```bash
paystack-cli [command] --help
```

Or visit the [Paystack API Documentation](https://paystack.com/docs/api/) for API-specific information.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write TypeScript with proper type definitions
- Follow existing code style
- Add tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support

- Email: support@toneflix.net
- Issues: [GitHub Issues](https://github.com/toneflix/paystack-cli/issues)
- Docs: [Paystack Documentation](https://paystack.com/docs)
- Community: [Paystack Slack](https://paystack.com/slack)

## Acknowledgments

- Built with [H3ravel Musket](https://github.com/h3ravel/musket)
- Powered by [Paystack](https://paystack.com)
- Tunneling by [ngrok](https://ngrok.com)

---

**&copy; Copyright 2026 - [ToneFlix Technologies Limited](https://toneflix.net)**
