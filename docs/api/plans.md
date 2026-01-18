# Plans API

Create and manage subscription plans for recurring payments.

## Available Commands

| Command       | Description                |
| ------------- | -------------------------- |
| `plan:create` | Create a subscription plan |
| `plan:list`   | List all plans             |
| `plan:fetch`  | Fetch plan details         |
| `plan:update` | Update a plan              |

## Create Plan

Create a new subscription plan.

```bash
paystack-cli plan:create \
  --name="Monthly Premium" \
  --amount=50000 \
  --interval=monthly
```

### Required Parameters

- `--name` - Plan name
- `--amount` - Amount in kobo
- `--interval` - Billing interval (daily, weekly, monthly, annually)

### Optional Parameters

- `--description` - Plan description
- `--currency` - Currency (NGN, GHS, ZAR, USD)
- `--invoice_limit` - Number of invoices to raise
- `--send_invoices` - Send email invoices (true/false)
- `--send_sms` - Send SMS alerts (true/false)

### Examples

```bash
# Basic plan
paystack-cli plan:create \
  --name="Basic Monthly" \
  --amount=10000 \
  --interval=monthly

# Complete plan with notifications
paystack-cli plan:create \
  --name="Premium Plan" \
  --amount=50000 \
  --interval=monthly \
  --description="Premium features access" \
  --send_invoices=true \
  --send_sms=true

# Annual plan with limit
paystack-cli plan:create \
  --name="Annual Subscription" \
  --amount=500000 \
  --interval=annually \
  --invoice_limit=1
```

## List Plans

Get all subscription plans.

```bash
paystack-cli plan:list
```

### Optional Parameters

- `--perPage` - Records per page
- `--page` - Page number
- `--interval` - Filter by interval
- `--amount` - Filter by amount

### Examples

```bash
# List all plans
paystack-cli plan:list

# Filter monthly plans
paystack-cli plan:list --interval=monthly

# With pagination
paystack-cli plan:list --perPage=50 --page=1
```

## Fetch Plan

Get details of a specific plan.

```bash
paystack-cli plan:fetch --code=PLN_xxx
```

### Parameters

- `--code` - Plan code (required)

## Update Plan

Update an existing plan.

```bash
paystack-cli plan:update \
  --code=PLN_xxx \
  --name="Updated Plan Name"
```

### Required Parameters

- `--code` - Plan code

### Optional Parameters

- `--name` - Plan name
- `--amount` - Amount in kobo
- `--interval` - Billing interval
- `--description` - Description
- `--send_invoices` - Send invoices
- `--send_sms` - Send SMS

### Examples

```bash
# Update price
paystack-cli plan:update \
  --code=PLN_xxx \
  --amount=60000

# Update name and description
paystack-cli plan:update \
  --code=PLN_xxx \
  --name="Premium Plus" \
  --description="Enhanced premium features"
```

## Common Workflows

### Create Subscription Plan

```bash
# 1. Create plan
paystack-cli plan:create \
  --name="Monthly Subscription" \
  --amount=50000 \
  --interval=monthly \
  --send_invoices=true

# 2. Note the plan_code from response

# 3. Use with subscriptions
paystack-cli subscription:create \
  --customer=CUS_xxx \
  --plan=PLN_xxx
```

## Next Steps

- [Subscriptions API](/api/subscriptions)
- [Customers API](/api/customers)
- [Transactions API](/api/transactions)
