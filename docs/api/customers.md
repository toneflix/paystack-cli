# Customers API

Manage customer information and payment authorizations.

## Available Commands

| Command                    | Description                           |
| -------------------------- | ------------------------------------- |
| `customer:create`          | Create a new customer                 |
| `customer:list`            | List all customers                    |
| `customer:fetch`           | Fetch customer details                |
| `customer:update`          | Update customer information           |
| `customer:validate`        | Validate customer identity            |
| `customer:set_risk_action` | Set risk action (whitelist/blacklist) |
| `customer:deactivate`      | Deactivate authorization              |

## Create Customer

Create a new customer profile.

```bash
paystack-cli customer:create \
  --email=customer@example.com \
  --first_name=John \
  --last_name=Doe
```

### Required Parameters

- `--email` - Customer email address

### Optional Parameters

- `--first_name` - First name
- `--last_name` - Last name
- `--phone` - Phone number
- `--metadata` - Custom metadata JSON object

### Examples

```bash
# Basic customer
paystack-cli customer:create --email=customer@example.com

# With full details
paystack-cli customer:create \
  --email=customer@example.com \
  --first_name=John \
  --last_name=Doe \
  --phone=+2348012345678

# With metadata
paystack-cli customer:create \
  --email=customer@example.com \
  --first_name=John \
  --metadata='{"user_id":12345,"tier":"premium"}'
```

## List Customers

Get a list of all customers.

```bash
paystack-cli customer:list
```

### Optional Parameters

- `--perPage` - Records per page (default: 50)
- `--page` - Page number (default: 1)
- `--from` - Start date (YYYY-MM-DD)
- `--to` - End date (YYYY-MM-DD)

### Examples

```bash
# List all customers
paystack-cli customer:list

# With pagination
paystack-cli customer:list --perPage=100 --page=2

# Filter by date range
paystack-cli customer:list --from=2026-01-01 --to=2026-01-31
```

## Fetch Customer

Get detailed information about a customer.

```bash
paystack-cli customer:fetch --code=CUS_xxx
```

### Parameters

- `--code` - Customer code (required)

### Response

Includes customer details and transaction history.

## Update Customer

Update customer information.

```bash
paystack-cli customer:update \
  --code=CUS_xxx \
  --first_name=Jane
```

### Required Parameters

- `--code` - Customer code

### Optional Parameters

- `--first_name` - First name
- `--last_name` - Last name
- `--phone` - Phone number
- `--metadata` - Custom metadata JSON

### Examples

```bash
# Update name
paystack-cli customer:update \
  --code=CUS_xxx \
  --first_name=Jane \
  --last_name=Smith

# Update metadata
paystack-cli customer:update \
  --code=CUS_xxx \
  --metadata='{"tier":"gold","referral":"REF_123"}'
```

## Validate Customer

Validate a customer's identity information.

```bash
paystack-cli customer:validate \
  --code=CUS_xxx \
  --first_name=John \
  --last_name=Doe \
  --type=bank_account \
  --value=0123456789 \
  --country=NG \
  --bvn=12345678901
```

### Required Parameters

- `--code` - Customer code
- `--first_name` - First name
- `--last_name` - Last name
- `--type` - Validation type (bank_account)
- `--value` - Account number
- `--country` - Country code (NG, GH, ZA)
- `--bvn` - Bank Verification Number

## Set Risk Action

Whitelist or blacklist a customer.

```bash
paystack-cli customer:set_risk_action \
  --customer=CUS_xxx \
  --risk_action=allow
```

### Parameters

- `--customer` - Customer code (required)
- `--risk_action` - Action (allow, deny) (required)

### Examples

```bash
# Whitelist customer
paystack-cli customer:set_risk_action \
  --customer=CUS_xxx \
  --risk_action=allow

# Blacklist customer
paystack-cli customer:set_risk_action \
  --customer=CUS_xxx \
  --risk_action=deny
```

## Deactivate Authorization

Deactivate a customer's card authorization.

```bash
paystack-cli customer:deactivate --authorization_code=AUTH_xxx
```

### Parameters

- `--authorization_code` - Authorization code (required)

Use this to prevent future charges on a saved card.

## Common Workflows

### Create and Use Customer

```bash
# 1. Create customer
paystack-cli customer:create \
  --email=customer@example.com \
  --first_name=John \
  --last_name=Doe

# 2. Initialize transaction with customer
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=50000

# 3. View customer transactions
paystack-cli customer:fetch --code=CUS_xxx
```

### Manage Saved Cards

```bash
# 1. Fetch customer to see authorizations
paystack-cli customer:fetch --code=CUS_xxx

# 2. Deactivate unwanted authorization
paystack-cli customer:deactivate --authorization_code=AUTH_xxx
```

## Next Steps

- [Transactions API](/api/transactions)
- [Subscriptions API](/api/subscriptions)
- [Plans API](/api/plans)
