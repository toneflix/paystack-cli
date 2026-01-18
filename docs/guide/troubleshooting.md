# Troubleshooting

Common issues and solutions when using Paystack CLI.

## Authentication Issues

### Error: "No active session found"

**Problem**: You haven't logged in or your session has expired.

**Solution**:

```bash
# Login with your secret key
paystack-cli login

# Verify session
paystack-cli init
```

### Error: "Invalid API key"

**Problem**: The API key you provided is incorrect or has been revoked.

**Solution**:

1. Verify your API key from [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer)
2. Make sure you're using the correct key (test vs. live)
3. Re-login with the correct key:

```bash
paystack-cli logout
paystack-cli login
# Enter the correct secret key when prompted
```

### Session Management Issues

**Problem**: Session data appears corrupted or inconsistent.

**Solution**:

```bash
# Clear session and re-login
paystack-cli logout
rm -rf ~/.paystack-cli/paystack-cli.db  # macOS/Linux
# or
del %APPDATA%\.paystack-cli\paystack-cli.db  # Windows

paystack-cli login
```

## API Errors

### Error: "API request failed with status 401"

**Problem**: Authentication failed or API key is invalid.

**Solution**:

1. Verify your API key is correct
2. Check if you're using the right environment (test vs. live)
3. Ensure the API key hasn't been revoked
4. Re-login with correct credentials

### Error: "API request failed with status 429"

**Problem**: Rate limit exceeded.

**Solution**:

- Wait a few minutes before making more requests
- Implement delays between bulk operations
- Contact Paystack support to increase rate limits if needed

### Error: "Network request failed"

**Problem**: No internet connection or network issues.

**Solution**:

1. Check your internet connection
2. Verify you can access https://api.paystack.co
3. Check if you're behind a proxy:

```bash
# Set proxy if needed
export HTTPS_PROXY=http://your-proxy:port
paystack-cli your-command
```

## Command Errors

### Error: "Unknown command"

**Problem**: Command doesn't exist or is misspelled.

**Solution**:

```bash
# List all available commands
paystack-cli list

# Get help for specific resource
paystack-cli transaction --help
```

### Error: "Missing required argument"

**Problem**: You didn't provide all required parameters.

**Solution**:

```bash
# Check command signature
paystack-cli transaction:initialize --help

# Provide all required arguments
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=50000
```

### JSON Parsing Errors

**Problem**: Invalid JSON format in parameters.

**Solution**:

```bash
# ✗ Invalid - single quotes
paystack-cli transaction:initialize --metadata='{'key':'value'}'

# ✓ Valid - properly escaped
paystack-cli transaction:initialize --metadata='{"key":"value"}'

# ✓ Valid - use file
echo '{"key":"value"}' > metadata.json
paystack-cli transaction:initialize --metadata="$(cat metadata.json)"
```

## Transfer Issues

### Error: "Invalid OTP"

**Problem**: OTP code is wrong or expired.

**Solution**:

1. Check your email for the latest OTP
2. OTPs expire after a few minutes - request a new one if needed
3. Ensure no extra spaces in the OTP:

```bash
paystack-cli transfer:finalize \
  --transfer_code=TRF_xxx \
  --otp=123456  # No spaces
```

### Error: "Could not resolve account"

**Problem**: Invalid account number or bank code.

**Solution**:

```bash
# 1. Get correct bank code
paystack-cli bank:list --country=nigeria

# 2. Verify account number
paystack-cli bank:resolve \
  --account_number=0123456789 \
  --bank_code=033

# 3. Ensure account details are correct before creating recipient
```

### Error: "Insufficient balance"

**Problem**: Your Paystack balance is too low for the transfer.

**Solution**:

```bash
# Check your balance
paystack-cli balance:fetch

# Ensure you have enough funds including fees
# Transfer fees vary by amount and destination
```

## Webhook Issues

### Webhook Events Not Received

**Problem**: Local server not receiving webhook events.

**Solution**:

1. Verify ngrok is running:

```bash
paystack-cli webhook listen http://localhost:3000/webhook
# Keep this terminal open
```

2. Check your local server is running:

```bash
# Start your server
npm run dev

# Test endpoint locally
curl http://localhost:3000/webhook
```

3. Verify the endpoint URL:

```bash
# Test with webhook ping
paystack-cli webhook ping --event=charge.success
```

### ngrok Connection Issues

**Problem**: ngrok fails to start or connect.

**Solution**:

1. Install ngrok if not already installed:

```bash
# macOS
brew install ngrok

# Or download from https://ngrok.com
```

2. Authenticate ngrok (if required):

```bash
ngrok authtoken YOUR_TOKEN
```

3. Check if port is in use:

```bash
# macOS/Linux
lsof -i :4040

# Kill process if needed
kill -9 PID
```

### Webhook Signature Verification Failed

**Problem**: Webhook signature doesn't match.

**Solution**:

```javascript
// Ensure you're using the correct secret key
const crypto = require('crypto');

const hash = crypto
  .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (hash === req.headers['x-paystack-signature']) {
  // Valid webhook
}
```

## Database Issues

### Database Locked Error

**Problem**: SQLite database is locked by another process.

**Solution**:

```bash
# Close all CLI instances
# Wait a few seconds
# Try again

# If problem persists, backup and recreate database
cp ~/.paystack-cli/paystack-cli.db ~/.paystack-cli/paystack-cli.db.backup
rm ~/.paystack-cli/paystack-cli.db
paystack-cli login
```

### Corrupted Database

**Problem**: Database file is corrupted.

**Solution**:

```bash
# Backup current database
cp ~/.paystack-cli/paystack-cli.db ~/.paystack-cli/backup.db

# Remove corrupted database
rm ~/.paystack-cli/paystack-cli.db

# Re-login to create new database
paystack-cli login
```

## Installation Issues

### Command Not Found After Installation

**Problem**: `paystack-cli` command not recognized.

**Solution**:

```bash
# Verify installation
npm list -g @toneflix/paystack-cli

# If not installed
npm install -g @toneflix/paystack-cli

# Update PATH (if needed)
echo $PATH  # Check if npm global bin is in PATH

# Find npm global bin location
npm bin -g

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$PATH:$(npm bin -g)"
```

### Permission Errors During Installation

**Problem**: EACCES or permission denied errors.

**Solution**:

```bash
# Option 1: Use npx (recommended)
npx @toneflix/paystack-cli login

# Option 2: Fix npm permissions (macOS/Linux)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Then reinstall
npm install -g @toneflix/paystack-cli

# Option 3: Use sudo (not recommended)
sudo npm install -g @toneflix/paystack-cli
```

## Output/Display Issues

### Truncated Output

**Problem**: Long responses are truncated.

**Solution**:

```bash
# Use JSON output and pipe to jq for formatting
paystack-cli transaction:list --json | jq '.'

# Save to file for complete output
paystack-cli transaction:list --json > transactions.json

# Increase terminal buffer if needed
```

### Special Characters Not Displaying

**Problem**: Unicode or special characters appear garbled.

**Solution**:

```bash
# Set correct encoding
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Verify terminal supports UTF-8
locale
```

## Performance Issues

### Slow Command Execution

**Problem**: Commands take too long to execute.

**Solution**:

1. Check internet connection speed
2. Use pagination for large datasets:

```bash
paystack-cli transaction:list --perPage=50 --page=1
```

3. Reduce concurrent requests
4. Check Paystack API status: https://status.paystack.com

### Memory Issues with Large Responses

**Problem**: CLI crashes with large data responses.

**Solution**:

```bash
# Use pagination
paystack-cli transaction:list --perPage=100 --page=1

# Export data incrementally
for i in {1..10}; do
  paystack-cli transaction:list --page=$i --json >> data.json
done
```

## Getting More Help

### Enable Debug Mode

Get detailed logs for troubleshooting:

```bash
# Set debug environment variable
export DEBUG=paystack:*

# Run your command
paystack-cli your-command

# View detailed logs including API requests and responses
```

### Check Logs

View CLI logs for more information:

```bash
# macOS/Linux
cat ~/.paystack-cli/logs/latest.log

# Windows
type %APPDATA%\.paystack-cli\logs\latest.log
```

### Report Issues

If you encounter a bug:

1. Enable debug mode and capture the output
2. Check existing issues: [GitHub Issues](https://github.com/toneflix/paystack-cli/issues)
3. Create a new issue with:
   - Command you ran
   - Expected behavior
   - Actual behavior
   - Error messages
   - Debug output (remove sensitive data)
   - Your environment (OS, Node version, CLI version)

### Get Your Environment Info

```bash
# Node version
node --version

# npm version
npm --version

# CLI version
paystack-cli --version

# OS information
uname -a  # macOS/Linux
systeminfo  # Windows
```

## Still Need Help?

- [GitHub Issues](https://github.com/toneflix/paystack-cli/issues)
- [Paystack Documentation](https://paystack.com/docs)
- [Paystack Support](https://support.paystack.com)
- Check [Examples](/guide/examples) for working code
- Review [API Reference](/api/transactions)
