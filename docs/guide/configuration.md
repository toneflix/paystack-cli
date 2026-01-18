# Configuration

Configure Paystack CLI settings to customize your development experience.

## Configuration Command

Access the configuration interface:

```bash
paystack-cli config
```

This launches an interactive menu where you can modify various settings.

## Available Settings

### API Base URL

- **Default:** `https://api.paystack.co`
- **Purpose:** The base URL for Paystack API requests
- **When to change:** If you're using a proxy or custom API endpoint

```bash
# Select "API Base URL" from config menu
# Enter new URL: https://your-proxy.com/api
```

### Timeout Duration

- **Default:** `3000ms` (3 seconds)
- **Purpose:** HTTP request timeout in milliseconds
- **When to change:** If you experience timeout errors or need longer waits

```bash
# Select "Timeout Duration" from config menu
# Enter new timeout in ms: 5000
```

### Debug Mode

- **Default:** `false`
- **Purpose:** Enable detailed error messages and stack traces
- **When to enable:** When troubleshooting issues or during development

```bash
# Select "Debug Mode" from config menu
# Choose: true
```

When debug mode is enabled, you'll see:

- Full error stack traces
- Detailed request/response information
- Internal error messages

### Ngrok Auth Token

- **Default:** None
- **Purpose:** Authentication token for ngrok tunneling
- **Required for:** Webhook testing with `webhook listen` command

```bash
# Select "Ngrok Auth Token" from config menu
# Enter your token from ngrok.com
```

Get your token from [ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)

## Environment Variables

You can also configure settings using environment variables:

### NGROK_AUTH_TOKEN

Set your ngrok authentication token:

```bash
export NGROK_AUTH_TOKEN="your_token_here"
```

### NGROK_DOMAIN

If you have a paid ngrok plan with a custom domain:

```bash
export NGROK_DOMAIN="your-domain.ngrok.io"
```

## Configuration Storage

All configuration is stored in the local SQLite database (`app.db`) alongside your authentication data. This means:

- Configuration persists across sessions
- Each project can have its own configuration
- No global system-wide settings (unless using environment variables)

## Configuration Examples

### Development Setup

```bash
# Enable debug mode for development
paystack-cli config
# Select "Debug Mode" → true

# Set longer timeout for slow connections
paystack-cli config
# Select "Timeout Duration" → 10000
```

### Production Setup

```bash
# Disable debug mode
paystack-cli config
# Select "Debug Mode" → false

# Use default timeout
paystack-cli config
# Select "Timeout Duration" → 3000
```

### Webhook Testing Setup

```bash
# Configure ngrok token
paystack-cli config
# Select "Ngrok Auth Token" → paste_your_token

# Verify webhook listening works
paystack-cli webhook listen http://localhost:3000/webhook
```

## Resetting Configuration

To reset to defaults, simply reconfigure each setting through the config menu, or delete the `app.db` file and run:

```bash
paystack-cli init
```

::: warning
Deleting `app.db` will also clear your authentication session.
:::

## Best Practices

1. **Use Environment Variables for CI/CD** - Set tokens via env vars in automated environments
2. **Enable Debug Mode During Development** - Helps catch and fix issues faster
3. **Disable Debug Mode in Production** - Keeps error messages concise
4. **Secure Your Ngrok Token** - Don't commit tokens to version control
5. **Adjust Timeouts as Needed** - Increase for slow networks, decrease for fast ones

## Next Steps

- Set up [Webhook Testing](/guide/webhook-testing) with ngrok
- Explore available [Commands](/guide/commands)
- Learn about [Troubleshooting](/guide/troubleshooting) common issues
