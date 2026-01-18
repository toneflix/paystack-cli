# Subscriptions API

Manage recurring payment subscriptions.

## Available Commands

| Command                | Description                           |
| ---------------------- | ------------------------------------- |
| `subscription:create`  | Create a subscription                 |
| `subscription:list`    | List all subscriptions                |
| `subscription:fetch`   | Fetch subscription details            |
| `subscription:enable`  | Enable a subscription                 |
| `subscription:disable` | Disable a subscription                |
| `subscription:link`    | Generate subscription management link |

## Create Subscription

Subscribe a customer to a plan.

```bash
paystack-cli subscription:create \
  --customer=CUS_xxx \
  --plan=PLN_xxx
```

### Required Parameters

- `--customer` - Customer code
- `--plan` - Plan code

### Optional Parameters

- `--authorization` - Authorization code (for existing auth)
- `--start_date` - Subscription start date

### Examples

```bash
# Basic subscription
paystack-cli subscription:create \
  --customer=CUS_xxx \
  --plan=PLN_xxx

# With specific authorization
paystack-cli subscription:create \
  --customer=CUS_xxx \
  --plan=PLN_xxx \
  --authorization=AUTH_xxx

# Delayed start
paystack-cli subscription:create \
  --customer=CUS_xxx \
  --plan=PLN_xxx \
  --start_date=2026-02-01
```

## List Subscriptions

Get all subscriptions.

```bash
paystack-cli subscription:list
```

### Optional Parameters

- `--perPage` - Records per page
- `--page` - Page number
- `--customer` - Filter by customer code
- `--plan` - Filter by plan code

### Examples

```bash
# List all
paystack-cli subscription:list

# Filter by customer
paystack-cli subscription:list --customer=CUS_xxx

# Filter by plan
paystack-cli subscription:list --plan=PLN_xxx
```

## Fetch Subscription

Get subscription details.

```bash
paystack-cli subscription:fetch --code=SUB_xxx
```

### Parameters

- `--code` - Subscription code (required)

## Enable Subscription

Reactivate a canceled subscription.

```bash
paystack-cli subscription:enable \
  --code=SUB_xxx \
  --token=email_token
```

### Parameters

- `--code` - Subscription code (required)
- `--token` - Email token (required)

## Disable Subscription

Cancel a subscription.

```bash
paystack-cli subscription:disable \
  --code=SUB_xxx \
  --token=email_token
```

### Parameters

- `--code` - Subscription code (required)
- `--token` - Email token (required)

## Generate Management Link

Create a link for customers to manage subscriptions.

```bash
paystack-cli subscription:link --code=SUB_xxx
```

### Parameters

- `--code` - Subscription code (required)

Customers can use this link to update payment methods or cancel.

## Common Workflows

### Complete Subscription Setup

```bash
# 1. Create customer
paystack-cli customer:create \
  --email=customer@example.com \
  --first_name=John

# 2. Create plan
paystack-cli plan:create \
  --name="Monthly Premium" \
  --amount=50000 \
  --interval=monthly

# 3. Create subscription
paystack-cli subscription:create \
  --customer=CUS_xxx \
  --plan=PLN_xxx

# 4. Customer completes payment at authorization_url
```

## Next Steps

- [Plans API](/api/plans)
- [Customers API](/api/customers)
- [Transactions API](/api/transactions)
