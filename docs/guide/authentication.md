# Authentication

Learn how to authenticate and manage sessions with Paystack CLI.

## Login

The CLI uses your Paystack account credentials for authentication:

```bash
paystack-cli login
```

### Login Process

When you run the login command, you'll be prompted for:

1. **Email Address** - Your Paystack account email
2. **Password** - Your Paystack account password
3. **Remember Email** - Option to save your email for faster future logins

```bash
$ paystack-cli login
Email address: john@example.com
Password: ********
Remember Email Address? (yes/no): yes
```

### Integration Selection

If your account has multiple integrations (businesses), you'll be prompted to select which one to use:

```bash
Select an integration:
1. My Business (test)
2. Another Business (live)
```

The selected integration will be used for all subsequent API calls.

## Session Management

### Automatic Session Handling

Once logged in, the CLI automatically manages your session:

- Session tokens are securely stored in a local SQLite database
- Tokens are automatically included in all API requests
- You don't need to manually handle authentication for each command

### Session Expiration

Sessions automatically expire after the token timeout period. When your session expires:

```bash
ERROR: Your session has expired. Please run the `login` command to sign in again.
```

Simply run `paystack-cli login` again to re-authenticate.

### Checking Session Status

Your session is automatically validated before each API call. If you're not logged in, you'll see:

```bash
ERROR: You're not signed in, please run the login command before you begin
```

## Logout

To clear your session and logout:

```bash
paystack-cli logout
```

This will:

- Remove your authentication token
- Clear the selected integration
- Require you to login again before making API calls

## Security

### Local Storage

The CLI stores authentication data locally in a SQLite database located at:

```sh
<project-root>/app.db
```

This file contains:

- Your authentication token
- User information
- Selected integration details
- Configuration settings

::: warning
Keep your `app.db` file secure and never commit it to version control.
:::

### Best Practices

1. **Use Test Mode** - Start with test mode integrations for development
2. **Logout When Done** - Run `logout` on shared machines
3. **Secure Your Database** - Keep `app.db` file permissions restricted
4. **Don't Share Tokens** - Never share your authentication token or database file

## Switching Integrations

To switch between integrations:

1. Logout from the current session:

   ```bash
   paystack-cli logout
   ```

2. Login again and select a different integration:
   ```bash
   paystack-cli login
   ```

## Troubleshooting

### "You're not signed in" Error

**Solution:** Run the login command first

```bash
paystack-cli login
```

### "Session expired" Error

**Solution:** Your session has timed out, login again

```bash
paystack-cli logout
paystack-cli login
```

### Can't Login

**Possible causes:**

- Incorrect email or password
- Network connectivity issues
- Paystack API is down

**Solution:** Verify your credentials and try again

## Next Steps

- Learn about [Configuration](/guide/configuration) options
- Explore available [Commands](/guide/commands)
- Start using the [API](/api/transactions)
