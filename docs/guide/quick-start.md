# Quick Start

This guide will get you started with Paystack CLI in under 5 minutes.

## Installation & Setup

```bash
# Install globally
npm install -g @toneflix/paystack-cli

# Initialize the CLI
paystack-cli init

# Login to your Paystack account
paystack-cli login
```

## Common Commands

### Transactions

```bash
# Initialize a transaction
paystack-cli transaction:initialize \
  --email=customer@email.com \
  --amount=10000

# List all transactions
paystack-cli transaction:list --perPage=50 --page=1

# Verify a transaction
paystack-cli transaction:verify --reference=xyz123

# View transaction details
paystack-cli transaction:view --id=123456
```

### Customers

```bash
# Create a customer
paystack-cli customer:create \
  --email=user@example.com \
  --first_name=John \
  --last_name=Doe

# Fetch customer details
paystack-cli customer:fetch --code=CUS_xxxxx

# List all customers
paystack-cli customer:list --perPage=20
```

### Plans & Subscriptions

```bash
# Create a plan
paystack-cli plan:create \
  --name="Monthly Plan" \
  --amount=5000 \
  --interval=monthly

# Create a subscription
paystack-cli subscription:create \
  --customer=CUS_xxx \
  --plan=PLN_xxx
```

### Transfers

```bash
# Create a transfer recipient
paystack-cli transferrecipient:create \
  --type=nuban \
  --name="John Doe" \
  --account_number=0123456789 \
  --bank_code=033

# Initiate a transfer
paystack-cli transfer:initiate \
  --source=balance \
  --amount=10000 \
  --recipient=RCP_xxx
```

## Webhook Testing

```bash
# Start listening for webhooks
paystack-cli webhook listen http://localhost:3000/webhook

# In another terminal, ping your webhook
paystack-cli webhook ping --event=charge.success
```

## Configuration

```bash
# Configure CLI settings
paystack-cli config
```

You can configure:

- API Base URL
- Timeout Duration
- Debug Mode
- Ngrok Auth Token

## Getting Help

For any command, use the `--help` flag:

```bash
paystack-cli transaction:initialize --help
```

## Next Steps

- [Authentication Guide](/guide/authentication) - Learn about session management
- [API Reference](/api/transactions) - Explore all available commands
- [Webhook Testing](/guide/webhook-testing) - Set up local webhook testing
- [Examples](/guide/examples) - See real-world usage examples
