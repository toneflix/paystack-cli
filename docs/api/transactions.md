# Transactions API

Accept payments from customers through the Paystack Transactions API.

## Available Commands

| Command                   | Description               |
| ------------------------- | ------------------------- |
| `transaction:initialize`  | Initialize a transaction  |
| `transaction:verify`      | Verify a transaction      |
| `transaction:list`        | List all transactions     |
| `transaction:view`        | View transaction details  |
| `transaction:transaction` | Get transaction totals    |
| `transaction:export`      | Export transactions       |
| `transaction:charge`      | Charge returning customer |
| `transaction:timeline`    | View transaction timeline |

## Initialize Transaction

Create a new payment transaction and get a payment URL.

```bash
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=50000
```

### Required Parameters

- `--email` - Customer's email address
- `--amount` - Amount in kobo (100 kobo = 1 NGN)

### Optional Parameters

- `--reference` - Unique transaction reference
- `--callback_url` - URL to redirect after payment
- `--currency` - Transaction currency (NGN, GHS, ZAR, USD)
- `--plan` - Plan code if creating subscription
- `--invoice_limit` - Number of times to charge customer
- `--channels` - Payment channels (card, bank, ussd, qr, mobile_money)
- `--subaccount` - Subaccount code for split payments
- `--transaction_charge` - Amount to charge subaccount
- `--bearer` - Who bears fees (account, subaccount)
- `--metadata` - JSON object with custom data

### Examples

Basic payment:

```bash
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=50000 \
  --currency=NGN
```

With custom reference:

```bash
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=50000 \
  --reference=ORDER_12345
```

With callback URL:

```bash
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=50000 \
  --callback_url=https://mysite.com/payment/callback
```

Split payment with subaccount:

```bash
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=100000 \
  --subaccount=ACCT_xxx \
  --transaction_charge=2000 \
  --bearer=account
```

With metadata:

```bash
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=50000 \
  --metadata='{"cart_id":12345,"customer_id":"CUST_001"}'
```

### Response

```json
{
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "authorization_url": "https://checkout.paystack.com/xxxxx",
    "access_code": "xxxxx",
    "reference": "xxxxx"
  }
}
```

## Verify Transaction

Verify the status of a transaction.

```bash
paystack-cli transaction:verify --reference=xxxxx
```

### Parameters

- `--reference` - Transaction reference (required)

### Examples

```bash
# Verify by reference
paystack-cli transaction:verify --reference=T123456789

# Get JSON output
paystack-cli transaction:verify --reference=T123456789 --json
```

### Response

```json
{
  "status": true,
  "message": "Verification successful",
  "data": {
    "id": 123456,
    "domain": "test",
    "status": "success",
    "reference": "T123456789",
    "amount": 50000,
    "message": null,
    "gateway_response": "Successful",
    "paid_at": "2026-01-15T12:00:00.000Z",
    "channel": "card",
    "currency": "NGN",
    "customer": {
      "id": 12345,
      "email": "customer@example.com"
    },
    "authorization": {
      "authorization_code": "AUTH_xxx",
      "bin": "408408",
      "last4": "4081",
      "exp_month": "12",
      "exp_year": "2026",
      "channel": "card",
      "card_type": "visa",
      "bank": "TEST BANK",
      "reusable": true
    }
  }
}
```

## List Transactions

Get a list of all transactions.

```bash
paystack-cli transaction:list
```

### Optional Parameters

- `--perPage` - Number of records per page (default: 50)
- `--page` - Page number to retrieve (default: 1)
- `--customer` - Customer ID to filter by
- `--status` - Transaction status (success, failed, abandoned)
- `--from` - Start date (YYYY-MM-DD)
- `--to` - End date (YYYY-MM-DD)
- `--amount` - Filter by amount

### Examples

List recent transactions:

```bash
paystack-cli transaction:list --perPage=20 --page=1
```

Filter by customer:

```bash
paystack-cli transaction:list --customer=12345
```

Filter by status:

```bash
paystack-cli transaction:list --status=success
```

Filter by date range:

```bash
paystack-cli transaction:list \
  --from=2026-01-01 \
  --to=2026-01-31
```

Filter successful transactions for a customer:

```bash
paystack-cli transaction:list \
  --customer=12345 \
  --status=success \
  --perPage=100
```

## View Transaction

Get detailed information about a specific transaction.

```bash
paystack-cli transaction:view --id=123456
```

### Parameters

- `--id` - Transaction ID (required)

## Transaction Totals

Get transaction statistics for a period.

```bash
paystack-cli transaction:transaction
```

### Optional Parameters

- `--perPage` - Records per page
- `--page` - Page number
- `--from` - Start date
- `--to` - End date

### Examples

```bash
# Get totals for current month
paystack-cli transaction:transaction \
  --from=2026-01-01 \
  --to=2026-01-31

# Get totals with JSON output
paystack-cli transaction:transaction --json
```

### Response

```json
{
  "status": true,
  "message": "Transaction totals",
  "data": {
    "total_transactions": 1234,
    "total_volume": 45000000,
    "total_volume_by_currency": [
      {
        "currency": "NGN",
        "amount": 45000000
      }
    ]
  }
}
```

## Export Transactions

Export transaction data to CSV or download link.

```bash
paystack-cli transaction:export
```

### Optional Parameters

- `--perPage` - Records per page
- `--page` - Page number
- `--from` - Start date (YYYY-MM-DD)
- `--to` - End date (YYYY-MM-DD)
- `--customer` - Customer ID
- `--status` - Transaction status
- `--currency` - Currency filter
- `--amount` - Amount filter
- `--settled` - Settlement status (true/false)
- `--settlement` - Settlement ID
- `--payment_page` - Payment page ID

### Examples

```bash
# Export all transactions
paystack-cli transaction:export

# Export for specific period
paystack-cli transaction:export \
  --from=2026-01-01 \
  --to=2026-01-31

# Export successful transactions only
paystack-cli transaction:export \
  --status=success \
  --from=2026-01-01
```

## Charge Returning Customer

Charge a customer using their saved authorization.

```bash
paystack-cli transaction:charge \
  --email=customer@example.com \
  --amount=50000 \
  --authorization_code=AUTH_xxx
```

### Required Parameters

- `--email` - Customer email
- `--amount` - Amount in kobo
- `--authorization_code` - Authorization code from previous transaction

### Optional Parameters

- `--reference` - Transaction reference
- `--currency` - Currency code
- `--metadata` - Custom metadata JSON

### Examples

```bash
# Basic charge
paystack-cli transaction:charge \
  --email=customer@example.com \
  --amount=50000 \
  --authorization_code=AUTH_xxx

# With reference and metadata
paystack-cli transaction:charge \
  --email=customer@example.com \
  --amount=50000 \
  --authorization_code=AUTH_xxx \
  --reference=RECURRING_001 \
  --metadata='{"subscription_id":"SUB_001"}'
```

## Transaction Timeline

View the timeline of events for a transaction.

```bash
paystack-cli transaction:timeline --id_or_reference=123456
```

### Parameters

- `--id_or_reference` - Transaction ID or reference (required)

### Examples

```bash
# By transaction ID
paystack-cli transaction:timeline --id_or_reference=123456

# By reference
paystack-cli transaction:timeline --id_or_reference=T123456789
```

## Common Workflows

### Accept One-Time Payment

```bash
# 1. Initialize
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=50000

# 2. Customer visits authorization_url and completes payment

# 3. Verify payment
paystack-cli transaction:verify --reference=returned_reference
```

### Setup Recurring Payments

```bash
# 1. Initialize first transaction
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=50000

# 2. After successful payment, get authorization code from verify response

# 3. Charge customer monthly
paystack-cli transaction:charge \
  --email=customer@example.com \
  --amount=50000 \
  --authorization_code=AUTH_xxx \
  --reference=MONTH_02
```

### Split Payments

```bash
# 1. Create subaccount first (see Subaccounts API)

# 2. Initialize transaction with split
paystack-cli transaction:initialize \
  --email=customer@example.com \
  --amount=100000 \
  --subaccount=ACCT_xxx \
  --transaction_charge=2000 \
  --bearer=account
```

## Error Handling

Common errors and solutions:

**"Invalid email address"**: Ensure email is properly formatted

**"Amount must be at least 100"**: Amount must be in kobo (minimum 1 NGN = 100 kobo)

**"Customer has no valid authorization"**: Customer must complete a successful transaction first before you can charge their authorization

**"Invalid authorization code"**: Authorization may have expired or been deactivated

## Next Steps

- [Customers API](/api/customers) - Manage customer data
- [Plans API](/api/plans) - Create subscription plans
- [Subscriptions API](/api/subscriptions) - Manage recurring payments
- [Payment Pages](/api/payment-pages) - Create hosted payment pages
