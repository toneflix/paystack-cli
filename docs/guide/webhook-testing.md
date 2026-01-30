# Webhook Testing

Test webhooks locally using Paystack CLI's built-in ngrok integration.

## Overview

Webhook testing typically requires deploying your application to a public server. Paystack CLI makes this easy by:

1. Creating an ngrok tunnel to your local server
2. Automatically updating your Paystack webhook URL
3. Forwarding all webhook events to your local endpoint

## Prerequisites

### 1. Get Ngrok Auth Token

Sign up at [ngrok.com](https://ngrok.com) and get your auth token from [dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)

### 2. Configure the Token

```bash
paystack-cli config
# Select "Ngrok Auth Token"
# Paste your token
```

Or set it via environment variable:

```bash
export NGROK_AUTH_TOKEN="your_token_here"
```

## Setting Up Webhook Listener

### Start the Listener

#### Option 1: Connect to Your Local Server

```bash
paystack-cli webhook listen [url]
```

If you don't provide a route, you'll be prompted:

```bash
$ paystack-cli webhook listen
Enter the url to listen on for webhooks: http://localhost:3000/webhook
```

#### Option 2: Use Built-in Server

The CLI can start a simple server for you:

```bash
paystack-cli webhook listen --serve
```

This starts a server on port 3000 and automatically sets up the tunnel.

### What Happens

When you start the listener:

1. **Ngrok tunnel is created** to your local server (or built-in server)
2. **Webhook URL is updated** in your Paystack integration
3. **Events are forwarded** to your local endpoint automatically
4. You'll see **real-time webhook events** in your terminal

### Example Output

```bash
$ paystack-cli webhook listen http://localhost:3000/webhook

✓ Tunnelling webhook events to http://localhost:3000/webhook

INFO: Listening for incoming webhook events at: http://localhost:3000/webhook
INFO: Webhook URL set to: https://abc123.ngrok-free.app/webhook for test domain
INFO: Press Ctrl+C to stop listening for webhook events.
```

## Testing Webhooks

### Using webhook ping

While the listener is running, open another terminal and send test events:

```bash
# Test charge success
paystack-cli webhook ping --event=charge.success

# Test transfer success
paystack-cli webhook ping --event=transfer.success

# Test failed transfer
paystack-cli webhook ping --event=transfer.failed

# Test subscription creation
paystack-cli webhook ping --event=subscription.create
```

### Interactive Event Selection

If you don't specify an event, you'll be prompted to choose:

```bash
$ paystack-cli webhook ping

? Select event to simulate
❯ Charge Success
  Transfer Success
  Transfer Failed
  Subscription Create
  Customer Identification Failed
  Customer Identification Success
  DVA Assign Failed
  DVA Assign Success
```

### Modify Webhook Payload

You can interactively modify the webhook payload before sending:

```bash
paystack-cli webhook ping --event=charge.success --mod
```

This allows you to:

- Add custom properties to nested objects
- Test different scenarios with custom data

### Real Transaction Testing

You can also trigger webhooks by performing real actions:

```bash
# Initialize a transaction
paystack-cli transaction:initialize \
  --email=test@example.com \
  --amount=10000

# Complete the payment through the returned authorization URL
# The webhook will be sent to your local endpoint
```

## Available Webhook Events

The CLI supports testing these webhook events:

| Event                            | Description                                |
| -------------------------------- | ------------------------------------------ |
| `charge.success`                 | Successful payment transaction             |
| `transfer.success`               | Successful money transfer                  |
| `transfer.failed`                | Failed transfer attempt                    |
| `subscription.create`            | New subscription created                   |
| `customeridentification.failed`  | Failed customer identification attempt     |
| `customeridentification.success` | Successful customer identification attempt |
| `dedicatedaccount.assign.failed` | Failed DVA assignmenment attempt           |

Use the `--serve` flag to start a simple HTTP server:

```bash
paystack-cli webhook listen --serve
```

This starts a server on port 3000 and creates an ngrok tunnel automatically. Perfect for quick testing without setting up your own server.

::: tip
You can test any of these events without a running listener by using the `--forward` option to send to a specific URL.
:::

### Specify Domain

Use `test` or `live` mode webhooks:

```bash
# Test mode (default)
paystack-cli webhook listen http://localhost:3000/webhook --domain=test

# Live mode
paystack-cli webhook listen http://localhost:3000/webhook --domain=live
```

### Forward to Specific URL (Ping Only)

When using `webhook ping`, override the saved webhook URL:

```bash
paystack-cli webhook ping \
  --event=charge.success \
  --forward=https://your-custom-url.com/webhook
```

This sends the webhook to the specified URL instead of the configured webhook endpoint.

### Modify Webhook Payload (Ping Only)

Interactively modify webhook data before sending:

```bash
paystack-cli webhook ping --event=charge.success --mod
```

You'll be prompted to:

1. Change existing field values
2. Modify nested object properties
3. Add custom properties to objects

```bash
paystack-cli webhook listen http://localhost:3000/webhook \
  --forward=https://your-custom-url.com/webhook
```

### Custom Ngrok Domain

If you have a paid ngrok plan with a custom domain:

```bash
export NGROK_DOMAIN="your-subdomain.ngrok.io"
paystack-cli webhook listen http://localhost:3000/webhook
```

## Webhook Handler Example

Here's an example Express.js webhook handler:

````javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  // Verify webhook signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');
Command Reference

### webhook listen

Start webhook listener and create ngrok tunnel.

```bash
paystack-cli webhook listen [url] [options]
````

**Arguments:**

- `url` - (Optional) Your local webhook endpoint (e.g., `http://localhost:3000/webhook`)

**Options:**

- `--domain, -D` - Domain to use (test/live) - Default: `test`
- `--forward, -F` - Forward webhook to specific URL instead of saved webhook
- `--serve, -S` - Start a built-in server on port 3000

**Examples:**

```bash
# With your own server
paystack-cli webhook listen http://localhost:3000/webhook

# With built-in server
paystack-cli webhook listen --serve

# On live domain
paystack-cli webhook listen http://localhost:3000/webhook --domain=live

# Interactive prompt if no URL provided
paystack-cli webhook listen
```

### webhook ping

Send test webhook event to your configured endpoint.

```bash
paystack-cli webhook ping [options]
```

**Options:**

- `--event, -E` - Event type to simulate
- `--domain, -D` - Domain to ping (test/live) - Default: `test`
- `--forward, -F` - Send to specific URL instead of saved webhook
- `--mod, -M` - Interactively modify payload before sending

**Examples:**

```bash
# Send charge success event
paystack-cli webhook ping --event=charge.success

# Send to custom URL
paystack-cli webhook ping --event=transfer.success --forward=https://example.com/webhook

# Modify payload interactively
paystack-cli webhook ping --event=charge.success --mod

# Interactive event selection
paystack-cli webhook ping
```

## Troubleshooting

### "Ngrok token not configured"

**Solution:** Configure your ngrok auth token

```bash
paystack-cli config
# Select "Ngrok Auth Token" and enter your token
```

### "Port already in use"

**Solution:** Either:

- Stop the process using that port
- Use a different port in your local route
- Use `--serve` flag which automatically uses port 3000
- Kill existing ngrok process and try again

### Webhook not received

**Checklist:**

1. Is the listener running? Check terminal output
2. Is your local server running on the specified port?
3. Is the route correct? (e.g., `/webhook` not `/webhooks`)
4. Try using `--serve` flag to use the built-in server
5. Check firewall/antivirus settings

### "Session expired"

**Solution:** Your CLI session expired, login again:

```bash
paystack-cli login
```

### Ngrok tunnel not starting

**Solution:**

1. Verify your ngrok auth token is correct
2. Kill any existing ngrok processes
3. Check your internet connection
4. Try updating ngrok: `npm update -g @ngrok/ngrokSolution:\*\* Configure your ngrok auth token

```bash
paystack-cli config
# Select "Ngrok Auth Token" and enter your token
```

### "Port already in use"

**Solution:** Either:

- Stop the process using that port
- Use a different port in your local route
- Kill existing ngrok process: `pkill ngrok`

### Webhook not received

**Checklist:**

1. Is the listener running? Check terminal output
2. Is your local server running on the specified port?
3. Is the route correct? (e.g., `/webhook` not `/webhooks`)
4. Check firewall/antivirus settings

### "Session expired"

**Solution:** Your CLI session expired, login again:

```bash
paystack-cli login
```

## Best Practices

1. **Use Test Mode** - Always use test mode for webhook testing
2. **Verify Signatures** - Always verify webhook signatures in production
3. **Log Events** - Log all webhook events for debugging
4. **Handle Duplicates** - Webhooks may be sent multiple times, implement idempotency
5. **Return 200 Quickly** - Acknowledge receipt immediately, process asynchronously

## Next Steps

- Learn about [Examples](/guide/examples) for webhook handling patterns
- Explore the [API Reference](/api/transactions) for triggering events
- Read about [Troubleshooting](/guide/troubleshooting) common issues
