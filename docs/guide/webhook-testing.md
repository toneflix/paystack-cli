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

```bash
paystack-cli webhook listen [local_route]
```

If you don't provide a route, you'll be prompted:

```bash
$ paystack-cli webhook listen
Enter the local route to listen on for webhooks: http://localhost:3000/webhook
```

### What Happens

When you start the listener:

1. **Ngrok tunnel is created** to your local server
2. **Webhook URL is updated** in your Paystack integration
3. **Events are forwarded** to your local endpoint automatically
4. You'll see **real-time webhook events** in your terminal

### Example Output

```bash
$ paystack-cli webhook listen http://localhost:3000/webhook

✓ Listening for incoming webhook events at http://localhost:3000/webhook

INFO: Press Ctrl+C to stop listening for webhook events.

Webhook URL: https://abc123.ngrok.io
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

| Event | Description |
|-------|-------------|
| `charge.success` | Successful payment transaction |
| `transfer.success` | Successful money transfer |
| `transfer.failed` | Failed transfer attempt |
| `subscription.create` | New subscription created |

## Advanced Options

### Specify Domain

Use test or live mode webhooks:

```bash
# Test mode (default)
paystack-cli webhook listen http://localhost:3000/webhook --domain=test

# Live mode
paystack-cli webhook listen http://localhost:3000/webhook --domain=live
```

### Forward to Specific URL

Override the saved webhook URL:

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

```javascript
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

  if (hash === req.headers['x-paystack-signature']) {
    const event = req.body;
    
    // Handle the event
    console.log('Event:', event.event);
    console.log('Data:', event.data);
    
    // Perform actions based on event type
    switch(event.event) {
      case 'charge.success':
        // Handle successful charge
        break;
      case 'transfer.success':
        // Handle successful transfer
        break;
      // ... other events
    }
    
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
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
